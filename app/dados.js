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
    peso: [82.4, 81.9, 81.5, 81.6, 80.8, 80.3, 80.1, 79.6],
    cargas: [60, 62.5, 65, 65, 70, 72.5, 75, 80],
  };


  window.SL_DADOS = { CATALOGO, PROFISSIONAIS, AULAS, TREINOS_PADRAO, EVOLUCAO };
})();
