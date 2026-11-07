// Programas: planos de várias semanas (Premium) e treinos prontos para fazer em casa (grátis).
// Começar um programa cria os treinos dele em "Meus treinos" e guarda a data de início.
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos e ler/salvar dados
    const { el, storage } = SL;
    // Catálogo de treinos prontos
    const { CATALOGO } = window.SL_DADOS;
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Um dia e uma semana em milissegundos
    const DIA = 86400000;

    // Atalho que monta um exercício: [nome, séries, repetições, carga, descanso]
    const x = (nome, series, reps, carga = 0, descanso = 60) => ({ nome, series, reps, carga, descanso });

    // Programas disponíveis
    const PROGRAMAS = [
      // Força em 8 semanas
      {
        // Identificador
        id: "forca8",
        // Nome
        nome: "Força em 8 semanas",
        // Objetivo (usa o ícone do objetivo)
        objetivo: "Hipertrofia",
        // Nível
        nivel: "Intermediário",
        // Duração em semanas
        semanas: 8,
        // Resumo
        resumo: "Divisão A/B/C, 3 vezes por semana, com carga subindo aos poucos.",
        // Dica de cada fase (pela semana)
        dicas: ["Semanas 1 e 2: aprenda o movimento e anote as cargas.", "Semanas 3 a 5: suba 1 a 2 kg quando fizer todas as séries.", "Semana 6: semana mais leve, 20% menos carga, para recuperar.", "Semanas 7 e 8: tente bater recordes nos exercícios principais."],
        // Treinos do programa
        treinos: [
          // Treino A
          ["A: Peito e Tríceps", [x("Supino reto", 4, 8, 40, 90), x("Supino inclinado com halteres", 3, 10, 14), x("Crucifixo com halteres", 3, 12, 8), x("Tríceps na corda", 3, 12, 20), x("Tríceps testa", 3, 10, 15)]],
          // Treino B
          ["B: Costas e Bíceps", [x("Puxada frontal", 4, 10, 45, 90), x("Remada curvada", 4, 8, 40, 90), x("Remada unilateral", 3, 10, 18), x("Rosca direta", 3, 10, 20), x("Rosca martelo", 3, 12, 10)]],
          // Treino C
          ["C: Pernas e Ombros", [x("Agachamento livre", 4, 8, 50, 120), x("Leg press 45°", 3, 12, 120, 90), x("Stiff", 3, 10, 40), x("Desenvolvimento com halteres", 3, 10, 12), x("Elevação lateral", 3, 12, 6)]],
        ],
      },
      // Emagrecer em 6 semanas
      {
        // Identificador
        id: "emagrecer6",
        // Nome
        nome: "Emagrecer em 6 semanas",
        // Objetivo
        objetivo: "HIIT",
        // Nível
        nivel: "Iniciante",
        // Semanas
        semanas: 6,
        // Resumo
        resumo: "Circuitos curtos e intensos, 3 vezes por semana. Combine com a alimentação.",
        // Dicas
        dicas: ["Semanas 1 e 2: 40 s de exercício e 20 s de descanso.", "Semanas 3 e 4: tente fazer mais repetições no mesmo tempo.", "Semanas 5 e 6: some uma volta extra no circuito."],
        // Treinos
        treinos: [
          // Circuito 1
          ["Circuito 1: Corpo todo", [x("Polichinelo", 3, "40 s", 0, 20), x("Agachamento livre", 3, "40 s", 0, 20), x("Flexão inclinada", 3, "40 s", 0, 20), x("Escalador", 3, "40 s", 0, 20)]],
          // Circuito 2
          ["Circuito 2: Pernas", [x("Agachamento com salto", 3, "40 s", 0, 20), x("Afundo com halteres", 3, "40 s", 0, 20), x("Skipping", 3, "40 s", 0, 20), x("Ponte de glúteo", 3, "40 s", 0, 20)]],
          // Circuito 3
          ["Circuito 3: Core e cardio", [x("Burpee", 3, "30 s", 0, 30), x("Abdominal bicicleta", 3, "40 s", 0, 20), x("Corrida estacionária", 3, "40 s", 0, 20), x("Prancha", 3, "30 s", 0, 20)]],
        ],
      },
      // Começando do zero
      {
        // Identificador
        id: "zero4",
        // Nome
        nome: "Começando do zero",
        // Objetivo
        objetivo: "Resistência",
        // Nível
        nivel: "Iniciante",
        // Semanas
        semanas: 4,
        // Resumo
        resumo: "Corpo inteiro 3 vezes por semana, em casa ou na academia, para criar o hábito.",
        // Dicas
        dicas: ["Semana 1: foco em aprender. Pode parar no meio, tudo bem.", "Semana 2: tente não pular nenhum dia combinado.", "Semanas 3 e 4: some 2 repetições em cada série."],
        // Treinos
        treinos: [
          // Dia 1
          ["Dia 1: Corpo inteiro", [x("Agachamento livre", 3, 12, 0), x("Flexão inclinada", 3, 10, 0), x("Remada com elástico", 3, 12, 0), x("Prancha", 3, "20 s", 0, 30)]],
          // Dia 2
          ["Dia 2: Corpo inteiro", [x("Subida no banco", 3, 10, 0), x("Ponte de glúteo", 3, 15, 0), x("Elevação frontal", 3, 12, 2), x("Dead bug", 3, 10, 0, 30)]],
          // Dia 3
          ["Dia 3: Corpo inteiro", [x("Afundo com halteres", 3, 10, 0), x("Flexão de braço", 3, 8, 0), x("Superman", 3, 12, 0), x("Caminhada rápida", 1, "10 min", 0, 0)]],
        ],
      },
      // Mobilidade em 4 semanas
      {
        // Identificador
        id: "mobilidade4",
        // Nome
        nome: "Mobilidade em 4 semanas",
        // Objetivo
        objetivo: "Yoga & Mobilidade",
        // Nível
        nivel: "Iniciante",
        // Semanas
        semanas: 4,
        // Resumo
        resumo: "Três sessões curtas por semana para soltar quadril, costas e ombros.",
        // Dicas
        dicas: ["Semanas 1 e 2: respire fundo e não force até doer.", "Semanas 3 e 4: segure cada posição um pouco mais."],
        // Treinos
        treinos: [
          // Sessão 1
          ["Sessão 1: Quadril", [x("Rotação de quadril em pé", 2, "40 s", 0, 10), x("Postura do pombo", 2, "40 s", 0, 10), x("Alongamento 90/90", 2, "40 s", 0, 10)]],
          // Sessão 2
          ["Sessão 2: Costas", [x("Gato e vaca", 2, "40 s", 0, 10), x("Torção sentada", 2, "40 s", 0, 10), x("Postura da criança", 2, "60 s", 0, 10)]],
          // Sessão 3
          ["Sessão 3: Corpo todo", [x("Saudação ao sol", 3, "60 s", 0, 10), x("Cachorro olhando para baixo", 2, "40 s", 0, 10), x("Abertura de peito na parede", 2, "40 s", 0, 10)]],
        ],
      },
    ];

    // Programa em andamento: { id, inicio } (ou nada)
    const ativo = () => storage.get("sl-programa", null);

    // Semana atual do programa (1, 2, 3...)
    const semanaDe = (p) => Math.floor((Date.now() - new Date(p.inicio)) / (7 * DIA)) + 1;

    // Desenha o card do programa em andamento
    function renderAtivo() {
      // Programa salvo
      const salvo = ativo();
      // Dados do programa
      const prog = salvo && PROGRAMAS.find((p) => p.id === salvo.id);
      // Lugar do card
      const alvo = $("ativo");
      // Sem programa: esconde
      if (!prog) return (alvo.hidden = true);
      // Mostra
      alvo.hidden = false;
      // Semana atual (no máximo a última)
      const semana = Math.min(prog.semanas, semanaDe(salvo));
      // Começo da semana atual
      const inicioSemana = new Date(salvo.inicio).getTime() + (semana - 1) * 7 * DIA;
      // Sessões do programa feitas nesta semana
      const feitas = SL.historico().filter((h) => String(h.treinoId).startsWith(`p-${prog.id}-`) && new Date(h.data).getTime() >= inicioSemana).length;
      // Dica da fase (as dicas se espalham pelas semanas)
      const dica = prog.dicas[Math.min(prog.dicas.length - 1, Math.floor(((semana - 1) / prog.semanas) * prog.dicas.length))];
      // Porcentagem do programa
      const pct = Math.round(((semana - 1 + Math.min(1, feitas / prog.treinos.length)) / prog.semanas) * 100);
      // Troca o conteúdo do card
      alvo.replaceChildren(
        // Texto de cima
        el("p", { class: "page-kicker", text: `Semana ${semana} de ${prog.semanas}` }),
        // Nome
        el("h2", { text: prog.nome }),
        // Barra de progresso do programa
        el("div", { class: "progress-bar-sm", role: "progressbar", "aria-label": "Progresso do programa", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct }, [el("div", { class: "fill", "data-progress": pct })]),
        // Sessões da semana
        el("p", { class: "meta", text: `${Math.min(feitas, prog.treinos.length)} de ${prog.treinos.length} sessões feitas nesta semana` }),
        // Dica da fase
        el("p", { class: "prog-dica", text: dica }),
        // Botões
        el("div", { class: "card-actions" }, [
          // Ir para os treinos
          el("a", { href: "../treinos/treinos.html", class: "btn-primary", text: "Ver os treinos" }),
          // Parar o programa
          el("button", { type: "button", class: "btn-secondary", "data-action": "parar-programa", text: "Parar programa" }),
        ]),
      );
      // Pinta a barra
      SL.aplicarProgresso();
    }

    // Desenha a grade de programas
    function renderProgramas() {
      // Programa em andamento
      const salvo = ativo();
      // É Premium?
      const premium = SL.premium();
      // Um card por programa
      $("programas").replaceChildren(
        ...PROGRAMAS.map((p) =>
          // Card
          el("article", { class: "prog-card" }, [
            // Ícone do objetivo
            el("span", { class: "prog-icone" }, [SL.iconeCategoria(p.objetivo, "icon")]),
            // Etiquetas
            el("p", { class: "ex-tags" }, [el("span", { class: "tag", text: `${p.semanas} semanas` }), el("span", { class: "tag", text: `${p.treinos.length}x por semana` }), el("span", { class: "tag", text: p.nivel }), premium ? null : el("span", { class: "tag tag-premium", text: "Premium" })]),
            // Nome
            el("h3", { text: p.nome }),
            // Resumo
            el("p", { class: "meta", text: p.resumo }),
            // Treinos do programa
            el("ul", { class: "prog-treinos" }, p.treinos.map(([nome, itens]) => el("li", { text: `${nome} (${itens.length} exercícios)` }))),
            // Botão (em andamento, começar ou desbloquear)
            salvo && salvo.id === p.id
              ? el("button", { type: "button", class: "btn-secondary", disabled: true, text: "Em andamento" })
              : el("button", { type: "button", class: "btn-primary", "data-action": "comecar-programa", "data-id": p.id, text: premium ? "Começar programa" : "Desbloquear com Premium" }),
          ]),
        ),
      );
    }

    // Começar um programa
    SL.acao("comecar-programa", (alvo) => {
      // Programa escolhido
      const prog = PROGRAMAS.find((p) => p.id === alvo.dataset.id);
      // No Free: oferece o Premium
      if (!SL.premium())
        // Pergunta se quer ver os planos
        return SL.confirmar({
          // Título
          titulo: "Programas são Premium",
          // Texto
          texto: "Os programas de várias semanas fazem parte do Premium. Os treinos em casa continuam grátis.",
          // Botão
          rotulo: "Ver o Premium",
          // Leva aos planos
          fn: () => (window.location.href = "../planos/planos.html"),
        });
      // Treinos atuais da pessoa, sem os de outro programa
      const meus = SL.treinosDoUsuario().filter((t) => !String(t.id).startsWith("p-"));
      // Treinos do programa novo
      const novos = prog.treinos.map(([nome, itens], k) => ({ id: `p-${prog.id}-${k}`, nome, grupo: prog.nome, objetivo: prog.objetivo, exercicios: itens.length, itens, ultimo: "Nunca" }));
      // Salva os treinos (os do programa primeiro)
      storage.set("sl-treinos", novos.concat(meus));
      // Guarda o programa em andamento
      storage.set("sl-programa", { id: prog.id, inicio: new Date().toISOString() });
      // Avisa
      SL.toast(`${prog.nome} começou! Os treinos estão em Meus treinos.`);
      // Desenha tudo
      renderAtivo();
      // (grade)
      renderProgramas();
    });

    // Parar o programa
    SL.acao("parar-programa", () => {
      // Confirma
      SL.confirmar({
        // Título
        titulo: "Parar o programa?",
        // Texto
        texto: "Os treinos do programa saem de Meus treinos. O que você já fez continua no histórico.",
        // Botão
        rotulo: "Parar",
        // Se confirmar...
        fn: () => {
          // ...tira os treinos do programa
          storage.set("sl-treinos", SL.treinosDoUsuario().filter((t) => !String(t.id).startsWith("p-")));
          // ...apaga o programa
          storage.remove("sl-programa");
          // ...desenha
          renderAtivo();
          // (grade)
          renderProgramas();
        },
      });
    });

    // Treinos em casa (do catálogo)
    $("casa").replaceChildren(...CATALOGO.filter((t) => t.lugar === "casa").map(SL.cardTreinoCatalogo));
    // Programa em andamento
    renderAtivo();
    // Grade de programas
    SL.carregar($("programas"), renderProgramas);
  });
