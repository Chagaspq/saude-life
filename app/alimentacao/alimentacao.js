// Alimentação: macros calculados a partir das refeições do dia,
// adicionar e remover refeição e meta de água em copos de 250 ml
window.SL &&
  SL.pagina(() => {
    const { el, storage, icone } = SL;
    const { REFEICOES_PADRAO, METAS_NUTRICAO: META } = window.SL_DADOS;
    const COPO = 250;
    const hoje = new Date().toDateString();

    // Num dia novo sem nada salvo, mostra as refeições de exemplo
    function refeicoes() {
      const salvo = storage.get("sl-refeicoes", null);
      return salvo && salvo.data === hoje ? salvo.itens : REFEICOES_PADRAO.slice();
    }
    function guardarRefeicoes(itens) {
      storage.set("sl-refeicoes", { data: hoje, itens });
    }
    function agua() {
      const salvo = storage.get("sl-agua", null);
      return salvo && salvo.data === hoje ? salvo.ml : 2500;
    }
    function guardarAgua(ml) {
      storage.set("sl-agua", { data: hoje, ml: Math.max(0, Math.min(6000, ml)) });
    }

    const MACROS = [
      { chave: "kcal", nome: "Calorias", unidade: "kcal", cor: "coral" },
      { chave: "proteina", nome: "Proteínas", unidade: "g", cor: "emerald" },
      { chave: "carbo", nome: "Carboidratos", unidade: "g", cor: "warning" },
      { chave: "gordura", nome: "Gorduras", unidade: "g", cor: "info" },
    ];

    function barra(pct, rotulo, cor) {
      return el(
        "div",
        { class: `progress-bar-sm progress-${cor}`, role: "progressbar", "aria-label": rotulo, "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 },
        [el("div", { class: "fill", "data-progress": Math.min(100, pct) })],
      );
    }

    function renderMacros(itens) {
      document.querySelector('[data-render="macros"]').replaceChildren(
        ...MACROS.map((m) => {
          const atual = itens.reduce((soma, r) => soma + (Number(r[m.chave]) || 0), 0);
          const meta = META[m.chave];
          const pct = Math.round((atual / meta) * 100);
          const faltam = meta - atual;
          return el("div", { class: `macro-card macro-${m.cor}` }, [
            el("span", { class: "macro-name" }, [el("span", { class: "macro-dot", "aria-hidden": "true" }), m.nome]),
            el("strong", {}, [SL.num(atual), el("small", { text: ` / ${SL.num(meta)} ${m.unidade}` })]),
            barra(pct, m.nome, m.cor),
            el("small", { class: "macro-pct", text: faltam > 0 ? `${pct}% • faltam ${SL.num(faltam)} ${m.unidade}` : `${pct}% • meta batida` }),
          ]);
        }),
      );
    }

    function renderRefeicoes(itens) {
      const lista = document.querySelector('[data-render="refeicoes"]');
      if (!itens.length) {
        lista.replaceChildren(el("li", { class: "meal-empty" }, [el("span", { text: "Nenhuma refeição registrada hoje." })]));
        return;
      }
      lista.replaceChildren(
        ...itens
          .slice()
          .sort((a, b) => a.hora.localeCompare(b.hora))
          .map((r) =>
            el("li", { class: "meal-item" }, [
              el("span", { class: "meal-time", text: r.hora }),
              el("div", { class: "meal-info" }, [
                el("strong", { text: r.nome }),
                el("span", { text: r.descricao || "Sem descrição" }),
                el("span", { class: "meal-macros" }, [
                  el("span", { class: "macro-chip macro-emerald", text: `P ${SL.num(r.proteina)} g` }),
                  el("span", { class: "macro-chip macro-warning", text: `C ${SL.num(r.carbo)} g` }),
                  el("span", { class: "macro-chip macro-info", text: `G ${SL.num(r.gordura)} g` }),
                ]),
              ]),
              el("span", { class: "tag", text: `${SL.num(r.kcal)} kcal` }),
              el("button", { class: "btn-icon btn-danger", "data-action": "remover-refeicao", "data-id": r.id, "aria-label": `Remover ${r.nome}` }, [SL.iconeLixeira()]),
            ]),
          ),
      );
    }

    function renderAgua() {
      const ml = agua();
      const pct = Math.round((ml / META.aguaMl) * 100);
      document.querySelector('[data-render="agua-valor"]').replaceChildren(
        el("strong", { text: `${SL.num(ml / 1000, ml % 100 ? 2 : 1)} L` }),
        el("span", { text: ` de ${SL.num(META.aguaMl / 1000, 1)} L` }),
      );
      const copos = Math.ceil(META.aguaMl / COPO);
      document.querySelector('[data-render="agua-copos"]').replaceChildren(
        ...Array.from({ length: copos }, (_, i) => {
          const copo = icone(["M5 3h14l-1.5 17a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8z", "M5.5 8h13"], "icon water-glass" + (i < ml / COPO ? " is-full" : ""));
          return copo;
        }),
      );
      const barraAgua = document.querySelector('[data-render="agua-barra"]');
      barraAgua.setAttribute("aria-valuenow", Math.min(100, pct));
      barraAgua.querySelector(".fill").dataset.progress = Math.min(100, pct);
      document.querySelector('[data-action="agua-menos"]').disabled = ml <= 0;
    }

    function render() {
      const itens = refeicoes();
      renderMacros(itens);
      renderRefeicoes(itens);
      renderAgua();
      SL.aplicarProgresso();
    }

    SL.acao("agua-mais", () => {
      const ml = agua() + COPO;
      guardarAgua(ml);
      renderAgua();
      SL.aplicarProgresso();
      if (ml >= META.aguaMl && ml - COPO < META.aguaMl) SL.toast("Meta de água batida!");
    });

    SL.acao("agua-menos", () => {
      guardarAgua(agua() - COPO);
      renderAgua();
      SL.aplicarProgresso();
    });

    SL.acao("remover-refeicao", (alvo) => {
      const itens = refeicoes();
      const removida = itens.find((r) => r.id === alvo.dataset.id);
      guardarRefeicoes(itens.filter((r) => r.id !== alvo.dataset.id));
      render();
      SL.toast(`${removida.nome} removido`, {
        acao: {
          rotulo: "Desfazer",
          fn: () => {
            guardarRefeicoes(refeicoes().concat(removida));
            render();
          },
        },
      });
    });

    SL.acao("adicionar-refeicao", () => {
      const agora = new Date();
      const hora = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
      const form = el("form", { class: "modal-form" }, [
        el("div", { class: "form-row" }, [
          SL.campo("ref-nome", "Refeição", { placeholder: "Ex: Lanche da tarde", required: true, maxlength: 40 }),
          SL.campo("ref-hora", "Horário", { type: "time", required: true }),
        ]),
        SL.campo("ref-desc", "O que você comeu", { placeholder: "Ex: Pão integral com ovo", maxlength: 80 }),
        el("div", { class: "form-row form-row-4" }, [
          SL.campo("ref-kcal", "Calorias", { type: "number", min: 0, max: 3000, placeholder: "kcal" }),
          SL.campo("ref-prot", "Proteína", { type: "number", min: 0, max: 300, placeholder: "g" }),
          SL.campo("ref-carbo", "Carbo", { type: "number", min: 0, max: 500, placeholder: "g" }),
          SL.campo("ref-gord", "Gordura", { type: "number", min: 0, max: 300, placeholder: "g" }),
        ]),
        el("button", { type: "submit", class: "btn-primary", text: "Salvar refeição" }),
      ]);
      form.querySelector("#ref-hora").value = hora;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = form.querySelector("#ref-nome").value.trim();
        if (!nome) {
          form.querySelector("#ref-nome").focus();
          return;
        }
        const n = (id) => Math.max(0, Math.round(Number(form.querySelector(id).value) || 0));
        guardarRefeicoes(
          refeicoes().concat({
            id: "r" + Date.now(),
            nome,
            hora: form.querySelector("#ref-hora").value || hora,
            descricao: form.querySelector("#ref-desc").value.trim(),
            kcal: n("#ref-kcal"),
            proteina: n("#ref-prot"),
            carbo: n("#ref-carbo"),
            gordura: n("#ref-gord"),
          }),
        );
        SL.closeModal();
        render();
        SL.toast("Refeição adicionada");
      });

      SL.openModal("Adicionar refeição", form);
    });

    render();
  });
