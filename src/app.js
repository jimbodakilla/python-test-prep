/* app: router + shell */
'use strict';
const NAV = [['#/', 'Home', '🏠'], ['#/learn', 'Learn', '📘'], ['#/practice', 'Practice', '💪'], ['#/level', 'Level Up', '🚀'], ['#/test', 'Mock test', '📝'], ['#/play', 'Playground', '🧪']];
let navEl;
const THEME_NEXT = { undefined: 'light', light: 'dark', dark: undefined };
const THEME_LABEL = { undefined: ['🌗', 'Theme: automatic'], light: ['☀️', 'Theme: light'], dark: ['🌙', 'Theme: dark'] };
function buildShell() {
  const app = $('#app'); app.textContent = '';
  navEl = h('nav', { class: 'nav', 'aria-label': 'Main' },
    NAV.map(n => h('a', { href: n[0], class: 'nav-a', dataset: { to: n[0] } }, h('span', { class: 'nav-i', 'aria-hidden': 'true' }, n[2]), h('span', { class: 'nav-t' }, n[1]))));
  const themeBtn = h('button', { type: 'button', class: 'theme-btn', id: 'theme', onclick: () => { Store.data.theme = THEME_NEXT[Store.data.theme]; Store.save(); applyTheme(); paintTheme(); toast(THEME_LABEL[Store.data.theme][1]); } });
  app.append(
    h('a', { class: 'skip', href: '#view', onclick: e => { e.preventDefault(); $('#view').focus(); } }, 'Skip to content'),
    h('header', { class: 'top' }, h('a', { class: 'brand', href: '#/', 'aria-label': 'Python Test Prep home' },
      h('span', { class: 'logo', 'aria-hidden': 'true' }, '>_'), h('span', { class: 'brand-t' }, h('b', null, 'Python Test Prep'), h('small', null, 'print · input · int · float · and beyond'))), navEl,
      h('a', { class: 'cheat-link', href: '#/cheat', title: 'Cheat sheet' }, '📋', h('span', { class: 'sr-only' }, 'Cheat sheet')), themeBtn, h('div', { class: 'xp-pill', id: 'xp', title: 'Experience points' })),
    h('main', { id: 'view', tabindex: '-1' }),
    h('footer', { class: 'foot' }, 'Made for 6th-grade Python learners. Answers are checked against real Python. No sign-in, nothing leaves your device. ', h('a', { href: '#/cheat' }, 'Cheat sheet')));
  paintTheme();
}
function paintTheme() { const b = $('#theme'); if (!b) return; const [ico, label] = THEME_LABEL[Store.data.theme]; b.textContent = ico; b.setAttribute('aria-label', label); b.title = label + ' (tap to change)'; }
function setActive(hash) {
  const skill = (/^#\/skill\/(\w+)/.exec(hash) || [])[1];
  const isLevel = hash.startsWith('#/level') || /^#\/(learn|drill)\/(7|8|9|1[0-3])$/.test(hash) || /^#\/(weak|mixed|kind\/(fix|write))\/level/.test(hash) || (skill && LEVEL_SKILLS.includes(skill));
  const practiceLike = /^#\/(practice|skill|weak|mixed|kind|endless|sprint|drill)/.test(hash);
  $$('.nav-a', navEl).forEach(a => {
    const to = a.dataset.to; let on;
    if (to === '#/') on = hash === '#/' || hash === '' || hash === '#';
    else if (to === '#/level') on = isLevel;
    else if (to === '#/learn') on = hash.startsWith('#/learn') && !isLevel;
    else if (to === '#/practice') on = practiceLike && !isLevel;
    else on = hash.startsWith(to);
    a.classList.toggle('on', !!on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const xp = $('#xp'); if (xp) xp.textContent = '⭐ ' + Store.data.xp;
}
async function route() {
  const hash = location.hash || '#/'; const view = $('#view'); view.textContent = '';
  const parts = hash.replace(/^#\/?/, '').split('/'); const [a, b, c] = parts;
  let node, title = 'Python Test Prep', isSession = false;
  try {
    if (!a) node = HomeView();
    else if (a === 'learn') { node = b ? LessonView(+b) : LearnView(); title = b ? 'Lesson ' + b : 'Lessons'; }
    else if (a === 'practice') { node = PracticeView(); title = 'Practice'; }
    else if (a === 'level') { node = LevelView(); title = 'Level Up'; }
    else if (a === 'drill') { const u = +b; node = PracticeSession({ title: `${unitTrack(u) === 'level' ? 'Level Up ' + (u - 6) : 'Unit ' + u} drill · ${unitTitle(u)}`, items: itemsForUnit(u, u === 6 ? 12 : 14), meta: { kind: 'unit', unit: u }, backHref: '#/learn/' + u, backLabel: 'Lesson' }); isSession = true; }
    else if (a === 'skill') { const pool = ITEMS.filter(i => i.skill === b); node = PracticeSession({ title: SKILL_NAMES[b] || b, items: mixPool(pool, 14), meta: { kind: 'skill' } }); isSession = true; }
    else if (a === 'weak') { const lv = b === 'level'; const w = weakItems(14, lv ? 'level' : 'test'); node = PracticeSession({ title: lv ? 'Level Up weak spots' : 'Weak-spot rescue', items: w.items, meta: { kind: 'weak' }, backHref: lv ? '#/level' : '#/practice' }); isSession = true; }
    else if (a === 'mixed') { const lv = b === 'level'; node = PracticeSession({ title: lv ? 'Level Up mixed practice' : 'Mixed practice', items: mixPool(ITEMS.filter(i => unitTrack(i.unit) === (lv ? 'level' : 'test')), 15), meta: { kind: 'mixed' } }); isSession = true; }
    else if (a === 'kind') { const k = b === 'write' ? 'write' : 'fix'; const lv = c === 'level'; node = PracticeSession({ title: (lv ? 'Level Up ' : '') + (k === 'fix' ? 'bug hunt' : 'code writer'), items: mixPool(ITEMS.filter(i => i.kind === k && unitTrack(i.unit) === (lv ? 'level' : 'test')), 8), meta: { kind: k } }); isSession = true; }
    else if (a === 'endless') { node = await EndlessSession(12); isSession = true; }
    else if (a === 'sprint') { node = await TypeSprint(); isSession = true; }
    else if (a === 'test') { node = b ? MockTest({ n: +b >= 20 ? 20 : 10, minutes: +b >= 20 ? 30 : 15, track: 'test' }) : TestHubView(); title = 'Mock test'; isSession = !!b; }
    else if (a === 'leveltest') { node = MockTest({ n: +b >= 20 ? 20 : 10, minutes: +b >= 20 ? 40 : 20, track: 'level' }); title = 'Level Up checkpoint'; isSession = true; }
    else if (a === 'play') { node = PlayView(); title = 'Playground'; }
    else if (a === 'cheat') { node = CheatView(b); title = 'Cheat sheet'; }
    else node = h('div', { class: 'card' }, 'Page not found. ', h('a', { href: '#/' }, 'Go home'));
  } catch (err) {
    console.error(err); node = h('div', { class: 'card' }, h('h2', null, 'Oops, something broke'), h('p', null, String(err && err.message || err)), h('a', { class: 'btn', href: '#/' }, 'Home'));
  }
  view.append(node); document.title = title === 'Python Test Prep' ? title : title + ' · Python Test Prep'; setActive(hash);
  window.scrollTo(0, 0);
  if (!isSession) { try { view.focus({ preventScroll: true }); } catch (e) {} }
}
window.route = route;
window.addEventListener('hashchange', route);
window.addEventListener('error', e => console.error('window error', e.message));
buildShell(); route();
