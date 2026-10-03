// Profissionais: filtro por especialidade + seguir
window.SL &&
  SL.pagina(() => {
    const { el, storage } = SL;
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

      const seguindo = storage.get("sl-seguindo", []);
      const lista = PROFISSIONAIS.filter((p) => !especialidadeAtiva || p.especialidade === especialidadeAtiva);
      grid.replaceChildren(
        ...lista.map((p) => {
          const segue = seguindo.includes(p.nome);
          return el("article", { class: "pro-card" }, [
            el("span", { class: "pro-avatar avatar-initials", "aria-hidden": "true", text: SL.initials(p.nome) }),
            el("h3", { text: p.nome }),
            el("p", { class: "specialty", text: p.especialidade }),
            el("p", { class: "stats" }, [SL.nota(p.nota), ` • ${p.seguidores} seguidores`]),
            el("button", {
              class: segue ? "btn-primary" : "btn-secondary",
              "data-action": "follow-pro",
              "data-nome": p.nome,
              "aria-pressed": String(segue),
              text: segue ? "Seguindo" : "Seguir",
            }),
          ]);
        }),
      );
    }

    filtros.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-especialidade]");
      if (!btn) return;
      especialidadeAtiva = btn.dataset.especialidade;
      render();
    });

    SL.carregar(grid, render, 6);
  });
