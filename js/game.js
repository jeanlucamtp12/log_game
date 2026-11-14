import {
  RELICS,
  MISSIONS,
  HINT_COMMANDS,
  HINT_CAPACITY_PER_MISSION,
  MAX_LIVES,
  WARP_DURATION_MS,
  TYPEWRITER_DELAY_MS,
} from "./game-data.js";

(() => {
  "use strict";

  const STORAGE_KEY = "lunar07-archive-v2";

  // Surfaces (Lua / Marte) — Pexels images
  const SURFACES = {
    Lua: [
      "https://images.unsplash.com/photo-1777277539249-34020e857900?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1777277539249-34020e857900?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1777277539249-34020e857900?auto=format&fit=crop&w=2200&q=90",
    ],
    Marte: [
      "https://images.pexels.com/photos/19446037/pexels-photo-19446037.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/7527857/pexels-photo-7527857.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      "https://images.pexels.com/photos/7527856/pexels-photo-7527856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    ],
  };

  // Build a fake coordinate code per relic, used as the "answer" the player must type.
  // The same code would be printed on the physical card.
  function buildCoordinate(relic, index) {
    const seed = relic.id
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const lat = ((seed * 7) % 90).toFixed(2);
    const lon = ((seed * 13) % 180).toFixed(2);
    const prefix = relic.location === "Marte" ? "M" : "L";
    return `${prefix}-${lat} / ${prefix}-${lon}`;
  }

  const RELIC_COORDS = {};
  RELICS.forEach((relic, index) => {
    RELIC_COORDS[relic.id] = buildCoordinate(relic, index);
  });

  console.log(RELIC_COORDS)

  const ICONS = {
    catalog:
      '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M4 5.5v17A2.5 2.5 0 0 1 6.5 20M8 7h8M8 11h6"/>',
    terminal:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    scan:
      '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/>',
    crosshair:
      '<circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    signal: '<path d="M4 20v-4M9 20v-8M14 20V8M19 20V4"/>',
    heart:
      '<path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>',
    token:
      '<path d="m12 2 7 4v8l-7 8-7-8V6z"/><path d="m12 6 3.5 2v4L12 16l-3.5-4V8z"/>',
    weight:
      '<path d="M6 8h12l2 13H4z"/><circle cx="12" cy="6" r="3"/><path d="M12 6h.01"/>',
    ruler:
      '<path d="m4 17 13-13 3 3L7 20z"/><path d="m14 7 3 3M11 10l2 2M8 13l3 3"/>',
    tag: '<path d="M3 12 12 3h7v7l-9 9z"/><circle cx="16" cy="8" r="1.5"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    guide:
      '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };

  // ===== State =====
  const defaultState = () => ({
    missionIndex: 0,
    cataloged: [],
    lives: MAX_LIVES,
    hintTokens: HINT_CAPACITY_PER_MISSION,
    selectedId: null,
    terminalLines: [
      "SISTEMA DE ARQUIVO LUNAR v4.7",
      'Digite "help" para ver os comandos disponíveis.',
    ],
    missionStartedAt: Date.now(),
    guideSeen: [],
    missionProgress: {}, // missionId -> count cataloged during that mission
  });

  let state = defaultState();
  let typewriterToken = 0; // cancels in-progress typewriter runs

  // ===== DOM =====
  const el = {
    viewport: document.getElementById("viewport"),
    surfaceImgs: [
      document.getElementById("surface-img-a"),
      document.getElementById("surface-img-b"),
      document.getElementById("surface-img-c"),
    ],
    missionLabel: document.getElementById("mission-label"),
    objectivesCount: document.getElementById("objectives-count"),
    catalogCount: document.getElementById("catalog-count"),
    scanSignals: document.getElementById("scan-signals"),
    scanPrompt: document.getElementById("scan-prompt"),
    scanPromptText: document.getElementById("scan-prompt-text"),
    telemetryLat: document.getElementById("telemetry-lat"),
    waypointLabel: document.getElementById("waypoint-label"),
    waypointTitle: document.getElementById("waypoint-title"),
    waypointSub: document.getElementById("waypoint-sub"),
    livesReadout: document.getElementById("lives-readout"),
    lifeDisplay: document.getElementById("life-display"),
    lifeIcons: () => document.querySelectorAll("#life-display .life-icon"),
    warpLayer: document.getElementById("warp-layer"),
    warpCoord: document.getElementById("warp-coord"),
    missionTimer: document.getElementById("mission-timer"),
    terminalShortcut: document.getElementById("terminal-shortcut"),

    // Overlays
    objectivesOverlay: document.getElementById("objectives-overlay"),
    objectivesList: document.getElementById("objectives-list"),
    objectivesProgress: document.getElementById("objectives-progress"),
    guideOverlay: document.getElementById("guide-overlay"),
    guideChat: document.getElementById("guide-chat"),
    guideBadge: document.getElementById("guide-badge"),
    archivePercent: document.getElementById("archive-percent"),
    archiveBar: document.getElementById("archive-bar"),
    missionObjectiveText: document.getElementById("mission-objective-text"),
    catalogOverlay: document.getElementById("catalog-overlay"),
    catalogList: document.getElementById("catalog-list"),
    terminalWindow: document.getElementById("terminal-window"),
    terminalLines: document.getElementById("terminal-lines"),
    terminalOutput: document.getElementById("terminal-output"),
    terminalForm: document.getElementById("terminal-form"),
    commandInput: document.getElementById("mission-command"),
    tokenRow: document.getElementById("token-row"),
    hintButton: document.getElementById("btn-hint"),

    // Coordinate
    btnCoordinate: document.getElementById("btn-coordinate"),
    coordModal: document.getElementById("coord-modal"),
    coordForm: document.getElementById("coord-form"),
    coordInput: document.getElementById("coord-input"),
    coordFeedback: document.getElementById("coord-feedback"),
    coordTargetName: document.getElementById("coord-target-name"),

    // Object found
    objectFoundModal: document.getElementById("object-found-modal"),
    foundImage: document.getElementById("found-image"),
    foundName: document.getElementById("found-name"),
    foundDescription: document.getElementById("found-description"),
    foundWeight: document.getElementById("found-weight"),
    foundHeight: document.getElementById("found-height"),
    foundCategory: document.getElementById("found-category"),
    foundLocation: document.getElementById("found-location"),
    btnCatalogConfirm: document.getElementById("btn-catalog-confirm"),
    btnCatalogDismiss: document.getElementById("btn-catalog-dismiss"),

    // Mission end
    missionEndModal: document.getElementById("mission-end-modal"),
    endEyebrow: document.getElementById("end-eyebrow"),
    endTitle: document.getElementById("end-title"),
    endChat: document.getElementById("end-chat"),
    btnNextMission: document.getElementById("btn-next-mission"),

    // Game over
    gameOverModal: document.getElementById("game-over-modal"),
    btnRestart: document.getElementById("btn-restart"),
  };

  // ===== Utilities =====
  function iconSvg(name, size = 20) {
    const paths = ICONS[name] || "";
    const fill = name === "heart" ? ' fill="currentColor"' : ' fill="none"';
    return `<svg aria-hidden="true"${fill} height="${size}" width="${size}" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7">${paths}</svg>`;
  }

  function mountIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
      if (node.dataset.iconMounted === "1") return;
      const name = node.dataset.icon;
      const size = Number(node.dataset.size || 20);
      node.innerHTML = iconSvg(name, size);
      node.dataset.iconMounted = "1";
    });
  }

  function pad(value, length = 2) {
    return String(value).padStart(length, "0");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function currentMission() {
    return MISSIONS[state.missionIndex] || MISSIONS[MISSIONS.length - 1];
  }

  function missionRemaining() {
    const mission = currentMission();
    return mission.relicIds.filter((id) => !state.cataloged.includes(id));
  }

  function totalRemaining() {
    return RELICS.filter((r) => !state.cataloged.includes(r.id));
  }

  function missionCatalogedCount() {
    const mission = currentMission();
    return mission.relicIds.filter((id) => state.cataloged.includes(id)).length;
  }

  function relicById(id) {
    return RELICS.find((r) => r.id === id);
  }

  // ===== Persistence =====
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      state = { ...defaultState(), ...saved };
    } catch {
      /* ignore corrupt storage */
    }
  }

  // ===== Surface (Lua/Marte) =====
  function setSurface(body) {
    const imgs = SURFACES[body] || SURFACES.Lua;
    el.surfaceImgs.forEach((img, i) => {
      img.src = imgs[i % imgs.length];
    });
    el.viewport.classList.toggle("is-mars", body === "Marte");
    el.telemetryLat.textContent =
      body === "Marte"
        ? "LAT 14.57216° S"
        : "LAT 00.67408° N";
  }

  // ===== Chat guide (typewriter) =====
  function clearGuideChat() {
    el.guideChat.innerHTML = "";
  }

  async function typewriteInto(container, text, token) {
    container.innerHTML = "";
    const textNode = document.createTextNode("");
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    container.appendChild(textNode);
    container.appendChild(cursor);
    for (let i = 0; i < text.length; i++) {
      if (token !== typewriterToken) return; // cancelled
      textNode.data += text[i];
      // auto-scroll the chat container
      el.guideChat.scrollTop = el.guideChat.scrollHeight;
      await new Promise((r) => setTimeout(r, TYPEWRITER_DELAY_MS));
    }
    cursor.remove();
  }

  function appendChatBubble(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = `
      <div class="chat-bubble-role"><span class="role-orb"></span>${escapeHtml(role)}</div>
      <div class="chat-bubble-body"></div>
    `;
    el.guideChat.appendChild(bubble);
    el.guideChat.scrollTop = el.guideChat.scrollHeight;
    return bubble.querySelector(".chat-bubble-body");
  }

  async function playChatLines(lines, { role = "ANSA // TRANSMISSÃO" } = {}) {
    const token = ++typewriterToken;
    for (const line of lines) {
      if (token !== typewriterToken) return;
      const body = appendChatBubble(role, line);
      await typewriteInto(body, line, token);
      await new Promise((r) => setTimeout(r, 380));
    }
  }

  // ===== Terminal =====
  function appendTerminalLines(...messages) {
    state.terminalLines.push(...messages);
    renderTerminalLines();
  }

  function renderTerminalLines() {
    el.terminalLines.innerHTML = state.terminalLines
      .map(
        (line) =>
          `<p class="${line.startsWith(">") ? "command-line" : ""}">${escapeHtml(line)}</p>`,
      )
      .join("");
    el.terminalOutput.scrollTop = el.terminalOutput.scrollHeight;
  }

  function runCommand(raw) {
    const clean = raw.trim().toLowerCase();
    if (!clean) return;
    appendTerminalLines(`> ${raw}`);

    if (clean === "clear") {
      state.terminalLines = [];
      renderTerminalLines();
      return;
    }

    if (clean === "hint") {
      useHintButton();
      return;
    }

    const cmd = HINT_COMMANDS[clean];
    if (!cmd) {
      appendTerminalLines(
        `Comando não reconhecido: ${clean}. Digite "help" para a lista.`,
      );
      return;
    }

    if (clean === "help" || clean === "scan") {
      appendTerminalLines(cmd.hint(null, state));
      return;
    }

    if (clean === "status") {
      appendTerminalLines(cmd.hint(null, state));
      return;
    }

    // Hint commands require a selected target
    if (!state.selectedId) {
      appendTerminalLines(
        "NENHUM ALVO SELECIONADO. Abra Objetivos e escolha um objeto primeiro.",
      );
      return;
    }

    if (state.hintTokens <= 0) {
      appendTerminalLines("TOKENS ESGOTADOS. Nenhuma pista disponível.");
      return;
    }

    const relic = relicById(state.selectedId);
    if (!relic) return;

    state.hintTokens -= 1;
    saveState();
    const out = cmd.hint(relic, state);
    appendTerminalLines(out);
    renderTokens();
  }

  function useHintButton() {
    if (!state.selectedId) {
      appendTerminalLines(
        "NENHUM ALVO SELECIONADO. Abra Objetivos e escolha um objeto primeiro.",
      );
      return;
    }
    if (state.hintTokens <= 0) {
      appendTerminalLines("TOKENS ESGOTADOS.");
      return;
    }
    const relic = relicById(state.selectedId);
    if (!relic) return;
    // Default hint: the year of loss
    state.hintTokens -= 1;
    saveState();
    appendTerminalLines(
      `DICA DECRIPTADA — ANO DA PERDA: ${relic.fields.ano}. (Correlação histórica em arquivo.)`,
    );
    renderTokens();
  }

  // ===== Panels =====
  function openPanel(name) {
    closeAllPanels({ keepTerminal: name === "terminal" });
    if (name === "objectives") {
      renderObjectives();
      el.objectivesOverlay.classList.add("open");
    }
    if (name === "catalog") {
      renderCatalog();
      el.catalogOverlay.classList.add("open");
    }
    if (name === "guide") el.guideOverlay.classList.add("open");
    if (name === "terminal") {
      el.terminalWindow.classList.remove("hidden");
      setTimeout(() => el.commandInput.focus(), 80);
    }
  }

  function closePanel(name) {
    if (name === "objectives") el.objectivesOverlay.classList.remove("open");
    if (name === "catalog") el.catalogOverlay.classList.remove("open");
    if (name === "guide") el.guideOverlay.classList.remove("open");
    if (name === "terminal") el.terminalWindow.classList.add("hidden");
    if (name === "coord") el.coordModal.classList.add("hidden");
    if (name === "found") el.objectFoundModal.classList.add("hidden");
    if (name === "end") el.missionEndModal.classList.add("hidden");
  }

  function closeAllPanels(options = {}) {
    el.objectivesOverlay.classList.remove("open");
    el.catalogOverlay.classList.remove("open");
    el.guideOverlay.classList.remove("open");
    el.coordModal.classList.add("hidden");
    el.objectFoundModal.classList.add("hidden");
    el.missionEndModal.classList.add("hidden");
    if (!options.keepTerminal) el.terminalWindow.classList.add("hidden");
  }

  // ===== Object selection =====
  function selectObjective(id) {
    const relic = relicById(id);
    if (!relic) return;
    if (state.cataloged.includes(id)) return; // already done
    state.selectedId = id;
    saveState();

    // Update scan prompt + waypoint
    el.scanPrompt.classList.add("is-tracking");
    el.scanPromptText.textContent = `RASTREANDO: ${relic.name.toUpperCase()}`;
    el.waypointLabel.hidden = false;
    el.waypointTitle.textContent = `ALVO: ${relic.name.toUpperCase()}`;
    el.waypointSub.textContent = `LOCAL: ${relic.location.toUpperCase()}`;

    // Reveal coordinate launcher
    el.btnCoordinate.hidden = false;
    el.coordTargetName.textContent = relic.name;

    renderObjectives();
    el.objectivesOverlay.classList.remove("open");

    // Open terminal automatically (the hybrid theme: terminal unlocks on selection)
    openPanel("terminal");
    appendTerminalLines(
      `ALVO SELECIONADO: ${relic.name.toUpperCase()}.`,
      `Use comandos como "peso_objeto", "ano_perda" para gastar tokens e obter pistas.`,
      `Coordene com o operador de cartas para confirmar a coordenada.`,
    );
  }

  // ===== Coordinate flow =====
  function openCoordModal() {
    if (!state.selectedId) return;
    const relic = relicById(state.selectedId);
    el.coordTargetName.textContent = relic.name;
    el.coordFeedback.textContent = "";
    el.coordFeedback.classList.remove("is-success");
    el.coordInput.value = "";
    el.coordModal.classList.remove("hidden");
    setTimeout(() => el.coordInput.focus(), 80);
  }

  function normalizeCoord(value) {
    return value
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/l|m/gi, (m) => m.toLowerCase());
  }

  function submitCoord(event) {
    event.preventDefault();
    if (!state.selectedId) return;
    const relic = relicById(state.selectedId);
    const expected = RELIC_COORDS[relic.id];
    const input = el.coordInput.value;
    const ok =
      normalizeCoord(input) === normalizeCoord(expected) ||
      input.trim().toLowerCase() === expected.toLowerCase();

    if (!ok) {
      // Wrong coordinate: lose a life
      state.lives = Math.max(0, state.lives - 1);
      saveState();
      renderLives();
      el.coordFeedback.classList.remove("is-success");
      el.coordFeedback.textContent = `COORDENADA INCORRETA. Vida perdida: ${state.lives} restante(s).`;
      if (state.lives <= 0) {
        el.coordModal.classList.add("hidden");
        showGameOver();
      }
      return;
    }

    // Correct — start warp travel
    el.coordModal.classList.add("hidden");
    startWarp(relic);
  }

  // ===== Warp animation =====
  function startWarp(relic) {
    el.warpCoord.textContent = RELIC_COORDS[relic.id];
    el.viewport.classList.add("is-warping");
    el.warpLayer.classList.add("is-active");

    // After the warp, show the object-found modal
    setTimeout(() => {
      el.warpLayer.classList.remove("is-active");
      el.viewport.classList.remove("is-warping");
      showObjectFound(relic);
    }, WARP_DURATION_MS);
  }

  // ===== Object found modal =====
  function showObjectFound(relic) {
    el.foundImage.src = relic.image;
    el.foundImage.alt = relic.name;
    el.foundName.textContent = relic.name;
    el.foundDescription.textContent = relic.description;
    el.foundWeight.textContent = relic.weight;
    el.foundHeight.textContent = relic.height;
    el.foundCategory.textContent = relic.category;
    el.foundLocation.textContent = relic.location;
    el.objectFoundModal.classList.remove("hidden");
  }

  function confirmCatalog() {
    if (!state.selectedId) return;
    const id = state.selectedId;
    if (!state.cataloged.includes(id)) {
      state.cataloged.push(id);
    }
    state.selectedId = null;
    el.btnCoordinate.hidden = true;
    el.scanPrompt.classList.remove("is-tracking");
    el.scanPromptText.textContent = "AGUARDANDO OBJETIVO";
    el.waypointLabel.hidden = true;
    el.objectFoundModal.classList.add("hidden");
    saveState();
    render();

    // Check mission completion
    if (missionRemaining().length === 0) {
      setTimeout(() => completeMission(), 600);
    }
  }

  function dismissFound() {
    el.objectFoundModal.classList.add("hidden");
    // Keep selection so player can retry coordinate? No — they got it right,
    // dismissing just closes without cataloging. Selection cleared.
    state.selectedId = null;
    el.btnCoordinate.hidden = true;
    el.scanPrompt.classList.remove("is-tracking");
    el.scanPromptText.textContent = "AGUARDANDO OBJETIVO";
    el.waypointLabel.hidden = true;
    saveState();
    render();
  }

  // ===== Mission end / next =====
  async function completeMission() {
    const mission = currentMission();
    // Outro chat (typewriter)
    el.endEyebrow.textContent =
      state.missionIndex >= MISSIONS.length - 1
        ? "ARQUIVO CENTRAL RESTAURADO"
        : "MISSÃO CONCLUÍDA";
    el.endTitle.textContent = mission.title;
    el.endChat.innerHTML = "";
    el.missionEndModal.classList.remove("hidden");

    const token = ++typewriterToken;
    for (const line of mission.outro) {
      if (token !== typewriterToken) return;
      const body = appendChatBubbleInto(el.endChat, "ANSA // TRANSMISSÃO", line);
      await typewriteInto(body, line, token);
      await new Promise((r) => setTimeout(r, 360));
    }
  }

  function appendChatBubbleInto(container, role, text) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = `
      <div class="chat-bubble-role"><span class="role-orb"></span>${escapeHtml(role)}</div>
      <div class="chat-bubble-body"></div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return bubble.querySelector(".chat-bubble-body");
  }

  function nextMission() {
    if (state.missionIndex >= MISSIONS.length - 1) {
      // Game complete — restart fresh
      resetGame();
      return;
    }
    state.missionIndex += 1;
    state.hintTokens = HINT_CAPACITY_PER_MISSION;
    state.selectedId = null;
    el.btnCoordinate.hidden = true;
    el.scanPrompt.classList.remove("is-tracking");
    el.scanPromptText.textContent = "AGUARDANDO OBJETIVO";
    el.waypointLabel.hidden = true;
    el.missionEndModal.classList.add("hidden");
    saveState();
    render();
    // Auto-open guide with new mission intro (chat)
    openPanel("guide");
    playChatLines(currentMission().intro).then(() => {
      state.guideSeen.push(currentMission().id);
      saveState();
      updateGuideBadge();
    });
  }

  function showGameOver() {
    el.gameOverModal.classList.remove("hidden");
  }

  function resetGame() {
    state = defaultState();
    typewriterToken++;
    el.gameOverModal.classList.add("hidden");
    el.missionEndModal.classList.add("hidden");
    el.objectFoundModal.classList.add("hidden");
    el.coordModal.classList.add("hidden");
    el.btnCoordinate.hidden = true;
    el.scanPrompt.classList.remove("is-tracking");
    el.scanPromptText.textContent = "AGUARDANDO OBJETIVO";
    el.waypointLabel.hidden = true;
    saveState();
    render();
    openPanel("guide");
    playChatLines(currentMission().intro).then(() => {
      state.guideSeen.push(currentMission().id);
      saveState();
      updateGuideBadge();
    });
  }

  // ===== Rendering =====
  function renderObjectives() {
    const mission = currentMission();
    const left = missionRemaining();
    el.objectivesCount.textContent = pad(left.length);
    el.objectivesProgress.innerHTML = `${left.length}<span>/${mission.relicIds.length}</span>`;

    if (!left.length) {
      el.objectivesList.innerHTML = `
        <div class="objectives-empty">
          ${iconSvg("scan", 24)}
          <span>MISSÃO CONCLUÍDA</span>
        </div>
      `;
      return;
    }

    el.objectivesList.innerHTML = mission.relicIds
      .map((id) => {
        const relic = relicById(id);
        const cataloged = state.cataloged.includes(id);
        const selected = state.selectedId === id;
        const classes = [
          "objective-card",
          cataloged ? "is-cataloged" : "",
          selected ? "is-selected" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `
          <button type="button" class="${classes}" data-select="${id}" ${
            cataloged ? "disabled" : ""
          }>
            <span class="objective-thumb"><img src="${relic.image}" alt="" /></span>
            <span class="objective-info">
              <b>${escapeHtml(relic.name)}</b>
              <span>${escapeHtml(relic.category.toUpperCase())} · ${escapeHtml(
                relic.location,
              )}</span>
            </span>
            <span class="objective-state">${
              cataloged ? iconSvg("check", 14) : selected ? "ALVO" : "—"
            }</span>
          </button>
        `;
      })
      .join("");
  }

  function renderCatalog() {
    el.catalogCount.textContent = pad(state.cataloged.length);
    el.catalogList.innerHTML = RELICS.map((relic, index) => {
      const unlocked = state.cataloged.includes(relic.id);
      if (!unlocked) {
        return `
          <article class="catalog-card locked">
            <div class="locked-card-image">
              <img src="${relic.image}" alt="" />
              <span class="locked-scan-ring">${iconSvg("scan", 24)}</span>
              <small>NÃO CATALOGADO</small>
            </div>
          </article>
        `;
      }
      return `
        <article class="catalog-card">
          <div class="tcg-header">
            <span>CARTA DE CAMPO</span>
            <h3>${escapeHtml(relic.name)}</h3>
            <div class="card-rank">
              <b>${70 + index * 5}</b>
              <i>${escapeHtml(relic.category.slice(0, 1))}</i>
            </div>
          </div>
          <div class="card-image">
            <img src="${relic.image}" alt="${escapeHtml(relic.name)}" />
            <span>${pad(index + 1)}</span>
          </div>
          <div class="specimen-strip">
            <span>CATEGORIA: ${escapeHtml(relic.category.toUpperCase())}</span>
            <span>ARQUIVO Nº LUNA-${pad(index + 1, 3)}</span>
          </div>
          <div class="card-copy">
            <div class="ability-line">
              <span class="ability-orb">${escapeHtml(relic.category.slice(0, 1))}</span>
              <h4>${escapeHtml(relic.ability)}</h4>
              <b>+${index + 2}</b>
            </div>
            <p>${escapeHtml(relic.description)}</p>
            <div class="measurements">
              <span>
                <i class="measurement-icon weight-icon">${iconSvg("weight", 20)}</i>
                <em>PESO</em> <b>${escapeHtml(relic.weight)}</b>
              </span>
              <span>
                <i class="measurement-icon ruler-icon">${iconSvg("ruler", 20)}</i>
                <em>ALTURA</em> <b>${escapeHtml(relic.height)}</b>
              </span>
            </div>
            <div class="card-footer">
              <span>Categoria: ${escapeHtml(relic.category)}</span>
              <span>${escapeHtml(relic.type)}</span>
              <b>${escapeHtml(relic.location.toUpperCase())} / ${pad(index + 1)}</b>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderTokens() {
    el.tokenRow.innerHTML = Array.from(
      { length: HINT_CAPACITY_PER_MISSION },
      (_, index) => {
        const active = index < state.hintTokens ? "active" : "";
        return `<span class="token ${active}">${iconSvg("token", 17)}</span>`;
      },
    ).join("");
    el.tokenRow.setAttribute(
      "aria-label",
      `${state.hintTokens} tokens de dica restantes`,
    );
    const hasTarget = !!state.selectedId && missionRemaining().includes(state.selectedId);
    el.hintButton.disabled = !state.hintTokens || !hasTarget;
  }

  function renderLives() {
    el.livesReadout.textContent = `${pad(state.lives)} / ${pad(MAX_LIVES)}`;
    const icons = el.lifeIcons();
    icons.forEach((node, i) => {
      node.classList.toggle("is-lost", i >= state.lives);
    });
    el.lifeDisplay.classList.toggle("is-critical", state.lives <= 1);
  }

  function renderHud() {
    const mission = currentMission();
    el.missionLabel.textContent = `${mission.title.split("—")[0].trim()} — ${mission.body.toUpperCase()}`;
    const left = missionRemaining().length;
    el.scanSignals.textContent = `${pad(left)} SINAIS`;
    const totalPercent = Math.round(
      (state.cataloged.length / RELICS.length) * 100,
    );
    el.archivePercent.textContent = `${totalPercent}%`;
    el.archiveBar.style.width = `${totalPercent}%`;
    el.missionObjectiveText.textContent = `Catalogar ${missionCatalogedCount()} / ${mission.requiredCount}`;
  }

  function updateGuideBadge() {
    const seen = state.guideSeen.includes(currentMission().id);
    el.guideBadge.hidden = seen;
  }

  function render() {
    setSurface(currentMission().body);
    renderObjectives();
    renderCatalog();
    renderTokens();
    renderLives();
    renderHud();
    renderTerminalLines();
    updateGuideBadge();
    mountIcons();
  }

  // ===== Timer =====
  function updateTimer() {
    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - state.missionStartedAt) / 1000),
    );
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    el.missionTimer.textContent = `${pad(hours, 3)}:${pad(minutes)}:${pad(seconds)}`;
  }

  // ===== Events =====
  function bindEvents() {
    document.getElementById("btn-objectives").addEventListener("click", () =>
      openPanel("objectives"),
    );
    document.getElementById("btn-catalog").addEventListener("click", () =>
      openPanel("catalog"),
    );
    document.getElementById("btn-guide").addEventListener("click", () => {
      openPanel("guide");
      // If mission intro not yet seen, play it
      if (!state.guideSeen.includes(currentMission().id)) {
        playChatLines(currentMission().intro).then(() => {
          state.guideSeen.push(currentMission().id);
          saveState();
          updateGuideBadge();
        });
      }
    });
    document.getElementById("btn-terminal").addEventListener("click", () =>
      openPanel("terminal"),
    );
    document.getElementById("btn-hint").addEventListener("click", useHintButton);

    el.btnCoordinate.addEventListener("click", openCoordModal);
    el.coordForm.addEventListener("submit", submitCoord);
    el.btnCatalogConfirm.addEventListener("click", confirmCatalog);
    el.btnCatalogDismiss.addEventListener("click", dismissFound);
    el.btnNextMission.addEventListener("click", nextMission);
    el.btnRestart.addEventListener("click", resetGame);

    document.querySelectorAll("[data-close]").forEach((button) => {
      button.addEventListener("click", () => closePanel(button.dataset.close));
    });

    // Object selection (delegated)
    el.objectivesList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select]");
      if (!button || button.disabled) return;
      selectObjective(button.dataset.select);
    });

    // Terminal form
    el.terminalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = el.commandInput.value;
      runCommand(value);
      el.commandInput.value = "";
    });
    el.terminalOutput.addEventListener("click", () => el.commandInput.focus());

    // Keyboard
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;
      if (meta && key === "k") {
        event.preventDefault();
        if (el.terminalWindow.classList.contains("hidden")) openPanel("terminal");
        else closePanel("terminal");
        return;
      }
      if (key === "escape") {
        if (!el.coordModal.classList.contains("hidden")) return closePanel("coord");
        if (!el.objectFoundModal.classList.contains("hidden"))
          return closePanel("found");
        if (!el.missionEndModal.classList.contains("hidden"))
          return closePanel("end");
        if (!el.terminalWindow.classList.contains("hidden"))
          return closePanel("terminal");
        if (el.catalogOverlay.classList.contains("open")) return closePanel("catalog");
        if (el.guideOverlay.classList.contains("open")) return closePanel("guide");
        if (el.objectivesOverlay.classList.contains("open"))
          return closePanel("objectives");
      }
    });
  }

  function initShortcutLabel() {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "");
    el.terminalShortcut.textContent = isMac ? "⌘ K" : "Ctrl K";
  }

  // ===== Init =====
  function init() {
    loadState();
    mountIcons();
    initShortcutLabel();
    bindEvents();
    render();
    updateTimer();
    setInterval(updateTimer, 1000);

    // On first ever load, auto-open the guide and play mission 1 intro
    const fresh = state.cataloged.length === 0 && state.missionIndex === 0;
    if (fresh && !state.guideSeen.includes(currentMission().id)) {
      setTimeout(() => {
        openPanel("guide");
        playChatLines(currentMission().intro).then(() => {
          state.guideSeen.push(currentMission().id);
          saveState();
          updateGuideBadge();
        });
      }, 500);
    }
  }

  init();
})();
