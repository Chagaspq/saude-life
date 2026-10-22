// Meus treinos: listar, criar, editar, excluir (com desfazer) e iniciar
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ler/salvar dados e ícones
    const { el, storage, icone, ICONES } = SL;
    // Lista de treinos da pessoa
    let treinos = SL.treinosDoUsuario();
    // Lugar da página onde os treinos aparecem
    const lista = document.querySelector(".workouts-list-container");

    // Salva a lista de treinos no navegador
    function guardar() {
      // Guarda na chave "sl-treinos"
      storage.set("sl-treinos", treinos);
    }

    // Desenha os cards de treino na tela
    function render() {
      // Esvazia a lista
      lista.replaceChildren();

      // Se não tem nenhum treino...
      if (!treinos.length) {
        // ...coloca a mensagem de lista vazia
        lista.append(
          // Bloco de estado vazio
          SL.estadoVazio(
            // Título
            "Você ainda não criou treinos",
            // Texto
            "Monte seu primeiro treino e acompanhe cada série.",
            // Botão de criar treino
            el("button", { class: "btn-primary", "data-action": "create-workout", text: "Criar treino" }),
          ),
        );
      }

      // Treino que está em andamento (se tiver)
      const atual = SL.treinoAtual();
      // Para cada treino da pessoa...
      treinos.forEach((treino) => {
        // ...pega os exercícios dele
        const exercicios = SL.exerciciosDe(treino);
        // ...vê se é o que está em andamento
        const emAndamento = atual && atual.treinoId === treino.id;
        // ...e coloca um card na lista
        lista.append(
          // Card do treino
          el("article", { class: "workout-card workout-card-col" }, [
            // Topo do card
            el("div", { class: "workout-card-head" }, [
              // Ícone de haltere
              el("span", { class: "icon-tile icon-tile-coral icon-tile-lg", "aria-hidden": "true" }, [icone(ICONES.haltere)]),
              // Nome e grupo
              el("div", { class: "card-info" }, [
                // Nome do treino
                el("h3", { text: treino.nome }),
                // Grupo muscular
                el("p", { class: "muscle-group", text: treino.grupo }),
              ]),
              // Etiqueta "Em andamento" (só se estiver)
              emAndamento ? el("span", { class: "tag tag-success", text: "Em andamento" }) : null,
            ]),
            // Linha de detalhes
            el("ul", { class: "workout-facts" }, [
              // Quantidade de exercícios
              el("li", {}, [el("strong", { text: String(exercicios.length) }), " exercícios"]),
              // Soma de todas as séries
              el("li", {}, [el("strong", { text: String(exercicios.reduce((s, e) => s + e.series, 0)) }), " séries"]),
              // Quando foi feito pela última vez
              el("li", { text: `Último: ${SL.dataRelativa(SL.ultimaVez(treino.id))}` }),
            ]),
            // Botões do card
            el("div", { class: "card-actions" }, [
              // Botão de iniciar ou continuar
              el("a", { href: SL.linkTreino(treino.id), class: "btn-primary btn-with-icon" }, [
                // Ícone de play
                icone(ICONES.play),
                // Texto do botão
                emAndamento ? "Continuar" : "Iniciar treino",
              ]),
              // Botão de ver os exercícios (olho)
              el("button", { class: "btn-icon btn-outline", "data-action": "open-workout-modal", "data-id": treino.id, "aria-label": `Ver exercícios de ${treino.nome}` }, [
                // Desenho do ícone de olho
                icone(["M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]),
              ]),
              // Botão de editar (lápis)
              el("button", { class: "btn-icon btn-outline", "data-action": "edit-workout", "data-id": treino.id, "aria-label": `Editar treino ${treino.nome}` }, [
                // Ícone de lápis
                icone(ICONES.lapis),
              ]),
              // Botão de excluir (lixeira)
              el("button", { class: "btn-icon btn-outline btn-danger", "data-action": "delete-workout", "data-id": treino.id, "aria-label": `Excluir treino ${treino.nome}` }, [
                // Ícone de lixeira
                SL.iconeLixeira(),
              ]),
            ]),
          ]),
        );
      });
    }

    // Formulário de criar e editar: um exercício por linha
    // Abre o formulário de criar (sem treino) ou editar (com treino)
    function abrirFormulario(treino) {
      // Está editando se recebeu um treino
      const editando = Boolean(treino);
      // Cria o formulário
      const form = el("form", { class: "modal-form" }, [
        // Campo do nome (obrigatório, até 60 letras)
        SL.campo("treino-nome", "Nome do treino", { placeholder: "Ex: Membros Superiores B", required: true, maxlength: 60 }),
        // Campo do grupo muscular
        SL.campo("treino-grupo", "Grupo muscular", { placeholder: "Ex: Peito e Tríceps", maxlength: 60 }),
        // Escolher exercícios da biblioteca (marcar = entra na lista abaixo)
        escolherDaLista(),
        // Caixa de texto dos exercícios, um por linha (dá para digitar exercícios novos)
        SL.campo("treino-itens", "Exercícios (um por linha)", { multiline: true, placeholder: "Supino reto\nCrucifixo\nTríceps na corda" }),
        // Dica embaixo dos campos
        el("p", { class: "form-hint", text: "Cada exercício começa com 3 séries de 12. Você ajusta reps e carga durante o treino." }),
        // Botão de salvar
        el("button", { type: "submit", class: "btn-primary", text: editando ? "Salvar alterações" : "Salvar treino" }),
      ]);
      // Pega a caixa de exercícios
      const campoItens = form.querySelector("#treino-itens");
      // Deixa ela com 6 linhas de altura
      campoItens.rows = 6;

      // Quando marca/desmarca um exercício da lista, atualiza a caixa de texto
      form.addEventListener("change", (ev) => {
        // Só as caixinhas da lista
        if (!ev.target.matches(".escolha-lista input")) return;
        // Nomes que já estão na caixa
        const nomes = campoItens.value.split("\n").map((l) => l.trim()).filter(Boolean);
        // Nome do exercício marcado
        const nome = ev.target.value;
        // Marcou: coloca no fim; desmarcou: tira
        campoItens.value = (ev.target.checked ? nomes.concat(nomes.includes(nome) ? [] : [nome]) : nomes.filter((n) => n !== nome)).join("\n");
      });
      // Quando digita na caixa, marca/desmarca as caixinhas que batem
      campoItens.addEventListener("input", () => {
        // Nomes digitados
        const nomes = campoItens.value.split("\n").map((l) => l.trim());
        // Para cada caixinha, marca se o nome está na lista
        form.querySelectorAll(".escolha-lista input").forEach((c) => (c.checked = nomes.includes(c.value)));
      });

      // Se está editando...
      if (editando) {
        // ...preenche o nome
        form.querySelector("#treino-nome").value = treino.nome;
        // ...preenche o grupo
        form.querySelector("#treino-grupo").value = treino.grupo;
        // ...e escreve os exercícios, um por linha
        campoItens.value = SL.exerciciosDe(treino)
          // (pega só o nome de cada exercício)
          .map((e) => e.nome)
          // (junta com quebra de linha)
          .join("\n");
      }

      // Quando clicam em salvar...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // Pega o nome digitado
        const nome = form.querySelector("#treino-nome").value.trim();
        // Se o nome está vazio...
        if (!nome) {
          // ...coloca o foco no campo
          form.querySelector("#treino-nome").focus();
          // ...e para
          return;
        }
        // Mantém séries e cargas dos exercícios que já existiam
        // Exercícios que o treino já tinha (para manter as cargas)
        const anteriores = editando ? SL.exerciciosDe(treino) : [];
        // Transforma o texto em lista de nomes:
        const nomes = campoItens.value
          // separa por linha
          .split("\n")
          // tira espaços das pontas
          .map((l) => l.trim())
          // tira linhas vazias
          .filter(Boolean)
          // no máximo 30 exercícios
          .slice(0, 30);
        // Para cada nome (ou "Exercício 1" se vazio)...
        const itens = (nomes.length ? nomes : ["Exercício 1"]).map(
          // ...usa o exercício antigo com o mesmo nome ou cria um novo com 3x12
          (n) => anteriores.find((a) => a.nome.toLowerCase() === n.toLowerCase()) || novoExercicio(n),
        );
        // Junta os dados do treino
        const dados = {
          // Nome
          nome,
          // Grupo (ou "Corpo inteiro" se vazio)
          grupo: form.querySelector("#treino-grupo").value.trim() || "Corpo inteiro",
          // Lista de exercícios
          itens,
          // Quantos exercícios são
          exercicios: itens.length,
        };

        // Se está editando...
        if (editando) {
          // ...troca o treino antigo pelo atualizado
          treinos = treinos.map((t) => (t.id === treino.id ? { ...t, ...dados } : t));
        // Se é novo...
        } else {
          // ...coloca no começo da lista com um id baseado na hora
          treinos.unshift({ id: "t" + Date.now(), ...dados });
        }
        // Salva no navegador
        guardar();
        // Desenha de novo
        render();
        // Fecha o modal
        SL.closeModal();
        // Mostra o aviso
        SL.toast(editando ? "Treino atualizado" : "Treino salvo!");
      });

      // Abre o modal com o formulário
      SL.openModal(editando ? "Editar treino" : "Criar novo treino", form);
    }

    /* ---------- Biblioteca, treino automático e plano da semana ---------- */

    // Biblioteca de exercícios
    const BIBLIOTECA = window.SL_EXERCICIOS || {};
    // Grupos da biblioteca, na ordem dos filtros
    const GRUPOS = ["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Cardio", "Mobilidade"];

    // Cria um exercício novo com valores padrão (usa a carga e o tipo da biblioteca, se tiver)
    function novoExercicio(nome) {
      // Informações da biblioteca
      const info = BIBLIOTECA[nome];
      // Core, cardio e mobilidade são por tempo; o resto, 3 x 12
      const porTempo = info && ["core", "cardio", "alongar"].includes(info.mov) && info.carga === 0 && info.grupo !== "Pernas";
      // Devolve o exercício
      return { nome, series: 3, reps: porTempo ? "40 s" : 12, carga: info ? info.carga : 0, descanso: porTempo ? 30 : 60 };
    }

    // Lista para escolher exercícios da biblioteca, com busca e filtro por grupo
    function escolherDaLista() {
      // Caixa
      const caixa = el("details", { class: "escolha" }, [
        // Título clicável
        el("summary", { text: `Escolher da lista (${Object.keys(BIBLIOTECA).length} exercícios com dicas)` }),
      ]);
      // Campo de busca
      const busca = el("input", { type: "search", class: "escolha-busca", placeholder: "Buscar exercício…", "aria-label": "Buscar exercício" });
      // Filtro de grupo
      const grupo = el("select", { class: "escolha-grupo", "aria-label": "Filtrar por grupo" }, [el("option", { value: "", text: "Todos os grupos" }), ...GRUPOS.map((g) => el("option", { value: g, text: g }))]);
      // Lista de caixinhas
      const lista = el("div", { class: "escolha-lista" });
      // Desenha a lista com a busca e o filtro
      function desenhar() {
        // Texto buscado
        const t = busca.value.trim().toLowerCase();
        // Caixinhas marcadas agora (para não perder ao filtrar)
        const marcados = [...lista.querySelectorAll("input:checked")].map((c) => c.value);
        // Troca a lista
        lista.replaceChildren(
          // Exercícios que passam no filtro
          ...Object.entries(BIBLIOTECA)
            .filter(([nome, info]) => (!grupo.value || info.grupo === grupo.value) && (!t || nome.toLowerCase().includes(t)))
            .map(([nome, info]) =>
              // Linha com caixinha
              el("label", { class: "check-row" }, [
                // Caixinha
                el("input", { type: "checkbox", value: nome, checked: marcados.includes(nome) }),
                // Nome e detalhes
                el("span", {}, [el("strong", { text: nome }), el("small", { class: "meta", text: ` ${info.grupo} • ${info.lugar === "casa" ? "casa" : info.lugar === "academia" ? "academia" : "casa ou academia"}` })]),
              ]),
            ),
        );
      }
      // Busca e filtro redesenham
      busca.addEventListener("input", desenhar);
      // (filtro também)
      grupo.addEventListener("change", desenhar);
      // Monta a caixa
      caixa.append(el("div", { class: "escolha-filtros" }, [busca, grupo]), lista);
      // Desenha a primeira vez
      desenhar();
      // Devolve
      return caixa;
    }

    // Embaralha uma lista (para o treino automático não sair sempre igual)
    const embaralhar = (lista) => lista.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

    // Monta uma lista de exercícios para grupos e um lugar
    function sortear(grupos, lugar, quantidade) {
      // Exercícios que servem: do grupo certo e possíveis no lugar
      const pool = Object.entries(BIBLIOTECA).filter(([, info]) => grupos.includes(info.grupo) && (lugar === "academia" || info.lugar !== "academia"));
      // Pega um de cada grupo primeiro (para variar) e depois completa
      const porGrupo = grupos.map((g) => embaralhar(pool.filter(([, i]) => i.grupo === g))).filter((l) => l.length);
      // Lista final
      const escolhidos = [];
      // Vai pegando um de cada grupo, em rodízio, até completar
      for (let r = 0; escolhidos.length < quantidade && porGrupo.some((l) => l.length); r++) {
        // Grupo da vez
        const l = porGrupo[r % porGrupo.length];
        // Se ainda tem exercício nele, pega
        if (l.length) escolhidos.push(l.shift()[0]);
      }
      // Transforma os nomes em exercícios
      return escolhidos.map(novoExercicio);
    }

    // Confere se pode usar o treino automático (Premium; no Free, 1 vez de presente)
    function podeUsarAutomatico() {
      // Plano da pessoa
      const plano = storage.get("sl-plano", "Free");
      // Quantas vezes já usou
      const usos = storage.get("sl-auto-usos", 0);
      // Premium e Profissional podem sempre; Free pode 1 vez
      if (plano !== "Free" || usos < 1) {
        // Conta o uso
        storage.set("sl-auto-usos", usos + 1);
        // Pode
        return true;
      }
      // Não pode: oferece o Premium
      SL.confirmar({
        // Título
        titulo: "Treino automático é Premium",
        // Texto
        texto: "Você já usou o teste grátis. No Premium o app monta treinos e planos da semana sem limite.",
        // Botão
        rotulo: "Ver planos",
        // Leva aos planos
        fn: () => (window.location.href = "../planos/planos.html"),
      });
      // Não pode
      return false;
    }

    // Salva treinos novos no começo da lista e avisa
    function adicionarTreinos(novos, aviso) {
      // Coloca os novos no começo
      treinos = novos.concat(treinos);
      // Salva
      guardar();
      // Desenha de novo
      render();
      // Fecha o modal
      SL.closeModal();
      // Avisa
      SL.toast(aviso);
    }

    // Botão "Montar automático": abre o formulário do treino automático
    SL.acao("treino-automatico", () => {
      // Lugar padrão (o da última vez, ou academia)
      const lugarSalvo = storage.get("sl-lugar", "academia");
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Texto de apoio
        el("p", { class: "modal-text", text: "Diga quanto tempo você tem, o foco e onde vai treinar. O app monta o treino com dicas em cada exercício." }),
        // Tempo
        el("fieldset", { class: "auto-opcoes" }, [el("legend", { text: "Quanto tempo você tem?" }), ...[15, 30, 45, 60].map((m) => el("label", { class: "auto-chip" }, [el("input", { type: "radio", name: "auto-tempo", value: m, checked: m === 30 }), el("span", { text: `${m} min` })]))]),
        // Foco
        el("fieldset", { class: "auto-opcoes" }, [el("legend", { text: "Qual o foco?" }), ...["Corpo inteiro", "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Cardio"].map((g, i) => el("label", { class: "auto-chip" }, [el("input", { type: "radio", name: "auto-foco", value: g, checked: i === 0 }), el("span", { text: g })]))]),
        // Lugar
        el("fieldset", { class: "auto-opcoes" }, [el("legend", { text: "Onde?" }), ...[["academia", "Academia"], ["casa", "Em casa"]].map(([v, t]) => el("label", { class: "auto-chip" }, [el("input", { type: "radio", name: "auto-lugar", value: v, checked: v === lugarSalvo }), el("span", { text: t })]))]),
        // Botões
        el("div", { class: "modal-actions" }, [
          // Plano da semana
          el("button", { type: "button", class: "btn-secondary", "data-action": "plano-semanal", text: "Montar plano da semana" }),
          // Treino de hoje
          el("button", { type: "submit", class: "btn-primary", text: "Montar treino de hoje" }),
        ]),
      ]);
      // Quando envia: monta o treino de hoje
      form.addEventListener("submit", (e) => {
        // Impede a página de recarregar
        e.preventDefault();
        // Confere o Premium
        if (!podeUsarAutomatico()) return;
        // Respostas
        const tempo = Number(form.querySelector('[name="auto-tempo"]:checked').value);
        // Foco
        const foco = form.querySelector('[name="auto-foco"]:checked').value;
        // Lugar
        const lugar = form.querySelector('[name="auto-lugar"]:checked').value;
        // Lembra o lugar para a próxima vez
        storage.set("sl-lugar", lugar);
        // Grupos do foco ("Corpo inteiro" mistura vários)
        const grupos = foco === "Corpo inteiro" ? ["Pernas", "Peito", "Costas", "Core", "Ombros"] : foco === "Cardio" ? ["Cardio", "Core"] : [foco, foco === "Pernas" ? "Core" : foco];
        // Quantos exercícios cabem no tempo (uns 8 minutos cada)
        const itens = sortear(grupos, lugar, Math.max(3, Math.round(tempo / 8)));
        // Salva o treino novo
        adicionarTreinos([{ id: "t" + Date.now(), nome: `${foco} em ${tempo} min`, grupo: `${foco} • ${lugar === "casa" ? "em casa" : "academia"}`, itens, exercicios: itens.length }], "Treino montado! Ele está no topo da lista.");
      });
      // Abre o modal
      SL.openModal("Montar treino automático", form);
    });

    // Botão "Montar plano da semana": divide a semana em treinos A, B, C...
    SL.acao("plano-semanal", () => {
      // Confere o Premium
      if (!podeUsarAutomatico()) return;
      // Lugar escolhido no formulário (ou o salvo)
      const marcado = document.querySelector('[name="auto-lugar"]:checked');
      // Lugar
      const lugar = marcado ? marcado.value : storage.get("sl-lugar", "academia");
      // Dias por semana da meta (entre 2 e 6)
      const dias = Math.min(6, Math.max(2, Number(SL.onboarding().dias) || 4));
      // Divisões possíveis
      const DIVISOES = [
        // A
        ["Peito, ombros e tríceps", ["Peito", "Ombros", "Braços"]],
        // B
        ["Costas e bíceps", ["Costas", "Braços"]],
        // C
        ["Pernas e core", ["Pernas", "Core"]],
        // D
        ["Corpo inteiro e cardio", ["Cardio", "Pernas", "Peito", "Costas"]],
        // E
        ["Ombros, braços e core", ["Ombros", "Braços", "Core"]],
        // F
        ["Mobilidade e recuperação", ["Mobilidade", "Core"]],
      ];
      // Com 2 dias: superiores e inferiores; com mais, pega as primeiras divisões
      const escolha = dias === 2 ? [["Superiores", ["Peito", "Costas", "Ombros", "Braços"]], ["Inferiores e core", ["Pernas", "Core"]]] : DIVISOES.slice(0, dias);
      // Agora (para os ids)
      const agora = Date.now();
      // Monta um treino para cada divisão
      const novos = escolha.map(([nome, grupos], i) => {
        // Exercícios do treino
        const itens = sortear(grupos, lugar, 6);
        // Treino "Plano A — ..."
        return { id: `t${agora}${i}`, nome: `Plano ${"ABCDEF"[i]}: ${nome}`, grupo: nome, itens, exercicios: itens.length };
      });
      // Salva todos
      adicionarTreinos(novos, `Plano da semana pronto: ${novos.length} treinos (${dias} dias, como a sua meta).`);
    });

    // Botão "criar treino": abre o formulário vazio
    SL.acao("create-workout", () => abrirFormulario(null));
    // Botão "editar": abre o formulário com o treino clicado
    SL.acao("edit-workout", (alvo) => abrirFormulario(treinos.find((t) => t.id === alvo.dataset.id)));

    // Botão "excluir"...
    SL.acao("delete-workout", (alvo) => {
      // ...acha a posição do treino na lista
      const posicao = treinos.findIndex((t) => t.id === alvo.dataset.id);
      // Se não achou, para
      if (posicao < 0) return;
      // Pega o treino
      const treino = treinos[posicao];
      // Pede confirmação antes de excluir
      SL.confirmar({
        // Título da confirmação
        titulo: "Excluir treino?",
        // Texto da confirmação
        texto: `"${treino.nome}" sai da sua lista. O histórico de treinos feitos continua salvo.`,
        // Texto do botão
        rotulo: "Excluir",
        // Botão vermelho (perigo)
        perigo: true,
        // Se a pessoa confirmar...
        fn: () => {
          // ...tira o treino da lista
          treinos = treinos.filter((t) => t.id !== treino.id);
          // ...salva
          guardar();
          // ...desenha de novo
          render();
          // ...e mostra o aviso com o botão "Desfazer"
          SL.toast("Treino excluído", {
            // Botão do aviso
            acao: {
              // Texto do botão
              rotulo: "Desfazer",
              // Se clicar em desfazer...
              fn: () => {
                // ...coloca o treino de volta no mesmo lugar
                treinos.splice(posicao, 0, treino);
                // ...salva
                guardar();
                // ...desenha de novo
                render();
                // ...e avisa
                SL.toast("Treino restaurado");
              },
            },
          });
        },
      });
    });

    // Mostra o carregando e depois desenha a lista
    SL.carregar(lista, render);
  });
