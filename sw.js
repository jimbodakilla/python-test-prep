/* Python Test Prep service worker: works offline after the first visit.
   Pages: network first (so updates arrive the moment you are online), cache as the fallback. */
const VERSION = '5e80aea990';
const CACHE = 'pyprep-' + VERSION;
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('pyprep-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const good = res => res && res.ok && res.type === 'basic' && /text\/html|javascript|json|image|font|css|manifest/.test(res.headers.get('content-type') || '');
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Network first, but never make a kid wait on slow school Wi-Fi: after 3s fall back to the saved copy. Only real HTML pages are saved.
    const net = fetch(req, { cache: 'no-cache' }).then(res => { if (good(res) && /text\/html/.test(res.headers.get('content-type') || '')) { const chk = res.clone(), copy = res.clone(); chk.text().then(t => { if (t.indexOf('pyprep.v1') > -1) caches.open(CACHE).then(c => c.put('./index.html', copy)); }); } return res; });
    const slow = new Promise(r => setTimeout(r, 3000)).then(() => caches.match('./index.html')).then(hit => hit || net);
    e.respondWith(Promise.race([net.catch(() => caches.match('./index.html')), slow]).then(r => r || caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (good(res)) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })));
});
