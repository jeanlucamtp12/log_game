// Catálogo do menu inicial: mostra só as cartas que o jogador já catalogou no jogo.
// Lê o mesmo save do jogo (localStorage) e usa os mesmos dados e filtros.
import { RELICS, RELIC_TYPES, LOCATIONS, MISSIONS, placeName, L } from "../../js/game-data.js";
import { typeIconSvg } from "../../js/icons.js";

const SAVE_KEY = "lunar07-save"; // mesma chave de js/main.js
const TOTAL = MISSIONS.reduce((sum, m) => sum + m.requiredCount, 0);
const YEAR_MIN = Math.min(...RELICS.map((r) => Number(r.fields.ano)));
const YEAR_MAX = Math.max(...RELICS.map((r) => Number(r.fields.ano)));

const $ = (id) => document.getElementById(id);
const el = {
  janela: $("catalogo"),
  abrir: $("btnCatalogo"),
  fechar: $("btnFecharCatalogo"),
  opcoes: document.querySelector(".opcoes-menu"),
  lista: $("catLista"),
  tipos: $("catTipos"),
  locais: $("catLocais"),
  de: $("catAnoDe"),
  ate: $("catAnoAte"),
  fill: $("catAnoFill"),
  leitura: $("catAnoLeitura"),
  contagem: $("catContagem"),
  grade: $("catGrade"),
  detalhe: $("catDetalhe"),
  detalheCarta: $("catDetalheCarta"),
  voltar: $("catVoltar"),
};

let filtro = { type: "all", location: "all", from: YEAR_MIN, to: YEAR_MAX };
let coletadas = new Set();

const pad = (n) => String(n).padStart(2, "0");
const esc = (v) =>
  String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// ---- save do jogo ----
function lerColetadas() {
  try {
    const save = JSON.parse(localStorage.getItem(SAVE_KEY));
    // não confere a versão do save: o jogo muda esse número a cada mudança grande e o catálogo só precisa da lista
    if (save && Array.isArray(save.cataloged)) {
      return new Set(save.cataloged);
    }
  } catch {
    /* sem save ou ilegível: nenhuma carta coletada */
  }
  return new Set();
}

// ---- imagens (mesma lógica do jogo) ----
function placeholder(text) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#07121a"/><g stroke="#4fe6ff" stroke-opacity=".25" fill="none"><circle cx="320" cy="190" r="70"/><circle cx="320" cy="190" r="110"/><path d="M320 60v260M190 190h260"/></g><text x="320" y="340" fill="#4fe6ff" font-family="monospace" font-size="22" text-anchor="middle" letter-spacing="3">${esc(String(text).toUpperCase())}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
const imgSrc = (r) => r.image || placeholder(r.codename || r.name);
const credito = (r) => (r.imageCaption ? `${r.imageCaption} · NASA` : "NASA");

el.janela.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = placeholder(L("Imagem indisponível", "Image unavailable"));
  },
  true,
);

// ---- filtros ----
function chips(opcoes, ativo, attr, comIcone) {
  return [{ id: "all", label: L("Todos", "All") }, ...opcoes]
    .map((o) => {
      const icone = comIcone ? typeIconSvg(o.id, 18) : "";
      const nome = esc(o.label);
      const extra = icone ? ` title="${nome}" aria-label="${nome}"` : "";
      const cls = `cat-chip${icone ? " cat-chip-icone" : ""}${ativo === o.id ? " is-ativo" : ""}`;
      return `<button type="button" class="${cls}" data-${attr}="${esc(o.id)}" aria-pressed="${ativo === o.id}"${extra}>${icone || nome}</button>`;
    })
    .join("");
}

function renderFiltros() {
  el.tipos.innerHTML = chips(RELIC_TYPES, filtro.type, "type", true);
  el.locais.innerHTML = chips(LOCATIONS, filtro.location, "location", false);
  el.de.min = el.ate.min = YEAR_MIN;
  el.de.max = el.ate.max = YEAR_MAX;
  el.de.value = filtro.from;
  el.ate.value = filtro.to;
  const span = YEAR_MAX - YEAR_MIN || 1;
  el.fill.style.left = `${((filtro.from - YEAR_MIN) / span) * 100}%`;
  el.fill.style.right = `${100 - ((filtro.to - YEAR_MIN) / span) * 100}%`;
  el.leitura.textContent = `${filtro.from} - ${filtro.to}`;
}

function filtradas() {
  return RELICS.filter((r) => {
    if (!coletadas.has(r.id)) return false; // o que não foi coletado não aparece
    const ano = Number(r.fields.ano);
    return (
      (filtro.type === "all" || r.type === filtro.type) &&
      (filtro.location === "all" || r.location === filtro.location) &&
      ano >= filtro.from &&
      ano <= filtro.to
    );
  });
}

function cartaHtml(r) {
  return `
    <button type="button" class="cat-carta" data-carta="${esc(r.id)}">
      <span class="cat-carta-titulo">${esc(r.name)}</span>
      <img src="${esc(imgSrc(r))}" alt="" loading="lazy" />
      <span class="cat-carta-meta"><span>${esc(r.fields.ano)}</span><span>${esc(r.category)}</span></span>
    </button>`;
}

function renderLista() {
  renderFiltros();
  el.contagem.textContent = L(`${pad(coletadas.size)} / ${pad(TOTAL)} coletadas`, `${pad(coletadas.size)} / ${pad(TOTAL)} collected`);
  const itens = filtradas();
  if (itens.length) {
    el.grade.innerHTML = itens.map(cartaHtml).join("");
  } else if (!coletadas.size) {
    el.grade.innerHTML =
      L(
        '<p class="cat-vazio">Nenhum objeto catalogado ainda.<br>Jogue pela tela, encontre objetos e catalogue-os para vê-los aqui.</p>',
        '<p class="cat-vazio">No objects cataloged yet.<br>Play on the screen, find objects and catalog them to see them here.</p>',
      );
  } else {
    el.grade.innerHTML = L('<p class="cat-vazio">Nenhum objeto neste filtro.</p>', '<p class="cat-vazio">No objects match this filter.</p>');
  }
}

// ---- detalhe ----
function mostrarLista() {
  el.detalhe.hidden = true;
  el.lista.hidden = false;
}

let detalheId = null; // carta aberta no detalhe (para redesenhar se o idioma mudar)
function mostrarDetalhe(id) {
  const r = RELICS.find((x) => x.id === id);
  if (!r || !coletadas.has(id)) return;
  detalheId = id;
  el.detalheCarta.innerHTML = `
    <article class="cat-carta cat-carta-aberta">
      <h3 class="cat-carta-titulo">${esc(r.name)}</h3>
      <div class="cat-media">
        <img src="${esc(imgSrc(r))}" alt="${esc(r.name)}" />
        <small class="cat-credito">${esc(credito(r))}</small>
      </div>
      <div class="cat-info">
        <p>${esc(r.description)}</p>
        <dl class="cat-specs">
        <div><dt>${L("Peso", "Weight")}</dt><dd>${esc(r.weight)}</dd></div>
        <div><dt>${L("Altura", "Height")}</dt><dd>${esc(r.height)}</dd></div>
        <div><dt>${L("Ano", "Year")}</dt><dd>${esc(r.fields.ano)}</dd></div>
        <div><dt>${L("Missão", "Mission")}</dt><dd>${esc(r.fields.missao)}</dd></div>
        <div><dt>${L("Local", "Location")}</dt><dd>${esc(placeName(r.location))}</dd></div>
        <div><dt>${L("Categoria", "Category")}</dt><dd>${esc(r.category)}</dd></div>
        </dl>
      </div>
    </article>`;
  el.lista.hidden = true;
  el.detalhe.hidden = false;
  el.voltar.focus({ preventScroll: true });
}

// ---- abrir / fechar ----
const aberto = () => el.janela.classList.contains("aberta");

function alternar(abrir) {
  if (abrir) {
    coletadas = lerColetadas(); // sempre o save mais recente
    mostrarLista();
    renderLista();
  }
  el.janela.classList.toggle("aberta", abrir);
  el.janela.toggleAttribute("inert", !abrir);
  el.janela.setAttribute("aria-hidden", String(!abrir));
  el.opcoes.toggleAttribute("inert", abrir); // o menu atrás da janela não recebe foco
  el.fechar.tabIndex = abrir ? 0 : -1;
  (abrir ? el.fechar : el.abrir).focus({ preventScroll: true });
}

el.abrir.addEventListener("click", () => alternar(true));
el.fechar.addEventListener("click", () => alternar(false));
el.voltar.addEventListener("click", () => {
  mostrarLista();
  renderLista();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !aberto()) return;
  if (!el.detalhe.hidden) {
    mostrarLista();
    renderLista();
  } else {
    alternar(false);
  }
});

el.tipos.addEventListener("click", (e) => {
  const b = e.target.closest("[data-type]");
  if (!b) return;
  filtro = { ...filtro, type: b.dataset.type };
  renderLista();
});
el.locais.addEventListener("click", (e) => {
  const b = e.target.closest("[data-location]");
  if (!b) return;
  filtro = { ...filtro, location: b.dataset.location };
  renderLista();
});

function anoMudou(quem) {
  let from = Number(el.de.value);
  let to = Number(el.ate.value);
  if (from > to) {
    if (quem === "from") to = from;
    else from = to;
  }
  filtro = { ...filtro, from, to };
  renderLista();
}
el.de.addEventListener("input", () => anoMudou("from"));
el.ate.addEventListener("input", () => anoMudou("to"));

// troca de idioma na capa com o catálogo aberto: redesenha no idioma novo
document.addEventListener("log-idioma", () => {
  if (!aberto()) return;
  if (!el.detalhe.hidden && detalheId) return mostrarDetalhe(detalheId);
  renderLista();
});

el.grade.addEventListener("click", (e) => {
  const c = e.target.closest("[data-carta]");
  if (c) mostrarDetalhe(c.dataset.carta);
});