/* =========================================================
   L.O.G · DECK VIRTUAL — DADOS
   ---------------------------------------------------------
   Aqui ficam TODAS as cartas (mesma ordem do PDF de impressão)
   e todos os textos em português e inglês.

   Para corrigir um dado de uma carta, edite só este arquivo.
   Números usam ponto (3.2); o deck troca por vírgula em PT.
   ========================================================= */

window.DADOS = (() => {

    /* ---------- textos que mudam de idioma ---------- */
    const T = {
        pt: {
            categorias: ['ROVERS E VEÍCULOS', 'POUSADORES', 'SONDAS E TELESCÓPIOS', 'PEDAÇOS DE NAVE E ENTULHO', 'OBJETOS'],
            locais: ['LUA', 'MARTE', 'ESPAÇO'],
            energia: { bat: 'BATERIA', nuc: 'NUCLEAR', sol: 'SOLAR', nen: 'NENHUMA' },
            nd: 'N/D',
            rot: {
                categoria: 'CATEGORIA', missao: 'MISSÃO', local: 'LOCAL',
                tamanho: 'TAMANHO', peso: 'PESO', posicao: 'LOCALIZAÇÃO',
                partiu: 'PARTIU EM', perdido: 'PERDIDO EM', energia: 'ENERGIA',
                curiosidade: 'CURIOSIDADE'
            },
            leste: 'L',
            norte: 'N',
            manual: {
                protocolos: {
                    titulo: 'PROTOCOLOS', sub: 'PARA SINCRONIZAÇÃO',
                    cab: ['PROTOCOLO', 'SENHA']
                },
                categorias: {
                    titulo: 'AS CATEGORIAS', sub: 'MANUAL · 1 DE 2',
                    cartas: 'CARTAS',
                    itens: [
                        ['Exploradores que se moveram sozinhos:', 'rodaram pelo chão ou voaram.', 'Ex.: rovers de seis rodas e um helicóptero.'],
                        ['Naves que desceram até o chão e ficaram', 'paradas, fazendo ciência em um só lugar.', 'Ex.: estações com pernas, um braço e um sismógrafo.'],
                        ['Naves que viajaram pelo espaço estudando', 'planetas, asteroides e estrelas.', 'Ex.: um telescópio e sondas que deixaram o Sistema Solar.'],
                        ['Peças que se soltaram ou foram deixadas para', 'trás pelo caminho, na Lua e em Marte.', 'Ex.: estágios de módulos lunares e um escudo térmico.'],
                        ['Coisas que os astronautas deixaram na Lua', 'de propósito: homenagens e experimentos.', 'Ex.: uma bandeira, placas e pacotes científicos.']
                    ]
                },
                comoler: {
                    titulo: 'COMO LER AS CARTAS', sub: 'MANUAL · 2 DE 2',
                    itens: [
                        ['MISSÃO', ['O nome da missão que levou o objeto', 'ao espaço. Uma missão pode deixar', 'mais de um objeto para trás.']],
                        ['LOCAL', ['Onde o objeto está hoje: na Lua,', 'em Marte ou solto no espaço.', 'Só uma das três luzes acende.']],
                        ['NÚMEROS', ['Seis dados da NASA: tamanho, peso,', 'localização, o ano em que partiu,', 'o ano em que foi perdido e a energia.']],
                        ['CURIOSIDADE', ['O próprio objeto conta um pedaço', 'da sua história, sem dizer o nome.', 'É a melhor pista para descobrir quem é.']]
                    ],
                    jogoRot: 'NO JOGO',
                    jogo: ['O Neil, seu assistente, envia as pistas. Compare', 'as pistas com os dados da carta e encontre o objeto certo.']
                }
            }
        },
        en: {
            categorias: ['ROVERS AND VEHICLES', 'LANDERS', 'PROBES AND TELESCOPES', 'SPACECRAFT PARTS AND DEBRIS', 'OBJECTS'],
            locais: ['MOON', 'MARS', 'SPACE'],
            energia: { bat: 'BATTERY', nuc: 'NUCLEAR', sol: 'SOLAR', nen: 'NONE' },
            nd: 'N/A',
            rot: {
                categoria: 'CATEGORY', missao: 'MISSION', local: 'LOCATION',
                tamanho: 'SIZE', peso: 'WEIGHT', posicao: 'POSITION',
                partiu: 'LAUNCHED', perdido: 'LOST IN', energia: 'POWER',
                curiosidade: 'FUN FACT'
            },
            leste: 'E',
            norte: 'N',
            manual: {
                protocolos: {
                    titulo: 'PROTOCOLS', sub: 'FOR SYNCHRONIZATION',
                    cab: ['PROTOCOL', 'PASSWORD']
                },
                categorias: {
                    titulo: 'THE CATEGORIES', sub: 'MANUAL · 1 OF 2',
                    cartas: 'CARDS',
                    itens: [
                        ['Explorers that moved on their own:', 'they rolled on the ground or flew.', 'Ex.: six-wheeled rovers and a helicopter.'],
                        ['Spacecraft that came down to the ground', 'and stayed put, doing science in one place.', 'Ex.: stations with legs, an arm and a seismograph.'],
                        ['Spacecraft that traveled through space', 'studying planets, asteroids and stars.', 'Ex.: a telescope and probes leaving the Solar System.'],
                        ['Parts that came off or were left behind', 'along the way, on the Moon and on Mars.', 'Ex.: lunar module stages and a heat shield.'],
                        ['Things astronauts left on the Moon', 'on purpose: tributes and experiments.', 'Ex.: a flag, plaques and science packages.']
                    ]
                },
                comoler: {
                    titulo: 'HOW TO READ THE CARDS', sub: 'MANUAL · 2 OF 2',
                    itens: [
                        ['MISSION', ['The name of the mission that took the', 'object into space. One mission can', 'leave more than one object behind.']],
                        ['LOCATION', ['Where the object is today: on the Moon,', 'on Mars or loose in space.', 'Only one of the three lights up.']],
                        ['NUMBERS', ['Six NASA facts: size, weight,', 'position, the year it launched,', 'the year it was lost and its power.']],
                        ['FUN FACT', ['The object itself tells a piece', 'of its story, without saying its name.', 'It is the best clue to find out what it is.']]
                    ],
                    jogoRot: 'IN THE GAME',
                    jogo: ['Neil, your assistant, sends the clues. Compare', 'them with the card data and find the right object.']
                }
            }
        }
    };

    /* ---------- protocolos (iguais nos dois idiomas: são os comandos do terminal) ---------- */
    const PROTOCOLOS = [
        ['1202', 'overflow'],
        ['1201', 'go'],
        ['P66', 'manual'],
        ['CONTACT LIGHT', 'touchdown'],
        ['SCE TO AUX', 'lightning'],
        ['PROX-1', 'relay']
    ];

    /* ---------- as 25 cartas de objeto ----------
       cat:   0 rovers · 1 pousadores · 2 sondas · 3 pedaços de nave · 4 objetos
       local: 0 lua · 1 marte · 2 espaço
       tam / peso: [valor, unidade] ou null (N/D)
       pos:   {lat, lon}  ou  {pt:[linhas], en:[linhas]}
       en:    [tipo, subtexto]   (bat · nuc · sol · nen)
    ---------------------------------------------------------------- */
    const cartas = [
        /* ---- folha 1 ---- */
        {
            id: 'apollo11-descida', cat: 3, local: 0, missao: 'APOLLO 11',
            tam: ['3.2', 'm'], peso: ['2034', 'kg'], pos: { lat: 0.67, lon: 23.47 },
            ini: 1969, fim: 1969, pot: ['bat'],
            texto: {
                pt: 'Depois que meus passageiros foram embora, eu fiquei para trás e servi de plataforma de lançamento para a volta deles. Atrás da minha escada há uma placa dizendo que viemos em paz.',
                en: 'After my passengers left, I stayed behind and served as the launch pad for their trip home. Behind my ladder is a plaque saying we came in peace.'
            }
        },
        {
            id: 'apollo12-alsep', cat: 4, local: 0, missao: 'APOLLO 12',
            tam: ['0.46', 'm'], peso: ['46', 'kg'], pos: { lat: -3.01, lon: -23.42 },
            ini: 1969, fim: 1977, pot: ['nuc', '70 W'],
            texto: {
                pt: 'Dois astronautas me montaram no chão e encaixaram, à mão, a barra de plutônio que me dava energia. Medi tremores, o vento solar e o campo magnético por quase oito anos.',
                en: 'Two astronauts set me up on the ground and fitted, by hand, the plutonium rod that powered me. I measured quakes, the solar wind and the magnetic field for almost eight years.'
            }
        },
        {
            id: 'surveyor3', cat: 1, local: 0, missao: 'SURVEYOR 3',
            tam: ['3', 'm'], peso: ['997.9', 'kg'], pos: { lat: -3.02, lon: -23.42 },
            ini: 1967, fim: 1967, pot: ['sol', '85 W'],
            texto: {
                pt: 'Na descida, rochas brilhantes enganaram meu radar e eu quiquei duas vezes. Dois anos depois, astronautas pousaram a 180 m de mim e levaram pedaços meus de volta para a Terra.',
                en: 'On the way down, bright rocks fooled my radar and I bounced twice. Two years later, astronauts landed 180 m from me and took pieces of me back to Earth.'
            }
        },
        {
            id: 'pathfinder-rover', cat: 0, local: 1, missao: 'MARS PATHFINDER',
            tam: ['30', 'cm'], peso: ['10.6', 'kg'], pos: { lat: 19.33, lon: -33.55 },
            ini: 1996, fim: 1997, pot: ['sol', '16 W'],
            texto: {
                pt: 'Desci por uma rampa e virei o primeiro robô com rodas a explorar este planeta. Meu nome homenageia uma lutadora pelos direitos civis, e enviei 550 imagens das rochas ao meu redor.',
                en: 'I rolled down a ramp and became the first wheeled robot to explore this planet. My name honors a civil rights fighter, and I sent 550 images of the rocks around me.'
            }
        },
        {
            id: 'mer-a', cat: 0, local: 1, missao: 'MER-A',
            tam: ['1.4', 'm'], peso: ['185', 'kg'], pos: { lat: -14.57, lon: 175.48 },
            ini: 2003, fim: 2010, pot: ['sol', '140 W'],
            texto: {
                pt: 'Rodei 7,73 km por uma cratera que talvez já tenha sido um lago, até arrastando uma roda que parou de girar. Em 2009 quebrei uma crosta fina, atolei na areia e nunca mais me mexi.',
                en: 'I drove 7.73 km across a crater that may once have been a lake, even dragging a wheel that stopped turning. In 2009 I broke through a thin crust, got stuck in sand and never moved again.'
            }
        },
        {
            id: 'mer-b-rover', cat: 0, local: 1, missao: 'MER-B',
            tam: ['1.4', 'm'], peso: ['185', 'kg'], pos: { lat: -1.95, lon: -5.53 },
            ini: 2003, fim: 2018, pot: ['sol', '140 W'],
            texto: {
                pt: 'Rodei 45,16 km em mais de 14 anos, um recorde fora da Terra que durou até 2026. Uma tempestade de poeira cobriu o planeta inteiro, escondeu o Sol dos meus painéis e eu fiquei em silêncio.',
                en: 'I drove 45.16 km in more than 14 years, an off-Earth record that lasted until 2026. A dust storm covered the whole planet, hid the Sun from my panels and I went silent.'
            }
        },
        {
            id: 'viking1', cat: 1, local: 1, missao: 'VIKING 1',
            tam: ['2', 'm'], peso: ['572', 'kg'], pos: { lat: 22.48, lon: -47.94 },
            ini: 1975, fim: 1982, pot: ['nuc', '2 × 30 W'],
            texto: {
                pt: 'Enviei a primeira foto tirada do chão deste planeta: ela começou a chegar 25 segundos depois que eu pousei. Com meu braço, peguei solo e o testei dentro de mim, procurando sinais de vida.',
                en: 'I sent the first photo taken from the ground of this planet: it started arriving 25 seconds after I landed. With my arm, I scooped up soil and tested it inside me, looking for signs of life.'
            }
        },
        {
            id: 'viking2', cat: 1, local: 1, missao: 'VIKING 2',
            tam: ['2', 'm'], peso: ['572', 'kg'], pos: { lat: 47.67, lon: 134.28 },
            ini: 1975, fim: 1980, pot: ['nuc', '2 × 30 W'],
            texto: {
                pt: 'Meus motores dispararam de novo uma fração de segundo antes do pouso, e acabei inclinado, com um pé sobre uma rocha. Viajei 333 dias até aqui, dentro de um escudo contra os micróbios da Terra.',
                en: 'My engines fired again a split second before landing, and I ended up tilted, with one foot on a rock. I traveled 333 days to get here, inside a shield against Earth\u2019s microbes.'
            }
        },
        {
            id: 'phoenix', cat: 1, local: 1, missao: 'PHOENIX',
            tam: ['2.2', 'm'], peso: ['350', 'kg'], pos: { lat: 68.15, lon: -125.90 },
            ini: 2007, fim: 2008, pot: ['sol'],
            texto: {
                pt: 'Pousei perto do polo norte e cavei o chão com meu braço para estudar o gelo. No início o Sol nunca se punha; quando o inverno chegou, não havia luz suficiente para os meus painéis.',
                en: 'I landed near the north pole and dug the ground with my arm to study the ice. At first the Sun never set; when winter came, there was not enough light for my panels.'
            }
        },

        /* ---- folha 2 ---- */
        {
            id: 'insight', cat: 1, local: 1, missao: 'INSIGHT',
            tam: ['1.08', 'm'], peso: ['360', 'kg'], pos: { lat: 4.50, lon: 135.62 },
            ini: 2018, fim: 2022, pot: ['sol'],
            texto: {
                pt: 'Vim medir o pulso, a temperatura e os reflexos do planeta por dentro. Coloquei um sismômetro no chão para ouvir os tremores e até gravei o vento soprando nos meus painéis.',
                en: 'I came to measure the planet\u2019s pulse, temperature and reflexes from the inside. I placed a seismometer on the ground to hear the quakes and even recorded the wind blowing on my panels.'
            }
        },
        {
            id: 'mars2020', cat: 0, local: 1, missao: 'MARS 2020',
            tam: ['0.49', 'm'], peso: ['1.8', 'kg'], pos: { lat: 18.50, lon: 77.32 },
            ini: 2020, fim: 2024, pot: ['sol', '350 W'],
            texto: {
                pt: 'Viajei encaixado embaixo de outro robô e fiz o primeiro voo motorizado em outro planeta. Eu devia voar 5 vezes, no máximo; voei 72, até quebrar minhas pás no último pouso.',
                en: 'I traveled tucked under another robot and made the first powered flight on another planet. I was meant to fly 5 times at most; I flew 72, until I broke my blades on the last landing.'
            }
        },
        {
            id: 'dawn', cat: 2, local: 2, missao: 'DAWN',
            tam: ['1.77', 'm'], peso: ['747', 'kg'],
            pos: { pt: ['ÓRBITA DE CERES', '2,64 UA DO SOL'], en: ['CERES ORBIT', '2.64 AU FROM SUN'] },
            ini: 2007, fim: 2018, pot: ['sol', '10.3 kW'],
            texto: {
                pt: 'Usei motores que empurram com xenônio para visitar dois mundos no cinturão de asteroides. Quando meu combustível acabou, continuei girando em torno do segundo, e estou lá até hoje.',
                en: 'I used engines that push with xenon to visit two worlds in the asteroid belt. When I ran out of fuel, I kept circling the second one, and I am still there today.'
            }
        },
        {
            id: 'near', cat: 2, local: 2, missao: 'NEAR',
            tam: ['1.7', 'm'], peso: ['487', 'kg'],
            pos: { pt: ['1,76 UA DO SOL'], en: ['1.76 AU FROM SUN'] },
            ini: 1996, fim: 2001, pot: ['sol', '1800 W'],
            texto: {
                pt: 'Eu não fui feito para pousar, mas desci devagar, a só 6,4 km/h, e enviei dados por mais duas semanas. No caminho, passei a 1.200 km de outro asteroide e fotografei mais da metade dele.',
                en: 'I was not built to land, but I came down slowly, at just 6.4 km/h, and sent data for two more weeks. On the way, I passed 1,200 km from another asteroid and photographed more than half of it.'
            }
        },
        {
            id: 'pioneer10', cat: 2, local: 2, missao: 'PIONEER 10',
            tam: ['6.6', 'm'], peso: ['258', 'kg'],
            pos: { pt: ['142 UA DO SOL', '→ ALDEBARÃ'], en: ['142 AU FROM SUN', '→ ALDEBARAN'] },
            ini: 1972, fim: 2003, pot: ['nuc', '140 W'],
            texto: {
                pt: 'Fui o primeiro a cruzar o cinturão de asteroides e a passar por Júpiter. Levo uma placa com desenhos de um homem, uma mulher e o caminho até a Terra, caso alguém me encontre.',
                en: 'I was the first to cross the asteroid belt and fly past Jupiter. I carry a plaque with drawings of a man, a woman and the way to Earth, in case someone finds me.'
            }
        },
        {
            id: 'pioneer11', cat: 2, local: 2, missao: 'PIONEER 11',
            tam: ['2.9', 'm'], peso: ['259', 'kg'],
            pos: { pt: ['118 UA DO SOL', '→ ÁGUIA'], en: ['118 AU FROM SUN', '→ AQUILA'] },
            ini: 1973, fim: 1995, pot: ['nuc', '144 W'],
            texto: {
                pt: 'Usei a gravidade de Júpiter para mudar de rumo e chegar a Saturno. Fiz a viagem inteira com meu transmissor reserva, girando sem parar a 4,8 voltas por minuto.',
                en: 'I used Jupiter\u2019s gravity to change course and reach Saturn. I worked the whole trip on my backup transmitter, spinning nonstop at 4.8 turns per minute.'
            }
        },
        {
            id: 'kepler', cat: 2, local: 2, missao: 'KEPLER / K2',
            tam: ['4.7', 'm'], peso: ['1052', 'kg'],
            pos: { pt: ['ÓRBITA SOLAR', '1,79 UA DA TERRA'], en: ['SUN ORBIT', '1.79 AU FROM EARTH'] },
            ini: 2009, fim: 2018, pot: ['sol'],
            texto: {
                pt: 'Por anos fiquei olhando estrelas, esperando a luz delas diminuir quando um planeta passava na frente. Quando duas das minhas rodas pararam, passei a me equilibrar com a pressão da luz do Sol.',
                en: 'For years I stared at stars, waiting for their light to dim when a planet passed in front. When two of my wheels stopped, I started balancing with the pressure of sunlight.'
            }
        },
        {
            id: 'pathfinder-lander', cat: 1, local: 1, missao: 'MARS PATHFINDER',
            tam: ['0.9', 'm'], peso: ['463', 'kg'], pos: { lat: 19.33, lon: -33.55 },
            ini: 1996, fim: 1997, pot: ['sol', '35 W'],
            texto: {
                pt: 'Cheguei quicando dentro de airbags e abri três pétalas para soltar um pequeno robô de seis rodas. Depois fotografei o trabalho dele. Meu nome homenageia um famoso astrônomo.',
                en: 'I arrived bouncing inside airbags and opened three petals to release a small six-wheeled robot. Then I photographed its work. My name honors a famous astronomer.'
            }
        },
        {
            id: 'apollo12-subida', cat: 3, local: 0, missao: 'APOLLO 12',
            tam: ['2.8', 'm'], peso: ['2383', 'kg'], pos: { lat: -3.94, lon: -21.20 },
            ini: 1969, fim: 1969, pot: ['bat'],
            texto: {
                pt: 'Levei dois astronautas do chão de volta para a nave em órbita. Depois eles me derrubaram de propósito, e meu impacto causou o primeiro tremor artificial registrado neste mundo.',
                en: 'I carried two astronauts from the ground back to the ship in orbit. Then they crashed me on purpose, and my impact made the first artificial quake recorded on this world.'
            }
        },

        /* ---- folha 3 ---- */
        {
            id: 'apollo15-modulo', cat: 3, local: 0, missao: 'APOLLO 15',
            tam: ['2.8', 'm'], peso: ['2385', 'kg'], pos: { lat: 26.36, lon: 0.25 },
            ini: 1971, fim: 1971, pot: ['bat'],
            texto: {
                pt: 'Fiquei pousado por quase três dias, e um astronauta até ficou de pé na minha escotilha de cima, descrevendo a paisagem. Solto em órbita, caí duas horas depois.',
                en: 'I stayed landed for almost three days, and an astronaut even stood in my top hatch, describing the landscape. Released in orbit, I fell two hours later.'
            }
        },
        {
            id: 'mer-b-escudo', cat: 3, local: 1, missao: 'MER-B',
            tam: ['2.65', 'm'], peso: ['78', 'kg'], pos: { lat: -2.00, lon: -6.00 },
            ini: 2003, fim: 2004, pot: ['nen'],
            texto: {
                pt: 'Freei a descida a 19.300 km/h e, quando não era mais necessário, fui solto e caí sozinho. Quase um ano depois, o robô que protegi voltou para me fotografar: eu estava do avesso.',
                en: 'I braked the descent from 19,300 km/h and, once I was no longer needed, I was dropped and fell on my own. Almost a year later, the robot I protected came back to photograph me: I was inside out.'
            }
        },
        {
            id: 'apollo11-vento-solar', cat: 4, local: 0, missao: 'APOLLO 11',
            tam: ['1.5', 'm'], peso: ['4.3', 'kg'], pos: { lat: 0.87, lon: 23.47 },
            ini: 1969, fim: 1969, pot: ['nen'],
            texto: {
                pt: 'Uma barra no meu topo me mantém aberto, porque aqui não há vento. Viajei preso à escada da nave, dentro de uma capa térmica, e só conseguiram me enfiar de 15 a 23 cm no chão.',
                en: 'A bar along my top keeps me spread out, because there is no wind here. I traveled strapped to the ship\u2019s ladder, in a heat cover, and they could only push me 15 to 23 cm into the ground.'
            }
        },
        {
            id: 'apollo11-sismometro', cat: 4, local: 0, missao: 'APOLLO 11',
            tam: null, peso: ['48', 'kg'], pos: { lat: 0.87, lon: 23.47 },
            ini: 1969, fim: 1969, pot: ['sol', '46 W'],
            texto: {
                pt: 'Fui ligado por comando da Terra enquanto os dois astronautas ainda caminhavam por perto. Meus dois painéis olhavam para leste e oeste, então eu só funcionava durante o dia.',
                en: 'I was switched on by command from Earth while the two astronauts were still walking nearby. My two panels faced east and west, so I only worked during the day.'
            }
        },
        {
            id: 'apollo11-placa', cat: 4, local: 0, missao: 'APOLLO 11',
            tam: ['23', 'cm'], peso: null, pos: { lat: 0.87, lon: 23.47 },
            ini: 1969, fim: 1969, pot: ['nen'],
            texto: {
                pt: 'Sou feita de aço inoxidável e viajei sob uma folha fina do mesmo metal. Só fui descoberta depois que o segundo astronauta desceu, e minhas palavras foram lidas em voz alta para a Terra.',
                en: 'I am made of stainless steel and traveled under a thin sheet of the same metal. I was only uncovered after the second astronaut came down, and my words were read aloud to Earth.'
            }
        },
        {
            id: 'apollo15-astronauta', cat: 4, local: 0, missao: 'APOLLO 15',
            tam: null, peso: null, pos: { lat: 26.13, lon: 3.63 },
            ini: 1971, fim: 1971, pot: ['nen'],
            texto: {
                pt: 'Somos uma pequena figura de alumínio e uma placa com os nomes de 14 exploradores de dois países que morreram antes de chegar aqui. Estamos no chão desde a última caminhada lá fora.',
                en: 'We are a small aluminum figure and a plaque with the names of 14 explorers from two countries who died before getting here. We have been on the ground since the last walk outside.'
            }
        },
        {
            id: 'apollo11-disco', cat: 4, local: 0, missao: 'APOLLO 11',
            tam: null, peso: null, pos: { lat: 0.87, lon: 23.47 },
            ini: 1969, fim: 1969, pot: ['nen'],
            texto: {
                pt: 'Seguro um ramo de oliveira dourado, um emblema e medalhas em homenagem a cinco exploradores, além de um disco de silício com mensagens de paz de 73 países. Fui deixado no chão logo antes da partida.',
                en: 'I hold a gold olive branch, a patch and medals honoring five explorers, plus a silicon disk with peace messages from 73 countries. I was left on the ground just before departure.'
            }
        }
    ];

    /* ---------- as 3 cartas de instrução ---------- */
    const manuais = [
        { id: 'manual-protocolos', tipo: 'protocolos' },
        { id: 'manual-categorias', tipo: 'categorias' },
        { id: 'manual-comoler', tipo: 'comoler' }
    ];

    /* quantas cartas de cada categoria (confere com o manual) */
    const contagem = [0, 0, 0, 0, 0];
    cartas.forEach(c => contagem[c.cat]++);

    return { T, PROTOCOLOS, cartas, manuais, contagem };
})();