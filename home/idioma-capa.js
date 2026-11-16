/* =========================================================
   L.O.G · CAPA — botão de idioma (EN | PT)
   ---------------------------------------------------------
   Clicou, troca o jogo inteiro de idioma e salva a escolha
   (js/idioma.js, chave "log-deck-idioma", a mesma do deck).
   Na capa a troca vale na hora, sem recarregar.
   ========================================================= */
(function () {
    'use strict';
    var I = window.LOG_IDIOMA;
    if (!I) return;

    // textos fixos da capa: português (como está no HTML) -> inglês
    var EN = {
        'Alex controla a nave.': 'Alex flies the ship.',
        'Neil tem as cartas-chave.': 'Neil holds the key cards.',
        'História': 'Story',
        'Catálogo': 'Catalog',
        'Linguagem': 'Language',
        'Créditos': 'Credits',
        'Como jogar': 'How to play',
        'Pilote a nave': 'Fly the ship',
        'Assuma o comando na tela. Cuide da integridade da nave e leve a missão até o fim.':
            'Take command on the screen. Protect the ship’s integrity and complete the mission.',
        'Jogue com as cartas': 'Play with the cards',
        'Fora da tela, as cartas físicas estão nas suas mãos. Leia os sinais, decifre os códigos e guie o piloto.':
            'Off the screen, the physical cards are in your hands. Read the signs, crack the codes and guide the pilot.',
        'l.o.g.:~/equipe': 'l.o.g.:~/team',
        'Fechar créditos': 'Close credits',
        'cat equipe_l.o.g.': 'cat team_l.o.g.',
        'l.o.g.:~/catalogo': 'l.o.g.:~/catalog',
        'Fechar catálogo': 'Close catalog',
        'Tipo': 'Type',
        'Local': 'Location',
        'Ano': 'Year',
        'Ano inicial': 'Start year',
        'Ano final': 'End year',
        '‹ Catálogo': '‹ Catalog',
        '‹ Voltar': '‹ Back',
        'Pressione': 'Press',
        'para voltar ao menu!': 'to go back to the menu!'
    };

    // ---------------------------------------------------------
    // Imagens das opções do menu (História, Linguagem, Catálogo, Créditos)
    // Guarda o src original (inglês) e, no português, troca pela
    // imagem PT na mesma pasta. Cada opção é reconhecida pelo nome do
    // arquivo e, se não bastar, pelo alt / id / classe / href do botão.
    // ---------------------------------------------------------
    var OPCOES = [
        { re: /hist|stor/i,        pt: ['historiaPT.png'] },
        { re: /lingua|langua/i,    pt: ['linguagemPT.png'] },
        { re: /catalog/i,          pt: ['catalogoPT.png'] },
        { re: /credit/i,           pt: ['creditosPT.png', 'creditoPT.png'] }
    ];

    function semAcento(s) {
        return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function achaOpcao(img) {
        var src = img.getAttribute('src') || '';
        var pai = img.closest('.opcao-menu') || img.parentNode;
        var fontes = [
            src.split('/').pop(),                                   // nome do arquivo
            img.getAttribute('alt'),                                // alt
            pai && pai.id,                                          // id do botão
            pai && pai.className,                                   // classes do botão
            pai && pai.getAttribute && pai.getAttribute('href'),    // link
            pai && pai.getAttribute && pai.getAttribute('data-abrir')
        ];
        for (var i = 0; i < fontes.length; i++) {
            var f = semAcento(fontes[i]);
            if (!f) continue;
            for (var j = 0; j < OPCOES.length; j++) {
                if (OPCOES[j].re.test(f)) return OPCOES[j];
            }
        }
        return null;
    }

    var imagens = [];

    document.querySelectorAll('.opcao-menu img').forEach(function (img) {
        var src = img.getAttribute('src') || '';
        var op = achaOpcao(img);
        if (!op) {
            if (window.console) console.warn('[idioma-capa] imagem do menu não reconhecida:', src);
            return;
        }
        var arquivo = src.split('/').pop();
        var pasta = src.slice(0, src.length - arquivo.length);
        var candidatos = op.pt.map(function (n) { return pasta + n; });
        imagens.push({ el: img, en: src, pt: candidatos });
        candidatos.forEach(function (c) { new Image().src = c; }); // pré-carrega
    });

    // põe a imagem em PT; se o arquivo não existir, tenta o próximo nome
    // e, por fim, volta para a imagem em inglês
    function poePT(o, i) {
        i = i || 0;
        o.el.onerror = function () {
            if (i + 1 < o.pt.length) {
                poePT(o, i + 1);
            } else {
                o.el.onerror = null;
                o.el.src = o.en;
            }
        };
        o.el.src = o.pt[i];
    }

    var botao = document.getElementById('btnIdioma');
    var menu = document.getElementById('menuInicial') || document.body;

    function aplica(idioma) {
        I.traduzir(menu, EN, idioma);
        imagens.forEach(function (o) {
            if (idioma === 'pt') {
                poePT(o);
            } else {
                o.el.onerror = null;
                o.el.src = o.en;
            }
        });
        if (!botao) return;
        botao.querySelectorAll('[data-idioma]').forEach(function (b) {
            b.classList.toggle('ativo', b.getAttribute('data-idioma') === idioma);
        });
    }

    aplica(I.get());

    if (botao) {
        botao.addEventListener('click', function () {
            var novo = I.set(I.get() === 'en' ? 'pt' : 'en');
            aplica(novo);
        });
    }
})();