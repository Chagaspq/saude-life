// Tamanho mínimo da senha: 8 caracteres
const MIN_PASSWORD_LENGTH = 8;

// Formulário de nova senha
const form = document.getElementById("reset-form");
// Campo da nova senha
const passwordInput = document.getElementById("new-password");
// Campo de confirmar a senha
const confirmInput = document.getElementById("confirm-new-password");
// Caixa de mensagem de erro geral
const globalError = document.getElementById("form-global-error");
// Caixa de mensagem de sucesso
const globalSuccess = document.getElementById("form-global-success");
// Botão de enviar
const submitBtn = form.querySelector(".btn-submit");
// Texto do botão
const btnText = submitBtn.querySelector(".btn-text");
// Rodinha de carregando do botão
const spinner = submitBtn.querySelector(".spinner");
// Setinha do botão
const arrow = submitBtn.querySelector(".arrow");

// Mostra (ou apaga) o erro de um campo
function setFieldError(input, message) {
  // Acha o lugar da mensagem de erro ligado ao campo
  const errorEl = document.getElementById(input.getAttribute("aria-describedby"));
  // Escreve a mensagem (ou deixa vazio)
  errorEl.textContent = message || "";
  // Se tem erro, marca o campo como inválido
  if (message) input.setAttribute("aria-invalid", "true");
  // Se não, tira a marcação
  else input.removeAttribute("aria-invalid");
}

// Liga ou desliga o "carregando" do botão
function setLoading(isLoading) {
  // Desativa o botão enquanto carrega
  submitBtn.disabled = isLoading;
  // Mostra a rodinha enquanto carrega
  spinner.hidden = !isLoading;
  // Esconde o texto enquanto carrega
  btnText.hidden = isLoading;
  // Esconde a setinha enquanto carrega
  arrow.hidden = isLoading;
}

// Sem backend, o token só confere com o que foi gerado na tela anterior
// Pega o código (token) que veio no link
const token = new URLSearchParams(window.location.search).get("token");
// Pega o código que foi gerado na tela "esqueci a senha"
const tokenSalvo = sessionStorage.getItem("sl-reset-token");

// Se não tem código, ou se ele não confere...
if (!token || (tokenSalvo && token !== tokenSalvo)) {
  // ...mostra o erro de link inválido
  globalError.textContent =
    "Este link de redefinição é inválido ou expirou. Solicite um novo.";
  // ...deixa a caixa de erro visível
  globalError.hidden = false;
  // ...e desativa o botão
  submitBtn.disabled = true;
}

// Para os dois campos de senha...
[passwordInput, confirmInput].forEach((input) => {
  // ...apaga o erro assim que a pessoa digita
  input.addEventListener("input", () => setFieldError(input, ""));
});

// Quando clicam em "Redefinir"...
form.addEventListener("submit", (event) => {
  // ...impede a página de recarregar
  event.preventDefault();
  // Se o botão está desativado, não faz nada
  if (submitBtn.disabled) return;

  // Começa achando que está tudo certo
  let isValid = true;

  // Se a senha é curta demais...
  if (passwordInput.value.length < MIN_PASSWORD_LENGTH) {
    // ...mostra o erro no campo da senha
    setFieldError(
      passwordInput,
      "A senha precisa ter no mínimo " + MIN_PASSWORD_LENGTH + " caracteres.",
    );
    // ...e marca que tem erro
    isValid = false;
  }

  // Se a confirmação é diferente da senha...
  if (confirmInput.value !== passwordInput.value) {
    // ...mostra o erro no campo de confirmar
    setFieldError(confirmInput, "As senhas não coincidem.");
    // ...e marca que tem erro
    isValid = false;
  }

  // Se teve algum erro, para aqui
  if (!isValid) return;

  // Liga o carregando
  setLoading(true);
  // Espera um pouquinho (simula o servidor)
  setTimeout(async () => {
    // Apaga o código usado (ele só vale uma vez)
    sessionStorage.removeItem("sl-reset-token");
    // Tenta trocar a senha da conta ligada a esse código
    try {
      // Pedidos de redefinição guardados pela página "esqueci a senha"
      const pedidos = JSON.parse(localStorage.getItem("sl-reset-pedidos") || "{}");
      // E-mail desse código
      const email = pedidos[token];
      // Se achou o e-mail, guarda o hash da senha nova
      if (email && window.SaudeLifeForm) await window.SaudeLifeForm.trocarSenha(email, passwordInput.value);
      // O código não vale mais
      delete pedidos[token];
      // Salva os pedidos sem ele
      localStorage.setItem("sl-reset-pedidos", JSON.stringify(pedidos));
    } catch (erro) {
      // Se o navegador bloquear, segue (a mensagem de sucesso aparece igual)
    }
    // Mostra a mensagem de sucesso
    globalSuccess.textContent = "Senha alterada! Redirecionando para o login...";
    // Deixa a caixa de sucesso visível
    globalSuccess.hidden = false;
    // Espera mais um pouco...
    setTimeout(() => {
      // ...e leva para o login
      window.location.href = "../login/login.html";
    }, 1200);
  }, 900);
});
