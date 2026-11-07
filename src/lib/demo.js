// Dados de exemplo da conta de demonstração (botão "Demonstração: cliente" do login).
// Só essa conta recebe dados de exemplo; as contas de verdade começam zeradas.
import { ler, gravar } from "./armazenamento.js";
import { treinosDoUsuario } from "./nucleo.js";
import { SL_DADOS } from "./dados.js";

// Um dia em milissegundos
const DIA = 86400000;

// Enche 3 semanas de treinos, pontos e pesos
export function preencherDemo() {
  // Sem treinos: coloca os de exemplo
  if (!treinosDoUsuario().length) gravar("sl-treinos", SL_DADOS.DEMO.TREINOS);
  // Treinos
  const treinos = treinosDoUsuario();
  // Listas novas
  const historico = [];
  // Pontos
  const eventos = [];
  // Pesos
  const pesos = [];
  // Hoje
  const hoje = new Date();
  // Últimos 21 dias
  for (let d = 21; d >= 1; d--) {
    // Data às 18h30
    const data = new Date(hoje.getTime() - d * DIA);
    // Horário
    data.setHours(18, 30, 0, 0);
    // Texto da data
    const iso = data.toISOString();
    // Dia
    const dia = data.toDateString();
    // Água e 3 refeições por dia
    eventos.push({ ref: "demo-agua:" + dia, tipo: "agua", pts: 10, data: iso });
    // Refeições
    for (let r = 0; r < 3; r++) eventos.push({ ref: `demo-ref${r}:` + dia, tipo: "refeicao", pts: 5, data: iso });
    // Treina segunda, terça, quinta e sábado
    if (![1, 2, 4, 6].includes(data.getDay())) continue;
    // Treino da vez
    const treino = treinos[d % treinos.length] || { id: "t1", nome: "Treino" };
    // Séries
    const series = 16 + (d % 4) * 2;
    // Histórico
    historico.push({ treinoId: treino.id, nome: treino.nome, data: iso, duracao: 40 + (d % 3) * 8, series, volume: 3200 + d * 90, demo: true });
    // Pontos do treino
    eventos.push({ ref: "demo-treino:" + dia, tipo: "treino", pts: 50, data: iso });
    // Pontos de 8 séries
    for (let s = 0; s < 8; s++) eventos.push({ ref: `demo-serie${s}:` + dia, tipo: "serie", pts: 10, data: iso });
    // Um peso por semana
    if (data.getDay() === 1) pesos.push({ data: iso, valor: Math.round((79 - (21 - d) * 0.12) * 10) / 10 });
  }
  // Histórico (mantém o que é da pessoa)
  gravar("sl-historico", ler("sl-historico", []).filter((h) => !h.demo).concat(historico));
  // Pontos
  gravar("sl-pontos", ler("sl-pontos", []).filter((e) => !String(e.ref).startsWith("demo-")).concat(eventos));
  // Pesos
  gravar("sl-pesos", pesos);
}
