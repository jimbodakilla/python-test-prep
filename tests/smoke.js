const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = process.argv[2] || '/tmp';
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.goto(URL);
    console.log('title:', await p.eval('document.title'), '| h1:', await p.eval('document.querySelector("h1")?.textContent'));
    await p.shot(OUT + '/home.png', true);
    console.log('console problems:', JSON.stringify(p.logs.filter(l => ['error', 'exception'].includes(l.type))));
  } finally { p.close(); b.kill(); }
})();
