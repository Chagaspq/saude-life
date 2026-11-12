// Núcleo do app: usuário, objetivos, treinos, histórico, estatísticas e plano.
// Mesma lógica do app antigo, agora como funções que os componentes React usam.
import { ler, gravar } from "./armazenamento.js";
import { lerSessao } from "./conta.js";
import { inicioDaSemana, slug } from "./formato.js";
import { SL_DADOS } from "./dados.js";

// Catálogo de treinos prontos e exercícios de exemplo de cada treino
export const { CATALOGO, EXERCICIOS } = SL_DADOS;

// Mostra um aviso rápido na tela (o componente <Avisos> desenha)
export function toast(texto, acao) {
  // Manda o pedido para o componente
  window.dispatchEvent(new CustomEvent("sl:toast", { detail: { texto, acao } }));
}

// Pessoa logada: nome, apelido, bio, foto e e-mail
export function usuario() {
  // Sessão
  const sessao = lerSessao() || {};
  // Perfil salvo
  const perfil = ler("sl-perfil", {});
  // Nome
  const nome = perfil.nome || sessao.nome || "Visitante";
  // Devolve
  return { nome, primeiro: perfil.apelido || nome.split(/\s+/)[0], bio: perfil.bio || "", foto: perfil.foto || "", email: sessao.email || "", arroba: "@" + slug(nome), tipo: sessao.tipo || "cliente" };
}

// Respostas do questionário (objetivo, nível e dias por semana)
export function onboarding() {
  // Padrão: hipertrofia, intermediário, 4 dias
  return ler("sl-onboarding", { objetivo: "Hipertrofia", nivel: "Intermediário", dias: 4 });
}

// Peso (último registrado), altura e idade
export function dadosCorpo() {
  // Perfil
  const perfil = ler("sl-perfil", {});
  // Pesos registrados
  const pesos = ler("sl-pesos", []);
  // Peso: o último ou o do cadastro (sem nenhum, 70 kg só para as contas de meta)
  const peso = pesos.length ? pesos[pesos.length - 1].valor : perfil.peso || 70;
  // Altura (padrão 175)
  const altura = Number(perfil.altura) || 175;
  // Idade pela data de nascimento (padrão 25)
  const idade = perfil.nascimento ? Math.floor((Date.now() - new Date(perfil.nascimento)) / (365.25 * 86400000)) : 25;
  // Devolve
  return { peso: Number(peso), altura, idade };
}

// Treinos da pessoa (começa vazio)
export const treinosDoUsuario = () => ler("sl-treinos", []);

// Acha um treino (da pessoa ou do catálogo)
export function acharTreino(id) {
  // Da pessoa
  const meu = treinosDoUsuario().find((t) => t.id === id);
  // Achou
  if (meu) return meu;
  // Do catálogo
  const doCatalogo = CATALOGO.find((t) => t.id === id);
  // Devolve marcado como do catálogo
  return doCatalogo ? { ...doCatalogo, doCatalogo: true } : null;
}

// Exercícios de um treino (os dele, os de exemplo ou genéricos)
export function exerciciosDe(treino) {
  // Sem treino
  if (!treino) return [];
  // Lista própria
  if (Array.isArray(treino.itens) && treino.itens.length) return treino.itens;
  // Exemplo do catálogo
  if (EXERCICIOS[treino.id]) return EXERCICIOS[treino.id];
  // Genéricos
  return Array.from({ length: Math.max(1, Number(treino.exercicios) || 4) }, (_, i) => ({ nome: `Exercício ${i + 1}`, series: 3, reps: 12, carga: 0, descanso: 60 }));
}

// Treinos feitos, do mais novo para o mais velho
export function historico() {
  // Lista ordenada
  return ler("sl-historico", []).slice().sort((a, b) => (a.data < b.data ? 1 : -1));
}

// Números de treino da pessoa (Início, Perfil e Evolução usam)
export function estatisticas() {
  // Histórico
  const lista = historico();
  // Segunda-feira desta semana
  const semanaAtual = inicioDaSemana(new Date());
  // Meta de treinos por semana
  const meta = Number(onboarding().dias) || 4;
  // Treinos nesta semana
  const nestaSemana = lista.filter((h) => new Date(h.data) >= semanaAtual).length;
  // Semanas com pelo menos um treino
  const semanas = new Set(lista.map((h) => inicioDaSemana(h.data).getTime()));
  // Começa nesta semana (ou na passada, se esta ainda não tem treino)
  const cursor = new Date(semanaAtual);
  // Ainda sem treino nesta semana
  if (!semanas.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 7);
  // Conta as semanas seguidas
  let sequencia = 0;
  // Enquanto a semana tem treino
  while (semanas.has(cursor.getTime())) {
    // Soma
    sequencia++;
    // Volta uma semana
    cursor.setDate(cursor.getDate() - 7);
  }
  // Devolve
  return { total: lista.length, minutos: lista.reduce((s, h) => s + (h.duracao || 0), 0), volume: lista.reduce((s, h) => s + (h.volume || 0), 0), nestaSemana, meta, sequencia };
}

// Última vez que fez um treino
export function ultimaVez(treinoId) {
  // Registro mais novo desse treino
  const r = historico().find((h) => h.treinoId === treinoId);
  // Data
  return r ? r.data : null;
}

// Plano da pessoa (teste grátis vencido volta para o Free)
export function plano() {
  // Assinatura
  const a = ler("sl-assinatura", null);
  // Teste vencido
  if (a && a.teste && new Date(a.fim) < new Date()) {
    // Volta para o Free
    gravar("sl-plano", "Free");
    // Sem assinatura
    gravar("sl-assinatura", null);
  }
  // Plano atual
  return ler("sl-plano", "Free");
}

// Tem os recursos do Premium?
export const premium = () => ["Premium", "Estudante", "Família", "Profissional"].includes(plano());

// Treino em andamento (guardado pela tela de treino)
export const treinoAtual = () => ler("sl-treino-atual", null);

// Endereço da tela de treino de um treino
export const linkTreino = (id) => "/app/treino?id=" + encodeURIComponent(id);

// Resumo de um exercício: "3 × 12 reps • 20 kg"
export function resumoExercicio(e) {
  // Repetições (número ou texto como "40 s")
  const reps = typeof e.reps === "number" ? `${e.reps} reps` : e.reps;
  // Carga (se tiver)
  const carga = e.carga ? ` • ${String(e.carga).replace(".", ",")} kg` : "";
  // Junta
  return `${e.series} × ${reps}${carga}`;
}

// Exercício novo pelo nome (usa a carga sugerida da biblioteca; core e cardio contam tempo)
export function novoExercicio(nome) {
  // Informações da biblioteca
  const info = (window.SL_EXERCICIOS || {})[nome];
  // Conta por tempo?
  const porTempo = info && ["core", "cardio", "alongar"].includes(info.mov) && info.carga === 0 && info.grupo !== "Pernas";
  // Exercício
  return { nome, series: 3, reps: porTempo ? "40 s" : 12, carga: info ? info.carga : 0, descanso: porTempo ? 30 : 60 };
}
