// Descobrir: filtros reais (objetivo, nível, duração, grupo) + chips de categoria
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega a lista de todos os treinos (o catálogo)
    const { CATALOGO } = window.SL_DADOS;
    // Filtros escolhidos (vazio = sem filtro)
    const filtros = { objetivo: "", nivel: "", duracao: "", grupo: "" };
    // Grade onde os treinos aparecem
    const grid = document.querySelector('[data-render="descobrir"]');
    // Lugar que mostra quantos treinos foram achados
    const contador = document.querySelector('[data-render="descobrir-count"]');
    // Botão de limpar os filtros
    const btnLimpar = document.querySelector('[data-action="clear-filters"]');

    // Diz se o treino é curto, médio ou longo pelos minutos
    function faixaDuracao(min) {
      // Até 20 minutos é curto
      if (min <= 20) return "curto";
      // Até 40 minutos é médio
      if (min <= 40) return "medio";
      // Mais que isso é longo
      return "longo";
    }

    // Função que desenha os resultados na tela
    function render() {
      // Separa só os treinos que passam em todos os filtros
      const resultado = CATALOGO.filter(
        // Para cada treino t...
        (t) =>
          // ...o objetivo bate (ou não tem filtro de objetivo)
          (!filtros.objetivo || t.objetivo === filtros.objetivo) &&
          // ...o nível bate (ou não tem filtro de nível)
          (!filtros.nivel || t.nivel === filtros.nivel) &&
          // ...a duração bate (ou não tem filtro de duração)
          (!filtros.duracao || faixaDuracao(t.duracao) === filtros.duracao) &&
          // ...o grupo muscular bate (ou não tem filtro de grupo)
          (!filtros.grupo || t.grupo === filtros.grupo),
      );

      // Mostra um card para cada treino achado
      grid.replaceChildren(...resultado.map(SL.cardTreinoCatalogo));
      // Se não achou nenhum...
      if (!resultado.length) {
        // ...mostra a mensagem de nada encontrado
        grid.append(SL.estadoVazio("Nenhum treino encontrado", "Tente remover algum filtro.", null));
      }
      // Mostra o número de resultados, ex.: (12)
      contador.textContent = `(${resultado.length})`;
      // Só mostra o botão de limpar se algum filtro está ativo
      btnLimpar.hidden = !Object.values(filtros).some(Boolean);

      // Para cada chip de categoria...
      document.querySelectorAll(".category-pill[data-category]").forEach((pill) => {
        // ...vê se ele é o objetivo escolhido
        const ativo = pill.dataset.category === filtros.objetivo;
        // ...deixa ele destacado se for
        pill.classList.toggle("active", ativo);
        // ...e avisa leitores de tela que está pressionado
        pill.setAttribute("aria-pressed", String(ativo));
      });
      // Para cada caixa de seleção...
      document.querySelectorAll("[data-filter]").forEach((select) => {
        // ...mostra o valor do filtro atual
        select.value = filtros[select.dataset.filter];
      });
    }

    // Para cada caixa de seleção de filtro...
    document.querySelectorAll("[data-filter]").forEach((select) => {
      // ...quando a pessoa escolhe uma opção...
      select.addEventListener("change", () => {
        // ...guarda a escolha no filtro certo
        filtros[select.dataset.filter] = select.value;
        // ...e desenha de novo
        render();
      });
    });

    // Para cada chip de categoria...
    document.querySelectorAll(".category-pill[data-category]").forEach((pill) => {
      // ...quando clicam nele...
      pill.addEventListener("click", () => {
        // ...liga o filtro; se já estava ligado, desliga
        filtros.objetivo = filtros.objetivo === pill.dataset.category ? "" : pill.dataset.category;
        // ...e desenha de novo
        render();
      });
    });

    // Quando clicam em "limpar filtros"...
    SL.acao("clear-filters", () => {
      // ...esvazia todos os filtros
      Object.keys(filtros).forEach((k) => (filtros[k] = ""));
      // ...e desenha de novo
      render();
    });

    // Mostra 6 cards de carregando e depois desenha a página
    SL.carregar(grid, render, 6);

    /* Coleções em faixas que rolam para o lado */
    // Biblioteca de exercícios (para saber o que dá para fazer em casa)
    const BIBLIOTECA = window.SL_EXERCICIOS || {};
    // Diz se todos os exercícios de um treino dão para fazer em casa
    const emCasa = (t) => SL.exerciciosDe(t).every((e) => (BIBLIOTECA[e.nome] || {}).lugar !== "academia");
    // Lista das coleções: título, texto e quais treinos entram
    const COLECOES = [
      // Iniciantes
      ["Para começar com o pé direito", "Treinos para iniciantes", (t) => t.nivel === "Iniciante"],
      // Em casa
      ["Dá pra fazer em casa", "Sem aparelho de academia", emCasa],
      // Em alta
      ["Em alta na galera", "Os mais bem avaliados", (t) => t.nota >= 4.8],
      // Rápidos
      ["Rapidinhos", "Até 20 minutos", (t) => t.duracao <= 20],
    ];
    // Desenha as coleções
    document.querySelector('[data-render="colecoes"]').replaceChildren(
      // Uma seção para cada coleção que tem treino
      ...COLECOES.map(([titulo, texto, filtro], i) => {
        // Treinos da coleção (os mais bem avaliados primeiro)
        const lista = CATALOGO.filter(filtro).sort((a, b) => b.nota - a.nota);
        // Se não tem nenhum, não mostra
        if (!lista.length) return null;
        // Seção da coleção
        return SL.el("section", { class: "colecao", "aria-labelledby": "colecao-" + i }, [
          // Topo: título e texto
          SL.el("div", { class: "section-head" }, [SL.el("h2", { id: "colecao-" + i, text: titulo }), SL.el("span", { class: "meta", text: `${texto} • ${lista.length}` })]),
          // Faixa que rola para o lado
          SL.el("div", { class: "horizontal-scroll" }, lista.map(SL.cardTreinoCatalogo)),
        ]);
      }).filter(Boolean),
    );
  });
