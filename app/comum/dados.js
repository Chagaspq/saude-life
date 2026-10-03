/*
 * Dados de exemplo do app (sem backend).
 * Ficam em window.SL_DADOS para todas as páginas usarem.
 */
(function () {
  "use strict";

  const CATALOGO = [
    { id: "fullbody-explosivo", nome: "Fullbody Explosivo", objetivo: "Hipertrofia", nivel: "Intermediário", duracao: 30, grupo: "Corpo inteiro", nota: 4.9 },
    { id: "hiit-15", nome: "HIIT 15 Minutos", objetivo: "HIIT", nivel: "Iniciante", duracao: 15, grupo: "Corpo inteiro", nota: 4.7 },
    { id: "pernas-pesadas", nome: "Pernas Pesadas", objetivo: "Hipertrofia", nivel: "Avançado", duracao: 55, grupo: "Inferiores", nota: 4.8 },
    { id: "yoga-manha", nome: "Yoga da Manhã", objetivo: "Yoga & Mobilidade", nivel: "Iniciante", duracao: 20, grupo: "Corpo inteiro", nota: 4.9 },
    { id: "core-de-aco", nome: "Core de Aço", objetivo: "Resistência", nivel: "Intermediário", duracao: 18, grupo: "Core", nota: 4.6 },
    { id: "peito-costas", nome: "Peito e Costas", objetivo: "Hipertrofia", nivel: "Intermediário", duracao: 45, grupo: "Superiores", nota: 4.8 },
    { id: "corrida-intervalada", nome: "Corrida Intervalada", objetivo: "Resistência", nivel: "Avançado", duracao: 40, grupo: "Inferiores", nota: 4.5 },
    { id: "mobilidade-quadril", nome: "Mobilidade de Quadril", objetivo: "Yoga & Mobilidade", nivel: "Iniciante", duracao: 12, grupo: "Inferiores", nota: 4.7 },
    { id: "tabata-bracos", nome: "Tabata de Braços", objetivo: "HIIT", nivel: "Intermediário", duracao: 25, grupo: "Superiores", nota: 4.6 },
  ];

  const PROFISSIONAIS = [
    { nome: "Ana Souza", especialidade: "Nutricionista", nota: 5.0, seguidores: "1.2k" },
    { nome: "Rafael Souza", especialidade: "Personal Trainer", nota: 5.0, seguidores: "980" },
    { nome: "Marina Lima", especialidade: "Yoga", nota: 4.8, seguidores: "2.4k" },
    { nome: "Gabriel Torres", especialidade: "Fisioterapeuta", nota: 4.7, seguidores: "640" },
    { nome: "Carla Mendes", especialidade: "Personal Trainer", nota: 4.9, seguidores: "1.8k" },
    { nome: "Lucas Prado", especialidade: "Nutricionista", nota: 4.6, seguidores: "510" },
  ];

  const AULAS = [
    { nome: "Spinning", professor: "Carla Mendes", dia: "Seg e Qua", hora: "07:00", vagas: 4, total: 20 },
    { nome: "Pilates", professor: "Marina Lima", dia: "Ter e Qui", hora: "19:00", vagas: 0, total: 12 },
    { nome: "Funcional", professor: "Rafael Souza", dia: "Seg a Sex", hora: "18:30", vagas: 9, total: 25 },
    { nome: "Yoga Flow", professor: "Marina Lima", dia: "Sábado", hora: "09:00", vagas: 6, total: 15 },
  ];

  const TREINOS_PADRAO = [
    { id: "t1", nome: "Super Inferiores A", grupo: "Quadríceps e Panturrilhas", exercicios: 6, ultimo: "Ontem" },
    { id: "t2", nome: "Superiores B", grupo: "Peito, Ombros e Tríceps", exercicios: 7, ultimo: "Há 3 dias" },
    { id: "t3", nome: "Costas e Bíceps", grupo: "Dorsais e Bíceps", exercicios: 6, ultimo: "Há 5 dias" },
  ];

  const EVOLUCAO = {
    // 12 semanas, da mais antiga para a mais recente
    peso: [83.6, 83.2, 82.9, 82.4, 81.9, 81.5, 81.6, 80.8, 80.3, 80.1, 79.9, 79.6],
    cargas: [52.5, 55, 57.5, 60, 62.5, 65, 65, 70, 72.5, 75, 77.5, 80],
  };

  // Exercícios de cada treino: séries, repetições (número ou tempo), carga em kg e descanso em segundos
  const ex = (nome, series, reps, carga, descanso = 60) => ({ nome, series, reps, carga, descanso });
  const EXERCICIOS = {
    t1: [
      ex("Agachamento livre", 4, 10, 60, 90),
      ex("Leg press 45°", 4, 12, 140, 90),
      ex("Cadeira extensora", 3, 12, 45),
      ex("Afundo com halteres", 3, 10, 16),
      ex("Panturrilha em pé", 4, 15, 50, 45),
      ex("Panturrilha sentado", 3, 15, 30, 45),
    ],
    t2: [
      ex("Supino reto", 4, 10, 50, 90),
      ex("Supino inclinado com halteres", 3, 10, 18),
      ex("Desenvolvimento com halteres", 3, 10, 14),
      ex("Elevação lateral", 3, 12, 8, 45),
      ex("Crucifixo na máquina", 3, 12, 35),
      ex("Tríceps na corda", 3, 12, 20, 45),
      ex("Tríceps francês", 3, 10, 12, 45),
    ],
    t3: [
      ex("Puxada frontal", 4, 10, 50, 90),
      ex("Remada curvada", 4, 10, 40, 90),
      ex("Remada baixa", 3, 12, 45),
      ex("Pulldown com corda", 3, 12, 25),
      ex("Rosca direta", 3, 10, 20, 45),
      ex("Rosca martelo", 3, 12, 10, 45),
    ],
    "fullbody-explosivo": [
      ex("Agachamento com salto", 3, 12, 0, 45),
      ex("Flexão de braço", 3, 12, 0, 45),
      ex("Levantamento terra", 3, 8, 60, 90),
      ex("Remada unilateral", 3, 10, 18),
      ex("Desenvolvimento com halteres", 3, 10, 12),
    ],
    "hiit-15": [
      ex("Polichinelo", 3, "40 s", 0, 20),
      ex("Burpee", 3, "40 s", 0, 20),
      ex("Escalador", 3, "40 s", 0, 20),
      ex("Agachamento com salto", 3, "40 s", 0, 20),
    ],
    "pernas-pesadas": [
      ex("Agachamento livre", 5, 6, 80, 120),
      ex("Stiff", 4, 8, 60, 90),
      ex("Leg press 45°", 4, 10, 180, 90),
      ex("Cadeira flexora", 3, 12, 40),
      ex("Passada com barra", 3, 10, 30),
      ex("Panturrilha no leg press", 4, 15, 120, 45),
    ],
    "yoga-manha": [
      ex("Saudação ao sol", 2, "60 s", 0, 15),
      ex("Cachorro olhando para baixo", 2, "45 s", 0, 15),
      ex("Postura do guerreiro II", 2, "45 s", 0, 15),
      ex("Torção sentada", 2, "45 s", 0, 15),
      ex("Postura da criança", 1, "90 s", 0, 0),
    ],
    "core-de-aco": [
      ex("Prancha", 3, "45 s", 0, 30),
      ex("Abdominal bicicleta", 3, 20, 0, 30),
      ex("Elevação de pernas", 3, 12, 0, 30),
      ex("Prancha lateral", 3, "30 s", 0, 30),
    ],
    "peito-costas": [
      ex("Supino reto", 4, 8, 55, 90),
      ex("Puxada frontal", 4, 10, 50, 90),
      ex("Crucifixo com halteres", 3, 12, 14),
      ex("Remada baixa", 3, 12, 45),
      ex("Flexão de braço", 2, 15, 0, 45),
    ],
    "corrida-intervalada": [
      ex("Aquecimento leve", 1, "5 min", 0, 0),
      ex("Tiro forte", 8, "1 min", 0, 90),
      ex("Desaquecimento", 1, "5 min", 0, 0),
    ],
    "mobilidade-quadril": [
      ex("Rotação de quadril em pé", 2, 10, 0, 15),
      ex("Postura do pombo", 2, "45 s", 0, 15),
      ex("Alongamento 90/90", 2, "45 s", 0, 15),
    ],
    "tabata-bracos": [
      ex("Flexão de braço", 4, "20 s", 0, 10),
      ex("Tríceps no banco", 4, "20 s", 0, 10),
      ex("Rosca com elástico", 4, "20 s", 0, 10),
    ],
  };

  // Histórico de exemplo: dias atrás em relação a hoje (assim a demonstração nunca fica "velha")
  const HISTORICO_PADRAO = [
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 1, duracao: 52, series: 22, volume: 5940 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 3, duracao: 48, series: 23, volume: 3820 },
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 5, duracao: 46, series: 20, volume: 4210 },
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 8, duracao: 50, series: 22, volume: 5710 },
    { treinoId: "hiit-15", nome: "HIIT 15 Minutos", diasAtras: 9, duracao: 16, series: 12, volume: 0 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 11, duracao: 47, series: 23, volume: 3700 },
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 13, duracao: 44, series: 20, volume: 4080 },
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 15, duracao: 49, series: 22, volume: 5520 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 18, duracao: 45, series: 23, volume: 3610 },
    { treinoId: "yoga-manha", nome: "Yoga da Manhã", diasAtras: 19, duracao: 21, series: 9, volume: 0 },
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 20, duracao: 43, series: 20, volume: 3950 },
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 23, duracao: 51, series: 22, volume: 5300 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 26, duracao: 46, series: 23, volume: 3480 },
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 29, duracao: 42, series: 20, volume: 3820 },
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 33, duracao: 50, series: 22, volume: 5180 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 36, duracao: 45, series: 23, volume: 3400 },
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 40, duracao: 44, series: 20, volume: 3700 },
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 43, duracao: 48, series: 22, volume: 5010 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 47, duracao: 44, series: 23, volume: 3310 },
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 52, duracao: 47, series: 22, volume: 4820 },
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 55, duracao: 41, series: 20, volume: 3540 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 61, duracao: 43, series: 23, volume: 3150 },
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 66, duracao: 46, series: 22, volume: 4600 },
    { treinoId: "hiit-15", nome: "HIIT 15 Minutos", diasAtras: 71, duracao: 15, series: 12, volume: 0 },
    { treinoId: "t2", nome: "Superiores B", diasAtras: 76, duracao: 42, series: 23, volume: 3020 },
  ];

  // Refeições de exemplo do dia (os totais batem com as metas da página de alimentação)
  const REFEICOES_PADRAO = [
    { id: "r1", nome: "Café da manhã", hora: "07:30", descricao: "Ovos mexidos, pão integral e banana", kcal: 480, proteina: 30, carbo: 55, gordura: 18 },
    { id: "r2", nome: "Almoço", hora: "12:30", descricao: "Arroz, feijão, frango grelhado e salada", kcal: 720, proteina: 55, carbo: 80, gordura: 15 },
    { id: "r3", nome: "Lanche pré-treino", hora: "16:00", descricao: "Iogurte natural com aveia e mel", kcal: 310, proteina: 20, carbo: 45, gordura: 8 },
    { id: "r4", nome: "Jantar", hora: "20:00", descricao: "Omelete de legumes e batata-doce", kcal: 590, proteina: 55, carbo: 40, gordura: 19 },
  ];

  const METAS_NUTRICAO = { kcal: 2500, proteina: 180, carbo: 300, gordura: 70, aguaMl: 3000 };

  window.SL_DADOS = {
    CATALOGO, PROFISSIONAIS, AULAS, TREINOS_PADRAO, EVOLUCAO,
    EXERCICIOS, HISTORICO_PADRAO, REFEICOES_PADRAO, METAS_NUTRICAO,
  };
})();
