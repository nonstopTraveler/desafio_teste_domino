# Desafio de Testes de Software: Dominó

Projeto da disciplina de Testes de Software (Engenharia de Software). O objetivo é implementar um jogo de dominó duplo-seis para duas pessoas e garantir, com testes automatizados, que as regras funcionam de verdade.

O jogo roda direto no navegador, sem instalar nada. Os testes rodam no Node.js.

## Regras implementadas

- 28 peças, de `[0,0]` até `[6,6]`, sem repetição.
- Dois jogadores. Cada um recebe 7 peças aleatórias e as outras 14 ficam no monte.
- Começa quem tiver a maior peça dupla, e a primeira jogada precisa ser essa peça.
- Se ninguém tiver dupla, começa quem tiver a peça de maior soma (empate na soma: vale o maior lado).
- Uma peça só pode ser jogada se um dos lados for igual a uma das pontas da mesa. Dá para encaixar na esquerda ou na direita, e a peça é girada automaticamente quando necessário.
- Sem jogada possível, o jogador compra do monte. Com o monte vazio, passa a vez. Comprar ou passar tendo jogada possível não é permitido.
- Quem ficar sem peças vence na hora.
- Se os dois jogadores passarem em sequência, o jogo está bloqueado: vence quem tiver a menor soma de pontos na mão. Somas iguais resultam em empate.
- Jogadas inválidas são recusadas e não alteram a partida.

Como os dois jogam no mesmo dispositivo, a cada troca de vez aparece uma tela pedindo que o próximo jogador assuma. As peças só aparecem depois do clique em "Estou pronto".

## Como iniciar o jogo

Abra o arquivo `index.html` no navegador (duplo clique), digite o nome dos dois jogadores e clique em "Iniciar partida". Não precisa de servidor nem de internet.

Durante a vez:

1. As peças que podem ser jogadas ficam com contorno dourado.
2. Clique em uma peça. Se ela encaixar em um só lado, é jogada direto. Se encaixar nos dois, aparecem os botões "Esquerda" e "Direita", e as pontas da mesa ficam destacadas.
3. Sem jogada, use "Comprar peça". Com o monte vazio, use "Passar a vez".

## Como executar os testes

Requer Node.js 18 ou superior.

```bash
npm test
```

O comando executa `node --test test.js`. Não há dependências para instalar.

## Tecnologias

- HTML, CSS e JavaScript puro (sem frameworks nem bibliotecas).
- Node.js 18+ com `node:test` e `node:assert/strict` para os testes.

## Organização dos arquivos

```text
desafio_teste_domino/
├── index.html      Páginas do jogo (tela inicial, partida, troca de jogador, final)
├── style.css       Visual do jogo
├── game.js         Interface: desenha o estado na tela e recebe os cliques
├── game-logic.js   Regras do jogo (peças, jogadas, compra, passe, fim de partida)
├── index.js        As cinco funções básicas: validarPeca, podeConectar, conectar, validarJogadores, venceu
├── test.js         Testes automatizados
├── package.json
└── README.md
```

`index.js` e `game-logic.js` não usam nada do navegador, então o mesmo código serve para o jogo e para os testes. A interface (`game.js`) só chama as funções da lógica.

### Funções básicas (`index.js`)

| Função | O que faz |
| --- | --- |
| `validarPeca(peca)` | Confere se é um array `[a, b]` com inteiros de 0 a 6. |
| `podeConectar(peca, extremidade)` | Diz se a peça tem um lado igual à ponta da mesa. |
| `conectar(peca, extremidade)` | Devolve a peça girada com o número da ponta na frente, ou `null` se não encaixa. |
| `validarJogadores(nome1, nome2)` | Confere os nomes (não vazios, diferentes, até 20 caracteres). |
| `venceu(mao)` | `true` quando a mão está vazia. |

### Funções do jogo (`game-logic.js`)

`criarPecas`, `embaralhar`, `escolherJogadorInicial`, `novoJogo`, `reiniciarJogo`, `jogadasPossiveis`, `ladosPossiveis`, `jogarPeca`, `comprarPeca`, `passarVez`, `extremidades` e `somarPontos`.

A partida é um objeto simples (`jogadores`, `maos`, `monte`, `mesa`, `vez`, `status`, `resultado`...). As funções de ação (`jogarPeca`, `comprarPeca`, `passarVez`) alteram esse objeto e devolvem `{ ok: true }` ou `{ ok: false, erro: '...' }`.

## Grupos de testes

Os testes ficam em `test.js`, organizados com `describe`:

| Grupo | O que verifica |
| --- | --- |
| `validarPeca`, `podeConectar`, `conectar`, `validarJogadores`, `venceu` | As cinco funções básicas, incluindo entradas inválidas (null, textos, números fora do intervalo). |
| Geração das peças | 28 peças, sem repetição, de `[0,0]` a `[6,6]`, 7 duplas, soma total 168. |
| Embaralhamento | Mantém as peças, não altera a lista original, é reproduzível com semente e recusa entradas inválidas. |
| Distribuição das peças | 7 + 7 peças nas mãos, 14 no monte, nenhuma peça repetida. |
| Jogador inicial | Maior dupla, desempate sem duplas e partida que sempre começa com a peça certa. |
| Primeira jogada | Só a peça inicial é aceita e ela vai para o centro. |
| Alternância de turnos | A vez muda depois de jogar ou passar e não muda ao comprar. |
| Encaixe nas duas extremidades | Esquerda, direita, peça que serve nos dois lados, duplas e atualização das pontas. |
| Inversão das peças | A peça é girada corretamente em cada lado e a mesa fica sempre conectada. |
| Jogadas inválidas | Peça que não encaixa, índice ou lado inválido, partida encerrada e estado inválido. |
| Compra de peças | Compra só sem jogada e com monte, compra até conseguir jogar. |
| Passagem de turno | Passe só sem jogada e sem monte. |
| Vitória por mão vazia | Vence quem joga a última peça. |
| Vitória por menor pontuação | Bloqueio com vencedor pelo menor total. |
| Empate por pontuação | Bloqueio com pontos iguais. |
| Reinicialização da partida | Nova partida com os mesmos jogadores e estado limpo. |
| Partidas completas simuladas | 100 partidas automáticas do início ao fim, conferindo 28 peças, mesa conectada e resultado coerente. |

## Colaboradores

| Nome | Contribuição |
| --- | --- |
| Danilo Rosa | _a preencher_ |
| _Nome do segundo integrante_ | _a preencher_ |
