// Conteúdo estático do jogo: missões, objetos (relíquias) e narrativa.
// Os objetos vêm do arquivo oficial de cartas (objects.json, L.O.G. — Legacy of Giants),
// com os textos originais (em inglês). As imagens são as fotos/ilustrações oficiais da NASA.

// Filtros do catálogo = as 5 categorias das cartas.
export const RELIC_TYPES = [
  { id: "rover", label: "Rovers and vehicles" },
  { id: "lander", label: "Landers" },
  { id: "probe", label: "Probes and telescopes" },
  { id: "debris", label: "Spacecraft parts and debris" },
  { id: "objects", label: "Objects" },
];

export const LOCATIONS = [
  { id: "Lua", label: "Lua" },
  { id: "Marte", label: "Marte" },
  { id: "espaco", label: "Espaço" }, // mesmo valor de SPACE no main.js
];

// Nome para exibir de um local (o valor interno do espaço é "espaco").
export const placeName = (loc) => (loc === "espaco" ? "Espaço" : loc);

// ---- Coordenadas: latitude e longitude ----
// O jogador digita DOIS campos no Navegador:
//   Latitude  (N/S) · Longitude (L/O)
// Internamente: graus decimais, N e L positivos; S e O negativos.
// Aceita "0,67", "0.67", "-3,01", "3,01 S", "23,47° L", "23.42 O"...
export const COORD_TOLERANCE = 0.006; // as cartas trazem 2 casas decimais

export const formatLat = (v) => `${Math.abs(v).toFixed(2).replace(".", ",")}° ${v < 0 ? "S" : "N"}`;
export const formatLon = (v) => `${Math.abs(v).toFixed(2).replace(".", ",")}° ${v < 0 ? "O" : "L"}`;
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
  relic.coordenadas ? formatCoord(relic.coordenadas) : `${String(relic.distanciaUA).replace(".", ",")} UA`;

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
    },
  },
];

// The terminal hint commands a player can type. Each one costs points from the mission score.
// `hint` returns the text the terminal prints for the given relic.
export const HINT_COMMANDS = {
  peso_objeto: {
    label: "peso_objeto",
    hint: (r) =>
      r.weightKg == null
        ? "PESO: dado não encontrado nos registros da NASA."
        : `PESO: O alvo pesa ${r.fields.peso} no envoltório de lançamento.`,
  },
  altura_objeto: {
    label: "altura_objeto",
    hint: (r) => r.heightM == null
        ? "ALTURA: dado não encontrado nos registros da NASA."
        : `ALTURA: ${r.fields.altura} do equipamento até a base.`,
  },
  ano_perda: {
    label: "ano_perda",
    hint: (r) => `ANO DA PERDA: ${r.fields.ano}. (Correlação histórica em arquivo.)`,
  },
  categoria_objeto: {
    label: "categoria_objeto",
    hint: (r) => `CATEGORIA: ${r.fields.categoria}.`,
  },
  missao_origem: {
    label: "missao_origem",
    hint: (r) => `MISSÃO DE ORIGEM: ${r.fields.missao}.`,
  },
  help: {
    label: "help",
    hint: () =>
      "COMANDOS DISPONÍVEIS: peso_objeto · altura_objeto · ano_perda · categoria_objeto · missao_origem · scan · status · clear",
  },
  scan: {
    label: "scan",
    hint: () => "Varredura do setor ativa. Selecione um objetivo para focar.",
  },
  status: {
    label: "status",
    hint: (r, st) =>
      `MISSÃO ATUAL: ${st.missionIndex + 1}. LOCAL: ${st.location === "espaco" ? "Espaço" : st.location}. CATALOGADOS: ${st.cataloged.length}. INTEGRIDADE: ${st.lives}.`,
  },
  jean_rs: {
    label: "easterEgg",
    hint: (r) => r.coordenadas ? `COORDENADA DO OBJETO: LAT ${formatLat(r.coordenadas.lat)} · LON ${formatLon(r.coordenadas.lon)}` : `DISTÂNCIA DO OBJETO: ${r.distanciaUA} UA`,
  },

  leo_marq: {
    label: "easterEgg",
    hint: () => `Não se pode confiar em tudo que é falado.`,
  },

  nay: {
    label: "easterEgg",
    hint: () => ":)",
  },

  caio: {
    label: "easterEgg",
    hint: () => "Vamos pegar a nave da Xuxa e voar pelo espaço!",
  },

  luis: {
    label: "easterEgg",
    hint: () => "O motor ta fazendo um barulho estranho...",
  },

  gabriel: {
    label: "easterEgg",
    hint: () => "Durma bem...",
  },
};

// Os objetos de cada missão NÃO ficam aqui: são sorteados em main.js (pickMissionRelics).
// requiredCount = quantos objetos a missão pede.
// Regra do sorteio: missão com 2+ objetos garante ao menos um de cada local, e nenhum objeto se repete.
export const MISSIONS = [
  {
    id: 1,
    title: "Missão 01",
    requiredCount: 1,
    intro: [
      "Olá, Alex! Que bom que despertou.",
      "Você tem uma missão, e designamos Neil como seu assistente.",
      "O objetivo de vocês será localizar e resgatar objetos perdidos no espaço.",
      "Siga o manual de instruções, comunique-se com seu assistente e encontre as coordenadas dos objetos.",
      "Esta primeira missão será um treinamento. Conclua-a para receber as próximas instruções.",
    ],
    outro: [
      "Primeiro contato confirmado. O arquivo começa a se recompor.",
      "Preparando próxima missão...",
    ],
  },
  {
    id: 2,
    title: "Missão 02",
    requiredCount: 3,
    intro: [
      "Parabéns! Vocês concluíram a primeira missão!",
      "Mas estamos apenas no começo desta aventura espacial.",
      "Nesta próxima etapa, vocês encontrarão múltiplos objetos perdidos.",
      "Analisem as decisões e concluam a próxima etapa da forma mais eficiente possível.",
      "Para isso, consultem a seção 'Eficiência' no manual de instruções.",
    ],
    outro: [
      "Três assinaturas recuperadas. O vazio devolve o que foi esquecido.",
      "Iniciando varredura de longo alcance...",
    ],
  },
  {
    id: 3,
    title: "Missão 03",
    requiredCount: 5,
    intro: [
      "Os sinais ficaram mais fortes e mais numerosos.",
      "Catalogue 5 objetos. A nave vai saltar entre a Lua e Marte conforme os alvos.",
      "Sua XP volta ao máximo a cada missão. Use bem as dicas.",
    ],
    outro: [
      "Ecos silenciados. O arquivo se aproxima da integridade.",
      "Recalibrando sensores...",
    ],
  },
  {
    id: 4,
    title: "Missão 04",
    requiredCount: 5,
    intro: [
      "Há interferência nos registros.",
      "Algo no arquivo parece reconhecer você.",
      "Catalogue 5 objetos e siga em frente.",
    ],
    outro: [
      "Os sinais se alinharam.",
      "Falta pouco para o Arquivo Central responder.",
    ],
  },
  {
    id: 5,
    title: "Missão 05",
    requiredCount: 5,
    intro: [
      "Última varredura.",
      "Catalogue 6 objetos para restaurar o Arquivo Central.",
      "Tudo o que você recuperou aponta para uma verdade que ainda não compreende.",
    ],
    outro: [
      "Arquivo Central restaurado.",
      "LUNA-07 não é o nome de um astronauta.",
      "É o modelo de uma inteligência artificial treinada pela L.O.G. para reconhecer vestígios humanos.",
      "A missão, a nave e a solidão eram uma simulação.",
      "Você nunca esteve perdido no espaço — estava aprendendo o que significa ser humano.",
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

const pick = (value, buckets) => buckets.find(([max]) => value < max)[1];

const WEIGHT_BUCKETS = [
  [0.5, "menos de 500 g"],
  [5, "entre 500 g e 5 kg"],
  [50, "entre 5 kg e 50 kg"],
  [500, "entre 50 kg e 500 kg"],
  [Infinity, "mais de 500 kg"],
];

const HEIGHT_BUCKETS = [
  [0.3, "menos de 30 cm"],
  [1, "entre 30 cm e 1 m"],
  [2.5, "entre 1 m e 2,5 m"],
  [Infinity, "mais de 2,5 m"],
];

// Versão difícil de cada dica: só uma faixa ou uma pista parcial, nunca o valor exato.
export const HARD_HINTS = {
  peso_objeto: (r) =>
    r.weightKg == null ? "PESO: dado não encontrado nos registros da NASA." : `PESO: ${pick(r.weightKg, WEIGHT_BUCKETS)}.`,
  altura_objeto: (r) =>
    r.heightM == null ? "ALTURA: dado não encontrado nos registros da NASA." : `ALTURA: ${pick(r.heightM, HEIGHT_BUCKETS)}.`,
  ano_perda: (r) => `ANO DA PERDA: década de ${Math.floor(Number(r.fields.ano) / 10) * 10}.`,
  categoria_objeto: (r) =>
    `CATEGORIA: começa com "${r.fields.categoria[0].toUpperCase()}" e tem ${r.fields.categoria.length} letras.`,
  missao_origem: (r) => {
    const programa = r.fields.missao.replace(/\s*\d+\s*$/, "");
    return programa !== r.fields.missao
      ? `MISSÃO DE ORIGEM: programa ${programa} (número da missão omitido).`
      : `MISSÃO DE ORIGEM: nome começa com "${programa[0].toUpperCase()}" e tem ${programa.length} letras.`;
  },
};
export const MAX_LIVES = 3;
export const WARP_DURATION_MS = 4000; // salto entre locais (espaço, Lua, Marte)
export const LOCAL_HOP_MS = 1600; // deslocamento dentro do mesmo local
export const TYPEWRITER_DELAY_MS = 22;
// Relatórios da L.O.G. (um por checkpoint: a cada 3 objetos catalogados no total).
// A cada checkpoint a nave mostra um warning vermelho com `errorCode` (ex.: ERRO-3000).
// O Jogador 2 procura a carta coringa desse erro e lê o `code` (código de sincronização)
// escrito nela; o Jogador 1 digita esse código no terminal e o relatório abre no vidro.
// Os erros seguem a ordem da história (1, 2, 3...). Ajuste os `errorCode` para bater com as cartas.
export const CHECKPOINT_EVERY = 3;
export const REPORTS = [
  {
    code: "L.O.G.-0317",
    errorCode: "ERRO-3000",
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
    code: "L.O.G.-2207",
    errorCode: "ERRO-6203",
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
    code: "L.O.G.-0919",
    errorCode: "ERRO-4417",
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
    code: "L.O.G.-4081",
    errorCode: "ERRO-5190",
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
    code: "L.O.G.-1166",
    errorCode: "ERRO-7742",
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
    code: "L.O.G.-7302",
    errorCode: "ERRO-9068",
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