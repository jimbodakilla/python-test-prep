const { launch } = require('./cdp.js'); const path = require('path');
const FRAME = 'file://' + path.resolve(__dirname, 'frame.html'); const OUT = process.argv[2] || '/tmp';
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.viewport(420, 870); await p.goto(FRAME); await p.wait(600);
    const go = async (hash, name) => { await p.eval(`(()=>{const f=document.getElementById('f');const n=f.cloneNode();n.src='../index.html?r='+Math.random()+'${hash}';f.replaceWith(n);n.id='f'})()`); await p.wait(1300); await p.shot(`${OUT}/${name}.png`); console.log('shot', name); };
    await go('#/level', 'f-level'); await go('#/learn/9', 'f-lesson9'); await go('#/learn/11', 'f-lesson11'); await go('#/drill/9', 'f-drill9'); await go('#/learn', 'f-learn');
    await go('#/kind/write/level', 'f-write');
  } finally { p.close(); b.kill(); }
})();
