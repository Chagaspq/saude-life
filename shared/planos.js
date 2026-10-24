/*
 * Planos da Saúde Life: mesmo conteúdo na página pública (planos.html)
 * e na página Planos do app (app/planos/planos.html).
 *
 * Uso: <div data-planos data-cta="../cadastro/cadastro.html"></div>
 *      data-plano-atual="Free" marca o plano atual (usado no app).
 *      Sem data-cta, os botões ficam como <button data-action="select-plan">.
 */
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Lista dos planos
  const PLANOS = [
    // Free: grátis para sempre
    {
      // Nome do plano
      nome: "Free",
      // Preço por mês: grátis
      mensal: 0,
      // O que o plano tem
      itens: [
        // Item 1
        "Treinos básicos da plataforma",
        // Item 2
        "Acompanhamento simples de evolução",
        // Item 3
        "Comunidade e ranking",
      ],
      // Texto do botão
      cta: "Começar grátis",
    },
    // Premium: o principal
    {
      // Nome do plano
      nome: "Premium",
      // Preço por mês: R$ 14,90
      mensal: 14.9,
      // Plano em destaque (mais escolhido)
      destaque: true,
      // Selo do teste grátis
      teste: "30 dias grátis",
      // O que o plano tem
      itens: [
        // Item 1
        "Programas completos e treino automático",
        // Item 2
        "Relatórios avançados de evolução",
        // Item 3
        "Pulso especial e desafios sem limite",
        // Item 4
        "Suporte prioritário",
      ],
      // Texto do botão
      cta: "Testar 30 dias grátis",
    },
    // Estudante: Premium mais barato
    {
      // Nome do plano
      nome: "Estudante",
      // Preço por mês: R$ 9,90
      mensal: 9.9,
      // O que o plano tem
      itens: [
        // Item 1
        "Tudo do Premium",
        // Item 2
        "Para estudantes com matrícula ativa",
        // Item 3
        "Confirmação simples na hora de assinar",
      ],
      // Texto do botão
      cta: "Assinar Estudante",
    },
    // Família: até 4 pessoas
    {
      // Nome do plano
      nome: "Família",
      // Preço por mês: R$ 24,90
      mensal: 24.9,
      // O que o plano tem
      itens: [
        // Item 1
        "Tudo do Premium para até 4 pessoas",
        // Item 2
        "Cada um com sua conta e seus dados",
        // Item 3
        "Ranking da família",
      ],
      // Texto do botão
      cta: "Assinar Família",
    },
    // Profissional: para personal e nutri
    {
      // Nome do plano
      nome: "Profissional",
      // Preço por mês: R$ 49,90
      mensal: 49.9,
      // O que o plano tem
      itens: [
        // Item 1
        "Área do profissional completa",
        // Item 2
        "Montar e mandar treinos para alunos",
        // Item 3
        "Relatórios de desempenho dos alunos",
      ],
      // Texto do botão
      cta: "Assinar Pro",
    },
    // Academia: sob consulta
    {
      // Nome do plano
      nome: "Academia",
      // Sem preço fixo (é sob consulta)
      mensal: null,
      // O que o plano tem
      itens: [
        // Item 1
        "Painel do dono com frequência e alunos sumidos",
        // Item 2
        "Desafios e avisos para os alunos",
        // Item 3
        "Relatórios e suporte dedicado",
      ],
      // Texto do botão
      cta: "Falar com consultor",
    },
  ];

  // Desconto do plano anual: 20%
  const DESCONTO_ANUAL = 0.2;

  // Formata um número como dinheiro (ex.: R$ 29,90)
  function reais(valor) {
    // Usa o formato brasileiro de reais
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  // Cria um elemento HTML: el(tag, atributos, filhos)
  function el(tag, attrs, children) {
    // Cria a tag
    const node = document.createElement(tag);
    // Para cada atributo...
    Object.entries(attrs || {}).forEach(function ([k, v]) {
      // ...ignora os vazios ou falsos
      if (v === false || v == null) return;
      // "class" vira a classe
      if (k === "class") node.className = v;
      // "text" vira o texto
      else if (k === "text") node.textContent = v;
      // Os outros viram atributos normais
      else node.setAttribute(k, v);
    });
    // Para cada filho...
    (children || []).forEach(function (c) {
      // ...coloca dentro do elemento
      node.append(c);
    });
    // Devolve o elemento pronto
    return node;
  }

  // Monta o preço de um plano (mensal ou anual)
  function preco(plano, anual) {
    // Sem preço: mostra "Consulte"
    if (plano.mensal === null) return [el("span", { class: "plan-price-value", text: "Consulte" })];
    // Grátis: mostra "R$ 0"
    if (plano.mensal === 0) return [el("span", { class: "plan-price-value", text: "R$ 0" })];

    // Preço por mês (com desconto se for anual)
    const mensal = anual ? plano.mensal * (1 - DESCONTO_ANUAL) : plano.mensal;
    // Partes do preço:
    const partes = [
      // o valor
      el("span", { class: "plan-price-value", text: reais(mensal) }),
      // e o "/mês"
      el("span", { class: "plan-price-period", text: "/mês" }),
    ];
    // Se for anual...
    if (anual) {
      // ...coloca uma observação
      partes.push(
        // (texto pequeno)
        el("small", {
          // (classe da observação)
          class: "plan-price-note",
          // com o total cobrado no ano
          text: reais(mensal * 12) + " cobrados por ano",
        }),
      );
    }
    // Devolve as partes
    return partes;
  }

  // Desenha os planos dentro de uma caixa da página
  function render(container) {
    // Link dos botões (se a caixa tiver data-cta)
    const ctaHref = container.dataset.cta;
    // No app, o plano da pessoa aparece marcado (data-plano-atual="Free")
    // Plano que a pessoa já tem: o salvo no navegador (sl-plano) ou o da página
    let planoAtual = container.dataset.planoAtual;
    // Só no app (quando a caixa marca o plano atual)...
    if (planoAtual) {
      // ...tenta ler o plano salvo
      try {
        // Plano salvo (ex.: "Premium")
        planoAtual = JSON.parse(localStorage.getItem("sl-plano")) || planoAtual;
      // Se o navegador bloquear, fica o da página
      } catch (e) {
        /* armazenamento indisponível */
      }
    }
    // Começa mostrando os preços mensais
    let anual = false;

    // Chave de mensal/anual
    const toggle = el("div", { class: "billing-toggle", role: "group", "aria-label": "Período de cobrança" }, [
      // Botão "Mensal" (começa escolhido)
      el("button", { type: "button", class: "billing-option is-active", "data-periodo": "mensal", "aria-pressed": "true", text: "Mensal" }),
      // Botão "Anual"
      el("button", { type: "button", class: "billing-option", "data-periodo": "anual", "aria-pressed": "false" }, [
        // Texto do botão
        "Anual ",
        // Selo de -20%
        el("span", { class: "billing-badge", text: "-20%" }),
      ]),
    ]);

    // Grade dos cards
    const grid = el("div", { class: "plans-grid" });

    // Desenha os cards dos planos
    function desenhar() {
      // Troca o conteúdo da grade...
      grid.replaceChildren.apply(
        // (na grade)
        grid,
        // ...por um card para cada plano
        PLANOS.map(function (plano) {
          // Botão coral no plano destaque, contorno nos outros
          const botaoClasse = plano.destaque ? "plan-btn plan-btn-primary" : "plan-btn plan-btn-secondary";
          // Vê se é o plano da pessoa
          const ehAtual = plano.nome === planoAtual;
          // Botão do card
          let botao;
          // Se é o plano atual...
          if (ehAtual) {
            // ...botão desativado "Seu plano atual"
            botao = el("button", { type: "button", class: "plan-btn plan-btn-secondary", disabled: true, text: "Seu plano atual" });
          // Se a caixa tem link...
          } else if (ctaHref) {
            // ...o botão é um link (leva ao cadastro)
            botao = el("a", { href: ctaHref, class: botaoClasse, text: plano.cta });
          // Se não...
          } else {
            // ...é um botão que o app trata ao clicar
            botao = el("button", { type: "button", class: botaoClasse, "data-action": "select-plan", "data-plano": plano.nome, text: plano.cta });
          }

          // Classes do card: destaque e/ou atual
          const classes = "plan-card" + (plano.destaque ? " plan-card-highlight" : "") + (ehAtual ? " plan-card-current" : "");
          // Card do plano
          return el("article", { class: classes }, [
            // Etiqueta "Mais escolhido" (só no destaque)
            plano.destaque ? el("span", { class: "plan-tag", text: "Mais escolhido" }) : "",
            // Etiqueta "Seu plano" (só no atual)
            ehAtual ? el("span", { class: "plan-tag plan-tag-current", text: "Seu plano" }) : "",
            // Selo do teste grátis (no Premium)
            plano.teste && !ehAtual ? el("span", { class: "plan-teste", text: plano.teste }) : "",
            // Nome do plano
            el("h2", { class: "plan-name", text: plano.nome }),
            // Preço
            el("p", { class: "plan-price" }, preco(plano, anual)),
            // Lista do que o plano tem
            el(
              // (é uma lista)
              "ul",
              // (com esta classe)
              { class: "plan-features" },
              // Um item para cada coisa do plano
              plano.itens.map(function (item) {
                // (cria o item)
                return el("li", { text: item });
              }),
            ),
            // Botão do card
            botao,
          ]);
        }),
      );
    }

    // Quando clicam na chave de mensal/anual...
    toggle.addEventListener("click", function (e) {
      // ...descobre qual botão foi clicado
      const btn = e.target.closest("[data-periodo]");
      // Se não foi em um botão, para
      if (!btn) return;
      // Vê se escolheu o anual
      anual = btn.dataset.periodo === "anual";
      // Para cada botão da chave...
      toggle.querySelectorAll("[data-periodo]").forEach(function (b) {
        // ...vê se é o escolhido
        const ativo = b === btn;
        // ...destaca o escolhido
        b.classList.toggle("is-active", ativo);
        // ...e avisa os leitores de tela
        b.setAttribute("aria-pressed", String(ativo));
      });
      // Desenha os cards de novo com os preços novos
      desenhar();
    });

    // Desenha os cards a primeira vez
    desenhar();
    // Coloca a chave e a grade dentro da caixa
    container.replaceChildren(toggle, grid);
  }

  // Deixa a lista e a conta do preço disponíveis para o pagamento no app
  window.SL_PLANOS = { PLANOS: PLANOS, DESCONTO_ANUAL: DESCONTO_ANUAL, reais: reais };

  // Procura todas as caixas data-planos da página e desenha os planos nelas
  document.querySelectorAll("[data-planos]").forEach(render);
})();
