// minimal Chrome DevTools driver (no Playwright): launch, open, eval, screenshot, console capture
const { spawn } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
async function launch(port = 9333) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyprep-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--window-size=1200,900', 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) break; } catch (e) {} await new Promise(r => setTimeout(r, 250)); }
  async function newPage(url) {
    const t = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
    const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
    let id = 0; const pending = new Map(); const logs = []; const waiters = [];
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
      else if (m.method === 'Runtime.consoleAPICalled') { logs.push({ type: m.params.type, text: m.params.args.map(a => a.value ?? a.description ?? '').join(' ') }); }
      else if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; logs.push({ type: 'exception', text: (d.exception && d.exception.description) || d.text }); }
      else if (m.method === 'Page.loadEventFired') { waiters.splice(0).forEach(w => w()); }
    });
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
    await send('Runtime.enable'); await send('Page.enable');
    const page = {
      send, logs,
      async eval(expr) { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error('eval failed: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; },
      async goto(u) { const p = new Promise(r => waiters.push(r)); await send('Page.navigate', { url: u }); await p; await new Promise(r => setTimeout(r, 400)); },
      async viewport(w, h, mobile = false) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile }); if (mobile) await send('Emulation.setEmitTouchEventsForMouse', { enabled: true }); },
      async shot(file, full = false) { const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full }); fs.writeFileSync(file, Buffer.from(r.data, 'base64')); },
      async wait(ms) { await new Promise(r => setTimeout(r, ms)); },
      async waitFor(expr, ms = 5000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await page.eval(expr)) return true; } catch (e) {} await page.wait(100); } throw new Error('timeout waiting for ' + expr); },
      close() { ws.close(); },
    };
    return page;
  }
  return { newPage, kill() { proc.kill(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} } };
}
module.exports = { launch };
