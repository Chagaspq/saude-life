(function () {
  "use strict";

  const F = window.SaudeLifeForm;
  const qs = F.qs;
  const setFieldError = F.setFieldError;
  const clearFieldError = F.clearFieldError;
  const showGlobalError = F.showGlobalError;
  const validateEmailField = F.validateEmailField;
  const validatePasswordField = F.validatePasswordField;

  function validateCadastroForm(form) {
    let isValid = true;
    const name = qs("#name", form);
    const email = qs("#email", form);
    const password = qs("#password", form);
    const confirmPassword = qs("#confirm-password", form);
    const terms = qs("#terms", form);

    if (name) {
      if (!name.value.trim()) {
        setFieldError(name, "Digite seu nome completo.");
        isValid = false;
      } else {
        clearFieldError(name);
      }
    }

    if (!validateEmailField(email)) isValid = false;
    if (!validatePasswordField(password)) isValid = false;

    if (password && confirmPassword) {
      if (confirmPassword.value !== password.value) {
        setFieldError(confirmPassword, "As senhas não coincidem.");
        isValid = false;
      } else {
        clearFieldError(confirmPassword);
      }
    }

    if (terms && !terms.checked) {
      showGlobalError(
        form,
        "Você precisa aceitar os Termos de Uso para continuar.",
      );
      isValid = false;
    }

    if (!isValid) {
      const firstInvalid = form.querySelector(".form-group.has-error input");
      if (firstInvalid) {
        firstInvalid.focus();
      } else if (terms && !terms.checked) {
        terms.focus();
      }
    }

    return isValid;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const cadastroForm = document.getElementById("cadastro-form");
    if (!cadastroForm) return;
    cadastroForm.setAttribute("novalidate", "");

    F.initPasswordToggle(cadastroForm);
    // O medidor de força só faz sentido no cadastro
    F.initPasswordStrength(cadastroForm);
    F.clearErrorOnInput(cadastroForm);

    cadastroForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (validateCadastroForm(cadastroForm)) {
        F.saveAccount(cadastroForm);
        F.submitForm(
          cadastroForm,
          "Criando conta...",
          "../login/login.html?cadastro=sucesso",
        );
      }
    });
  });
})();
