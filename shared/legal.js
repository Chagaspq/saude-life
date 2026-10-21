// Mostra o botão "voltar ao topo" só depois de rolar a página
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";
  // Procura na página o botão "voltar ao topo"
  const botao = document.querySelector(".back-to-top");
  // Se a página não tem esse botão, para por aqui
  if (!botao) return;

  // Função que mostra ou esconde o botão
  function atualizar() {
    // Esconde o botão enquanto a pessoa rolou menos de 400 pixels
    botao.classList.toggle("is-hidden", window.scrollY < 400);
  }

  // Roda a função toda vez que a página é rolada (passive deixa a rolagem leve)
  window.addEventListener("scroll", atualizar, { passive: true });
  // Roda uma vez logo no início para acertar o estado do botão
  atualizar();
})();
