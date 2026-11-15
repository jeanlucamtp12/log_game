import {
  RELICS,
  RELIC_TYPES,
  LOCATIONS,
  MISSIONS,
  HINT_COMMANDS,
  MAX_SCORE,
  HINT_PENALTY,
  hintTier,
  hintCost,
  MAX_LIVES,
  WARP_DURATION_MS,
  LOCAL_HOP_MS,
  TYPEWRITER_DELAY_MS,
  REPORTS,
  CHECKPOINT_EVERY,
  HINT_EASY_THRESHOLD,
  parseCoordInput,
  coordMatches,
  formatCoord,
  parseDistanceInput,
  distMatches,
  formatTarget,
  placeName,
} from "./game-data.js";
import { iconSvg, mountIcons, typeIconSvg } from "./icons.js";

const SAVE_KEY = "lunar07-save";
const SAVE_VERSION = 4; // v4: objetos fixos por missão (missão 1 agora pede 2); saves anteriores são descartados
const TOTAL_REQUIRED = MISSIONS.reduce((sum, m) => sum + m.requiredCount, 0);
const SPACE = "espaco";
const SURFACE_IMAGES = {
  Lua: "./img/lua.png",
  Marte: "./img/marte.png",
};
const YEAR_MIN = Math.min(...RELICS.map((r) => Number(r.fields.ano)));
const YEAR_MAX = Math.max(...RELICS.map((r) => Number(r.fields.ano)));

const $ = (id) => document.getElementById(id);
const el = {
  viewport: $("viewport"),
  shell: document.querySelector(".ship-shell"),
  wakeLayer: $("wake-layer"),
  locationFilters: $("location-filters"),
  surfaceImgs: [$("surface-img-a"), $("surface-img-b"), $("surface-img-c")],
  scanPrompt: $("scan-prompt"),
  scanPromptText: $("scan-prompt-text"),
  waypointLabel: $("waypoint-label"),
  waypointTitle: $("waypoint-title"),
  waypointSub: $("waypoint-sub"),
  targetView: $("target-view"),
  targetImage: $("target-image"),
  monitors: { left: $("monitor-left"), right: $("monitor-right"), center: $("monitor-center") },
  objectivesList: $("objectives-list"),
  typeFilters: $("type-filters"),
  catalogCount: $("catalog-count"),
  yearFrom: $("year-from"),
  yearTo: $("year-to"),
  yearFill: $("year-fill"),
  yearTrack: $("year-track"),
  yearReadout: $("year-readout"),
  catalogBrowse: $("catalog-browse"),
  catalogList: $("catalog-list"),
  catalogDetail: $("catalog-detail"),
  catalogDetailCard: $("catalog-detail-card"),
  chatLog: $("chat-log"),
  threadList: $("thread-list"),
  threadView: $("thread-view"),
  threadTitle: $("thread-title"),
  threadBack: $("thread-back"),
  terminalLines: $("terminal-lines"),
  terminalOutput: $("terminal-output"),
  terminalForm: $("terminal-form"),
  commandInput: $("mission-command"),
  integrityReadout: $("integrity-readout"),
  integrityCells: $("integrity-cells"),
  integrityBlock: $("integrity-block"),
  xpBlock: $("xp-block"),
  xpCells: $("xp-cells"),
  xpReadout: $("xp-readout"),
  xpRank: $("xp-rank"),
  btnTarget: $("btn-target"),
  btnMission: $("btn-mission"),
  btnCatalog: $("btn-catalog"),
  btnMessages: $("btn-messages"),
  btnTerminal: $("btn-terminal"),
  btnManual: $("btn-manual"),
  messagesBadge: $("messages-badge"),
  hudMissionName: $("hud-mission-name"),
  hudStatus: $("hud-status"),
  missionTimer: $("mission-timer"),
  coordForm: $("coord-form"),
  coordInputs: [$("coord-lat"), $("coord-lon")], // [latitude N/S, longitude L/O]
  coordSubmit: $("coord-submit"),
  coordMode: $("coord-mode"),
  coordModeLabel: $("coord-mode-label"),
  coordLatLabel: $("coord-lat-label"),
  coordLonWrap: $("coord-lon-wrap"),
  coordFeedback: $("coord-feedback"),
  navTip: $("nav-tip"),
  navTipStep: $("nav-tip-step"),
  navTipText: $("nav-tip-text"),
  navTipClose: $("nav-tip-close"),
  navAlert: $("nav-alert"),
  navAlertCode: $("nav-alert-code"),
  navAlertText: $("nav-alert-text"),
  navAlertHull: $("nav-alert-hull"),
  surfaceDust: $("surface-dust"),
  warpLayer: $("warp-layer"),
  warpCanvas: $("warp-stars"),
  warpCoord: $("warp-coord"),
  warpTitle: $("warp-title"),
  foundModal: $("object-found-modal"),
  foundImage: $("found-image"),
  foundName: $("found-name"),
  foundDescription: $("found-description"),
  foundWeight: $("found-weight"),
  foundHeight: $("found-height"),
  foundCategory: $("found-category"),
  foundLocation: $("found-location"),
  foundCaption: $("found-image-caption"),
  endModal: $("mission-end-modal"),
  endEyebrow: $("end-eyebrow"),
  endTitle: $("end-title"),
  endSummary: $("mission-summary"),
  btnCatalogConfirm: $("btn-catalog-confirm"),
  gameOverModal: $("game-over-modal"),
  btnReports: $("btn-reports"),
  reportList: $("report-list"),
  syncWarning: $("sync-warning"),
  syncCode: $("sync-warning-code"),
  syncNote: $("sync-warning-note"),
  btnLight: $("btn-light"),
  reportContent: $("report-content"),
  btnReportClose: $("btn-report-close"),
};

let state;
// Painel aberto em cada vidro. Painéis do mesmo lado competem (só um por vez);
// lados opostos podem ficar abertos juntos. Catálogo e Manual ocupam o centro.
const opened = { left: null, right: null, center: null };
const isOpen = (name) => Object.values(opened).includes(name);
let catalogFilter = { type: "all", location: "all", from: YEAR_MIN, to: YEAR_MAX };
let traveling = false;
let openCatalogId = null;
let foundRelicId = null; // objeto cujo cartão está aberto no vidro (aguardando "Catalogar")
let lastLives = null;
let hitTimer = null;
let typewriterRun = 0;
let lastXp = null;

// Lado do vidro em que cada painel aparece (igual ao lado do botão no console).
// O Alvo (imagem) é do lado direito. Catálogo e Manual são exceções: abrem centralizados.
const SIDE = { objectives: "left", terminal: "left", catalog: "center", manual: "center", reports: "center", report: "center", messages: "right" };
const isWide = () => window.matchMedia("(min-width: 761px)").matches;
// O alvo só convive com painéis do lado esquerdo (e só em telas largas)
const targetFitsWith = (name) => isWide() && SIDE[name] === "left";
const XP_SEGMENTS = 10;
const XP_RANKS = [
  [4500, "Comandante"],
  [3500, "Piloto"],
  [2500, "Navegador"],
  [1500, "Cadete"],
  [0, "Recruta"],
];

function defaultState() {
  return {
    missionIndex: 0,
    cataloged: [],
    lives: MAX_LIVES,
    score: MAX_SCORE,
    hintsUsed: 0,
    location: SPACE, // "espaco" | "Lua" | "Marte": onde a nave está agora
    missionStartScore: MAX_SCORE, // pontuação ao começar a missão (restaurada se a missão falhar)
    selectedId: null,
    version: SAVE_VERSION,
    missionRelics: {}, // { [missionIndex]: [ids sorteados] }
    messages: {}, // { [missionIndex]: [linhas de texto] } — histórico de cada conversa
    unread: {}, // { [missionIndex]: nº de mensagens não lidas }
    readLines: {}, // { [missionIndex]: nº de linhas já digitadas/lidas na conversa }
    missionMistakes: 0, // coordenadas erradas na missão atual
    checkpointsReached: 0, // checkpoints (a cada 3 objetos) já disparados
    checkpointPending: false, // há um erro de sincronização aguardando o código no terminal
    lightsOn: true, // luz da cabine (chave no visor)
    pauseAt: null, // quando o cronômetro foi pausado no checkpoint
    usedCodes: [], // códigos de cartas coringa já usados
    reports: [], // relatórios desbloqueados: { n, code, stats }
    missionLog: [], // resumo de cada missão concluída (usado nos relatórios)
    missionStartedAt: Date.now(),
    missionElapsedMs: 0,
    missionSummary: null,
    terminalLines: [
      "SISTEMA DE ARQUIVO LUNAR v4.7",
      'Digite "help" para ver os comandos disponíveis.',
    ],
  };
}

const pad = (n, len = 2) => String(n).padStart(len, "0");
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const currentMission = () => MISSIONS[state.missionIndex];
const relicById = (id) => RELICS.find((r) => r.id === id);
const isCataloged = (id) => state.cataloged.includes(id);
const currentRelicIds = () => state.missionRelics[state.missionIndex] ?? [];
const missionRemaining = () => currentRelicIds().filter((id) => !isCataloged(id));
const missionCatalogedCount = () => currentRelicIds().length - missionRemaining().length;
const assignedRelicIds = () => Object.values(state.missionRelics).flat();
const totalUnread = () => Object.values(state.unread).reduce((a, b) => a + b, 0);
// Enquanto houver transmissão não lida, só Msgs e Manual ficam liberados.
const isLocked = () => totalUnread() > 0;
// Enquanto houver erro de sincronização, só Terminal (para o código) e Manual ficam liberados.
const isWarning = () => state.checkpointPending;
// "Objeto encontrado" e "Missão concluída" ficam no vidro até o jogador responder:
// enquanto isso o console fica travado (menos a chave de luz).
const isGlassModalOpen = () => foundRelicId !== null || !el.endModal.classList.contains("hidden");
const LOCKED_PANELS = new Set(["objectives", "terminal", "catalog", "reports"]);
const WARNING_LOCKED_PANELS = new Set(["objectives", "catalog", "reports"]);
const unreadIndex = () => {
  const list = Object.keys(state.unread).filter((k) => state.unread[k] > 0).map(Number);
  return list.length ? Math.max(...list) : null;
};
const missionShortName = (m) => m.title.split(" — ")[1] ?? m.title;

// Imagem do objeto (foto/ilustração oficial da NASA); se não houver URL, desenha um placeholder.
function placeholderSrc(text) {
  const label = escapeHtml(String(text).toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#07121a"/><g stroke="#4fe6ff" stroke-opacity=".25" fill="none"><circle cx="320" cy="190" r="70"/><circle cx="320" cy="190" r="110"/><path d="M320 60v260M190 190h260"/></g><text x="320" y="340" fill="#4fe6ff" font-family="monospace" font-size="22" text-anchor="middle" letter-spacing="3">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function imgSrc(relic) {
  return relic.image || placeholderSrc(relic.codename || relic.name);
}
// Se a imagem remota falhar (offline, link quebrado), troca por um placeholder uma única vez.
document.addEventListener(
  "error",
  (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = placeholderSrc("Imagem indisponível");
  },
  true,
);
// Legenda oficial da imagem (ex.: "Foto na Lua · NASA").
const imageCredit = (relic) => (relic.imageCaption ? `${relic.imageCaption} · NASA` : "NASA");

// ---- Objetos de cada missão ----
// Os objetos agora são FIXOS: vêm de MISSIONS[i].relics (game-data.js), na ordem definida lá.
// O sorteio abaixo só entra como reserva, se uma missão não tiver a lista `relics`.
// Nunca repete objeto entre missões. Com 2+ objetos, garante ao menos um de cada local.
// O restante é sorteado entre os que sobraram, sem esgotar um local a ponto de faltar
// objeto para as missões seguintes que também exigem um de cada.
function pickMissionRelics(index) {
  const mission = MISSIONS[index];
  const fixed = (mission.relics ?? []).filter((id) => RELICS.some((r) => r.id === id));
  if (fixed.length) return fixed;
  const used = new Set(assignedRelicIds());
  const pool = RELICS.filter((r) => !used.has(r.id));
  const later = MISSIONS.slice(index + 1).filter((m) => m.requiredCount >= 2).length;
  const picked = [];
  const take = (list) => {
    const relic = list[Math.floor(Math.random() * list.length)];
    picked.push(relic);
    pool.splice(pool.indexOf(relic), 1);
  };
  const left = (place) => pool.filter((r) => r.location === place).length;

  if (mission.requiredCount >= 2) {
    for (const place of LOCATIONS) {
      const options = pool.filter((r) => r.location === place.id);
      if (options.length) take(options);
    }
  }
  while (picked.length < mission.requiredCount && pool.length) {
    const safe = pool.filter((r) => left(r.location) > later);
    take(safe.length ? safe : pool);
  }
  // por segurança: se o acervo acabar, completa repetindo objetos
  while (picked.length < mission.requiredCount) {
    const spare = RELICS.filter((r) => !picked.includes(r));
    picked.push(spare[Math.floor(Math.random() * spare.length)]);
  }
  // embaralha para os "obrigatórios" não aparecerem sempre no topo da lista
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked.map((r) => r.id);
}

function ensureMissionRelics() {
  if (!state.missionRelics[state.missionIndex]) {
    state.missionRelics[state.missionIndex] = pickMissionRelics(state.missionIndex);
  }
}

let persistenceReady = false;
let saveTimer = null;

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(pushSave, 300);
}

function pushSave() {
  if (!persistenceReady) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Falha ao salvar no navegador:", error);
  }
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

function loadState() {
  const saved = loadSaved();
  const valid = saved && saved.version === SAVE_VERSION;
  state = valid ? { ...defaultState(), ...saved } : defaultState();
  // F5 zera o cronômetro da missão em andamento (se estiver pausado no erro de sincronização, continua pausado em 00:00)
  state.missionStartedAt = Date.now();
  if (state.pauseAt != null) state.pauseAt = state.missionStartedAt;
  if (!Array.isArray(state.terminalLines)) state.terminalLines = defaultState().terminalLines;
  ensureMissionRelics();
  persistenceReady = true;
}

// ===== Monitor (vidro da nave) =====
const SCREEN_TITLES = {
  objectives: "Selecionar missão",
  catalog: "Catálogo",
  manual: "Manual da nave",
  messages: "Mensagens",
  reports: "Relatórios L.O.G.",
  report: "Relatório L.O.G.",
  terminal: "Terminal",
};

function openMonitor(name) {
  const side = SIDE[name];
  if (isOpen(name)) return closeMonitor(side);
  // painel central cobre o vidro todo; no celular também só cabe um por vez
  if (side === "center" || !isWide()) closeAllMonitors();
  else closeMonitor("center");
  if (!targetFitsWith(name)) hideTarget();

  opened[side] = name;
  const overlay = el.monitors[side];
  overlay.hidden = false;
  const screen = overlay.querySelector(".monitor-screen");
  screen.style.animation = "none";
  void screen.offsetWidth; // reinicia a animação ao trocar de painel
  screen.style.animation = "";
  overlay.querySelectorAll("[data-screen]").forEach((section) => {
    section.hidden = section.dataset.screen !== name;
  });
  overlay.querySelector(".eyebrow").textContent = SCREEN_TITLES[name];

  if (name === "objectives") renderObjectives();
  if (name === "catalog") {
    showCatalogBrowse();
    renderCatalog();
  }
  if (name === "messages") renderThreadList();
  if (name === "reports") renderReportList();
  if (name === "terminal") {
    renderTerminal();
    setTimeout(() => el.commandInput.focus(), 80);
  }
  syncButtons();
}

function closeMonitor(side) {
  const was = opened[side];
  if (was === "messages") leaveThread();
  opened[side] = null;
  el.monitors[side].hidden = true;
  syncButtons();
  if (was === "report") afterReport();
}

function closeAllMonitors() {
  Object.keys(opened).forEach(closeMonitor);
}

function syncButtons() {
  const map = {
    objectives: el.btnMission,
    catalog: el.btnCatalog,
    manual: el.btnManual,
    messages: el.btnMessages,
    terminal: el.btnTerminal,
    reports: el.btnReports,
  };
  Object.entries(map).forEach(([name, btn]) => btn.setAttribute("aria-pressed", String(isOpen(name))));
  el.btnTarget.setAttribute("aria-pressed", String(!el.targetView.hidden));
  // com algum painel aberto o alerta de sincronização encolhe para não cobri-lo
  el.viewport.classList.toggle("panel-open", Object.values(opened).some(Boolean));
}

// ===== Cena (espaço, Lua ou Marte) =====
function setScene(place) {
  const inSpace = place === SPACE;
  el.viewport.classList.toggle("is-space", inSpace);
  el.viewport.classList.toggle("is-mars", place === "Marte");
  const src = SURFACE_IMAGES[place];
  if (!src) return;
  el.surfaceImgs.forEach((img) => {
    if (img.src !== src) img.src = src;
  });
}

// Voo rasante sobre a superfície.
// Três camadas da mesma foto fazem zoom exponencial a partir do horizonte (velocidade aparente
// constante). A cada volta, a camada que sumiu sorteia espelhamento, deslocamento e inclinação,
// então o ciclo nunca se repete igual. Sobre o zoom há ruído de navegação (rumo, arfagem,
// inclinação) e a velocidade respira. No salto, o chão acelera junto com o túnel.
const FLY = { CYCLE: 15, S0: 0.82, S1: 2.1 };

function createFlyover(imgs) {
  const layers = imgs.map((img, i) => ({ img, p: i / imgs.length, flip: 1, ox: 0, oy: 0, rot: 0 }));
  let last = performance.now();
  let t = 0;

  const reroll = (layer) => {
    layer.flip = Math.random() < 0.5 ? -1 : 1;
    layer.ox = (Math.random() - 0.5) * 7; // vw
    layer.oy = (Math.random() - 0.5) * 2.5; // vh
    layer.rot = (Math.random() - 0.5) * 3; // graus
  };

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (el.viewport.classList.contains("is-space") || document.hidden) return;
    t += dt;

    const breathe = 0.85 + 0.25 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.57);
    const boost = 1 + (warpBoost() - 1) * 0.12;
    const speed = (breathe * boost) / FLY.CYCLE;

    // ruído de navegação: soma de senos lentos
    const yaw = Math.sin(t * 0.13) * 1.6 + Math.sin(t * 0.34 + 1.3) * 0.7;
    const pitch = Math.sin(t * 0.17 + 0.6) * 0.8 + Math.sin(t * 0.43) * 0.3;
    const bank = Math.sin(t * 0.11 + 2) * 0.55 + Math.sin(t * 0.29) * 0.2;

    for (const layer of layers) {
      layer.p += speed * dt;
      if (layer.p >= 1) {
        layer.p -= 1;
        reroll(layer);
      }
      const p = layer.p;
      const s = FLY.S0 * Math.pow(FLY.S1 / FLY.S0, p);
      const style = layer.img.style;
      style.opacity = (0.85 * Math.min(smoothstep(p / 0.2), smoothstep((1 - p) / 0.22))).toFixed(3);
      style.zIndex = String(Math.round(p * 100)); // a camada mais próxima fica por cima
      // o rumo desloca mais as camadas próximas (paralaxe de profundidade)
      const tx = layer.ox + yaw * s;
      const ty = layer.oy + pitch * s;
      style.transform =
        `translate3d(-50%, -50%, 0) translate3d(${tx.toFixed(2)}vw, ${ty.toFixed(2)}vh, 0) ` +
        `rotate(${(layer.rot + bank).toFixed(3)}deg) scale(${(layer.flip * s).toFixed(4)}, ${s.toFixed(4)})`;
    }
  }

  layers.forEach(reroll);
  if (!reduceMotion) requestAnimationFrame(frame);
}

// Poeira em perspectiva real de chão: partículas nascem no horizonte e correm para fora e para
// baixo, cada vez maiores e mais rápidas (x = X/Z, y = H/Z). No salto, os riscos esticam.
function createSurfaceDust(canvas, { count = 150 } = {}) {
  const ctx = canvas.getContext("2d");
  const HORIZON = 0.58; // mesma linha de horizonte da imagem (object-position)
  let w = 0;
  let h = 0;
  let dpr = 1;
  let last = performance.now();
  const spawn = (anywhere) => ({
    X: (Math.random() * 2 - 1) * 2.2,
    Z: anywhere ? 0.06 + Math.random() * 0.94 : 1,
    size: 0.6 + Math.random() * 1.4,
    a: 0.35 + Math.random() * 0.5,
  });
  const motes = Array.from({ length: count }, () => spawn(true));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (el.viewport.classList.contains("is-space") || document.hidden) return;
    const boost = 1 + (warpBoost() - 1) * 0.2;
    const rgb = el.viewport.classList.contains("is-mars") ? "236,176,140" : "226,238,232";
    const vx = w / 2;
    const vy = h * HORIZON;
    const f = h * 0.275;
    const height = 0.9; // altura da câmera sobre o chão
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    for (const m of motes) {
      const prevZ = m.Z;
      m.Z -= 0.2 * boost * dt * (0.5 + (1 - m.Z)); // acelera ao se aproximar
      const x = vx + (m.X / m.Z) * f;
      const y = vy + (height / m.Z) * f;
      if (m.Z < 0.05 || y > h + 20 || x < -30 || x > w + 30) {
        Object.assign(m, spawn(false));
        continue;
      }
      const near = 1 - m.Z;
      const alpha = Math.min(1, near * 4) * m.a * (1 - Math.max(0, near - 0.85) * 4);
      ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(2)})`;
      ctx.lineWidth = m.size * (0.5 + near * 2.2);
      ctx.beginPath();
      ctx.moveTo(vx + (m.X / prevZ) * f, vy + (height / prevZ) * f);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  window.addEventListener("resize", resize);
  resize();
  if (!reduceMotion) requestAnimationFrame(frame);
}

function preloadSurfaces() {
  Object.values(SURFACE_IMAGES).forEach((url) => {
    new Image().src = url;
  });
}

// Campo de estrelas em 3D: a nave avança e as estrelas se afastam do ponto de fuga
// (aceleram perto da borda, como na perspectiva real). Um leve rolamento reforça a deriva.
// `boost` multiplica a velocidade e o tamanho do rastro: 1 = flutuando; valores altos = salto.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let warpRun = null; // { start, ms } enquanto a nave está em salto

const smoothstep = (x) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

// Acelera suavemente, segura a velocidade máxima no meio do salto e desacelera ao chegar.
function warpBoost() {
  if (!warpRun) return 1;
  const t = (performance.now() - warpRun.start) / warpRun.ms;
  return 1 + 70 * Math.min(smoothstep(t / 0.3), smoothstep((1 - t) / 0.25));
}

function createStarfield(canvas, { count = 460, isActive = () => true, getBoost = () => 1 } = {}) {
  const ctx = canvas.getContext("2d");
  const tints = ["255,255,255", "190,215,255", "255,236,205"];
  const SPEED = 0.035; // fração de profundidade percorrida por segundo (boost = 1)
  const TRAIL = 0.014; // comprimento do rastro (boost = 1)
  let w = 0;
  let h = 0;
  let dpr = 1;
  let last = performance.now();
  let clock = 0;

  const spawn = (anywhere) => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: anywhere ? 0.05 + Math.random() * 0.95 : 1,
    size: 0.5 + Math.random() * 0.9,
    tint: tints[Math.floor(Math.random() * tints.length)],
  });
  const stars = Array.from({ length: count }, () => spawn(true));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    if (reduceMotion) draw(0, 1);
  }

  function draw(dt, boost) {
    clock += dt;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.sin(clock * 0.06) * 0.025 * (boost > 1 ? 0.2 : 1));
    ctx.lineCap = "round";
    const reach = Math.hypot(w, h) / 2;
    const trail = TRAIL * (1 + (boost - 1) * 0.45);
    const fast = Math.min(1, (boost - 1) / 20); // 0 flutuando → 1 em velocidade de salto
    for (const star of stars) {
      star.z -= SPEED * boost * dt;
      const px = (star.x / star.z) * reach;
      const py = (star.y / star.z) * reach;
      if (star.z < 0.04 || Math.abs(px) > reach * 1.3 || Math.abs(py) > reach * 1.3) {
        Object.assign(star, spawn(false));
        continue;
      }
      const tz = Math.min(star.z + trail, 1.6);
      const alpha = Math.min(1, (1 - star.z) * 3.5 + fast * 0.4);
      ctx.strokeStyle = `rgba(${star.tint},${alpha.toFixed(2)})`;
      ctx.lineWidth = star.size * (0.6 + (1 - star.z) * (1.6 + fast * 1.4));
      ctx.beginPath();
      ctx.moveTo((star.x / tz) * reach, (star.y / tz) * reach);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (isActive()) draw(dt, getBoost());
  }

  window.addEventListener("resize", resize);
  resize();
  if (!reduceMotion) requestAnimationFrame(frame);
}

function startStarfield() {
  // céu da nave parada: flutua devagar
  createStarfield($("space-stars"), {
    isActive: () => el.viewport.classList.contains("is-space"),
  });
  // túnel do salto: as mesmas estrelas, só que aceleradas até virarem riscos de luz
  createStarfield(el.warpCanvas, {
    count: 720,
    isActive: () => warpRun !== null,
    getBoost: warpBoost,
  });
}

// ===== Abertura do visor (acordar) =====
function playWake(variant = "full") {
  const duration = variant === "full" ? 6200 : 3200;
  const layer = el.wakeLayer;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    layer.classList.add("hidden");
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    layer.classList.remove("hidden", "is-playing");
    el.shell.style.setProperty("--wake-ms", `${duration}ms`);
    void layer.offsetWidth;
    layer.classList.add("is-playing");
    el.shell.classList.add("is-booting");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      layer.removeEventListener("click", finish);
      layer.classList.remove("is-playing");
      layer.classList.add("hidden");
      el.shell.classList.remove("is-booting");
      resolve();
    };
    const timer = setTimeout(finish, duration);
    layer.addEventListener("click", finish);
  });
}

// ===== Target preview =====
function toggleTarget() {
  if (el.btnTarget.disabled) return;
  if (!el.targetView.hidden) return hideTarget();
  const relic = relicById(state.selectedId);
  if (!relic) return;
  // o alvo divide o lado direito: fecha o que compete com ele
  Object.entries(opened).forEach(([side, name]) => {
    if (name && !targetFitsWith(name)) closeMonitor(side);
  });
  el.targetImage.src = imgSrc(relic);
  el.targetImage.alt = relic.name;
  el.targetView.hidden = false;
  syncButtons();
}

function hideTarget() {
  el.targetView.hidden = true;
  syncButtons();
}

// ===== Objective selection =====
function selectObjective(id) {
  if (isCataloged(id) || !relicById(id)) return;
  state.selectedId = id;
  saveState();
  const relic = relicById(id);
  renderRadar();
  resetCoordForm();
  closeMonitor(SIDE.objectives);
  render();
  openMonitor("terminal");
  appendTerminal(
    `ALVO SELECIONADO: ${relic.name.toUpperCase()}.`,
    'Use "help" para ver as dicas disponíveis.',
  );
}

function clearSelection() {
  state.selectedId = null;
  hideTarget();
  renderRadar();
}

// Radar do vidro: alvo rastreado (também restaurado ao recarregar o jogo)
function renderRadar() {
  const relic = relicById(state.selectedId);

  
  if (relic) {
    el.waypointTitle.textContent = `Alvo: ${relic.name}`;
    //el.waypointSub.textContent = `Local: ${relic.location}`;
  }
  el.waypointLabel.hidden = !relic;
}

// ===== Coordinates =====
// Tipo de coordenada do Navegador, escolhido pelo JOGADOR no botão ao lado do "Ir":
//   "latlon" = dois campos (latitude N/S · longitude L/O) · "dist" = um campo, em UA.
// Não muda sozinho ao trocar de alvo: o jogador precisa ler a carta e escolher o tipo certo.
let coordMode = "latlon";

function toggleCoordMode() {
  if (el.coordMode.disabled || traveling) return;
  coordMode = coordMode === "dist" ? "latlon" : "dist";
  resetCoordForm();
  renderCoordinate();
  el.coordInputs[0].focus({ preventScroll: true });
}

function setFeedback(text = "", idle = false) {
  el.coordFeedback.textContent = text;
  el.coordFeedback.classList.toggle("is-idle", idle);
}

// Falhas do computador de navegação: soam como a nave falando, não como um formulário.
// Nenhuma mensagem revela qual eixo errou.
const NAV_FAULTS = [
  { code: "NAV-217 · VETOR REJEITADO", text: "Sem correspondência na carta estelar. Salto abortado antes da ignição." },
  { code: "NAV-304 · TRAVAMENTO FALHOU", text: "O giroscópio recusou o vetor e a manobra foi interrompida. Recalcule a rota." },
  { code: "NAV-118 · FORA DA TOLERÂNCIA", text: "O alvo não está onde o vetor aponta. O impulsor descarregou no vazio." },
  { code: "NAV-452 · ALINHAMENTO PERDIDO", text: "Os propulsores corrigiram à força e o casco sentiu o esforço. Confirme os eixos." },
  { code: "NAV-096 · SINAL NÃO CONFERE", text: "O transponder do alvo não respondeu a esse vetor. Verifique a ficha do objeto." },
];
// ---- Treinamento da missão 1 ----
// Quando a missão tem `tutorial: true`, o Neil explica no vidro qual tipo de coordenada o alvo usa
// e destaca o botão de alternar enquanto o Navegador estiver no tipo errado.
// 1º objeto: lat/lon (o Navegador já abre assim) · 2º objeto: UA (precisa apertar o botão).
let tutorialDismissed = false; // o jogador fechou as dicas (vale até recarregar a página)

function updateTutorialTip() {
  const target = relicById(state.selectedId);
  const on =
    !tutorialDismissed &&
    !!currentMission().tutorial &&
    !!target &&
    !traveling &&
    state.lives > 0 &&
    !isWarning() &&
    foundRelicId === null &&
    el.navAlert.hidden;
  el.navTip.hidden = !on;
  el.coordMode.classList.remove("is-tutorial");
  if (!on) return;

  const targetInSpace = target.navTipo === "distancia";
  const modeInSpace = coordMode === "dist";
  const mismatch = targetInSpace !== modeInSpace;
  const index = Math.max(0, currentRelicIds().indexOf(target.id));
  el.navTipStep.textContent = `${index + 1}/${currentRelicIds().length}`;
  el.coordMode.classList.toggle("is-tutorial", mismatch);

  let text;
  if (mismatch) {
    text = targetInSpace
      ? "Esta carta informa a posição em UA (distância), mas o Navegador está em latitude e longitude. Aperte o botão ⇄ ao lado do Ir para trocar o tipo."
      : "Esta carta traz latitude e longitude, mas o Navegador está em UA. Aperte o botão ⇄ ao lado do Ir para voltar a N/L.";
  } else {
    text = targetInSpace
      ? "Navegador em UA. Digite a distância que está na carta e aperte Ir."
      : "Esta carta usa latitude (N/S) e longitude (L/O). Preencha os dois campos e aperte Ir. Atenção: o próximo objeto pode usar outro tipo.";
  }
  el.navTipText.textContent = text;
}

// Tipo de coordenada errado (ex.: lat/lon para um objeto que usa UA): também custa integridade.
const WRONG_MODE_FAULT = {
  code: "NAV-071 · TIPO DE COORDENADA",
  text: "O alvo informa a posição em outro tipo de coordenada. Confira a ficha do objeto e o seletor do Navegador.",
};
let navFaultIndex = 0;
let navAlertTimer = null;
let navTypeTimer = null;

function typeInto(node, text, speed = 16) {
  clearInterval(navTypeTimer);
  if (reduceMotion) {
    node.textContent = text;
    return;
  }
  node.textContent = "";
  let i = 0;
  navTypeTimer = setInterval(() => {
    node.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(navTypeTimer);
  }, speed);
}

function showNavAlert({ code, text, hull = null, ms = 5200 }) {
  el.navTip.hidden = true; // o alerta de erro tem prioridade sobre a dica de treinamento
  el.navAlert.hidden = false;
  el.navAlert.classList.remove("is-showing");
  void el.navAlert.offsetWidth; // reinicia a animação se falhar duas vezes seguidas
  el.navAlert.classList.add("is-showing");
  el.navAlertCode.textContent = code;
  el.navAlertHull.textContent = hull ? `CASCO ${hull}` : "";
  el.navAlertHull.hidden = !hull;
  typeInto(el.navAlertText, text);
  el.coordForm.classList.remove("is-fault");
  void el.coordForm.offsetWidth;
  el.coordForm.classList.add("is-fault");
  clearTimeout(navAlertTimer);
  navAlertTimer = setTimeout(hideNavAlert, ms);
}

function hideNavAlert() {
  clearTimeout(navAlertTimer);
  clearInterval(navTypeTimer);
  el.navAlert.classList.remove("is-showing");
  el.navAlert.hidden = true;
  el.coordForm.classList.remove("is-fault");
  updateTutorialTip();
}

function resetCoordForm() {
  hideNavAlert();
  el.coordInputs.forEach((input) => (input.value = ""));
  setFeedback();
}

// Formato ilegível: avisa, mas não custa integridade.
function invalidVector(text) {
  showNavAlert({ code: "NAV-063 · FORMATO INVÁLIDO", text, ms: 4200 });
  setFeedback("FORMATO INVÁLIDO");
}

function submitCoordinate(event) {
  event.preventDefault();
  if (traveling || state.lives <= 0) return;
  const relic = relicById(state.selectedId);
  if (!relic) return;

  const inSpace = coordMode === "dist"; // tipo escolhido pelo jogador no botão do Navegador
  const relicInSpace = relic.navTipo === "distancia"; // tipo que o objeto realmente usa
  const typed = el.coordInputs.map((input) => input.value.trim());
  if (typed[0] === "" || (!inSpace && typed[1] === "")) {
    showNavAlert({
      code: "NAV-051 · VETOR INCOMPLETO",
      text: inSpace
        ? "O computador precisa da distância em UA para fechar a rota."
        : "O computador precisa da latitude e da longitude para fechar a rota.",
      ms: 3600,
    });
    setFeedback("VETOR INCOMPLETO");
    return;
  }

  let correct;
  if (inSpace) {
    const dist = parseDistanceInput(typed[0]);
    if (dist === null) return invalidVector("Não entendi a distância. Use um número em UA. Ex.: 2,64.");
    if (!relicInSpace) return failCoordinate(WRONG_MODE_FAULT);
    correct = distMatches(relic, dist);
  } else {
    const lat = parseCoordInput(typed[0], "lat");
    const lon = parseCoordInput(typed[1], "lon");
    if (lat === null || lon === null) {
      return invalidVector("Não entendi o vetor. Use números, com N/S na latitude e L/O na longitude. Ex.: 0,67 N e 23,47 L.");
    }
    if (relicInSpace) return failCoordinate(WRONG_MODE_FAULT);
    correct = coordMatches(relic, lat, lon);
  }
  if (!correct) return failCoordinate();

  resetCoordForm();
  rewardCorrectCoordinate();
  travelTo(relic);
}

// Acertou a coordenada: ganha XP. Abaixo da faixa laranja (<= limiar) recupera até 3000;
// acima dela soma 1000. Fórmula: max(limiar + 1000, XP atual + 1000), limitada ao máximo.
function rewardCorrectCoordinate() {
  const target = Math.min(MAX_SCORE, Math.max(HINT_EASY_THRESHOLD + 1000, state.score + 1000));
  const gain = target - state.score;
  if (gain <= 0) return;
  state.score = target;
  saveState();
  renderScore();
  appendTerminal(`ROTA CONFIRMADA · +${gain} XP`);
}

function failCoordinate(fault = null) {
  state.lives = Math.max(0, state.lives - 1);
  state.missionMistakes += 1;
  saveState();
  renderIntegrity();
  if (state.lives <= 0) {
    renderCoordinate();
    return showGameOver();
  }
  const shown = fault ?? NAV_FAULTS[navFaultIndex++ % NAV_FAULTS.length];
  showNavAlert({ ...shown, hull: `${pad(state.lives)}/${pad(MAX_LIVES)}` });
  setFeedback("ROTA REJEITADA");
}

// Se o objeto está em outro local, a nave salta até lá (e fica lá). No mesmo local, é só um deslocamento curto.
function travelTo(relic) {
  const changesPlace = state.location !== relic.location;
  const duration = changesPlace ? WARP_DURATION_MS : LOCAL_HOP_MS;

  traveling = true;
  renderCoordinate();
  setFeedback("Navegando…", true);
  closeMonitor("center");

  el.viewport.style.setProperty("--warp-ms", `${duration}ms`);
  el.warpTitle.textContent = changesPlace ? `Salto até ${placeName(relic.location)}` : "Deslocamento local";
  el.warpCoord.textContent = formatTarget(relic);
  el.viewport.classList.add("is-warping");
  el.warpLayer.classList.add("is-active");
  warpRun = { start: performance.now(), ms: duration };

  // a troca de cenário acontece no meio do salto, quando a tela está coberta pelo túnel
  if (changesPlace) {
    setTimeout(() => {
      state.location = relic.location;
      setScene(state.location);
      saveState();
    }, duration * 0.5);
  }

  setTimeout(() => {
    el.warpLayer.classList.remove("is-active");
    el.viewport.classList.remove("is-warping");
    warpRun = null;
    traveling = false;
    setFeedback();
    renderCoordinate();
    showObjectFound(relic);
  }, duration);
}

// ===== Fim de jogo (integridade zerada) =====
function showGameOver() {
  closeAllMonitors();
  hideTarget();
  foundRelicId = null;
  el.foundModal.classList.add("hidden");
  el.endModal.classList.add("hidden");
  el.gameOverModal.classList.remove("hidden");
}

// A missão falha: recomeça a missão atual, sem perder o que foi feito nas anteriores
async function restartMission() {
  el.gameOverModal.classList.add("hidden");
  const ids = currentRelicIds(); // mesmos objetos: a missão recomeça, não é re-sorteada
  state.cataloged = state.cataloged.filter((id) => !ids.includes(id));
  state.lives = MAX_LIVES;
  state.score = MAX_SCORE;
  state.hintsUsed = 0;
  state.missionMistakes = 0;
  state.terminalLines = defaultState().terminalLines;
  state.missionSummary = null;
  clearSelection();
  resetCoordForm();
  render();
  await playWake("short");
  startClock();
  receiveMessages(["Missão reiniciada. Integridade e XP restauradas."], state.missionIndex, { focus: true });
}

function showObjectFound(relic) {
  el.foundImage.src = imgSrc(relic);
  el.foundImage.alt = relic.name;
  el.foundImage.dataset.fallback = "";
  el.foundCaption.textContent = imageCredit(relic);
  el.foundName.textContent = relic.name;
  el.foundDescription.textContent = relic.description;
  el.foundWeight.textContent = relic.weight;
  el.foundHeight.textContent = relic.height;
  el.foundCategory.textContent = relic.category;
  el.foundLocation.textContent = placeName(relic.location);

  // o cartão aparece no vidro e o resto da nave espera: só "Catalogar objeto" o fecha
  foundRelicId = relic.id;
  closeAllMonitors();
  hideTarget();
  el.foundModal.classList.remove("hidden");
  renderCoordinate();
  renderBadges();
  el.btnCatalogConfirm.focus({ preventScroll: true });
}

function confirmCatalog() {
  const id = foundRelicId;
  if (!id) return;
  foundRelicId = null;
  if (!isCataloged(id)) state.cataloged.push(id);
  clearSelection();
  el.foundModal.classList.add("hidden");
  saveState();
  render();
  if (checkCheckpoint()) return;
  if (missionRemaining().length === 0) {
    setTimeout(completeMission, 600);
  }
}

// ===== Checkpoints e relatórios da L.O.G. =====
// A cada CHECKPOINT_EVERY objetos catalogados (no total) a nave sofre uma interferência:
// um warning vermelho (ERRO-xxxx) fica no centro do vidro e o terminal só aceita o código de
// sincronização da carta coringa desse erro. Com o código certo, o relatório abre no vidro.
function checkCheckpoint() {
  const due = Math.floor(state.cataloged.length / CHECKPOINT_EVERY);
  if (due <= state.checkpointsReached || due > REPORTS.length) return false;
  state.checkpointsReached = due;
  state.checkpointPending = true;
  state.pauseAt = Date.now();
  saveState();
  raiseSyncWarning();
  return true;
}

function raiseSyncWarning() {
  const data = REPORTS[state.reports.length];
  if (data) {
    const lines = [
      `ALERTA ${data.errorCode} · interferência de sincronização com a L.O.G..`,
      "Consulte o Manual, seção Erros. O terminal só aceita o código de sincronização.",
    ];
    if (state.reports.length === 0) {
      lines.push("Erros de sincronização são mais corriqueiros do que você imagina.");
    }
    appendTerminal(...lines);
  }
  renderBadges();
}

// Mostra ou esconde o warning no vidro e ajusta o terminal ao modo travado.
function renderWarning() {
  const warn = isWarning();
  el.viewport.classList.toggle("has-warning", warn);
  el.syncWarning.hidden = !warn;
  el.commandInput.placeholder = warn ? "código de sincronização" : "digite um comando";
  if (!warn) return;
  const data = REPORTS[state.reports.length];
  el.syncCode.textContent = data?.errorCode ?? "ERRO-0000";
  el.syncNote.hidden = state.reports.length > 0; // aviso extra só no primeiro erro
}

const normCode = (value) => String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");

// Terminal travado: qualquer entrada passa por aqui até o código certo ser digitado.
function trySyncCode(raw) {
  const pending = REPORTS[state.reports.length];
  if (!pending) {
    // segurança: erro sem relatório correspondente não pode travar o jogo
    state.checkpointPending = false;
    state.missionStartedAt += Date.now() - (state.pauseAt ?? Date.now());
    state.pauseAt = null;
    saveState();
    renderBadges();
    return appendTerminal("Sincronização restabelecida.");
  }
  const typed = normCode(raw);
  if (typed === normCode(pending.code)) return acceptSyncCode(pending);
  if (REPORTS.some((r) => normCode(r.code) === typed)) {
    return appendTerminal(`Código válido, mas não pertence a ${pending.errorCode}. Confira a carta indicada no Manual.`);
  }
  appendTerminal(
    `TERMINAL TRAVADO · ${pending.errorCode}.`,
    "Digite o código de sincronização. Consulte o Manual, seção Erros.",
  );
}

function acceptSyncCode(card) {
  const n = state.reports.length + 1;
  state.usedCodes.push(card.code);
  state.reports.push({ n, code: card.code, stats: reportStats() });
  state.checkpointPending = false;
  state.missionStartedAt += Date.now() - (state.pauseAt ?? Date.now()); // desconta o tempo pausado
  state.pauseAt = null;
  saveState();
  appendTerminal("CÓDIGO ACEITO. Sincronização restabelecida. Abrindo relatório da L.O.G.…");
  renderBadges();
  renderCoordinate();
  setTimeout(() => showReport(n, true), 900);
}

// Métricas acumuladas até o momento do checkpoint.
function reportStats() {
  const done = state.missionLog;
  const sum = (key) => done.reduce((a, e) => a + e[key], 0);
  return {
    lives: state.lives,
    xpSpent: sum("xpSpent") + Math.max(0, MAX_SCORE - state.score),
    hints: sum("hints") + state.hintsUsed,
    mistakes: sum("mistakes") + state.missionMistakes,
    time: formatTime(sum("elapsedMs") + elapsedMs()),
    found: state.cataloged.length,
    mission: state.missionIndex + 1,
  };
}

let reportFlow = false; // true = relatório recém-desbloqueado (ao fechar, a missão segue)

function showReport(n, fresh = false) {
  const entry = state.reports.find((r) => r.n === n);
  const data = REPORTS[n - 1];
  if (!entry || !data) return;
  reportFlow = fresh;
  const s = entry.stats;
  const metric = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;
  const lines = (list) => list.map((l) => `<p>${escapeHtml(l)}</p>`).join("");
  el.reportContent.innerHTML = `
    <span class="eyebrow">Relatório de Missão L.O.G. · Nº ${pad(n)}</span>
    <h3>${escapeHtml(data.title)}</h3>
    <div class="report-split">
      <section class="report-side">
        <h4>Unidade LUNA-07</h4>
        <small>Operador de nave · Jogador 1</small>
        <dl class="report-metrics">
          ${metric("Integridade", `${s.lives} / ${MAX_LIVES}`)}
          ${metric("XP gasta", s.xpSpent)}
          ${metric("Dicas usadas", s.hints)}
          ${metric("Coordenadas erradas", s.mistakes)}
          ${metric("Tempo", s.time)}
          ${metric("Objetos", s.found)}
        </dl>
        <div class="report-log">${lines(data.unit)}</div>
      </section>
      <section class="report-side is-right">
        <h4>Analista de Campo</h4>
        <small>Base L.O.G. · Jogador 2</small>
        <dl class="report-metrics">
          ${metric("Cartas processadas", n)}
          ${metric("Objetos verificados", s.found)}
          ${metric("Intervenções da unidade", s.hints + s.mistakes)}
          ${metric("Observação", "Contínua")}
        </dl>
        <div class="report-log">${lines(data.analyst)}</div>
      </section>
    </div>`;
  el.btnReportClose.textContent = fresh ? "Continuar" : "Voltar à lista";
  if (!isOpen("report")) openMonitor("report");
  const scroller = el.reportContent.closest(".monitor-body");
  if (scroller) scroller.scrollTop = 0;
}

// Botão do relatório: relatório novo segue a missão; relatório antigo volta para a lista.
function closeReport() {
  const fresh = reportFlow;
  closeMonitor("center"); // dispara afterReport()
  if (!fresh) openMonitor("reports");
}

// Roda sempre que o relatório sai do vidro (botão Continuar, X ou troca de painel).
function afterReport() {
  if (isLocked() && !state.checkpointPending) {
    const idx = unreadIndex();
    if (idx !== null) focusMessages(idx);
  }
  if (!reportFlow) return;
  reportFlow = false;
  if (missionRemaining().length === 0) setTimeout(completeMission, 400);
}

function renderReportList() {
  el.reportList.innerHTML = state.reports.length
    ? state.reports
        .map(
          (r) => `<button type="button" class="thread-row" data-report="${r.n}">
            <span class="thread-avatar">${pad(r.n)}</span>
            <span class="thread-info"><b>${escapeHtml(REPORTS[r.n - 1].title)}</b><small>${escapeHtml(r.code)}</small></span>
          </button>`,
        )
        .join("")
    : '<p class="modal-text">Nenhum relatório ainda. A cada 3 objetos catalogados a nave sofre uma interferência de sincronização. Resolva o erro com o código da carta coringa para liberar o relatório.</p>';
}

// ===== Mission flow =====
function completeMission() {
  const mission = currentMission();
  const elapsed = state.missionSummary ? state.missionElapsedMs : elapsedMs();
  state.missionElapsedMs = elapsed;
  state.missionSummary = {
    score: state.score,
    lives: state.lives,
    time: formatTime(elapsed),
    found: mission.requiredCount,
  };
  // registro para relatórios futuros (uma entrada por missão)
  if (!state.missionLog.some((entry) => entry.id === mission.id)) {
    state.missionLog.push({
      id: mission.id,
      relics: [...currentRelicIds()],
      xpLeft: state.score,
      xpSpent: Math.max(0, MAX_SCORE - state.score),
      hints: state.hintsUsed,
      mistakes: state.missionMistakes,
      lives: state.lives,
      elapsedMs: elapsed,
    });
  }
  // a transmissão final também fica no histórico da conversa da missão
  const thread = (state.messages[state.missionIndex] ??= []);
  if (!thread.includes(mission.outro[0])) thread.push(...mission.outro);
  state.readLines[state.missionIndex] = thread.length; // o desfecho fica só no histórico de Msgs (já lido)
  state.unread[state.missionIndex] = 0;
  saveState();
  renderBadges();

  el.endEyebrow.textContent =
    state.missionIndex >= MISSIONS.length - 1
      ? "Arquivo central restaurado"
      : "Missão concluída";
  el.endTitle.textContent = mission.title;
  el.endSummary.innerHTML = `
    <div><span>Pontuação</span><b>${state.missionSummary.score}</b></div>
    <div><span>Integridade</span><b>${state.missionSummary.lives} / ${MAX_LIVES}</b></div>
    <div><span>Tempo</span><b>${state.missionSummary.time}</b></div>
    <div><span>Objetos</span><b>${state.missionSummary.found}</b></div>
  `;
  closeAllMonitors();
  hideTarget();
  el.endModal.classList.remove("hidden");
  renderBadges();
  $("btn-next-mission").focus({ preventScroll: true });
}

function nextMission() {
  el.endModal.classList.add("hidden");
  if (state.missionIndex >= MISSIONS.length - 1) {
    resetGame();
    return;
  }
  state.missionIndex += 1;
  state.selectedId = null;
  state.lives = MAX_LIVES; // integridade é restaurada ao concluir cada missão
  state.terminalLines.push("Missão concluída. Integridade do casco restaurada.");
  state.score = MAX_SCORE; // XP é restaurada a cada nova missão
  state.missionStartScore = MAX_SCORE;
  state.hintsUsed = 0;
  state.missionMistakes = 0;
  state.missionStartedAt = Date.now();
  state.missionElapsedMs = 0;
  state.missionSummary = null;
  ensureMissionRelics();
  clearSelection();
  saveState();
  render();
  receiveMessages(currentMission().intro, state.missionIndex, { focus: true });
}

async function resetGame() {
  const lightsOn = state.lightsOn;
  state = defaultState();
  state.lightsOn = lightsOn; // a luz da cabine não volta sozinha ao reiniciar
  ensureMissionRelics();
  lastXp = null;
  applyLights(false);
  closeAllMonitors();
  el.gameOverModal.classList.add("hidden");
  el.endModal.classList.add("hidden");
  foundRelicId = null;
  el.foundModal.classList.add("hidden");
  clearSelection();
  resetCoordForm();
  saveState();
  render();
  await playWake("full");
  startClock();
  receiveMessages(currentMission().intro, state.missionIndex, { focus: true });
}

function startClock() {
  state.missionStartedAt = Date.now();
  saveState();
  tickTimer();
}

// ===== Mensagens (uma conversa por missão) =====
const ROLE = "L.O.G. // Transmissão";
const typingRuns = new WeakMap(); // cancela a digitação de um contêiner sem afetar os outros
let openThread = null; // índice da missão cuja conversa está aberta (null = lista)

const bumpRun = (container) => {
  const n = (typingRuns.get(container) || 0) + 1;
  typingRuns.set(container, n);
  return n;
};

// Chega uma transmissão nova. Fica salva na conversa da missão e conta como "não lida"
// até o jogador ver o texto terminar de ser digitado. Com focus, a conversa abre sozinha.
function receiveMessages(lines, index = state.missionIndex, { focus = false } = {}) {
  const thread = (state.messages[index] ??= []);
  thread.push(...lines);
  state.unread[index] = (state.unread[index] || 0) + 1;
  saveState();
  renderBadges();
  if (isOpen("messages") && openThread === index) showThread(index); // continua digitando de onde parou
  else if (focus) focusMessages(index);
  else if (isOpen("messages") && openThread === null) renderThreadList();
}

function focusMessages(index = state.missionIndex) {
  if (!isOpen("messages")) openMonitor("messages");
  showThread(index);
}

// Marca linhas como lidas conforme terminam de ser digitadas.
function markRead(index, count) {
  const total = (state.messages[index] ?? []).length;
  state.readLines[index] = Math.min(count, total);
  if (state.readLines[index] >= total && state.unread[index]) state.unread[index] = 0;
  saveState();
  renderBadges();
}

function bubbleHtml(text, role = ROLE) {
  return `<div class="chat-bubble"><div class="chat-role">${escapeHtml(role)}</div><div class="chat-body">${escapeHtml(text)}</div></div>`;
}

function renderThreadList() {
  leaveThread();
  el.threadView.hidden = true;
  el.threadList.hidden = false;
  const rows = [];
  for (let i = state.missionIndex; i >= 0; i--) {
    const mission = MISSIONS[i];
    const lines = state.messages[i] ?? [];
    const unread = state.unread[i] || 0;
    const done = i < state.missionIndex;
    rows.push(`
      <button type="button" class="thread-row${unread ? " has-unread" : ""}" data-thread="${i}">
        <span class="thread-avatar">${pad(mission.id)}</span>
        <span class="thread-info">
          <b>${escapeHtml(missionShortName(mission))}</b>
          <small>${escapeHtml(lines.length ? lines[lines.length - 1] : "Sem mensagens")}</small>
        </span>
        <span class="thread-meta">
          <em class="${done ? "is-done" : ""}">${done ? "Concluída" : "Em andamento"}</em>
          ${unread ? `<i class="thread-unread">${unread}</i>` : ""}
        </span>
      </button>`);
  }
  el.threadList.innerHTML = rows.join("");
}

function showThread(index) {
  if (!MISSIONS[index] || index > state.missionIndex) return;
  openThread = index;
  const lines = state.messages[index] ?? [];
  // linhas já lidas aparecem de uma vez; só as novas são digitadas aos poucos
  const seen = Math.min(state.readLines[index] ?? (state.unread[index] ? 0 : lines.length), lines.length);
  bumpRun(el.chatLog);
  el.threadList.hidden = true;
  el.threadView.hidden = false;
  el.threadTitle.textContent = MISSIONS[index].title;
  el.threadBack.hidden = false; // o botão Voltar e o título ficam no cabeçalho, ao lado de "Mensagens"
  el.threadTitle.hidden = false;
  el.chatLog.innerHTML = lines.slice(0, seen).map((line) => bubbleHtml(line)).join("");
  const scroller = el.chatLog.closest(".monitor-body");
  if (scroller) scroller.scrollTop = scroller.scrollHeight;
  if (seen < lines.length) {
    playTransmission(lines.slice(seen), el.chatLog, (n) => markRead(index, seen + n));
  } else if (state.unread[index]) {
    markRead(index, lines.length);
  }
}

function leaveThread() {
  openThread = null;
  el.threadBack.hidden = true;
  el.threadTitle.hidden = true;
  bumpRun(el.chatLog);
}

const skipFlags = new WeakSet(); // clique no texto = termina a digitação na hora

function playTransmission(lines, container, onLine) {
  const run = bumpRun(container);
  skipFlags.delete(container);
  const live = () => typingRuns.get(container) === run;
  const skipped = () => skipFlags.has(container);
  (async () => {
    for (let i = 0; i < lines.length; i++) {
      if (!live()) return;
      const body = appendChatBubble(container, ROLE);
      await typewrite(body, lines[i], live, skipped);
      if (!live()) return;
      onLine?.(i + 1);
      if (!skipped()) await wait(360);
    }
  })();
}

function appendChatBubble(container, role) {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.innerHTML = `<div class="chat-role">${escapeHtml(role)}</div><div class="chat-body"></div>`;
  container.appendChild(bubble);
  const scroller = container.closest(".monitor-body");
  (scroller ?? container).scrollTop = (scroller ?? container).scrollHeight;
  return bubble.querySelector(".chat-body");
}

async function typewrite(target, text, live, skipped = () => false) {
  target.textContent = "";
  for (let i = 0; i < text.length; i++) {
    if (!live()) return;
    if (skipped()) {
      target.textContent = text;
      break;
    }
    target.textContent += text[i];
    const scroller = target.closest(".monitor-body");
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    await wait(TYPEWRITER_DELAY_MS);
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ===== Terminal =====
function appendTerminal(...lines) {
  state.terminalLines.push(...lines);
  saveState();
  renderTerminal();
}

function renderTerminal() {
  el.terminalLines.innerHTML = state.terminalLines
    .map((line) => `<p class="${line.startsWith(">") ? "command-line" : ""}">${escapeHtml(line)}</p>`)
    .join("");
  el.terminalOutput.scrollTop = el.terminalOutput.scrollHeight;
}

function runCommand(raw) {
  const clean = raw.trim().toLowerCase();
  if (!clean) return;
  state.terminalLines.push(`> ${raw}`);

  // erro de sincronização ativo: o terminal só aceita o código da carta coringa
  if (state.checkpointPending) return trySyncCode(raw);

  if (clean === "clear") {
    state.terminalLines = [];
    saveState();
    return renderTerminal();
  }

  const cmd = HINT_COMMANDS[clean];
  if (!cmd) {
    return appendTerminal(`Comando não reconhecido: ${clean}. Digite "help" para a lista.`);
  }

  if (["help", "scan", "status"].includes(clean)) {
    return appendTerminal(cmd.hint(null, state));
  }

  const relic = relicById(state.selectedId);


  //EasterEggs
  if (["jean_rs"].includes(clean)) {
    return appendTerminal(cmd.hint(relic, state));
  }

  if (["leo_marq"].includes(clean)) {
    state.score = Math.max(0, state.score - 5 * HINT_PENALTY);
    appendTerminal(cmd.hint(relic, state));
    return renderScore();
  }

  if (["nay"].includes(clean)) {
    state.score = Math.min(5000, state.score + 10 * HINT_PENALTY);
    appendTerminal(cmd.hint(relic, state));
    return renderScore();
  }

  if (["caio"].includes(clean)) {
    state.lives = Math.min(3, state.lives + 2);
    saveState();
    renderIntegrity();
    return appendTerminal(cmd.hint(null, state));
  }

  if (["luis"].includes(clean)) {
    state.lives = Math.max(1, state.lives - 1);
    saveState();
    renderIntegrity();
    return appendTerminal(cmd.hint(null, state));
  }

  if (["gabriel"].includes(clean)) {
    appendTerminal(cmd.hint(null, state));
    setTimeout( () => {resetGame()}, 2000);
    return;
  }

  

  if (!relic) {
    return appendTerminal("NENHUM ALVO SELECIONADO. Escolha um objetivo na seleção de missão.");
  }

  // Dica difícil (XP > 2000, custa 500) ou fácil (XP <= 2000, custa 1000)
  const tier = hintTier(state.score);
  const cost = hintCost(state.score);
  const text = (tier === "easy" ? cmd.easy : cmd.hard)(relic);
  state.score = Math.max(0, state.score - cost);
  state.hintsUsed += 1;
  appendTerminal(text, `[${tier === "easy" ? "DICA FÁCIL" : "DICA DIFÍCIL"} · -${cost} XP]`);
  renderScore();
}

// ===== Catalogue =====
function showCatalogBrowse() {
  openCatalogId = null;
  el.catalogBrowse.hidden = false;
  el.catalogDetail.hidden = true;
}

// Filtro de tipo usa só o ícone (nome completo em title/aria-label); Local e "Todos" ficam com texto.
function chipsHtml(options, active, attr, withIcons = false) {
  return [{ id: "all", label: "Todos" }, ...options]
    .map((o) => {
      const icon = withIcons ? typeIconSvg(o.id, 18) : "";
      const label = escapeHtml(o.label);
      const cls = `type-chip${icon ? " type-chip-icon" : ""}${active === o.id ? " is-active" : ""}`;
      const extra = icon ? ` title="${label}" aria-label="${label}"` : "";
      return `<button type="button" class="${cls}" data-${attr}="${escapeHtml(o.id)}"${extra}>${icon || label}</button>`;
    })
    .join("");
}

function renderCatalogFilters() {
  el.typeFilters.innerHTML = chipsHtml(RELIC_TYPES, catalogFilter.type, "type", true);
  el.locationFilters.innerHTML = chipsHtml(LOCATIONS, catalogFilter.location, "location");
  el.yearFrom.min = el.yearTo.min = YEAR_MIN;
  el.yearFrom.max = el.yearTo.max = YEAR_MAX;
  el.yearFrom.value = catalogFilter.from;
  el.yearTo.value = catalogFilter.to;
  const span = YEAR_MAX - YEAR_MIN || 1;
  el.yearFill.style.left = `${((catalogFilter.from - YEAR_MIN) / span) * 100}%`;
  el.yearFill.style.right = `${100 - ((catalogFilter.to - YEAR_MIN) / span) * 100}%`;
  el.yearReadout.textContent = `${catalogFilter.from} - ${catalogFilter.to}`;
}

function filteredRelics() {
  return RELICS.filter((r) => {
    if (!isCataloged(r.id)) return false; // só aparece o que o jogador já catalogou
    const year = Number(r.fields.ano);
    const typeOk = catalogFilter.type === "all" || r.type === catalogFilter.type;
    const placeOk = catalogFilter.location === "all" || r.location === catalogFilter.location;
    return typeOk && placeOk && year >= catalogFilter.from && year <= catalogFilter.to;
  });
}

function renderCatalog() {
  renderCatalogFilters();
  el.catalogCount.textContent = `${pad(state.cataloged.length)} / ${pad(TOTAL_REQUIRED)}`;
  const items = filteredRelics();
  el.catalogList.innerHTML = items.length
    ? items.map(cardHtml).join("")
    : `<p class="catalog-empty">${state.cataloged.length ? "Nenhum objeto neste filtro." : "Nenhum objeto catalogado ainda."}</p>`;
}

function cardHtml(relic) {
  return `
    <button type="button" class="catalog-card" data-card="${relic.id}">
      <div class="card-title">${escapeHtml(relic.name)}</div>
      <img src="${escapeHtml(imgSrc(relic))}" alt="" />
      <div class="card-meta"><span>${escapeHtml(relic.fields.ano)}</span><span>${escapeHtml(relic.category)}</span></div>
    </button>`;
}

function openCatalogCard(id) {
  const relic = relicById(id);
  if (!relic || !isCataloged(id)) return;
  openCatalogId = id;
  el.catalogDetailCard.innerHTML = `
    <article class="catalog-card is-expanded">
      <div class="card-title">${escapeHtml(relic.name)}</div>
      <img src="${escapeHtml(imgSrc(relic))}" alt="${escapeHtml(relic.name)}" />
      <small class="card-credit">${escapeHtml(imageCredit(relic))}</small>
      <p>${escapeHtml(relic.description)}</p>
      <dl class="card-specs">
        <div><dt>Peso</dt><dd>${escapeHtml(relic.weight)}</dd></div>
        <div><dt>Altura</dt><dd>${escapeHtml(relic.height)}</dd></div>
        <div><dt>Ano</dt><dd>${escapeHtml(relic.fields.ano)}</dd></div>
        <div><dt>Missão</dt><dd>${escapeHtml(relic.fields.missao)}</dd></div>
        <div><dt>Local</dt><dd>${escapeHtml(placeName(relic.location))}</dd></div>
        <div><dt>Categoria</dt><dd>${escapeHtml(relic.category)}</dd></div>
      </dl>
    </article>`;
  el.catalogBrowse.hidden = true;
  el.catalogDetail.hidden = false;
}

function onYearInput(changed) {
  let from = Number(el.yearFrom.value);
  let to = Number(el.yearTo.value);
  if (from > to) {
    if (changed === "from") to = from;
    else from = to;
  }
  catalogFilter = { ...catalogFilter, from, to };
  renderCatalog();
}

// ===== Objectives =====
function renderObjectives() {
  el.objectivesList.innerHTML = currentRelicIds()
    .map((id) => {
      const relic = relicById(id);
      const done = isCataloged(id);
      const selected = state.selectedId === id;
      return `
        <button type="button" class="objective-row${selected ? " is-selected" : ""}${done ? " is-done" : ""}" data-select="${id}" ${done ? "disabled" : ""}>
          <img src="${escapeHtml(imgSrc(relic))}" alt="" />
          <span><b>${escapeHtml(relic.name)}</b><small></small></span>
          <em>${done ? "Concluído" : selected ? "Alvo" : "Selecionar"}</em>
        </button>`;
    })
    .join("");
}
//{escapeHtml(relic.location)}

// ===== Rendering =====
function renderIntegrity() {
  el.integrityReadout.textContent = `${pad(state.lives)} / ${pad(MAX_LIVES)}`;
  el.integrityCells.innerHTML = Array.from(
    { length: MAX_LIVES },
    (_, i) => `<span class="integrity-cell${i < state.lives ? " is-on" : ""}"></span>`,
  ).join("");
  el.integrityBlock.classList.toggle("is-critical", state.lives <= 1);
  renderGlassDamage();
}

// Vidro trincado: cada vida perdida abre mais uma trinca no visor (só visual).
// Quando a integridade cai, o casco também treme e o vidro pisca em vermelho.
function renderGlassDamage() {
  const lost = Math.min(3, Math.max(0, MAX_LIVES - state.lives));
  el.viewport.dataset.damage = String(lost);
  if (lastLives !== null && state.lives < lastLives) {
    el.viewport.classList.remove("is-hit");
    void el.viewport.offsetWidth; // reinicia a animação se levar dois golpes seguidos
    el.viewport.classList.add("is-hit");
    clearTimeout(hitTimer);
    hitTimer = setTimeout(() => el.viewport.classList.remove("is-hit"), 700);
  }
  lastLives = state.lives;
}

function renderScore() {
  renderExperience();
}

// Barra de experiência: cada segmento = 500 pts.
// Dicas: acima de 2000 XP custam 500 (difíceis); em 2000 ou menos custam 1000 (fáceis).
function renderExperience() {
  const step = MAX_SCORE / XP_SEGMENTS;
  const filled = Math.ceil(state.score / step);
  el.xpCells.innerHTML = Array.from(
    { length: XP_SEGMENTS },
    (_, i) => `<span class="integrity-cell${i < filled ? " is-on" : ""}"></span>`,
  ).join("");
  el.xpReadout.textContent = `${state.score} XP`;
  el.xpRank.textContent = XP_RANKS.find(([min]) => state.score >= min)[1];
  el.xpBlock.classList.toggle("is-low", state.score <= 2000);
  if (lastXp !== null && state.score < lastXp) {
    el.xpBlock.classList.remove("is-drain");
    void el.xpBlock.offsetWidth;
    el.xpBlock.classList.add("is-drain");
  }
  lastXp = state.score;
}

function renderBadges() {
  const story = isLocked(); // transmissão não lida
  const warn = isWarning(); // erro de sincronização
  const storyMsg = "Leia as mensagens da L.O.G. primeiro";
  const warnMsg = "Resolva o erro de sincronização primeiro";
  const modal = isGlassModalOpen(); // cartão aberto no vidro
  const modalMsg = "Responda ao aviso no visor primeiro";
  const lock = (btn, locked, reason) => {
    btn.disabled = locked;
    btn.classList.toggle("is-locked", locked);
    btn.title = locked ? reason : "";
  };
  el.messagesBadge.hidden = !story;
  [el.btnMission, el.btnCatalog, el.btnReports].forEach((btn) =>
    lock(btn, story || warn || modal, modal ? modalMsg : story ? storyMsg : warnMsg),
  );
  lock(el.btnTerminal, story || modal, modal ? modalMsg : storyMsg); // no erro de sincronização o terminal fica liberado
  lock(el.btnMessages, (warn && !story) || modal, modal ? modalMsg : warnMsg);
  lock(el.btnManual, modal, modalMsg);
  el.btnTarget.disabled = story || warn || modal || !relicById(state.selectedId);
  el.btnTarget.classList.toggle("is-locked", story || warn || modal);
  el.btnMessages.classList.toggle("needs-attention", story);
  el.btnManual.classList.toggle("needs-attention", warn && !story);
  el.btnTerminal.classList.toggle("needs-attention", warn && !story);
  renderWarning();
  if (!story && !warn) return;
  // fecha o que a trava não permite (ex.: recarregou com painel aberto)
  Object.entries(opened).forEach(([side, name]) => {
    if (!name) return;
    const blocked =
      (story && LOCKED_PANELS.has(name)) ||
      (warn && WARNING_LOCKED_PANELS.has(name)) ||
      (warn && !story && name === "messages");
    if (blocked) closeMonitor(side);
  });
  if (!el.targetView.hidden) hideTarget();
}

function renderStatus() {
  const mission = currentMission();
  el.hudMissionName.textContent = mission.title;
  el.hudStatus.textContent = `${missionCatalogedCount()} / ${mission.requiredCount}`;
}

function renderCoordinate() {
  const hasTarget = !!relicById(state.selectedId);
  const active = hasTarget && !traveling && state.lives > 0 && !isWarning() && foundRelicId === null;
  el.coordInputs.forEach((input) => (input.disabled = !active));
  el.coordSubmit.disabled = !active;
  el.coordMode.disabled = !active;
  // o tipo vem do botão do Navegador (não do alvo): UA = um campo; senão latitude (N/S) e longitude (L/O)
  const inSpace = coordMode === "dist";
  el.coordModeLabel.textContent = inSpace ? "UA" : "N/L";
  el.coordMode.setAttribute(
    "aria-label",
    inSpace
      ? "Tipo de coordenada: distância em UA. Aperte para usar latitude e longitude."
      : "Tipo de coordenada: latitude e longitude. Aperte para usar distância em UA.",
  );
  el.coordMode.title = inSpace ? "Trocar para latitude/longitude" : "Trocar para distância (UA)";
  updateTutorialTip();
  el.coordLatLabel.textContent = inSpace ? "UA" : "      N";
  el.coordInputs[0].placeholder = inSpace ? " 2,64" : " 0,67";
  el.coordInputs[0].setAttribute("aria-label", inSpace ? "Distância em UA" : "Latitude (N/S)");
  el.coordLonWrap.style.display = inSpace ? "none" : "";
  el.btnTarget.disabled = !hasTarget || isLocked() || isWarning() || isGlassModalOpen();
  if (!hasTarget && !traveling) setFeedback("Sem alvo ativo", true);
  else if (hasTarget && el.coordFeedback.classList.contains("is-idle") && !traveling) setFeedback();
}

function render() {
  setScene(state.location);
  renderStatus();
  renderRadar();
  renderIntegrity();
  renderCoordinate();
  renderBadges();
  renderScore();
  renderTerminal();
  if (isOpen("objectives")) renderObjectives();
  if (isOpen("catalog")) renderCatalog();
}

// ===== Luz da cabine =====
let lightsTimer = null;

function applyLights(animate = false) {
  const off = !state.lightsOn;
  const label = off ? "Acender a luz da cabine" : "Apagar a luz da cabine";
  el.btnLight.setAttribute("aria-pressed", String(!off));
  el.btnLight.setAttribute("aria-label", label);
  el.btnLight.title = label;
  el.shell.classList.remove("lights-anim-on", "lights-anim-off");
  if (animate && !reduceMotion) {
    void el.shell.offsetWidth; // reinicia a animação de piscada
    el.shell.classList.add(off ? "lights-anim-off" : "lights-anim-on");
    clearTimeout(lightsTimer);
    lightsTimer = setTimeout(() => el.shell.classList.remove("lights-anim-on", "lights-anim-off"), 1000);
  }
  el.shell.classList.toggle("lights-off", off);
}

function toggleLights() {
  state.lightsOn = !state.lightsOn;
  saveState();
  applyLights(true);
}

// ===== Timer =====
function elapsedMs() {
  return Math.max(0, (state.pauseAt ?? Date.now()) - state.missionStartedAt);
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function tickTimer() {
  el.missionTimer.textContent = formatTime(elapsedMs());
}

// ===== Events =====
function bindEvents() {
  el.btnTarget.addEventListener("click", toggleTarget);
  el.btnMission.addEventListener("click", () => openMonitor("objectives"));
  el.btnCatalog.addEventListener("click", () => openMonitor("catalog"));
  el.btnMessages.addEventListener("click", () => openMonitor("messages"));
  el.btnTerminal.addEventListener("click", () => openMonitor("terminal"));
  el.btnManual.addEventListener("click", () => openMonitor("manual"));
  document.querySelectorAll("[data-monitor-close]").forEach((button) => {
    button.addEventListener("click", () => closeMonitor(button.dataset.monitorClose));
  });

  el.objectivesList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select]");
    if (button && !button.disabled) selectObjective(button.dataset.select);
  });

  el.typeFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-type]");
    if (!button) return;
    catalogFilter = { ...catalogFilter, type: button.dataset.type };
    renderCatalog();
  });
  el.locationFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-location]");
    if (!button) return;
    catalogFilter = { ...catalogFilter, location: button.dataset.location };
    renderCatalog();
  });
  el.yearFrom.addEventListener("input", () => onYearInput("from"));
  el.yearTo.addEventListener("input", () => onYearInput("to"));

  el.catalogList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-card]");
    if (card) openCatalogCard(card.dataset.card);
  });
  $("catalog-back").addEventListener("click", () => {
    showCatalogBrowse();
    renderCatalog();
  });

  el.threadList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-thread]");
    if (row) showThread(Number(row.dataset.thread));
  });
  el.threadBack.addEventListener("click", renderThreadList);
  el.chatLog.addEventListener("click", () => skipFlags.add(el.chatLog));

  el.btnReports.addEventListener("click", () => openMonitor("reports"));
  el.reportList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-report]");
    if (row) showReport(Number(row.dataset.report));
  });
  el.btnReportClose.addEventListener("click", closeReport);
  el.btnLight.addEventListener("click", toggleLights);

  el.coordForm.addEventListener("submit", submitCoordinate);
  el.coordMode.addEventListener("click", toggleCoordMode);
  el.navTipClose.addEventListener("click", () => {
    tutorialDismissed = true;
    updateTutorialTip();
  });
  el.terminalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runCommand(el.commandInput.value);
    el.commandInput.value = "";
    saveState();
  });

  el.btnCatalogConfirm.addEventListener("click", confirmCatalog);
  $("btn-next-mission").addEventListener("click", nextMission);
  $("btn-restart").addEventListener("click", restartMission);
}

// ===== Painel proporcional à tela =====
// O painel é desenhado num tamanho de projeto e encolhido por inteiro (zoom) em telas menores.
// Celular em pé: só a largura conta (o teclado virtual mexe na altura). Demais telas: largura e altura.
function fitConsole() {
  const mobile = window.innerWidth <= 760;
  const fits = [1, window.innerWidth / (mobile ? 390 : 1000)];
  if (!mobile) fits.push(Math.max(window.innerHeight, 560) / 660);
  const scale = Math.max(0.5, Math.min(...fits));
  const width = mobile ? window.innerWidth / scale : Math.min(960, (window.innerWidth * 0.96) / scale);
  const root = document.documentElement.style;
  root.setProperty("--console-scale", scale.toFixed(3));
  root.setProperty("--console-w", `${width.toFixed(1)}px`);
}

// ===== Init =====
async function init() {
  fitConsole();
  window.addEventListener("resize", fitConsole);
  window.addEventListener("orientationchange", fitConsole);
  mountIcons();
  bindEvents();
  startStarfield();
  createFlyover(el.surfaceImgs);
  createSurfaceDust(el.surfaceDust);
  preloadSurfaces();
  loadState();
  render();
  applyLights(false);
  tickTimer();
  setInterval(tickTimer, 1000);

  const needsIntro = !(state.messages[state.missionIndex]?.length);
  await playWake("full");
  if (state.lives <= 0) return showGameOver();
  if (state.checkpointPending) {
    // recarregou com erro de sincronização: o warning já voltou ao vidro (render)
    if (needsIntro) receiveMessages(currentMission().intro);
    return;
  }
  if (needsIntro) {
    startClock();
    receiveMessages(currentMission().intro, state.missionIndex, { focus: true });
  } else if (missionRemaining().length === 0) {
    completeMission(); // recarregou com a missão já concluída: reabre o resumo
  } else if (isLocked()) {
    focusMessages(unreadIndex()); // recarregou com transmissão pendente: reabre a conversa
  }
}

init();


document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  window.location.href = "../index.html";
});