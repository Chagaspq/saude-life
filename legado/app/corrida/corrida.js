// Corrida e caminhada: registrar distância e tempo (o ritmo sai sozinho), números do mês
// e o plano "Do zero aos 5 km" (Premium), com as sessões da semana para marcar.
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ícones e ler/salvar dados
    const { el, storage, ICONES } = SL;
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Formulário
    const form = document.querySelector('[data-form="corrida"]');

    // Corridas salvas: [{ data, tipo, km, min }]
    const corridas = () => storage.get("sl-corridas", []);

    // Ritmo em "min:seg por km"
    function ritmo(km, min) {
      // Minutos por km
      const porKm = min / km;
      // Minutos inteiros
      const m = Math.floor(porKm);
      // Segundos
      const s = Math.round((porKm - m) * 60);
      // Texto (ex.: 6:05 /km)
      return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")} /km`;
    }

    // Números do mês
    function renderNumeros() {
      // Começo do mês
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      // Corridas do mês
      const doMes = corridas().filter((c) => new Date(c.data).getTime() >= inicioMes);
      // Km no mês
      const km = doMes.reduce((t, c) => t + c.km, 0);
      // Melhor ritmo (só corridas, menor minutos por km)
      const melhor = corridas()
        .filter((c) => c.tipo === "Corrida")
        .sort((a, b) => a.min / a.km - b.min / b.km)[0];
      // Troca os quadradinhos
      $("numeros").replaceChildren(
        // Km no mês
        SL.statTile({ rotulo: "Km neste mês", valor: SL.num(km, 1), iconePaths: ICONES.alvo }),
        // Quantas vezes
        SL.statTile({ rotulo: "Saídas neste mês", valor: SL.num(doMes.length), iconePaths: ICONES.calendario, cor: "emerald" }),
        // Melhor ritmo
        SL.statTile({ rotulo: "Melhor ritmo", valor: melhor ? ritmo(melhor.km, melhor.min) : "--", iconePaths: ICONES.relogio }),
      );
    }

    // Lista das últimas
    function renderLista() {
      // Últimas 6
      const ultimas = corridas().slice(0, 6);
      // Sem nenhuma
      if (!ultimas.length) return $("lista").replaceChildren(el("li", { class: "meta", text: "Nenhuma ainda. Bora para a primeira?" }));
      // Uma linha por corrida
      $("lista").replaceChildren(
        ...ultimas.map((c) =>
          // Linha
          el("li", { class: "history-item" }, [
            // Textos
            el("div", {}, [el("strong", { text: `${c.tipo} de ${SL.num(c.km, 1)} km` }), el("span", { text: `${SL.dataRelativa(c.data)} • ${SL.num(c.min, c.min % 1 ? 1 : 0)} min • ${ritmo(c.km, c.min)}` })]),
          ]),
        ),
      );
    }

    // Ritmo aparece enquanto digita
    form.addEventListener("input", () => {
      // Distância
      const km = Number(form.querySelector("#corrida-km").value);
      // Tempo
      const min = Number(form.querySelector("#corrida-min").value);
      // Mostra o ritmo se os dois estão preenchidos
      $("ritmo").textContent = km > 0 && min > 0 ? `Ritmo: ${ritmo(km, min)}` : "Ritmo: --";
    });

    // Salvar
    form.addEventListener("submit", (e) => {
      // Não recarrega
      e.preventDefault();
      // Distância
      const km = Number(form.querySelector("#corrida-km").value);
      // Tempo
      const min = Number(form.querySelector("#corrida-min").value);
      // Tipo
      const tipo = form.querySelector('input[name="tipo"]:checked').value;
      // Confere os valores
      if (!(km >= 0.1 && km <= 100) || !(min >= 1 && min <= 600)) return ($("erro").textContent = "Preencha a distância (até 100 km) e o tempo em minutos.");
      // Apaga o erro
      $("erro").textContent = "";
      // Data de agora
      const data = new Date().toISOString();
      // Salva a corrida (a mais nova primeiro)
      storage.set("sl-corridas", [{ data, tipo, km, min }].concat(corridas()));
      // Calorias: esforço (corrida 9,8 / caminhada 3,8) × peso × horas
      const kcal = Math.round(((tipo === "Corrida" ? 9.8 : 3.8) * SL.dadosCorpo().peso * min) / 60);
      // Também entra no histórico de treinos (conta para a meta da semana)
      storage.set("sl-historico", [{ treinoId: "corrida", nome: `${tipo} de ${SL.num(km, 1)} km`, data, duracao: Math.round(min), series: 0, volume: 0, kcal }].concat(storage.get("sl-historico", [])));
      // Pontos de treino concluído
      if (SL.pontos) {
        // Ganha os pontos
        SL.pontos.ganhar("treino", "corrida:" + data, { origem: form.querySelector("button") });
        // Confere sequência e meta da semana
        SL.pontos.conferirTreino();
      }
      // Limpa os números
      form.reset();
      // Ritmo volta ao padrão
      $("ritmo").textContent = "Ritmo: --";
      // Avisa
      SL.toast(`${tipo} salva: ${kcal} kcal (estimativa)`);
      // Desenha
      renderNumeros();
      // (lista)
      renderLista();
    });

    /* ---------- Plano do zero aos 5 km ---------- */

    // Sessões de cada semana: [corre (min), anda (min), vezes]
    const SEMANAS = [
      [1, 2, 8],
      [2, 2, 6],
      [3, 2, 5],
      [5, 2, 4],
      [8, 2, 3],
      [10, 2, 3],
      [15, 2, 2],
      [30, 0, 1],
    ];
    // Texto de uma sessão
    const textoSessao = ([corre, anda, vezes]) => (anda ? `${vezes}x: corra ${corre} min e ande ${anda} min` : `Corra ${corre} min sem parar (seus 5 km!)`);

    // Desenha o plano
    function renderPlano() {
      // Lugar
      const alvo = $("plano");
      // No Free: cadeado e botão para os planos
      if (!SL.premium()) return alvo.replaceChildren(el("p", { class: "meta", text: "Desbloqueie com o Premium para seguir as 8 semanas." }), el("a", { href: "../planos/planos.html", class: "btn-primary", text: "Ver o Premium" }));
      // Plano salvo: { inicio, feitas: ["1-1", ...] }
      const plano = storage.get("sl-plano-5k", null);
      // Ainda não começou
      if (!plano) return alvo.replaceChildren(el("ol", { class: "plano5k-lista" }, SEMANAS.map((s, k) => el("li", { text: `Semana ${k + 1}: ${textoSessao(s)}` }))), el("button", { type: "button", class: "btn-primary", "data-action": "comecar-5k", text: "Começar o plano" }));
      // Semana atual (no máximo 8)
      const semana = Math.min(8, Math.floor((Date.now() - new Date(plano.inicio)) / (7 * 86400000)) + 1);
      // As 3 sessões desta semana
      const sessoes = [1, 2, 3].map((d) => `${semana}-${d}`);
      // Troca o conteúdo
      alvo.replaceChildren(
        // Semana atual
        el("p", { class: "page-kicker", text: `Semana ${semana} de 8` }),
        // Sessão da semana
        el("p", { class: "plano5k-sessao", text: textoSessao(SEMANAS[semana - 1]) }),
        // As 3 sessões para marcar
        el(
          "ul",
          { class: "plano5k-dias" },
          sessoes.map((id, k) => {
            // Já foi feita?
            const feita = plano.feitas.includes(id);
            // Botão de marcar
            return el("li", {}, [el("button", { type: "button", class: feita ? "btn-secondary is-feito" : "btn-secondary", "data-action": "marcar-5k", "data-sessao": id, "aria-pressed": String(feita), text: `${feita ? "✓ " : ""}Sessão ${k + 1}` })]);
          }),
        ),
        // Total de sessões feitas
        el("p", { class: "meta", text: `${plano.feitas.length} de 24 sessões feitas no plano` }),
      );
    }

    // Começar o plano
    SL.acao("comecar-5k", () => {
      // Salva o começo
      storage.set("sl-plano-5k", { inicio: new Date().toISOString(), feitas: [] });
      // Desenha
      renderPlano();
      // Avisa
      SL.toast("Plano começou! Faça as 3 sessões desta semana.");
    });

    // Marcar uma sessão do plano
    SL.acao("marcar-5k", (alvo) => {
      // Plano salvo
      const plano = storage.get("sl-plano-5k", { inicio: new Date().toISOString(), feitas: [] });
      // Sessão
      const id = alvo.dataset.sessao;
      // Troca: marca ou desmarca
      plano.feitas = plano.feitas.includes(id) ? plano.feitas.filter((x) => x !== id) : plano.feitas.concat(id);
      // Salva
      storage.set("sl-plano-5k", plano);
      // Desenha
      renderPlano();
    });

    // Desenha tudo
    renderNumeros();
    // Lista
    renderLista();
    // Plano
    renderPlano();
  });
