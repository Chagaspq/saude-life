// Pontos e ligas (só os pontos da própria pessoa no MVP).
import { ler, gravar } from "./armazenamento.js";
import { inicioDaSemana } from "./formato.js";
import { onboarding, historico, estatisticas, toast } from "./nucleo.js";

// Um dia e uma semana em milissegundos
const DIA = 86400000;
// Uma semana
const SEMANA = 7 * DIA;

// Pontos de cada ação
export const TABELA = { serie: 10, treino: 50, refeicao: 5, proteina: 15, agua: 10, sequencia: 5, recorde: 20, metaSemana: 100 };
// Limite de pontos por dia
export const LIMITE_DIA = 300;
// Refeições que valem pontos por dia
const LIMITE_REFEICOES = 4;
// Pontos na semana para subir de liga
export const SOBE = 500;
// Menos que isso na semana: desce
const DESCE = 150;
// Bônus de iniciante (+20% nas 4 primeiras semanas)
const BONUS = 0.2;

// Ligas
export const LIGAS = [
  // Bronze
  { id: "bronze", nome: "Bronze" },
  // Prata
  { id: "prata", nome: "Prata" },
  // Ouro
  { id: "ouro", nome: "Ouro" },
  // Diamante
  { id: "diamante", nome: "Diamante" },
  // Esmeralda
  { id: "esmeralda", nome: "Esmeralda" },
  // Lenda
  { id: "lenda", nome: "Lenda" },
];

// Dia de uma data (para comparar)
const diaDe = (d) => new Date(d).toDateString();
// Começo desta semana
const semanaAtual = () => inicioDaSemana(new Date()).getTime();
// Pontos salvos
const salvos = () => ler("sl-pontos", []);

// Soma os pontos entre duas datas
export function somar(ini, fim) {
  // Soma
  return salvos().reduce((t, e) => {
    // Hora do evento
    const h = new Date(e.data).getTime();
    // Dentro do período: soma
    return h >= ini && h < fim ? t + e.pts : t;
  }, 0);
}

// Pontos de hoje
const deHoje = () => salvos().reduce((t, e) => (diaDe(e.data) === diaDe(new Date()) ? t + e.pts : t), 0);

// Tem bônus de iniciante?
function temBonus() {
  // Só iniciante
  if (onboarding().nivel !== "Iniciante") return false;
  // Quando começou
  let inicio = ler("sl-pontos-inicio", null);
  // Primeira vez
  if (!inicio) gravar("sl-pontos-inicio", (inicio = new Date().toISOString()));
  // Nas 4 primeiras semanas
  return Date.now() - new Date(inicio).getTime() < 4 * SEMANA;
}

// "+10" voando na tela
function voar(pts, origem) {
  // Bolha
  const bolha = document.createElement("span");
  // Classe
  bolha.className = "pontos-voando";
  // Texto
  bolha.textContent = "+" + pts;
  // Escondida do leitor de tela (o aviso vai no toast)
  bolha.setAttribute("aria-hidden", "true");
  // Sai do botão clicado
  if (origem && origem.getBoundingClientRect) {
    // Posição do botão
    const r = origem.getBoundingClientRect();
    // Centro
    bolha.style.left = r.left + r.width / 2 + "px";
    // Centro
    bolha.style.top = r.top + r.height / 2 + "px";
  }
  // Coloca
  document.body.append(bolha);
  // Some depois
  setTimeout(() => bolha.remove(), 1300);
}

// Ganha pontos por uma ação ("ref" único: a mesma ação não pontua duas vezes)
export function ganhar(tipo, ref, origem) {
  // Lista
  const lista = salvos();
  // Já pontuou
  if (lista.some((e) => e.ref === ref)) return 0;
  // Pontos da tabela (com bônus de iniciante)
  let pts = Math.round((TABELA[tipo] || 0) * (temBonus() ? 1 + BONUS : 1));
  // Refeições: só 4 por dia
  if (tipo === "refeicao" && lista.filter((e) => e.tipo === "refeicao" && diaDe(e.data) === diaDe(new Date())).length >= LIMITE_REFEICOES) pts = 0;
  // Limite do dia
  pts = Math.max(0, Math.min(pts, LIMITE_DIA - deHoje()));
  // Nada a ganhar
  if (!pts) {
    // Avisa se foi pelo limite
    if (deHoje() >= LIMITE_DIA) toast("Você bateu o limite de 300 pontos de hoje. Amanhã tem mais!");
    // Para
    return 0;
  }
  // Guarda
  gravar("sl-pontos", lista.concat({ ref, tipo, pts, data: new Date().toISOString() }));
  // Animação
  voar(pts, origem);
  // Vibração curta (se a pessoa deixou)
  if (navigator.vibrate && ler("sl-pref-vibrar", true) && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(15);
  // Devolve
  return pts;
}

// Tira os pontos de uma ação (ex.: desmarcou a série)
export function perder(ref) {
  // Lista sem a ação
  gravar("sl-pontos", salvos().filter((e) => e.ref !== ref));
}

// Pontos de sequência e de meta da semana depois de um treino
export function conferirTreino() {
  // Ontem
  const ontem = new Date(Date.now() - DIA);
  // Treinou ontem também: sequência
  if (historico().some((h) => diaDe(h.data) === diaDe(ontem))) ganhar("sequencia", "sequencia:" + diaDe(new Date()));
  // Números
  const { nestaSemana, meta } = estatisticas();
  // Bateu a meta da semana
  if (nestaSemana >= meta) ganhar("metaSemana", "metaSemana:" + semanaAtual());
}

// Liga atual (sobe ou desce no domingo)
export function liga() {
  // Estado salvo
  const estado = ler("sl-liga", { atual: 0, avaliada: semanaAtual(), mudancas: [] });
  // Avalia as semanas que já fecharam
  while (estado.avaliada < semanaAtual()) {
    // Pontos daquela semana
    const pts = somar(estado.avaliada, estado.avaliada + SEMANA);
    // Liga antes
    const antes = estado.atual;
    // Sobe
    if (pts >= SOBE && estado.atual < LIGAS.length - 1) estado.atual++;
    // Desce
    else if (pts < DESCE && estado.atual > 0) estado.atual--;
    // Mudou: guarda
    if (estado.atual !== antes) estado.mudancas.unshift({ semana: estado.avaliada, de: antes, para: estado.atual, pts });
    // Próxima semana
    estado.avaliada += SEMANA;
  }
  // Salva
  localStorage.setItem("sl-liga", JSON.stringify(estado));
  // Devolve
  return estado;
}

// Situação da semana: pontos, liga e quanto falta
export function situacaoDaLiga() {
  // Pontos da semana
  const pts = somar(semanaAtual(), semanaAtual() + SEMANA);
  // Liga
  const atual = liga().atual;
  // Devolve
  return { pts, atual, faltaSubir: Math.max(0, SOBE - pts), diasParaZerar: Math.ceil((semanaAtual() + SEMANA - Date.now()) / DIA) };
}
