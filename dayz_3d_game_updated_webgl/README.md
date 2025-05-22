# DayZ Browser 3D - Jogo de Sobrevivência em Mundo Aberto

## Descrição
DayZ Browser 3D é um jogo de sobrevivência em mundo aberto desenvolvido com tecnologias web (HTML, CSS e JavaScript) utilizando Three.js para renderização 3D. O jogo apresenta uma cidade abandonada em um cenário pós-apocalíptico, onde o jogador deve sobreviver explorando, coletando recursos, enfrentando zumbis e melhorando suas habilidades.

## Características Principais

- **Mundo 3D Aberto**: Explore uma cidade abandonada com edifícios, ruas, veículos e áreas naturais
- **Jogabilidade em Terceira Pessoa**: Controles estilo GTA com visão em terceira pessoa
- **Veículos**: Encontre, repare e dirija diferentes tipos de veículos (carros, motos, caminhões)
- **Sistema de Armas**: Colete e customize diferentes armas (pistolas, rifles, metralhadoras)
- **Zumbis com IA**: Enfrente zumbis com comportamento inteligente que reagem à sua presença
- **Sistema de Progressão**: Ganhe experiência, suba de nível e melhore suas habilidades
- **Inventário e Coleta**: Colete itens, gerencie seu inventário e utilize recursos para sobreviver
- **Ciclo Dia/Noite**: Sistema dinâmico de iluminação com ciclo dia/noite
- **Interface Responsiva**: HUD moderno e interface adaptável para diferentes dispositivos

## Requisitos Técnicos

- Navegador moderno com suporte a WebGL (Chrome, Firefox, Edge, Safari)
- Conexão com a internet para carregar recursos
- Teclado e mouse para controles (suporte a touch em dispositivos móveis)
- Recomendado: GPU dedicada para melhor desempenho

## Como Jogar

1. Extraia o arquivo ZIP em uma pasta local
2. Abra o arquivo `index.html` em um navegador moderno
3. Alternativamente, hospede os arquivos em um servidor web

### Controles

- **WASD**: Movimento do personagem
- **Mouse**: Controle da câmera
- **Shift**: Correr
- **Espaço**: Pular
- **E**: Interagir com objetos/veículos
- **R**: Recarregar arma
- **F**: Lanterna
- **I**: Abrir inventário
- **K**: Abrir menu de habilidades
- **ESC**: Menu de pausa

### Objetivos

- Sobreviva o máximo de tempo possível
- Colete recursos e melhore seu equipamento
- Elimine zumbis e ganhe experiência
- Explore a cidade em busca de itens raros
- Repare veículos para facilitar a exploração

## Estrutura do Projeto

- `/index.html`: Arquivo principal do jogo
- `/css/`: Arquivos de estilo
- `/js/`: Scripts JavaScript do jogo
  - `/js/game.js`: Classe principal do jogo
  - `/js/player.js`: Controle do jogador
  - `/js/world.js`: Geração do mundo
  - `/js/vehicles.js`: Sistema de veículos
  - `/js/items.js`: Sistema de itens e inventário
  - `/js/weapons.js`: Sistema de armas
  - `/js/zombies.js`: IA dos zumbis
  - `/js/progression.js`: Sistema de progressão
  - `/js/ui.js`: Interface do usuário
- `/models/`: Modelos 3D (quando aplicável)
- `/textures/`: Texturas e imagens
- `/audio/`: Arquivos de áudio

## Desenvolvimento

Este jogo foi desenvolvido utilizando:
- Three.js para renderização 3D
- JavaScript puro para lógica do jogo
- HTML5 e CSS3 para interface
- Técnicas de otimização para desempenho em navegadores

## Créditos

Desenvolvido como projeto de demonstração de um jogo 3D estilo GTA com temática de sobrevivência em navegador.

---

Divirta-se explorando e sobrevivendo no mundo pós-apocalíptico de DayZ Browser 3D!
