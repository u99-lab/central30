// Central 30 · modo offline: guarda a Central e os jogos no aparelho para dar para jogar sem internet.
// Com internet vai sempre buscar a versão nova primeiro (e guarda-a); sem internet usa a que está guardada.
const CACHE = 'central30-v1';
const CORE = ['./', 'index.html', 'escola/index.html', 'corrida/index.html', 'figueira/index.html', 'joaquim-3d/index.html', 'craques/index.html', 'liga/index.html', 'cubolandia/index.html', 'favicon.svg', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!same && !font) return;
  // o "?v=…" dos links não conta: é sempre a mesma página
  const key = same ? new Request(url.origin + url.pathname, { credentials: 'same-origin' }) : req;
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(key).then(r => r || (same && req.mode === 'navigate' ? caches.match('index.html') : undefined)).then(r => r || new Response('Sem internet e esta parte ainda não estava guardada.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } })))
  );
});
