/* sprints: generated questions (answers come from the interpreter that was fuzz-tested against CPython) */
'use strict';

const NAMES = ['Ana', 'Leo', 'Mia', 'Sam', 'Zoe', 'Kai', 'Eli', 'Ava'];
const WORDS = ['cat', 'dog', 'sun', 'hi', 'go', 'pie', 'map', 'owl'];
const CLEAN_F = [0.5, 1.5, 2.5, 3.5, 4.5, 0.25, 0.75, 7.5, 1.25];
let genCounter = 0;

async function typeOf(expr, setup, stdin) {
  const code = (setup ? setup + '\n' : '') + '__v = (' + expr + ')';
  const q = (stdin || []).slice();
  const res = await PF.run(code, { write() {}, input: async () => q.length ? q.shift() : null });
  if (res.error) return 'Error';
  const v = res.vars.find(x => x.name === '__v'); return v.type;
}
function whyType(expr, ans) {
  if (ans === 'Error') {
    if (/int\("[^"]*\.[^"]*"\)/.test(expr)) return 'int() cannot read text with a decimal point (ValueError).';
    if (/(int|float)\("[a-z]+"\)/.test(expr)) return 'A word is not a number, so converting crashes (ValueError).';
    if (/"[^"]*"\s*\*\s*"/.test(expr)) return 'You cannot multiply text by text.';
    return 'Text and numbers cannot be mixed with + (TypeError).';
  }
  if (ans === 'float') {
    if (/ \/ /.test(expr)) return '/ ALWAYS gives a float, even when it divides evenly.';
    if (/float\(/.test(expr)) return 'float() makes a float.';
    return 'A float is in the math (a number with a decimal point), so the answer is a float.';
  }
  if (ans === 'str') {
    if (/input\(\)/.test(expr) || /^x/.test(expr)) return 'input() always gives text (str), so it stays text unless you convert it.';
    return 'Quotes mean text (str). Text + text glues, text * number repeats - still text.';
  }
  return 'Whole numbers together (and int() results) stay int.';
}
async function genTypeQuestion() {
  const a = randInt(2, 19), b = randInt(2, 9), f = pick(CLEAN_F), f2 = pick(CLEAN_F), w = pick(WORDS), w2 = pick(WORDS);
  const T = [
    [() => `${a} + ${b}`], [() => `${a} - ${b}`], [() => `${a} * ${b}`], [() => `${a} / ${b}`], [() => `${a * b} / ${b}`], [() => `${a} + ${f}`], [() => `${f} * ${b}`], [() => `${f} + ${f2}`],
    [() => `"${a}" + "${b}"`], [() => `"${a}" * ${b}`], [() => `${b} * "${a}"`], [() => `"${a}" + ${b}`], [() => `${a} + "${b}"`], [() => `"${a}" * "${b}"`], [() => `"${w}" + "${w2}"`],
    [() => `int("${a}") + ${b}`], [() => `int("${a}") + int("${b}")`], [() => `float("${a}") + ${b}`], [() => `float("${a}")`], [() => `int(${f})`], [() => `float(${a})`],
    [() => `int("${f}")`], [() => `float("${f}")`], [() => `int("${w}")`], [() => `int("${a}") / int("${b}")`], [() => `"${a}"`], [() => `${f}`], [() => `${a}.0`], [() => `${a}`],
    [() => `x`, 'x = input()', [String(a)]], [() => `x + 1`, 'x = input()', [String(a)]], [() => `x + x`, 'x = input()', [String(a)]], [() => `x * 2`, 'x = input()', [String(a)]],
    [() => `int(x) + 1`, 'x = input()', [String(a)]], [() => `float(x)`, 'x = input()', [String(a)]], [() => `int(x) / 2`, 'x = input()', [String(a)]], [() => `x`, 'x = int(input())', [String(a)]],
    [() => `x`, 'x = float(input())', [String(a)]], [() => `x * 2`, 'x = float(input())', [String(a)]], [() => `x + y`, 'x = int(input())\ny = float(input())', [String(a), String(f)]],
    [() => `int(x)`, 'x = input()', [String(f)]],
  ];
  const [fn, setup, stdin] = pick(T);
  const expr = fn(); const ans = await typeOf(expr, setup, stdin);
  return { expr, setup: setup || '', stdin: stdin || [], answer: ans, why: whyType(expr, ans) };
}

/* ---- Type Sprint: 60 seconds ---- */
async function TypeSprint() {
  const root = h('div', { class: 'session sprint' });
  const batch = []; for (let i = 0; i < 70; i++) batch.push(await genTypeQuestion());
  let idx = 0, score = 0, tried = 0, streak = 0, best = 0, secs = 60, over = false, locked = false;
  const missed = [];
  const timerEl = h('span', { class: 'timer' }, '⏱ 60'), scoreEl = h('span', { class: 'stat' }, '✅ 0'), streakEl = h('span', { class: 'stat' }, '🔥 0');
  const stage = h('div', { class: 'sess-stage' });
  root.append(h('div', { class: 'sess-top' }, h('a', { class: 'back', href: '#/practice' }, '← Practice'), h('h1', { class: 'sess-title' }, 'Type Sprint · 60 seconds'), h('div', { class: 'sess-stats' }, scoreEl, streakEl, timerEl)), stage);
  const intro = h('div', { class: 'card center' }, h('h2', null, '⚡ Type Sprint'), h('p', null, 'You get an expression. Tap what TYPE it gives: ', typeBadge('int'), ' ', typeBadge('float'), ' ', typeBadge('str'), ' or 💥 Error.'),
    h('p', { class: 'muted' }, 'Keys 1-4 work. Wrong answers show why. How many can you get in 60 seconds?'),
    Store.data.best.type ? h('p', null, 'Your best: ', h('b', null, Store.data.best.type)) : null,
    h('button', { type: 'button', class: 'btn primary big', onclick: begin }, 'Start the clock'));
  stage.append(intro);
  let tick;
  function begin() {
    tick = setInterval(() => { if (!root.isConnected) { clearInterval(tick); return; } secs--; timerEl.textContent = '⏱ ' + secs; timerEl.classList.toggle('low', secs <= 10); if (secs <= 0) end(); }, 1000);
    document.addEventListener('keydown', key); show();
  }
  function key(e) { if (!root.isConnected) { document.removeEventListener('keydown', key); return; } if (over || locked) return; const i = '1234'.indexOf(e.key); if (i >= 0) answer(TYPE_OPTS[i]); }
  function show() {
    stage.textContent = ''; locked = false;
    const q = batch[idx % batch.length];
    const code = (q.setup ? q.setup + '\n' : '') + 'result = ' + q.expr;
    const fb = h('div', { class: 'sprint-fb', 'aria-live': 'polite' });
    const opts = h('div', { class: 'opts opts-ty' }, TYPE_OPTS.map((t, i) => h('button', { type: 'button', class: 'opt ty-' + t, onclick: () => answer(t) }, h('span', { class: 'opt-n' }, String(i + 1)), h('span', { class: 'opt-t' }, t === 'Error' ? '💥 Error' : t))));
    stage.append(h('div', { class: 'card q-card' }, h('div', { class: 'q-prompt' }, 'What type is result?'), codeBlock(code), stdinNote(q.stdin), opts, fb));
    show.fb = fb; show.opts = opts;
  }
  async function answer(t) {
    if (locked || over) return; locked = true; const q = batch[idx % batch.length]; tried++;
    const ok = t === q.answer;
    $$('button', show.opts).forEach(b => { b.disabled = true; const bt = b.querySelector('.opt-t').textContent.replace('💥 ', ''); b.classList.add(bt === q.answer ? 'good' : (bt === t ? 'bad' : 'dim')); });
    if (ok) { score++; streak++; best = Math.max(best, streak); show.fb.textContent = '✔ ' + (streak >= 5 ? 'On fire!' : 'Yes'); scoreEl.textContent = '✅ ' + score; streakEl.textContent = '🔥 ' + streak; }
    else { streak = 0; streakEl.textContent = '🔥 0'; missed.push(q); show.fb.innerHTML = '✘ It is <b>' + esc(q.answer) + '</b>. ' + esc(q.why); }
    idx++; setTimeout(() => { if (!over && root.isConnected) show(); }, ok ? 450 : 1900);
  }
  function end() {
    over = true; clearInterval(tick);
    const prevBest = Store.data.best.type || 0; const isBest = score > prevBest; if (isBest) Store.data.best.type = score; Store.addXp(score * 2);
    stage.textContent = '';
    const uniq = []; for (const m of missed) if (!uniq.find(x => x.expr === m.expr)) uniq.push(m);
    stage.append(h('div', { class: 'card summary' }, h('div', { class: 'sum-top' }, ring(tried ? score / tried : 0, 130, 'accuracy'), h('div', null, h('h2', null, `${score} correct in 60 seconds`), h('p', { class: 'muted' }, `${tried} answered · best streak ${best} 🔥${isBest ? ' · 🎉 NEW BEST!' : ''}`))),
      uniq.length ? h('div', null, h('h3', null, 'Review your misses'), uniq.slice(0, 8).map(m => h('div', { class: 'missed-item col' }, codeBlock((m.setup ? m.setup + '\n' : '') + 'result = ' + m.expr, { compact: true }), h('div', null, h('b', null, 'Answer: '), typeBadge(m.answer === 'Error' ? 'err' : m.answer), ' ', m.why)))) : null,
      h('div', { class: 'sum-actions' }, h('a', { class: 'btn primary', href: '#/sprint/type', onclick: () => setTimeout(route, 0) }, 'Play again'), h('a', { class: 'btn', href: '#/practice' }, '← Practice'))));
    Store.data.sessions.push({ ts: Date.now(), kind: 'type', score, total: tried }); Store.save();
  }
  return root;
}

/* ---- Output generator ---- */
const OUT_GENS = [
  () => { const a = randInt(2, 30), b = randInt(2, 30), op = pick(['+', '-', '*']); return { stdin: [a, b], code: `a = int(input())\nb = int(input())\nprint(a ${op} b)`, skill: 'convert', why: 'int() makes both typed answers real numbers, so ' + op + ' does real math.' }; },
  () => { const a = randInt(2, 30), b = randInt(2, 30); return { stdin: [a, b], code: `a = input()\nb = input()\nprint(a + b)`, skill: 'input', why: 'No int(), so these are TEXT. Text + text glues them together.' }; },
  () => { const a = randInt(2, 9), k = randInt(2, 4); return { stdin: [a], code: `x = input()\nprint(x * ${k})`, skill: 'input', why: 'x is text, and text times a whole number REPEATS it.' }; },
  () => { const x = pick([2.5, 3, 4.5, 10, 0.5, 7]), k = randInt(2, 6); return { stdin: [x], code: `x = float(input())\nprint(x * ${k})`, skill: 'convert', why: 'float() makes a float, and a float answer always shows a decimal point.' }; },
  () => { const b = pick([2, 4, 5]), a = b * randInt(2, 9); return { stdin: [a, b], code: `a = int(input())\nb = int(input())\nprint(a / b)`, skill: 'math', why: '/ ALWAYS gives a float, even when it divides evenly.' }; },
  () => { const n = randInt(5, 60); return { stdin: [n], code: `n = int(input())\nprint("Next:", n + 1)`, skill: 'join', why: 'The comma adds a space; n + 1 is calculated first.' }; },
  () => { const x = pick([2.5, 3.9, 7.5, 9.99, 4.1, 1.75]); return { stdin: [x], code: `x = float(input())\nprint(int(x))`, skill: 'convert', why: 'int() chops off the decimals. It does not round.' }; },
  () => { const a = randInt(2, 12); return { stdin: [a], code: `a = int(input())\nprint(a + 2 * 3)`, skill: 'math', why: 'Multiply first (2 * 3 = 6), then add a.' }; },
  () => { const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 5); return { stdin: [], code: `x = ${a}\nx = x + ${b}\nx = x * ${c}\nprint(x)`, skill: 'math', why: 'Each line replaces x with a new value, top to bottom.' }; },
  () => { const a = randInt(2, 12), b = randInt(2, 12); return { stdin: [], code: `a = ${a}\nb = ${b}\nprint(a, "+", b, "=", a + b)`, skill: 'join', why: 'Every comma adds one space; a + b is worked out first.' }; },
  () => { const f = pick(NAMES), l = pick(NAMES.filter(n => n !== f)); return { stdin: [f, l], code: `first = input()\nlast = input()\nprint(first + " " + last)`, skill: 'input', why: 'Text glued with + - the only space is the one we typed in quotes.' }; },
  () => { const a = randInt(2, 9), b = randInt(2, 9); return { stdin: [a, b], code: `a = int(input())\nb = int(input())\nprint(a, b, a * b)`, skill: 'convert', why: 'Three values separated by spaces: a, b, and a * b.' }; },
  () => { const a = pick([1.5, 2.5, 0.5, 4.5]), b = randInt(2, 9); return { stdin: [a, b], code: `a = float(input())\nb = int(input())\nprint(a + b)`, skill: 'convert', why: 'float + int = float.' }; },
  () => { const f = pick(NAMES), a = randInt(8, 14); return { stdin: [f, a], code: `name = input()\nage = int(input())\nprint(name, "is", age, "and next year", age + 1)`, skill: 'programs', why: 'name is text, age is a number; commas let you print both.' }; },
  () => { const c = pick([0, 100, 20, 10, 40]); return { stdin: [c], code: `c = float(input())\nprint(c * 9 / 5 + 32)`, skill: 'programs', why: 'Follow the formula; the answer is a float so it ends in .0 when whole.' }; },
  () => { const a = pick(WORDS); return { stdin: [a], code: `w = input()\nprint(w + w)`, skill: 'input', why: 'Text + text = glued copies.' }; },
];
async function genOutputItem() {
  const g = pick(OUT_GENS)(); const stdin = g.stdin.map(String);
  const { out, res } = await silentRun(g.code, stdin);
  if (res.error) return genOutputItem();
  return { id: 'g' + (++genCounter), unit: 0, kind: 'typed', skill: g.skill, level: 2, code: g.code, stdin, answer: norm(out), why: g.why, generated: true };
}
async function genTypeItem() {
  const q = await genTypeQuestion();
  return { id: 'g' + (++genCounter), unit: 0, kind: 'ty', skill: 'types', level: 1, expr: q.expr, setup: q.setup, stdin: q.stdin, answer: q.answer, why: q.why, generated: true };
}
async function EndlessSession(n = 12) {
  const items = [];
  for (let i = 0; i < n; i++) items.push(i % 3 === 2 ? await genTypeItem() : await genOutputItem());
  return PracticeSession({ title: 'Endless practice · brand new questions', items, meta: { kind: 'endless' }, backHref: '#/practice', backLabel: 'Practice' });
}
