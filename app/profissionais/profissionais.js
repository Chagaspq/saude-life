// Profissionais: filtro por especialidade + seguir
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo a função que cria elementos HTML
    const { el } = SL;
    // Pega a lista de profissionais do arquivo de dados
    const { PROFISSIONAIS } = window.SL_DADOS;
    // Especialidade escolhida no filtro (vazio = todas)
    let especialidadeAtiva = "";
    // Grade onde os cards dos profissionais aparecem
    const grid = document.querySelector(".professionals-grid");
    // Área onde ficam os botões de filtro
    const filtros = document.querySelector('[data-render="pros-filtros"]');
    // Lista das especialidades, sem repetir nenhuma
    const especialidades = [...new Set(PROFISSIONAIS.map((p) => p.especialidade))];

    // Função que desenha filtros e cards na tela
    function render() {
      // Troca os botões de filtro pelos novos
      filtros.replaceChildren(
        // Um botão para "Todos" (vazio) e um para cada especialidade
        ...["", ...especialidades].map((esp) =>
          // Cria o botão
          el("button", {
            // Fica marcado (active) se for o filtro escolhido
            class: "category-pill" + (esp === especialidadeAtiva ? " active" : ""),
            // Guarda no botão qual especialidade ele filtra
            "data-especialidade": esp,
            // Avisa leitores de tela se o botão está pressionado
            "aria-pressed": String(esp === especialidadeAtiva),
            // Texto do botão (o vazio vira "Todos")
            text: esp || "Todos",
          }),
        ),
      );

      // Separa só os profissionais da especialidade escolhida (ou todos)
      const lista = PROFISSIONAIS.filter((p) => !especialidadeAtiva || p.especialidade === especialidadeAtiva);
      // Mostra um card para cada profissional da lista
      grid.replaceChildren(...lista.map(SL.cardProfissional));
    }

    // Quando clicam em algum lugar da área de filtros...
    filtros.addEventListener("click", (e) => {
      // ...descobre qual botão de filtro foi clicado
      const btn = e.target.closest("[data-especialidade]");
      // Se não foi num botão, não faz nada
      if (!btn) return;
      // Guarda a especialidade do botão clicado
      especialidadeAtiva = btn.dataset.especialidade;
      // Desenha a tela de novo com o filtro novo
      render();
    });

    // Mostra 6 cards de carregando e depois desenha a página
    SL.carregar(grid, render, 6);
  });
