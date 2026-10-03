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
(function () {
  "use strict";

  const PAGINAS = [
    "inicio", "descobrir", "treinos", "aulas", "alimentacao", "evolucao",
    "profissionais", "planos", "salvos", "academia", "perfil", "treino", "comecar",
  ];

  /* ============================================
     GUARDA DE SESSÃO
     ============================================ */

  const paginaAtual = document.body.dataset.pagina || "inicio";

  function lerSessao() {
    try {
      return JSON.parse(localStorage.getItem("sl-sessao") || "null");
    } catch (e) {
      return null;
    }
  }

  // Sem login, volta para o login e lembra qual página a pessoa queria abrir
  if (!lerSessao()) {
    window.location.replace("../../login/login.html?voltar=" + encodeURIComponent(paginaAtual));
    return;
  }

  // Primeiro acesso: antes do app, 3 perguntas rápidas para personalizar o Início
  let onboardingFeito = false;
  try {
    onboardingFeito = Boolean(localStorage.getItem("sl-onboarding"));
  } catch (e) {
    onboardingFeito = true; // sem armazenamento, não prende a pessoa no questionário
  }
  if (!onboardingFeito && paginaAtual !== "comecar") {
    window.location.replace("../comecar/comecar.html");
    return;
  }

  /* ============================================
     HELPERS
     ============================================ */

  // Cria elementos com segurança (texto sempre via textContent)
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value == null) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value === true ? "" : value);
    });
    [].concat(children).forEach((child) => {
      if (child == null || child === "") return;
      node.append(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  // Ícone de traço (mesmo estilo dos ícones do HTML)
  function icone(caminhos, classe = "icon") {
    const node = svg("svg", { viewBox: "0 0 24 24", class: classe, "aria-hidden": "true" });
    caminhos.forEach((d) => node.append(svg("path", { d })));
    return node;
  }

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* armazenamento indisponível */
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        /* armazenamento indisponível */
      }
    },
  };

  function initials(nome) {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "?";
    const primeira = partes[0][0];
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    return (primeira + ultima).toUpperCase();
  }

  function slug(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  // Estrela da nota (SVG, sem emoji)
  function nota(valor) {
    const estrela = svg("svg", { viewBox: "0 0 24 24", class: "icon-star", "aria-hidden": "true" });
    estrela.append(svg("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }));
    return el("span", { class: "rating" }, [el("span", { class: "sr-only", text: "Nota " }), estrela, " " + valor.toFixed(1)]);
  }

  // Números e datas sempre no formato brasileiro (79,6 kg; 2,5 L)
  function num(valor, casas = 0) {
    return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }

  function inicioDoDia(data) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function diasEntre(a, b) {
    return Math.round((inicioDoDia(b) - inicioDoDia(a)) / 86400000);
  }

  function dataRelativa(iso) {
    if (!iso) return "Nunca";
    const dias = diasEntre(iso, new Date());
    if (dias <= 0) return "Hoje";
    if (dias === 1) return "Ontem";
    if (dias < 7) return `Há ${dias} dias`;
    const semanas = Math.floor(dias / 7);
    if (semanas < 5) return semanas === 1 ? "Há 1 semana" : `Há ${semanas} semanas`;
    return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  }

  function duracaoTexto(minutos) {
    const h = Math.floor(minutos / 60);
    const m = Math.round(minutos % 60);
    if (!h) return `${m} min`;
    return m ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
  }

  // Ícone grande de cada categoria (capa dos cards de treino)
  const ICONES_CATEGORIA = {
    hipertrofia: ["M6 5v14", "M18 5v14", "M3 8v8", "M21 8v8", "M6 12h12"],
    hiit: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
    yoga_mobilidade: [
      "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
      "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    ],
    resistencia: [
      "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
      "M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",
    ],
  };

  function iconeCategoria(objetivo, classe = "icon card-cover-icon") {
    return icone(ICONES_CATEGORIA[slug(objetivo)] || ICONES_CATEGORIA.hipertrofia, classe);
  }

  const iconeSalvar = () => icone(["M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"]);
  const iconeLixeira = () => icone(["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"]);

  /* ============================================
     TOAST
     ============================================ */

  const toastEl = document.getElementById("toast");
  let toastTimer;
  // opcoes.acao = { rotulo: "Desfazer", fn } mostra um botão dentro do aviso
  function toast(mensagem, opcoes = {}) {
    toastEl.replaceChildren(el("span", { text: mensagem }));
    if (opcoes.acao) {
      const botao = el("button", { type: "button", class: "toast-action", text: opcoes.acao.rotulo });
      botao.addEventListener("click", () => {
        esconderToast();
        opcoes.acao.fn();
      });
      toastEl.append(botao);
    }
    toastEl.hidden = false;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(esconderToast, opcoes.acao ? 6000 : 2600);
  }

  function esconderToast() {
    toastEl.classList.remove("is-visible");
    toastEl.hidden = true;
  }

  /* ============================================
     USUÁRIO
     ============================================ */

  const sessao = lerSessao();
  const perfilSalvo = storage.get("sl-perfil", {});

  function getUsuario() {
    return {
      nome: perfilSalvo.nome || sessao.nome || "Visitante",
      bio: perfilSalvo.bio != null ? perfilSalvo.bio : "Foco em hipertrofia e consistência diária.",
    };
  }

  function renderUsuario() {
    const usuario = getUsuario();
    const primeiroNome = usuario.nome.split(/\s+/)[0];
    document.querySelectorAll("[data-user-name]").forEach((n) => (n.textContent = usuario.nome));
    document.querySelectorAll("[data-user-first-name]").forEach((n) => (n.textContent = primeiroNome));
    document.querySelectorAll("[data-user-initials]").forEach((n) => (n.textContent = initials(usuario.nome)));
    document.querySelectorAll("[data-user-handle]").forEach((n) => (n.textContent = "@" + slug(usuario.nome)));
    document.querySelectorAll("[data-user-bio]").forEach((n) => (n.textContent = usuario.bio));
    document.querySelectorAll("[data-user-email]").forEach((n) => (n.textContent = sessao.email || ""));
  }

  // Saudação conforme o horário + data por extenso
  function renderSaudacao() {
    const hora = new Date().getHours();
    const saudacao = hora < 5 ? "Boa noite" : hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    document.querySelectorAll("[data-saudacao]").forEach((n) => (n.textContent = saudacao));
    const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    document.querySelectorAll("[data-hoje]").forEach((n) => (n.textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1)));
  }

  /* ============================================
     TREINOS, HISTÓRICO E ESTATÍSTICAS
     (fonte única para Início, Treinos, Evolução e Perfil)
     ============================================ */

  function onboarding() {
    return storage.get("sl-onboarding", { objetivo: "Hipertrofia", nivel: "Intermediário", dias: 4 });
  }

  function treinosDoUsuario() {
    return storage.get("sl-treinos", window.SL_DADOS.TREINOS_PADRAO);
  }

  function acharTreino(id) {
    const { CATALOGO } = window.SL_DADOS;
    const meu = treinosDoUsuario().find((t) => t.id === id);
    if (meu) return meu;
    const doCatalogo = CATALOGO.find((t) => t.id === id);
    return doCatalogo ? { ...doCatalogo, doCatalogo: true } : null;
  }

  // Lista de exercícios: a do próprio treino, a de exemplo ou uma genérica
  function exerciciosDe(treino) {
    if (!treino) return [];
    if (Array.isArray(treino.itens) && treino.itens.length) return treino.itens;
    const exemplo = window.SL_DADOS.EXERCICIOS[treino.id];
    if (exemplo) return exemplo;
    const qtd = Math.max(1, Number(treino.exercicios) || 4);
    return Array.from({ length: qtd }, (_, i) => ({ nome: `Exercício ${i + 1}`, series: 3, reps: 12, carga: 0, descanso: 60 }));
  }

  function historico() {
    const hoje = new Date();
    const padrao = window.SL_DADOS.HISTORICO_PADRAO.map((h) => {
      const data = new Date(hoje);
      data.setDate(data.getDate() - h.diasAtras);
      data.setHours(18, 30, 0, 0);
      return { ...h, data: data.toISOString() };
    });
    return storage
      .get("sl-historico", [])
      .concat(padrao)
      .sort((a, b) => (a.data < b.data ? 1 : -1));
  }

  function inicioDaSemana(data) {
    const d = inicioDoDia(data);
    const diaSemana = (d.getDay() + 6) % 7; // segunda = 0
    d.setDate(d.getDate() - diaSemana);
    return d;
  }

  function estatisticas() {
    const lista = historico();
    const semanaAtual = inicioDaSemana(new Date());
    const meta = Number(onboarding().dias) || 4;
    const nestaSemana = lista.filter((h) => new Date(h.data) >= semanaAtual).length;

    // Sequência: semanas seguidas com pelo menos um treino
    const semanasComTreino = new Set(lista.map((h) => inicioDaSemana(h.data).getTime()));
    let cursor = new Date(semanaAtual);
    if (!semanasComTreino.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 7);
    let sequencia = 0;
    while (semanasComTreino.has(cursor.getTime())) {
      sequencia++;
      cursor.setDate(cursor.getDate() - 7);
    }

    return {
      total: lista.length,
      minutos: lista.reduce((soma, h) => soma + (h.duracao || 0), 0),
      volume: lista.reduce((soma, h) => soma + (h.volume || 0), 0),
      nestaSemana,
      meta,
      sequencia,
    };
  }

  function ultimaVez(treinoId) {
    const registro = historico().find((h) => h.treinoId === treinoId);
    return registro ? registro.data : null;
  }

  // Treino em andamento (salvo pela tela de treino)
  function treinoAtual() {
    return storage.get("sl-treino-atual", null);
  }

  /* ============================================
     SIDEBAR: item ativo + menu mobile
     ============================================ */

  document.querySelectorAll(".nav-link[data-pagina], .bottom-nav-link[data-pagina]").forEach((link) => {
    const ativo = link.dataset.pagina === paginaAtual;
    link.classList.toggle("active", ativo);
    if (ativo) link.setAttribute("aria-current", "page");
  });

  const sidebar = document.getElementById("app-sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarOverlay = document.getElementById("sidebar-overlay");

  function openSidebar() {
    sidebar.classList.add("is-open");
    sidebarOverlay.classList.remove("hidden");
    sidebarToggle.setAttribute("aria-expanded", "true");
    sidebarToggle.setAttribute("aria-label", "Fechar menu");
    const linkAtivo = sidebar.querySelector(".nav-link.active") || sidebar.querySelector(".nav-link");
    if (linkAtivo) linkAtivo.focus();
  }

  function closeSidebar() {
    if (!sidebar || !sidebar.classList.contains("is-open")) return;
    sidebar.classList.remove("is-open");
    sidebarOverlay.classList.add("hidden");
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarToggle.setAttribute("aria-label", "Abrir menu");
    sidebarToggle.focus();
  }

  // Tela de treino e questionário inicial não têm sidebar
  if (sidebar) {
    sidebarToggle.addEventListener("click", () => {
      if (sidebar.classList.contains("is-open")) closeSidebar();
      else openSidebar();
    });
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  /* ============================================
     MODAL (foco preso, Esc e devolução do foco)
     ============================================ */

  const modalOverlay = document.getElementById("modal-overlay");
  const modalWindow = modalOverlay.querySelector(".modal-window");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = modalOverlay.querySelector(".modal-body");
  let ultimoFoco = null;

  const FOCAVEIS =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openModal(title, content) {
    ultimoFoco = document.activeElement;
    modalTitle.textContent = title;
    modalBody.replaceChildren(...[].concat(content));
    modalOverlay.classList.remove("hidden");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-aberto");

    // Foca o primeiro campo do formulário; senão, o botão de fechar
    const primeiroCampo = modalBody.querySelector("input, select, textarea");
    (primeiroCampo || modalWindow.querySelector(FOCAVEIS)).focus();
  }

  function closeModal() {
    if (modalOverlay.classList.contains("hidden")) return;
    modalOverlay.classList.add("hidden");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-aberto");
    if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    const modalAberto = !modalOverlay.classList.contains("hidden");

    if (e.key === "Escape") {
      if (modalAberto) closeModal();
      else if (!fecharBusca()) closeSidebar();
      return;
    }

    if (e.key === "Tab" && modalAberto) {
      const focaveis = Array.from(modalWindow.querySelectorAll(FOCAVEIS));
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  });

  function campo(id, label, attrs = {}) {
    return el("div", { class: "form-group" }, [
      el("label", { for: id, text: label }),
      el(attrs.multiline ? "textarea" : "input", {
        id,
        name: id,
        type: attrs.multiline ? null : attrs.type || "text",
        placeholder: attrs.placeholder,
        required: attrs.required,
        min: attrs.min,
        max: attrs.max,
        step: attrs.step,
        rows: attrs.multiline ? 3 : null,
        maxlength: attrs.maxlength,
      }),
    ]);
  }

  // Confirmação no visual do site (substitui o confirm() cinza do navegador)
  function confirmar({ titulo, texto, rotulo = "Confirmar", perigo = false, fn }) {
    const cancelar = el("button", { type: "button", class: "btn-secondary", text: "Cancelar" });
    const ok = el("button", { type: "button", class: perigo ? "btn-danger-solid" : "btn-primary", text: rotulo });
    cancelar.addEventListener("click", closeModal);
    ok.addEventListener("click", () => {
      closeModal();
      fn();
    });
    openModal(titulo, [el("p", { class: "modal-text", text: texto }), el("div", { class: "modal-actions" }, [cancelar, ok])]);
    ok.focus();
  }

  /* ============================================
     COMPONENTES COMPARTILHADOS
     ============================================ */

  function estadoVazio(titulo, texto, acao) {
    const ilustracao = svg("svg", { viewBox: "0 0 64 64", class: "empty-illustration", "aria-hidden": "true" });
    ilustracao.append(
      svg("circle", { cx: 32, cy: 32, r: 26, class: "empty-ring" }),
      svg("path", { d: "M14 34h8l4-10 6 18 5-12h13", class: "empty-pulse" }),
    );
    return el("div", { class: "empty-state" }, [ilustracao, el("h3", { text: titulo }), el("p", { text: texto }), acao]);
  }

  function skeleton(quantidade) {
    return Array.from({ length: quantidade }, () =>
      el("div", { class: "skeleton-card", "aria-hidden": "true" }, [
        el("div", { class: "skeleton-line is-block" }),
        el("div", { class: "skeleton-line" }),
        el("div", { class: "skeleton-line is-short" }),
      ]),
    );
  }

  // Mostra skeleton e só depois desenha (simula a resposta de um servidor)
  function carregar(container, desenhar, quantidade = 3) {
    if (!container) return;
    container.setAttribute("aria-busy", "true");
    container.replaceChildren(...skeleton(quantidade));
    setTimeout(() => {
      desenhar();
      container.removeAttribute("aria-busy");
      aplicarProgresso();
    }, 450);
  }

  // Larguras das barras vêm de data-progress (sem style inline no HTML)
  function aplicarProgresso() {
    document.querySelectorAll(".fill[data-progress]").forEach((fill) => {
      fill.style.width = fill.dataset.progress + "%";
    });
  }

  function cardTreinoCatalogo(t) {
    const salvo = storage.get("sl-salvos", []).includes(t.id);
    return el("article", { class: "rec-card rec-card-grid" }, [
      el("div", { class: "card-img-placeholder", "data-objetivo": slug(t.objetivo) }, [
        iconeCategoria(t.objetivo),
        el("span", { class: "card-tag", text: t.objetivo }),
      ]),
      el("div", { class: "card-details" }, [
        el("h3", { text: t.nome }),
        el("p", { class: "category", text: `${t.grupo} • ${t.nivel}` }),
        el("p", { class: "meta" }, [`${t.duracao} min • ${exerciciosDe(t).length} exercícios • `, nota(t.nota)]),
        el("div", { class: "card-actions" }, [
          el("button", { class: "btn-secondary", "data-action": "open-workout-modal", "data-id": t.id, text: "Abrir" }),
          el(
            "button",
            {
              class: "btn-icon btn-save" + (salvo ? " is-saved" : ""),
              "data-action": "toggle-save",
              "data-id": t.id,
              "aria-pressed": String(salvo),
              "aria-label": salvo ? `Remover ${t.nome} dos salvos` : `Salvar ${t.nome}`,
            },
            [iconeSalvar()],
          ),
        ]),
      ]),
    ]);
  }

  function cardProfissional(p) {
    const segue = storage.get("sl-seguindo", []).includes(p.nome);
    return el("article", { class: "pro-card" }, [
      el("span", { class: "pro-avatar avatar-initials", "aria-hidden": "true", text: initials(p.nome) }),
      el("h3", { text: p.nome }),
      el("p", { class: "specialty", text: p.especialidade }),
      el("p", { class: "stats" }, [nota(p.nota), ` • ${p.seguidores} seguidores`]),
      el("button", {
        class: segue ? "btn-primary" : "btn-secondary",
        "data-action": "follow-pro",
        "data-nome": p.nome,
        "aria-pressed": String(segue),
        text: segue ? "Seguindo" : "Seguir",
      }),
    ]);
  }

  // Bloco de número (resumo da semana, perfil, evolução)
  function statTile({ rotulo, valor, detalhe, iconePaths, cor = "coral", extra }) {
    return el("div", { class: "stat-box stat-tile" }, [
      el("div", { class: "stat-tile-top" }, [
        el("span", { class: "stat-label", text: rotulo }),
        iconePaths ? el("span", { class: `icon-tile icon-tile-${cor}`, "aria-hidden": "true" }, [icone(iconePaths)]) : null,
      ]),
      el("strong", { class: "stat-value", text: valor }),
      detalhe ? el("span", { class: "stat-detail", text: detalhe }) : null,
      extra,
    ]);
  }

  const ICONES = {
    calendario: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
    fogo: ["M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"],
    relogio: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
    haltere: ["M6 5v14", "M18 5v14", "M3 8v8", "M21 8v8", "M6 12h12"],
    trofeu: ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", "M4 22h16", "M18 2H6v7a6 6 0 0 0 12 0V2Z", "M12 15v7"],
    balanca: ["M16 16.5 12 3 8 16.5", "M3 16.5h18", "M5 21h14"],
    alvo: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
    gota: ["M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"],
    play: ["M6 3l14 9-14 9V3z"],
    check: ["M20 6 9 17l-5-5"],
    lapis: ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"],
    mais: ["M12 5v14", "M5 12h14"],
    sair: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "m16 17 5-5-5-5", "M21 12H9"],
  };

  /* ============================================
     BUSCA GLOBAL (leva para a página certa)
     ============================================ */

  const { CATALOGO, PROFISSIONAIS, AULAS } = window.SL_DADOS;
  const globalSearch = document.getElementById("global-search");
  const searchDropdown = document.getElementById("search-results-dropdown");

  if (globalSearch) globalSearch.addEventListener("input", () => {
    const termo = globalSearch.value.trim().toLowerCase();
    if (!termo) {
      searchDropdown.classList.add("hidden");
      return;
    }

    const resultados = [
      ...CATALOGO.filter((t) => t.nome.toLowerCase().includes(termo) || t.objetivo.toLowerCase().includes(termo)).map((t) => ({ titulo: t.nome, tipo: "Treino", href: "../descobrir/descobrir.html" })),
      ...PROFISSIONAIS.filter((p) => p.nome.toLowerCase().includes(termo) || p.especialidade.toLowerCase().includes(termo)).map((p) => ({ titulo: p.nome, tipo: p.especialidade, href: "../profissionais/profissionais.html" })),
      ...AULAS.filter((a) => a.nome.toLowerCase().includes(termo)).map((a) => ({ titulo: a.nome, tipo: "Aula", href: "../aulas/aulas.html" })),
    ].slice(0, 6);

    if (!resultados.length) {
      searchDropdown.replaceChildren(el("div", { class: "search-status", text: `Nada encontrado para "${globalSearch.value.trim()}"` }));
    } else {
      searchDropdown.replaceChildren(
        ...resultados.map((r) => el("a", { href: r.href, class: "search-result" }, [el("strong", { text: r.titulo }), el("span", { text: r.tipo })])),
      );
    }
    searchDropdown.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (searchDropdown && !e.target.closest(".search-box")) searchDropdown.classList.add("hidden");
  });

  // No celular a busca vira um ícone de lupa que abre o campo
  const topbar = document.querySelector(".app-topbar");
  const searchToggle = document.querySelector('[data-action="toggle-search"]');

  function fecharBusca() {
    if (!topbar || !topbar.classList.contains("search-aberta")) return false;
    topbar.classList.remove("search-aberta");
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", "Abrir busca");
    searchDropdown.classList.add("hidden");
    searchToggle.focus();
    return true;
  }

  /* ============================================
     AÇÕES (delegação de cliques)
     Ações comuns ficam aqui; cada página pode registrar as suas
     com SL.acao("nome", fn).
     ============================================ */

  const acoes = {};

  function acao(nome, fn) {
    acoes[nome] = fn;
  }

  acao("close-modal", closeModal);

  acao("open-settings", () => {
    const lembrar = el("label", { class: "check-row" }, [
      el("input", { type: "checkbox", id: "pref-notif", checked: storage.get("sl-pref-notif", true) }),
      " Receber lembretes de treino",
    ]);
    lembrar.querySelector("input").addEventListener("change", (ev) => {
      storage.set("sl-pref-notif", ev.target.checked);
      toast("Preferência salva");
    });
    openModal("Configurações", [
      el("p", { text: "Opções de configuração da conta e preferências do sistema." }),
      lembrar,
      el("a", { href: "../comecar/comecar.html", class: "btn-secondary btn-block", text: "Refazer questionário inicial" }),
      el("button", { class: "btn-secondary btn-block", "data-action": "reset-data", text: "Restaurar dados de exemplo" }),
    ]);
  });

  acao("reset-data", () => {
    confirmar({
      titulo: "Restaurar dados de exemplo?",
      texto: "Seus treinos, histórico, refeições, pesos e preferências voltam ao exemplo inicial.",
      rotulo: "Restaurar",
      perigo: true,
      fn: () => {
        [
          "sl-treinos", "sl-salvos", "sl-seguindo", "sl-reservas", "sl-perfil", "sl-pesos", "sl-agua",
          "sl-refeicoes", "sl-historico", "sl-treino-atual", "sl-desafio", "sl-lidas",
        ].forEach(storage.remove);
        window.location.reload();
      },
    });
  });

  acao("logout", (alvo, e) => {
    e.preventDefault();
    storage.remove("sl-sessao");
    window.location.href = "../../login/login.html";
  });

  function itemLista(titulo, texto) {
    return el("li", {}, [el("div", {}, [el("strong", { text: titulo }), el("span", { text: texto })])]);
  }

  // Notificações e mensagens: o número some depois de abrir
  function marcarLidas() {
    const lidas = storage.get("sl-lidas", []);
    document.querySelectorAll("[data-badge]").forEach((botao) => {
      const lida = lidas.includes(botao.dataset.badge);
      const badge = botao.querySelector(".badge");
      if (badge) badge.hidden = lida;
      botao.setAttribute("aria-label", lida ? botao.dataset.rotulo : botao.dataset.rotuloNovas);
    });
  }

  function abrirCaixa(tipo, titulo, itens) {
    const lidas = storage.get("sl-lidas", []);
    if (!lidas.includes(tipo)) storage.set("sl-lidas", lidas.concat(tipo));
    marcarLidas();
    openModal(titulo, el("ul", { class: "list-panel" }, itens));
  }

  acao("open-notifications", () => {
    const { nestaSemana, meta } = estatisticas();
    const faltam = Math.max(0, meta - nestaSemana);
    abrirCaixa("notificacoes", "Notificações", [
      itemLista(
        faltam ? "Meta semanal em andamento" : "Meta semanal batida!",
        faltam ? `Faltam ${faltam} treino${faltam > 1 ? "s" : ""} para completar ${meta}/${meta}.` : `Você completou ${nestaSemana} treinos nesta semana.`,
      ),
      itemLista("Ana Souza publicou um novo plano", "Cardápio de alta proteína"),
      itemLista("Desafio 30 Dias", "Você está no dia 6. Continue!"),
    ]);
  });

  acao("open-messages", () =>
    abrirCaixa("mensagens", "Mensagens", [itemLista("Rafael Souza", "Bora ajustar sua carga no agachamento?")]),
  );

  function linkTreino(id) {
    return "../treino/treino.html?id=" + encodeURIComponent(id);
  }

  // Detalhe do treino: lista de exercícios + botão para começar
  acao("open-workout-modal", (alvo) => {
    const treino = acharTreino(alvo.dataset.id) || { ...CATALOGO[0], doCatalogo: true };
    const exercicios = exerciciosDe(treino);
    const meta = treino.doCatalogo
      ? `${treino.objetivo} • ${treino.nivel} • ${treino.duracao} min`
      : `${treino.grupo} • ${exercicios.length} exercícios`;
    openModal(treino.nome, [
      el("p", { class: "modal-text", text: meta }),
      el(
        "ol",
        { class: "list-panel exercise-preview" },
        exercicios.map((e, i) =>
          el("li", {}, [
            el("span", { class: "exercise-index", "aria-hidden": "true", text: String(i + 1) }),
            el("div", {}, [el("strong", { text: e.nome }), el("span", { text: resumoExercicio(e) })]),
          ]),
        ),
      ),
      el("a", { href: linkTreino(treino.id), class: "btn-primary btn-block", text: "Iniciar treino" }),
    ]);
  });

  function resumoExercicio(e) {
    const reps = typeof e.reps === "number" ? `${e.reps} reps` : e.reps;
    const carga = e.carga ? ` • ${num(e.carga, e.carga % 1 ? 1 : 0)} kg` : "";
    return `${e.series} × ${reps}${carga}`;
  }

  acao("continue-workout", (alvo) => {
    const atual = treinoAtual();
    const id = alvo.dataset.id || (atual && atual.treinoId) || treinosDoUsuario()[0]?.id || CATALOGO[0].id;
    window.location.href = linkTreino(id);
  });

  acao("select-plan", () => toast("Em breve: pagamento dos planos"));

  acao("join-challenge", (alvo) => {
    storage.set("sl-desafio", { inicio: new Date().toISOString() });
    alvo.textContent = "Participando";
    alvo.disabled = true;
    toast("Você entrou no desafio!");
  });

  acao("toggle-search", () => {
    if (fecharBusca()) return;
    topbar.classList.add("search-aberta");
    searchToggle.setAttribute("aria-expanded", "true");
    searchToggle.setAttribute("aria-label", "Fechar busca");
    globalSearch.focus();
  });

  // Salvar treino: vale para Início, Descobrir e Salvos
  acao("toggle-save", (alvo) => {
    const id = alvo.dataset.id;
    let salvos = storage.get("sl-salvos", []);
    salvos = salvos.includes(id) ? salvos.filter((s) => s !== id) : salvos.concat(id);
    storage.set("sl-salvos", salvos);
    const salvo = salvos.includes(id);
    document.querySelectorAll(`[data-action="toggle-save"][data-id="${id}"]`).forEach((btn) => {
      btn.classList.toggle("is-saved", salvo);
      btn.setAttribute("aria-pressed", String(salvo));
      btn.setAttribute("aria-label", salvo ? "Remover dos salvos" : "Salvar treino");
    });
    toast(salvo ? "Treino salvo" : "Removido dos salvos");
    document.dispatchEvent(new CustomEvent("sl:salvos"));
  });

  // Seguir profissional: vale para Início e Profissionais
  acao("follow-pro", (alvo) => {
    const nome = alvo.dataset.nome || alvo.closest(".pro-card").querySelector("h3").textContent;
    let seguindo = storage.get("sl-seguindo", []);
    seguindo = seguindo.includes(nome) ? seguindo.filter((n) => n !== nome) : seguindo.concat(nome);
    storage.set("sl-seguindo", seguindo);
    marcarSeguindo();
  });

  function marcarSeguindo() {
    const seguindo = storage.get("sl-seguindo", []);
    document.querySelectorAll(".pro-card").forEach((card) => {
      const btn = card.querySelector('[data-action="follow-pro"]');
      if (!btn) return;
      const segue = seguindo.includes(card.querySelector("h3").textContent);
      btn.textContent = segue ? "Seguindo" : "Seguir";
      btn.className = segue ? "btn-primary" : "btn-secondary";
      btn.setAttribute("aria-pressed", String(segue));
    });
  }

  acao("edit-profile", () => {
    const usuario = getUsuario();
    const form = el("form", { class: "modal-form" }, [
      campo("perfil-nome", "Nome", { required: true, maxlength: 50 }),
      campo("perfil-bio", "Bio", { multiline: true, maxlength: 160 }),
      el("button", { type: "submit", class: "btn-primary", text: "Salvar alterações" }),
    ]);
    form.querySelector("#perfil-nome").value = usuario.nome;
    form.querySelector("#perfil-bio").value = usuario.bio;

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nome = form.querySelector("#perfil-nome").value.trim();
      if (!nome) {
        form.querySelector("#perfil-nome").focus();
        return;
      }
      perfilSalvo.nome = nome;
      perfilSalvo.bio = form.querySelector("#perfil-bio").value.trim();
      storage.set("sl-perfil", perfilSalvo);
      renderUsuario();
      closeModal();
      toast("Perfil atualizado");
    });

    openModal("Editar perfil", form);
  });

  document.addEventListener("click", (e) => {
    const alvo = e.target.closest("[data-action]");
    if (!alvo) {
      // Links "#" vazios (redes sociais) não devem pular para o topo
      if (e.target.closest('a[href="#"]')) e.preventDefault();
      return;
    }
    const fn = acoes[alvo.dataset.action];
    if (fn) fn(alvo, e);
  });

  /* ============================================
     API PÚBLICA + INICIALIZAÇÃO
     ============================================ */

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
    pagina(fn) {
      document.addEventListener("DOMContentLoaded", fn);
    },
  };

  // App instalável no celular (só funciona em http/https, não em file://)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("../../sw.js").catch(() => {}));
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderUsuario();
    renderSaudacao();
    aplicarProgresso();
    marcarSeguindo();
    marcarLidas();
    if (storage.get("sl-desafio", null)) {
      document.querySelectorAll('[data-action="join-challenge"]').forEach((btn) => {
        btn.textContent = "Participando";
        btn.disabled = true;
      });
    }
  });
})();
