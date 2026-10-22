// Academia: visão do aluno (lotação agora, melhor horário, check-in por QR code)
// e visão do dono (números da unidade, ocupação e publicar avisos).
// O QR code e a lotação são simulados (não há catraca nem servidor).
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, desenhos e ler/salvar dados
    const { el, svg, storage } = SL;
    // Lotação por hora do dia
    const { OCUPACAO, ACADEMIAS } = window.SL_DADOS;
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);

    /* ---------- Lotação ---------- */

    // Lotação numa hora: a curva do dia, um pouco maior no começo da semana e menor no fim
    function lotacao(hora, diaSemana = (new Date().getDay() + 6) % 7) {
      // Ajuste do dia (segunda cheia, sábado e domingo vazios)
      const ajuste = [1.1, 1.05, 1, 1, 0.9, 0.7, 0.5][diaSemana];
      // Lotação dessa hora (no máximo 100%)
      return Math.min(100, Math.round(OCUPACAO[hora] * ajuste));
    }

    // Texto e cor da lotação
    const nivel = (pct) => (pct >= 80 ? ["Cheia", "is-cheia"] : pct >= 50 ? ["Movimentada", "is-media"] : pct > 0 ? ["Tranquila", "is-vazia"] : ["Fechada", "is-fechada"]);

    // Melhor horário para ir hoje (o mais vazio das próximas horas abertas)
    function melhorHorario() {
      // Hora de agora
      const agora = new Date().getHours();
      // Horas que ainda vêm e com a academia aberta
      const opcoes = [];
      // Das próximas horas até as 22h...
      for (let h = Math.max(6, agora + 1); h <= 22; h++) if (OCUPACAO[h] > 0) opcoes.push([h, lotacao(h)]);
      // Se já passou de tudo, sugere amanhã às 10h
      if (!opcoes.length) return null;
      // A de menor lotação
      return opcoes.sort((a, b) => a[1] - b[1])[0];
    }

    /* ---------- QR code de check-in (simulado) ---------- */

    // Desenha um QR code de mentira a partir de um texto (sempre o mesmo para o mesmo texto)
    function qrCode(texto) {
      // Tamanho: 25 x 25 quadradinhos
      const n = 25;
      // Desenho
      const s = svg("svg", { viewBox: `0 0 ${n} ${n}`, class: "qr", role: "img", "aria-label": "QR code de check-in (simulado)" });
      // Fundo branco
      s.append(svg("rect", { width: n, height: n, fill: "#fff" }));
      // Número que muda com o texto (para sortear os quadradinhos)
      let semente = [...texto].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
      // Sorteio simples (sempre igual para a mesma semente)
      const sortear = () => ((semente = (semente * 1103515245 + 12345) >>> 0) / 4294967296);
      // Diz se um quadradinho faz parte dos 3 quadrados de canto
      const noCanto = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7);
      // Para cada quadradinho...
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          // ...pula os cantos (eles são desenhados depois) e sorteia os outros
          if (!noCanto(x, y) && sortear() > 0.5) s.append(svg("rect", { x, y, width: 1, height: 1, fill: "#0e1512" }));
        }
      // Desenha os 3 quadrados de canto (a "cara" de QR code)
      [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([cx, cy]) => {
        // Quadrado de fora
        s.append(svg("rect", { x: cx, y: cy, width: 7, height: 7, fill: "#0e1512" }));
        // Branco do meio
        s.append(svg("rect", { x: cx + 1, y: cy + 1, width: 5, height: 5, fill: "#fff" }));
        // Quadradinho do centro
        s.append(svg("rect", { x: cx + 2, y: cy + 2, width: 3, height: 3, fill: "#0e1512" }));
      });
      // Devolve
      return s;
    }

    // Check-ins feitos pela pessoa (datas)
    const checkins = () => storage.get("sl-checkins", []);

    /* ---------- Visão do aluno ---------- */

    // Desenha a visão do aluno
    function renderAluno() {
      // Academia da pessoa (ou a primeira)
      const academia = (SL.pontos && SL.pontos.minhaAcademia()) || ACADEMIAS[0];
      // Hora de agora
      const hora = new Date().getHours();
      // Lotação agora
      const agora = lotacao(hora);
      // Nível da lotação
      const [texto, classe] = nivel(agora);
      // Melhor horário
      const melhor = melhorHorario();
      // Já fez check-in hoje?
      const hoje = new Date().toDateString();
      // Confere
      const jaEntrou = checkins().some((d) => new Date(d).toDateString() === hoje);
      // Código do QR: e-mail + data (muda todo dia)
      const codigo = `${(storage.get("sl-sessao", {}) || {}).email}|${hoje}`;
      // Barras das horas de hoje (6h às 22h)
      const barras = [];
      // Para cada hora...
      for (let h = 6; h <= 22; h++) {
        // ...lotação dessa hora
        const p = lotacao(h);
        // ...barra (a hora de agora fica destacada)
        barras.push(el("div", { class: "lot-barra" + (h === hora ? " is-agora" : "") + (melhor && h === melhor[0] ? " is-melhor" : ""), title: `${h}h: ${p}%` }, [el("span", { style: `height:${Math.max(4, p)}px` }), el("small", { text: h % 3 === 0 ? `${h}h` : "" })]));
      }
      // Troca o conteúdo
      $("aluno").replaceChildren(
        // Grade com lotação e check-in
        el("div", { class: "academia-grade" }, [
          // Card da lotação
          el("section", { class: "academia-card" }, [
            // Nome da academia
            el("p", { class: "page-kicker", text: academia.nome }),
            // Título
            el("h2", { text: "Lotação agora" }),
            // Medidor: número e texto
            el("div", { class: `lot-agora ${classe}` }, [el("strong", { "data-contar": "", text: `${agora}%` }), el("span", { text: texto })]),
            // Melhor horário
            el("p", { class: "lot-melhor" }, melhor ? ["Melhor horário hoje: ", el("strong", { text: `${melhor[0]}h` }), ` (${melhor[1]}% de lotação)`] : ["A academia já fechou hoje. Amanhã, o melhor horário costuma ser às 10h."]),
            // Gráfico das horas
            el("div", { class: "lot-grafico", role: "img", "aria-label": "Lotação de hoje, das 6h às 22h" }, barras),
          ]),
          // Card do check-in
          el("section", { class: "academia-card academia-checkin" }, [
            // Título
            el("h2", { text: "Check-in" }),
            // QR code
            qrCode(codigo),
            // Explicação
            el("p", { class: "meta", text: "Mostre na catraca (simulado no TCC). O código muda todo dia." }),
            // Botão de check-in
            el("button", { type: "button", class: jaEntrou ? "btn-secondary" : "btn-primary", "data-action": "checkin", disabled: jaEntrou, text: jaEntrou ? "Check-in feito hoje ✓" : "Fazer check-in" }),
            // Quantos check-ins no mês
            el("p", { class: "meta", text: `${checkins().filter((d) => new Date(d).getMonth() === new Date().getMonth()).length} check-ins este mês` }),
          ]),
        ]),
      );
    }

    // Botão de check-in
    SL.acao("checkin", (btn) => {
      // Guarda a data de agora
      storage.set("sl-checkins", checkins().concat(new Date().toISOString()));
      // Avisa
      SL.toast("Check-in feito. Bom treino!");
      // Desenha de novo
      renderAluno();
    });

    /* ---------- Visão do dono: avisos ---------- */

    // Avisos publicados pelo dono (os mais novos primeiro)
    const avisos = () => storage.get("sl-avisos", []);

    // Coloca os avisos publicados no começo da lista
    function renderAvisos() {
      // Lista de avisos
      const lista = $("avisos");
      // Tira os publicados antes (para não repetir)
      lista.querySelectorAll(".is-publicado").forEach((li) => li.remove());
      // Coloca cada aviso publicado no começo
      avisos()
        .slice()
        .reverse()
        .forEach((a) => lista.prepend(el("li", { class: "is-publicado" }, [el("div", {}, [el("strong", { text: a.texto }), el("span", { text: `Publicado ${SL.dataRelativa(a.data).toLowerCase()}` })]), el("span", { class: "tag", text: "Aviso" })])));
    }

    // Formulário de publicar aviso
    $("form-aviso").addEventListener("submit", (e) => {
      // Impede a página de recarregar
      e.preventDefault();
      // Campo
      const campo = document.getElementById("aviso-texto");
      // Texto
      const texto = campo.value.trim();
      // Se vazio, para
      if (!texto) return;
      // Guarda no começo
      storage.set("sl-avisos", [{ texto, data: new Date().toISOString() }].concat(avisos()));
      // Limpa o campo
      campo.value = "";
      // Desenha
      renderAvisos();
      // Avisa
      SL.toast("Aviso publicado para os alunos");
    });

    // Botões "Sou aluno" / "Sou dono"
    document.querySelector(".aulas-visao").addEventListener("click", (e) => {
      // Botão clicado
      const b = e.target.closest("[data-visao-academia]");
      // Se não foi num botão, para
      if (!b) return;
      // É dono?
      const dono = b.dataset.visaoAcademia === "dono";
      // Mostra a visão certa
      $("dono").hidden = !dono;
      // (e esconde a outra)
      $("aluno").hidden = dono;
      // Atualiza os botões
      document.querySelectorAll("[data-visao-academia]").forEach((x) => {
        // Destaca o escolhido
        x.classList.toggle("is-active", x === b);
        // Avisa os leitores de tela
        x.setAttribute("aria-pressed", String(x === b));
      });
      // Pinta as barras do dono
      SL.aplicarProgresso();
    });

    // Desenha tudo
    renderAluno();
    // Avisos
    renderAvisos();
  });
