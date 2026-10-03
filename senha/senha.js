const EMAILJS_PUBLIC_KEY = "SUA_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "SEU_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "SEU_TEMPLATE_ID";

// Página de redefinição (fica na mesma pasta, então o link funciona local ou publicado)
const RESET_PAGE_URL = new URL("redefinir.html", window.location.href).href;

// Sem as chaves do EmailJS configuradas, o envio é simulado
const EMAILJS_CONFIGURADO =
  Boolean(window.emailjs) && !EMAILJS_PUBLIC_KEY.startsWith("SUA_");

if (EMAILJS_CONFIGURADO) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ============================================
// ELEMENTOS DO FORMULÁRIO
// ============================================
const form = document.getElementById("recovery-form");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const globalError = document.getElementById("form-global-error");
const globalSuccess = document.getElementById("form-global-success");
const submitBtn = form.querySelector(".btn-submit");
const btnText = submitBtn.querySelector(".btn-text");
const spinner = submitBtn.querySelector(".spinner");
const arrow = submitBtn.querySelector(".arrow");

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function showFieldError(message) {
  emailError.textContent = message;
  emailInput.setAttribute("aria-invalid", "true");
}

function clearFieldError() {
  emailError.textContent = "";
  emailInput.removeAttribute("aria-invalid");
}

function showGlobalError(message) {
  globalError.textContent = message;
  globalError.hidden = false;
  globalSuccess.hidden = true;
}

function showGlobalSuccess(message) {
  globalSuccess.textContent = message;
  globalSuccess.hidden = false;
  globalError.hidden = true;
}

function hideGlobalMessages() {
  globalError.hidden = true;
  globalSuccess.hidden = true;
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  spinner.hidden = !isLoading;
  btnText.hidden = isLoading;
  arrow.hidden = isLoading;
}

// Gera um token aleatório simples só pra compor o link
// (sem backend, esse token não é validado depois — é só pra dar o formato do link)
function generateToken() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================
// VALIDAÇÃO EM TEMPO REAL
// ============================================
emailInput.addEventListener("input", () => {
  if (emailInput.value.trim() === "" || isValidEmail(emailInput.value)) {
    clearFieldError();
  }
});

// ============================================
// ENVIO DO FORMULÁRIO
// ============================================
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideGlobalMessages();
  clearFieldError();

  const email = emailInput.value.trim();

  if (email === "") {
    showFieldError("Digite seu e-mail.");
    emailInput.focus();
    return;
  }

  if (!isValidEmail(email)) {
    showFieldError("Digite um e-mail válido.");
    emailInput.focus();
    return;
  }

  setLoading(true);

  const token = generateToken();
  const resetLink = `${RESET_PAGE_URL}?token=${token}`;

  try {
    if (EMAILJS_CONFIGURADO) {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: email,
        reset_link: resetLink,
      });
    } else {
      // Modo demonstração: guarda o token e simula o tempo de envio
      sessionStorage.setItem("sl-reset-token", token);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.info("[Modo demonstração] Link de redefinição:", resetLink);
    }

    // Mensagem genérica de propósito: não confirma se o e-mail
    // existe cadastrado ou não (evita vazar quais e-mails têm conta)
    showGlobalSuccess(
      "Se esse e-mail estiver cadastrado, você vai receber as instruções em instantes.",
    );
    if (!EMAILJS_CONFIGURADO) {
      const demoLink = document.createElement("a");
      demoLink.href = resetLink;
      demoLink.className = "demo-link";
      demoLink.textContent = "Modo demonstração: abrir link de redefinição →";
      globalSuccess.append(document.createElement("br"), demoLink);
    }
    form.reset();
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    showGlobalError(
      "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.",
    );
  } finally {
    setLoading(false);
  }
});
