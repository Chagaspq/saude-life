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
  });
