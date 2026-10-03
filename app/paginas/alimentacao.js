// Alimentação: barras de progresso de cada macro
window.SL &&
  SL.pagina(() => {
    const { el } = SL;
    document.querySelectorAll(".macro-card[data-meta]").forEach((card) => {
      const atual = parseFloat(card.dataset.atual);
      const meta = parseFloat(card.dataset.meta);
      const pct = Math.min(100, Math.round((atual / meta) * 100));
      card.append(
        el(
          "div",
          {
            class: "progress-bar-sm",
            role: "progressbar",
            "aria-label": card.querySelector("span").textContent,
            "aria-valuenow": pct,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
          },
          [el("div", { class: "fill", "data-progress": pct })],
        ),
        el("small", { class: "macro-pct", text: `${pct}% da meta` }),
      );
    });
    SL.aplicarProgresso();
  });
