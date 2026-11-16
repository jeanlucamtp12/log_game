/* =========================================================
   L.O.G · NAVE (jogo.html) — textos fixos em inglês
   ---------------------------------------------------------
   Script comum, carregado no fim do <body>, antes dos módulos:
   troca o texto fixo do HTML pelo inglês quando o idioma é EN.
   O texto montado pelo main.js é traduzido lá mesmo (função L).
   Chave = texto em português, com espaços normalizados.
   ========================================================= */
(function () {
    'use strict';
    var I = window.LOG_IDIOMA;
    if (!I || I.get() !== 'en') return;

    var EN = {
        // aviso do celular
        'Indisponível no celular': 'Not available on phones',
        'O modo história do Alex (pilotar a nave) ainda não está disponível em telas de celular. Abra no computador para jogar. Enquanto isso, você pode jogar com o deck virtual do Neil.':
            'Alex’s story mode (flying the ship) is not available on phone screens yet. Open the game on a computer to play. Meanwhile, you can play with Neil’s virtual deck.',
        'Abrir o deck do Neil': 'Open Neil’s deck',
        'Voltar ao menu': 'Back to menu',
        'Voltar ao menu (ESC)': 'Back to menu (ESC)',

        // vidro e painéis
        'Visor da nave': 'Ship display',
        'Superfície lunar': 'Lunar surface',
        'Fechar painel': 'Close panel',
        'digite um comando': 'type a command',
        'Voltar para as conversas': 'Back to conversations',
        'Conversas': 'Conversations',
        'Continuar': 'Continue',
        'Tipo': 'Type',
        'Local': 'Location',
        'Ano': 'Year',
        'Ano inicial': 'Start year',
        'Ano final': 'End year',
        'Voltar ao catálogo': 'Back to catalog',

        // manual: abas
        'Seções do manual': 'Manual sections',
        'Instruções Gerais': 'General Instructions',
        'Painel': 'Panel',
        'Eficiência': 'Efficiency',
        'Protocolos': 'Protocols',

        // manual: instruções gerais
        'Seu trabalho': 'Your job',
        'Encontrar objetos perdidos no espaço. Para cada objeto você descobre onde ele está, leva a nave até lá e guarda ele no catálogo.':
            'Find lost objects in space. For each object, you find out where it is, fly the ship there and save it in the catalog.',
        'Encontrar objetos perdidos no espaço. Para cada objeto, obtenha as coordenadas, informe no navegador e registre-o no catálogo.':
            'Find lost objects in space. For each object, get the coordinates, enter them in the Navigator and record it in the catalog.',
        'Observe a Imagem: Descreva a imagem ao seu assistente': 'Look at the Image: Describe the image to your assistant',
        'Peça dicas (se precisar). Abra o Terminal e digite um dos códigos de ajuda (veja a aba Terminal). Cada dica custa XP (veja a aba Eficiência).':
            'Ask for hints (if you need them). Open the Terminal and type one of the help codes (see the Terminal tab). Each hint costs XP (see the Efficiency tab).',
        'Indique as coordenadas. No Navegador, informe as coordenada recebidas do seu assistente.':
            'Enter the coordinates. In the Navigator, type the coordinates you got from your assistant.',
        'Catalogue todos os objetos da missão': 'Catalog all the objects in the mission',
        'Como digitar a coordenada': 'How to type the coordinates',
        'Latitude: digite o número que acompanha N': 'Latitude: type the number that comes with N',
        'Longetude: digite o número que acompanha L': 'Longitude: type the number that comes with E',
        'Atenção:': 'Careful:',
        'errar a coordenada tira 1 ponto de integridade. Se a integridade chegar a zero, a missão recomeça.':
            'a wrong coordinate costs 1 integrity point. If integrity reaches zero, the mission starts over.',

        // manual: terminal (os comandos em inglês valem junto com os em português)
        'Dicas sobre o objeto': 'Hints about the object',
        'Precisam de um objeto escolhido. Cada uma custa XP.': 'You need to choose an object first. Each hint costs XP.',
        'tamanho_objeto': 'object_size',
        'Qual o tamanho aproximado do objeto. (Altura/comprimento).': 'The approximate size of the object (height or length).',
        'peso_objeto': 'object_weight',
        'Qual o peso aproximado do objeto.': 'The approximate weight of the object.',
        'partiu_em': 'launched_in',
        'Quando o objeto saiu da Terra.': 'When the object left Earth.',
        'perdido_em': 'lost_in',
        'Quando o objeto foi perdido.': 'When the object was lost.',
        'energia_objeto': 'object_power',
        'De onde o objeto tira energia.': 'Where the object gets its power.',
        'missao_objeto': 'object_mission',
        'Uma dica do nome da missão que o objeto participou.': 'A clue about the name of the object’s mission.',
        'Comandos Livres': 'Free Commands',
        'Mostra a lista de comandos.': 'Shows the list of commands.',
        'Limpa a tela do terminal.': 'Clears the terminal screen.',

        // manual: painel
        'Dicas Sobre o Objeto': 'Hints About the Object',
        'Missão': 'Mission',
        'Mostra os objetos da missão e deixa você escolher qual procurar.': 'Shows the mission’s objects and lets you choose which one to look for.',
        'Onde você digita comandos para pedir dicas ou resolver erros.': 'Where you type commands to ask for hints or fix errors.',
        'Catálogo': 'Catalog',
        'Os objetos que você já encontrou.': 'The objects you have already found.',
        'Mensagens': 'Messages',
        'Mensagens da L.O.G. O ponto vermelho avisa que tem mensagem nova.': 'Messages from L.O.G. The red dot means there is a new message.',
        'Relatório': 'Report',
        'Relatórios que você liberou ao resolver erros.': 'Reports you unlocked by fixing errors.',
        'Alvo': 'Target',
        'Mostra a imagem do objeto escolhido. Abre sozinho ao escolher o objeto, mas você pode fechar e abrir de novo.':
            'Shows the image of the chosen object. It opens by itself when you choose the object, but you can close it and open it again.',
        'Abre este guia.': 'Opens this guide.',
        'Dados da interface': 'Screen data',
        'Integridade da Nave': 'Ship Integrity',
        'Suas vidas. Cada erro de coordenada tira uma.': 'Your lives. Each wrong coordinate takes one away.',
        'Experiência (XP)': 'Experience (XP)',
        'Seus pontos. Gastar XP com dicas faz a barra descer. Detalhes na aba': 'Your points. Spending XP on hints makes the bar go down. For details, see the tab',
        'Navegador': 'Navigator',
        'Onde você digita a coordenada. Só funciona depois de escolher um objeto.': 'Where you type the coordinates. It only works after you choose an object.',
        'Tempo': 'Time',
        'Quanto tempo a missão está levando.': 'How long the mission is taking.',
        'Luz da cabine': 'Cabin light',
        'Chave ao lado de': 'Switch next to',
        '. Liga e desliga a luz. Só enfeite.': '. It turns the light on and off. Just decoration.',
        'Vidro da nave': 'Ship window',
        'Trinca quando você erra. Só enfeite: volta ao normal com a integridade.': 'It cracks when you make a mistake. Just decoration: it goes back to normal with integrity.',

        // manual: eficiência
        'Dicas gastam XP': 'Hints cost XP',
        'Dica difícil': 'Hard hint',
        'custa 500 XP': 'costs 500 XP',
        'Vale enquanto você tem': 'Used while you have',
        'mais de 2000 XP': 'more than 2000 XP',
        '. A pista é indireta: uma faixa larga, uma época ou outra analogia.': '. The clue is indirect: a wide range, a time period or another comparison.',
        'Dica fácil': 'Easy hint',
        'custa 1000 XP': 'costs 1000 XP',
        'Liberada quando você chega em': 'Unlocked when you reach',
        '2000 XP ou menos': '2000 XP or less',
        '. A pista é mais direta, mas custa o dobro.': '. The clue is more direct, but it costs twice as much.',
        'Quando a dica fácil aparece': 'When the easy hint shows up',
        'Começo.': 'Start.',
        'Com 5000 XP, as dicas são difíceis e baratas.': 'With 5000 XP, hints are hard and cheap.',
        'Faixa laranja.': 'Orange zone.',
        'Depois de 6 dicas difíceis você chega a 2000 XP. A barra de XP fica laranja e as próximas dicas passam a ser fáceis.':
            'After 6 hard hints you reach 2000 XP. The XP bar turns orange and the next hints become easy.',
        'Recuperação.': 'Recovery.',
        'Ao acertar uma coordenada você ganha XP. Estando na faixa laranja, o XP sobe para pelo menos 3000 e as dicas voltam a ser difíceis. Acima dela, soma 1000.':
            'When you get a coordinate right, you earn XP. In the orange zone, XP goes up to at least 3000 and hints become hard again. Above it, you get 1000 more.',
        'Nova missão.': 'New mission.',
        'O XP volta para 5000.': 'XP goes back to 5000.',
        'Dica de ouro:': 'Golden tip:',
        'tente a coordenada com o que você já sabe da carta antes de pedir ajuda. Dica fácil gasta XP rápido e o XP baixo derruba sua patente.':
            'try the coordinates with what you already know from the card before asking for help. Easy hints use up XP fast, and low XP lowers your rank.',
        'Patentes por XP': 'Ranks by XP',
        'Comandante': 'Commander',
        '4500 XP ou mais.': '4500 XP or more.',
        'Piloto': 'Pilot',
        '3500 XP ou mais.': '3500 XP or more.',
        '2500 XP ou mais.': '2500 XP or more.',
        'Cadete': 'Cadet',
        '1500 XP ou mais.': '1500 XP or more.',
        'Recruta': 'Recruit',
        'Menos de 1500 XP.': 'Less than 1500 XP.',

        // manual: protocolos
        'Erros de sincronização': 'Sync errors',
        'Às vezes a nave perde o sinal. Um alerta vermelho aparece com um código, por exemplo': 'Sometimes the ship loses its signal. A red alert appears with a code, for example',
        'ERRO-3000': 'ERROR-3000',
        '. O tempo para e só o': '. Time stops and only the',
        'e o': 'and the',
        'funcionam.': 'work.',
        'Passe a Informação: Informe ao seu assistente o protocolo de erro exibido na tela': 'Pass on the information: Tell your assistant the error protocol shown on the screen',
        'Corrija o erro: Informe no terminal a senha rescebida do seu assistente [Cada erro tem apenas um protocolo e uma senha correspondentes]':
            'Fix the error: Type in the terminal the password you got from your assistant [Each error has only one matching protocol and one password]',
        'Cada erro tem o seu protocolo. Um protocolo de outro erro não funciona.': 'Each error has its own protocol. A protocol from another error does not work.',

        // avisos no vidro
        'Neil · Treinamento': 'Neil · Training',
        'Fechar dica de treinamento': 'Close training tip',
        'Fechar dica': 'Close tip',
        'Computador de navegação': 'Navigation computer',
        'Interferência de sincronização': 'Sync interference',
        'ERRO-0000': 'ERROR-0000',
        'Sinal da L.O.G. instável. Abra o': 'L.O.G. signal unstable. Open the',
        'e procure a aba': 'and find the',
        '. Depois informe o código no': ' tab. Then enter the code in the',
        'Erros de sincronização são mais corriqueiros do que você imagina.': 'Sync errors happen more often than you think.',
        'Objeto encontrado': 'Object found',
        'Varredura concluída': 'Scan complete',
        'Peso': 'Weight',
        'Altura': 'Height',
        'Categoria': 'Category',
        'Catalogar objeto': 'Catalog object',
        'Missão concluída': 'Mission complete',
        'Relatório final': 'Final report',
        'Viagem em velocidade da luz': 'Traveling at light speed',

        // console
        'Apagar a luz da cabine': 'Turn off the cabin light',
        'LUZ': 'LIGHT',
        'MISSÃO ATIVA': 'ACTIVE MISSION',
        'EM ORBITA': 'IN ORBIT',
        '0,67': '0.67',
        '23,47': '23.47',
        'Tipo de coordenada: latitude e longitude. Aperte para usar distância em UA.': 'Coordinate type: latitude and longitude. Press to use distance in AU.',
        'Trocar para distância (UA)': 'Switch to distance (AU)',
        'N/L': 'N/E',
        'Ir': 'Go',
        'Experiência ·': 'Experience ·',

        // fim de jogo e abertura
        'Fim de jogo': 'Game over',
        'Missão falhou': 'Mission failed',
        'Integridade da nave esgotada': 'Ship integrity at zero',
        'A nave perdeu contato com o setor. Os objetos catalogados nesta missão foram perdidos e você volta ao início dela.':
            'The ship lost contact with the sector. The objects cataloged in this mission were lost, and you go back to the start of it.',
        'Recomeçar missão': 'Restart mission',
        'Visor do operador': 'Operator display',
        'iniciando…': 'starting…',
        'Clique para pular': 'Click to skip'
    };

    document.title = 'Debris Archive — Ship';
    I.traduzir(document.body, EN, 'en');
})();
