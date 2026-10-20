// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Pega as funções de formulário que ficam em shared/form-utils.js
  const F = window.SaudeLifeForm;

  // Páginas do app que podem ser pedidas em ?voltar= (evita redirecionar para fora)
  // Lista das páginas do app permitidas depois do login
  const PAGINAS_APP = [
    "inicio", "descobrir", "treinos", "aulas", "alimentacao", "evolucao",
    "profissionais", "planos", "salvos", "academia", "perfil", "treino",
  ];

  // Descobre para qual página ir depois de entrar
  function destinoDepoisDoLogin() {
    // Lê o ?voltar= do endereço (a página que a pessoa queria abrir)
    const voltar = new URLSearchParams(window.location.search).get("voltar");
    // Se for uma página permitida usa ela; se não, vai para o Início
    const pagina = PAGINAS_APP.includes(voltar) ? voltar : "inicio";
    // Monta o caminho da página (ex.: ../app/inicio/inicio.html)
    return "../app/" + pagina + "/" + pagina + ".html";
  }

  // Espera o HTML da página carregar inteiro
  document.addEventListener("DOMContentLoaded", function () {
    // Pega o formulário de login
    const loginForm = document.getElementById("login-form");
    // Se não achou o formulário, para por aqui
    if (!loginForm) return;
    // Desliga a validação padrão do navegador (usamos a nossa)
    loginForm.setAttribute("novalidate", "");

    // Liga o botão de mostrar/esconder senha
    F.initPasswordToggle(loginForm);
    // Liga os botões de entrar com Google/Apple
    F.initSocialButtons();
    // Mostra "conta criada" se a pessoa veio do cadastro
    F.checkCadastroSuccess(loginForm);
    // Apaga a mensagem de erro quando a pessoa volta a digitar
    F.clearErrorOnInput(loginForm);

    // Quando a pessoa clica em Entrar...
    loginForm.addEventListener("submit", function (event) {
      // ...impede a página de recarregar
      event.preventDefault();
      // Se e-mail e senha estão válidos...
      if (F.validateLoginForm(loginForm)) {
        // ...guarda a sessão (quem está logado) no navegador
        F.startSession(loginForm);
        // ...mostra "Entrando..." e vai para a página do app
        F.submitForm(loginForm, "Entrando...", destinoDepoisDoLogin());
      }
    });
  });
})();
