/* app: router + shell */
'use strict';
const NAV = [['#/', 'Home', 'home', 'Home'], ['#/learn', 'Learn', 'book', 'Learn'], ['#/practice', 'Practice', 'target', 'Practice'], ['#/level', 'Level Up', 'rocket', 'Level Up'], ['#/test', 'Mock test', 'test', 'Test'], ['#/play', 'Playground', 'code', 'Play']];
let navEl;
const THEME_NEXT = { undefined: 'light', light: 'dark', dark: undefined };
const THEME_LABEL = { undefined: ['auto', 'Theme: automatic'], light: ['sun', 'Theme: light'], dark: ['moon', 'Theme: dark'] };

function lvlRing(info, size = 32) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  const w = h('span', { class: 'lvl-ring' }); w.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="4"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--violet)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.max(.04, info.frac))}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
  w.append(h('b', null, String(info.n))); return w;
}
function buildShell() {
  const app = $('#app'); app.textContent = '';
  navEl = h('nav', { class: 'nav', 'aria-label': 'Main' },
    NAV.map(n => h('a', { href: n[0], class: 'nav-a', dataset: { to: n[0] }, 'aria-label': n[1] }, icon(n[2]), h('span', { class: 'nav-t', 'aria-hidden': 'true' }, n[1]), h('span', { class: 'nav-s', 'aria-hidden': 'true' }, n[3]))));
  const themeBtn = h('button', { type: 'button', class: 'icon-btn', id: 'theme', onclick: () => { Store.data.theme = THEME_NEXT[Store.data.theme]; Store.save(); applyTheme(); paintTheme(); toast(THEME_LABEL[Store.data.theme][1]); } });
  app.append(
    h('a', { class: 'skip', href: '#view', onclick: e => { e.preventDefault(); $('#view').focus(); } }, 'Skip to content'),
    h('header', { class: 'top' }, h('a', { class: 'brand', href: '#/', 'aria-label': 'Python Test Prep home' },
      Pip('happy', 42), h('span', { class: 'brand-t' }, h('b', null, 'Python Test Prep'), h('small', null, 'print · input · int · float · and beyond'))), navEl,
      h('div', { class: 'hud', id: 'hud' }), h('a', { class: 'icon-btn cheat-link', href: '#/cheat', title: 'Cheat sheet' }, icon('sheet'), h('span', { class: 'sr-only' }, 'Cheat sheet')), themeBtn),
    h('main', { id: 'view', tabindex: '-1' }),
    h('footer', { class: 'foot' }, 'Made for 6th-grade Python learners. Answers are checked against real Python. No sign-in, nothing leaves your device. ', h('a', { href: '#/cheat' }, 'Cheat sheet'), ' · ', h('a', { href: '#/badges' }, 'Badges')));
  paintTheme(); paintChrome();
}
function paintTheme() { const b = $('#theme'); if (!b) return; const [ic, label] = THEME_LABEL[Store.data.theme]; b.textContent = ''; b.append(icon(ic)); b.setAttribute('aria-label', label); b.title = label + ' (tap to change)'; }
function paintChrome(bump) {                 // streak + level pills in the header
  const hud = $('#hud'); if (!hud) return;
  const info = levelInfo(Store.data.xp), st = dayStreak();
  hud.textContent = '';
  hud.append(
    h('a', { class: 'hud-pill' + (st ? '' : ' off'), href: '#/badges', title: st ? `${st}-day streak: practice again tomorrow to keep it` : 'Practice today to start a streak', 'aria-label': st ? `${st} day streak` : 'No streak yet' }, icon('flame', 'hud-flame'), h('span', null, String(st))),
    h('a', { class: 'hud-pill hud-lvl', href: '#/badges', title: `Level ${info.n}: ${info.name} · ${Store.data.xp} XP` + (info.next ? ` · ${info.next - Store.data.xp} XP to ${info.nextName}` : ''), 'aria-label': `Level ${info.n}, ${info.name}, ${Store.data.xp} XP` }, lvlRing(info), h('span', { class: 'lvl-name' }, info.name)));
}
window.paintChrome = paintChrome;
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
  paintChrome();
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
    else if (a === 'badges') { node = BadgesView(); title = 'Badges & levels'; }
    else if (a === 'drill') { const u = +b; node = PracticeSession({ title: `${unitTrack(u) === 'level' ? 'Level Up ' + (u - 6) : 'Unit ' + u} drill · ${unitTitle(u)}`, items: itemsForUnit(u, u === 6 ? 12 : 14), meta: { kind: 'unit', unit: u }, backHref: '#/learn/' + u, backLabel: 'Lesson' }); isSession = true; }
    else if (a === 'skill') { const pool = ITEMS.filter(i => i.skill === b); node = PracticeSession({ title: SKILL_NAMES[b] || b, items: mixPool(pool, 14), meta: { kind: 'skill' } }); isSession = true; }
    else if (a === 'weak') { const lv = b === 'level'; const w = weakItems(14, lv ? 'level' : 'test'); node = PracticeSession({ title: lv ? 'Level Up weak spots' : 'Weak-spot rescue', items: w.items, meta: { kind: 'weak' }, backHref: lv ? '#/level' : '#/practice' }); isSession = true; }
    else if (a === 'mixed') { const lv = b === 'level'; node = PracticeSession({ title: lv ? 'Level Up mixed practice' : 'Mixed practice', items: mixPool(ITEMS.filter(i => unitTrack(i.unit) === (lv ? 'level' : 'test')), 15), meta: { kind: 'mixed' } }); isSession = true; }
    else if (a === 'kind') { const k = b === 'write' ? 'write' : 'fix'; const lv = c === 'level'; node = PracticeSession({ title: (lv ? 'Level Up ' : '') + (k === 'fix' ? 'bug hunt' : 'code writer'), items: mixPool(ITEMS.filter(i => i.kind === k && unitTrack(i.unit) === (lv ? 'level' : 'test')), 8), meta: { kind: k } }); isSession = true; }
    else if (a === 'endless') { node = await EndlessSession(12); isSession = true; }
    else if (a === 'sprint') { node = await TypeSprint(); isSession = true; }
    else if (a === 'test' || a === 'leveltest') {
      const track = a === 'test' ? 'test' : 'level'; const size = +b >= 20 ? 20 : 10; const mins = track === 'test' ? (size >= 20 ? 30 : 15) : (size >= 20 ? 40 : 20);
      title = track === 'test' ? 'Mock test' : 'Level Up checkpoint';
      if (a === 'test' && !b) { node = TestHubView(); }
      else {
        const saved = pendingMock(); isSession = true;
        if (saved) node = ResumePrompt(saved, () => { Store.clearMock(); route(); }, () => {
          try { view.textContent = ''; view.append(MockTest({ n: saved.n, minutes: saved.minutes, track: saved.track, resume: saved })); toTop(); }
          catch (err) { console.error(err); Store.clearMock(); toast('That saved test could not be reopened. Starting a fresh one.'); route(); }
        });
        else node = MockTest({ n: size, minutes: mins, track });
      }
    }
    else if (a === 'play') { node = PlayView(); title = 'Playground'; }
    else if (a === 'cheat') { node = CheatView(b); title = 'Cheat sheet'; }
    else node = h('div', { class: 'card' }, 'Page not found. ', h('a', { href: '#/' }, 'Go home'));
  } catch (err) {
    console.error(err); node = h('div', { class: 'card' }, h('h2', null, 'Oops, something broke'), h('p', null, String(err && err.message || err)), h('a', { class: 'btn', href: '#/' }, 'Home'));
  }
  document.body.classList.toggle('in-session', isSession);
  view.append(node); document.title = title === 'Python Test Prep' ? title : title + ' · Python Test Prep'; setActive(hash);
  toTop();
  if (!isSession) { try { view.focus({ preventScroll: true }); } catch (e) {} }
}
window.route = route;
window.addEventListener('hashchange', route);
window.addEventListener('error', e => console.error('window error', e.message));
/* on-screen keyboard: when it opens, stop floating the action bar over the input */
if (window.visualViewport) {
  const vv = window.visualViewport;
  const upd = () => { if (vv.scale && Math.abs(vv.scale - 1) > .01) { document.body.classList.remove('kbd-open'); document.documentElement.style.setProperty('--kb', '0px'); return; }   // pinch-zoom is not a keyboard
    const ae = document.activeElement; const typing = ae && /^(input|textarea|select)$/i.test(ae.tagName); const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); document.documentElement.style.setProperty('--kb', kb + 'px'); const open = !!typing && kb > 100; const was = document.body.classList.contains('kbd-open'); document.body.classList.toggle('kbd-open', open);
    if (open && !was && ae && ae.dispatchEvent) setTimeout(() => ae.dispatchEvent(new Event('revealcaret')), 60); };
  vv.addEventListener('resize', upd); vv.addEventListener('scroll', upd);
  document.addEventListener('focusout', () => setTimeout(upd, 120));
}
buildShell(); route();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
