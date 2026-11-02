/* ⚠️ با هر انتشار نسخهٔ جدید، فقط همین عدد را تغییر بده (مثلاً 1.0.1) */
const VERSION = '1.0.0';
const CACHE = 'audit87-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.png'];

self.addEventListener('install', e => {
  // cache: 'reload' یعنی از شبکه تازه بگیر، نه از کش مرورگر
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(u => c.add(new Request(u, {cache: 'reload'}))))));
  // skipWaiting عمداً اینجا نیست؛ کاربر با دکمهٔ «به‌روزرسانی» تأیید می‌کند
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('audit87-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'GET_VERSION' && e.source) e.source.postMessage({version: VERSION});
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    // صفحه: اول شبکه (برای گرفتن نسخهٔ تازه)، اگر آفلاین بود از کش
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  // بقیه: اول کش
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })));
});
