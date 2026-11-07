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
    "profissionais", "planos", "salvos", "academia", "perfil", "treino", "ranking", "comunidade", "exercicios", "programas", "corrida", "saude", "loja", "area-pro", "admin",
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

    // Botões de demonstração: cliente (com dados de exemplo) e administrador (painel)
    document.querySelectorAll("[data-demo-login]").forEach((botaoDemo) =>
      // Quando clicam...
      botaoDemo.addEventListener("click", async function () {
        // ...é o administrador?
        const admin = botaoDemo.dataset.demoLogin === "admin";
        // ...e-mail da conta de exemplo
        const email = admin ? "admin@saudelife.app" : "demo@saudelife.app";
        // ...preenche o formulário
        loginForm.querySelector("#email").value = email;
        // (senha de exemplo)
        loginForm.querySelector("#password").value = "demo1234";
        // ...cria a conta de exemplo se ainda não existe
        if (!F.acharConta(email)) {
          // Contas salvas
          const contas = JSON.parse(localStorage.getItem("sl-contas") || "[]");
          // Soma a conta de exemplo (com o hash da senha e o tipo)
          contas.push({ nome: admin ? "Academia Demonstração" : "Biel Demonstração", email, hash: await F.hashSenha(email, "demo1234"), criada: new Date().toISOString(), tipo: admin ? "admin" : "cliente" });
          // Salva
          localStorage.setItem("sl-contas", JSON.stringify(contas));
        }
        // ...cliente: depois de entrar, pula o questionário e enche os dados de exemplo
        if (!admin) sessionStorage.setItem("sl-demo-pendente", "1");
        // ...e entra como se tivesse clicado em Entrar
        loginForm.requestSubmit();
      }),
    );

    // Quando a pessoa clica em Entrar...
    loginForm.addEventListener("submit", async function (event) {
      // ...impede a página de recarregar
      event.preventDefault();
      // Se e-mail ou senha estão em branco ou com formato errado, para
      if (!F.validateLoginForm(loginForm)) return;
      // Confere se a conta existe e se a senha bate (pelo hash)
      const resultado = await F.checkLogin(loginForm);
      // Se deu erro...
      if (resultado.erro) {
        // ...mostra a mensagem
        F.showGlobalError(loginForm, resultado.erro);
        // ...coloca o foco na senha (para tentar de novo)
        loginForm.querySelector("#password").focus();
        // ...e para
        return;
      }
      // Guarda a sessão (quem está logado) no navegador
      F.startSession(loginForm, resultado.conta);
      // Mostra "Entrando..." e vai para a página do app (administrador vai direto para o painel)
      F.submitForm(loginForm, "Entrando...", resultado.conta.tipo === "admin" ? "../app/admin/admin.html" : destinoDepoisDoLogin());
    });
  });
})();
