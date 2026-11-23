const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const { validarPeca, podeConectar, conectar, validarJogadores, venceu } = require('./index.js');
const jogo = require('./game-logic.js');

// ---------- Ajudas para os testes ----------

// Gerador de números "aleatórios" previsível (sempre devolve valores entre 0 e 1).
function criarAleatorio(semente) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Monta uma partida com as peças que o teste quiser.
function montarEstado({ maos, monte = [], mesa = [], vez = 0, pecaInicial = [6, 6] }) {
  return {
    jogadores: ['Danilo', 'Ana'],
    maos,
    monte,
    mesa,
    vez,
    pecaInicial,
    passesSeguidos: 0,
    status: 'jogando',
    resultado: null,
    mensagem: '',
  };
}

// ---------- Funções originais ----------

describe('validarPeca', () => {
  test('aceita peças válidas', () => {
    assert.equal(validarPeca([0, 0]), true);
    assert.equal(validarPeca([3, 5]), true);
    assert.equal(validarPeca([6, 6]), true);
  });

  test('aceita todas as 28 peças do jogo', () => {
    assert.ok(jogo.criarPecas().every(validarPeca));
  });

  test('recusa números fora de 0 a 6', () => {
    assert.equal(validarPeca([7, 1]), false);
    assert.equal(validarPeca([-1, 2]), false);
  });

  test('recusa números que não são inteiros', () => {
    assert.equal(validarPeca([1.5, 2]), false);
    assert.equal(validarPeca([NaN, 2]), false);
    assert.equal(validarPeca([Infinity, 2]), false);
  });

  test('recusa textos no lugar de números', () => {
    assert.equal(validarPeca(['3', '4']), false);
  });

  test('recusa tamanho errado', () => {
    assert.equal(validarPeca([]), false);
    assert.equal(validarPeca([1]), false);
    assert.equal(validarPeca([1, 2, 3]), false);
  });

  test('recusa valores que não são array', () => {
    assert.equal(validarPeca(null), false);
    assert.equal(validarPeca(undefined), false);
    assert.equal(validarPeca('3,4'), false);
    assert.equal(validarPeca({ 0: 1, 1: 2 }), false);
    assert.equal(validarPeca(42), false);
  });
});

describe('podeConectar', () => {
  test('conecta pelo primeiro lado', () => {
    assert.equal(podeConectar([3, 5], 3), true);
  });

  test('conecta pelo segundo lado', () => {
    assert.equal(podeConectar([3, 5], 5), true);
  });

  test('não conecta quando nenhum lado combina', () => {
    assert.equal(podeConectar([3, 5], 4), false);
  });

  test('conecta peça dupla', () => {
    assert.equal(podeConectar([2, 2], 2), true);
  });

  test('recusa extremidade inválida', () => {
    assert.equal(podeConectar([3, 5], 7), false);
    assert.equal(podeConectar([3, 5], -1), false);
    assert.equal(podeConectar([3, 5], '3'), false);
    assert.equal(podeConectar([3, 5], undefined), false);
  });

  test('recusa peça inválida', () => {
    assert.equal(podeConectar([3, 9], 3), false);
    assert.equal(podeConectar(null, 3), false);
  });
});

describe('conectar', () => {
  test('mantém a peça quando o primeiro lado já combina', () => {
    assert.deepEqual(conectar([3, 5], 3), [3, 5]);
  });

  test('gira a peça quando o segundo lado combina', () => {
    assert.deepEqual(conectar([3, 5], 5), [5, 3]);
  });

  test('peça dupla continua igual', () => {
    assert.deepEqual(conectar([4, 4], 4), [4, 4]);
  });

  test('devolve null quando não encaixa', () => {
    assert.equal(conectar([3, 5], 1), null);
  });

  test('devolve null para entradas inválidas', () => {
    assert.equal(conectar('abc', 1), null);
    assert.equal(conectar([3, 5], 'x'), null);
  });

  test('não altera a peça original', () => {
    const peca = [3, 5];
    const resultado = conectar(peca, 5);
    assert.deepEqual(peca, [3, 5]);
    assert.notEqual(resultado, peca);
  });
});

describe('validarJogadores', () => {
  test('aceita dois nomes diferentes', () => {
    const r = validarJogadores('Danilo', 'Ana');
    assert.equal(r.valido, true);
    assert.deepEqual(r.nomes, ['Danilo', 'Ana']);
  });

  test('remove espaços das pontas dos nomes', () => {
    assert.deepEqual(validarJogadores('  Danilo ', ' Ana').nomes, ['Danilo', 'Ana']);
  });

  test('recusa nome vazio', () => {
    assert.equal(validarJogadores('', 'Ana').valido, false);
    assert.equal(validarJogadores('Danilo', '').valido, false);
  });

  test('recusa nome só com espaços', () => {
    assert.equal(validarJogadores('   ', 'Ana').valido, false);
  });

  test('recusa nomes iguais, mesmo com maiúsculas diferentes', () => {
    assert.equal(validarJogadores('Ana', 'Ana').valido, false);
    assert.equal(validarJogadores('Ana', ' ana ').valido, false);
  });

  test('recusa nome com mais de 20 caracteres', () => {
    assert.equal(validarJogadores('a'.repeat(21), 'Ana').valido, false);
    assert.equal(validarJogadores('a'.repeat(20), 'Ana').valido, true);
  });

  test('recusa valores que não são texto', () => {
    assert.equal(validarJogadores(null, 'Ana').valido, false);
    assert.equal(validarJogadores('Danilo', 123).valido, false);
    assert.equal(validarJogadores(undefined, undefined).valido, false);
  });

  test('devolve uma mensagem de erro quando é inválido', () => {
    assert.equal(typeof validarJogadores('', '').erro, 'string');
  });
});

describe('venceu', () => {
  test('mão vazia vence', () => {
    assert.equal(venceu([]), true);
  });

  test('mão com peças não vence', () => {
    assert.equal(venceu([[1, 2]]), false);
  });

  test('valores que não são lista não vencem', () => {
    assert.equal(venceu(null), false);
    assert.equal(venceu(undefined), false);
    assert.equal(venceu(''), false);
    assert.equal(venceu(0), false);
  });
});

// ---------- Geração, embaralhamento e distribuição ----------

describe('Geração das peças', () => {
  const pecas = jogo.criarPecas();

  test('gera 28 peças', () => {
    assert.equal(pecas.length, 28);
  });

  test('não repete peças (nem invertidas)', () => {
    const chaves = pecas.map((p) => [Math.min(...p), Math.max(...p)].join('-'));
    assert.equal(new Set(chaves).size, 28);
  });

  test('vai de [0,0] até [6,6]', () => {
    assert.deepEqual(pecas[0], [0, 0]);
    assert.deepEqual(pecas[27], [6, 6]);
  });

  test('tem 7 peças duplas', () => {
    assert.equal(pecas.filter((p) => p[0] === p[1]).length, 7);
  });

  test('a soma de todos os pontos é 168', () => {
    assert.equal(jogo.somarPontos(pecas), 168);
  });
});

describe('Embaralhamento', () => {
  test('mantém as mesmas peças', () => {
    const embaralhadas = jogo.embaralhar(jogo.criarPecas());
    const ordenar = (lista) => lista.map((p) => p.join('')).sort();
    assert.deepEqual(ordenar(embaralhadas), ordenar(jogo.criarPecas()));
  });

  test('não altera a lista original', () => {
    const original = jogo.criarPecas();
    jogo.embaralhar(original, criarAleatorio(1));
    assert.deepEqual(original, jogo.criarPecas());
  });

  test('muda a ordem das peças', () => {
    const embaralhadas = jogo.embaralhar(jogo.criarPecas(), criarAleatorio(7));
    assert.notDeepEqual(embaralhadas, jogo.criarPecas());
  });

  test('com a mesma semente dá o mesmo resultado', () => {
    const a = jogo.embaralhar(jogo.criarPecas(), criarAleatorio(42));
    const b = jogo.embaralhar(jogo.criarPecas(), criarAleatorio(42));
    assert.deepEqual(a, b);
  });

  test('sementes diferentes dão ordens diferentes', () => {
    const a = jogo.embaralhar(jogo.criarPecas(), criarAleatorio(1));
    const b = jogo.embaralhar(jogo.criarPecas(), criarAleatorio(2));
    assert.notDeepEqual(a, b);
  });

  test('aceita lista vazia', () => {
    assert.deepEqual(jogo.embaralhar([]), []);
  });

  test('não quebra se o gerador devolver um valor muito próximo de 1', () => {
    const resultado = jogo.embaralhar([[0, 0], [1, 1], [2, 2]], () => 0.9999999);
    assert.equal(resultado.length, 3);
  });

  test('recusa entrada que não é lista', () => {
    assert.throws(() => jogo.embaralhar(null), TypeError);
    assert.throws(() => jogo.embaralhar('abc'), TypeError);
  });
});

describe('Distribuição das peças', () => {
  const estado = jogo.novoJogo('Danilo', 'Ana', criarAleatorio(10));

  test('cada jogador recebe 7 peças', () => {
    assert.equal(estado.maos[0].length, 7);
    assert.equal(estado.maos[1].length, 7);
  });

  test('o monte começa com 14 peças e a mesa vazia', () => {
    assert.equal(estado.monte.length, 14);
    assert.equal(estado.mesa.length, 0);
  });

  test('as 28 peças aparecem uma única vez entre mãos e monte', () => {
    const todas = [...estado.maos[0], ...estado.maos[1], ...estado.monte];
    const chaves = todas.map((p) => p.join('-'));
    assert.equal(new Set(chaves).size, 28);
  });

  test('guarda os nomes dos jogadores', () => {
    assert.deepEqual(estado.jogadores, ['Danilo', 'Ana']);
  });

  test('a partida começa em andamento, sem resultado', () => {
    assert.equal(estado.status, 'jogando');
    assert.equal(estado.resultado, null);
  });

  test('recusa nomes inválidos', () => {
    assert.throws(() => jogo.novoJogo('', 'Ana'), /nome/i);
    assert.throws(() => jogo.novoJogo('Ana', 'Ana'));
    assert.throws(() => jogo.novoJogo(null, undefined));
  });
});

// ---------- Jogador inicial ----------

describe('Jogador inicial', () => {
  test('começa quem tem a maior peça dupla', () => {
    const maos = [[[1, 1], [2, 3]], [[4, 4], [0, 5]]];
    const inicio = jogo.escolherJogadorInicial(maos);
    assert.equal(inicio.jogador, 1);
    assert.deepEqual(inicio.peca, [4, 4]);
    assert.equal(inicio.indice, 0);
  });

  test('a dupla [6,6] ganha de qualquer outra', () => {
    const maos = [[[5, 5], [6, 6]], [[4, 4]]];
    assert.deepEqual(jogo.escolherJogadorInicial(maos).peca, [6, 6]);
  });

  test('qualquer dupla ganha de peças sem dupla, mesmo com soma maior', () => {
    const maos = [[[6, 5]], [[0, 0]]];
    assert.equal(jogo.escolherJogadorInicial(maos).jogador, 1);
  });

  test('sem duplas, começa a peça de maior soma', () => {
    const maos = [[[1, 2], [3, 4]], [[5, 6], [0, 1]]];
    const inicio = jogo.escolherJogadorInicial(maos);
    assert.equal(inicio.jogador, 1);
    assert.deepEqual(inicio.peca, [5, 6]);
  });

  test('sem duplas e com a mesma soma, vale o maior lado', () => {
    const maos = [[[2, 6]], [[3, 5]]]; // as duas somam 8
    assert.deepEqual(jogo.escolherJogadorInicial(maos).peca, [2, 6]);
  });

  test('recusa mãos vazias ou inválidas', () => {
    assert.throws(() => jogo.escolherJogadorInicial([[], []]));
    assert.throws(() => jogo.escolherJogadorInicial(null));
  });

  test('o jogador inicial da partida realmente tem a peça inicial na mão', () => {
    for (let semente = 1; semente <= 50; semente++) {
      const estado = jogo.novoJogo('Danilo', 'Ana', criarAleatorio(semente));
      const mao = estado.maos[estado.vez].map((p) => p.join('-'));
      assert.ok(mao.includes(estado.pecaInicial.join('-')));
    }
  });
});

describe('Primeira jogada', () => {
  test('só a peça inicial pode ser jogada', () => {
    const estado = jogo.novoJogo('Danilo', 'Ana', criarAleatorio(3));
    const jogadas = jogo.jogadasPossiveis(estado);
    assert.equal(jogadas.length, 1);
    assert.deepEqual(jogadas[0].peca, estado.pecaInicial);
    assert.equal(jogadas[0].lado, 'centro');
  });

  test('recusa outra peça no começo', () => {
    const estado = montarEstado({ maos: [[[6, 6], [1, 2]], [[3, 3]]], pecaInicial: [6, 6] });
    const r = jogo.jogarPeca(estado, 1, 'direita');
    assert.equal(r.ok, false);
    assert.equal(estado.mesa.length, 0);
  });

  test('a peça inicial vai para o centro da mesa', () => {
    const estado = montarEstado({ maos: [[[6, 6], [1, 2]], [[3, 3]]] });
    assert.equal(jogo.jogarPeca(estado, 0, 'centro').ok, true);
    assert.deepEqual(estado.mesa, [[6, 6]]);
    assert.equal(estado.maos[0].length, 1);
  });
});

// ---------- Jogadas ----------

describe('Alternância de turnos', () => {
  test('a vez passa para o outro jogador depois de jogar', () => {
    const estado = montarEstado({
      maos: [[[6, 6], [1, 2]], [[6, 3], [0, 0]]],
      vez: 0,
    });
    jogo.jogarPeca(estado, 0, 'centro');
    assert.equal(estado.vez, 1);
    jogo.jogarPeca(estado, 0, 'direita');
    assert.equal(estado.vez, 0);
  });

  test('a vez passa depois de passar', () => {
    const estado = montarEstado({
      maos: [[[1, 2]], [[2, 3], [3, 3]]],
      mesa: [[5, 5]],
      vez: 0,
    });
    assert.equal(jogo.passarVez(estado).ok, true);
    assert.equal(estado.vez, 1);
  });

  test('comprar peça não troca a vez', () => {
    const estado = montarEstado({
      maos: [[[1, 2]], [[3, 3]]],
      monte: [[0, 0]],
      mesa: [[5, 5]],
    });
    jogo.comprarPeca(estado);
    assert.equal(estado.vez, 0);
  });

  test('só joga quem está na vez (a mão do outro não é usada)', () => {
    const estado = montarEstado({
      maos: [[[1, 2], [5, 4]], [[5, 5], [5, 1]]],
      mesa: [[5, 5]],
      vez: 0,
    });
    // O índice 0 da mão do jogador 0 é [1,2], que não encaixa, mesmo que [5,5] exista na mão do outro.
    assert.equal(jogo.jogarPeca(estado, 0, 'direita').ok, false);
    assert.equal(estado.vez, 0);
  });
});

describe('Encaixe nas duas extremidades', () => {
  test('encaixa na direita', () => {
    const estado = montarEstado({ maos: [[[4, 6], [0, 0]], [[1, 1]]], mesa: [[2, 3], [3, 4]] });
    assert.equal(jogo.jogarPeca(estado, 0, 'direita').ok, true);
    assert.deepEqual(estado.mesa, [[2, 3], [3, 4], [4, 6]]);
  });

  test('encaixa na esquerda', () => {
    const estado = montarEstado({ maos: [[[1, 2], [0, 0]], [[1, 1]]], mesa: [[2, 3], [3, 4]] });
    assert.equal(jogo.jogarPeca(estado, 0, 'esquerda').ok, true);
    assert.deepEqual(estado.mesa, [[1, 2], [2, 3], [3, 4]]);
  });

  test('peça que serve nos dois lados pode ir em qualquer um', () => {
    const base = () => montarEstado({ maos: [[[2, 4], [0, 0]], [[1, 1]]], mesa: [[2, 3], [3, 4]] });
    const aEsquerda = base();
    const aDireita = base();
    assert.deepEqual(jogo.ladosPossiveis(aEsquerda, 0), ['esquerda', 'direita']);
    jogo.jogarPeca(aEsquerda, 0, 'esquerda');
    jogo.jogarPeca(aDireita, 0, 'direita');
    assert.deepEqual(aEsquerda.mesa[0], [4, 2]);
    assert.deepEqual(aDireita.mesa[aDireita.mesa.length - 1], [4, 2]);
  });

  test('as extremidades são atualizadas depois da jogada', () => {
    const estado = montarEstado({ maos: [[[4, 6], [0, 0]], [[1, 1]]], mesa: [[2, 3], [3, 4]] });
    assert.deepEqual(jogo.extremidades(estado.mesa), { esquerda: 2, direita: 4 });
    jogo.jogarPeca(estado, 0, 'direita');
    assert.deepEqual(jogo.extremidades(estado.mesa), { esquerda: 2, direita: 6 });
  });

  test('extremidades de mesa vazia é null', () => {
    assert.equal(jogo.extremidades([]), null);
    assert.equal(jogo.extremidades(null), null);
  });

  test('peça dupla encaixa normalmente', () => {
    const estado = montarEstado({ maos: [[[4, 4], [0, 0]], [[1, 1]]], mesa: [[2, 3], [3, 4]] });
    jogo.jogarPeca(estado, 0, 'direita');
    assert.deepEqual(estado.mesa[2], [4, 4]);
  });
});

describe('Inversão das peças', () => {
  test('direita: peça já na posição certa não gira', () => {
    const estado = montarEstado({ maos: [[[4, 6], [0, 0]], [[1, 1]]], mesa: [[3, 4]] });
    jogo.jogarPeca(estado, 0, 'direita');
    assert.deepEqual(estado.mesa[1], [4, 6]);
  });

  test('direita: peça invertida gira', () => {
    const estado = montarEstado({ maos: [[[6, 4], [0, 0]], [[1, 1]]], mesa: [[3, 4]] });
    jogo.jogarPeca(estado, 0, 'direita');
    assert.deepEqual(estado.mesa[1], [4, 6]);
  });

  test('esquerda: peça já na posição certa não gira', () => {
    const estado = montarEstado({ maos: [[[1, 3], [0, 0]], [[2, 2]]], mesa: [[3, 4]] });
    jogo.jogarPeca(estado, 0, 'esquerda');
    assert.deepEqual(estado.mesa[0], [1, 3]);
  });

  test('esquerda: peça invertida gira', () => {
    const estado = montarEstado({ maos: [[[3, 1], [0, 0]], [[2, 2]]], mesa: [[3, 4]] });
    jogo.jogarPeca(estado, 0, 'esquerda');
    assert.deepEqual(estado.mesa[0], [1, 3]);
  });

  test('os números vizinhos na mesa sempre combinam', () => {
    const estado = montarEstado({
      maos: [[[6, 4], [1, 3], [2, 6]], [[5, 5]]],
      mesa: [[3, 4]],
    });
    jogo.jogarPeca(estado, 0, 'direita'); // [4,6]
    estado.vez = 0;
    jogo.jogarPeca(estado, 0, 'esquerda'); // [1,3] ou invertida
    for (let i = 0; i < estado.mesa.length - 1; i++) {
      assert.equal(estado.mesa[i][1], estado.mesa[i + 1][0]);
    }
  });
});

describe('Jogadas inválidas', () => {
  const criar = () => montarEstado({ maos: [[[1, 2], [5, 6]], [[3, 3]]], mesa: [[3, 4], [4, 4]] });

  test('recusa peça que não encaixa', () => {
    const estado = criar();
    const r = jogo.jogarPeca(estado, 0, 'direita');
    assert.equal(r.ok, false);
    assert.equal(typeof r.erro, 'string');
  });

  test('uma jogada recusada não altera a partida', () => {
    const estado = criar();
    const antes = JSON.stringify(estado);
    jogo.jogarPeca(estado, 0, 'direita');
    assert.equal(JSON.stringify(estado), antes);
  });

  test('recusa índice fora da mão', () => {
    const estado = criar();
    assert.equal(jogo.jogarPeca(estado, 5, 'direita').ok, false);
    assert.equal(jogo.jogarPeca(estado, -1, 'direita').ok, false);
  });

  test('recusa índice que não é número inteiro', () => {
    const estado = criar();
    assert.equal(jogo.jogarPeca(estado, '0', 'direita').ok, false);
    assert.equal(jogo.jogarPeca(estado, 1.5, 'direita').ok, false);
    assert.equal(jogo.jogarPeca(estado, undefined, 'direita').ok, false);
    assert.equal(jogo.jogarPeca(estado, null, 'direita').ok, false);
  });

  test('recusa lado inexistente', () => {
    const estado = montarEstado({ maos: [[[4, 6]], [[1, 1]]], mesa: [[3, 4]] });
    assert.equal(jogo.jogarPeca(estado, 0, 'cima').ok, false);
    assert.equal(jogo.jogarPeca(estado, 0, undefined).ok, false);
    assert.equal(jogo.jogarPeca(estado, 0, 'centro').ok, false);
  });

  test('recusa o lado errado quando a peça só encaixa no outro', () => {
    const estado = montarEstado({ maos: [[[4, 6], [0, 0]], [[1, 1]]], mesa: [[2, 3], [3, 4]] });
    assert.equal(jogo.jogarPeca(estado, 0, 'esquerda').ok, false);
    assert.equal(estado.mesa.length, 2);
  });

  test('recusa jogadas depois do fim da partida', () => {
    const estado = criar();
    estado.status = 'fim';
    assert.equal(jogo.jogarPeca(estado, 1, 'direita').ok, false);
  });

  test('recusa partida inválida', () => {
    assert.equal(jogo.jogarPeca(null, 0, 'direita').ok, false);
    assert.equal(jogo.jogarPeca({}, 0, 'direita').ok, false);
    assert.equal(jogo.comprarPeca(undefined).ok, false);
    assert.equal(jogo.passarVez('texto').ok, false);
    assert.deepEqual(jogo.jogadasPossiveis(null), []);
  });
});

// ---------- Compra e passagem de turno ----------

describe('Compra de peças', () => {
  test('compra do monte quando não há jogada', () => {
    const estado = montarEstado({
      maos: [[[1, 2]], [[3, 3]]],
      monte: [[0, 0], [5, 5]],
      mesa: [[4, 4]],
    });
    const r = jogo.comprarPeca(estado);
    assert.equal(r.ok, true);
    assert.deepEqual(r.peca, [5, 5]);
    assert.equal(estado.maos[0].length, 2);
    assert.equal(estado.monte.length, 1);
  });

  test('recusa comprar quando já existe jogada', () => {
    const estado = montarEstado({
      maos: [[[4, 2]], [[3, 3]]],
      monte: [[0, 0]],
      mesa: [[4, 4]],
    });
    assert.equal(jogo.comprarPeca(estado).ok, false);
    assert.equal(estado.monte.length, 1);
  });

  test('recusa comprar com o monte vazio', () => {
    const estado = montarEstado({ maos: [[[1, 2]], [[3, 3]]], monte: [], mesa: [[4, 4]] });
    assert.equal(jogo.comprarPeca(estado).ok, false);
  });

  test('compra até conseguir jogar', () => {
    const estado = montarEstado({
      maos: [[[1, 2]], [[3, 3]]],
      monte: [[4, 5], [0, 1], [0, 0]], // a compra tira do final: [0,0], [0,1], [4,5]
      mesa: [[4, 4]],
    });
    let compras = 0;
    while (jogo.jogadasPossiveis(estado).length === 0) {
      assert.equal(jogo.comprarPeca(estado).ok, true);
      compras += 1;
    }
    assert.equal(compras, 3);
    assert.equal(jogo.jogarPeca(estado, 3, 'direita').ok, true);
  });

  test('comprar não perde nem cria peças', () => {
    const estado = jogo.novoJogo('Danilo', 'Ana', criarAleatorio(5));
    const total = () => estado.maos[0].length + estado.maos[1].length + estado.monte.length + estado.mesa.length;
    assert.equal(total(), 28);
  });
});

describe('Passagem de turno', () => {
  test('passa quando não há jogada e o monte está vazio', () => {
    const estado = montarEstado({ maos: [[[1, 2]], [[3, 3]]], mesa: [[4, 4]] });
    assert.equal(jogo.passarVez(estado).ok, true);
    assert.equal(estado.vez, 1);
  });

  test('recusa passar com jogada possível', () => {
    const estado = montarEstado({ maos: [[[4, 2]], [[3, 3]]], mesa: [[4, 4]] });
    assert.equal(jogo.passarVez(estado).ok, false);
    assert.equal(estado.vez, 0);
  });

  test('recusa passar enquanto há peças no monte', () => {
    const estado = montarEstado({ maos: [[[1, 2]], [[3, 3]]], monte: [[0, 0]], mesa: [[4, 4]] });
    assert.equal(jogo.passarVez(estado).ok, false);
  });

  test('uma jogada zera a contagem de passes seguidos', () => {
    const estado = montarEstado({
      maos: [[[1, 2]], [[4, 3], [3, 3]]],
      mesa: [[4, 4]],
    });
    jogo.passarVez(estado);
    assert.equal(estado.passesSeguidos, 1);
    jogo.jogarPeca(estado, 0, 'direita');
    assert.equal(estado.passesSeguidos, 0);
  });
});

// ---------- Fim da partida ----------

describe('Vitória por mão vazia', () => {
  test('vence quem joga a última peça', () => {
    const estado = montarEstado({ maos: [[[5, 3]], [[1, 1], [2, 2]]], mesa: [[5, 5]] });
    assert.equal(jogo.jogarPeca(estado, 0, 'direita').ok, true);
    assert.equal(estado.status, 'fim');
    assert.equal(estado.resultado.motivo, 'mao-vazia');
    assert.equal(estado.resultado.vencedor, 0);
    assert.deepEqual(estado.resultado.pontos, [0, 6]);
  });

  test('funciona também para o segundo jogador', () => {
    const estado = montarEstado({ maos: [[[0, 1]], [[5, 3]]], mesa: [[5, 5]], vez: 1 });
    jogo.jogarPeca(estado, 0, 'direita');
    assert.equal(estado.resultado.vencedor, 1);
  });

  test('não permite mais ações depois da vitória', () => {
    const estado = montarEstado({ maos: [[[5, 3]], [[1, 1]]], mesa: [[5, 5]] });
    jogo.jogarPeca(estado, 0, 'direita');
    assert.equal(jogo.comprarPeca(estado).ok, false);
    assert.equal(jogo.passarVez(estado).ok, false);
    assert.deepEqual(jogo.jogadasPossiveis(estado), []);
  });
});

describe('Vitória por menor pontuação (bloqueio)', () => {
  test('vence quem tem menos pontos na mão', () => {
    const estado = montarEstado({
      maos: [[[2, 2]], [[3, 3]]], // 4 pontos contra 6
      mesa: [[0, 1]],
    });
    jogo.passarVez(estado);
    jogo.passarVez(estado);
    assert.equal(estado.status, 'fim');
    assert.equal(estado.resultado.motivo, 'bloqueio');
    assert.equal(estado.resultado.vencedor, 0);
    assert.deepEqual(estado.resultado.pontos, [4, 6]);
  });

  test('o segundo jogador pode vencer o bloqueio', () => {
    const estado = montarEstado({ maos: [[[6, 6]], [[2, 2], [0, 1]]], mesa: [[3, 4]] });
    jogo.passarVez(estado);
    jogo.passarVez(estado);
    assert.equal(estado.resultado.vencedor, 1);
    assert.deepEqual(estado.resultado.pontos, [12, 5]);
  });

  test('um único passe não bloqueia o jogo', () => {
    const estado = montarEstado({ maos: [[[2, 2]], [[3, 3]]], mesa: [[0, 1]] });
    jogo.passarVez(estado);
    assert.equal(estado.status, 'jogando');
  });
});

describe('Empate por pontuação', () => {
  test('mesma soma no bloqueio dá empate', () => {
    const estado = montarEstado({ maos: [[[1, 2]], [[0, 3]]], mesa: [[5, 5]] });
    jogo.passarVez(estado);
    jogo.passarVez(estado);
    assert.equal(estado.status, 'fim');
    assert.equal(estado.resultado.vencedor, null);
    assert.deepEqual(estado.resultado.pontos, [3, 3]);
  });
});

describe('Reinicialização da partida', () => {
  test('cria uma partida nova com os mesmos jogadores', () => {
    const estado = jogo.novoJogo('Danilo', 'Ana', criarAleatorio(8));
    estado.status = 'fim';
    const nova = jogo.reiniciarJogo(estado, criarAleatorio(9));
    assert.deepEqual(nova.jogadores, ['Danilo', 'Ana']);
    assert.equal(nova.status, 'jogando');
    assert.equal(nova.resultado, null);
    assert.equal(nova.mesa.length, 0);
    assert.equal(nova.maos[0].length, 7);
    assert.equal(nova.maos[1].length, 7);
    assert.equal(nova.monte.length, 14);
    assert.equal(nova.passesSeguidos, 0);
  });

  test('a partida nova é independente da anterior', () => {
    const estado = jogo.novoJogo('Danilo', 'Ana', criarAleatorio(8));
    const nova = jogo.reiniciarJogo(estado, criarAleatorio(9));
    assert.notEqual(nova, estado);
    assert.notEqual(nova.maos, estado.maos);
    assert.notDeepEqual(nova.maos, estado.maos);
  });

  test('recusa reiniciar sem partida', () => {
    assert.throws(() => jogo.reiniciarJogo(null));
    assert.throws(() => jogo.reiniciarJogo({}));
  });
});

// ---------- Simulação de partidas completas ----------

describe('Partidas completas simuladas', () => {
  // Um "jogador automático" que sempre faz a primeira jogada permitida.
  function jogarAteOFim(estado) {
    let passos = 0;
    while (estado.status === 'jogando' && passos < 500) {
      const jogadas = jogo.jogadasPossiveis(estado);
      if (jogadas.length > 0) {
        assert.equal(jogo.jogarPeca(estado, jogadas[0].indice, jogadas[0].lado).ok, true);
      } else if (estado.monte.length > 0) {
        assert.equal(jogo.comprarPeca(estado).ok, true);
      } else {
        assert.equal(jogo.passarVez(estado).ok, true);
      }
      passos += 1;
    }
    return passos;
  }

  test('100 partidas terminam, mantêm 28 peças e a mesa sempre conectada', () => {
    for (let semente = 1; semente <= 100; semente++) {
      const estado = jogo.novoJogo('Danilo', 'Ana', criarAleatorio(semente));
      const passos = jogarAteOFim(estado);

      assert.ok(passos < 500, `a partida ${semente} não terminou`);
      assert.equal(estado.status, 'fim');

      const total = estado.maos[0].length + estado.maos[1].length + estado.monte.length + estado.mesa.length;
      assert.equal(total, 28);

      for (let i = 0; i < estado.mesa.length - 1; i++) {
        assert.equal(estado.mesa[i][1], estado.mesa[i + 1][0]);
      }

      const { motivo, vencedor, pontos } = estado.resultado;
      if (motivo === 'mao-vazia') {
        assert.equal(estado.maos[vencedor].length, 0);
      } else {
        assert.equal(motivo, 'bloqueio');
        if (vencedor === null) assert.equal(pontos[0], pontos[1]);
        else assert.ok(pontos[vencedor] < pontos[1 - vencedor]);
      }
    }
  });
});
