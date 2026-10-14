// Mobile audit: many device sizes x many screens. Reports layout, touch-target, text-size and overlap problems.
const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = process.argv[2] || '/tmp'; const SHOT = process.argv[3] || '';
const DEVICES = [['iPhone SE 1', 320, 568], ['Android small', 360, 640], ['iPhone 8', 375, 667], ['iPhone 14', 390, 844], ['Pixel 7', 412, 915], ['iPhone Max', 430, 932], ['Phone landscape', 844, 390], ['Small landscape', 667, 375], ['iPad portrait', 768, 1024], ['iPad landscape', 1024, 768]];
const SCREENS = [
  ['home', "location.hash='#/'"], ['learn', "location.hash='#/learn'"], ['lesson4', "location.hash='#/learn/4'"], ['lesson9-trace', "location.hash='#/learn/9'"], ['practice', "location.hash='#/practice'"], ['level', "location.hash='#/level'"],
  ['badges', "location.hash='#/badges'"], ['play', "location.hash='#/play'"], ['cheat', "location.hash='#/cheat'"], ['testhub', "location.hash='#/test'"],
  ['q-out', "startItems('A',[ITEMS.find(i=>i.id==='2.1')],{kind:'a'})"], ['q-ty', "startItems('A',[ITEMS.find(i=>i.kind==='ty'&&i.choices)],{kind:'a'})"],
  ['q-typed', "startItems('A',[ITEMS.find(i=>i.kind==='typed')],{kind:'a'})"], ['q-fill', "startItems('A',[ITEMS.find(i=>i.kind==='fill')],{kind:'a'})"], ['q-line', "startItems('A',[ITEMS.find(i=>i.kind==='line')],{kind:'a'})"],
  ['q-write', "startItems('A',[ITEMS.find(i=>i.kind==='write'&&i.unit===4)],{kind:'a'})"], ['q-fix', "startItems('A',[ITEMS.find(i=>i.kind==='fix')],{kind:'a'})"],
  ['mock', "location.hash='#/test/20'"], ['sprint', "location.hash='#/sprint/type'"],
];
const METRICS = `(() => {
  const vw = document.documentElement.clientWidth, vh = innerHeight, res = { vw, ovX: document.documentElement.scrollWidth - document.documentElement.clientWidth, off: [], small: [], tiny: [], inputZoom: [], covered: [] };
  const desc = (e, r) => (e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).slice(0, 2).join('.') : '') + ' "' + (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 24) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
  const visible = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'; };
  for (const e of document.querySelectorAll('body *')) {
    if (e.classList && e.classList.contains('skip')) continue; if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue; const r = e.getBoundingClientRect(); if (!r.width) continue;
    if (r.right > vw + 1 || r.left < -1) { let a = e.parentElement, clipped = false; while (a && a !== document.body) { const o = getComputedStyle(a); if (['auto', 'scroll', 'hidden'].includes(o.overflowX)) { const ar = a.getBoundingClientRect(); if (ar.right <= vw + 1 && ar.left >= -1) { clipped = true; break; } } a = a.parentElement; } if (!clipped && visible(e)) res.off.push(desc(e, r)); }
  }
  const tg = 'a[href],button,input:not([type=hidden]):not([type=checkbox]),select,textarea,summary,[role=button],label:has(input[type=checkbox])';
  for (const e of document.querySelectorAll(tg)) {
    if (e.classList.contains('skip')) continue; if (!visible(e) || e.disabled) continue; const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > 4000) continue;
    const inline = getComputedStyle(e).display === 'inline' && e.closest('p,li,td,.footnote,.foot,.muted'); if (inline) continue;
    if (r.width < 44 || r.height < 44) res.small.push(desc(e, r));
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const seen = new Set();
  while ((n = walker.nextNode())) { if (!n.textContent.trim()) continue; const p = n.parentElement; if (!p || p.closest('svg,script,style') || seen.has(p)) continue; seen.add(p); if (!visible(p)) continue; const fs = parseFloat(getComputedStyle(p).fontSize); if (fs < 12) res.tiny.push(p.tagName.toLowerCase() + '.' + (p.className || '') + ' ' + fs + 'px "' + n.textContent.trim().slice(0, 18) + '"'); }
  for (const e of document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]),select,textarea')) { if (!visible(e)) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 16) res.inputZoom.push(e.tagName.toLowerCase() + '.' + e.className + ' ' + fs + 'px'); }
  // covered controls after scrolling to the bottom
  document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 1e6); void document.body.offsetHeight;
  // at the very bottom, the last content must clear every fixed bar
  const fixedBars = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && visible(e) && e.getBoundingClientRect().bottom >= vh - 2 && e.getBoundingClientRect().height > 20 && !e.classList.contains('skip') && e.id !== 'cele-host' && !e.classList.contains('confetti'));
  const barTop = fixedBars.length ? Math.min(...fixedBars.map(e => e.getBoundingClientRect().top)) : vh;
  const content = [...document.querySelectorAll('main#view *, .foot')].filter(e => visible(e) && !fixedBars.some(f => f.contains(e)));
  const lastBottom = Math.max(...content.map(e => e.getBoundingClientRect().bottom).filter(b => b <= vh + 4000), 0);
  if (lastBottom > barTop + 1 && !document.querySelector('.foot')) res.covered.push('LAST CONTENT hidden behind fixed bar by ' + Math.round(lastBottom - barTop) + 'px');
  const footEl = document.querySelector('.foot'); if (footEl && footEl.getBoundingClientRect().bottom - parseFloat(getComputedStyle(footEl).paddingBottom) > barTop + 1) res.covered.push('FOOTER text hidden behind fixed bar');
  for (const e of document.querySelectorAll(tg)) { if (false) continue; if (e.classList.contains('skip')) continue; if (!visible(e) || e.disabled) continue; const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) continue; const cx = r.left + r.width / 2, cy = Math.min(Math.max(r.top + r.height / 2, 1), vh - 1); const top = document.elementFromPoint(Math.min(Math.max(cx, 1), vw - 1), cy); if (top && top !== e && !e.contains(top) && !top.contains(e) && !(fixedBars.some(f => f.contains(top)) && r.top < barTop - 1 && false)) { const fullyUnder = r.top >= barTop - 1; if (fullyUnder) res.covered.push(desc(e, r) + ' <- ' + top.tagName.toLowerCase() + '.' + (typeof top.className === 'string' ? top.className : '')); } }
  window.scrollTo(0, 0);
  return res;
})()`;
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank'); const agg = {}; const perDev = [];
  try {
    await p.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    for (const [dn, w, h] of DEVICES) {
      await p.viewport(w, h, true); await p.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await p.goto(URL);
      const touch = await p.eval("matchMedia('(pointer:coarse)').matches + '/' + matchMedia('(hover:none)').matches");
      let line = `${dn.padEnd(16)} ${w}x${h} touch=${touch}`; let devIssues = 0;
      for (const [sn, act] of SCREENS) {
        try { await p.eval(act); await p.wait(sn === 'mock' || sn === 'sprint' ? 1100 : 600);
          if (sn === 'sprint') await p.eval('[...document.querySelectorAll(".btn")].find(b=>/Start/.test(b.textContent))?.click()');
          if (sn.startsWith('q-')) { await p.wait(200); }
          const m = await p.eval(METRICS);
          const issues = { overflowX: m.ovX > 0 ? [m.ovX + 'px'] : [], offscreen: m.off.slice(0, 6), smallTargets: m.small, tinyText: m.tiny, inputZoom: m.inputZoom, covered: m.covered };
          for (const [k, v] of Object.entries(issues)) for (const s of v) { const key = `${k} | ${s.replace(/ "[^"]*"/, '').replace(/\d+x\d+$/, '').replace(/ \d+(\.\d+)?px/, '').replace(/<- .*/, m => m)}`; (agg[key] = agg[key] || { n: 0, where: new Set(), sample: s }).n++; agg[key].where.add(`${sn}@${w}`); devIssues++; }
          if (SHOT && SHOT.split(',').includes(dn)) { if (sn.startsWith('q-') || ['home', 'lesson9-trace', 'play', 'mock', 'practice', 'level'].includes(sn)) await p.shot(`${OUT}/mob-${w}x${h}-${sn}.png`); }
        } catch (e) { line += `\n   !! ${sn}: ${e.message.slice(0, 100)}`; }
      }
      console.log(line + `  issues=${devIssues}`);
    }
    const rows = Object.entries(agg).sort((a, b) => b[1].n - a[1].n);
    console.log(`\n${rows.length} distinct issue signatures:`);
    for (const [k, v] of rows.slice(0, 80)) console.log(`${String(v.n).padStart(3)}x ${k.slice(0, 140)}\n       e.g. ${v.sample.slice(0, 110)}  [${[...v.where].slice(0, 4).join(', ')}]`);
  } finally { p.close(); b.kill(); }
})();
