// Entrada suave das seções ao rolar a página.
// Sem JS (ou com movimento reduzido), tudo aparece normalmente.
(function () {
  "use strict";

  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduzirMovimento || !("IntersectionObserver" in window)) return;

  const secoes = document.querySelectorAll("main > section:not(.hero)");

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-visible");
        observer.unobserve(entrada.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  secoes.forEach((secao) => {
    secao.classList.add("reveal");
    observer.observe(secao);
  });
})();
