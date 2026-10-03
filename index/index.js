document.addEventListener("DOMContentLoaded", () => {
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
      if (child == null) return;
      node.append(typeof child === "string" ? document.createTextNode(child) : child);
    });
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
    const estrela = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    estrela.setAttribute("viewBox", "0 0 24 24");
    estrela.setAttribute("class", "icon-star");
    estrela.setAttribute("aria-hidden", "true");
    const poligono = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poligono.setAttribute("points", "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2");
    estrela.append(poligono);
    return el("span", { class: "rating" }, [el("span", { class: "sr-only", text: "Nota " }), estrela, " " + valor.toFixed(1)]);
  }

  // Ícone de marcador (salvar)
  function iconeSalvar() {
    const icone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icone.setAttribute("viewBox", "0 0 24 24");
    icone.setAttribute("class", "icon");
    icone.setAttribute("aria-hidden", "true");
    const caminho = document.createElementNS("http://www.w3.org/2000/svg", "path");
    caminho.setAttribute("d", "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z");
    icone.append(caminho);
    return icone;
  }

  function iconeLixeira() {
    const icone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icone.setAttribute("viewBox", "0 0 24 24");
    icone.setAttribute("class", "icon");
    icone.setAttribute("aria-hidden", "true");
    ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"].forEach((d) => {
      const caminho = document.createElementNS("http://www.w3.org/2000/svg", "path");
      caminho.setAttribute("d", d);
      icone.append(caminho);
    });
    return icone;
  }

  const toastEl = document.getElementById("toast");
  let toastTimer;
  function toast(mensagem) {
    if (!toastEl) return;
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
     DADOS DE EXEMPLO
     ============================================ */

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

  /* ============================================
     USUÁRIO (sessão salva pelo login/cadastro)
     ============================================ */

  const sessao = storage.get("sl-sessao", null);
  const perfilSalvo = storage.get("sl-perfil", {});

  function getUsuario() {
    const nome = perfilSalvo.nome || (sessao && sessao.nome) || "Visitante";
    return {
      nome,
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
     NAVEGAÇÃO ENTRE VIEWS (sincronizada com o #hash)
     ============================================ */

  const views = document.querySelectorAll(".view-section");
  const navLinks = document.querySelectorAll(".nav-link[data-view]");
  const mainEl = document.getElementById("conteudo");

  function showView(nome, { focar = false } = {}) {
    const alvo = document.getElementById("view-" + nome);
    if (!alvo) return false;

    views.forEach((view) => {
      const ativa = view === alvo;
      view.classList.toggle("active", ativa);
      view.classList.toggle("hidden", !ativa);
    });

    navLinks.forEach((link) => {
      const ativo = link.dataset.view === nome;
      link.classList.toggle("active", ativo);
      if (ativo) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const titulo = alvo.querySelector("h1");
    document.title = (titulo ? titulo.textContent.trim() + " — " : "") + "Saúde Life";

    if (focar && mainEl) {
      mainEl.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }
    return true;
  }

  function viewDoHash() {
    return window.location.hash.replace("#", "") || "inicio";
  }

  window.addEventListener("hashchange", () => {
    // Hashes que não são views (ex.: #contato) não trocam de tela
    if (showView(viewDoHash(), { focar: true })) closeSidebar();
  });

  /* ============================================
     SIDEBAR MOBILE
     ============================================ */

  const sidebar = document.getElementById("app-sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarOverlay = document.getElementById("sidebar-overlay");

  function openSidebar() {
    sidebar.classList.add("is-open");
    sidebarOverlay.classList.remove("hidden");
    sidebarToggle.setAttribute("aria-expanded", "true");
    sidebarToggle.setAttribute("aria-label", "Fechar menu");
    const primeiroLink = sidebar.querySelector(".nav-link");
    if (primeiroLink) primeiroLink.focus();
  }

  function closeSidebar() {
    if (!sidebar.classList.contains("is-open")) return;
    sidebar.classList.remove("is-open");
    sidebarOverlay.classList.add("hidden");
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarToggle.setAttribute("aria-label", "Abrir menu");
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

    const focaveis = modalWindow.querySelectorAll(FOCAVEIS);
    // Foca o primeiro campo do formulário; senão, o botão de fechar
    const primeiroCampo = modalBody.querySelector("input, select, textarea");
    (primeiroCampo || focaveis[0]).focus();
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
        rows: attrs.multiline ? 3 : null,
        maxlength: attrs.maxlength,
      }),
    ]);
  }

  /* ============================================
     TREINOS (salvos no localStorage)
     ============================================ */

  let treinos = storage.get("sl-treinos", TREINOS_PADRAO);
  const listaTreinos = document.querySelector(".workouts-list-container");

  function renderTreinos() {
    listaTreinos.replaceChildren();

    if (!treinos.length) {
      listaTreinos.append(
        estadoVazio(
          "Você ainda não criou treinos",
          "Monte seu primeiro treino e acompanhe cada série.",
          el("button", { class: "btn-primary", "data-action": "create-workout", text: "+ Criar treino" }),
        ),
      );
    }

    treinos.forEach((treino) => {
      listaTreinos.append(
        el("article", { class: "workout-card workout-card-col" }, [
          el("div", { class: "card-info" }, [
            el("h3", { text: treino.nome }),
            el("p", { class: "muscle-group", text: treino.grupo }),
            el("p", { class: "duration", text: `${treino.exercicios} exercícios • Último: ${treino.ultimo}` }),
          ]),
          el("div", { class: "card-actions" }, [
            el("button", { class: "btn-primary", "data-action": "continue-workout", text: "Iniciar" }),
            el("button", {
              class: "btn-icon btn-danger",
              "data-action": "delete-workout",
              "data-id": treino.id,
              "aria-label": `Excluir treino ${treino.nome}`,
            }, [iconeLixeira()]),
          ]),
        ]),
      );
    });

    document.querySelectorAll('[data-render="treinos-count"]').forEach((n) => (n.textContent = treinos.length));
  }

  function abrirCriarTreino() {
    const form = el("form", { class: "modal-form" }, [
      campo("treino-nome", "Nome do Treino", { placeholder: "Ex: Membros Superiores B", required: true, maxlength: 60 }),
      campo("treino-grupo", "Grupo muscular", { placeholder: "Ex: Peito e Tríceps", maxlength: 60 }),
      campo("treino-exercicios", "Nº de exercícios", { type: "number", min: 1, max: 30, placeholder: "6" }),
      el("button", { type: "submit", class: "btn-primary", text: "Salvar Treino" }),
    ]);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.querySelector("#treino-nome").value.trim();
      if (!nome) {
        form.querySelector("#treino-nome").focus();
        return;
      }
      treinos.unshift({
        id: "t" + Date.now(),
        nome,
        grupo: form.querySelector("#treino-grupo").value.trim() || "Corpo inteiro",
        exercicios: Number(form.querySelector("#treino-exercicios").value) || 1,
        ultimo: "Nunca",
      });
      storage.set("sl-treinos", treinos);
      renderTreinos();
      closeModal();
      toast("Treino salvo!");
      window.location.hash = "treinos";
    });

    openModal("Criar Novo Treino", form);
  }

  /* ============================================
     DESCOBRIR (filtros reais) + SALVOS
     ============================================ */

  let salvos = storage.get("sl-salvos", []);
  const filtros = { objetivo: "", nivel: "", duracao: "", grupo: "" };
  const gridDescobrir = document.querySelector('[data-render="descobrir"]');
  const contadorDescobrir = document.querySelector('[data-render="descobrir-count"]');
  const btnLimpar = document.querySelector('[data-action="clear-filters"]');

  function faixaDuracao(min) {
    if (min <= 20) return "curto";
    if (min <= 40) return "medio";
    return "longo";
  }

  function cardTreinoCatalogo(t) {
    const salvo = salvos.includes(t.id);
    return el("article", { class: "rec-card rec-card-grid" }, [
      el("div", { class: "card-img-placeholder", "data-objetivo": slug(t.objetivo) }, [
        el("span", { class: "card-tag", text: t.objetivo }),
      ]),
      el("div", { class: "card-details" }, [
        el("h3", { text: t.nome }),
        el("p", { class: "category", text: `${t.grupo} • ${t.nivel}` }),
        el("p", { class: "meta" }, [`${t.duracao} min • `, nota(t.nota)]),
        el("div", { class: "card-actions" }, [
          el("button", { class: "btn-secondary", "data-action": "open-workout-modal", "data-id": t.id, text: "Abrir" }),
          el("button", {
            class: "btn-icon btn-save" + (salvo ? " is-saved" : ""),
            "data-action": "toggle-save",
            "data-id": t.id,
            "aria-pressed": String(salvo),
            "aria-label": salvo ? `Remover ${t.nome} dos salvos` : `Salvar ${t.nome}`,
          }, [iconeSalvar()]),
        ]),
      ]),
    ]);
  }

  function renderDescobrir() {
    const resultado = CATALOGO.filter(
      (t) =>
        (!filtros.objetivo || t.objetivo === filtros.objetivo) &&
        (!filtros.nivel || t.nivel === filtros.nivel) &&
        (!filtros.duracao || faixaDuracao(t.duracao) === filtros.duracao) &&
        (!filtros.grupo || t.grupo === filtros.grupo),
    );

    gridDescobrir.replaceChildren(...resultado.map(cardTreinoCatalogo));
    if (!resultado.length) {
      gridDescobrir.append(
        estadoVazio("Nenhum treino encontrado", "Tente remover algum filtro.", null),
      );
    }
    contadorDescobrir.textContent = `(${resultado.length})`;

    const temFiltro = Object.values(filtros).some(Boolean);
    btnLimpar.hidden = !temFiltro;

    document.querySelectorAll(".category-pill").forEach((pill) => {
      const ativo = pill.dataset.category === filtros.objetivo;
      pill.classList.toggle("active", ativo);
      pill.setAttribute("aria-pressed", String(ativo));
    });
    document.querySelectorAll("[data-filter]").forEach((select) => {
      select.value = filtros[select.dataset.filter];
    });
  }

  document.querySelectorAll("[data-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      filtros[select.dataset.filter] = select.value;
      renderDescobrir();
    });
  });

  document.querySelectorAll(".category-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      filtros.objetivo = filtros.objetivo === pill.dataset.category ? "" : pill.dataset.category;
      renderDescobrir();
    });
  });

  function renderRecomendados() {
    const alvo = document.querySelector('[data-render="recomendados"]');
    const extras = CATALOGO.filter((t) => t.id !== "fullbody-explosivo").slice(0, 4);
    extras.forEach((t) => alvo.append(cardTreinoCatalogo(t)));
  }

  function renderSalvos() {
    const alvo = document.querySelector('[data-render="salvos"]');
    const itens = CATALOGO.filter((t) => salvos.includes(t.id));
    alvo.replaceChildren(...itens.map(cardTreinoCatalogo));
    if (!itens.length) {
      alvo.append(
        estadoVazio(
          "Nada salvo por aqui",
          "Toque na estrela de um treino para guardar e encontrar depois.",
          el("a", { href: "#descobrir", class: "btn-primary", text: "Descobrir treinos" }),
        ),
      );
    }
  }

  function toggleSalvo(id) {
    salvos = salvos.includes(id) ? salvos.filter((s) => s !== id) : salvos.concat(id);
    storage.set("sl-salvos", salvos);
    renderDescobrir();
    renderSalvos();
    // Atualiza cards de "Recomendados" sem recriar a seção inteira
    document.querySelectorAll(`[data-action="toggle-save"][data-id="${id}"]`).forEach((btn) => {
      const salvo = salvos.includes(id);
      btn.classList.toggle("is-saved", salvo);
      btn.setAttribute("aria-pressed", String(salvo));
      btn.setAttribute("aria-label", salvo ? "Remover dos salvos" : "Salvar treino");
    });
    toast(salvos.includes(id) ? "Treino salvo" : "Removido dos salvos");
  }

  /* ============================================
     PROFISSIONAIS (filtro por especialidade)
     ============================================ */

  let especialidadeAtiva = "";
  let seguindo = storage.get("sl-seguindo", []);
  const gridPros = document.querySelector(".professionals-grid");
  const filtrosPros = document.querySelector('[data-render="pros-filtros"]');

  function botaoSeguir(nome) {
    const segue = seguindo.includes(nome);
    return el("button", {
      class: segue ? "btn-primary" : "btn-secondary",
      "data-action": "follow-pro",
      "data-nome": nome,
      "aria-pressed": String(segue),
      text: segue ? "Seguindo" : "Seguir",
    });
  }

  function renderProfissionais() {
    const especialidades = [...new Set(PROFISSIONAIS.map((p) => p.especialidade))];
    filtrosPros.replaceChildren(
      ...["", ...especialidades].map((esp) =>
        el("button", {
          class: "category-pill" + (esp === especialidadeAtiva ? " active" : ""),
          "data-especialidade": esp,
          "aria-pressed": String(esp === especialidadeAtiva),
          text: esp || "Todos",
        }),
      ),
    );

    const lista = PROFISSIONAIS.filter((p) => !especialidadeAtiva || p.especialidade === especialidadeAtiva);
    gridPros.replaceChildren(
      ...lista.map((p) =>
        el("article", { class: "pro-card" }, [
          el("span", { class: "pro-avatar avatar-initials", "aria-hidden": "true", text: initials(p.nome) }),
          el("h3", { text: p.nome }),
          el("p", { class: "specialty", text: p.especialidade }),
          el("p", { class: "stats" }, [nota(p.nota), ` • ${p.seguidores} seguidores`]),
          botaoSeguir(p.nome),
        ]),
      ),
    );
  }

  filtrosPros.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-especialidade]");
    if (!btn) return;
    especialidadeAtiva = btn.dataset.especialidade;
    renderProfissionais();
  });

  /* ============================================
     AULAS
     ============================================ */

  let reservas = storage.get("sl-reservas", []);

  function renderAulas() {
    const alvo = document.querySelector('[data-render="aulas"]');
    alvo.replaceChildren(
      ...AULAS.map((aula) => {
        const reservado = reservas.includes(aula.nome);
        const vagas = aula.vagas - (reservado ? 1 : 0);
        const lotada = aula.vagas === 0;
        return el("article", { class: "challenge-card" }, [
          el("h3", { text: aula.nome }),
          el("p", { class: "meta", text: `${aula.dia} • ${aula.hora} • com ${aula.professor}` }),
          el("p", {
            class: "meta" + (lotada ? " text-coral" : ""),
            text: lotada ? "Turma lotada" : `${vagas} de ${aula.total} vagas disponíveis`,
          }),
          el("button", {
            class: reservado ? "btn-secondary" : "btn-primary",
            "data-action": "book-class",
            "data-nome": aula.nome,
            disabled: lotada,
            text: lotada ? "Lista de espera em breve" : reservado ? "Cancelar reserva" : "Reservar vaga",
          }),
        ]);
      }),
    );
  }

  /* ============================================
     EVOLUÇÃO — gráficos em SVG puro
     ============================================ */

  const SVG_NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  function renderGrafico(container, valores, unidade) {
    const W = 520;
    const H = 220;
    const pad = { top: 16, right: 16, bottom: 28, left: 40 };
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const folga = (max - min) * 0.15 || 1;
    const yMin = min - folga;
    const yMax = max + folga;

    const x = (i) => pad.left + (i * (W - pad.left - pad.right)) / (valores.length - 1);
    const y = (v) => pad.top + ((yMax - v) * (H - pad.top - pad.bottom)) / (yMax - yMin);

    const primeiro = valores[0];
    const ultimo = valores[valores.length - 1];
    const variacao = ultimo - primeiro;

    const grafico = svg("svg", {
      viewBox: `0 0 ${W} ${H}`,
      class: "chart-svg",
      role: "img",
      "aria-label": `De ${primeiro} para ${ultimo} ${unidade} em ${valores.length} semanas`,
    });

    // Linhas de grade
    [0, 0.5, 1].forEach((t) => {
      const v = yMin + (yMax - yMin) * t;
      grafico.append(svg("line", { x1: pad.left, x2: W - pad.right, y1: y(v), y2: y(v), class: "chart-grid" }));
      const label = svg("text", { x: pad.left - 8, y: y(v) + 4, class: "chart-label", "text-anchor": "end" });
      label.textContent = v.toFixed(0);
      grafico.append(label);
    });

    valores.forEach((_, i) => {
      const label = svg("text", { x: x(i), y: H - 8, class: "chart-label", "text-anchor": "middle" });
      label.textContent = "S" + (i + 1);
      grafico.append(label);
    });

    const pontos = valores.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    const area = `${x(0)},${H - pad.bottom} ${pontos} ${x(valores.length - 1)},${H - pad.bottom}`;
    grafico.append(svg("polygon", { points: area, class: "chart-area" }));
    grafico.append(svg("polyline", { points: pontos, class: "chart-line" }));

    valores.forEach((v, i) => {
      const ponto = svg("circle", { cx: x(i), cy: y(v), r: 4, class: "chart-dot" });
      const titulo = svg("title", {});
      titulo.textContent = `Semana ${i + 1}: ${v} ${unidade}`;
      ponto.append(titulo);
      grafico.append(ponto);
    });

    const resumo = el("p", { class: "chart-summary" }, [
      el("strong", { text: `${ultimo} ${unidade}` }),
      el("span", {
        class: variacao < 0 ? "trend-down" : "trend-up",
        text: `${variacao > 0 ? "+" : ""}${variacao.toFixed(1)} ${unidade} no período`,
      }),
    ]);

    container.append(resumo, grafico);
  }

  /* ============================================
     ALIMENTAÇÃO E BARRAS DE PROGRESSO
     ============================================ */

  function renderMacros() {
    document.querySelectorAll(".macro-card[data-meta]").forEach((card) => {
      const atual = parseFloat(card.dataset.atual);
      const meta = parseFloat(card.dataset.meta);
      const pct = Math.min(100, Math.round((atual / meta) * 100));
      card.append(
        el("div", {
          class: "progress-bar-sm",
          role: "progressbar",
          "aria-label": card.querySelector("span").textContent,
          "aria-valuenow": pct,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
        }, [el("div", { class: "fill", "data-progress": pct })]),
        el("small", { class: "macro-pct", text: `${pct}% da meta` }),
      );
    });
  }

  // Larguras das barras vêm de data-progress (sem style inline no HTML)
  function aplicarProgresso() {
    document.querySelectorAll(".fill[data-progress]").forEach((fill) => {
      fill.style.width = fill.dataset.progress + "%";
    });
  }

  /* ============================================
     BUSCA GLOBAL
     ============================================ */

  const globalSearch = document.getElementById("global-search");
  const searchDropdown = document.getElementById("search-results-dropdown");

  globalSearch.addEventListener("input", () => {
    const termo = globalSearch.value.trim().toLowerCase();
    if (!termo) {
      searchDropdown.classList.add("hidden");
      return;
    }

    const resultados = [
      ...CATALOGO.filter((t) => t.nome.toLowerCase().includes(termo) || t.objetivo.toLowerCase().includes(termo))
        .map((t) => ({ titulo: t.nome, tipo: "Treino", view: "descobrir" })),
      ...PROFISSIONAIS.filter((p) => p.nome.toLowerCase().includes(termo) || p.especialidade.toLowerCase().includes(termo))
        .map((p) => ({ titulo: p.nome, tipo: p.especialidade, view: "profissionais" })),
      ...AULAS.filter((a) => a.nome.toLowerCase().includes(termo))
        .map((a) => ({ titulo: a.nome, tipo: "Aula", view: "aulas" })),
    ].slice(0, 6);

    if (!resultados.length) {
      searchDropdown.replaceChildren(
        el("div", { class: "search-status", text: `Nada encontrado para "${globalSearch.value.trim()}"` }),
      );
    } else {
      searchDropdown.replaceChildren(
        ...resultados.map((r) =>
          el("a", { href: "#" + r.view, class: "search-result" }, [
            el("strong", { text: r.titulo }),
            el("span", { text: r.tipo }),
          ]),
        ),
      );
    }
    searchDropdown.classList.remove("hidden");
  });

  searchDropdown.addEventListener("click", (e) => {
    if (e.target.closest(".search-result")) {
      searchDropdown.classList.add("hidden");
      globalSearch.value = "";
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) searchDropdown.classList.add("hidden");
  });

  /* ============================================
     ESTADO VAZIO
     ============================================ */

  function estadoVazio(titulo, texto, acao) {
    const ilustracao = svg("svg", { viewBox: "0 0 64 64", class: "empty-illustration", "aria-hidden": "true" });
    ilustracao.append(
      svg("circle", { cx: 32, cy: 32, r: 26, class: "empty-ring" }),
      svg("path", { d: "M14 34h8l4-10 6 18 5-12h13", class: "empty-pulse" }),
    );
    return el("div", { class: "empty-state" }, [
      ilustracao,
      el("h3", { text: titulo }),
      el("p", { text: texto }),
      acao,
    ]);
  }

  /* ============================================
     AÇÕES (delegação de cliques)
     ============================================ */

  document.addEventListener("click", (e) => {
    const alvo = e.target.closest("[data-action]");
    if (!alvo) {
      // Links "#" vazios (redes sociais) não devem trocar de tela
      const linkVazio = e.target.closest('a[href="#"]');
      if (linkVazio) e.preventDefault();
      return;
    }
    const action = alvo.dataset.action;

    switch (action) {
      case "close-modal":
        closeModal();
        break;

      case "open-settings": {
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
        break;
      }

      case "reset-data":
        ["sl-treinos", "sl-salvos", "sl-seguindo", "sl-reservas", "sl-perfil"].forEach(storage.remove);
        window.location.reload();
        break;

      case "logout":
        e.preventDefault();
        storage.remove("sl-sessao");
        window.location.href = "../login/login.html";
        break;

      case "open-notifications":
        openModal("Notificações", el("ul", { class: "list-panel" }, [
          el("li", {}, [el("div", {}, [el("strong", { text: "Meta semanal quase batida" }), el("span", { text: "Falta 1 treino para completar 4/4." })])]),
          el("li", {}, [el("div", {}, [el("strong", { text: "Ana Souza publicou um novo plano" }), el("span", { text: "Cardápio de alta proteína" })])]),
          el("li", {}, [el("div", {}, [el("strong", { text: "Desafio 30 Dias" }), el("span", { text: "Você está no dia 6. Continue!" })])]),
        ]));
        break;

      case "open-messages":
        openModal("Mensagens", el("ul", { class: "list-panel" }, [
          el("li", {}, [el("div", {}, [el("strong", { text: "Rafael Souza" }), el("span", { text: "Bora ajustar sua carga no agachamento?" })])]),
        ]));
        break;

      case "open-workout-modal": {
        const treino = CATALOGO.find((t) => t.id === alvo.dataset.id) || CATALOGO[0];
        openModal(treino.nome, [
          el("p", { text: "Visualização completa dos exercícios, cargas, séries e intervalos programados." }),
          el("ul", { class: "list-panel" }, [
            el("li", {}, [el("div", {}, [el("strong", { text: "Objetivo" }), el("span", { text: treino.objetivo })])]),
            el("li", {}, [el("div", {}, [el("strong", { text: "Nível" }), el("span", { text: treino.nivel })])]),
            el("li", {}, [el("div", {}, [el("strong", { text: "Duração" }), el("span", { text: `${treino.duracao} min` })])]),
          ]),
        ]);
        break;
      }

      case "create-workout":
        abrirCriarTreino();
        break;

      case "delete-workout": {
        const treino = treinos.find((t) => t.id === alvo.dataset.id);
        if (treino && confirm(`Excluir o treino "${treino.nome}"?`)) {
          treinos = treinos.filter((t) => t.id !== treino.id);
          storage.set("sl-treinos", treinos);
          renderTreinos();
          toast("Treino excluído");
        }
        break;
      }

      case "continue-workout":
        toast("Bom treino!");
        break;

      case "toggle-save":
        toggleSalvo(alvo.dataset.id);
        break;

      case "follow-pro": {
        const nome = alvo.dataset.nome || alvo.closest(".pro-card").querySelector("h3").textContent;
        seguindo = seguindo.includes(nome) ? seguindo.filter((n) => n !== nome) : seguindo.concat(nome);
        storage.set("sl-seguindo", seguindo);
        const segue = seguindo.includes(nome);
        document.querySelectorAll(".pro-card").forEach((card) => {
          const btn = card.querySelector('[data-action="follow-pro"]');
          if (card.querySelector("h3").textContent !== nome || !btn) return;
          btn.textContent = segue ? "Seguindo" : "Seguir";
          btn.className = segue ? "btn-primary" : "btn-secondary";
          btn.setAttribute("aria-pressed", String(segue));
        });
        break;
      }

      case "join-challenge":
        alvo.textContent = "Participando";
        alvo.disabled = true;
        toast("Você entrou no desafio!");
        break;

      case "book-class": {
        const nome = alvo.dataset.nome;
        reservas = reservas.includes(nome) ? reservas.filter((r) => r !== nome) : reservas.concat(nome);
        storage.set("sl-reservas", reservas);
        renderAulas();
        toast(reservas.includes(nome) ? "Vaga reservada!" : "Reserva cancelada");
        break;
      }

      case "select-plan":
        toast("Em breve: pagamento dos planos");
        break;

      case "clear-filters":
        Object.keys(filtros).forEach((k) => (filtros[k] = ""));
        renderDescobrir();
        break;

      case "edit-profile": {
        const usuario = getUsuario();
        const form = el("form", { class: "modal-form" }, [
          campo("perfil-nome", "Nome", { required: true, maxlength: 50 }),
          campo("perfil-bio", "Bio", { multiline: true, maxlength: 160 }),
          el("button", { type: "submit", class: "btn-primary", text: "Salvar Alterações" }),
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

        openModal("Editar Perfil", form);
        break;
      }
    }
  });

  /* ============================================
     INICIALIZAÇÃO (com skeleton enquanto "carrega")
     ============================================ */

  function skeleton(quantidade) {
    return Array.from({ length: quantidade }, () =>
      el("div", { class: "skeleton-card", "aria-hidden": "true" }, [
        el("div", { class: "skeleton-line is-block" }),
        el("div", { class: "skeleton-line" }),
        el("div", { class: "skeleton-line is-short" }),
      ]),
    );
  }

  const gridsDinamicos = [
    listaTreinos,
    gridDescobrir,
    gridPros,
    document.querySelector('[data-render="aulas"]'),
    document.querySelector('[data-render="salvos"]'),
  ];
  gridsDinamicos.forEach((grid) => {
    grid.setAttribute("aria-busy", "true");
    grid.replaceChildren(...skeleton(3));
  });

  renderUsuario();
  aplicarProgresso();
  showView(viewDoHash());

  // Simula o tempo de resposta de um servidor
  setTimeout(() => {
    renderTreinos();
    renderRecomendados();
    renderDescobrir();
    renderSalvos();
    renderProfissionais();
    // Sincroniza o card fixo de "Profissionais em destaque" com quem já é seguido
    document.querySelectorAll('#view-inicio .pro-card [data-action="follow-pro"]').forEach((btn) => {
      const nome = btn.closest(".pro-card").querySelector("h3").textContent;
      if (seguindo.includes(nome)) {
        btn.textContent = "Seguindo";
        btn.className = "btn-primary";
        btn.setAttribute("aria-pressed", "true");
      }
    });
    renderAulas();
    renderMacros();
    renderGrafico(document.querySelector('[data-chart="peso"]'), EVOLUCAO.peso, "kg");
    renderGrafico(document.querySelector('[data-chart="cargas"]'), EVOLUCAO.cargas, "kg");
    aplicarProgresso();
    gridsDinamicos.forEach((grid) => grid.removeAttribute("aria-busy"));
  }, 450);
});
