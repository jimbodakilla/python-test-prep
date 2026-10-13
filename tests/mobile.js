const { launch } = require('./cdp.js'); const path = require('path');
const FRAME = 'file://' + path.resolve(__dirname, 'frame.html'); const OUT = process.argv[2] || '/tmp';
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.viewport(420, 870); await p.goto(FRAME); await p.wait(600);
    const go = async (hash, name) => { await p.eval(`(()=>{const f=document.getElementById('f');const n=f.cloneNode();n.src='../index.html?r='+Math.random()+'${hash}';f.replaceWith(n);n.id='f'})()`); await p.wait(1300); await p.shot(`${OUT}/${name}.png`); console.log('shot', name); };
    await go('#/', 'f-home'); await go('#/learn/4', 'f-lesson'); await go('#/drill/3', 'f-drill'); await go('#/play', 'f-play'); await go('#/test/10', 'f-test');
    await go('#/kind/write', 'f-write'); await go('#/sprint/type', 'f-sprint');
  } finally { p.close(); b.kill(); }
})();
