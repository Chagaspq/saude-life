// Aulas: reservar e cancelar vaga
window.SL &&
  SL.pagina(() => {
    const { el, storage } = SL;
    const { AULAS } = window.SL_DADOS;
    let reservas = storage.get("sl-reservas", []);
    const alvo = document.querySelector('[data-render="aulas"]');

    function render() {
      alvo.replaceChildren(
        ...AULAS.map((aula) => {
          const reservado = reservas.includes(aula.nome);
          const vagas = aula.vagas - (reservado ? 1 : 0);
          const lotada = aula.vagas === 0;
          return el("article", { class: "challenge-card" }, [
            el("h3", { text: aula.nome }),
            el("p", { class: "meta", text: `${aula.dia} • ${aula.hora} • com ${aula.professor}` }),
            el("p", {
              class: "meta" + (lotada ? " text-coral" : ""),
              text: lotada ? "Turma lotada" : `${vagas} de ${aula.total} vagas disponíveis`,
            }),
            el("button", {
              class: reservado ? "btn-secondary" : "btn-primary",
              "data-action": "book-class",
              "data-nome": aula.nome,
              disabled: lotada,
              text: lotada ? "Lista de espera em breve" : reservado ? "Cancelar reserva" : "Reservar vaga",
            }),
          ]);
        }),
      );
    }

    SL.acao("book-class", (btn) => {
      const nome = btn.dataset.nome;
      reservas = reservas.includes(nome) ? reservas.filter((r) => r !== nome) : reservas.concat(nome);
      storage.set("sl-reservas", reservas);
      render();
      SL.toast(reservas.includes(nome) ? "Vaga reservada!" : "Reserva cancelada");
    });

    SL.carregar(alvo, render, 4);
  });
