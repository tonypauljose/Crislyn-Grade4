/* ==========================================================================
   MeasureQuest — service worker
   --------------------------------------------------------------------------
   Deliberately conservative, for one reason: this site is deployed by hand
   and read on a tablet that already caches aggressively. A normal cache-first
   worker would happily serve Crislyn yesterday's version of a lesson for
   days, and there would be no obvious way to tell.

   So:
   - NETWORK FIRST, always. The cache is only ever consulted when the network
     has actually failed, which is exactly what "usable offline" means and
     nothing more.
   - It handles ONLY the MeasureQuest files listed below. Every other request
     on the site — half-yearly.html, the dojo, the fonts, anything added
     later — is left completely alone, with no respondWith at all, so this
     worker cannot change how the rest of the portal behaves.
   - The cache name carries a version. Bump CACHE to retire the old one.
   ========================================================================== */

const CACHE = 'measurequest-v1';

const ASSETS = [
  'measurequest.html',
  'css/measurequest.css',
  'css/common.css',
  'data/mq-content.js',
  'data/mq-bank.js',
  'js/mq-engine.js',
  'js/mq-speak.js',
  'js/mq-activities.js',
  'js/mq-ui.js',
  'worksheets/mq-worksheet.html',
  'assets/images/mq-icon.svg',
  'manifest.webmanifest'
];

/* Absolute URLs of the files we own, worked out once from the worker's scope. */
const OWNED = new Set(ASSETS.map(p => new URL(p, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      /* One bad path must not stop the whole install, so they are added
         individually and failures are shrugged off. */
      .then(c => Promise.all(ASSETS.map(p => c.add(p).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  /* Strip the query so ?kind=mixed&seed=123 still matches the worksheet. */
  const url = new URL(req.url);
  const bare = url.origin + url.pathname;
  if (!OWNED.has(bare)) return;             /* not ours — stay out of the way */

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(bare, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(bare).then(hit => hit || caches.match('measurequest.html')))
  );
});
