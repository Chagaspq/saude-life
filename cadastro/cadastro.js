// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Pega as funções de formulário de shared/form-utils.js
  const F = window.SaudeLifeForm;
  // Atalho para achar um elemento
  const qs = F.qs;
  // Atalho para mostrar erro num campo
  const setFieldError = F.setFieldError;
  // Atalho para apagar erro de um campo
  const clearFieldError = F.clearFieldError;
  // Atalho para mostrar o erro geral do formulário
  const showGlobalError = F.showGlobalError;
  // Atalho para validar o e-mail
  const validateEmailField = F.validateEmailField;
  // Atalho para validar a senha
  const validatePasswordField = F.validatePasswordField;

  // Confere todos os campos do cadastro
  function validateCadastroForm(form) {
    // Começa achando que está tudo certo
    let isValid = true;
    // Campo do nome
    const name = qs("#name", form);
    // Campo do e-mail
    const email = qs("#email", form);
    // Campo da senha
    const password = qs("#password", form);
    // Campo de confirmar a senha
    const confirmPassword = qs("#confirm-password", form);
    // Caixinha de aceitar os termos
    const terms = qs("#terms", form);

    // Se o campo de nome existe...
    if (name) {
      // ...e está vazio...
      if (!name.value.trim()) {
        // ...mostra o erro
        setFieldError(name, "Digite seu nome completo.");
        // ...e marca que tem erro
        isValid = false;
      // Se não está vazio...
      } else {
        // ...apaga o erro
        clearFieldError(name);
      }
    }

    // Se o e-mail é inválido, marca erro
    if (!validateEmailField(email)) isValid = false;
    // Se a senha é inválida, marca erro
    if (!validatePasswordField(password)) isValid = false;

    // Se os dois campos de senha existem...
    if (password && confirmPassword) {
      // ...e a confirmação é diferente...
      if (confirmPassword.value !== password.value) {
        // ...mostra o erro
        setFieldError(confirmPassword, "As senhas não coincidem.");
        // ...e marca que tem erro
        isValid = false;
      // Se são iguais...
      } else {
        // ...apaga o erro
        clearFieldError(confirmPassword);
      }
    }

    // Se não aceitou os termos...
    if (terms && !terms.checked) {
      // ...mostra o erro geral
      showGlobalError(
        form,
        "Você precisa aceitar os Termos de Uso para continuar.",
      );
      // ...e marca que tem erro
      isValid = false;
    }

    // Se teve erro...
    if (!isValid) {
      // ...acha o primeiro campo com erro
      const firstInvalid = form.querySelector(".form-group.has-error input");
      // Se achou...
      if (firstInvalid) {
        // ...coloca o foco nele
        firstInvalid.focus();
      // Se o erro é só nos termos...
      } else if (terms && !terms.checked) {
        // ...coloca o foco na caixinha
        terms.focus();
      }
    }

    // Devolve se o formulário está certo
    return isValid;
  }

  // Espera o HTML da página carregar inteiro
  document.addEventListener("DOMContentLoaded", function () {
    // Pega o formulário de cadastro
    const cadastroForm = document.getElementById("cadastro-form");
    // Se não achou, para aqui
    if (!cadastroForm) return;
    // Desliga a validação padrão do navegador (usamos a nossa)
    cadastroForm.setAttribute("novalidate", "");

    // Liga o botão de mostrar/esconder senha
    F.initPasswordToggle(cadastroForm);
    // Liga os botões de Google/Apple
    F.initSocialButtons();
    // O medidor de força só faz sentido no cadastro
    // Liga a barrinha de força da senha
    F.initPasswordStrength(cadastroForm);
    // Apaga o erro assim que a pessoa volta a digitar
    F.clearErrorOnInput(cadastroForm);

    // Quando clicam em "Criar conta"...
    cadastroForm.addEventListener("submit", function (event) {
      // ...impede a página de recarregar
      event.preventDefault();
      // Se está tudo certo...
      if (validateCadastroForm(cadastroForm)) {
        // ...salva a conta no navegador
        F.saveAccount(cadastroForm);
        // ...e mostra o carregando
        F.submitForm(
          // (formulário)
          cadastroForm,
          // (texto do botão enquanto carrega)
          "Criando conta...",
          // (vai para o login com o aviso de conta criada)
          "../login/login.html?cadastro=sucesso",
        );
      }
    });
  });
})();
