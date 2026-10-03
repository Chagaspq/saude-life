// Perfil: números iguais aos do Início, objetivos, conquistas,
// atividade recente e preferências
window.SL &&
  SL.pagina(() => {
    const { el, storage, icone, ICONES } = SL;
    const stats = SL.estatisticas();
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);

    $("treinos-count").textContent = SL.num(stats.total);
    $("sequencia").textContent = SL.num(stats.sequencia);
    $("seguindo-count").textContent = SL.num(storage.get("sl-seguindo", []).length);

    const obj = SL.onboarding();
    $("objetivos").replaceChildren(
      ...[
        ["Objetivo", obj.rotulo || obj.objetivo],
        ["Nível", obj.nivel],
        ["Meta semanal", `${obj.dias} treinos por semana`],
      ].map(([dt, dd]) => el("div", {}, [el("dt", { text: dt }), el("dd", { text: dd })])),
    );

    const conquistas = [
      { nome: "Primeiro treino", texto: "Registrou o primeiro treino", feito: stats.total >= 1, icone: ICONES.play },
      { nome: "10 treinos", texto: "Dez treinos concluídos", feito: stats.total >= 10, icone: ICONES.haltere },
      { nome: "25 treinos", texto: `${Math.min(stats.total, 25)} de 25 treinos`, feito: stats.total >= 25, icone: ICONES.trofeu },
      { nome: "Meta da semana", texto: `${stats.nestaSemana} de ${stats.meta} nesta semana`, feito: stats.nestaSemana >= stats.meta, icone: ICONES.alvo },
      { nome: "Constância", texto: "4 semanas seguidas treinando", feito: stats.sequencia >= 4, icone: ICONES.fogo },
      { nome: "Desafiante", texto: "Entrou em um desafio", feito: Boolean(storage.get("sl-desafio", null)), icone: ICONES.calendario },
    ];
    $("conquistas-total").textContent = `${conquistas.filter((c) => c.feito).length} de ${conquistas.length}`;
    $("conquistas").replaceChildren(
      ...conquistas.map((c) =>
        el("li", { class: "badge-item" + (c.feito ? " is-earned" : "") }, [
          el("span", { class: "badge-icon", "aria-hidden": "true" }, [icone(c.icone)]),
          el("strong", { text: c.nome }),
          el("span", { text: c.texto }),
          el("span", { class: "sr-only", text: c.feito ? "Conquistada" : "Ainda não conquistada" }),
        ]),
      ),
    );

    $("atividade").replaceChildren(
      ...SL.historico()
        .slice(0, 4)
        .map((h) =>
          el("li", { class: "history-item" }, [
            el("span", { class: "icon-tile icon-tile-coral", "aria-hidden": "true" }, [icone(ICONES.check)]),
            el("div", {}, [el("strong", { text: h.nome }), el("span", { text: `${SL.dataRelativa(h.data)} • ${SL.duracaoTexto(h.duracao)}` })]),
          ]),
        ),
    );

    document.querySelectorAll("[data-pref]").forEach((input) => {
      input.checked = storage.get(input.dataset.pref, true);
      input.addEventListener("change", () => {
        storage.set(input.dataset.pref, input.checked);
        SL.toast("Preferência salva");
      });
    });
  });
