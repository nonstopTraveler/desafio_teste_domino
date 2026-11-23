// Funções básicas do dominó (as cinco funções do desafio de Testes de Software).
// Servem tanto para o Node (testes) quanto para o navegador (jogo).

// Uma peça é um array com dois números inteiros de 0 a 6. Exemplo: [3, 5]
function validarPeca(peca) {
  if (!Array.isArray(peca) || peca.length !== 2) return false;
  return peca.every((lado) => Number.isInteger(lado) && lado >= 0 && lado <= 6);
}

// Diz se a peça tem algum lado igual ao número da extremidade da mesa.
function podeConectar(peca, extremidade) {
  if (!validarPeca(peca)) return false;
  if (!Number.isInteger(extremidade) || extremidade < 0 || extremidade > 6) return false;
  return peca[0] === extremidade || peca[1] === extremidade;
}

// Devolve uma cópia da peça girada para que o primeiro número seja o da
// extremidade. Exemplo: conectar([3, 5], 5) -> [5, 3]. Se não encaixa, devolve null.
function conectar(peca, extremidade) {
  if (!podeConectar(peca, extremidade)) return null;
  if (peca[0] === extremidade) return [peca[0], peca[1]];
  return [peca[1], peca[0]];
}

// Confere os nomes digitados na tela inicial.
// Devolve { valido: true, nomes: [...] } ou { valido: false, erro: '...' }.
function validarJogadores(nome1, nome2) {
  if (typeof nome1 !== 'string' || typeof nome2 !== 'string') {
    return { valido: false, erro: 'Os nomes devem ser textos.' };
  }
  const a = nome1.trim();
  const b = nome2.trim();
  if (a === '' || b === '') {
    return { valido: false, erro: 'Informe o nome dos dois jogadores.' };
  }
  if (a.length > 20 || b.length > 20) {
    return { valido: false, erro: 'Cada nome pode ter no máximo 20 caracteres.' };
  }
  if (a.toLowerCase() === b.toLowerCase()) {
    return { valido: false, erro: 'Os jogadores precisam ter nomes diferentes.' };
  }
  return { valido: true, nomes: [a, b] };
}

// O jogador vence quando fica sem peças na mão.
function venceu(mao) {
  return Array.isArray(mao) && mao.length === 0;
}

if (typeof module !== 'undefined') {
  module.exports = { validarPeca, podeConectar, conectar, validarJogadores, venceu };
}
