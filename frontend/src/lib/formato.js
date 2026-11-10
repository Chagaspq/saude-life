// Funções de formato: números, datas, nomes e textos.

// Iniciais de um nome ("Ana Souza" vira "AS")
export function iniciais(nome = "") {
  // Partes do nome
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  // Sem nome
  if (!partes.length) return "?";
  // Primeira letra do primeiro e do último nome
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

// Texto sem acento, minúsculo e com "_" (ex.: "Yoga & Mobilidade" vira "yoga_mobilidade")
export function slug(texto = "") {
  // Tira acentos, deixa minúsculo e troca o resto por "_"
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// Número no formato brasileiro (1.234,5)
export function num(valor, casas = 0) {
  // Formata
  return Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

// Começo do dia de uma data (00:00)
export function inicioDoDia(data) {
  // Copia
  const d = new Date(data);
  // Zera o horário
  d.setHours(0, 0, 0, 0);
  // Devolve
  return d;
}

// Dias inteiros entre duas datas
export function diasEntre(a, b) {
  // Diferença em dias
  return Math.round((inicioDoDia(b) - inicioDoDia(a)) / 86400000);
}

// Segunda-feira da semana de uma data
export function inicioDaSemana(data) {
  // Começo do dia
  const d = inicioDoDia(data);
  // Dia da semana (segunda = 0)
  const diaSemana = (d.getDay() + 6) % 7;
  // Volta até a segunda
  d.setDate(d.getDate() - diaSemana);
  // Devolve
  return d;
}

// Data relativa ("Hoje", "Ontem", "Há 3 dias"...)
export function dataRelativa(iso) {
  // Sem data
  if (!iso) return "Nunca";
  // Dias desde a data
  const dias = diasEntre(iso, new Date());
  // Hoje
  if (dias <= 0) return "Hoje";
  // Ontem
  if (dias === 1) return "Ontem";
  // Menos de uma semana
  if (dias < 7) return `Há ${dias} dias`;
  // Semanas
  const semanas = Math.floor(dias / 7);
  // Até 4 semanas
  if (semanas < 5) return semanas === 1 ? "Há 1 semana" : `Há ${semanas} semanas`;
  // Mais antigo: a data
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

// Duração em texto ("45 min", "1h 05m")
export function duracaoTexto(minutos = 0) {
  // Horas
  const h = Math.floor(minutos / 60);
  // Minutos
  const m = Math.round(minutos % 60);
  // Sem horas
  if (!h) return `${m} min`;
  // Com horas
  return m ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
}

// Saudação pela hora do dia
export function saudacao() {
  // Hora
  const hora = new Date().getHours();
  // Texto
  return hora < 5 ? "Boa noite" : hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}

// Data de hoje por extenso ("Sexta-feira, 6 de novembro")
export function hojeTexto() {
  // Data
  const t = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  // Primeira letra maiúscula
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Texto sem acento e minúsculo (para buscas)
export const simples = (t = "") => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
