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
  ];

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
})();
