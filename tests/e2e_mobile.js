const { launch } = require('./cdp.js'); const path = require('path'); const { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..'); let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const port = 8800 + Math.floor(Math.random() * 100);
  const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 900));
  const URL = `http://127.0.0.1:${port}/index.html`;
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.viewport(390, 844, true); await p.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await p.goto(URL);
    // ---- bottom nav labels
    const nav = await p.eval(`(()=>{const a=[...document.querySelectorAll('.nav-a')].map(x=>({s:getComputedStyle(x.querySelector('.nav-s')).display,t:getComputedStyle(x.querySelector('.nav-t')).display,txt:x.querySelector('.nav-s').textContent,fs:parseFloat(getComputedStyle(x.querySelector('.nav-s')).fontSize),h:Math.round(x.getBoundingClientRect().height),w:Math.round(x.getBoundingClientRect().width)}));return {a,pos:getComputedStyle(document.querySelector('.nav')).position}})()`);
    ok(nav.pos === 'fixed' && nav.a.every(x => x.s === 'block' && x.t === 'none' && x.fs >= 12 && x.h >= 48 && x.w >= 44), 'bottom nav: fixed, short labels >= 12px, targets >= 44px: ' + JSON.stringify(nav.a.map(x => x.txt + ':' + x.w + 'x' + x.h)));
    // ---- mock test resume after a simulated tab discard
    await p.eval('location.hash="#/test/10"'); await p.wait(900);
    const picks = async () => p.eval(`(async()=>{let n=0;for(let i=0;i<3;i++){const o=document.querySelector('.opt');if(o){o.click();n++}await new Promise(r=>setTimeout(r,50));[...document.querySelectorAll('.btn')].find(b=>/Next/.test(b.textContent))?.click();await new Promise(r=>setTimeout(r,150))}return n})()`);
    await picks();
    await p.eval(`[...document.querySelectorAll('.btn')].find(b=>/Flag/.test(b.getAttribute('aria-label')||''))?.click()`); await p.wait(100);
    const before = await p.eval(`({answered:document.querySelectorAll('.nav-dot.ans').length, cur:[...document.querySelectorAll('.nav-dot')].findIndex(x=>x.classList.contains('cur')), flagged:document.querySelectorAll('.nav-dot.flag').length, time:document.querySelector('.timer').textContent.trim(), run:!!Store.getMock()})`);
    ok(before.answered >= 2 && before.run, 'test progress is saved as you go: ' + JSON.stringify(before));
    await p.wait(1500);
    await p.send('Page.reload'); await p.wait(1500);
    const prompt = await p.eval(`({h2:document.querySelector('.summary h1, .summary h2')?.textContent, btns:[...document.querySelectorAll('.btn')].map(b=>b.textContent.trim())})`);
    ok(/in progress/.test(prompt.h2 || '') && prompt.btns.some(b => /Resume/.test(b)), 'after a reload the app offers to resume: ' + JSON.stringify(prompt));
    await p.eval(`[...document.querySelectorAll('.btn')].find(b=>/Resume/.test(b.textContent)).click()`); await p.wait(700);
    const after = await p.eval(`({answered:document.querySelectorAll('.nav-dot.ans').length, cur:[...document.querySelectorAll('.nav-dot')].findIndex(x=>x.classList.contains('cur')), flagged:document.querySelectorAll('.nav-dot.flag').length, time:document.querySelector('.timer').textContent.trim(), selected:!!document.querySelector('.opt.sel')||!!document.querySelector('.typed-in')})`);
    ok(after.answered === before.answered && after.cur === before.cur && after.flagged === before.flagged, 'resume restores answers, flags and position: ' + JSON.stringify(after));
    const mm = t => { const [m, s] = t.split(':').map(Number); return m * 60 + s; };
    ok(mm(after.time) <= mm(before.time) - 1, `clock kept running while the page was gone (${before.time} -> ${after.time})`);
    // pause survives a reload
    await p.eval(`[...document.querySelectorAll('.btn')].find(b=>/Pause/.test(b.getAttribute('aria-label')||''))?.click()`); await p.wait(200);
    const tp = await p.eval(`document.querySelector('.timer').textContent.trim()`); await p.wait(2200);
    const tp2 = await p.eval(`document.querySelector('.timer').textContent.trim()`); ok(tp === tp2, `paused clock does not move (${tp} / ${tp2})`);
    // mock-nav is a single swipeable row on phones
    ok(await p.eval(`(()=>{const n=document.querySelector('.mock-nav');const cs=getComputedStyle(n);return cs.flexWrap==='nowrap'&&cs.overflowX==='auto'})()`), 'question picker is one swipeable row');
    // finishing clears the saved run
    await p.eval(`(async()=>{const bt=[...document.querySelectorAll('.btn')].find(b=>/Review/.test(b.textContent));if(!bt){document.querySelectorAll('.nav-dot')[9].click();await new Promise(r=>setTimeout(r,200))}[...document.querySelectorAll('.btn')].find(b=>/Review/.test(b.textContent)).click();await new Promise(r=>setTimeout(r,200));[...document.querySelectorAll('.btn')].find(b=>/Hand it in/.test(b.textContent)).click()})()`);
    await p.waitFor('!!document.querySelector(".summary")', 8000); ok(await p.eval('!Store.getMock()'), 'finishing the test clears the saved run');
    // ---- keyboard layout rule
    await p.eval(`startItems('K',[ITEMS.find(i=>i.kind==='typed')],{kind:'a'})`); await p.wait(400);
    await p.eval(`document.body.classList.add('kbd-open')`);
    const kb = await p.eval(`({pos:getComputedStyle(document.querySelector('.q-actions')).position, nav:getComputedStyle(document.querySelector('.nav')).display})`);
    ok(kb.pos === 'static' && kb.nav === 'none', 'keyboard open: action bar flows with the page, nav hides ' + JSON.stringify(kb));
    await p.eval(`document.body.classList.remove('kbd-open')`);
    const dock = await p.eval(`getComputedStyle(document.querySelector('.q-actions')).position`); ok(dock === 'fixed', 'keyboard closed: action bar is docked at the bottom (' + dock + ')');
    // ---- PWA: manifest, icons, service worker, offline
    const man = await p.eval(`fetch('manifest.webmanifest').then(r=>r.json()).then(j=>({name:j.name,display:j.display,icons:j.icons.length}))`); ok(man.display === 'standalone' && man.icons >= 2, 'manifest is valid: ' + JSON.stringify(man));
    await p.eval('location.hash="#/"'); await p.goto(URL); await p.wait(1500);
    const sw = await p.eval(`navigator.serviceWorker.ready.then(r=>!!r.active)`); ok(sw === true, 'service worker is active');
    await p.wait(800);
    const cached = await p.eval(`caches.keys().then(async ks=>{const c=await caches.open(ks[0]);return (await c.keys()).length})`); ok(cached >= 4, 'app shell is cached (' + cached + ' files)');
    await p.send('Network.enable'); await p.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await p.send('Page.reload'); await p.wait(1800);
    ok(await p.eval(`!!document.querySelector('h1') && document.querySelector('h1').textContent.length>3`), 'app loads fully OFFLINE: "' + await p.eval(`document.querySelector('h1')?.textContent`) + '"');
    const bad = p.logs.filter(l => ['error', 'exception'].includes(l.type) && !/Failed to load resource|ERR_INTERNET|net::/.test(l.text)); ok(bad.length === 0, 'no console errors ' + JSON.stringify(bad.slice(0, 2)));
  } catch (e) { console.log('CRASH', e.message); fails++; } finally { p.close(); b.kill(); srv.kill(); }
  console.log(fails ? `\n${fails} FAILURES` : '\nALL MOBILE E2E PASSED'); process.exit(fails ? 1 : 0);
})();
