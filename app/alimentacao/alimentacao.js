// Alimentação: macros calculados a partir das refeições do dia,
// adicionar e remover refeição e meta de água em copos de 250 ml
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ler/salvar dados e ícones
    const { el, storage, icone } = SL;
    // Pega as refeições de exemplo
    const { REFEICOES_PADRAO } = window.SL_DADOS;
    // Comidas brasileiras e cardápios de exemplo (alimentos.js)
    const ALIMENTOS = window.SL_ALIMENTOS || [];
    // Cardápios por objetivo
    const CARDAPIOS = window.SL_CARDAPIOS || {};
    // Restrições possíveis, trocas do cardápio e receitas (alimentos.js)
    const RESTRICOES = window.SL_RESTRICOES || [];
    // Trocas do cardápio
    const TROCAS = window.SL_TROCAS || {};
    // Receitas
    const RECEITAS = window.SL_RECEITAS || [];

    /* ---------- Restrições alimentares ---------- */

    // Restrições marcadas pela pessoa (ids)
    const restricoes = () => storage.get("sl-restricoes", []);
    // Etiquetas que a pessoa não come (juntando as restrições)
    const proibidas = () => RESTRICOES.filter(([id]) => restricoes().includes(id)).flatMap(([, , tags]) => tags);
    // Diz se uma lista de etiquetas serve para a pessoa
    const serveTags = (tags) => !tags.some((t) => proibidas().includes(t));
    // Diz se uma comida (pelo nome) serve
    const serve = (nome) => {
      // Comida na tabela
      const a = ALIMENTOS.find((x) => x.nome === nome);
      // Se não achou, serve (não sabemos as etiquetas)
      return !a || serveTags(a.tags || []);
    };
    // Nomes das etiquetas para os avisos
    const NOMES_TAGS = { carne: "carne", peixe: "peixe", "frutos-mar": "frutos do mar", ovo: "ovo", lactose: "lactose", gluten: "glúten", amendoim: "amendoim", animal: "origem animal" };
    // Aviso de uma comida que não serve (ex.: "contém lactose")
    const aviso = (a) => {
      // Etiquetas proibidas que ela tem
      const ruins = (a.tags || []).filter((t) => proibidas().includes(t) && t !== "animal");
      // Texto (se só tem "animal", fala isso)
      return ruins.length ? `contém ${ruins.map((t) => NOMES_TAGS[t]).join(" e ")}` : (a.tags || []).includes("animal") && proibidas().includes("animal") ? "de origem animal" : "";
    };

    // Histórico de refeições por dia (para "Repetir ontem"): { "dia": [refeições] }
    const historicoRefeicoes = () => storage.get("sl-refeicoes-dias", {});

    // Calcula as metas do dia a partir do peso, altura, idade, objetivo e dias de treino
    // (ou usa as metas que a nutricionista passou, se a pessoa preferir)
    function calcularMetas() {
      // Se a pessoa escolheu as metas da nutricionista, usa elas
      if (storage.get("sl-metas-modo", "auto") === "manual") return storage.get("sl-metas-manual", window.SL_DADOS.METAS_NUTRICAO);
      // Dados do corpo
      const { peso, altura, idade } = SL.dadosCorpo();
      // Respostas do questionário (objetivo e dias)
      const { objetivo, dias } = SL.onboarding();
      // Gasto em repouso (fórmula de Mifflin-St Jeor, com a média entre homens e mulheres)
      const repouso = 10 * peso + 6.25 * altura - 5 * idade - 78;
      // Quanto mais dias de treino, maior o gasto
      const atividade = dias <= 2 ? 1.375 : dias <= 4 ? 1.55 : 1.725;
      // Ajuste pelo objetivo: ganhar massa (+300), emagrecer (−400), os outros mantêm
      const ajuste = { Hipertrofia: 300, HIIT: -400 }[objetivo] || 0;
      // Proteína por quilo, conforme o objetivo
      const protKg = { Hipertrofia: 2, HIIT: 1.8, "Resistência": 1.6 }[objetivo] || 1.4;
      // Calorias do dia (arredondadas de 10 em 10)
      const kcal = Math.round((repouso * atividade + ajuste) / 10) * 10;
      // Proteína em gramas
      const proteina = Math.round(peso * protKg);
      // Gordura: 0,9 g por quilo
      const gordura = Math.round(peso * 0.9);
      // Carboidrato: o que sobra das calorias (4 kcal por grama)
      const carbo = Math.max(0, Math.round((kcal - proteina * 4 - gordura * 9) / 4));
      // Água: 35 ml por quilo, arredondada em copos de 250 ml
      const aguaMl = Math.round((peso * 35) / 250) * 250;
      // Devolve as metas
      return { kcal, proteina, carbo, gordura, aguaMl };
    }
    // Metas de hoje
    let META = calcularMetas();
    // Tamanho de um copo: 250 ml
    const COPO = 250;
    // Data de hoje em texto (para saber se o que foi salvo é de hoje)
    const hoje = new Date().toDateString();

    // Num dia novo sem nada salvo, mostra as refeições de exemplo
    // Devolve as refeições de hoje
    function refeicoes() {
      // Lê o que foi salvo
      const salvo = storage.get("sl-refeicoes", null);
      // Se foi salvo hoje usa isso; se não, usa as de exemplo
      return salvo && salvo.data === hoje ? salvo.itens : REFEICOES_PADRAO.slice();
    }
    // Salva as refeições com a data de hoje
    function guardarRefeicoes(itens) {
      // Guarda na chave "sl-refeicoes"
      storage.set("sl-refeicoes", { data: hoje, itens });
      // Guarda também no histórico por dia (só os últimos 14 dias, sem as fotos para não pesar)
      const dias = historicoRefeicoes();
      // Refeições de hoje sem foto
      dias[hoje] = itens.map((x) => ({ ...x, foto: "" }));
      // Mantém só os 14 dias mais recentes
      const chaves = Object.keys(dias).sort((a, b) => new Date(b) - new Date(a)).slice(0, 14);
      // Salva
      storage.set("sl-refeicoes-dias", Object.fromEntries(chaves.map((k) => [k, dias[k]])));
    }
    // Devolve quantos ml de água a pessoa bebeu hoje
    function agua() {
      // Lê o que foi salvo
      const salvo = storage.get("sl-agua", null);
      // Se foi salvo hoje usa isso; se não, começa com 2500 ml
      return salvo && salvo.data === hoje ? salvo.ml : 2500;
    }
    // Salva a água de hoje
    function guardarAgua(ml) {
      // Guarda entre 0 e 6000 ml
      storage.set("sl-agua", { data: hoje, ml: Math.max(0, Math.min(6000, ml)) });
    }

    // Lista dos macros mostrados na página
    const MACROS = [
      // Calorias (coral)
      { chave: "kcal", nome: "Calorias", unidade: "kcal", cor: "coral" },
      // Proteínas (verde)
      { chave: "proteina", nome: "Proteínas", unidade: "g", cor: "emerald" },
      // Carboidratos (amarelo)
      { chave: "carbo", nome: "Carboidratos", unidade: "g", cor: "warning" },
      // Gorduras (azul)
      { chave: "gordura", nome: "Gorduras", unidade: "g", cor: "info" },
    ];

    // Cria uma barra de progresso com a porcentagem e a cor
    function barra(pct, rotulo, cor) {
      // Devolve...
      return el(
        // ...uma div
        "div",
        // com a classe da cor e os avisos para leitores de tela
        { class: `progress-bar-sm progress-${cor}`, role: "progressbar", "aria-label": rotulo, "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 },
        // e a parte pintada (no máximo 100%)
        [el("div", { class: "fill", "data-progress": Math.min(100, pct) })],
      );
    }

    // Desenha os cards de macros
    function renderMacros(itens) {
      // Troca o conteúdo da área de macros...
      document.querySelector('[data-render="macros"]').replaceChildren(
        // ...por um card para cada macro
        ...MACROS.map((m) => {
          // Soma o macro de todas as refeições
          const atual = itens.reduce((soma, r) => soma + (Number(r[m.chave]) || 0), 0);
          // Meta do macro
          const meta = META[m.chave];
          // Porcentagem da meta
          const pct = Math.round((atual / meta) * 100);
          // Quanto falta para a meta
          const faltam = meta - atual;
          // Bateu a meta de proteína hoje: ganha pontos (uma vez por dia)
          if (m.chave === "proteina" && atual >= meta && SL.pontos) SL.pontos.ganhar("proteina", "proteina:" + hoje);
          // Card do macro com a cor dele
          return el("div", { class: `macro-card macro-${m.cor}` }, [
            // Nome com a bolinha colorida
            el("span", { class: "macro-name" }, [el("span", { class: "macro-dot", "aria-hidden": "true" }), m.nome]),
            // Valor atual e a meta
            el("strong", {}, [SL.num(atual), el("small", { text: ` / ${SL.num(meta)} ${m.unidade}` })]),
            // Barra de progresso
            barra(pct, m.nome, m.cor),
            // Texto: quanto falta ou "meta batida"
            el("small", { class: "macro-pct", text: faltam > 0 ? `${pct}% • faltam ${SL.num(faltam)} ${m.unidade}` : `${pct}% • meta batida` }),
          ]);
        }),
      );
    }

    // Desenha a lista de refeições
    function renderRefeicoes(itens) {
      // Lugar da lista
      const lista = document.querySelector('[data-render="refeicoes"]');
      // Se não tem refeição...
      if (!itens.length) {
        // ...mostra a mensagem de vazio
        lista.replaceChildren(el("li", { class: "meal-empty" }, [el("span", { text: "Nenhuma refeição registrada hoje." })]));
        // ...e para
        return;
      }
      // Troca a lista pelas refeições:
      lista.replaceChildren(
        // pega as refeições
        ...itens
          // faz uma cópia
          .slice()
          // ordena pelo horário
          .sort((a, b) => a.hora.localeCompare(b.hora))
          // e transforma cada uma em item
          .map((r) =>
            // Item da refeição
            el("li", { class: "meal-item" }, [
              // Horário
              el("span", { class: "meal-time", text: r.hora }),
              // Foto do prato (se tiver)
              r.foto ? el("img", { class: "meal-foto", src: r.foto, alt: `Foto do prato: ${r.nome}` }) : null,
              // Nome e detalhes
              el("div", { class: "meal-info" }, [
                // Nome da refeição
                el("strong", { text: r.nome }),
                // O que comeu
                el("span", { text: r.descricao || "Sem descrição" }),
                // Etiquetas dos macros
                el("span", { class: "meal-macros" }, [
                  // Proteína
                  el("span", { class: "macro-chip macro-emerald", text: `P ${SL.num(r.proteina)} g` }),
                  // Carboidrato
                  el("span", { class: "macro-chip macro-warning", text: `C ${SL.num(r.carbo)} g` }),
                  // Gordura
                  el("span", { class: "macro-chip macro-info", text: `G ${SL.num(r.gordura)} g` }),
                ]),
              ]),
              // Calorias da refeição
              el("span", { class: "tag", text: `${SL.num(r.kcal)} kcal` }),
              // Botão de remover (lixeira)
              el("button", { class: "btn-icon btn-danger", "data-action": "remover-refeicao", "data-id": r.id, "aria-label": `Remover ${r.nome}` }, [SL.iconeLixeira()]),
            ]),
          ),
      );
    }

    // Desenha uma garrafa com água até a altura "nivel" (de 0 a 1), com ondinha animada
    function garrafa(nivel) {
      // Desenho de 80 x 160
      const s = SL.svg("svg", { viewBox: "0 0 80 160" });
      // Formato da garrafa (tampa, gargalo e corpo)
      const forma = "M30 6h20v14c0 6 16 12 16 30v94a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V50c0-18 16-24 16-30z";
      // Área de corte: a água só aparece dentro da garrafa
      const defs = SL.svg("defs", {});
      // Recorte com o formato da garrafa
      const corte = SL.svg("clipPath", { id: "garrafa-corte" });
      // Usa o formato
      corte.append(SL.svg("path", { d: forma }));
      // Junta
      defs.append(corte);
      // Coloca no desenho
      s.append(defs);
      // Fundo da garrafa (vazia)
      s.append(SL.svg("path", { d: forma, class: "garrafa-vidro" }));
      // Altura da água (o corpo vai de y=20 até y=154)
      const topo = 154 - nivel * 134;
      // Grupo da água, recortado pela garrafa
      const agua = SL.svg("g", { "clip-path": "url(#garrafa-corte)" });
      // Água com uma onda em cima (a onda se mexe pelo CSS)
      agua.append(SL.svg("path", { d: `M-80 ${topo} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V160 H-80z`, class: "garrafa-agua" }));
      // Coloca a água
      s.append(agua);
      // Contorno da garrafa por cima
      s.append(SL.svg("path", { d: forma, class: "garrafa-contorno" }));
      // Brilho do vidro
      s.append(SL.svg("path", { d: "M22 60v70", class: "garrafa-brilho" }));
      // Devolve
      return s;
    }

    // Desenha o card da água
    function renderAgua() {
      // Quantos ml bebeu
      const ml = agua();
      // Porcentagem da meta
      const pct = Math.round((ml / META.aguaMl) * 100);
      // Escreve o valor em litros...
      document.querySelector('[data-render="agua-valor"]').replaceChildren(
        // ...o que já bebeu
        el("strong", { text: `${SL.num(ml / 1000, ml % 100 ? 2 : 1)} L` }),
        // ...e a meta
        el("span", { text: ` de ${SL.num(META.aguaMl / 1000, 1)} L` }),
      );
      // Desenha a garrafa com o nível da água
      document.querySelector('[data-render="agua-garrafa"]').replaceChildren(garrafa(Math.min(1, ml / META.aguaMl)));
      // Barra de progresso da água
      const barraAgua = document.querySelector('[data-render="agua-barra"]');
      // Avisa leitores de tela a porcentagem
      barraAgua.setAttribute("aria-valuenow", Math.min(100, pct));
      // Pinta a barra
      barraAgua.querySelector(".fill").dataset.progress = Math.min(100, pct);
      // Desativa o botão de menos se está em zero
      document.querySelector('[data-action="agua-menos"]').disabled = ml <= 0;
    }

    // Desenha a página toda
    function render() {
      // Pega as refeições de hoje
      const itens = refeicoes();
      // Desenha os macros
      renderMacros(itens);
      // Desenha as refeições
      renderRefeicoes(itens);
      // Desenha a água
      renderAgua();
      // Escreve de onde vêm as metas
      renderMetasInfo();
      // Pinta as barras de progresso
      SL.aplicarProgresso();
    }

    // Escreve de onde vêm as metas, com o botão de ajustar
    function renderMetasInfo() {
      // Metas da nutricionista ou calculadas?
      const manual = storage.get("sl-metas-modo", "auto") === "manual";
      // Dados do corpo
      const { peso, altura, idade } = SL.dadosCorpo();
      // Texto do topo da página
      document.querySelector('[data-render="metas-origem"]').textContent = manual ? "metas definidas com sua nutricionista" : "metas calculadas para você";
      // Texto embaixo dos macros
      document.querySelector('[data-render="metas-info"]').replaceChildren(
        // Explicação
        el("span", { text: manual ? "Usando as metas que você digitou. " : `Calculadas para ${SL.num(peso, 1)} kg, ${altura} cm, ${idade} anos e objetivo "${SL.onboarding().rotulo || SL.onboarding().objetivo}". ` }),
        // Botão de ajustar
        el("button", { type: "button", class: "btn-link", "data-action": "ajustar-metas", text: "Ajustar" }),
      );
    }

    // Botão "Ajustar" metas: dados do corpo ou metas da nutricionista
    SL.acao("ajustar-metas", () => {
      // Perfil salvo
      const perfil = storage.get("sl-perfil", {});
      // Dados atuais
      const { peso, altura } = SL.dadosCorpo();
      // Metas manuais salvas (ou as atuais)
      const manuais = storage.get("sl-metas-manual", META);
      // Modo atual
      const modo = storage.get("sl-metas-modo", "auto");
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Escolha do modo
        el("fieldset", { class: "metas-modo" }, [
          // Pergunta
          el("legend", { text: "De onde vêm suas metas?" }),
          // Calculadas
          el("label", { class: "check-row" }, [el("input", { type: "radio", name: "modo", value: "auto", checked: modo === "auto" }), " Calcular para mim"]),
          // Da nutricionista
          el("label", { class: "check-row" }, [el("input", { type: "radio", name: "modo", value: "manual", checked: modo === "manual" }), " Usar as metas da minha nutricionista"]),
        ]),
        // Dados do corpo
        el("div", { class: "form-row" }, [
          // Peso
          SL.campo("m-peso", "Peso (kg)", { type: "number", min: 30, max: 300, step: 0.1 }),
          // Altura
          SL.campo("m-altura", "Altura (cm)", { type: "number", min: 120, max: 230 }),
        ]),
        // Nascimento
        SL.campo("m-nasc", "Data de nascimento", { type: "date" }),
        // Metas manuais
        el("div", { class: "form-row form-row-4" }, [
          // Calorias
          SL.campo("m-kcal", "Calorias", { type: "number", min: 800, max: 6000 }),
          // Proteína
          SL.campo("m-prot", "Proteína (g)", { type: "number", min: 0, max: 400 }),
          // Carbo
          SL.campo("m-carbo", "Carbo (g)", { type: "number", min: 0, max: 800 }),
          // Gordura
          SL.campo("m-gord", "Gordura (g)", { type: "number", min: 0, max: 300 }),
        ]),
        // Água manual
        SL.campo("m-agua", "Água (ml)", { type: "number", min: 500, max: 8000, step: 250 }),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Salvar metas" }),
      ]);
      // Preenche os campos
      form.querySelector("#m-peso").value = peso;
      // Altura
      form.querySelector("#m-altura").value = altura;
      // Nascimento
      form.querySelector("#m-nasc").value = perfil.nascimento || "";
      // Metas manuais
      [["#m-kcal", "kcal"], ["#m-prot", "proteina"], ["#m-carbo", "carbo"], ["#m-gord", "gordura"], ["#m-agua", "aguaMl"]].forEach(([id, k]) => (form.querySelector(id).value = manuais[k]));
      // Quando envia...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // ...guarda os dados do corpo no perfil
        storage.set("sl-perfil", { ...perfil, peso: Number(form.querySelector("#m-peso").value) || perfil.peso, altura: Number(form.querySelector("#m-altura").value) || perfil.altura, nascimento: form.querySelector("#m-nasc").value || perfil.nascimento });
        // ...guarda o modo
        storage.set("sl-metas-modo", form.querySelector('[name="modo"]:checked').value);
        // ...guarda as metas manuais
        storage.set("sl-metas-manual", { kcal: Number(form.querySelector("#m-kcal").value), proteina: Number(form.querySelector("#m-prot").value), carbo: Number(form.querySelector("#m-carbo").value), gordura: Number(form.querySelector("#m-gord").value), aguaMl: Number(form.querySelector("#m-agua").value) });
        // ...recalcula
        META = calcularMetas();
        // ...fecha
        SL.closeModal();
        // ...desenha de novo
        render();
        // ...e o cardápio (as porções mudam com a meta)
        renderCardapio();
        // ...e avisa
        SL.toast("Metas atualizadas");
      });
      // Abre o modal
      SL.openModal("Ajustar metas", form);
    });

    /* ---------- Busca de alimentos e foto ---------- */

    // Diminui uma foto para no máximo "lado" pixels e devolve o texto da imagem (JPEG)
    function diminuirFoto(arquivo, lado) {
      // Devolve uma promessa (a imagem demora um pouquinho para carregar)
      return new Promise((resolve) => {
        // Imagem temporária
        const img = new Image();
        // Quando carregar...
        img.onload = () => {
          // ...escala para caber no tamanho
          const escala = Math.min(1, lado / Math.max(img.width, img.height));
          // ...tela de desenho do tamanho novo
          const tela = document.createElement("canvas");
          // Largura
          tela.width = Math.round(img.width * escala);
          // Altura
          tela.height = Math.round(img.height * escala);
          // Desenha a foto menor
          tela.getContext("2d").drawImage(img, 0, 0, tela.width, tela.height);
          // Devolve como JPEG de qualidade média (fica bem leve)
          resolve(tela.toDataURL("image/jpeg", 0.7));
          // Libera a memória da imagem original
          URL.revokeObjectURL(img.src);
        };
        // Carrega o arquivo
        img.src = URL.createObjectURL(arquivo);
      });
    }

    // Bloco de busca de alimentos: escolhe comidas e porções, e preenche calorias e macros
    function buscaAlimentos() {
      // Comidas escolhidas: [[alimento, porções], ...]
      let escolhidos = [];
      // Campo de busca
      const busca = el("input", { type: "search", class: "alim-busca", placeholder: "Buscar comida (arroz, frango, tapioca…)", "aria-label": "Buscar comida", autocomplete: "off" });
      // Resultados da busca
      const resultados = el("ul", { class: "alim-resultados" });
      // Comidas escolhidas
      const lista = el("ul", { class: "alim-escolhidos" });
      // Atualiza os campos do formulário com a soma
      function preencher() {
        // Formulário (o bloco já está dentro dele)
        const form = caixa.closest("form");
        // Soma
        const t = somarAlimentos(escolhidos.map(([a, p]) => [a.nome, p]));
        // Calorias
        form.querySelector("#ref-kcal").value = t.kcal;
        // Proteína
        form.querySelector("#ref-prot").value = t.proteina;
        // Carbo
        form.querySelector("#ref-carbo").value = t.carbo;
        // Gordura
        form.querySelector("#ref-gord").value = t.gordura;
        // Descrição
        form.querySelector("#ref-desc").value = descrever(escolhidos.map(([a, p]) => [a.nome, p]));
      }
      // Desenha as comidas escolhidas
      function desenharEscolhidos() {
        // Troca a lista
        lista.replaceChildren(
          // Uma linha por comida
          ...escolhidos.map(([a, p], i) =>
            // Linha
            el("li", {}, [
              // Nome e porção
              el("span", {}, [el("strong", { text: a.nome }), el("small", { class: "meta", text: ` ${a.porcao}` })]),
              // Menos porção
              el("button", { type: "button", class: "btn-icon", "data-i": i, "data-mudar": -0.5, "aria-label": `Menos ${a.nome}`, text: "−" }),
              // Quantas porções
              el("strong", { class: "alim-qtd", text: `${String(p).replace(".", ",")}×` }),
              // Mais porção
              el("button", { type: "button", class: "btn-icon", "data-i": i, "data-mudar": 0.5, "aria-label": `Mais ${a.nome}`, text: "+" }),
            ]),
          ),
        );
        // Atualiza os campos
        preencher();
      }
      // Quando digita, mostra até 6 comidas que batem
      busca.addEventListener("input", () => {
        // Texto buscado, sem acentos
        const t = SL.slug(busca.value);
        // Troca os resultados
        resultados.replaceChildren(
          // Comidas que batem
          ...(t ? ALIMENTOS.filter((a) => SL.slug(a.nome).includes(t)).slice(0, 6) : []).map((a) =>
            // Item clicável
            el("li", {}, [el("button", { type: "button", "data-alimento": a.nome }, [el("strong", { text: a.nome }), el("small", { class: "meta", text: ` ${a.porcao} • ${a.kcal} kcal` }), aviso(a) ? el("small", { class: "alim-aviso", text: ` • ${aviso(a)}` }) : ""])]),
          ),
        );
      });
      // Clique num resultado: entra na lista
      resultados.addEventListener("click", (ev) => {
        // Botão clicado
        const b = ev.target.closest("[data-alimento]");
        // Se não foi num resultado, para
        if (!b) return;
        // Alimento
        const a = ALIMENTOS.find((x) => x.nome === b.dataset.alimento);
        // Se já estava, soma uma porção; se não, entra com 1
        const ja = escolhidos.find(([x]) => x === a);
        // Soma ou coloca
        if (ja) ja[1] += 1;
        // (coloca)
        else escolhidos.push([a, 1]);
        // Limpa a busca
        busca.value = "";
        // Esvazia os resultados
        resultados.replaceChildren();
        // Desenha a lista
        desenharEscolhidos();
      });
      // Botões de + e − porção
      lista.addEventListener("click", (ev) => {
        // Botão clicado
        const b = ev.target.closest("[data-mudar]");
        // Se não foi num botão, para
        if (!b) return;
        // Qual comida
        const i = Number(b.dataset.i);
        // Muda a porção
        escolhidos[i][1] += Number(b.dataset.mudar);
        // Se chegou a zero, tira da lista
        if (escolhidos[i][1] <= 0) escolhidos = escolhidos.filter((_, k) => k !== i);
        // Desenha de novo
        desenharEscolhidos();
      });
      // Caixa do bloco
      const caixa = el("div", { class: "alim" }, [el("label", { class: "alim-titulo", text: "Buscar comida (calcula sozinho)" }), busca, resultados, lista]);
      // Adiciona uma comida pelo nome (usado pelas sugestões depois da foto)
      caixa.adicionar = (nome) => {
        // Comida
        const a = ALIMENTOS.find((x) => x.nome === nome);
        // Se não achou, para
        if (!a) return;
        // Se já estava, soma uma porção
        const ja = escolhidos.find(([x]) => x === a);
        // Soma ou coloca
        if (ja) ja[1] += 1;
        // (coloca)
        else escolhidos.push([a, 1]);
        // Desenha
        desenharEscolhidos();
      };
      // Devolve
      return caixa;
    }

    /* ---------- Cardápio sugerido ---------- */

    // Soma os macros de uma lista de [alimento, porções]
    function somarAlimentos(lista) {
      // Começa do zero
      const total = { kcal: 0, proteina: 0, carbo: 0, gordura: 0 };
      // Para cada alimento...
      lista.forEach(([nome, porcoes]) => {
        // ...acha na tabela
        const a = ALIMENTOS.find((x) => x.nome === nome);
        // ...se não achou, pula
        if (!a) return;
        // ...soma cada macro vezes as porções
        Object.keys(total).forEach((k) => (total[k] += a[k] * porcoes));
      });
      // Arredonda tudo
      Object.keys(total).forEach((k) => (total[k] = Math.round(total[k])));
      // Devolve
      return total;
    }

    // Escreve "2 x Arroz branco" ou só "Arroz branco"
    const descrever = (lista) => lista.map(([nome, p]) => (p === 1 ? nome : `${String(p).replace(".", ",")}× ${nome}`)).join(", ");

    // Cardápio do objetivo com as porções ajustadas para bater a meta de calorias
    function cardapioAjustado() {
      // Cardápio base do objetivo (ou o de ganhar massa)
      const base = CARDAPIOS[SL.onboarding().objetivo] || CARDAPIOS.Hipertrofia;
      // Calorias do cardápio base
      const kcalBase = somarAlimentos(base.flatMap((r) => r[2])).kcal;
      // Quanto precisa aumentar ou diminuir para chegar na meta
      const fator = META.kcal / kcalBase;
      // Multiplica as porções (de meia em meia, no mínimo meia porção)
      const ajustado = base.map(([nome, hora, lista]) => [nome, hora, lista.map(([alimento, p]) => [alimento, Math.max(0.5, Math.round(p * fator * 2) / 2)])]);
      // Troca o que a pessoa não come pela primeira opção que serve (ou tira, se nenhuma serve)
      return ajustado.map(([nome, hora, lista]) => [
        // Nome da refeição
        nome,
        // Hora
        hora,
        // Comidas com as trocas
        lista
          // Troca cada comida que não serve
          .map(([alimento, p]) => (serve(alimento) ? [alimento, p] : [(TROCAS[alimento] || []).find(serve), p]))
          // Tira as que ficaram sem troca
          .filter(([alimento]) => alimento),
      ]);
    }

    // Desenha o cardápio do objetivo da pessoa
    function renderCardapio() {
      // Objetivo
      const { objetivo, rotulo } = SL.onboarding();
      // Cardápio com as porções certas para a meta
      const cardapio = cardapioAjustado();
      // Escreve o objetivo
      document.querySelector('[data-render="cardapio-objetivo"]').textContent = rotulo || objetivo;
      // Total do dia
      const totalDia = somarAlimentos(cardapio.flatMap((r) => r[2]));
      // Troca o conteúdo
      document.querySelector('[data-render="cardapio"]').replaceChildren(
        // Um card para cada refeição
        ...cardapio.map(([nome, hora, lista]) => {
          // Macros da refeição
          const t = somarAlimentos(lista);
          // Card
          return el("article", { class: "cardapio-item" }, [
            // Hora e nome
            el("div", { class: "cardapio-topo" }, [el("span", { class: "meal-time", text: hora }), el("strong", { text: nome })]),
            // O que comer
            el("p", { text: descrever(lista) }),
            // Macros
            el("span", { class: "meta", text: `${t.kcal} kcal • P ${t.proteina} g • C ${t.carbo} g • G ${t.gordura} g` }),
          ]);
        }),
        // Rodapé com o total e o botão de usar
        el("div", { class: "cardapio-rodape" }, [
          // Total
          el("span", { class: "meta", text: `Total do dia: ${totalDia.kcal} kcal • ${totalDia.proteina} g de proteína` }),
          // Botões
          el("div", { class: "card-actions" }, [
            // Lista de compras da semana
            el("button", { type: "button", class: "btn-secondary", "data-action": "lista-compras", text: "Lista de compras da semana" }),
            // Usar o cardápio hoje
            el("button", { type: "button", class: "btn-primary", "data-action": "usar-cardapio", text: "Usar este cardápio hoje" }),
          ]),
        ]),
      );
    }

    // Botão "Usar este cardápio hoje": troca as refeições de hoje pelas do cardápio
    SL.acao("usar-cardapio", () => {
      // Cardápio com as porções certas para a meta
      const cardapio = cardapioAjustado();
      // Pede confirmação
      SL.confirmar({
        // Título
        titulo: "Usar o cardápio hoje?",
        // Texto
        texto: "As refeições de hoje são trocadas pelas do cardápio. Depois você pode editar à vontade.",
        // Botão
        rotulo: "Usar cardápio",
        // Se confirmar...
        fn: () => {
          // ...monta as refeições
          const itens = cardapio.map(([nome, hora, lista], i) => ({ id: "c" + Date.now() + i, nome, hora, descricao: descrever(lista), ...somarAlimentos(lista) }));
          // ...salva
          guardarRefeicoes(itens);
          // ...desenha de novo
          render();
          // ...cada refeição registrada vale pontos (até 4 por dia)
          if (SL.pontos) itens.forEach((r) => SL.pontos.ganhar("refeicao", "refeicao:" + r.id));
          // ...avisa
          SL.toast("Cardápio de hoje pronto!");
        },
      });
    });

    /* ---------- Lembrete de água ---------- */

    // Caixinha do lembrete
    const lembrete = document.querySelector('[data-render="agua-lembrete"]');
    // Marca conforme o que está salvo
    lembrete.checked = storage.get("sl-lembrete-agua", false);
    // Quando muda...
    lembrete.addEventListener("change", () => {
      // ...salva
      storage.set("sl-lembrete-agua", lembrete.checked);
      // ...se ligou e o navegador sabe mostrar notificações, pede permissão
      if (lembrete.checked && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
      // ...avisa
      SL.toast(lembrete.checked ? "Combinado! Te lembro a cada 2 horas (com o app aberto)." : "Lembrete de água desligado");
    });

    // Botão de mais água...
    SL.acao("agua-mais", (alvo) => {
      // ...soma um copo
      const ml = agua() + COPO;
      // ...guarda a hora do último gole (para o lembrete)
      storage.set("sl-agua-ultimo", Date.now());
      // ...salva
      guardarAgua(ml);
      // ...desenha a água de novo
      renderAgua();
      // ...pinta a barra
      SL.aplicarProgresso();
      // Se acabou de bater a meta, comemora
      if (ml >= META.aguaMl && ml - COPO < META.aguaMl) SL.toast("Meta de água batida!");
      // Bateu a meta de água: ganha pontos (uma vez por dia; o "+10" sai do botão)
      if (ml >= META.aguaMl && SL.pontos) SL.pontos.ganhar("agua", "agua:" + hoje, { origem: alvo });
    });

    // Botão de menos água...
    SL.acao("agua-menos", () => {
      // ...tira um copo e salva
      guardarAgua(agua() - COPO);
      // ...desenha de novo
      renderAgua();
      // ...pinta a barra
      SL.aplicarProgresso();
    });

    // Botão de remover refeição...
    SL.acao("remover-refeicao", (alvo) => {
      // ...pega as refeições
      const itens = refeicoes();
      // ...acha a que foi clicada
      const removida = itens.find((r) => r.id === alvo.dataset.id);
      // ...salva a lista sem ela
      guardarRefeicoes(itens.filter((r) => r.id !== alvo.dataset.id));
      // ...e tira os pontos que ela tinha dado
      if (SL.pontos) SL.pontos.perder("refeicao:" + alvo.dataset.id);
      // ...desenha de novo
      render();
      // ...e mostra o aviso com "Desfazer"
      SL.toast(`${removida.nome} removido`, {
        // Botão do aviso
        acao: {
          // Texto do botão
          rotulo: "Desfazer",
          // Se clicar em desfazer...
          fn: () => {
            // ...coloca a refeição de volta
            guardarRefeicoes(refeicoes().concat(removida));
            // ...e desenha de novo
            render();
          },
        },
      });
    });

    // Botão de adicionar refeição...
    SL.acao("adicionar-refeicao", () => {
      // ...pega a hora de agora
      const agora = new Date();
      // ...e escreve no formato 08:05
      const hora = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
      // Cria o formulário
      const form = el("form", { class: "modal-form" }, [
        // Linha com dois campos
        el("div", { class: "form-row" }, [
          // Nome da refeição (obrigatório)
          SL.campo("ref-nome", "Refeição", { placeholder: "Ex: Lanche da tarde", required: true, maxlength: 40 }),
          // Horário
          SL.campo("ref-hora", "Horário", { type: "time", required: true }),
        ]),
        // Busca de comidas brasileiras (soma as calorias sozinha)
        buscaAlimentos(),
        // O que comeu
        SL.campo("ref-desc", "O que você comeu", { placeholder: "Ex: Pão integral com ovo", maxlength: 120 }),
        // Linha com quatro campos
        el("div", { class: "form-row form-row-4" }, [
          // Calorias
          SL.campo("ref-kcal", "Calorias", { type: "number", min: 0, max: 3000, placeholder: "kcal" }),
          // Proteína
          SL.campo("ref-prot", "Proteína", { type: "number", min: 0, max: 300, placeholder: "g" }),
          // Carboidrato
          SL.campo("ref-carbo", "Carbo", { type: "number", min: 0, max: 500, placeholder: "g" }),
          // Gordura
          SL.campo("ref-gord", "Gordura", { type: "number", min: 0, max: 300, placeholder: "g" }),
        ]),
        // Foto do prato (opcional; no celular abre a câmera)
        el("div", { class: "form-group" }, [
          // Nome do campo
          el("label", { for: "ref-foto", text: "Foto do prato (opcional)" }),
          // Campo de arquivo de imagem
          el("input", { id: "ref-foto", type: "file", accept: "image/*", capture: "environment" }),
          // Miniatura da foto escolhida
          el("img", { class: "meal-foto meal-foto-previa", alt: "", hidden: true }),
          // Depois da foto: toques rápidos no que tem no prato (preenche as calorias)
          el("div", { class: "foto-sugestoes", hidden: true }, [
            // Pergunta
            el("p", { class: "meta", text: "O que tem no prato? Toque para somar:" }),
            // Botões das comidas mais comuns (só as que a pessoa come)
            el(
              "div",
              { class: "foto-chips" },
              ["Arroz branco", "Feijão carioca", "Peito de frango grelhado", "Bife de patinho", "Ovo cozido", "Salada verde com tomate", "Batata-doce cozida", "Macarrão cozido", "Tofu grelhado", "Farofa"]
                // Só as que servem
                .filter(serve)
                // Um botão por comida
                .map((nome) => el("button", { type: "button", class: "chip-alim", "data-comida": nome, text: nome })),
            ),
          ]),
        ]),
        // Botão de salvar
        el("button", { type: "submit", class: "btn-primary", text: "Salvar refeição" }),
      ]);
      // Já começa com a hora de agora
      form.querySelector("#ref-hora").value = hora;
      // Toque numa sugestão da foto: soma a comida na busca
      form.querySelector(".foto-chips").addEventListener("click", (ev) => {
        // Botão
        const b = ev.target.closest("[data-comida]");
        // Se não foi num botão, para
        if (!b) return;
        // Soma a comida
        form.querySelector(".alim").adicionar(b.dataset.comida);
        // Marca o botão como usado
        b.classList.add("is-usado");
      });
      // Foto do prato já diminuída (texto da imagem), ou vazio
      let foto = "";
      // Quando escolhe a foto...
      form.querySelector("#ref-foto").addEventListener("change", (ev) => {
        // ...arquivo escolhido
        const arquivo = ev.target.files[0];
        // ...se não escolheu, para
        if (!arquivo) return;
        // ...diminui a foto para caber no navegador
        diminuirFoto(arquivo, 240).then((url) => {
          // Guarda
          foto = url;
          // Mostra a miniatura
          const previa = form.querySelector(".meal-foto-previa");
          // Imagem
          previa.src = url;
          // Aparece
          previa.hidden = false;
          // Mostra as sugestões do que tem no prato
          form.querySelector(".foto-sugestoes").hidden = false;
        });
      });

      // Quando clicam em salvar...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // Pega o nome
        const nome = form.querySelector("#ref-nome").value.trim();
        // Se está vazio...
        if (!nome) {
          // ...coloca o foco no campo
          form.querySelector("#ref-nome").focus();
          // ...e para
          return;
        }
        // Atalho que lê um campo como número inteiro (nunca negativo)
        const n = (id) => Math.max(0, Math.round(Number(form.querySelector(id).value) || 0));
        // id da refeição nova, baseado na hora
        const idNova = "r" + Date.now();
        // Salva as refeições...
        guardarRefeicoes(
          // ...com a nova no final:
          refeicoes().concat({
            // id
            id: idNova,
            // nome
            nome,
            // horário
            hora: form.querySelector("#ref-hora").value || hora,
            // descrição
            descricao: form.querySelector("#ref-desc").value.trim(),
            // calorias
            kcal: n("#ref-kcal"),
            // proteína
            proteina: n("#ref-prot"),
            // carboidrato
            carbo: n("#ref-carbo"),
            // gordura
            gordura: n("#ref-gord"),
            // foto (se tiver)
            foto,
          }),
        );
        // Fecha o modal
        SL.closeModal();
        // Desenha de novo
        render();
        // Mostra o aviso
        SL.toast("Refeição adicionada");
        // Ganha os pontos da refeição registrada
        if (SL.pontos) SL.pontos.ganhar("refeicao", "refeicao:" + idNova);
      });

      // Abre o modal com o formulário
      SL.openModal("Adicionar refeição", form);
    });

    /* ---------- Restrições, repetir ontem, lista de compras e receitas ---------- */

    // Botão "Restrições": escolher vegetariano, sem lactose, alergias...
    SL.acao("restricoes", () => {
      // Marcadas agora
      const marcadas = restricoes();
      // Formulário com uma caixinha por restrição
      const form = el("form", { class: "modal-form restricoes-form" }, [
        // Explicação
        el("p", { class: "meta", text: "O cardápio troca o que você não come, as receitas mostram só as que servem e a busca avisa." }),
        // Caixinhas
        ...RESTRICOES.map(([id, nome]) => el("label", { class: "perfil-selo" }, [el("input", { type: "checkbox", name: "restricao", value: id, checked: marcadas.includes(id) }), nome])),
        // Salvar
        el("button", { type: "submit", class: "btn-primary", text: "Salvar" }),
      ]);
      // Ao salvar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...guarda as marcadas
        storage.set("sl-restricoes", [...form.querySelectorAll('input[name="restricao"]:checked')].map((c) => c.value));
        // ...fecha
        SL.closeModal();
        // ...redesenha o cardápio e as receitas
        renderCardapio();
        // (receitas)
        renderReceitas();
        // ...avisa
        SL.toast("Restrições salvas");
      });
      // Abre o modal
      SL.openModal("Restrições alimentares", form);
    });

    // Botão "Repetir ontem": copia as refeições de ontem para hoje
    SL.acao("repetir-ontem", () => {
      // Data de ontem
      const ontem = new Date(Date.now() - 86400000).toDateString();
      // Refeições de ontem
      const deOntem = historicoRefeicoes()[ontem];
      // Sem nada de ontem
      if (!deOntem || !deOntem.length) return SL.toast("Não achamos refeições de ontem neste aparelho.");
      // Lista para escolher quais repetir
      SL.openModal(
        // Título
        "Repetir refeições de ontem",
        // Lista com um botão por refeição + repetir todas
        [
          // Uma linha por refeição
          el(
            "ul",
            { class: "list-panel" },
            deOntem.map((r, i) =>
              // Linha
              el("li", {}, [el("div", {}, [el("strong", { text: `${r.hora} • ${r.nome}` }), el("span", { text: `${r.descricao || ""} • ${SL.num(r.kcal)} kcal` })]), el("button", { type: "button", class: "btn-secondary", "data-action": "repetir-uma", "data-i": i, text: "Repetir" })]),
            ),
          ),
          // Repetir todas
          el("button", { type: "button", class: "btn-primary btn-block", "data-action": "repetir-uma", "data-i": "todas", text: "Repetir todas" }),
        ],
      );
    });

    // Repetir uma (ou todas) as refeições de ontem
    SL.acao("repetir-uma", (alvo) => {
      // Refeições de ontem
      const deOntem = historicoRefeicoes()[new Date(Date.now() - 86400000).toDateString()] || [];
      // Quais repetir
      const escolhidas = alvo.dataset.i === "todas" ? deOntem : [deOntem[Number(alvo.dataset.i)]];
      // Copia com ids novos
      const novas = escolhidas.map((r, k) => ({ ...r, id: "r" + Date.now() + k }));
      // Salva junto com as de hoje
      guardarRefeicoes(refeicoes().concat(novas));
      // Pontos de cada refeição (até 4 por dia)
      if (SL.pontos) novas.forEach((r) => SL.pontos.ganhar("refeicao", "refeicao:" + r.id));
      // Fecha se repetiu todas; senão, desativa o botão
      if (alvo.dataset.i === "todas") SL.closeModal();
      // (desativa)
      else alvo.disabled = true;
      // Desenha
      render();
      // Avisa
      SL.toast(novas.length > 1 ? "Refeições de ontem repetidas" : "Refeição repetida");
    });

    // Lista de compras da semana (cardápio × 7 dias), com caixinhas que ficam salvas
    SL.acao("lista-compras", () => {
      // Soma as porções de cada comida no cardápio do dia
      const porcoes = {};
      // Para cada refeição e comida...
      cardapioAjustado().forEach(([, , lista]) => lista.forEach(([nome, p]) => (porcoes[nome] = (porcoes[nome] || 0) + p)));
      // Itens já marcados
      const marcados = storage.get("sl-compras", {});
      // Linhas da lista (semana = 7 dias)
      const itens = Object.entries(porcoes).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
      // Texto para copiar
      const texto = itens.map(([nome, p]) => `- ${nome}: ${SL.num(p * 7, (p * 7) % 1 ? 1 : 0)} porções`).join("\n");
      // Lista com caixinhas
      const lista = el(
        "ul",
        { class: "compras-lista" },
        itens.map(([nome, p]) => {
          // Porção da comida (ex.: "1 filé (120 g)")
          const a = ALIMENTOS.find((x) => x.nome === nome);
          // Linha com caixinha
          return el("li", {}, [el("label", {}, [el("input", { type: "checkbox", "data-item": nome, checked: Boolean(marcados[nome]) }), el("span", {}, [el("strong", { text: nome }), el("small", { class: "meta", text: ` ${SL.num(p * 7, (p * 7) % 1 ? 1 : 0)} × ${a ? a.porcao : "porção"}` })])])]);
        }),
      );
      // Marcar/desmarcar salva
      lista.addEventListener("change", (e) => {
        // Itens marcados
        const m = storage.get("sl-compras", {});
        // Guarda o estado deste item
        m[e.target.dataset.item] = e.target.checked;
        // Salva
        storage.set("sl-compras", m);
      });
      // Botão de copiar a lista
      const copiar = el("button", { type: "button", class: "btn-primary btn-block", text: "Copiar lista" });
      // Copia o texto
      copiar.addEventListener("click", () => navigator.clipboard.writeText("Lista de compras (Saúde Life)\n" + texto).then(() => SL.toast("Lista copiada"), () => SL.toast("Não deu para copiar neste navegador")));
      // Abre o modal
      SL.openModal("Lista de compras da semana", [el("p", { class: "meta", text: "Para seguir o cardápio por 7 dias. Marque o que já tem em casa." }), lista, copiar]);
    });

    // Desenha as receitas (só as que servem para as restrições)
    function renderReceitas() {
      // Receitas que servem
      const lista = RECEITAS.filter((rc) => serveTags(rc.tags));
      // Aviso do filtro
      document.querySelector('[data-render="receitas-filtro"]').textContent = restricoes().length ? `${lista.length} receitas para as suas restrições` : `${lista.length} receitas`;
      // Um card por receita
      document.querySelector('[data-render="receitas"]').replaceChildren(
        ...lista.map((rc) =>
          // Card (é um botão: abre o passo a passo)
          el("button", { type: "button", class: "receita-card", "data-action": "ver-receita", "data-nome": rc.nome }, [
            // Nome
            el("strong", { text: rc.nome }),
            // Tempo e porções
            el("span", { class: "meta", text: `${rc.tempo} • ${rc.porcoes} porç${rc.porcoes > 1 ? "ões" : "ão"}` }),
            // Macros
            el("span", { class: "meal-macros" }, [el("span", { class: "macro-chip macro-emerald", text: `P ${rc.proteina} g` }), el("span", { class: "tag", text: `${rc.kcal} kcal` })]),
          ]),
        ),
      );
    }

    // Abrir uma receita
    SL.acao("ver-receita", (alvo) => {
      // Receita
      const rc = RECEITAS.find((x) => x.nome === alvo.dataset.nome);
      // Botão de registrar como refeição
      const registrar = el("button", { type: "button", class: "btn-primary btn-block", text: "Registrar 1 porção como refeição" });
      // Ao registrar...
      registrar.addEventListener("click", () => {
        // ...hora de agora
        const agora = new Date();
        // ...id da refeição
        const id = "r" + Date.now();
        // ...salva
        guardarRefeicoes(refeicoes().concat({ id, nome: rc.nome, hora: `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`, descricao: "Receita do Saúde Life", kcal: rc.kcal, proteina: rc.proteina, carbo: rc.carbo, gordura: rc.gordura }));
        // ...pontos
        if (SL.pontos) SL.pontos.ganhar("refeicao", "refeicao:" + id);
        // ...fecha e redesenha
        SL.closeModal();
        // (redesenha)
        render();
        // ...avisa
        SL.toast("Refeição registrada");
      });
      // Abre o passo a passo
      SL.openModal(rc.nome, [
        // Tempo, porções e macros
        el("p", { class: "meta", text: `${rc.tempo} • ${rc.porcoes} porç${rc.porcoes > 1 ? "ões" : "ão"} • por porção: ${rc.kcal} kcal, P ${rc.proteina} g, C ${rc.carbo} g, G ${rc.gordura} g` }),
        // Ingredientes
        el("h3", { class: "receita-sub", text: "Ingredientes" }),
        // Lista de ingredientes
        el("ul", { class: "receita-lista" }, rc.ingredientes.map((i) => el("li", { text: i }))),
        // Modo de fazer
        el("h3", { class: "receita-sub", text: "Modo de fazer" }),
        // Passos numerados
        el("ol", { class: "receita-lista" }, rc.passos.map((p) => el("li", { text: p }))),
        // Registrar
        registrar,
      ]);
    });

    // Desenha a página a primeira vez
    render();
    // Desenha o cardápio sugerido
    renderCardapio();
    // Desenha as receitas
    renderReceitas();
  });
