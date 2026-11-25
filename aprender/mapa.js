/* Central 30 · Aprender — jogo "Onde fica?" no mapa (distritos ou concelhos). Usa os dados da animação dos Distritos. */
(function () {
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let DATA = null;
  async function load() {
    if (DATA) return DATA;
    const [topo, meta] = await Promise.all([fetch('../../distritos/atlas.json').then((r) => r.json()), fetch('../../distritos/meta.json').then((r) => r.json())]);
    const DI = topojson.feature(topo, topo.objects.di).features.map((f) => ({ f, key: f.properties.d, n: meta.d[f.properties.d].n }));
    const CO = topojson.feature(topo, topo.objects.co).features.map((f) => ({ f, key: f.properties.c, d: f.properties.d, n: meta.c[f.properties.c].n }));
    DI.sort((a, b) => norm(a.n).localeCompare(norm(b.n)));
    return (DATA = { DI, CO });
  }

  K.mapQuiz = async (root, { mode, key }) => {
    root.innerHTML = '<div class="card center muted">A carregar o mapa…</div>';
    let D;
    try { D = await load(); } catch (e) { root.innerHTML = '<div class="card">Não foi possível carregar o mapa. Verifica a ligação à internet e recarrega a página.</div>'; return; }
    let district = null;

    function chooser() {
      root.innerHTML = '';
      const sel = K.el('select', { id: 'selD', 'aria-label': 'Distrito' }, D.DI.map((d) => K.el('option', { value: d.key }, d.n)));
      sel.value = K.one(D.DI).key;
      root.append(K.el('div', { class: 'card' },
        K.el('div', { class: 'q' }, 'Escolhe um distrito para treinar os seus concelhos'),
        K.el('div', { class: 'row' }, sel, K.el('button', { class: 'btn primary', onclick: () => { district = sel.value; play(); } }, 'Começar ↗'))));
    }

    function play() {
      const scope = mode === 'distritos' ? D.DI : D.CO.filter((c) => c.d === district);
      const order = K.shuffle(scope);
      let i = 0, score = 0, tries = 0, busy = false;
      root.innerHTML = '';
      const card = K.el('div', { class: 'card' });
      const prog = K.el('div', { class: 'prog' });
      const ask = K.el('div', { class: 'q', 'aria-live': 'polite' });
      const W = 600, H = mode === 'distritos' ? 900 : 560;
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('style', 'width:100%;height:auto;max-height:70vh;display:block;touch-action:manipulation');
      const proj = d3.geoIdentity().reflectY(true).fitExtent([[10, 10], [W - 10, H - 10]], { type: 'FeatureCollection', features: scope.map((s) => s.f) });
      const path = d3.geoPath(proj);
      const gP = document.createElementNS(svgNS, 'g'), gL = document.createElementNS(svgNS, 'g');
      const els = new Map();
      scope.forEach((s) => {
        const p = document.createElementNS(svgNS, 'path');
        p.setAttribute('d', path(s.f));
        p.setAttribute('style', 'fill:#26343d;stroke:#0b1014;stroke-width:1.5;cursor:pointer;transition:fill .25s');
        p.addEventListener('mouseenter', () => { if (!p._done) p.style.fill = '#34474f'; });
        p.addEventListener('mouseleave', () => { if (!p._done) p.style.fill = '#26343d'; });
        p.addEventListener('click', () => pickIt(s));
        p.setAttribute('aria-label', 'zona do mapa');
        gP.append(p); els.set(s.key, p);
      });
      svg.append(gP, gL);
      const label = (s, color) => {
        const c = path.centroid(s.f);
        const t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', c[0]); t.setAttribute('y', c[1]); t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'middle');
        t.setAttribute('style', `font:700 ${mode === 'distritos' ? 17 : 14}px Inter,system-ui,sans-serif;fill:#0b1014;paint-order:stroke;stroke:${color};stroke-width:5px;pointer-events:none`);
        t.textContent = s.n; gL.append(t);
      };
      const upd = () => {
        prog.innerHTML = '';
        prog.append(K.el('span', {}, Math.min(i + 1, order.length) + '/' + order.length), K.el('div', { class: 'bar' }, K.el('i', { style: 'width:' + (i / order.length) * 100 + '%' })), K.el('span', {}, '✔ ' + score));
        if (i < order.length) ask.innerHTML = 'Onde fica ' + (mode === 'distritos' ? 'o distrito de ' : 'o concelho de ') + '<b style="color:var(--acc)">' + order[i].n + '</b>?';
      };
      function pickIt(s) {
        if (busy || i >= order.length) return;
        const target = order[i], p = els.get(s.key);
        if (p._done) return;
        if (s.key === target.key) {
          if (tries === 0) score++;
          p._done = true; p.style.fill = tries === 0 ? '#7be0a0' : '#f4c27c'; label(target, p.style.fill);
          i++; tries = 0; upd();
          if (i >= order.length) setTimeout(() => K.result(root, { score, total: order.length, key: key + (district || ''), again: mode === 'distritos' ? play : chooser,
            note: score === order.length ? 'Acertaste em todos à primeira!' : 'Acertaste ' + score + ' à primeira. Os amarelos precisaram de ajuda.' }), 700);
        } else {
          tries++;
          p.style.fill = '#ff7a6b'; busy = true;
          K.toast('Isso é ' + s.n + '.');
          setTimeout(() => { p.style.fill = '#26343d'; busy = false; }, 650);
          if (tries >= 2) { const t = els.get(target.key); t.style.fill = '#f4c27c55'; t.style.stroke = '#f4c27c'; setTimeout(() => { if (!t._done) { t.style.fill = '#26343d'; t.style.stroke = '#0b1014'; } }, 1300); }
        }
      }
      card.append(prog, ask, svg,
        K.el('p', { class: 'muted', style: 'margin:12px 0 0' }, 'Verde: certo à primeira. Amarelo: certo depois de errar. Ao 2.º erro o mapa dá uma pista.'));
      root.append(card);
      upd();
    }
    if (mode === 'distritos') play(); else chooser();
  };
})();
