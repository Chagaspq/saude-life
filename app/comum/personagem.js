/*
 * Pulso: o personagem do Saúde Life, um bonequinho atleta desenhado em SVG.
 * Ele evolui com a liga (munhequeira, medalha, aura de diamante), ganha
 * estrelinhas com os selos e muda de humor: comemorando (treinou hoje),
 * feliz (normal) ou cansado (3+ dias sem treinar).
 * Fica disponível em SL.personagem.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";
  // Se o núcleo do app não carregou, para aqui
  if (!window.SL) return;

  // Pega do núcleo o criador de desenhos SVG e o de elementos
  const { svg, el } = SL;

  // Frases do dia, no tom de parceiro de treino (uma por dia, em rodízio)
  const FRASES = [
    // Frase 1
    "Bora? Um treino de 20 minutos já conta muito.",
    // Frase 2
    "Constância ganha de intensidade. Aparece hoje que amanhã fica mais fácil.",
    // Frase 3
    "Bebeu água hoje? Seu corpo agradece (e o ranking também).",
    // Frase 4
    "Hoje é dia de bater recorde. Ou pelo menos de tentar!",
    // Frase 5
    "Não precisa ser perfeito, precisa ser feito.",
    // Frase 6
    "Alongar também é treino. Seu quadril manda um oi.",
    // Frase 7
    "A Ana tá treinando… vai deixar ela passar no ranking?",
    // Frase 8
    "Cada série vale 10 pontos. Faz as contas!",
    // Frase 9
    "Descansar faz parte. Mas só até amanhã, combinado?",
    // Frase 10
    "Proteína em dia, músculo feliz.",
    // Frase 11
    "Treino ruim é o que não aconteceu.",
    // Frase 12
    "Chama um amigo pra treinar junto. Rende mais!",
    // Frase 13
    "Sua versão de semana passada é o único rival que importa.",
    // Frase 14
    "Liga Diamante não cai do céu. Bora somar pontos!",
  ];

  // Quantos dias faz desde o último treino (0 = treinou hoje)
  function diasSemTreinar() {
    // Treino mais recente do histórico
    const ultimo = SL.historico()[0];
    // Sem treino nenhum: muito tempo
    if (!ultimo) return 99;
    // Dias entre o último treino e hoje
    return SL.diasEntre(ultimo.data, new Date());
  }

  // Humor do Pulso conforme os treinos
  function humor() {
    // Dias sem treinar
    const dias = diasSemTreinar();
    // Treinou hoje: comemorando
    if (dias === 0) return "comemorando";
    // 3 dias ou mais parado: cansado
    if (dias >= 3) return "cansado";
    // Normal: feliz
    return "feliz";
  }

  // Frase do Pulso para hoje (primeiro a do humor, depois a do dia)
  function frase() {
    // Humor atual
    const h = humor();
    // Treinou hoje
    if (h === "comemorando") return "Treino feito hoje! Tô orgulhoso de você. 🔥";
    // Parado
    if (h === "cansado") return `Faz ${diasSemTreinar()} dias que a gente não treina… bora voltar devagarinho?`;
    // Número do dia no ano (para trocar a frase todo dia)
    const hoje = new Date();
    // Dia do ano
    const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000);
    // Frase do dia
    return FRASES[diaDoAno % FRASES.length];
  }

  // Atalho: cria uma forma do desenho com classe e atributos
  const forma = (tag, attrs) => svg(tag, attrs);

  // Desenha o Pulso. opcoes: { liga, selos, humor, tamanho }
  function desenhar(opcoes = {}) {
    // Liga (0 = Bronze ... 3 = Diamante); padrão: a liga da pessoa
    const liga = opcoes.liga != null ? opcoes.liga : SL.pontos ? SL.pontos.liga().atual : 0;
    // Quantos selos (estrelinhas, no máximo 5); padrão: os selos da pessoa
    const selos = Math.min(5, opcoes.selos != null ? opcoes.selos : SL.pontos ? SL.pontos.selos().filter((s) => s.feito).length : 0);
    // Humor; padrão: o humor de agora
    const h = opcoes.humor || humor();
    // Desenho de 120 x 150
    const s = svg("svg", { viewBox: "0 0 120 150", class: `pulso pulso-${h} pulso-liga-${liga}`, role: "img", "aria-label": `Pulso, seu parceiro de treino, ${h === "comemorando" ? "comemorando" : h === "cansado" ? "cansado" : "feliz"}` });

    // Aura girando (só no Diamante)
    if (liga >= 3) s.append(forma("circle", { cx: 60, cy: 78, r: 54, class: "pulso-aura" }));
    // Estrelinhas dos selos em volta
    [[18, 40], [102, 44], [12, 92], [108, 96], [60, 6]].slice(0, selos).forEach(([x, y], i) => {
      // Estrela de 4 pontas
      s.append(forma("path", { d: `M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6}Z`, class: "pulso-estrela", style: `animation-delay:${i * 0.4}s` }));
    });
    // Sombra no chão
    s.append(forma("ellipse", { cx: 60, cy: 143, rx: 24, ry: 4.5, class: "pulso-sombra" }));

    // Grupo do corpo (é ele que pula e respira)
    const corpo = forma("g", { class: "pulso-corpo" });
    // Perna esquerda
    corpo.append(forma("rect", { x: 47, y: 98, width: 10, height: 34, rx: 5, class: "pulso-pele" }));
    // Perna direita
    corpo.append(forma("rect", { x: 63, y: 98, width: 10, height: 34, rx: 5, class: "pulso-pele" }));
    // Tênis esquerdo
    corpo.append(forma("path", { d: "M42 134 q0 -6 8 -6 h6 q3 0 3 4 v4 h-17z", class: "pulso-tenis" }));
    // Tênis direito
    corpo.append(forma("path", { d: "M61 136 v-4 q0 -4 3 -4 h6 q8 0 8 6 v2z", class: "pulso-tenis" }));
    // Bermuda
    corpo.append(forma("path", { d: "M42 88 h36 l3 18 h-17 l-4 -7 -4 7 h-17z", class: "pulso-bermuda" }));
    // Regata (tronco)
    corpo.append(forma("rect", { x: 41, y: 55, width: 38, height: 38, rx: 12, class: "pulso-regata" }));

    // Braços conforme o humor
    const bracos = {
      // Comemorando: braços para cima
      comemorando: [["M44 61 L33 38", 33, 37], ["M76 61 L87 38", 87, 37]],
      // Cansado: braços caídos
      cansado: [["M44 62 L39 88", 39, 89], ["M76 62 L81 88", 81, 89]],
      // Feliz: mostrando o muque
      feliz: [["M44 62 Q30 72 31 53", 31, 52], ["M76 62 Q90 72 89 53", 89, 52]],
    }[h];
    // Para cada braço...
    bracos.forEach(([d, mx, my]) => {
      // ...o braço (traço grosso cor de pele)
      corpo.append(forma("path", { d, class: "pulso-braco" }));
      // ...a mão
      corpo.append(forma("circle", { cx: mx, cy: my, r: 5.5, class: "pulso-pele" }));
      // ...munhequeira (a partir da Prata)
      if (liga >= 1) corpo.append(forma("circle", { cx: mx, cy: my, r: 7, class: "pulso-munhequeira" }));
    });

    // Logo no peito (anel com batimento) ou medalha (a partir do Ouro)
    if (liga >= 2) {
      // Fita da medalha
      corpo.append(forma("path", { d: "M53 56 L60 70 L67 56", class: "pulso-fita" }));
      // Medalha
      corpo.append(forma("circle", { cx: 60, cy: 74, r: 6, class: "pulso-medalha" }));
    } else {
      // Anel da logo
      corpo.append(forma("circle", { cx: 60, cy: 73, r: 7, class: "pulso-logo" }));
      // Batimento da logo
      corpo.append(forma("path", { d: "M54.5 73.5 h2.5 l1.5 -3 2 5 1.5 -2 h2.5", class: "pulso-logo" }));
    }

    // Pescoço
    corpo.append(forma("rect", { x: 55, y: 47, width: 10, height: 10, rx: 3, class: "pulso-pele" }));
    // Cabeça
    corpo.append(forma("circle", { cx: 60, cy: 35, r: 17, class: "pulso-pele" }));
    // Cabelo
    corpo.append(forma("path", { d: "M43 33 Q43 16 60 16 Q77 16 77 33 Q71 25 60 25.5 Q49 25 43 33Z", class: "pulso-cabelo" }));
    // Faixa na testa (coral, a marca registrada dele)
    corpo.append(forma("rect", { x: 43.5, y: 25, width: 33, height: 5, rx: 2.5, class: "pulso-faixa" }));
    // Bochecha esquerda
    corpo.append(forma("circle", { cx: 51, cy: 41, r: 3, class: "pulso-bochecha" }));
    // Bochecha direita
    corpo.append(forma("circle", { cx: 69, cy: 41, r: 3, class: "pulso-bochecha" }));

    // Rosto conforme o humor
    if (h === "comemorando") {
      // Olhos fechados de alegria (^ ^)
      corpo.append(forma("path", { d: "M51 36 q3 -3 6 0 M63 36 q3 -3 6 0", class: "pulso-traco" }));
      // Boca aberta
      corpo.append(forma("path", { d: "M54 42 q6 8 12 0z", class: "pulso-boca" }));
    } else if (h === "cansado") {
      // Olhos meio fechados
      corpo.append(forma("path", { d: "M51 36 h5 M64 36 h5", class: "pulso-traco" }));
      // Boca reta
      corpo.append(forma("path", { d: "M56 44 h8", class: "pulso-traco" }));
      // Gota de suor
      corpo.append(forma("path", { d: "M79 26 q4 6 0 8 q-4 -2 0 -8z", class: "pulso-suor" }));
    } else {
      // Olho esquerdo
      corpo.append(forma("circle", { cx: 54, cy: 35.5, r: 2, class: "pulso-olho" }));
      // Olho direito
      corpo.append(forma("circle", { cx: 66, cy: 35.5, r: 2, class: "pulso-olho" }));
      // Sorriso
      corpo.append(forma("path", { d: "M54 42 q6 5 12 0", class: "pulso-traco" }));
    }

    // Diamante em cima da cabeça (só no Diamante)
    if (liga >= 3) corpo.append(forma("path", { d: "M54 4 h12 l3 4 -9 9 -9 -9z", class: "pulso-diamante" }));

    // Coloca o corpo no desenho
    s.append(corpo);
    // Devolve
    return s;
  }

  // Pulso fazendo um exercício (animação em loop). mov: agachar, empurrar, puxar, core, cardio, alongar
  function exercicio(mov = "agachar") {
    // Braços para cima (segurando peso) nos exercícios de empurrar e puxar
    const cima = mov === "empurrar" || mov === "puxar";
    // Desenho
    const s = svg("svg", { viewBox: "0 0 120 150", class: `pulso pulso-mov pm-${mov}`, role: "img", "aria-label": `Pulso mostrando o movimento (${mov})` });
    // Sombra no chão
    s.append(forma("ellipse", { cx: 60, cy: 143, rx: 24, ry: 4.5, class: "pulso-sombra" }));
    // Grupo do corpo inteiro (para pular e balançar)
    const corpo = forma("g", { class: "pm-corpo" });
    // Grupo das pernas (encolhem no agachamento, abrem no polichinelo)
    const pernas = forma("g", { class: "pm-pernas" });
    // Perna esquerda (com o tênis)
    const pe = forma("g", { class: "pm-perna pm-perna-esq" });
    // Perna
    pe.append(forma("rect", { x: 47, y: 98, width: 10, height: 34, rx: 5, class: "pulso-pele" }));
    // Tênis
    pe.append(forma("path", { d: "M42 134 q0 -6 8 -6 h6 q3 0 3 4 v4 h-17z", class: "pulso-tenis" }));
    // Perna direita (com o tênis)
    const pd = forma("g", { class: "pm-perna pm-perna-dir" });
    // Perna
    pd.append(forma("rect", { x: 63, y: 98, width: 10, height: 34, rx: 5, class: "pulso-pele" }));
    // Tênis
    pd.append(forma("path", { d: "M61 136 v-4 q0 -4 3 -4 h6 q8 0 8 6 v2z", class: "pulso-tenis" }));
    // Junta as pernas
    pernas.append(pe, pd);
    // Grupo de cima (tronco, braços e cabeça), que desce no agachamento
    const tronco = forma("g", { class: "pm-cima" });
    // Bermuda
    tronco.append(forma("path", { d: "M42 88 h36 l3 18 h-17 l-4 -7 -4 7 h-17z", class: "pulso-bermuda" }));
    // Regata
    tronco.append(forma("rect", { x: 41, y: 55, width: 38, height: 38, rx: 12, class: "pulso-regata" }));
    // Logo no peito
    tronco.append(forma("circle", { cx: 60, cy: 73, r: 7, class: "pulso-logo" }));
    // Os dois braços, cada um num grupo que gira/estica a partir do ombro
    [["esq", 44], ["dir", 76]].forEach(([lado, x]) => {
      // Grupo do braço, com o ombro como ponto de apoio
      const braco = forma("g", { class: `pm-braco pm-braco-${lado}`, style: `transform-origin:${x}px 60px` });
      // Braço: para cima ou para baixo
      braco.append(forma("path", { d: cima ? `M${x} 60 V36` : `M${x} 60 V84`, class: "pulso-braco" }));
      // Mão
      braco.append(forma("circle", { cx: x, cy: cima ? 35 : 85, r: 5.5, class: "pulso-pele" }));
      // Haltere na mão (só empurrar e puxar)
      if (cima) braco.append(forma("rect", { x: x - 9, y: 31, width: 18, height: 8, rx: 3, class: "pm-haltere" }));
      // Coloca o braço no tronco
      tronco.append(braco);
    });
    // Pescoço
    tronco.append(forma("rect", { x: 55, y: 47, width: 10, height: 10, rx: 3, class: "pulso-pele" }));
    // Cabeça
    tronco.append(forma("circle", { cx: 60, cy: 35, r: 17, class: "pulso-pele" }));
    // Cabelo
    tronco.append(forma("path", { d: "M43 33 Q43 16 60 16 Q77 16 77 33 Q71 25 60 25.5 Q49 25 43 33Z", class: "pulso-cabelo" }));
    // Faixa
    tronco.append(forma("rect", { x: 43.5, y: 25, width: 33, height: 5, rx: 2.5, class: "pulso-faixa" }));
    // Olhos concentrados
    tronco.append(forma("path", { d: "M51 36 h5 M64 36 h5", class: "pulso-traco" }));
    // Boca de esforço
    tronco.append(forma("circle", { cx: 60, cy: 44, r: 2.2, class: "pulso-boca" }));
    // Junta tudo
    corpo.append(pernas, tronco);
    // Coloca no desenho
    s.append(corpo);
    // Devolve
    return s;
  }

  // Card do Pulso: desenho + balão com a frase
  function card(texto) {
    // Caixa
    return el("div", { class: "pulso-card" }, [
      // Desenho
      desenhar(),
      // Balão de fala
      el("div", { class: "pulso-balao" }, [
        // Nome
        el("strong", { text: "Pulso" }),
        // Frase
        el("p", { text: texto || frase() }),
      ]),
    ]);
  }

  // Deixa disponível em SL.personagem
  SL.personagem = { desenhar, exercicio, card, humor, frase, diasSemTreinar };
})();
