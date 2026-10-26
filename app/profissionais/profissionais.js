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
    // Caixa de preço
    const selPreco = document.querySelector('[data-render="pros-preco"]');
    // Caixa de ordem
    const selOrdem = document.querySelector('[data-render="pros-ordem"]');
    // Mudar cidade, online, preço ou ordem desenha de novo
    [selCidade, soOnline, selPreco, selOrdem].forEach((x) => x.addEventListener("change", render));
    // Preço em número (primeiro valor que aparece no texto, ex.: "R$ 180 a consulta" vira 180)
    const precoDe = (p) => Number((p.preco.match(/\d+/) || [0])[0]);

    // Cria uma parte do desenho (SVG) já com o que vai dentro
    const desenho = (tag, attrs, filhos = []) => {
      // Parte do desenho
      const n = SL.svg(tag, attrs);
      // Coloca o que vai dentro
      n.append(...filhos);
      // Devolve
      return n;
    };

    // Posição de cada cidade no mapa desenhado (x, y num quadro de 300 x 220)
    const CIDADES = { "Belo Horizonte": [190, 70], "Rio de Janeiro": [215, 140], "São Paulo": [120, 160] };

    // Desenha o mapa com um alfinete por cidade (tocar no alfinete filtra a cidade)
    function renderMapa(lista) {
      // Lugar do mapa
      const fig = document.querySelector('[data-render="pros-mapa"]');
      // Quantos profissionais por cidade (com os filtros, menos o de cidade)
      const porCidade = {};
      // Conta
      lista.forEach((p) => (porCidade[p.cidade] = (porCidade[p.cidade] || 0) + 1));
      // Desenho
      const mapa = desenho("svg", { viewBox: "0 0 300 220", class: "pros-mapa-svg", role: "group", "aria-label": "Mapa das cidades com profissionais" }, [
        // Terra (forma simples do Sudeste)
        desenho("path", { class: "pros-mapa-terra", d: "M30 60 L90 20 L170 15 L250 40 L280 100 L250 150 L200 175 L140 200 L80 195 L40 150 Z" }),
        // Mar (linha da costa)
        desenho("path", { class: "pros-mapa-costa", d: "M280 100 L250 150 L200 175 L140 200 L80 195" }),
        // Um alfinete por cidade
        ...Object.entries(CIDADES).map(([cidade, [x, y]]) => {
          // Quantos tem
          const n = porCidade[cidade] || 0;
          // Está escolhida?
          const ativa = selCidade.value === cidade;
          // Alfinete (é um botão para teclado e leitor de tela)
          const g = desenho("g", { class: "pros-pino" + (ativa ? " is-ativo" : "") + (n ? "" : " is-vazio"), tabindex: 0, role: "button", "aria-pressed": String(ativa), "aria-label": `${cidade}: ${n} profissiona${n === 1 ? "l" : "is"}`, "data-cidade": cidade }, [
            // Gota do alfinete
            desenho("path", { d: `M${x} ${y} c-9 -12 -12 -16 -12 -22 a12 12 0 0 1 24 0 c0 6 -3 10 -12 22z` }),
            // Número dentro
            desenho("text", { x, y: y - 18, "text-anchor": "middle" }, [String(n)]),
            // Nome da cidade
            desenho("text", { x, y: y + 14, "text-anchor": "middle", class: "pros-pino-nome" }, [cidade]),
          ]);
          // Devolve
          return g;
        }),
      ]);
      // Escolher a cidade pelo alfinete (clique ou Enter)
      const escolher = (e) => {
        // Alfinete
        const pino = e.target.closest("[data-cidade]");
        // Se não foi num alfinete, ou tecla diferente de Enter/espaço, para
        if (!pino || (e.type === "keydown" && !["Enter", " "].includes(e.key))) return;
        // Não rola a página com o espaço
        e.preventDefault();
        // Tocar de novo na mesma cidade tira o filtro
        selCidade.value = selCidade.value === pino.dataset.cidade ? "" : pino.dataset.cidade;
        // Desenha
        render();
      };
      // Clique
      mapa.addEventListener("click", escolher);
      // Teclado
      mapa.addEventListener("keydown", escolher);
      // Troca o mapa e a legenda
      fig.replaceChildren(mapa, el("figcaption", { class: "meta", text: "Toque numa cidade para filtrar. No perfil de cada profissional tem o link do Google Maps." }));
    }

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
      const semCidade = PROFISSIONAIS.filter((p) => (!especialidadeAtiva || p.especialidade === especialidadeAtiva) && (!soOnline.checked || p.online) && (!selPreco.value || precoDe(p) <= Number(selPreco.value)));
      // Agora aplica a cidade
      const lista = semCidade.filter((p) => !selCidade.value || p.cidade === selCidade.value);
      // Ordena: menor preço ou melhor nota
      lista.sort((a, b) => (selOrdem.value === "preco" ? precoDe(a) - precoDe(b) : b.nota - a.nota));
      // Desenha o mapa (contando sem o filtro de cidade)
      renderMapa(semCidade);
      // Mostra um card para cada profissional da lista
      grid.replaceChildren(...lista.map(SL.cardProfissional));
      // Nenhum encontrado: mensagem
      if (!lista.length) grid.append(SL.estadoVazio("Ninguém com esses filtros", "Tente outra cidade, outro preço ou marque quem atende online.", null));
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
