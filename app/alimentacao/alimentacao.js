// Alimentação: macros calculados a partir das refeições do dia,
// adicionar e remover refeição e meta de água em copos de 250 ml
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ler/salvar dados e ícones
    const { el, storage, icone } = SL;
    // Pega as refeições de exemplo e as metas do dia
    const { REFEICOES_PADRAO, METAS_NUTRICAO: META } = window.SL_DADOS;
    // Tamanho de um copo: 250 ml
    const COPO = 250;
    // Data de hoje em texto (para saber se o que foi salvo é de hoje)
    const hoje = new Date().toDateString();

    // Num dia novo sem nada salvo, mostra as refeições de exemplo
    // Devolve as refeições de hoje
    function refeicoes() {
      // Lê o que foi salvo
      const salvo = storage.get("sl-refeicoes", null);
      // Se foi salvo hoje usa isso; se não, usa as de exemplo
      return salvo && salvo.data === hoje ? salvo.itens : REFEICOES_PADRAO.slice();
    }
    // Salva as refeições com a data de hoje
    function guardarRefeicoes(itens) {
      // Guarda na chave "sl-refeicoes"
      storage.set("sl-refeicoes", { data: hoje, itens });
    }
    // Devolve quantos ml de água a pessoa bebeu hoje
    function agua() {
      // Lê o que foi salvo
      const salvo = storage.get("sl-agua", null);
      // Se foi salvo hoje usa isso; se não, começa com 2500 ml
      return salvo && salvo.data === hoje ? salvo.ml : 2500;
    }
    // Salva a água de hoje
    function guardarAgua(ml) {
      // Guarda entre 0 e 6000 ml
      storage.set("sl-agua", { data: hoje, ml: Math.max(0, Math.min(6000, ml)) });
    }

    // Lista dos macros mostrados na página
    const MACROS = [
      // Calorias (coral)
      { chave: "kcal", nome: "Calorias", unidade: "kcal", cor: "coral" },
      // Proteínas (verde)
      { chave: "proteina", nome: "Proteínas", unidade: "g", cor: "emerald" },
      // Carboidratos (amarelo)
      { chave: "carbo", nome: "Carboidratos", unidade: "g", cor: "warning" },
      // Gorduras (azul)
      { chave: "gordura", nome: "Gorduras", unidade: "g", cor: "info" },
    ];

    // Cria uma barra de progresso com a porcentagem e a cor
    function barra(pct, rotulo, cor) {
      // Devolve...
      return el(
        // ...uma div
        "div",
        // com a classe da cor e os avisos para leitores de tela
        { class: `progress-bar-sm progress-${cor}`, role: "progressbar", "aria-label": rotulo, "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 },
        // e a parte pintada (no máximo 100%)
        [el("div", { class: "fill", "data-progress": Math.min(100, pct) })],
      );
    }

    // Desenha os cards de macros
    function renderMacros(itens) {
      // Troca o conteúdo da área de macros...
      document.querySelector('[data-render="macros"]').replaceChildren(
        // ...por um card para cada macro
        ...MACROS.map((m) => {
          // Soma o macro de todas as refeições
          const atual = itens.reduce((soma, r) => soma + (Number(r[m.chave]) || 0), 0);
          // Meta do macro
          const meta = META[m.chave];
          // Porcentagem da meta
          const pct = Math.round((atual / meta) * 100);
          // Quanto falta para a meta
          const faltam = meta - atual;
          // Card do macro com a cor dele
          return el("div", { class: `macro-card macro-${m.cor}` }, [
            // Nome com a bolinha colorida
            el("span", { class: "macro-name" }, [el("span", { class: "macro-dot", "aria-hidden": "true" }), m.nome]),
            // Valor atual e a meta
            el("strong", {}, [SL.num(atual), el("small", { text: ` / ${SL.num(meta)} ${m.unidade}` })]),
            // Barra de progresso
            barra(pct, m.nome, m.cor),
            // Texto: quanto falta ou "meta batida"
            el("small", { class: "macro-pct", text: faltam > 0 ? `${pct}% • faltam ${SL.num(faltam)} ${m.unidade}` : `${pct}% • meta batida` }),
          ]);
        }),
      );
    }

    // Desenha a lista de refeições
    function renderRefeicoes(itens) {
      // Lugar da lista
      const lista = document.querySelector('[data-render="refeicoes"]');
      // Se não tem refeição...
      if (!itens.length) {
        // ...mostra a mensagem de vazio
        lista.replaceChildren(el("li", { class: "meal-empty" }, [el("span", { text: "Nenhuma refeição registrada hoje." })]));
        // ...e para
        return;
      }
      // Troca a lista pelas refeições:
      lista.replaceChildren(
        // pega as refeições
        ...itens
          // faz uma cópia
          .slice()
          // ordena pelo horário
          .sort((a, b) => a.hora.localeCompare(b.hora))
          // e transforma cada uma em item
          .map((r) =>
            // Item da refeição
            el("li", { class: "meal-item" }, [
              // Horário
              el("span", { class: "meal-time", text: r.hora }),
              // Nome e detalhes
              el("div", { class: "meal-info" }, [
                // Nome da refeição
                el("strong", { text: r.nome }),
                // O que comeu
                el("span", { text: r.descricao || "Sem descrição" }),
                // Etiquetas dos macros
                el("span", { class: "meal-macros" }, [
                  // Proteína
                  el("span", { class: "macro-chip macro-emerald", text: `P ${SL.num(r.proteina)} g` }),
                  // Carboidrato
                  el("span", { class: "macro-chip macro-warning", text: `C ${SL.num(r.carbo)} g` }),
                  // Gordura
                  el("span", { class: "macro-chip macro-info", text: `G ${SL.num(r.gordura)} g` }),
                ]),
              ]),
              // Calorias da refeição
              el("span", { class: "tag", text: `${SL.num(r.kcal)} kcal` }),
              // Botão de remover (lixeira)
              el("button", { class: "btn-icon btn-danger", "data-action": "remover-refeicao", "data-id": r.id, "aria-label": `Remover ${r.nome}` }, [SL.iconeLixeira()]),
            ]),
          ),
      );
    }

    // Desenha o card da água
    function renderAgua() {
      // Quantos ml bebeu
      const ml = agua();
      // Porcentagem da meta
      const pct = Math.round((ml / META.aguaMl) * 100);
      // Escreve o valor em litros...
      document.querySelector('[data-render="agua-valor"]').replaceChildren(
        // ...o que já bebeu
        el("strong", { text: `${SL.num(ml / 1000, ml % 100 ? 2 : 1)} L` }),
        // ...e a meta
        el("span", { text: ` de ${SL.num(META.aguaMl / 1000, 1)} L` }),
      );
      // Quantos copos cabem na meta
      const copos = Math.ceil(META.aguaMl / COPO);
      // Desenha os copinhos:
      document.querySelector('[data-render="agua-copos"]').replaceChildren(
        // um para cada copo da meta
        ...Array.from({ length: copos }, (_, i) => {
          // copo cheio se já bebeu aquela quantidade
          const copo = icone(["M5 3h14l-1.5 17a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8z", "M5.5 8h13"], "icon water-glass" + (i < ml / COPO ? " is-full" : ""));
          // devolve o copo
          return copo;
        }),
      );
      // Barra de progresso da água
      const barraAgua = document.querySelector('[data-render="agua-barra"]');
      // Avisa leitores de tela a porcentagem
      barraAgua.setAttribute("aria-valuenow", Math.min(100, pct));
      // Pinta a barra
      barraAgua.querySelector(".fill").dataset.progress = Math.min(100, pct);
      // Desativa o botão de menos se está em zero
      document.querySelector('[data-action="agua-menos"]').disabled = ml <= 0;
    }

    // Desenha a página toda
    function render() {
      // Pega as refeições de hoje
      const itens = refeicoes();
      // Desenha os macros
      renderMacros(itens);
      // Desenha as refeições
      renderRefeicoes(itens);
      // Desenha a água
      renderAgua();
      // Pinta as barras de progresso
      SL.aplicarProgresso();
    }

    // Botão de mais água...
    SL.acao("agua-mais", () => {
      // ...soma um copo
      const ml = agua() + COPO;
      // ...salva
      guardarAgua(ml);
      // ...desenha a água de novo
      renderAgua();
      // ...pinta a barra
      SL.aplicarProgresso();
      // Se acabou de bater a meta, comemora
      if (ml >= META.aguaMl && ml - COPO < META.aguaMl) SL.toast("Meta de água batida!");
    });

    // Botão de menos água...
    SL.acao("agua-menos", () => {
      // ...tira um copo e salva
      guardarAgua(agua() - COPO);
      // ...desenha de novo
      renderAgua();
      // ...pinta a barra
      SL.aplicarProgresso();
    });

    // Botão de remover refeição...
    SL.acao("remover-refeicao", (alvo) => {
      // ...pega as refeições
      const itens = refeicoes();
      // ...acha a que foi clicada
      const removida = itens.find((r) => r.id === alvo.dataset.id);
      // ...salva a lista sem ela
      guardarRefeicoes(itens.filter((r) => r.id !== alvo.dataset.id));
      // ...desenha de novo
      render();
      // ...e mostra o aviso com "Desfazer"
      SL.toast(`${removida.nome} removido`, {
        // Botão do aviso
        acao: {
          // Texto do botão
          rotulo: "Desfazer",
          // Se clicar em desfazer...
          fn: () => {
            // ...coloca a refeição de volta
            guardarRefeicoes(refeicoes().concat(removida));
            // ...e desenha de novo
            render();
          },
        },
      });
    });

    // Botão de adicionar refeição...
    SL.acao("adicionar-refeicao", () => {
      // ...pega a hora de agora
      const agora = new Date();
      // ...e escreve no formato 08:05
      const hora = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
      // Cria o formulário
      const form = el("form", { class: "modal-form" }, [
        // Linha com dois campos
        el("div", { class: "form-row" }, [
          // Nome da refeição (obrigatório)
          SL.campo("ref-nome", "Refeição", { placeholder: "Ex: Lanche da tarde", required: true, maxlength: 40 }),
          // Horário
          SL.campo("ref-hora", "Horário", { type: "time", required: true }),
        ]),
        // O que comeu
        SL.campo("ref-desc", "O que você comeu", { placeholder: "Ex: Pão integral com ovo", maxlength: 80 }),
        // Linha com quatro campos
        el("div", { class: "form-row form-row-4" }, [
          // Calorias
          SL.campo("ref-kcal", "Calorias", { type: "number", min: 0, max: 3000, placeholder: "kcal" }),
          // Proteína
          SL.campo("ref-prot", "Proteína", { type: "number", min: 0, max: 300, placeholder: "g" }),
          // Carboidrato
          SL.campo("ref-carbo", "Carbo", { type: "number", min: 0, max: 500, placeholder: "g" }),
          // Gordura
          SL.campo("ref-gord", "Gordura", { type: "number", min: 0, max: 300, placeholder: "g" }),
        ]),
        // Botão de salvar
        el("button", { type: "submit", class: "btn-primary", text: "Salvar refeição" }),
      ]);
      // Já começa com a hora de agora
      form.querySelector("#ref-hora").value = hora;

      // Quando clicam em salvar...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // Pega o nome
        const nome = form.querySelector("#ref-nome").value.trim();
        // Se está vazio...
        if (!nome) {
          // ...coloca o foco no campo
          form.querySelector("#ref-nome").focus();
          // ...e para
          return;
        }
        // Atalho que lê um campo como número inteiro (nunca negativo)
        const n = (id) => Math.max(0, Math.round(Number(form.querySelector(id).value) || 0));
        // Salva as refeições...
        guardarRefeicoes(
          // ...com a nova no final:
          refeicoes().concat({
            // id baseado na hora
            id: "r" + Date.now(),
            // nome
            nome,
            // horário
            hora: form.querySelector("#ref-hora").value || hora,
            // descrição
            descricao: form.querySelector("#ref-desc").value.trim(),
            // calorias
            kcal: n("#ref-kcal"),
            // proteína
            proteina: n("#ref-prot"),
            // carboidrato
            carbo: n("#ref-carbo"),
            // gordura
            gordura: n("#ref-gord"),
          }),
        );
        // Fecha o modal
        SL.closeModal();
        // Desenha de novo
        render();
        // Mostra o aviso
        SL.toast("Refeição adicionada");
      });

      // Abre o modal com o formulário
      SL.openModal("Adicionar refeição", form);
    });

    // Desenha a página a primeira vez
    render();
  });
