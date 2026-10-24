/*
 * Pontos, ranking, ligas e selos do Saúde Life.
 * Carrega depois do app.js e fica disponível em SL.pontos.
 *
 * Cada coisa que a pessoa faz vira um "evento" com pontos, salvo em sl-pontos.
 * O ranking soma os eventos da semana (ou do mês) e compara com os amigos,
 * que são simulados a partir de app/comum/dados.js (não há servidor).
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";
  // Se o núcleo do app não carregou (ex.: a pessoa foi mandada para o login), para aqui
  if (!window.SL) return;

  // Pega do núcleo: ler/salvar dados, criar elementos e desenhos SVG
  const { storage, el, svg } = SL;
  // Pega os amigos e as academias de exemplo
  const { AMIGOS, SUGESTOES, ACADEMIAS, HISTORICO_PADRAO } = window.SL_DADOS;
  // Quantos milissegundos tem um dia
  const DIA = 86400000;
  // Quantos milissegundos tem uma semana
  const SEMANA = 7 * DIA;

  // Quantos pontos vale cada coisa
  const TABELA = {
    // Cada série marcada como feita
    serie: 10,
    // Treino concluído
    treino: 50,
    // Registrar uma refeição (até 4 por dia)
    refeicao: 5,
    // Bater a meta de proteína do dia
    proteina: 15,
    // Bater a meta de água do dia
    agua: 10,
    // Treinar dois dias seguidos
    sequencia: 5,
    // Reservar uma aula da academia
    aula: 30,
    // Bater um recorde de carga
    recorde: 20,
    // Bater a meta de treinos da semana
    metaSemana: 100,
    // Noite de sono registrada com 7 horas ou mais
    sono: 10,
    // Missão do dia cumprida
    missao: 15,
  };

  // Nome de cada tipo de ponto, para mostrar no histórico
  const NOMES = {
    // Série feita
    serie: "Série feita",
    // Treino concluído
    treino: "Treino concluído",
    // Refeição registrada
    refeicao: "Refeição registrada",
    // Meta de proteína
    proteina: "Meta de proteína",
    // Meta de água
    agua: "Meta de água",
    // Sequência de dias
    sequencia: "Dia de sequência",
    // Aula reservada
    aula: "Aula reservada",
    // Recorde de carga
    recorde: "Recorde pessoal",
    // Meta da semana
    metaSemana: "Meta da semana",
    // Sono
    sono: "Noite bem dormida (7h+)",
    // Missão
    missao: "Missão do dia",
    // Treino dos dados de exemplo
    exemplo: "Treino (exemplo)",
  };

  // Máximo de pontos por dia (para ninguém trapacear)
  const LIMITE_DIA = 300;
  // Máximo de refeições que valem pontos por dia
  const LIMITE_REFEICOES = 4;
  // Pontos na semana para subir de liga
  const SOBE = 500;
  // Abaixo disso a pessoa cai de liga
  const DESCE = 150;
  // Bônus para iniciantes: +20% nas 4 primeiras semanas
  const BONUS_INICIANTE = 0.2;

  // As ligas, da mais baixa para a mais alta
  const LIGAS = [
    // Liga 0
    { id: "bronze", nome: "Bronze" },
    // Liga 1
    { id: "prata", nome: "Prata" },
    // Liga 2
    { id: "ouro", nome: "Ouro" },
    // Liga 3
    { id: "diamante", nome: "Diamante" },
    // Liga 4
    { id: "esmeralda", nome: "Esmeralda" },
    // Liga 5 (a mais alta)
    { id: "lenda", nome: "Lenda" },
  ];

  /* ---------- Datas ---------- */

  // Data em texto curto do dia (serve de "chave" do dia, ex.: "Tue Oct 21 2026")
  const diaDe = (data) => new Date(data).toDateString();
  // Começo da semana (segunda 00h) em milissegundos
  const semanaDe = (data) => SL.inicioDaSemana(data).getTime();
  // Começo da semana atual
  const semanaAtual = () => semanaDe(new Date());

  /* ---------- Eventos de pontos ---------- */

  // Lê os eventos salvos pela pessoa
  function salvos() {
    // Lista de { ref, tipo, pts, data }
    return storage.get("sl-pontos", []);
  }

  // Data em que a pessoa começou a ganhar pontos (para o bônus de iniciante)
  function inicio() {
    // Lê a data salva
    let data = storage.get("sl-pontos-inicio", null);
    // Se ainda não tem...
    if (!data) {
      // ...a data é hoje
      data = new Date().toISOString();
      // ...e fica salva
      storage.set("sl-pontos-inicio", data);
    }
    // Devolve a data
    return data;
  }

  // Eventos de exemplo: cada treino do histórico de demonstração vira pontos
  function exemplos() {
    // Data de hoje
    const hoje = new Date();
    // Para cada treino de exemplo...
    return HISTORICO_PADRAO.map((h) => {
      // ...calcula a data dele (X dias atrás, às 18h30, igual ao SL.historico)
      const data = new Date(hoje);
      // Volta os dias
      data.setDate(data.getDate() - h.diasAtras);
      // Às 18h30
      data.setHours(18, 30, 0, 0);
      // Pontos do treino + das séries, respeitando o limite do dia
      const pts = Math.min(LIMITE_DIA, TABELA.treino + h.series * TABELA.serie);
      // Devolve o evento marcado como exemplo
      return { ref: "exemplo:" + h.diasAtras, tipo: "exemplo", pts, data: data.toISOString(), exemplo: true };
    });
  }

  // Todos os eventos: os da pessoa + os de exemplo
  function eventos() {
    // Junta as duas listas
    return salvos().concat(exemplos());
  }

  // Soma os pontos de um período (de "ini" até "fim", em milissegundos)
  function somar(ini, fim) {
    // Para cada evento...
    return eventos().reduce((total, e) => {
      // ...pega a data em milissegundos
      const t = new Date(e.data).getTime();
      // ...e soma se estiver dentro do período
      return t >= ini && t < fim ? total + e.pts : total;
    }, 0);
  }

  // Pontos que a pessoa já ganhou hoje (só os de verdade)
  function pontosDeHoje() {
    // Chave do dia de hoje
    const hoje = diaDe(new Date());
    // Soma os eventos salvos de hoje
    return salvos().reduce((total, e) => (diaDe(e.data) === hoje ? total + e.pts : total), 0);
  }

  // Diz se a pessoa ainda ganha o bônus de iniciante
  function temBonus() {
    // Só vale para quem marcou "Iniciante" no questionário
    if (SL.onboarding().nivel !== "Iniciante") return false;
    // ...e só nas 4 primeiras semanas
    return Date.now() - new Date(inicio()).getTime() < 4 * SEMANA;
  }

  // Dá pontos por uma ação. "ref" é um nome único para não pontuar a mesma coisa duas vezes.
  // opcoes.origem = elemento de onde o "+10" sai voando
  function ganhar(tipo, ref, opcoes = {}) {
    // Lê os eventos salvos
    const lista = salvos();
    // Se essa ação já deu pontos, não dá de novo
    if (lista.some((e) => e.ref === ref)) return 0;
    // Pontos da tabela
    let pts = TABELA[tipo] || 0;
    // Bônus de iniciante (arredondado)
    if (temBonus()) pts = Math.round(pts * (1 + BONUS_INICIANTE));
    // Refeições: só as 4 primeiras do dia valem pontos
    if (tipo === "refeicao") {
      // Conta as refeições de hoje que já pontuaram
      const hoje = diaDe(new Date());
      // Se já chegou no limite, não ganha
      if (lista.filter((e) => e.tipo === "refeicao" && diaDe(e.data) === hoje).length >= LIMITE_REFEICOES) pts = 0;
    }
    // Respeita o limite de 300 pontos por dia
    pts = Math.max(0, Math.min(pts, LIMITE_DIA - pontosDeHoje()));
    // Se não sobrou nada, avisa uma vez e para
    if (!pts) {
      // Mostra o aviso só se foi por causa do limite do dia
      if (pontosDeHoje() >= LIMITE_DIA) SL.toast("Você bateu o limite de 300 pontos de hoje. Amanhã tem mais!");
      // Não ganhou nada
      return 0;
    }
    // Guarda o evento novo
    lista.push({ ref, tipo, pts, data: new Date().toISOString() });
    // Salva no navegador
    storage.set("sl-pontos", lista);
    // Mostra o "+10" voando
    voar(pts, opcoes.origem);
    // Vibraçãozinha ao ganhar pontos (se a pessoa deixou ligado no Perfil)
    // (só depois de a pessoa tocar na página: antes disso o navegador bloqueia)
    if (navigator.vibrate && storage.get("sl-pref-vibrar", true) && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(15);
    // Metas batidas e recordes ganham confete
    if (["metaSemana", "proteina", "agua", "recorde"].includes(tipo) && SL.confete) SL.confete();
    // Avisa a página que os pontos mudaram (para atualizar placares)
    document.dispatchEvent(new CustomEvent("sl:pontos"));
    // Devolve quantos pontos ganhou
    return pts;
  }

  // Tira os pontos de uma ação (ex.: desmarcou a série ou cancelou a aula)
  function perder(ref) {
    // Lê os eventos salvos
    const lista = salvos();
    // Tira o evento com essa ref
    const nova = lista.filter((e) => e.ref !== ref);
    // Se não mudou nada, para
    if (nova.length === lista.length) return;
    // Salva a lista sem o evento
    storage.set("sl-pontos", nova);
    // Avisa a página que os pontos mudaram
    document.dispatchEvent(new CustomEvent("sl:pontos"));
  }

  // Confere as metas depois de um treino: sequência e meta da semana
  function conferirTreino() {
    // Histórico de treinos (o mais novo primeiro)
    const lista = SL.historico();
    // Data de ontem
    const ontem = new Date();
    // Volta um dia
    ontem.setDate(ontem.getDate() - 1);
    // Se treinou ontem também, ganha o ponto de sequência
    if (lista.some((h) => diaDe(h.data) === diaDe(ontem))) ganhar("sequencia", "sequencia:" + diaDe(new Date()));
    // Números da semana
    const { nestaSemana, meta } = SL.estatisticas();
    // Se bateu a meta de treinos da semana, ganha o bônus
    if (nestaSemana >= meta) ganhar("metaSemana", "metaSemana:" + semanaAtual());
  }

  /* ---------- "+10" voando ---------- */

  // Lugar escondido que avisa os leitores de tela quando ganha pontos
  let avisoLeitor = null;

  // Mostra os pontos ganhos subindo e sumindo
  function voar(pts, origem) {
    // Cria o número "+10"
    const bolha = el("span", { class: "pontos-voando", "aria-hidden": "true", text: "+" + pts });
    // Se tem um elemento de origem...
    if (origem && origem.isConnected) {
      // ...pega a posição dele na tela
      const r = origem.getBoundingClientRect();
      // ...e coloca o número em cima dele
      bolha.style.left = r.left + r.width / 2 + "px";
      // (altura do meio do elemento)
      bolha.style.top = r.top + r.height / 2 + "px";
    }
    // Coloca o número na página
    document.body.append(bolha);
    // Some depois da animação
    setTimeout(() => bolha.remove(), 1300);
    // Cria o aviso para leitores de tela (uma vez só)
    if (!avisoLeitor) {
      // Texto escondido que é lido quando muda
      avisoLeitor = el("p", { class: "sr-only", role: "status", "aria-live": "polite" });
      // Coloca na página
      document.body.append(avisoLeitor);
    }
    // Escreve "Mais 10 pontos"
    avisoLeitor.textContent = `Mais ${pts} pontos`;
  }

  /* ---------- Amigos e academia (simulados) ---------- */

  // Número "aleatório" fixo entre 0 e 1 a partir de um texto (sempre dá o mesmo resultado)
  function sorteio(texto) {
    // Começa com um número grande
    let h = 2166136261;
    // Para cada letra do texto...
    for (const letra of texto) {
      // ...mistura o código da letra
      h ^= letra.charCodeAt(0);
      // ...e embaralha
      h = Math.imul(h, 16777619);
    }
    // Transforma em um número entre 0 e 1
    return ((h >>> 0) % 1000) / 1000;
  }

  // Ritmo de um aluno da academia que não é amigo (entre 200 e 900 pontos por semana)
  const ritmoDe = (nome) => 200 + Math.round(sorteio(nome) * 700);

  // Pontos de uma pessoa simulada num período
  function pontosSimulados(pessoa, ini, fim) {
    // Não conta o futuro
    const ate = Math.min(fim, Date.now());
    // Total
    let total = 0;
    // Passa semana por semana dentro do período
    for (let s = semanaDe(ini); s < ate; s += SEMANA) {
      // Pontos da semana inteira (o ritmo da pessoa, variando entre 60% e 140%)
      const daSemana = pessoa.ritmo * (0.6 + sorteio(pessoa.nome + s) * 0.8);
      // Parte da semana que está dentro do período
      const dentro = Math.max(0, Math.min(ate, s + SEMANA) - Math.max(ini, s)) / SEMANA;
      // Soma a parte proporcional
      total += daSemana * dentro;
    }
    // Arredonda de 5 em 5
    return Math.round(total / 5) * 5;
  }

  // Liga de uma pessoa simulada, pelo ritmo dela
  function ligaSimulada(ritmo) {
    // Do ritmo mais alto (Lenda) ao mais baixo (Bronze)
    return ritmo >= 860 ? 5 : ritmo >= 780 ? 4 : ritmo >= 680 ? 3 : ritmo >= 500 ? 2 : ritmo >= 300 ? 1 : 0;
  }

  // Todas as pessoas que existem no app (amigos de exemplo + sugestões)
  const PESSOAS = AMIGOS.concat(SUGESTOES);
  // Nomes das pessoas do ranking "mesmo nível" (simuladas)
  const NOMES_NIVEL = ["Bruna Teixeira", "Caio Mendes", "Fernanda Lopes", "Gustavo Reis", "Helena Prado", "Igor Santana", "Jéssica Moura", "Lucas Farias", "Paula Ribeiro"];

  // Amigos que a pessoa tem agora (no começo, os amigos de exemplo)
  function amigos() {
    // Lê os códigos dos amigos salvos (ou os de exemplo)
    const codigos = storage.get("sl-amigos", AMIGOS.map((a) => a.codigo));
    // Devolve as pessoas com esses códigos
    return PESSOAS.filter((p) => codigos.includes(p.codigo));
  }

  // Adiciona um amigo pelo código
  function adicionarAmigo(codigo) {
    // Códigos atuais
    const codigos = amigos().map((a) => a.codigo);
    // Se já é amigo ou não existe, não faz nada
    if (codigos.includes(codigo) || !PESSOAS.some((p) => p.codigo === codigo)) return false;
    // Salva com o novo código
    storage.set("sl-amigos", codigos.concat(codigo));
    // Avisa a página
    document.dispatchEvent(new CustomEvent("sl:pontos"));
    // Deu certo
    return true;
  }

  // Remove um amigo pelo código
  function removerAmigo(codigo) {
    // Salva a lista sem esse código
    storage.set("sl-amigos", amigos().map((a) => a.codigo).filter((c) => c !== codigo));
    // Avisa a página
    document.dispatchEvent(new CustomEvent("sl:pontos"));
  }

  // Academia escolhida pela pessoa (ou nenhuma)
  function minhaAcademia() {
    // Lê o id salvo
    const id = storage.get("sl-academia", null);
    // Acha a academia com esse id
    return ACADEMIAS.find((a) => a.id === id) || null;
  }

  // Escolhe (ou tira, com null) a academia da pessoa
  function escolherAcademia(id) {
    // Salva o id
    storage.set("sl-academia", id);
    // Avisa a página
    document.dispatchEvent(new CustomEvent("sl:pontos"));
  }

  /* ---------- Ranking ---------- */

  // Começo e fim de um período: "semana" ou "mes" (com deslocamento: -1 = anterior)
  function periodo(tipo, deslocamento = 0) {
    // Semana: de segunda a segunda
    if (tipo === "semana") {
      // Começo da semana pedida
      const ini = semanaAtual() + deslocamento * SEMANA;
      // Devolve começo e fim
      return { ini, fim: ini + SEMANA };
    }
    // Mês: do dia 1 até o dia 1 do mês seguinte
    const hoje = new Date();
    // Dia 1 do mês pedido
    const ini = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento, 1).getTime();
    // Dia 1 do mês seguinte
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento + 1, 1).getTime();
    // Devolve começo e fim
    return { ini, fim };
  }

  // Monta o ranking. escopo = "amigos" ou "academia"; tipo = "semana" ou "mes"
  function ranking(escopo = "amigos", tipo = "semana", deslocamento = 0) {
    // Começo e fim do período
    const { ini, fim } = periodo(tipo, deslocamento);
    // Dados da pessoa logada
    const usuario = SL.getUsuario();
    // Pessoas que entram no ranking
    let pessoas;
    // Ranking da academia: amigos da mesma academia + outros alunos
    if (escopo === "academia") {
      // Academia da pessoa
      const academia = minhaAcademia();
      // Sem academia, não tem ranking da academia
      if (!academia) return [];
      // Amigos que treinam nessa academia
      const daAcademia = PESSOAS.filter((a) => a.academia === academia.id);
      // Outros alunos da academia
      const outros = academia.membros.filter((nome) => !daAcademia.some((a) => a.nome === nome)).map((nome) => ({ nome, ritmo: ritmoDe(nome) }));
      // Junta todos
      pessoas = daAcademia.concat(outros);
    } else if (escopo === "nivel") {
      // Ranking do mesmo nível: pessoas do app no mesmo nível (iniciante contra iniciante...)
      const nivel = SL.onboarding().nivel || "Iniciante";
      // Faixa de ritmo de cada nível (pontos por semana)
      const [minimo, faixa] = { Iniciante: [150, 300], "Intermediário": [300, 400], "Avançado": [500, 400] }[nivel] || [150, 300];
      // 9 pessoas simuladas desse nível
      pessoas = NOMES_NIVEL.map((nome) => ({ nome, ritmo: minimo + Math.round(sorteio(nome + nivel) * faixa) }));
    } else {
      // Ranking dos amigos
      pessoas = amigos();
    }
    // Calcula os pontos de cada pessoa simulada
    const lista = pessoas.map((p) => ({ nome: p.nome, pts: pontosSimulados(p, ini, fim), liga: ligaSimulada(p.ritmo), eu: false }));
    // Coloca a pessoa logada
    lista.push({ nome: usuario.nome, pts: somar(ini, fim), liga: liga().atual, eu: true });
    // Ordena do maior para o menor (empate: a pessoa logada fica na frente)
    lista.sort((a, b) => b.pts - a.pts || (b.eu ? 1 : 0) - (a.eu ? 1 : 0));
    // Coloca a posição de cada um
    return lista.map((p, i) => ({ ...p, posicao: i + 1 }));
  }

  // Posição da pessoa logada num ranking
  function minhaPosicao(escopo = "amigos", tipo = "semana") {
    // Acha a pessoa logada na lista
    const eu = ranking(escopo, tipo).find((p) => p.eu);
    // Devolve a posição e o total de pessoas
    return eu ? { posicao: eu.posicao, total: ranking(escopo, tipo).length } : null;
  }

  /* ---------- Ligas ---------- */

  // Estado da liga da pessoa, atualizado até a semana atual
  function liga() {
    // Lê o estado salvo
    let estado = storage.get("sl-liga", null);
    // Primeira vez: começa no Bronze, avaliando as 2 semanas de exemplo anteriores
    if (!estado) estado = { atual: 0, avaliada: semanaAtual() - 2 * SEMANA, mudancas: [] };
    // Para cada semana que já terminou e ainda não foi avaliada...
    while (estado.avaliada < semanaAtual()) {
      // ...soma os pontos daquela semana
      const pts = somar(estado.avaliada, estado.avaliada + SEMANA);
      // Liga antes da avaliação
      const antes = estado.atual;
      // Fez 500 ou mais: sobe (se não estiver no topo)
      if (pts >= SOBE && estado.atual < LIGAS.length - 1) estado.atual++;
      // Fez menos de 150: desce (se não estiver no Bronze)
      else if (pts < DESCE && estado.atual > 0) estado.atual--;
      // Se mudou, guarda a mudança no histórico
      if (estado.atual !== antes) estado.mudancas.unshift({ semana: estado.avaliada, de: antes, para: estado.atual, pts });
      // Passa para a semana seguinte
      estado.avaliada += SEMANA;
    }
    // Salva o estado
    storage.set("sl-liga", estado);
    // Devolve
    return estado;
  }

  // Situação da semana atual em relação à liga (para mostrar "faltam X pontos")
  function situacaoDaLiga() {
    // Pontos da semana
    const pts = somar(semanaAtual(), semanaAtual() + SEMANA);
    // Liga atual
    const atual = liga().atual;
    // Devolve tudo o que a tela precisa
    return {
      // Pontos da semana
      pts,
      // Liga atual
      atual,
      // Quanto falta para subir
      faltaSubir: Math.max(0, SOBE - pts),
      // Quanto falta para não cair
      faltaManter: Math.max(0, DESCE - pts),
      // Está no topo?
      noTopo: atual === LIGAS.length - 1,
      // Dias até a semana zerar
      diasParaZerar: Math.ceil((semanaAtual() + SEMANA - Date.now()) / DIA),
    };
  }

  /* ---------- Selos com níveis (bronze, prata e ouro) ---------- */

  // Nomes dos níveis dos selos
  const NIVEIS_SELO = ["Bronze", "Prata", "Ouro"];

  // Selos: cada um tem 3 níveis. [id, nome, texto com {n}, metas dos 3 níveis, função que conta o progresso]
  function basesDeSelos() {
    // Eventos de pontos salvos
    const lista = salvos();
    // Quantos eventos de um tipo
    const conta = (tipo) => lista.filter((e) => e.tipo === tipo).length;
    // Em quantos dias diferentes um tipo aconteceu
    const dias = (tipo) => new Set(lista.filter((e) => e.tipo === tipo).map((e) => diaDe(e.data))).size;
    // Histórico de treinos
    const hist = SL.historico();
    // Estado da liga
    const estadoLiga = liga();
    // Maior liga já alcançada
    const maiorLiga = Math.max(estadoLiga.atual, ...estadoLiga.mudancas.map((m) => m.para));
    // Total de pontos já ganhos
    const totalPts = lista.reduce((t, e) => t + e.pts, 0);
    // Km de corrida e caminhada
    const km = storage.get("sl-corridas", []).reduce((t, c) => t + c.km, 0);
    // Semanas no pódio (últimas 8)
    let podios = 0;
    // Volta 8 semanas
    for (let d = -1; d >= -8; d--) if ((ranking("amigos", "semana", d).find((p) => p.eu) || {}).posicao <= 3) podios++;
    // Meses como campeão (últimos 6)
    let campeao = 0;
    // Volta 6 meses
    for (let d = -1; d >= -6; d--) if ((ranking("amigos", "mes", d).find((p) => p.eu) || {}).posicao === 1) campeao++;
    // Duelos vencidos
    const vencidos = duelos().filter((x) => x.fim < Date.now() && placar(x).eu > placar(x).ele).length;
    // Lista dos selos
    return [
      // Treinos concluídos
      ["treinos", "Treinador", "Concluir {n} treinos", [10, 50, 150], hist.length],
      // Séries marcadas
      ["series", "Série a série", "Marcar {n} séries", [100, 500, 2000], conta("serie")],
      // Semanas seguidas
      ["sequencia", "Constância", "Treinar {n} semanas seguidas", [2, 4, 12], SL.estatisticas().sequencia],
      // Meta de água
      ["agua", "Hidratado", "Bater a meta de água em {n} dias", [7, 30, 100], dias("agua")],
      // Refeições
      ["prato", "Prato completo", "Registrar refeições em {n} dias", [7, 30, 100], dias("refeicao")],
      // Proteína
      ["proteina", "Proteína em dia", "Bater a meta de proteína em {n} dias", [7, 30, 100], dias("proteina")],
      // Recordes
      ["recorde", "Quebra-recorde", "Bater {n} recordes de carga", [1, 5, 20], conta("recorde")],
      // Pódio
      ["podio", "Pódio", "Terminar {n} semanas no top 3 dos amigos", [1, 3, 6], podios],
      // Campeão
      ["campeao", "Campeão do mês", "Ser o 1º dos amigos em {n} meses", [1, 2, 4], campeao],
      // Ligas
      ["liga", "Escalada", "Chegar à liga {n}", [2, 3, 5], maiorLiga],
      // Pontos
      ["pontos", "Pontuador", "Somar {n} pontos", [1000, 10000, 50000], totalPts],
      // Aulas
      ["aula", "Turma", "Reservar {n} aulas", [1, 10, 30], conta("aula")],
      // Sono
      ["sono", "Bom de cama", "Dormir 7h ou mais em {n} noites", [7, 30, 100], conta("sono")],
      // Corrida
      ["corrida", "Corredor", "Correr ou caminhar {n} km", [10, 100, 500], Math.floor(km)],
      // Madrugador
      ["manha", "Madrugador", "Treinar antes das 8h {n} vezes", [5, 20, 50], hist.filter((h) => new Date(h.data).getHours() < 8).length],
      // Fim de semana
      ["fds", "Fim de semana ativo", "Treinar no sábado ou domingo {n} vezes", [5, 20, 50], hist.filter((h) => [0, 6].includes(new Date(h.data).getDay())).length],
      // Missões
      ["missoes", "Missão dada", "Cumprir {n} missões do dia", [10, 50, 200], conta("missao")],
      // Duelos
      ["duelos", "Duelista", "Vencer {n} duelos", [1, 5, 15], vencidos],
      // Amigos
      ["amigos", "Turma grande", "Ter {n} amigos no app", [3, 10, 20], amigos().length],
    ];
  }

  // Lista de selos com "feito" verdadeiro ou falso (um item por nível: 19 selos × 3 níveis)
  function selos() {
    // Para cada selo base...
    return basesDeSelos().flatMap(([id, nome, texto, metas, progresso]) =>
      // ...um item por nível
      metas.map((meta, n) => ({
        // id (ex.: "treinos-0")
        id: `${id}-${n}`,
        // selo base
        base: id,
        // nível (0 = bronze, 1 = prata, 2 = ouro)
        nivel: n,
        // nome com o nível
        nome: `${nome} ${NIVEIS_SELO[n]}`,
        // como ganhar (a liga aparece pelo nome)
        texto: texto.replace("{n}", id === "liga" ? LIGAS[meta].nome : SL.num(meta)),
        // conquistado?
        feito: progresso >= meta,
        // progresso atual e meta (para a barrinha)
        progresso,
        // meta
        meta,
      })),
    );
  }

  /* ---------- Missões do dia ---------- */

  // Missões possíveis: [id, texto, função que diz se foi cumprida hoje]
  function missoesPossiveis() {
    // Hoje
    const hoje = diaDe(new Date());
    // Eventos de hoje
    const deHoje = salvos().filter((e) => diaDe(e.data) === hoje);
    // Quantos eventos de um tipo hoje
    const hojeTipo = (tipo) => deHoje.filter((e) => e.tipo === tipo).length;
    // Lista
    return [
      // Refeições
      ["refeicoes", "Registre 3 refeições", hojeTipo("refeicao") >= 3],
      // Água
      ["agua", "Bata a meta de água", hojeTipo("agua") >= 1],
      // Séries
      ["series", "Faça 12 séries", hojeTipo("serie") >= 12],
      // Treino
      ["treino", "Conclua um treino", hojeTipo("treino") >= 1],
      // Sono
      ["sono", "Registre como dormiu", storage.get("sl-sono", []).some((n) => diaDe(n.data) === hoje)],
      // Proteína
      ["proteina", "Bata a meta de proteína", hojeTipo("proteina") >= 1],
      // Humor
      ["humor", "Conte como você está hoje (Saúde)", Boolean(storage.get("sl-humor", {})[hoje])],
      // Corrida
      ["corrida", "Faça uma corrida ou caminhada", storage.get("sl-corridas", []).some((c) => diaDe(c.data) === hoje)],
    ];
  }

  // As 3 missões de hoje (sempre as mesmas no mesmo dia)
  function missoes() {
    // Todas
    const todas = missoesPossiveis();
    // Embaralha de um jeito fixo pelo dia e pega 3
    return todas
      .map((m) => [sorteio(m[0] + diaDe(new Date())), m])
      .sort((a, b) => a[0] - b[0])
      .slice(0, 3)
      .map(([, [id, texto, feita]]) => ({ id, texto, feita }));
  }

  // Dá os pontos das missões cumpridas (cada uma uma vez por dia)
  function conferirMissoes() {
    // Para cada missão cumprida de hoje, ganha os pontos (o "ganhar" não repete)
    missoes().forEach((m) => m.feita && ganhar("missao", `missao:${m.id}:${diaDe(new Date())}`));
  }

  /* ---------- Sequência de dias com escudo ---------- */

  // Dias seguidos treinando. O escudo perdoa 1 dia sem treino por semana.
  function diasSeguidos() {
    // Dias com treino
    const comTreino = new Set(SL.historico().map((h) => diaDe(h.data)));
    // Contagem
    let dias = 0;
    // Semanas em que o escudo já foi usado
    const escudos = new Set();
    // Começa hoje (se ainda não treinou hoje, começa de ontem sem quebrar)
    const d = new Date();
    // Se não treinou hoje, olha a partir de ontem
    if (!comTreino.has(diaDe(d))) d.setDate(d.getDate() - 1);
    // Volta dia a dia (até 1 ano)
    for (let i = 0; i < 365; i++) {
      // Semana desse dia
      const semana = semanaDe(d);
      // Treinou: conta
      if (comTreino.has(diaDe(d))) dias++;
      // Não treinou, mas o escudo desta semana está livre: usa e segue
      else if (!escudos.has(semana)) escudos.add(semana);
      // Não treinou e já usou o escudo: acabou a sequência
      else break;
      // Dia anterior
      d.setDate(d.getDate() - 1);
    }
    // Devolve os dias e se o escudo desta semana ainda está livre
    return { dias, escudoLivre: !escudos.has(semanaAtual()) };
  }

  /* ---------- Temporada do mês ---------- */

  // Nome da temporada de cada mês
  const TEMPORADAS = ["Janeiro: Volta por Cima", "Fevereiro: Pique de Carnaval", "Março: Força Total", "Abril: Outono Ativo", "Maio: Ritmo Forte", "Junho: Arraiá Fitness", "Julho: Férias em Movimento", "Agosto: Agosto Imparável", "Setembro: Primavera Fit", "Outubro: Outubro em Movimento", "Novembro: Reta Final", "Dezembro: Fecha o Ano"];

  // Temporada atual: nome, dias que faltam e posição no mês
  function temporada() {
    // Fim do mês
    const { fim } = periodo("mes");
    // Minha posição no mês entre os amigos
    const pos = minhaPosicao("amigos", "mes");
    // Devolve
    return { nome: TEMPORADAS[new Date().getMonth()], diasRestantes: Math.ceil((fim - Date.now()) / DIA), posicao: pos ? pos.posicao : null };
  }

  /* ---------- Duelos 1 contra 1 ---------- */

  // Duelos salvos: [{ codigo, inicio, fim }]
  const duelos = () => storage.get("sl-duelos", []);

  // Placar de um duelo: meus pontos e os do amigo no período
  function placar(d) {
    // Amigo
    const amigo = PESSOAS.find((p) => p.codigo === d.codigo) || { nome: "Amigo", ritmo: 400 };
    // Placar
    return { eu: somar(d.inicio, d.fim), ele: pontosSimulados(amigo, d.inicio, d.fim), amigo };
  }

  // Começa um duelo de 7 dias com um amigo
  function criarDuelo(codigo) {
    // Já tem duelo aberto com ele?
    if (duelos().some((d) => d.codigo === codigo && d.fim > Date.now())) return false;
    // Agora
    const agora = Date.now();
    // Salva o duelo novo
    storage.set("sl-duelos", [{ codigo, inicio: agora, fim: agora + SEMANA }].concat(duelos()));
    // Deu certo
    return true;
  }

  /* ---------- Moedas (para a Loja do Pulso) ---------- */

  // Moedas: todos os pontos já ganhos menos o que já foi gasto na loja (o ranking não muda)
  function moedas() {
    // Total ganho
    const ganho = salvos().reduce((t, e) => t + e.pts, 0);
    // Gasto
    const gasto = storage.get("sl-loja", { gasto: 0 }).gasto || 0;
    // Saldo
    return Math.max(0, ganho - gasto);
  }

  /* ---------- Desenhos ---------- */

  // Escudo da liga em SVG (a cor vem da classe liga-bronze, liga-prata...)
  function escudo(indice, classe = "liga-escudo") {
    // Cria o desenho
    const s = svg("svg", { viewBox: "0 0 48 56", class: `${classe} liga-${LIGAS[indice].id}`, "aria-hidden": "true" });
    // Contorno do escudo
    s.append(svg("path", { d: "M24 3 5 10v15c0 13 8.5 23.5 19 28 10.5-4.5 19-15 19-28V10Z", class: "liga-escudo-fundo" }));
    // Brilho por dentro
    s.append(svg("path", { d: "M24 10 11 15v10c0 9 5.8 16.6 13 20 7.2-3.4 13-11 13-20V15Z", class: "liga-escudo-miolo" }));
    // Estrelinhas: uma por nível da liga (Bronze 1, Prata 2...)
    for (let i = 0; i <= indice; i++) {
      // Posição de cada estrela, centralizada
      const x = 24 + (i - indice / 2) * 7;
      // Estrela pequena
      s.append(svg("circle", { cx: x, cy: 29, r: 2.4, class: "liga-escudo-estrela" }));
    }
    // Devolve o desenho
    return s;
  }

  // Anel de progresso em SVG (igual ao da logo), com o número no meio
  function anel(pct, texto, legenda) {
    // Caixa do anel
    const caixa = el("div", { class: "pontos-anel", role: "img", "aria-label": `${texto} ${legenda}` });
    // Desenho
    const s = svg("svg", { viewBox: "0 0 120 120", "aria-hidden": "true" });
    // Tamanho da volta do anel
    const volta = 2 * Math.PI * 52;
    // Círculo de fundo
    s.append(svg("circle", { cx: 60, cy: 60, r: 52, class: "pontos-anel-fundo" }));
    // Círculo colorido, preenchido conforme a porcentagem
    s.append(svg("circle", { cx: 60, cy: 60, r: 52, class: "pontos-anel-cor", "stroke-dasharray": volta, "stroke-dashoffset": volta * (1 - Math.min(1, pct)) }));
    // Coloca o desenho na caixa
    caixa.append(s);
    // Número e legenda no meio
    caixa.append(el("span", { class: "pontos-anel-texto", "aria-hidden": "true" }, [el("strong", { text: texto }), el("small", { text: legenda })]));
    // Devolve
    return caixa;
  }

  // Confere as missões do dia sempre que ganha pontos (o "ganhar" não repete a mesma missão)
  document.addEventListener("sl:pontos", () => setTimeout(conferirMissoes, 0));

  // Quando a página abre, avisa se a pessoa mudou de liga desde a última visita
  document.addEventListener("DOMContentLoaded", () => {
    // Confere as missões do dia (sono e humor não dão pontos sozinhos)
    setTimeout(conferirMissoes, 500);
    // Estado da liga (já avaliado até esta semana)
    const estado = liga();
    // Quantas mudanças a pessoa já viu
    const vistas = storage.get("sl-liga-vistas", 0);
    // Se tem mudança nova...
    if (estado.mudancas.length > vistas) {
      // ...a mais recente
      const m = estado.mudancas[0];
      // ...subiu: confete e parabéns
      if (m.para > m.de) {
        // Confete
        if (SL.confete) SL.confete();
        // Aviso
        SL.toast(`Você subiu para a liga ${LIGAS[m.para].nome}!`);
      } else {
        // ...desceu: aviso de força
        SL.toast(`Você caiu para a liga ${LIGAS[m.para].nome}. Bora recuperar essa semana!`);
      }
      // Marca que já viu
      storage.set("sl-liga-vistas", estado.mudancas.length);
    }
  });

  // Deixa tudo disponível para as páginas em SL.pontos
  SL.pontos = {
    TABELA, NOMES, LIGAS, SOBE, DESCE, LIMITE_DIA, LIMITE_REFEICOES, BONUS_INICIANTE,
    ganhar, perder, conferirTreino, eventos, somar, periodo,
    ranking, minhaPosicao, liga, situacaoDaLiga, selos,
    minhaAcademia, escolherAcademia, temBonus,
    PESSOAS, amigos, adicionarAmigo, removerAmigo, pontosSimulados, sorteio, ligaSimulada,
    escudo, anel, semanaAtual, diaDe,
    NIVEIS_SELO, missoes, conferirMissoes, diasSeguidos, temporada, duelos, placar, criarDuelo, moedas,
  };
})();
