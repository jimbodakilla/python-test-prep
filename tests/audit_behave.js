const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html');
const log = (t, v) => console.log(t.padEnd(58), typeof v === 'string' ? v : JSON.stringify(v));
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.viewport(1200, 900); await p.goto(URL);
    // 1. editor overlay alignment
    await p.eval('location.hash="#/play"'); await p.wait(700);
    log('1 overlay vs textarea metrics equal', await p.eval(`(()=>{const e=document.querySelector('.ed-ta'),h=document.querySelector('.ed-hl');const a=getComputedStyle(e),c=getComputedStyle(h);
      const k=['fontFamily','fontSize','lineHeight','paddingLeft','paddingTop','letterSpacing','tabSize','whiteSpace'];const diff=k.filter(x=>a[x]!==c[x]).map(x=>x+':'+a[x]+' vs '+c[x]);
      return {diff, taW:e.clientWidth, preW:h.offsetWidth, taH:e.clientHeight, preH:h.offsetHeight}})()`));
    // 2. long line: caret visible? type a 200-char line
    await p.eval(`(()=>{const e=document.querySelector('.ed-ta');e.focus();e.value='print("'+'x'.repeat(200)+'")';e.setSelectionRange(e.value.length,e.value.length);e.dispatchEvent(new Event('input'))})()`); await p.wait(300);
    log('2 long line: scroller wider than box, textarea matches', await p.eval(`(()=>{const s=document.querySelector('.ed-scroll'),e=document.querySelector('.ed-ta'),h=document.querySelector('.ed-hl');return {scrollW:s.scrollWidth,clientW:s.clientWidth,taW:e.clientWidth,preW:h.offsetWidth}})()`));
    // 3. extra print before the answer in a write task (very likely kid mistake)
    log('3 grader on "print(Enter a number) + answer"', await p.eval(`(async()=>{const it=ITEMS.find(i=>i.id==='4.62');const g=await gradeCode(it,'print("Enter two numbers")\\na=int(input())\\nb=int(input())\\nprint(a+b)');
      const node=testResultsNode(g,it,''); return {ok:g.ok, tip:/extra|prompt|input\\(\\"/i.test(node.textContent), text:node.textContent.slice(0,160)}})()`));
    // 4. broken / blocked localStorage
    await p.eval(`localStorage.setItem('pyprep.v1','{not json')`); await p.goto(URL);
    log('4a corrupted storage -> app still loads', await p.eval('!!document.querySelector("h1")'));
    await p.eval(`localStorage.setItem('pyprep.v1','{"items":null,"sessions":"x","xp":"abc","mocks":7}')`); await p.goto(URL);
    log('4b wrong-shaped storage -> app loads', await p.eval('(()=>{try{return !!document.querySelector("h1")&&typeof Store.data.xp==="number"&&Array.isArray(Store.data.sessions)}catch(e){return String(e)}})()'));
    // 5. run twice quickly / stop during input
    await p.eval('location.hash="#/play"'); await p.wait(600);
    await p.eval(`(()=>{const pg=document.querySelector('.playground');const run=pg.querySelector('.btn.primary');run.click();run.click();run.click()})()`); await p.wait(500);
    log('5a triple Run -> exactly one input box', await p.eval('document.querySelectorAll(".term-in").length'));
    await p.eval(`document.querySelector('.playground .btn.ghost').click()`); await p.wait(300);
    log('5b Stop during input -> no box left, no error', await p.eval('({inputs:document.querySelectorAll(".term-in").length, status:document.querySelector(".run-status").textContent})'));
    // 6. output flood
    await p.eval(`(()=>{document.querySelector('.ed-ta').value='print("a"*1000000)\\nprint("b"*1000000)\\nprint("c"*1000000)';document.querySelector('.ed-ta').dispatchEvent(new Event('input'));document.querySelector('.playground .btn.primary').click()})()`); await p.wait(1500);
    log('6 flood: terminal chars / status', await p.eval('({chars:document.querySelector(".term").textContent.length,status:document.querySelector(".run-status").textContent})'));
    // 7. pasted code oddities
    log('7 BOM / tab / CRLF / emoji', await p.eval(`(async()=>{const r=[];for(const c of ['\\ufeffprint("hi")','print("a\\tb")\\r\\nprint("c")','print(len("😀"))','print("x") # comment','\\tprint("t")','x = 5 # five\\nprint(x)\\n\\n\\n','print("a",\\n "b")','print(\\n"a"\\n)']){let o='';const res=await PyFun.run(c,{write:s=>o+=s,input:async()=>null});r.push(res.error?res.error.type+':'+res.error.msg:JSON.stringify(o))}return r})()`));
    // 8. mock composition: 300 builds -> duplicates inside a single test? sizes?
    log('8 mock builds: dup signatures per test / sizes', await p.eval(`(()=>{let dups=0,bad=0;const sizes=new Set();for(let i=0;i<300;i++){const t=buildMock(20);sizes.add(t.length);const s=new Set();for(const it of t){const k=(it.code||it.expr||it.q||it.prompt)+'|'+(it.stdin||[]).join(',');if(s.has(k))dups++;s.add(k)}if(t.some(x=>x.unit>6))bad++}return {dups,sizes:[...sizes],bonusLeak:bad}})()`));
    log('8b mixPool/drill duplicate signatures (300 draws)', await p.eval(`(()=>{let dups=0;for(let u=1;u<=6;u++)for(let i=0;i<50;i++){const s=new Set();for(const it of itemsForUnit(u,14)){const k=(it.code||it.expr||it.q||it.prompt)+'|'+(it.stdin||[]).join(',');if(s.has(k))dups++;s.add(k)}}return dups})()`));
    // 9. mock leave & timer cleanup
    await p.eval('location.hash="#/test/10"'); await p.wait(700); await p.eval('location.hash="#/"'); await p.wait(2300);
    log('9 after leaving mock: no console errors', p.logs.filter(l=>['error','exception'].includes(l.type)).length);
    // 10. keyboard: digit selects, Enter checks, Enter again advances
    await p.eval('location.hash="#/drill/2"'); await p.wait(600);
    await p.eval(`document.body.focus();document.dispatchEvent(new KeyboardEvent('keydown',{key:'2',bubbles:true}))`); await p.wait(100);
    const selOk = await p.eval('!!document.querySelector(".opt.sel")');
    await p.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`); await p.wait(400);
    const fb = await p.eval('!!document.querySelector(".feedback")');
    await p.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))`); await p.wait(300);
    log('10 keyboard 2 -> Enter -> Enter', {selected: selOk, feedback: fb, advanced: await p.eval('document.querySelector(".sess-prog span").textContent')});
    // 11. double-click Check
    await p.eval('location.hash="#/drill/3"'); await p.wait(600);
    await p.eval(`document.querySelector('.opt').click();const c=[...document.querySelectorAll('.q-actions .btn')][0];c.click();c.click();c.click()`); await p.wait(500);
    log('11 triple Check -> one feedback, 1 XP award', await p.eval('({fb:document.querySelectorAll(".feedback").length, items:Object.keys(Store.data.items).length, xp:Store.data.xp})'));
    log('console problems', p.logs.filter(l => ['error', 'exception'].includes(l.type)));
  } finally { p.close(); b.kill(); }
})();
