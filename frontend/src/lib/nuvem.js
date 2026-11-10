// Sincroniza o site com a API (quando ela está ligada).
// O site continua lendo do navegador (rápido); este módulo:
//  - "puxa" os dados da conta do servidor para o navegador ao entrar e ao abrir o app;
//  - "empurra" para o servidor cada mudança salva (treinos, histórico, refeições, água, peso, perfil, pontos e avisos).
import { api, apiLigada } from "./api.js";
import { ler, EVENTO_MUDOU } from "./armazenamento.js";

// Parece um id do servidor (UUID)?
const ehUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ""));
// Data de hoje no formato do servidor (AAAA-MM-DD, horário local)
const hojeIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
// Nomes dos objetivos (questionário)
const ROTULOS = { Hipertrofia: "Ganhar massa muscular", HIIT: "Emagrecer", Resistência: "Melhorar o condicionamento", "Yoga & Mobilidade": "Flexibilidade e bem-estar" };
// Tipos de pontos que o site manda (treino e meta da semana o servidor dá sozinho)
const PONTOS_DO_SITE = ["serie", "agua", "proteina", "recorde"];

// Grava no navegador SEM disparar a sincronização de novo (marca a origem "nuvem")
function guardar(chave, valor) {
  // Tenta salvar
  try {
    // Salva
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (e) {
    /* sem armazenamento */
  }
  // Avisa a página (com origem nuvem)
  window.dispatchEvent(new CustomEvent(EVENTO_MUDOU, { detail: "nuvem:" + chave }));
}

// Chaves que a pessoa mudou enquanto os dados eram baixados (não podem ser sobrescritas)
const mexidas = new Set();
// Temporizadores (espera 0,4 s para juntar várias mudanças seguidas)
const espera = {};

// Grava o que veio do servidor, menos se a pessoa mudou essa chave nesse meio-tempo
function guardarSeLivre(chave, valor) {
  // Mudou ou vai subir: não sobrescreve
  if (mexidas.has(chave) || espera[chave]) return false;
  // Grava
  guardar(chave, valor);
  // Gravou
  return true;
}

// Tem alguém logado com token?
const logado = () => !!ler("sl-sessao", null)?.token;
// É administrador?
const admin = () => ler("sl-sessao", null)?.tipo === "admin";

// ---------- Conversões entre o formato do site e o do servidor ----------

// Ficha do servidor -> site
const treinoDoServidor = (t) => ({ id: t.id, nome: t.nome, grupo: t.grupo, autor: t.autor || undefined, exercicios: t.itens.length, itens: t.itens.map((i) => ({ nome: i.nome, series: i.series, reps: /^\d+$/.test(i.reps) ? Number(i.reps) : i.reps, carga: i.carga, descanso: i.descansoS })) });
// Ficha do site -> servidor
const treinoParaServidor = (t) => ({ nome: t.nome, grupo: t.grupo, itens: (t.itens || []).map((i) => ({ nome: i.nome, series: Number(i.series) || 3, reps: String(i.reps ?? 12), carga: Number(i.carga) || 0, descansoS: Number(i.descanso) || 0 })) });
// Treino feito do servidor -> site
const sessaoDoServidor = (s) => ({ treinoId: s.treinoId, nome: s.nome, data: s.data, duracao: s.duracaoMin, series: s.series, volume: s.volume, kcal: s.kcal, esforco: s.esforco || undefined, nid: s.id });

// ---------- Puxar (servidor -> navegador) ----------

// Baixa os dados da conta logada para o navegador
export async function puxar() {
  // Sem API ou sem login: nada
  if (!apiLigada() || !logado()) return;
  // Começa a anotar o que a pessoa mudar durante o download
  mexidas.clear();
  // Conta e perfil
  const eu = await api("GET", "/me");
  // Perfil guardado no navegador
  const perfil = ler("sl-perfil", {});
  // Junta o do servidor
  guardarSeLivre("sl-perfil", { ...perfil, nome: eu.nome, apelido: eu.apelido || perfil.apelido, bio: eu.bio || perfil.bio, altura: eu.alturaCm || perfil.altura });
  // Plano
  guardar("sl-plano", eu.plano || "Free");
  // Assinatura (teste)
  if (eu.planoFim) guardar("sl-assinatura", { plano: eu.plano, fim: eu.planoFim, teste: true });
  // Questionário respondido no servidor
  if (eu.objetivo) guardarSeLivre("sl-onboarding", { objetivo: eu.objetivo, nivel: eu.nivel, dias: eu.diasSemana, rotulo: ROTULOS[eu.objetivo] });
  // Academia (nome e código para os clientes entrarem)
  guardar("sl-academia", eu.academia || null);
  // Administrador: só os avisos
  if (eu.tipo === "admin") {
    // Avisos publicados
    const avisos = await api("GET", "/admin/avisos");
    // Guarda e marca o que já está no servidor
    if (guardarSeLivre("sl-avisos-admin", avisos)) guardar("sl-nuvem-avisos", avisos.map((a) => a.id));
    // Pronto
    return;
  }
  // Fichas, histórico (1 ano), pesos, refeições de hoje e avisos, tudo junto
  const um_ano = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
  // Chamadas ao mesmo tempo
  const [treinos, sessoes, pesos, dia, avisos] = await Promise.all([api("GET", "/treinos"), api("GET", `/sessoes?de=${um_ano}`), api("GET", "/pesos"), api("GET", `/refeicoes?dia=${hojeIso()}`), api("GET", "/avisos")]);
  // Fichas
  const fichas = treinos.map(treinoDoServidor);
  // Guarda (mais as fichas criadas aqui que ainda não subiram) e o retrato do servidor
  if (guardarSeLivre("sl-treinos", fichas.concat(ler("sl-treinos", []).filter((t) => !ehUuid(t.id)))))
    guardar("sl-nuvem-treinos", Object.fromEntries(fichas.map((t) => [t.id, JSON.stringify(treinoParaServidor(t))])));
  // Histórico do servidor + treinos feitos aqui que ainda não subiram
  guardarSeLivre("sl-historico", sessoes.map(sessaoDoServidor).concat(ler("sl-historico", []).filter((h) => !h.nid && !h.demo)));
  // Pesos (mais os registrados aqui que ainda não subiram)
  guardarSeLivre("sl-pesos", pesos.map((p) => ({ data: p.data, valor: p.valorKg, nid: true })).concat(ler("sl-pesos", []).filter((p) => !p.nid)));
  // Refeições de hoje que estão só aqui (ainda não subiram)
  const salvas = ler("sl-refeicoes", null);
  // Só as de hoje e sem id do servidor
  const soAqui = salvas?.data === new Date().toDateString() ? salvas.itens.filter((r) => !ehUuid(r.id)) : [];
  // Fotos que ficam só neste aparelho
  const fotos = Object.fromEntries((salvas?.itens || []).filter((r) => r.foto).map((r) => [r.id, r.foto]));
  // Refeições de hoje e as que já estão no servidor
  if (guardarSeLivre("sl-refeicoes", { data: new Date().toDateString(), itens: dia.refeicoes.map((r) => ({ ...r, foto: fotos[r.id] || "" })).concat(soAqui) })) guardar("sl-nuvem-refeicoes", dia.refeicoes.map((r) => r.id));
  // Água de hoje
  guardarSeLivre("sl-agua", { data: new Date().toDateString(), ml: dia.aguaMl });
  // Avisos da academia
  guardarSeLivre("sl-avisos-admin", avisos);
}

// ---------- Empurrar (navegador -> servidor) ----------

// Fichas: cria, edita e apaga conforme a diferença com o último retrato
async function empurrarTreinos() {
  // Lista atual
  const lista = ler("sl-treinos", []);
  // Retrato do servidor
  const retrato = ler("sl-nuvem-treinos", {});
  // Novo retrato
  const novo = {};
  // Ids trocados (id do site -> id do servidor)
  const trocas = {};
  // Cada ficha
  for (const t of lista) {
    // Formato do servidor
    const corpo = treinoParaServidor(t);
    // Sem exercícios: não sobe
    if (!corpo.itens.length) continue;
    // Texto para comparar
    const texto = JSON.stringify(corpo);
    // Nova (id do site): cria
    if (!ehUuid(t.id)) {
      // Cria
      const criada = await api("POST", "/treinos", corpo);
      // Anota a troca de id
      trocas[t.id] = criada.id;
      // Retrato
      novo[criada.id] = texto;
    } else {
      // Mudou: edita
      if (retrato[t.id] !== undefined && retrato[t.id] !== texto) await api("PATCH", `/treinos/${t.id}`, corpo);
      // Retrato
      novo[t.id] = texto;
    }
  }
  // Fichas que sumiram: apaga no servidor
  for (const id of Object.keys(retrato)) if (!lista.some((t) => t.id === id)) await api("DELETE", `/treinos/${id}`).catch(() => {});
  // Guarda o retrato
  guardar("sl-nuvem-treinos", novo);
  // Teve troca de id: atualiza a lista, o treino em andamento e o histórico
  if (Object.keys(trocas).length) {
    // Lista
    guardar("sl-treinos", ler("sl-treinos", []).map((t) => (trocas[t.id] ? { ...t, id: trocas[t.id] } : t)));
    // Treino em andamento
    const atual = ler("sl-treino-atual", null);
    // Troca
    if (atual && trocas[atual.treinoId]) guardar("sl-treino-atual", { ...atual, treinoId: trocas[atual.treinoId] });
  }
}

// Histórico: sobe os treinos feitos que ainda não subiram
async function empurrarHistorico() {
  // Lista
  const lista = ler("sl-historico", []);
  // Mudou algo?
  let mudou = false;
  // Cada treino feito
  for (const h of lista) {
    // Já subiu ou é de exemplo: pula
    if (h.nid || h.demo) continue;
    // Sobe
    const s = await api("POST", "/sessoes", { treinoId: ehUuid(h.treinoId) ? h.treinoId : null, nome: h.nome, duracaoMin: h.duracao || 0, series: h.series || 0, volume: h.volume || 0, kcal: h.kcal || 0, esforco: h.esforco || null });
    // Marca
    h.nid = s.id;
    // Mudou
    mudou = true;
  }
  // Guarda as marcas
  if (mudou) guardar("sl-historico", lista);
}

// Refeições de hoje: cria as novas e apaga as removidas
async function empurrarRefeicoes() {
  // Refeições salvas
  const salvo = ler("sl-refeicoes", null);
  // Só as de hoje
  if (!salvo || salvo.data !== new Date().toDateString()) return;
  // Ids que estão no servidor
  const noServidor = ler("sl-nuvem-refeicoes", []);
  // Lista nova
  const itens = [];
  // Ids novos no servidor
  const ids = [];
  // Cada refeição
  for (const r of salvo.itens) {
    // Já está no servidor
    if (ehUuid(r.id) && noServidor.includes(r.id)) {
      // Mantém
      itens.push(r);
      // Anota
      ids.push(r.id);
      // Próxima
      continue;
    }
    // Cria
    const criada = await api("POST", "/refeicoes", { dia: hojeIso(), hora: r.hora, nome: r.nome, descricao: r.descricao || "", kcal: r.kcal || 0, proteina: r.proteina || 0, carbo: r.carbo || 0, gordura: r.gordura || 0 });
    // Troca o id (mantém a foto, que fica só no aparelho)
    itens.push({ ...r, id: criada.id });
    // Anota
    ids.push(criada.id);
  }
  // Removidas: apaga no servidor
  for (const id of noServidor) if (!ids.includes(id)) await api("DELETE", `/refeicoes/${id}`).catch(() => {});
  // Guarda
  guardar("sl-nuvem-refeicoes", ids);
  // Guarda a lista com os ids do servidor
  guardar("sl-refeicoes", { ...salvo, itens });
}

// Água de hoje
async function empurrarAgua() {
  // Água salva
  const a = ler("sl-agua", null);
  // Só a de hoje
  if (a && a.data === new Date().toDateString()) await api("PUT", `/agua/${hojeIso()}`, { ml: a.ml });
}

// Pesos: sobe o último que ainda não subiu
async function empurrarPesos() {
  // Lista
  const lista = ler("sl-pesos", []);
  // Últimos sem marca
  const novos = lista.filter((p) => !p.nid);
  // Nada
  if (!novos.length) return;
  // Sobe só o mais novo (o servidor guarda um por dia)
  await api("POST", "/pesos", { valorKg: novos[novos.length - 1].valor });
  // Marca todos
  guardar("sl-pesos", lista.map((p) => ({ ...p, nid: true })));
}

// Perfil e questionário
async function empurrarPerfil() {
  // Perfil
  const p = ler("sl-perfil", {});
  // Questionário
  const o = ler("sl-onboarding", null);
  // Altura válida
  const altura = Number(p.altura);
  // Manda
  await api("PATCH", "/me", { nome: p.nome || undefined, apelido: p.apelido ?? undefined, bio: p.bio ?? undefined, alturaCm: altura >= 120 && altura <= 230 ? altura : undefined, objetivo: o?.objetivo, nivel: o?.nivel, diasSemana: o ? Number(o.dias) : undefined });
}

// Pontos ganhos hoje no site (séries, água, proteína, recordes)
async function empurrarPontos() {
  // Já mandados
  const mandados = ler("sl-nuvem-pontos", []);
  // Começo de hoje
  const hoje = new Date().setHours(0, 0, 0, 0);
  // Novos de hoje
  const novos = ler("sl-pontos", []).filter((e) => PONTOS_DO_SITE.includes(e.tipo) && new Date(e.data) >= hoje && !mandados.includes(e.ref));
  // Cada um
  for (const e of novos) await api("POST", "/pontos", { tipo: e.tipo, ref: e.ref }).catch(() => {});
  // Anota (só os de hoje, para não crescer para sempre)
  if (novos.length) guardar("sl-nuvem-pontos", mandados.concat(novos.map((e) => e.ref)).slice(-300));
}

// Avisos do administrador: publica os novos e apaga os removidos
async function empurrarAvisos() {
  // Só administrador
  if (!admin()) return;
  // Lista
  const lista = ler("sl-avisos-admin", []);
  // No servidor
  const noServidor = ler("sl-nuvem-avisos", []);
  // Lista nova
  const nova = [];
  // Cada aviso
  for (const a of lista) {
    // Já está
    if (ehUuid(a.id) && noServidor.includes(a.id)) nova.push(a);
    // Novo: publica
    else nova.push(await api("POST", "/admin/avisos", { texto: a.texto }));
  }
  // Removidos: apaga
  for (const id of noServidor) if (!nova.some((a) => a.id === id)) await api("DELETE", `/admin/avisos/${id}`).catch(() => {});
  // Guarda
  guardar("sl-nuvem-avisos", nova.map((a) => a.id));
  // Guarda a lista com os ids do servidor
  guardar("sl-avisos-admin", nova);
}

// Assinatura: teste grátis e voltar para o Free
async function empurrarPlano() {
  // Plano no site
  const plano = ler("sl-plano", "Free");
  // Assinatura
  const a = ler("sl-assinatura", null);
  // Começou o teste
  if (a?.teste && plano === "Premium") await api("POST", "/assinaturas/teste").catch(() => {});
  // Voltou para o Free
  if (plano === "Free") await api("POST", "/assinaturas/cancelar").catch(() => {});
}

// Qual função sobe cada chave
const EMPURRAR = { "sl-treinos": empurrarTreinos, "sl-historico": empurrarHistorico, "sl-refeicoes": empurrarRefeicoes, "sl-agua": empurrarAgua, "sl-pesos": empurrarPesos, "sl-perfil": empurrarPerfil, "sl-onboarding": empurrarPerfil, "sl-pontos": empurrarPontos, "sl-avisos-admin": empurrarAvisos, "sl-plano": empurrarPlano };

// Fila: uma chave sobe de cada vez (evita criar a mesma coisa duas vezes)
let fila = Promise.resolve();

// Avisa a página que a sincronização falhou
const avisarErro = (e) => window.dispatchEvent(new CustomEvent("sl:toast", { detail: { texto: "Não deu para salvar no servidor: " + e.message } }));

// Liga a sincronização (uma vez por página)
let ligada = false;
// Liga
export function ligarSincronizacao() {
  // Sem API ou já ligada: nada
  if (!apiLigada() || ligada) return;
  // Marca
  ligada = true;
  // Escuta as mudanças salvas
  window.addEventListener(EVENTO_MUDOU, (e) => {
    // Chave que mudou
    const chave = e.detail;
    // Mudança feita por este módulo, sem função ou sem login: ignora
    if (!EMPURRAR[chave] || !logado()) return;
    // Anota que a pessoa mudou (o download não sobrescreve)
    mexidas.add(chave);
    // Junta mudanças seguidas
    clearTimeout(espera[chave]);
    // Daqui a pouco, entra na fila
    espera[chave] = setTimeout(() => {
      // Já não está esperando
      delete espera[chave];
      // Entra na fila
      fila = fila.then(() => EMPURRAR[chave]()).catch(avisarErro);
    }, 400);
  });
  // Saindo da página: manda na hora o que ainda estava esperando (as chamadas continuam depois de sair)
  window.addEventListener("pagehide", () => {
    // Cada chave esperando
    for (const chave of Object.keys(espera)) {
      // Cancela a espera
      clearTimeout(espera[chave]);
      // Manda já
      EMPURRAR[chave]().catch(() => {});
    }
  });
}

// Espera tudo que está na fila subir
export const esperarFila = () => fila;

// Ao abrir uma página do app: sobe o que ficou pendente e depois baixa o que está no servidor
export async function sincronizarAoAbrir() {
  // Sem API ou sem login: nada
  if (!apiLigada() || !logado()) return;
  // Tudo na fila (uma coisa de cada vez: não cria nada em dobro)
  const vez = fila.then(async () => {
    // Sobe o que ficou para trás (menos perfil e plano, que o servidor manda)
    for (const f of [empurrarTreinos, empurrarHistorico, empurrarRefeicoes, empurrarPesos, empurrarPontos, empurrarAvisos]) await f().catch(() => {});
    // Baixa
    await puxar();
  });
  // A fila continua mesmo se der erro
  fila = vez.catch(() => {});
  // Espera (o erro volta para quem chamou, ex.: login vencido)
  await vez;
}
