/* =========================================================
   L.O.G · DECK VIRTUAL
   ---------------------------------------------------------
   Carrega depois de deck-arte.js (arte das cartas) e
   deck-dados.js (cartas e textos).

   1. Desenho das cartas (SVG, igual ao modelo "Carta 01")
   2. Ajuste de texto (quebra de linha, encolher se não couber)
   3. Grade + filtros (local e categoria)
   4. Visualizador (carta grande, animada, com verso)
   ========================================================= */
(() => {
    'use strict';

    const { T, PROTOCOLOS, manuais } = window.DADOS;
    /* as cartas agora vêm do objects.json; o deck_dados.js só empresta os
       textos em português (o JSON tem apenas o inglês) */
    const CARTAS_ANTIGAS = window.DADOS.cartas || [];
    const JSON_URL = '../../js/objects.json';
    let cartas = [];
    let contagem = [0, 0, 0, 0, 0];
    const ARTE = window.ARTE;
    const NS = 'http://www.w3.org/2000/svg';
    const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const COL = [82.0, 249.33, 416.67];

    /* ---------- textos da interface ---------- */
    const UI = {
        pt: {
            menu: 'Menu',
            titulo: 'Deck virtual',
            sub: 'Todas as cartas do jogo, sem precisar das físicas. Toque em uma carta para ampliar.',
            local: 'Local',
            categoria: 'Categoria',
            todos: 'Todos',
            todas: 'Todas',
            limpar: 'Limpar filtros',
            secObj: 'Cartas de objeto',
            secMan: 'Manuais',
            mostrando: (n, t) => `Mostrando ${n} de ${t} cartas`,
            fechar: 'Fechar',
            anterior: 'Anterior',
            proxima: 'Próxima',
            virar: 'Ver verso',
            frente: 'Ver frente',
            ampliar: 'Ampliar',
            reduzir: 'Reduzir',
            favoritas: 'Favoritas',
            favoritar: 'Favoritar',
            favoritada: 'Favorita',
            catCurta: ['Rovers e veículos', 'Pousadores', 'Sondas e telescópios', 'Pedaços de nave e entulho', 'Objetos'],
            manualNome: { protocolos: 'Protocolos', categorias: 'As categorias', comoler: 'Como ler as cartas' },
            cartaDe: 'Carta',
            versoAlt: 'Verso da carta do L.O.G., com a foto de uma sombra de astronauta na Lua',
            carregando: 'Carregando cartas…',
            erroDados: 'Não foi possível carregar as cartas (objects.json). Recarregue a página.'
        },
        en: {
            menu: 'Menu',
            titulo: 'Virtual deck',
            sub: 'Every card in the game, no physical cards needed. Tap a card to enlarge it.',
            local: 'Location',
            categoria: 'Category',
            todos: 'All',
            todas: 'All',
            limpar: 'Clear filters',
            secObj: 'Object cards',
            secMan: 'Manuals',
            mostrando: (n, t) => `Showing ${n} of ${t} cards`,
            fechar: 'Close',
            anterior: 'Previous',
            proxima: 'Next',
            virar: 'Show back',
            frente: 'Show front',
            ampliar: 'Zoom in',
            reduzir: 'Zoom out',
            favoritas: 'Favorites',
            favoritar: 'Favorite',
            favoritada: 'Favorited',
            catCurta: ['Rovers and vehicles', 'Landers', 'Probes and telescopes', 'Spacecraft parts and debris', 'Objects'],
            manualNome: { protocolos: 'Protocols', categorias: 'The categories', comoler: 'How to read the cards' },
            cartaDe: 'Card',
            versoAlt: 'L.O.G. card back, with a photo of an astronaut\u2019s shadow on the Moon',
            carregando: 'Loading cards…',
            erroDados: 'Could not load the cards (objects.json). Please reload the page.'
        }
    };

    /* ---------- estado ---------- */
    // idioma compartilhado com a capa e a nave (js/idioma.js): sem escolha salva, vale o padrão de lá
    let idioma = 'pt';
    if (window.LOG_IDIOMA) idioma = window.LOG_IDIOMA.get();
    else try { idioma = localStorage.getItem('log-deck-idioma') === 'en' ? 'en' : 'pt'; } catch (e) { /* sem armazenamento */ }
    const filtro = { local: new Set(), cat: new Set(), fav: false };   // vários locais/categorias ao mesmo tempo

    /* favoritas do jogador, salvas no aparelho (pelo id do JSON) */
    const CHAVE_MARCAS = 'log-deck-marcas';
    const marcas = { fav: new Set() };
    try {
        const m = JSON.parse(localStorage.getItem(CHAVE_MARCAS) || 'null');
        if (m && Array.isArray(m.f)) m.f.forEach(i => marcas.fav.add(i));
    } catch (e) { /* sem armazenamento: as favoritas valem só até fechar a página */ }

    function alterna(id) {
        if (marcas.fav.has(id)) marcas.fav.delete(id); else marcas.fav.add(id);
        try { localStorage.setItem(CHAVE_MARCAS, JSON.stringify({ f: [...marcas.fav] })); } catch (e) { /* ok */ }
    }

    let lista = [];          // cartas navegáveis no visualizador
    let indice = 0;
    let aberto = false;
    let origem = null;       // botão que abriu o visualizador (volta o foco pra ele)

    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const num = (s, L) => (L === 'pt' ? String(s).replace('.', ',') : String(s));

    /* =========================================================
       0. DADOS: lê o objects.json e monta as cartas
          (o JSON não é alterado, só consumido)
       ========================================================= */
    const ENERGIA = { solar: 'sol', nuclear: 'nuc', battery: 'bat', none: 'nen' };
    const PT_POSICAO = {
        'CERES ORBIT': 'ÓRBITA DE CERES',
        'SUN ORBIT': 'ÓRBITA SOLAR',
        '\u2192 ALDEBARAN': '\u2192 ALDEBARÃ',
        '\u2192 AQUILA': '\u2192 ÁGUIA'
    };

    function valorUnidade(o) {
        return o && o.value !== null && o.value !== undefined ? [String(o.value), o.unit] : null;
    }

    /* posição dos objetos no espaço: "Ceres orbit · 2.64 AU from the Sun" -> 2 linhas curtas */
    function posicaoEmTexto(texto) {
        const en = String(texto).split(' \u00b7 ').map(p => p.trim()
            .replace(/ from the Sun$/i, ' from Sun')
            .replace(/^heading to (the constellation )?/i, '\u2192 ')
            .toUpperCase());
        const pt = en.map(p => {
            if (PT_POSICAO[p]) return PT_POSICAO[p];
            let m = p.match(/^([\d.]+) AU FROM SUN$/);
            if (m) return `${m[1].replace('.', ',')} UA DO SOL`;
            m = p.match(/^([\d.]+) AU FROM EARTH$/);
            if (m) return `${m[1].replace('.', ',')} UA DA TERRA`;
            return p;
        });
        return { pt, en };
    }

    function adaptaJson(J) {
        const cats = J.categories.map(c => c.id);
        const locais = J.locations.map(l => l.id);
        return J.cards.map((c, i) => {
            const cat = cats.indexOf(c.category.id);
            const local = locais.indexOf(c.location.id);
            if (cat < 0 || local < 0) throw new Error('categoria/local desconhecido em ' + c.id);

            const p = c.position;
            const pos = p.type === 'coordinates'
                ? { lat: p.latitude, lon: p.longitude }
                : posicaoEmTexto(p.text);

            const txtEnergia = String(c.power.text || '');
            const sub = txtEnergia.includes(' \u00b7 ') ? txtEnergia.split(' \u00b7 ').slice(1).join(' \u00b7 ') : '';
            const tipo = ENERGIA[c.power.type] || 'nen';

            const en = String(c.fun_fact).replace(/'/g, '\u2019');
            const velha = CARTAS_ANTIGAS[i];
            const ptOk = velha && velha.texto && String(velha.missao).toUpperCase() === String(c.mission).toUpperCase();

            return {
                id: c.id,
                cat, local,
                missao: String(c.mission).toUpperCase(),
                tam: valorUnidade(c.size),
                peso: valorUnidade(c.weight),
                pos,
                ini: c.launched,
                fim: c.lost_in,
                pot: sub ? [tipo, sub] : [tipo],
                texto: { pt: ptOk ? velha.texto.pt : en, en }
            };
        });
    }

    async function carregaCartas() {
        const r = await fetch(JSON_URL);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return adaptaJson(await r.json());
    }

    /* =========================================================
       1. DESENHO DAS CARTAS
       ========================================================= */

    function semGrao(s) {
        return s.replace(/<rect[^>]*filter="url\(#grao2?\)"[^>]*\/>/g, '');
    }

    function moldeCarta(miolo, { leve, rotulo, anim }) {
        return `<svg class="carta${anim ? ' anim' : ''}" xmlns="${NS}" viewBox="0 0 630 880" role="img" aria-label="${esc(rotulo)}">
${leve ? semGrao(ARTE.fundoBorda) : ARTE.fundoBorda}
${ARTE.painel}
${ARTE.interior}
${ARTE.moldura}
<text class="tag" x="315" y="96" text-anchor="middle" data-final="LEGACY OF GIANTS">LEGACY OF GIANTS</text>
${miolo}
${ARTE.rodape}
</svg>`;
    }

    function coord(v, eixo) {
        return (v < 0 ? '-' : '') + num(Math.abs(v).toFixed(2), idioma) + '\u00b0 ' + eixo;
    }

    function celulaNumero(valor, x, y, nd) {
        if (!valor) return `<text class="v" x="${x}" y="${y}" data-max="130">${nd}</text>`;
        const [n, u] = valor;
        const dec = (n.split('.')[1] || '').length;
        return `<text class="v" x="${x}" y="${y}" data-max="130"><tspan data-num="${n}" data-dec="${dec}">${num(n, idioma)}</tspan><tspan class="u"> ${u}</tspan></text>`;
    }

    function celulaAno(ano, x, y) {
        return `<text class="v" x="${x}" y="${y}" data-max="130"><tspan data-num="${ano}" data-de="1957">${ano}</tspan></text>`;
    }

    function frenteObjeto(c, { leve, anim }) {
        const t = T[idioma];
        let i = 0;
        const linha = () => `<g class="row" style="--i:${i++}">`;

        /* categoria + ícones */
        const chips = ARTE.icones.map((ic, k) =>
            `<g transform="translate(${312 + 49 * k} 143)"><g class="chip${k === c.cat ? ' on' : ''}"><rect class="bg" width="42" height="42" rx="9"/><g class="ico" transform="translate(7 7) scale(1.1667)">${ic}</g></g></g>`
        ).join('');
        const pills = t.locais.map((nome, k) =>
            `<g transform="translate(${276 + 94 * k} 245)"><g class="pill${k === c.local ? ' on' : ''}"><rect class="bg" width="88" height="30" rx="15"/><circle class="dot" cx="15" cy="15" r="4"/><text class="pill-t" x="52" y="20.5" text-anchor="middle">${nome}</text></g></g>`
        ).join('');

        /* localização: coordenadas ou texto em 1–2 linhas */
        let pos;
        if (c.pos.lat !== undefined) {
            pos = [coord(c.pos.lat, t.norte), coord(c.pos.lon, t.leste)];
        } else {
            pos = c.pos[idioma];
        }
        const posSvg = pos.length === 2
            ? pos.map((p, k) => `<text class="v-txt v-2" x="${COL[2]}" y="${362 + 23 * k}" data-max="138" data-g="b2">${esc(p)}</text>`).join('')
            : `<text class="v-txt v-2" x="${COL[2]}" y="373" data-max="138">${esc(pos[0])}</text>`;

        /* energia: nome + (opcional) potência */
        const [tipo, sub] = c.pot;
        const energia = sub
            ? `<text class="v-txt" x="${COL[2]}" y="450" data-max="130">${t.energia[tipo]}</text><text class="v-sub" x="${COL[2]}" y="470" data-max="130">${esc(sub)}</text>`
            : `<text class="v-txt" x="${COL[2]}" y="458" data-max="130">${t.energia[tipo]}</text>`;

        const miolo = `
${linha()}<rect class="caixa" x="64" y="122" width="502" height="164" rx="7"/><path class="div" d="M64 206 H566 M262 206 V286"/></g>
${linha()}<text class="rot" x="84" y="151">${t.rot.categoria}</text><text class="cat-v" x="84" y="188" data-max="214">${t.categorias[c.cat]}</text>${chips}</g>
${linha()}<text class="rot" x="84" y="234">${t.rot.missao}</text><text class="mis-v" x="84" y="265" data-max="164">${esc(c.missao)}</text><text class="rot" x="276" y="234">${t.rot.local}</text>${pills}</g>
${linha()}<rect class="caixa" x="64" y="306" width="502" height="176" rx="7"/><path class="div" d="M231.33 306 V482 M398.67 306 V482 M64 394 H566"/></g>
${linha()}<text class="rot" x="${COL[0]}" y="337">${t.rot.tamanho}</text>${celulaNumero(c.tam, COL[0], 372, t.nd)}</g>
${linha()}<text class="rot" x="${COL[1]}" y="337">${t.rot.peso}</text>${celulaNumero(c.peso, COL[1], 372, t.nd)}</g>
${linha()}<text class="rot" x="${COL[2]}" y="337">${t.rot.posicao}</text>${posSvg}</g>
${linha()}<text class="rot" x="${COL[0]}" y="425">${t.rot.partiu}</text>${celulaAno(c.ini, COL[0], 460)}</g>
${linha()}<text class="rot" x="${COL[1]}" y="425">${t.rot.perdido}</text>${celulaAno(c.fim, COL[1], 460)}</g>
${linha()}<text class="rot" x="${COL[2]}" y="425">${t.rot.energia}</text>${energia}</g>
${linha()}<rect class="caixa curio-caixa" x="64" y="502" width="502" height="242" rx="7"/><text class="rot curio-rot" x="84" y="532">${t.rot.curiosidade}</text></g>
<g class="curio" data-texto="${esc(c.texto[idioma])}" data-x="84" data-y="545" data-w="462" data-h="175" data-fs="27" data-i0="11"></g>`;

        const rotulo = `${c.missao}, ${t.categorias[c.cat].toLowerCase()}, ${t.locais[c.local].toLowerCase()}`;
        return moldeCarta(miolo, { leve, anim, rotulo });
    }

    /* ---------- cartas de instrução ---------- */
    const ICONE_CHAVE = '<circle cx="7.5" cy="12" r="4.2"/><path d="M11.7 12H22M18.5 12v3.2M21.6 12v2.2"/>';
    const ICONE_SYNC = '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>';

    function subLinhas(y, texto) {
        return `<path class="div fina linhas-sub" d=""/><text class="p-sub" x="315" y="${y}" text-anchor="middle" data-linhas="${y - 7}">${esc(texto)}</text>`;
    }

    function manualProtocolos({ leve, anim }) {
        const m = T[idioma].manual.protocolos;
        let i = 0;
        const ticks = Array.from({ length: 60 }, (_, k) => {
            const a = (k / 60) * Math.PI * 2, r1 = k % 5 === 0 ? 41 : 44, r2 = 47.5;
            return `M${(Math.sin(a) * r1).toFixed(2)} ${(-Math.cos(a) * r1).toFixed(2)} L${(Math.sin(a) * r2).toFixed(2)} ${(-Math.cos(a) * r2).toFixed(2)}`;
        }).join(' ');
        const linhas = PROTOCOLOS.map(([cod, senha], k) => {
            const topo = 379 + 62.17 * k, cy = topo + 31;
            return `<g class="row" style="--i:${3 + i++}">
${k > 0 ? `<path class="div fina" d="M64 ${topo.toFixed(1)} H566"/>` : ''}
<g transform="translate(85 ${(cy - 10).toFixed(1)}) scale(.95)"><g class="ico ouro">${ICONE_CHAVE}</g></g>
<text class="p-cod" x="123.5" y="${(cy + 8).toFixed(1)}">${esc(cod)}</text>
<text class="p-sen senha-on" x="545" y="${(cy + 8).toFixed(1)}" text-anchor="end" data-final="${esc(senha)}">${esc(senha)}</text></g>`;
        }).join('');
        const miolo = `
<g class="row" style="--i:0"><defs><radialGradient id="glowOuro"><stop offset=".72" stop-color="#E2B84A" stop-opacity=".22"/><stop offset="1" stop-color="#E2B84A" stop-opacity="0"/></radialGradient></defs><g transform="translate(315 172)">
  <circle r="62" fill="url(#glowOuro)"/>
  <circle r="50" fill="#0B1120" stroke="#E2B84A" stroke-width="2.6"/>
  <path d="${ticks}" stroke="#E2B84A" stroke-opacity=".6" stroke-width="1" fill="none"/>
  <circle r="32" fill="#10182E" stroke="#3C5585" stroke-width="1.6"/>
  <g transform="translate(-19.5 -19.5)"><g class="sync"><g class="ico ouro" transform="scale(1.625)" style="stroke-width:2.1">${ICONE_SYNC}</g></g></g>
</g></g>
<g class="row" style="--i:1"><text class="p-tit" x="315" y="279" text-anchor="middle" filter="url(#sombra)" data-max="480">${esc(m.titulo)}</text>${subLinhas(309, m.sub)}</g>
<g class="row" style="--i:2"><rect class="caixa" x="64" y="333" width="502" height="419" rx="7"/>
<text class="rot" x="123.5" y="361">${esc(m.cab[0])}</text><text class="rot" x="545" y="361" text-anchor="end">${esc(m.cab[1])}</text>
<path class="div" d="M64 379 H566"/></g>
${linhas}`;
        return moldeCarta(miolo, { leve, anim, rotulo: m.titulo });
    }

    function manualCategorias({ leve, anim }) {
        const m = T[idioma].manual.categorias, t = T[idioma];
        const linhas = m.itens.map(([l1, l2, ex], k) => {
            const topo = 207 + 108.2 * k, y = n => (topo + n).toFixed(1);
            return `<g class="row" style="--i:${2 + k}">
${k > 0 ? `<path class="div fina" d="M64 ${y(0)} H566"/>` : ''}
<g transform="translate(82 ${y(30)})"><rect width="47" height="47" rx="11" fill="#E2B84A"/><g class="ico" transform="translate(6.7 6.7) scale(1.4)" style="stroke:#141B30;stroke-width:2">${ARTE.icones[k]}</g></g>
<text class="rot m-rot" x="146" y="${y(29)}" data-max="290">${esc(t.categorias[k])}</text>
<text class="m-cont" x="545" y="${y(29)}" text-anchor="end">${contagem[k]} ${m.cartas}</text>
<text class="m-txt" x="146" y="${y(53)}" data-max="400">${esc(l1)}</text>
<text class="m-txt" x="146" y="${y(74)}" data-max="400">${esc(l2)}</text>
<text class="m-ex" x="146" y="${y(95)}" data-max="400">${esc(ex)}</text></g>`;
        }).join('');
        const miolo = `
<g class="row" style="--i:0"><text class="p-tit m-tit" x="315" y="154" text-anchor="middle" filter="url(#sombra)" data-max="500">${esc(m.titulo)}</text>${subLinhas(188, m.sub)}</g>
<g class="row" style="--i:1"><rect class="caixa" x="64" y="207" width="502" height="541" rx="7"/></g>
${linhas}`;
        return moldeCarta(miolo, { leve, anim, rotulo: m.titulo });
    }

    function manualComoLer({ leve, anim }) {
        const m = T[idioma].manual.comoler, t = T[idioma];
        const topo = k => 207 + 110 * k;
        const pillsDemo = t.locais.map((nome, k) => {
            const y = topo(1) + 33 + 24.4 * k, on = k === 0;
            return `<g transform="translate(440 ${y.toFixed(1)})"><g class="pill${on ? ' on' : ''}"><rect class="bg" width="107" height="22" rx="11"/><circle class="dot" cx="13" cy="11" r="3.4"/><text class="pill-t" x="62" y="15.4" text-anchor="middle" style="font-size:13px">${nome}</text></g></g>`;
        }).join('');
        const demo = [
            `<rect x="440" y="${topo(0) + 38}" width="106" height="33" rx="8" fill="#ffffff" fill-opacity=".04" stroke="#6F8EA6" stroke-width="1.5"/><text class="mis-v" x="493" y="${topo(0) + 60}" text-anchor="middle" style="font-size:16px">APOLLO 15</text>`,
            pillsDemo,
            `<text class="v" x="493" y="${topo(2) + 67}" text-anchor="middle"><tspan data-num="1.14" data-dec="2">${num('1.14', idioma)}</tspan><tspan class="u"> m</tspan></text>`,
            `<text class="m-aspas" x="495" y="${topo(3) + 90}" text-anchor="middle">\u201D</text>`
        ];
        const linhas = m.itens.map(([rot, ls], k) => {
            const y = n => (topo(k) + n).toFixed(1);
            return `<g class="row" style="--i:${2 + k}">
${k > 0 ? `<path class="div fina" d="M64 ${y(0)} H566"/>` : ''}
<circle cx="94" cy="${y(55)}" r="15" fill="#E2B84A"/><text class="m-num" x="94" y="${y(61)}" text-anchor="middle">${k + 1}</text>
<text class="rot m-rot" x="124" y="${y(29)}">${esc(rot)}</text>
${ls.map((l, n) => `<text class="m-txt" x="124" y="${y(53 + 21 * n)}" data-max="${k === 3 ? 330 : 300}">${esc(l)}</text>`).join('')}
${demo[k]}</g>`;
        }).join('');
        const miolo = `
<g class="row" style="--i:0"><text class="p-tit m-tit" x="315" y="154" text-anchor="middle" filter="url(#sombra)" data-max="500">${esc(m.titulo)}</text>${subLinhas(188, m.sub)}</g>
<g class="row" style="--i:1"><rect class="caixa" x="64" y="207" width="502" height="440" rx="7"/></g>
${linhas}
<g class="row" style="--i:6"><rect class="caixa" x="64" y="662" width="502" height="96" rx="7"/>
<text class="rot m-rot" x="84" y="692">${esc(m.jogoRot)}</text>
<text class="m-txt" x="84" y="717" data-max="462">${esc(m.jogo[0])}</text><text class="m-txt" x="84" y="738" data-max="462">${esc(m.jogo[1])}</text></g>`;
        return moldeCarta(miolo, { leve, anim, rotulo: m.titulo });
    }

    /* No visualizador o fundo com granulado vai numa camada separada, parada.
       O desenho final é idêntico, mas o granulado deixa de ser recalculado
       a cada quadro das animações (era o que mais pesava no celular). */
    const FUNDO_CAMADA = `<svg class="fundo-carta" xmlns="${NS}" viewBox="0 0 630 880" aria-hidden="true" focusable="false">${ARTE.fundoBorda}</svg>`;

    function svgDaCarta(item, opc) {
        let s;
        if (item.tipo === 'protocolos') s = manualProtocolos(opc);
        else if (item.tipo === 'categorias') s = manualCategorias(opc);
        else if (item.tipo === 'comoler') s = manualComoLer(opc);
        else s = frenteObjeto(item, opc);
        return opc.camada ? s.replace(ARTE.fundoBorda, '') : s;
    }

    /* =========================================================
       2. AJUSTE DE TEXTO (mesma lógica do modelo "Carta 01")
       ========================================================= */

    function paragrafo(svg) {
        const g = $('.curio', svg);
        if (!g || g.dataset.pronto) return;
        const D = g.dataset;
        const x0 = +D.x, W = +D.w, Hmax = +D.h, palavras = D.texto.split(/ +/);
        const m = document.createElementNS(NS, 'text');
        m.setAttribute('class', 't-c');
        g.appendChild(m);
        const larg = t => { m.textContent = t; return m.getComputedTextLength(); };
        const quebra = f => {
            m.style.fontSize = f + 'px';
            const L = []; let cur = '';
            for (const w of palavras) {
                const t = cur ? cur + ' ' + w : w;
                if (!cur || larg(t) <= W) cur = t; else { L.push(cur); cur = w; }
            }
            if (cur) L.push(cur);
            return L;
        };
        let melhor = null;
        for (let f = +D.fs; f >= Math.max(14, +D.fs - 3); f -= 0.5) {
            const L = quebra(f), viuva = L.length > 1 && !L[L.length - 1].includes(' ');
            if (L.length * f * 1.27 > Hmax || viuva) continue;
            melhor = { f, L };
            break;
        }
        if (!melhor) {
            let f = +D.fs;
            while (f > 14) { const L = quebra(f); if (L.length * f * 1.27 <= Hmax) break; f -= 0.5; }
            melhor = { f, L: quebra(f) };
        }
        const fs = melhor.f, linhas = melhor.L, lh = fs * 1.27;
        m.style.fontSize = fs + 'px';
        // rótulo + texto centralizados juntos na caixa
        const cx = $('.curio-caixa', svg), rot = $('.curio-rot', svg), capR = 11, vaoR = 16;
        const bloco = capR + vaoR + fs * 0.72 + (linhas.length - 1) * lh + fs * 0.22;
        const topo = +cx.getAttribute('y') + (+cx.getAttribute('height') - bloco) / 2;
        rot.setAttribute('y', (topo + capR).toFixed(1));
        const base1 = topo + capR + vaoR + fs * 0.72;
        linhas.forEach((l, i) => {
            const gg = document.createElementNS(NS, 'g');
            gg.setAttribute('class', 'row');
            gg.style.setProperty('--i', (+(D.i0 || 5)) + i);
            const t = document.createElementNS(NS, 'text');
            t.setAttribute('class', 't-c');
            t.setAttribute('x', x0);
            t.setAttribute('y', (base1 + i * lh).toFixed(1));
            t.style.fontSize = fs + 'px';
            t.textContent = l;
            gg.appendChild(t);
            g.appendChild(gg);
        });
        m.remove();
        D.pronto = '1';
    }

    function encaixa(svg) {
        $$('text[data-max]', svg).forEach(t => {
            const max = +t.dataset.max;
            let fs = parseFloat(getComputedStyle(t).fontSize);
            while (t.getComputedTextLength() > max && fs > 10) { fs -= 0.5; t.style.fontSize = fs + 'px'; }
        });
        // as duas linhas da localização ficam do mesmo tamanho
        const gs = {};
        $$('text[data-g]', svg).forEach(t => { (gs[t.dataset.g] = gs[t.dataset.g] || []).push(t); });
        Object.values(gs).forEach(a => {
            const mn = Math.min(...a.map(t => parseFloat(getComputedStyle(t).fontSize)));
            a.forEach(t => { t.style.fontSize = mn + 'px'; });
        });
    }

    function ajustaLinhas(svg) {
        $$('text[data-linhas]', svg).forEach(t => {
            const b = t.getBBox(), y = t.dataset.linhas, p = t.previousElementSibling;
            if (!p || !b.width) return;
            p.setAttribute('d', `M84 ${y} H${(b.x - 14).toFixed(1)} M${(b.x + b.width + 14).toFixed(1)} ${y} H546`);
        });
    }

    function preparaSvg(svg) {
        paragrafo(svg);
        encaixa(svg);
        ajustaLinhas(svg);
    }

    /* ---------- fontes: só mede o texto depois que carregarem ---------- */
    const fontesProntas = Promise.race([
        Promise.all(['400 22px Barlow', '800 52px Barlow', '400 20px "Barlow Semi Condensed"', '700 26px "Barlow Semi Condensed"',
            '600 16px Montserrat', '500 22px "JetBrains Mono"'].map(f => document.fonts.load(f)))
            .then(() => document.fonts.ready),
        new Promise(r => setTimeout(r, 4000))
    ]);

    /* =========================================================
       3. GRADE + FILTROS
       ========================================================= */
    const elGrade = $('#grade');
    const elGradeMan = $('#grade-manuais');
    const elFiltros = $('#filtros');
    const elContagem = $('#contagem');
    const elLimpar = $('#limpar');
    const elRolagem = $('#rolagem');
    const elFavFiltro = $('#filtro-fav');

    function nomeCarta(item) {
        const t = T[idioma], u = UI[idioma];
        if (item.tipo) return u.manualNome[item.tipo];
        return `${item.missao}, ${t.categorias[item.cat].toLowerCase()}, ${t.locais[item.local].toLowerCase()}`;
    }

    /* ---------- miniaturas: cada carta só é desenhada quando chega perto da tela ---------- */
    const fila = [];
    let filaRodando = false;

    function preencheMini(li) {
        const b = li.firstElementChild;
        if (!b || !b.classList.contains('vazio')) return;
        b.innerHTML = svgDaCarta(li._item, { leve: true, anim: false });
        const svg = b.firstElementChild;
        svg.setAttribute('aria-hidden', 'true');
        svg.removeAttribute('role');
        b.classList.remove('vazio');
        preparaSvg(svg);
    }

    function processaFila() {
        const t0 = performance.now();
        do {
            const li = fila.shift();
            if (li && li.isConnected && !li.hidden) preencheMini(li);
        } while (fila.length && performance.now() - t0 < 8);
        if (fila.length) requestAnimationFrame(processaFila); else filaRodando = false;
    }

    function enfileira(li) {
        fila.push(li);
        if (!filaRodando) { filaRodando = true; requestAnimationFrame(processaFila); }
    }

    const observador = 'IntersectionObserver' in window
        ? new IntersectionObserver(entradas => {
            entradas.forEach(e => {
                if (e.isIntersecting) { observador.unobserve(e.target); enfileira(e.target); }
            });
        }, { root: elRolagem, rootMargin: '600px 0px' })
        : null;

    const ICONE_ESTRELA = '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 3 1.1-6.1L3.2 9.6l6.1-.8z"/>';

    function criaAcoes() {
        const d = document.createElement('div');
        d.className = 'mini-acoes';
        d.innerHTML = `<button type="button" class="marca" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONE_ESTRELA}</svg></button>`;
        return d;
    }

    function pintaMini(li) {
        const u = UI[idioma], f = marcas.fav.has(li.dataset.id);
        li.classList.toggle('fav', f);
        const b = $('.marca', li);
        if (!b) return;   // miniatura sem botão de estrela (ex.: itens do manual)
        b.setAttribute('aria-pressed', String(f));
        b.setAttribute('aria-label', `${f ? u.favoritada : u.favoritar}: ${nomeCarta(li._item)}`);
        b.title = f ? u.favoritada : u.favoritar;
    }

    function atualizaMini(id) {
        const li = elGrade.querySelector(`.mini-item[data-id="${id}"]`);
        if (li) pintaMini(li);
    }

    function criaMini(item) {
        const li = document.createElement('li');
        li.className = 'mini-item';
        li.dataset.id = item.id;
        li._item = item;
        if (!item.tipo) { li.dataset.cat = item.cat; li.dataset.local = item.local; }
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'mini vazio';
        b.setAttribute('aria-label', `${UI[idioma].cartaDe}: ${nomeCarta(item)}`);
        li.appendChild(b);
        if (!item.tipo) { li.appendChild(criaAcoes()); pintaMini(li); }
        return li;
    }

    function desenhaGrade() {
        fila.length = 0;
        if (observador) observador.disconnect();
        const lis = cartas.map(criaMini);
        const lisMan = manuais.map(criaMini);
        elGrade.replaceChildren(...lis);
        elGradeMan.replaceChildren(...lisMan);
        lis.concat(lisMan).forEach(li => { if (observador) observador.observe(li); else enfileira(li); });
        aplicaFiltro();
    }

    function visivel(c, f) {
        return (f.local.size === 0 || f.local.has(c.local)) && (f.cat.size === 0 || f.cat.has(c.cat))
            && (!f.fav || marcas.fav.has(c.id));
    }

    function aplicaFiltro() {
        const nFav = cartas.filter(c => marcas.fav.has(c.id)).length;
        if (nFav === 0) filtro.fav = false;   // sem favoritas, o filtro não tem o que mostrar
        let n = 0;
        $$('.mini-item', elGrade).forEach((li, k) => {
            const ok = visivel(cartas[k], filtro);
            li.hidden = !ok;
            if (ok) {
                n++;
                // quem ainda não foi desenhado é observado de novo: garante o desenho ao reaparecer
                if (observador && li.firstElementChild.classList.contains('vazio')) {
                    observador.unobserve(li);
                    observador.observe(li);
                }
            }
        });
        const u = UI[idioma];
        elContagem.textContent = u.mostrando(n, cartas.length);
        elLimpar.hidden = filtro.local.size === 0 && filtro.cat.size === 0 && !filtro.fav;
        elFavFiltro.hidden = nFav === 0;   // o botão aparece quando existe a primeira favorita
        elFavFiltro.setAttribute('aria-pressed', String(filtro.fav));
        elFavFiltro.setAttribute('aria-label', `${u.favoritas}: ${nFav}`);
        elFavFiltro.title = u.favoritas;
        elFavFiltro.innerHTML = `<svg class="ico-f" viewBox="0 0 24 24" aria-hidden="true">${ICONE_ESTRELA}</svg><span class="f-n">${nFav}</span>`;
        atualizaBotoes();
    }

    function atualizaBotoes() {
        const u = UI[idioma], t = T[idioma];
        // quantas cartas aparecem com aquele item sozinho, mantendo os outros grupos de filtro
        const cLocal = k => cartas.filter(c => visivel(c, { ...filtro, local: new Set([k]) })).length;
        const cCat = k => cartas.filter(c => visivel(c, { ...filtro, cat: new Set([k]) })).length;
        const botao = (cls, ativo, texto, n, extra = '', desab = false) =>
            `<button type="button" class="${cls}" aria-pressed="${ativo}" ${desab ? 'disabled' : ''} ${extra}>${texto}<span class="f-n">${n}</span></button>`;
        const locais = t.locais.map((nome, k) => botao('f-pill', filtro.local.has(k), nome, cLocal(k), `data-local="${k}"`, cLocal(k) === 0 && !filtro.local.has(k)));
        const cats = u.catCurta.map((nome, k) => botao('f-cat', filtro.cat.has(k),
                `<svg class="ico-f" viewBox="0 0 24 24" aria-hidden="true">${ARTE.icones[k]}</svg><span>${nome}</span>`,
                cCat(k), `data-cat="${k}"`, cCat(k) === 0 && !filtro.cat.has(k)));
        $('#f-local').innerHTML = locais.join('');
        $('#f-cat').innerHTML = cats.join('');
    }

    elFiltros.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        const grupo = 'local' in b.dataset ? filtro.local : 'cat' in b.dataset ? filtro.cat : null;
        if (!grupo) return;
        const v = +b.dataset['local' in b.dataset ? 'local' : 'cat'];
        if (grupo.has(v)) grupo.delete(v); else grupo.add(v);   // liga/desliga cada filtro
        aplicaFiltro();
        const k = 'local' in b.dataset ? 'local' : 'cat';
        const novo = $(`#filtros [data-${k}="${b.dataset[k]}"]`);
        if (novo) novo.focus({ preventScroll: true });
    });

    elFavFiltro.addEventListener('click', () => {
        filtro.fav = !filtro.fav;
        aplicaFiltro();
    });

    elLimpar.addEventListener('click', () => {
        filtro.local.clear();
        filtro.cat.clear();
        filtro.fav = false;
        /* limpa também todas as favoritas, inclusive as salvas no aparelho */
        marcas.fav.clear();
        try { localStorage.removeItem(CHAVE_MARCAS); } catch (e) { /* ok */ }
        $$('.mini-item').forEach(pintaMini);
        pintaViewerMarcas();
        aplicaFiltro();
        $('#f-local button')?.focus({ preventScroll: true });
    });

    /* favoritar direto na miniatura */
    elGrade.addEventListener('click', e => {
        const b = e.target.closest('.marca');
        if (!b) return;
        const li = b.closest('.mini-item');
        alterna(li.dataset.id);
        pintaMini(li);
        pintaViewerMarcas();
        aplicaFiltro();
    });

    function aoClicarMini(e) {
        const b = e.target.closest('.mini');
        if (!b) return;
        const li = b.closest('.mini-item');
        const ehManual = li.parentElement === elGradeMan;
        const base = ehManual ? manuais : cartas.filter((c, k) => !$$('.mini-item', elGrade)[k].hidden);
        abre(base, base.findIndex(c => c.id === li.dataset.id), b);
    }
    elGrade.addEventListener('click', aoClicarMini);
    elGradeMan.addEventListener('click', aoClicarMini);

    /* =========================================================
       4. VISUALIZADOR
       ========================================================= */
    const visor = $('#visor');
    const palco = $('#palco');
    const cartao = $('#cartao');
    const giro = $('#giro');
    const faceFrente = $('#face-frente');
    const btnVirar = $('#btn-virar');
    const btnZoom = $('#btn-zoom');
    const meio = $('.visor-meio');
    const btnFav = $('#btn-fav');
    const btnAnt = $('#btn-ant');
    const btnProx = $('#btn-prox');
    const btnFechar = $('#btn-fechar');
    const elPos = $('#visor-pos');
    const elNome = $('#visor-nome');

    /* ampliar: a carta fica bem maior que a tela e o jogador rola para ler os dados
       (no celular a carta inteira cabe pequena demais para ler o texto) */
    function zoom(ligado) {
        const novo = ligado === undefined ? !visor.classList.contains('com-zoom') : ligado;
        visor.classList.toggle('com-zoom', novo);
        btnZoom.setAttribute('aria-pressed', String(novo));
        btnZoom.textContent = novo ? UI[idioma].reduzir : UI[idioma].ampliar;
        meio.scrollTop = 0;
        meio.scrollLeft = novo ? Math.max(0, (meio.scrollWidth - meio.clientWidth) / 2) : 0;
    }

    async function mostra(direcao, deMini) {
        const item = lista[indice];
        giro.classList.remove('virada');
        btnVirar.textContent = UI[idioma].virar;
        // a carta já aparece pronta, sem animação de entrada: o jogador precisa da informação na hora
        faceFrente.innerHTML = FUNDO_CAMADA + svgDaCarta(item, { leve: false, anim: false, camada: true });
        const svg = $('.carta', faceFrente);
        svg.style.visibility = 'hidden';
        await fontesProntas;
        if (!aberto || lista[indice] !== item) return;   // o jogador já trocou de carta
        preparaSvg(svg);
        svg.style.visibility = '';

        meio.scrollTop = 0;
        elPos.textContent = `${indice + 1} / ${lista.length}`;
        elNome.textContent = nomeCarta(item);
        pintaViewerMarcas();
        btnAnt.disabled = indice === 0;
        btnProx.disabled = indice === lista.length - 1;

        if (calmo || !palco.animate) return;
        if (deMini) {
            // a carta cresce a partir da miniatura que foi tocada
            const a = deMini.getBoundingClientRect(), b = cartao.getBoundingClientRect();
            palco.animate([
                { transformOrigin: '0 0', transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})` },
                { transformOrigin: '0 0', transform: 'none' }
            ], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
        } else if (direcao) {
            palco.animate([
                { transform: `translateX(${direcao * 46}px)`, opacity: 0 },
                { transform: 'none', opacity: 1 }
            ], { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
    }

    function abre(base, i, botao) {
        lista = base;
        indice = Math.max(0, i);
        origem = botao;
        aberto = true;
        zoom(false);
        visor.hidden = false;
        document.body.classList.add('com-visor');
        $('#verso-img').alt = UI[idioma].versoAlt;
        mostra(0, botao);
        btnFechar.focus({ preventScroll: true });
    }

    function fecha() {
        if (!aberto) return;
        aberto = false;
        visor.hidden = true;
        document.body.classList.remove('com-visor');
        faceFrente.innerHTML = '';
        if (origem && document.contains(origem) && !origem.closest('[hidden]')) origem.focus({ preventScroll: true });
    }

    function vai(passo) {
        const novo = indice + passo;
        if (novo < 0 || novo >= lista.length) return;
        indice = novo;
        mostra(passo);
    }

    btnFechar.addEventListener('click', fecha);
    btnZoom.addEventListener('click', () => zoom());
    btnAnt.addEventListener('click', () => vai(-1));
    btnProx.addEventListener('click', () => vai(1));
    btnVirar.addEventListener('click', () => {
        const v = giro.classList.toggle('virada');
        btnVirar.textContent = v ? UI[idioma].frente : UI[idioma].virar;
    });
    function pintaViewerMarcas() {
        const item = aberto ? lista[indice] : null;
        btnFav.hidden = !item || !!item.tipo;   // manuais não têm favorito
        if (btnFav.hidden) return;
        const u = UI[idioma], f = marcas.fav.has(item.id);
        btnFav.setAttribute('aria-pressed', String(f));
        btnFav.setAttribute('aria-label', f ? u.favoritada : u.favoritar);
        btnFav.title = f ? u.favoritada : u.favoritar;
    }

    function alternaDoViewer() {
        const item = lista[indice];
        if (!aberto || !item || item.tipo) return;
        alterna(item.id);
        atualizaMini(item.id);
        pintaViewerMarcas();
        aplicaFiltro();
    }
    btnFav.addEventListener('click', alternaDoViewer);
    visor.addEventListener('click', e => {
        if (e.target === visor || e.target.classList.contains('visor-corpo')) fecha();
    });

    document.addEventListener('keydown', e => {
        if (aberto) {
            if (e.key === 'Escape') { e.preventDefault(); fecha(); }
            else if (e.key === 'ArrowLeft') vai(-1);
            else if (e.key === 'ArrowRight') vai(1);
            else if (e.key === 'f' || e.key === 'F') alternaDoViewer();
            else if (e.key === 'z' || e.key === 'Z') zoom();
            else if (e.key === 'Tab') {
                // mantém o foco dentro do visualizador
                const f = $$('button:not(:disabled):not([hidden])', visor);
                if (!f.length) return;
                const a = f[0], z = f[f.length - 1];
                if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
                else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
            }
        } else if (e.key === 'Escape') {
            // mesmo atalho do menu: ESC volta
            location.href = $('#voltar').getAttribute('href');
        }
    });

    /* inclinar a carta com o mouse (no toque, deslizar troca de carta) */
    function inclina(x, y) {
        const r = cartao.getBoundingClientRect();
        const px = (x - r.left) / r.width, py = (y - r.top) / r.height;
        cartao.classList.add('mexendo');
        cartao.style.transform = `rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 14}deg)`;
        cartao.style.setProperty('--bx', px * 100 + '%');
        cartao.style.setProperty('--by', py * 100 + '%');
    }
    function solta() { cartao.classList.remove('mexendo'); cartao.style.transform = ''; }
    if (!calmo) {
        cartao.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') inclina(e.clientX, e.clientY); });
        cartao.addEventListener('pointerleave', solta);
    }

    let toque = null;
    visor.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') toque = { x: e.clientX, y: e.clientY }; });
    visor.addEventListener('pointerup', e => {
        if (!toque) return;
        const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
        toque = null;
        const comZoom = visor.classList.contains('com-zoom');
        if (!comZoom && Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) return vai(dx < 0 ? 1 : -1);
        // toque simples na carta: amplia (ou reduz). Com zoom, rolar/arrastar não conta como toque.
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && e.target.closest('#cartao')) zoom();
    });
    visor.addEventListener('pointercancel', () => { toque = null; });
    // com o mouse, clicar na carta também amplia/reduz
    cartao.addEventListener('click', e => { if (e.pointerType === 'mouse') zoom(); });

    /* =========================================================
       5. IDIOMA + TEXTOS FIXOS
       ========================================================= */
    function aplicaTextos() {
        const u = UI[idioma];
        document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : 'en';
        document.title = `${u.titulo} \u00b7 L.O.G.`;
        $('#t-menu').textContent = u.menu;
        $('#t-titulo').textContent = u.titulo;
        $('#t-sub').textContent = u.sub;
        $('#t-local').textContent = u.local;
        $('#t-cat').textContent = u.categoria;
        $('#t-obj').textContent = u.secObj;
        $('#t-man').textContent = u.secMan;
        $('#t-limpar').textContent = u.limpar;
        elFiltros.setAttribute('aria-label', idioma === 'pt' ? 'Filtros' : 'Filters');
        btnFechar.setAttribute('aria-label', u.fechar);
        btnAnt.textContent = u.anterior;
        btnProx.textContent = u.proxima;
        pintaViewerMarcas();
        btnVirar.textContent = giro.classList.contains('virada') ? u.frente : u.virar;
        btnZoom.textContent = visor.classList.contains('com-zoom') ? u.reduzir : u.ampliar;
        $$('.idioma button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma)));
    }

    $('.idioma').addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b || b.dataset.idioma === idioma) return;
        idioma = b.dataset.idioma;
        if (window.LOG_IDIOMA) window.LOG_IDIOMA.set(idioma);
        else try { localStorage.setItem('log-deck-idioma', idioma); } catch (err) { /* ok */ }
        aplicaTextos();
        fontesProntas.then(() => {
            if (!cartas.length) return;   // ainda carregando: o carregamento desenha no idioma atual
            const aberta = aberto ? lista[indice] : null;
            desenhaGrade();
            if (aberta) { mostra(0); }
        });
    });

    /* ---------- partida ---------- */
    function inicio() {
        // definições compartilhadas (gradientes, filtros e recortes), usadas por todas as cartas
        const defs = document.createElementNS(NS, 'svg');
        defs.setAttribute('width', '0');
        defs.setAttribute('height', '0');
        defs.setAttribute('aria-hidden', 'true');
        defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        defs.innerHTML = `<defs>${ARTE.defs}</defs>`;
        document.body.prepend(defs);

        aplicaTextos();
        elContagem.textContent = UI[idioma].carregando;
        // foco no contêiner de rolagem: roda do mouse e teclado funcionam logo de cara (inclusive no itch.io)
        elRolagem.focus({ preventScroll: true });

        Promise.all([carregaCartas(), fontesProntas])
            .then(([lista]) => {
                cartas = lista;
                contagem = [0, 0, 0, 0, 0];
                cartas.forEach(c => contagem[c.cat]++);
                desenhaGrade();
                document.body.classList.add('pronto');
            })
            .catch(err => {
                console.error('[deck] falha ao carregar', JSON_URL, err);
                elContagem.textContent = UI[idioma].erroDados;
            });
    }
    inicio();
})();