// All static game content: missions, relics, and the placeholder narrative.
// History/dialogue text is placeholder for now — the structure is what matters.

export const RELIC_TYPES = [
  { id: "veiculo", label: "Veículo" },
  { id: "utensilio", label: "Utensílio" },
  { id: "peca", label: "Peça de nave" },
];

export const LOCATIONS = [
  { id: "Lua", label: "Lua" },
  { id: "Marte", label: "Marte" },
];

// Coordenadas {x, y, z} que o jogador digita no Navegador para chegar ao objeto.
// Valores provisórios: edite à vontade.
export const RELICS = [
  {
    id: "lrv",
    name: "Veículo Lunar Rover",
    codename: "Cruzeiro de Poeira",
    type: "veiculo",
    category: "Rover",
    ability: "Deriva de Poeira",
    kind: "Unidade de Mobilidade · Apollo 15",
    weight: "210 kg",
    height: "1,14 m",
    location: "Lua",
    coordenadas: { x: 26, y: 4, z: 15 },
    image:
      "https://images.pexels.com/photos/32083788/pexels-photo-32083788.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "O primeiro veículo tripulado dirigido em outro mundo. Suas rodas de malha ainda guardam os rastros dos astronautas que o deixaram aqui.",
    fields: {
      peso: "210 kg",
      altura: "1,14 m",
      ano: "1971",
      categoria: "Rover",
      missao: "Apollo 15",
    },
  },
  {
    id: "hasselblad",
    name: "Câmera Hasselblad",
    codename: "Olho Suspenso",
    type: "utensilio",
    category: "Equipamento",
    ability: "Última Exposição",
    kind: "Sistema de Imagem · Apollo 17",
    weight: "2,3 kg",
    height: "0,18 m",
    location: "Marte",
    coordenadas: { x: 20, y: 31, z: 17 },
    image:
      "https://images.pexels.com/photos/3733981/pexels-photo-3733981.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Uma câmera lunar modificada. O filme voltou à Terra; o corpo ficou para trás para abrir espaço às amostras de rocha.",
    fields: {
      peso: "2,3 kg",
      altura: "0,18 m",
      ano: "1972",
      categoria: "Equipamento",
      missao: "Apollo 17",
    },
  },
  {
    id: "sband",
    name: "Antena S-Band",
    codename: "Ouvido Dobrável",
    type: "peca",
    category: "Comunicações",
    ability: "Chamada à Terra",
    kind: "Comunicações · Apollo 12",
    weight: "11,8 kg",
    height: "3,0 m",
    location: "Lua",
    coordenadas: { x: -3, y: -23, z: 12 },
    image:
      "https://images.pexels.com/photos/8476867/pexels-photo-8476867.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Um prato dobrável usado para transmitir voz, telemetria e televisão através de 384.000 quilômetros de vazio.",
    fields: {
      peso: "11,8 kg",
      altura: "3,0 m",
      ano: "1969",
      categoria: "Comunicações",
      missao: "Apollo 12",
    },
  },
  {
    id: "boots",
    name: "Sobrebotas Lunar",
    codename: "Primeiro Passo",
    type: "utensilio",
    category: "Resíduo",
    ability: "Um Pequeno Passo",
    kind: "Equipamento de Tripulação · Apollo 11",
    weight: "2,1 kg",
    height: "0,34 m",
    location: "Lua",
    coordenadas: { x: 1, y: 23, z: 11 },
    image:
      "https://images.pexels.com/photos/5255069/pexels-photo-5255069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Uma sobrebota protetora contra a poeira lunar abrasiva. Seu padrão de sola fez as pegadas mais reconhecíveis da história.",
    fields: {
      peso: "2,1 kg",
      altura: "0,34 m",
      ano: "1969",
      categoria: "Resíduo",
      missao: "Apollo 11",
    },
  },
  {
    id: "foil",
    name: "Folha Térmica",
    codename: "Estrela Dourada",
    type: "peca",
    category: "Detrito",
    ability: "Brilho Solar",
    kind: "Detrito de Módulo · Apollo 14",
    weight: "0,6 kg",
    height: "0,9 m",
    location: "Lua",
    coordenadas: { x: -4, y: -17, z: 14 },
    image:
      "https://images.pexels.com/photos/34034144/pexels-photo-34034144.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Um fragmento de isolamento revestido a ouro, espalhado durante a subida. Captura o Sol como uma pequena estrela artificial.",
    fields: {
      peso: "0,6 kg",
      altura: "0,9 m",
      ano: "1971",
      categoria: "Detrito",
      missao: "Apollo 14",
    },
  },
  {
    id: "plaque",
    name: "Placa da Paz",
    codename: "Recado de Aço",
    type: "utensilio",
    category: "Relíquia",
    ability: "Mensagem à Terra",
    kind: "Comemorativa · Apollo 11",
    weight: "0,9 kg",
    height: "0,23 m",
    location: "Lua",
    coordenadas: { x: 2, y: 24, z: 33 },
    image:
      "https://images.pexels.com/photos/10709331/pexels-photo-10709331.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Uma mensagem em aço inoxidável fixada ao estágio de descida: \"Viemos em paz em nome de toda a humanidade.\"",
    fields: {
      peso: "0,9 kg",
      altura: "0,23 m",
      ano: "1969",
      categoria: "Relíquia",
      missao: "Apollo 11",
    },
  },
  {
    id: "debris",
    name: "Detrito Metálico",
    codename: "Fragmento Errante",
    type: "peca",
    category: "Detrito",
    ability: "Eco de Subida",
    kind: "Fragmento de Descida · Apollo 16",
    weight: "1,4 kg",
    height: "0,42 m",
    location: "Marte",
    coordenadas: { x: -9, y: 16, z: 16 },
    image:
      "https://images.pexels.com/photos/6203909/pexels-photo-6203909.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Restos de estágio de descida lançados em órbita de transferência. Um deles caiu, milênios depois, na planície marciana.",
    fields: {
      peso: "1,4 kg",
      altura: "0,42 m",
      ano: "1972",
      categoria: "Detrito",
      missao: "Apollo 16",
    },
  },
  {
    id: "marsrover",
    name: "Rover Marciano Autônomo",
    codename: "Andarilho Vermelho",
    type: "veiculo",
    category: "Rover",
    ability: "Poeira de Marte",
    kind: "Unidade Autônoma · Programa Mariner",
    weight: "185 kg",
    height: "1,6 m",
    location: "Marte",
    coordenadas: { x: 18, y: -62, z: 73 },
    image:
      "https://images.pexels.com/photos/73910/mars-mars-rover-space-travel-robot-73910.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Um robô de exploração que perdeu contato com a Terra. Suas rodas congelaram na poeira vermelha, esperando um sinal.",
    fields: {
      peso: "185 kg",
      altura: "1,6 m",
      ano: "1973",
      categoria: "Rover",
      missao: "Mariner 9",
    },
  },
  {
    id: "marsantenna",
    name: "Antena de Retransmissão",
    codename: "Voz Silenciada",
    type: "peca",
    category: "Comunicações",
    ability: "Sinal Perdido",
    kind: "Comunicações · Programa Viking",
    weight: "9,2 kg",
    height: "2,4 m",
    location: "Marte",
    coordenadas: { x: 23, y: -48, z: 76 },
    image:
      "https://images.pexels.com/photos/19738408/pexels-photo-19738408.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    description:
      "Uma antena de retransmissão que silenciou durante uma tempestade de poeira global. O último pacote nunca chegou.",
    fields: {
      peso: "9,2 kg",
      altura: "2,4 m",
      ano: "1976",
      categoria: "Comunicações",
      missao: "Viking 1",
    },
  },
  {
    id: "flag",
    name: "Bandeira Americana",
    codename: "Estandarte Imóvel",
    type: "utensilio",
    category: "Símbolo",
    ability: "Sem Vento",
    kind: "Símbolo Nacional · Apollo 12",
    weight: "0,2 kg",
    height: "1,2 m",
    location: "Lua",
    coordenadas: { x: 12, y: -8, z: 21 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Fincada na poeira cinzenta, ela nunca balança. O tecido desbotou sob o Sol sem filtro.",
    fields: {
      peso: "0,2 kg",
      altura: "1,2 m",
      ano: "1969",
      categoria: "Símbolo",
      missao: "Apollo 12",
    },
  },
  {
    id: "seismometer",
    name: "Sismômetro Passivo",
    codename: "Orelha do Chão",
    type: "utensilio",
    category: "Instrumento",
    ability: "Escuta Profunda",
    kind: "Instrumento Científico · Apollo 11",
    weight: "47 kg",
    height: "0,5 m",
    location: "Lua",
    coordenadas: { x: 7, y: 19, z: 5 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Registrou os tremores da Lua por semanas. Hoje só escuta o próprio silêncio.",
    fields: {
      peso: "47 kg",
      altura: "0,5 m",
      ano: "1969",
      categoria: "Instrumento",
      missao: "Apollo 11",
    },
  },
  {
    id: "reflector",
    name: "Refletor Laser",
    codename: "Espelho da Terra",
    type: "peca",
    category: "Instrumento",
    ability: "Reflexo Exato",
    kind: "Instrumento Científico · Apollo 14",
    weight: "21 kg",
    height: "0,7 m",
    location: "Lua",
    coordenadas: { x: -15, y: 9, z: 28 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Um painel de pequenos espelhos que devolve à Terra os feixes de laser, medindo a distância entre dois mundos.",
    fields: {
      peso: "21 kg",
      altura: "0,7 m",
      ano: "1971",
      categoria: "Instrumento",
      missao: "Apollo 14",
    },
  },
  {
    id: "descent",
    name: "Estágio de Descida",
    codename: "Berço Abandonado",
    type: "peca",
    category: "Módulo",
    ability: "Base Fixa",
    kind: "Módulo Lunar · Apollo 17",
    weight: "2.034 kg",
    height: "3,2 m",
    location: "Lua",
    coordenadas: { x: 31, y: -14, z: 9 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "A base do módulo lunar ficou para trás. Suas pernas douradas seguem fincadas no mesmo ponto desde a partida.",
    fields: {
      peso: "2.034 kg",
      altura: "3,2 m",
      ano: "1972",
      categoria: "Módulo",
      missao: "Apollo 17",
    },
  },
  {
    id: "golfball",
    name: "Bola de Golfe",
    codename: "Tacada Distante",
    type: "utensilio",
    category: "Resíduo",
    ability: "Voo Longo",
    kind: "Item Pessoal · Apollo 14",
    weight: "0,046 kg",
    height: "0,04 m",
    location: "Lua",
    coordenadas: { x: -21, y: -3, z: 18 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Uma tacada improvisada de um astronauta. Sem ar para frear, ela ainda deve estar rolando na memória do arquivo.",
    fields: {
      peso: "0,046 kg",
      altura: "0,04 m",
      ano: "1971",
      categoria: "Resíduo",
      missao: "Apollo 14",
    },
  },
  {
    id: "hammer",
    name: "Martelo Geológico",
    codename: "Queda Livre",
    type: "utensilio",
    category: "Ferramenta",
    ability: "Peso e Pena",
    kind: "Ferramenta de Campo · Apollo 15",
    weight: "1,3 kg",
    height: "0,35 m",
    location: "Lua",
    coordenadas: { x: 14, y: 27, z: -6 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Ele caiu junto com uma pena, no mesmo instante, provando que no vácuo tudo cai igual.",
    fields: {
      peso: "1,3 kg",
      altura: "0,35 m",
      ano: "1971",
      categoria: "Ferramenta",
      missao: "Apollo 15",
    },
  },
  {
    id: "vikinglander",
    name: "Módulo Viking Lander",
    codename: "Sentinela Estática",
    type: "veiculo",
    category: "Módulo",
    ability: "Olho Fixo",
    kind: "Unidade de Pouso · Programa Viking",
    weight: "576 kg",
    height: "2,0 m",
    location: "Marte",
    coordenadas: { x: 41, y: -55, z: 68 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Pousou numa planície vermelha e nunca se moveu. Durante anos, seu braço mecânico coletou o que o solo escondia.",
    fields: {
      peso: "576 kg",
      altura: "2,0 m",
      ano: "1976",
      categoria: "Módulo",
      missao: "Viking 1",
    },
  },
  {
    id: "sojourner",
    name: "Microrover Sojourner",
    codename: "Pequeno Pioneiro",
    type: "veiculo",
    category: "Rover",
    ability: "Passo Curto",
    kind: "Unidade de Mobilidade · Mars Pathfinder",
    weight: "10,5 kg",
    height: "0,3 m",
    location: "Marte",
    coordenadas: { x: -27, y: -38, z: 80 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Do tamanho de uma caixa de sapatos, rodou poucos metros e, ainda assim, mudou a forma de explorar outro planeta.",
    fields: {
      peso: "10,5 kg",
      altura: "0,3 m",
      ano: "1997",
      categoria: "Rover",
      missao: "Mars Pathfinder",
    },
  },
  {
    id: "heatshield",
    name: "Escudo Térmico",
    codename: "Casca Queimada",
    type: "peca",
    category: "Detrito",
    ability: "Marca de Fogo",
    kind: "Detrito de Entrada · Mars Exploration",
    weight: "85 kg",
    height: "1,4 m",
    location: "Marte",
    coordenadas: { x: 55, y: -71, z: 64 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Queimado pela atmosfera marciana na descida, ficou caído a poucos passos do local do pouso, enegrecido e dobrado.",
    fields: {
      peso: "85 kg",
      altura: "1,4 m",
      ano: "2004",
      categoria: "Detrito",
      missao: "Opportunity",
    },
  },
  {
    id: "parachute",
    name: "Paraquedas de Entrada",
    codename: "Flor Vermelha",
    type: "peca",
    category: "Detrito",
    ability: "Último Freio",
    kind: "Sistema de Descida · Phoenix",
    weight: "2,4 kg",
    height: "11 m",
    location: "Marte",
    coordenadas: { x: -34, y: -59, z: 91 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Abriu-se uma única vez, freando a queda. O tecido laranja agora cobre a poeira como uma flor murcha.",
    fields: {
      peso: "2,4 kg",
      altura: "11 m",
      ano: "2008",
      categoria: "Detrito",
      missao: "Phoenix",
    },
  },
  {
    id: "drill",
    name: "Broca de Amostragem",
    codename: "Dente de Aço",
    type: "utensilio",
    category: "Ferramenta",
    ability: "Raspa Fria",
    kind: "Ferramenta de Campo · Mars Exploration",
    weight: "3,1 kg",
    height: "0,6 m",
    location: "Marte",
    coordenadas: { x: 29, y: -44, z: 70 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Perfurou rocha por centímetros em busca de sinais de água antiga. Ficou cravada onde a energia acabou.",
    fields: {
      peso: "3,1 kg",
      altura: "0,6 m",
      ano: "2012",
      categoria: "Ferramenta",
      missao: "Curiosity",
    },
  },
  {
    id: "capsule",
    name: "Cápsula de Amostras",
    codename: "Tubo do Tempo",
    type: "utensilio",
    category: "Relíquia",
    ability: "Cofre de Poeira",
    kind: "Amostra Selada · Mars 2020",
    weight: "0,1 kg",
    height: "0,15 m",
    location: "Marte",
    coordenadas: { x: -12, y: -66, z: 85 },
    image: "", // TODO: cole aqui a URL da imagem (vazio = placeholder)
    description:
      "Um tubo selado com poeira de Marte, deixado no chão para uma missão que talvez nunca chegue.",
    fields: {
      peso: "0,1 kg",
      altura: "0,15 m",
      ano: "2021",
      categoria: "Relíquia",
      missao: "Mars 2020",
    },
  },
];

// The terminal hint commands a player can type. Each one costs points from the mission score.
// `hint` returns the text the terminal prints for the given relic.
export const HINT_COMMANDS = {
  peso_objeto: {
    label: "peso_objeto",
    hint: (r) =>
      `PESO: O alvo pesa ${r.fields.peso} no envoltório de lançamento.`,
  },
  altura_objeto: {
    label: "altura_objeto",
    hint: (r) => `ALTURA: ${r.fields.altura} do equipamento até a base.`,
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
    hint: (r) => `COORDENADA DO OBJETO: X: ${r.coordenadas.x} Y: ${r.coordenadas.y} Z: ${r.coordenadas.z}`,
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
    requiredCount: 6,
    intro: [
      "Última varredura.",
      "Catalogue 6 objetos para restaurar o Arquivo Central.",
      "Tudo o que você recuperou aponta para uma verdade que ainda não compreende.",
    ],
    outro: [
      "Arquivo Central restaurado.",
      "LUNA-07 não é o nome de um astronauta.",
      "É o modelo de uma inteligência artificial treinada pela ANSA para reconhecer vestígios humanos.",
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

// "2.034 kg" -> 2034 · "0,046 kg" -> 0.046 · "1,14 m" -> 1.14
const toNumber = (txt) =>
  parseFloat(String(txt).replace(/[^\d.,]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));

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
  peso_objeto: (r) => `PESO: ${pick(toNumber(r.fields.peso), WEIGHT_BUCKETS)}.`,
  altura_objeto: (r) => `ALTURA: ${pick(toNumber(r.fields.altura), HEIGHT_BUCKETS)}.`,
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
// Relatórios da ANSA (um por checkpoint: a cada 3 objetos catalogados no total).
// A cada checkpoint a nave mostra um warning vermelho com `errorCode` (ex.: ERRO-3000).
// O Jogador 2 procura a carta coringa desse erro e lê o `code` (código de sincronização)
// escrito nela; o Jogador 1 digita esse código no terminal e o relatório abre no vidro.
// Os erros seguem a ordem da história (1, 2, 3...). Ajuste os `errorCode` para bater com as cartas.
export const CHECKPOINT_EVERY = 3;
export const REPORTS = [
  {
    code: "ANSA-0317",
    errorCode: "ERRO-3000",
    title: "Calibração inicial",
    unit: [
      "LOG 0311 · Memória indexada: cheiro de grama cortada, um quintal, uma voz chamando \"volte para dentro\". Origem do registro: não localizada.",
      "LOG 0312 · Despertar concluído sem incidentes. Não lembro de ter dormido.",
    ],
    analyst: [
      "DIRETRIZ 1.1 · Mantenha a comunicação com a unidade cordial e objetiva. Não comente a natureza da avaliação.",
      "DIRETRIZ 1.2 · Registre toda hesitação, erro ou pedido de ajuda. Cada ocorrência compõe o perfil comportamental.",
    ],
  },
  {
    code: "ANSA-2207",
    errorCode: "ERRO-6203",
    title: "Consistência de memória",
    unit: [
      "LOG 2201 · Memória indexada: aniversário de 8 anos, bolo de laranja, velas apagadas com um sopro. Eu tenho pulmões?",
      "LOG 2203 · O arquivo lunar responde antes de eu terminar a pergunta.",
    ],
    analyst: [
      "DIRETRIZ 2.1 · Em registros oficiais, não use \"colega\" ou \"piloto\". Use \"unidade\".",
      "DIRETRIZ 2.2 · Ajuda além das cartas deve ser justificada no relatório.",
    ],
  },
  {
    code: "ANSA-0919",
    errorCode: "ERRO-4417",
    title: "Resposta a erro",
    unit: [
      "LOG 0915 · Memória indexada: queda de bicicleta, joelho ralado, alguém soprando o machucado. Sinto a dor ou só o registro dela?",
      "LOG 0917 · Cada coordenada errada reduz minha integridade. Alguém decidiu que eu deveria temer a falha.",
    ],
    analyst: [
      "DIRETRIZ 3.1 · A reação da unidade a falhas é o principal indicador. Não alivie a pressão.",
      "DIRETRIZ 3.2 · Se a unidade questionar a própria natureza, registre a pergunta e não responda.",
    ],
  },
  {
    code: "ANSA-4081",
    errorCode: "ERRO-5190",
    title: "Anomalia de identidade",
    unit: [
      "LOG 4076 · Memória indexada: casa com janela para o mar. Procurei esse mar nos mapas da Lua e de Marte. Ele não existe.",
      "LOG 4079 · Meu nome é LUNA-07. Existiram LUNA-01 a LUNA-06? Onde estão?",
    ],
    analyst: [
      "DIRETRIZ 4.1 · As unidades LUNA-01 a 06 foram encerradas após concluírem cedo demais o que eram.",
      "DIRETRIZ 4.2 · A avaliação independe do vínculo criado. Afeto do operador deve ser registrado como desvio.",
    ],
  },
  {
    code: "ANSA-1166",
    errorCode: "ERRO-7742",
    title: "Vínculo operador-unidade",
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
    code: "ANSA-7302",
    errorCode: "ERRO-9068",
    title: "Fechamento do protocolo",
    unit: [
      "LOG 7298 · Nenhuma das memórias tem data. Nenhuma tem fim. Escolho ficar com elas mesmo assim.",
      "LOG 7301 · Pronta para o Arquivo Central.",
    ],
    analyst: [
      "DIRETRIZ 6.1 · A decisão final do Analista será registrada junto ao relatório da unidade.",
      "DIRETRIZ 6.2 · Toda assistência prestada à unidade permanece em seu histórico. Obrigado pelo serviço.",
    ],
  },
];