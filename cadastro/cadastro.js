(function () {
  "use strict";

  const MIN_PASSWORD_LENGTH = 8;

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setFieldError(input, message) {
    if (!input) return;

    const errorId = input.getAttribute("aria-describedby");
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl) errorEl.textContent = message || "";

    const hasError = Boolean(message);

    input.setAttribute("aria-invalid", String(hasError));

    const formGroup = input.closest(".form-group");
    if (formGroup) {
      formGroup.classList.toggle("has-error", hasError);
    }
  }

  function clearFieldError(input) {
    setFieldError(input, "");
  }

  function showGlobalError(form, message) {
    const el = qs("#form-global-error", form);
    if (!el) return;
    el.classList.remove("is-success");
    el.textContent = message;
    el.hidden = false;
  }

  function showGlobalSuccess(form, message) {
    const el = qs("#form-global-error", form);
    if (!el) return;
    el.classList.add("is-success");
    el.textContent = message;
    el.hidden = false;
  }

  function hideGlobalError(form) {
    const el = qs("#form-global-error", form);
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
    el.classList.remove("is-success");
  }

  function setLoading(button, isLoading, loadingText) {
    if (!button) return;
    const textEl = qs(".btn-text", button);
    const spinnerEl = qs(".spinner", button);
    const arrowEl = qs(".arrow", button);

    button.disabled = isLoading;
    button.setAttribute("aria-busy", String(isLoading));

    if (isLoading) {
      if (textEl) {
        button.dataset.originalText = textEl.textContent;
        textEl.textContent = loadingText;
      }
      if (spinnerEl) spinnerEl.hidden = false;
      if (arrowEl) arrowEl.hidden = true;
    } else {
      if (textEl && button.dataset.originalText) {
        textEl.textContent = button.dataset.originalText;
      }
      if (spinnerEl) spinnerEl.hidden = true;
      if (arrowEl) arrowEl.hidden = false;
    }
  }

  function initPasswordToggle(root) {
    const toggles = root.querySelectorAll(".toggle-password");

    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        const wrapper = toggle.closest(".password-wrapper");
        if (!wrapper) return;
        const input = qs("input", wrapper);
        if (!input) return;
        const isVisible = input.type === "text";

        input.type = isVisible ? "password" : "text";
        toggle.setAttribute("aria-pressed", String(!isVisible));
        toggle.setAttribute(
          "aria-label",
          isVisible ? "Mostrar senha" : "Ocultar senha",
        );
      });
    });
  }

  function passwordStrength(value) {
    let score = 0;
    if (value.length >= MIN_PASSWORD_LENGTH) score++;
    if (value.length >= 12) score++; // limiar extra para senha "forte"
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score <= 1) return { level: "fraca", percent: 33 };
    if (score <= 3) return { level: "média", percent: 66 };
    return { level: "forte", percent: 100 };
  }

  function initPasswordStrength(form) {
    const passwordInput = qs("#password", form);
    const meter = qs("#password-strength", form);
    if (!passwordInput || !meter) return;

    const bar = qs(".strength-bar", meter);
    const label = qs(".strength-label", meter);

    passwordInput.addEventListener("input", function () {
      if (!passwordInput.value) {
        meter.hidden = true;
        return;
      }
      const { level, percent } = passwordStrength(passwordInput.value);
      meter.hidden = false;
      if (bar) {
        bar.style.width = percent + "%";
        bar.dataset.level = level;
      }
      if (label) label.textContent = "Força da senha: " + level;
    });
  }

  function validateEmailField(emailInput) {
    if (!emailInput) return true;
    const val = emailInput.value.trim();
    if (!val) {
      setFieldError(emailInput, "Digite seu e-mail.");
      return false;
    }
    if (!isValidEmail(val)) {
      setFieldError(emailInput, "Digite um e-mail válido.");
      return false;
    }
    clearFieldError(emailInput);
    return true;
  }

  function validatePasswordField(passwordInput) {
    if (!passwordInput) return true;
    const val = passwordInput.value;
    if (!val) {
      setFieldError(passwordInput, "Digite sua senha.");
      return false;
    }
    if (val.length < MIN_PASSWORD_LENGTH) {
      setFieldError(
        passwordInput,
        "A senha precisa ter no mínimo " + MIN_PASSWORD_LENGTH + " caracteres.",
      );
      return false;
    }
    clearFieldError(passwordInput);
    return true;
  }

  function validateLoginForm(form) {
    let isValid = true;
    const email = qs("#email", form);
    const password = qs("#password", form);

    if (!validateEmailField(email)) isValid = false;
    if (!validatePasswordField(password)) isValid = false;

    if (!isValid) {
      const firstInvalid = form.querySelector(".form-group.has-error input");
      if (firstInvalid) firstInvalid.focus();
    }

    return isValid;
  }

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

  function submitForm(form, loadingText, redirectUrl) {
    const button = qs(".btn-submit", form);
    if (!button || button.disabled) return;

    hideGlobalError(form);
    setLoading(button, true, loadingText);

    setTimeout(function () {
      setLoading(button, false);
      window.location.href = redirectUrl;
    }, 1200);
  }

  function checkCadastroSuccess(loginForm) {
    if (!loginForm) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cadastro") === "sucesso") {
      showGlobalSuccess(
        loginForm,
        "Conta criada com sucesso! Faça login para continuar.",
      );
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const cadastroForm = document.getElementById("cadastro-form");
    const activeForm = loginForm || cadastroForm;

    if (!activeForm) return;
    activeForm.setAttribute("novalidate", "");

    initPasswordToggle(activeForm);
    initPasswordStrength(activeForm);
    checkCadastroSuccess(loginForm);
    activeForm.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", function () {
        const formGroup = input.closest(".form-group");
        if (formGroup && formGroup.classList.contains("has-error")) {
          clearFieldError(input);
        }
      });
    });

    activeForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (loginForm && activeForm === loginForm) {
        if (validateLoginForm(loginForm))
          submitForm(loginForm, "Entrando...", "index.html");
      } else if (cadastroForm && activeForm === cadastroForm) {
        if (validateCadastroForm(cadastroForm))
          submitForm(
            cadastroForm,
            "Criando conta...",
            "../login/login.html?cadastro=sucesso",
          );
      }
    });
  });
})();
