(function () {
  "use strict";

  const F = window.SaudeLifeForm;

  // Páginas do app que podem ser pedidas em ?voltar= (evita redirecionar para fora)
  const PAGINAS_APP = [
    "inicio", "descobrir", "treinos", "aulas", "alimentacao", "evolucao",
    "profissionais", "planos", "salvos", "academia", "perfil", "treino",
  ];

  function destinoDepoisDoLogin() {
    const voltar = new URLSearchParams(window.location.search).get("voltar");
    const pagina = PAGINAS_APP.includes(voltar) ? voltar : "inicio";
    return "../app/" + pagina + ".html";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;
    loginForm.setAttribute("novalidate", "");

    F.initPasswordToggle(loginForm);
    F.initSocialButtons();
    F.checkCadastroSuccess(loginForm);
    F.clearErrorOnInput(loginForm);

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (F.validateLoginForm(loginForm)) {
        F.startSession(loginForm);
        F.submitForm(loginForm, "Entrando...", destinoDepoisDoLogin());
      }
    });
  });
})();
