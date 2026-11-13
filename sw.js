// Central 30 · modo offline: guarda a Central e os jogos no aparelho para dar para jogar sem internet.
// Com internet vai buscar a versão nova primeiro (e guarda-a); se a internet estiver lenta ou não houver, usa a que está guardada.
const CACHE = 'central30-v11';
const CORE = ['./', 'index.html', 'escola/index.html', 'corrida/index.html', 'joaquim-3d/index.html', 'craques/index.html', 'liga/index.html', 'portugal/index.html', 'favicon.svg', 'apple-touch-icon.png', 'jogos/aa.html', 'jogos/rs.html', 'img/rs.jpg', 'jogos/pr.html', 'img/pr.jpg', 'jogos/ab.html', 'jogos/an.html', 'jogos/bf.html', 'jogos/cb.html', 'jogos/cl.html', 'jogos/cr.html', 'jogos/fb.html', 'jogos/mr.html', 'jogos/pn.html', 'jogos/sl.html', 'jogos/tb.html', 'jogos/ns.html', 'img/ns.jpg', 'engines/r128.js', 'engines/r134.js', 'img/aa.jpg', 'img/ab.jpg', 'img/an.jpg', 'img/bf.png', 'img/cb.jpg', 'img/cl.png', 'img/cm.jpg', 'img/cq.jpg', 'img/cr.png', 'img/ct.jpg', 'img/ea.jpg', 'img/fb.jpg', 'img/jc.jpg', 'img/lr.jpg', 'img/mr.png', 'img/pn.jpg', 'img/sl.jpg', 'img/tb.jpg'];
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
  const img = same && /\.(jpg|png|svg|webp)$/.test(url.pathname);
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {}); }
    return res;
  });
  const cached = () => caches.match(key).then(r => r || (same && req.mode === 'navigate' ? caches.match('index.html') : undefined));
  const fail = () => new Response('Sem internet e esta parte ainda não estava guardada.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  // imagens: a guardada logo (e atualiza por trás); o resto: a nova, mas se a internet demorar mais de 4 s usa a guardada
  if (img) { e.respondWith(cached().then(r => r || net).catch(() => net).catch(fail)); net.catch(() => {}); return; }
  e.respondWith(new Promise(resolve => {
    let done = false; const give = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => cached().then(give), 4000);
    net.then(r => { clearTimeout(t); give(r); }).catch(() => { clearTimeout(t); cached().then(r => give(r || fail())); });
  }));
});
