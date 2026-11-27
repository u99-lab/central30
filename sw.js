// Central 30 · modo offline: guarda a Central e os jogos no aparelho para dar para jogar sem internet.
// Com internet vai buscar a versão nova primeiro (e guarda-a); sem internet usa a guardada; com internet muito lenta (mais de 15 s) usa a guardada e avisa quando chegar a nova.
const CACHE = 'central30-v108';
const CORE = ['./', 'index.html', 'max/', 'max/index.html', 'max/favicon.svg', 'max/apple-touch-icon.png', 'escola/index.html', 'corrida/index.html', 'joaquim-3d/index.html', 'craques/index.html', 'liga/index.html', 'portugal/index.html', 'portugal/world/_paises.json', 'favicon.svg', 'apple-touch-icon.png', 'jogos/aa.html', 'jogos/rs.html', 'img/rs.jpg', 'jogos/pr.html', 'img/pr.jpg', 'jogos/ab.html', 'jogos/an.html', 'jogos/bf.html', 'jogos/cb.html', 'jogos/cl.html', 'jogos/cr.html', 'jogos/fb.html', 'jogos/mr.html', 'jogos/pn.html', 'jogos/sl.html', 'jogos/tb.html', 'jogos/ns.html', 'img/ns.jpg', 'jogos/be.html', 'jogos/be.html?v=108', 'img/be.jpg', 'engines/r160.js', 'engines/r128.js', 'engines/r134.js', 'img/aa.jpg', 'img/ab.jpg', 'img/an.jpg', 'img/bf.png', 'img/cb.jpg', 'img/cl.png', 'img/cm.jpg', 'img/cq.jpg', 'img/cr.png', 'img/ct.jpg', 'img/ea.jpg', 'img/fb.jpg', 'img/jc.jpg', 'img/lr.jpg', 'img/mr.png', 'img/pn.jpg', 'img/sl.jpg', 'img/tb.jpg'];
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
  const versionedGame = same && /\/jogos\/be\.html$/.test(url.pathname) && url.searchParams.has('v');
  const key = same ? new Request(url.origin + url.pathname + (versionedGame ? url.search : ''), { credentials: 'same-origin' }) : req;
  const img = same && /\.(jpg|png|svg|webp)$/.test(url.pathname);
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {}); }
    return res;
  });
  // sem internet: cada central abre a sua página guardada (antes a MAX podia abrir a Central 30 normal)
  const home = /\/max\//.test(url.pathname) ? 'max/index.html' : (/\/aprender\//.test(url.pathname) ? 'aprender/index.html' : 'index.html');
  const cached = () => caches.match(key).then(r => r || (same && req.mode === 'navigate' ? caches.match(home) : undefined));
  const fail = () => new Response('Sem internet e esta parte ainda não estava guardada.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  // imagens: a guardada logo (e atualiza por trás); o resto: a nova, mas se a internet demorar mais de 4 s usa a guardada
  if (img) { e.respondWith(cached().then(r => r || net).catch(() => net).catch(fail)); net.catch(() => {}); return; }
  // com internet lenta espera até 15 s pela versão nova; se mesmo assim tiver de usar a guardada, avisa quando a nova chegar
  let servedOld = false;
  e.respondWith(new Promise(resolve => {
    let done = false; const give = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => cached().then(r => { if (r) servedOld = true; give(r); }), 15000);
    net.then(r => { clearTimeout(t); give(r); }).catch(() => { clearTimeout(t); cached().then(r => give(r || fail())); });
  }));
  e.waitUntil(net.then(r => { if (servedOld && r && r.ok) return self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage({ c30: 'updated', path: url.pathname }))); }).catch(() => {}));
});
