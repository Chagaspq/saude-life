(function () {
  "use strict";

  const F = window.SaudeLifeForm;

  document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;
    loginForm.setAttribute("novalidate", "");

    F.initPasswordToggle(loginForm);
    F.checkCadastroSuccess(loginForm);
    F.clearErrorOnInput(loginForm);

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (F.validateLoginForm(loginForm)) {
        F.startSession(loginForm);
        F.submitForm(loginForm, "Entrando...", "../index/index.html");
      }
    });
  });
})();
