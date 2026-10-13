/* app: router + shell */
'use strict';
const NAV = [['#/', 'Home', '🏠'], ['#/learn', 'Learn', '📘'], ['#/practice', 'Practice', '💪'], ['#/test', 'Mock test', '📝'], ['#/play', 'Playground', '🧪'], ['#/cheat', 'Cheat sheet', '📋']];
let navEl;
function buildShell() {
  const app = $('#app'); app.textContent = '';
  navEl = h('nav', { class: 'nav', 'aria-label': 'Main' },
    NAV.map(n => h('a', { href: n[0], class: 'nav-a', dataset: { to: n[0] } }, h('span', { class: 'nav-i', 'aria-hidden': 'true' }, n[2]), h('span', { class: 'nav-t' }, n[1]))));
  app.append(
    h('a', { class: 'skip', href: '#view', onclick: e => { e.preventDefault(); $('#view').focus(); } }, 'Skip to content'),
    h('header', { class: 'top' }, h('a', { class: 'brand', href: '#/', 'aria-label': 'Python Test Prep home' },
      h('span', { class: 'logo', 'aria-hidden': 'true' }, '>_'), h('span', { class: 'brand-t' }, h('b', null, 'Python Test Prep'), h('small', null, 'print · input · int · float'))), navEl, h('div', { class: 'xp-pill', id: 'xp', title: 'Experience points' })),
    h('main', { id: 'view', tabindex: '-1' }),
    h('footer', { class: 'foot' }, 'Made for 6th-grade Python learners. Answers are checked against real Python. No sign-in, nothing leaves your device.'));
}
function setActive(hash) {
  $$('.nav-a', navEl).forEach(a => {
    const to = a.dataset.to; const on = to === '#/' ? (hash === '#/' || hash === '' || hash === '#') : hash.startsWith(to) || (to === '#/practice' && /^#\/(drill|skill|weak|mixed|kind|endless|sprint)/.test(hash)) || (to === '#/test' && hash.startsWith('#/test'));
    a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const xp = $('#xp'); if (xp) xp.textContent = '⭐ ' + Store.data.xp;
}
async function route() {
  const hash = location.hash || '#/'; const view = $('#view'); view.textContent = '';
  const parts = hash.replace(/^#\/?/, '').split('/'); const [a, b] = parts;
  let node, title = 'Python Test Prep';
  try {
    if (!a) node = HomeView();
    else if (a === 'learn') { node = b ? LessonView(+b) : LearnView(); title = b ? 'Lesson ' + b : 'Lessons'; }
    else if (a === 'practice') { node = PracticeView(); title = 'Practice'; }
    else if (a === 'drill') { const u = +b; const l = D.lessons.find(x => x.n === u); node = PracticeSession({ title: `Unit ${u} drill · ${l ? l.title.split(' - ')[0] : ''}`, items: itemsForUnit(u, u === 6 ? 12 : 14), meta: { kind: 'unit', unit: u }, backHref: '#/learn/' + u, backLabel: 'Lesson' }); }
    else if (a === 'skill') { const pool = ITEMS.filter(i => i.skill === b); node = PracticeSession({ title: SKILL_NAMES[b] || b, items: mixPool(pool, 14), meta: { kind: 'skill' } }); }
    else if (a === 'weak') { const w = weakItems(14); node = PracticeSession({ title: 'Weak-spot rescue', items: w.items, meta: { kind: 'weak' } }); }
    else if (a === 'mixed') { node = PracticeSession({ title: 'Mixed practice', items: mixPool(ITEMS.filter(i => i.unit <= 6), 15), meta: { kind: 'mixed' } }); }
    else if (a === 'kind') { const k = b === 'write' ? 'write' : 'fix'; node = PracticeSession({ title: k === 'fix' ? 'Bug hunt' : 'Code writer', items: mixPool(ITEMS.filter(i => i.kind === k && i.unit <= 6), 8), meta: { kind: k } }); }
    else if (a === 'endless') { node = await EndlessSession(12); }
    else if (a === 'sprint') { node = await TypeSprint(); }
    else if (a === 'test') { node = b ? MockTest({ n: +b >= 20 ? 20 : 10, minutes: +b >= 20 ? 30 : 15 }) : TestHubView(); title = 'Mock test'; }
    else if (a === 'play') { node = PlayView(); title = 'Playground'; }
    else if (a === 'cheat') { node = CheatView(); title = 'Cheat sheet'; }
    else node = h('div', { class: 'card' }, 'Page not found. ', h('a', { href: '#/' }, 'Go home'));
  } catch (err) {
    console.error(err); node = h('div', { class: 'card' }, h('h2', null, 'Oops, something broke'), h('p', null, String(err && err.message || err)), h('a', { class: 'btn', href: '#/' }, 'Home'));
  }
  view.append(node); document.title = title === 'Python Test Prep' ? title : title + ' · Python Test Prep'; setActive(hash);
  window.scrollTo(0, 0);
}
window.route = route;
window.addEventListener('hashchange', route);
window.addEventListener('error', e => console.error('window error', e.message));
buildShell(); route();
