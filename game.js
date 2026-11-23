// Parte visual do jogo: lê o estado de game-logic.js e desenha na tela.
// Toda regra do jogo fica no game-logic.js; aqui só mostramos e recebemos cliques.

let estado = null; // a partida atual
let selecionada = null; // índice da peça escolhida quando ela encaixa nos dois lados
let mensagemTela = ''; // mensagem mostrada em cima da mesa

const $ = (id) => document.getElementById(id);

// Posições (0 a 8) dos pontinhos em uma grade 3x3 para cada número.
const PONTOS = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
const PONTOS_6_DEITADO = [0, 1, 2, 6, 7, 8];

function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach((tela) => {
    tela.hidden = tela.id !== id;
  });
}

// ---------- Desenho das peças ----------

function criarMetade(numero, deitada) {
  const metade = document.createElement('div');
  metade.className = 'metade';
  const posicoes = numero === 6 && deitada ? PONTOS_6_DEITADO : PONTOS[numero];
  for (let i = 0; i < 9; i++) {
    const ponto = document.createElement('span');
    if (posicoes.includes(i)) ponto.className = 'ponto';
    metade.appendChild(ponto);
  }
  return metade;
}

// "deitada" = peça na horizontal (usada na mesa). Na mão ela fica em pé.
function criarPeca(peca, deitada) {
  const el = document.createElement('div');
  el.className = 'peca' + (deitada ? ' deitada' : '');
  el.appendChild(criarMetade(peca[0], deitada));
  el.appendChild(criarMetade(peca[1], deitada));
  el.setAttribute('aria-label', `Peça ${peca[0]} e ${peca[1]}`);
  return el;
}

// ---------- Desenho das telas ----------

function desenharPlacar() {
  [0, 1].forEach((i) => {
    const el = $('placar-' + i);
    el.className = 'jogador' + (estado.vez === i ? ' da-vez' : '');
    el.innerHTML = '';
    const nome = document.createElement('strong');
    nome.textContent = estado.jogadores[i];
    const qtd = document.createElement('span');
    qtd.textContent = estado.maos[i].length + (estado.maos[i].length === 1 ? ' peça' : ' peças');
    el.append(nome, qtd);
  });
  $('placar-monte').textContent = `Monte: ${estado.monte.length}`;
}

function desenharMesa(lados) {
  const mesa = $('mesa');
  mesa.innerHTML = '';

  if (estado.mesa.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'mesa-vazia';
    vazio.textContent = `Mesa vazia. Abra a partida com a peça ${textoPeca(estado.pecaInicial)}.`;
    mesa.appendChild(vazio);
    return;
  }

  estado.mesa.forEach((peca, i) => {
    const el = criarPeca(peca, peca[0] !== peca[1]); // duplas ficam em pé
    if (i === 0 && lados.includes('esquerda')) el.classList.add('ponta');
    if (i === estado.mesa.length - 1 && lados.includes('direita')) el.classList.add('ponta');
    mesa.appendChild(el);
  });
}

function desenharMao() {
  const mao = $('mao');
  mao.innerHTML = '';
  $('titulo-mao').textContent = `Mão de ${estado.jogadores[estado.vez]}`;

  estado.maos[estado.vez].forEach((peca, indice) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'peca-botao';
    const jogavel = ladosPossiveis(estado, indice).length > 0;
    if (jogavel) botao.classList.add('jogavel');
    if (indice === selecionada) botao.classList.add('selecionada');
    botao.appendChild(criarPeca(peca, false));
    botao.addEventListener('click', () => clicouNaPeca(indice));
    mao.appendChild(botao);
  });
}

function desenharAcoes() {
  const semJogada = jogadasPossiveis(estado).length === 0;
  $('botao-comprar').disabled = !(semJogada && estado.monte.length > 0);
  $('botao-passar').disabled = !(semJogada && estado.monte.length === 0);

  let dica = '';
  if (!semJogada) dica = 'Escolha uma peça destacada em dourado.';
  else if (estado.monte.length > 0) dica = 'Você não tem jogada. Compre uma peça do monte.';
  else dica = 'Você não tem jogada e o monte acabou. Passe a vez.';
  $('dica-acoes').textContent = dica;
}

function desenharJogo() {
  const lados = selecionada === null ? [] : ladosPossiveis(estado, selecionada);
  desenharPlacar();
  $('mensagem').textContent = mensagemTela || estado.mensagem;
  desenharMesa(lados);
  desenharMao();
  desenharAcoes();

  // Botões "esquerda" e "direita" só aparecem se a peça encaixa nos dois lados.
  const escolha = $('escolha-lado');
  escolha.hidden = selecionada === null;
  if (selecionada !== null) {
    const pontas = extremidades(estado.mesa);
    $('botao-esquerda').textContent = `Esquerda (${pontas.esquerda})`;
    $('botao-direita').textContent = `Direita (${pontas.direita})`;
  }
  mostrarTela('tela-jogo');
}

function desenharTransicao() {
  selecionada = null;
  $('transicao-mensagem').textContent = estado.mensagem;
  $('transicao-titulo').textContent = `Vez de ${estado.jogadores[estado.vez]}`;
  mostrarTela('tela-transicao');
}

function desenharFim() {
  const { motivo, vencedor, pontos } = estado.resultado;
  if (vencedor === null) {
    $('fim-titulo').textContent = 'Empate!';
    $('fim-detalhe').textContent = 'O jogo bloqueou e os dois jogadores ficaram com a mesma pontuação.';
  } else {
    $('fim-titulo').textContent = `${estado.jogadores[vencedor]} venceu!`;
    $('fim-detalhe').textContent =
      motivo === 'mao-vazia'
        ? 'Ficou sem peças na mão.'
        : 'O jogo bloqueou e essa pessoa ficou com menos pontos na mão.';
  }
  const lista = $('fim-pontos');
  lista.innerHTML = '';
  estado.jogadores.forEach((nome, i) => {
    const item = document.createElement('li');
    item.textContent = `${nome}: ${pontos[i]} ponto${pontos[i] === 1 ? '' : 's'} na mão`;
    lista.appendChild(item);
  });
  mostrarTela('tela-fim');
}

// ---------- Ações do jogador ----------

// Depois de cada ação, decide qual tela mostrar.
function aposAcao(vezAntes) {
  selecionada = null;
  if (estado.status === 'fim') {
    desenharFim();
  } else if (estado.vez !== vezAntes) {
    mensagemTela = '';
    desenharTransicao(); // troca de jogador: esconde as peças
  } else {
    desenharJogo();
  }
}

function jogar(indice, lado) {
  const vezAntes = estado.vez;
  const r = jogarPeca(estado, indice, lado);
  if (!r.ok) {
    mensagemTela = r.erro;
    desenharJogo();
    return;
  }
  mensagemTela = '';
  aposAcao(vezAntes);
}

function clicouNaPeca(indice) {
  const lados = ladosPossiveis(estado, indice);
  if (lados.length === 0) {
    selecionada = null;
    mensagemTela = 'Essa peça não encaixa nas pontas da mesa.';
    desenharJogo();
  } else if (lados.length === 1) {
    jogar(indice, lados[0]); // só um lugar possível: joga direto
  } else {
    selecionada = selecionada === indice ? null : indice; // dois lugares: usuário escolhe
    mensagemTela = selecionada === null ? '' : 'Essa peça encaixa nos dois lados. Escolha onde colocar.';
    desenharJogo();
  }
}

function comprar() {
  const r = comprarPeca(estado);
  mensagemTela = r.ok ? `Você comprou a peça ${textoPeca(r.peca)}.` : r.erro;
  selecionada = null;
  desenharJogo();
}

function passar() {
  const vezAntes = estado.vez;
  const r = passarVez(estado);
  mensagemTela = r.ok ? '' : r.erro;
  if (r.ok) aposAcao(vezAntes);
  else desenharJogo();
}

function comecarPartida(novo) {
  estado = novo;
  selecionada = null;
  mensagemTela = '';
  desenharTransicao();
}

// ---------- Eventos ----------

$('form-jogadores').addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nome1 = $('nome1').value;
  const nome2 = $('nome2').value;
  const validacao = validarJogadores(nome1, nome2);
  $('erro-nomes').textContent = validacao.valido ? '' : validacao.erro;
  if (validacao.valido) comecarPartida(novoJogo(nome1, nome2));
});

$('botao-pronto').addEventListener('click', desenharJogo);
$('botao-comprar').addEventListener('click', comprar);
$('botao-passar').addEventListener('click', passar);
$('botao-esquerda').addEventListener('click', () => jogar(selecionada, 'esquerda'));
$('botao-direita').addEventListener('click', () => jogar(selecionada, 'direita'));
$('botao-nova').addEventListener('click', () => comecarPartida(reiniciarJogo(estado)));
$('botao-trocar').addEventListener('click', () => {
  estado = null;
  mostrarTela('tela-inicio');
});
