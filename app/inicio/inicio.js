// Início: resumo da semana, treino para continuar, recomendados e profissionais
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos e os ícones
    const { el, icone, ICONES } = SL;
    // Pega o catálogo de treinos e a lista de profissionais
    const { CATALOGO, PROFISSIONAIS } = window.SL_DADOS;
    // Calcula os números de treino da pessoa
    const stats = SL.estatisticas();

    /* Frase abaixo da saudação muda conforme a meta da semana */
    // Quantos treinos faltam para a meta (nunca menos que zero)
    const faltam = Math.max(0, stats.meta - stats.nestaSemana);
    // Escreve a frase abaixo da saudação:
    document.querySelector('[data-render="frase-semana"]').textContent = faltam
      // se falta treino, diz quantos (com "s" no plural)
      ? `Faltam ${faltam} treino${faltam > 1 ? "s" : ""} para bater sua meta da semana.`
      // se não falta, parabeniza e sugere mobilidade
      : "Meta da semana batida. Que tal um treino leve de mobilidade?";

    /* Resumo: 4 números + bolinhas dos dias da semana */
    // Data em que a semana começou (segunda-feira)
    const semana = SL.inicioDaSemana(new Date());
    // Conjunto dos dias da semana em que a pessoa treinou
    const diasComTreino = new Set(
      // Pega o histórico de treinos
      SL.historico()
        // Só os treinos desta semana
        .filter((h) => new Date(h.data) >= semana)
        // Transforma a data no dia da semana (0 = segunda ... 6 = domingo)
        .map((h) => (new Date(h.data).getDay() + 6) % 7),
    );
    // Qual é o dia de hoje (0 = segunda)
    const hojeIndice = (new Date().getDay() + 6) % 7;
    // Cria as bolinhas dos dias da semana
    const dias = el(
      // Elas ficam dentro de uma div
      "div",
      // Texto para leitores de tela dizendo quantos dias treinou
      { class: "week-dots", "aria-label": `Treinou em ${diasComTreino.size} dia(s) desta semana` },
      // Uma bolinha para cada letra do dia da semana
      ["S", "T", "Q", "Q", "S", "S", "D"].map((letra, i) =>
        // Cria a bolinha
        el("span", {
          // Fica preenchida se treinou, e marcada se é hoje
          class: "week-dot" + (diasComTreino.has(i) ? " is-done" : "") + (i === hojeIndice ? " is-today" : ""),
          // Escondida dos leitores de tela (o texto já está acima)
          "aria-hidden": "true",
          // Letra do dia
          text: letra,
        }),
      ),
    );

    // Troca o resumo pelos 4 quadradinhos de números
    document.querySelector('[data-render="resumo"]').replaceChildren(
      // Meta da semana, com as bolinhas dos dias
      SL.statTile({ rotulo: "Meta da semana", valor: `${stats.nestaSemana} de ${stats.meta}`, iconePaths: ICONES.alvo, extra: dias }),
      // Sequência de semanas seguidas
      SL.statTile({ rotulo: "Sequência", valor: `${stats.sequencia} semana${stats.sequencia === 1 ? "" : "s"}`, detalhe: "treinando sem parar", iconePaths: ICONES.fogo }),
      // Total de treinos feitos (em verde)
      SL.statTile({ rotulo: "Treinos realizados", valor: SL.num(stats.total), detalhe: "desde que você começou", iconePaths: ICONES.trofeu, cor: "emerald" }),
      // Tempo total treinado (em verde)
      SL.statTile({ rotulo: "Tempo treinado", valor: SL.duracaoTexto(stats.minutos), detalhe: "somando todos os treinos", iconePaths: ICONES.relogio, cor: "emerald" }),
    );

    /* Continue seu treino: o que está em andamento ou o próximo sugerido */
    // Treino que está em andamento (se tiver)
    const atual = SL.treinoAtual();
    // Treinos criados pela pessoa
    const meus = SL.treinosDoUsuario();
    // Acha o treino em andamento
    let treino = atual && SL.acharTreino(atual.treinoId);
    // Quantos exercícios já foram feitos
    let feitos = 0;
    // Quantos exercícios o treino tem
    let total = 0;
    // Se tem treino em andamento...
    if (treino) {
      // ...conta os exercícios dele
      total = SL.exerciciosDe(treino).length;
      // ...e quantos já foram feitos
      feitos = atual.feitos || 0;
    // Se não tem...
    } else {
      // Sugere o treino feito há mais tempo
      // ...pega os treinos da pessoa
      treino = meus
        // ...faz uma cópia da lista
        .slice()
        // ...ordena pelo feito há mais tempo e pega o primeiro
        .sort((a, b) => String(SL.ultimaVez(a.id) || "").localeCompare(String(SL.ultimaVez(b.id) || "")))[0];
      // Se achou um treino, conta os exercícios dele
      if (treino) total = SL.exerciciosDe(treino).length;
    }

    // Lugar da página do card "continue seu treino"
    const alvoContinue = document.querySelector('[data-render="continue"]');
    // Se não tem treino nenhum...
    if (!treino) {
      // ...mostra a mensagem de vazio
      alvoContinue.replaceChildren(
        // Bloco de estado vazio
        SL.estadoVazio(
          // Título
          "Nenhum treino ainda",
          // Texto
          "Crie seu primeiro treino ou escolha um pronto.",
          // Botão que leva para Descobrir
          el("a", { href: "../descobrir/descobrir.html", class: "btn-primary", text: "Descobrir treinos" }),
        ),
      );
    // Se tem treino...
    } else {
      // ...troca o título conforme está em andamento ou é sugestão
      document.querySelector('[data-render="titulo-continue"]').textContent = atual ? "Continue seu treino" : "Próximo treino sugerido";
      // Lista de exercícios do treino
      const exercicios = SL.exerciciosDe(treino);
      // Próximo exercício a fazer
      const proximo = exercicios[Math.min(feitos, exercicios.length - 1)];
      // Porcentagem do treino que já foi feita
      const pct = total ? Math.round((feitos / total) * 100) : 0;
      // Troca o conteúdo pelo card do treino
      alvoContinue.replaceChildren(
        // Card grande do treino
        el("article", { class: "workout-hero" }, [
          // Parte de cima do card
          el("div", { class: "workout-hero-top" }, [
            // Ícone de haltere
            el("span", { class: "icon-tile icon-tile-coral icon-tile-lg", "aria-hidden": "true" }, [icone(ICONES.haltere)]),
            // Bloco de texto
            el("div", { class: "workout-hero-info" }, [
              // Nome do treino
              el("h3", { text: treino.nome }),
              // Grupo muscular e quantidade de exercícios
              el("p", { class: "meta", text: `${treino.grupo} • ${total} exercícios` }),
            ]),
          ]),
          // Bloco do próximo exercício
          el("p", { class: "workout-hero-next" }, [
            // Mostra em qual exercício está, ou quando foi a última vez
            el("span", { text: atual ? `Exercício ${feitos + 1} de ${total}` : `Última vez: ${SL.dataRelativa(SL.ultimaVez(treino.id))}` }),
            // Nome do próximo exercício
            el("strong", { text: `${atual ? "Próximo" : "Começa com"}: ${proximo.nome}` }),
          ]),
          // Se está em andamento...
          atual
            // ...cria a barra de progresso
            ? el(
                // (é uma div)
                "div",
                {
                  // Classe da barrinha
                  class: "progress-bar-sm",
                  // Avisa leitores de tela que é uma barra de progresso
                  role: "progressbar",
                  // Nome da barra para leitores de tela
                  "aria-label": "Progresso do treino",
                  // Valor atual
                  "aria-valuenow": pct,
                  // Valor mínimo
                  "aria-valuemin": 0,
                  // Valor máximo
                  "aria-valuemax": 100,
                },
                // Parte pintada da barra, com a porcentagem
                [el("div", { class: "fill", "data-progress": pct })],
              )
            // Se não está em andamento, não mostra barra
            : null,
          // Botão de iniciar ou continuar o treino
          el("a", { href: SL.linkTreino(treino.id), class: "btn-primary btn-with-icon" }, [
            // Ícone de play
            icone(ICONES.play),
            // Texto do botão
            atual ? "Continuar treino" : "Iniciar treino",
          ]),
        ]),
      );
    }

    /* Recomendados: primeiro os do objetivo escolhido no questionário */
    // Objetivo escolhido no questionário
    const objetivo = SL.onboarding().objetivo;
    // Copia o catálogo
    CATALOGO.slice()
      // Ordena: primeiro os do objetivo, depois os de nota maior
      .sort((a, b) => (b.objetivo === objetivo) - (a.objetivo === objetivo) || b.nota - a.nota)
      // Pega só os 6 primeiros
      .slice(0, 6)
      // Coloca um card para cada um na área de recomendados
      .forEach((t) => document.querySelector('[data-render="recomendados"]').append(SL.cardTreinoCatalogo(t)));

    /* Profissionais em destaque */
    // Acha a área de profissionais em destaque...
    document
      .querySelector('[data-render="pros-destaque"]')
      // ...e coloca os 4 primeiros profissionais
      .replaceChildren(...PROFISSIONAIS.slice(0, 4).map(SL.cardProfissional));

    // Pinta todas as barras de progresso da página
    SL.aplicarProgresso();

    /* Card dos pontos: anel da semana, liga e posição entre os amigos */
    function renderPontos() {
      // Lugar do card
      const alvo = document.querySelector('[data-render="pontos"]');
      // Se o motor de pontos não carregou, esconde o card
      if (!SL.pontos) return (alvo.hidden = true);
      // Atalho para o motor
      const P = SL.pontos;
      // Situação da semana
      const s = P.situacaoDaLiga();
      // Posição entre os amigos
      const pos = P.minhaPosicao("amigos", "semana");
      // Troca o conteúdo do card
      alvo.replaceChildren(
        // Anel menor com os pontos
        P.anel(s.pts / P.SOBE, SL.num(s.pts), "pontos"),
        // Textos
        el("div", { class: "pontos-card-info" }, [
          // Linha com o escudo e a liga
          el("div", { class: "pontos-card-liga" }, [P.escudo(s.atual), el("strong", { class: `rk-liga-nome liga-${P.LIGAS[s.atual].id}`, text: `Liga ${P.LIGAS[s.atual].nome}` })]),
          // Posição entre os amigos
          el("p", { class: "pontos-card-pos", text: pos ? `Você está em ${pos.posicao}º de ${pos.total} entre os amigos` : "" }),
          // O que falta
          el("p", { class: "meta", text: s.faltaSubir ? `Faltam ${s.faltaSubir} pontos para ${s.noTopo ? "garantir o Diamante" : "subir de liga"} • zera em ${s.diasParaZerar} dia${s.diasParaZerar === 1 ? "" : "s"}` : "Subida garantida nesta semana!" }),
        ]),
        // Link para o ranking
        el("a", { href: "../ranking/ranking.html", class: "btn-secondary", text: "Ver ranking" }),
      );
    }
    // Desenha o card
    renderPontos();

    /* Card do momento: sugestão conforme o horário e passos de hoje (simulados) */
    function renderMomento() {
      // Lugar do card
      const alvo = document.querySelector('[data-render="momento"]');
      // Agora
      const agora = new Date();
      // Hora (com os minutos como fração)
      const hora = agora.getHours() + agora.getMinutes() / 60;
      // Já treinou hoje?
      const treinouHoje = SL.historico().some((h) => new Date(h.data).toDateString() === agora.toDateString());
      // Sugestão do horário: [ícone, título, texto, botão, link]
      const m =
        // Manhã
        hora >= 5 && hora < 10
          ? ["sol", "Bom dia! Começa com proteína", "Ovo, iogurte ou queijo no café ajudam a bater a meta de proteína.", "Registrar café", "../alimentacao/alimentacao.html"]
          : // Almoço
            hora >= 10 && hora < 14
            ? ["talheres", "Hora do almoço", "Metade do prato com salada e legumes. Registra e ganha 5 pontos.", "Registrar almoço", "../alimentacao/alimentacao.html"]
            : // Tarde
              hora >= 14 && hora < 18
              ? ["raio", "Tarde de energia", "Um lanche com carboidrato e um copo d'água antes do treino.", "Ver treinos", "../treinos/treinos.html"]
              : // Noite, já treinou
                hora >= 18 && hora < 22 && treinouHoje
                ? ["lua", "Treino feito hoje!", "Agora é recuperar: janta com proteína e uma boa noite de sono.", "Ver evolução", "../evolucao/evolucao.html"]
                : // Noite, ainda não treinou
                  hora >= 18 && hora < 22
                  ? ["fogo", "Ainda dá tempo de treinar", "20 minutos já valem pontos e mantêm sua sequência.", "Começar treino", "../treinos/treinos.html"]
                  : // Madrugada
                    ["cama", "Hora de descansar", "Sono também é treino: 7 a 9 horas ajudam o músculo a crescer.", "Ver resumo", "../evolucao/evolucao.html"];
      // Meta de passos
      const META = 8000;
      // Passos do dia inteiro (sorteado pelo dia, entre 5 e 12 mil)
      const doDia = 5000 + Math.round((SL.pontos ? SL.pontos.sorteio("passos" + agora.toDateString()) : 0.5) * 7000);
      // Parte do dia que já passou (das 6h às 22h)
      const parte = Math.max(0, Math.min(1, (hora - 6) / 16));
      // Passos até agora
      const passos = Math.round(doDia * parte);
      // Troca o conteúdo
      alvo.replaceChildren(
        // Ícone do momento
        el("span", { class: "momento-icone" }, [SL.icone(SL.ICONES[m[0]])]),
        // Textos e botão
        el("div", { class: "momento-info" }, [el("strong", { text: m[1] }), el("p", { text: m[2] }), el("a", { href: m[4], class: "btn-secondary", text: m[3] })]),
        // Passos de hoje
        el("div", { class: "momento-passos" }, [
          // Número
          el("strong", { class: "momento-passos-num", text: SL.num(passos) }),
          // Legenda
          el("span", { text: `passos hoje • meta ${SL.num(META)}` }),
          // Barra de progresso
          el("div", { class: "progress-bar-sm progress-emerald", role: "progressbar", "aria-label": "Passos de hoje", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.min(100, Math.round((passos / META) * 100)) }, [
            // Parte cheia
            el("div", { class: "fill", "data-progress": Math.min(100, Math.round((passos / META) * 100)) }),
          ]),
          // Aviso de simulação
          el("small", { class: "meta", text: "Simulado (sem pulseira conectada)" }),
        ]),
      );
      // Pinta a barra
      SL.aplicarProgresso();
    }
    // Desenha o card do momento
    renderMomento();
    // Desenha o Pulso com a frase do dia (se o personagem carregou)
    if (SL.personagem) document.querySelector('[data-render="pulso"]').replaceChildren(SL.personagem.card());
    // Atualiza quando os pontos mudam
    document.addEventListener("sl:pontos", renderPontos);
  });
