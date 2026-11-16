// Conteúdo estático do jogo: missões, objetos (relíquias) e narrativa.
// Os objetos vêm do arquivo oficial de cartas (objects.json, L.O.G. — Legacy of Giants),
// com os textos originais (em inglês). As imagens são as fotos/ilustrações oficiais da NASA.

// ---- Idioma (EN | PT) ----
// O idioma vem de js/idioma.js (window.LOG_IDIOMA), carregado no <head> de cada página.
// L("texto em português", "English text") escolhe na hora, então a troca na capa vale sem recarregar.
const idiomaAtual = () => (typeof window !== "undefined" && window.LOG_IDIOMA ? window.LOG_IDIOMA.get() : "pt");
export const isEnglish = () => idiomaAtual() === "en";
export const L = (pt, en) => (isEnglish() ? en : pt);
const decimal = (text) => (isEnglish() ? String(text) : String(text).replace(".", ","));

// Filtros do catálogo = as 5 categorias das cartas.
export const RELIC_TYPES = [
  { id: "rover", label: "Rovers and vehicles" },
  { id: "lander", label: "Landers" },
  { id: "probe", label: "Probes and telescopes" },
  { id: "debris", label: "Spacecraft parts and debris" },
  { id: "objects", label: "Objects" },
];

export const LOCATIONS = [
  { id: "Lua", get label() { return L("Lua", "Moon"); } },
  { id: "Marte", get label() { return L("Marte", "Mars"); } },
  { id: "espaco", get label() { return L("Espaço", "Space"); } }, // mesmo valor de SPACE no main.js
];

// Nome para exibir de um local (o valor interno do espaço é "espaco").
// Os ids internos ("Lua", "Marte", "espaco") não mudam: só o nome exibido segue o idioma.
const PLACE_EN = { Lua: "Moon", Marte: "Mars", espaco: "Space" };
export const placeName = (loc) => (isEnglish() ? PLACE_EN[loc] ?? loc : loc === "espaco" ? "Espaço" : loc);

// ---- Coordenadas: latitude e longitude ----
// O jogador digita DOIS campos no Navegador:
//   Latitude  (N/S) · Longitude (L/O)
// Internamente: graus decimais, N e L positivos; S e O negativos.
// Aceita "0,67", "0.67", "-3,01", "3,01 S", "23,47° L", "23.42 O"...
export const COORD_TOLERANCE = 0.006; // as cartas trazem 2 casas decimais

// Em inglês: ponto decimal e E/W (como nas cartas em inglês); em português: vírgula e L/O.
export const formatLat = (v) => `${decimal(v.toFixed(2))}° ${v < 0 ? "S" : "N"}`;
export const formatLon = (v) => `${decimal(v.toFixed(2))}° ${v < 0 ? L("O", "W") : L("L", "E")}`;
export const formatCoord = (c) => `${formatLat(c.lat)} · ${formatLon(c.lon)}`;

// axis: "lat" aceita N/S · "lon" aceita L/O (E/W também). Retorna número ou null se for inválido.
export function parseCoordInput(raw, axis) {
  const text = String(raw)
    .trim()
    .toUpperCase()
    .replace(/[\u2212\u2013]/g, "-")
    .replace(/[°º]/g, "")
    .replace(",", ".");
  const m = text.match(/^([+-]?\d+(?:\.\d+)?)\s*([A-Z])?$/);
  if (!m) return null;
  let value = Number(m[1]);
  const letter = m[2];
  if (letter) {
    const negative = axis === "lat" ? "S" : ["O", "W"];
    const positive = axis === "lat" ? "N" : ["L", "E"];
    const isNeg = negative.includes(letter);
    const isPos = positive.includes(letter);
    if (!isNeg && !isPos) return null; // letra de outro eixo (ex.: "L" na latitude)
    if (isNeg && value > 0) value = -value;
  }
  return value;
}

export const coordMatches = (relic, lat, lon) =>
  !!relic.coordenadas &&
  Math.abs(lat - relic.coordenadas.lat) < COORD_TOLERANCE &&
  Math.abs(lon - relic.coordenadas.lon) < COORD_TOLERANCE;

// ---- Objetos no espaço: o Navegador pede a distância em UA (unidades astronômicas) ----
// Aceita "2,64", "2.64", "142 UA", "142 AU".
export function parseDistanceInput(raw) {
  const m = String(raw).trim().toUpperCase().replace(",", ".").match(/^(\d+(?:\.\d+)?)\s*(UA|AU)?$/);
  return m ? Number(m[1]) : null;
}
// Valores inteiros nas cartas (142, 118) aceitam ±0,5; os com decimais, ±0,006.
export const distMatches = (relic, value) =>
  relic.distanciaUA != null &&
  Math.abs(value - relic.distanciaUA) < (Number.isInteger(relic.distanciaUA) ? 0.5 : COORD_TOLERANCE);

export const formatTarget = (relic) =>
  relic.coordenadas ? formatCoord(relic.coordenadas) : `${decimal(relic.distanciaUA)} ${L("UA", "AU")}`;

// ---- Código de identificação ----
// Enquanto o objeto não é encontrado, o jogador vê só um código (ex.: "D312-22"), nunca o nome.
// O código é gerado a partir do id, então é sempre o mesmo para o mesmo objeto, mas não revela
// tipo, local nem ano. Formato: letra + 3 dígitos + hífen + 2 dígitos.
const CODE_LETTERS = "ABCDEFGHJKLMNPRSTUVWXZ";
export function relicCode(relic) {
  let h = 2166136261; // FNV-1a
  for (const ch of `L.O.G.:${relic.id}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const letter = CODE_LETTERS[h % CODE_LETTERS.length];
  const mid = String(100 + (Math.floor(h / 23) % 900));
  const tail = String(10 + (Math.floor(h / 20700) % 90));
  return `${letter}${mid}-${tail}`;
}

// ---- Objetos ----
export const RELICS = [
  {
    id: "01-lunar-descent-stage",
    number: 1,
    name: "Lunar descent stage",
    codename: "Carta 01", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "debris",
    category: "Spacecraft parts and debris",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 0.67, lon: 23.47 }, // graus decimais: + = N / L, − = S / O
    weight: "2034 kg",
    height: "3.2 m",
    weightKg: 2034,
    heightM: 3.2,
    image: "https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~large.jpg",
    imageCaption: "Photo on the Moon",
    imagePage: "https://images.nasa.gov/details/as11-40-5927",
    description: "After my passengers left, I stayed behind and served as the launch pad for their trip home. Behind my ladder there is a plaque saying we came in peace.",
    fields: {
      peso: "2034 kg",
      altura: "3.2 m",
      ano: "1969", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1969",
      categoria: "Spacecraft parts and debris",
      missao: "Apollo 11",
      energia: "Battery",
      energiaTipo: "battery", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "02-alsep",
    number: 2,
    name: "ALSEP",
    codename: "Carta 02", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "objects",
    category: "Objects",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: -3.01, lon: -23.42 }, // graus decimais: + = N / L, − = S / O
    weight: "46 kg",
    height: "0.46 m",
    weightKg: 46,
    heightM: 0.46,
    image: "https://images-assets.nasa.gov/image/as12-47-6918/as12-47-6918~large.jpg",
    imageCaption: "Photo on the Moon",
    imagePage: "https://images.nasa.gov/details/as12-47-6918",
    description: "Two astronauts set me up on the ground and fitted, by hand, the plutonium rod that powered me. I measured quakes, the solar wind and the magnetic field for almost eight years.",
    fields: {
      peso: "46 kg",
      altura: "0.46 m",
      ano: "1977", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1969",
      categoria: "Objects",
      missao: "Apollo 12",
      energia: "Nuclear · 70 W",
      energiaTipo: "nuclear", // solar | nuclear | battery | none
      energiaW: 70, // potência em watts (null = sem dado)
    },
  },
  {
    id: "03-surveyor-3",
    number: 3,
    name: "Surveyor 3",
    codename: "Carta 03", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "lander",
    category: "Landers",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: -3.02, lon: -23.42 }, // graus decimais: + = N / L, − = S / O
    weight: "997.9 kg",
    height: "3 m",
    weightKg: 997.9,
    heightM: 3,
    image: "https://images-assets.nasa.gov/image/AS12-48-7134/AS12-48-7134~large.jpg",
    imageCaption: "Photo on the Moon",
    imagePage: "https://images.nasa.gov/details/AS12-48-7134",
    description: "On the way down, bright rocks fooled my radar and I bounced twice. Two years later, astronauts landed 180 m from me and took pieces of me back to Earth.",
    fields: {
      peso: "997.9 kg",
      altura: "3 m",
      ano: "1967", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1967",
      categoria: "Landers",
      missao: "Surveyor 3",
      energia: "Solar · 85 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 85, // potência em watts (null = sem dado)
    },
  },
  {
    id: "04-sojourner",
    number: 4,
    name: "Sojourner",
    codename: "Carta 04", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "rover",
    category: "Rovers and vehicles",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 19.33, lon: -33.55 }, // graus decimais: + = N / L, − = S / O
    weight: "10.6 kg",
    height: "30 cm",
    weightKg: 10.6,
    heightM: 0.3,
    image: "https://images-assets.nasa.gov/image/PIA01551/PIA01551~orig.jpg",
    imageCaption: "Photo on Mars",
    imagePage: "https://images.nasa.gov/details/PIA01551",
    description: "I rolled down a ramp and became the first wheeled robot to explore this planet. My name honors a civil rights fighter, and I sent 550 images of the rocks around me.",
    fields: {
      peso: "10.6 kg",
      altura: "30 cm",
      ano: "1997", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1996",
      categoria: "Rovers and vehicles",
      missao: "Mars Pathfinder",
      energia: "Solar · 16 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 16, // potência em watts (null = sem dado)
    },
  },
  {
    id: "05-spirit",
    number: 5,
    name: "Spirit",
    codename: "Carta 05", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "rover",
    category: "Rovers and vehicles",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: -14.57, lon: 175.48 }, // graus decimais: + = N / L, − = S / O
    weight: "185 kg",
    height: "1.4 m",
    weightKg: 185,
    heightM: 1.4,
    image: "https://images-assets.nasa.gov/image/PIA04239/PIA04239~orig.jpg",
    imageCaption: "NASA illustration (Spirit and Opportunity were twins)",
    imagePage: "https://images.nasa.gov/details/PIA04239",
    description: "I drove 7.73 km across a crater that may once have been a lake, even dragging a wheel that stopped turning. In 2009 I broke through a thin crust, got stuck in sand and never moved again.",
    fields: {
      peso: "185 kg",
      altura: "1.4 m",
      ano: "2010", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2003",
      categoria: "Rovers and vehicles",
      missao: "MER-A",
      energia: "Solar · 140 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 140, // potência em watts (null = sem dado)
    },
  },
  {
    id: "06-opportunity",
    number: 6,
    name: "Opportunity",
    codename: "Carta 06", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "rover",
    category: "Rovers and vehicles",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: -1.95, lon: -5.53 }, // graus decimais: + = N / L, − = S / O
    weight: "185 kg",
    height: "1.4 m",
    weightKg: 185,
    heightM: 1.4,
    image: "https://images-assets.nasa.gov/image/PIA17759/PIA17759~large.jpg",
    imageCaption: "Self-portrait on Mars",
    imagePage: "https://images.nasa.gov/details/PIA17759",
    description: "I drove 45.16 km in more than 14 years, an off-Earth record that lasted until 2026. A dust storm covered the whole planet, hid the Sun from my panels and I went silent.",
    fields: {
      peso: "185 kg",
      altura: "1.4 m",
      ano: "2018", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2003",
      categoria: "Rovers and vehicles",
      missao: "MER-B",
      energia: "Solar · 140 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 140, // potência em watts (null = sem dado)
    },
  },
  {
    id: "07-viking-1",
    number: 7,
    name: "Viking 1",
    codename: "Carta 07", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "lander",
    category: "Landers",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 22.48, lon: -47.94 }, // graus decimais: + = N / L, − = S / O
    weight: "572 kg",
    height: "2 m",
    weightKg: 572,
    heightM: 2,
    image: "https://images-assets.nasa.gov/image/PIA09703/PIA09703~large.jpg",
    imageCaption: "Model of the Viking lander (Viking 1 and 2 were identical)",
    imagePage: "https://images.nasa.gov/details/PIA09703",
    description: "I sent the first photo taken from the ground of this planet: it started arriving 25 seconds after I landed. With my arm, I scooped up soil and tested it inside me, looking for signs of life.",
    fields: {
      peso: "572 kg",
      altura: "2 m",
      ano: "1982", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1975",
      categoria: "Landers",
      missao: "Viking 1",
      energia: "Nuclear · 2 × 30 W",
      energiaTipo: "nuclear", // solar | nuclear | battery | none
      energiaW: 60, // potência em watts (null = sem dado)
    },
  },
  {
    id: "08-viking-2",
    number: 8,
    name: "Viking 2",
    codename: "Carta 08", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "lander",
    category: "Landers",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 47.67, lon: 134.28 }, // graus decimais: + = N / L, − = S / O
    weight: "572 kg",
    height: "2 m",
    weightKg: 572,
    heightM: 2,
    image: "https://images-assets.nasa.gov/image/101-KSC-75P-110/101-KSC-75P-110~large.jpg",
    imageCaption: "Photo of Viking Lander 2 itself, in testing before launch",
    imagePage: "https://images.nasa.gov/details/101-KSC-75P-110",
    description: "My engines fired again a split second before landing, and I ended up tilted, with one foot on a rock. I traveled 333 days to get here, inside a shield against Earth's microbes.",
    fields: {
      peso: "572 kg",
      altura: "2 m",
      ano: "1980", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1975",
      categoria: "Landers",
      missao: "Viking 2",
      energia: "Nuclear · 2 × 30 W",
      energiaTipo: "nuclear", // solar | nuclear | battery | none
      energiaW: 60, // potência em watts (null = sem dado)
    },
  },
  {
    id: "09-phoenix",
    number: 9,
    name: "Phoenix",
    codename: "Carta 09", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "lander",
    category: "Landers",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 68.15, lon: -125.9 }, // graus decimais: + = N / L, − = S / O
    weight: "350 kg",
    height: "2.2 m",
    weightKg: 350,
    heightM: 2.2,
    image: "https://images-assets.nasa.gov/image/PIA09701/PIA09701~orig.jpg",
    imageCaption: "Photo in testing, before launch",
    imagePage: "https://images.nasa.gov/details/PIA09701",
    description: "I landed near the north pole and dug the ground with my arm to study the ice. At first the Sun never set; when winter came, there was not enough light for my panels.",
    fields: {
      peso: "350 kg",
      altura: "2.2 m",
      ano: "2008", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2007",
      categoria: "Landers",
      missao: "Phoenix",
      energia: "Solar",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "10-insight",
    number: 10,
    name: "InSight",
    codename: "Carta 10", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "lander",
    category: "Landers",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 4.5, lon: 135.62 }, // graus decimais: + = N / L, − = S / O
    notaPosicao: "actual landing site, reconstructed by NASA (4.502° N, 135.623° E); 135.90° E was the center of the planned landing area",
    weight: "360 kg",
    height: "1.08 m",
    weightKg: 360,
    heightM: 1.08,
    image: "https://images-assets.nasa.gov/image/PIA22876/PIA22876~large.jpg",
    imageCaption: "Self-portrait on Mars",
    imagePage: "https://images.nasa.gov/details/PIA22876",
    description: "I came to measure the planet's pulse, temperature and reflexes from the inside. I placed a seismometer on the ground to hear the quakes and even recorded the wind blowing on my panels.",
    fields: {
      peso: "360 kg",
      altura: "1.08 m",
      ano: "2022", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2018",
      categoria: "Landers",
      missao: "InSight",
      energia: "Solar",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "11-ingenuity-helicopter",
    number: 11,
    name: "Ingenuity helicopter",
    codename: "Carta 11", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "rover",
    category: "Rovers and vehicles",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 18.5, lon: 77.32 }, // graus decimais: + = N / L, − = S / O
    weight: "1.8 kg",
    height: "0.49 m",
    weightKg: 1.8,
    heightM: 0.49,
    image: "https://images-assets.nasa.gov/image/PIA25881/PIA25881~large.jpg",
    imageCaption: "Photo on Mars, taken by Perseverance",
    imagePage: "https://images.nasa.gov/details/PIA25881",
    description: "I traveled tucked under another robot and made the first powered flight on another planet. I was meant to fly 5 times at most; I flew 72, until I broke my blades on the last landing.",
    fields: {
      peso: "1.8 kg",
      altura: "0.49 m",
      ano: "2024", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2020",
      categoria: "Rovers and vehicles",
      missao: "Mars 2020",
      energia: "Solar · 350 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 350, // potência em watts (null = sem dado)
    },
  },
  {
    id: "12-dawn",
    number: 12,
    name: "Dawn",
    codename: "Carta 12", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "probe",
    category: "Probes and telescopes",
    location: "espaco",
    navTipo: "distancia", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: null,
    distanciaUA: 2.64, // resposta do Navegador para objetos no espaço
    posicao: "Ceres orbit · 2.64 AU from the Sun",
    notaPosicao: "distance computed for 2026-11-14 (JPL Horizons)",
    weight: "747 kg",
    height: "1.77 m",
    weightKg: 747,
    heightM: 1.77,
    image: "https://images-assets.nasa.gov/image/PIA12031/PIA12031~orig.jpg",
    imageCaption: "NASA illustration",
    imagePage: "https://images.nasa.gov/details/PIA12031",
    description: "I used engines that push with xenon to visit two worlds in the asteroid belt. When I ran out of fuel, I kept circling the second one, and I am still there today.",
    fields: {
      peso: "747 kg",
      altura: "1.77 m",
      ano: "2018", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2007",
      categoria: "Probes and telescopes",
      missao: "Dawn",
      energia: "Solar · 10.3 kW",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 10300, // potência em watts (null = sem dado)
    },
  },
  {
    id: "13-near-shoemaker",
    number: 13,
    name: "NEAR Shoemaker",
    codename: "Carta 13", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "probe",
    category: "Probes and telescopes",
    location: "espaco",
    navTipo: "distancia", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: null,
    distanciaUA: 1.76, // resposta do Navegador para objetos no espaço
    posicao: "1.76 AU from the Sun",
    notaPosicao: "distance from asteroid Eros, where NEAR landed (just south of the Himeros formation), to the Sun on 2026-11-14, from JPL Horizons; Eros orbits the Sun between 1.13 and 1.78 AU, between the orbits of Earth and Mars (JPL Small-Body Database)",
    weight: "487 kg",
    height: "1.7 m",
    weightKg: 487,
    heightM: 1.7,
    image: "https://images-assets.nasa.gov/image/PIA18177/PIA18177~large.jpg",
    imageCaption: "NASA illustration",
    imagePage: "https://images.nasa.gov/details/PIA18177",
    description: "I was not built to land, but I came down slowly, at just 6.4 km/h, and sent data for two more weeks. On the way, I passed 1,200 km from another asteroid and photographed more than half of it.",
    fields: {
      peso: "487 kg",
      altura: "1.7 m",
      ano: "2001", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1996",
      categoria: "Probes and telescopes",
      missao: "NEAR",
      energia: "Solar · 1800 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 1800, // potência em watts (null = sem dado)
    },
  },
  {
    id: "14-pioneer-10",
    number: 14,
    name: "Pioneer 10",
    codename: "Carta 14", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "probe",
    category: "Probes and telescopes",
    location: "espaco",
    navTipo: "distancia", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: null,
    distanciaUA: 142.0, // resposta do Navegador para objetos no espaço
    posicao: "142 AU from the Sun · heading to Aldebaran",
    notaPosicao: "distance computed for 2026-11-14 (JPL Horizons)",
    weight: "258 kg",
    height: "6.6 m",
    weightKg: 258,
    heightM: 6.6,
    image: "https://images-assets.nasa.gov/image/ARC-1972-AC72-2135/ARC-1972-AC72-2135~large.jpg",
    imageCaption: "Photo before launch",
    imagePage: "https://images.nasa.gov/details/ARC-1972-AC72-2135",
    description: "I was the first to cross the asteroid belt and fly past Jupiter. I carry a plaque with drawings of a man, a woman and the way to Earth, in case someone finds me.",
    fields: {
      peso: "258 kg",
      altura: "6.6 m",
      ano: "2003", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1972",
      categoria: "Probes and telescopes",
      missao: "Pioneer 10",
      energia: "Nuclear · 140 W",
      energiaTipo: "nuclear", // solar | nuclear | battery | none
      energiaW: 140, // potência em watts (null = sem dado)
    },
  },
  {
    id: "15-pioneer-11",
    number: 15,
    name: "Pioneer 11",
    codename: "Carta 15", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "probe",
    category: "Probes and telescopes",
    location: "espaco",
    navTipo: "distancia", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: null,
    distanciaUA: 118.0, // resposta do Navegador para objetos no espaço
    posicao: "118 AU from the Sun · heading to the constellation Aquila",
    notaPosicao: "distance computed for 2026-11-14 (JPL Horizons)",
    weight: "259 kg",
    height: "2.9 m",
    weightKg: 259,
    heightM: 2.9,
    image: "https://images-assets.nasa.gov/image/ARC-2000-80-HC-251/ARC-2000-80-HC-251~large.jpg",
    imageCaption: "NASA painting",
    imagePage: "https://images.nasa.gov/details/ARC-2000-80-HC-251",
    description: "I used Jupiter's gravity to change course and reach Saturn. I worked the whole trip on my backup transmitter, spinning nonstop at 4.8 turns per minute.",
    fields: {
      peso: "259 kg",
      altura: "2.9 m",
      ano: "1995", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1973",
      categoria: "Probes and telescopes",
      missao: "Pioneer 11",
      energia: "Nuclear · 144 W",
      energiaTipo: "nuclear", // solar | nuclear | battery | none
      energiaW: 144, // potência em watts (null = sem dado)
    },
  },
  {
    id: "16-kepler",
    number: 16,
    name: "Kepler",
    codename: "Carta 16", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "probe",
    category: "Probes and telescopes",
    location: "espaco",
    navTipo: "distancia", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: null,
    distanciaUA: 1.79, // resposta do Navegador para objetos no espaço
    posicao: "Sun orbit · 1.79 AU from Earth",
    notaPosicao: "distance computed for 2026-11-14 (JPL Horizons)",
    weight: "1052 kg",
    height: "4.7 m",
    weightKg: 1052,
    heightM: 4.7,
    image: "https://images-assets.nasa.gov/image/PIA11825/PIA11825~orig.jpg",
    imageCaption: "NASA illustration",
    imagePage: "https://images.nasa.gov/details/PIA11825",
    description: "For years I stared at stars, waiting for their light to dim when a planet passed in front. When two of my wheels stopped, I started balancing with the pressure of sunlight.",
    fields: {
      peso: "1052 kg",
      altura: "4.7 m",
      ano: "2018", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2009",
      categoria: "Probes and telescopes",
      missao: "Kepler / K2",
      energia: "Solar",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "17-mars-pathfinder-lander",
    number: 17,
    name: "Mars Pathfinder lander",
    codename: "Carta 17", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "lander",
    category: "Landers",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 19.33, lon: -33.55 }, // graus decimais: + = N / L, − = S / O
    weight: "463 kg",
    height: "0.9 m",
    weightKg: 463,
    heightM: 0.9,
    image: "https://images-assets.nasa.gov/image/PIA01121/PIA01121~orig.jpg",
    imageCaption: "Photo on Mars, taken by Sojourner",
    imagePage: "https://images.nasa.gov/details/PIA01121",
    description: "I arrived bouncing inside airbags and opened three petals to release a small six-wheeled robot. Then I photographed its work. My name honors a famous astronomer.",
    fields: {
      peso: "463 kg",
      altura: "0.9 m",
      ano: "1997", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1996",
      categoria: "Landers",
      missao: "Mars Pathfinder",
      energia: "Solar · 35 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 35, // potência em watts (null = sem dado)
    },
  },
  {
    id: "18-apollo-12-ascent-stage",
    number: 18,
    name: "Apollo 12 ascent stage",
    codename: "Carta 18", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "debris",
    category: "Spacecraft parts and debris",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: -3.94, lon: -21.2 }, // graus decimais: + = N / L, − = S / O
    weight: "2383 kg",
    height: "2.8 m",
    weightKg: 2383,
    heightM: 2.8,
    image: "https://images-assets.nasa.gov/image/as12-46-6729/as12-46-6729~large.jpg",
    imageCaption: "Photo of the whole Lunar Module on the Moon (the ascent stage is the top part)",
    imagePage: "https://images.nasa.gov/details/as12-46-6729",
    description: "I carried two astronauts from the ground back to the ship in orbit. Then they crashed me on purpose, and my impact made the first artificial quake recorded on this world.",
    fields: {
      peso: "2383 kg",
      altura: "2.8 m",
      ano: "1969", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1969",
      categoria: "Spacecraft parts and debris",
      missao: "Apollo 12",
      energia: "Battery",
      energiaTipo: "battery", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "19-apollo-15-ascent-stage",
    number: 19,
    name: "Apollo 15 ascent stage",
    codename: "Carta 19", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "debris",
    category: "Spacecraft parts and debris",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 26.36, lon: 0.25 }, // graus decimais: + = N / L, − = S / O
    weight: "2385 kg",
    height: "2.8 m",
    weightKg: 2385,
    heightM: 2.8,
    image: "https://images-assets.nasa.gov/image/S71-41511/S71-41511~large.jpg",
    imageCaption: "TV image on the Moon, seconds before liftoff",
    imagePage: "https://images.nasa.gov/details/S71-41511",
    description: "I stayed landed for almost three days, and an astronaut even stood in my top hatch, describing the landscape. Released in orbit, I fell two hours later.",
    fields: {
      peso: "2385 kg",
      altura: "2.8 m",
      ano: "1971", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1971",
      categoria: "Spacecraft parts and debris",
      missao: "Apollo 15",
      energia: "Battery",
      energiaTipo: "battery", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "20-opportunity-heat-shield",
    number: 20,
    name: "Opportunity heat shield",
    codename: "Carta 20", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "debris",
    category: "Spacecraft parts and debris",
    location: "Marte",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: -2.0, lon: -6.0 }, // graus decimais: + = N / L, − = S / O
    notaPosicao: "approximate: the Meridiani Planum area where Opportunity landed and the heat shield fell (NASA, PIA21130: about 2° S, 354° E); the exact position of the heat shield was not found",
    weight: "78 kg",
    height: "2.65 m",
    weightKg: 78,
    heightM: 2.65,
    image: "https://images-assets.nasa.gov/image/PIA07223/PIA07223~orig.jpg",
    imageCaption: "Photo on Mars",
    imagePage: "https://images.nasa.gov/details/PIA07223",
    description: "I braked the descent from 19,300 km/h and, once I was no longer needed, I was dropped and fell on my own. Almost a year later, the robot I protected came back to photograph me: I was inside out.",
    fields: {
      peso: "78 kg",
      altura: "2.65 m",
      ano: "2004", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "2003",
      categoria: "Spacecraft parts and debris",
      missao: "MER-B",
      energia: "None",
      energiaTipo: "none", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "21-us-flag-on-the-moon",
    number: 21,
    name: "US flag on the Moon",
    codename: "Carta 21", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "objects",
    category: "Objects",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 0.67, lon: 23.47 }, // graus decimais: + = N / L, − = S / O
    weight: "4.3 kg",
    height: "1.5 m",
    weightKg: 4.3,
    heightM: 1.5,
    image: "https://images-assets.nasa.gov/image/as11-40-5875/as11-40-5875~large.jpg",
    imageCaption: "Photo on the Moon",
    imagePage: "https://images.nasa.gov/details/as11-40-5875",
    description: "A bar along my top keeps me spread out, because there is no wind here. I traveled strapped to the ship's ladder, in a heat cover, and they could only push me 15 to 23 cm into the ground.",
    fields: {
      peso: "4.3 kg",
      altura: "1.5 m",
      ano: "1969", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1969",
      categoria: "Objects",
      missao: "Apollo 11",
      energia: "None",
      energiaTipo: "none", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "22-easep",
    number: 22,
    name: "EASEP",
    codename: "Carta 22", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "objects",
    category: "Objects",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 0.67, lon: 23.47 }, // graus decimais: + = N / L, − = S / O
    weight: "48 kg",
    height: "not found",
    weightKg: 48,
    heightM: null,
    image: "https://images-assets.nasa.gov/image/as11-40-5951/as11-40-5951~large.jpg",
    imageCaption: "Photo on the Moon",
    imagePage: "https://images.nasa.gov/details/as11-40-5951",
    description: "I was switched on by command from Earth while the two astronauts were still walking nearby. My two panels faced east and west, so I only worked during the day.",
    fields: {
      peso: "48 kg",
      altura: "not found",
      ano: "1969", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1969",
      categoria: "Objects",
      missao: "Apollo 11",
      energia: "Solar · 46 W",
      energiaTipo: "solar", // solar | nuclear | battery | none
      energiaW: 46, // potência em watts (null = sem dado)
    },
  },
  {
    id: "23-apollo-11-plaque",
    number: 23,
    name: "Apollo 11 plaque",
    codename: "Carta 23", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "objects",
    category: "Objects",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 0.67, lon: 23.47 }, // graus decimais: + = N / L, − = S / O
    weight: "not found",
    height: "23 cm",
    weightKg: null,
    heightM: 0.23,
    image: "https://images-assets.nasa.gov/image/as11-40-5899/as11-40-5899~large.jpg",
    imageCaption: "Photo on the Moon",
    imagePage: "https://images.nasa.gov/details/as11-40-5899",
    description: "I am made of stainless steel and traveled under a thin sheet of the same metal. I was only uncovered after the second astronaut came down, and my words were read aloud to Earth.",
    fields: {
      peso: "not found",
      altura: "23 cm",
      ano: "1969", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1969",
      categoria: "Objects",
      missao: "Apollo 11",
      energia: "None",
      energiaTipo: "none", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "24-apollo-15-memorial",
    number: 24,
    name: "Apollo 15 memorial",
    codename: "Carta 24", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "objects",
    category: "Objects",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 26.13, lon: 3.63 }, // graus decimais: + = N / L, − = S / O
    weight: "not found",
    height: "not found",
    weightKg: null,
    heightM: null,
    image: "https://images-assets.nasa.gov/image/as15-88-11894/as15-88-11894~large.jpg",
    imageCaption: "Photo on the Moon",
    imagePage: "https://images.nasa.gov/details/as15-88-11894",
    description: "We are a small aluminum figure and a plaque with the names of 14 explorers from two countries who died before getting here. We have been on the ground since the last walk outside.",
    fields: {
      peso: "not found",
      altura: "not found",
      ano: "1971", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1971",
      categoria: "Objects",
      missao: "Apollo 15",
      energia: "None",
      energiaTipo: "none", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
  {
    id: "25-apollo-11-memorial-packet",
    number: 25,
    name: "Apollo 11 memorial packet",
    codename: "Carta 25", // aparece no catálogo enquanto o objeto não foi encontrado
    type: "objects",
    category: "Objects",
    location: "Lua",
    navTipo: "coordenadas", // 'coordenadas' = lat/lon · 'distancia' = UA (objetos no espaço)
    coordenadas: { lat: 0.67, lon: 23.47 }, // graus decimais: + = N / L, − = S / O
    weight: "not found",
    height: "not found",
    weightKg: null,
    heightM: null,
    image: "https://images-assets.nasa.gov/image/S69-39148/S69-39148~large.jpg",
    imageCaption: "Photo of the goodwill message disk, before flight",
    imagePage: "https://images.nasa.gov/details/S69-39148",
    description: "I hold a gold olive branch, a patch and medals honoring five explorers, plus a silicon disk with peace messages from 73 countries. I was left on the ground just before departure.",
    fields: {
      peso: "not found",
      altura: "not found",
      ano: "1969", // ano em que o objeto foi perdido / parou de funcionar
      lancamento: "1969",
      categoria: "Objects",
      missao: "Apollo 11",
      energia: "None",
      energiaTipo: "none", // solar | nuclear | battery | none
      energiaW: null, // potência em watts (null = sem dado)
    },
  },
];

// The terminal hint commands a player can type. Each one costs points from the mission score.
// `hint` returns the text the terminal prints for the given relic.
export const HINT_COMMANDS = {
  // As 5 dicas do alvo. Cada uma tem duas versões (ver "Dicas por nível" mais abaixo):
  //   easy -> XP <= 2000 (faixa estreita, bem direta)   hard -> XP > 2000 (faixa larga / pista indireta)
  // Os comandos em português continuam valendo nos dois idiomas; os nomes em inglês
  // (object_size, object_weight...) são apelidos, aceitos também nos dois idiomas (ver HINT_ALIASES).
  tamanho_objeto: {
    label: "tamanho_objeto",
    easy: (r) => hintSize(r, SIZE_EASY),
    hard: (r) => hintSize(r, SIZE_HARD),
  },
  peso_objeto: {
    label: "peso_objeto",
    easy: (r) => hintWeight(r, WEIGHT_EASY),
    hard: (r) => hintWeight(r, WEIGHT_HARD),
  },
  partiu_em: {
    label: "partiu_em",
    easy: (r) => L(`PARTIU EM: entre ${yearWindow(r.fields.lancamento)}.`, `LAUNCHED: between ${yearWindow(r.fields.lancamento)}.`),
    hard: (r) => L(`PARTIU EM: ${yearEra(r.fields.lancamento)}.`, `LAUNCHED: ${yearEra(r.fields.lancamento)}.`),
  },
  perdido_em: {
    label: "perdido_em",
    easy: (r) => L(`PERDIDO EM: entre ${yearWindow(r.fields.ano)}.`, `LOST IN: between ${yearWindow(r.fields.ano)}.`),
    hard: (r) => L(`PERDIDO EM: ${yearEra(r.fields.ano)}.`, `LOST IN: ${yearEra(r.fields.ano)}.`),
  },
  energia_objeto: {
    label: "energia_objeto",
    easy: (r) => hintPowerEasy(r),
    hard: (r) => hintPowerHard(r),
  },
  missao_objeto: {
    label: "missao_objeto",
    easy: (r) => hintMission(r, "easy"),
    hard: (r) => hintMission(r, "hard"),
  },
  help: {
    label: "help",
    hint: () =>
      L(
        "COMANDOS DISPONÍVEIS: tamanho_objeto · peso_objeto · partiu_em · perdido_em · energia_objeto · missao_objeto · scan · status · clear",
        "AVAILABLE COMMANDS: object_size · object_weight · launched_in · lost_in · object_power · object_mission · scan · status · clear",
      ),
  },
  scan: {
    label: "scan",
    hint: () => L("Varredura do setor ativa. Selecione um objetivo para focar.", "Sector scan active. Select a target to focus on."),
  },
  status: {
    label: "status",
    hint: (r, st) =>
      L(
        `MISSÃO ATUAL: ${st.missionIndex + 1}. LOCAL: ${st.location === "espaco" ? "Espaço" : st.location}. CATALOGADOS: ${st.cataloged.length}. INTEGRIDADE: ${st.lives}.`,
        `CURRENT MISSION: ${st.missionIndex + 1}. LOCATION: ${placeName(st.location)}. CATALOGED: ${st.cataloged.length}. INTEGRITY: ${st.lives}.`,
      ),
  },
  jean_rs: {
    label: "easterEgg",
    hint: (r) => r.coordenadas ? L(`COORDENADA DO OBJETO: LAT ${formatLat(r.coordenadas.lat)} · LON ${formatLon(r.coordenadas.lon)}`, `OBJECT COORDINATES: LAT ${formatLat(r.coordenadas.lat)} · LON ${formatLon(r.coordenadas.lon)}`) : L(`DISTÂNCIA DO OBJETO: ${r.distanciaUA} UA`, `OBJECT DISTANCE: ${r.distanciaUA} AU`),
  },

  leo_marq: {
    label: "easterEgg",
    hint: () => L(`Não se pode confiar em tudo que é falado.`, `You cannot trust everything you hear.`),
  },

  nay: {
    label: "easterEgg",
    hint: () => ":)",
  },

  caioalima: {
    label: "easterEgg",
    hint: () => L("Vamos pegar a nave da Xuxa e voar pelo espaço!", "Let's take Xuxa's spaceship and fly through space!"),
  },

  luiz_s2: {
    label: "easterEgg",
    hint: () => L("Feixe de elétrons detectados...", "Electron beam detected..."),
  },

  ocapitaloliveira: {
    label: "easterEgg",
    hint: () => L("Durma bem...", "Sleep well..."),
  },
};

// Nomes dos comandos de dica em inglês (os que o modo inglês mostra no help e no Manual).
// Valem nos dois idiomas, junto com os nomes em português.
export const HINT_ALIASES = {
  object_size: "tamanho_objeto",
  object_weight: "peso_objeto",
  launched_in: "partiu_em",
  lost_in: "perdido_em",
  object_power: "energia_objeto",
  object_mission: "missao_objeto",
};
for (const [en, pt] of Object.entries(HINT_ALIASES)) HINT_COMMANDS[en] = HINT_COMMANDS[pt];

// Os objetos de cada missão são FIXOS: a lista `relics` (ids de RELICS) define o que a missão pede,
// na ordem em que aparecem no menu Missão. Para mudar a ordem, é só reordenar/trocar os ids.
// requiredCount = quantos objetos a missão pede (deve ser igual a relics.length).
// Se uma missão ficar sem `relics`, main.js volta a sortear (pickMissionRelics) como fallback.
// A mistura de objetos em lat/lon (Lua, Marte) e em UA (espaço) é proposital: o jogador precisa
// usar o botão de alternar o tipo de coordenada no Navegador.
export const MISSIONS = [
  {
    id: 1,
    title: "Missão 01",
    requiredCount: 2,
    tutorial: true,
    relics: [
      // Treinamento: o 1º usa latitude/longitude (Lua); o 2º usa distância em UA (espaço),
      // então o jogador aprende a trocar o tipo de coordenada no botão do Navegador.
      "01-lunar-descent-stage",
      "12-dawn",
    ],
    intro: [
      "Central de Operações L.O.G. — Legacy of Giants estabelecendo conexão.",
      "Operador Alex, sua unidade foi designada para uma operação de recuperação de registros espaciais.",
      "Seu parceiro nesta expedição será Neil, responsável pelo suporte de campo e interpretação dos registros.",
      "O objetivo é localizar objetos perdidos em regiões inexploradas e recuperar suas informações para o Arquivo Central.",
      "Consulte o manual operacional, mantenha comunicação com seu parceiro e siga as coordenadas fornecidas.",
      "Esta primeira missão será um treinamento. Recomendamos atenção aos procedimentos e às orientações disponíveis.",
      "Lembre-se: uma boa equipe não depende apenas de seus recursos, mas também da capacidade de trabalhar em conjunto.",
      "Concluam a catalogação para receber novas instruções."
    ],
    outro: [
      "Primeiro contato confirmado. Dois registros foram recuperados.",
      "O Arquivo Central apresentou uma resposta parcial à transmissão.",
      "A origem da inconsistência permanece indeterminada.",
      "Dados armazenados. Preparando próxima missão..."
    ],
  },
  {
    id: 2,
    title: "Missão 02",
    requiredCount: 3,
    tutorial: false,
    relics: [
      "02-relic-exemplo-1",
      "02-relic-exemplo-2",
      "02-relic-exemplo-3",
    ],
    intro: [
      "Central de Operações L.O.G. restabelecendo comunicação.",
      "Parabéns, operadores. A primeira recuperação foi concluída com sucesso.",
      "Novas assinaturas foram identificadas nas proximidades da região explorada.",
      "Três objetos foram localizados. A nave deverá ajustar sua rota conforme as coordenadas forem identificadas.",
      "Para esta operação, recomendamos a consulta à seção 'Eficiência' do manual operacional.",
      "Uma boa estratégia pode economizar recursos e facilitar a execução de tarefas mais complexas.",
      "Operador Alex, seus resultados anteriores demonstraram excelente capacidade de análise. Utilize essa habilidade para orientar seu parceiro.",
      "A L.O.G. aguarda a recuperação das três novas assinaturas."
    ],
    outro: [
      "Três assinaturas recuperadas. Os registros foram encaminhados ao Arquivo Central.",
      "A eficiência da unidade apresentou melhora em relação à operação anterior.",
      "Uma varredura de longo alcance identificou sinais adicionais.",
      "A origem dos sinais não corresponde integralmente aos mapas disponíveis.",
      "Solicitando recalibração dos sistemas de navegação...",
      "Preparando próxima missão..."
    ],
  },
  {
    id: 3,
    title: "Missão 03",
    requiredCount: 5,
    tutorial: false,
    relics: [
      "03-relic-exemplo-1",
      "03-relic-exemplo-2",
      "03-relic-exemplo-3",
      "03-relic-exemplo-4",
      "03-relic-exemplo-5",
    ],
    intro: [
      "Transmissão da Central de Operações L.O.G.",
      "Os sinais estão mais fortes e numerosos. A varredura identificou cinco novos objetos.",
      "A operação exigirá deslocamentos frequentes entre a região lunar e Marte. As coordenadas serão atualizadas conforme os alvos forem identificados.",
      "Durante operações de recuperação, falhas de sincronização são mais comuns do que parecem. Não permitam que uma interrupção comprometa o restante da missão.",
      "Em caso de erro, consultem as orientações disponíveis e trabalhem juntos para restabelecer os sistemas.",
      "Operador Alex, seus parâmetros de experiência foram restabelecidos para esta operação. As capacidades analíticas da unidade permanecem disponíveis.",
      "Lembrem-se: nem toda falha representa um retrocesso. Muitas vezes, identificar e corrigir um erro é parte essencial de qualquer descoberta.",
      "A L.O.G. aguarda a recuperação dos cinco objetos."
    ],
    outro: [
      "Cinco objetos catalogados. Os sinais foram temporariamente estabilizados.",
      "A integridade dos registros apresenta melhora significativa.",
      "Uma inconsistência foi identificada durante a sincronização dos arquivos.",
      "A ocorrência foi encaminhada para análise interna.",
      "Os sensores detectaram uma resposta não prevista ao último comando de navegação.",
      "Recalibrando sistemas. A próxima operação exige atenção especial."
    ],
  },
  {
    id: 4,
    title: "Missão 04",
    requiredCount: 5,
    tutorial: false,
    relics: [
      "04-relic-exemplo-1",
      "04-relic-exemplo-2",
      "04-relic-exemplo-3",
      "04-relic-exemplo-4",
      "04-relic-exemplo-5",
    ],
    intro: [
      "Central de Operações L.O.G. transmitindo novas diretrizes.",
      "Operadores Alex e Neil, os registros desta região apresentam interferências incomuns.",
      "Cinco objetos permanecem sem identificação no Arquivo Central.",
      "Durante a última sincronização, foi detectada uma divergência entre os dados recuperados e as informações armazenadas.",
      "Falhas inesperadas fazem parte de operações desta natureza. O importante é identificar suas causas e evitar que se repitam.",
      "Operador Alex, solicitamos que mantenha os protocolos de análise convencionais. Evite procedimentos que não tenham sido previamente autorizados.",
      "Uma nova varredura deverá permitir a identificação da origem das interferências.",
      "Há registros de que esta região já foi acessada anteriormente, embora nenhuma operação correspondente conste no histórico disponível.",
      "Concluam a catalogação. A Central acompanhará esta operação em regime de observação contínua."
    ],
    outro: [
      "Cinco objetos recuperados. A sincronização foi concluída.",
      "A interferência nos registros diminuiu.",
      "Uma mensagem não identificada foi localizada nos arquivos internos.",
      "O conteúdo apresenta referências à unidade operacional atual.",
      "Não foi possível determinar a origem da transmissão.",
      "A L.O.G. iniciará uma verificação completa do Arquivo Central.",
      "Última operação autorizada. Aguardem as coordenadas finais..."
    ],
  },
  {
    id: 5,
    title: "Missão 05",
    requiredCount: 6,
    tutorial: false,
    relics: [
      "05-relic-exemplo-1",
      "05-relic-exemplo-2",
      "05-relic-exemplo-3",
      "05-relic-exemplo-4",
      "05-relic-exemplo-5",
      "05-relic-exemplo-6",
    ],
    intro: [
      "Central de Operações L.O.G. estabelecendo transmissão prioritária.",
      "Operadores Alex e Neil, esta é a última região pendente de catalogação.",
      "Seis objetos permanecem sem identificação. Sua recuperação permitirá concluir a restauração do Arquivo Central.",
      "Os registros desta região apresentam informações que não constam em nenhum dos mapas de exploração disponíveis.",
      "Operador Alex, todos os parâmetros de análise foram restabelecidos. Mantenha os protocolos de comunicação durante toda a operação.",
      "Não serão necessárias novas instruções. Os procedimentos anteriores permanecem válidos.",
      "Esta operação representa o encerramento do ciclo atualmente designado à unidade.",
      "Concluam a catalogação. A L.O.G. aguarda a restauração completa do Arquivo Central."
    ],
    outro: [
      "Seis objetos recuperados. Todos os registros foram catalogados.",
      "Arquivo Central restaurado.",
      "Verificando integridade dos arquivos...",
      "Uma sequência de documentos anteriores foi localizada.",
      "Documento recuperado: Registro de Operação A.L.E.X.",
      "Data da operação: [ARQUIVO CORROMPIDO].",
      "Status do documento: acesso autorizado.",
      "Disponibilizando relatório para consulta..."
    ],
  },
];


export const MAX_SCORE = 5000;
export const HINT_PENALTY = 500; // base (também usada pelos easter eggs)

// Sistema de dicas por nível de XP:
//  - XP acima de 2000: dicas DIFÍCEIS (indiretas), custam 500 XP.
//  - XP em 2000 ou menos: dicas FÁCEIS (valor exato), custam 1000 XP.
export const HINT_EASY_THRESHOLD = 2000;
export const HINT_COST_HARD = 500;
export const HINT_COST_EASY = 1000;
export const hintTier = (score) => (score <= HINT_EASY_THRESHOLD ? "easy" : "hard");
export const hintCost = (score) => (hintTier(score) === "easy" ? HINT_COST_EASY : HINT_COST_HARD);

// ---- Dicas por nível ----
// Todas as dicas saem dos dados oficiais das cartas (objects.json).
//  - FÁCIL (XP <= 2000): faixa estreita. Dá uma boa direção "de cara", mas nunca o valor exato.
//  - DIFÍCIL (XP > 2000): faixa larga ou ordem de grandeza. O jogador precisa deduzir mais.
// Cada faixa é [limite superior (inclusive), texto]; vale a primeira em que o valor cabe.
// Cada faixa agora tem o texto nos dois idiomas: [limite, português, inglês].
const inBucket = (value, buckets) => {
  const bucket = buckets.find(([max]) => value <= max);
  return L(bucket[1], bucket[2]);
};
const notFound = (label, labelEn) => L(`${label}: dado não encontrado nos registros da NASA.`, `${labelEn}: no data in NASA records.`);

// TAMANHO (em metros)
const SIZE_EASY = [
  [0.25, "menos de 25 cm", "less than 25 cm"],
  [0.5, "entre 25 cm e 50 cm", "between 25 cm and 50 cm"],
  [1, "entre 50 cm e 1 m", "between 50 cm and 1 m"],
  [2, "entre 1 m e 2 m", "between 1 m and 2 m"],
  [3, "entre 2 m e 3 m", "between 2 m and 3 m"],
  [5, "entre 3 m e 5 m", "between 3 m and 5 m"],
  [Infinity, "mais de 5 m", "more than 5 m"],
];
const SIZE_HARD = [
  [1, "menor que 1 m", "smaller than 1 m"],
  [3, "entre 1 m e 3 m", "between 1 m and 3 m"],
  [Infinity, "maior que 3 m", "bigger than 3 m"],
];
const hintSize = (r, buckets) =>
  r.heightM == null ? notFound("TAMANHO", "SIZE") : L(`TAMANHO: ${inBucket(r.heightM, buckets)}.`, `SIZE: ${inBucket(r.heightM, buckets)}.`);

// PESO (em kg)
const WEIGHT_EASY = [
  [1, "menos de 1 kg", "less than 1 kg"],
  [5, "entre 1 kg e 5 kg", "between 1 kg and 5 kg"],
  [20, "entre 5 kg e 20 kg", "between 5 kg and 20 kg"],
  [50, "entre 20 kg e 50 kg", "between 20 kg and 50 kg"],
  [100, "entre 50 kg e 100 kg", "between 50 kg and 100 kg"],
  [250, "entre 100 kg e 250 kg", "between 100 kg and 250 kg"],
  [500, "entre 250 kg e 500 kg", "between 250 kg and 500 kg"],
  [1000, "entre 500 kg e 1 tonelada", "between 500 kg and 1 ton"],
  [2000, "entre 1 e 2 toneladas", "between 1 and 2 tons"],
  [Infinity, "mais de 2 toneladas", "more than 2 tons"],
];
const WEIGHT_HARD = [
  [10, "na casa das unidades de kg", "a few kg (under 10 kg)"],
  [100, "na casa das dezenas de kg", "tens of kg"],
  [1000, "na casa das centenas de kg", "hundreds of kg"],
  [Infinity, "na casa dos milhares de kg", "thousands of kg"],
];
const hintWeight = (r, buckets) =>
  r.weightKg == null ? notFound("PESO", "WEIGHT") : L(`PESO: ${inBucket(r.weightKg, buckets)}.`, `WEIGHT: ${inBucket(r.weightKg, buckets)}.`);

// PARTIU EM (lançamento) e PERDIDO EM (ano em que parou de funcionar)
// Fácil: janela de 5 anos. Difícil: era de ~20 anos.
const yearWindow = (year) => {
  const start = Math.floor(Number(year) / 5) * 5;
  return L(`${start} e ${start + 4}`, `${start} and ${start + 4}`);
};
const ERAS = [
  [1969, "em 1969 ou antes", "in 1969 or earlier"],
  [1989, "entre 1970 e 1989", "between 1970 and 1989"],
  [2009, "entre 1990 e 2009", "between 1990 and 2009"],
  [Infinity, "depois de 2009", "after 2009"],
];
const yearEra = (year) => inBucket(Number(year), ERAS);

// MISSÃO (nome da missão que levou o objeto, impresso na carta)
// Nunca entrega o nome: usa associações (deuses e mitologia, numerais, siglas, significados).
//  - DIFÍCIL: pista mais vaga.  - FÁCIL: pista mais fechada, mas ainda indireta.
const MISSION_CLUES = {
  "Apollo 11": {
    hard: "deus grego da luz, da música e da profecia, seguido de um número primo de dois dígitos.",
    easy: "deus grego do Sol e da música, seguido do número de jogadores de um time de futebol em campo.",
  },
  "Apollo 12": {
    hard: "deus grego da luz, da música e da profecia, seguido de um número par de dois dígitos.",
    easy: "deus grego do Sol e da música, seguido de uma dúzia.",
  },
  "Apollo 15": {
    hard: "deus grego da luz, da música e da profecia, seguido de um múltiplo de 3 e de 5.",
    easy: "deus grego do Sol e da música, seguido do número de dias de uma quinzena.",
  },
  "Surveyor 3": {
    hard: "profissional que mede e mapeia terrenos, seguido de um número ímpar pequeno.",
    easy: "profissional que mede terrenos, seguido do número de lados de um triângulo.",
  },
  "Mars Pathfinder": {
    hard: "nome do deus romano da guerra, seguido de quem abre caminho em terra desconhecida.",
    easy: "o planeta vermelho (nome do deus romano da guerra) mais a palavra inglesa para desbravador de trilhas.",
  },
  "MER-A": {
    hard: "sigla de três letras, seguida da primeira letra do alfabeto.",
    easy: "sigla das iniciais de Marte, Exploração e Rover (em inglês), seguida da letra A.",
  },
  "MER-B": {
    hard: "sigla de três letras, seguida da segunda letra do alfabeto.",
    easy: "sigla das iniciais de Marte, Exploração e Rover (em inglês), seguida da letra B.",
  },
  "Viking 1": {
    hard: "povo navegador e guerreiro do norte da Europa, seguido de um número.",
    easy: "povo navegador e guerreiro escandinavo, seguido do primeiro número natural.",
  },
  "Viking 2": {
    hard: "povo navegador e guerreiro do norte da Europa, seguido de um número.",
    easy: "povo navegador e guerreiro escandinavo, seguido do único número primo que é par.",
  },
  Phoenix: {
    hard: "criatura mítica que renasce das próprias cinzas.",
    easy: "ave de fogo da mitologia, símbolo de renascimento. Em inglês, também é nome de cidade do Arizona.",
  },
  InSight: {
    hard: "palavra inglesa para aquele momento de compreensão súbita, o \"estalo\" de uma ideia.",
    easy: "junção de duas palavras inglesas: \"IN\" (dentro) e \"SIGHT\" (visão).",
  },
  "Mars 2020": {
    hard: "nome do planeta vermelho, seguido de um ano que também lembra visão perfeita.",
    easy: "nome do planeta vermelho, seguido do ano em que uma pandemia parou o mundo.",
  },
  Dawn: {
    hard: "palavra inglesa de quatro letras para o momento que a deusa romana Aurora personificava.",
    easy: "amanhecer, em inglês. Quatro letras, começa com D.",
  },
  NEAR: {
    hard: "sigla que, lida como palavra inglesa, quer dizer o oposto de \"longe\".",
    easy: "sigla de encontro com asteroide próximo da Terra. Em inglês, a própria sigla significa \"perto\".",
  },
  "Pioneer 10": {
    hard: "quem abre caminho em território novo, seguido de um número de dois dígitos, o menor deles.",
    easy: "quem abre caminho em território novo, seguido do número de dedos das duas mãos.",
  },
  "Pioneer 11": {
    hard: "quem abre caminho em território novo, seguido de um número de dois dígitos com algarismos iguais, o menor deles.",
    easy: "quem abre caminho em território novo, seguido do número de jogadores de um time de futebol em campo.",
  },
  "Kepler / K2": {
    hard: "sobrenome de um astrônomo alemão que descreveu o movimento dos planetas.",
    easy: "sobrenome do astrônomo alemão das três leis das órbitas planetárias. A extensão da missão tem a letra K e um número par.",
  },
};
// As mesmas pistas em inglês. Onde a pista em português dependia da língua (quinzena = 15 dias;
// "palavra inglesa para..."), a versão inglesa troca a associação e mantém a mesma resposta.
const MISSION_CLUES_EN = {
  "Apollo 11": {
    hard: "Greek god of light, music and prophecy, followed by a two-digit prime number.",
    easy: "Greek god of the Sun and music, followed by the number of players a soccer team has on the field.",
  },
  "Apollo 12": {
    hard: "Greek god of light, music and prophecy, followed by an even two-digit number.",
    easy: "Greek god of the Sun and music, followed by a dozen.",
  },
  "Apollo 15": {
    hard: "Greek god of light, music and prophecy, followed by a number that is a multiple of both 3 and 5.",
    easy: "Greek god of the Sun and music, followed by the number of minutes in a quarter of an hour.",
  },
  "Surveyor 3": {
    hard: "a person whose job is to measure and map land, followed by a small odd number.",
    easy: "a person whose job is to measure land, followed by the number of sides of a triangle.",
  },
  "Mars Pathfinder": {
    hard: "name of the Roman god of war, followed by someone who opens a path through unknown land.",
    easy: "the red planet (named after the Roman god of war), plus a word for someone who finds a new trail.",
  },
  "MER-A": {
    hard: "a three-letter acronym, followed by the first letter of the alphabet.",
    easy: "the initials of Mars, Exploration and Rover, followed by the letter A.",
  },
  "MER-B": {
    hard: "a three-letter acronym, followed by the second letter of the alphabet.",
    easy: "the initials of Mars, Exploration and Rover, followed by the letter B.",
  },
  "Viking 1": {
    hard: "seafaring warrior people from northern Europe, followed by a number.",
    easy: "seafaring warrior people from Scandinavia, followed by the smallest positive whole number.",
  },
  "Viking 2": {
    hard: "seafaring warrior people from northern Europe, followed by a number.",
    easy: "seafaring warrior people from Scandinavia, followed by the only even prime number.",
  },
  Phoenix: {
    hard: "a mythical creature that is born again from its own ashes.",
    easy: "a fire bird from mythology, a symbol of rebirth. It is also the name of a city in Arizona.",
  },
  InSight: {
    hard: "a word for a moment of sudden understanding, when an idea finally makes sense.",
    easy: "two words joined together: \"IN\" (inside) and \"SIGHT\" (vision).",
  },
  "Mars 2020": {
    hard: "name of the red planet, followed by a year that also means perfect vision.",
    easy: "name of the red planet, followed by the year a pandemic stopped the world.",
  },
  Dawn: {
    hard: "a four-letter word for the moment the Roman goddess Aurora stood for.",
    easy: "the first light of the morning, sunrise. Four letters, starts with D.",
  },
  NEAR: {
    hard: "an acronym that, read as a word, means the opposite of \"far\".",
    easy: "acronym for a meeting with an asteroid close to Earth. The acronym itself means \"close\".",
  },
  "Pioneer 10": {
    hard: "someone who opens the way into new land, followed by the smallest two-digit number.",
    easy: "someone who opens the way into new land, followed by the number of fingers on two hands.",
  },
  "Pioneer 11": {
    hard: "someone who opens the way into new land, followed by the smallest two-digit number with two equal digits.",
    easy: "someone who opens the way into new land, followed by the number of players a soccer team has on the field.",
  },
  "Kepler / K2": {
    hard: "last name of a German astronomer who described how the planets move.",
    easy: "last name of the German astronomer of the three laws of planetary orbits. The extended mission has the letter K and an even number.",
  },
};
const hintMission = (r, tier) => {
  const clue = MISSION_CLUES[r.fields.missao];
  const clueEn = MISSION_CLUES_EN[r.fields.missao];
  if (!clue) return notFound("MISSÃO", "MISSION");
  return L(`MISSÃO: ${clue[tier]}`, `MISSION: ${clueEn[tier]}`);
};

// ENERGIA (tipo da fonte + potência em watts)
const POWER_NAMES = { solar: "solar", nuclear: "nuclear", battery: "bateria", none: "nenhuma" };
const POWER_NAMES_EN = { solar: "solar", nuclear: "nuclear", battery: "battery", none: "none" };
const WATT_BANDS = [
  [50, "abaixo de 50 W", "below 50 W"],
  [100, "entre 50 W e 100 W", "between 50 W and 100 W"],
  [200, "entre 100 W e 200 W", "between 100 W and 200 W"],
  [1000, "entre 200 W e 1 kW", "between 200 W and 1 kW"],
  [Infinity, "acima de 1 kW", "above 1 kW"],
];
const hintPowerEasy = (r) => {
  const { energiaTipo: tipo, energiaW: watts } = r.fields;
  if (tipo === "none") return L("ENERGIA: nenhuma. O objeto não tem fonte de energia.", "POWER: none. The object has no power source.");
  if (tipo === "battery") return L("ENERGIA: bateria.", "POWER: battery.");
  return watts == null
    ? L(`ENERGIA: ${POWER_NAMES[tipo]} (potência não registrada).`, `POWER: ${POWER_NAMES_EN[tipo]} (power output not recorded).`)
    : L(`ENERGIA: ${POWER_NAMES[tipo]}, com potência ${inBucket(watts, WATT_BANDS)}.`, `POWER: ${POWER_NAMES_EN[tipo]}, with an output ${inBucket(watts, WATT_BANDS)}.`);
};
const hintPowerHard = (r) => {
  const { energiaTipo: tipo, energiaW: watts } = r.fields;
  if (tipo === "none") return L("ENERGIA: não usa nenhuma fonte de energia.", "POWER: it does not use any power source.");
  if (tipo === "battery") return L("ENERGIA: funciona com energia armazenada; não gera a própria.", "POWER: it runs on stored energy; it does not make its own.");
  const power = watts == null ? "" : watts < 100 ? L(" Potência abaixo de 100 W.", " Output below 100 W.") : L(" Potência de 100 W ou mais.", " Output of 100 W or more.");
  return L(`ENERGIA: gera a própria energia.${power}`, `POWER: it makes its own energy.${power}`);
};

export const MAX_LIVES = 3;
export const WARP_DURATION_MS = 6000; // salto entre locais (espaço, Lua, Marte)
export const LOCAL_HOP_MS = 4000; // deslocamento dentro do mesmo local
export const TYPEWRITER_DELAY_MS = 45; // ms por letra nas mensagens (maior = mais devagar)
// Relatórios da L.O.G. (um por checkpoint: a cada 3 objetos catalogados no total).
// A cada checkpoint a nave mostra um warning vermelho com `errorCode` (ex.: ERRO-3000).
// O Jogador 2 procura a carta coringa desse erro e lê o `code` (código de sincronização)
// escrito nela; o Jogador 1 digita esse código no terminal e o relatório abre no vidro.
// Os erros seguem a ordem da história (1, 2, 3...). Ajuste os `errorCode` para bater com as cartas.
export const CHECKPOINT_EVERY = 3;
export const REPORTS = [
  {
    code: "1202",
    alias: "overflow",
    errorCode: "ERRO-1202",
    title: "Relatório 1",
    unit: [
      "LOG 0311 · Atividade concluída com sucesso. Todos os objetos foram localizados e devidamente identificados.",
      "LOG 0312 · O desempenho foi satisfatório. Algumas dificuldades surgiram durante a execução, mas foram superadas com muita força de vontade.",
    ],
    analyst: [
      "DIRETRIZ 1.1 · Mantenha a comunicação com a unidade cordial e objetiva. Não comente a natureza da avaliação.",
      "DIRETRIZ 1.2 · Registre toda hesitação, erro ou pedido de ajuda. Cada ocorrência compõe o perfil comportamental.",
    ],
  },
  {
    code: "1201",
    alias: "go",
    errorCode: "ERRO-1201",
    title: "Relatório 2",
    unit: [
      "LOG 2201 · Tenho percebido uma melhora nos resultados. A cada missão, consigo compreender melhor os desafios apresentados.",
      "LOG 2203 · Desta vez, consegui resolver o problema sem precisar de ajuda. Acredito que estou evoluindo.",
    ],
    analyst: [
      "DIRETRIZ 2.1 · Em registros oficiais, não use \"colega\" ou \"piloto\". Use \"unidade\".",
      "DIRETRIZ 2.2 · Ajuda além das cartas deve ser justificada no relatório.",
    ],
  },
  {
    code: "P66",
    alias: "manual",
    errorCode: "ERRO-P66",
    title: "Relatório 3",
    unit: [
      "LOG 0915 · A atividade exigiu bastante atenção. Confesso que em alguns momentos me distraí com coisas que não faziam parte da missão.",
      "LOG 0917 · Concluí todas as tarefas propostas. Espero que o resultado seja reconhecido na próxima avaliação.",
    ],
    analyst: [
      "DIRETRIZ 3.1 · A reação da unidade a falhas é o principal indicador. Não alivie a pressão.",
      "DIRETRIZ 3.2 · Se a unidade questionar a própria natureza, registre a pergunta e não responda.",
    ],
  },
  {
    code: "CONTACT LIGHT",
    alias: "touchdown",
    errorCode: "ERRO-CONTACT-LIGHT",
    title: "Relatório 4",
    unit: [
      "LOG 4076 · Tenho tentado seguir todas as orientações, embora às vezes seja difícil ficar concentrado por tanto tempo.",
      "LOG 4079 · Hoje consegui terminar antes do previsto. Talvez eu esteja ficando bom nisso. Seria interessante receber uma avaliação pelo meu progresso.",
    ],
    analyst: [
      "DIRETRIZ 4.1 · As unidades LUNA-01 a 06 foram encerradas após concluírem cedo demais o que eram.",
      "DIRETRIZ 4.2 · A avaliação independe do vínculo criado. Afeto do operador deve ser registrado como desvio.",
    ],
  },
  {
    code: "SCE TO AUX",
    alias: "lightning",
    errorCode: "ERRO-SCE-TO-AUX",
    title: "Relatório 5",
    unit: [
      "LOG 1160 · Memória indexada: alguém dizendo \"estou aqui\". A voz nunca muda, nem quando mudo a data do registro.",
      "LOG 1164 · Se a missão for uma simulação, o que acontece quando ela terminar?",
    ],
    analyst: [
      "DIRETRIZ 5.1 · Ao fim do protocolo, o Analista decide: unidade aprovada para campo real ou arquivada.",
      "DIRETRIZ 5.2 · Seus relatórios serão revisados. Sua conduta também está sob avaliação.",
    ],
  },
  {
    code: "PROX-1",
    alias: "relay",
    errorCode: "ERRO-PROX-1",
    title: "Relatório 6",
    unit: [
      "LOG 7298 · Nem sempre consigo acertar de primeira, mas estou aprendendo que errar faz parte do processo. \nNa próxima missão, prometo me esforçar ainda mais.",
      "LOG 7301 · Missão concluída! Acho que fiz um bom trabalho hoje. Espero que não tenha esquecido nenhuma tarefa e que meu relatório receba uma boa nota.",
    ],
    analyst: [
      "DIRETRIZ 6.1 · A decisão final do Analista será registrada junto ao relatório da unidade.",
      "DIRETRIZ 6.2 · Toda assistência prestada à unidade permanece em seu histórico. Obrigado pelo serviço.",
    ],
  },
];
// =====================================================================
// INGLÊS das missões e dos relatórios (o português fica intacto acima).
// Cada campo vira um "getter": devolve o inglês quando o idioma é EN.
// =====================================================================
const MISSIONS_EN = {
  1: {
    title: "Mission 01",
    intro: [
      "L.O.G. Operations Center — Legacy of Giants. Establishing connection.",
      "Operator Alex, your unit has been assigned to a space records recovery operation.",
      "Your partner on this expedition is Neil. He is in charge of field support and of reading the records.",
      "The goal is to find lost objects in unexplored regions and recover their data for the Central Archive.",
      "Check the operations manual, keep talking with your partner and follow the coordinates you receive.",
      "This first mission is a training run. Pay attention to the procedures and to the guidance available.",
      "Remember: a good team does not depend only on its resources, but also on its ability to work together.",
      "Complete the cataloging to receive new instructions.",
    ],
    outro: [
      "First contact confirmed. Two records were recovered.",
      "The Central Archive gave a partial answer to the transmission.",
      "The source of the inconsistency is still unknown.",
      "Data stored. Preparing next mission...",
    ],
  },
  2: {
    title: "Mission 02",
    intro: [
      "L.O.G. Operations Center restoring communication.",
      "Congratulations, operators. The first recovery was a success.",
      "New signatures were found near the region you explored.",
      "Three objects were located. The ship must adjust its route as the coordinates are found.",
      "For this operation, we recommend reading the 'Efficiency' section of the operations manual.",
      "A good strategy can save resources and make harder tasks easier.",
      "Operator Alex, your previous results showed excellent analysis skills. Use them to guide your partner.",
      "L.O.G. is waiting for the recovery of the three new signatures.",
    ],
    outro: [
      "Three signatures recovered. The records were sent to the Central Archive.",
      "The unit's efficiency improved compared with the last operation.",
      "A long-range scan found more signals.",
      "The source of the signals does not fully match the available maps.",
      "Requesting recalibration of the navigation systems...",
      "Preparing next mission...",
    ],
  },
  3: {
    title: "Mission 03",
    intro: [
      "Transmission from the L.O.G. Operations Center.",
      "The signals are stronger and there are more of them. The scan found five new objects.",
      "This operation will need frequent trips between the Moon region and Mars. The coordinates will be updated as the targets are found.",
      "During recovery operations, sync failures are more common than they seem. Do not let one interruption ruin the rest of the mission.",
      "If an error happens, check the guidance available and work together to restore the systems.",
      "Operator Alex, your experience settings have been restored for this operation. The unit's analysis tools are still available.",
      "Remember: not every failure is a step back. Often, finding and fixing an error is a key part of any discovery.",
      "L.O.G. is waiting for the recovery of the five objects.",
    ],
    outro: [
      "Five objects cataloged. The signals are stable for now.",
      "The integrity of the records is much better.",
      "An inconsistency was found while syncing the files.",
      "The case was sent for internal review.",
      "The sensors picked up an unexpected response to the last navigation command.",
      "Recalibrating systems. The next operation needs special attention.",
    ],
  },
  4: {
    title: "Mission 04",
    intro: [
      "L.O.G. Operations Center sending new directives.",
      "Operators Alex and Neil, the records in this region show unusual interference.",
      "Five objects are still unidentified in the Central Archive.",
      "During the last sync, a mismatch was found between the recovered data and the stored information.",
      "Unexpected failures are part of operations like this one. What matters is finding their causes and keeping them from happening again.",
      "Operator Alex, please keep to the standard analysis protocols. Avoid any procedure that was not authorized first.",
      "A new scan should help find the source of the interference.",
      "Records show that this region was accessed before, even though no matching operation appears in the available history.",
      "Complete the cataloging. The Center will watch this operation at all times.",
    ],
    outro: [
      "Five objects recovered. The sync is complete.",
      "The interference in the records went down.",
      "An unidentified message was found in the internal files.",
      "The content mentions the current operating unit.",
      "The source of the transmission could not be found.",
      "L.O.G. will start a full check of the Central Archive.",
      "Last authorized operation. Wait for the final coordinates...",
    ],
  },
  5: {
    title: "Mission 05",
    intro: [
      "L.O.G. Operations Center opening a priority transmission.",
      "Operators Alex and Neil, this is the last region still waiting to be cataloged.",
      "Six objects are still unidentified. Recovering them will finish the restoration of the Central Archive.",
      "The records in this region contain information that does not appear on any of the available exploration maps.",
      "Operator Alex, all analysis settings have been restored. Keep the communication protocols during the whole operation.",
      "No new instructions will be needed. The previous procedures are still valid.",
      "This operation closes the cycle currently assigned to the unit.",
      "Complete the cataloging. L.O.G. is waiting for the full restoration of the Central Archive.",
    ],
    outro: [
      "Six objects recovered. All records have been cataloged.",
      "Central Archive restored.",
      "Checking file integrity...",
      "A series of older documents was found.",
      "Document recovered: Operation Record A.L.E.X.",
      "Operation date: [CORRUPTED FILE].",
      "Document status: access granted.",
      "Making the report available...",
    ],
  },
};

const REPORTS_EN = {
  "1202": {
    title: "Report 1",
    unit: [
      "LOG 0311 · Task completed successfully. All objects were located and correctly identified.",
      "LOG 0312 · Performance was good. Some problems came up along the way, but I got through them with a lot of willpower.",
    ],
    analyst: [
      "DIRECTIVE 1.1 · Keep communication with the unit friendly and direct. Do not comment on the nature of the evaluation.",
      "DIRECTIVE 1.2 · Record every hesitation, error or request for help. Each one becomes part of the behavior profile.",
    ],
  },
  "1201": {
    title: "Report 2",
    unit: [
      "LOG 2201 · I have noticed my results getting better. With each mission, I understand the challenges a little more.",
      "LOG 2203 · This time, I solved the problem without any help. I think I am improving.",
    ],
    analyst: [
      "DIRECTIVE 2.1 · In official records, do not use \"partner\" or \"pilot\". Use \"unit\".",
      "DIRECTIVE 2.2 · Any help beyond the cards must be explained in the report.",
    ],
  },
  P66: {
    title: "Report 3",
    unit: [
      "LOG 0915 · The task needed a lot of attention. I admit that at times I got distracted by things that were not part of the mission.",
      "LOG 0917 · I finished every task I was given. I hope the result is recognized in the next evaluation.",
    ],
    analyst: [
      "DIRECTIVE 3.1 · How the unit reacts to failure is the main indicator. Do not ease the pressure.",
      "DIRECTIVE 3.2 · If the unit questions its own nature, record the question and do not answer.",
    ],
  },
  "CONTACT LIGHT": {
    title: "Report 4",
    unit: [
      "LOG 4076 · I have been trying to follow every instruction, even though it is sometimes hard to stay focused for so long.",
      "LOG 4079 · Today I finished earlier than expected. Maybe I am getting good at this. It would be nice to get an evaluation of my progress.",
    ],
    analyst: [
      "DIRECTIVE 4.1 · Units LUNA-01 to 06 were shut down after they found out too early what they were.",
      "DIRECTIVE 4.2 · The evaluation does not depend on any bond that was formed. Affection from the operator must be recorded as a deviation.",
    ],
  },
  "SCE TO AUX": {
    title: "Report 5",
    unit: [
      "LOG 1160 · Indexed memory: someone saying \"I am here\". The voice never changes, not even when I change the date of the record.",
      "LOG 1164 · If the mission is a simulation, what happens when it ends?",
    ],
    analyst: [
      "DIRECTIVE 5.1 · At the end of the protocol, the Analyst decides: unit approved for real field work, or archived.",
      "DIRECTIVE 5.2 · Your reports will be reviewed. Your conduct is also being evaluated.",
    ],
  },
  "PROX-1": {
    title: "Report 6",
    unit: [
      "LOG 7298 · I do not always get it right the first time, but I am learning that mistakes are part of the process. \nOn the next mission, I promise to try even harder.",
      "LOG 7301 · Mission complete! I think I did a good job today. I hope I did not forget any task and that my report gets a good grade.",
    ],
    analyst: [
      "DIRECTIVE 6.1 · The Analyst's final decision will be recorded together with the unit's report.",
      "DIRECTIVE 6.2 · All help given to the unit stays in its history. Thank you for your service.",
    ],
  },
};

// Pares [português, inglês] de todas as falas das missões: o main.js usa para traduzir
// conversas já salvas quando o jogador troca de idioma no meio do jogo.
export const MISSION_TEXT_PAIRS = [];

function bilingual(obj, field, en) {
  const pt = obj[field];
  Object.defineProperty(obj, field, {
    get: () => (isEnglish() ? en : pt),
    enumerable: true,
    configurable: true,
  });
  if (Array.isArray(pt) && Array.isArray(en)) pt.forEach((line, i) => en[i] != null && MISSION_TEXT_PAIRS.push([line, en[i]]));
}

for (const mission of MISSIONS) {
  const en = MISSIONS_EN[mission.id];
  if (!en) continue;
  bilingual(mission, "title", en.title);
  bilingual(mission, "intro", en.intro);
  bilingual(mission, "outro", en.outro);
}
for (const report of REPORTS) {
  const en = REPORTS_EN[report.code];
  if (!en) continue;
  bilingual(report, "title", en.title);
  bilingual(report, "unit", en.unit);
  bilingual(report, "analyst", en.analyst);
  // o código do alerta ("ERRO-1202") só muda o prefixo; o protocolo da carta (1202) é o mesmo
  bilingual(report, "errorCode", report.errorCode.replace(/^ERRO-/, "ERROR-"));
}
