// Profissionais: filtro por especialidade + seguir
window.SL &&
  SL.pagina(() => {
    const { el } = SL;
    const { PROFISSIONAIS } = window.SL_DADOS;
    let especialidadeAtiva = "";
    const grid = document.querySelector(".professionals-grid");
    const filtros = document.querySelector('[data-render="pros-filtros"]');
    const especialidades = [...new Set(PROFISSIONAIS.map((p) => p.especialidade))];

    function render() {
      filtros.replaceChildren(
        ...["", ...especialidades].map((esp) =>
          el("button", {
            class: "category-pill" + (esp === especialidadeAtiva ? " active" : ""),
            "data-especialidade": esp,
            "aria-pressed": String(esp === especialidadeAtiva),
            text: esp || "Todos",
          }),
        ),
      );

      const lista = PROFISSIONAIS.filter((p) => !especialidadeAtiva || p.especialidade === especialidadeAtiva);
      grid.replaceChildren(...lista.map(SL.cardProfissional));
    }

    filtros.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-especialidade]");
      if (!btn) return;
      especialidadeAtiva = btn.dataset.especialidade;
      render();
    });

    SL.carregar(grid, render, 6);
  });
