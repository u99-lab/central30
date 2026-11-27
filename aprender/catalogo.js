/* Central 30 · Aprender — catálogo das atividades, partilhado pela Central 30 e pela Central 30 MAX.
   Uso: C30Aprender.render(grelha, chips, base, sufixo)  (base = caminho até à raiz da Central 30) */
(function () {
  const S = {
    geo: ['Geografia', '#7cc8f4'], his: ['História', '#f4c27c'], cie: ['Ciências', '#9ef47c'], mat: ['Matemática', '#f47cc8'], lin: ['Línguas', '#c7a6ff'],
  };
  const A = [
    { p: 'distritos/', s: 'geo', e: '🇵🇹', t: 'Distritos de Portugal Continental', k: 'Animação · mapa interativo', d: 'Do país à freguesia: 18 distritos, 278 concelhos e 2882 freguesias, com zoom, setas e visita guiada.', by: 'Isaac Cardoso · N.º 15 · 7.º B',
      extra: [['PDF', 'distritos/downloads/Distritos_de_Portugal_Continental_completo.pdf'], ['Vídeo', 'distritos/downloads/Animacao_Distritos_de_Portugal_Isaac_Cardoso.mp4']] },
    { p: 'aprender/onde-fica-distrito/', s: 'geo', e: '📍', t: 'Onde fica o distrito?', k: 'Jogo de mapa', d: 'Aparece um distrito: encontra-o no mapa de Portugal. Consegues os 18 à primeira?' },
    { p: 'aprender/onde-fica-concelho/', s: 'geo', e: '🗺️', t: 'Onde fica o concelho?', k: 'Jogo de mapa', d: 'Escolhe um distrito e encontra todos os seus concelhos no mapa.' },
    { p: 'aprender/rosa-dos-ventos/', s: 'geo', e: '🧭', t: 'Rosa dos ventos', k: 'Orientação', d: 'Pontos cardeais e colaterais: aprende a orientar-te e a rodar como uma bússola.' },
    { p: 'aprender/escalas/', s: 'geo', e: '📏', t: 'Escalas dos mapas', k: 'Cálculo', d: 'Do centímetro no mapa ao quilómetro na realidade: treina as escalas.' },
    { p: 'aprender/coordenadas/', s: 'geo', e: '🌐', t: 'Coordenadas geográficas', k: 'Latitude e longitude', d: 'Localiza pontos na grelha da Terra com latitude e longitude.' },
    { p: 'aprender/linha-do-tempo/', s: 'his', e: '⏳', t: 'Linha do tempo', k: 'Ordenar', d: 'Da Pré-História à queda de Roma: põe os acontecimentos por ordem.' },
    { p: 'aprender/numeracao-romana/', s: 'his', e: '🏛️', t: 'Numeração romana', k: 'Conversor e treino', d: 'I, V, X, L, C, D, M: converte números e treina com perguntas.' },
    { p: 'aprender/deuses/', s: 'his', e: '⚡', t: 'Deuses gregos e romanos', k: 'Jogo da memória', d: 'Zeus e Júpiter, Atena e Minerva… junta cada par.' },
    { p: 'aprender/camadas-da-terra/', s: 'cie', e: '🌍', t: 'Camadas da Terra', k: 'Explorar e testar', d: 'Crusta, manto e núcleo: descobre o que há debaixo dos teus pés.' },
    { p: 'aprender/rochas/', s: 'cie', e: '🪨', t: 'Tipos de rochas', k: 'Classificar', d: 'Magmáticas, sedimentares ou metamórficas? Com exemplos de Portugal.' },
    { p: 'aprender/escala-de-mohs/', s: 'cie', e: '💎', t: 'Escala de Mohs', k: 'Ordenar', d: 'Do talco ao diamante: ordena os minerais pela dureza.' },
    { p: 'aprender/sistema-solar/', s: 'cie', e: '🪐', t: 'Sistema Solar', k: 'Explorar e testar', d: 'Os oito planetas a girar: toca em cada um para o conhecer.' },
    { p: 'aprender/fases-da-lua/', s: 'cie', e: '🌙', t: 'Fases da Lua', k: 'Simulador', d: 'Mexe nos dias e vê porque a Lua muda de forma ao longo do mês.' },
    { p: 'aprender/calculo-rapido/', s: 'mat', e: '⚡', t: 'Cálculo rápido', k: 'Contra o relógio', d: 'Quantas contas consegues fazer em 60 segundos? Três níveis.' },
    { p: 'aprender/numeros-inteiros/', s: 'mat', e: '➖', t: 'Números inteiros', k: 'Reta numérica', d: 'Negativos, simétricos, valor absoluto e contas com sinais.' },
    { p: 'aprender/equacoes/', s: 'mat', e: '⚖️', t: 'Equações do 1.º grau', k: 'Balança', d: 'Descobre o valor de x mantendo a balança em equilíbrio.' },
    { p: 'aprender/fracoes-percentagens/', s: 'mat', e: '🥧', t: 'Frações e percentagens', k: 'Equivalências', d: '1/2 = 50% = 0,5: liga frações, decimais e percentagens.' },
    { p: 'aprender/angulos/', s: 'mat', e: '📐', t: 'Ângulos', k: 'Geometria', d: 'Agudo, reto, obtuso e raso; complementares, suplementares e triângulos.' },
    { p: 'aprender/classes-de-palavras/', s: 'lin', e: '📝', t: 'Classes de palavras', k: 'Português', d: 'Nome, adjetivo, verbo, advérbio… descobre a classe da palavra.' },
    { p: 'aprender/irregular-verbs/', s: 'lin', e: '🇬🇧', t: 'Irregular verbs', k: 'Inglês', d: 'Go, went, gone: treina os verbos irregulares mais usados.' },
    { p: 'aprender/capitais-europa/', s: 'geo', e: '🏰', t: "Capitais da Europa", k: "Países e capitais", d: "43 países europeus: sabes a capital de cada um? E ao contrário?" },
    { p: 'aprender/capitais-mundo/', s: 'geo', e: '🌎', t: "Capitais do mundo", k: "Países e capitais", d: "Da Lusofonia à Ásia e à Oceânia: 38 capitais para descobrir." },
    { p: 'aprender/bandeiras/', s: 'geo', e: '🏳️', t: "Bandeiras do mundo", k: "Reconhecer", d: "Olha para a bandeira e diz de que país é (ou o contrário)." },
    { p: 'aprender/monumentos-do-mundo/', s: 'geo', e: '🗼', t: "Monumentos do mundo", k: "Onde fica?", d: "Torre Eiffel, Machu Picchu, Taj Mahal… em que país fica cada monumento?" },
    { p: 'aprender/rios-e-serras/', s: 'geo', e: '🏞️', t: "Rios e serras de Portugal", k: "Relevo e hidrografia", d: "O rio mais longo, a montanha mais alta, onde nasce o Tejo… Portugal por dentro." },
    { p: 'aprender/continentes-e-oceanos/', s: 'geo', e: '🌍', t: "Continentes e oceanos", k: "Planeta Terra", d: "Quantos continentes há, qual é o maior oceano e onde fica cada país." },
    { p: 'aprender/reis-de-portugal/', s: 'his', e: '👑', t: "Reis e dinastias", k: "Monarquia portuguesa", d: "De D. Afonso Henriques a D. Manuel II: quem foi quem e de que dinastia." },
    { p: 'aprender/datas-de-portugal/', s: 'his', e: '📜', t: "Datas da história de Portugal", k: "Linha do tempo", d: "1143, 1385, 1640, 1755, 1910, 1974… o que aconteceu em cada data?" },
    { p: 'aprender/descobrimentos/', s: 'his', e: '⛵', t: "Descobrimentos portugueses", k: "Navegadores", d: "Gil Eanes, Bartolomeu Dias, Vasco da Gama, Cabral, Magalhães… quem descobriu o quê?" },
    { p: 'aprender/inventores/', s: 'his', e: '💡', t: "Inventos e inventores", k: "Ciência e história", d: "Quem inventou o telefone, a lâmpada ou descobriu a penicilina?" },
    { p: 'aprender/tabuada/', s: 'mat', e: '✖️', t: "Tabuada", k: "Cálculo mental", d: "Treina a tabuada do 2 ao 12 contra ti próprio." },
    { p: 'aprender/potencias-e-raizes/', s: 'mat', e: '²', t: "Potências e raízes", k: "Cálculo", d: "Quadrados, cubos e raízes quadradas: treina até saberes de cor." },
    { p: 'aprender/numeros-primos/', s: 'mat', e: '🔢', t: "Números primos", k: "Divisores", d: "Um número primo só se divide por 1 e por ele próprio. Consegues apanhá-los?" },
    { p: 'aprender/areas-e-perimetros/', s: 'mat', e: '⬛', t: "Áreas e perímetros", k: "Geometria", d: "Quadrados, retângulos, triângulos e círculos: calcula áreas e perímetros." },
    { p: 'aprender/unidades-de-medida/', s: 'mat', e: '⚖️', t: "Unidades de medida", k: "Conversões", d: "Metros, gramas, litros e horas: converte de uma unidade para outra." },
    { p: 'aprender/divisibilidade/', s: 'mat', e: '➗', t: "Critérios de divisibilidade", k: "Divisores", d: "Sem fazer a conta: é divisível por 2, 3, 5, 9 ou 10?" },
    { p: 'aprender/elementos-quimicos/', s: 'cie', e: '⚗️', t: "Elementos químicos", k: "Tabela periódica", d: "H, O, Fe, Au… sabes o nome de cada símbolo químico?" },
    { p: 'aprender/corpo-humano/', s: 'cie', e: '🫀', t: "Corpo humano", k: "Órgãos e sistemas", d: "Coração, pulmões, rins, ossos… para que serve cada parte do corpo?" },
    { p: 'aprender/estados-da-materia/', s: 'cie', e: '🧊', t: "Estados da matéria", k: "Mudanças de estado", d: "Sólido, líquido e gasoso: fusão, evaporação, condensação e companhia." },
    { p: 'aprender/animais-vertebrados/', s: 'cie', e: '🐸', t: "Classes de vertebrados", k: "Classificar animais", d: "Golfinho, pinguim, salamandra, tubarão… a que classe pertence cada animal?" },
    { p: 'aprender/ingles-vocabulario/', s: 'lin', e: '🇬🇧', t: "Inglês: vocabulário", k: "Palavras", d: "Escola, casa, comida, animais e cores em inglês: traduz nos dois sentidos." },
    { p: 'aprender/frances-vocabulario/', s: 'lin', e: '🇫🇷', t: "Francês: vocabulário", k: "Palavras", d: "As primeiras palavras em francês: escola, família, comida e dias da semana." },
    { p: 'aprender/espanhol-vocabulario/', s: 'lin', e: '🇪🇸', t: "Espanhol: vocabulário", k: "Palavras", d: "Parecem iguais mas não são: as palavras de espanhol que mais enganam." },
    { p: 'aprender/antonimos/', s: 'lin', e: '🔁', t: "Antónimos", k: "Palavras contrárias", d: "Alegre e triste, abrir e fechar: encontra a palavra com o significado contrário." },
    { p: 'aprender/plural-das-palavras/', s: 'lin', e: '📝', t: "Plural das palavras", k: "Português", d: "Cão → cães, mão → mãos, papel → papéis: acerta no plural das palavras difíceis." },
  ];
  const css = `
.lc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:16px}
.lc{position:relative;display:flex;flex-direction:column;border:1px solid var(--lc-line,#ffffff14);border-radius:14px;background:var(--lc-bg,#172026);overflow:hidden;color:inherit;text-decoration:none;transition:transform .2s,border-color .2s,box-shadow .2s;min-width:0}
.lc:hover{transform:translateY(-3px);border-color:var(--sc);box-shadow:0 16px 36px #0006}
.lc-img{position:relative;display:block;aspect-ratio:16/9;overflow:hidden;background:radial-gradient(120% 100% at 20% 0%,color-mix(in srgb,var(--sc) 45%,transparent),transparent 60%),linear-gradient(135deg,#1d2a33,#111a20)}
.lc-img img{width:100%;height:100%;object-fit:cover;display:block}
.lc-emo{position:absolute;inset:0;display:grid;place-items:center;font-size:clamp(46px,7vw,64px);filter:drop-shadow(0 8px 18px #0008)}
.lc-sub{position:absolute;left:12px;top:12px;font:600 9px/1 ui-monospace,monospace;letter-spacing:1.6px;text-transform:uppercase;padding:6px 8px;border-radius:5px;background:#0b1014cc;color:var(--sc);border:1px solid color-mix(in srgb,var(--sc) 60%,transparent)}
.lc-n{position:absolute;right:12px;top:12px;font:600 10px/1 ui-monospace,monospace;color:#ffffffaa;background:#0b1014aa;padding:6px 7px;border-radius:5px}
.lc-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}
.lc-k{font:600 9px ui-monospace,monospace;letter-spacing:1.3px;text-transform:uppercase;color:var(--sc)}
.lc-body h2{margin:0;font-size:19px;line-height:1.2}
.lc-body p{margin:0;color:var(--lc-mute,#a9b6b0);font-size:13.5px;line-height:1.45}
.lc-by{font:10px ui-monospace,monospace;letter-spacing:1.1px;color:var(--lc-mute,#8e9b96);text-transform:uppercase}
.lc-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:8px}
.lc-act a{text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:9px 14px;border-radius:7px;border:1px solid var(--lc-line,#ffffff24);color:inherit;background:#ffffff0a}
.lc-act a.lc-go{background:var(--lc-acc,#c5f47c);border-color:var(--lc-acc,#c5f47c);color:var(--lc-acc-ink,#142018)}
.lc-act a:focus-visible,.lc-img:focus-visible{outline:2px solid var(--lc-acc,#c5f47c);outline-offset:2px}
.lc-chips{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px}
.lc-chips button{font:600 12px/1 inherit;padding:9px 14px;border-radius:999px;border:1px solid var(--lc-line,#ffffff22);background:#ffffff06;color:inherit;cursor:pointer;display:inline-flex;gap:7px;align-items:center}
.lc-chips button i{width:8px;height:8px;border-radius:50%;background:var(--sc);display:inline-block}
.lc-chips button[aria-pressed="true"]{background:var(--lc-acc,#c5f47c);border-color:var(--lc-acc,#c5f47c);color:var(--lc-acc-ink,#142018)}
.lc-chips small{opacity:.7;font:10px ui-monospace,monospace}`;
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  window.C30Aprender = {
    list: A, subjects: S, count: A.length,
    render(grid, chips, base, suffix) {
      if(!grid)return; base = base || ''; suffix = suffix || '';
      if (!document.getElementById('c30lcCss')) { const st = document.createElement('style'); st.id = 'c30lcCss'; st.textContent = css; document.head.append(st); }
      let f = 'all';
      const draw = () => {
        grid.className = 'lc-grid';
        grid.innerHTML = A.map((a, i) => ({ a, i })).filter(({ a }) => f === 'all' || a.s === f).map(({ a, i }) => {
          const href = base + a.p + suffix, sc = S[a.s][1];
          return `<article class="lc" style="--sc:${sc}"><a class="lc-img" href="${href}" aria-label="Abrir ${esc(a.t)}">` +
            (a.img ? `<img src="${base + a.img}" alt="" loading="lazy">` : `<span class="lc-emo" aria-hidden="true">${a.e}</span>`) +
            `<span class="lc-sub">${S[a.s][0]}</span><span class="lc-n">${String(i + 1).padStart(2, '0')}/${A.length}</span></a>` +
            `<div class="lc-body"><div class="lc-k">${esc(a.k)}</div><h2>${esc(a.t)}</h2><p>${esc(a.d)}</p>${a.by ? `<div class="lc-by">${esc(a.by)}</div>` : ''}` +
            `<div class="lc-act"><a class="lc-go" href="${href}">Abrir ↗</a>${(a.extra || []).map(([n, u]) => `<a href="${base + u}" download>${n}</a>`).join('')}</div></div></article>`;
        }).join('');
        if (chips) chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
      };
      if (chips) {
        chips.className = 'lc-chips';
        const cnt = (k) => A.filter((a) => a.s === k).length;
        chips.innerHTML = `<button type="button" data-f="all" style="--sc:#eef2ec">Tudo <small>${A.length}</small></button>` +
          Object.entries(S).map(([k, [n, c]]) => `<button type="button" data-f="${k}" style="--sc:${c}"><i></i>${n} <small>${cnt(k)}</small></button>`).join('');
        chips.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { f = b.dataset.f; draw(); }));
      }
      draw();
    },
  };
})();
