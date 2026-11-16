/* Generated with the assistance of: Claude Code */

document.addEventListener('DOMContentLoaded', () => {
    // lado da TELA: joga controlando a nave (Alex)
    // lado da MESA: joga com as cartas (deck virtual, papel do Neil)
    const destinos = {
        '.lado-tela': 'jogo.html',
        '.lado-mesa': './home/deck/deck.html'
    };

    // O modo história do Alex ainda não foi feito para celular; o deck do Neil funciona.
    const consultaCelular = window.matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 932px)');
    const ehCelular = () => consultaCelular.matches;

    const historia = document.getElementById('historia');
    let aviso = null;

    // texto do aviso no idioma escolhido na capa (js/idioma.js); remontado a cada abertura
    const t = (pt, en) => (window.LOG_IDIOMA ? window.LOG_IDIOMA.t(pt, en) : pt);
    const textoAviso = () =>
        '<div class="aviso-mobile-caixa">' +
        '<span class="aviso-mobile-selo">Alex</span>' +
        '<h3 id="avisoMobileTitulo">' + t('Indisponível no celular', 'Not available on phones') + '</h3>' +
        '<p>' + t('O modo história do Alex (pilotar a nave) ainda não está disponível em telas de celular. ' +
        'Abra no computador para jogar. Enquanto isso, você pode jogar com o deck virtual do Neil.',
        'Alex\u2019s story mode (flying the ship) is not available on phone screens yet. ' +
        'Open the game on a computer to play. Meanwhile, you can play with Neil\u2019s virtual deck.') + '</p>' +
        '<div class="aviso-mobile-acoes">' +
        '<a class="aviso-mobile-deck" href="./home/deck/deck.html">' + t('Abrir o deck do Neil', 'Open Neil\u2019s deck') + '</a>' +
        '<button type="button" class="aviso-mobile-fechar">' + t('Entendi', 'Got it') + '</button>' +
        '</div></div>';

    function mostrarAviso() {
        if (!aviso) {
            aviso = document.createElement('div');
            aviso.className = 'aviso-mobile';
            aviso.setAttribute('role', 'alertdialog');
            aviso.setAttribute('aria-labelledby', 'avisoMobileTitulo');
            aviso.addEventListener('click', (e) => {
                if (e.target === aviso || e.target.closest('.aviso-mobile-fechar')) fechar();
            });
            (historia || document.body).appendChild(aviso);
        }
        aviso.innerHTML = textoAviso();
        aviso.classList.add('aberto');
        aviso.querySelector('.aviso-mobile-fechar').focus({ preventScroll: true });
    }

    function fechar() {
        if (aviso) aviso.classList.remove('aberto');
    }

    function marcarCelular() {
        document.body.classList.toggle('modo-celular', ehCelular());
    }
    marcarCelular();
    consultaCelular.addEventListener('change', marcarCelular);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aviso && aviso.classList.contains('aberto')) {
            e.stopPropagation();
            fechar();
        }
    }, true);

    document.addEventListener('click', (e) => {
        if (e.target.closest('.aviso-mobile')) return;
        for (const [seletor, pagina] of Object.entries(destinos)) {
            if (e.target.closest(seletor)) {
                if (seletor === '.lado-tela' && ehCelular()) {
                    mostrarAviso();
                    return;
                }
                window.location.href = pagina;
                return;
            }
        }
    });
});