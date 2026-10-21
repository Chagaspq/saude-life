// Perfil: números iguais aos do Início, objetivos, conquistas,
// atividade recente e preferências
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ler/salvar dados e os ícones
    const { el, storage, icone, ICONES } = SL;
    // Calcula os números de treino (total, sequência, semana...)
    const stats = SL.estatisticas();
    // Atalho para achar um pedaço da página pelo data-render
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);

    // Mostra o total de treinos feitos
    $("treinos-count").textContent = SL.num(stats.total);
    // Mostra quantas semanas seguidas a pessoa treinou
    $("sequencia").textContent = SL.num(stats.sequencia);
    // Mostra quantos profissionais a pessoa segue
    $("seguindo-count").textContent = SL.num(storage.get("sl-seguindo", []).length);

    // Desenha o que a pessoa personalizou: capa, Pulso, plano e selos em destaque
    function renderPersonalizado() {
      // Perfil salvo
      const perfil = storage.get("sl-perfil", {});
      // Card do topo
      const card = document.querySelector(".profile-header-card");
      // Capa escolhida (padrão: brasa)
      card.dataset.capa = perfil.capa || "brasa";
      // Tira o que foi desenhado antes (para não repetir)
      card.querySelectorAll(".perfil-extra").forEach((x) => x.remove());
      // Pulso com a roupa escolhida, no canto do card
      if (SL.personagem) card.append(el("div", { class: "perfil-extra perfil-pulso" }, [SL.personagem.desenhar()]));
      // Selo do plano ao lado do nome
      document.getElementById("heading-perfil").append(el("span", { class: `perfil-extra tag perfil-plano${SL.premium() ? " is-premium" : ""}`, text: SL.premium() ? "Premium ✦" : "Free" }));
      // Selos conquistados
      const selos = SL.pontos ? SL.pontos.selos().filter((x) => x.feito) : [];
      // Os escolhidos para destaque (só os que ainda valem)
      const escolhidos = (perfil.selos || []).map((id) => selos.find((x) => x.id === id)).filter(Boolean);
      // Se tem selos em destaque, mostra embaixo da bio
      if (escolhidos.length)
        // Lista de selos
        document.querySelector(".profile-info .bio").after(
          el("ul", { class: "perfil-extra perfil-destaques", "aria-label": "Selos em destaque" }, escolhidos.map((x) => el("li", { title: x.texto, text: "🏅 " + x.nome }))),
        );
    }
    // Desenha agora
    renderPersonalizado();
    // E de novo quando a pessoa salvar o perfil
    document.addEventListener("sl:perfil", renderPersonalizado);

    // Lê as respostas do questionário inicial
    const obj = SL.onboarding();
    // Troca a lista de objetivos pelos dados novos
    $("objetivos").replaceChildren(
      // Lista de pares [título, valor]
      ...[
        // Objetivo escolhido
        ["Objetivo", obj.rotulo || obj.objetivo],
        // Nível escolhido
        ["Nível", obj.nivel],
        // Quantos treinos por semana
        ["Meta semanal", `${obj.dias} treinos por semana`],
      // Transforma cada par em um título (dt) e um valor (dd)
      ].map(([dt, dd]) => el("div", {}, [el("dt", { text: dt }), el("dd", { text: dd })])),
    );

    // Lista das conquistas: nome, texto, se já foi feita e o ícone
    const conquistas = [
      // Conquista do primeiro treino
      { nome: "Primeiro treino", texto: "Registrou o primeiro treino", feito: stats.total >= 1, icone: ICONES.play },
      // Conquista de 10 treinos
      { nome: "10 treinos", texto: "Dez treinos concluídos", feito: stats.total >= 10, icone: ICONES.haltere },
      // Conquista de 25 treinos (mostra quanto falta)
      { nome: "25 treinos", texto: `${Math.min(stats.total, 25)} de 25 treinos`, feito: stats.total >= 25, icone: ICONES.trofeu },
      // Conquista de bater a meta da semana
      { nome: "Meta da semana", texto: `${stats.nestaSemana} de ${stats.meta} nesta semana`, feito: stats.nestaSemana >= stats.meta, icone: ICONES.alvo },
      // Conquista de 4 semanas seguidas
      { nome: "Constância", texto: "4 semanas seguidas treinando", feito: stats.sequencia >= 4, icone: ICONES.fogo },
      // Conquista de entrar em um desafio
      { nome: "Desafiante", texto: "Entrou em um desafio", feito: Boolean(storage.get("sl-desafio", null)), icone: ICONES.calendario },
    ];
    // Mostra quantas conquistas foram feitas, ex.: "3 de 6"
    $("conquistas-total").textContent = `${conquistas.filter((c) => c.feito).length} de ${conquistas.length}`;
    // Troca a lista de conquistas pelos cards novos
    $("conquistas").replaceChildren(
      // Um item para cada conquista
      ...conquistas.map((c) =>
        // Item da lista; ganha destaque (is-earned) se foi conquistada
        el("li", { class: "badge-item" + (c.feito ? " is-earned" : "") }, [
          // Ícone da conquista (escondido dos leitores de tela)
          el("span", { class: "badge-icon", "aria-hidden": "true" }, [icone(c.icone)]),
          // Nome da conquista
          el("strong", { text: c.nome }),
          // Texto da conquista
          el("span", { text: c.texto }),
          // Texto só para leitores de tela dizendo se foi conquistada
          el("span", { class: "sr-only", text: c.feito ? "Conquistada" : "Ainda não conquistada" }),
        ]),
      ),
    );

    // Troca a lista de atividade recente
    $("atividade").replaceChildren(
      // Pega o histórico de treinos
      ...SL.historico()
        // Só os 4 mais recentes
        .slice(0, 4)
        // Transforma cada treino em um item da lista
        .map((h) =>
          // Item do histórico
          el("li", { class: "history-item" }, [
            // Ícone de "check" coral
            el("span", { class: "icon-tile icon-tile-coral", "aria-hidden": "true" }, [icone(ICONES.check)]),
            // Nome do treino, quando foi e quanto tempo durou
            el("div", {}, [el("strong", { text: h.nome }), el("span", { text: `${SL.dataRelativa(h.data)} • ${SL.duracaoTexto(h.duracao)}` })]),
          ]),
        ),
    );

    // Para cada chave de preferência (notificações etc.)...
    document.querySelectorAll("[data-pref]").forEach((input) => {
      // ...marca ou desmarca conforme o que está salvo (padrão: ligada)
      input.checked = storage.get(input.dataset.pref, true);
      // Quando a pessoa muda a chave...
      input.addEventListener("change", () => {
        // ...salva a escolha no navegador
        storage.set(input.dataset.pref, input.checked);
        // ...e mostra um aviso rápido
        SL.toast("Preferência salva");
      });
    });

    // Painel do modo demonstração (depois da seção Conta)
    if (SL.demo) {
      // Coloca o painel
      document.querySelector('[aria-labelledby="heading-conta"]').after(SL.demo.painel());
      // Se o endereço pede o painel (#heading-demo), rola até ele
      if (location.hash === "#heading-demo") document.getElementById("heading-demo").scrollIntoView();
    }
  });
