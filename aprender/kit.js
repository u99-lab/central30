/* Central 30 · Aprender — motor comum: cabeçalho, perguntas, ordenar, memória e resultado. */
(function () {
try {
  const RESET = '2026-11-27-reset1';
  if (localStorage.getItem('c30.reset') !== RESET) {
    const keep = new Set(['c30.reset','c30.settings','c30.ipadFix','c30.pass','c30.pass2','c30.passN','c30.trialN','c30.gateV','c30max.gateV']);
    const del = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('c30.') || k.startsWith('c30aprender_') || k.startsWith('craques3d.') || /^(vfig|patrao|jdc)\./.test(k) || k === 'central30.aviso') && !keep.has(k) && !k.startsWith('c30.gpass.')) del.push(k);
    }
    del.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('c30.reset', RESET);
    window.__C30_DID_RESET = true;
  }
} catch {}
try {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const k = sessionStorage.key(i);
    if (k && k.startsWith('c30aprender_')) sessionStorage.removeItem(k);
  }
} catch {}

  const K = (window.K = {});
  const SUBJ = { geo: 'Geografia', his: 'História', cie: 'Ciências', mat: 'Matemática', lin: 'Línguas' };

  K.$ = (s, r = document) => r.querySelector(s);
  K.el = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
    return e;
  };
  K.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  K.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  K.pick = (a, n) => K.shuffle(a).slice(0, n);
  K.one = (a) => a[(Math.random() * a.length) | 0];
  K.fmt = (n) => Number(n).toLocaleString('pt-PT');
  /* opções erradas numéricas plausíveis à volta da certa */
  K.near = (ans, spread = 3, n = 3, step = 1) => {
    const set = new Set([ans]); let tries = 0;
    while (set.size < n + 1 && tries++ < 200) { const d = K.rand(-spread, spread) * step; if (d) set.add(+(ans + d).toFixed(6)); }
    return [...set].slice(1).map(String);
  };

  /* Memória segundo as Definições da Central ("Guardar dados do jogo"):
     Sim → os melhores resultados ficam guardados; Não → só duram enquanto a página estiver aberta. */
  const store = (k) => 'c30aprender_' + k;
  K.keep = () => { try { return !!JSON.parse(localStorage.getItem('c30.settings') || '{}').keepProgress; } catch (e) { return false; } };
  const box = () => { try { return K.keep() ? localStorage : sessionStorage; } catch (e) { return null; } };
  try { if (!K.keep()) Object.keys(localStorage).filter((x) => x.startsWith('c30aprender_')).forEach((x) => localStorage.removeItem(x)); } catch (e) {}
  K.best = {
    get(k) { try { return +box().getItem(store(k)) || 0; } catch (e) { return 0; } },
    set(k, v) { try { if (v > K.best.get(k)) box().setItem(store(k), v); } catch (e) {} },
  };

  /* regressa à página inicial do Aprende+ */
  K.backHref = () => '../';

  K.page = ({ title, subject, emoji, intro, key }) => {
    document.title = title + ' · Aprende+';
    const best = key ? K.el('span', { class: 'best', id: 'kbest' }) : null;
    const head = K.el('header', { class: 'kh' },
      K.el('a', { class: 'back', href: K.backHref(), 'aria-label': 'Voltar ao Aprende+' }, 'Aprende+'),
      K.el('div', { class: 'kt' }, K.el('span', { class: 'chip s-' + subject }, SUBJ[subject] || subject), K.el('h1', {}, (emoji ? emoji + ' ' : '') + title)),
      best);
    const main = K.el('main', { class: 'km' });
    if (intro) main.append(K.el('p', { class: 'intro', html: intro }));
    document.body.prepend(head, main);
    K.showBest = () => { if (best) { const b = K.best.get(key); best.textContent = b ? 'Melhor: ' + b : ''; best.title = K.keep() ? 'Guardado (Definições: Guardar dados = Sim)' : 'Só nesta visita (Definições: Guardar dados = Não)'; } };
    K.showBest();
    return main;
  };

  K.toast = (msg) => {
    let t = K.$('.toast'); if (!t) { t = K.el('div', { class: 'toast', role: 'status' }); document.body.append(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1800);
  };

  K.result = (root, { score, total, key, again, note, unit }) => {
    if (key) K.best.set(key, score); K.showBest && K.showBest();
    const r = total ? score / total : 0;
    const stars = r >= 0.9 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0;
    const msg = r >= 0.9 ? 'Excelente! Dominas este tema.' : r >= 0.6 ? 'Muito bem! Mais uma ronda e chegas lá.' : r >= 0.3 ? 'Bom começo. Tenta outra vez.' : 'Continua a praticar, vais melhorar.';
    root.innerHTML = '';
    const best = key ? K.best.get(key) : 0;
    root.append(K.el('div', { class: 'card res' },
      K.el('div', { class: 'stars', 'aria-label': stars + ' estrelas de 3' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)),
      K.el('div', { class: 'big' }, String(score), total ? K.el('small', {}, ' / ' + total) : K.el('small', {}, unit ? ' ' + unit : '')),
      K.el('p', {}, note || msg),
      key ? K.el('p', {}, 'O teu melhor: ' + best + (K.keep() ? '' : ' · só nesta visita')) : null,
      key && !K.keep() ? K.el('p', { style: 'font-size:13px' }, 'Os resultados não ficam guardados. Para os guardar, abre as Definições da Central 30 e escolhe "Guardar dados do jogo: Sim".') : null,
      K.el('div', { class: 'row', style: 'justify-content:center;margin-top:8px' },
        K.el('button', { class: 'btn primary', onclick: again }, 'Jogar outra vez'),
        K.el('a', { class: 'btn', href: K.backHref() }, 'Outras atividades'))));
    root.querySelector('.btn.primary').focus();
  };

  /* Perguntas de escolha múltipla.
     q: { q: texto, o: [opções], a: opção certa (texto), e: explicação, v: html/nó visual (opcional), keep: não baralhar } */
  K.quiz = (root, { key, questions, gen, n = 10, onShow }) => {
    let qs, i, score, done;
    const start = () => {
      qs = gen ? Array.from({ length: n }, (_, j) => gen(j)) : K.pick(questions, Math.min(n, questions.length));
      i = 0; score = 0; show();
    };
    const show = () => {
      done = false;
      const q = qs[i];
      const opts = q.keep ? q.o.slice() : K.shuffle(q.o);
      root.innerHTML = '';
      const card = K.el('div', { class: 'card' });
      card.append(K.el('div', { class: 'prog' }, K.el('span', {}, (i + 1) + '/' + qs.length), K.el('div', { class: 'bar' }, K.el('i', { style: 'width:' + (i / qs.length) * 100 + '%' })), K.el('span', {}, '✔ ' + score)));
      if (q.v) { const v = K.el('div', { class: 'visual' }); if (typeof q.v === 'string') v.innerHTML = q.v; else v.append(q.v); card.append(v); }
      card.append(K.el('div', { class: 'q', html: q.q }));
      const box = K.el('div', { class: 'opts' + (opts.some((o) => String(o).length > 38) ? ' one' : '') });
      opts.forEach((o, j) => box.append(K.el('button', { class: 'opt', 'data-o': o, onclick: () => answer(o) }, K.el('kbd', {}, String(j + 1)), K.el('span', { html: String(o) }))));
      card.append(box);
      root.append(card);
      onShow && onShow(q, card);
    };
    const answer = (o) => {
      if (done) return; done = true;
      const q = qs[i], ok = String(o) === String(q.a);
      if (ok) score++;
      root.querySelectorAll('.opt').forEach((b) => {
        b.disabled = true;
        if (b.dataset.o === String(q.a)) b.classList.add('ok');
        else if (b.dataset.o === String(o)) b.classList.add('no');
      });
      const last = i === qs.length - 1;
      const next = K.el('button', { class: 'btn primary', onclick: () => { if (last) K.result(root, { score, total: qs.length, key, again: start }); else { i++; show(); } } }, last ? 'Ver resultado' : 'Seguinte →');
      root.querySelector('.card').append(K.el('div', { class: 'fb', role: 'status' },
        K.el('p', { html: '<b class="' + (ok ? 'ok">Certo!' : 'no">Não é bem.') + '</b> ' + (q.e || (ok ? '' : 'A resposta certa é <b>' + q.a + '</b>.')) }), next));
      next.focus();
    };
    root._keys && removeEventListener('keydown', root._keys);
    root._keys = (e) => {
      if (!root.isConnected || e.target.matches('input,select,textarea')) return;
      const n = +e.key; if (n >= 1 && n <= 9) { const b = root.querySelectorAll('.opt')[n - 1]; if (b && !b.disabled) b.click(); }
    };
    addEventListener('keydown', root._keys);
    start();
  };

  /* Ordenar: items [{t, s (subtítulo depois de verificar), v (valor para ordenar)}] */
  K.order = (root, { key, prompt, items, n = 6, hint }) => {
    let cur, sel, checked;
    const start = () => { cur = K.shuffle(K.pick(items, Math.min(n, items.length))); sel = -1; checked = false; draw(); };
    const swap = (a, b) => { if (b < 0 || b >= cur.length) return; [cur[a], cur[b]] = [cur[b], cur[a]]; sel = -1; draw(); };
    const draw = () => {
      root.innerHTML = '';
      const card = K.el('div', { class: 'card' });
      card.append(K.el('div', { class: 'q', html: prompt }));
      if (hint) card.append(K.el('p', { class: 'muted', style: 'margin:-6px 0 14px' }, hint));
      const sorted = cur.slice().sort((a, b) => a.v - b.v);
      const ol = K.el('ol', { class: 'olist' });
      cur.forEach((it, j) => {
        const st = checked ? (sorted[j] === it ? ' ok' : ' no') : sel === j ? ' sel' : '';
        ol.append(K.el('li', { class: 'oitem' + st },
          K.el('span', { class: 'pos' }, String(j + 1)),
          K.el('span', { class: 'lab', role: 'button', tabindex: checked ? -1 : 0, 'aria-pressed': sel === j ? 'true' : 'false',
            onclick: () => { if (checked) return; if (sel < 0) { sel = j; draw(); } else if (sel === j) { sel = -1; draw(); } else swap(sel, j); },
            onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } } },
            it.t, checked && it.s ? K.el('small', {}, it.s) : null),
          checked ? null : K.el('span', { class: 'mv' },
            K.el('button', { 'aria-label': 'Subir ' + it.t, onclick: () => swap(j, j - 1), disabled: j === 0 }, '↑'),
            K.el('button', { 'aria-label': 'Descer ' + it.t, onclick: () => swap(j, j + 1), disabled: j === cur.length - 1 }, '↓'))));
      });
      card.append(ol);
      const row = K.el('div', { class: 'row', style: 'margin-top:16px' });
      if (!checked) row.append(K.el('button', { class: 'btn primary', onclick: () => { checked = true; draw(); } }, 'Verificar'), K.el('span', { class: 'muted' }, 'Toca em dois para trocar, ou usa ↑ ↓.'));
      else {
        const sc = cur.filter((it, j) => sorted[j] === it).length;
        if (key) K.best.set(key, sc); K.showBest && K.showBest();
        row.append(K.el('b', {}, sc === cur.length ? '🎉 Tudo certo! ' : sc + ' de ' + cur.length + ' no lugar certo. '),
          K.el('button', { class: 'btn primary', onclick: start }, 'Nova ronda'));
        if (sc < cur.length) row.append(K.el('button', { class: 'btn', onclick: () => { cur = sorted.slice(); draw(); } }, 'Ver a ordem certa'));
      }
      card.append(row);
      root.append(card);
    };
    start();
  };

  /* Jogo da memória: pairs [[a, b, tagA, tagB]] */
  K.memory = (root, { key, pairs, n = 8, tags }) => {
    let cards, open, moves, found, lock;
    const start = () => {
      const ps = K.pick(pairs, Math.min(n, pairs.length));
      cards = K.shuffle(ps.flatMap((p, id) => [{ id, t: p[0], tag: tags && tags[0] }, { id, t: p[1], tag: tags && tags[1] }]));
      open = []; moves = 0; found = 0; lock = false; draw();
    };
    const draw = () => {
      root.innerHTML = '';
      const card = K.el('div', { class: 'card' });
      card.append(K.el('div', { class: 'prog' }, K.el('span', {}, 'Pares: ' + found + '/' + cards.length / 2), K.el('div', { class: 'bar' }, K.el('i', { style: 'width:' + (found / (cards.length / 2)) * 100 + '%' })), K.el('span', {}, 'Jogadas: ' + moves)));
      const g = K.el('div', { class: 'mem', style: 'margin-top:14px' });
      cards.forEach((c, j) => {
        const st = c.done ? ' done' : open.includes(j) ? ' up' : '';
        g.append(K.el('button', { class: 'mc' + st, 'aria-label': c.done || open.includes(j) ? c.t : 'Carta escondida', onclick: () => flip(j) },
          K.el('span', {}, c.t, c.tag ? K.el('small', { class: 'tag' }, c.tag) : null)));
      });
      card.append(g); root.append(card);
    };
    const flip = (j) => {
      if (lock || cards[j].done || open.includes(j)) return;
      open.push(j); draw();
      if (open.length === 2) {
        moves++; lock = true;
        const [a, b] = open;
        setTimeout(() => {
          if (cards[a].id === cards[b].id) { cards[a].done = cards[b].done = true; found++; }
          open = []; lock = false; draw();
          if (found === cards.length / 2) {
            const pts = Math.max(1, 100 - (moves - found) * 6);
            K.result(root, { score: pts, total: 0, unit: 'pontos', key, again: start, note: 'Encontraste todos os pares em ' + moves + ' jogadas.' });
          }
        }, cards[a].id === cards[b].id ? 350 : 900);
      }
    };
    start();
  };

  /* SVG rápido */
  K.svg = (w, h, inner, attrs = '') => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" ${attrs}>${inner}</svg>`;
})();
