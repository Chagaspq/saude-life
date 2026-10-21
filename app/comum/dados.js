/*
 * Dados de exemplo do app (sem backend).
 * Ficam em window.SL_DADOS para todas as páginas usarem.
 */
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Catálogo: todos os treinos prontos do app (id, nome, objetivo, nível, minutos, grupo e nota)
  const CATALOGO = [
    // Fullbody Explosivo: Hipertrofia, intermediário, 30 minutos
    { id: "fullbody-explosivo", nome: "Fullbody Explosivo", objetivo: "Hipertrofia", nivel: "Intermediário", duracao: 30, grupo: "Corpo inteiro", nota: 4.9 },
    // HIIT 15 Minutos: HIIT, iniciante, 15 minutos
    { id: "hiit-15", nome: "HIIT 15 Minutos", objetivo: "HIIT", nivel: "Iniciante", duracao: 15, grupo: "Corpo inteiro", nota: 4.7 },
    // Pernas Pesadas: Hipertrofia, avançado, 55 minutos
    { id: "pernas-pesadas", nome: "Pernas Pesadas", objetivo: "Hipertrofia", nivel: "Avançado", duracao: 55, grupo: "Inferiores", nota: 4.8 },
    // Yoga da Manhã: Yoga & Mobilidade, iniciante, 20 minutos
    { id: "yoga-manha", nome: "Yoga da Manhã", objetivo: "Yoga & Mobilidade", nivel: "Iniciante", duracao: 20, grupo: "Corpo inteiro", nota: 4.9 },
    // Core de Aço: Resistência, intermediário, 18 minutos
    { id: "core-de-aco", nome: "Core de Aço", objetivo: "Resistência", nivel: "Intermediário", duracao: 18, grupo: "Core", nota: 4.6 },
    // Peito e Costas: Hipertrofia, intermediário, 45 minutos
    { id: "peito-costas", nome: "Peito e Costas", objetivo: "Hipertrofia", nivel: "Intermediário", duracao: 45, grupo: "Superiores", nota: 4.8 },
    // Corrida Intervalada: Resistência, avançado, 40 minutos
    { id: "corrida-intervalada", nome: "Corrida Intervalada", objetivo: "Resistência", nivel: "Avançado", duracao: 40, grupo: "Inferiores", nota: 4.5 },
    // Mobilidade de Quadril: Yoga & Mobilidade, iniciante, 12 minutos
    { id: "mobilidade-quadril", nome: "Mobilidade de Quadril", objetivo: "Yoga & Mobilidade", nivel: "Iniciante", duracao: 12, grupo: "Inferiores", nota: 4.7 },
    // Tabata de Braços: HIIT, intermediário, 25 minutos
    { id: "tabata-bracos", nome: "Tabata de Braços", objetivo: "HIIT", nivel: "Intermediário", duracao: 25, grupo: "Superiores", nota: 4.6 },
  ];

  // Lista de profissionais (nome, especialidade, nota e seguidores)
  const PROFISSIONAIS = [
    // Ana Souza, nutricionista, nota 5,0
    { nome: "Ana Souza", especialidade: "Nutricionista", nota: 5.0, seguidores: "1.2k" },
    // Rafael Souza, personal trainer, nota 5,0
    { nome: "Rafael Souza", especialidade: "Personal Trainer", nota: 5.0, seguidores: "980" },
    // Marina Lima, yoga, nota 4,8
    { nome: "Marina Lima", especialidade: "Yoga", nota: 4.8, seguidores: "2.4k" },
    // Gabriel Torres, fisioterapeuta, nota 4,7
    { nome: "Gabriel Torres", especialidade: "Fisioterapeuta", nota: 4.7, seguidores: "640" },
    // Carla Mendes, personal trainer, nota 4,9
    { nome: "Carla Mendes", especialidade: "Personal Trainer", nota: 4.9, seguidores: "1.8k" },
    // Lucas Prado, nutricionista, nota 4,6
    { nome: "Lucas Prado", especialidade: "Nutricionista", nota: 4.6, seguidores: "510" },
  ];

  // Aulas da academia (nome, professor, dias, hora, vagas livres e total)
  const AULAS = [
    // Aula de Spinning com Carla Mendes, Seg e Qua às 07:00 (4 de 20 vagas livres)
    { nome: "Spinning", professor: "Carla Mendes", dia: "Seg e Qua", hora: "07:00", vagas: 4, total: 20 },
    // Aula de Pilates com Marina Lima, Ter e Qui às 19:00 (0 de 12 vagas livres)
    { nome: "Pilates", professor: "Marina Lima", dia: "Ter e Qui", hora: "19:00", vagas: 0, total: 12 },
    // Aula de Funcional com Rafael Souza, Seg a Sex às 18:30 (9 de 25 vagas livres)
    { nome: "Funcional", professor: "Rafael Souza", dia: "Seg a Sex", hora: "18:30", vagas: 9, total: 25 },
    // Aula de Yoga Flow com Marina Lima, Sábado às 09:00 (6 de 15 vagas livres)
    { nome: "Yoga Flow", professor: "Marina Lima", dia: "Sábado", hora: "09:00", vagas: 6, total: 15 },
  ];

  // Treinos que já vêm criados para a pessoa
  const TREINOS_PADRAO = [
    // Treino Super Inferiores A: quadríceps e panturrilhas, 6 exercícios
    { id: "t1", nome: "Super Inferiores A", grupo: "Quadríceps e Panturrilhas", exercicios: 6, ultimo: "Ontem" },
    // Treino Superiores B: peito, ombros e tríceps, 7 exercícios
    { id: "t2", nome: "Superiores B", grupo: "Peito, Ombros e Tríceps", exercicios: 7, ultimo: "Há 3 dias" },
    // Treino Costas e Bíceps: dorsais e bíceps, 6 exercícios
    { id: "t3", nome: "Costas e Bíceps", grupo: "Dorsais e Bíceps", exercicios: 6, ultimo: "Há 5 dias" },
  ];

  // Números de exemplo para os gráficos da Evolução
  const EVOLUCAO = {
    // 12 semanas, da mais antiga para a mais recente
    // Peso em kg de cada semana
    peso: [83.6, 83.2, 82.9, 82.4, 81.9, 81.5, 81.6, 80.8, 80.3, 80.1, 79.9, 79.6],
    // Carga do agachamento em kg de cada semana
    cargas: [52.5, 55, 57.5, 60, 62.5, 65, 65, 70, 72.5, 75, 77.5, 80],
  };

  // Exercícios de cada treino: séries, repetições (número ou tempo), carga em kg e descanso em segundos
  // Atalho que monta um exercício: ex(nome, séries, repetições, carga, descanso)
  const ex = (nome, series, reps, carga, descanso = 60) => ({ nome, series, reps, carga, descanso });
  // Exercícios de cada treino, separados pelo id do treino
  const EXERCICIOS = {
    // Exercícios do treino t1 (Super Inferiores A)
    t1: [
      // Agachamento livre: 4 séries de 10 repetições, 60 kg, descanso de 90 s
      ex("Agachamento livre", 4, 10, 60, 90),
      // Leg press 45°: 4 séries de 12 repetições, 140 kg, descanso de 90 s
      ex("Leg press 45°", 4, 12, 140, 90),
      // Cadeira extensora: 3 séries de 12 repetições, 45 kg, descanso de 60 s
      ex("Cadeira extensora", 3, 12, 45),
      // Afundo com halteres: 3 séries de 10 repetições, 16 kg, descanso de 60 s
      ex("Afundo com halteres", 3, 10, 16),
      // Panturrilha em pé: 4 séries de 15 repetições, 50 kg, descanso de 45 s
      ex("Panturrilha em pé", 4, 15, 50, 45),
      // Panturrilha sentado: 3 séries de 15 repetições, 30 kg, descanso de 45 s
      ex("Panturrilha sentado", 3, 15, 30, 45),
    ],
    // Exercícios do treino t2 (Superiores B)
    t2: [
      // Supino reto: 4 séries de 10 repetições, 50 kg, descanso de 90 s
      ex("Supino reto", 4, 10, 50, 90),
      // Supino inclinado com halteres: 3 séries de 10 repetições, 18 kg, descanso de 60 s
      ex("Supino inclinado com halteres", 3, 10, 18),
      // Desenvolvimento com halteres: 3 séries de 10 repetições, 14 kg, descanso de 60 s
      ex("Desenvolvimento com halteres", 3, 10, 14),
      // Elevação lateral: 3 séries de 12 repetições, 8 kg, descanso de 45 s
      ex("Elevação lateral", 3, 12, 8, 45),
      // Crucifixo na máquina: 3 séries de 12 repetições, 35 kg, descanso de 60 s
      ex("Crucifixo na máquina", 3, 12, 35),
      // Tríceps na corda: 3 séries de 12 repetições, 20 kg, descanso de 45 s
      ex("Tríceps na corda", 3, 12, 20, 45),
      // Tríceps francês: 3 séries de 10 repetições, 12 kg, descanso de 45 s
      ex("Tríceps francês", 3, 10, 12, 45),
    ],
    // Exercícios do treino t3 (Costas e Bíceps)
    t3: [
      // Puxada frontal: 4 séries de 10 repetições, 50 kg, descanso de 90 s
      ex("Puxada frontal", 4, 10, 50, 90),
      // Remada curvada: 4 séries de 10 repetições, 40 kg, descanso de 90 s
      ex("Remada curvada", 4, 10, 40, 90),
      // Remada baixa: 3 séries de 12 repetições, 45 kg, descanso de 60 s
      ex("Remada baixa", 3, 12, 45),
      // Pulldown com corda: 3 séries de 12 repetições, 25 kg, descanso de 60 s
      ex("Pulldown com corda", 3, 12, 25),
      // Rosca direta: 3 séries de 10 repetições, 20 kg, descanso de 45 s
      ex("Rosca direta", 3, 10, 20, 45),
      // Rosca martelo: 3 séries de 12 repetições, 10 kg, descanso de 45 s
      ex("Rosca martelo", 3, 12, 10, 45),
    ],
    // Exercícios do treino "fullbody-explosivo"
    "fullbody-explosivo": [
      // Agachamento com salto: 3 séries de 12 repetições, sem carga, descanso de 45 s
      ex("Agachamento com salto", 3, 12, 0, 45),
      // Flexão de braço: 3 séries de 12 repetições, sem carga, descanso de 45 s
      ex("Flexão de braço", 3, 12, 0, 45),
      // Levantamento terra: 3 séries de 8 repetições, 60 kg, descanso de 90 s
      ex("Levantamento terra", 3, 8, 60, 90),
      // Remada unilateral: 3 séries de 10 repetições, 18 kg, descanso de 60 s
      ex("Remada unilateral", 3, 10, 18),
      // Desenvolvimento com halteres: 3 séries de 10 repetições, 12 kg, descanso de 60 s
      ex("Desenvolvimento com halteres", 3, 10, 12),
    ],
    // Exercícios do treino "hiit-15"
    "hiit-15": [
      // Polichinelo: 3 séries de 40 s, sem carga, descanso de 20 s
      ex("Polichinelo", 3, "40 s", 0, 20),
      // Burpee: 3 séries de 40 s, sem carga, descanso de 20 s
      ex("Burpee", 3, "40 s", 0, 20),
      // Escalador: 3 séries de 40 s, sem carga, descanso de 20 s
      ex("Escalador", 3, "40 s", 0, 20),
      // Agachamento com salto: 3 séries de 40 s, sem carga, descanso de 20 s
      ex("Agachamento com salto", 3, "40 s", 0, 20),
    ],
    // Exercícios do treino "pernas-pesadas"
    "pernas-pesadas": [
      // Agachamento livre: 5 séries de 6 repetições, 80 kg, descanso de 120 s
      ex("Agachamento livre", 5, 6, 80, 120),
      // Stiff: 4 séries de 8 repetições, 60 kg, descanso de 90 s
      ex("Stiff", 4, 8, 60, 90),
      // Leg press 45°: 4 séries de 10 repetições, 180 kg, descanso de 90 s
      ex("Leg press 45°", 4, 10, 180, 90),
      // Cadeira flexora: 3 séries de 12 repetições, 40 kg, descanso de 60 s
      ex("Cadeira flexora", 3, 12, 40),
      // Passada com barra: 3 séries de 10 repetições, 30 kg, descanso de 60 s
      ex("Passada com barra", 3, 10, 30),
      // Panturrilha no leg press: 4 séries de 15 repetições, 120 kg, descanso de 45 s
      ex("Panturrilha no leg press", 4, 15, 120, 45),
    ],
    // Exercícios do treino "yoga-manha"
    "yoga-manha": [
      // Saudação ao sol: 2 séries de 60 s, sem carga, descanso de 15 s
      ex("Saudação ao sol", 2, "60 s", 0, 15),
      // Cachorro olhando para baixo: 2 séries de 45 s, sem carga, descanso de 15 s
      ex("Cachorro olhando para baixo", 2, "45 s", 0, 15),
      // Postura do guerreiro II: 2 séries de 45 s, sem carga, descanso de 15 s
      ex("Postura do guerreiro II", 2, "45 s", 0, 15),
      // Torção sentada: 2 séries de 45 s, sem carga, descanso de 15 s
      ex("Torção sentada", 2, "45 s", 0, 15),
      // Postura da criança: 1 séries de 90 s, sem carga, sem descanso
      ex("Postura da criança", 1, "90 s", 0, 0),
    ],
    // Exercícios do treino "core-de-aco"
    "core-de-aco": [
      // Prancha: 3 séries de 45 s, sem carga, descanso de 30 s
      ex("Prancha", 3, "45 s", 0, 30),
      // Abdominal bicicleta: 3 séries de 20 repetições, sem carga, descanso de 30 s
      ex("Abdominal bicicleta", 3, 20, 0, 30),
      // Elevação de pernas: 3 séries de 12 repetições, sem carga, descanso de 30 s
      ex("Elevação de pernas", 3, 12, 0, 30),
      // Prancha lateral: 3 séries de 30 s, sem carga, descanso de 30 s
      ex("Prancha lateral", 3, "30 s", 0, 30),
    ],
    // Exercícios do treino "peito-costas"
    "peito-costas": [
      // Supino reto: 4 séries de 8 repetições, 55 kg, descanso de 90 s
      ex("Supino reto", 4, 8, 55, 90),
      // Puxada frontal: 4 séries de 10 repetições, 50 kg, descanso de 90 s
      ex("Puxada frontal", 4, 10, 50, 90),
      // Crucifixo com halteres: 3 séries de 12 repetições, 14 kg, descanso de 60 s
      ex("Crucifixo com halteres", 3, 12, 14),
      // Remada baixa: 3 séries de 12 repetições, 45 kg, descanso de 60 s
      ex("Remada baixa", 3, 12, 45),
      // Flexão de braço: 2 séries de 15 repetições, sem carga, descanso de 45 s
      ex("Flexão de braço", 2, 15, 0, 45),
    ],
    // Exercícios do treino "corrida-intervalada"
    "corrida-intervalada": [
      // Aquecimento leve: 1 séries de 5 min, sem carga, sem descanso
      ex("Aquecimento leve", 1, "5 min", 0, 0),
      // Tiro forte: 8 séries de 1 min, sem carga, descanso de 90 s
      ex("Tiro forte", 8, "1 min", 0, 90),
      // Desaquecimento: 1 séries de 5 min, sem carga, sem descanso
      ex("Desaquecimento", 1, "5 min", 0, 0),
    ],
    // Exercícios do treino "mobilidade-quadril"
    "mobilidade-quadril": [
      // Rotação de quadril em pé: 2 séries de 10 repetições, sem carga, descanso de 15 s
      ex("Rotação de quadril em pé", 2, 10, 0, 15),
      // Postura do pombo: 2 séries de 45 s, sem carga, descanso de 15 s
      ex("Postura do pombo", 2, "45 s", 0, 15),
      // Alongamento 90/90: 2 séries de 45 s, sem carga, descanso de 15 s
      ex("Alongamento 90/90", 2, "45 s", 0, 15),
    ],
    // Exercícios do treino "tabata-bracos"
    "tabata-bracos": [
      // Flexão de braço: 4 séries de 20 s, sem carga, descanso de 10 s
      ex("Flexão de braço", 4, "20 s", 0, 10),
      // Tríceps no banco: 4 séries de 20 s, sem carga, descanso de 10 s
      ex("Tríceps no banco", 4, "20 s", 0, 10),
      // Rosca com elástico: 4 séries de 20 s, sem carga, descanso de 10 s
      ex("Rosca com elástico", 4, "20 s", 0, 10),
    ],
  };

  // Histórico de exemplo: dias atrás em relação a hoje (assim a demonstração nunca fica "velha")
  // Histórico de treinos feitos (exemplo)
  const HISTORICO_PADRAO = [
    // Super Inferiores A feito há 1 dias: 52 min, 22 séries, 5940 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 1, duracao: 52, series: 22, volume: 5940 },
    // Superiores B feito há 3 dias: 48 min, 23 séries, 3820 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 3, duracao: 48, series: 23, volume: 3820 },
    // Costas e Bíceps feito há 5 dias: 46 min, 20 séries, 4210 kg levantados
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 5, duracao: 46, series: 20, volume: 4210 },
    // Super Inferiores A feito há 8 dias: 50 min, 22 séries, 5710 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 8, duracao: 50, series: 22, volume: 5710 },
    // HIIT 15 Minutos feito há 9 dias: 16 min, 12 séries, 0 kg levantados
    { treinoId: "hiit-15", nome: "HIIT 15 Minutos", diasAtras: 9, duracao: 16, series: 12, volume: 0 },
    // Superiores B feito há 11 dias: 47 min, 23 séries, 3700 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 11, duracao: 47, series: 23, volume: 3700 },
    // Costas e Bíceps feito há 13 dias: 44 min, 20 séries, 4080 kg levantados
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 13, duracao: 44, series: 20, volume: 4080 },
    // Super Inferiores A feito há 15 dias: 49 min, 22 séries, 5520 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 15, duracao: 49, series: 22, volume: 5520 },
    // Superiores B feito há 18 dias: 45 min, 23 séries, 3610 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 18, duracao: 45, series: 23, volume: 3610 },
    // Yoga da Manhã feito há 19 dias: 21 min, 9 séries, 0 kg levantados
    { treinoId: "yoga-manha", nome: "Yoga da Manhã", diasAtras: 19, duracao: 21, series: 9, volume: 0 },
    // Costas e Bíceps feito há 20 dias: 43 min, 20 séries, 3950 kg levantados
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 20, duracao: 43, series: 20, volume: 3950 },
    // Super Inferiores A feito há 23 dias: 51 min, 22 séries, 5300 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 23, duracao: 51, series: 22, volume: 5300 },
    // Superiores B feito há 26 dias: 46 min, 23 séries, 3480 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 26, duracao: 46, series: 23, volume: 3480 },
    // Costas e Bíceps feito há 29 dias: 42 min, 20 séries, 3820 kg levantados
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 29, duracao: 42, series: 20, volume: 3820 },
    // Super Inferiores A feito há 33 dias: 50 min, 22 séries, 5180 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 33, duracao: 50, series: 22, volume: 5180 },
    // Superiores B feito há 36 dias: 45 min, 23 séries, 3400 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 36, duracao: 45, series: 23, volume: 3400 },
    // Costas e Bíceps feito há 40 dias: 44 min, 20 séries, 3700 kg levantados
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 40, duracao: 44, series: 20, volume: 3700 },
    // Super Inferiores A feito há 43 dias: 48 min, 22 séries, 5010 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 43, duracao: 48, series: 22, volume: 5010 },
    // Superiores B feito há 47 dias: 44 min, 23 séries, 3310 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 47, duracao: 44, series: 23, volume: 3310 },
    // Super Inferiores A feito há 52 dias: 47 min, 22 séries, 4820 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 52, duracao: 47, series: 22, volume: 4820 },
    // Costas e Bíceps feito há 55 dias: 41 min, 20 séries, 3540 kg levantados
    { treinoId: "t3", nome: "Costas e Bíceps", diasAtras: 55, duracao: 41, series: 20, volume: 3540 },
    // Superiores B feito há 61 dias: 43 min, 23 séries, 3150 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 61, duracao: 43, series: 23, volume: 3150 },
    // Super Inferiores A feito há 66 dias: 46 min, 22 séries, 4600 kg levantados
    { treinoId: "t1", nome: "Super Inferiores A", diasAtras: 66, duracao: 46, series: 22, volume: 4600 },
    // HIIT 15 Minutos feito há 71 dias: 15 min, 12 séries, 0 kg levantados
    { treinoId: "hiit-15", nome: "HIIT 15 Minutos", diasAtras: 71, duracao: 15, series: 12, volume: 0 },
    // Superiores B feito há 76 dias: 42 min, 23 séries, 3020 kg levantados
    { treinoId: "t2", nome: "Superiores B", diasAtras: 76, duracao: 42, series: 23, volume: 3020 },
  ];

  // Refeições de exemplo do dia (os totais batem com as metas da página de alimentação)
  // Refeições do dia
  const REFEICOES_PADRAO = [
    // Café da manhã às 07:30: ovos mexidos, pão integral e banana (480 kcal)
    { id: "r1", nome: "Café da manhã", hora: "07:30", descricao: "Ovos mexidos, pão integral e banana", kcal: 480, proteina: 30, carbo: 55, gordura: 18 },
    // Almoço às 12:30: arroz, feijão, frango grelhado e salada (720 kcal)
    { id: "r2", nome: "Almoço", hora: "12:30", descricao: "Arroz, feijão, frango grelhado e salada", kcal: 720, proteina: 55, carbo: 80, gordura: 15 },
    // Lanche pré-treino às 16:00: iogurte natural com aveia e mel (310 kcal)
    { id: "r3", nome: "Lanche pré-treino", hora: "16:00", descricao: "Iogurte natural com aveia e mel", kcal: 310, proteina: 20, carbo: 45, gordura: 8 },
    // Jantar às 20:00: omelete de legumes e batata-doce (590 kcal)
    { id: "r4", nome: "Jantar", hora: "20:00", descricao: "Omelete de legumes e batata-doce", kcal: 590, proteina: 55, carbo: 40, gordura: 19 },
  ];

  // Metas do dia: calorias, proteína, carboidrato, gordura (g) e água (ml)
  const METAS_NUTRICAO = { kcal: 2500, proteina: 180, carbo: 300, gordura: 70, aguaMl: 3000 };

  // Amigos de exemplo para o ranking (sem servidor, eles são simulados)
  // ritmo = média de pontos que a pessoa faz por semana
  const AMIGOS = [
    // Ana: treina muito, é a rival mais forte
    { nome: "Ana Souza", codigo: "ANA-3107", academia: "centro", ritmo: 820 },
    // Rafael: treina bastante
    { nome: "Rafael Lima", codigo: "RAFA-2290", academia: "centro", ritmo: 650 },
    // Camila: ritmo médio
    { nome: "Camila Rocha", codigo: "CAMI-4415", academia: "norte", ritmo: 560 },
    // Diego: ritmo médio
    { nome: "Diego Martins", codigo: "DIEGO-7781", academia: "centro", ritmo: 470 },
    // Larissa: treina em casa, sem academia
    { nome: "Larissa Alves", codigo: "LARI-1902", academia: null, ritmo: 380 },
    // Pedro: está começando
    { nome: "Pedro Henrique", codigo: "PH-6634", academia: "norte", ritmo: 300 },
    // Júlia: treina pouco
    { nome: "Júlia Costa", codigo: "JU-5520", academia: "centro", ritmo: 230 },
  ];

  // Pessoas que ainda não são amigas (dá para achar pelo código, ID ou nome e adicionar)
  // O ID é o número do código (ex.: MARCOS-8812 tem ID 8812)
  const SUGESTOES = [
    // Marcos: treina na unidade Centro
    { nome: "Marcos Vieira", codigo: "MARCOS-8812", academia: "centro", ritmo: 540 },
    // Beatriz: treina na unidade Centro
    { nome: "Beatriz Nunes", codigo: "BIA-3341", academia: "centro", ritmo: 690 },
    // Thiago: treina em casa
    { nome: "Thiago Ramos", codigo: "THI-9090", academia: null, ritmo: 410 },
    // Aline: treina na unidade Zona Norte
    { nome: "Aline Moura", codigo: "ALINE-2025", academia: "norte", ritmo: 760 },
    // Gustavo: está começando
    { nome: "Gustavo Reis", codigo: "GUGA-1177", academia: null, ritmo: 260 },
  ];

  // Academias de exemplo, com outros alunos além dos amigos
  const ACADEMIAS = [
    // Unidade do centro
    { id: "centro", nome: "Saúde Life Centro", bairro: "Centro", membros: ["Marcos Vieira", "Beatriz Nunes", "Thiago Ramos", "Fernanda Dias", "Lucas Prado", "Carla Mendes"] },
    // Unidade da zona norte
    { id: "norte", nome: "Saúde Life Zona Norte", bairro: "Zona Norte", membros: ["Bruno Teixeira", "Aline Moura", "Rodrigo Pires", "Patrícia Gomes"] },
  ];

  // Deixa todos esses dados disponíveis para as outras páginas em window.SL_DADOS
  window.SL_DADOS = {
    CATALOGO, PROFISSIONAIS, AULAS, TREINOS_PADRAO, EVOLUCAO,
    EXERCICIOS, HISTORICO_PADRAO, REFEICOES_PADRAO, METAS_NUTRICAO,
    AMIGOS, SUGESTOES, ACADEMIAS,
  };
})();
