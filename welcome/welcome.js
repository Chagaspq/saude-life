// Entrada suave das seções ao rolar a página.
// Sem JS (ou com movimento reduzido), tudo aparece normalmente.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Confere se a pessoa pediu ao sistema para reduzir animações
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Se pediu, ou se o navegador é antigo, não faz animação nenhuma
  if (reduzirMovimento || !("IntersectionObserver" in window)) return;

  // Pega todas as seções da página, menos a primeira (hero)
  const secoes = document.querySelectorAll("main > section:not(.hero)");

  // Cria um "observador" que avisa quando uma seção aparece na tela
  const observer = new IntersectionObserver(
    // Recebe a lista de seções que mudaram
    (entradas) => {
      // Olha uma por uma
      entradas.forEach((entrada) => {
        // Se a seção ainda não está visível, ignora
        if (!entrada.isIntersecting) return;
        // Adiciona a classe que faz a seção aparecer com animação
        entrada.target.classList.add("is-visible");
        // Para de observar essa seção (a animação só acontece uma vez)
        observer.unobserve(entrada.target);
      });
    },
    // Só conta como visível quando a seção passa 10% da parte de baixo da tela
    { rootMargin: "0px 0px -10% 0px" },
  );

  // Para cada seção...
  secoes.forEach((secao) => {
    // ...começa escondida (classe reveal)
    secao.classList.add("reveal");
    // ...e passa a ser observada
    observer.observe(secao);
  });
})();
