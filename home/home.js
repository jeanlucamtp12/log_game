document.addEventListener('DOMContentLoaded', () => {
    function init() {
        window.location.href = 'jogo.html';
    }

    document.addEventListener('click', (e) => {
        const ladoTela = e.target.closest('.lado-tela');
        if (ladoTela) {
            init();
        }
    });
});