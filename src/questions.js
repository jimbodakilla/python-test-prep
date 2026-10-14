/* questions: render + grade every question kind; practice session; mock test */
'use strict';

const KIND_LABEL = { out: 'Predict the output', typed: 'Type the output', ty: 'Name the type', line: 'Find the crash', fill: 'Fill the blank', fix: 'Bug hunt', write: 'Write the code', know: 'Quick check' };
const TYPE_OPTS = ['int', 'float', 'str', 'Error'];

/* radio-group keyboard: one tab stop (the selected option), arrows move AND select, like a native radio group */
function radioNav(btns, pick) {
  const sync = () => { const sel = btns.findIndex(b => b.getAttribute('aria-checked') === 'true'); btns.forEach((b, k) => { b.tabIndex = k === (sel < 0 ? 0 : sel) ? 0 : -1; }); };
  btns.forEach((b, i) => b.addEventListener('keydown', e => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); const n = (i + d + btns.length) % btns.length; btns[n].focus(); pick(n);
  }));
  sync(); return sync;
}
/* after grading: colour AND a glyph AND words for screen readers, never colour alone */
function markOpts(btns, isGood, picked) {
  btns.forEach((b, k) => {
    const good = isGood(k); b.classList.add(good ? 'good' : (k === picked ? 'bad' : 'dim')); b.disabled = true;
    if (good || k === picked) b.append(h('span', { class: 'sr-only' }, good ? (k === picked ? ' (your answer, correct)' : ' (the correct answer)') : ' (your answer, incorrect)'));
  });
}
const foldTyped = (t, answer) => /[^\x00-\x7f]/.test(answer) ? t : t.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/\u00A0/g, ' ').replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...');

/* Build an instance. Anything that shuffles is shuffled ONCE here and cached. */
function makeInst(item) {
  const inst = { item, picked: null, text: '', code: null, done: false, ok: null, tries: 0, hints: 0 };
  if (item.kind === 'out') inst.order = shuffle(item.options.map((_, i) => i));
  else if (item.kind === 'know' || item.kind === 'fill') inst.order = shuffle(item.opts.map((_, i) => i));
  return inst;
}

function optLabel(text) {
  const frag = document.createDocumentFragment();
  const lines = String(text).split('\n');
  lines.forEach((ln, i) => {
    if (i) frag.append(document.createElement('br'));
    const m = /^Error: (\w+)$/.exec(ln);
    if (m) frag.append(h('span', { class: 'o-err' }, icon('warn'), h('span', { class: 'sr-only' }, 'Error: '), m[1]));
    else frag.append(ln === '' ? h('span', { class: 'muted' }, '(blank line)') : document.createTextNode(ln));
  });
  return frag;
}
const looksLikeCode = t => /[()"=]|\n|^\d/.test(t);

function stdinNote(stdin) {
  if (!stdin || !stdin.length) return null;
  return h('div', { class: 'stdin-note' }, h('span', { class: 'sn-ico', 'aria-hidden': 'true' }, icon('term')), h('span', null, 'The user types: '),
    stdin.map((s, i) => h('span', { class: 'sn-chip' }, h('code', null, s === '' ? '(just Enter)' : s), i < stdin.length - 1 ? h('span', { class: 'sn-then' }, 'then') : null)));
}

function promptText(it) {
  switch (it.kind) {
    case 'out': return it.options.some(o => /Error: /.test(o)) ? 'What happens when this program runs?' : 'What does this program print?';
    case 'typed': return 'Type exactly what this program prints.';
    case 'ty': return 'What type of value does this give?';
    case 'line': return 'Which line makes the program crash?';
    case 'fill': return 'Pick the missing piece so the program prints: ' + (it.want || '').split('\n').join(' ⏎ ');
    case 'fix': return 'Bug hunt: ' + it.prompt;
    case 'write': return 'Write the code';
    case 'know': return it.q;
  }
}

/* ---------- code-answer grading (hidden tests) ---------- */
async function gradeCode(it, code) {
  const must = [];
  for (const [re, msg] of (it.must || [])) { if (!new RegExp(re).test(code)) must.push(msg); }
  const tests = [];
  for (const t of it.tests) {
    const { out, res } = await silentRun(code, t.stdin);
    const got = norm(out);
    tests.push({ stdin: t.stdin, expect: t.expect, got, error: res.error, pass: !res.error && got === t.expect });
  }
  const ok = tests.every(t => t.pass) && must.length === 0;
  return { ok, tests, must };
}
function testResultsNode(g, it, code) {
  const box = h('div', { class: 'tests' });
  if (g.must.length) box.append(h('div', { class: 'test-must' }, g.must.map(m => h('p', null, icon('warn'), ' ' + m))));
  g.tests.forEach((t, i) => {
    const inp = t.stdin.length ? t.stdin.map(s => s === '' ? '(Enter)' : s).join(', ') : 'no input';
    const row = h('div', { class: 'test ' + (t.pass ? 'pass' : 'fail') }, h('div', { class: 'test-h' }, icon(t.pass ? 'check' : 'x'), ' Test ' + (i + 1), h('span', { class: 'test-in' }, ' - typed: ' + inp)));
    if (!t.pass) {
      if (t.error) {
        const ex = explainError(t.error, [], code);
        row.append(h('div', { class: 'test-err', html: `<b>${esc(t.error.type === 'NotInCourse' ? 'Not part of this course' : t.error.type)}</b> on line ${t.error.line}: ${ex.what}` }));
      } else { const dg = diagnose(t.got, t.expect); if (dg) row.append(h('div', { class: 'diag', html: dg })); row.append(h('div', { class: 'diff' },
        h('div', null, h('span', { class: 'diff-l' }, 'Should print'), h('pre', null, t.expect === '' ? '(nothing)' : t.expect)),
        h('div', null, h('span', { class: 'diff-l' }, 'Yours printed'), h('pre', null, t.got === '' ? '(nothing)' : t.got)))); }
    }
    box.append(row);
  });
  return box;
}

/* ---------- the question view ---------- */
function QView(inst, { mode = 'practice', onChange } = {}) {
  const it = inst.item, kind = it.kind;
  const root = h('div', { class: 'q q-' + kind });
  const head = h('div', { class: 'q-head' },
    h('span', { class: 'chip kind' }, KIND_LABEL[kind]), h('span', { class: 'chip skill' }, SKILL_NAMES[it.skill] || it.skill),
    it.unit === 7 ? h('span', { class: 'chip bonus' }, 'Bonus') : null,
    h('span', { class: 'chip lvl', title: 'Difficulty', 'aria-label': 'difficulty ' + it.level }, '●'.repeat(it.level) + '○'.repeat(3 - it.level)));
  root.append(head, h('h2', { class: 'q-prompt', html: kind === 'fix' || kind === 'write' ? '' : null }, kind === 'fix' ? null : promptText(it)));
  if (kind === 'write') $('.q-prompt', root).innerHTML = 'Write the code: ' + it.prompt;
  if (kind === 'fix') $('.q-prompt', root).innerHTML = 'Bug hunt: ' + it.prompt;
  let body, api = {};
  const optsWrap = () => h('div', { class: 'opts', role: 'radiogroup', 'aria-label': 'Answer choices' });
  const notify = () => onChange && onChange();

  function choiceButtons(labels, mono, cls = '') {
    const wrap = optsWrap(); const btns = [];
    const allMono = labels.some(mono);
    labels.forEach((lab, i) => {
      const b = h('button', { type: 'button', class: 'opt ' + cls + (allMono ? ' mono' : ''), role: 'radio', 'aria-checked': 'false', dataset: { i: i + '' },
        onclick: () => select(i) }, h('span', { class: 'opt-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'opt-t' }, optLabel(lab)));
      btns.push(b); wrap.append(b);
    });
    function select(i) {
      if (inst.done) return; inst.picked = i; btns.forEach((b, k) => { b.classList.toggle('sel', k === i); b.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
      syncTab(); if (api.onPick) api.onPick(i); notify();
    }
    const syncTab = radioNav(btns, i => select(i));
    api.select = select; api.btns = btns;
    return wrap;
  }

  const promptNote = () => (['out', 'typed', 'fill'].includes(kind) && /input\(\s*["'][^"']+["']\s*\)/.test(it.code || '')) ? h('div', { class: 'print-note' }, 'ℹ We only count what ', h('code', null, 'print()'), ' shows. The question inside ', h('code', null, 'input("...")'), ' and what the user types are not print output.') : null;
  if (kind === 'out' || kind === 'know') {
    if (it.code) root.append(codeBlock(it.code));
    if (it.stdin) { const n = stdinNote(it.stdin); n && root.append(n); }
    { const pn = promptNote(); pn && root.append(pn); }
    const opts = kind === 'out' ? it.options : it.opts;
    const labels = inst.order.map(o => opts[o]);
    root.append(choiceButtons(labels, looksLikeCode));
    api.answered = () => inst.picked != null;
    api.yours = () => inst.picked == null ? '(no answer)' : labels[inst.picked];
    api.correctText = () => opts[0];
    api.grade = async () => ({ ok: inst.order[inst.picked] === 0 });
    api.mark = () => markOpts(api.btns, k => inst.order[k] === 0, inst.picked);
  } else if (kind === 'ty') {
    const code = (it.setup ? it.setup + '\n' : '') + '# what type is this?\nresult = ' + it.expr;
    root.append(codeBlock(code)); const n = stdinNote(it.stdin); n && root.append(n);
    const CH = it.choices || TYPE_OPTS; const wrap = optsWrap(); wrap.classList.add('opts-ty'); if (CH.length > 4) wrap.classList.add('opts-ty5'); const btns = [];
    const pickTy = i => { if (inst.done) return; inst.picked = i; btns.forEach((x, k) => { x.classList.toggle('sel', k === i); x.setAttribute('aria-checked', k === i ? 'true' : 'false'); }); syncTy(); notify(); };
    CH.forEach((t, i) => {
      const b = h('button', { type: 'button', class: 'opt ty-' + t, role: 'radio', 'aria-checked': 'false', onclick: () => pickTy(i) },
        h('span', { class: 'opt-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'opt-t' }, t === 'Error' ? [icon('warn'), ' Error'] : t === 'NoneType' ? 'None' : t));
      btns.push(b); wrap.append(b);
    });
    const syncTy = radioNav(btns, pickTy);
    api.btns = btns; api.select = i => btns[i].click(); root.append(wrap);
    api.answered = () => inst.picked != null;
    api.yours = () => inst.picked == null ? '(no answer)' : CH[inst.picked];
    api.correctText = () => it.answer;
    api.grade = async () => ({ ok: CH[inst.picked] === it.answer });
    api.mark = () => markOpts(btns, k => CH[k] === it.answer, inst.picked);
  } else if (kind === 'line') {
    root.append(codeBlock(it.code)); const n = stdinNote(it.stdin); n && root.append(n);
    const labels = Array.from({ length: it.nlines }, (_, i) => 'Line ' + (i + 1)).concat(['No crash - it runs fine']);
    root.append(choiceButtons(labels, () => false, 'opt-line'));
    api.answered = () => inst.picked != null;
    const ans = () => it.answer === -1 ? it.nlines : it.answer;
    api.yours = () => inst.picked == null ? '(no answer)' : labels[inst.picked];
    api.correctText = () => labels[ans()];
    api.grade = async () => ({ ok: inst.picked === ans() });
    api.mark = () => markOpts(api.btns, k => k === ans(), inst.picked);
  } else if (kind === 'typed') {
    root.append(codeBlock(it.code)); const n = stdinNote(it.stdin); n && root.append(n); { const pn = promptNote(); pn && root.append(pn); }
    const ta = h('textarea', { class: 'typed-in', rows: Math.max(2, it.answer.split('\n').length + 1), spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off',
      'aria-label': 'Type the exact output', placeholder: 'Type the output exactly as it appears (no extra quotes)...' });
    ta.addEventListener('input', () => { inst.text = ta.value; notify(); });
    const singleLine = !it.answer.includes('\n');
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && (singleLine || e.ctrlKey || e.metaKey)) { e.preventDefault(); root.dispatchEvent(new CustomEvent('submitkey', { bubbles: true })); } });
    root.append(ta, h('div', { class: 'muted small' }, singleLine ? 'Press Enter to check.' : 'This one has several lines: press Enter for a new line, Ctrl+Enter to check.')); api.ta = ta;
    api.answered = () => inst.text.trim() !== '';
    api.yours = () => inst.text || '(no answer)';
    api.correctText = () => it.answer;
    api.grade = async () => {
      const got = norm(foldTyped(inst.text, it.answer)).replace(/^\s*\n+/, '').trimStart(); const ok = got === it.answer.trimStart(); let near = null;
      if (!ok) {
        if (got.replace(/\s+/g, '') === it.answer.replace(/\s+/g, '')) near = 'So close! The letters are right but the <b>spaces</b> are off. Commas add a space; + does not.';
        else if (got.replace(/["']/g, '') === it.answer) near = 'Careful: Python <b>never prints the quotes</b> around text.';
        else if (got.toLowerCase() === it.answer.toLowerCase()) near = 'Check the <b>capital letters</b> - they must match exactly.';
      }
      return { ok, near };
    };
    api.mark = () => { ta.readOnly = true; };
  } else if (kind === 'fill') {
    const parts = it.code.split('___');
    const hlcode = highlight(it.code, 0, 0).replace(/___/, '<span class="blank" data-blank>&nbsp;&nbsp;?&nbsp;&nbsp;</span>');
    root.append(h('div', { class: 'codeblock' }, h('div', { class: 'cb-gutter', 'aria-hidden': 'true' }, it.code.split('\n').map((_, i) => h('span', null, String(i + 1)))), h('pre', { class: 'cb-code', html: hlcode })));
    const n = stdinNote(it.stdin); n && root.append(n);
    const labels = inst.order.map(o => it.opts[o]);
    api.onPick = i => { const b = $('[data-blank]', root); b.textContent = labels[i]; b.classList.add('filled'); };
    root.append(choiceButtons(labels, () => true));
    api.answered = () => inst.picked != null;
    api.yours = () => inst.picked == null ? '(no answer)' : labels[inst.picked];
    api.correctText = () => it.opts[0];
    api.grade = async () => ({ ok: inst.order[inst.picked] === 0 });
    api.mark = () => markOpts(api.btns, k => inst.order[k] === 0, inst.picked);
  } else if (kind === 'fix' || kind === 'write') {
    const ex = it.tests[0];
    if (kind === 'write') {
      const sample = h('div', { class: 'sample' }, h('b', null, 'Example run: '), ex.stdin.length ? ['you type ', ex.stdin.map((s, i) => [h('code', null, s), i < ex.stdin.length - 1 ? ', ' : '']), ' → '] : '', 'it prints ', h('code', { class: 'sample-out' }, ex.expect.split('\n').join(' ⏎ ')));
      root.append(sample);
    } else if (ex.stdin.length) root.append(stdinNote(ex.stdin));
    const start = kind === 'fix' ? it.buggy : (it.starter || '');
    const pg = Playground({ code: start, stdin: kind === 'fix' || kind === 'write' ? ex.stdin : [], minLines: Math.min(kind === 'write' ? (it.unit >= 8 ? 9 : 5) : (it.unit >= 8 ? 6 : 4), window.matchMedia && matchMedia('(pointer:coarse)').matches ? 4 : 99), showVars: mode !== 'test', id: it.id });
    pg.ed.ta.addEventListener('input', () => { inst.code = pg.getCode(); notify(); });
    root.append(pg.el); api.pg = pg;
    if (kind === 'write') root.append(h('div', { class: 'hintbar' }));
    api.answered = () => (inst.code != null && inst.code.trim() !== '' && inst.code.trim() !== (kind === 'fix' ? it.buggy.trim() : '')) || (kind === 'fix' && inst.checked);
    api.yours = () => inst.code != null ? inst.code : start;
    api.correctText = () => it.solution;
    api.grade = async () => { const code = pg.getCode(); inst.code = code; const g = await gradeCode(it, code); return { ok: g.ok, g, code }; };
    api.mark = () => { pg.ed.ta.readOnly = true; };
  }
  api.el = root;
  api.lock = () => { inst.done = true; api.mark && api.mark(); };
  return api;
}

const focusPrompt = el => { const p = $('.q-prompt', el); if (p) { p.tabIndex = -1; try { p.focus({ preventScroll: true }); } catch (e) {} } };

/* ---------- feedback block ---------- */
async function feedbackNode(inst, view, gr, { first = true, streak = 0 } = {}) {
  const it = inst.item;
  const box = h('div', { class: 'feedback ' + (gr.ok ? 'ok' : 'no') });
  const headline = gr.ok ? (first ? cheerLine(true, streak) : 'Got it this time!') : (inst.tries < 3 && (it.kind === 'fix' || it.kind === 'write') ? 'Not yet. Try again!' : cheerLine(false, 0));
  box.append(Pip(gr.ok ? (streak >= 3 ? 'cheer' : 'happy') : 'oops', 64));
  box.append(h('div', { class: 'fb-h' }, icon(gr.ok ? 'check' : 'bulb'), headline));
  if (!gr.ok && gr.near) box.append(h('p', { class: 'fb-near', html: gr.near }));
  if (it.kind === 'fix' || it.kind === 'write') {
    if (gr.g) box.append(testResultsNode(gr.g, it, gr.code));
  } else if (!gr.ok) {
    box.append(h('div', { class: 'fb-ans' }, h('span', { class: 'fb-l' }, 'Correct answer'), h('div', { class: 'fb-v' }, optLabel(view.correctText()))));
    if (it.kind === 'typed') box.append(h('div', { class: 'fb-ans' }, h('span', { class: 'fb-l' }, 'You typed'), h('div', { class: 'fb-v' }, inst.text || '(nothing)')));
  }
  box.append(h('p', { class: 'fb-why', html: '<b>Why:</b> ' + esc(it.why) }));
  // "show me" - run the real program
  const runnable = ['out', 'typed', 'ty', 'line', 'fill'].includes(it.kind) || (it.kind === 'know' && it.code);
  if (runnable) {
    let code = it.code, stdin = it.stdin || [];
    if (it.kind === 'ty') code = (it.setup ? it.setup + '\n' : '') + 'print(type(' + it.expr + '))';
    if (it.kind === 'fill') code = it.code.replace('___', it.opts[0]);
    const holder = h('div', { class: 'showme' });
    const btn = h('button', { type: 'button', class: 'btn small', onclick: async () => {
      btn.remove(); const tr = await transcript(code, stdin);
      holder.append(h('div', { class: 'showme-l' }, 'What Python really does:'), it.kind === 'ty' || it.kind === 'fill' ? codeBlock(code, { compact: true }) : null, renderTranscript(tr, code));
    } }, icon('play'), 'Run it and see');
    holder.append(btn); box.append(holder);
  }
  if ((it.kind === 'fix' || it.kind === 'write') && !gr.ok && inst.tries >= 2) {
    const sol = h('details', { class: 'solution' }, h('summary', null, 'Show a correct solution'), codeBlock(it.solution));
    box.append(sol);
  }
  return box;
}

/* ---------- shared bits for end-of-round screens ---------- */
const statTile = (ic, hue, label, value) => h('div', { class: 'stat-tile' }, h('span', { class: 'stat-ico ' + hue }, icon(ic)), h('div', null, h('b', null, value), h('span', { class: 'l' }, label)));
const skillBars = bySkill => h('div', { class: 'skill-rows' }, Object.entries(bySkill).map(([s, v]) => h('div', { class: 'skill-row' }, h('span', null, SKILL_NAMES[s] || s), bar(v.ok / v.t, v.ok / v.t >= .8 ? 'good' : v.ok / v.t < .5 ? 'warn' : '', SKILL_NAMES[s] || s), h('b', null, `${v.ok}/${v.t}`))));
const levelLine = () => { const li = levelInfo(Store.data.xp); return `Level ${li.n}: ${li.name}` + (li.next ? ` · ${li.next - Store.data.xp} XP to ${li.nextName}` : ' · top level!'); };
const badgeShelf = list => list.length ? h('div', { class: 'new-badges' }, h('b', null, list.length > 1 ? 'New badges!' : 'New badge!'), list.map(b => h('div', { class: 'medal-wrap earned' }, Medal({ ...b, earned: true }, 64), h('span', null, b.name)))) : null;

/* ---------- practice session ---------- */
function xpFor(it, first) { const base = (it.kind === 'fix' || it.kind === 'write') ? 20 : 10; return first ? base : Math.round(base / 2); }

function PracticeSession({ title, items, backHref = '#/practice', backLabel = 'Practice', onFinish, meta }) {
  const root = h('div', { class: 'session' });
  const queue = items.map(makeInst);
  const total = queue.length;
  let idx = 0, streak = 0, bestStreak = 0, xp = 0;
  const results = [];     // first-try results
  const retried = new Set();
  const topbar = h('div', { class: 'sess-top' });
  const stage = h('div', { class: 'sess-stage' });
  root.append(topbar, stage);

  function header() {
    topbar.textContent = '';
    const done = Math.min(idx, queue.length);
    topbar.append(h('a', { class: 'back', href: backHref }, icon('back'), backLabel), h('h1', { class: 'sess-title' }, title),
      h('div', { class: 'sess-stats' }, h('span', { class: 'stat streak' + (streak >= 3 ? ' hot' : ''), title: 'Right in a row' }, icon('flame'), String(streak), h('span', { class: 'sr-only' }, ' in a row')), h('span', { class: 'stat xpstat', title: 'XP this round' }, icon('star', 'xpi'), String(xp), h('span', { class: 'sr-only' }, ' XP'))),
      h('div', { class: 'sess-prog' }, bar(done / queue.length, '', 'Round progress'), h('span', null, `${Math.min(done + 1, queue.length)} / ${queue.length}`)));
  }
  function showNext() {
    header(); stage.textContent = '';
    if (idx >= queue.length) return finish();
    const inst = queue[idx]; const view = QView(inst, { mode: 'practice', onChange: updateBtn });
    const check = h('button', { type: 'button', class: 'btn primary big', disabled: true, onclick: submit }, 'Check answer');
    const next = h('button', { type: 'button', class: 'btn primary big', onclick: () => { idx++; showNext(); toTop(); } }, idx + 1 >= queue.length ? ['See results', icon('arrow')] : ['Next', icon('arrow')]);
    const fbSlot = h('div', { class: 'fb-slot', role: 'status', 'aria-live': 'polite' });
    const actions = h('div', { class: 'q-actions' }, check);
    const card = h('div', { class: 'card q-card' }, view.el, fbSlot, actions);
    card.addEventListener('submitkey', () => { if (!check.disabled) check.click(); });
    stage.append(card);
    sessionCtl = { inst, view, check, submit, next, actions, fbSlot };
    function updateBtn() { check.disabled = !view.answered() || inst.done; }
    function showFeedback() { const fb = $('.feedback', fbSlot); if (fb) fb.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }); }
    async function submit() {
      if (inst.done || check.disabled && inst.kind !== 'fix') return;
      check.disabled = true; check.textContent = 'Checking…';
      inst.tries++;
      const gr = await view.grade(); inst.checked = true;
      const first = inst.tries === 1 && !retried.has(inst.item.id);
      const isCode = inst.item.kind === 'fix' || inst.item.kind === 'write';
      if (isCode && !gr.ok && inst.tries < 3) {   // coding tasks: let them try again before revealing
        fbSlot.textContent = ''; fbSlot.append(await feedbackNode(inst, view, gr, { first, streak })); showFeedback();
        check.disabled = false; check.textContent = 'Check again';
        if (inst.tries >= 2) actions.append(h('button', { type: 'button', class: 'btn ghost', onclick: () => finishItem(gr, true) }, 'Skip & show answer'));
        hintsUI(inst, view, actions);
        return;
      }
      await finishItem(gr, false);
      async function finishItem(g, skipped) {
        inst.done = true; inst.ok = g.ok; view.lock();
        fbSlot.textContent = ''; fbSlot.append(await feedbackNode(inst, view, g, { first, streak: g.ok ? streak + 1 : 0 })); showFeedback(); buzz(g.ok ? 12 : [18, 40, 18]);
        if (first || !results.find(r => r.id === inst.item.id)) {
          results.push({ id: inst.item.id, ok: g.ok && first, item: inst.item });
        }
        Store.record(inst.item.id, g.ok);
        let gainNow = 0;
        if (g.ok) { streak++; bestStreak = Math.max(bestStreak, streak); gainNow = xpFor(inst.item, first); xp += gainNow; Store.addXp(gainNow); if (bestStreak > Store.data.bestStreak) { Store.data.bestStreak = bestStreak; Store.save(); } } else streak = 0;
        if (!g.ok && !retried.has(inst.item.id)) { retried.add(inst.item.id); queue.push(makeInst(inst.item)); }   // fresh instance comes back at the end
        actions.textContent = ''; actions.append(next); next.focus(); header(); if (gainNow) floatXP(gainNow, $('.xpstat', topbar)); collectBadges();
        sessionCtl = { ...sessionCtl, done: true };
      }
    }
    // coding hints
    if (['fix', 'write'].includes(inst.item.kind)) hintsUI(inst, view, actions);
    const fine = !window.matchMedia || !matchMedia('(pointer:coarse)').matches;      // never pop the phone keyboard over the code they need to read
    if (inst.item.kind === 'typed' && fine) setTimeout(() => view.ta && view.ta.focus(), 50);
    else focusPrompt(view.el);
  }
  function hintsUI(inst, view, actions) {
    const it = inst.item; if (it.kind !== 'write' || !it.hints || !it.hints.length) return;
    let slot = $('.hintbar', view.el); if (!slot) return;
    if (slot.dataset.ready) return; slot.dataset.ready = '1';
    const btn = h('button', { type: 'button', class: 'btn ghost small', onclick: () => {
      if (inst.hints < it.hints.length) { slot.append(h('div', { class: 'hint' }, h('b', null, 'Hint ' + (inst.hints + 1) + ': '), it.hints[inst.hints])); inst.hints++; }
      if (inst.hints >= it.hints.length) btn.disabled = true;
    } }, icon('bulb'), 'Give me a hint');
    slot.prepend(btn);
  }
  let sessionCtl = null;
  const earned = [];
  function collectBadges() { const f = newBadges(); f.forEach(b => earned.push(b)); announceBadges(f); }
  function finish() {
    header(); stage.textContent = '';
    const firstTry = results.filter(r => r.ok).length;
    const n = results.length;
    const sess = { ts: Date.now(), kind: meta && meta.kind || 'drill', unit: meta && meta.unit, score: firstTry, total: n };
    Store.data.sessions.push(sess); if (Store.data.sessions.length > 200) Store.data.sessions.shift(); Store.save();
    const bySkill = {};
    for (const r of results) { const s = r.item.skill; bySkill[s] = bySkill[s] || { t: 0, ok: 0 }; bySkill[s].t++; if (r.ok) bySkill[s].ok++; }
    const frac = n ? firstTry / n : 0;
    const msg = frac >= 0.9 ? 'Outstanding!' : frac >= 0.75 ? 'Great work!' : frac >= 0.5 ? 'Getting there. The misses are your gold.' : 'Good start. Let us look at the misses together.';
    const missed = results.filter(r => !r.ok).map(r => r.item);
    newBadges().forEach(b => earned.push(b));
    const card = h('div', { class: 'card summary' },
      h('div', { class: 'sum-top' }, Pip(frac >= .75 ? 'cheer' : frac >= .5 ? 'happy' : 'think', 130), h('h2', null, msg), h('p', { class: 'muted' }, levelLine())),
      h('div', { class: 'sum-score' }, statTile('check', 'mint', 'Right first try', `${firstTry} / ${n}`), statTile('flame', 'coral', 'Best streak', String(bestStreak)), statTile('star', 'sun', 'XP earned', '+' + xp)),
      badgeShelf(earned),
      h('h3', null, 'By skill'), skillBars(bySkill),
      missed.length ? h('div', { class: 'missed' }, h('h3', null, 'Ones to look at again'), missed.map(it => h('div', { class: 'missed-item' }, h('span', { class: 'chip' }, KIND_LABEL[it.kind]), h('code', null, (it.code || it.expr || it.prompt || it.q || '').split('\n')[0].slice(0, 60))))) : h('p', { class: 'good-line' }, 'Perfect round! Try a harder mix or the mock test.'),
      h('div', { class: 'sum-actions' },
        missed.length ? h('button', { type: 'button', class: 'btn primary', onclick: () => startItems('Retry my misses', missed, { kind: 'retry' }) }, icon('reset'), `Retry ${missed.length} missed`) : null,
        h('a', { class: 'btn', href: backHref }, icon('back'), backLabel),
        h('a', { class: 'btn ghost', href: '#/' }, 'Home')));
    stage.append(card); if (frac >= .75 && n >= 5) confetti();
    onFinish && onFinish(sess);
  }
  // keyboard: 1-9 pick, Enter = check/next
  function key(e) {
    if (!root.isConnected) { document.removeEventListener('keydown', key); return; }
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || (tag === 'input' && e.target.type === 'text')) return;
    if (!sessionCtl) return;
    const { inst, view, check, next } = sessionCtl;
    if (/^[1-9]$/.test(e.key) && !inst.done && view.btns && view.btns[+e.key - 1]) { view.btns[+e.key - 1].click(); e.preventDefault(); }
    else if (e.key === 'Enter') {
      if (['a', 'select', 'summary', 'input'].includes(tag)) return;
      const cls = e.target.classList; const isOpt = cls && cls.contains('opt');
      if (isOpt) {      // Enter on an option picks THAT option (native click). Only an already-picked option submits.
        if (!inst.done && e.target.getAttribute('aria-checked') === 'true' && !check.disabled) { check.click(); e.preventDefault(); }
        return;
      }
      if (tag === 'button' && e.target !== check && e.target !== next) return;
      if (inst.done) { next.click(); e.preventDefault(); } else if (!check.disabled) { check.click(); e.preventDefault(); }
    }
  }
  document.addEventListener('keydown', key);
  showNext();
  return root;
}
function startItems(title, items, meta) {
  const view = $('#view'); view.textContent = ''; document.body.classList.add('in-session');
  view.append(PracticeSession({ title, items, meta, backHref: '#/practice', backLabel: 'Practice' }));
  toTop();
}

/* ---------- picking item sets ---------- */
function itemsForUnit(u, n = 14) {
  const pool = ITEMS.filter(i => i.unit === u);
  return mixPool(pool, n);
}
// spread over kinds, easy -> hard, prefer unseen/missed items
const itemSig = it => [(it.kind === 'fix' || it.kind === 'write') ? it.prompt : (it.code || it.expr || it.q), it.setup || '', (it.stdin || []).join('|')].join('¦');
function mixPool(pool, n) {
  const weight = it => { const r = Store.data.items[it.id]; return !r ? 3 : r.last ? 1 : 4; };
  const bag = shuffle(pool).map(it => ({ it, w: weight(it) + R() * 2 })).sort((a, b) => b.w - a.w);
  const chosen = []; const kinds = {}; const sigs = new Set();
  const take = it => { const s = itemSig(it); if (sigs.has(s)) return false; sigs.add(s); chosen.push(it); return true; };
  for (const { it } of bag) { if (chosen.length >= n) break; if ((kinds[it.kind] || 0) >= Math.ceil(n / 3)) continue; if (take(it)) kinds[it.kind] = (kinds[it.kind] || 0) + 1; }
  for (const { it } of bag) { if (chosen.length >= n) break; if (!chosen.includes(it)) take(it); }
  return chosen.sort((a, b) => a.level - b.level || (R() - .5));
}
function weakItems(n = 14, track = 'test') {
  const st = skillStats(); const SK = track === 'level' ? LEVEL_SKILLS : CORE_SKILLS; const inTrack = i => unitTrack(i.unit) === track;
  const skills = [...SK].sort((a, b) => st[a].mastery - st[b].mastery).slice(0, 3);
  const missed = ITEMS.filter(i => { const r = Store.data.items[i.id]; return r && !r.last && inTrack(i); });
  const pool = ITEMS.filter(i => skills.includes(i.skill) && inTrack(i));
  const first = shuffle(missed).slice(0, Math.ceil(n / 2));
  const rest = mixPool(pool.filter(i => !first.includes(i)), n - first.length);
  return { items: [...first, ...rest].sort((a, b) => a.level - b.level), skills };
}

/* ---------- MOCK TEST ---------- */
function buildMock(n, track = 'test') {
  const recipe20 = [['out', 6], ['ty', 3], ['typed', 2], ['fill', 2], ['know', 2], ['line', 1], ['fix', 2], ['write', 2]];
  const recipe = n >= 20 ? recipe20 : [['out', 3], ['ty', 2], ['typed', 1], ['fill', 1], ['know', 1], ['fix', 1], ['write', 1]];
  const chosen = [];
  for (const [kind, c] of recipe) {
    const pool = shuffle(ITEMS.filter(i => i.kind === kind && unitTrack(i.unit) === track && (track === 'test' || i.unit >= 8 || i.kind === 'write')));
    const bySkill = {}; for (const it of pool) (bySkill[it.skill] = bySkill[it.skill] || []).push(it);
    const skills = shuffle(Object.keys(bySkill));
    let k = 0; const got = [];
    while (got.length < c && k < 200) { const s = skills[k % skills.length]; const it = bySkill[s].shift(); if (it) got.push(it); k++; }
    chosen.push(...got);
  }
  // order: choice questions first (quick), then typed/code
  const order = { know: 0, ty: 1, out: 2, fill: 3, line: 4, typed: 5, fix: 6, write: 7 };
  const seen = new Set(); const uniq = chosen.filter(it => { const s = itemSig(it); if (seen.has(s)) return false; seen.add(s); return true; });
  const kindsUsed = new Set(chosen.map(i => i.kind));
  for (const it of shuffle(ITEMS.filter(i => unitTrack(i.unit) === track && kindsUsed.has(i.kind) && !['fix', 'write'].includes(i.kind) && (track === 'test' || i.unit >= 8)))) {
    if (uniq.length >= chosen.length) break; const sg = itemSig(it); if (seen.has(sg)) continue; seen.add(sg); uniq.push(it);
  }
  return uniq.sort((a, b) => order[a.kind] - order[b.kind]);
}

const MOCK_MAX_AGE = 8 * 3600 * 1000;
let _bankSig = null;
const bankHash = () => _bankSig || (_bankSig = (() => { let x = 5381; for (const it of ITEMS) { const t = it.id + itemSig(it); for (let i = 0; i < t.length; i++) x = ((x * 33) ^ t.charCodeAt(i)) >>> 0; } return x.toString(36); })());
const optCount = it => it.kind === 'out' ? it.options.length : (it.kind === 'know' || it.kind === 'fill') ? it.opts.length : 0;
/* a saved test is only offered back if it still matches THIS version of the question bank and is well-formed; otherwise it is dropped, never crashed on */
function pendingMock() {
  const r = Store.getMock(); if (!r) return null;
  let ok = false;
  try {
    const L = Array.isArray(r.ids) ? r.ids.length : 0;
    ok = r.v === 1 && r.bank === bankHash() && (r.track === 'test' || r.track === 'level') && L > 0 && Date.now() - r.ts < MOCK_MAX_AGE && Number.isFinite(r.minutes) && Number.isFinite(r.endAt) && Number.isFinite(r.remaining)
      && r.ids.every(id => BYID[id]) && ['orders', 'picked', 'text', 'code'].every(k => Array.isArray(r[k]) && r[k].length === L) && Array.isArray(r.flagged)
      && r.ids.every((id, i) => {
        const n = optCount(BYID[id]), o = r.orders[i], pk = r.picked[i];
        if (n) { if (!Array.isArray(o) || o.length !== n || [...o].sort((x, y) => x - y).some((v, k) => v !== k)) return false; }
        return (pk == null || (Number.isInteger(pk) && pk >= 0 && pk < (n || (BYID[id].kind === 'ty' ? (BYID[id].choices || TYPE_OPTS).length : BYID[id].kind === 'line' ? BYID[id].nlines + 1 : 0)))) && typeof r.text[i] === 'string' && (r.code[i] == null || typeof r.code[i] === 'string');
      });
  } catch (e) { ok = false; }
  if (!ok) { Store.clearMock(); return null; }
  return r;
}
function ResumePrompt(run, startFresh, resume) {
  const label = run.track === 'level' ? 'Level Up checkpoint' : 'Mock test';
  const answered = run.picked.filter((x, i) => x != null || (run.text[i] || '').trim() || run.code[i]).length;
  return h('div', { class: 'session' }, h('div', { class: 'card summary' },
    h('div', { class: 'sum-top' }, Pip('think', 120), h('h1', { class: 'h2like' }, 'You have a test in progress'), h('p', { class: 'muted' }, `${label}: ${answered} of ${run.ids.length} answered. Your time kept ${run.paused ? 'paused' : 'running'}, just like a real test.`)),
    h('div', { class: 'sum-actions' }, h('button', { type: 'button', class: 'btn primary big', onclick: resume }, icon('play'), 'Resume my test'), h('button', { type: 'button', class: 'btn', onclick: startFresh }, 'Throw it away and start a new one'))));
}
function MockTest({ n = 20, minutes = 30, track = 'test', resume = null }) {
  if (resume) { minutes = resume.minutes; }
  const items = resume ? resume.ids.map(id => BYID[id]) : buildMock(n, track); const insts = items.map(makeInst);
  if (resume) insts.forEach((inst, i) => { if (resume.orders[i]) inst.order = resume.orders[i]; inst.picked = resume.picked[i] == null ? null : resume.picked[i]; inst.text = resume.text[i] || ''; inst.code = resume.code[i] == null ? null : resume.code[i]; });
  const root = h('div', { class: 'session mock' });
  const total = insts.length; let cur = resume ? Math.min(resume.cur || 0, total - 1) : 0; const flagged = new Set(resume ? resume.flagged : []); let finished = false;
  let timerOn = resume ? !resume.paused : true, remaining = resume ? resume.remaining : minutes * 60, endAt = resume && !resume.paused ? resume.endAt : Date.now() + minutes * 60000;
  const secsLeft = () => timerOn ? Math.max(0, Math.round((endAt - Date.now()) / 1000)) : remaining;
  let dead = false;
  const persist = () => {
    if (finished || dead) return;
    try {
      Store.setMock({ v: 1, bank: bankHash(), ts: Date.now(), track, n, minutes, ids: items.map(i => i.id), orders: insts.map(i => i.order || null), picked: insts.map(i => i.picked == null ? null : i.picked), text: insts.map(i => i.text || ''), code: insts.map(i => i.code == null ? null : i.code),
        flagged: [...flagged], cur, endAt, remaining: secsLeft(), paused: !timerOn });
    } catch (e) { /* storage full or blocked: the test still works */ }
  };
  const views = insts.map(i => QView(i, { mode: 'test', onChange: () => { renderNav(); persist(); } }));
  const timeTxt = h('span', null, ''); const timerEl = h('span', { class: 'timer', role: 'timer', 'aria-label': 'time left' }, icon('clock'), timeTxt);
  const navEl = h('div', { class: 'mock-nav', role: 'navigation', 'aria-label': 'Questions' });
  const stage = h('div', { class: 'sess-stage' });
  const pauseLab = h('span', null, timerOn ? 'Pause' : 'Resume');
  const pauseBtn = h('button', { type: 'button', class: 'btn ghost small', 'aria-label': timerOn ? 'Pause the clock' : 'Resume the clock', onclick: () => {
    if (timerOn) { remaining = secsLeft(); timerOn = false; } else { endAt = Date.now() + remaining * 1000; timerOn = true; }
    pauseBtn.setAttribute('aria-label', timerOn ? 'Pause the clock' : 'Resume the clock'); toast(timerOn ? 'Clock running' : 'Paused. Questions are hidden until you resume.');
    pauseLab.textContent = timerOn ? 'Pause' : 'Resume'; pauseBtn.firstChild.replaceWith(icon(timerOn ? 'pause' : 'play')); stage.classList.toggle('paused', !timerOn); persist(); } }, icon(timerOn ? 'pause' : 'play'), pauseLab);
  if (!timerOn) stage.classList.add('paused');
  const top = h('div', { class: 'sess-top' }, h('a', { class: 'back', href: track === 'level' ? '#/level' : '#/test', onclick: () => { if (!finished) { persist(); toast('Test saved. Come back to resume it.'); } } }, icon('back'), 'Leave'),
    h('h1', { class: 'sess-title' }, `${track === 'level' ? 'Level Up checkpoint' : 'Mock test'} · ${total} questions`), h('div', { class: 'sess-stats' }, timerEl, pauseBtn));
  const live = h('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite' }); const said = new Set();
  root.append(top, navEl, stage, live);
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const paintTime = () => { const s = secsLeft(); timeTxt.textContent = fmt(s); timerEl.classList.toggle('low', s < 300);
    const m = s <= 60 ? 60 : s <= 300 ? 300 : 0; if (m && s > 0 && timerOn && !said.has(m)) { said.add(m); live.textContent = m === 60 ? 'One minute left.' : 'Five minutes left.'; } return s; };
  const cleanup = () => { dead = true; clearInterval(tick); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', persist); };
  let beat = 0;
  const tick = setInterval(() => {
    if (!root.isConnected || finished) { cleanup(); return; }
    const s = paintTime(); if (++beat % 5 === 0) persist();
    if (s <= 0 && timerOn) { cleanup(); toast('Time is up! Grading…'); finish(true); }
  }, 1000);
  const onVis = () => { if (document.visibilityState === 'hidden') persist(); else { const s = paintTime(); if (s <= 0 && timerOn && !finished) { toast('Time is up! Grading…'); finish(true); } } };
  document.addEventListener('visibilitychange', onVis); window.addEventListener('pagehide', persist);
  paintTime();
  if (resume) views.forEach((v, i) => {                      // put saved answers back into the controls
    const inst = insts[i];
    if (inst.picked != null && v.select) v.select(inst.picked);
    if (inst.text && v.ta) { v.ta.value = inst.text; }
    if (inst.code != null && v.pg) v.pg.setCode(inst.code);
  });
  persist();

  function renderNav() {
    navEl.textContent = '';
    setTimeout(() => { const c = $('.nav-dot.cur', navEl); if (c && navEl.scrollWidth > navEl.clientWidth) navEl.scrollTo({ left: c.offsetLeft - navEl.clientWidth / 2 + c.offsetWidth / 2, behavior: 'auto' }); }, 0);
    insts.forEach((inst, i) => {
      const ans = views[i].answered && views[i].answered();
      navEl.append(h('button', { type: 'button', class: 'nav-dot' + (i === cur ? ' cur' : '') + (ans ? ' ans' : '') + (flagged.has(i) ? ' flag' : ''), 'aria-label': `Question ${i + 1}${ans ? ', answered' : ''}${flagged.has(i) ? ', flagged' : ''}`, 'aria-current': i === cur ? 'step' : null, onclick: () => go(i) }, String(i + 1)));
    });
  }
  function go(i) {
    cur = i; stage.textContent = ''; renderNav(); persist();
    const view = views[i]; const inst = insts[i];
    const flagLab = h('span', { class: 'lbl' }, flagged.has(i) ? 'Flagged' : 'Flag for review');
    const flag = h('button', { type: 'button', class: 'btn ghost small', 'aria-label': 'Flag for review', 'aria-pressed': flagged.has(i) ? 'true' : 'false', onclick: () => { flagged.has(i) ? flagged.delete(i) : flagged.add(i); flagLab.textContent = flagged.has(i) ? 'Flagged' : 'Flag for review'; flag.setAttribute('aria-pressed', flagged.has(i)); renderNav(); persist(); } }, icon('flag'), flagLab);
    const prev = h('button', { type: 'button', class: 'btn', disabled: i === 0, onclick: () => go(i - 1) }, icon('back'), 'Back');
    const nxt = i === total - 1 ? h('button', { type: 'button', class: 'btn primary', onclick: () => review() }, 'Review & finish') : h('button', { type: 'button', class: 'btn primary', onclick: () => go(i + 1) }, 'Next', icon('arrow'));
    const note = ['fix', 'write'].includes(inst.item.kind) ? h('p', { class: 'muted small' }, 'Use Run to test your code with your own inputs. It will be graded with hidden tests at the end.') : null;
    stage.append(h('div', { class: 'card q-card' }, h('div', { class: 'qnum' }, `Question ${i + 1} of ${total}`), view.el, note, h('div', { class: 'q-actions between' }, prev, flag, nxt)));
    toTop(); focusPrompt(view.el);
  }
  function review() {
    stage.textContent = '';
    const un = insts.map((_, i) => i).filter(i => !(views[i].answered && views[i].answered()));
    stage.append(h('div', { class: 'card' }, h('h2', null, 'Ready to hand it in?'),
      un.length ? h('p', null, `You have not answered: ${un.map(i => 'Q' + (i + 1)).join(', ')}.`) : h('p', null, 'You answered every question. Nice!'),
      flagged.size ? h('p', null, `Flagged: ${[...flagged].map(i => 'Q' + (i + 1)).join(', ')}.`) : null,
      h('div', { class: 'q-actions between' }, h('button', { type: 'button', class: 'btn', onclick: () => go(un[0] != null ? un[0] : 0) }, 'Go back and check'), h('button', { type: 'button', class: 'btn primary big', onclick: () => finish(false) }, 'Hand it in'))));
  }
  async function finish(timeUp) {
    if (finished) return; finished = true; cleanup(); root.classList.add('done');
    stage.textContent = ''; stage.append(h('div', { class: 'card' }, h('p', null, 'Grading…')));
    const graded = [];
    for (let i = 0; i < total; i++) {
      const inst = insts[i], view = views[i]; let gr;
      if (!(view.answered && view.answered()) && !['fix', 'write'].includes(inst.item.kind)) gr = { ok: false, skipped: true };
      else if (!(view.answered && view.answered())) gr = { ok: false, skipped: true };
      else { try { gr = await view.grade(); } catch (err) { console.error(err); gr = { ok: false, error: true }; } }
      graded.push({ inst, view, gr });
      Store.record(inst.item.id, gr.ok);
    }
    const right = graded.filter(g => g.gr.ok).length;
    const bySkill = {}; graded.forEach(g => { const s = g.inst.item.skill; bySkill[s] = bySkill[s] || { t: 0, ok: 0 }; bySkill[s].t++; if (g.gr.ok) bySkill[s].ok++; });
    const used = Math.max(0, minutes * 60 - secsLeft());
    Store.data.mocks.push({ ts: Date.now(), score: right, total, secs: used, track }); Store.save(); Store.addXp(right * 5); Store.clearMock();
    const frac = right / total;
    const missed = graded.filter(g => !g.gr.ok).map(g => g.inst.item);
    const verdict = frac >= 0.9 ? 'Test-ready!' : frac >= 0.75 ? 'Strong. A little polish and you are there.' : frac >= 0.6 ? 'Solid base. Fix the misses below.' : 'Keep going. Every miss below teaches you something.';
    const fresh = newBadges();
    const rev = h('div', { class: 'review-list' });
    for (let i = 0; i < graded.length; i++) {
      const { inst, view, gr } = graded[i]; const it = inst.item;
      const d = h('details', { class: 'rev ' + (gr.ok ? 'ok' : 'no'), open: !gr.ok }, h('summary', null, h('span', { class: 'rev-n' }, gr.ok ? icon('check') : gr.skipped ? '—' : icon('x'), ' Q' + (i + 1)), h('span', { class: 'chip' }, KIND_LABEL[it.kind]), h('span', { class: 'rev-t' }, (it.code || it.expr || it.prompt || it.q || '').split('\n')[0].slice(0, 70))));
      const body = h('div', { class: 'rev-body' });
      if (it.code) body.append(codeBlock(it.code));
      if (it.kind === 'ty') body.append(codeBlock((it.setup ? it.setup + '\n' : '') + 'result = ' + it.expr));
      if (it.kind === 'fix' || it.kind === 'write') {
        body.append(h('p', { html: it.prompt })); if (gr.g) body.append(testResultsNode(gr.g, it, gr.code));
        if (gr.skipped) body.append(h('p', { class: 'muted' }, 'Not answered.'));
        body.append(h('details', null, h('summary', null, 'Show a correct solution'), codeBlock(it.solution)));
      } else {
        body.append(h('p', null, h('b', null, 'Your answer: '), gr.skipped ? '(not answered)' : optLabel(view.yours())));
        if (!gr.ok) body.append(h('p', null, h('b', null, 'Correct answer: '), optLabel(view.correctText())));
      }
      body.append(h('p', { class: 'fb-why', html: '<b>Why:</b> ' + esc(it.why) }));
      d.append(body); rev.append(d);
    }
    stage.textContent = '';
    stage.append(h('div', { class: 'card summary' },
      h('div', { class: 'sum-top' }, Pip(frac >= .75 ? 'cheer' : frac >= .6 ? 'happy' : 'think', 130), h('h2', null, verdict), h('p', { class: 'muted' }, levelLine() + (timeUp ? ' · time ran out' : ''))),
      h('div', { class: 'sum-score' }, statTile('check', 'mint', 'Correct', `${right} / ${total}`), statTile('trophy', 'violet', 'Score', pct(frac) + '%'), statTile('clock', 'sun', 'Time used', fmt(used))),
      badgeShelf(fresh),
      h('h3', null, 'By skill'), skillBars(bySkill),
      h('div', { class: 'sum-actions' }, missed.length ? h('button', { type: 'button', class: 'btn primary', onclick: () => startItems('Fix my test misses', missed, { kind: 'retry' }) }, `Practice the ${missed.length} I missed`) : null,
        h('a', { class: 'btn', href: track === 'level' ? '#/level' : '#/test' }, 'Another test'), h('a', { class: 'btn ghost', href: '#/' }, 'Home'))),
      h('h3', { class: 'rev-h' }, 'Question by question'), rev);
    toTop(); if (frac >= .8) confetti();
  }
  go(cur);
  return root;
}
