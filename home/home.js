document.addEventListener('DOMContentLoaded', () => {
    // lado da TELA: joga controlando a nave
    // lado da MESA: joga com as cartas (deck virtual, papel do Neil)
    const destinos = {
        '.lado-tela': 'jogo.html',
        '.lado-mesa': './home/deck/deck.html'
    };

    document.addEventListener('click', (e) => {
        for (const [seletor, pagina] of Object.entries(destinos)) {
            if (e.target.closest(seletor)) {
                window.location.href = pagina;
                return;
            }
        }
    });
});