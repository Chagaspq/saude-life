// Exercícios: biblioteca com busca, filtros (músculo, equipamento, lugar), favoritos
// e o passo a passo de cada movimento (o Pulso em 3 momentos).
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ícones e ler/salvar dados
    const { el, storage } = SL;
    // Biblioteca de exercícios
    const BIBLIOTECA = window.SL_EXERCICIOS || {};
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Campos de filtro
    const filtro = (nome) => document.querySelector(`[data-filtro="${nome}"]`);
    // Nomes dos lugares
    const LUGARES = { casa: "Em casa", academia: "Academia", ambos: "Casa ou academia" };
    // Mostrando só favoritos?
    let soFavoritos = false;

    // Favoritos salvos (nomes dos exercícios)
    const favoritos = () => storage.get("sl-ex-favoritos", []);

    // Preenche um filtro com as opções que existem na biblioteca
    function preencher(nome, campo) {
      // Valores sem repetir, em ordem alfabética
      const valores = [...new Set(Object.values(BIBLIOTECA).map((x) => x[campo]))].sort((a, b) => a.localeCompare(b, "pt-BR"));
      // Uma opção para cada valor
      valores.forEach((v) => filtro(nome).append(el("option", { value: v, text: v })));
    }
    // Músculos (grupos)
    preencher("grupo", "grupo");
    // Equipamentos
    preencher("equip", "equip");

    // Tira acentos e deixa minúsculo (para a busca achar "rosca" em "Rosca")
    const simples = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    // Desenha a grade conforme os filtros
    function render() {
      // Texto da busca
      const busca = simples(filtro("busca").value.trim());
      // Filtros escolhidos
      const grupo = filtro("grupo").value;
      // Equipamento escolhido
      const equip = filtro("equip").value;
      // Lugar escolhido
      const lugar = filtro("lugar").value;
      // Favoritos
      const favs = favoritos();
      // Exercícios que passam em todos os filtros
      const lista = Object.entries(BIBLIOTECA).filter(
        ([nome, x]) =>
          // Busca no nome
          (!busca || simples(nome).includes(busca)) &&
          // Músculo
          (!grupo || x.grupo === grupo) &&
          // Equipamento
          (!equip || x.equip === equip) &&
          // Lugar ("ambos" vale para casa e academia)
          (!lugar || x.lugar === lugar || x.lugar === "ambos") &&
          // Só favoritos
          (!soFavoritos || favs.includes(nome)),
      );
      // Conta quantos
      $("contagem").textContent = `${lista.length} exercício${lista.length === 1 ? "" : "s"}`;
      // Sem resultados
      if (!lista.length) return $("exercicios").replaceChildren(SL.estadoVazio("Nenhum exercício encontrado", soFavoritos ? "Toque no coração de um exercício para guardar aqui." : "Tente tirar algum filtro."));
      // Um card por exercício
      $("exercicios").replaceChildren(
        ...lista.map(([nome, x]) => {
          // É favorito?
          const fav = favs.includes(nome);
          // Card
          return el("article", { class: "ex-card" }, [
            // Topo: nome e coração
            el("div", { class: "ex-card-topo" }, [
              // Nome
              el("h2", { text: nome }),
              // Botão de favoritar
              el("button", { type: "button", class: "ex-fav" + (fav ? " is-fav" : ""), "data-action": "favoritar-ex", "data-nome": nome, "aria-pressed": String(fav), "aria-label": `${fav ? "Tirar dos" : "Colocar nos"} favoritos: ${nome}`, text: fav ? "♥" : "♡" }),
            ]),
            // Etiquetas: músculo, equipamento e lugar
            el("p", { class: "ex-tags" }, [el("span", { class: "tag", text: x.grupo }), el("span", { class: "tag", text: x.equip }), el("span", { class: "tag", text: LUGARES[x.lugar] })]),
            // Primeira dica
            el("p", { class: "meta", text: x.dicas[0] }),
            // Botão de ver o passo a passo
            el("button", { type: "button", class: "btn-secondary", "data-action": "ver-ex", "data-nome": nome, text: "Ver como fazer" }),
          ]);
        }),
      );
    }

    // Favoritar ou tirar dos favoritos
    SL.acao("favoritar-ex", (alvo) => {
      // Nome do exercício
      const nome = alvo.dataset.nome;
      // Favoritos atuais
      const favs = favoritos();
      // Troca: tira se tinha, coloca se não tinha
      storage.set("sl-ex-favoritos", favs.includes(nome) ? favs.filter((n) => n !== nome) : favs.concat(nome));
      // Desenha de novo
      render();
    });

    // Ver o passo a passo de um exercício
    SL.acao("ver-ex", (alvo) => {
      // Nome
      const nome = alvo.dataset.nome;
      // Dados
      const x = BIBLIOTECA[nome];
      // Abre o modal
      SL.openModal(nome, [
        // Passo a passo (3 quadros do Pulso)
        SL.personagem ? SL.personagem.passoAPasso(x.mov) : null,
        // Dicas
        el("ul", { class: "ex-dicas" }, x.dicas.map((d) => el("li", { text: d }))),
        // Erro comum
        el("p", { class: "como-fazer-erro" }, [el("strong", { text: "Cuidado: " }), x.erro]),
        // Músculos, equipamento e lugar
        el("p", { class: "meta", text: `${x.grupo} • ${x.equip} • ${LUGARES[x.lugar]}` }),
      ]);
    });

    // Só favoritos (liga e desliga)
    SL.acao("so-favoritos", (alvo) => {
      // Troca
      soFavoritos = !soFavoritos;
      // Avisa leitores de tela
      alvo.setAttribute("aria-pressed", String(soFavoritos));
      // Destaca o botão
      alvo.classList.toggle("is-active", soFavoritos);
      // Desenha
      render();
    });

    // Cada mudança nos filtros redesenha
    document.querySelector(".ex-filtros").addEventListener("input", render);
    // Desenha a primeira vez
    SL.carregar($("exercicios"), render);
  });
