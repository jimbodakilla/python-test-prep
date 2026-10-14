const { launch } = require('./cdp.js'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.goto(URL);
    const r = await p.eval(`(async()=>{
      const bad=[]; let n=0;
      const keyOf = async (code,stdin)=>{ const {out,res}=await silentRun(code,stdin||[]); const o=norm(out); return res.error ? (o? o+'\\nError: '+res.error.type : 'Error: '+res.error.type) : o; };
      for (const it of ITEMS) { n++;
        if (it.kind==='out') { const k=await keyOf(it.code,it.stdin); if(k!==it.options[0]) bad.push([it.id,'out',k,it.options[0]]); }
        else if (it.kind==='typed') { const k=await keyOf(it.code,it.stdin); if(k!==it.answer) bad.push([it.id,'typed',k,it.answer]); }
        else if (it.kind==='ty') { const t=await typeOf(it.expr,it.setup,it.stdin); if(t!==it.answer) bad.push([it.id,'ty',t,it.answer]); }
        else if (it.kind==='line') { const {res}=await silentRun(it.code,it.stdin); const a=res.error? res.error.line-1 : -1; if(a!==it.answer) bad.push([it.id,'line',a,it.answer]); }
        else if (it.kind==='fill') { const k=await keyOf(it.code.replace('___',it.opts[0]),it.stdin); if(k!==it.want) bad.push([it.id,'fill',k,it.want]);
           for (const w of it.opts.slice(1)) { const kk=await keyOf(it.code.replace('___',w),it.stdin); if(kk===it.want) bad.push([it.id,'fill-wrong-passes',w]); } }
        else if (it.kind==='fix'||it.kind==='write') {
          const g=await gradeCode(it, it.solution); if(!g.ok) bad.push([it.id,'solution fails grader', JSON.stringify(g.tests.map(t=>t.got)), JSON.stringify(g.must)]);
          for (const [ai,alt] of (it.alts||[]).entries()){ const ga=await gradeCode(it, alt); if(!ga.ok) bad.push([it.id,'ALT '+ai+' fails grader', JSON.stringify(ga.tests.filter(t=>!t.pass).map(t=>[t.stdin,t.expect,t.got,t.error&&t.error.type])), JSON.stringify(ga.must)]); }
          if (it.kind==='fix'){ const g2=await gradeCode(it, it.buggy); if(g2.ok) bad.push([it.id,'buggy passes grader']); }
          if (it.kind==='write'){ const g3=await gradeCode(it, ''); if(g3.ok) bad.push([it.id,'EMPTY code passes grader']); }
        }
      }
      // generated questions -> dump for CPython cross-check
      const gen=[]; for(let i=0;i<1500;i++){ const o=await genOutputItem(); gen.push({code:o.code,stdin:o.stdin,expect:o.answer}); }
      const types=[]; for(let i=0;i<1500;i++){ const q=await genTypeQuestion(); types.push(q); }
      return {n,bad,gen,types};
    })()`);
    console.log('items checked:', r.n, '| problems:', r.bad.length); r.bad.slice(0, 20).forEach(x => console.log('  ', JSON.stringify(x)));
    fs.writeFileSync('tests/gen_dump.json', JSON.stringify({ gen: r.gen, types: r.types }));
  } finally { p.close(); b.kill(); }
})();
