// Configuração dos áudios do jogo.
// VOLUME: de 0 (mudo) a 1 (máximo). Ajuste cada um aqui.
// Os arquivos ficam na pasta /sound (irmã da pasta /js).
export const AUDIOS = {
  ambientacao:   { arquivo: "sound/tela-inicial.wav",    volume: 0.55, loop: true },
  aceleracao4s:  { arquivo: "sound/aceleracao-4s.wav",  volume: 0.6 },
  aceleracao6s:  { arquivo: "sound/aceleracao-6s.wav",  volume: 0.6 },
  salaOperacoes: { arquivo: "sound/sala-operacoes.wav", volume: 1, loop: true },
  alarm:         { arquivo: "sound/alarm.wav",          volume: 0.7 },
  falhaMissao:   { arquivo: "sound/falha-missao.wav",   volume: 0.8 },
  respErro:      { arquivo: "sound/resp-erro.wav",      volume: 0.7 },
};

// Resolve o caminho a partir deste arquivo (js/audio.js), e não da página que o importa.
// Assim funciona igual em jogo.html, index.html ou qualquer página em subpasta.
export function urlAudio(nome) {
  const cfg = AUDIOS[nome];
  return cfg ? new URL("../" + cfg.arquivo, import.meta.url).href : null;
}

function criar(nome) {
  const cfg = AUDIOS[nome];
  if (!cfg) return null;
  const audio = new Audio(urlAudio(nome));
  audio.volume = cfg.volume;
  audio.loop = !!cfg.loop;
  // arquivo ausente ou caminho errado: avisa no console em vez de falhar em silêncio
  audio.addEventListener("error", () => console.warn(`[audio] não foi possível carregar "${nome}": ${audio.src}`));
  return audio;
}

// Toca um áudio uma vez pelo nome. Se o arquivo não existir ainda, ignora sem erro.
export function tocar(nome) {
  const audio = criar(nome);
  if (!audio) return null;
  audio.play().catch(() => {});
  return audio;
}

// Músicas de fundo: só uma toca por vez (a ambientação é do menu inicial, a sala de operações é do jogo).
const MUSICAS = ["ambientacao", "salaOperacoes"];

// Toca um áudio em loop. O navegador só libera som depois de uma interação com a página,
// então tenta tocar logo e, se for bloqueado, começa no primeiro clique, toque ou tecla.
const loops = {};
export function iniciarLoop(nome) {
  // para as outras músicas de fundo (se existirem) antes de começar esta
  if (MUSICAS.includes(nome)) MUSICAS.filter((m) => m !== nome).forEach(pararLoop);

  const audio = loops[nome] || criar(nome);
  if (!audio) return null;
  loops[nome] = audio;

  const eventos = ["pointerdown", "keydown", "touchstart"];
  const limpar = () => eventos.forEach((e) => document.removeEventListener(e, tentar, true));
  function tentar() {
    audio.play().then(limpar).catch(() => {});
  }
  eventos.forEach((e) => document.addEventListener(e, tentar, true));
  tentar();
  return audio;
}

// Para um loop e o descarta (sem erro se ele nunca foi iniciado).
export function pararLoop(nome) {
  const audio = loops[nome];
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  delete loops[nome];
}