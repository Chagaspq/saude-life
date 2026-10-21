/*
 * Núcleo do app, comum a todas as páginas de app/:
 * helpers, sessão do usuário, sidebar, menu mobile, modal, toast,
 * busca e as ações que aparecem em mais de uma página.
 *
 * Cada página fica na própria pasta (app/<nome>/<nome>.html, .css e .js)
 * e carrega, nesta ordem:
 *   ../../shared/planos.js (só Planos) → ../comum/dados.js → ../comum/app.js → <nome>.js
 * e se registra com SL.pagina(function () { ... }).
 */
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Lista de todas as páginas do app
  const PAGINAS = [
    "inicio", "descobrir", "treinos", "aulas", "alimentacao", "evolucao",
    "profissionais", "planos", "salvos", "academia", "perfil", "treino", "comecar", "ranking", "comunidade",
  ];

  /* ============================================
     GUARDA DE SESSÃO
     ============================================ */

  // Qual página está aberta (vem do data-pagina do body)
  const paginaAtual = document.body.dataset.pagina || "inicio";

  // Lê quem está logado
  function lerSessao() {
    // Tenta...
    try {
      // ...ler a sessão salva no login
      return JSON.parse(localStorage.getItem("sl-sessao") || "null");
    // Se der erro...
    } catch (e) {
      // ...diz que ninguém está logado
      return null;
    }
  }

  // Sem login, volta para o login e lembra qual página a pessoa queria abrir
  // Se ninguém está logado...
  if (!lerSessao()) {
    // ...vai para o login, lembrando a página que a pessoa queria
    window.location.replace("../../login/login.html?voltar=" + encodeURIComponent(paginaAtual));
    // ...e para tudo
    return;
  }

  // Primeiro acesso: antes do app, 3 perguntas rápidas para personalizar o Início
  // Diz se a pessoa já respondeu o questionário
  let onboardingFeito = false;
  // Tenta...
  try {
    // ...ver se as respostas estão salvas
    onboardingFeito = Boolean(localStorage.getItem("sl-onboarding"));
  // Se der erro...
  } catch (e) {
    onboardingFeito = true; // sem armazenamento, não prende a pessoa no questionário
  }
  // Se não respondeu e não está no questionário...
  if (!onboardingFeito && paginaAtual !== "comecar") {
    // ...vai para o questionário
    window.location.replace("../comecar/comecar.html");
    // ...e para tudo
    return;
  }

  /* ============================================
     HELPERS
     ============================================ */

  // Cria elementos com segurança (texto sempre via textContent)
  // Cria um elemento HTML: el(tag, atributos, filhos)
  function el(tag, attrs = {}, children = []) {
    // Cria a tag
    const node = document.createElement(tag);
    // Para cada atributo...
    Object.entries(attrs).forEach(([key, value]) => {
      // ...ignora os vazios ou falsos
      if (value === false || value == null) return;
      // "class" vira a classe
      if (key === "class") node.className = value;
      // "text" vira o texto
      else if (key === "text") node.textContent = value;
      // Os outros viram atributos normais (true vira atributo sem valor)
      else node.setAttribute(key, value === true ? "" : value);
    });
    // Para cada filho...
    [].concat(children).forEach((child) => {
      // ...ignora os vazios
      if (child == null || child === "") return;
      // ...texto vira nó de texto; elemento entra direto
      node.append(typeof child === "string" ? document.createTextNode(child) : child);
    });
    // Devolve o elemento pronto
    return node;
  }

  // Endereço oficial do SVG (desenhos precisam dele)
  const SVG_NS = "http://www.w3.org/2000/svg";
  // Cria um elemento de desenho SVG
  function svg(tag, attrs = {}) {
    // Cria a tag de desenho
    const node = document.createElementNS(SVG_NS, tag);
    // Coloca todos os atributos
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    // Devolve o desenho
    return node;
  }

  // Ícone de traço (mesmo estilo dos ícones do HTML)
  // Cria um ícone a partir dos traços (caminhos)
  function icone(caminhos, classe = "icon") {
    // Desenho de 24x24, escondido dos leitores de tela
    const node = svg("svg", { viewBox: "0 0 24 24", class: classe, "aria-hidden": "true" });
    // Um traço para cada caminho
    caminhos.forEach((d) => node.append(svg("path", { d })));
    // Devolve o ícone
    return node;
  }

  // Atalhos para ler e salvar dados no navegador (localStorage)
  const storage = {
    // Lê uma chave (ou devolve o padrão)
    get(key, fallback) {
      // Tenta...
      try {
        // ...ler o texto salvo
        const raw = localStorage.getItem(key);
        // ...e transformar de volta em dado (ou usar o padrão)
        return raw ? JSON.parse(raw) : fallback;
      // Se der erro...
      } catch (e) {
        // ...usa o padrão
        return fallback;
      }
    },
    // Salva uma chave
    set(key, value) {
      // Tenta...
      try {
        // ...transformar o dado em texto e salvar
        localStorage.setItem(key, JSON.stringify(value));
      // Se der erro...
      } catch (e) {
        /* armazenamento indisponível */
      }
    },
    // Apaga uma chave
    remove(key) {
      // Tenta...
      try {
        // ...apagar
        localStorage.removeItem(key);
      // Se der erro...
      } catch (e) {
        /* armazenamento indisponível */
      }
    },
  };

  // Pega as iniciais do nome (ex.: Biel Silva vira BS)
  function initials(nome) {
    // Separa o nome em partes
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    // Se não tem nome, mostra ?
    if (!partes.length) return "?";
    // Primeira letra do primeiro nome
    const primeira = partes[0][0];
    // Primeira letra do último nome (se tiver)
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    // Junta em maiúsculas
    return (primeira + ultima).toUpperCase();
  }

  // Transforma um texto em "slug" (ex.: Yoga & Mobilidade vira yoga_mobilidade)
  function slug(texto) {
    // Pega o texto...
    return texto
      // ...separa os acentos das letras
      .normalize("NFD")
      // ...tira os acentos
      .replace(/[̀-ͯ]/g, "")
      // ...deixa em minúsculas
      .toLowerCase()
      // ...troca o que não é letra/número por _
      .replace(/[^a-z0-9]+/g, "_")
      // ...e tira _ das pontas
      .replace(/^_|_$/g, "");
  }

  // Estrela da nota (SVG, sem emoji)
  // Cria a nota com estrelinha
  function nota(valor) {
    // Desenho da estrela
    const estrela = svg("svg", { viewBox: "0 0 24 24", class: "icon-star", "aria-hidden": "true" });
    // Forma da estrela
    estrela.append(svg("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }));
    // Devolve "Nota" (só para leitores de tela) + estrela + número
    return el("span", { class: "rating" }, [el("span", { class: "sr-only", text: "Nota " }), estrela, " " + valor.toFixed(1)]);
  }

  // Números e datas sempre no formato brasileiro (79,6 kg; 2,5 L)
  // Escreve um número no formato brasileiro (com vírgula)
  function num(valor, casas = 0) {
    // Usa as casas decimais pedidas
    return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }

  // Devolve a data no começo do dia (meia-noite)
  function inicioDoDia(data) {
    // Copia a data
    const d = new Date(data);
    // Zera horas, minutos e segundos
    d.setHours(0, 0, 0, 0);
    // Devolve
    return d;
  }

  // Conta quantos dias tem entre duas datas
  function diasEntre(a, b) {
    // Diferença em milissegundos dividida pelos ms de um dia
    return Math.round((inicioDoDia(b) - inicioDoDia(a)) / 86400000);
  }

  // Escreve a data de um jeito amigável (Hoje, Ontem, Há 3 dias...)
  function dataRelativa(iso) {
    // Sem data: "Nunca"
    if (!iso) return "Nunca";
    // Quantos dias atrás
    const dias = diasEntre(iso, new Date());
    // Hoje
    if (dias <= 0) return "Hoje";
    // Ontem
    if (dias === 1) return "Ontem";
    // Menos de uma semana
    if (dias < 7) return `Há ${dias} dias`;
    // Quantas semanas
    const semanas = Math.floor(dias / 7);
    // Menos de 5 semanas
    if (semanas < 5) return semanas === 1 ? "Há 1 semana" : `Há ${semanas} semanas`;
    // Mais que isso: mostra a data (ex.: 5 de out.)
    return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  }

  // Escreve minutos como tempo (ex.: 52 min ou 1h 05m)
  function duracaoTexto(minutos) {
    // Horas
    const h = Math.floor(minutos / 60);
    // Minutos que sobram
    const m = Math.round(minutos % 60);
    // Sem horas: só minutos
    if (!h) return `${m} min`;
    // Com horas: horas e minutos (ou só horas)
    return m ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
  }

  // Ícone grande de cada categoria (capa dos cards de treino)
  // Ícone de cada categoria de treino
  const ICONES_CATEGORIA = {
    // Hipertrofia: haltere
    hipertrofia: ["M6 5v14", "M18 5v14", "M3 8v8", "M21 8v8", "M6 12h12"],
    // HIIT: raio
    hiit: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
    // Yoga: folha
    yoga_mobilidade: [
      "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
      "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    ],
    // Resistência: coração com batimento
    resistencia: [
      "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
      "M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",
    ],
  };

  // Ícone da categoria de um treino
  function iconeCategoria(objetivo, classe = "icon card-cover-icon") {
    // Usa o ícone do objetivo (ou o de hipertrofia)
    return icone(ICONES_CATEGORIA[slug(objetivo)] || ICONES_CATEGORIA.hipertrofia, classe);
  }

  // Ícone de salvar (marcador)
  const iconeSalvar = () => icone(["M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"]);
  // Ícone de lixeira
  const iconeLixeira = () => icone(["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"]);

  /* ============================================
     TOAST
     ============================================ */

  // Caixa do aviso rápido
  const toastEl = document.getElementById("toast");
  // Temporizador para esconder o aviso
  let toastTimer;
  // opcoes.acao = { rotulo: "Desfazer", fn } mostra um botão dentro do aviso
  // Mostra um aviso rápido embaixo da tela
  function toast(mensagem, opcoes = {}) {
    // Escreve a mensagem
    toastEl.replaceChildren(el("span", { text: mensagem }));
    // Se o aviso tem botão (ex.: Desfazer)...
    if (opcoes.acao) {
      // ...cria o botão
      const botao = el("button", { type: "button", class: "toast-action", text: opcoes.acao.rotulo });
      // ...quando clicam nele...
      botao.addEventListener("click", () => {
        // ...esconde o aviso
        esconderToast();
        // ...e faz a ação
        opcoes.acao.fn();
      });
      // ...e coloca no aviso
      toastEl.append(botao);
    }
    // Mostra o aviso
    toastEl.hidden = false;
    // Liga a animação de entrada
    toastEl.classList.add("is-visible");
    // Cancela o tempo anterior
    clearTimeout(toastTimer);
    // Esconde depois de 6 s (com botão) ou 2,6 s (sem botão)
    toastTimer = setTimeout(esconderToast, opcoes.acao ? 6000 : 2600);
  }

  // Esconde o aviso
  function esconderToast() {
    // Tira a animação
    toastEl.classList.remove("is-visible");
    // Esconde
    toastEl.hidden = true;
  }

  /* ============================================
     USUÁRIO
     ============================================ */

  // Sessão: quem está logado
  const sessao = lerSessao();
  // Perfil editado pela pessoa (se tiver)
  const perfilSalvo = storage.get("sl-perfil", {});

  // Devolve os dados da pessoa
  function getUsuario() {
    // Junta:
    return {
      // nome (do perfil, da sessão ou "Visitante")
      nome: perfilSalvo.nome || sessao.nome || "Visitante",
      // bio (do perfil ou um texto padrão)
      bio: perfilSalvo.bio != null ? perfilSalvo.bio : "Foco em hipertrofia e consistência diária.",
    };
  }

  // Escreve os dados da pessoa em todos os lugares da página
  function renderUsuario() {
    // Dados da pessoa
    const usuario = getUsuario();
    // Primeiro nome
    const primeiroNome = usuario.nome.split(/\s+/)[0];
    // Nome completo onde tiver data-user-name
    document.querySelectorAll("[data-user-name]").forEach((n) => (n.textContent = usuario.nome));
    // Primeiro nome onde tiver data-user-first-name
    document.querySelectorAll("[data-user-first-name]").forEach((n) => (n.textContent = primeiroNome));
    // Iniciais onde tiver data-user-initials
    document.querySelectorAll("[data-user-initials]").forEach((n) => (n.textContent = initials(usuario.nome)));
    // @usuario onde tiver data-user-handle
    document.querySelectorAll("[data-user-handle]").forEach((n) => (n.textContent = "@" + slug(usuario.nome)));
    // Bio onde tiver data-user-bio
    document.querySelectorAll("[data-user-bio]").forEach((n) => (n.textContent = usuario.bio));
    // E-mail onde tiver data-user-email
    document.querySelectorAll("[data-user-email]").forEach((n) => (n.textContent = sessao.email || ""));
  }

  // Saudação conforme o horário + data por extenso
  // Escreve a saudação e a data de hoje
  function renderSaudacao() {
    // Hora de agora
    const hora = new Date().getHours();
    // Bom dia, Boa tarde ou Boa noite
    const saudacao = hora < 5 ? "Boa noite" : hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    // Escreve a saudação onde tiver data-saudacao
    document.querySelectorAll("[data-saudacao]").forEach((n) => (n.textContent = saudacao));
    // Data por extenso (ex.: segunda-feira, 5 de outubro)
    const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    // Escreve com a primeira letra maiúscula onde tiver data-hoje
    document.querySelectorAll("[data-hoje]").forEach((n) => (n.textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1)));
  }

  /* ============================================
     TREINOS, HISTÓRICO E ESTATÍSTICAS
     (fonte única para Início, Treinos, Evolução e Perfil)
     ============================================ */

  // Respostas do questionário (ou um padrão)
  function onboarding() {
    // Lê a chave "sl-onboarding"
    return storage.get("sl-onboarding", { objetivo: "Hipertrofia", nivel: "Intermediário", dias: 4 });
  }

  // Dados do corpo da pessoa: peso (último registrado), altura e idade (com valores padrão)
  function dadosCorpo() {
    // Perfil salvo (o cadastro e o perfil guardam altura, peso e nascimento)
    const perfil = storage.get("sl-perfil", {});
    // Pesos registrados na Evolução
    const pesos = storage.get("sl-pesos", []);
    // Peso: o último registrado, o do perfil ou o último do exemplo
    const peso = pesos.length ? pesos[pesos.length - 1].valor : perfil.peso || window.SL_DADOS.EVOLUCAO.peso.slice(-1)[0];
    // Altura em centímetros (padrão: 175)
    const altura = Number(perfil.altura) || 175;
    // Idade a partir da data de nascimento (padrão: 25 anos)
    const idade = perfil.nascimento ? Math.floor((Date.now() - new Date(perfil.nascimento)) / (365.25 * 86400000)) : 25;
    // Devolve os três
    return { peso: Number(peso), altura, idade };
  }

  // Treinos da pessoa (ou os de exemplo)
  function treinosDoUsuario() {
    // Lê a chave "sl-treinos"
    return storage.get("sl-treinos", window.SL_DADOS.TREINOS_PADRAO);
  }

  // Acha um treino pelo id
  function acharTreino(id) {
    // Catálogo de treinos prontos
    const { CATALOGO } = window.SL_DADOS;
    // Procura nos treinos da pessoa
    const meu = treinosDoUsuario().find((t) => t.id === id);
    // Se achou, devolve
    if (meu) return meu;
    // Se não, procura no catálogo
    const doCatalogo = CATALOGO.find((t) => t.id === id);
    // Devolve marcado como "do catálogo" (ou nada)
    return doCatalogo ? { ...doCatalogo, doCatalogo: true } : null;
  }

  // Lista de exercícios: a do próprio treino, a de exemplo ou uma genérica
  // Devolve os exercícios de um treino
  function exerciciosDe(treino) {
    // Sem treino: lista vazia
    if (!treino) return [];
    // Se o treino tem a própria lista, usa ela
    if (Array.isArray(treino.itens) && treino.itens.length) return treino.itens;
    // Se não, procura nos exemplos
    const exemplo = window.SL_DADOS.EXERCICIOS[treino.id];
    // Se achou, usa
    if (exemplo) return exemplo;
    // Se não, quantos exercícios genéricos criar
    const qtd = Math.max(1, Number(treino.exercicios) || 4);
    // Cria "Exercício 1, 2, 3..." com 3x12
    return Array.from({ length: qtd }, (_, i) => ({ nome: `Exercício ${i + 1}`, series: 3, reps: 12, carga: 0, descanso: 60 }));
  }

  // Histórico de treinos (os da pessoa + os de exemplo)
  function historico() {
    // Data de hoje
    const hoje = new Date();
    // Transforma os exemplos ("X dias atrás") em datas de verdade
    const padrao = window.SL_DADOS.HISTORICO_PADRAO.map((h) => {
      // Copia a data de hoje
      const data = new Date(hoje);
      // Volta os dias
      data.setDate(data.getDate() - h.diasAtras);
      // Às 18h30
      data.setHours(18, 30, 0, 0);
      // Devolve com a data
      return { ...h, data: data.toISOString() };
    });
    // Lê os treinos feitos pela pessoa...
    return storage
      // (chave do histórico)
      .get("sl-historico", [])
      // ...junta com os de exemplo
      .concat(padrao)
      // ...e ordena do mais novo para o mais velho
      .sort((a, b) => (a.data < b.data ? 1 : -1));
  }

  // Devolve a segunda-feira da semana de uma data
  function inicioDaSemana(data) {
    // Data no começo do dia
    const d = inicioDoDia(data);
    // Dia da semana com segunda = 0
    const diaSemana = (d.getDay() + 6) % 7; // segunda = 0
    // Volta até a segunda-feira
    d.setDate(d.getDate() - diaSemana);
    // Devolve
    return d;
  }

  // Calcula os números de treino da pessoa
  function estatisticas() {
    // Histórico
    const lista = historico();
    // Começo desta semana
    const semanaAtual = inicioDaSemana(new Date());
    // Meta de treinos por semana
    const meta = Number(onboarding().dias) || 4;
    // Quantos treinos nesta semana
    const nestaSemana = lista.filter((h) => new Date(h.data) >= semanaAtual).length;

    // Sequência: semanas seguidas com pelo menos um treino
    // Semanas que tiveram treino
    const semanasComTreino = new Set(lista.map((h) => inicioDaSemana(h.data).getTime()));
    // Começa nesta semana
    let cursor = new Date(semanaAtual);
    // Se esta semana ainda não tem treino, começa a contar da passada
    if (!semanasComTreino.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 7);
    // Contador da sequência
    let sequencia = 0;
    // Enquanto a semana tem treino...
    while (semanasComTreino.has(cursor.getTime())) {
      // ...soma 1
      sequencia++;
      // ...e volta uma semana
      cursor.setDate(cursor.getDate() - 7);
    }

    // Devolve:
    return {
      // total de treinos
      total: lista.length,
      // total de minutos
      minutos: lista.reduce((soma, h) => soma + (h.duracao || 0), 0),
      // total de peso levantado
      volume: lista.reduce((soma, h) => soma + (h.volume || 0), 0),
      // treinos nesta semana
      nestaSemana,
      // meta da semana
      meta,
      // semanas seguidas
      sequencia,
    };
  }

  // Quando foi a última vez que um treino foi feito
  function ultimaVez(treinoId) {
    // Procura no histórico (o mais recente vem primeiro)
    const registro = historico().find((h) => h.treinoId === treinoId);
    // Devolve a data (ou nada)
    return registro ? registro.data : null;
  }

  // Treino em andamento (salvo pela tela de treino)
  // Treino em andamento
  function treinoAtual() {
    // Lê a chave "sl-treino-atual"
    return storage.get("sl-treino-atual", null);
  }

  /* ============================================
     SIDEBAR: item ativo + menu mobile
     ============================================ */

  // Para cada link do menu lateral e da barra de baixo...
  document.querySelectorAll(".nav-link[data-pagina], .bottom-nav-link[data-pagina]").forEach((link) => {
    // ...vê se é a página aberta
    const ativo = link.dataset.pagina === paginaAtual;
    // ...destaca se for
    link.classList.toggle("active", ativo);
    // ...e avisa os leitores de tela que é a página atual
    if (ativo) link.setAttribute("aria-current", "page");
  });

  // Menu lateral
  const sidebar = document.getElementById("app-sidebar");
  // Botão de abrir o menu (celular)
  const sidebarToggle = document.getElementById("sidebar-toggle");
  // Fundo escuro atrás do menu
  const sidebarOverlay = document.getElementById("sidebar-overlay");

  // Abre o menu no celular
  function openSidebar() {
    // Desliza o menu para dentro
    sidebar.classList.add("is-open");
    // Mostra o fundo escuro
    sidebarOverlay.classList.remove("hidden");
    // Avisa os leitores de tela que abriu
    sidebarToggle.setAttribute("aria-expanded", "true");
    // Troca o nome do botão
    sidebarToggle.setAttribute("aria-label", "Fechar menu");
    // Acha o link da página atual (ou o primeiro)
    const linkAtivo = sidebar.querySelector(".nav-link.active") || sidebar.querySelector(".nav-link");
    // Coloca o foco nele
    if (linkAtivo) linkAtivo.focus();
  }

  // Fecha o menu no celular
  function closeSidebar() {
    // Se não tem menu ou ele já está fechado, para
    if (!sidebar || !sidebar.classList.contains("is-open")) return;
    // Desliza o menu para fora
    sidebar.classList.remove("is-open");
    // Esconde o fundo escuro
    sidebarOverlay.classList.add("hidden");
    // Avisa os leitores de tela que fechou
    sidebarToggle.setAttribute("aria-expanded", "false");
    // Troca o nome do botão
    sidebarToggle.setAttribute("aria-label", "Abrir menu");
    // Devolve o foco para o botão
    sidebarToggle.focus();
  }

  // Tela de treino e questionário inicial não têm sidebar
  // Se a página tem menu...
  if (sidebar) {
    // ...clique no botão de menu...
    sidebarToggle.addEventListener("click", () => {
      // ...fecha se estiver aberto
      if (sidebar.classList.contains("is-open")) closeSidebar();
      // ...abre se estiver fechado
      else openSidebar();
    });
    // Clique no fundo escuro fecha o menu
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  /* ============================================
     MODAL (foco preso, Esc e devolução do foco)
     ============================================ */

  // Fundo escuro do modal
  const modalOverlay = document.getElementById("modal-overlay");
  // Janela do modal
  const modalWindow = modalOverlay.querySelector(".modal-window");
  // Título do modal
  const modalTitle = document.getElementById("modal-title");
  // Miolo do modal
  const modalBody = modalOverlay.querySelector(".modal-body");
  // Elemento que estava focado antes de abrir o modal
  let ultimoFoco = null;

  // Lista de tudo que pode receber foco pelo Tab
  const FOCAVEIS =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Abre o modal com um título e um conteúdo
  function openModal(title, content) {
    // Guarda o que estava focado
    ultimoFoco = document.activeElement;
    // Escreve o título
    modalTitle.textContent = title;
    // Coloca o conteúdo no miolo
    modalBody.replaceChildren(...[].concat(content));
    // Mostra o modal
    modalOverlay.classList.remove("hidden");
    // Avisa os leitores de tela que está visível
    modalOverlay.setAttribute("aria-hidden", "false");
    // Marca a página com "modal aberto"
    document.body.classList.add("modal-aberto");

    // Foca o primeiro campo do formulário; senão, o botão de fechar
    // Primeiro campo do formulário (se tiver)
    const primeiroCampo = modalBody.querySelector("input, select, textarea");
    // Foca ele (ou o primeiro botão do modal)
    (primeiroCampo || modalWindow.querySelector(FOCAVEIS)).focus();
  }

  // Fecha o modal
  function closeModal() {
    // Se já está fechado, para
    if (modalOverlay.classList.contains("hidden")) return;
    // Esconde o modal
    modalOverlay.classList.add("hidden");
    // Avisa os leitores de tela que escondeu
    modalOverlay.setAttribute("aria-hidden", "true");
    // Tira a marca de "modal aberto"
    document.body.classList.remove("modal-aberto");
    // Devolve o foco para onde estava
    if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
  }

  // Clique no fundo escuro...
  modalOverlay.addEventListener("click", (e) => {
    // ...fecha o modal (se não foi dentro da janela)
    if (e.target === modalOverlay) closeModal();
  });

  // Quando a pessoa aperta uma tecla...
  document.addEventListener("keydown", (e) => {
    // ...vê se o modal está aberto
    const modalAberto = !modalOverlay.classList.contains("hidden");

    // Se foi Esc...
    if (e.key === "Escape") {
      // ...fecha o modal se estiver aberto
      if (modalAberto) closeModal();
      // ...se não, fecha a busca ou o menu
      else if (!fecharBusca()) closeSidebar();
      // ...e para
      return;
    }

    // Se foi Tab com o modal aberto (prende o foco dentro dele)...
    if (e.key === "Tab" && modalAberto) {
      // ...lista o que pode receber foco no modal
      const focaveis = Array.from(modalWindow.querySelectorAll(FOCAVEIS));
      // Se não tem nada, para
      if (!focaveis.length) return;
      // Primeiro item
      const primeiro = focaveis[0];
      // Último item
      const ultimo = focaveis[focaveis.length - 1];
      // Shift+Tab no primeiro...
      if (e.shiftKey && document.activeElement === primeiro) {
        // ...não deixa sair
        e.preventDefault();
        // ...vai para o último
        ultimo.focus();
      // Tab no último...
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        // ...não deixa sair
        e.preventDefault();
        // ...volta para o primeiro
        primeiro.focus();
      }
    }
  });

  // Cria um campo de formulário com nome (label)
  function campo(id, label, attrs = {}) {
    // Grupo do campo
    return el("div", { class: "form-group" }, [
      // Nome do campo
      el("label", { for: id, text: label }),
      // Caixa de texto grande ou campo normal
      el(attrs.multiline ? "textarea" : "input", {
        // (id)
        id,
        // (nome)
        name: id,
        // (tipo, padrão "text")
        type: attrs.multiline ? null : attrs.type || "text",
        // (texto de exemplo)
        placeholder: attrs.placeholder,
        // (obrigatório?)
        required: attrs.required,
        // (mínimo)
        min: attrs.min,
        // (máximo)
        max: attrs.max,
        // (passo)
        step: attrs.step,
        // (linhas da caixa grande)
        rows: attrs.multiline ? 3 : null,
        // (máximo de letras)
        maxlength: attrs.maxlength,
      }),
    ]);
  }

  // Confirmação no visual do site (substitui o confirm() cinza do navegador)
  // Mostra uma confirmação (Cancelar / botão de ação)
  function confirmar({ titulo, texto, rotulo = "Confirmar", perigo = false, fn }) {
    // Botão cancelar
    const cancelar = el("button", { type: "button", class: "btn-secondary", text: "Cancelar" });
    // Botão de ação (vermelho se for perigoso)
    const ok = el("button", { type: "button", class: perigo ? "btn-danger-solid" : "btn-primary", text: rotulo });
    // Cancelar só fecha
    cancelar.addEventListener("click", closeModal);
    // Clique no botão de ação...
    ok.addEventListener("click", () => {
      // ...fecha
      closeModal();
      // ...e faz a ação
      fn();
    });
    // Abre o modal com o texto e os dois botões
    openModal(titulo, [el("p", { class: "modal-text", text: texto }), el("div", { class: "modal-actions" }, [cancelar, ok])]);
    // Coloca o foco no botão de ação
    ok.focus();
  }

  /* ============================================
     COMPONENTES COMPARTILHADOS
     ============================================ */

  // Cria o bloco de "nada por aqui"
  function estadoVazio(titulo, texto, acao) {
    // Desenho do estado vazio
    const ilustracao = svg("svg", { viewBox: "0 0 64 64", class: "empty-illustration", "aria-hidden": "true" });
    // Coloca dentro:
    ilustracao.append(
      // anel
      svg("circle", { cx: 32, cy: 32, r: 26, class: "empty-ring" }),
      // linha de batimento
      svg("path", { d: "M14 34h8l4-10 6 18 5-12h13", class: "empty-pulse" }),
    );
    // Devolve: desenho, título, texto e botão
    return el("div", { class: "empty-state" }, [ilustracao, el("h3", { text: titulo }), el("p", { text: texto }), acao]);
  }

  // Cria cards de carregando (esqueleto)
  function skeleton(quantidade) {
    // Um para cada quantidade pedida
    return Array.from({ length: quantidade }, () =>
      // Card cinza
      el("div", { class: "skeleton-card", "aria-hidden": "true" }, [
        // Bloco grande
        el("div", { class: "skeleton-line is-block" }),
        // Linha
        el("div", { class: "skeleton-line" }),
        // Linha curta
        el("div", { class: "skeleton-line is-short" }),
      ]),
    );
  }

  // Carregando com a cara da marca: o anel se fecha e o batimento passa
  function carregandoLogo() {
    // Desenho de 64 x 64 (o mesmo da logo)
    const desenho = svg("svg", { viewBox: "0 0 64 64", class: "carregando-desenho", "aria-hidden": "true" });
    // Anel que vai se fechando
    desenho.append(svg("path", { d: "M32 9.5A22.5 22.5 0 1 1 12.51 20.75", class: "carregando-anel", pathLength: 100 }));
    // Batimento que passa por dentro
    desenho.append(svg("path", { d: "M19.5 33H24.5L28.5 25L33.5 41L37 33H44.5", class: "carregando-batimento", pathLength: 100 }));
    // Caixa com o desenho e o texto
    return el("div", { class: "carregando-logo", role: "status" }, [desenho, el("span", { text: "Carregando…" })]);
  }

  // Mostra skeleton e só depois desenha (simula a resposta de um servidor)
  // Mostra o carregando e depois desenha
  function carregar(container, desenhar, quantidade = 3) {
    // Se não tem lugar, para
    if (!container) return;
    // Avisa os leitores de tela que está carregando
    container.setAttribute("aria-busy", "true");
    // Coloca a logo se desenhando no lugar (os cards cinza ficam de reserva em skeleton())
    container.replaceChildren(carregandoLogo());
    // Espera um pouquinho...
    setTimeout(() => {
      // ...desenha de verdade
      desenhar();
      // ...avisa que terminou
      container.removeAttribute("aria-busy");
      // ...e pinta as barras
      aplicarProgresso();
    // (0,45 segundo)
    }, 450);
  }

  // Larguras das barras vêm de data-progress (sem style inline no HTML)
  // Pinta todas as barras de progresso da página
  function aplicarProgresso() {
    // Para cada parte pintada com data-progress...
    document.querySelectorAll(".fill[data-progress]").forEach((fill) => {
      // ...a largura vira a porcentagem
      fill.style.width = fill.dataset.progress + "%";
    });
  }

  // Cria o card de um treino do catálogo
  function cardTreinoCatalogo(t) {
    // Vê se o treino está salvo
    const salvo = storage.get("sl-salvos", []).includes(t.id);
    // Card
    return el("article", { class: "rec-card rec-card-grid" }, [
      // Capa colorida pelo objetivo
      el("div", { class: "card-img-placeholder", "data-objetivo": slug(t.objetivo) }, [
        // Ícone da categoria
        iconeCategoria(t.objetivo),
        // Etiqueta do objetivo
        el("span", { class: "card-tag", text: t.objetivo }),
      ]),
      // Detalhes
      el("div", { class: "card-details" }, [
        // Nome do treino
        el("h3", { text: t.nome }),
        // Grupo e nível
        el("p", { class: "category", text: `${t.grupo} • ${t.nivel}` }),
        // Minutos, exercícios e nota
        el("p", { class: "meta" }, [`${t.duracao} min • ${exerciciosDe(t).length} exercícios • `, nota(t.nota)]),
        // Botões
        el("div", { class: "card-actions" }, [
          // Botão de abrir os exercícios
          el("button", { class: "btn-secondary", "data-action": "open-workout-modal", "data-id": t.id, text: "Abrir" }),
          // Botão de salvar
          el(
            // (é um botão)
            "button",
            {
              // (fica preenchido se já salvo)
              class: "btn-icon btn-save" + (salvo ? " is-saved" : ""),
              // (ação do clique)
              "data-action": "toggle-save",
              // (qual treino)
              "data-id": t.id,
              // (avisa se está salvo)
              "aria-pressed": String(salvo),
              // (nome para leitores de tela)
              "aria-label": salvo ? `Remover ${t.nome} dos salvos` : `Salvar ${t.nome}`,
            },
            // Ícone de marcador
            [iconeSalvar()],
          ),
        ]),
      ]),
    ]);
  }

  // Cria o card de um profissional
  function cardProfissional(p) {
    // Vê se a pessoa segue esse profissional
    const segue = storage.get("sl-seguindo", []).includes(p.nome);
    // Card
    return el("article", { class: "pro-card" }, [
      // Bolinha com as iniciais
      el("span", { class: "pro-avatar avatar-initials", "aria-hidden": "true", text: initials(p.nome) }),
      // Nome
      el("h3", { text: p.nome }),
      // Especialidade
      el("p", { class: "specialty", text: p.especialidade }),
      // Nota e seguidores
      el("p", { class: "stats" }, [nota(p.nota), ` • ${p.seguidores} seguidores`]),
      // Botão de seguir
      el("button", {
        // (coral se já segue)
        class: segue ? "btn-primary" : "btn-secondary",
        // (ação do clique)
        "data-action": "follow-pro",
        // (qual profissional)
        "data-nome": p.nome,
        // (avisa se está seguindo)
        "aria-pressed": String(segue),
        // (texto do botão)
        text: segue ? "Seguindo" : "Seguir",
      }),
    ]);
  }

  // Bloco de número (resumo da semana, perfil, evolução)
  // Cria um quadradinho de número com ícone
  function statTile({ rotulo, valor, detalhe, iconePaths, cor = "coral", extra }) {
    // Caixa
    return el("div", { class: "stat-box stat-tile" }, [
      // Topo
      el("div", { class: "stat-tile-top" }, [
        // Nome do número
        el("span", { class: "stat-label", text: rotulo }),
        // Ícone (se tiver)
        iconePaths ? el("span", { class: `icon-tile icon-tile-${cor}`, "aria-hidden": "true" }, [icone(iconePaths)]) : null,
      ]),
      // Valor
      el("strong", { class: "stat-value", text: valor }),
      // Detalhe (se tiver)
      detalhe ? el("span", { class: "stat-detail", text: detalhe }) : null,
      // Algo extra (ex.: as bolinhas da semana)
      extra,
    ]);
  }

  // Desenhos dos ícones usados no app
  const ICONES = {
    // Calendário
    calendario: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
    // Fogo
    fogo: ["M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"],
    // Relógio
    relogio: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
    // Haltere
    haltere: ["M6 5v14", "M18 5v14", "M3 8v8", "M21 8v8", "M6 12h12"],
    // Troféu
    trofeu: ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", "M4 22h16", "M18 2H6v7a6 6 0 0 0 12 0V2Z", "M12 15v7"],
    // Balança
    balanca: ["M16 16.5 12 3 8 16.5", "M3 16.5h18", "M5 21h14"],
    // Alvo
    alvo: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
    // Gota
    gota: ["M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"],
    // Play
    play: ["M6 3l14 9-14 9V3z"],
    // Check
    check: ["M20 6 9 17l-5-5"],
    // Lápis
    lapis: ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"],
    // Mais
    mais: ["M12 5v14", "M5 12h14"],
    // Sair
    sair: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "m16 17 5-5-5-5", "M21 12H9"],
  };

  /* ============================================
     BUSCA GLOBAL (leva para a página certa)
     ============================================ */

  // Dados para a busca
  const { CATALOGO, PROFISSIONAIS, AULAS } = window.SL_DADOS;
  // Campo de busca
  const globalSearch = document.getElementById("global-search");
  // Lista de resultados
  const searchDropdown = document.getElementById("search-results-dropdown");

  // Toda vez que a pessoa digita na busca...
  if (globalSearch) globalSearch.addEventListener("input", () => {
    // ...pega o texto em minúsculas
    const termo = globalSearch.value.trim().toLowerCase();
    // Se está vazio...
    if (!termo) {
      // ...esconde os resultados
      searchDropdown.classList.add("hidden");
      // ...e para
      return;
    }

    // Junta os resultados (no máximo 6):
    const resultados = [
      // treinos com o nome ou objetivo parecido
      ...CATALOGO.filter((t) => t.nome.toLowerCase().includes(termo) || t.objetivo.toLowerCase().includes(termo)).map((t) => ({ titulo: t.nome, tipo: "Treino", href: "../descobrir/descobrir.html" })),
      // profissionais com o nome ou especialidade parecida
      ...PROFISSIONAIS.filter((p) => p.nome.toLowerCase().includes(termo) || p.especialidade.toLowerCase().includes(termo)).map((p) => ({ titulo: p.nome, tipo: p.especialidade, href: "../profissionais/profissionais.html" })),
      // aulas com o nome parecido
      ...AULAS.filter((a) => a.nome.toLowerCase().includes(termo)).map((a) => ({ titulo: a.nome, tipo: "Aula", href: "../aulas/aulas.html" })),
    ].slice(0, 6);

    // Se não achou nada...
    if (!resultados.length) {
      // ...mostra "Nada encontrado"
      searchDropdown.replaceChildren(el("div", { class: "search-status", text: `Nada encontrado para "${globalSearch.value.trim()}"` }));
    // Se achou...
    } else {
      // ...mostra um link para cada resultado
      searchDropdown.replaceChildren(
        // (título e tipo)
        ...resultados.map((r) => el("a", { href: r.href, class: "search-result" }, [el("strong", { text: r.titulo }), el("span", { text: r.tipo })])),
      );
    }
    // Mostra a lista de resultados
    searchDropdown.classList.remove("hidden");
  });

  // Clique em qualquer lugar...
  document.addEventListener("click", (e) => {
    // ...fora da busca esconde os resultados
    if (searchDropdown && !e.target.closest(".search-box")) searchDropdown.classList.add("hidden");
  });

  // No celular a busca vira um ícone de lupa que abre o campo
  // Barra do topo
  const topbar = document.querySelector(".app-topbar");
  // Botão de lupa
  const searchToggle = document.querySelector('[data-action="toggle-search"]');

  // Fecha a busca do celular (devolve se fechou)
  function fecharBusca() {
    // Se não está aberta, não faz nada
    if (!topbar || !topbar.classList.contains("search-aberta")) return false;
    // Fecha
    topbar.classList.remove("search-aberta");
    // Avisa os leitores de tela
    searchToggle.setAttribute("aria-expanded", "false");
    // Troca o nome do botão
    searchToggle.setAttribute("aria-label", "Abrir busca");
    // Esconde os resultados
    searchDropdown.classList.add("hidden");
    // Devolve o foco para a lupa
    searchToggle.focus();
    // Fechou
    return true;
  }

  /* ============================================
     AÇÕES (delegação de cliques)
     Ações comuns ficam aqui; cada página pode registrar as suas
     com SL.acao("nome", fn).
     ============================================ */

  // Guarda as ações de clique: nome → função
  const acoes = {};

  // Registra uma ação: quando clicar em data-action="nome", roda fn
  function acao(nome, fn) {
    // Guarda a função com esse nome
    acoes[nome] = fn;
  }

  // Botão X do modal fecha o modal
  acao("close-modal", closeModal);

  // Botão de configurações...
  acao("open-settings", () => {
    // ...cria a linha da caixinha de lembretes
    const lembrar = el("label", { class: "check-row" }, [
      // Caixinha (marcada conforme o que está salvo)
      el("input", { type: "checkbox", id: "pref-notif", checked: storage.get("sl-pref-notif", true) }),
      // Texto da caixinha
      " Receber lembretes de treino",
    ]);
    // Quando muda a caixinha...
    lembrar.querySelector("input").addEventListener("change", (ev) => {
      // ...salva a escolha
      storage.set("sl-pref-notif", ev.target.checked);
      // ...e avisa
      toast("Preferência salva");
    });
    // Abre o modal de configurações com:
    openModal("Configurações", [
      // um texto
      el("p", { text: "Opções de configuração da conta e preferências do sistema." }),
      // a caixinha
      lembrar,
      // link para refazer o questionário
      el("a", { href: "../comecar/comecar.html", class: "btn-secondary btn-block", text: "Refazer questionário inicial" }),
      // botão de restaurar os dados
      el("button", { class: "btn-secondary btn-block", "data-action": "reset-data", text: "Restaurar dados de exemplo" }),
    ]);
  });

  // Botão de restaurar dados...
  acao("reset-data", () => {
    // ...pede confirmação
    confirmar({
      // Título
      titulo: "Restaurar dados de exemplo?",
      // Texto
      texto: "Seus treinos, histórico, refeições, pesos e preferências voltam ao exemplo inicial.",
      // Texto do botão
      rotulo: "Restaurar",
      // Botão vermelho
      perigo: true,
      // Se confirmar...
      fn: () => {
        // ...lista de todas as chaves salvas pelo app
        [
          "sl-treinos", "sl-salvos", "sl-seguindo", "sl-reservas", "sl-perfil", "sl-pesos", "sl-agua",
          "sl-refeicoes", "sl-historico", "sl-treino-atual", "sl-desafio", "sl-lidas",
          "sl-pontos", "sl-pontos-inicio", "sl-liga", "sl-liga-vistas", "sl-academia",
          "sl-amigos", "sl-reacoes", "sl-comentarios", "sl-cutucadas", "sl-desafios", "sl-mensagens", "sl-privacidade",
          "sl-plano", "sl-auto-usos", "sl-lugar", "sl-ultimas", "sl-recordes",
          "sl-metas-modo", "sl-metas-manual", "sl-lembrete-agua", "sl-agua-ultimo", "sl-agua-aviso",
          "sl-metas-pessoais", "sl-fotos",
        // ...apaga cada uma
        ].forEach(storage.remove);
        // ...e recarrega a página
        window.location.reload();
      },
    });
  });

  // Botão de sair da conta...
  acao("logout", (alvo, e) => {
    // ...impede o link de abrir
    e.preventDefault();
    // ...apaga a sessão
    storage.remove("sl-sessao");
    // ...e vai para o login
    window.location.href = "../../login/login.html";
  });

  // Cria um item de lista com título e texto
  function itemLista(titulo, texto) {
    // (item com título e texto)
    return el("li", {}, [el("div", {}, [el("strong", { text: titulo }), el("span", { text: texto })])]);
  }

  // Notificações e mensagens: o número some depois de abrir
  // Esconde o número das notificações/mensagens já abertas
  function marcarLidas() {
    // Lê quais caixas já foram abertas
    const lidas = storage.get("sl-lidas", []);
    // Para cada botão com número...
    document.querySelectorAll("[data-badge]").forEach((botao) => {
      // ...vê se já foi aberto
      const lida = lidas.includes(botao.dataset.badge);
      // ...pega a bolinha do número
      const badge = botao.querySelector(".badge");
      // ...esconde se já foi aberto
      if (badge) badge.hidden = lida;
      // ...e troca o nome para leitores de tela
      botao.setAttribute("aria-label", lida ? botao.dataset.rotulo : botao.dataset.rotuloNovas);
    });
  }

  // Abre a caixa de notificações ou mensagens
  function abrirCaixa(tipo, titulo, itens) {
    // Lê quais já foram abertas
    const lidas = storage.get("sl-lidas", []);
    // Marca esta como aberta
    if (!lidas.includes(tipo)) storage.set("sl-lidas", lidas.concat(tipo));
    // Esconde o número
    marcarLidas();
    // Abre o modal com a lista
    openModal(titulo, el("ul", { class: "list-panel" }, itens));
  }

  // Botão de notificações...
  acao("open-notifications", () => {
    // ...pega os números da semana
    const { nestaSemana, meta } = estatisticas();
    // ...quantos treinos faltam
    const faltam = Math.max(0, meta - nestaSemana);
    // ...abre a caixa com:
    abrirCaixa("notificacoes", "Notificações", [
      // aviso da meta
      itemLista(
        // (título conforme falta ou não)
        faltam ? "Meta semanal em andamento" : "Meta semanal batida!",
        // (texto conforme falta ou não)
        faltam ? `Faltam ${faltam} treino${faltam > 1 ? "s" : ""} para completar ${meta}/${meta}.` : `Você completou ${nestaSemana} treinos nesta semana.`,
      ),
      // aviso de nova publicação
      itemLista("Ana Souza publicou um novo plano", "Cardápio de alta proteína"),
      // aviso do desafio
      itemLista("Desafio 30 Dias", "Você está no dia 6. Continue!"),
    ]);
  });

  // Botão de mensagens...
  acao("open-messages", () => {
    // ...abre a caixa com uma mensagem de exemplo
    abrirCaixa("mensagens", "Mensagens", [itemLista("Rafael Souza", "Bora ajustar sua carga no agachamento?")]);
    // ...e coloca um link para todas as conversas, na Comunidade
    modalBody.append(el("a", { href: "../comunidade/comunidade.html#mensagens", class: "btn-primary btn-block", text: "Abrir todas as mensagens" }));
  });

  // Monta o link para a tela de treino de um treino
  function linkTreino(id) {
    // (ex.: ../treino/treino.html?id=t1)
    return "../treino/treino.html?id=" + encodeURIComponent(id);
  }

  // Detalhe do treino: lista de exercícios + botão para começar
  // Botão de ver exercícios de um treino...
  acao("open-workout-modal", (alvo) => {
    // ...acha o treino (ou usa o primeiro do catálogo)
    const treino = acharTreino(alvo.dataset.id) || { ...CATALOGO[0], doCatalogo: true };
    // ...pega os exercícios
    const exercicios = exerciciosDe(treino);
    // ...monta o texto de detalhe:
    const meta = treino.doCatalogo
      // do catálogo: objetivo, nível e minutos
      ? `${treino.objetivo} • ${treino.nivel} • ${treino.duracao} min`
      // da pessoa: grupo e quantos exercícios
      : `${treino.grupo} • ${exercicios.length} exercícios`;
    // ...e abre o modal com:
    openModal(treino.nome, [
      // o detalhe
      el("p", { class: "modal-text", text: meta }),
      // a lista numerada
      el(
        // (é uma lista)
        "ol",
        // (com estas classes)
        { class: "list-panel exercise-preview" },
        // um item para cada exercício
        exercicios.map((e, i) =>
          // (item)
          el("li", {}, [
            // número
            el("span", { class: "exercise-index", "aria-hidden": "true", text: String(i + 1) }),
            // nome e resumo
            el("div", {}, [el("strong", { text: e.nome }), el("span", { text: resumoExercicio(e) })]),
          ]),
        ),
      ),
      // botão de iniciar o treino
      el("a", { href: linkTreino(treino.id), class: "btn-primary btn-block", text: "Iniciar treino" }),
    ]);
  });

  // Resumo de um exercício (ex.: 4 × 10 reps • 60 kg)
  function resumoExercicio(e) {
    // Repetições ou tempo
    const reps = typeof e.reps === "number" ? `${e.reps} reps` : e.reps;
    // Carga (se tiver)
    const carga = e.carga ? ` • ${num(e.carga, e.carga % 1 ? 1 : 0)} kg` : "";
    // Junta tudo
    return `${e.series} × ${reps}${carga}`;
  }

  // Botão de continuar treino...
  acao("continue-workout", (alvo) => {
    // ...pega o treino em andamento
    const atual = treinoAtual();
    // ...escolhe qual treino abrir
    const id = alvo.dataset.id || (atual && atual.treinoId) || treinosDoUsuario()[0]?.id || CATALOGO[0].id;
    // ...e vai para a tela de treino
    window.location.href = linkTreino(id);
  });

  // Botão de escolher plano: avisa que ainda não tem pagamento
  acao("select-plan", () => toast("Em breve: pagamento dos planos"));

  // Botão de entrar no desafio...
  acao("join-challenge", (alvo) => {
    // ...salva que entrou
    storage.set("sl-desafio", { inicio: new Date().toISOString() });
    // ...troca o texto do botão
    alvo.textContent = "Participando";
    // ...desativa o botão
    alvo.disabled = true;
    // ...e avisa
    toast("Você entrou no desafio!");
  });

  // Botão de lupa (celular)...
  acao("toggle-search", () => {
    // ...se a busca estava aberta, fecha e para
    if (fecharBusca()) return;
    // ...se não, abre
    topbar.classList.add("search-aberta");
    // ...avisa os leitores de tela
    searchToggle.setAttribute("aria-expanded", "true");
    // ...troca o nome do botão
    searchToggle.setAttribute("aria-label", "Fechar busca");
    // ...e coloca o foco no campo
    globalSearch.focus();
  });

  // Salvar treino: vale para Início, Descobrir e Salvos
  // Botão de salvar treino...
  acao("toggle-save", (alvo) => {
    // ...qual treino
    const id = alvo.dataset.id;
    // ...lista de salvos
    let salvos = storage.get("sl-salvos", []);
    // ...se já estava, tira; se não, coloca
    salvos = salvos.includes(id) ? salvos.filter((s) => s !== id) : salvos.concat(id);
    // ...salva
    storage.set("sl-salvos", salvos);
    // ...vê se ficou salvo
    const salvo = salvos.includes(id);
    // ...atualiza todos os botões desse treino na página:
    document.querySelectorAll(`[data-action="toggle-save"][data-id="${id}"]`).forEach((btn) => {
      // visual de salvo
      btn.classList.toggle("is-saved", salvo);
      // aviso para leitores de tela
      btn.setAttribute("aria-pressed", String(salvo));
      // nome do botão
      btn.setAttribute("aria-label", salvo ? "Remover dos salvos" : "Salvar treino");
    });
    // ...mostra o aviso
    toast(salvo ? "Treino salvo" : "Removido dos salvos");
    // ...e avisa as outras partes da página (a página Salvos se atualiza)
    document.dispatchEvent(new CustomEvent("sl:salvos"));
  });

  // Seguir profissional: vale para Início e Profissionais
  // Botão de seguir profissional...
  acao("follow-pro", (alvo) => {
    // ...qual profissional
    const nome = alvo.dataset.nome || alvo.closest(".pro-card").querySelector("h3").textContent;
    // ...lista de quem a pessoa segue
    let seguindo = storage.get("sl-seguindo", []);
    // ...se já seguia, deixa de seguir; se não, segue
    seguindo = seguindo.includes(nome) ? seguindo.filter((n) => n !== nome) : seguindo.concat(nome);
    // ...salva
    storage.set("sl-seguindo", seguindo);
    // ...e atualiza os botões
    marcarSeguindo();
  });

  // Atualiza todos os botões de seguir da página
  function marcarSeguindo() {
    // Lista de quem a pessoa segue
    const seguindo = storage.get("sl-seguindo", []);
    // Para cada card de profissional...
    document.querySelectorAll(".pro-card").forEach((card) => {
      // ...acha o botão de seguir
      const btn = card.querySelector('[data-action="follow-pro"]');
      // ...se não tem, pula
      if (!btn) return;
      // ...vê se segue esse profissional
      const segue = seguindo.includes(card.querySelector("h3").textContent);
      // ...troca o texto
      btn.textContent = segue ? "Seguindo" : "Seguir";
      // ...troca a cor
      btn.className = segue ? "btn-primary" : "btn-secondary";
      // ...e avisa os leitores de tela
      btn.setAttribute("aria-pressed", String(segue));
    });
  }

  // Botão de editar perfil...
  acao("edit-profile", () => {
    // ...dados atuais
    const usuario = getUsuario();
    // ...cria o formulário
    const form = el("form", { class: "modal-form" }, [
      // Campo do nome
      campo("perfil-nome", "Nome", { required: true, maxlength: 50 }),
      // Campo da bio
      campo("perfil-bio", "Bio", { multiline: true, maxlength: 160 }),
      // Botão de salvar
      el("button", { type: "submit", class: "btn-primary", text: "Salvar alterações" }),
    ]);
    // Preenche o nome
    form.querySelector("#perfil-nome").value = usuario.nome;
    // Preenche a bio
    form.querySelector("#perfil-bio").value = usuario.bio;

    // Quando clicam em salvar...
    form.addEventListener("submit", (ev) => {
      // ...impede a página de recarregar
      ev.preventDefault();
      // Pega o nome
      const nome = form.querySelector("#perfil-nome").value.trim();
      // Se está vazio...
      if (!nome) {
        // ...coloca o foco no campo
        form.querySelector("#perfil-nome").focus();
        // ...e para
        return;
      }
      // Guarda o nome
      perfilSalvo.nome = nome;
      // Guarda a bio
      perfilSalvo.bio = form.querySelector("#perfil-bio").value.trim();
      // Salva no navegador
      storage.set("sl-perfil", perfilSalvo);
      // Escreve os dados novos na página
      renderUsuario();
      // Fecha o modal
      closeModal();
      // Avisa
      toast("Perfil atualizado");
    });

    // Abre o modal com o formulário
    openModal("Editar perfil", form);
  });

  // Um único "ouvinte" de cliques para a página toda...
  document.addEventListener("click", (e) => {
    // ...acha o elemento com data-action mais perto do clique
    const alvo = e.target.closest("[data-action]");
    // Se não tem ação...
    if (!alvo) {
      // Links "#" vazios (redes sociais) não devem pular para o topo
      // ...e é um link vazio (#), não deixa pular para o topo
      if (e.target.closest('a[href="#"]')) e.preventDefault();
      // ...e para
      return;
    }
    // Pega a função dessa ação
    const fn = acoes[alvo.dataset.action];
    // Se existe, roda
    if (fn) fn(alvo, e);
  });

  /* ============================================
     API PÚBLICA + INICIALIZAÇÃO
     ============================================ */

  // Deixa todas essas funções disponíveis para as páginas em window.SL
  /* ============================================
     CONFETE, NÚMEROS CONTANDO E MENU EM ÁREAS
     ============================================ */

  // Diz se a pessoa pediu ao sistema para reduzir as animações
  const menosMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Chuva rápida de confete nas cores da marca (meta batida, subiu de liga, recorde)
  function confete() {
    // Quem pediu menos movimento não vê confete
    if (menosMovimento()) return;
    // Caixa que cobre a tela (não atrapalha os cliques)
    const caixa = el("div", { class: "confete", "aria-hidden": "true" });
    // Cores do confete
    const cores = ["#ff7a45", "#34d399", "#f5b544", "#ffa06b", "#7cc4f0"];
    // 46 pedacinhos
    for (let i = 0; i < 46; i++) {
      // Cada pedacinho
      const p = el("span", {});
      // Posição na horizontal (de 0% a 100%)
      p.style.left = Math.random() * 100 + "%";
      // Cor sorteada
      p.style.background = cores[i % cores.length];
      // Atraso para cair (até 0,35 s)
      p.style.animationDelay = Math.random() * 0.35 + "s";
      // Duração da queda (entre 1,2 e 2 s)
      p.style.animationDuration = 1.2 + Math.random() * 0.8 + "s";
      // Quanto ele vai girar e balançar (usado no CSS)
      p.style.setProperty("--giro", Math.round(Math.random() * 720 - 360) + "deg");
      // Balanço para o lado
      p.style.setProperty("--lado", Math.round(Math.random() * 160 - 80) + "px");
      // Coloca na caixa
      caixa.append(p);
    }
    // Coloca a caixa na página
    document.body.append(caixa);
    // Tira depois de 2,6 segundos
    setTimeout(() => caixa.remove(), 2600);
  }

  // Hora em que a página abriu (os números só contam nos primeiros segundos)
  const abriuEm = Date.now();
  // Onde ficam os números que contam de 0 até o valor
  const NUMEROS = ".stat-value, .pontos-anel-texto strong, .rk-degrau-pts, .rk-linha-pts, .cm-post-pts, [data-contar]";

  // Faz um número contar de 0 até o valor dele
  function contar(alvo) {
    // Só uma vez por elemento
    if (alvo.dataset.contado) return;
    // Marca que já contou
    alvo.dataset.contado = "1";
    // Separa: sinal, número (formato brasileiro) e o resto do texto
    const m = alvo.textContent.match(/^([+−-]?)([\d.]+(?:,\d+)?)(.*)$/s);
    // Se não começa com número, não faz nada
    if (!m) return;
    // Casas decimais do número original
    const casas = m[2].includes(",") ? m[2].split(",")[1].length : 0;
    // Valor final (tira os pontos de milhar e troca a vírgula por ponto)
    const final = Number(m[2].replace(/\./g, "").replace(",", "."));
    // Se é zero ou inválido, não precisa animar
    if (!final) return;
    // Hora em que a contagem começou
    const inicio = performance.now();
    // Duração da contagem: 0,9 segundo
    const duracao = 900;
    // Um passo da animação
    function passo(agora) {
      // Quanto já passou (de 0 a 1)
      const t = Math.min(1, (agora - inicio) / duracao);
      // Começa rápido e termina devagar
      const suave = 1 - Math.pow(1 - t, 3);
      // Escreve o número desse momento
      alvo.textContent = m[1] + num(final * suave, casas) + m[3];
      // Se não acabou, continua no próximo quadro
      if (t < 1) requestAnimationFrame(passo);
    }
    // Começa
    requestAnimationFrame(passo);
  }

  // Procura números para contar dentro de um pedaço da página
  function contarNumeros(raiz = document) {
    // Só nos primeiros 4 segundos e para quem não pediu menos movimento
    if (Date.now() - abriuEm > 4000 || menosMovimento() || !raiz.querySelectorAll) return;
    // O próprio pedaço pode ser um número
    if (raiz.matches && raiz.matches(NUMEROS)) contar(raiz);
    // E os números dentro dele
    raiz.querySelectorAll(NUMEROS).forEach(contar);
  }

  // Fica de olho em tudo o que o JavaScript desenha na página, para contar os números novos
  new MutationObserver((mudancas) => mudancas.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && contarNumeros(n)))).observe(document.documentElement, { childList: true, subtree: true });

  // Áreas do menu lateral: cada página fica na sua área
  const AREAS = [
    // Treinar
    ["Treinar", ["inicio", "descobrir", "treinos", "aulas"]],
    // Comer
    ["Comer", ["alimentacao"]],
    // Evoluir
    ["Evoluir", ["evolucao", "ranking"]],
    // Comunidade
    ["Comunidade", ["comunidade", "profissionais", "academia"]],
    // Sua conta
    ["Sua conta", ["planos", "salvos", "perfil"]],
  ];

  // Lista de links do menu lateral
  const listaMenu = document.querySelector(".sidebar-nav ul");
  // Se a página tem menu lateral...
  if (listaMenu) {
    // ...guarda cada item pelo nome da página
    const itens = {};
    // Para cada item do menu...
    listaMenu.querySelectorAll("li").forEach((li) => {
      // ...acha o link
      const link = li.querySelector("[data-pagina]");
      // ...e guarda pelo nome
      if (link) itens[link.dataset.pagina] = li;
    });
    // Monta a lista nova, área por área
    const nova = [];
    // Para cada área...
    AREAS.forEach(([nome, paginas]) => {
      // ...coloca o título da área
      nova.push(el("li", { class: "nav-area", "aria-hidden": "true", text: nome }));
      // ...e os itens dela
      paginas.forEach((p) => itens[p] && nova.push(itens[p]));
    });
    // Troca a lista do menu
    listaMenu.replaceChildren(...nova);
  }

  window.SL = {
    PAGINAS,
    paginaAtual,
    el,
    svg,
    icone,
    storage,
    initials,
    slug,
    nota,
    iconeLixeira,
    iconeCategoria,
    num,
    dataRelativa,
    duracaoTexto,
    diasEntre,
    inicioDaSemana,
    onboarding,
    dadosCorpo,
    treinosDoUsuario,
    acharTreino,
    exerciciosDe,
    resumoExercicio,
    historico,
    estatisticas,
    ultimaVez,
    treinoAtual,
    linkTreino,
    confirmar,
    toast,
    openModal,
    closeModal,
    campo,
    estadoVazio,
    carregar,
    aplicarProgresso,
    cardTreinoCatalogo,
    cardProfissional,
    statTile,
    ICONES,
    marcarSeguindo,
    acao,
    getUsuario,
    renderUsuario,
    confete,
    contarNumeros,
    // SL.pagina(fn): roda fn quando o HTML da página terminar de carregar
    pagina(fn) {
      // (espera o DOMContentLoaded)
      document.addEventListener("DOMContentLoaded", fn);
    },
  };

  // App instalável no celular (só funciona em http/https, não em file://)
  // Se o navegador suporta e a página está num servidor...
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    // ...registra o service worker (app instalável e offline)
    window.addEventListener("load", () => navigator.serviceWorker.register("../../sw.js").catch(() => {}));
  }

  // Quando o HTML terminar de carregar...
  // Lembrete de água: com o app aberto, avisa se passou 2 horas sem beber (entre 8h e 22h)
  function conferirAgua() {
    // Só se a pessoa ligou o lembrete
    if (!storage.get("sl-lembrete-agua", false)) return;
    // Hora de agora
    const hora = new Date().getHours();
    // Só durante o dia
    if (hora < 8 || hora >= 22) return;
    // Agora em milissegundos
    const agora = Date.now();
    // Duas horas em milissegundos
    const duasHoras = 2 * 3600000;
    // Último gole registrado (se nunca registrou, conta como agora)
    const ultimoGole = storage.get("sl-agua-ultimo", agora);
    // Último aviso dado
    const ultimoAviso = storage.get("sl-agua-aviso", 0);
    // Se ainda não deu 2 horas desde o gole ou desde o último aviso, não avisa
    if (agora - ultimoGole < duasHoras || agora - ultimoAviso < duasHoras) return;
    // Guarda a hora do aviso
    storage.set("sl-agua-aviso", agora);
    // Avisa na tela
    toast("💧 Hora de beber água! Já faz 2 horas.");
    // E também como notificação do sistema, se a pessoa deixou
    if ("Notification" in window && Notification.permission === "granted") new Notification("Saúde Life", { body: "💧 Hora de beber água! Já faz 2 horas." });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ...confere o lembrete de água agora e a cada minuto
    conferirAgua();
    // (a cada 60 segundos)
    setInterval(conferirAgua, 60000);
    // ...faz os números que já estão na página contarem
    contarNumeros();
    // ...escreve os dados da pessoa
    renderUsuario();
    // ...escreve a saudação e a data
    renderSaudacao();
    // ...pinta as barras de progresso
    aplicarProgresso();
    // ...atualiza os botões de seguir
    marcarSeguindo();
    // ...esconde os números já lidos
    marcarLidas();
    // ...se a pessoa já entrou no desafio...
    if (storage.get("sl-desafio", null)) {
      // ...para cada botão de desafio...
      document.querySelectorAll('[data-action="join-challenge"]').forEach((btn) => {
        // ...troca o texto
        btn.textContent = "Participando";
        // ...e desativa
        btn.disabled = true;
      });
    }
  });
})();
