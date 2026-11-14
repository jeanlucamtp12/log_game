// All static game content: missions, relics, and the placeholder narrative.
// History/dialogue text is placeholder for now — the structure is what matters.

export const RELICS = [
  {
    id: "lrv",
    name: "Veículo Lunar Rover",
    category: "Rover",
    ability: "Deriva de Poeira",
    type: "Unidade de Mobilidade · Apollo 15",
    weight: "210 kg",
    height: "1,14 m",
    location: "Lua",
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
    category: "Equipamento",
    ability: "Última Exposição",
    type: "Sistema de Imagem · Apollo 17",
    weight: "2,3 kg",
    height: "0,18 m",
    location: "Lua",
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
    category: "Comunicações",
    ability: "Chamada à Terra",
    type: "Comunicações · Apollo 12",
    weight: "11,8 kg",
    height: "3,0 m",
    location: "Lua",
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
    category: "Resíduo",
    ability: "Um Pequeno Passo",
    type: "Equipamento de Tripulação · Apollo 11",
    weight: "2,1 kg",
    height: "0,34 m",
    location: "Lua",
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
    category: "Detrito",
    ability: "Brilho Solar",
    type: "Detrito de Módulo · Apollo 14",
    weight: "0,6 kg",
    height: "0,9 m",
    location: "Lua",
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
    category: "Relíquia",
    ability: "Mensagem à Terra",
    type: "Comemorativa · Apollo 11",
    weight: "0,9 kg",
    height: "0,23 m",
    location: "Lua",
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
    category: "Detrito",
    ability: "Eco de Subida",
    type: "Fragmento de Descida · Apollo 16",
    weight: "1,4 kg",
    height: "0,42 m",
    location: "Marte",
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
    category: "Rover",
    ability: "Poeira de Marte",
    type: "Unidade Autônoma · Programa Mariner",
    weight: "185 kg",
    height: "1,6 m",
    location: "Marte",
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
    category: "Comunicações",
    ability: "Sinal Perdido",
    type: "Comunicações · Programa Viking",
    weight: "9,2 kg",
    height: "2,4 m",
    location: "Marte",
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
];

// The terminal hint commands a player can type. Each costs one hint token.
// `resolve` returns the text the terminal prints for the given relic.
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
      `MISSÃO ATUAL: ${st.missionId}. CATALOGADOS: ${st.cataloged.length}. VIDAS: ${st.lives}.`,
  },
  clear: {
    label: "clear",
    hint: () => "__clear__",
  },
};

export const MISSIONS = [
  {
    id: 1,
    title: "Missão 01 — Primeiro Contato",
    body: "Lua",
    requiredCount: 1,
    relicIds: ["lrv"],
    intro: [
      "Tripulante LUNA-07, você despertou na nave.",
      "O Arquivo Lunar está fragmentado.",
      "Para esta primeira missão, localize e catalogue 1 objeto na superfície lunar.",
      "Abra seus Objetivos, escolha o que procurar, use o Terminal para dicas e confirme a coordenada com seu parceiro de cartas.",
    ],
    outro: [
      "Primeiro contato confirmado. O arquivo começa a se recompor.",
      "Preparando próxima missão...",
    ],
  },
  {
    id: 2,
    title: "Missão 02 — Assinaturas Perdidas",
    body: "Lua",
    requiredCount: 3,
    relicIds: ["hasselblad", "sband", "boots"],
    intro: [
      "Sinais múltiplos detectados no setor.",
      "Agora você precisa catalogar 3 objetos lunares.",
      "Lembre-se: cada dica no Terminal custa um token. Coordene com o operador de cartas.",
    ],
    outro: [
      "Três assinaturas recuperadas. O vazio devolve o que foi esquecido.",
      "Iniciando varredura de longo alcance...",
    ],
  },
  {
    id: 3,
    title: "Missão 03 — Ecos de Marte",
    body: "Marte",
    requiredCount: 3,
    relicIds: ["foil", "plaque", "debris"],
    intro: [
      "A nave ajusta rota para Marte.",
      "Alguns detritos da exploração lunar foram arremessados à superfície marciana.",
      "Catalogue 3 objetos. Marte é maior e mais hostil — use bem seus tokens.",
    ],
    outro: [
      "Ecos de Marte silenciados. O arquivo se aproxima da integridade.",
      "Rota final calibrada...",
    ],
  },
  {
    id: 4,
    title: "Missão 04 — Arquivo Central",
    body: "Marte",
    requiredCount: 2,
    relicIds: ["marsrover", "marsantenna"],
    intro: [
      "Última varredura.",
      "Catalogue os 2 objetos restantes para restaurar o Arquivo Central.",
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

export const HINT_CAPACITY_PER_MISSION = 5;
export const MAX_LIVES = 3;
export const WARP_DURATION_MS = 4000;
export const TYPEWRITER_DELAY_MS = 22;
