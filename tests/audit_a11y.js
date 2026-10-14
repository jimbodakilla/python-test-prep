const { launch } = require('./cdp.js'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = process.argv[2] || '/tmp';
const axe = fs.readFileSync('/tmp/axe.min.js', 'utf8');
const ROUTES = ['#/level', '#/learn/9', '#/learn/11', '#/drill/9', '#/cheat/level', '#/leveltest/10', '#/', '#/learn', '#/learn/1', '#/learn/4', '#/practice', '#/drill/1', '#/drill/6', '#/test', '#/test/10', '#/play', '#/cheat', '#/sprint/type'];
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.goto(URL); await p.eval(axe);
    for (const scheme of ['light', 'dark']) {
      await p.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
      const seen = {};
      for (const r of ROUTES) {
        await p.eval(`location.hash='${r}'`); await p.wait(700);
        if (r === '#/sprint/type') { await p.eval('[...document.querySelectorAll(".btn")].find(b=>/Start/.test(b.textContent))?.click()'); await p.wait(300); }
        if (r === '#/drill/6' ) { await p.eval('document.querySelector(".opt")?.click()'); }
        const res = await p.eval(`axe.run(document,{resultTypes:['violations']}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,help:v.help,ex:v.nodes.slice(0,2).map(n=>n.html.slice(0,110)+' || '+(n.any[0]&&n.any[0].message||'').slice(0,160))})))`);
        for (const v of res) { const k = v.id; (seen[k] = seen[k] || { v, routes: [] }).routes.push(r); }
        if (scheme === 'light' && ['#/', '#/drill/1', '#/learn/4', '#/cheat'].includes(r)) { await p.shot(`${OUT}/light${r.replace(/[#/]/g, '_')}.png`, r === '#/' ); }
      }
      console.log(`\n=== ${scheme}: ${Object.keys(seen).length} violation types`);
      for (const [k, { v, routes }] of Object.entries(seen)) console.log(`- [${v.impact}] ${k}: ${v.help} (${v.n} nodes on ${routes.join(' ')})\n    ${v.ex.join('\n    ')}`);
    }
  } finally { p.close(); b.kill(); }
})();
