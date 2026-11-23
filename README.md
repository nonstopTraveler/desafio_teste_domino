# Desafio Dominó

Jogo de dominó duplo-seis para duas pessoas, desenvolvido na disciplina de Projeto, Implementação e Teste de Software. O foco do projeto é garantir, por meio de testes automatizados, que as regras do jogo funcionam corretamente.

O jogo roda direto no navegador, sem instalação. Os testes rodam no Node.js.

## Colaboradores

| Nome | RA |
|---|---|
| Danilo Antonio Alves Rosa | 24047644-2 |
| Renan Homiak Guimarães | 24000668-2 |

## Regras

**Preparação**
- O jogo tem 28 peças, de `[0,0]` a `[6,6]`, sem repetição.
- Cada jogador recebe 7 peças aleatórias, e as 14 restantes formam o monte.

**Início da partida**
- Começa quem tiver a maior peça dupla, e a primeira jogada deve ser essa peça.
- Se ninguém tiver dupla, começa quem tiver a peça de maior soma. Em caso de empate na soma, vale o maior lado.

**Jogadas**
- Uma peça só pode ser jogada se um de seus lados for igual a uma das pontas da mesa.
- A peça pode ser encaixada na esquerda ou na direita e é girada automaticamente quando necessário.
- Jogadas inválidas são recusadas e não alteram a partida.

**Compra e passe**
- Sem jogada possível, o jogador compra do monte.
- Com o monte vazio, o jogador passa a vez.
- Comprar ou passar tendo jogada possível não é permitido.

**Fim da partida**
- Quem ficar sem peças vence imediatamente.
- Se os dois jogadores passarem em sequência, o jogo está bloqueado: vence quem tiver a menor soma de pontos na mão. Somas iguais resultam em empate.

Como os dois jogam no mesmo dispositivo, a cada troca de vez aparece uma tela pedindo que o próximo jogador assuma. As peças só são exibidas depois do clique em "Estou pronto".

## Como jogar

Abra o arquivo `index.html` no navegador (duplo clique), digite o nome dos dois jogadores e clique em "Iniciar partida". Não é necessário servidor nem internet.

Durante a sua vez:

1. As peças jogáveis aparecem com contorno dourado.
2. Clique em uma peça. Se ela encaixar em apenas um lado, é jogada direto. Se encaixar nos dois, aparecem os botões "Esquerda" e "Direita", e as pontas da mesa ficam destacadas.
3. Sem jogada possível, use "Comprar peça". Com o monte vazio, use "Passar a vez".

## Como executar os testes

Requer Node.js 18 ou superior. Não há dependências para instalar.

```bash
npm test
```

O comando executa `node --test test.js`.

## Tecnologias

- HTML, CSS e JavaScript puro, sem frameworks nem bibliotecas.
- Node.js 18+ com `node:test` e `node:assert/strict` nos testes.

## Estrutura do projeto

```text
desafio_teste_domino/
├── index.html      Telas do jogo (inicial, partida, troca de jogador e final)
├── style.css       Visual do jogo
├── game.js         Interface: desenha o estado na tela e trata os cliques
├── game-logic.js   Regras do jogo (peças, jogadas, compra, passe e fim de partida)
├── index.js        Funções básicas: validarPeca, podeConectar, conectar, validarJogadores, venceu
├── test.js         Testes automatizados
├── package.json
└── README.md
```

`index.js` e `game-logic.js` não dependem do navegador, então o mesmo código serve ao jogo e aos testes. A interface (`game.js`) apenas chama as funções da lógica.

### Funções básicas (`index.js`)

| Função | Descrição |
|---|---|
| `validarPeca(peca)` | Confere se é um array `[a, b]` com inteiros de 0 a 6. |
| `podeConectar(peca, extremidade)` | Indica se a peça tem um lado igual à ponta da mesa. |
| `conectar(peca, extremidade)` | Devolve a peça girada com o número da ponta na frente, ou `null` se não encaixa. |
| `validarJogadores(nome1, nome2)` | Confere os nomes: não vazios, diferentes entre si e com até 20 caracteres. |
| `venceu(mao)` | Retorna `true` quando a mão está vazia. |

### Funções do jogo (`game-logic.js`)

`criarPecas`, `embaralhar`, `escolherJogadorInicial`, `novoJogo`, `reiniciarJogo`, `jogadasPossiveis`, `ladosPossiveis`, `jogarPeca`, `comprarPeca`, `passarVez`, `extremidades` e `somarPontos`.

A partida é representada por um objeto simples (`jogadores`, `maos`, `monte`, `mesa`, `vez`, `status`, `resultado`, entre outros). As funções de ação (`jogarPeca`, `comprarPeca` e `passarVez`) alteram esse objeto e retornam `{ ok: true }` ou `{ ok: false, erro: '...' }`.

## Testes

Os testes ficam em `test.js` e são organizados em grupos com `describe`:

| Grupo | O que verifica |
|---|---|
| Funções básicas (`validarPeca`, `podeConectar`, `conectar`, `validarJogadores`, `venceu`) | Comportamento esperado e entradas inválidas (null, textos, números fora do intervalo). |
| Geração das peças | 28 peças únicas, de `[0,0]` a `[6,6]`, com 7 duplas e soma total 168. |
| Embaralhamento | Mantém as peças, preserva a lista original, é reproduzível com semente e recusa entradas inválidas. |
| Distribuição das peças | 7 peças em cada mão, 14 no monte e nenhuma repetição. |
| Jogador inicial | Maior dupla, desempate sem duplas e partida que sempre começa com a peça certa. |
| Primeira jogada | Apenas a peça inicial é aceita e ela vai para o centro. |
| Alternância de turnos | A vez muda após jogar ou passar e não muda ao comprar. |
| Encaixe nas duas extremidades | Esquerda, direita, peça que serve nos dois lados, duplas e atualização das pontas. |
| Inversão das peças | Giro correto em cada lado, com a mesa sempre conectada. |
| Jogadas inválidas | Peça que não encaixa, índice ou lado inválido, partida encerrada e estado inválido. |
| Compra de peças | Só é permitida sem jogada e com monte; compra até conseguir jogar. |
| Passagem de turno | Só é permitida sem jogada e sem monte. |
| Vitória por mão vazia | Vence quem joga a última peça. |
| Vitória por menor pontuação | Bloqueio com vencedor pelo menor total. |
| Empate por pontuação | Bloqueio com pontos iguais. |
| Reinicialização da partida | Nova partida com os mesmos jogadores e estado limpo. |
| Partidas completas simuladas | 100 partidas automáticas do início ao fim, conferindo 28 peças, mesa conectada e resultado coerente. |
