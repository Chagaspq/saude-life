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
        // Caixa de texto dos exercícios, um por linha
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
          (n) => anteriores.find((a) => a.nome.toLowerCase() === n.toLowerCase()) || { nome: n, series: 3, reps: 12, carga: 0, descanso: 60 },
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
