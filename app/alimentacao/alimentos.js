/*
 * Comidas brasileiras com calorias e macros por porção (valores aproximados,
 * de tabelas de composição de alimentos) e cardápios de exemplo por objetivo.
 * Fica em window.SL_ALIMENTOS e window.SL_CARDAPIOS.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Atalho que monta um alimento: a(nome, porção, kcal, proteína, carboidrato, gordura)
  const a = (nome, porcao, kcal, proteina, carbo, gordura) => ({ nome, porcao, kcal, proteina, carbo, gordura });

  // Lista de alimentos
  window.SL_ALIMENTOS = [
    // Arroz branco
    a("Arroz branco", "4 colheres (100 g)", 128, 2.5, 28, 0.2),
    // Arroz integral
    a("Arroz integral", "4 colheres (100 g)", 124, 2.6, 26, 1),
    // Feijão carioca
    a("Feijão carioca", "1 concha (100 g)", 76, 4.8, 13.6, 0.5),
    // Feijão preto
    a("Feijão preto", "1 concha (100 g)", 77, 4.5, 14, 0.5),
    // Peito de frango grelhado
    a("Peito de frango grelhado", "1 filé (120 g)", 191, 38, 0, 3),
    // Carne moída
    a("Carne moída refogada", "4 colheres (100 g)", 212, 26, 0, 12),
    // Bife de patinho
    a("Bife de patinho", "1 bife (100 g)", 219, 36, 0, 7),
    // Tilápia
    a("Filé de tilápia grelhado", "1 filé (120 g)", 154, 31, 0, 3),
    // Ovo cozido
    a("Ovo cozido", "1 unidade", 73, 6.6, 0.6, 5),
    // Ovos mexidos
    a("Ovos mexidos", "2 ovos", 180, 12, 1.5, 14),
    // Omelete
    a("Omelete de legumes", "2 ovos", 200, 13, 4, 14),
    // Pão francês
    a("Pão francês", "1 unidade (50 g)", 150, 4, 29, 1.5),
    // Pão integral
    a("Pão integral", "2 fatias", 130, 6, 22, 2),
    // Tapioca
    a("Tapioca", "1 média (60 g de goma)", 205, 0, 50, 0),
    // Cuscuz
    a("Cuscuz nordestino", "1 pedaço (100 g)", 112, 2.2, 25, 0.7),
    // Pão de queijo
    a("Pão de queijo", "2 unidades (40 g)", 145, 2.5, 17, 7),
    // Queijo branco
    a("Queijo minas frescal", "1 fatia (30 g)", 79, 5, 1, 6),
    // Requeijão
    a("Requeijão light", "1 colher (30 g)", 54, 3, 1, 4),
    // Iogurte natural
    a("Iogurte natural", "1 pote (170 g)", 104, 7, 8, 5),
    // Leite
    a("Leite semidesnatado", "1 copo (200 ml)", 90, 6, 10, 3),
    // Whey
    a("Whey protein", "1 dose (30 g)", 120, 24, 3, 1.5),
    // Aveia
    a("Aveia em flocos", "2 colheres (30 g)", 118, 4.3, 20, 2.5),
    // Granola
    a("Granola", "3 colheres (40 g)", 176, 4, 28, 6),
    // Banana
    a("Banana prata", "1 unidade", 89, 1.3, 23, 0.3),
    // Maçã
    a("Maçã", "1 unidade", 72, 0.4, 19, 0.2),
    // Mamão
    a("Mamão papaia", "meia unidade", 68, 0.8, 17, 0.2),
    // Açaí
    a("Açaí na tigela (sem açúcar)", "1 tigela (200 g)", 210, 3, 26, 11),
    // Batata-doce
    a("Batata-doce cozida", "1 média (150 g)", 116, 1.4, 27, 0.2),
    // Mandioca
    a("Mandioca cozida", "1 pedaço (100 g)", 125, 0.6, 30, 0.3),
    // Macarrão
    a("Macarrão cozido", "1 prato raso (150 g)", 210, 7, 42, 1),
    // Salada
    a("Salada verde com tomate", "1 prato", 25, 1.5, 4, 0.3),
    // Brócolis
    a("Brócolis cozido", "1 xícara (90 g)", 31, 2.6, 6, 0.4),
    // Azeite
    a("Azeite de oliva", "1 colher de sopa", 108, 0, 0, 12),
    // Pasta de amendoim
    a("Pasta de amendoim", "1 colher de sopa (15 g)", 94, 4, 3, 8),
    // Castanha
    a("Castanha-do-pará", "2 unidades", 66, 1.4, 1.2, 6.7),
    // Café
    a("Café com leite", "1 xícara", 60, 3, 6, 2.5),
    // Suco de laranja
    a("Suco de laranja natural", "1 copo (200 ml)", 90, 1.4, 21, 0.4),
    // Farofa
    a("Farofa", "2 colheres (30 g)", 120, 0.6, 20, 4.5),
    // Feijoada
    a("Feijoada", "1 concha (200 g)", 346, 20, 22, 20),
    // Strogonoff de frango
    a("Strogonoff de frango", "1 concha (150 g)", 236, 20, 6, 15),
    // ---------- Mais comidas (lista ampliada, inclui opções sem carne, sem lactose e sem glúten) ----------
    // Proteína de soja refogada
    a("Proteína de soja refogada", "4 colheres (100 g)", 172, 23, 10, 4.5),
    // Tofu grelhado
    a("Tofu grelhado", "1 fatia grande (100 g)", 145, 15, 3, 8.7),
    // Tofu mexido
    a("Tofu mexido", "1 porção (120 g)", 160, 16, 4, 9),
    // Grão-de-bico cozido
    a("Grão-de-bico cozido", "4 colheres (100 g)", 164, 8.9, 27, 2.6),
    // Lentilha cozida
    a("Lentilha cozida", "1 concha (100 g)", 116, 9, 20, 0.4),
    // Bebida de aveia
    a("Bebida de aveia", "1 copo (200 ml)", 96, 1, 16, 3),
    // Iogurte vegetal
    a("Iogurte vegetal", "1 pote (170 g)", 110, 5, 14, 4),
    // Proteína vegetal em pó
    a("Proteína vegetal em pó", "1 dose (30 g)", 115, 22, 3, 2),
    // Pão sem glúten
    a("Pão sem glúten", "2 fatias", 150, 2.5, 28, 3),
    // Macarrão de arroz
    a("Macarrão de arroz", "1 prato raso (150 g)", 190, 3, 43, 0.5),
    // Pasta de castanha de caju
    a("Pasta de castanha de caju", "1 colher de sopa (15 g)", 90, 3, 4, 7.5),
    // Bife de fígado
    a("Bife de fígado", "1 bife (100 g)", 175, 27, 5, 5),
    // Coxa de frango assada
    a("Coxa de frango assada", "1 coxa (100 g)", 215, 26, 0, 12),
    // Linguiça de frango
    a("Linguiça de frango", "1 gomo (60 g)", 160, 10, 2, 12),
    // Peito de peru
    a("Peito de peru", "4 fatias (40 g)", 44, 8, 1, 1),
    // Atum em água
    a("Atum em água", "1 lata (120 g)", 130, 29, 0, 1),
    // Sardinha assada
    a("Sardinha assada", "2 unidades (100 g)", 165, 24, 0, 7.5),
    // Salmão grelhado
    a("Salmão grelhado", "1 filé (120 g)", 250, 26, 0, 16),
    // Camarão refogado
    a("Camarão refogado", "10 unidades (100 g)", 119, 23, 1, 2),
    // Ovo frito
    a("Ovo frito", "1 unidade", 90, 6, 0.5, 7),
    // Panqueca de banana e aveia
    a("Panqueca de banana e aveia", "2 unidades", 210, 9, 32, 5),
    // Crepioca
    a("Crepioca", "1 unidade", 190, 9, 22, 7),
    // Torrada integral
    a("Torrada integral", "4 unidades", 120, 4, 22, 2),
    // Biscoito de arroz
    a("Biscoito de arroz", "3 unidades", 80, 1.8, 17, 0.6),
    // Bolo de cenoura
    a("Bolo de cenoura", "1 fatia (60 g)", 210, 3, 32, 8),
    // Pizza de muçarela
    a("Pizza de muçarela", "1 fatia", 270, 11, 30, 11),
    // Lasanha à bolonhesa
    a("Lasanha à bolonhesa", "1 pedaço (200 g)", 330, 18, 30, 15),
    // Hambúrguer artesanal
    a("Hambúrguer artesanal", "1 sanduíche", 550, 28, 40, 30),
    // Coxinha
    a("Coxinha", "1 unidade (80 g)", 230, 8, 26, 10),
    // Pastel de queijo
    a("Pastel de queijo", "1 unidade", 280, 7, 25, 17),
    // Batata frita
    a("Batata frita", "1 porção pequena (100 g)", 310, 3.4, 41, 15),
    // Purê de batata
    a("Purê de batata", "3 colheres (100 g)", 105, 2, 15, 4),
    // Batata inglesa cozida
    a("Batata inglesa cozida", "1 média (150 g)", 115, 2.5, 26, 0.1),
    // Inhame cozido
    a("Inhame cozido", "1 pedaço (100 g)", 97, 2, 23, 0.1),
    // Abóbora cozida
    a("Abóbora cozida", "1 xícara (100 g)", 40, 1, 9, 0.1),
    // Quinoa cozida
    a("Quinoa cozida", "4 colheres (100 g)", 120, 4.4, 21, 1.9),
    // Milho cozido
    a("Milho cozido", "1 espiga", 120, 3.5, 26, 1.5),
    // Polenta cozida
    a("Polenta cozida", "1 pedaço (100 g)", 70, 1.6, 15, 0.2),
    // Baião de dois
    a("Baião de dois", "1 concha (150 g)", 250, 9, 32, 9),
    // Arroz carreteiro
    a("Arroz carreteiro", "1 concha (150 g)", 280, 14, 30, 11),
    // Tacacá
    a("Tacacá", "1 cuia (300 ml)", 160, 9, 25, 2),
    // Moqueca de peixe
    a("Moqueca de peixe", "1 concha (200 g)", 260, 24, 6, 15),
    // Escondidinho de carne seca
    a("Escondidinho de carne seca", "1 pedaço (200 g)", 340, 19, 32, 15),
    // Vatapá
    a("Vatapá", "3 colheres (100 g)", 225, 6, 15, 16),
    // Acarajé
    a("Acarajé", "1 unidade", 380, 9, 30, 25),
    // Cenoura crua
    a("Cenoura crua", "1 média", 30, 0.7, 7, 0.2),
    // Beterraba cozida
    a("Beterraba cozida", "1 média (100 g)", 44, 1.7, 10, 0.2),
    // Couve refogada
    a("Couve refogada", "1 xícara (100 g)", 90, 3, 7, 6),
    // Abobrinha refogada
    a("Abobrinha refogada", "1 xícara (100 g)", 35, 1.2, 5, 1.5),
    // Pepino
    a("Pepino", "1 médio", 24, 1, 5, 0.2),
    // Abacate
    a("Abacate", "meia unidade", 160, 2, 8.5, 14.7),
    // Morango
    a("Morango", "1 xícara (150 g)", 48, 1, 11, 0.5),
    // Melancia
    a("Melancia", "1 fatia (200 g)", 60, 1.2, 15, 0.3),
    // Laranja
    a("Laranja", "1 unidade", 62, 1.2, 15, 0.2),
    // Uva
    a("Uva", "1 cacho pequeno (100 g)", 69, 0.7, 18, 0.2),
    // Abacaxi
    a("Abacaxi", "2 fatias (150 g)", 75, 0.8, 20, 0.2),
    // Manga
    a("Manga", "1 média", 150, 2, 37, 0.6),
    // Pera
    a("Pera", "1 unidade", 101, 0.6, 27, 0.2),
    // Amendoim torrado
    a("Amendoim torrado", "1 punhado (30 g)", 170, 7, 5, 14),
    // Paçoca
    a("Paçoca", "1 unidade (20 g)", 107, 3, 10, 6.5),
    // Chocolate amargo 70%
    a("Chocolate amargo 70%", "2 quadradinhos (20 g)", 120, 1.6, 9, 8.5),
    // Barra de cereal
    a("Barra de cereal", "1 unidade", 90, 1, 18, 2),
    // Barra de proteína
    a("Barra de proteína", "1 unidade (45 g)", 170, 15, 16, 6),
    // Leite integral
    a("Leite integral", "1 copo (200 ml)", 120, 6, 9.5, 6.5),
    // Queijo muçarela
    a("Queijo muçarela", "2 fatias (30 g)", 90, 6, 1, 7),
    // Manteiga
    a("Manteiga", "1 colher de chá (10 g)", 72, 0, 0, 8),
    // Mel
    a("Mel", "1 colher de sopa", 64, 0, 17, 0),
    // Suco verde
    a("Suco verde", "1 copo (300 ml)", 80, 2, 18, 0.5),
    // Água de coco
    a("Água de coco", "1 copo (300 ml)", 60, 0, 15, 0),
    // Refrigerante
    a("Refrigerante", "1 lata (350 ml)", 150, 0, 38, 0),
  ];

  // Etiquetas de cada comida (para as restrições alimentares), pelo nome
  // carne, peixe, frutos-mar, ovo, lactose, gluten, amendoim, animal (qualquer coisa de origem animal)
  const REGRAS = {
    // Carnes
    carne: /frango|carne|patinho|bife|feijoada|strogonoff|linguiça|peito de peru|fígado|hambúrguer|lasanha|escondidinho|carreteiro|coxinha|baião/i,
    // Peixes
    peixe: /tilápia|atum|sardinha|salmão|peixe|moqueca|tacacá|vatapá|acarajé/i,
    // Frutos do mar
    "frutos-mar": /camarão|tacacá|vatapá|acarajé/i,
    // Ovo
    ovo: /ovo|omelete|panqueca|crepioca|bolo/i,
    // Leite e derivados
    lactose: /leite(?! de coco)|queijo|iogurte(?! vegetal)|requeijão|whey|manteiga|strogonoff|lasanha|pizza|purê|escondidinho|pastel de queijo|bolo|chocolate|café com leite/i,
    // Glúten
    gluten: /pão(?! sem glúten| de queijo)|macarrão(?! de arroz)|aveia|granola|torrada|bolo|pizza|lasanha|hambúrguer|coxinha|pastel|barra de cereal|panqueca/i,
    // Amendoim
    amendoim: /amendoim|paçoca/i,
  };
  // Coloca as etiquetas em cada comida
  window.SL_ALIMENTOS.forEach((x) => {
    // Etiquetas que batem com o nome
    x.tags = Object.keys(REGRAS).filter((t) => REGRAS[t].test(x.nome));
    // Origem animal: carne, peixe, ovo, leite ou mel
    if (x.tags.some((t) => ["carne", "peixe", "ovo", "lactose"].includes(t)) || /mel$/i.test(x.nome)) x.tags.push("animal");
  });

  // Restrições que a pessoa pode marcar: [id, nome, etiquetas que ela não come]
  window.SL_RESTRICOES = [
    // Vegetariano: sem carne e sem peixe
    ["vegetariano", "Vegetariano", ["carne", "peixe", "frutos-mar"]],
    // Vegano: nada de origem animal
    ["vegano", "Vegano", ["animal"]],
    // Sem lactose
    ["sem-lactose", "Sem lactose", ["lactose"]],
    // Sem glúten
    ["sem-gluten", "Sem glúten", ["gluten"]],
    // Alergia a amendoim
    ["alergia-amendoim", "Alergia a amendoim", ["amendoim"]],
    // Alergia a frutos do mar
    ["alergia-frutos-mar", "Alergia a frutos do mar", ["frutos-mar"]],
    // Alergia a ovo
    ["alergia-ovo", "Alergia a ovo", ["ovo"]],
  ];

  // Trocas para o cardápio quando a comida não serve: comida -> opções (usa a primeira que servir)
  window.SL_TROCAS = {
    // Frango
    "Peito de frango grelhado": ["Filé de tilápia grelhado", "Tofu grelhado", "Grão-de-bico cozido"],
    // Patinho
    "Bife de patinho": ["Filé de tilápia grelhado", "Proteína de soja refogada", "Lentilha cozida"],
    // Carne moída
    "Carne moída refogada": ["Atum em água", "Proteína de soja refogada", "Lentilha cozida"],
    // Tilápia
    "Filé de tilápia grelhado": ["Peito de frango grelhado", "Tofu grelhado", "Grão-de-bico cozido"],
    // Ovos
    "Ovos mexidos": ["Tofu mexido"],
    // Ovo cozido
    "Ovo cozido": ["Tofu mexido", "Grão-de-bico cozido"],
    // Omelete
    "Omelete de legumes": ["Tofu mexido"],
    // Iogurte
    "Iogurte natural": ["Iogurte vegetal"],
    // Leite
    "Café com leite": ["Bebida de aveia"],
    // Whey
    "Whey protein": ["Proteína vegetal em pó"],
    // Queijo
    "Queijo minas frescal": ["Tofu grelhado", "Abacate"],
    // Pão integral
    "Pão integral": ["Pão sem glúten", "Tapioca"],
    // Pão francês
    "Pão francês": ["Pão sem glúten", "Tapioca"],
    // Macarrão
    "Macarrão cozido": ["Macarrão de arroz", "Batata-doce cozida"],
    // Aveia
    "Aveia em flocos": ["Quinoa cozida", "Banana prata"],
    // Granola
    "Granola": ["Castanha-do-pará"],
    // Pasta de amendoim
    "Pasta de amendoim": ["Pasta de castanha de caju"],
    // Açaí (ok para quase todos)
    "Açaí na tigela (sem açúcar)": ["Banana prata"],
  };

  // Cardápios de exemplo para um dia, por objetivo (os nomes batem com a lista acima)
  // Cada refeição: [nome da refeição, hora, [[alimento, porções], ...]]
  window.SL_CARDAPIOS = {
    // Ganhar massa: mais calorias e proteína
    Hipertrofia: [
      // Café da manhã
      ["Café da manhã", "07:30", [["Ovos mexidos", 1], ["Pão integral", 1], ["Banana prata", 1]]],
      // Almoço
      ["Almoço", "12:30", [["Arroz branco", 2], ["Feijão carioca", 1], ["Peito de frango grelhado", 1.5], ["Salada verde com tomate", 1]]],
      // Lanche
      ["Lanche pré-treino", "16:00", [["Iogurte natural", 1], ["Aveia em flocos", 1], ["Whey protein", 1]]],
      // Jantar
      ["Jantar", "20:00", [["Batata-doce cozida", 1.5], ["Bife de patinho", 1.5], ["Brócolis cozido", 1]]],
    ],
    // Emagrecer: menos calorias, bastante proteína e salada
    HIIT: [
      // Café da manhã
      ["Café da manhã", "07:30", [["Ovo cozido", 2], ["Mamão papaia", 1], ["Café com leite", 1]]],
      // Almoço
      ["Almoço", "12:30", [["Arroz integral", 1], ["Feijão preto", 1], ["Filé de tilápia grelhado", 1], ["Salada verde com tomate", 2]]],
      // Lanche
      ["Lanche da tarde", "16:00", [["Iogurte natural", 1], ["Maçã", 1]]],
      // Jantar
      ["Jantar", "19:30", [["Omelete de legumes", 1], ["Salada verde com tomate", 1]]],
    ],
    // Condicionamento: equilíbrio com carboidrato para o fôlego
    "Resistência": [
      // Café da manhã
      ["Café da manhã", "07:00", [["Tapioca", 1], ["Queijo minas frescal", 1], ["Banana prata", 1]]],
      // Almoço
      ["Almoço", "12:30", [["Macarrão cozido", 1], ["Carne moída refogada", 1], ["Salada verde com tomate", 1]]],
      // Lanche
      ["Lanche pré-treino", "16:30", [["Pão francês", 1], ["Pasta de amendoim", 1], ["Suco de laranja natural", 1]]],
      // Jantar
      ["Jantar", "20:00", [["Arroz branco", 1], ["Feijão carioca", 1], ["Peito de frango grelhado", 1]]],
    ],
    // Bem-estar: leve e variado
    "Yoga & Mobilidade": [
      // Café da manhã
      ["Café da manhã", "08:00", [["Açaí na tigela (sem açúcar)", 1], ["Granola", 0.5]]],
      // Almoço
      ["Almoço", "12:30", [["Arroz integral", 1], ["Feijão preto", 1], ["Omelete de legumes", 1], ["Salada verde com tomate", 1]]],
      // Lanche
      ["Lanche da tarde", "16:00", [["Maçã", 1], ["Castanha-do-pará", 1]]],
      // Jantar
      ["Jantar", "19:30", [["Cuscuz nordestino", 1], ["Ovo cozido", 2], ["Brócolis cozido", 1]]],
    ],
  };

  // Receitas simples, com passo a passo e macros por porção
  // tags = etiquetas de restrição (vazio = serve para veganos, sem lactose e sem glúten)
  window.SL_RECEITAS = [
    // Panqueca de banana fit
    { nome: "Panqueca de banana fit", tempo: "10 min", porcoes: 1, kcal: 250, proteina: 12, carbo: 36, gordura: 6, tags: ["ovo", "gluten", "animal"], ingredientes: ["1 banana madura", "2 ovos", "2 colheres de aveia", "Canela a gosto"], passos: ["Amasse a banana com um garfo.", "Misture os ovos, a aveia e a canela.", "Coloque metade numa frigideira antiaderente untada, em fogo baixo.", "Vire quando firmar embaixo (uns 2 minutos) e doure o outro lado."] },
    // Frango desfiado na pressão
    { nome: "Frango desfiado na pressão", tempo: "30 min", porcoes: 4, kcal: 190, proteina: 34, carbo: 3, gordura: 4, tags: ["carne", "animal"], ingredientes: ["500 g de peito de frango", "1 cebola picada", "2 dentes de alho", "1 tomate picado", "Sal, colorau e cheiro-verde"], passos: ["Cozinhe o frango na pressão com água e sal por 15 minutos.", "Desfie com dois garfos.", "Refogue cebola e alho, junte o tomate e o frango.", "Tempere com colorau e cheiro-verde. Rende 4 marmitas."] },
    // Omelete de forno com legumes
    { nome: "Omelete de forno com legumes", tempo: "25 min", porcoes: 2, kcal: 210, proteina: 15, carbo: 6, gordura: 14, tags: ["ovo", "lactose", "animal"], ingredientes: ["4 ovos", "1/2 abobrinha ralada", "1 cenoura ralada", "2 colheres de queijo ralado", "Sal e orégano"], passos: ["Bata os ovos com sal e orégano.", "Misture os legumes e o queijo.", "Coloque numa forma untada.", "Asse a 200 °C por 20 minutos."] },
    // Salada de grão-de-bico
    { nome: "Salada de grão-de-bico", tempo: "10 min", porcoes: 2, kcal: 280, proteina: 12, carbo: 36, gordura: 10, tags: [], ingredientes: ["1 xícara de grão-de-bico cozido", "1 tomate", "1/2 pepino", "Cebola roxa", "Azeite, limão e sal"], passos: ["Pique tomate, pepino e cebola.", "Junte o grão-de-bico.", "Tempere com azeite, limão e sal.", "Fica ainda melhor gelada."] },
    // Strogonoff de frango fit
    { nome: "Strogonoff de frango fit", tempo: "25 min", porcoes: 3, kcal: 260, proteina: 30, carbo: 8, gordura: 12, tags: ["carne", "lactose", "animal"], ingredientes: ["400 g de frango em cubos", "1 cebola", "1 colher de extrato de tomate", "170 g de iogurte natural", "Champignon (opcional)"], passos: ["Doure o frango com cebola.", "Junte o extrato de tomate e o champignon.", "Desligue o fogo e misture o iogurte (no lugar do creme de leite).", "Sirva com arroz e salada."] },
    // Crepioca recheada
    { nome: "Crepioca recheada", tempo: "10 min", porcoes: 1, kcal: 280, proteina: 15, carbo: 23, gordura: 13, tags: ["ovo", "lactose", "animal"], ingredientes: ["1 ovo", "2 colheres de goma de tapioca", "Queijo branco e tomate para o recheio"], passos: ["Misture o ovo e a goma de tapioca.", "Despeje na frigideira quente, como uma panqueca.", "Vire, coloque o recheio e dobre."] },
    // Tofu mexido com cúrcuma
    { nome: "Tofu mexido com cúrcuma", tempo: "10 min", porcoes: 2, kcal: 170, proteina: 16, carbo: 5, gordura: 10, tags: [], ingredientes: ["200 g de tofu firme", "1/2 cebola", "1 colher de chá de cúrcuma", "Sal e cheiro-verde"], passos: ["Amasse o tofu com um garfo.", "Refogue a cebola.", "Junte o tofu e a cúrcuma (dá a cor de ovo mexido).", "Acerte o sal e finalize com cheiro-verde."] },
    // Vitamina proteica de morango
    { nome: "Vitamina proteica de morango", tempo: "5 min", porcoes: 1, kcal: 290, proteina: 26, carbo: 34, gordura: 5, tags: ["lactose", "animal"], ingredientes: ["1 copo de leite semidesnatado", "1 xícara de morangos", "1 dose de whey de baunilha", "Gelo"], passos: ["Bata tudo no liquidificador.", "Beba logo depois do treino."] },
    // Bowl de lentilha e legumes
    { nome: "Bowl de lentilha e legumes", tempo: "30 min", porcoes: 2, kcal: 320, proteina: 17, carbo: 48, gordura: 7, tags: [], ingredientes: ["1 xícara de lentilha", "1 cenoura", "1 abobrinha", "1 xícara de arroz integral cozido", "Azeite e temperos"], passos: ["Cozinhe a lentilha por 20 minutos (sem deixar desmanchar).", "Asse ou refogue os legumes.", "Monte o bowl com arroz, lentilha e legumes.", "Regue com azeite."] },
    // Peixe assado no papelote
    { nome: "Peixe assado no papelote", tempo: "25 min", porcoes: 2, kcal: 230, proteina: 30, carbo: 8, gordura: 9, tags: ["peixe", "animal"], ingredientes: ["2 filés de tilápia", "1 tomate", "1/2 cebola", "Limão, sal e azeite"], passos: ["Tempere o peixe com limão e sal.", "Coloque sobre papel-alumínio com tomate e cebola por cima.", "Feche bem o papelote.", "Asse a 200 °C por 20 minutos."] },
  ];
})();
