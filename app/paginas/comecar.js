// Questionário de primeiro acesso: objetivo, nível e dias por semana.
// As respostas personalizam o Início (recomendados e meta semanal).
window.SL &&
  SL.pagina(() => {
    const form = document.getElementById("onboarding-form");
    const passos = Array.from(form.querySelectorAll("[data-step]"));
    const voltar = form.querySelector('[data-action="passo-voltar"]');
    const botao = form.querySelector('[data-render="passo-botao"]');
    const barra = document.querySelector('[data-render="passo-barra"]');
    let atual = 0;

    const ROTULOS = {
      Hipertrofia: "Ganhar massa muscular",
      HIIT: "Emagrecer",
      "Resistência": "Melhorar o condicionamento",
      "Yoga & Mobilidade": "Flexibilidade e bem-estar",
    };

    // Refazendo o questionário: começa com as respostas anteriores
    const anterior = SL.storage.get("sl-onboarding", null);
    if (anterior) {
      ["objetivo", "nivel", "dias"].forEach((campo) => {
        const opcao = form.querySelector(`input[name="${campo}"][value="${anterior[campo]}"]`);
        if (opcao) opcao.checked = true;
      });
    }

    function mostrar(indice, focar = true) {
      atual = indice;
      passos.forEach((p, i) => (p.hidden = i !== atual));
      voltar.hidden = atual === 0;
      botao.textContent = atual === passos.length - 1 ? "Começar a treinar" : "Continuar";
      const pct = Math.round(((atual + 1) / passos.length) * 100);
      document.querySelector('[data-render="passo-texto"]').textContent = `Passo ${atual + 1} de ${passos.length}`;
      barra.setAttribute("aria-valuenow", pct);
      barra.querySelector(".fill").dataset.progress = pct;
      SL.aplicarProgresso();
      if (!focar) return;
      const marcado = passos[atual].querySelector("input:checked") || passos[atual].querySelector("input");
      marcado.focus();
    }

    function concluir(respostas) {
      SL.storage.set("sl-onboarding", { ...respostas, rotulo: ROTULOS[respostas.objetivo], data: new Date().toISOString() });
      window.location.href = "inicio.html";
    }

    function lerRespostas() {
      const valor = (nome) => (form.querySelector(`input[name="${nome}"]:checked`) || {}).value;
      return { objetivo: valor("objetivo"), nivel: valor("nivel"), dias: Number(valor("dias")) };
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (atual < passos.length - 1) mostrar(atual + 1);
      else concluir(lerRespostas());
    });

    SL.acao("passo-voltar", () => mostrar(atual - 1));
    SL.acao("pular-onboarding", () => concluir({ objetivo: "Hipertrofia", nivel: "Intermediário", dias: 4 }));

    mostrar(0, false);
  });
