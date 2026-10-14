const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.goto(URL);
    const rows = await p.eval(`(async()=>{const out=[];for(const L of D.lessons){for(const bl of L.blocks){if(bl[0]!=='try')continue;const [,code,stdin]=bl;const tr=await transcript(code,stdin);
      const text=tr.parts.map(x=>x.s).join('').replace(/\\n/g,'⏎');out.push([L.n,code.replace(/\\n/g,' ⏎ ').slice(0,70),stdin.join(','),tr.res.error?('💥 '+tr.res.error.type):'ok',text.slice(0,70)])}}return out})()`);
    rows.forEach(r => console.log(r.join(' | ')));
    // typed answer: Enter key behaviour
    await p.eval('location.hash="#/drill/6"'); await p.wait(500);
    const info = await p.eval(`(()=>{let n=0;while(n++<20){const k=document.querySelector('.q');if(!k)break;if(k.className.includes('q-typed'))return 'typed found';document.querySelector('.opt')?.click();[...document.querySelectorAll('.q-actions .btn')].find(b=>/Check/.test(b.textContent))?.click();}return 'none'})()`);
    console.log('typed enter probe setup:', info);
  } finally { p.close(); b.kill(); }
})();
