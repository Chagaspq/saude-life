// Treino em andamento: séries, cargas, descanso entre séries e resumo no final.
// O progresso fica em sl-treino-atual, então dá para sair e continuar depois.
window.SL &&
  SL.pagina(() => {
    const { el, icone, ICONES, storage } = SL;

    const params = new URLSearchParams(window.location.search);
    const salvo = SL.treinoAtual();
    const idPedido = params.get("id") || (salvo && salvo.treinoId) || (SL.treinosDoUsuario()[0] || {}).id;
    const treino = SL.acharTreino(idPedido);

    if (!treino) {
      window.location.replace("../treinos/treinos.html");
      return;
    }

    const exercicios = SL.exerciciosDe(treino);
    const ehTempo = (e) => typeof e.reps !== "number";

    function novoEstado() {
      return {
        treinoId: treino.id,
        inicio: new Date().toISOString(),
        indice: 0,
        feitos: 0,
        series: exercicios.map((e) =>
          Array.from({ length: e.series }, () => ({ reps: e.reps, carga: e.carga, feito: false })),
        ),
      };
    }

    // Outro treino em andamento? Pergunta antes de descartar
    let estado = salvo && salvo.treinoId === treino.id ? salvo : novoEstado();
    const outroEmAndamento =
      salvo && salvo.treinoId !== treino.id && salvo.series && salvo.series.some((lista) => lista.some((s) => s.feito));

    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    document.title = `${treino.nome} — Saúde Life`;
    $("nome").textContent = treino.nome;
    $("grupo").textContent = `${treino.grupo || treino.objetivo} • ${exercicios.length} exercícios`;

    function salvar() {
      estado.feitos = estado.series.filter((lista) => lista.every((s) => s.feito)).length;
      storage.set("sl-treino-atual", estado);
    }

    function totais() {
      const todas = estado.series.flat();
      return { feitas: todas.filter((s) => s.feito).length, total: todas.length };
    }

    /* ---------- Cronômetro do treino ---------- */

    function mmss(segundos) {
      const s = Math.max(0, Math.round(segundos));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const resto = String(s % 60).padStart(2, "0");
      return h ? `${h}:${String(m).padStart(2, "0")}:${resto}` : `${String(m).padStart(2, "0")}:${resto}`;
    }

    const relogio = $("cronometro");
    function tick() {
      relogio.textContent = mmss((Date.now() - new Date(estado.inicio)) / 1000);
    }
    tick();
    const relogioTimer = setInterval(tick, 1000);

    /* ---------- Exercício atual ---------- */

    function render() {
      const i = estado.indice;
      const e = exercicios[i];
      const series = estado.series[i];
      const { feitas, total } = totais();
      const pct = total ? Math.round((feitas / total) * 100) : 0;

      $("contador").textContent = `${feitas} de ${total} séries`;
      $("barra").setAttribute("aria-valuenow", pct);
      $("barra").querySelector(".fill").dataset.progress = pct;
      SL.aplicarProgresso();

      const linhas = series.map((s, n) => {
        const reps = ehTempo(e)
          ? el("span", { class: "set-static", text: e.reps })
          : el("input", {
              type: "number",
              inputmode: "numeric",
              min: 0,
              max: 100,
              value: s.reps,
              class: "set-input",
              "aria-label": `Repetições da série ${n + 1}`,
              "data-campo": "reps",
              "data-serie": n,
            });
        const carga = e.carga || !ehTempo(e)
          ? el("input", {
              type: "number",
              inputmode: "decimal",
              min: 0,
              max: 500,
              step: 0.5,
              value: s.carga,
              class: "set-input",
              "aria-label": `Carga da série ${n + 1} em quilos`,
              "data-campo": "carga",
              "data-serie": n,
            })
          : el("span", { class: "set-static", text: "—" });

        return el("li", { class: "set-row" + (s.feito ? " is-done" : "") }, [
          el("span", { class: "set-number", text: `Série ${n + 1}` }),
          el("label", { class: "set-field" }, [reps, el("span", { class: "set-unit", text: ehTempo(e) ? "" : "reps" })]),
          el("label", { class: "set-field" }, [carga, el("span", { class: "set-unit", text: e.carga || !ehTempo(e) ? "kg" : "" })]),
          el(
            "button",
            {
              type: "button",
              class: "set-check",
              "data-action": "marcar-serie",
              "data-serie": n,
              "aria-pressed": String(s.feito),
              "aria-label": `${s.feito ? "Desmarcar" : "Concluir"} série ${n + 1}`,
            },
            [icone(ICONES.check)],
          ),
        ]);
      });

      const reps = ehTempo(e) ? e.reps : `${e.reps} reps`;
      $("atual").replaceChildren(
        el("p", { class: "page-kicker", text: `Exercício ${i + 1} de ${exercicios.length}` }),
        el("h2", { class: "player-exercise", text: e.nome }),
        el("p", { class: "meta", text: `${e.series} séries × ${reps}${e.descanso ? ` • descanso de ${e.descanso} s` : ""}` }),
        el("div", { class: "set-head", "aria-hidden": "true" }, [
          el("span", { text: "Série" }),
          el("span", { text: ehTempo(e) ? "Tempo" : "Reps" }),
          el("span", { text: "Carga" }),
          el("span", { text: "Feito" }),
        ]),
        el("ol", { class: "set-list" }, linhas),
      );

      $("lista").replaceChildren(
        ...exercicios.map((ex, n) => {
          const completo = estado.series[n].every((s) => s.feito);
          return el("li", {}, [
            el(
              "button",
              {
                type: "button",
                class: "player-list-item" + (n === i ? " is-current" : "") + (completo ? " is-done" : ""),
                "data-action": "ir-exercicio",
                "data-indice": n,
                "aria-current": n === i ? "step" : false,
              },
              [
                el("span", { class: "exercise-index", "aria-hidden": "true" }, [completo ? icone(ICONES.check) : String(n + 1)]),
                el("span", { class: "player-list-text" }, [el("strong", { text: ex.nome }), el("span", { text: SL.resumoExercicio(ex) })]),
              ],
            ),
          ]);
        }),
      );

      // O botão da direita alterna entre "Próximo" e "Finalizar", então é buscado pela posição
      const anterior = document.querySelector(".player-footer .btn-secondary");
      const proximo = document.querySelector(".player-footer .btn-primary");
      anterior.disabled = i === 0;
      const ultimo = i === exercicios.length - 1;
      proximo.textContent = ultimo ? "Finalizar treino" : "Próximo exercício";
      proximo.dataset.action = ultimo ? "finalizar-treino" : "exercicio-proximo";
    }

    // Edição de reps e carga: vale para a série e para as próximas ainda não feitas
    $("atual").addEventListener("change", (ev) => {
      const campo = ev.target.dataset.campo;
      if (!campo) return;
      const n = Number(ev.target.dataset.serie);
      const valor = Math.max(0, Number(ev.target.value) || 0);
      const series = estado.series[estado.indice];
      series.forEach((s, k) => {
        if (k === n || (k > n && !s.feito)) s[campo] = valor;
      });
      salvar();
      render();
    });

    function irPara(indice) {
      avancarDepois = null;
      estado.indice = Math.max(0, Math.min(exercicios.length - 1, indice));
      salvar();
      pararDescanso();
      render();
      document.getElementById("conteudo").focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ---------- Descanso ---------- */

    const painel = $("descanso");
    const anel = $("anel");
    const CIRCUNFERENCIA = 2 * Math.PI * 52;
    anel.style.strokeDasharray = CIRCUNFERENCIA;
    let descansoTimer = null;
    let restante = 0;
    let duracaoDescanso = 0;
    // Exercício terminado: só avança quando o descanso acaba (evita pular dois de uma vez)
    let avancarDepois = null;

    function desenharDescanso() {
      $("descanso-tempo").textContent = mmss(restante);
      anel.style.strokeDashoffset = CIRCUNFERENCIA * (1 - restante / duracaoDescanso);
    }

    function iniciarDescanso(segundos, textoProximo) {
      pararDescanso();
      if (!segundos) return;
      duracaoDescanso = segundos;
      restante = segundos;
      $("descanso-proximo").textContent = textoProximo;
      $("descanso-aviso").textContent = "";
      painel.hidden = false;
      desenharDescanso();
      descansoTimer = setInterval(() => {
        restante -= 1;
        desenharDescanso();
        if (restante <= 0) {
          fimDoDescanso();
          $("descanso-aviso").textContent = "Descanso concluído";
          SL.toast("Descanso concluído. Bora para a próxima!");
          if (navigator.vibrate && storage.get("sl-pref-vibrar", true)) navigator.vibrate([120, 60, 120]);
        }
      }, 1000);
    }

    function pararDescanso() {
      clearInterval(descansoTimer);
      descansoTimer = null;
      painel.hidden = true;
    }

    SL.acao("descanso-mais", () => {
      restante += 15;
      duracaoDescanso = Math.max(duracaoDescanso, restante);
      desenharDescanso();
    });
    function fimDoDescanso() {
      pararDescanso();
      if (avancarDepois !== null) irPara(avancarDepois);
    }

    SL.acao("descanso-pular", fimDoDescanso);

    /* ---------- Ações ---------- */

    SL.acao("marcar-serie", (alvo) => {
      const i = estado.indice;
      const n = Number(alvo.dataset.serie);
      const serie = estado.series[i][n];
      serie.feito = !serie.feito;
      salvar();
      render();

      if (!serie.feito) return;
      const series = estado.series[i];
      const exercicioCompleto = series.every((s) => s.feito);
      const ultimoExercicio = i === exercicios.length - 1;

      if (exercicioCompleto && ultimoExercicio) {
        pararDescanso();
        SL.toast("Última série feita! Finalize o treino quando quiser.");
        return;
      }
      const proximaSerie = series.findIndex((s) => !s.feito);
      const texto = exercicioCompleto
        ? `A seguir: ${exercicios[i + 1].nome}`
        : `A seguir: série ${proximaSerie + 1} de ${series.length}`;
      if (exercicioCompleto && !exercicios[i].descanso) {
        irPara(i + 1);
        return;
      }
      iniciarDescanso(exercicios[i].descanso, texto);
      if (exercicioCompleto) avancarDepois = i + 1;
    });

    SL.acao("ir-exercicio", (alvo) => irPara(Number(alvo.dataset.indice)));
    SL.acao("exercicio-anterior", () => irPara(estado.indice - 1));
    SL.acao("exercicio-proximo", () => irPara(estado.indice + 1));

    SL.acao("sair-treino", () => {
      const { feitas } = totais();
      if (!feitas) {
        storage.remove("sl-treino-atual");
        window.location.href = "../inicio/inicio.html";
        return;
      }
      SL.confirmar({
        titulo: "Sair do treino?",
        texto: "Seu progresso fica salvo. Você pode continuar depois pelo Início.",
        rotulo: "Sair e continuar depois",
        fn: () => (window.location.href = "../inicio/inicio.html"),
      });
    });

    SL.acao("finalizar-treino", () => {
      const { feitas, total } = totais();
      if (!feitas) {
        SL.confirmar({
          titulo: "Nenhuma série concluída",
          texto: "Marque as séries que você fez para o treino contar na sua evolução.",
          rotulo: "Sair sem salvar",
          perigo: true,
          fn: () => {
            storage.remove("sl-treino-atual");
            window.location.href = "../inicio/inicio.html";
          },
        });
        return;
      }
      if (feitas < total) {
        SL.confirmar({
          titulo: "Finalizar agora?",
          texto: `Você concluiu ${feitas} de ${total} séries. As que faltaram não entram no resumo.`,
          rotulo: "Finalizar treino",
          fn: concluir,
        });
        return;
      }
      concluir();
    });

    /* ---------- Fim do treino ---------- */

    function concluir() {
      pararDescanso();
      clearInterval(relogioTimer);
      const minutos = Math.max(1, Math.round((Date.now() - new Date(estado.inicio)) / 60000));
      const feitas = estado.series.flat().filter((s) => s.feito);
      const volume = estado.series.reduce(
        (soma, lista, i) =>
          soma +
          lista
            .filter((s) => s.feito && !ehTempo(exercicios[i]))
            .reduce((parcial, s) => parcial + s.reps * s.carga, 0),
        0,
      );

      storage.set(
        "sl-historico",
        [{ treinoId: treino.id, nome: treino.nome, data: new Date().toISOString(), duracao: minutos, series: feitas.length, volume }].concat(
          storage.get("sl-historico", []),
        ),
      );
      storage.remove("sl-treino-atual");

      const stats = SL.estatisticas();
      document.body.classList.add("is-finished");
      document.querySelector(".player-footer").hidden = true;
      document.querySelector(".player-progress").hidden = true;
      document.querySelector('[data-action="sair-treino"]').hidden = true;

      const conquista = svgConquista();
      document.getElementById("conteudo").replaceChildren(
        el("section", { class: "finish-card", "aria-labelledby": "heading-fim" }, [
          conquista,
          el("h2", { id: "heading-fim", text: "Treino concluído!" }),
          el("p", { class: "page-lead", text: `${treino.nome} registrado. Isso conta para sua meta: ${stats.nestaSemana} de ${stats.meta} nesta semana.` }),
          el("div", { class: "stats-grid stats-grid-3" }, [
            SL.statTile({ rotulo: "Duração", valor: SL.duracaoTexto(minutos), iconePaths: ICONES.relogio }),
            SL.statTile({ rotulo: "Séries", valor: SL.num(feitas.length), iconePaths: ICONES.check, cor: "emerald" }),
            SL.statTile({ rotulo: "Volume total", valor: `${SL.num(volume)} kg`, iconePaths: ICONES.haltere }),
          ]),
          el("div", { class: "finish-actions" }, [
            el("a", { href: "../inicio/inicio.html", class: "btn-primary", text: "Voltar ao início" }),
            el("a", { href: "../evolucao/evolucao.html", class: "btn-secondary", text: "Ver minha evolução" }),
          ]),
        ]),
      );
      document.getElementById("conteudo").focus();
    }

    function svgConquista() {
      const s = SL.svg("svg", { viewBox: "0 0 96 96", class: "finish-badge", "aria-hidden": "true" });
      s.append(
        SL.svg("circle", { cx: 48, cy: 48, r: 44, class: "finish-badge-ring" }),
        SL.svg("circle", { cx: 48, cy: 48, r: 34, class: "finish-badge-core" }),
        SL.svg("path", { d: "M33 49l10 10 20-22", class: "finish-badge-check" }),
      );
      return s;
    }

    /* ---------- Início ---------- */

    salvar();
    render();

    if (outroEmAndamento) {
      const outro = SL.acharTreino(salvo.treinoId);
      SL.confirmar({
        titulo: "Você tem um treino em andamento",
        texto: `"${outro ? outro.nome : "Treino anterior"}" não foi finalizado. Começar "${treino.nome}" descarta o progresso dele.`,
        rotulo: `Começar ${treino.nome}`,
        fn: () => {},
      });
      // Cancelar volta para o treino que já estava em andamento
      document.querySelector(".modal-actions .btn-secondary").addEventListener("click", () => {
        storage.set("sl-treino-atual", salvo);
        window.location.replace(SL.linkTreino(salvo.treinoId));
      });
    }
  });
