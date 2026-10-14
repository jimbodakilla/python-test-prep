/* views: home, learn, lesson, level-up, practice hub, test hub, playground, cheat sheet */
'use strict';

/* ---------- the 2-day plan (Test prep track) ---------- */
function unitPassed(u) {
  return Store.data.sessions.some(s => s.unit === u && s.kind === 'unit' && s.total >= 8 && s.score / s.total >= 0.8);
}
const lessonDone = n => !!(Store.data.lessons[n] && Store.data.lessons[n].done);
const testMocks = () => Store.data.mocks.filter(m => (m.track || 'test') === 'test');
const levelMocks = () => Store.data.mocks.filter(m => m.track === 'level');
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
      T('mock', 'Mock test (score 75% or more)', 30, '#/test', () => testMocks().some(m => m.total >= 10 && m.score / m.total >= .75)),
      T('cheat', 'Read the cheat sheet before bed', 5, '#/cheat', () => !!Store.data.visited.cheat),
    ] },
  ];
}
function nextStep() {
  for (const d of PLAN()) for (const t of d.tasks) if (!t.done()) return t;
  for (const u of LEVEL_UNITS) { if (!lessonDone(u)) return { label: `Level Up: Lesson ${u - 6} · ${unitTitle(u)}`, href: '#/learn/' + u, mins: 25 }; if (!unitPassed(u)) return { label: `Level Up drill: ${unitTitle(u)}`, href: '#/drill/' + u, mins: 15 }; }
  return { label: 'Take a Level Up checkpoint test', href: '#/level', mins: 30 };
}
const lvNum = u => u - 6;                       // unit 7 -> Level Up #1

/* ---------- progress text a kid can paste to a parent / teacher ---------- */
function progressText() {
  const st = skillStats(); const d = Store.data;
  const lessons = TEST_UNITS.filter(lessonDone).length;
  const tm = testMocks(), best = tm.length ? Math.max(...tm.map(m => m.score / m.total)) : null;
  const weak = CORE_SKILLS.filter(s => st[s].tried > 0).sort((a, b) => st[a].mastery - st[b].mastery).slice(0, 2).map(s => SKILL_NAMES[s]);
  const lv = LEVEL_UNITS.filter(lessonDone).length;
  return `Python Test Prep progress\nTest-ready: ${pct(overallReadiness())}%\nLessons read: ${lessons}/6\nMock tests taken: ${tm.length}${best != null ? ` (best ${pct(best)}%)` : ''}\n` +
    (weak.length ? `Needs more practice: ${weak.join(', ')}\n` : '') + (lv ? `Level Up lessons read: ${lv}/7 (${pct(levelReadiness())}% mastery)\n` : '') + `XP: ${d.xp}`;
}
async function copyText(txt) {
  if (navigator.share && matchMedia('(pointer:coarse)').matches) { try { await navigator.share({ title: 'My Python progress', text: txt }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(txt); toast('Copied! Paste it into a message.'); }
  catch (e) { const ta = h('textarea', { 'aria-label': 'Progress text', style: 'position:fixed;left:-999px' }, txt); document.body.append(ta); ta.select(); try { document.execCommand('copy'); toast('Copied! Paste it into a message.'); } catch (e2) { prompt('Copy this text:', txt); } ta.remove(); }
}

/* ---------- accent colours per unit (lessons, cards, headers) ---------- */
const UNIT_HUE = { 1: 'violet', 2: 'sky', 3: 'mint', 4: 'sun', 5: 'coral', 6: 'pink', 7: 'sky', 8: 'violet', 9: 'mint', 10: 'sun', 11: 'pink', 12: 'coral', 13: 'sky' };
const accStyle = u => { const c = UNIT_HUE[u] || 'violet'; return `--acc:var(--${c});--acc-deep:var(--${c}-deep);--acc-soft:var(--${c}-soft);--acc-ink:var(--${c}-ink)`; };
const SKILL_COLOR = { print: 'violet', join: 'sky', math: 'mint', input: 'sun-deep', convert: 'coral', types: 'pink', errors: 'coral-deep', programs: 'violet-deep', bonus: 'sky', bool: 'violet', cond: 'sky', loops: 'mint', strings: 'sun-deep', lists: 'pink', funcs: 'coral', project: 'violet-deep' };

/* ---------- HOME ---------- */
function pipSays(first, ready, nxt) {
  const st = dayStreak();
  if (first) return "Hi, I'm Pip! Ready to learn Python?";
  if (ready >= .8) return "You are nearly test-ready!";
  if (st >= 2) return `${st} days in a row. Keep it going!`;
  return 'Pick up where you left off?';
}
function HomeView() {
  const st = skillStats(); const ready = overallReadiness(); const plan = PLAN(); const nxt = nextStep();
  const doneCount = plan.flatMap(d => d.tasks).filter(t => t.done()).length, totalTasks = plan.flatMap(d => d.tasks).length;
  const first = !Object.keys(Store.data.items).length && !Object.keys(Store.data.lessons).length;
  const weak = CORE_SKILLS.filter(s => st[s].tried > 0).sort((a, b) => st[a].mastery - st[b].mastery).filter(s => st[s].mastery < .75).slice(0, 3);
  const li = levelInfo(Store.data.xp), streak = dayStreak();
  const root = h('div', { class: 'home' });
  root.append(h('section', { class: 'hero' },
    h('div', { class: 'hero-text' },
      h('p', { class: 'eyebrow' }, '6th grade Python'),
      h('h1', null, first ? "Let's get you test-ready." : (ready >= .8 ? 'You are nearly test-ready!' : 'Welcome back. Keep going!')),
      h('p', { class: 'lead' }, 'The test is built from four commands: ', h('code', null, 'print'), ' ', h('code', null, 'input'), ' ', h('code', null, 'int'), ' ', h('code', null, 'float'), '. Learn them, run real code, and practice until it feels automatic.'),
      h('div', { class: 'hero-cta' }, h('a', { class: 'btn primary big', href: nxt.href }, (first ? 'Start Lesson 1' : 'Continue'), icon('arrow')), h('a', { class: 'btn on-dark big', href: '#/play' }, icon('code'), 'Playground'))),
    h('div', { class: 'hero-pip' }, h('div', { class: 'bubble' }, pipSays(first, ready, nxt)), Pip(ready >= .8 ? 'cheer' : 'happy', 170, 'Pip, your coding buddy'))));
  root.append(h('div', { class: 'stats' },
    h('a', { class: 'stat-tile', href: '#/badges' }, h('span', { class: 'stat-ico violet' }, icon('trophy')), h('div', null, h('b', null, 'Level ' + li.n), h('span', { class: 'l' }, li.next ? `${li.next - Store.data.xp} XP to ${li.nextName}` : li.name))),
    h('a', { class: 'stat-tile', href: '#/badges' }, h('span', { class: 'stat-ico coral' }, icon('flame')), h('div', null, h('b', null, streak + (streak === 1 ? ' day' : ' days')), h('span', { class: 'l' }, streak ? 'Practice tomorrow to keep it' : 'Practice today to start'))),
    h('a', { class: 'stat-tile', href: '#/practice' }, h('span', { class: 'stat-ico mint' }, icon('target')), h('div', null, h('b', null, pct(ready) + '%'), h('span', { class: 'l' }, 'test-ready')))));
  root.append(h('a', { class: 'quest', href: nxt.href }, h('span', { class: 'q-i' }, icon(/Lesson/.test(nxt.label) ? 'book' : /test|Mock/i.test(nxt.label) ? 'test' : 'target')), h('div', null, h('small', null, "Today's quest"), h('b', null, nxt.label), h('span', { class: 'muted small' }, `About ${nxt.mins} minutes`)), h('span', { class: 'q-go' }, icon('arrow'))));
  root.append(h('section', { class: 'card' }, h('div', { class: 'sec-h' }, h('h2', null, 'Your skills'), weak.length ? h('a', { class: 'btn small primary', href: '#/weak' }, icon('target'), 'Fix my weak spots') : h('a', { class: 'btn small', href: '#/weak' }, 'Weak-spot practice')),
    h('p', { class: 'muted' }, 'A skill reaches 100% after about 12 correct answers in it. Wrong answers bring it back down, so this meter is honest.'),
    h('div', { class: 'skill-rows' }, CORE_SKILLS.map(s => h('a', { class: 'skill-row link', href: '#/skill/' + s, title: 'Practice this skill', style: `--bar:var(--${SKILL_COLOR[s]})` }, h('span', null, SKILL_NAMES[s]), bar(st[s].mastery, '', SKILL_NAMES[s]), h('b', null, pct(st[s].mastery) + '%')))),
    h('div', { class: 'share-row' }, h('button', { type: 'button', class: 'btn small', onclick: () => copyText(progressText()) }, icon('share'), 'Copy my progress'), h('span', { class: 'muted small' }, 'Paste it to your teacher or a parent.'))));
  const planEl = h('section', { class: 'card plan' }, h('div', { class: 'sec-h' }, h('h2', null, 'Your 2-day plan'), h('span', { class: 'muted small' }, `${doneCount} of ${totalTasks} steps done. Steps tick themselves.`)));
  plan.forEach(d => {
    const mins = d.tasks.reduce((a, t) => a + t.mins, 0);
    planEl.append(h('div', { class: 'day' }, h('div', { class: 'day-h' }, h('b', null, d.day), h('span', null, ' · ' + d.sub), h('span', { class: 'muted small' }, ` · about ${Math.round(mins / 6) / 10} h`)),
      h('ul', { class: 'tasks' }, d.tasks.map(t => { const dn = t.done(); return h('li', { class: dn ? 'done' : '' }, h('a', { href: t.href }, h('span', { class: 'tick', 'aria-hidden': 'true' }, dn ? icon('check') : null), h('span', { class: 'tl' }, t.label), h('span', { class: 'tm' }, t.mins + ' min'), dn ? h('span', { class: 'sr-only' }, '(done)') : null)); }))));
  });
  root.append(planEl);
  root.append(h('section', { class: 'card rush' }, h('h2', null, h('span', { class: 'stat-ico sun', style: 'display:inline-grid;width:34px;height:34px;vertical-align:middle;margin-right:10px;border-radius:10px' }, icon('bolt')), 'Short on time? 30-minute cram'),
    h('ol', null, h('li', null, h('a', { href: '#/cheat' }, 'Read the cheat sheet'), ' (5 min)'), h('li', null, h('a', { href: '#/sprint/type' }, 'Type Sprint'), ' x2 (4 min)'), h('li', null, h('a', { href: '#/mixed' }, 'Mixed practice, 15 questions'), ' (12 min)'), h('li', null, h('a', { href: '#/test/10' }, 'Mini test, 10 questions'), ' (10 min)'))));
  const lvReady = levelReadiness(); const testReady = ready >= .6 || doneCount >= 14;
  root.append(h('section', { class: 'card levelup-card' }, h('div', { class: 'lu-top' }, h('div', { class: 'lu-ico', 'aria-hidden': 'true' }, icon('rocket')),
    h('div', null, h('p', { class: 'eyebrow' }, 'After the test'), h('h2', null, 'Level Up: keep learning'),
      h('p', { class: 'muted' }, 'Decisions (if / else), loops, strings, lists, functions, and mini projects. Seven more lessons and hundreds more questions, built the same way.'))),
    h('div', { class: 'lu-row' }, ring(lvReady, 84, 'mastery'), h('div', null, h('div', { class: 'lu-chips' }, LEVEL_UNITS.map(u => h('span', { class: 'chip' + (lessonDone(u) ? ' done' : '') }, lessonDone(u) ? icon('check') : null, unitTitle(u)))),
      h('p', { class: 'muted small' }, testReady ? 'You are ready to start whenever you like.' : 'Finish your test prep first. Level Up is not on the test, so it can wait.'))),
    h('div', { class: 'hero-cta' }, h('a', { class: 'btn' + (testReady ? ' primary' : ' on-dark'), href: '#/level' }, 'Open Level Up', icon('arrow')))));
  const badges = badgeStatus(); const earnedN = badges.filter(b => b.earned).length;
  root.append(h('section', { class: 'card' }, h('div', { class: 'sec-h' }, h('h2', null, 'Your badges'), h('a', { class: 'btn small', href: '#/badges' }, `${earnedN} of ${badges.length}`, icon('arrow'))),
    h('div', { class: 'shelf' }, [...badges].sort((a, b) => b.earned - a.earned).slice(0, 8).map(b => h('div', { class: 'medal-wrap' + (b.earned ? ' earned' : '') }, Medal(b, 60), h('span', null, b.name))))));
  root.append(h('details', { class: 'card faq' }, h('summary', null, 'How do I get the most out of this?'),
    h('ul', null, h('li', null, h('b', null, 'Predict before you run.'), ' In every lesson box, guess the output first, then press Run.'), h('li', null, h('b', null, 'Use Step.'), ' It runs one line at a time and shows each variable and its type.'), h('li', null, h('b', null, 'Love your mistakes.'), ' A wrong answer comes back later in the same practice round.'),
      h('li', null, h('b', null, 'Read the red errors.'), ' The test loves errors. This site explains each one in plain English.'), h('li', null, h('b', null, 'Sleep.'), ' Practice tonight, sleep, take the mock test in the morning.'))));
  root.append(h('div', { class: 'footnote' }, h('button', { type: 'button', class: 'linkbtn', onclick: () => { if (confirm('Erase all your progress on this device?')) { Store.reset(); route(); } } }, 'Reset my progress'),
    h('span', null, ' · Your progress is saved only on this device.')));
  setTimeout(badgeToast, 400);
  return root;
}

/* ---------- BADGES & LEVELS ---------- */
function BadgesView() {
  const li = levelInfo(Store.data.xp), streak = dayStreak(), badges = badgeStatus(), earnedN = badges.filter(b => b.earned).length;
  badges.filter(b => b.earned).forEach(b => { Store.data.badgesSeen[b.id] = 1; }); Store.save();
  const root = h('div', { class: 'badges-page' });
  root.append(h('section', { class: 'hero' },
    h('div', { class: 'hero-text' }, h('p', { class: 'eyebrow' }, 'Your journey'), h('h1', null, `Level ${li.n}: ${li.name}`),
      h('p', { class: 'lead' }, li.next ? `${Store.data.xp} XP so far. ${li.next - Store.data.xp} more to become a ${li.nextName}.` : `${Store.data.xp} XP. You reached the top level!`),
      h('div', { class: 'bar', style: 'max-width:420px;height:20px;--bar:var(--sun)', role: 'progressbar', 'aria-label': 'Progress to next level', 'aria-valuenow': pct(li.frac), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `--v:${li.frac}` }))),
    h('div', { class: 'hero-pip' }, Pip('cheer', 150, 'Pip celebrating'))));
  root.append(h('div', { class: 'stats' },
    h('div', { class: 'stat-tile' }, h('span', { class: 'stat-ico sun' }, icon('star')), h('div', null, h('b', null, String(Store.data.xp)), h('span', { class: 'l' }, 'total XP'))),
    h('div', { class: 'stat-tile' }, h('span', { class: 'stat-ico coral' }, icon('flame')), h('div', null, h('b', null, streak + (streak === 1 ? ' day' : ' days')), h('span', { class: 'l' }, 'current streak'))),
    h('div', { class: 'stat-tile' }, h('span', { class: 'stat-ico mint' }, icon('medal')), h('div', null, h('b', null, `${earnedN} / ${badges.length}`), h('span', { class: 'l' }, 'badges earned')))));
  root.append(h('section', { class: 'card' }, h('h2', null, 'Level ladder'),
    h('ol', { class: 'ladder' }, LEVELS.map(([xp, name], i) => h('li', { class: 'rung' + (i + 1 === li.n ? ' now' : i + 1 < li.n ? ' done' : '') }, h('span', { class: 'rung-n' }, i + 1 < li.n ? icon('check') : String(i + 1)), h('b', null, name), h('span', { class: 'muted small' }, xp + ' XP'), i + 1 === li.n ? h('span', { class: 'chip' }, 'You are here') : null)))));
  root.append(h('h2', { class: 'sec-t' }, 'Badges'));
  root.append(h('div', { class: 'badge-grid' }, [...badges].sort((a, b) => b.earned - a.earned).map(b => h('div', { class: 'card badge-card' + (b.earned ? '' : ' locked') }, Medal(b, 72), h('h3', null, b.name), h('p', null, b.earned ? 'Earned!' : b.hint)))));
  root.append(h('p', { class: 'muted center' }, 'XP: +10 for a right answer, +20 for a program that passes, half if you needed a retry, +5 per question on a mock test.'));
  return root;
}

/* ---------- LEARN list ---------- */
function lessonCard(l) {
  const u = unitStats(l.n); const done = lessonDone(l.n); const lv = l.track === 'level';
  return h('a', { class: 'card lcard' + (done ? ' done' : '') + (lv ? ' lv' : ''), href: '#/learn/' + l.n, style: accStyle(l.n) },
    h('div', { class: 'l-ico', 'aria-hidden': 'true' }, l.emoji), h('div', { class: 'l-body' }, h('div', { class: 'l-n' }, lv ? 'Level Up ' + lvNum(l.n) : 'Lesson ' + l.n, h('span', { class: 'muted' }, ` · ${l.minutes} min`), done ? h('span', { class: 'l-done' }, ' · read') : null),
      h('h3', null, l.title), h('p', { class: 'muted' }, l.goal), h('div', { class: 'l-prog' }, bar(u.mastery, u.mastery >= .8 ? 'good' : '', 'Drill mastery'), h('span', null, `drill ${pct(u.mastery)}%`))));
}
function LearnView() {
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Lessons'), h('p', { class: 'muted' }, 'Do them in order. Each one has live code you can run, then a practice drill.')));
  root.append(h('h2', { class: 'track-h' }, h('span', { class: 'track-pill test' }, 'TEST PREP'), ' The four basics ', h('span', { class: 'muted small' }, 'lessons 1-6 · this is the test')));
  root.append(h('div', { class: 'lessons-grid' }, D.lessons.filter(l => l.track === 'test').map(lessonCard)));
  root.append(h('h2', { class: 'track-h' }, h('span', { class: 'track-pill lv' }, 'LEVEL UP'), ' Keep learning ', h('span', { class: 'muted small' }, 'not on the test · do these after it')));
  root.append(h('div', { class: 'lessons-grid' }, D.lessons.filter(l => l.track === 'level').map(lessonCard)));
  root.append(h('p', { class: 'muted' }, 'Need a quick reminder? ', h('a', { href: '#/cheat' }, 'Open the cheat sheet'), '.'));
  return root;
}

/* ---------- trace table (runs the program and records each line) ---------- */
async function buildTrace(code, stdin) {
  const q = (stdin || []).slice(); const rows = []; let buf = '';
  const res = await PF.run(code, { limit: 20000, write: s => { buf += s; }, input: async () => q.length ? q.shift() : null,
    step: async (line, snap) => {
      if (rows.length) { rows[rows.length - 1].after = snap(); rows[rows.length - 1].printed = buf; }
      buf = ''; if (line !== null && rows.length < 200) rows.push({ line, after: null, printed: '' });
    } });
  if (rows.length && !rows[rows.length - 1].after) { rows[rows.length - 1].after = res.vars; rows[rows.length - 1].printed = buf; }
  return { rows, res };
}
function TraceBlock(code, stdin) {
  const lines = code.split('\n'); const root = h('div', { class: 'trace' }, h('div', { class: 'trace-h' }, icon('loop'), 'Trace: follow it line by line'), codeBlock(code, { compact: true }));
  const slot = h('div', { class: 'trace-slot muted' }, 'Tracing…'); root.append(slot);
  buildTrace(code, stdin).then(({ rows, res }) => {
    slot.textContent = ''; slot.classList.remove('muted');
    const show = rows.slice(0, 18); let prev = new Map();
    const tb = h('tbody', null, show.map((r, i) => {
      const vars = (r.after || []).filter(v => true); const cur = new Map(vars.map(v => [v.name, v.repr]));
      const cell = h('td', { class: 'tr-vars' }, vars.length ? vars.map(v => h('span', { class: 'tr-var' + (prev.get(v.name) !== v.repr ? ' chg' : '') }, h('b', null, v.name), ' = ', h('span', { class: 'v-' + v.type }, v.repr))) : h('span', { class: 'muted' }, '—'));
      prev = cur;
      return h('tr', null, h('td', { class: 'tr-n' }, String(i + 1)), h('td', { class: 'tr-line' }, h('span', { class: 'tr-ln' }, 'L' + r.line), h('code', null, (lines[r.line - 1] || '').trim())), cell, h('td', { class: 'tr-out' }, r.printed ? r.printed.replace(/\n$/, '').split('\n').join(' ⏎ ') : ''));
    }));
    slot.append(...[h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl trace-tbl' }, h('thead', null, h('tr', null, ['Step', 'Line that runs', 'Variables after it runs', 'Printed'].map(x => h('th', null, x)))), tb)),
      rows.length > show.length ? h('p', { class: 'muted small' }, `…and ${rows.length - show.length} more steps.`) : null,
      res.error ? h('p', { class: 'trace-err' }, 'Then it crashes: ' + res.error.type + ' on line ' + res.error.line) : null,
      h('button', { type: 'button', class: 'linkbtn small', onclick: () => { try { sessionStorage.setItem('pp.play', JSON.stringify({ code, stdin: stdin || [] })); } catch (e) {} location.hash = '#/play'; } }, 'Step through it yourself in the playground ↗')].filter(Boolean));
  });
  return root;
}
function BranchBlock(cond, yes, no) {
  return h('div', { class: 'branch', role: 'group', 'aria-label': 'Decision: ' + cond },
    h('div', { class: 'br-q' }, h('span', { class: 'muted' }, 'Is it true?  '), h('code', null, cond)),
    h('div', { class: 'br-arms' }, h('div', { class: 'br-arm yes' }, h('b', null, icon('check'), ' True'), h('span', null, yes)), h('div', { class: 'br-arm no' }, h('b', null, icon('x'), ' False'), h('span', null, no))));
}

/* ---------- LESSON ---------- */
function LessonView(n) {
  const L = D.lessons.find(x => x.n === n);
  if (!L) return h('div', { class: 'card' }, 'Lesson not found. ', h('a', { href: '#/learn' }, 'Back to lessons'));
  Store.data.visited['l' + n] = 1; Store.save();
  const lv = L.track === 'level';
  const root = h('article', { class: 'lesson', style: accStyle(n) });
  root.append(h('div', { class: 'crumbs' }, h('a', { href: '#/learn' }, icon('back'), ' Lessons')),
    h('header', { class: 'l-head' }, h('div', { class: 'l-ico big', 'aria-hidden': 'true' }, L.emoji), h('div', null, h('p', { class: 'eyebrow' + (lv ? ' lu' : '') }, lv ? `Level Up ${lvNum(n)} of 7 · ${L.minutes} minutes` : `Lesson ${n} of 6 · ${L.minutes} minutes`), h('h1', null, L.title), h('p', { class: 'lead' }, 'Goal: ' + L.goal))));
  let tryN = 0;
  for (const b of L.blocks) {
    const [type] = b;
    if (type === 'p') root.append(h('p', { html: b[1] }));
    else if (type === 'h') root.append(h('h2', { class: 'l-h3' }, b[1]));
    else if (type === 'rule') root.append(h('div', { class: 'callout rule' }, h('div', { class: 'co-h' }, icon('check'), b[1]), h('div', { html: b[2] })));
    else if (type === 'trap') root.append(h('div', { class: 'callout trap' }, h('div', { class: 'co-h' }, icon('warn'), 'Trap'), h('div', { html: b[1] })));
    else if (type === 'list') root.append(h('ul', { class: 'l-list' }, b[1].map(x => h('li', { html: x }))));
    else if (type === 'table') root.append(h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' }, h('thead', null, h('tr', null, b[1].map(c => h('th', null, c)))), h('tbody', null, b[2].map(r => h('tr', null, r.map(c => h('td', { html: c }))))))));
    else if (type === 'pipeline') root.append(h('div', { class: 'pipeline' }, b.slice(1).map((s, i) => [i ? h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→') : null, h('div', { class: 'pstep s' + (i + 1) }, h('b', null, s[0]), h('code', null, s[1]), h('span', null, s[2]))])));
    else if (type === 'branch') root.append(BranchBlock(b[1], b[2], b[3]));
    else if (type === 'trace') root.append(TraceBlock(b[1], b[2] || []));
    else if (type === 'try') root.append(h('div', { class: 'try' }, h('div', { class: 'try-h' }, icon('play'), 'Try it'), Playground({ code: b[1], stdin: b[2], note: b[3], id: `l${n}-${++tryN}`, minLines: Math.max(3, b[1].split('\n').length) }).el));
    else if (type === 'show') {
      const [, code, stdin, out, errType] = b;
      const box = h('div', { class: 'show' }, codeBlock(code),
        stdin.length ? h('div', { class: 'show-in' }, icon('term'), ' typed: ', stdin.map(s => h('code', null, s))) : null,
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
        fb.className = 'quick-fb show ' + (good ? 'ok' : 'no'); fb.textContent = ''; fb.append(icon(good ? 'check' : 'bulb'), ' ' + (good ? 'Yes! ' : 'Not quite. ') + why);
      } }, h('span', { class: 'opt-n' }, String(k + 1)), h('span', { class: 'opt-t' }, opts[o]))));
      root.append(h('div', { class: 'quick card' }, h('div', { class: 'quick-h' }, icon('bulb'), 'Quick check'), h('p', { class: 'q-prompt' }, q), wrap, fb));
    }
  }
  const can = Store.data.lessons[n] && Store.data.lessons[n].can || [];
  const markBtn = h('button', { type: 'button', class: 'btn' + (lessonDone(n) ? '' : ' primary'), onclick: () => {
    Store.data.lessons[n] = Object.assign(Store.data.lessons[n] || {}, { done: Date.now(), can }); Store.save(); toast('Lesson marked as read'); markBtn.textContent = ''; markBtn.append(icon('check'), 'Marked as read'); markBtn.classList.remove('primary'); celebrate({ title: 'Lesson done!', text: 'Now try the practice drill.', mood: 'cheer', confetti: false, ms: 2600 }); badgeToast();
  } }, lessonDone(n) ? [icon('check'), 'Marked as read'] : 'I read it - mark done');
  const nextL = D.lessons.find(x => x.n === n + 1);
  root.append(h('section', { class: 'card cando' }, h('h2', null, 'Can you say yes to each?'),
    h('ul', { class: 'checks' }, L.cando.map((c, i) => h('li', null, h('label', null, h('input', { type: 'checkbox', checked: !!can[i], onchange: e => { can[i] = e.target.checked; Store.data.lessons[n] = Object.assign(Store.data.lessons[n] || {}, { can }); Store.save(); } }), h('span', null, c))))),
    h('div', { class: 'l-foot' }, markBtn, h('a', { class: 'btn primary big', href: '#/drill/' + n }, `Practice this lesson (${ITEMS.filter(i => i.unit === n).length} questions)`, icon('arrow'))),
    nextL ? h('p', null, h('a', { href: '#/learn/' + nextL.n }, (n === 6 ? 'After the test: Level Up 1 · ' : 'Next lesson: ') + nextL.title + ' →')) : h('p', null, 'You finished every lesson. Try a ', h('a', { href: '#/level' }, 'Level Up checkpoint test'), '.')));
  return root;
}

/* ---------- LEVEL UP hub ---------- */
function LevelView() {
  const lvReady = levelReadiness(); const testReady = overallReadiness();
  const root = h('div', { class: 'level' });
  root.append(h('section', { class: 'hero lv-hero' }, h('div', { class: 'hero-text' }, h('p', { class: 'eyebrow lu' }, 'Level Up'), h('h1', null, 'Keep learning Python.'),
    h('p', { class: 'lead' }, 'The test covers the four basics. These seven lessons teach what comes next: making decisions, repeating, and organising code. Same live editor, same practice, same honest meter.'),
    testReady < .6 && !lessonDone(6) ? h('div', { class: 'callout trap' }, h('div', { class: 'co-h' }, icon('warn'), 'Test first'), h('div', null, 'You have a test coming. Level Up is waiting for you afterwards, and it will make more sense once the basics feel automatic.')) : null),
    h('div', { class: 'hero-pip' }, h('div', { class: 'bubble' }, lvReady >= .5 ? 'Look how far you came!' : 'New skills to unlock!'), Pip('happy', 150, 'Pip'))));
  const path = h('ol', { class: 'roadmap' });
  LEVEL_UNITS.forEach(u => {
    const l = D.lessons.find(x => x.n === u); if (!l) return; const us = unitStats(u); const done = lessonDone(u);
    path.append(h('li', { class: 'road-node' + (done ? ' done' : '') + (us.mastery >= .8 ? ' mastered' : ''), style: accStyle(u) },
      h('div', { class: 'road-dot', 'aria-hidden': 'true' }, done ? icon('check') : l.emoji),
      h('div', { class: 'road-card card' }, h('div', { class: 'l-n lu' }, `Level Up ${lvNum(u)} · ${l.minutes} min`), h('h2', null, l.title), h('p', { class: 'muted' }, l.goal),
        h('div', { class: 'l-prog' }, bar(us.mastery, us.mastery >= .8 ? 'good' : '', 'Mastery'), h('span', null, `${pct(us.mastery)}%`)),
        h('div', { class: 'road-btns' }, h('a', { class: 'btn' + (done ? '' : ' primary'), href: '#/learn/' + u }, done ? 'Reread lesson' : 'Start lesson'), h('a', { class: 'btn', href: '#/drill/' + u }, `Practice (${ITEMS.filter(i => i.unit === u).length})`)))));
  });
  root.append(path);
  const lm = levelMocks(); const best = lm.length ? Math.max(...lm.map(m => m.score / m.total)) : null;
  root.append(h('section', { class: 'card' }, h('h2', null, 'Level Up checkpoint test'), h('p', { class: 'muted' }, 'Timed, no hints, questions from units 8-13. Graded at the end with a full review.' + (best != null ? ` Best so far: ${pct(best)}%.` : '')),
    h('div', { class: 'hero-cta' }, h('a', { class: 'btn primary', href: '#/leveltest/20' }, 'Full checkpoint · 20 questions'), h('a', { class: 'btn', href: '#/leveltest/10' }, 'Mini · 10'), h('a', { class: 'btn ghost', href: '#/weak/level' }, icon('target'), 'Level Up weak spots'))));
  root.append(h('p', { class: 'muted center' }, 'Need a reminder? ', h('a', { href: '#/cheat/level' }, 'Level Up cheat sheet'), '.'));
  return root;
}

/* ---------- PRACTICE hub ---------- */
function PracticeView() {
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Practice'), h('p', { class: 'muted' }, 'The more you do, the more automatic it gets. Wrong answers return later in the round.')));
  const modes = [
    ['bolt', 'sun', 'Type Sprint', 'int, float, str or error? 60 seconds, as many as you can.', '#/sprint/type'],
    ['infinity', 'sky', 'Endless practice', 'Brand-new generated questions every time. Never run out.', '#/endless'],
    ['target', 'coral', 'Weak-spot rescue', 'Built from your misses and your lowest skills.', '#/weak'],
    ['shuffle', 'violet', 'Mixed practice', '15 mixed questions from the six test lessons.', '#/mixed'],
    ['bug', 'mint', 'Bug hunt', 'Broken programs. Find and fix the bug.', '#/kind/fix'],
    ['pencil', 'pink', 'Code writer', 'Write whole programs. Hidden tests grade them.', '#/kind/write'],
    ['warn', 'sun', 'Trap questions', 'The tricky ones: types, errors, input() text.', '#/drill/5'],
    ['test', 'violet', 'Mock test', 'Timed, no hints, like the real thing.', '#/test'],
  ];
  const hueS = c => `--acc:var(--${c});--acc-soft:var(--${c}-soft);--acc-ink:var(--${c}-ink)`;
  const modeCard = m => h('a', { class: 'card mode', href: m[4], style: hueS(m[1]) }, h('div', { class: 'm-ico', 'aria-hidden': 'true' }, icon(m[0])), h('div', null, h('h3', null, m[2]), h('p', { class: 'muted' }, m[3])));
  root.append(h('h2', { class: 'track-h' }, h('span', { class: 'track-pill test' }, 'TEST PREP'), ' Practice modes'));
  root.append(h('div', { class: 'modes' }, modes.map(modeCard)));
  root.append(h('h2', { class: 'sec-t' }, 'Drill by lesson'));
  const unitCard = l => { const u = unitStats(l.n); return h('a', { class: 'card unit' + (l.track === 'level' ? ' lv' : ''), href: '#/drill/' + l.n, style: accStyle(l.n) }, h('div', { class: 'u-top' }, h('span', { class: 'u-emo', 'aria-hidden': 'true' }, l.emoji), h('b', null, l.track === 'level' ? 'Level ' + lvNum(l.n) : 'Unit ' + l.n)), h('div', { class: 'u-title' }, unitTitle(l.n)), bar(u.mastery, u.mastery >= .8 ? 'good' : '', 'Mastery'), h('span', { class: 'muted small' }, `${u.total} questions · ${pct(u.mastery)}%`)); };
  root.append(h('div', { class: 'unit-grid' }, D.lessons.filter(l => l.track === 'test').map(unitCard)));
  root.append(h('h2', { class: 'sec-t' }, 'Drill by skill'));
  const st = skillStats();
  root.append(h('div', { class: 'chips' }, CORE_SKILLS.map(s => h('a', { class: 'chip big', href: '#/skill/' + s }, SKILL_NAMES[s] + ' · ' + pct(st[s].mastery) + '%'))));
  root.append(h('h2', { class: 'track-h' }, h('span', { class: 'track-pill lv' }, 'LEVEL UP'), ' Keep learning'));
  root.append(h('div', { class: 'modes' }, [['shuffle', 'violet', 'Level Up mixed', '15 mixed questions from the Level Up lessons.', '#/mixed/level'], ['target', 'coral', 'Level Up weak spots', 'Built from your misses.', '#/weak/level'],
    ['bug', 'mint', 'Level Up bug hunt', 'Fix broken loops, lists and functions.', '#/kind/fix/level'], ['pencil', 'pink', 'Level Up code writer', 'Write programs with if, loops, lists and functions.', '#/kind/write/level']].map(modeCard)));
  root.append(h('div', { class: 'unit-grid', style: 'margin-top:14px' }, D.lessons.filter(l => l.track === 'level').map(unitCard)));
  root.append(h('div', { class: 'chips', style: 'margin-top:14px' }, LEVEL_SKILLS.map(s => h('a', { class: 'chip big', href: '#/skill/' + s }, SKILL_NAMES[s] + ' · ' + pct(st[s].mastery) + '%'))));
  return root;
}

/* ---------- TEST hub ---------- */
function TestHubView() {
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Mock test'), h('p', { class: 'muted' }, 'Like the real thing: no hints, no feedback until you hand it in. Questions come from all six lessons and are different each time.')));
  const pm = pendingMock();
  if (pm) root.append(h('div', { class: 'card resume-card' }, h('h2', null, 'A test is waiting for you'), h('p', { class: 'muted' }, `${pm.track === 'level' ? 'Level Up checkpoint' : 'Mock test'} · ${pm.ids.length} questions. Your clock is ${pm.paused ? 'paused' : 'still running'}.`), h('a', { class: 'btn primary', href: (pm.track === 'level' ? '#/leveltest/' : '#/test/') + pm.n }, icon('play'), 'Pick it back up')));
  const tm = testMocks(); const best = tm.length ? Math.max(...tm.map(m => m.score / m.total)) : null;
  root.append(h('div', { class: 'card' },
    h('div', { class: 'test-opts' },
      h('div', { class: 'to' }, h('h2', null, 'Full test'), h('p', { class: 'muted' }, '20 questions · 30 minutes. 6 predict-the-output, 3 types, 2 type-it-in, 2 fill-in, 2 quick checks, 1 find-the-crash, 2 bug hunts, 2 write-the-code.'), h('a', { class: 'btn primary big', href: '#/test/20' }, 'Start full test')),
      h('div', { class: 'to' }, h('h2', null, 'Mini test'), h('p', { class: 'muted' }, '10 questions · 15 minutes. Same mix, half the size.'), h('a', { class: 'btn big', href: '#/test/10' }, 'Start mini test'))),
    best != null ? h('p', { class: 'muted' }, `Tests taken: ${tm.length} · best score ${pct(best)}%`) : null));
  if (tm.length) root.append(h('div', { class: 'card' }, h('h2', null, 'Your scores'), h('div', { class: 'spark' }, tm.slice(-12).map(m => h('div', { class: 'spark-col', title: `${m.score}/${m.total}` }, h('i', { style: `height:${Math.max(6, pct(m.score / m.total))}%` }), h('span', null, pct(m.score / m.total) + '%'))))));
  root.append(h('div', { class: 'card tips' }, h('h2', null, 'Test-taking checklist'), h('ol', null,
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
  ['★ Level Up: if / else', 'age = int(input("Age: "))\nif age >= 18:\n    print("Adult")\nelif age >= 13:\n    print("Teen")\nelse:\n    print("Kid")', ['15']],
  ['★ Level Up: for loop', 'total = 0\nfor i in range(1, 6):\n    total = total + i\n    print(i, total)', []],
  ['★ Level Up: a list', 'scores = [90, 72, 85]\nscores.append(100)\nprint(scores)\nprint(sum(scores) / len(scores))', []],
  ['★ Level Up: a function', 'def area(w, h):\n    return w * h\n\nprint(area(3, 4))\nprint(area(2.5, 2))', []],
];
const coarseP = () => window.matchMedia && matchMedia('(pointer:coarse)').matches;
function PlayView() {
  let start = null; try { start = JSON.parse(sessionStorage.getItem('pp.play')); sessionStorage.removeItem('pp.play'); } catch (e) {}
  const draft = start ? '' : Store.getDraft();
  const first = start || (draft ? { code: draft, stdin: [] } : { code: EXAMPLES[1][1], stdin: EXAMPLES[1][2] });
  const keep = p => { p.ed.ta.addEventListener('input', () => { clearTimeout(keep.t); keep.t = setTimeout(() => Store.setDraft(p.getCode()), 400); }); window.addEventListener('pagehide', () => Store.setDraft(p.getCode())); return p; };
  const root = h('div', null, h('div', { class: 'page-h' }, h('h1', null, 'Playground'), h('p', { class: 'muted' }, coarseP() ? 'Type any program. Press Run, or Step to go line by line.' : 'Type any program. Press Run, or Step to go line by line. Ctrl+Enter also runs. Tab indents.')));
  let pg = keep(Playground({ code: first.code, stdin: first.stdin, minLines: coarseP() ? 6 : 10, id: 'play' }));
  const holder = h('div', null, pg.el);
  const sel = h('select', { 'aria-label': 'Load an example', onchange: e => { const ex = EXAMPLES[e.target.value]; if (!ex) return; pg.stop(true); holder.textContent = ''; pg = keep(Playground({ code: ex[1], stdin: ex[2], minLines: coarseP() ? 6 : 10, id: 'play' })); holder.append(pg.el); } },
    h('option', { value: '' }, 'Load an example…'), EXAMPLES.map((e, i) => h('option', { value: i }, e[0])));
  root.append(h('div', { class: 'card' }, h('div', { class: 'pg-bar' }, h('label', null, 'Examples '), sel), holder));
  root.append(h('div', { class: 'callout tip' }, h('div', { class: 'co-h' }, icon('bulb'), 'Challenge'), h('div', null, 'Before you press Run, write down what you think it will print. Then run it. Every surprise is a point you just earned on the test.')));
  return root;
}

/* ---------- CHEAT SHEET ---------- */
function CheatView(which) {
  Store.data.visited.cheat = 1; Store.save();
  const root = h('div', { class: 'cheat' });
  const tab = which === 'level' ? 'level' : 'test';
  root.append(h('div', { class: 'page-h' }, h('h1', null, 'Cheat sheet'), h('p', { class: 'muted' }, tab === 'test' ? 'Everything for the test on one page. Read it tonight and again before the test.' : 'The Level Up topics on one page.'),
    h('div', { class: 'seg', role: 'tablist' }, h('a', { class: 'seg-b' + (tab === 'test' ? ' on' : ''), href: '#/cheat', role: 'tab', 'aria-selected': tab === 'test' }, 'Test basics'), h('a', { class: 'seg-b' + (tab === 'level' ? ' on' : ''), href: '#/cheat/level', role: 'tab', 'aria-selected': tab === 'level' }, 'Level Up')),
    h('button', { type: 'button', class: 'btn', onclick: () => window.print() }, icon('print'), 'Print this page')));
  const sec = (t, html) => h('section', { class: 'card cs' }, h('h2', null, t), h('div', { html: html.replace(/<table class="tbl"/g, '<div class="tbl-wrap" tabindex="0" role="region" aria-label="' + t.replace(/"/g, '') + ' table, scrolls sideways"><table class="tbl"').replace(/<\/table>/g, '</table></div>') }));
  if (tab === 'level') {
    root.append(
      sec('8 · Decisions', `<table class="tbl"><thead><tr><th>Write</th><th>Meaning</th></tr></thead><tbody><tr><td><code>==</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code></td><td>compare: gives <b>True</b> or <b>False</b> (a bool)</td></tr>
        <tr><td><code>x = 5</code> vs <code>x == 5</code></td><td>one = stores, two == asks</td></tr><tr><td><code>and</code> / <code>or</code> / <code>not</code></td><td>both true / at least one true / flip it</td></tr><tr><td><code>n % 2 == 0</code></td><td>% is the remainder: even number check</td></tr></tbody></table>
        <pre class="cs-code">if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("Keep going")</pre><p>Colon <code>:</code> at the end, <b>4 spaces</b> inside. Only the <b>first</b> true branch runs. Convert <code>input()</code> before comparing numbers.</p>`),
      sec('9 · Loops', `<pre class="cs-code">for i in range(5):        # 0 1 2 3 4  (stops BEFORE 5)
    print(i)
total = 0
for n in [4, 6, 8]:
    total = total + n      # accumulator
while count &lt; 3:
    count = count + 1       # must change!</pre><p><code>range(a, b)</code> starts at a, stops before b. <code>range(10, 0, -2)</code> counts down. <code>break</code> leaves the loop, <code>continue</code> skips to the next round.</p>`),
      sec('10 · Strings', `<table class="tbl"><tbody><tr><td><code>len("hello")</code></td><td>5</td></tr><tr><td><code>"hello"[0]</code>, <code>"hello"[-1]</code></td><td>h, o (counting starts at <b>0</b>)</td></tr><tr><td><code>"hello"[1:3]</code></td><td>el (stops before 3)</td></tr><tr><td><code>"hello"[::-1]</code></td><td>olleh</td></tr><tr><td><code>.upper() .lower() .strip() .replace(a, b) .count(x) .find(x)</code></td><td>give a NEW string; the original never changes</td></tr></tbody></table><p><code>"a" in word</code> checks if it is inside. <code>word[0] = "x"</code> is an error.</p>`),
      sec('11 · Lists', `<pre class="cs-code">nums = [5, 3, 8]
nums.append(1)      # add to the end
nums.sort()         # changes the list, returns None!
print(len(nums), sum(nums), min(nums), max(nums))
print(nums[0], nums[-1], nums[1:3])
for n in nums:
    print(n)</pre><p><code>b = a</code> makes <b>one</b> list with two names. <code>b = a.copy()</code> makes a real copy. <code>"a b".split()</code> gives a list; <code>"-".join(words)</code> gives a string.</p>`),
      sec('12 · Functions', `<pre class="cs-code">def area(w, h=1):
    return w * h

x = area(3, 4)      # 12
print(x)</pre><p><b>print</b> shows something. <b>return</b> hands a value back (no return gives <code>None</code>). Variables made inside a function stay inside. Define it <b>before</b> you call it.</p>`),
      sec('Level Up errors', `<table class="tbl"><tbody><tr><td><b>IndexError</b></td><td>position does not exist (list of 3 has 0, 1, 2)</td></tr><tr><td><b>IndentationError</b></td><td>missing or uneven indent</td></tr><tr><td><b>UnboundLocalError</b></td><td>changed an outside variable inside a function</td></tr><tr><td><b>TypeError</b> with <code>None</code></td><td>a function with no <code>return</code></td></tr></tbody></table>`));
    return root;
  }
  root.append(
    sec('1 · print()', `<table class="tbl"><thead><tr><th>You write</th><th>Python shows</th><th>Why</th></tr></thead><tbody>
      <tr><td><code>print("Hi")</code></td><td><code>Hi</code></td><td>quotes = text (a string, str); quotes are not shown</td></tr>
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
