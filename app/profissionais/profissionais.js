// Profissionais: filtros (especialidade, cidade, online), quem acompanha você, perfil e chat
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
    // Caixa de cidade
    const selCidade = document.querySelector('[data-render="pros-cidade"]');
    // Caixinha de "só online"
    const soOnline = document.querySelector('[data-render="pros-online"]');
    // Preenche as cidades (sem repetir)
    selCidade.replaceChildren(el("option", { value: "", text: "Todas as cidades" }), ...[...new Set(PROFISSIONAIS.map((p) => p.cidade))].map((c) => el("option", { value: c, text: c })));
    // Mudar a cidade ou o "online" desenha de novo
    [selCidade, soOnline].forEach((x) => x.addEventListener("change", render));

    // Desenha "Quem acompanha você"
    function renderMeus() {
      // Nomes dos profissionais contratados
      const meus = SL.storage.get("sl-meus-pros", []);
      // Lugar da seção
      const alvo = document.querySelector('[data-render="meus-pros"]');
      // Se não tem nenhum, esconde
      alvo.hidden = !meus.length;
      // Troca o conteúdo
      alvo.replaceChildren(
        // Título
        el("h2", { text: "Quem acompanha você" }),
        // Lista
        el("ul", { class: "meus-pros-lista" }, meus.map((nome) => {
          // Profissional
          const p = PROFISSIONAIS.find((x) => x.nome === nome);
          // Item com bolinha, nome e botão de chat
          return el("li", {}, [
            // Bolinha
            el("span", { class: "pro-avatar avatar-initials", "aria-hidden": "true", text: SL.initials(nome) }),
            // Nome e especialidade
            el("div", {}, [el("strong", { text: nome }), el("span", { class: "meta", text: p.especialidade })]),
            // Chat
            el("button", { type: "button", class: "btn-secondary", "data-action": "chat-pro", "data-nome": nome, text: "Conversar" }),
          ]);
        })),
      );
    }

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

      // Separa os profissionais que passam nos filtros (especialidade, cidade e online)
      const lista = PROFISSIONAIS.filter((p) => (!especialidadeAtiva || p.especialidade === especialidadeAtiva) && (!selCidade.value || p.cidade === selCidade.value) && (!soOnline.checked || p.online));
      // Mostra um card para cada profissional da lista
      grid.replaceChildren(...lista.map(SL.cardProfissional));
      // Nenhum encontrado: mensagem
      if (!lista.length) grid.append(SL.estadoVazio("Ninguém com esses filtros", "Tente outra cidade ou marque quem atende online.", null));
      // Atualiza "Quem acompanha você"
      renderMeus();
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
