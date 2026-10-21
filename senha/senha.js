// Chave pública do EmailJS (serviço que manda e-mail); ainda não configurada
const EMAILJS_PUBLIC_KEY = "SUA_PUBLIC_KEY";
// Código do serviço de e-mail no EmailJS
const EMAILJS_SERVICE_ID = "SEU_SERVICE_ID";
// Código do modelo de e-mail no EmailJS
const EMAILJS_TEMPLATE_ID = "SEU_TEMPLATE_ID";

// Página de redefinição (fica na mesma pasta, então o link funciona local ou publicado)
// Endereço completo da página de redefinir senha
const RESET_PAGE_URL = new URL("redefinir.html", window.location.href).href;

// Sem as chaves do EmailJS configuradas, o envio é simulado
// Confere se o EmailJS está pronto para usar:
const EMAILJS_CONFIGURADO =
  // a biblioteca carregou e as chaves foram trocadas
  Boolean(window.emailjs) && !EMAILJS_PUBLIC_KEY.startsWith("SUA_");

// Se está configurado...
if (EMAILJS_CONFIGURADO) {
  // ...liga o EmailJS com a chave pública
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ============================================
// ELEMENTOS DO FORMULÁRIO
// ============================================
// Formulário de recuperar senha
const form = document.getElementById("recovery-form");
// Campo do e-mail
const emailInput = document.getElementById("email");
// Lugar da mensagem de erro do e-mail
const emailError = document.getElementById("email-error");
// Caixa de erro geral
const globalError = document.getElementById("form-global-error");
// Caixa de sucesso
const globalSuccess = document.getElementById("form-global-success");
// Botão de enviar
const submitBtn = form.querySelector(".btn-submit");
// Texto do botão
const btnText = submitBtn.querySelector(".btn-text");
// Rodinha de carregando
const spinner = submitBtn.querySelector(".spinner");
// Setinha do botão
const arrow = submitBtn.querySelector(".arrow");

// Confere se o e-mail tem formato válido (algo@algo.algo)
function isValidEmail(value) {
  // Regra que testa o formato do e-mail
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Mostra erro no campo de e-mail
function showFieldError(message) {
  // Escreve a mensagem
  emailError.textContent = message;
  // Marca o campo como inválido
  emailInput.setAttribute("aria-invalid", "true");
}

// Apaga o erro do campo de e-mail
function clearFieldError() {
  // Apaga a mensagem
  emailError.textContent = "";
  // Tira a marcação de inválido
  emailInput.removeAttribute("aria-invalid");
}

// Mostra o erro geral
function showGlobalError(message) {
  // Escreve a mensagem
  globalError.textContent = message;
  // Mostra a caixa de erro
  globalError.hidden = false;
  // Esconde a de sucesso
  globalSuccess.hidden = true;
}

// Mostra a mensagem de sucesso
function showGlobalSuccess(message) {
  // Escreve a mensagem
  globalSuccess.textContent = message;
  // Mostra a caixa de sucesso
  globalSuccess.hidden = false;
  // Esconde a de erro
  globalError.hidden = true;
}

// Esconde as duas mensagens
function hideGlobalMessages() {
  // Esconde o erro
  globalError.hidden = true;
  // Esconde o sucesso
  globalSuccess.hidden = true;
}

// Liga ou desliga o carregando do botão
function setLoading(isLoading) {
  // Desativa o botão enquanto carrega
  submitBtn.disabled = isLoading;
  // Mostra a rodinha
  spinner.hidden = !isLoading;
  // Esconde o texto
  btnText.hidden = isLoading;
  // Esconde a setinha
  arrow.hidden = isLoading;
}

// Gera um token aleatório simples só pra compor o link
// (sem backend, esse token não é validado depois — é só pra dar o formato do link)
// Cria um código aleatório
function generateToken() {
  // Se o navegador sabe gerar um código seguro...
  if (window.crypto && crypto.randomUUID) {
    // ...usa ele
    return crypto.randomUUID();
  }
  // Se não, monta um código com números aleatórios e a hora
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================
// VALIDAÇÃO EM TEMPO REAL
// ============================================
// Toda vez que a pessoa digita no e-mail...
emailInput.addEventListener("input", () => {
  // ...se está vazio ou já ficou válido...
  if (emailInput.value.trim() === "" || isValidEmail(emailInput.value)) {
    // ...apaga o erro
    clearFieldError();
  }
});

// ============================================
// ENVIO DO FORMULÁRIO
// ============================================
// Quando clicam em "Enviar"...
form.addEventListener("submit", async (event) => {
  // ...impede a página de recarregar
  event.preventDefault();
  // Esconde mensagens antigas
  hideGlobalMessages();
  // Apaga erro antigo
  clearFieldError();

  // Pega o e-mail digitado, sem espaços nas pontas
  const email = emailInput.value.trim();

  // Se está vazio...
  if (email === "") {
    // ...mostra o erro
    showFieldError("Digite seu e-mail.");
    // ...coloca o foco no campo
    emailInput.focus();
    // ...e para
    return;
  }

  // Se o formato é inválido...
  if (!isValidEmail(email)) {
    // ...mostra o erro
    showFieldError("Digite um e-mail válido.");
    // ...coloca o foco no campo
    emailInput.focus();
    // ...e para
    return;
  }

  // Liga o carregando
  setLoading(true);

  // Gera o código do link
  const token = generateToken();
  // Monta o link de redefinição com o código
  const resetLink = `${RESET_PAGE_URL}?token=${token}`;

  // Guarda neste navegador de qual e-mail é esse código (a página de redefinir usa para trocar a senha certa)
  try {
    // Pedidos anteriores
    const pedidos = JSON.parse(localStorage.getItem("sl-reset-pedidos") || "{}");
    // Liga o código ao e-mail
    pedidos[token] = email.toLowerCase();
    // Salva
    localStorage.setItem("sl-reset-pedidos", JSON.stringify(pedidos));
  } catch (erro) {
    // Se o navegador bloquear, segue sem guardar
  }

  // Tenta enviar...
  try {
    // Se o EmailJS está configurado...
    if (EMAILJS_CONFIGURADO) {
      // ...manda o e-mail de verdade
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        // para este e-mail
        to_email: email,
        // com este link
        reset_link: resetLink,
      });
    // Se não está...
    } else {
      // Modo demonstração: guarda o token e simula o tempo de envio
      // ...guarda o código no navegador
      sessionStorage.setItem("sl-reset-token", token);
      // ...e espera 1 segundo para parecer um envio
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Mensagem genérica de propósito: não confirma se o e-mail
    // existe cadastrado ou não (evita vazar quais e-mails têm conta)
    // Mostra a mensagem de sucesso
    showGlobalSuccess(
      "Se esse e-mail estiver cadastrado, você vai receber as instruções em instantes.",
    );
    // No modo demonstração...
    if (!EMAILJS_CONFIGURADO) {
      // ...cria um link
      const demoLink = document.createElement("a");
      // ...que leva para a página de redefinir
      demoLink.href = resetLink;
      // ...com o estilo de link de demonstração
      demoLink.className = "demo-link";
      // ...e este texto
      demoLink.textContent = "Modo demonstração: abrir link de redefinição →";
      // Coloca uma quebra de linha e o link dentro da mensagem
      globalSuccess.append(document.createElement("br"), demoLink);
    }
    // Limpa o formulário
    form.reset();
  // Se deu erro no envio...
  } catch (err) {
    // ...mostra o erro no console (para quem programa)
    console.error("Erro ao enviar e-mail:", err);
    // ...e mostra a mensagem de erro para a pessoa
    showGlobalError(
      "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.",
    );
  // Dando certo ou errado, no final...
  } finally {
    // ...desliga o carregando
    setLoading(false);
  }
});
