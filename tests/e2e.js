const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = process.argv[2] || '/tmp';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.viewport(1200, 900);
    await p.goto(URL);
    // ---- lesson 3: run program with real input() ----
    await p.eval('location.hash="#/learn/3"'); await p.wait(500);
    await p.eval('document.querySelectorAll(".playground")[0].querySelector(".btn.primary").click()'); await p.wait(300);
    ok(await p.eval('!!document.querySelector(".playground .term-in")'), 'input() shows an inline text box');
    await p.eval('(()=>{const i=document.querySelector(".playground .term-in");i.value="Maya";i.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter"}))})()'); await p.wait(300);
    ok((await p.eval('document.querySelector(".playground .term").textContent')).includes('Hello Maya'), 'program printed "Hello Maya"');
    ok((await p.eval('document.querySelector(".playground .vars").textContent')).includes('name'), 'variable box shows name');
    // error try block (4th playground = n + 1 with str)
    const idx = await p.eval('[...document.querySelectorAll(".playground")].findIndex(x=>x.querySelector(".ed-ta").value.includes("n + 1"))');
    await p.eval(`document.querySelectorAll(".playground")[${idx}].querySelector(".btn.primary").click()`); await p.wait(300);
    await p.eval(`(()=>{const i=document.querySelectorAll(".playground")[${idx}].querySelector(".term-in");i.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter"}))})()`); await p.wait(400);
    const ex = await p.eval(`document.querySelectorAll(".playground")[${idx}].querySelector(".explain").textContent`);
    ok(/TypeError/.test(ex) && /text/i.test(ex), 'TypeError explained in plain English: ' + ex.slice(0, 90));
    ok(await p.eval(`!!document.querySelectorAll(".playground")[${idx}].querySelector(".ln-err")`), 'error line highlighted in editor');
    await p.eval(`document.querySelectorAll(".playground")[${idx}].scrollIntoView()`); await p.wait(200); await p.shot(OUT + '/lesson-error.png');
    // ---- step mode in lesson 2 ----
    await p.eval('location.hash="#/learn/2"'); await p.wait(500);
    const si = await p.eval('[...document.querySelectorAll(".playground")].findIndex(x=>x.querySelector(".ed-ta").value.includes("x = x + 1"))');
    await p.eval(`document.querySelectorAll(".playground")[${si}].querySelectorAll(".btn")[1].click()`); await p.wait(200);
    for (let i = 0; i < 3; i++) { await p.eval(`document.querySelectorAll(".playground")[${si}].querySelectorAll(".btn")[1].click()`); await p.wait(120); }
    const vs = await p.eval(`document.querySelectorAll(".playground")[${si}].querySelector(".vars").textContent`);
    ok(/x\s*=\s*5/.test(vs) || /x=5/.test(vs.replace(/\s/g,'')), 'step mode shows x = 5 after stepping: ' + vs.replace(/\s+/g,' '));
    // ---- practice session: answer correctly via data ----
    await p.eval('location.hash="#/drill/1"'); await p.wait(500);
    const q1 = await p.eval('document.querySelector(".q-prompt")?.textContent'); ok(!!q1, 'drill shows a question: ' + q1);
    // answer every question correctly by reading PYDATA key through displayed text
    let answered = 0, guard = 0;
    while (guard++ < 40) {
      const done = await p.eval('!!document.querySelector(".summary")'); if (done) break;
      const info = await p.eval(`(()=>{const k=[...document.querySelectorAll(".q")][0]; return k? k.className : ""})()`);
      const kind = (info.match(/q-(\w+)/) || [])[1];
      if (['out','know','fill','ty','line'].includes(kind)) {
        // pick an arbitrary option (first) - we test flow, not correctness
        await p.eval('document.querySelector(".opt").click()'); await p.wait(60);
        await p.eval('[...document.querySelectorAll(".q-actions .btn")].find(b=>/Check/.test(b.textContent)).click()'); await p.wait(250);
      } else if (kind === 'typed') {
        await p.eval('(()=>{const t=document.querySelector(".typed-in");t.value="zzz";t.dispatchEvent(new Event("input"))})()'); await p.wait(60);
        await p.eval('[...document.querySelectorAll(".q-actions .btn")].find(b=>/Check/.test(b.textContent)).click()'); await p.wait(250);
      } else if (kind === 'fix' || kind === 'write') {
        // type a wrong program, check 3 times, then it reveals
        for (let t = 0; t < 3; t++) {
          await p.eval('(()=>{const t=document.querySelector(".ed-ta");t.value="print(\\"x"+Math.random()+"\\")";t.dispatchEvent(new Event("input"))})()'); await p.wait(80);
          await p.eval('[...document.querySelectorAll(".q-actions .btn")].find(b=>/Check/.test(b.textContent)).click()'); await p.wait(500);
          if (await p.eval('!![...document.querySelectorAll(".q-actions .btn")].find(b=>/Next|results/.test(b.textContent))')) break;
        }
      }
      await p.eval('[...document.querySelectorAll(".q-actions .btn")].find(b=>/Next|results/.test(b.textContent))?.click()'); await p.wait(150);
      answered++;
    }
    ok(await p.eval('!!document.querySelector(".summary")'), `session reached summary after ${answered} answers (misses were re-queued)`);
    const sum = await p.eval('document.querySelector(".summary").textContent.slice(0,200)'); console.log('   summary:', sum.replace(/\s+/g, ' '));
    // ---- correct answer path: unit 3 first question, read key from PYDATA ----
    await p.eval('location.hash="#/drill/2"'); await p.wait(500);
    const res = await p.eval(`(async()=>{
      const out=[]; for(let n=0;n<8;n++){ const root=document.querySelector('.q'); if(!root) break;
        const kind=root.className.match(/q-(\\w+)/)[1];
        const code=(root.querySelector('.cb-code')||{}).textContent||'';
        const promptTxt=(document.querySelector('.q-prompt')||{}).textContent; const norm2=x=>x.replace(/\\s+/g,' ').trim(); const item=PYDATA.items.find(i=>i.unit===2 && i.kind===kind && (kind==='know' ? i.q===promptTxt : kind==='ty' ? norm2(code).endsWith('result = '+i.expr) : kind==='fill' ? norm2(code).replace(/\\?/,'___').replace(/ ___ /,'___')===norm2(i.code).replace(/ ___ /,'___') || true && norm2(i.code).split('___')[0].trim()===norm2(code).split('?')[0].trim() : norm2(i.code||'')===norm2(code)));
        if(!item){ out.push('?'+kind); break;}
        if(kind==='out'||kind==='know'||kind==='fill'){ const want=(kind==='out'?item.options:item.opts)[0]; const btn=[...document.querySelectorAll('.opt')].find(b=>b.querySelector('.opt-t').textContent.replace('💥 ','Error: ')===want.replace(/\\n/g,'')||b.querySelector('.opt-t').innerText.replace(/💥 (\\w+)/,'Error: $1').trim()===want.trim()); if(!btn){out.push('nobtn:'+want);break;} btn.click(); }
        else if(kind==='ty'){ [...document.querySelectorAll('.opt')].find(b=>b.textContent.replace(/[0-9💥 ]/g,'')===item.answer.replace(/Error/,'Error')).click(); }
        else { break; }
        await new Promise(r=>setTimeout(r,60));
        [...document.querySelectorAll('.q-actions .btn')].find(b=>/Check/.test(b.textContent)).click(); await new Promise(r=>setTimeout(r,250));
        out.push(document.querySelector('.feedback').classList.contains('ok')?'ok':'NO');
        [...document.querySelectorAll('.q-actions .btn')].find(b=>/Next|results/.test(b.textContent)).click(); await new Promise(r=>setTimeout(r,100));
      } return out.join(',');})()`);
    console.log('   correct-path:', res); ok(/^(ok,)*ok/.test(res) && !/NO|\?|nobtn/.test(res.split(',').slice(0,5).join(',')), 'choosing the keyed answer is graded correct');
    // ---- mock test ----
    await p.eval('location.hash="#/test/10"'); await p.wait(600);
    ok(await p.eval('document.querySelectorAll(".nav-dot").length') === 10, 'mini test has 10 questions');
    await p.eval('[...document.querySelectorAll(".btn")].find(b=>/Review/.test(b.textContent)||/Next/.test(b.textContent))?.click()'); await p.wait(200);
    await p.eval('location.hash="#/test/10"'); await p.wait(500);
    await p.shot(OUT + '/mock.png');
    // ---- type sprint ----
    await p.eval('location.hash="#/sprint/type"'); await p.wait(1500);
    await p.eval('[...document.querySelectorAll(".btn")].find(b=>/Start/.test(b.textContent)).click()'); await p.wait(400);
    ok(await p.eval('document.querySelectorAll(".opts-ty .opt").length') === 4, 'sprint shows 4 type buttons');
    await p.shot(OUT + '/sprint.png');
    // ---- endless ----
    await p.eval('location.hash="#/endless"'); await p.wait(900);
    ok(await p.eval('!!document.querySelector(".q-prompt")'), 'endless practice renders');
    // ---- cheat + play ----
    await p.eval('location.hash="#/cheat"'); await p.wait(300); ok(await p.eval('document.querySelectorAll(".cs").length') >= 8, 'cheat sheet has sections');
    await p.eval('location.hash="#/play"'); await p.wait(500); await p.shot(OUT + '/play.png');
    const bad = p.logs.filter(l => ['error', 'exception'].includes(l.type)); ok(bad.length === 0, 'no console errors ' + JSON.stringify(bad.slice(0, 3)));
  } catch (e) { console.log('CRASH', e.message); fails++; } finally { p.close(); b.kill(); }
  console.log(fails ? `\n${fails} FAILURES` : '\nALL E2E PASSED'); process.exit(fails ? 1 : 0);
})();
