// Central 30 · modo offline: guarda a Central e os jogos no aparelho para dar para jogar sem internet.
// Com internet vai buscar a versão nova primeiro (e guarda-a); sem internet usa a guardada; com internet muito lenta (mais de 15 s) usa a guardada e avisa quando chegar a nova.
const CACHE = 'central30-v113';
const CORE = ['./', 'index.html', 'max/', 'max/index.html', 'max/favicon.svg', 'max/apple-touch-icon.png', 'aprender/', 'aprender/index.html', 'aprender/catalogo.js', 'aprender/kit.js', 'escola/index.html', 'corrida/index.html', 'joaquim-3d/index.html', 'craques/index.html', 'liga/index.html', 'portugal/index.html', 'portugal/world/_paises.json', 'favicon.svg', 'apple-touch-icon.png', 'jogos/aa.html', 'jogos/rs.html', 'img/rs.jpg', 'jogos/pr.html', 'img/pr.jpg', 'jogos/ab.html', 'jogos/an.html', 'jogos/bf.html', 'jogos/cb.html', 'jogos/cl.html', 'jogos/cr.html', 'jogos/fb.html', 'jogos/mr.html', 'jogos/pn.html', 'jogos/sl.html', 'jogos/tb.html', 'jogos/ns.html', 'img/ns.jpg', 'jogos/be.html', 'jogos/be.html?v=110', 'img/be.jpg', 'engines/r160.js', 'engines/r128.js', 'engines/r134.js', 'img/aa.jpg', 'img/ab.jpg', 'img/an.jpg', 'img/bf.png', 'img/cb.jpg', 'img/cl.png', 'img/cm.jpg', 'img/cq.jpg', 'img/cr.png', 'img/ct.jpg', 'img/ea.jpg', 'img/fb.jpg', 'img/jc.jpg', 'img/lr.jpg', 'img/mr.png', 'img/pn.jpg', 'img/sl.jpg', 'img/tb.jpg'];
CORE.push(...["max/jogos/pe.html","max/jogos/kt.html","max/jogos/rn.html","max/jogos/bq.html","max/jogos/mg.html","max/jogos/mt.html","max/jogos/pl.html","max/jogos/ej.html","max/jogos/la.html","max/jogos/bw.html","max/jogos/mo.html","max/jogos/ah.html","max/jogos/to.html","max/jogos/co.html","max/jogos/ps.html","max/jogos/vp.html","max/jogos/tx.html","max/jogos/f5.html","max/jogos/dr.html","distritos/index.html","aprender/onde-fica-distrito/index.html","aprender/onde-fica-concelho/index.html","aprender/rosa-dos-ventos/index.html","aprender/escalas/index.html","aprender/coordenadas/index.html","aprender/linha-do-tempo/index.html","aprender/numeracao-romana/index.html","aprender/deuses/index.html","aprender/camadas-da-terra/index.html","aprender/rochas/index.html","aprender/escala-de-mohs/index.html","aprender/sistema-solar/index.html","aprender/fases-da-lua/index.html","aprender/calculo-rapido/index.html","aprender/numeros-inteiros/index.html","aprender/equacoes/index.html","aprender/fracoes-percentagens/index.html","aprender/angulos/index.html","aprender/classes-de-palavras/index.html","aprender/irregular-verbs/index.html","aprender/capitais-europa/index.html","aprender/capitais-mundo/index.html","aprender/bandeiras/index.html","aprender/monumentos-do-mundo/index.html","aprender/rios-e-serras/index.html","aprender/continentes-e-oceanos/index.html","aprender/reis-de-portugal/index.html","aprender/datas-de-portugal/index.html","aprender/descobrimentos/index.html","aprender/inventores/index.html","aprender/tabuada/index.html","aprender/potencias-e-raizes/index.html","aprender/numeros-primos/index.html","aprender/areas-e-perimetros/index.html","aprender/unidades-de-medida/index.html","aprender/divisibilidade/index.html","aprender/elementos-quimicos/index.html","aprender/corpo-humano/index.html","aprender/estados-da-materia/index.html","aprender/animais-vertebrados/index.html","aprender/ingles-vocabulario/index.html","aprender/frances-vocabulario/index.html","aprender/espanhol-vocabulario/index.html","aprender/antonimos/index.html","aprender/plural-das-palavras/index.html","aprender/kit.css","aprender/mapa.js","distritos/atlas.json","distritos/meta.json"]);
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('central30-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if ((!same && !font) || (same && !url.pathname.startsWith(new URL(self.registration.scope).pathname))) return;
  // o "?v=…" dos links não conta: é sempre a mesma página
  const versionedGame = same && /\/jogos\/be\.html$/.test(url.pathname) && url.searchParams.has('v');
  const key = same ? new Request(url.origin + url.pathname + (versionedGame ? url.search : ''), { credentials: 'same-origin' }) : req;
  const img = same && /\.(jpg|png|svg|webp)$/.test(url.pathname);
  let cacheWrite = Promise.resolve();
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); cacheWrite = caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {}); }
    return res;
  });
  e.waitUntil(net.then(()=>cacheWrite).catch(()=>{}));
  // sem internet: cada central abre a sua página guardada (antes a MAX podia abrir a Central 30 normal)
  const home = /\/max\//.test(url.pathname) ? 'max/index.html' : (/\/aprender\//.test(url.pathname) ? 'aprender/index.html' : 'index.html');
  const root = new URL(self.registration.scope).pathname;
  const isHome = same && [root, root+'max/', root+'aprender/', root+'index.html', root+'max/index.html', root+'aprender/index.html'].includes(url.pathname);
  const cached = () => caches.open(CACHE).then(c=>c.match(key).then(r => r || (isHome && req.mode === 'navigate' ? c.match(new URL(home,self.registration.scope).href) : undefined)));
  const fail = () => new Response('Sem internet e esta parte ainda não estava guardada.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  // imagens: a guardada logo (e atualiza por trás); o resto: a nova, mas se a internet demorar mais de 4 s usa a guardada
  if (img) { e.respondWith(cached().then(r => r || net).catch(() => net).catch(fail)); net.catch(() => {}); return; }
  // com internet lenta espera até 15 s pela versão nova; se mesmo assim tiver de usar a guardada, avisa quando a nova chegar
  let servedOld = false;
  e.respondWith(new Promise(resolve => {
    let done = false; const give = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => cached().then(r => { if (r) servedOld = true; give(r); }).catch(()=>{}), 15000);
    const hard = setTimeout(() => give(fail()), 30000);
    net.then(async r => { clearTimeout(t); clearTimeout(hard); if(r.status>=500) give(await cached().catch(()=>null)||r); else give(r); }).catch(() => { clearTimeout(t); clearTimeout(hard); cached().then(r => give(r || fail())).catch(()=>give(fail())); });
  }));
  e.waitUntil(net.then(r => { if (servedOld && r && r.ok) return self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage({ c30: 'updated', path: url.pathname }))); }).catch(() => {}));
});
