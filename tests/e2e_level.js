const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = process.argv[2] || '/tmp';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.viewport(1200, 900); await p.goto(URL);
    // 1. every lesson renders; trace tables fill
    for (const n of [7, 8, 9, 10, 11, 12, 13]) {
      await p.eval(`location.hash='#/learn/${n}'`); await p.wait(900);
      const r = await p.eval(`({h1:document.querySelector('h1')?.textContent, tries:document.querySelectorAll('.try .playground').length, traces:document.querySelectorAll('.trace').length,
        traceRows:[...document.querySelectorAll('.trace-tbl tbody')].map(t=>t.rows.length), shows:document.querySelectorAll('.show').length, branches:document.querySelectorAll('.branch').length, quicks:document.querySelectorAll('.quick').length})`);
      ok(r.h1 && r.tries >= 1 && r.traceRows.every(x => x > 0), `lesson ${n} "${r.h1}": ${r.tries} try, ${r.traces} trace (rows ${r.traceRows}), ${r.shows} show, ${r.branches} branch, ${r.quicks} quick`);
    }
    // 2. run every lesson Try-it: report crashes (several are deliberate)
    const rows = await p.eval(`(async()=>{const out=[];for(const L of D.lessons){for(const bl of L.blocks){if(bl[0]!=='try')continue;const tr=await transcript(bl[1],bl[2]);if(tr.res.error)out.push([L.n,tr.res.error.type,bl[1].split('\\n')[0].slice(0,50)])}}return out})()`);
    console.log('   try-blocks that crash (should all be deliberate):'); rows.forEach(r => console.log('    ', r.join(' | ')));
    // 3. level hub + drill + ty choices
    await p.eval('location.hash="#/level"'); await p.wait(700);
    ok(await p.eval('document.querySelectorAll(".road-node").length') === 7, 'Level Up roadmap shows 7 units'); await p.shot(OUT + '/level.png', true);
    await p.eval('location.hash="#/drill/8"'); await p.wait(600);
    ok(await p.eval('!!document.querySelector(".q-prompt")'), 'unit 8 drill renders');
    const tyInfo = await p.eval(`(()=>{const it=ITEMS.find(i=>i.kind==='ty'&&i.choices&&i.choices.includes('bool'));const inst=makeInst(it);const v=QView(inst,{});document.body.append(v.el);const t=[...v.el.querySelectorAll('.opts-ty .opt-t')].map(x=>x.textContent).join(',');v.el.remove();return it.expr+' -> '+t})()`);
    console.log('   ty choices rendered:', tyInfo); ok(/bool/.test(tyInfo), 'ty question offers bool choices');
    // 4. level checkpoint test
    await p.eval('location.hash="#/leveltest/10"'); await p.wait(800);
    ok(await p.eval('document.querySelectorAll(".nav-dot").length') >= 8, 'level mini-test builds (' + await p.eval('document.querySelectorAll(".nav-dot").length') + ' questions)');
    await p.eval(`(()=>{const f=[...document.querySelectorAll('.btn')].find(b=>/Review/.test(b.textContent));})()`);
    // 5. editor behaviours
    await p.eval('location.hash="#/play"'); await p.wait(700);
    const ed = async (code) => p.eval(`(()=>{const t=document.querySelector('.ed-ta');t.focus();t.value=${JSON.stringify(code)};t.setSelectionRange(t.value.length,t.value.length);t.dispatchEvent(new Event('input'));return true})()`);
    await ed('if x > 1:');
    await p.eval(`(()=>{const t=document.querySelector('.ed-ta');t.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))})()`);
    ok(await p.eval('document.querySelector(".ed-ta").value') === 'if x > 1:\n    ', 'Enter after a colon auto-indents 4 spaces');
    await p.eval(`(()=>{const t=document.querySelector('.ed-ta');t.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}))})()`);
    ok(await p.eval('document.querySelector(".ed-ta").value') === 'if x > 1:\n        ', 'Tab inserts 4 spaces');
    // 6. list boxes + infinite loop stop
    await ed('scores = [90, 72, 85]\nscores.append(100)\nprint(scores)');
    await p.eval('document.querySelector(".playground .btn.primary").click()'); await p.wait(500);
    ok(await p.eval('document.querySelectorAll(".cells .cell").length') === 4, 'list shows as 4 memory boxes');
    await p.shot(OUT + '/play-list.png');
    await ed('n = 0\nwhile True:\n    n = n + 1');
    const t0 = Date.now(); await p.eval('document.querySelector(".playground .btn.primary").click()'); await p.wait(400);
    await p.eval('[...document.querySelectorAll(".playground .btn")].find(b=>/Stop/.test(b.textContent)).click()'); await p.wait(300);
    const st = await p.eval('({status:document.querySelector(".run-status").textContent, stopDisabled:[...document.querySelectorAll(".playground .btn")].find(b=>/Stop/.test(b.textContent)).disabled})');
    ok(Date.now() - t0 < 4000 && st.stopDisabled, 'Stop ends an infinite loop quickly: ' + JSON.stringify(st));
    await ed('n = 0\nwhile True:\n    n = n + 1');
    await p.eval('document.querySelector(".playground .btn.primary").click()'); await p.waitFor('/stuck|too long/i.test(document.querySelector(".explain").textContent)', 15000);
    ok(true, 'unattended infinite loop is stopped by the time limit with an explanation');
    // 7. lesson 9 screenshot
    await p.eval('location.hash="#/learn/9"'); await p.wait(900); await p.eval('document.querySelector(".trace").scrollIntoView()'); await p.wait(200); await p.shot(OUT + '/lesson9.png');
    const bad = p.logs.filter(l => ['error', 'exception'].includes(l.type)); ok(bad.length === 0, 'no console errors ' + JSON.stringify(bad.slice(0, 3)));
  } catch (e) { console.log('CRASH', e.message); fails++; } finally { p.close(); b.kill(); }
  console.log(fails ? `\n${fails} FAILURES` : '\nALL LEVEL E2E PASSED'); process.exit(fails ? 1 : 0);
})();
