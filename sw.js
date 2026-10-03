/* Comic Toolbox Gym service worker. Generated asset list: run `node tools/build-sw.js` after adding files. */
const VERSION = 'ctg-2260477262';
const ASSETS = [
  "./",
  "css/style.css",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "index.html",
  "js/app.js",
  "js/content/builders.js",
  "js/content/cards-a.js",
  "js/content/cards-b.js",
  "js/content/cards-c.js",
  "js/content/ex-a.js",
  "js/content/ex-b.js",
  "js/content/ex-c.js",
  "js/content/ex-d.js",
  "js/content/fix-a.js",
  "js/content/fix-b.js",
  "js/content/lessons-a.js",
  "js/content/lessons-b.js",
  "js/content/lessons-c.js",
  "js/content/lessons-d.js",
  "js/content/lessons-e.js",
  "js/content/lessons.js",
  "js/content/prompts-a.js",
  "js/content/prompts-b.js",
  "js/content/prompts-c.js",
  "js/content/prompts-d.js",
  "js/content/quiz-a.js",
  "js/content/quiz-b.js",
  "js/content/quiz-c.js",
  "js/content/quiz-d.js",
  "js/core.js",
  "js/journal.js",
  "js/labs.js",
  "js/runners.js",
  "js/views.js",
  "manifest.webmanifest"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ctg-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') { const idx = await cache.match('index.html'); if (idx) return idx; }
      throw err;
    }
  }));
});
