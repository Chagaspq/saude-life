// Meus treinos: listar, criar e excluir (salvos no localStorage)
window.SL &&
  SL.pagina(() => {
    const { el, storage } = SL;
    let treinos = storage.get("sl-treinos", window.SL_DADOS.TREINOS_PADRAO);
    const lista = document.querySelector(".workouts-list-container");

    function render() {
      lista.replaceChildren();

      if (!treinos.length) {
        lista.append(
          SL.estadoVazio(
            "Você ainda não criou treinos",
            "Monte seu primeiro treino e acompanhe cada série.",
            el("button", { class: "btn-primary", "data-action": "create-workout", text: "+ Criar treino" }),
          ),
        );
      }

      treinos.forEach((treino) => {
        lista.append(
          el("article", { class: "workout-card workout-card-col" }, [
            el("div", { class: "card-info" }, [
              el("h3", { text: treino.nome }),
              el("p", { class: "muscle-group", text: treino.grupo }),
              el("p", { class: "duration", text: `${treino.exercicios} exercícios • Último: ${treino.ultimo}` }),
            ]),
            el("div", { class: "card-actions" }, [
              el("button", { class: "btn-primary", "data-action": "continue-workout", text: "Iniciar" }),
              el(
                "button",
                {
                  class: "btn-icon btn-danger",
                  "data-action": "delete-workout",
                  "data-id": treino.id,
                  "aria-label": `Excluir treino ${treino.nome}`,
                },
                [SL.iconeLixeira()],
              ),
            ]),
          ]),
        );
      });
    }

    SL.acao("create-workout", () => {
      const form = el("form", { class: "modal-form" }, [
        SL.campo("treino-nome", "Nome do treino", { placeholder: "Ex: Membros Superiores B", required: true, maxlength: 60 }),
        SL.campo("treino-grupo", "Grupo muscular", { placeholder: "Ex: Peito e Tríceps", maxlength: 60 }),
        SL.campo("treino-exercicios", "Nº de exercícios", { type: "number", min: 1, max: 30, placeholder: "6" }),
        el("button", { type: "submit", class: "btn-primary", text: "Salvar treino" }),
      ]);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = form.querySelector("#treino-nome").value.trim();
        if (!nome) {
          form.querySelector("#treino-nome").focus();
          return;
        }
        treinos.unshift({
          id: "t" + Date.now(),
          nome,
          grupo: form.querySelector("#treino-grupo").value.trim() || "Corpo inteiro",
          exercicios: Number(form.querySelector("#treino-exercicios").value) || 1,
          ultimo: "Nunca",
        });
        storage.set("sl-treinos", treinos);
        render();
        SL.closeModal();
        SL.toast("Treino salvo!");
      });

      SL.openModal("Criar novo treino", form);
    });

    SL.acao("delete-workout", (alvo) => {
      const treino = treinos.find((t) => t.id === alvo.dataset.id);
      if (treino && confirm(`Excluir o treino "${treino.nome}"?`)) {
        treinos = treinos.filter((t) => t.id !== treino.id);
        storage.set("sl-treinos", treinos);
        render();
        SL.toast("Treino excluído");
      }
    });

    SL.carregar(lista, render);
  });
