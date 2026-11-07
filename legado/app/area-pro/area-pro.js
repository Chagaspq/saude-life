// Área do profissional: lista de alunos, montar treino e mandar para o aluno.
// Sem servidor, os alunos são simulados (pessoas de exemplo). O aluno "Você" serve
// para testar: o treino montado aparece de verdade em "Meus treinos".
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos e ler/salvar dados
    const { el, storage } = SL;
    // Motor de pontos (tem as pessoas de exemplo e o sorteio fixo)
    const P = SL.pontos;
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Biblioteca de exercícios
    const BIBLIOTECA = window.SL_EXERCICIOS || {};
    // Grupos musculares da biblioteca (sem repetir)
    const GRUPOS = [...new Set(Object.values(BIBLIOTECA).map((e) => e.grupo))];
    // Primeiro nome
    const primeiro = (nome) => nome.split(" ")[0];

    // Alunos: você (para testar) + 5 pessoas de exemplo
    function alunos() {
      // Pessoas de exemplo
      const exemplo = P ? P.PESSOAS.slice(0, 5) : [];
      // Lista com você no começo
      return [{ codigo: "eu", nome: `Você (${primeiro(SL.getUsuario().nome)}, para testar)`, ritmo: 600 }].concat(exemplo);
    }

    // Treinos que você mandou: [{ id, aluno, nomeAluno, nome, itens, data }]
    const enviados = () => storage.get("sl-prescricoes", []);

    // Desenha tudo
    function render() {
      // Lista de alunos
      const lista = alunos();
      // Treinos enviados
      const env = enviados();
      // Números do painel
      $("numeros").replaceChildren(
        // Alunos ativos
        SL.statTile({ rotulo: "Alunos ativos", valor: String(lista.length), detalhe: "acompanhando pelo app", iconePaths: SL.ICONES.joinha, cor: "emerald" }),
        // Treinos enviados
        SL.statTile({ rotulo: "Treinos enviados", valor: String(env.length), detalhe: "no total", iconePaths: SL.ICONES.haltere }),
        // Avaliações recebidas
        SL.statTile({ rotulo: "Avaliações", valor: "28", detalhe: "nota média 4,9 de 5", iconePaths: SL.ICONES.trofeu, cor: "emerald" }),
      );
      // Alunos
      $("alunos").replaceChildren(
        // Um item por aluno
        ...lista.map((a) => {
          // Treinos na semana (simulado pelo ritmo; você: de verdade)
          const semana = a.codigo === "eu" ? SL.estatisticas().nestaSemana : Math.round((a.ritmo / 1000) * 5 * (0.6 + P.sorteio(a.codigo + "sem") * 0.6));
          // Item
          return el("li", { class: "ap-aluno" }, [
            // Bolinha
            el("span", { class: "rk-avatar rk-avatar-sm", "aria-hidden": "true", text: SL.initials(a.nome) }),
            // Nome e treinos
            el("div", { class: "cm-amigo-info" }, [el("strong", { text: a.nome }), el("span", { class: "meta", text: `${semana} treino${semana === 1 ? "" : "s"} esta semana` })]),
            // Botões
            el("div", { class: "ap-botoes" }, [
              // Montar treino para esse aluno
              el("button", { type: "button", class: "btn-secondary", "data-action": "montar-treino", "data-aluno": a.codigo, text: "Montar treino" }),
              // Conversar (você mesmo não tem chat)
              a.codigo === "eu" ? null : el("button", { type: "button", class: "btn-secondary", "data-action": "chat-aluno", "data-aluno": a.codigo, text: "Conversar" }),
            ]),
          ]);
        }),
      );
      // Treinos enviados
      $("enviados").replaceChildren(
        // Um item por treino (mais novos em cima)
        ...env.map((t) => el("li", {}, [el("strong", { text: t.nome }), el("span", { class: "meta", text: ` • para ${t.nomeAluno} • ${t.itens.length} exercícios • ${SL.dataRelativa(t.data)}` })])),
      );
      // Sem nenhum: estado vazio
      if (!env.length) $("enviados").append(el("li", { class: "meta", text: "Nenhum treino enviado ainda. Toque em \"Montar treino\"." }));
    }

    // Conversar com um aluno (respostas simuladas)
    SL.acao("chat-aluno", (alvo) => {
      // Aluno
      const a = alunos().find((x) => x.codigo === alvo.dataset.aluno);
      // Abre o chat
      SL.abrirChat({ chave: "aluno:" + a.codigo, nome: a.nome, respostas: ["Fechou, prof! Hoje eu faço.", "Senti muito o posterior ontem haha", "Posso trocar o leg press pelo agachamento?", "Valeu pelo treino novo!"] });
    });

    // Montar treino
    SL.acao("montar-treino", (alvo) => {
      // Lista de alunos
      const lista = alunos();
      // Linha de um exercício escolhido: nome, séries, repetições
      const linha = (nome) =>
        el("li", { class: "ap-ex", "data-nome": nome }, [
          // Nome
          el("span", { text: nome }),
          // Séries
          el("input", { type: "number", min: 1, max: 10, value: 3, "aria-label": `Séries de ${nome}`, class: "ap-series" }),
          // x
          el("span", { "aria-hidden": "true", text: "x" }),
          // Repetições
          el("input", { type: "number", min: 1, max: 50, value: 12, "aria-label": `Repetições de ${nome}`, class: "ap-reps" }),
          // Tirar
          el("button", { type: "button", class: "btn-link", "data-tirar": nome, "aria-label": `Tirar ${nome}`, text: "Tirar" }),
        ]);
      // Exercícios escolhidos
      const escolhidos = el("ol", { class: "ap-escolhidos" });
      // Caixa do grupo muscular
      const selGrupo = el("select", { id: "ap-grupo", class: "cm-select" }, GRUPOS.map((g) => el("option", { value: g, text: g })));
      // Caixa do exercício
      const selEx = el("select", { id: "ap-ex", class: "cm-select" });
      // Preenche os exercícios do grupo escolhido
      const encherExercicios = () => selEx.replaceChildren(...Object.entries(BIBLIOTECA).filter(([, e]) => e.grupo === selGrupo.value).map(([nome]) => el("option", { value: nome, text: nome })));
      // Primeira vez
      encherExercicios();
      // Trocar o grupo troca a lista
      selGrupo.addEventListener("change", encherExercicios);
      // Botão de adicionar exercício
      const btnAdd = el("button", { type: "button", class: "btn-secondary", text: "Adicionar" });
      // Ao clicar, junta (se ainda não está)
      btnAdd.addEventListener("click", () => {
        // Se já está na lista, avisa
        if (escolhidos.querySelector(`[data-nome="${CSS.escape(selEx.value)}"]`)) return SL.toast("Esse já está no treino");
        // Junta
        escolhidos.append(linha(selEx.value));
      });
      // Tirar exercício
      escolhidos.addEventListener("click", (e) => {
        // Botão de tirar
        const b = e.target.closest("[data-tirar]");
        // Se foi nele, tira a linha
        if (b) b.closest("li").remove();
      });
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Aluno
        el("div", { class: "form-group" }, [el("label", { for: "ap-aluno", text: "Para quem" }), el("select", { id: "ap-aluno", class: "cm-select" }, lista.map((a) => el("option", { value: a.codigo, text: a.nome })))]),
        // Nome do treino
        SL.campo("ap-nome", "Nome do treino", { placeholder: "Ex: Treino A - Peito e tríceps", required: true, maxlength: 40 }),
        // Escolher exercícios
        el("div", { class: "form-row" }, [el("div", { class: "form-group" }, [el("label", { for: "ap-grupo", text: "Grupo" }), selGrupo]), el("div", { class: "form-group" }, [el("label", { for: "ap-ex", text: "Exercício" }), selEx])]),
        // Botão de adicionar
        btnAdd,
        // Lista dos escolhidos
        escolhidos,
        // Observação
        SL.campo("ap-obs", "Recado para o aluno (opcional)", { placeholder: "Ex: Descanse 90 segundos entre as séries", maxlength: 140 }),
        // Enviar
        el("button", { type: "submit", class: "btn-primary", text: "Mandar para o aluno" }),
      ]);
      // Já marca o aluno do botão clicado
      if (alvo.dataset.aluno) form.querySelector("#ap-aluno").value = alvo.dataset.aluno;
      // Ao enviar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...nome
        const nome = form.querySelector("#ap-nome").value.trim();
        // ...exercícios montados
        const itens = [...escolhidos.querySelectorAll(".ap-ex")].map((li) => ({
          // nome
          nome: li.dataset.nome,
          // séries
          series: Math.max(1, Number(li.querySelector(".ap-series").value) || 3),
          // repetições
          reps: Math.max(1, Number(li.querySelector(".ap-reps").value) || 12),
          // carga sugerida pela biblioteca
          carga: (BIBLIOTECA[li.dataset.nome] || {}).carga || 0,
          // descanso padrão
          descanso: 60,
        }));
        // ...precisa de nome
        if (!nome) return form.querySelector("#ap-nome").focus();
        // ...e de pelo menos 1 exercício
        if (!itens.length) return SL.toast("Adicione pelo menos 1 exercício");
        // ...aluno
        const aluno = lista.find((a) => a.codigo === form.querySelector("#ap-aluno").value);
        // ...recado
        const obs = form.querySelector("#ap-obs").value.trim();
        // ...guarda nos enviados
        storage.set("sl-prescricoes", [{ id: "p" + Date.now(), aluno: aluno.codigo, nomeAluno: aluno.nome, nome, itens, obs, data: new Date().toISOString() }].concat(enviados()));
        // ...se o aluno é você, o treino aparece de verdade em "Meus treinos"
        if (aluno.codigo === "eu") {
          // Treinos atuais
          const meus = SL.treinosDoUsuario();
          // Coloca no começo, com quem montou
          meus.unshift({ id: "t" + Date.now(), nome, grupo: `Montado por ${primeiro(SL.getUsuario().nome)} (personal)${obs ? " • " + obs : ""}`, itens, exercicios: itens.length, autor: SL.getUsuario().nome });
          // Salva
          storage.set("sl-treinos", meus);
        }
        // ...fecha
        SL.closeModal();
        // ...desenha
        render();
        // ...avisa
        SL.toast(aluno.codigo === "eu" ? "Treino enviado! Veja em Meus treinos." : `Treino enviado para ${primeiro(aluno.nome)}!`);
      });
      // Abre o modal
      SL.openModal("Montar treino", form);
    });

    // Desenha a primeira vez
    SL.carregar($("alunos"), render);
  });
