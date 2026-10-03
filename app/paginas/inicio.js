// Início: resumo da semana, treino para continuar, recomendados e profissionais
window.SL &&
  SL.pagina(() => {
    const { el, icone, ICONES } = SL;
    const { CATALOGO, PROFISSIONAIS } = window.SL_DADOS;
    const stats = SL.estatisticas();

    /* Frase abaixo da saudação muda conforme a meta da semana */
    const faltam = Math.max(0, stats.meta - stats.nestaSemana);
    document.querySelector('[data-render="frase-semana"]').textContent = faltam
      ? `Faltam ${faltam} treino${faltam > 1 ? "s" : ""} para bater sua meta da semana.`
      : "Meta da semana batida. Que tal um treino leve de mobilidade?";

    /* Resumo: 4 números + bolinhas dos dias da semana */
    const semana = SL.inicioDaSemana(new Date());
    const diasComTreino = new Set(
      SL.historico()
        .filter((h) => new Date(h.data) >= semana)
        .map((h) => (new Date(h.data).getDay() + 6) % 7),
    );
    const hojeIndice = (new Date().getDay() + 6) % 7;
    const dias = el(
      "div",
      { class: "week-dots", "aria-label": `Treinou em ${diasComTreino.size} dia(s) desta semana` },
      ["S", "T", "Q", "Q", "S", "S", "D"].map((letra, i) =>
        el("span", {
          class: "week-dot" + (diasComTreino.has(i) ? " is-done" : "") + (i === hojeIndice ? " is-today" : ""),
          "aria-hidden": "true",
          text: letra,
        }),
      ),
    );

    document.querySelector('[data-render="resumo"]').replaceChildren(
      SL.statTile({ rotulo: "Meta da semana", valor: `${stats.nestaSemana} de ${stats.meta}`, iconePaths: ICONES.alvo, extra: dias }),
      SL.statTile({ rotulo: "Sequência", valor: `${stats.sequencia} semana${stats.sequencia === 1 ? "" : "s"}`, detalhe: "treinando sem parar", iconePaths: ICONES.fogo }),
      SL.statTile({ rotulo: "Treinos realizados", valor: SL.num(stats.total), detalhe: "desde que você começou", iconePaths: ICONES.trofeu, cor: "emerald" }),
      SL.statTile({ rotulo: "Tempo treinado", valor: SL.duracaoTexto(stats.minutos), detalhe: "somando todos os treinos", iconePaths: ICONES.relogio, cor: "emerald" }),
    );

    /* Continue seu treino: o que está em andamento ou o próximo sugerido */
    const atual = SL.treinoAtual();
    const meus = SL.treinosDoUsuario();
    let treino = atual && SL.acharTreino(atual.treinoId);
    let feitos = 0;
    let total = 0;
    if (treino) {
      total = SL.exerciciosDe(treino).length;
      feitos = atual.feitos || 0;
    } else {
      // Sugere o treino feito há mais tempo
      treino = meus
        .slice()
        .sort((a, b) => String(SL.ultimaVez(a.id) || "").localeCompare(String(SL.ultimaVez(b.id) || "")))[0];
      if (treino) total = SL.exerciciosDe(treino).length;
    }

    const alvoContinue = document.querySelector('[data-render="continue"]');
    if (!treino) {
      alvoContinue.replaceChildren(
        SL.estadoVazio(
          "Nenhum treino ainda",
          "Crie seu primeiro treino ou escolha um pronto.",
          el("a", { href: "descobrir.html", class: "btn-primary", text: "Descobrir treinos" }),
        ),
      );
    } else {
      document.querySelector('[data-render="titulo-continue"]').textContent = atual ? "Continue seu treino" : "Próximo treino sugerido";
      const exercicios = SL.exerciciosDe(treino);
      const proximo = exercicios[Math.min(feitos, exercicios.length - 1)];
      const pct = total ? Math.round((feitos / total) * 100) : 0;
      alvoContinue.replaceChildren(
        el("article", { class: "workout-hero" }, [
          el("div", { class: "workout-hero-top" }, [
            el("span", { class: "icon-tile icon-tile-coral icon-tile-lg", "aria-hidden": "true" }, [icone(ICONES.haltere)]),
            el("div", { class: "workout-hero-info" }, [
              el("h3", { text: treino.nome }),
              el("p", { class: "meta", text: `${treino.grupo} • ${total} exercícios` }),
            ]),
          ]),
          el("p", { class: "workout-hero-next" }, [
            el("span", { text: atual ? `Exercício ${feitos + 1} de ${total}` : `Última vez: ${SL.dataRelativa(SL.ultimaVez(treino.id))}` }),
            el("strong", { text: `${atual ? "Próximo" : "Começa com"}: ${proximo.nome}` }),
          ]),
          atual
            ? el(
                "div",
                {
                  class: "progress-bar-sm",
                  role: "progressbar",
                  "aria-label": "Progresso do treino",
                  "aria-valuenow": pct,
                  "aria-valuemin": 0,
                  "aria-valuemax": 100,
                },
                [el("div", { class: "fill", "data-progress": pct })],
              )
            : null,
          el("a", { href: SL.linkTreino(treino.id), class: "btn-primary btn-with-icon" }, [
            icone(ICONES.play),
            atual ? "Continuar treino" : "Iniciar treino",
          ]),
        ]),
      );
    }

    /* Recomendados: primeiro os do objetivo escolhido no questionário */
    const objetivo = SL.onboarding().objetivo;
    CATALOGO.slice()
      .sort((a, b) => (b.objetivo === objetivo) - (a.objetivo === objetivo) || b.nota - a.nota)
      .slice(0, 6)
      .forEach((t) => document.querySelector('[data-render="recomendados"]').append(SL.cardTreinoCatalogo(t)));

    /* Profissionais em destaque */
    document
      .querySelector('[data-render="pros-destaque"]')
      .replaceChildren(...PROFISSIONAIS.slice(0, 4).map(SL.cardProfissional));

    SL.aplicarProgresso();
  });
