/* views: home, learn, lesson, practice hub, test hub, playground, cheat sheet */
'use strict';

/* ---------- the 2-day plan ---------- */
function unitPassed(u) {
  return Store.data.sessions.some(s => s.unit === u && s.kind === 'unit' && s.total >= 8 && s.score / s.total >= 0.8);
}
const lessonDone = n => !!(Store.data.lessons[n] && Store.data.lessons[n].done);
function PLAN() {
  const T = (id, label, mins, href, done) => ({ id, label, mins, href, done });
  return [
    { day: 'Day 1', sub: 'Build the foundation', tasks: [
      T('l1', 'Lesson 1 · print()', 20, '#/learn/1', () => lessonDone(1)), T('d1', 'Drill: print() (aim for 80%)', 15, '#/drill/1', () => unitPassed(1)),
      T('l2', 'Lesson 2 · Variables & math', 25, '#/learn/2', () => lessonDone(2)), T('d2', 'Drill: variables & math', 15, '#/drill/2', () => unitPassed(2)),
      T('l3', 'Lesson 3 · input()', 20, '#/learn/3', () => lessonDone(3)), T('d3', 'Drill: input()', 15, '#/drill/3', () => unitPassed(3)),
      T('sp1', 'One Type Sprint', 3, '#/sprint/type', () => Store.data.sessions.some(s => s.kind === 'type')),
    ] },
    { day: 'Day 2', sub: 'The part that decides your grade', tasks: [
      T('l4', 'Lesson 4 · int() and float()', 30, '#/learn/4', () => lessonDone(4)), T('d4', 'Drill: int() & float()', 20, '#/drill/4', () => unitPassed(4)),
      T('l5', 'Lesson 5 · Types & errors', 25, '#/learn/5', () => lessonDone(5)), T('d5', 'Drill: types & errors', 15, '#/drill/5', () => unitPassed(5)),
      T('l6', 'Lesson 6 · Whole programs', 30, '#/learn/6', () => lessonDone(6)), T('d6', 'Drill: whole programs', 20, '#/drill/6', () => unitPassed(6)),
      T('weak', 'Weak-spot rescue', 15, '#/weak', () => Store.data.sessions.some(s => s.kind === 'weak')),
      T('mock', 'Mock test (score 75% or more)', 30, '#/test', () => Store.data.mocks.some(m => m.total >= 10 && m.score / m.total >= .75)),
      T('cheat', 'Read the cheat sheet before bed', 5, '#/cheat', () => !!Store.data.visited.cheat),
    ] },
  ];
}
function nextStep() {
  for (const d of PLAN()) for (const t of d.tasks) if (!t.done()) return t;
  return { label: 'Take another mock test', href: '#/test', mins: 30 };
}

/* ---------- HOME ---------- */
function HomeView() {
  const st = skillStats(); const ready = overallReadiness(); const plan = PLAN(); const nxt = nextStep();
  const doneCount = plan.flatMap(d => d.tasks).filter(t => t.done()).length, totalTasks = plan.flatMap(d => d.tasks).length;
  const first = !Object.keys(Store.data.items).length && !Object.keys(Store.data.lessons).length;
  const weak = CORE_SKILLS.filter(s => st[s].tried > 0).sort((a, b) => st[a].mastery - st[b].mastery).filter(s => st[s].mastery < .75).slice(0, 3);
  const root = h('div', { class: 'home' });
  root.append(h('section', { class: 'hero card' },
    h('div', { class: 'hero-text' },
      h('p', { class: 'eyebrow' }, 'Python test prep · 6th grade'),
      h('h1', null, first ? 'Get test-ready in 2 days.' : (ready >= .8 ? 'You are nearly test-ready. 🏆' : 'Keep going. Every question counts.')),
      h('p', { class: 'lead' }, 'Everything on the test is built from four commands: ', h('code', null, 'print'), ' ', h('code', null, 'input'), ' ', h('code', null, 'int'), ' ', h('code', null, 'float'), '. This site teaches them, then makes you use them until it is automatic.'),
      h('div', { class: 'hero-cta' }, h('a', { class: 'btn primary big', href: nxt.href }, (first ? 'Start with ' : 'Continue: ') + nxt.label), h('a', { class: 'btn big', href: '#/play' }, 'Open the playground'))),
    h('div', { class: 'hero-ring' }, ring(ready, 150, 'test-ready'), h('div', { class: 'muted small center' }, `${doneCount}/${totalTasks} plan steps · ⭐ ${Store.data.xp} XP`))));
  // skills
  root.append(h('section', { class: 'card' }, h('div', { class: 'sec-h' }, h('h2', null, 'Your skills'), weak.length ? h('a', { class: 'btn small primary', href: '#/weak' }, '🎯 Fix my weak spots') : h('a', { class: 'btn small', href: '#/weak' }, 'Weak-spot practice')),
    h('p', { class: 'muted' }, 'A skill hits 100% after about 12 correct answers in it. Answers you get wrong go down again, so this is honest.'),
    h('div', { class: 'skill-rows big' }, CORE_SKILLS.map(s => h('a', { class: 'skill-row link', href: '#/skill/' + s, title: 'Practice this skill' }, h('span', null, SKILL_NAMES[s]), bar(st[s].mastery, st[s].mastery >= .8 ? 'good' : st[s].tried && st[s].mastery < .5 ? 'warn' : ''), h('b', null, pct(st[s].mastery) + '%'))))));
  // plan
  const planEl = h('section', { class: 'card plan' }, h('div', { class: 'sec-h' }, h('h2', null, 'Your 2-day plan'), h('span', { class: 'muted small' }, 'Tap a step. It ticks itself when you finish.')));
  plan.forEach(d => {
    const mins = d.tasks.reduce((a, t) => a + t.mins, 0);
    planEl.append(h('div', { class: 'day' }, h('div', { class: 'day-h' }, h('b', null, d.day), h('span', null, ' · ' + d.sub), h('span', { class: 'muted small' }, ` · about ${Math.round(mins / 6) / 10} h`)),
      h('ul', { class: 'tasks' }, d.tasks.map(t => { const dn = t.done(); return h('li', { class: dn ? 'done' : '' }, h('a', { href: t.href }, h('span', { class: 'tick', 'aria-hidden': 'true' }, dn ? '✔' : ''), h('span', { class: 'tl' }, t.label), h('span', { class: 'tm' }, t.mins + ' min'), dn ? h('span', { class: 'sr-only' }, '(done)') : null)); }))));
  });
  root.append(planEl);
  root.append(h('section', { class: 'card rush' }, h('h2', null, '⚡ Short on time? 30-minute cram'),
    h('ol', null, h('li', null, h('a', { href: '#/cheat' }, 'Read the cheat sheet'), ' (5 min)'), h('li', null, h('a', { href: '#/sprint/type' }, 'Type Sprint'), ' x2 (4 min)'), h('li', null, h('a', { href: '#/mixed' }, 'Mixed practice, 15 questions'), ' (12 min)'), h('li', null, h('a', { href: '#/test/10' }, 'Mini test, 10 questions'), ' (10 min)'))));
  root.append(h('details', { class: 'card faq' }, h('summary', null, 'How do I get the most out of this?'),
    h('ul', null, h('li', null, h('b', null, 'Predict before you run.'), ' In every lesson box, guess the output first, then press Run.'), h('li', null, h('b', null, 'Use Step.'), ' It runs one line at a time and shows each variable and its type.'), h('li', null, h('b', null, 'Love your mistakes.'), ' A wrong answer comes back later in the same practice round.'),
      h('li', null, h('b', null, 'Read the red errors.'), ' The test loves errors. This site explains each one in plain English.'), h('li', null, h('b', null, 'Sleep.'), ' Practice tonight, sleep, take the mock test in the morning.'))));
  root.append(h('div', { class: 'footnote' }, h('button', { type: 'button', class: 'linkbtn', onclick: () => { if (confirm('Erase all your progress on this device?')) { Store.reset(); route(); } } }, 'Reset my progress'),
    h('span', null, ' · Your progress is saved only on this device.')));
  return root;
}

/* ---------- LEARN list ---------- */
function LearnView() {
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Lessons'), h('p', { class: 'muted' }, 'Do them in order. Each one has live code you can run, then a practice drill.')));
  const grid = h('div', { class: 'lessons-grid' });
  D.lessons.forEach(l => {
    const u = unitStats(l.n); const done = lessonDone(l.n);
    grid.append(h('a', { class: 'card lcard' + (done ? ' done' : '') + (l.n === 7 ? ' bonus' : ''), href: '#/learn/' + l.n },
      h('div', { class: 'l-ico', 'aria-hidden': 'true' }, l.emoji), h('div', { class: 'l-body' }, h('div', { class: 'l-n' }, l.n === 7 ? 'Bonus' : 'Lesson ' + l.n, h('span', { class: 'muted' }, ` · ${l.minutes} min`), done ? h('span', { class: 'l-done' }, ' ✔ read') : null),
        h('h3', null, l.title), h('p', { class: 'muted' }, l.goal), h('div', { class: 'l-prog' }, bar(u.mastery, u.mastery >= .8 ? 'good' : ''), h('span', null, `drill ${pct(u.mastery)}%`)))));
  });
  root.append(grid);
  return root;
}

/* ---------- LESSON ---------- */
function LessonView(n) {
  const L = D.lessons.find(x => x.n === n);
  if (!L) return h('div', { class: 'card' }, 'Lesson not found. ', h('a', { href: '#/learn' }, 'Back to lessons'));
  Store.data.visited['l' + n] = 1; Store.save();
  const root = h('article', { class: 'lesson' });
  root.append(h('div', { class: 'crumbs' }, h('a', { href: '#/learn' }, '← Lessons')),
    h('header', { class: 'l-head' }, h('div', { class: 'l-ico big', 'aria-hidden': 'true' }, L.emoji), h('div', null, h('p', { class: 'eyebrow' }, n === 7 ? 'Bonus lesson' : `Lesson ${n} of 6 · ${L.minutes} minutes`), h('h1', null, L.title), h('p', { class: 'lead' }, 'Goal: ' + L.goal))));
  let tryN = 0;
  for (const b of L.blocks) {
    const [type] = b;
    if (type === 'p') root.append(h('p', { html: b[1] }));
    else if (type === 'h') root.append(h('h3', { class: 'l-h3' }, b[1]));
    else if (type === 'rule') root.append(h('div', { class: 'callout rule' }, h('div', { class: 'co-h' }, '✅ ' + b[1]), h('div', { html: b[2] })));
    else if (type === 'trap') root.append(h('div', { class: 'callout trap' }, h('div', { class: 'co-h' }, '⚠ Trap'), h('div', { html: b[1] })));
    else if (type === 'list') root.append(h('ul', { class: 'l-list' }, b[1].map(x => h('li', { html: x }))));
    else if (type === 'table') root.append(h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('thead', null, h('tr', null, b[1].map(c => h('th', null, c)))), h('tbody', null, b[2].map(r => h('tr', null, r.map(c => h('td', { html: c }))))))));
    else if (type === 'pipeline') root.append(h('div', { class: 'pipeline' }, b.slice(1).map((s, i) => [i ? h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→') : null, h('div', { class: 'pstep s' + (i + 1) }, h('b', null, s[0]), h('code', null, s[1]), h('span', null, s[2]))])));
    else if (type === 'try') root.append(h('div', { class: 'try' }, h('div', { class: 'try-h' }, '🧪 Try it'), Playground({ code: b[1], stdin: b[2], note: b[3], id: `l${n}-${++tryN}`, minLines: 3 }).el));
    else if (type === 'show') {
      const [, code, stdin, out, errType] = b;
      const box = h('div', { class: 'show' }, codeBlock(code),
        stdin.length ? h('div', { class: 'show-in' }, '⌨ typed: ', stdin.map(s => h('code', null, s))) : null,
        h('div', { class: 'show-out' }, h('span', { class: 'show-l' }, 'Python prints'), h('pre', null, out === '' && !errType ? '(nothing)' : out), errType ? h('div', { class: 'show-err' }, '💥 then crashes with ' + errType) : null),
        h('button', { type: 'button', class: 'linkbtn small', onclick: () => { try { sessionStorage.setItem('pp.play', JSON.stringify({ code, stdin })); } catch (e) {} location.hash = '#/play'; } }, 'Open in playground ↗'));
      root.append(box);
    } else if (type === 'quick') {
      const [, q, opts, ans, why] = b; const order = shuffle(opts.map((_, i) => i)); let done = false;
      const fb = h('div', { class: 'quick-fb', 'aria-live': 'polite' });
      const wrap = h('div', { class: 'opts' }, order.map((o, k) => h('button', { type: 'button', class: 'opt' + (looksLikeCode(opts[o]) ? ' mono' : ''), onclick: ev => {
        if (done) return; done = true; const good = o === ans; ev.currentTarget.classList.add(good ? 'good' : 'bad');
        if (!good) $$('.opt', wrap)[order.indexOf(ans)].classList.add('good');
        $$('.opt', wrap).forEach(x => x.disabled = true);
        fb.className = 'quick-fb show ' + (good ? 'ok' : 'no'); fb.textContent = (good ? '✅ ' : '❌ ') + why;
      } }, h('span', { class: 'opt-n' }, String(k + 1)), h('span', { class: 'opt-t' }, opts[o]))));
      root.append(h('div', { class: 'quick card' }, h('div', { class: 'quick-h' }, '❓ Quick check'), h('p', { class: 'q-prompt' }, q), wrap, fb));
    }
  }
  // finish
  const can = Store.data.lessons[n] && Store.data.lessons[n].can || [];
  const u = unitStats(n);
  const markBtn = h('button', { type: 'button', class: 'btn' + (lessonDone(n) ? '' : ' primary'), onclick: () => {
    Store.data.lessons[n] = Object.assign(Store.data.lessons[n] || {}, { done: Date.now(), can }); Store.save(); toast('Lesson marked as read ✔'); markBtn.textContent = '✔ Marked as read'; markBtn.classList.remove('primary');
  } }, lessonDone(n) ? '✔ Marked as read' : 'I read it - mark done');
  root.append(h('section', { class: 'card cando' }, h('h2', null, 'Can you say yes to each?'),
    h('ul', { class: 'checks' }, L.cando.map((c, i) => h('li', null, h('label', null, h('input', { type: 'checkbox', checked: !!can[i], onchange: e => { can[i] = e.target.checked; Store.data.lessons[n] = Object.assign(Store.data.lessons[n] || {}, { can }); Store.save(); } }), h('span', null, c))))),
    h('div', { class: 'l-foot' }, markBtn, h('a', { class: 'btn primary big', href: '#/drill/' + n }, `Practice this lesson (${ITEMS.filter(i => i.unit === n).length} questions) →`)),
    n < 7 ? h('p', null, h('a', { href: '#/learn/' + (n + 1) }, 'Next lesson: ' + D.lessons[n].title + ' →')) : null));
  return root;
}

/* ---------- PRACTICE hub ---------- */
function PracticeView() {
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Practice'), h('p', { class: 'muted' }, 'The more you do, the more automatic it gets. Wrong answers return later in the round.')));
  const modes = [
    ['⚡', 'Type Sprint', 'int, float, str or error? 60 seconds, as many as you can.', '#/sprint/type'],
    ['♾️', 'Endless practice', 'Brand-new generated questions every time. Never run out.', '#/endless'],
    ['🎯', 'Weak-spot rescue', 'Built from your misses and your lowest skills.', '#/weak'],
    ['🔀', 'Mixed practice', '15 mixed questions from all lessons.', '#/mixed'],
    ['🐞', 'Bug hunt', 'Broken programs. Find and fix the bug.', '#/kind/fix'],
    ['✍️', 'Code writer', 'Write whole programs. Hidden tests grade them.', '#/kind/write'],
    ['🪤', 'Trap questions', 'The tricky ones: types, errors, input() text.', '#/drill/5'],
    ['📝', 'Mock test', 'Timed, no hints, like the real thing.', '#/test'],
  ];
  root.append(h('div', { class: 'modes' }, modes.map(m => h('a', { class: 'card mode', href: m[3] }, h('div', { class: 'm-ico', 'aria-hidden': 'true' }, m[0]), h('div', null, h('h3', null, m[1]), h('p', { class: 'muted' }, m[2]))))));
  root.append(h('h2', { class: 'sec-t' }, 'Drill by lesson'));
  const grid = h('div', { class: 'unit-grid' });
  D.lessons.forEach(l => { const u = unitStats(l.n); grid.append(h('a', { class: 'card unit' + (l.n === 7 ? ' bonus' : ''), href: '#/drill/' + l.n }, h('div', { class: 'u-top' }, h('span', { class: 'u-emo', 'aria-hidden': 'true' }, l.emoji), h('b', null, l.n === 7 ? 'Bonus' : 'Unit ' + l.n)), h('div', { class: 'u-title' }, l.title.split(' - ')[0]), bar(u.mastery, u.mastery >= .8 ? 'good' : ''), h('span', { class: 'muted small' }, `${u.total} questions · ${pct(u.mastery)}%`))); });
  root.append(grid);
  root.append(h('h2', { class: 'sec-t' }, 'Drill by skill'));
  const st = skillStats();
  root.append(h('div', { class: 'chips' }, CORE_SKILLS.map(s => h('a', { class: 'chip big', href: '#/skill/' + s }, SKILL_NAMES[s] + ' · ' + pct(st[s].mastery) + '%'))));
  return root;
}

/* ---------- TEST hub ---------- */
function TestHubView() {
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Mock test'), h('p', { class: 'muted' }, 'Like the real thing: no hints, no feedback until you hand it in. Questions come from all six lessons and are different each time.')));
  const best = Store.data.mocks.length ? Math.max(...Store.data.mocks.map(m => m.score / m.total)) : null;
  root.append(h('div', { class: 'card' },
    h('div', { class: 'test-opts' },
      h('div', { class: 'to' }, h('h3', null, '📝 Full test'), h('p', { class: 'muted' }, '20 questions · 30 minutes. 6 predict-the-output, 3 types, 2 type-it-in, 2 fill-in, 2 quick checks, 1 find-the-crash, 2 bug hunts, 2 write-the-code.'), h('a', { class: 'btn primary big', href: '#/test/20' }, 'Start full test')),
      h('div', { class: 'to' }, h('h3', null, '⏱ Mini test'), h('p', { class: 'muted' }, '10 questions · 15 minutes. Same mix, half the size.'), h('a', { class: 'btn big', href: '#/test/10' }, 'Start mini test'))),
    best != null ? h('p', { class: 'muted' }, `Tests taken: ${Store.data.mocks.length} · best score ${pct(best)}%`) : null));
  if (Store.data.mocks.length) root.append(h('div', { class: 'card' }, h('h3', null, 'Your scores'), h('div', { class: 'spark' }, Store.data.mocks.slice(-12).map(m => h('div', { class: 'spark-col', title: `${m.score}/${m.total}` }, h('i', { style: `height:${Math.max(6, pct(m.score / m.total))}%` }), h('span', null, pct(m.score / m.total) + '%'))))));
  root.append(h('div', { class: 'card tips' }, h('h3', null, 'Test-taking checklist'), h('ol', null,
    h('li', null, 'Quotes or no quotes? ', h('span', { class: 'muted' }, 'Quotes = text, printed as-is.')), h('li', null, 'Did the number come from input()? ', h('span', { class: 'muted' }, 'Then it is TEXT until int()/float().')),
    h('li', null, 'Does it print with ', h('code', null, '/'), '? ', h('span', { class: 'muted' }, 'Float, ends in .0 when whole.')), h('li', null, 'Text + number? ', h('span', { class: 'muted' }, 'TypeError.')), h('li', null, 'Commas = spaces. + = no spaces.'))));
  return root;
}

/* ---------- PLAYGROUND ---------- */
const EXAMPLES = [
  ['Hello world', 'print("Hello, world!")', []],
  ['Add two numbers', 'a = int(input("First number: "))\nb = int(input("Second number: "))\nprint("Sum:", a + b)', ['3', '4']],
  ['The input() trap', 'a = input("First: ")\nb = input("Second: ")\nprint(a + b)', ['3', '4']],
  ['Celsius to Fahrenheit', 'c = float(input("Celsius: "))\nprint(c * 9 / 5 + 32)', ['100']],
  ['int() chops', 'print(int(7.9))\nprint(int(-7.9))\nprint(float(7))\nprint(7 / 2)', []],
  ['Make an error!', 'age = 11\nprint("Age: " + age)', []],
];
function PlayView() {
  let start = null; try { start = JSON.parse(sessionStorage.getItem('pp.play')); sessionStorage.removeItem('pp.play'); } catch (e) {}
  const first = start || { code: EXAMPLES[1][1], stdin: EXAMPLES[1][2] };
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Playground'), h('p', { class: 'muted' }, 'Type any program using print, input, int, float and variables. Press Run, or Step to go line by line. Ctrl+Enter also runs.')));
  let pg = Playground({ code: first.code, stdin: first.stdin, minLines: 8, id: 'play' });
  const holder = h('div', null, pg.el);
  const sel = h('select', { 'aria-label': 'Load an example', onchange: e => { const ex = EXAMPLES[e.target.value]; if (!ex) return; pg.stop(true); holder.textContent = ''; pg = Playground({ code: ex[1], stdin: ex[2], minLines: 8, id: 'play' }); holder.append(pg.el); } },
    h('option', { value: '' }, 'Load an example…'), EXAMPLES.map((e, i) => h('option', { value: i }, e[0])));
  root.append(h('div', { class: 'card' }, h('div', { class: 'pg-bar' }, h('label', null, 'Examples '), sel), holder));
  root.append(h('div', { class: 'callout tip' }, h('div', { class: 'co-h' }, '💡 Challenge'), h('div', null, 'Before you press Run, write down what you think it will print. Then run it. Every surprise is a point you just earned on the test.')));
  return root;
}

/* ---------- CHEAT SHEET ---------- */
function CheatView() {
  Store.data.visited.cheat = 1; Store.save();
  const root = h('div', { class: 'cheat' });
  root.append(h('div', { class: 'page-h' }, h('h1', null, 'Cheat sheet'), h('p', { class: 'muted' }, 'Everything on one page. Read it tonight and again before the test.'), h('button', { type: 'button', class: 'btn', onclick: () => window.print() }, '🖨 Print this page')));
  const sec = (t, html) => h('section', { class: 'card cs' }, h('h2', null, t), h('div', { html }));
  root.append(
    sec('1 · print()', `<table class="tbl"><thead><tr><th>You write</th><th>Python shows</th><th>Why</th></tr></thead><tbody>
      <tr><td><code>print("Hi")</code></td><td><code>Hi</code></td><td>quotes = text; quotes are not shown</td></tr>
      <tr><td><code>print(2 + 3)</code></td><td><code>5</code></td><td>no quotes = math</td></tr>
      <tr><td><code>print("2 + 3")</code></td><td><code>2 + 3</code></td><td>quotes = no math</td></tr>
      <tr><td><code>print("A", "B")</code></td><td><code>A B</code></td><td>comma = one space</td></tr>
      <tr><td><code>print("A" + "B")</code></td><td><code>AB</code></td><td>+ glues text, no space</td></tr>
      <tr><td><code>print("Age:", 11)</code></td><td><code>Age: 11</code></td><td>comma mixes text and numbers</td></tr>
      <tr><td><code>print("Age:" + 11)</code></td><td>💥 TypeError</td><td>text + number never works</td></tr></tbody></table>`),
    sec('2 · Variables', `<p><code>x = 5</code> stores 5 in x. Right side first, then store. <code>x = x + 1</code> adds 1 to the old x. Capitals matter: <code>Score ≠ score</code>. No spaces, no starting with a number.</p>
      <p><code>print(x)</code> shows the value. <code>print("x")</code> shows the letter x.</p>`),
    sec('3 · input()', `<p><b>input() ALWAYS gives text (str)</b>, even if you type digits.</p>
      <p><code>"3" + "4"</code> is <code>"34"</code> &nbsp;·&nbsp; <code>"5" * 3</code> is <code>"555"</code> &nbsp;·&nbsp; <code>"5" + 1</code> is 💥</p>`),
    sec('4 · int() and float()', `<table class="tbl"><thead><tr><th>Code</th><th>Result</th></tr></thead><tbody>
      <tr><td><code>int("5")</code></td><td><code>5</code></td></tr><tr><td><code>float("5")</code></td><td><code>5.0</code></td></tr>
      <tr><td><code>int(7.9)</code></td><td><code>7</code> (chops, never rounds)</td></tr><tr><td><code>float(4)</code></td><td><code>4.0</code></td></tr>
      <tr><td><code>int("3.5")</code></td><td>💥 ValueError (use float)</td></tr><tr><td><code>int("abc")</code>, <code>float("abc")</code></td><td>💥 ValueError</td></tr></tbody></table>
      <p><b>Whole numbers → <code>int(input())</code>. Decimals possible → <code>float(input())</code>.</b></p>`),
    sec('5 · What type do I get?', `<table class="tbl"><thead><tr><th>Math</th><th>Type</th></tr></thead><tbody>
      <tr><td>int + int, int * int, int - int</td><td><span class="badge b-int">int</span></td></tr>
      <tr><td>anything with a float in it</td><td><span class="badge b-float">float</span></td></tr>
      <tr><td><code>/</code> (always!)</td><td><span class="badge b-float">float</span> &nbsp; <code>10 / 2 = 5.0</code></td></tr>
      <tr><td>text + text, text * int</td><td><span class="badge b-str">str</span></td></tr>
      <tr><td>text + number, text * text</td><td><span class="badge b-err">error</span></td></tr></tbody></table>`),
    sec('6 · Errors', `<table class="tbl"><thead><tr><th>Error</th><th>Means</th><th>Example</th></tr></thead><tbody>
      <tr><td><b>SyntaxError</b></td><td>Python cannot read it (missing <code>"</code> <code>)</code> <code>,</code>)</td><td><code>print("hi)</code></td></tr>
      <tr><td><b>NameError</b></td><td>unknown name (typo, capitals, missing quotes)</td><td><code>print(hello)</code>, <code>Print("x")</code></td></tr>
      <tr><td><b>TypeError</b></td><td>types that do not mix</td><td><code>"5" + 5</code></td></tr>
      <tr><td><b>ValueError</b></td><td>bad value to convert</td><td><code>int("abc")</code></td></tr>
      <tr><td><b>ZeroDivisionError</b></td><td>divided by zero</td><td><code>5 / 0</code></td></tr></tbody></table>`),
    sec('7 · The program recipe', `<p><b>ASK</b> <code>input()</code> → <b>CONVERT</b> <code>int()</code>/<code>float()</code> → <b>CALCULATE</b> → <b>PRINT</b></p>
      <pre class="cs-code">a = int(input("First: "))
b = int(input("Second: "))
print("Sum:", a + b)</pre>`),
    sec('8 · On test day', `<ol><li>Quotes or not? (text vs math)</li><li>Did this number come from <code>input()</code>? It is text until converted.</li><li>Is there a <code>/</code>? The answer is a float and ends in <code>.0</code> if whole.</li><li>Match the example output exactly: spaces and capitals.</li><li>If it crashes: error name → line number → what does it mean?</li><li>Run your program in your head with the example input.</li></ol>`));
  return root;
}
