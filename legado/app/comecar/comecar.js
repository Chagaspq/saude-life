// Questionário de primeiro acesso: objetivo, nível e dias por semana.
// As respostas personalizam o Início (recomendados e meta semanal).
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega o formulário do questionário
    const form = document.getElementById("onboarding-form");
    // Pega todos os passos (perguntas) do questionário
    const passos = Array.from(form.querySelectorAll("[data-step]"));
    // Botão de voltar um passo
    const voltar = form.querySelector('[data-action="passo-voltar"]');
    // Botão de continuar/começar
    const botao = form.querySelector('[data-render="passo-botao"]');
    // Barra de progresso no topo
    const barra = document.querySelector('[data-render="passo-barra"]');
    // Número do passo em que a pessoa está (começa no 0)
    let atual = 0;

    // Texto amigável para cada objetivo
    const ROTULOS = {
      Hipertrofia: "Ganhar massa muscular",
      HIIT: "Emagrecer",
      "Resistência": "Melhorar o condicionamento",
      "Yoga & Mobilidade": "Flexibilidade e bem-estar",
    };

    // Lê as respostas salvas antes (se a pessoa já respondeu)
    // Refazendo o questionário: começa com as respostas anteriores
    // Se já respondeu antes...
    const anterior = SL.storage.get("sl-onboarding", null) || SL.storage.get("sl-quiz", null);
    // ...para cada pergunta...
    if (anterior) {
      // ...acha a opção que foi escolhida
      ["objetivo", "nivel", "dias"].forEach((campo) => {
        // ...e deixa ela marcada
        const opcao = form.querySelector(`input[name="${campo}"][value="${anterior[campo]}"]`);
        if (opcao) opcao.checked = true;
      });
    }

    // Mostra só o passo indicado
    function mostrar(indice, focar = true) {
      // Guarda em qual passo estamos
      atual = indice;
      // Esconde todos os passos, menos o atual
      passos.forEach((p, i) => (p.hidden = i !== atual));
      // Esconde o "voltar" no primeiro passo
      voltar.hidden = atual === 0;
      // No último passo o botão vira "Começar a treinar"
      botao.textContent = atual === passos.length - 1 ? "Começar a treinar" : "Continuar";
      // Calcula a porcentagem do progresso
      const pct = Math.round(((atual + 1) / passos.length) * 100);
      // Mostra "Passo X de Y"
      document.querySelector('[data-render="passo-texto"]').textContent = `Passo ${atual + 1} de ${passos.length}`;
      // Avisa leitores de tela quanto já foi feito
      barra.setAttribute("aria-valuenow", pct);
      // Guarda a porcentagem na barra
      barra.querySelector(".fill").dataset.progress = pct;
      // Pede para o núcleo pintar a barra com a porcentagem
      SL.aplicarProgresso();
      // Se não precisa focar, para aqui
      if (!focar) return;
      // Acha a opção marcada (ou a primeira) do passo atual
      const marcado = passos[atual].querySelector("input:checked") || passos[atual].querySelector("input");
      // Coloca o foco nela (bom para quem usa teclado)
      marcado.focus();
    }

    // Termina o questionário
    function concluir(respostas) {
      // Salva as respostas, o texto do objetivo e a data de hoje
      SL.storage.set("sl-onboarding", { ...respostas, rotulo: ROTULOS[respostas.objetivo], data: new Date().toISOString() });
      // Vai para a página Início
      window.location.href = "../inicio/inicio.html";
    }

    // Junta as respostas marcadas
    function lerRespostas() {
      // Função que pega o valor marcado de uma pergunta
      const valor = (nome) => (form.querySelector(`input[name="${nome}"]:checked`) || {}).value;
      // Devolve objetivo, nível e dias (dias vira número)
      return { objetivo: valor("objetivo"), nivel: valor("nivel"), dias: Number(valor("dias")) };
    }

    // Quando clicam em Continuar...
    form.addEventListener("submit", (e) => {
      // ...impede a página de recarregar
      e.preventDefault();
      // Se ainda tem passos, vai para o próximo
      if (atual < passos.length - 1) mostrar(atual + 1);
      // Se era o último, termina
      else concluir(lerRespostas());
    });

    // Botão voltar: vai para o passo anterior
    SL.acao("passo-voltar", () => mostrar(atual - 1));
    // Botão pular: termina com respostas padrão
    SL.acao("pular-onboarding", () => concluir({ objetivo: "Hipertrofia", nivel: "Intermediário", dias: 4 }));

    // Começa mostrando o primeiro passo, sem mexer no foco
    mostrar(0, false);
  });
