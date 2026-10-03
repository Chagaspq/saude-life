const MIN_PASSWORD_LENGTH = 8;

const form = document.getElementById("reset-form");
const passwordInput = document.getElementById("new-password");
const confirmInput = document.getElementById("confirm-new-password");
const globalError = document.getElementById("form-global-error");
const globalSuccess = document.getElementById("form-global-success");
const submitBtn = form.querySelector(".btn-submit");
const btnText = submitBtn.querySelector(".btn-text");
const spinner = submitBtn.querySelector(".spinner");
const arrow = submitBtn.querySelector(".arrow");

function setFieldError(input, message) {
  const errorEl = document.getElementById(input.getAttribute("aria-describedby"));
  errorEl.textContent = message || "";
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  spinner.hidden = !isLoading;
  btnText.hidden = isLoading;
  arrow.hidden = isLoading;
}

// Sem backend, o token só confere com o que foi gerado na tela anterior
const token = new URLSearchParams(window.location.search).get("token");
const tokenSalvo = sessionStorage.getItem("sl-reset-token");

if (!token || (tokenSalvo && token !== tokenSalvo)) {
  globalError.textContent =
    "Este link de redefinição é inválido ou expirou. Solicite um novo.";
  globalError.hidden = false;
  submitBtn.disabled = true;
}

[passwordInput, confirmInput].forEach((input) => {
  input.addEventListener("input", () => setFieldError(input, ""));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (submitBtn.disabled) return;

  let isValid = true;

  if (passwordInput.value.length < MIN_PASSWORD_LENGTH) {
    setFieldError(
      passwordInput,
      "A senha precisa ter no mínimo " + MIN_PASSWORD_LENGTH + " caracteres.",
    );
    isValid = false;
  }

  if (confirmInput.value !== passwordInput.value) {
    setFieldError(confirmInput, "As senhas não coincidem.");
    isValid = false;
  }

  if (!isValid) return;

  setLoading(true);
  setTimeout(() => {
    sessionStorage.removeItem("sl-reset-token");
    globalSuccess.textContent = "Senha alterada! Redirecionando para o login...";
    globalSuccess.hidden = false;
    setTimeout(() => {
      window.location.href = "../login/login.html";
    }, 1200);
  }, 900);
});
