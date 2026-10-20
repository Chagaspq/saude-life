// Aulas: reservar e cancelar vaga
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo a função que cria elementos e a que lê/salva dados
    const { el, storage } = SL;
    // Pega a lista de aulas do arquivo de dados
    const { AULAS } = window.SL_DADOS;
    // Lê as aulas que a pessoa já reservou (ou lista vazia)
    let reservas = storage.get("sl-reservas", []);
    // Lugar da página onde as aulas aparecem
    const alvo = document.querySelector('[data-render="aulas"]');

    // Função que desenha as aulas na tela
    function render() {
      // Troca o conteúdo da área pelos cards novos
      alvo.replaceChildren(
        // Cria um card para cada aula
        ...AULAS.map((aula) => {
          // Confere se a pessoa reservou esta aula
          const reservado = reservas.includes(aula.nome);
          // Vagas que sobram (tira uma se a pessoa reservou)
          const vagas = aula.vagas - (reservado ? 1 : 0);
          // A aula está lotada se não tem nenhuma vaga
          const lotada = aula.vagas === 0;
          // Card da aula
          return el("article", { class: "challenge-card" }, [
            // Nome da aula
            el("h3", { text: aula.nome }),
            // Dia, hora e professor
            el("p", { class: "meta", text: `${aula.dia} • ${aula.hora} • com ${aula.professor}` }),
            // Linha das vagas
            el("p", {
              // Fica coral quando a turma está lotada
              class: "meta" + (lotada ? " text-coral" : ""),
              // Texto: "Turma lotada" ou quantas vagas sobram
              text: lotada ? "Turma lotada" : `${vagas} de ${aula.total} vagas disponíveis`,
            }),
            // Botão de reservar
            el("button", {
              // Botão secundário se já reservou, principal se não
              class: reservado ? "btn-secondary" : "btn-primary",
              // Ação que o clique dispara
              "data-action": "book-class",
              // Guarda no botão o nome da aula
              "data-nome": aula.nome,
              // Desliga o botão se a turma está lotada
              disabled: lotada,
              // Texto do botão conforme a situação
              text: lotada ? "Lista de espera em breve" : reservado ? "Cancelar reserva" : "Reservar vaga",
            }),
          ]);
        }),
      );
    }

    // Quando clicam em reservar/cancelar...
    SL.acao("book-class", (btn) => {
      // ...pega o nome da aula do botão
      const nome = btn.dataset.nome;
      // Se já estava reservada, tira da lista; se não, adiciona
      reservas = reservas.includes(nome) ? reservas.filter((r) => r !== nome) : reservas.concat(nome);
      // Salva a lista de reservas no navegador
      storage.set("sl-reservas", reservas);
      // Desenha as aulas de novo
      render();
      // Mostra um aviso rápido na tela
      SL.toast(reservas.includes(nome) ? "Vaga reservada!" : "Reserva cancelada");
    });

    // Mostra 4 cards de carregando e depois desenha a página
    SL.carregar(alvo, render, 4);
  });
