// Evolução: período (4, 8 ou 12 semanas), registro de peso,
// gráficos em SVG puro e histórico de treinos
window.SL &&
  SL.pagina(() => {
    const { el, svg, storage, ICONES } = SL;
    const { EVOLUCAO } = window.SL_DADOS;
    const DIA = 86400000;
    let semanas = 8;

    // Série semanal de exemplo: o último ponto é a semana atual
    function serieSemanal(valores) {
      const hoje = SL.inicioDaSemana(new Date()).getTime();
      return valores.map((valor, i) => ({ data: new Date(hoje - (valores.length - 1 - i) * 7 * DIA), valor }));
    }

    function pontosPeso() {
      const registrados = storage.get("sl-pesos", []).map((p) => ({ data: new Date(p.data), valor: p.valor }));
      return serieSemanal(EVOLUCAO.peso)
        .concat(registrados)
        .sort((a, b) => a.data - b.data);
    }

    function noPeriodo(pontos) {
      const limite = SL.inicioDaSemana(new Date()).getTime() - (semanas - 1) * 7 * DIA;
      return pontos.filter((p) => p.data.getTime() >= limite);
    }

    const dataCurta = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

    function grafico(pontos, unidade, casas) {
      const W = 520;
      const H = 220;
      const pad = { top: 16, right: 16, bottom: 28, left: 44 };
      const valores = pontos.map((p) => p.valor);
      const min = Math.min(...valores);
      const max = Math.max(...valores);
      const folga = (max - min) * 0.15 || 1;
      const yMin = min - folga;
      const yMax = max + folga;
      const n = pontos.length;
      const x = (i) => pad.left + (n === 1 ? 0.5 : i / (n - 1)) * (W - pad.left - pad.right);
      const y = (v) => pad.top + ((yMax - v) * (H - pad.top - pad.bottom)) / (yMax - yMin);

      const primeiro = valores[0];
      const ultimo = valores[n - 1];
      const fmt = (v) => SL.num(v, casas);

      const g = svg("svg", {
        viewBox: `0 0 ${W} ${H}`,
        class: "chart-svg",
        role: "img",
        "aria-label": `De ${fmt(primeiro)} para ${fmt(ultimo)} ${unidade} entre ${dataCurta(pontos[0].data)} e ${dataCurta(pontos[n - 1].data)}`,
      });

      [0, 0.5, 1].forEach((t) => {
        const v = yMin + (yMax - yMin) * t;
        g.append(svg("line", { x1: pad.left, x2: W - pad.right, y1: y(v), y2: y(v), class: "chart-grid" }));
        const label = svg("text", { x: pad.left - 8, y: y(v) + 4, class: "chart-label", "text-anchor": "end" });
        // Faixa pequena (ex.: 79 a 82 kg) precisa de uma casa decimal para não repetir rótulos
        label.textContent = SL.num(v, yMax - yMin < 6 ? 1 : 0);
        g.append(label);
      });

      // Com muitos pontos, mostra uma data sim, outra não
      const passo = n > 9 ? 2 : 1;
      pontos.forEach((p, i) => {
        if ((n - 1 - i) % passo) return;
        const label = svg("text", { x: x(i), y: H - 8, class: "chart-label", "text-anchor": "middle" });
        label.textContent = dataCurta(p.data);
        g.append(label);
      });

      const linha = pontos.map((p, i) => `${x(i)},${y(p.valor)}`).join(" ");
      g.append(svg("polygon", { points: `${x(0)},${H - pad.bottom} ${linha} ${x(n - 1)},${H - pad.bottom}`, class: "chart-area" }));
      g.append(svg("polyline", { points: linha, class: "chart-line" }));
      pontos.forEach((p, i) => {
        const ponto = svg("circle", { cx: x(i), cy: y(p.valor), r: i === n - 1 ? 5 : 4, class: "chart-dot" + (i === n - 1 ? " is-last" : "") });
        const titulo = svg("title", {});
        titulo.textContent = `${dataCurta(p.data)}: ${fmt(p.valor)} ${unidade}`;
        ponto.append(titulo);
        g.append(ponto);
      });
      return g;
    }

    function resumoGrafico(pontos, unidade, casas, menorEhMelhor) {
      const variacao = pontos[pontos.length - 1].valor - pontos[0].valor;
      const bom = menorEhMelhor ? variacao <= 0 : variacao >= 0;
      return el("p", { class: "chart-summary" }, [
        el("strong", { text: `${SL.num(pontos[pontos.length - 1].valor, casas)} ${unidade}` }),
        el("span", {
          class: bom ? "trend-good" : "trend-bad",
          text: `${variacao > 0 ? "+" : variacao < 0 ? "−" : ""}${SL.num(Math.abs(variacao), casas)} ${unidade} no período`,
        }),
      ]);
    }

    // Barras: treinos feitos em cada semana, com a meta tracejada
    function graficoFrequencia(meta) {
      const historico = SL.historico();
      const hoje = SL.inicioDaSemana(new Date()).getTime();
      const barras = Array.from({ length: semanas }, (_, i) => {
        const inicio = hoje - (semanas - 1 - i) * 7 * DIA;
        const qtd = historico.filter((h) => {
          const t = SL.inicioDaSemana(h.data).getTime();
          return t === inicio;
        }).length;
        return { data: new Date(inicio), qtd };
      });

      const W = 520;
      const H = 200;
      const pad = { top: 16, right: 12, bottom: 28, left: 28 };
      const maxY = Math.max(meta + 1, ...barras.map((b) => b.qtd));
      const largura = (W - pad.left - pad.right) / barras.length;
      const y = (v) => pad.top + ((maxY - v) * (H - pad.top - pad.bottom)) / maxY;

      const g = svg("svg", {
        viewBox: `0 0 ${W} ${H}`,
        class: "chart-svg",
        role: "img",
        "aria-label": `Treinos por semana nas últimas ${semanas} semanas. Meta: ${meta} por semana.`,
      });
      barras.forEach((b, i) => {
        const bx = pad.left + i * largura + largura * 0.22;
        const bw = largura * 0.56;
        const barra = svg("rect", {
          x: bx,
          y: y(b.qtd),
          width: bw,
          height: Math.max(0, H - pad.bottom - y(b.qtd)),
          rx: 6,
          class: "chart-bar" + (b.qtd >= meta ? " is-goal" : ""),
        });
        const titulo = svg("title", {});
        titulo.textContent = `Semana de ${dataCurta(b.data)}: ${b.qtd} treino(s)`;
        barra.append(titulo);
        g.append(barra);
        if (semanas <= 8 || i % 2 === (semanas - 1) % 2) {
          const label = svg("text", { x: bx + bw / 2, y: H - 8, class: "chart-label", "text-anchor": "middle" });
          label.textContent = dataCurta(b.data);
          g.append(label);
        }
      });
      g.append(svg("line", { x1: pad.left, x2: W - pad.right, y1: y(meta), y2: y(meta), class: "chart-goal" }));
      const rotulo = svg("text", { x: pad.left - 8, y: y(meta) + 4, class: "chart-label", "text-anchor": "end" });
      rotulo.textContent = String(meta);
      g.append(rotulo);
      return g;
    }

    function render() {
      const peso = noPeriodo(pontosPeso());
      const cargas = noPeriodo(serieSemanal(EVOLUCAO.cargas));
      const limite = SL.inicioDaSemana(new Date()).getTime() - (semanas - 1) * 7 * DIA;
      const historico = SL.historico().filter((h) => new Date(h.data).getTime() >= limite);
      const meta = SL.estatisticas().meta;

      document.querySelectorAll('[data-render="periodo-texto"]').forEach((n) => (n.textContent = `Últimas ${semanas} semanas`));
      document.querySelector('[data-render="meta-semanal"]').textContent = `Linha tracejada: sua meta de ${meta} por semana`;

      const variacaoPeso = peso[peso.length - 1].valor - peso[0].valor;
      const variacaoCarga = cargas[cargas.length - 1].valor - cargas[0].valor;
      const sinal = (v) => (v > 0 ? "+" : v < 0 ? "−" : "");
      document.querySelector('[data-render="evolucao-resumo"]').replaceChildren(
        SL.statTile({ rotulo: "Peso atual", valor: `${SL.num(peso[peso.length - 1].valor, 1)} kg`, detalhe: `${sinal(variacaoPeso)}${SL.num(Math.abs(variacaoPeso), 1)} kg no período`, iconePaths: ICONES.balanca, cor: "emerald" }),
        SL.statTile({ rotulo: "Agachamento", valor: `${SL.num(cargas[cargas.length - 1].valor, 1)} kg`, detalhe: `${sinal(variacaoCarga)}${SL.num(Math.abs(variacaoCarga), 1)} kg no período`, iconePaths: ICONES.haltere }),
        SL.statTile({ rotulo: "Treinos no período", valor: SL.num(historico.length), detalhe: `média de ${SL.num(historico.length / semanas, 1)} por semana`, iconePaths: ICONES.calendario, cor: "emerald" }),
        SL.statTile({ rotulo: "Volume levantado", valor: `${SL.num(historico.reduce((s, h) => s + (h.volume || 0), 0) / 1000, 1)} t`, detalhe: "soma de carga × repetições", iconePaths: ICONES.trofeu }),
      );

      document.querySelector('[data-render="grafico-peso"]').replaceChildren(resumoGrafico(peso, "kg", 1, true), grafico(peso, "kg", 1));
      document.querySelector('[data-render="grafico-cargas"]').replaceChildren(resumoGrafico(cargas, "kg", 1, false), grafico(cargas, "kg", 1));
      document.querySelector('[data-render="grafico-frequencia"]').replaceChildren(graficoFrequencia(meta));

      const itens = historico.slice(0, 6).map((h) =>
        el("li", { class: "history-item" }, [
          el("span", { class: "icon-tile icon-tile-coral", "aria-hidden": "true" }, [SL.icone(ICONES.check)]),
          el("div", {}, [
            el("strong", { text: h.nome }),
            el("span", { text: `${SL.dataRelativa(h.data)} • ${SL.duracaoTexto(h.duracao)} • ${h.series} séries` }),
          ]),
          h.volume ? el("span", { class: "tag", text: `${SL.num(h.volume)} kg` }) : null,
        ]),
      );
      document
        .querySelector('[data-render="historico"]')
        .replaceChildren(...(itens.length ? itens : [el("li", { class: "meta", text: "Nenhum treino neste período." })]));
    }

    document.querySelector(".segmented").addEventListener("click", (e) => {
      const botao = e.target.closest("[data-periodo]");
      if (!botao) return;
      semanas = Number(botao.dataset.periodo);
      document.querySelectorAll("[data-periodo]").forEach((b) => {
        b.classList.toggle("is-active", b === botao);
        b.setAttribute("aria-pressed", String(b === botao));
      });
      render();
    });

    SL.acao("registrar-peso", () => {
      const atual = pontosPeso().slice(-1)[0].valor;
      const form = el("form", { class: "modal-form" }, [
        SL.campo("peso-valor", "Peso de hoje (kg)", { type: "number", min: 30, max: 300, step: 0.1, required: true }),
        el("button", { type: "submit", class: "btn-primary", text: "Salvar peso" }),
      ]);
      const campo = form.querySelector("#peso-valor");
      campo.value = atual.toFixed(1);
      campo.setAttribute("inputmode", "decimal");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = Math.round(Number(String(campo.value).replace(",", ".")) * 10) / 10;
        if (!(valor >= 30 && valor <= 300)) {
          campo.focus();
          return;
        }
        // Um registro por dia: registrar de novo no mesmo dia substitui
        const hoje = new Date().toDateString();
        const pesos = storage.get("sl-pesos", []).filter((p) => new Date(p.data).toDateString() !== hoje);
        pesos.push({ data: new Date().toISOString(), valor });
        storage.set("sl-pesos", pesos);
        SL.closeModal();
        render();
        SL.toast(`Peso registrado: ${SL.num(valor, 1)} kg`);
      });
      SL.openModal("Registrar peso", form);
    });

    render();
  });
