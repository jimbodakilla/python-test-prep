/* runner: code editor + terminal + variable boxes (Run / Step / Stop) */
'use strict';

function Editor({ code = '', readonly = false, minLines = 3, label = 'Python code', symbols = true, onInput } = {}) {
  const ta = h('textarea', { class: 'ed-ta', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off',
    'aria-label': label, wrap: 'off', readonly: readonly || false });
  ta.value = code;
  const pre = h('pre', { class: 'ed-hl', 'aria-hidden': 'true' });
  const gut = h('div', { class: 'ed-gutter', 'aria-hidden': 'true' });
  const inner = h('div', { class: 'ed-inner' }, pre, ta);
  const scroller = h('div', { class: 'ed-scroll' }, inner);
  const root = h('div', { class: 'editor' + (readonly ? ' ro' : '') }, h('div', { class: 'ed-body' }, gut, scroller));
  const state = { err: 0, cur: 0 };
  function sync() {
    const v = ta.value.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    if (v !== ta.value) { const p = ta.selectionStart; ta.value = v; ta.setSelectionRange(p, p); }
    const lines = Math.max(minLines, v.split('\n').length);
    pre.innerHTML = highlight(v, state.err, state.cur) + '\n ';
    gut.innerHTML = Array.from({ length: lines }, (_, i) => `<span class="${i + 1 === state.err ? 'g-err' : i + 1 === state.cur ? 'g-cur' : ''}">${i + 1 === state.cur ? '▶' : i + 1}</span>`).join('');
    ta.style.height = pre.offsetHeight + 'px';
    inner.style.minHeight = (lines * 1.6) + 'em';
  }
  ta.addEventListener('input', () => { state.err = 0; sync(); onInput && onInput(ta.value); });
  let escTab = false;
  ta.addEventListener('blur', () => { escTab = false; });
  const edit = (s, e, text, selStart, selEnd) => { ta.setRangeText(text, s, e, 'preserve'); ta.setSelectionRange(selStart, selEnd); ta.dispatchEvent(new Event('input')); };
  ta.addEventListener('keydown', e => {
    if (readonly) return;
    const v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { root.dispatchEvent(new CustomEvent('runkey', { bubbles: true })); e.preventDefault(); return; }
    if (e.key === 'Escape') { escTab = true; return; }
    if (e.key === 'Tab' && !escTab) {
      e.preventDefault();
      if (s !== en && v.slice(s, en).includes('\n')) {                      // indent / dedent several lines
        const ls = v.lastIndexOf('\n', s - 1) + 1; const block = v.slice(ls, en);
        const out = e.shiftKey ? block.replace(/^( {1,4})/gm, '') : block.replace(/^/gm, '    ');
        edit(ls, en, out, ls, ls + out.length); return;
      }
      if (e.shiftKey) {                                                       // dedent current line
        const ls = v.lastIndexOf('\n', s - 1) + 1; const m = /^ {1,4}/.exec(v.slice(ls));
        if (m) edit(ls, ls + m[0].length, '', Math.max(ls, s - m[0].length), Math.max(ls, s - m[0].length)); return;
      }
      edit(s, en, '    ', s + 4, s + 4); return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {                 // keep indentation; add 4 after a colon
      const ls = v.lastIndexOf('\n', s - 1) + 1; const before = v.slice(ls, s);
      const indent = (/^ */.exec(before) || [''])[0]; const code = before.replace(/#.*$/, '').trimEnd();
      const extra = code.endsWith(':') ? '    ' : '';
      if (indent || extra) { e.preventDefault(); const ins = '\n' + indent + extra; edit(s, en, ins, s + ins.length, s + ins.length); }
      return;
    }
    if (e.key === 'Backspace' && s === en && s > 0) {                          // delete a whole indent step
      const ls = v.lastIndexOf('\n', s - 1) + 1; const before = v.slice(ls, s);
      if (/^ +$/.test(before) && before.length % 4 === 0) { e.preventDefault(); edit(s - 4, s, '', s - 4, s - 4); }
    }
  });
  let bar = null;
  if (symbols && !readonly) {
    const keys = ['"', "'", '(', ')', ':', '[', ']', ',', '+', '-', '*', '/', '%', '=', '<', '>', '!', '.', '#', '⇥'];
    bar = h('div', { class: 'symbar', role: 'toolbar', 'aria-label': 'Symbol keys' },
      h('span', { class: 'symlabel' }, 'Symbols'),
      keys.map(k => h('button', { type: 'button', class: 'symkey', 'aria-label': k === '⇥' ? 'insert indent' : 'insert ' + k, onmousedown: e => e.preventDefault(), onclick: () => {
        ta.focus(); const s = ta.selectionStart, e2 = ta.selectionEnd;
        ta.setRangeText(k === '⇥' ? '    ' : k, s, e2, 'end'); ta.dispatchEvent(new Event('input')); } }, k)));
    root.append(bar);
  }
  const api = {
    el: root, ta,
    get value() { return ta.value; },
    set value(v) { ta.value = v; state.err = 0; state.cur = 0; sync(); },
    markError(n) { if (state.err === (n || 0)) return; state.err = n || 0; sync(); },
    markCurrent(n) { if (state.cur === (n || 0)) return; state.cur = n || 0; sync(); },
    focus() { ta.focus(); }, sync,
  };
  // lay out once attached (needs fonts/metrics)
  requestAnimationFrame(() => { sync(); setTimeout(sync, 60); });
  return api;
}

/* ---------- terminal with a real waiting input() ---------- */
function Terminal() {
  const root = h('div', { class: 'term', role: 'log', 'aria-live': 'polite', 'aria-label': 'Program output', tabindex: '0' });
  const empty = h('span', { class: 'term-empty' }, 'Output will appear here. Press Run ▶');
  root.append(empty);
  let pendingInput = null;
  const api = {
    el: root,
    clear() { root.textContent = ''; pendingInput = null; },
    placeholder() { root.textContent = ''; root.append(empty); },
    write(s) { empty.remove(); root.append(document.createTextNode(s)); root.scrollTop = root.scrollHeight; },
    ask(prompt, suggestion, onStopCleanup) {
      empty.remove();
      if (prompt) root.append(document.createTextNode(prompt));
      return new Promise((resolve, reject) => {
        const inp = h('input', { class: 'term-in', type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
          'aria-label': 'Type your answer for input() and press Enter', placeholder: suggestion != null ? '' : 'type here, press Enter', size: 14 });
        if (suggestion != null) inp.value = suggestion;
        const go = h('button', { type: 'button', class: 'term-go', 'aria-label': 'Submit answer' }, '↵');
        const submit = () => {
          const v = inp.value; inp.replaceWith(h('span', { class: 'term-typed' }, v)); go.remove();
          root.append(document.createTextNode('\n')); pendingInput = null; resolve(v);
        };
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
        go.addEventListener('click', submit);
        root.append(inp, go); pendingInput = { reject, inp, go };
        setTimeout(() => { inp.focus({ preventScroll: false }); inp.select(); }, 0);
        root.scrollTop = root.scrollHeight;
      });
    },
    cancelInput() {
      if (pendingInput) { const p = pendingInput; pendingInput = null; p.inp.replaceWith(h('span', { class: 'term-typed muted' }, '⏹')); p.go.remove(); p.reject(new Error('__STOPPED__')); }
    },
    error(err, code, vars) {
      const ex = explainError(err, vars, code);
      root.append(h('div', { class: 'term-err' }, h('pre', null, tracebackText(err, code))));
      root.scrollTop = root.scrollHeight; return ex;
    },
  };
  return api;
}

/* ---------- variable boxes ---------- */
function VarsPanel() {
  const root = h('div', { class: 'vars', 'aria-label': 'Variables in memory' });
  let prev = new Map();
  function show(vars) {
    root.textContent = '';
    root.append(h('div', { class: 'vars-title' }, 'Variables in memory' + (vars.frame ? ' · inside ' + vars.frame : '')));
    if (!vars.length) { root.append(h('div', { class: 'vars-empty' }, 'No variables yet. A line like ', h('code', null, 'x = 5'), ' makes one.')); prev = new Map(); return; }
    const next = new Map();
    for (const v of vars) {
      const shown = v.repr; next.set(v.name, shown);
      const changed = !prev.has(v.name) || prev.get(v.name) !== shown;
      if (v.cells) {
        root.append(h('div', { class: 'var var-list' + (changed ? ' var-new' : ''), title: v.name + ' = ' + shown },
          h('div', { class: 'var-head' }, h('span', { class: 'var-name' }, v.name), h('span', { class: 'var-eq' }, '='), typeBadge('list'), h('span', { class: 'muted small' }, v.cells.length + (v.cells.length === 1 ? ' item' : ' items'))),
          v.cells.length ? h('div', { class: 'cells', role: 'list', 'aria-label': v.name + ' list' }, v.cells.map((c, i) => h('div', { class: 'cell', role: 'listitem' }, h('span', { class: 'cell-i' }, String(i)), h('span', { class: 'cell-v v-' + c.type }, c.repr)))) : h('div', { class: 'muted small' }, 'empty list [ ]')));
        continue;
      }
      root.append(h('div', { class: 'var' + (changed ? ' var-new' : ''), title: v.name + ' = ' + shown },
        h('span', { class: 'var-name' }, v.name), h('span', { class: 'var-eq' }, '='),
        h('span', { class: 'var-val v-' + v.type }, shown), typeBadge(v.type)));
    }
    prev = next;
  }
  show([]);
  return { el: root, show, reset() { prev = new Map(); show([]); } };
}

/* ---------- the whole playground ---------- */
function Playground({ code = '', stdin = [], note = '', minLines = 3, showVars = true, readonly = false, compact = false, symbols = true, id } = {}) {
  const ed = Editor({ code, readonly, minLines, symbols });
  const term = Terminal();
  const vars = showVars ? VarsPanel() : null;
  const original = code; let suggestions = stdin.slice();
  let ctl = null;
  const status = h('div', { class: 'run-status', role: 'status' });
  const btnRun = h('button', { type: 'button', class: 'btn primary', onclick: () => start('run') }, '▶ Run');
  const btnStep = h('button', { type: 'button', class: 'btn', onclick: () => stepClick(), title: 'Run one line at a time and watch the variables' }, '⏭ Step');
  const btnStop = h('button', { type: 'button', class: 'btn ghost', onclick: () => stop(false), disabled: true }, '⏹ Stop');
  const btnReset = h('button', { type: 'button', class: 'btn ghost', onclick: () => { stop(true); ed.value = original; term.placeholder(); vars && vars.reset(); status.textContent = ''; explain.textContent = ''; } }, '↺ Reset');
  const explain = h('div', { class: 'explain', 'aria-live': 'polite' });
  const tools = h('div', { class: 'toolbar' }, btnRun, btnStep, btnStop, !readonly && original !== '' ? btnReset : null, status);
  const left = h('div', { class: 'pg-left' }, ed.el, tools);
  const right = h('div', { class: 'pg-right' }, term.el, vars && vars.el);
  const root = h('div', { class: 'playground' + (compact ? ' compact' : ''), dataset: { pg: id || '' } }, note ? h('p', { class: 'pg-note', html: note }) : null, h('div', { class: 'pg-grid' }, left, right), explain);
  root.addEventListener('runkey', () => start('run'));

  function setRunning(on) { btnStop.disabled = !on; btnRun.disabled = false; }
  function stop(silent) {
    if (!ctl) return;
    ctl.stopped = true;
    if (ctl.wait) { ctl.wait.reject(new Error('__STOPPED__')); ctl.wait = null; }
    term.cancelInput(); ed.markCurrent(0); setRunning(false);
    if (!silent) status.textContent = 'Stopped.';
    ctl = null;
  }
  function stepClick() {
    if (ctl && ctl.wait) { const w = ctl.wait; ctl.wait = null; w.resolve(); }
    else if (!ctl) start('step');
  }
  async function start(mode) {
    if (ctl && ctl.mode === 'step' && ctl.wait && mode === 'run') { ctl.mode = 'run'; const w = ctl.wait; ctl.wait = null; w.resolve(); return; }
    stop(true);
    const my = ctl = { mode, stopped: false, wait: null };
    term.clear(); explain.textContent = ''; explain.className = 'explain'; ed.markError(0); ed.markCurrent(0); status.textContent = mode === 'step' ? 'Stepping - press Step ⏭ for the next line' : '';
    suggestions = stdin.slice(); setRunning(true);
    btnStep.textContent = '⏭ Next line';
    const src = ed.value;
    const io = {
      limit: 1500000, shouldStop: () => my.stopped,
      write: s => { if (!my.stopped) term.write(s); },
      input: async p => { if (my.stopped) throw new Error('__STOPPED__'); return term.ask(p, suggestions.length ? suggestions.shift() : null); },
      step: async (line, snap) => {
        if (my.stopped) throw new Error('__STOPPED__');
        if (line === null) { vars && vars.show(snap()); ed.markCurrent(0); return; }
        if (my.mode !== 'step') { const now = performance.now(); if (vars && now - (my.lastVars || 0) > 150) { vars.show(snap()); my.lastVars = now; } ed.markCurrent(0); return; }
        vars && vars.show(snap());
        if (my.mode === 'step') {
          ed.markCurrent(line);
          await new Promise((resolve, reject) => { my.wait = { resolve, reject }; });
          if (my.stopped) throw new Error('__STOPPED__');
        } else ed.markCurrent(0);
      },
    };
    let res;
    try { res = await PF.run(src, io); } catch (e) { res = { ok: false, stopped: true, vars: [] }; }
    if (my.stopped || res.stopped) { btnStep.textContent = '⏭ Step'; return; }
    ctl = null; setRunning(false); ed.markCurrent(0); btnStep.textContent = '⏭ Step';
    vars && vars.show(res.vars);
    if (res.error) {
      ed.markError(res.error.line);
      const ex = term.error(res.error, src, res.vars);
      status.textContent = (res.error.type === 'TimeLimit' ? '⏱ Stopped: too long' : '💥 Crashed') + ' on line ' + res.error.line;
      explain.className = 'explain show';
      explain.innerHTML = `<div class="ex-h">${res.error.type === 'TimeLimit' ? '⏱ Stuck in a loop?' : '💥 ' + esc(res.error.type === 'NotInCourse' ? 'Not part of this course' : res.error.type)} <span>line ${res.error.line}</span></div><p><b>What it means:</b> ${ex.what}</p><p><b>How to fix it:</b> ${ex.fix}</p>`;
    } else status.textContent = '✔ Finished with no errors';
    root.dispatchEvent(new CustomEvent('pgdone', { bubbles: true, detail: { res } }));
  }
  return { el: root, ed, term, start, stop, getCode: () => ed.value, setCode: v => { ed.value = v; } };
}
