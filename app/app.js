/*
 * Núcleo do app, comum a todas as páginas de app/:
 * helpers, sessão do usuário, sidebar, menu mobile, modal, toast,
 * busca e as ações que aparecem em mais de uma página.
 *
 * Cada página carrega, nesta ordem:
 *   ../shared/planos.js (só planos.html) → dados.js → app.js → paginas/<nome>.js
 * e se registra com SL.pagina(function () { ... }).
 */
(function () {
  "use strict";

  const PAGINAS = [
    "inicio", "descobrir", "treinos", "aulas", "alimentacao", "evolucao",
    "profissionais", "planos", "salvos", "academia", "perfil",
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
    window.location.replace("../login/login.html?voltar=" + encodeURIComponent(paginaAtual));
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

  const iconeSalvar = () => icone(["M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"]);
  const iconeLixeira = () => icone(["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"]);

  /* ============================================
     TOAST
     ============================================ */

  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(mensagem) {
    toastEl.textContent = mensagem;
    toastEl.hidden = false;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
      toastEl.hidden = true;
    }, 2600);
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
  }

  /* ============================================
     SIDEBAR: item ativo + menu mobile
     ============================================ */

  document.querySelectorAll(".nav-link[data-pagina]").forEach((link) => {
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
    if (!sidebar.classList.contains("is-open")) return;
    sidebar.classList.remove("is-open");
    sidebarOverlay.classList.add("hidden");
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarToggle.setAttribute("aria-label", "Abrir menu");
    sidebarToggle.focus();
  }

  sidebarToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) closeSidebar();
    else openSidebar();
  });
  sidebarOverlay.addEventListener("click", closeSidebar);

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
      else closeSidebar();
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
      el("div", { class: "card-img-placeholder", "data-objetivo": slug(t.objetivo) }, [el("span", { class: "card-tag", text: t.objetivo })]),
      el("div", { class: "card-details" }, [
        el("h3", { text: t.nome }),
        el("p", { class: "category", text: `${t.grupo} • ${t.nivel}` }),
        el("p", { class: "meta" }, [`${t.duracao} min • `, nota(t.nota)]),
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

  /* ============================================
     BUSCA GLOBAL (leva para a página certa)
     ============================================ */

  const { CATALOGO, PROFISSIONAIS, AULAS } = window.SL_DADOS;
  const globalSearch = document.getElementById("global-search");
  const searchDropdown = document.getElementById("search-results-dropdown");

  globalSearch.addEventListener("input", () => {
    const termo = globalSearch.value.trim().toLowerCase();
    if (!termo) {
      searchDropdown.classList.add("hidden");
      return;
    }

    const resultados = [
      ...CATALOGO.filter((t) => t.nome.toLowerCase().includes(termo) || t.objetivo.toLowerCase().includes(termo)).map((t) => ({ titulo: t.nome, tipo: "Treino", href: "descobrir.html" })),
      ...PROFISSIONAIS.filter((p) => p.nome.toLowerCase().includes(termo) || p.especialidade.toLowerCase().includes(termo)).map((p) => ({ titulo: p.nome, tipo: p.especialidade, href: "profissionais.html" })),
      ...AULAS.filter((a) => a.nome.toLowerCase().includes(termo)).map((a) => ({ titulo: a.nome, tipo: "Aula", href: "aulas.html" })),
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
    if (!e.target.closest(".search-box")) searchDropdown.classList.add("hidden");
  });

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
      el("button", { class: "btn-secondary btn-block", "data-action": "reset-data", text: "Restaurar dados de exemplo" }),
    ]);
  });

  acao("reset-data", () => {
    ["sl-treinos", "sl-salvos", "sl-seguindo", "sl-reservas", "sl-perfil", "sl-pesos", "sl-agua", "sl-refeicoes"].forEach(storage.remove);
    window.location.reload();
  });

  acao("logout", (alvo, e) => {
    e.preventDefault();
    storage.remove("sl-sessao");
    window.location.href = "../login/login.html";
  });

  function itemLista(titulo, texto) {
    return el("li", {}, [el("div", {}, [el("strong", { text: titulo }), el("span", { text: texto })])]);
  }

  acao("open-notifications", () =>
    openModal("Notificações", el("ul", { class: "list-panel" }, [
      itemLista("Meta semanal quase batida", "Falta 1 treino para completar 4/4."),
      itemLista("Ana Souza publicou um novo plano", "Cardápio de alta proteína"),
      itemLista("Desafio 30 Dias", "Você está no dia 6. Continue!"),
    ])),
  );

  acao("open-messages", () =>
    openModal("Mensagens", el("ul", { class: "list-panel" }, [itemLista("Rafael Souza", "Bora ajustar sua carga no agachamento?")])),
  );

  acao("open-workout-modal", (alvo) => {
    const treino = CATALOGO.find((t) => t.id === alvo.dataset.id) || CATALOGO[0];
    openModal(treino.nome, [
      el("p", { text: "Visualização completa dos exercícios, cargas, séries e intervalos programados." }),
      el("ul", { class: "list-panel" }, [
        itemLista("Objetivo", treino.objetivo),
        itemLista("Nível", treino.nivel),
        itemLista("Duração", `${treino.duracao} min`),
      ]),
    ]);
  });

  acao("continue-workout", () => toast("Bom treino!"));
  acao("select-plan", () => toast("Em breve: pagamento dos planos"));

  acao("join-challenge", (alvo) => {
    alvo.textContent = "Participando";
    alvo.disabled = true;
    toast("Você entrou no desafio!");
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
    el,
    svg,
    icone,
    storage,
    initials,
    slug,
    nota,
    iconeLixeira,
    toast,
    openModal,
    closeModal,
    campo,
    estadoVazio,
    carregar,
    aplicarProgresso,
    cardTreinoCatalogo,
    marcarSeguindo,
    acao,
    getUsuario,
    renderUsuario,
    pagina(fn) {
      document.addEventListener("DOMContentLoaded", fn);
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderUsuario();
    aplicarProgresso();
    marcarSeguindo();
  });
})();
