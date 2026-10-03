// Meus treinos: listar, criar, editar, excluir (com desfazer) e iniciar
window.SL &&
  SL.pagina(() => {
    const { el, storage, icone, ICONES } = SL;
    let treinos = SL.treinosDoUsuario();
    const lista = document.querySelector(".workouts-list-container");

    function guardar() {
      storage.set("sl-treinos", treinos);
    }

    function render() {
      lista.replaceChildren();

      if (!treinos.length) {
        lista.append(
          SL.estadoVazio(
            "Você ainda não criou treinos",
            "Monte seu primeiro treino e acompanhe cada série.",
            el("button", { class: "btn-primary", "data-action": "create-workout", text: "Criar treino" }),
          ),
        );
      }

      const atual = SL.treinoAtual();
      treinos.forEach((treino) => {
        const exercicios = SL.exerciciosDe(treino);
        const emAndamento = atual && atual.treinoId === treino.id;
        lista.append(
          el("article", { class: "workout-card workout-card-col" }, [
            el("div", { class: "workout-card-head" }, [
              el("span", { class: "icon-tile icon-tile-coral icon-tile-lg", "aria-hidden": "true" }, [icone(ICONES.haltere)]),
              el("div", { class: "card-info" }, [
                el("h3", { text: treino.nome }),
                el("p", { class: "muscle-group", text: treino.grupo }),
              ]),
              emAndamento ? el("span", { class: "tag tag-success", text: "Em andamento" }) : null,
            ]),
            el("ul", { class: "workout-facts" }, [
              el("li", {}, [el("strong", { text: String(exercicios.length) }), " exercícios"]),
              el("li", {}, [el("strong", { text: String(exercicios.reduce((s, e) => s + e.series, 0)) }), " séries"]),
              el("li", { text: `Último: ${SL.dataRelativa(SL.ultimaVez(treino.id))}` }),
            ]),
            el("div", { class: "card-actions" }, [
              el("a", { href: SL.linkTreino(treino.id), class: "btn-primary btn-with-icon" }, [
                icone(ICONES.play),
                emAndamento ? "Continuar" : "Iniciar treino",
              ]),
              el("button", { class: "btn-icon btn-outline", "data-action": "open-workout-modal", "data-id": treino.id, "aria-label": `Ver exercícios de ${treino.nome}` }, [
                icone(["M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]),
              ]),
              el("button", { class: "btn-icon btn-outline", "data-action": "edit-workout", "data-id": treino.id, "aria-label": `Editar treino ${treino.nome}` }, [
                icone(ICONES.lapis),
              ]),
              el("button", { class: "btn-icon btn-outline btn-danger", "data-action": "delete-workout", "data-id": treino.id, "aria-label": `Excluir treino ${treino.nome}` }, [
                SL.iconeLixeira(),
              ]),
            ]),
          ]),
        );
      });
    }

    // Formulário de criar e editar: um exercício por linha
    function abrirFormulario(treino) {
      const editando = Boolean(treino);
      const form = el("form", { class: "modal-form" }, [
        SL.campo("treino-nome", "Nome do treino", { placeholder: "Ex: Membros Superiores B", required: true, maxlength: 60 }),
        SL.campo("treino-grupo", "Grupo muscular", { placeholder: "Ex: Peito e Tríceps", maxlength: 60 }),
        SL.campo("treino-itens", "Exercícios (um por linha)", { multiline: true, placeholder: "Supino reto\nCrucifixo\nTríceps na corda" }),
        el("p", { class: "form-hint", text: "Cada exercício começa com 3 séries de 12. Você ajusta reps e carga durante o treino." }),
        el("button", { type: "submit", class: "btn-primary", text: editando ? "Salvar alterações" : "Salvar treino" }),
      ]);
      const campoItens = form.querySelector("#treino-itens");
      campoItens.rows = 6;

      if (editando) {
        form.querySelector("#treino-nome").value = treino.nome;
        form.querySelector("#treino-grupo").value = treino.grupo;
        campoItens.value = SL.exerciciosDe(treino)
          .map((e) => e.nome)
          .join("\n");
      }

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = form.querySelector("#treino-nome").value.trim();
        if (!nome) {
          form.querySelector("#treino-nome").focus();
          return;
        }
        // Mantém séries e cargas dos exercícios que já existiam
        const anteriores = editando ? SL.exerciciosDe(treino) : [];
        const nomes = campoItens.value
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 30);
        const itens = (nomes.length ? nomes : ["Exercício 1"]).map(
          (n) => anteriores.find((a) => a.nome.toLowerCase() === n.toLowerCase()) || { nome: n, series: 3, reps: 12, carga: 0, descanso: 60 },
        );
        const dados = {
          nome,
          grupo: form.querySelector("#treino-grupo").value.trim() || "Corpo inteiro",
          itens,
          exercicios: itens.length,
        };

        if (editando) {
          treinos = treinos.map((t) => (t.id === treino.id ? { ...t, ...dados } : t));
        } else {
          treinos.unshift({ id: "t" + Date.now(), ...dados });
        }
        guardar();
        render();
        SL.closeModal();
        SL.toast(editando ? "Treino atualizado" : "Treino salvo!");
      });

      SL.openModal(editando ? "Editar treino" : "Criar novo treino", form);
    }

    SL.acao("create-workout", () => abrirFormulario(null));
    SL.acao("edit-workout", (alvo) => abrirFormulario(treinos.find((t) => t.id === alvo.dataset.id)));

    SL.acao("delete-workout", (alvo) => {
      const posicao = treinos.findIndex((t) => t.id === alvo.dataset.id);
      if (posicao < 0) return;
      const treino = treinos[posicao];
      SL.confirmar({
        titulo: "Excluir treino?",
        texto: `"${treino.nome}" sai da sua lista. O histórico de treinos feitos continua salvo.`,
        rotulo: "Excluir",
        perigo: true,
        fn: () => {
          treinos = treinos.filter((t) => t.id !== treino.id);
          guardar();
          render();
          SL.toast("Treino excluído", {
            acao: {
              rotulo: "Desfazer",
              fn: () => {
                treinos.splice(posicao, 0, treino);
                guardar();
                render();
                SL.toast("Treino restaurado");
              },
            },
          });
        },
      });
    });

    SL.carregar(lista, render);
  });
