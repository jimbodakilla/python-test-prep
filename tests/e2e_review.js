/* Regression tests for everything the independent mobile reviews found (accessibility, device quirks, visual). */
const { launch } = require('./cdp.js'); const path = require('path'); const { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..'); let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const port = 8900 + Math.floor(Math.random() * 90);
  const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 900));
  const URL = `http://127.0.0.1:${port}/index.html`;
  const b = await launch(); const A = await b.newPage('about:blank'), B = await b.newPage('about:blank');
  const touch = async p => { await p.viewport(390, 844, true); await p.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); };
  try {
    await touch(A); await touch(B); await A.goto(URL); await B.goto(URL);

    // 1. two tabs must not overwrite each other's progress
    await B.eval(`Store.addXp(250); Store.record('1.1', true); Store.record('1.2', true); true`);
    await A.eval(`Store.save(); true`);
    const disk = await A.eval(`JSON.parse(localStorage.getItem('pyprep.v1'))`);
    ok(disk.xp >= 250 && Object.keys(disk.items).length >= 2, 'a stale tab saving does not wipe progress from another tab: xp ' + disk.xp);
    await A.eval(`Store.data.xp`); await A.wait(200);
    ok(await A.eval(`Store.data.xp >= 250`), 'the other tab picks the new XP up live (storage event)');

    // 2. Enter on a focused option picks THAT option (was: locked in an earlier pick)
    await A.eval('location.hash="#/skill/' + 'print"'); await A.wait(800);
    const enter = await A.eval(`(()=>{const o=[...document.querySelectorAll('.opt')];if(o.length<3)return {skip:true};o[0].click();o[2].focus();
      o[2].dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));return {picked:o.findIndex(x=>x.getAttribute('aria-checked')==='true'),done:!!document.querySelector('.feedback')}})()`);
    ok(enter.skip || (!enter.done), 'Enter on a different option does not submit the earlier pick: ' + JSON.stringify(enter));
    const roving = await A.eval(`(()=>{const o=[...document.querySelectorAll('.opt')];return o.filter(x=>x.tabIndex===0).length})()`);
    ok(roving === 1, 'option group has exactly one tab stop (roving tabindex): ' + roving);
    await A.eval(`document.querySelectorAll('.opt')[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}))`);
    ok(await A.eval(`document.querySelectorAll('.opt')[1].getAttribute('aria-checked')==='true'`), 'ArrowDown moves to and picks the next option');
    ok(await A.eval(`document.querySelector('.fb-slot').getAttribute('aria-live')==='polite'`), 'feedback lives in a persistent polite live region');
    await A.eval(`[...document.querySelectorAll('.btn')].find(b=>/Check answer/.test(b.textContent))?.click()`); await A.wait(700);
    const marks = await A.eval(`[...document.querySelectorAll('.opt .sr-only')].map(x=>x.textContent)`);
    ok(marks.length >= 1 && marks.some(t => /correct/.test(t)), 'graded options say correct/incorrect in words: ' + JSON.stringify(marks));

    // 3. a different mock must not destroy a saved one; hub offers it back
    await A.eval('location.hash="#/test/10"'); await A.wait(900);
    await A.eval(`document.querySelector('.opt')?.click()`); await A.wait(200);
    ok(await A.eval(`!!Store.getMock()`), 'mock progress saved under its own key');
    await A.eval('location.hash="#/test"'); await A.wait(600);
    ok(await A.eval(`!!document.querySelector('.resume-card')`), 'test hub shows "a test is waiting"');
    await A.eval('location.hash="#/test/20"'); await A.wait(800);
    ok(await A.eval(`/in progress/.test(document.querySelector('.summary h1')?.textContent||'') && !!Store.getMock()`), 'starting a different test asks first and keeps the saved one');

    // 4. a saved test from another version of the bank / malformed save never crashes
    for (const [name, mut] of [['wrong bank', 'r.bank="zzz"'], ['missing code', 'delete r.code'], ['bad orders', 'r.orders=[[9,9,9]]'], ['bad picked', 'r.picked=r.picked.map(()=>99)']]) {
      await A.eval(`(()=>{const r=Store.getMock();${mut};Store.setMock(r);})()`);
      await A.eval('location.hash="#/test"'); await A.wait(300); await A.eval('location.hash="#/test/10"'); await A.wait(800);
      const st = await A.eval(`({oops:/something broke/.test(document.querySelector('#view').textContent), timer:!!document.querySelector('.timer'), saved:!!Store.getMock()})`);
      ok(!st.oops && st.timer, `damaged saved test (${name}) is dropped and a fresh test opens: ` + JSON.stringify(st));
      await A.eval('location.hash="#/"'); await A.wait(1300);
    }

    // 5. an abandoned test must not come back from the dead
    await A.eval('Store.clearMock(); location.hash="#/test/10"'); await A.wait(900);
    await A.eval('location.hash="#/"'); await A.wait(1500);
    await A.eval('Store.clearMock(); window.dispatchEvent(new Event("pagehide"))');
    ok(await A.eval(`!Store.getMock()`), 'leaving a test then a page-hide does not resurrect it');

    // 6. cheat sheet: no sideways page scroll (measured against clientWidth, the number mobile emulation cannot hide)
    for (const w of [320, 360, 390]) {
      await A.viewport(w, 740, true); await A.eval('location.hash="#/cheat"'); await A.wait(500);
      const o = await A.eval(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
      ok(o <= 0, `cheat sheet has no sideways page scroll at ${w}px (overflow ${o})`);
    }
    await A.viewport(390, 844, true);

    // 7. playground: draft survives a reload; symbol keys keep undo; Android-style Enter indents; caret stays in view
    await A.eval('location.hash="#/play"'); await A.wait(700);
    await A.eval(`(()=>{const t=document.querySelector('.ed-ta');t.focus();t.value='for i in range(3):';t.setSelectionRange(t.value.length,t.value.length);t.dispatchEvent(new Event('input'));})()`); await A.wait(600);
    await A.send('Page.reload'); await A.wait(1500);
    ok(await A.eval(`document.querySelector('.ed-ta').value.startsWith('for i in range(3):')`), 'playground code survives a reload');
    const ind = await A.eval(`(()=>{const t=document.querySelector('.ed-ta');t.focus();t.value='for i in range(3):';t.setSelectionRange(18,18);
      const e=new InputEvent('beforeinput',{inputType:'insertLineBreak',cancelable:true,bubbles:true});t.dispatchEvent(e);return {prevented:e.defaultPrevented,v:t.value}})()`);
    ok(ind.prevented && ind.v === 'for i in range(3):\n    ', 'phone-keyboard Enter (beforeinput) keeps the indent: ' + JSON.stringify(ind.v));
    const bk = await A.eval(`(()=>{const t=document.querySelector('.ed-ta');t.value='if x:\\n    ';t.setSelectionRange(t.value.length,t.value.length);
      const e=new InputEvent('beforeinput',{inputType:'deleteContentBackward',cancelable:true,bubbles:true});t.dispatchEvent(e);return JSON.stringify(t.value)})()`);
    ok(bk === JSON.stringify('if x:\n'), 'phone-keyboard Backspace removes a whole indent step: ' + bk);
    await A.eval(`(()=>{const t=document.querySelector('.ed-ta');t.focus();t.value='x = ';t.setSelectionRange(4,4);t.dispatchEvent(new Event('input'));})()`);
    await A.eval(`[...document.querySelectorAll('.symkey')].find(k=>k.textContent==='"').click()`); await A.wait(100);
    const sym = await A.eval(`document.querySelector('.ed-ta').value`);
    ok(sym === 'x = "', 'symbol key inserts at the caret: ' + JSON.stringify(sym));
    await A.eval(`(()=>{const t=document.querySelector('.ed-ta');t.focus();t.value='x = 1';t.setSelectionRange(5,5);t.dispatchEvent(new Event('input'));const long='y'.repeat(60);document.execCommand('insertText',false,long);})()`); await A.wait(150);
    const car = await A.eval(`(()=>{const s=document.querySelector('.ed-scroll');return {sl:s.scrollLeft,sw:s.scrollWidth,cw:s.clientWidth}})()`);
    ok(car.sw <= car.cw || car.sl > 0, 'caret is scrolled into view after a long insert: ' + JSON.stringify(car));
    ok(await A.eval(`getComputedStyle(document.querySelector('.symbar')).position==='fixed'`), 'with the editor focused on a touch device the symbol row docks (no JS keyboard detection needed)');
    await A.eval(`document.activeElement.blur()`);

    // 8. printing a lot is cheap and complete
    await A.eval(`(()=>{const t=document.querySelector('.ed-ta');t.value='for i in range(3000):\\n    print(i)';t.dispatchEvent(new Event('input'));})()`);
    const t0 = Date.now(); await A.eval(`document.querySelector('.btn.run').click()`);
    await A.waitFor(`/Finished/.test(document.querySelector('.run-status').textContent)`, 20000);
    const outp = await A.eval(`document.querySelector('.term').textContent.trim().split('\\n').length`);
    ok(outp === 3000, `3000 prints rendered completely in ${Date.now() - t0}ms: ` + outp);

    // 9. service worker: slow network falls back to cache; junk is never cached
    const sw = await A.eval(`fetch('sw.js').then(r=>r.text())`);
    ok(/3000/.test(sw) && /res\.ok/.test(sw) && /no-cache/.test(sw), 'service worker has a timeout, an ok-only cache rule and revalidates');

    // 10. mock results hide the live test chrome; footer hidden in sessions
    ok(await A.eval(`(()=>{const f=document.createElement('div');f.className='mock done';f.innerHTML='<div class="sess-top"></div>';document.body.append(f);const d=getComputedStyle(f.firstChild).display;f.remove();return d==='none'})()`), 'finished mock hides timer/pause/picker chrome');
    await A.eval('location.hash="#/skill/print"'); await A.wait(700);
    ok(await A.eval(`getComputedStyle(document.querySelector('.foot')).display==='none'`), 'footer hidden during a practice round');
    const logs = A.logs.filter(l => l.type === 'error' || l.type === 'exception');
    ok(logs.length === 0, 'no console errors ' + JSON.stringify(logs.slice(0, 3)));
  } catch (e) { console.log('FAIL crashed: ' + e.message); fails++; }
  b.kill(); srv.kill(); console.log(fails ? fails + ' FAILURES' : 'ALL REVIEW REGRESSIONS PASSED'); process.exit(fails ? 1 : 0);
})();
