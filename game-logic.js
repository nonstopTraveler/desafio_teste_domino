// Regras do jogo de dominó (sem nada de tela, só lógica).
// Assim dá para testar tudo no Node e usar o mesmo código no navegador.

// No Node importamos o index.js; no navegador as funções dele já são globais.
const regras = typeof require !== 'undefined' ? require('./index.js') : window;

const PECAS_POR_JOGADOR = 7;

// Cria as 28 peças, de [0,0] até [6,6], sem repetir (ex.: só [2,5], nunca [5,2]).
function criarPecas() {
  const pecas = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      pecas.push([a, b]);
    }
  }
  return pecas;
}

// Embaralha uma cópia da lista (Fisher-Yates). O parâmetro "aleatorio" existe
// para os testes usarem números previsíveis.
function embaralhar(lista, aleatorio = Math.random) {
  if (!Array.isArray(lista)) throw new TypeError('embaralhar espera uma lista.');
  const copia = lista.map((item) => (Array.isArray(item) ? [...item] : item));
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.min(Math.floor(aleatorio() * (i + 1)), i);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Soma dos pontos de uma mão (usada no bloqueio).
function somarPontos(mao) {
  return mao.reduce((total, peca) => total + peca[0] + peca[1], 0);
}

// Quem começa? Quem tiver a maior peça dupla.
// Se ninguém tiver dupla, vale a peça de maior soma (empate na soma: maior lado).
function escolherJogadorInicial(maos) {
  if (!Array.isArray(maos) || maos.every((mao) => !Array.isArray(mao) || mao.length === 0)) {
    throw new Error('É preciso ter peças nas mãos para escolher quem começa.');
  }
  let melhor = null;
  maos.forEach((mao, jogador) => {
    mao.forEach((peca, indice) => {
      const dupla = peca[0] === peca[1];
      const forca = dupla ? 1000 + peca[0] : (peca[0] + peca[1]) * 10 + Math.max(peca[0], peca[1]);
      if (melhor === null || forca > melhor.forca) {
        melhor = { jogador, indice, peca: [...peca], forca };
      }
    });
  });
  return { jogador: melhor.jogador, indice: melhor.indice, peca: melhor.peca };
}

function textoPeca(peca) {
  return `[${peca[0]}|${peca[1]}]`;
}

// Cria uma partida nova: embaralha, distribui 7 peças para cada um e
// deixa as outras 14 no monte.
function novoJogo(nome1, nome2, aleatorio = Math.random) {
  const validacao = regras.validarJogadores(nome1, nome2);
  if (!validacao.valido) throw new Error(validacao.erro);

  const pecas = embaralhar(criarPecas(), aleatorio);
  const maos = [pecas.slice(0, PECAS_POR_JOGADOR), pecas.slice(PECAS_POR_JOGADOR, PECAS_POR_JOGADOR * 2)];
  const monte = pecas.slice(PECAS_POR_JOGADOR * 2);
  const inicio = escolherJogadorInicial(maos);

  return {
    jogadores: validacao.nomes,
    maos,
    monte,
    mesa: [], // cada peça da mesa fica na ordem em que aparece: [esquerda, direita]
    vez: inicio.jogador,
    pecaInicial: inicio.peca,
    passesSeguidos: 0,
    status: 'jogando', // ou 'fim'
    resultado: null, // { motivo: 'mao-vazia' | 'bloqueio', vencedor: 0 | 1 | null, pontos: [a, b] }
    mensagem: `${validacao.nomes[inicio.jogador]} começa com a peça ${textoPeca(inicio.peca)}.`,
  };
}

// Começa outra partida com os mesmos jogadores.
function reiniciarJogo(estado, aleatorio = Math.random) {
  if (!estado || !Array.isArray(estado.jogadores)) throw new Error('Não há partida para reiniciar.');
  return novoJogo(estado.jogadores[0], estado.jogadores[1], aleatorio);
}

// Números das duas pontas da mesa (ou null se a mesa está vazia).
function extremidades(mesa) {
  if (!Array.isArray(mesa) || mesa.length === 0) return null;
  return { esquerda: mesa[0][0], direita: mesa[mesa.length - 1][1] };
}

function estadoValido(estado) {
  return Boolean(estado) && Array.isArray(estado.maos) && Array.isArray(estado.mesa) && Array.isArray(estado.monte);
}

// Lista todas as jogadas permitidas para quem está na vez.
// Cada jogada: { indice (posição na mão), peca, lado: 'esquerda' | 'direita' | 'centro' }
function jogadasPossiveis(estado) {
  if (!estadoValido(estado) || estado.status !== 'jogando') return [];
  const mao = estado.maos[estado.vez];
  const jogadas = [];

  // Primeira jogada: só vale a peça inicial.
  if (estado.mesa.length === 0) {
    mao.forEach((peca, indice) => {
      if (peca[0] === estado.pecaInicial[0] && peca[1] === estado.pecaInicial[1]) {
        jogadas.push({ indice, peca, lado: 'centro' });
      }
    });
    return jogadas;
  }

  const pontas = extremidades(estado.mesa);
  mao.forEach((peca, indice) => {
    if (regras.podeConectar(peca, pontas.esquerda)) jogadas.push({ indice, peca, lado: 'esquerda' });
    if (regras.podeConectar(peca, pontas.direita)) jogadas.push({ indice, peca, lado: 'direita' });
  });
  return jogadas;
}

// Lados onde uma peça específica da mão pode ser colocada.
function ladosPossiveis(estado, indice) {
  return jogadasPossiveis(estado)
    .filter((jogada) => jogada.indice === indice)
    .map((jogada) => jogada.lado);
}

function erro(texto) {
  return { ok: false, erro: texto };
}

function encerrar(estado, motivo) {
  const pontos = estado.maos.map(somarPontos);
  let vencedor;
  if (motivo === 'mao-vazia') {
    vencedor = estado.vez; // quem acabou de jogar a última peça
  } else if (pontos[0] === pontos[1]) {
    vencedor = null; // empate no bloqueio
  } else {
    vencedor = pontos[0] < pontos[1] ? 0 : 1;
  }
  estado.status = 'fim';
  estado.resultado = { motivo, vencedor, pontos };
}

// Joga a peça da posição "indice" da mão no lado escolhido.
function jogarPeca(estado, indice, lado) {
  if (!estadoValido(estado)) return erro('Partida inválida.');
  if (estado.status !== 'jogando') return erro('A partida já terminou.');

  const mao = estado.maos[estado.vez];
  if (!Number.isInteger(indice) || indice < 0 || indice >= mao.length) {
    return erro('Essa peça não existe na sua mão.');
  }

  const jogada = jogadasPossiveis(estado).find(
    (j) => j.indice === indice && (j.lado === 'centro' || j.lado === lado)
  );
  if (!jogada) {
    return erro('Essa peça não encaixa nesse lado da mesa.');
  }

  const nome = estado.jogadores[estado.vez];
  const peca = mao.splice(indice, 1)[0];

  if (jogada.lado === 'centro') {
    estado.mesa.push([...peca]);
  } else if (jogada.lado === 'direita') {
    const pontas = extremidades(estado.mesa);
    estado.mesa.push(regras.conectar(peca, pontas.direita));
  } else {
    // Na esquerda o número que encosta na mesa fica à direita da peça.
    const pontas = extremidades(estado.mesa);
    const girada = regras.conectar(peca, pontas.esquerda);
    estado.mesa.unshift([girada[1], girada[0]]);
  }

  estado.passesSeguidos = 0;
  const onde = jogada.lado === 'centro' ? 'no centro da mesa' : `na ponta ${jogada.lado} da mesa`;
  estado.mensagem = `${nome} jogou ${textoPeca(peca)} ${onde}.`;

  if (regras.venceu(mao)) {
    encerrar(estado, 'mao-vazia');
    estado.mensagem = `${nome} ficou sem peças e venceu!`;
  } else {
    estado.vez = 1 - estado.vez;
  }
  return { ok: true };
}

// Compra a peça do topo do monte. Só é permitido sem jogada possível.
function comprarPeca(estado) {
  if (!estadoValido(estado)) return erro('Partida inválida.');
  if (estado.status !== 'jogando') return erro('A partida já terminou.');
  if (jogadasPossiveis(estado).length > 0) return erro('Você tem uma jogada possível, não pode comprar.');
  if (estado.monte.length === 0) return erro('O monte está vazio.');

  const peca = estado.monte.pop();
  estado.maos[estado.vez].push(peca);
  estado.mensagem = `${estado.jogadores[estado.vez]} comprou uma peça.`;
  return { ok: true, peca };
}

// Passa a vez. Só é permitido sem jogada possível e com o monte vazio.
// Se os dois passarem seguidos, o jogo está bloqueado.
function passarVez(estado) {
  if (!estadoValido(estado)) return erro('Partida inválida.');
  if (estado.status !== 'jogando') return erro('A partida já terminou.');
  if (jogadasPossiveis(estado).length > 0) return erro('Você tem uma jogada possível, não pode passar.');
  if (estado.monte.length > 0) return erro('Compre peças do monte antes de passar.');

  const nome = estado.jogadores[estado.vez];
  estado.passesSeguidos += 1;

  if (estado.passesSeguidos >= 2) {
    encerrar(estado, 'bloqueio');
    estado.mensagem = 'O jogo bloqueou: ninguém consegue jogar.';
  } else {
    estado.vez = 1 - estado.vez;
    estado.mensagem = `${nome} não tem jogada e passou a vez.`;
  }
  return { ok: true };
}

if (typeof module !== 'undefined') {
  module.exports = {
    criarPecas,
    embaralhar,
    somarPontos,
    escolherJogadorInicial,
    novoJogo,
    reiniciarJogo,
    extremidades,
    jogadasPossiveis,
    ladosPossiveis,
    jogarPeca,
    comprarPeca,
    passarVez,
    textoPeca,
  };
}
