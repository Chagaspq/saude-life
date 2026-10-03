/*
 * Planos da Saúde Life: mesmo conteúdo na página pública (planos.html)
 * e na view "Planos" do app (index.html).
 *
 * Uso: <div data-planos data-cta="../cadastro/cadastro.html"></div>
 *      Sem data-cta, os botões ficam como <button data-action="select-plan">.
 */
(function () {
  "use strict";

  const PLANOS = [
    {
      nome: "Free",
      mensal: 0,
      itens: [
        "Treinos básicos da plataforma",
        "Acompanhamento simples de evolução",
        "Acesso à comunidade",
      ],
      cta: "Começar grátis",
    },
    {
      nome: "Premium",
      mensal: 29.9,
      destaque: true,
      itens: [
        "Acesso total à plataforma",
        "Treinos personalizados com IA",
        "Relatórios avançados de evolução",
        "Suporte prioritário",
      ],
      cta: "Assinar Premium",
    },
    {
      nome: "Profissional",
      mensal: 79.9,
      itens: [
        "Ferramentas pra personal trainers",
        "Gestão de alunos e planos de treino",
        "Relatórios de desempenho dos alunos",
      ],
      cta: "Assinar Pro",
    },
    {
      nome: "Academia",
      mensal: null,
      itens: [
        "Sistema completo de gestão",
        "Múltiplos professores e alunos",
        "Relatórios e suporte dedicado",
      ],
      cta: "Falar com consultor",
    },
  ];

  const DESCONTO_ANUAL = 0.2;

  function reais(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(function ([k, v]) {
      if (v === false || v == null) return;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      node.append(c);
    });
    return node;
  }

  function preco(plano, anual) {
    if (plano.mensal === null) return [el("span", { class: "plan-price-value", text: "Consulte" })];
    if (plano.mensal === 0) return [el("span", { class: "plan-price-value", text: "R$ 0" })];

    const mensal = anual ? plano.mensal * (1 - DESCONTO_ANUAL) : plano.mensal;
    const partes = [
      el("span", { class: "plan-price-value", text: reais(mensal) }),
      el("span", { class: "plan-price-period", text: "/mês" }),
    ];
    if (anual) {
      partes.push(
        el("small", {
          class: "plan-price-note",
          text: reais(mensal * 12) + " cobrados por ano",
        }),
      );
    }
    return partes;
  }

  function render(container) {
    const ctaHref = container.dataset.cta;
    let anual = false;

    const toggle = el("div", { class: "billing-toggle", role: "group", "aria-label": "Período de cobrança" }, [
      el("button", { type: "button", class: "billing-option is-active", "data-periodo": "mensal", "aria-pressed": "true", text: "Mensal" }),
      el("button", { type: "button", class: "billing-option", "data-periodo": "anual", "aria-pressed": "false" }, [
        "Anual ",
        el("span", { class: "billing-badge", text: "-20%" }),
      ]),
    ]);

    const grid = el("div", { class: "plans-grid" });

    function desenhar() {
      grid.replaceChildren.apply(
        grid,
        PLANOS.map(function (plano) {
          const botaoClasse = plano.destaque ? "plan-btn plan-btn-primary" : "plan-btn plan-btn-secondary";
          const botao = ctaHref
            ? el("a", { href: ctaHref, class: botaoClasse, text: plano.cta })
            : el("button", { type: "button", class: botaoClasse, "data-action": "select-plan", text: plano.cta });

          return el("article", { class: "plan-card" + (plano.destaque ? " plan-card-highlight" : "") }, [
            plano.destaque ? el("span", { class: "plan-tag", text: "Mais escolhido" }) : "",
            el("h2", { class: "plan-name", text: plano.nome }),
            el("p", { class: "plan-price" }, preco(plano, anual)),
            el(
              "ul",
              { class: "plan-features" },
              plano.itens.map(function (item) {
                return el("li", { text: item });
              }),
            ),
            botao,
          ]);
        }),
      );
    }

    toggle.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-periodo]");
      if (!btn) return;
      anual = btn.dataset.periodo === "anual";
      toggle.querySelectorAll("[data-periodo]").forEach(function (b) {
        const ativo = b === btn;
        b.classList.toggle("is-active", ativo);
        b.setAttribute("aria-pressed", String(ativo));
      });
      desenhar();
    });

    desenhar();
    container.replaceChildren(toggle, grid);
  }

  document.querySelectorAll("[data-planos]").forEach(render);
})();
