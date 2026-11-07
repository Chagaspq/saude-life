// Aulas: reservar e cancelar vaga, lista de espera, avaliar e ver a grade da semana.
// Reservar uma aula vale pontos no ranking.
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
    // Lugar da grade da semana
    const grade = document.querySelector('[data-render="grade"]');
    // Nomes curtos dos dias (0 = segunda)
    const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    // Dia de hoje (0 = segunda)
    const hoje = (new Date().getDay() + 6) % 7;

    // Fila de espera da pessoa: nomes das aulas
    const espera = () => storage.get("sl-espera", []);
    // Notas que a pessoa deu: { aula: nota }
    const notas = () => storage.get("sl-avaliacoes-aulas", {});
    // Posição na fila (fixa para cada aula: entre 2º e 5º)
    const posicaoFila = (nome) => 2 + (nome.length % 4);

    // Cria o card de uma aula
    function card(aula) {
      // Confere se a pessoa reservou esta aula
      const reservado = reservas.includes(aula.nome);
      // Vagas que sobram (tira uma se a pessoa reservou)
      const vagas = aula.vagas - (reservado ? 1 : 0);
      // A aula está lotada se não tem nenhuma vaga
      const lotada = aula.vagas === 0;
      // Está na fila de espera?
      const naFila = espera().includes(aula.nome);
      // Nota que a pessoa deu (se deu)
      const minhaNota = notas()[aula.nome];
      // Próxima vez que a aula acontece
      const quando = SL.proximaAula(aula);
      // Minutos até começar
      const faltam = quando ? Math.round((quando - Date.now()) / 60000) : 9999;
      // Card da aula
      return el("article", { class: "challenge-card aula-card" + (reservado ? " is-reservada" : "") }, [
        // Nome da aula e nota média
        el("div", { class: "aula-topo" }, [el("h3", { text: aula.nome }), el("span", { class: "aula-nota", text: `★ ${SL.num(aula.nota, 1)}` })]),
        // Dia, hora e professor
        el("p", { class: "meta", text: `${aula.dia} • ${aula.hora} • ${aula.duracao} min • com ${aula.professor}` }),
        // Sala (e se tem a opção online)
        el("p", { class: "meta" }, [aula.sala, aula.online ? el("span", { class: "tag tag-success aula-online-tag", text: "Também online" }) : null]),
        // Próxima aula
        quando ? el("p", { class: "meta", text: `Próxima: ${faltam <= 0 ? "acontecendo agora" : quando.toLocaleDateString("pt-BR", { weekday: "long" }) + " às " + aula.hora}` }) : null,
        // Linha das vagas
        el("p", {
          // Fica coral quando a turma está lotada
          class: "meta" + (lotada ? " text-coral" : ""),
          // Texto: lotada (e a fila) ou quantas vagas sobram
          text: lotada ? (naFila ? `Turma lotada • você é o ${posicaoFila(aula.nome)}º da fila` : "Turma lotada") : `${vagas} de ${aula.total} vagas disponíveis`,
        }),
        // Regra de cancelamento (quem reservou)
        reservado ? el("p", { class: "meta aula-regra", text: faltam < 120 ? "Não dá mais para cancelar (menos de 2h para a aula)" : "Você pode cancelar até 2h antes. Avisamos 1h antes." }) : null,
        // Botões
        el("div", { class: "card-actions" }, [
          // Botão principal: reservar, cancelar, entrar ou sair da fila
          el("button", {
            // Visual: secundário se já está dentro
            class: reservado || naFila ? "btn-secondary" : "btn-primary",
            // Ação do clique
            "data-action": lotada ? "fila-aula" : "book-class",
            // Guarda no botão o nome da aula
            "data-nome": aula.nome,
            // Texto do botão conforme a situação
            text: lotada ? (naFila ? "Sair da fila" : "Entrar na lista de espera") : reservado ? "Cancelar reserva" : "Reservar vaga (+30 pts)",
          }),
          // Entrar na aula online (quem reservou; abre 15 min antes)
          reservado && aula.online
            ? faltam <= 15
              ? el("a", { class: "btn-primary", href: aula.online, target: "_blank", rel: "noopener", text: "Entrar na aula online" })
              : el("span", { class: "meta", text: "O link da aula online libera 15 min antes" })
            : null,
          // Pôr na agenda (quem reservou)
          reservado ? el("button", { class: "btn-link", "data-action": "agenda-aula", "data-nome": aula.nome, text: "Adicionar à agenda" }) : null,
          // Avaliar (só quem reservou)
          reservado ? el("button", { class: "btn-link", "data-action": "avaliar-aula", "data-nome": aula.nome, text: minhaNota ? `Sua nota: ${"★".repeat(minhaNota)}` : "Avaliar aula" }) : null,
        ]),
      ]);
    }

    // Desenha as aulas (lista e grade)
    function render() {
      // Lista de cards
      alvo.replaceChildren(...AULAS.map(card));
      // Grade da semana: uma coluna por dia
      grade.replaceChildren(
        // Para cada dia...
        ...DIAS.map((d, i) =>
          // ...coluna do dia (destaca hoje)
          el("section", { class: "aulas-dia" + (i === hoje ? " is-hoje" : ""), "aria-label": d }, [
            // Nome do dia
            el("h3", { text: i === hoje ? `${d} (hoje)` : d }),
            // Aulas desse dia, em ordem de horário
            ...AULAS.filter((a) => a.dias.includes(i))
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map((a) =>
                // Bloco da aula (destacado se reservada)
                el("div", { class: "aulas-bloco" + (reservas.includes(a.nome) ? " is-reservada" : "") + (a.vagas === 0 ? " is-lotada" : "") }, [
                  // Hora
                  el("strong", { text: a.hora }),
                  // Nome
                  el("span", { text: a.nome }),
                  // Vagas
                  el("small", { text: a.vagas === 0 ? "lotada" : `${a.vagas - (reservas.includes(a.nome) ? 1 : 0)} vagas` }),
                ]),
              ),
          ]),
        ),
      );
    }

    // Quando clicam em reservar/cancelar...
    SL.acao("book-class", (btn) => {
      // ...pega o nome da aula do botão
      const nome = btn.dataset.nome;
      // Se vai cancelar com menos de 2h para a aula, não deixa
      if (reservas.includes(nome)) {
        // Aula
        const aula = AULAS.find((a) => a.nome === nome);
        // Próxima vez
        const quando = SL.proximaAula(aula);
        // Menos de 2 horas: avisa e para
        if (quando && quando - Date.now() < 2 * 3600000) return SL.toast("Só dá para cancelar até 2 horas antes da aula");
      }
      // Se já estava reservada, tira da lista; se não, adiciona
      reservas = reservas.includes(nome) ? reservas.filter((r) => r !== nome) : reservas.concat(nome);
      // Salva a lista de reservas no navegador
      storage.set("sl-reservas", reservas);
      // Desenha as aulas de novo
      render();
      // Mostra um aviso rápido na tela
      SL.toast(reservas.includes(nome) ? "Vaga reservada!" : "Reserva cancelada");
      // Se o motor de pontos carregou...
      if (SL.pontos) {
        // ...nome único da aula nesta semana
        const ref = `aula:${nome}:${SL.pontos.semanaAtual()}`;
        // ...reservou: ganha pontos; cancelou: perde
        reservas.includes(nome) ? SL.pontos.ganhar("aula", ref, { origem: btn }) : SL.pontos.perder(ref);
      }
    });

    // Baixar a aula para a agenda (repete toda semana nos dias dela)
    SL.acao("agenda-aula", (btn) => {
      // Aula
      const aula = AULAS.find((a) => a.nome === btn.dataset.nome);
      // Agenda: dias da aula (0 = segunda) viram dias da agenda (0 = domingo)
      SL.baixarAgenda({ titulo: `${aula.nome} - Saúde Life`, inicio: SL.proximaAula(aula), minutos: aula.duracao, descricao: `${aula.sala} com ${aula.professor}${aula.online ? ". Online: " + aula.online : ""}`, repetir: aula.dias.map((d) => (d + 1) % 7) });
    });

    // Entrar ou sair da lista de espera
    SL.acao("fila-aula", (btn) => {
      // Nome da aula
      const nome = btn.dataset.nome;
      // Fila atual
      const fila = espera();
      // Entra ou sai
      storage.set("sl-espera", fila.includes(nome) ? fila.filter((n) => n !== nome) : fila.concat(nome));
      // Desenha de novo
      render();
      // Avisa
      SL.toast(espera().includes(nome) ? `Você entrou na fila (${posicaoFila(nome)}º). Avisamos se abrir vaga!` : "Você saiu da fila");
    });

    // Avaliar uma aula com estrelas
    SL.acao("avaliar-aula", (btn) => {
      // Nome da aula
      const nome = btn.dataset.nome;
      // Formulário com 5 estrelas
      const form = el("form", { class: "modal-form" }, [
        // Estrelas
        el("fieldset", { class: "estrelas" }, [el("legend", { text: "Como foi a aula?" }), ...[5, 4, 3, 2, 1].map((n) => el("label", {}, [el("input", { type: "radio", name: "nota", value: n, checked: n === (notas()[nome] || 5) }), el("span", { "aria-hidden": "true", text: "★" }), el("span", { class: "sr-only", text: `${n} estrelas` })]))]),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Salvar nota" }),
      ]);
      // Quando envia...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // ...notas salvas
        const todas = notas();
        // ...guarda a nota
        todas[nome] = Number(form.querySelector('[name="nota"]:checked').value);
        // ...salva
        storage.set("sl-avaliacoes-aulas", todas);
        // ...fecha
        SL.closeModal();
        // ...desenha
        render();
        // ...agradece
        SL.toast("Valeu! Sua nota ajuda os professores.");
      });
      // Abre
      SL.openModal(`Avaliar ${nome}`, form);
    });

    // Botões de visão (lista ou grade)
    document.querySelector(".aulas-visao").addEventListener("click", (e) => {
      // Botão clicado
      const b = e.target.closest("[data-visao]");
      // Se não foi num botão, para
      if (!b) return;
      // Grade escolhida?
      const vendoGrade = b.dataset.visao === "grade";
      // Mostra a grade ou a lista
      grade.hidden = !vendoGrade;
      // (a lista é o contrário)
      alvo.hidden = vendoGrade;
      // Atualiza os botões
      document.querySelectorAll("[data-visao]").forEach((x) => {
        // Destaca o escolhido
        x.classList.toggle("is-active", x === b);
        // Avisa os leitores de tela
        x.setAttribute("aria-pressed", String(x === b));
      });
    });

    // Mostra 4 cards de carregando e depois desenha a página
    SL.carregar(alvo, render, 4);
  });
