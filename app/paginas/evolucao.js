// Evolução: gráficos de peso e carga em SVG puro
window.SL &&
  SL.pagina(() => {
    const { el, svg } = SL;
    const { EVOLUCAO } = window.SL_DADOS;

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
  

    renderGrafico(document.querySelector('[data-chart="peso"]'), EVOLUCAO.peso, "kg");
    renderGrafico(document.querySelector('[data-chart="cargas"]'), EVOLUCAO.cargas, "kg");
  });
