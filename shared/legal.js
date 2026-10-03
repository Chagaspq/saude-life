// Mostra o botão "voltar ao topo" só depois de rolar a página
(function () {
  "use strict";
  const botao = document.querySelector(".back-to-top");
  if (!botao) return;

  function atualizar() {
    botao.classList.toggle("is-hidden", window.scrollY < 400);
  }

  window.addEventListener("scroll", atualizar, { passive: true });
  atualizar();
})();
