const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = process.argv[2] || '/tmp'; const TAG = process.argv[3] || 'a';
const SCHEME = process.argv[4] || 'light';
(async () => {
  const b = await launch(); const p = await b.newPage('about:blank');
  try {
    await p.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: SCHEME }] });
    await p.viewport(1280, 820); await p.goto(URL);
    const go = async (hash, name, after) => { await p.eval(`location.hash='${hash}'`); await p.wait(800); if (after) await after(); await p.wait(250); await p.shot(`${OUT}/${TAG}-${name}.png`); };
    await go('#/', 'home');
    await p.eval('window.scrollTo(0, 0)');
    await go('#/learn/4', 'lesson', async () => p.eval('window.scrollTo(0, 300)'));
    await go('#/play', 'play', async () => { await p.eval(`(()=>{const t=document.querySelector('.ed-ta');t.value='age = 11\\nprint("Age: " + age)';t.dispatchEvent(new Event('input'));document.querySelector('.playground .btn.primary').click()})()`); await p.wait(500); });
    // a question: unanswered, then correct feedback, then wrong feedback
    await p.eval(`startItems('Demo', [ITEMS.find(i=>i.id==='2.1'), ITEMS.find(i=>i.id==='2.10'), ITEMS.find(i=>i.id==='4.12'), ITEMS.find(i=>i.id==='2.9')], {kind:'demo'})`); await p.wait(500); await p.shot(`${OUT}/${TAG}-q1.png`);
    await p.eval(`[...document.querySelectorAll('.opt')].find(b=>b.querySelector('.opt-t').textContent.trim()==='5').click()`); await p.eval(`[...document.querySelectorAll('.q-actions .btn')].find(b=>/Check/.test(b.textContent)).click()`); await p.wait(400); await p.shot(`${OUT}/${TAG}-q-correct.png`);
    await p.eval(`[...document.querySelectorAll('.q-actions .btn')].find(b=>/Next/.test(b.textContent)).click()`); await p.wait(300);
    await p.eval(`[...document.querySelectorAll('.opt')][0].click()`); await p.eval(`[...document.querySelectorAll('.q-actions .btn')].find(b=>/Check/.test(b.textContent)).click()`); await p.wait(400); await p.shot(`${OUT}/${TAG}-q-wrong.png`);
    // finish the round
    for (let i = 0; i < 14; i++) { await p.eval(`(()=>{const n=[...document.querySelectorAll('.q-actions .btn')].find(b=>/Next|results/.test(b.textContent));if(n){n.click();return}const o=document.querySelector('.opt');if(o){o.click();[...document.querySelectorAll('.q-actions .btn')].find(b=>/Check/.test(b.textContent))?.click()}})()`); await p.wait(350); if (await p.eval('!!document.querySelector(".summary")')) break; }
    await p.wait(500);
    await p.shot(`${OUT}/${TAG}-summary.png`);
    await p.viewport(390, 844, true);
    await go('#/', 'm-home'); await p.eval(`startItems('Demo', [ITEMS.find(i=>i.id==='4.12')], {kind:'demo'})`); await p.wait(500); await p.shot(`${OUT}/${TAG}-m-q.png`);
  } finally { p.close(); b.kill(); }
})();
