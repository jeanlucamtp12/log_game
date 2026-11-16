/* =========================================================
   L.O.G · IDIOMA (EN | PT) — compartilhado por todas as páginas
   ---------------------------------------------------------
   Script comum (não é módulo): carregue no <head>, antes dos outros.
   - Uma chave só no localStorage, a mesma do deck: "log-deck-idioma" ('en' ou 'pt').
   - Sem nada salvo, o jogo abre em IDIOMA_PADRAO (troque aqui para inverter).
   - traduzir(raiz, dicionario, idioma): troca textos fixos do HTML (texto, alt,
     title, aria-label, placeholder) pelo dicionário PT -> EN e guarda o original
     para voltar ao português sem recarregar.
   ========================================================= */
(function () {
    'use strict';

    var IDIOMA_PADRAO = 'en'; // o jurado é global: sem escolha salva, abre em inglês
    var CHAVE = 'log-deck-idioma';
    var ATRIBUTOS = ['alt', 'title', 'aria-label', 'placeholder'];

    function get() {
        try {
            var v = localStorage.getItem(CHAVE);
            if (v === 'en' || v === 'pt') return v;
        } catch (e) { /* sem armazenamento */ }
        return IDIOMA_PADRAO;
    }

    function set(idioma) {
        idioma = idioma === 'pt' ? 'pt' : 'en';
        try { localStorage.setItem(CHAVE, idioma); } catch (e) { /* sem armazenamento: vale até fechar */ }
        memoria = idioma;
        document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : 'en';
        try {
            document.dispatchEvent(new CustomEvent('log-idioma', { detail: idioma }));
        } catch (e) { /* navegador antigo */ }
        return idioma;
    }

    // se o localStorage falhar, a escolha vale enquanto a página estiver aberta
    var memoria = null;
    function atual() {
        if (memoria) return memoria;
        return get();
    }

    var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };
    var textoOriginal = new WeakMap();   // nó de texto -> texto em português
    var atribOriginal = new WeakMap();   // elemento -> { atributo: valor em português }

    function traduzir(raiz, dic, idioma) {
        if (!raiz || !dic) return;
        var en = idioma === 'en';
        var walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
            acceptNode: function (n) {
                var p = n.parentNode && n.parentNode.nodeName;
                return p === 'SCRIPT' || p === 'STYLE' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });
        var nos = [];
        while (walker.nextNode()) nos.push(walker.currentNode);
        nos.forEach(function (n) {
            var orig = textoOriginal.has(n) ? textoOriginal.get(n) : n.nodeValue;
            var chave = norm(orig);
            if (!chave) return;
            if (en && Object.prototype.hasOwnProperty.call(dic, chave)) {
                textoOriginal.set(n, orig);
                var ini = orig.match(/^\s*/)[0], fim = orig.match(/\s*$/)[0];
                n.nodeValue = ini + dic[chave] + fim;
            } else if (!en && textoOriginal.has(n)) {
                n.nodeValue = orig;
            }
        });
        var els = raiz.querySelectorAll ? raiz.querySelectorAll('[alt],[title],[aria-label],[placeholder]') : [];
        Array.prototype.forEach.call(els, function (el) {
            var guardado = atribOriginal.get(el) || {};
            ATRIBUTOS.forEach(function (a) {
                if (!el.hasAttribute(a) && !(a in guardado)) return;
                var orig = a in guardado ? guardado[a] : el.getAttribute(a);
                var chave = norm(orig);
                if (en && chave && Object.prototype.hasOwnProperty.call(dic, chave)) {
                    guardado[a] = orig;
                    el.setAttribute(a, dic[chave]);
                } else if (!en && a in guardado) {
                    el.setAttribute(a, orig);
                }
            });
            atribOriginal.set(el, guardado);
        });
    }

    // t('texto em português', 'English text'): escolhe pelo idioma atual
    function t(pt, en) { return atual() === 'en' ? en : pt; }

    window.LOG_IDIOMA = {
        PADRAO: IDIOMA_PADRAO,
        CHAVE: CHAVE,
        get: atual,
        set: set,
        t: t,
        ehIngles: function () { return atual() === 'en'; },
        traduzir: traduzir,
        norm: norm
    };

    document.documentElement.lang = atual() === 'pt' ? 'pt-BR' : 'en';
})();
