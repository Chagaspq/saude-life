// Descobrir: filtros reais (objetivo, nível, duração, grupo) + chips de categoria
window.SL &&
  SL.pagina(() => {
    const { CATALOGO } = window.SL_DADOS;
    const filtros = { objetivo: "", nivel: "", duracao: "", grupo: "" };
    const grid = document.querySelector('[data-render="descobrir"]');
    const contador = document.querySelector('[data-render="descobrir-count"]');
    const btnLimpar = document.querySelector('[data-action="clear-filters"]');

    function faixaDuracao(min) {
      if (min <= 20) return "curto";
      if (min <= 40) return "medio";
      return "longo";
    }

    function render() {
      const resultado = CATALOGO.filter(
        (t) =>
          (!filtros.objetivo || t.objetivo === filtros.objetivo) &&
          (!filtros.nivel || t.nivel === filtros.nivel) &&
          (!filtros.duracao || faixaDuracao(t.duracao) === filtros.duracao) &&
          (!filtros.grupo || t.grupo === filtros.grupo),
      );

      grid.replaceChildren(...resultado.map(SL.cardTreinoCatalogo));
      if (!resultado.length) {
        grid.append(SL.estadoVazio("Nenhum treino encontrado", "Tente remover algum filtro.", null));
      }
      contador.textContent = `(${resultado.length})`;
      btnLimpar.hidden = !Object.values(filtros).some(Boolean);

      document.querySelectorAll(".category-pill[data-category]").forEach((pill) => {
        const ativo = pill.dataset.category === filtros.objetivo;
        pill.classList.toggle("active", ativo);
        pill.setAttribute("aria-pressed", String(ativo));
      });
      document.querySelectorAll("[data-filter]").forEach((select) => {
        select.value = filtros[select.dataset.filter];
      });
    }

    document.querySelectorAll("[data-filter]").forEach((select) => {
      select.addEventListener("change", () => {
        filtros[select.dataset.filter] = select.value;
        render();
      });
    });

    document.querySelectorAll(".category-pill[data-category]").forEach((pill) => {
      pill.addEventListener("click", () => {
        filtros.objetivo = filtros.objetivo === pill.dataset.category ? "" : pill.dataset.category;
        render();
      });
    });

    SL.acao("clear-filters", () => {
      Object.keys(filtros).forEach((k) => (filtros[k] = ""));
      render();
    });

    SL.carregar(grid, render, 6);
  });
