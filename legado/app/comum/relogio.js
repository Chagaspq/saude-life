/*
 * Relógio do modo demonstração (TCC).
 * Quando o modo demonstração "avança o tempo", guardamos quantos dias foram
 * avançados em sl-demo-dias. Este arquivo carrega antes de todos os outros
 * e faz o app inteiro achar que hoje é "hoje + esses dias".
 * Sem dias avançados, não muda nada.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";
  // Quantos dias foram avançados (0 se nenhum)
  let dias = 0;
  // Tenta ler do navegador
  try {
    // Lê a chave (é só um número)
    dias = Number(JSON.parse(localStorage.getItem("sl-demo-dias"))) || 0;
  // Se o navegador bloquear...
  } catch (e) {
    // ...fica sem avanço
    dias = 0;
  }
  // Sem avanço: não mexe em nada
  if (!dias) return;
  // Diferença em milissegundos
  const diferenca = dias * 86400000;
  // Guarda o Date original do navegador
  const DateOriginal = window.Date;
  // Date novo: igual ao original, mas "agora" fica no futuro
  class DateDemo extends DateOriginal {
    // Ao criar uma data...
    constructor(...args) {
      // ...sem nada (= agora), usa agora + diferença; com valores, usa os valores
      if (args.length) super(...args);
      // (agora avançado)
      else super(DateOriginal.now() + diferenca);
    }

    // Date.now() também avança
    static now() {
      // Agora + diferença
      return DateOriginal.now() + diferenca;
    }
  }
  // Troca o Date da página pelo Date da demonstração
  window.Date = DateDemo;
})();
