// Evolução: período (4, 8 ou 12 semanas), registro de peso,
// gráficos em SVG puro e histórico de treinos
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos HTML e SVG, ler/salvar dados e ícones
    const { el, svg, storage, ICONES } = SL;
    // Pega os números de exemplo (peso e cargas)
    const { EVOLUCAO } = window.SL_DADOS;
    // Quantos milissegundos tem um dia
    const DIA = 86400000;
    // Período escolhido (começa com 8 semanas)
    let semanas = 8;

    // Série semanal de exemplo: o último ponto é a semana atual
    // Transforma uma lista de valores em pontos com data, uma semana cada
    function serieSemanal(valores) {
      // Começo da semana atual
      const hoje = SL.inicioDaSemana(new Date()).getTime();
      // O último valor fica nesta semana, o penúltimo na anterior, e assim por diante
      return valores.map((valor, i) => ({ data: new Date(hoje - (valores.length - 1 - i) * 7 * DIA), valor }));
    }

    // Junta os pesos de exemplo com os que a pessoa registrou
    function pontosPeso() {
      // Pesos registrados pela pessoa
      const registrados = storage.get("sl-pesos", []).map((p) => ({ data: new Date(p.data), valor: p.valor }));
      // Pesos de exemplo...
      return serieSemanal(EVOLUCAO.peso)
        // ...mais os registrados...
        .concat(registrados)
        // ...em ordem de data
        .sort((a, b) => a.data - b.data);
    }

    // Deixa só os pontos que estão dentro do período escolhido
    function noPeriodo(pontos) {
      // Data de começo do período
      const limite = SL.inicioDaSemana(new Date()).getTime() - (semanas - 1) * 7 * DIA;
      // Filtra os pontos a partir dessa data
      return pontos.filter((p) => p.data.getTime() >= limite);
    }

    // Escreve a data curtinha (ex.: 05/10)
    const dataCurta = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

    // Desenha um gráfico de linha em SVG
    function grafico(pontos, unidade, casas) {
      // Largura do desenho
      const W = 520;
      // Altura do desenho
      const H = 220;
      // Espaços nas bordas (para os textos dos eixos)
      const pad = { top: 16, right: 16, bottom: 28, left: 44 };
      // Só os valores dos pontos
      const valores = pontos.map((p) => p.valor);
      // Menor valor
      const min = Math.min(...valores);
      // Maior valor
      const max = Math.max(...valores);
      // Folga em cima e embaixo (15% da diferença)
      const folga = (max - min) * 0.15 || 1;
      // Valor de baixo do gráfico
      const yMin = min - folga;
      // Valor de cima do gráfico
      const yMax = max + folga;
      // Quantos pontos são
      const n = pontos.length;
      // Calcula a posição na horizontal do ponto i
      const x = (i) => pad.left + (n === 1 ? 0.5 : i / (n - 1)) * (W - pad.left - pad.right);
      // Calcula a posição na vertical de um valor
      const y = (v) => pad.top + ((yMax - v) * (H - pad.top - pad.bottom)) / (yMax - yMin);

      // Primeiro valor
      const primeiro = valores[0];
      // Último valor
      const ultimo = valores[n - 1];
      // Atalho para escrever o número com as casas decimais certas
      const fmt = (v) => SL.num(v, casas);

      // Cria o desenho SVG
      const g = svg("svg", {
        // Área do desenho
        viewBox: `0 0 ${W} ${H}`,
        // Classe do gráfico
        class: "chart-svg",
        // Avisa os leitores de tela que é uma imagem
        role: "img",
        // Descrição do gráfico para leitores de tela
        "aria-label": `De ${fmt(primeiro)} para ${fmt(ultimo)} ${unidade} entre ${dataCurta(pontos[0].data)} e ${dataCurta(pontos[n - 1].data)}`,
      });

      // Para três alturas (embaixo, meio, em cima)...
      [0, 0.5, 1].forEach((t) => {
        // ...calcula o valor dessa altura
        const v = yMin + (yMax - yMin) * t;
        // ...desenha a linha de fundo
        g.append(svg("line", { x1: pad.left, x2: W - pad.right, y1: y(v), y2: y(v), class: "chart-grid" }));
        // ...cria o texto do eixo
        const label = svg("text", { x: pad.left - 8, y: y(v) + 4, class: "chart-label", "text-anchor": "end" });
        // Faixa pequena (ex.: 79 a 82 kg) precisa de uma casa decimal para não repetir rótulos
        // ...com uma casa decimal se a faixa for pequena
        label.textContent = SL.num(v, yMax - yMin < 6 ? 1 : 0);
        // ...e coloca no desenho
        g.append(label);
      });

      // Com muitos pontos, mostra uma data sim, outra não
      // De quantos em quantos pontos mostra a data
      const passo = n > 9 ? 2 : 1;
      // Para cada ponto...
      pontos.forEach((p, i) => {
        // ...pula os que não vão mostrar data
        if ((n - 1 - i) % passo) return;
        // ...cria o texto da data embaixo
        const label = svg("text", { x: x(i), y: H - 8, class: "chart-label", "text-anchor": "middle" });
        // ...escreve a data
        label.textContent = dataCurta(p.data);
        // ...e coloca no desenho
        g.append(label);
      });

      // Monta a lista de coordenadas da linha
      const linha = pontos.map((p, i) => `${x(i)},${y(p.valor)}`).join(" ");
      // Desenha a área pintada embaixo da linha
      g.append(svg("polygon", { points: `${x(0)},${H - pad.bottom} ${linha} ${x(n - 1)},${H - pad.bottom}`, class: "chart-area" }));
      // Desenha a linha
      g.append(svg("polyline", { points: linha, class: "chart-line" }));
      // Para cada ponto...
      pontos.forEach((p, i) => {
        // ...desenha a bolinha (a última é maior)
        const ponto = svg("circle", { cx: x(i), cy: y(p.valor), r: i === n - 1 ? 5 : 4, class: "chart-dot" + (i === n - 1 ? " is-last" : "") });
        // ...cria a dica que aparece ao passar o mouse
        const titulo = svg("title", {});
        // ...com a data e o valor
        titulo.textContent = `${dataCurta(p.data)}: ${fmt(p.valor)} ${unidade}`;
        // ...coloca a dica na bolinha
        ponto.append(titulo);
        // ...e a bolinha no desenho
        g.append(ponto);
      });
      // Devolve o gráfico pronto
      return g;
    }

    // Monta o resumo embaixo do gráfico (valor atual e quanto mudou)
    function resumoGrafico(pontos, unidade, casas, menorEhMelhor) {
      // Diferença entre o último e o primeiro valor
      const variacao = pontos[pontos.length - 1].valor - pontos[0].valor;
      // Diz se a mudança foi boa (peso caindo, carga subindo)
      const bom = menorEhMelhor ? variacao <= 0 : variacao >= 0;
      // Parágrafo do resumo
      return el("p", { class: "chart-summary" }, [
        // Valor atual
        el("strong", { text: `${SL.num(pontos[pontos.length - 1].valor, casas)} ${unidade}` }),
        // Variação...
        el("span", {
          // ...verde se boa, coral se ruim
          class: bom ? "trend-good" : "trend-bad",
          // ...com o sinal de + ou −
          text: `${variacao > 0 ? "+" : variacao < 0 ? "−" : ""}${SL.num(Math.abs(variacao), casas)} ${unidade} no período`,
        }),
      ]);
    }

    // Barras: treinos feitos em cada semana, com a meta tracejada
    // Desenha o gráfico de barras dos treinos por semana
    function graficoFrequencia(meta) {
      // Histórico de treinos
      const historico = SL.historico();
      // Começo da semana atual
      const hoje = SL.inicioDaSemana(new Date()).getTime();
      // Uma barra para cada semana do período
      const barras = Array.from({ length: semanas }, (_, i) => {
        // Começo da semana dessa barra
        const inicio = hoje - (semanas - 1 - i) * 7 * DIA;
        // Conta quantos treinos foram feitos nessa semana
        const qtd = historico.filter((h) => {
          // (começo da semana do treino)
          const t = SL.inicioDaSemana(h.data).getTime();
          // (é a mesma semana?)
          return t === inicio;
        }).length;
        // Devolve a data e a quantidade
        return { data: new Date(inicio), qtd };
      });

      // Largura do desenho
      const W = 520;
      // Altura do desenho
      const H = 200;
      // Espaços nas bordas
      const pad = { top: 16, right: 12, bottom: 28, left: 28 };
      // Valor mais alto do eixo (pelo menos a meta + 1)
      const maxY = Math.max(meta + 1, ...barras.map((b) => b.qtd));
      // Largura de cada barra (com o espaço)
      const largura = (W - pad.left - pad.right) / barras.length;
      // Calcula a posição na vertical de um valor
      const y = (v) => pad.top + ((maxY - v) * (H - pad.top - pad.bottom)) / maxY;

      // Cria o desenho SVG
      const g = svg("svg", {
        // Área do desenho
        viewBox: `0 0 ${W} ${H}`,
        // Classe do gráfico
        class: "chart-svg",
        // Avisa os leitores de tela que é uma imagem
        role: "img",
        // Descrição do gráfico
        "aria-label": `Treinos por semana nas últimas ${semanas} semanas. Meta: ${meta} por semana.`,
      });
      // Para cada semana...
      barras.forEach((b, i) => {
        // ...posição da barra na horizontal
        const bx = pad.left + i * largura + largura * 0.22;
        // ...largura da barra
        const bw = largura * 0.56;
        // ...cria o retângulo da barra
        const barra = svg("rect", {
          // (horizontal)
          x: bx,
          // (topo da barra)
          y: y(b.qtd),
          // (largura)
          width: bw,
          // (altura, nunca negativa)
          height: Math.max(0, H - pad.bottom - y(b.qtd)),
          // (cantos arredondados)
          rx: 6,
          // (fica verde se bateu a meta)
          class: "chart-bar" + (b.qtd >= meta ? " is-goal" : ""),
        });
        // ...cria a dica ao passar o mouse
        const titulo = svg("title", {});
        // ...com a semana e quantos treinos
        titulo.textContent = `Semana de ${dataCurta(b.data)}: ${b.qtd} treino(s)`;
        // ...coloca a dica na barra
        barra.append(titulo);
        // ...e a barra no desenho
        g.append(barra);
        // Se tem poucas semanas mostra todas as datas; se não, uma sim e outra não
        if (semanas <= 8 || i % 2 === (semanas - 1) % 2) {
          // Cria o texto da data
          const label = svg("text", { x: bx + bw / 2, y: H - 8, class: "chart-label", "text-anchor": "middle" });
          // Escreve a data
          label.textContent = dataCurta(b.data);
          // Coloca no desenho
          g.append(label);
        }
      });
      // Desenha a linha tracejada da meta
      g.append(svg("line", { x1: pad.left, x2: W - pad.right, y1: y(meta), y2: y(meta), class: "chart-goal" }));
      // Cria o número da meta no eixo
      const rotulo = svg("text", { x: pad.left - 8, y: y(meta) + 4, class: "chart-label", "text-anchor": "end" });
      // Escreve a meta
      rotulo.textContent = String(meta);
      // Coloca no desenho
      g.append(rotulo);
      // Devolve o gráfico pronto
      return g;
    }

    // Desenha a página toda
    function render() {
      // Pesos do período
      const peso = noPeriodo(pontosPeso());
      // Cargas do período
      const cargas = noPeriodo(serieSemanal(EVOLUCAO.cargas));
      // Data de começo do período
      const limite = SL.inicioDaSemana(new Date()).getTime() - (semanas - 1) * 7 * DIA;
      // Treinos feitos no período
      const historico = SL.historico().filter((h) => new Date(h.data).getTime() >= limite);
      // Meta de treinos por semana
      const meta = SL.estatisticas().meta;

      // Escreve "Últimas X semanas" nos gráficos
      document.querySelectorAll('[data-render="periodo-texto"]').forEach((n) => (n.textContent = `Últimas ${semanas} semanas`));
      // Escreve a explicação da linha da meta
      document.querySelector('[data-render="meta-semanal"]').textContent = `Linha tracejada: sua meta de ${meta} por semana`;

      // Quanto o peso mudou
      const variacaoPeso = peso[peso.length - 1].valor - peso[0].valor;
      // Quanto a carga mudou
      const variacaoCarga = cargas[cargas.length - 1].valor - cargas[0].valor;
      // Atalho que devolve o sinal (+ ou −)
      const sinal = (v) => (v > 0 ? "+" : v < 0 ? "−" : "");
      // Troca o resumo pelos 4 quadradinhos:
      document.querySelector('[data-render="evolucao-resumo"]').replaceChildren(
        // Peso atual
        SL.statTile({ rotulo: "Peso atual", valor: `${SL.num(peso[peso.length - 1].valor, 1)} kg`, detalhe: `${sinal(variacaoPeso)}${SL.num(Math.abs(variacaoPeso), 1)} kg no período`, iconePaths: ICONES.balanca, cor: "emerald" }),
        // Carga do agachamento
        SL.statTile({ rotulo: "Agachamento", valor: `${SL.num(cargas[cargas.length - 1].valor, 1)} kg`, detalhe: `${sinal(variacaoCarga)}${SL.num(Math.abs(variacaoCarga), 1)} kg no período`, iconePaths: ICONES.haltere }),
        // Treinos no período
        SL.statTile({ rotulo: "Treinos no período", valor: SL.num(historico.length), detalhe: `média de ${SL.num(historico.length / semanas, 1)} por semana`, iconePaths: ICONES.calendario, cor: "emerald" }),
        // Volume levantado (em toneladas)
        SL.statTile({ rotulo: "Volume levantado", valor: `${SL.num(historico.reduce((s, h) => s + (h.volume || 0), 0) / 1000, 1)} t`, detalhe: "soma de carga × repetições", iconePaths: ICONES.trofeu }),
      );

      // Desenha o gráfico de peso com o resumo
      document.querySelector('[data-render="grafico-peso"]').replaceChildren(resumoGrafico(peso, "kg", 1, true), grafico(peso, "kg", 1));
      // Desenha o gráfico de carga com o resumo
      document.querySelector('[data-render="grafico-cargas"]').replaceChildren(resumoGrafico(cargas, "kg", 1, false), grafico(cargas, "kg", 1));
      // Desenha o gráfico de frequência
      document.querySelector('[data-render="grafico-frequencia"]').replaceChildren(graficoFrequencia(meta));

      // Transforma os 6 treinos mais recentes em itens:
      const itens = historico.slice(0, 6).map((h) =>
        // item do histórico
        el("li", { class: "history-item" }, [
          // ícone de check
          el("span", { class: "icon-tile icon-tile-coral", "aria-hidden": "true" }, [SL.icone(ICONES.check)]),
          // textos
          el("div", {}, [
            // nome do treino
            el("strong", { text: h.nome }),
            // quando, quanto tempo e quantas séries
            el("span", { text: `${SL.dataRelativa(h.data)} • ${SL.duracaoTexto(h.duracao)} • ${h.series} séries` }),
          ]),
          // peso levantado (se tiver)
          h.volume ? el("span", { class: "tag", text: `${SL.num(h.volume)} kg` }) : null,
        ]),
      );
      // Acha a lista do histórico...
      document
        .querySelector('[data-render="historico"]')
        // ...e coloca os itens (ou a mensagem de vazio)
        .replaceChildren(...(itens.length ? itens : [el("li", { class: "meta", text: "Nenhum treino neste período." })]));
    }

    // Quando clicam nos botões de período...
    document.querySelector(".segmented").addEventListener("click", (e) => {
      // ...descobre qual botão foi
      const botao = e.target.closest("[data-periodo]");
      // Se não foi em um botão, para
      if (!botao) return;
      // Guarda o período escolhido
      semanas = Number(botao.dataset.periodo);
      // Para cada botão...
      document.querySelectorAll("[data-periodo]").forEach((b) => {
        // ...destaca o escolhido
        b.classList.toggle("is-active", b === botao);
        // ...e avisa os leitores de tela
        b.setAttribute("aria-pressed", String(b === botao));
      });
      // Desenha de novo
      render();
    });

    // Botão de registrar peso...
    SL.acao("registrar-peso", () => {
      // ...pega o último peso
      const atual = pontosPeso().slice(-1)[0].valor;
      // Cria o formulário
      const form = el("form", { class: "modal-form" }, [
        // Campo do peso (entre 30 e 300 kg)
        SL.campo("peso-valor", "Peso de hoje (kg)", { type: "number", min: 30, max: 300, step: 0.1, required: true }),
        // Botão de salvar
        el("button", { type: "submit", class: "btn-primary", text: "Salvar peso" }),
      ]);
      // Pega o campo
      const campo = form.querySelector("#peso-valor");
      // Começa com o último peso
      campo.value = atual.toFixed(1);
      // No celular, abre o teclado de números com vírgula
      campo.setAttribute("inputmode", "decimal");
      // Quando clicam em salvar...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // Lê o número (aceita vírgula) com uma casa decimal
        const valor = Math.round(Number(String(campo.value).replace(",", ".")) * 10) / 10;
        // Se não está entre 30 e 300...
        if (!(valor >= 30 && valor <= 300)) {
          // ...coloca o foco no campo
          campo.focus();
          // ...e para
          return;
        }
        // Um registro por dia: registrar de novo no mesmo dia substitui
        // Data de hoje
        const hoje = new Date().toDateString();
        // Tira o registro de hoje (se tiver)
        const pesos = storage.get("sl-pesos", []).filter((p) => new Date(p.data).toDateString() !== hoje);
        // Coloca o novo registro
        pesos.push({ data: new Date().toISOString(), valor });
        // Salva no navegador
        storage.set("sl-pesos", pesos);
        // Fecha o modal
        SL.closeModal();
        // Desenha de novo
        render();
        // Mostra o aviso
        SL.toast(`Peso registrado: ${SL.num(valor, 1)} kg`);
      });
      // Abre o modal com o formulário
      SL.openModal("Registrar peso", form);
    });

    // Desenha a página a primeira vez
    render();

    /* ============================================
       MAIS EVOLUÇÃO: metas, corpo, recordes, mapa de calor, fotos e resumos
       ============================================ */

    // Biblioteca de exercícios (para saber os músculos)
    const BIBLIOTECA = window.SL_EXERCICIOS || {};
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Formata kg com uma casa só quando precisa (62,5 kg; 80 kg)
    const kg = (v) => `${SL.num(v, v % 1 ? 1 : 0)} kg`;

    // Recordes: a maior carga de cada exercício (do app + as cargas dos seus treinos)
    function listaRecordes() {
      // Recordes batidos no app
      const batidos = storage.get("sl-recordes", {});
      // Começa com as cargas dos exercícios dos seus treinos
      const lista = {};
      // Para cada treino seu...
      SL.treinosDoUsuario().forEach((t) =>
        // ...e cada exercício com carga...
        SL.exerciciosDe(t).forEach((e) => {
          // ...guarda a maior carga
          if (e.carga && typeof e.reps === "number") lista[e.nome] = Math.max(lista[e.nome] || 0, e.carga);
        }),
      );
      // O agachamento da Evolução de exemplo também conta
      lista["Agachamento livre"] = Math.max(lista["Agachamento livre"] || 0, Math.max(...EVOLUCAO.cargas));
      // Junta com os recordes batidos no app (marcados com "novo")
      Object.entries(batidos).forEach(([nome, v]) => {
        // Se o batido é maior, ele vale
        if (v >= (lista[nome] || 0)) lista[nome] = v;
      });
      // Devolve em ordem do maior para o menor
      return Object.entries(lista)
        .map(([nome, v]) => ({ nome, v, batido: batidos[nome] === v }))
        .sort((a, b) => b.v - a.v);
    }

    // Desenha os recordes
    function renderRecordes() {
      // Os 8 maiores
      const lista = listaRecordes().slice(0, 8);
      // Medalhas dos 3 primeiros
      const medalhas = ["🥇", "🥈", "🥉"];
      // Troca a lista
      $("recordes").replaceChildren(
        // Uma linha por recorde
        ...lista.map((r, i) =>
          // Linha
          el("li", {}, [
            // Medalha ou posição
            el("span", { class: "ev-rec-pos", "aria-hidden": "true", text: medalhas[i] || `${i + 1}º` }),
            // Nome
            el("span", { class: "ev-rec-nome", text: r.nome }),
            // Etiqueta de recorde batido no app
            r.batido ? el("span", { class: "tag tag-success", text: "batido no app" }) : null,
            // Carga
            el("strong", { class: "ev-rec-kg", text: kg(r.v) }),
          ]),
        ),
      );
    }

    // Músculos de cada região do corpo desenhado: [id, lado, forma]
    const REGIOES = [
      // Frente: ombros
      ["ombros", "frente", ["ellipse", { cx: 32, cy: 44, rx: 8, ry: 6 }], ["ellipse", { cx: 68, cy: 44, rx: 8, ry: 6 }]],
      // Frente: peito
      ["peito", "frente", ["ellipse", { cx: 42, cy: 55, rx: 9, ry: 7 }], ["ellipse", { cx: 58, cy: 55, rx: 9, ry: 7 }]],
      // Frente: bíceps
      ["biceps", "frente", ["ellipse", { cx: 25, cy: 66, rx: 5, ry: 10 }], ["ellipse", { cx: 75, cy: 66, rx: 5, ry: 10 }]],
      // Frente: abdômen
      ["abdomen", "frente", ["rect", { x: 41, y: 65, width: 18, height: 27, rx: 5 }]],
      // Frente: quadríceps
      ["quadriceps", "frente", ["ellipse", { cx: 43, cy: 116, rx: 7.5, ry: 19 }], ["ellipse", { cx: 57, cy: 116, rx: 7.5, ry: 19 }]],
      // Frente: panturrilhas
      ["panturrilhas", "frente", ["ellipse", { cx: 43, cy: 155, rx: 5, ry: 12 }], ["ellipse", { cx: 57, cy: 155, rx: 5, ry: 12 }]],
      // Costas: ombros
      ["ombros", "costas", ["ellipse", { cx: 132, cy: 44, rx: 8, ry: 6 }], ["ellipse", { cx: 168, cy: 44, rx: 8, ry: 6 }]],
      // Costas: dorsais
      ["costas", "costas", ["path", { d: "M136 48 h28 l-4 30 q-10 8 -20 0z" }]],
      // Costas: tríceps
      ["triceps", "costas", ["ellipse", { cx: 125, cy: 66, rx: 5, ry: 10 }], ["ellipse", { cx: 175, cy: 66, rx: 5, ry: 10 }]],
      // Costas: glúteos
      ["gluteos", "costas", ["ellipse", { cx: 143, cy: 98, rx: 8.5, ry: 8 }], ["ellipse", { cx: 157, cy: 98, rx: 8.5, ry: 8 }]],
      // Costas: posteriores de coxa
      ["posteriores", "costas", ["ellipse", { cx: 143, cy: 122, rx: 7, ry: 15 }], ["ellipse", { cx: 157, cy: 122, rx: 7, ry: 15 }]],
      // Costas: panturrilhas
      ["panturrilhas", "costas", ["ellipse", { cx: 143, cy: 155, rx: 5, ry: 12 }], ["ellipse", { cx: 157, cy: 155, rx: 5, ry: 12 }]],
    ];

    // Conta as séries de cada músculo nos últimos 30 dias
    function seriesPorMusculo() {
      // Contagem
      const conta = {};
      // Data de 30 dias atrás
      const limite = Date.now() - 30 * DIA;
      // Para cada treino feito nos últimos 30 dias...
      SL.historico()
        .filter((h) => new Date(h.data).getTime() >= limite)
        .forEach((h) => {
          // ...acha o treino
          const treino = SL.acharTreino(h.treinoId);
          // ...e para cada exercício dele...
          SL.exerciciosDe(treino).forEach((e) => {
            // ...soma as séries em cada músculo trabalhado
            ((BIBLIOTECA[e.nome] || {}).musculos || []).forEach((m) => (conta[m] = (conta[m] || 0) + e.series));
          });
        });
      // Devolve
      return conta;
    }

    // Desenha o corpo (frente e costas) com os músculos acesos
    function renderCorpo() {
      // Séries por músculo
      const conta = seriesPorMusculo();
      // Maior contagem (para a escala de cor)
      const maior = Math.max(1, ...Object.values(conta));
      // Desenho
      const g = svg("svg", { viewBox: "0 0 200 180", class: "ev-corpo-svg", role: "img", "aria-label": "Corpo de frente e de costas, com os músculos mais treinados em destaque" });
      // Silhueta (frente e costas): cabeça, tronco, braços e pernas
      [0, 100].forEach((dx) => {
        // Cabeça
        g.append(svg("circle", { cx: 50 + dx, cy: 20, r: 11, class: "ev-silhueta" }));
        // Tronco
        g.append(svg("rect", { x: 30 + dx, y: 36, width: 40, height: 62, rx: 14, class: "ev-silhueta" }));
        // Braço esquerdo
        g.append(svg("rect", { x: 18 + dx, y: 42, width: 12, height: 52, rx: 6, class: "ev-silhueta" }));
        // Braço direito
        g.append(svg("rect", { x: 70 + dx, y: 42, width: 12, height: 52, rx: 6, class: "ev-silhueta" }));
        // Perna esquerda
        g.append(svg("rect", { x: 35 + dx, y: 92, width: 15, height: 78, rx: 7, class: "ev-silhueta" }));
        // Perna direita
        g.append(svg("rect", { x: 50 + dx, y: 92, width: 15, height: 78, rx: 7, class: "ev-silhueta" }));
      });
      // Para cada região de músculo...
      REGIOES.forEach(([id, , ...formas]) => {
        // ...quanto esse músculo foi treinado (de 0 a 1)
        const nivel = (conta[id] || 0) / maior;
        // ...desenha as formas com a cor proporcional
        formas.forEach(([tag, attrs]) => {
          // Forma do músculo
          const f = svg(tag, { ...attrs, class: "ev-musculo", "fill-opacity": (0.12 + nivel * 0.88).toFixed(2) });
          // Dica ao passar o mouse
          const dica = svg("title", {});
          // Texto da dica
          dica.textContent = `${id}: ${conta[id] || 0} séries em 30 dias`;
          // Coloca a dica
          f.append(dica);
          // Coloca a forma
          g.append(f);
        });
      });
      // Rótulos "Frente" e "Costas"
      [["Frente", 50], ["Costas", 150]].forEach(([t, x]) => {
        // Texto
        const r = svg("text", { x, y: 178, "text-anchor": "middle", class: "chart-label" });
        // Escreve
        r.textContent = t;
        // Coloca
        g.append(r);
      });
      // Os 3 músculos mais treinados, em texto
      const top = Object.entries(conta).filter(([m]) => m !== "corpo").sort((a, b) => b[1] - a[1]).slice(0, 3);
      // Nomes bonitos
      const NOMES = { peito: "Peito", costas: "Costas", ombros: "Ombros", biceps: "Bíceps", triceps: "Tríceps", abdomen: "Abdômen", quadriceps: "Quadríceps", posteriores: "Posteriores", gluteos: "Glúteos", panturrilhas: "Panturrilhas" };
      // Troca o conteúdo
      $("corpo").replaceChildren(g, el("p", { class: "meta", text: top.length ? `Mais treinados: ${top.map(([m, n]) => `${NOMES[m] || m} (${n})`).join(", ")}` : "Treine para ver seus músculos acenderem!" }));
    }

    // Desenha o mapa de calor do último ano (uma coluna por semana, uma linha por dia)
    function renderCalor() {
      // Treinos por dia
      const porDia = {};
      // Conta cada treino do histórico
      SL.historico().forEach((h) => {
        // Chave do dia
        const k = new Date(h.data).toDateString();
        // Soma
        porDia[k] = (porDia[k] || 0) + 1;
      });
      // Começo: segunda-feira de 52 semanas atrás
      const inicio = SL.inicioDaSemana(new Date(Date.now() - 52 * 7 * DIA));
      // Grade
      const grade = el("div", { class: "ev-calor-grade", role: "img", "aria-label": `Calendário do último ano com ${Object.keys(porDia).length} dias de treino` });
      // Nomes dos meses
      const meses = el("div", { class: "ev-calor-meses", "aria-hidden": "true" });
      // Último mês escrito
      let mesAnterior = -1;
      // Dias treinados no ano
      let total = 0;
      // Para cada uma das 53 semanas...
      for (let w = 0; w < 53; w++) {
        // ...coluna da semana
        const coluna = el("div", { class: "ev-calor-col" });
        // ...primeiro dia da semana
        const seg = new Date(inicio.getTime() + w * 7 * DIA);
        // ...escreve o mês quando muda
        meses.append(el("span", { text: seg.getMonth() !== mesAnterior ? seg.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : "" }));
        // ...guarda o mês
        mesAnterior = seg.getMonth();
        // ...para cada dia da semana
        for (let d = 0; d < 7; d++) {
          // Data do quadradinho
          const dia = new Date(seg.getTime() + d * DIA);
          // Dias no futuro ficam vazios
          if (dia > new Date()) {
            // Quadradinho invisível
            coluna.append(el("span", { class: "ev-dia is-futuro" }));
            // Próximo
            continue;
          }
          // Quantos treinos nesse dia
          const n = porDia[dia.toDateString()] || 0;
          // Conta o dia treinado
          if (n) total++;
          // Quadradinho com a cor do nível
          const q = el("span", { class: `ev-dia nivel-${Math.min(3, n)}` });
          // Dica com a data
          q.title = `${dia.toLocaleDateString("pt-BR")}: ${n ? `${n} treino${n > 1 ? "s" : ""}` : "descanso"}`;
          // Coloca na coluna
          coluna.append(q);
        }
        // Coloca a coluna na grade
        grade.append(coluna);
      }
      // Escreve o total
      $("calor-total").textContent = `${total} dias treinados no último ano`;
      // Troca o conteúdo (com rolagem para o lado no celular)
      $("calor").replaceChildren(el("div", { class: "ev-calor-rolar" }, [meses, grade]));
    }

    // Desenha as metas pessoais
    function renderMetas() {
      // Metas salvas
      const m = storage.get("sl-metas-pessoais", null);
      // Sem metas: convite
      if (!m) {
        // Estado vazio com botão
        $("metas-pessoais").replaceChildren(SL.estadoVazio("Defina uma meta", "Peso alvo, carga alvo e até quando: o app mostra quanto falta.", el("button", { type: "button", class: "btn-primary", "data-action": "definir-metas", text: "Definir metas" })));
        // Para
        return;
      }
      // Peso de hoje
      const pesoAtual = pontosPeso().slice(-1)[0].valor;
      // Peso no começo (o primeiro ponto)
      const pesoInicio = m.pesoInicio || pontosPeso()[0].valor;
      // Recorde atual do exercício escolhido
      const recorde = (listaRecordes().find((r) => r.nome === m.exercicio) || { v: 0 }).v;
      // Dias até a data alvo
      const dias = m.data ? Math.ceil((new Date(m.data) - Date.now()) / DIA) : null;
      // Cartões de meta
      const cartoes = [];
      // Meta de peso
      if (m.peso) {
        // Quanto já andou (de 0 a 1)
        const pct = pesoInicio === m.peso ? 1 : Math.max(0, Math.min(1, (pesoInicio - pesoAtual) / (pesoInicio - m.peso)));
        // Cartão
        cartoes.push(cartaoMeta("Peso", `${SL.num(pesoAtual, 1)} → ${SL.num(m.peso, 1)} kg`, pct, Math.abs(pesoAtual - m.peso) < 0.05 ? "Meta batida! 🎉" : `Faltam ${SL.num(Math.abs(pesoAtual - m.peso), 1)} kg`));
      }
      // Meta de carga
      if (m.exercicio && m.carga) {
        // Quanto já andou
        const pct = Math.min(1, recorde / m.carga);
        // Cartão
        cartoes.push(cartaoMeta(m.exercicio, `${kg(recorde)} → ${kg(m.carga)}`, pct, recorde >= m.carga ? "Meta batida! 🎉" : `Faltam ${kg(m.carga - recorde)}`));
      }
      // Meta de data
      if (dias != null) cartoes.push(cartaoMeta("Prazo", new Date(m.data).toLocaleDateString("pt-BR"), null, dias > 0 ? `Faltam ${dias} dias` : "Chegou o dia!"));
      // Troca o conteúdo
      $("metas-pessoais").replaceChildren(...cartoes);
      // Pinta as barras
      SL.aplicarProgresso();
    }

    // Um cartão de meta com barra de progresso
    function cartaoMeta(titulo, valor, pct, falta) {
      // Cartão
      return el("article", { class: "ev-meta" + (pct === 1 ? " is-batida" : "") }, [
        // Título
        el("span", { class: "meta", text: titulo }),
        // Valor
        el("strong", { class: "ev-meta-valor", text: valor }),
        // Barra (se tiver porcentagem)
        pct != null ? el("div", { class: "progress-bar-sm progress-emerald", role: "progressbar", "aria-label": `Progresso: ${titulo}`, "aria-valuenow": Math.round(pct * 100), "aria-valuemin": 0, "aria-valuemax": 100 }, [el("div", { class: "fill", "data-progress": Math.round(pct * 100) })]) : null,
        // Quanto falta
        el("span", { class: "meta", text: falta }),
      ]);
    }

    // Botão "Definir metas"
    SL.acao("definir-metas", () => {
      // Metas salvas
      const m = storage.get("sl-metas-pessoais", {}) || {};
      // Exercícios com recorde (para escolher)
      const exercicios = listaRecordes().map((r) => r.nome);
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Peso alvo
        SL.campo("mp-peso", "Peso alvo (kg)", { type: "number", min: 30, max: 300, step: 0.1 }),
        // Exercício
        el("div", { class: "form-group" }, [
          // Nome do campo
          el("label", { for: "mp-ex", text: "Exercício da meta de carga" }),
          // Caixa de seleção
          el("select", { id: "mp-ex", class: "ev-select" }, [el("option", { value: "", text: "Sem meta de carga" }), ...exercicios.map((n) => el("option", { value: n, text: n }))]),
        ]),
        // Carga alvo
        SL.campo("mp-carga", "Carga alvo (kg)", { type: "number", min: 1, max: 500, step: 0.5 }),
        // Data alvo
        SL.campo("mp-data", "Até quando?", { type: "date" }),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Salvar metas" }),
      ]);
      // Preenche com o que já tem
      form.querySelector("#mp-peso").value = m.peso || "";
      // Exercício
      form.querySelector("#mp-ex").value = m.exercicio || "";
      // Carga
      form.querySelector("#mp-carga").value = m.carga || "";
      // Data
      form.querySelector("#mp-data").value = m.data || "";
      // Quando envia...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // ...guarda as metas (e o peso de hoje como ponto de partida)
        storage.set("sl-metas-pessoais", {
          // Peso alvo
          peso: Number(form.querySelector("#mp-peso").value) || null,
          // Peso de partida
          pesoInicio: m.pesoInicio || pontosPeso().slice(-1)[0].valor,
          // Exercício
          exercicio: form.querySelector("#mp-ex").value || null,
          // Carga alvo
          carga: Number(form.querySelector("#mp-carga").value) || null,
          // Data
          data: form.querySelector("#mp-data").value || null,
        });
        // ...fecha
        SL.closeModal();
        // ...desenha
        renderMetas();
        // ...avisa
        SL.toast("Metas salvas. Bora!");
      });
      // Abre o modal
      SL.openModal("Minhas metas", form);
    });

    /* ---------- Fotos de antes e depois ---------- */

    // Diminui uma foto para no máximo 600 pixels (para caber no navegador)
    function diminuir(arquivo) {
      // Promessa (a imagem demora para carregar)
      return new Promise((resolve) => {
        // Imagem temporária
        const img = new Image();
        // Quando carregar...
        img.onload = () => {
          // ...escala
          const escala = Math.min(1, 600 / Math.max(img.width, img.height));
          // ...tela de desenho
          const c = document.createElement("canvas");
          // Largura
          c.width = Math.round(img.width * escala);
          // Altura
          c.height = Math.round(img.height * escala);
          // Desenha menor
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          // Devolve como JPEG
          resolve(c.toDataURL("image/jpeg", 0.75));
          // Libera a memória
          URL.revokeObjectURL(img.src);
        };
        // Carrega
        img.src = URL.createObjectURL(arquivo);
      });
    }

    // Quando escolhe uma foto, guarda com a data de hoje
    $("foto-input").addEventListener("change", (e) => {
      // Arquivo
      const arquivo = e.target.files[0];
      // Se não escolheu, para
      if (!arquivo) return;
      // Diminui e guarda
      diminuir(arquivo).then((img) => {
        // Fotos salvas
        const fotos = storage.get("sl-fotos", []);
        // Junta a nova
        fotos.push({ data: new Date().toISOString(), img });
        // Tenta salvar (pode faltar espaço no navegador)
        storage.set("sl-fotos", fotos);
        // Confere se salvou
        if (storage.get("sl-fotos", []).length !== fotos.length) SL.toast("Sem espaço no navegador para mais fotos. Apague uma antiga.");
        // Avisa
        else SL.toast("Foto guardada só neste aparelho 🔒");
        // Desenha
        renderFotos();
        // Limpa o campo
        e.target.value = "";
      });
    });

    // Desenha a comparação de antes e depois
    function renderFotos() {
      // Fotos salvas
      const fotos = storage.get("sl-fotos", []);
      // Menos de 2 fotos: explica
      if (fotos.length < 2) {
        // Estado vazio
        $("fotos").replaceChildren(SL.estadoVazio(fotos.length ? "Falta a foto de depois" : "Nenhuma foto ainda", "Tire uma foto hoje e outra daqui a algumas semanas, no mesmo lugar e na mesma luz. Elas ficam só no seu aparelho.", null));
        // Para
        return;
      }
      // Data curta
      const curta = (iso) => new Date(iso).toLocaleDateString("pt-BR");
      // Escolha de "antes" e "depois"
      const opcoes = () => fotos.map((f, i) => el("option", { value: i, text: curta(f.data) }));
      // Caixa de "antes"
      const selAntes = el("select", { class: "ev-select", "aria-label": "Foto de antes" }, opcoes());
      // Caixa de "depois"
      const selDepois = el("select", { class: "ev-select", "aria-label": "Foto de depois" }, opcoes());
      // Começa com a primeira e a última
      selAntes.value = 0;
      // (última)
      selDepois.value = fotos.length - 1;
      // Imagem de antes (embaixo)
      const imgAntes = el("img", { alt: "Foto de antes" });
      // Imagem de depois (em cima, cortada pelo controle)
      const imgDepois = el("img", { alt: "Foto de depois", class: "ev-foto-depois" });
      // Controle deslizante
      const deslizar = el("input", { type: "range", min: 0, max: 100, value: 50, class: "ev-deslizar", "aria-label": "Arraste para comparar antes e depois" });
      // Atualiza as imagens e o corte
      function atualizar() {
        // Antes
        imgAntes.src = fotos[selAntes.value].img;
        // Depois
        imgDepois.src = fotos[selDepois.value].img;
        // Corte do "depois" (mostra do controle para a direita)
        imgDepois.style.clipPath = `inset(0 0 0 ${deslizar.value}%)`;
      }
      // Mudanças atualizam
      [selAntes, selDepois, deslizar].forEach((x) => x.addEventListener("input", atualizar));
      // Botão de apagar a foto de depois
      const apagar = el("button", { type: "button", class: "btn-link", text: "Apagar a foto de depois" });
      // Ao clicar, apaga (com confirmação)
      apagar.addEventListener("click", () =>
        // Pergunta
        SL.confirmar({ titulo: "Apagar esta foto?", texto: "Ela sai deste aparelho para sempre.", rotulo: "Apagar", perigo: true, fn: () => {
          // Tira a foto
          storage.set("sl-fotos", fotos.filter((_, i) => i !== Number(selDepois.value)));
          // Desenha de novo
          renderFotos();
        } }),
      );
      // Troca o conteúdo
      $("fotos").replaceChildren(
        // Escolhas
        el("div", { class: "ev-fotos-escolha" }, [el("label", {}, ["Antes ", selAntes]), el("label", {}, ["Depois ", selDepois])]),
        // Comparação
        el("div", { class: "ev-comparar" }, [imgAntes, imgDepois, el("span", { class: "ev-linha", "aria-hidden": "true" })]),
        // Controle
        deslizar,
        // Apagar
        apagar,
      );
      // Posição da linha acompanha o controle
      deslizar.addEventListener("input", () => (document.querySelector(".ev-linha").style.left = deslizar.value + "%"));
      // Primeira atualização
      atualizar();
    }

    /* ---------- Resumo da semana / do mês (stories) ---------- */

    // Botão de resumo
    SL.acao("resumo", (alvo) => {
      // Se o stories não carregou, para
      if (!SL.stories || !SL.pontos) return;
      // Semana ou mês
      const tipo = alvo.dataset.periodoResumo;
      // Começo e fim do período
      const { ini, fim } = SL.pontos.periodo(tipo);
      // Treinos do período
      const lista = SL.historico().filter((h) => new Date(h.data).getTime() >= ini && new Date(h.data).getTime() < fim);
      // Minutos
      const minutos = lista.reduce((t, h) => t + (h.duracao || 0), 0);
      // Volume
      const volume = lista.reduce((t, h) => t + (h.volume || 0), 0);
      // Pontos
      const pts = SL.pontos.somar(ini, fim);
      // Posição entre os amigos
      const pos = SL.pontos.minhaPosicao("amigos", tipo);
      // Liga
      const liga = SL.pontos.LIGAS[SL.pontos.liga().atual].nome;
      // Nome do período
      const nome = tipo === "semana" ? "semana" : "mês";
      // Abre o stories
      SL.stories.abrir(`Seu ${tipo === "semana" ? "resumo da semana" : "resumo do mês"}`, [
        // Tela 1: treinos
        { kicker: `Sua ${nome} em números`, numero: SL.num(lista.length), legenda: lista.length === 1 ? "treino feito" : "treinos feitos", texto: lista.length ? "Cada um contou. Bora manter!" : "Ainda dá tempo de começar!" },
        // Tela 2: tempo
        { kicker: "Tempo de treino", numero: SL.duracaoTexto(minutos), legenda: "de suor", texto: `Média de ${SL.num(lista.length ? minutos / lista.length : 0)} min por treino` },
        // Tela 3: pontos
        { kicker: "Pontos", numero: SL.num(pts), legenda: "pontos", texto: `Liga ${liga}${pos ? ` • ${pos.posicao}º de ${pos.total} entre os amigos` : ""}` },
        // Tela 4: volume
        { kicker: "Força", numero: `${SL.num(volume / 1000, 1)} t`, legenda: "levantadas no total", texto: "Isso é mais que um carro popular!" },
        // Tela 5: Pulso
        { kicker: "Recado do Pulso", numero: "💪", legenda: SL.personagem ? SL.personagem.frase() : "Bora pra próxima!", texto: "" },
      ]);
    });

    // Desenha as partes novas
    renderMetas();
    // Corpo
    renderCorpo();
    // Recordes
    renderRecordes();
    // Mapa de calor
    renderCalor();
    // Fotos
    renderFotos();
  });
