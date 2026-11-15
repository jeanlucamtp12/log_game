// Música de ambientação da sala de operações (dentro da nave, durante o jogo).
// O navegador só libera som após a primeira interação, então tenta tocar logo
// e, se for bloqueado, começa no primeiro clique ou tecla.
import { AUDIOS } from "../js/audio.js";

const cfg = AUDIOS.ambientacao;
const musica = new Audio(cfg.arquivo);
musica.volume = cfg.volume;
musica.loop = true;

function iniciar() {
  musica.play().then(() => {
    document.removeEventListener("pointerdown", iniciar);
    document.removeEventListener("keydown", iniciar);
  }).catch(() => {});
}

document.addEventListener("pointerdown", iniciar);
document.addEventListener("keydown", iniciar);
iniciar();
