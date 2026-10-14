// Renders the app icons from the real Pip mascot (headless Chrome screenshots).
const { launch } = require('./cdp.js'); const path = require('path'); const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['apple-touch-icon', 180]]) {
      await p.send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false });
      await p.goto(URL);
      await p.eval(`(()=>{document.documentElement.setAttribute('data-theme','light');document.body.style.cssText='margin:0;overflow:hidden';document.body.innerHTML='<div id="ic" style="width:${size}px;height:${size}px;background:#6D3BFF;display:grid;place-items:center;position:relative;overflow:hidden"><div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.18),transparent 62%)"></div><div style="width:${Math.round(size * .74)}px;height:${Math.round(size * .74)}px;margin-top:${Math.round(size * .02)}px;position:relative">'+PIP_SVG.replace('data-mood="happy"','data-mood="cheer"')+'</div></div>';document.getElementById('ic').querySelector('svg').style.cssText='width:100%;height:100%'; const st=document.createElement('style');st.textContent='*{animation:none!important}';document.head.append(st);})()`);
      await p.wait(300);
      const r = await p.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
      fs.writeFileSync(path.resolve(__dirname, '../icons', name + '.png'), Buffer.from(r.data, 'base64')); console.log('wrote', name, size);
    }
  } finally { p.close(); b.kill(); }
})();
