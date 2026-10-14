/* questions: render + grade every question kind; practice session; mock test */
'use strict';

const KIND_LABEL = { out: 'Predict the output', typed: 'Type the output', ty: 'Name the type', line: 'Find the crash', fill: 'Fill the blank', fix: 'Bug hunt', write: 'Write the code', know: 'Quick check' };
const TYPE_OPTS = ['int', 'float', 'str', 'Error'];

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
    if (m) frag.append(h('span', { class: 'o-err' }, '💥 ' + m[1]));
    else frag.append(ln === '' ? h('span', { class: 'muted' }, '(blank line)') : document.createTextNode(ln));
  });
  return frag;
}
const looksLikeCode = t => /[()"=]|\n|^\d/.test(t);

function stdinNote(stdin) {
  if (!stdin || !stdin.length) return null;
  return h('div', { class: 'stdin-note' }, h('span', { class: 'sn-ico', 'aria-hidden': 'true' }, '⌨'), h('span', null, 'The user types: '),
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
  if (g.must.length) box.append(h('div', { class: 'test-must' }, g.must.map(m => h('p', null, '⚠ ' + m))));
  g.tests.forEach((t, i) => {
    const inp = t.stdin.length ? t.stdin.map(s => s === '' ? '(Enter)' : s).join(', ') : 'no input';
    const row = h('div', { class: 'test ' + (t.pass ? 'pass' : 'fail') }, h('div', { class: 'test-h' }, (t.pass ? '✔ ' : '✘ ') + 'Test ' + (i + 1), h('span', { class: 'test-in' }, ' - typed: ' + inp)));
    if (!t.pass) {
      if (t.error) {
        const ex = explainError(t.error, [], code);
        row.append(h('div', { class: 'test-err', html: `<b>💥 ${esc(t.error.type === 'NotInCourse' ? 'Not part of this course' : t.error.type)}</b> on line ${t.error.line}: ${ex.what}` }));
      } else { const dg = diagnose(t.got, t.expect); if (dg) row.append(h('div', { class: 'diag', html: '💡 ' + dg })); row.append(h('div', { class: 'diff' },
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
    labels.forEach((lab, i) => {
      const b = h('button', { type: 'button', class: 'opt ' + cls + (mono(lab) ? ' mono' : ''), role: 'radio', 'aria-checked': 'false', dataset: { i: i + '' },
        onclick: () => select(i) }, h('span', { class: 'opt-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'opt-t' }, optLabel(lab)));
      btns.push(b); wrap.append(b);
    });
    function select(i) {
      if (inst.done) return; inst.picked = i; btns.forEach((b, k) => { b.classList.toggle('sel', k === i); b.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
      if (api.onPick) api.onPick(i); notify();
    }
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
    api.mark = () => api.btns.forEach((b, k) => { const good = inst.order[k] === 0; b.classList.add(good ? 'good' : (k === inst.picked ? 'bad' : 'dim')); b.disabled = true; });
  } else if (kind === 'ty') {
    const code = (it.setup ? it.setup + '\n' : '') + '# what type is this?\nresult = ' + it.expr;
    root.append(codeBlock(code)); const n = stdinNote(it.stdin); n && root.append(n);
    const CH = it.choices || TYPE_OPTS; const wrap = optsWrap(); wrap.classList.add('opts-ty'); if (CH.length > 4) wrap.classList.add('opts-ty5'); const btns = [];
    CH.forEach((t, i) => {
      const b = h('button', { type: 'button', class: 'opt ty-' + t, role: 'radio', 'aria-checked': 'false', onclick: () => { if (inst.done) return; inst.picked = i; btns.forEach((x, k) => { x.classList.toggle('sel', k === i); x.setAttribute('aria-checked', k === i ? 'true' : 'false'); }); notify(); } },
        h('span', { class: 'opt-n', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'opt-t' }, t === 'Error' ? '💥 Error' : t === 'NoneType' ? 'None' : t));
      btns.push(b); wrap.append(b);
    });
    api.btns = btns; api.select = i => btns[i].click(); root.append(wrap);
    api.answered = () => inst.picked != null;
    api.yours = () => inst.picked == null ? '(no answer)' : CH[inst.picked];
    api.correctText = () => it.answer;
    api.grade = async () => ({ ok: CH[inst.picked] === it.answer });
    api.mark = () => btns.forEach((b, k) => { const good = CH[k] === it.answer; b.classList.add(good ? 'good' : (k === inst.picked ? 'bad' : 'dim')); b.disabled = true; });
  } else if (kind === 'line') {
    root.append(codeBlock(it.code)); const n = stdinNote(it.stdin); n && root.append(n);
    const labels = Array.from({ length: it.nlines }, (_, i) => 'Line ' + (i + 1)).concat(['No crash - it runs fine']);
    root.append(choiceButtons(labels, () => false, 'opt-line'));
    api.answered = () => inst.picked != null;
    const ans = () => it.answer === -1 ? it.nlines : it.answer;
    api.yours = () => inst.picked == null ? '(no answer)' : labels[inst.picked];
    api.correctText = () => labels[ans()];
    api.grade = async () => ({ ok: inst.picked === ans() });
    api.mark = () => api.btns.forEach((b, k) => { b.classList.add(k === ans() ? 'good' : (k === inst.picked ? 'bad' : 'dim')); b.disabled = true; });
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
      const got = norm(inst.text).replace(/^\s*\n+/, '').trimStart(); const ok = got === it.answer.trimStart(); let near = null;
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
    api.mark = () => api.btns.forEach((b, k) => { const good = inst.order[k] === 0; b.classList.add(good ? 'good' : (k === inst.picked ? 'bad' : 'dim')); b.disabled = true; });
  } else if (kind === 'fix' || kind === 'write') {
    const ex = it.tests[0];
    if (kind === 'write') {
      const sample = h('div', { class: 'sample' }, h('b', null, 'Example run: '), ex.stdin.length ? ['you type ', ex.stdin.map((s, i) => [h('code', null, s), i < ex.stdin.length - 1 ? ', ' : '']), ' → '] : '', 'it prints ', h('code', { class: 'sample-out' }, ex.expect.split('\n').join(' ⏎ ')));
      root.append(sample);
    } else if (ex.stdin.length) root.append(stdinNote(ex.stdin));
    const start = kind === 'fix' ? it.buggy : (it.starter || '');
    const pg = Playground({ code: start, stdin: kind === 'fix' || kind === 'write' ? ex.stdin : [], minLines: kind === 'write' ? (it.unit >= 8 ? 9 : 5) : (it.unit >= 8 ? 6 : 4), showVars: mode !== 'test', id: it.id });
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

/* ---------- feedback block ---------- */
async function feedbackNode(inst, view, gr, { first = true } = {}) {
  const it = inst.item;
  const box = h('div', { class: 'feedback ' + (gr.ok ? 'ok' : 'no'), role: 'status', 'aria-live': 'polite' });
  const head = h('div', { class: 'fb-h' }, gr.ok ? (first ? '✅ Correct!' : '✅ Got it this time') : '❌ Not quite');
  box.append(head);
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
    } }, '▶ Run it and see');
    holder.append(btn); box.append(holder);
  }
  if ((it.kind === 'fix' || it.kind === 'write') && !gr.ok && inst.tries >= 2) {
    const sol = h('details', { class: 'solution' }, h('summary', null, 'Show a correct solution'), codeBlock(it.solution));
    box.append(sol);
  }
  return box;
}

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
    topbar.append(h('a', { class: 'back', href: backHref }, '← ' + backLabel), h('h1', { class: 'sess-title' }, title),
      h('div', { class: 'sess-stats' }, h('span', { class: 'stat streak' + (streak >= 3 ? ' hot' : ''), title: 'Right in a row' }, '🔥 ' + streak), h('span', { class: 'stat' }, '⭐ ' + xp)),
      h('div', { class: 'sess-prog' }, bar(done / queue.length), h('span', null, `${Math.min(done + 1, queue.length)} / ${queue.length}`)));
  }
  function showNext() {
    header(); stage.textContent = '';
    if (idx >= queue.length) return finish();
    const inst = queue[idx]; const view = QView(inst, { mode: 'practice', onChange: updateBtn });
    const check = h('button', { type: 'button', class: 'btn primary big', disabled: true, onclick: submit }, 'Check answer');
    const next = h('button', { type: 'button', class: 'btn primary big', onclick: () => { idx++; showNext(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, idx + 1 >= queue.length ? 'See results →' : 'Next →');
    const fbSlot = h('div', { class: 'fb-slot' });
    const actions = h('div', { class: 'q-actions' }, check);
    const card = h('div', { class: 'card q-card' }, view.el, fbSlot, actions);
    card.addEventListener('submitkey', () => { if (!check.disabled) check.click(); });
    stage.append(card);
    sessionCtl = { inst, view, check, submit, next, actions, fbSlot };
    function updateBtn() { check.disabled = !view.answered() || inst.done; }
    async function submit() {
      if (inst.done || check.disabled && inst.kind !== 'fix') return;
      check.disabled = true; check.textContent = 'Checking…';
      inst.tries++;
      const gr = await view.grade(); inst.checked = true;
      const first = inst.tries === 1 && !retried.has(inst.item.id);
      const isCode = inst.item.kind === 'fix' || inst.item.kind === 'write';
      if (isCode && !gr.ok && inst.tries < 3) {   // coding tasks: let them try again before revealing
        fbSlot.textContent = ''; fbSlot.append(await feedbackNode(inst, view, gr, { first }));
        check.disabled = false; check.textContent = 'Check again';
        if (inst.tries >= 2) actions.append(h('button', { type: 'button', class: 'btn ghost', onclick: () => finishItem(gr, true) }, 'Skip & show answer'));
        hintsUI(inst, view, actions);
        return;
      }
      await finishItem(gr, false);
      async function finishItem(g, skipped) {
        inst.done = true; inst.ok = g.ok; view.lock();
        fbSlot.textContent = ''; fbSlot.append(await feedbackNode(inst, view, g, { first }));
        if (first || !results.find(r => r.id === inst.item.id)) {
          results.push({ id: inst.item.id, ok: g.ok && first, item: inst.item });
        }
        Store.record(inst.item.id, g.ok);
        if (g.ok) { streak++; bestStreak = Math.max(bestStreak, streak); const gain = xpFor(inst.item, first); xp += gain; Store.addXp(gain); } else streak = 0;
        if (!g.ok && !retried.has(inst.item.id)) { retried.add(inst.item.id); queue.push(makeInst(inst.item)); }   // fresh instance comes back at the end
        actions.textContent = ''; actions.append(next); next.focus(); header();
        sessionCtl = { ...sessionCtl, done: true };
      }
    }
    // coding hints
    if (['fix', 'write'].includes(inst.item.kind)) hintsUI(inst, view, actions);
    if (['typed'].includes(inst.item.kind)) setTimeout(() => view.ta && view.ta.focus(), 50);
  }
  function hintsUI(inst, view, actions) {
    const it = inst.item; if (it.kind !== 'write' || !it.hints || !it.hints.length) return;
    let slot = $('.hintbar', view.el); if (!slot) return;
    if (slot.dataset.ready) return; slot.dataset.ready = '1';
    const btn = h('button', { type: 'button', class: 'btn ghost small', onclick: () => {
      if (inst.hints < it.hints.length) { slot.append(h('div', { class: 'hint' }, h('b', null, 'Hint ' + (inst.hints + 1) + ': '), it.hints[inst.hints])); inst.hints++; }
      if (inst.hints >= it.hints.length) btn.disabled = true;
    } }, '💡 Give me a hint');
    slot.prepend(btn);
  }
  let sessionCtl = null;
  function finish() {
    header(); stage.textContent = '';
    const firstTry = results.filter(r => r.ok).length;
    const n = results.length;
    const sess = { ts: Date.now(), kind: meta && meta.kind || 'drill', unit: meta && meta.unit, score: firstTry, total: n };
    Store.data.sessions.push(sess); if (Store.data.sessions.length > 200) Store.data.sessions.shift(); Store.save();
    const bySkill = {};
    for (const r of results) { const s = r.item.skill; bySkill[s] = bySkill[s] || { t: 0, ok: 0 }; bySkill[s].t++; if (r.ok) bySkill[s].ok++; }
    const frac = n ? firstTry / n : 0;
    const msg = frac >= 0.9 ? 'Outstanding! 🚀' : frac >= 0.75 ? 'Great work! 💪' : frac >= 0.5 ? 'Getting there - the misses are your gold. 🔍' : 'Good start. Read the lesson again, then retry. 📘';
    const missed = results.filter(r => !r.ok).map(r => r.item);
    const card = h('div', { class: 'card summary' },
      h('div', { class: 'sum-top' }, ring(frac, 140, 'first try'), h('div', null, h('h2', null, msg), h('p', { class: 'muted' }, `${firstTry} of ${n} right on the first try. Best streak: ${bestStreak} 🔥. XP earned: ${xp} ⭐`))),
      h('h3', null, 'By skill'),
      h('div', { class: 'skill-rows' }, Object.entries(bySkill).map(([s, v]) => h('div', { class: 'skill-row' }, h('span', null, SKILL_NAMES[s] || s), bar(v.ok / v.t), h('b', null, `${v.ok}/${v.t}`)))),
      missed.length ? h('div', { class: 'missed' }, h('h3', null, 'Ones to look at again'), missed.map(it => h('div', { class: 'missed-item' }, h('span', { class: 'chip' }, KIND_LABEL[it.kind]), h('code', null, (it.code || it.expr || it.prompt || it.q || '').split('\n')[0].slice(0, 60))))) : h('p', { class: 'good-line' }, '🎯 Perfect round. Try a harder mix or the mock test!'),
      h('div', { class: 'sum-actions' },
        missed.length ? h('button', { type: 'button', class: 'btn primary', onclick: () => startItems('Retry my misses', missed, { kind: 'retry' }) }, `Retry ${missed.length} missed`) : null,
        h('a', { class: 'btn', href: backHref }, '← ' + backLabel),
        h('a', { class: 'btn ghost', href: '#/' }, 'Home')));
    stage.append(card);
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
      if (tag === 'button' && !isOpt && e.target !== check && e.target !== next) return;
      if (inst.done) { next.click(); e.preventDefault(); } else if (!check.disabled) { check.click(); e.preventDefault(); }
    }
  }
  document.addEventListener('keydown', key);
  showNext();
  return root;
}
function startItems(title, items, meta) {
  const view = $('#view'); view.textContent = '';
  view.append(PracticeSession({ title, items, meta, backHref: '#/practice', backLabel: 'Practice' }));
  window.scrollTo(0, 0);
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

function MockTest({ n = 20, minutes = 30, track = 'test' }) {
  const items = buildMock(n, track); const insts = items.map(makeInst);
  const root = h('div', { class: 'session mock' });
  const total = insts.length; let cur = 0; const flagged = new Set(); let secs = minutes * 60, timerOn = true, startTs = Date.now(), finished = false;
  const views = insts.map(i => QView(i, { mode: 'test', onChange: () => { renderNav(); } }));
  const timerEl = h('span', { class: 'timer', role: 'timer', 'aria-label': 'time left' });
  const navEl = h('div', { class: 'mock-nav', role: 'navigation', 'aria-label': 'Questions' });
  const stage = h('div', { class: 'sess-stage' });
  const pauseBtn = h('button', { type: 'button', class: 'btn ghost small', onclick: () => { timerOn = !timerOn; pauseBtn.textContent = timerOn ? '⏸ Pause' : '▶ Resume'; stage.classList.toggle('paused', !timerOn); } }, '⏸ Pause');
  const top = h('div', { class: 'sess-top' }, h('a', { class: 'back', href: track === 'level' ? '#/level' : '#/test', onclick: e => { if (!finished && !confirm('Leave the test? Your answers will be lost.')) e.preventDefault(); } }, '← Leave'),
    h('h1', { class: 'sess-title' }, `${track === 'level' ? 'Level Up checkpoint' : 'Mock test'} · ${total} questions`), h('div', { class: 'sess-stats' }, timerEl, pauseBtn));
  root.append(top, navEl, stage);
  const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const tick = setInterval(() => {
    if (!root.isConnected || finished) { clearInterval(tick); return; }
    if (timerOn) secs--; timerEl.textContent = '⏱ ' + fmt(Math.max(0, secs)); timerEl.classList.toggle('low', secs < 300);
    if (secs <= 0) { clearInterval(tick); toast('Time is up! Grading…'); finish(true); }
  }, 1000);
  timerEl.textContent = '⏱ ' + fmt(secs);

  function renderNav() {
    navEl.textContent = '';
    insts.forEach((inst, i) => {
      const ans = views[i].answered && views[i].answered();
      navEl.append(h('button', { type: 'button', class: 'nav-dot' + (i === cur ? ' cur' : '') + (ans ? ' ans' : '') + (flagged.has(i) ? ' flag' : ''), 'aria-label': `Question ${i + 1}${ans ? ', answered' : ''}${flagged.has(i) ? ', flagged' : ''}`, onclick: () => go(i) }, String(i + 1)));
    });
  }
  function go(i) {
    cur = i; stage.textContent = ''; renderNav();
    const view = views[i]; const inst = insts[i];
    const flag = h('button', { type: 'button', class: 'btn ghost small', onclick: () => { flagged.has(i) ? flagged.delete(i) : flagged.add(i); flag.textContent = flagged.has(i) ? '🚩 Flagged' : '🏳 Flag for review'; renderNav(); } }, flagged.has(i) ? '🚩 Flagged' : '🏳 Flag for review');
    const prev = h('button', { type: 'button', class: 'btn', disabled: i === 0, onclick: () => go(i - 1) }, '← Back');
    const nxt = i === total - 1 ? h('button', { type: 'button', class: 'btn primary', onclick: () => review() }, 'Review & finish') : h('button', { type: 'button', class: 'btn primary', onclick: () => go(i + 1) }, 'Next →');
    const note = ['fix', 'write'].includes(inst.item.kind) ? h('p', { class: 'muted small' }, 'Use ▶ Run to test your code with your own inputs. It will be graded with hidden tests at the end.') : null;
    stage.append(h('div', { class: 'card q-card' }, h('div', { class: 'qnum' }, `Question ${i + 1} of ${total}`), view.el, note, h('div', { class: 'q-actions between' }, prev, flag, nxt)));
    window.scrollTo({ top: 0 });
  }
  function review() {
    stage.textContent = '';
    const un = insts.map((_, i) => i).filter(i => !(views[i].answered && views[i].answered()));
    stage.append(h('div', { class: 'card' }, h('h2', null, 'Ready to hand it in?'),
      un.length ? h('p', null, `You have not answered: ${un.map(i => 'Q' + (i + 1)).join(', ')}.`) : h('p', null, 'You answered every question. 🎉'),
      flagged.size ? h('p', null, `Flagged: ${[...flagged].map(i => 'Q' + (i + 1)).join(', ')}.`) : null,
      h('div', { class: 'q-actions between' }, h('button', { type: 'button', class: 'btn', onclick: () => go(un[0] != null ? un[0] : 0) }, 'Go back and check'), h('button', { type: 'button', class: 'btn primary big', onclick: () => finish(false) }, 'Hand it in'))));
  }
  async function finish(timeUp) {
    if (finished) return; finished = true; clearInterval(tick);
    stage.textContent = ''; stage.append(h('div', { class: 'card' }, h('p', null, 'Grading…')));
    const graded = [];
    for (let i = 0; i < total; i++) {
      const inst = insts[i], view = views[i]; let gr;
      if (!(view.answered && view.answered()) && !['fix', 'write'].includes(inst.item.kind)) gr = { ok: false, skipped: true };
      else if (!(view.answered && view.answered())) gr = { ok: false, skipped: true };
      else gr = await view.grade();
      graded.push({ inst, view, gr });
      Store.record(inst.item.id, gr.ok);
    }
    const right = graded.filter(g => g.gr.ok).length;
    const bySkill = {}; graded.forEach(g => { const s = g.inst.item.skill; bySkill[s] = bySkill[s] || { t: 0, ok: 0 }; bySkill[s].t++; if (g.gr.ok) bySkill[s].ok++; });
    const used = Math.round((Date.now() - startTs) / 1000);
    Store.data.mocks.push({ ts: Date.now(), score: right, total, secs: used, track }); Store.save(); Store.addXp(right * 5);
    const frac = right / total;
    const missed = graded.filter(g => !g.gr.ok).map(g => g.inst.item);
    const verdict = frac >= 0.9 ? 'Test-ready! 🏆' : frac >= 0.75 ? 'Strong. A little polish and you are there. 💪' : frac >= 0.6 ? 'Solid base. Fix the misses below. 🔧' : 'Keep going - every miss below teaches you something. 📘';
    const rev = h('div', { class: 'review-list' });
    for (let i = 0; i < graded.length; i++) {
      const { inst, view, gr } = graded[i]; const it = inst.item;
      const d = h('details', { class: 'rev ' + (gr.ok ? 'ok' : 'no'), open: !gr.ok }, h('summary', null, h('span', { class: 'rev-n' }, (gr.ok ? '✔ ' : gr.skipped ? '— ' : '✘ ') + 'Q' + (i + 1)), h('span', { class: 'chip' }, KIND_LABEL[it.kind]), h('span', { class: 'rev-t' }, (it.code || it.expr || it.prompt || it.q || '').split('\n')[0].slice(0, 70))));
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
      h('div', { class: 'sum-top' }, ring(frac, 150, 'score'), h('div', null, h('h2', null, verdict), h('p', { class: 'muted' }, `${right} of ${total} correct · time used ${fmt(used)}${timeUp ? ' (time ran out)' : ''}`))),
      h('h3', null, 'By skill'),
      h('div', { class: 'skill-rows' }, Object.entries(bySkill).map(([s, v]) => h('div', { class: 'skill-row' }, h('span', null, SKILL_NAMES[s] || s), bar(v.ok / v.t, v.ok / v.t < .6 ? 'warn' : ''), h('b', null, `${v.ok}/${v.t}`)))),
      h('div', { class: 'sum-actions' }, missed.length ? h('button', { type: 'button', class: 'btn primary', onclick: () => startItems('Fix my test misses', missed, { kind: 'retry' }) }, `Practice the ${missed.length} I missed`) : null,
        h('a', { class: 'btn', href: track === 'level' ? '#/level' : '#/test' }, 'Another test'), h('a', { class: 'btn ghost', href: '#/' }, 'Home'))),
      h('h3', { class: 'rev-h' }, 'Question by question'), rev);
    window.scrollTo({ top: 0 });
  }
  go(0);
  return root;
}
