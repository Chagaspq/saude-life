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

    /* ---------- Horário de funcionamento e aparelhos ---------- */

    // Horário de cada dia da semana (segunda = 0): [abre, fecha]
    const HORARIO = [[6, 23], [6, 23], [6, 23], [6, 23], [6, 22], [8, 18], [8, 14]];
    // Nomes dos dias
    const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    // Aparelhos da academia: [nome, quantos tem]
    const APARELHOS = [["Esteira", 12], ["Bicicleta", 8], ["Leg press", 3], ["Supino", 4], ["Rack de agachamento", 3], ["Puxador (pulley)", 2], ["Cadeira extensora", 2], ["Crossover", 2]];

    // Card do horário de funcionamento
    function cardHorario() {
      // Dia de hoje (segunda = 0)
      const hoje = (new Date().getDay() + 6) % 7;
      // Hora de agora
      const h = new Date().getHours();
      // Aberta agora?
      const aberta = h >= HORARIO[hoje][0] && h < HORARIO[hoje][1];
      // Card
      return el("section", { class: "academia-card" }, [
        // Título
        el("h2", { text: "Horário de funcionamento" }),
        // Aberta ou fechada
        el("p", { class: "ac-aberta " + (aberta ? "is-aberta" : "is-fechada"), text: aberta ? `Aberta agora • fecha às ${HORARIO[hoje][1]}h` : `Fechada agora • abre às ${HORARIO[(hoje + (h >= HORARIO[hoje][1] ? 1 : 0)) % 7][0]}h` }),
        // Tabela simples dos dias
        el("ul", { class: "ac-horario" }, DIAS.map((d, i) => el("li", { class: i === hoje ? "is-hoje" : "" }, [el("span", { text: d }), el("strong", { text: `${HORARIO[i][0]}h às ${HORARIO[i][1]}h` })]))),
      ]);
    }

    // Card dos aparelhos: quantos estão livres agora (simulado pela lotação)
    function cardAparelhos() {
      // Lotação agora
      const pct = lotacao(new Date().getHours());
      // Card
      return el("section", { class: "academia-card" }, [
        // Título
        el("h2", { text: "Aparelhos agora" }),
        // Explicação
        el("p", { class: "meta", text: "Quantos estão livres neste momento (estimativa pela lotação)." }),
        // Lista
        el(
          "ul",
          { class: "ac-aparelhos" },
          APARELHOS.map(([nome, total], i) => {
            // Em manutenção (um aparelho fixo, para mostrar o aviso)
            const manutencao = i === 6;
            // Livres: menos quanto mais cheia (sorteio fixo por hora para variar entre aparelhos)
            const livres = manutencao ? 0 : Math.max(0, Math.round(total * (1 - pct / 100) * (0.7 + ((i * 37 + new Date().getHours()) % 10) / 20)));
            // Item
            return el("li", {}, [
              // Nome
              el("span", { text: nome }),
              // Situação
              el("span", { class: "tag " + (manutencao ? "tag-warning" : livres ? "tag-success" : ""), text: manutencao ? "Em manutenção" : `${Math.min(total, livres)} de ${total} livres` }),
            ]);
          }),
        ),
      ]);
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
          // Horário de funcionamento
          cardHorario(),
          // Aparelhos livres
          cardAparelhos(),
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

    /* ---------- Visão do dono: alunos sumidos, desafio e frequência ---------- */

    // Alunos que não aparecem há um tempo (simulado): [nome, dias sem vir]
    const SUMIDOS = [["Thiago Ramos", 12], ["Patrícia Gomes", 18], ["Rodrigo Pires", 9], ["Aline Moura", 23]];

    // Check-ins da academia por dia (simulado com a lotação; últimos 14 dias)
    function frequencia() {
      // Lista de [data, check-ins]
      const lista = [];
      // Para cada um dos 14 dias...
      for (let d = 13; d >= 0; d--) {
        // ...data
        const dia = new Date(Date.now() - d * 86400000);
        // ...dia da semana (segunda = 0)
        const ds = (dia.getDay() + 6) % 7;
        // ...soma da lotação do dia vira check-ins (com um pouco de variação fixa)
        const total = Math.round(([6, 7, 8, 9, 12, 13, 17, 18, 19, 20].reduce((s, h) => s + lotacao(h, ds), 0) / 6) * (0.9 + (dia.getDate() % 5) / 20));
        // ...guarda
        lista.push([dia, total]);
      }
      // Devolve
      return lista;
    }

    // Desenha a parte extra do dono
    function renderDono() {
      // Frequência dos 14 dias
      const freq = frequencia();
      // Maior valor (para a altura das barras)
      const max = Math.max(...freq.map((f) => f[1]));
      // Média por dia
      const media = Math.round(freq.reduce((s, f) => s + f[1], 0) / freq.length);
      // Desafios da academia já criados
      const desafiosAcademia = storage.get("sl-desafios", []).filter((d) => d.criador === "academia");
      // Troca o conteúdo
      $("dono-extra").replaceChildren(
        // Gráfico de frequência
        el("section", { class: "academia-card" }, [
          // Título
          el("h2", { text: "Frequência (14 dias)" }),
          // Média
          el("p", { class: "meta", text: `Média de ${media} check-ins por dia` }),
          // Barras
          el(
            "div",
            { class: "ac-freq", role: "img", "aria-label": `Check-ins por dia nos últimos 14 dias. Média de ${media} por dia.` },
            freq.map(([dia, n]) => el("div", { class: "ac-freq-barra", title: `${dia.toLocaleDateString("pt-BR")}: ${n} check-ins` }, [el("span", { style: `height:${Math.round((n / max) * 100)}%` }), el("small", { text: String(dia.getDate()) })])),
          ),
        ]),
        // Alunos sumidos
        el("section", { class: "academia-card" }, [
          // Título
          el("h2", { text: "Alunos sumidos" }),
          // Explicação
          el("p", { class: "meta", text: "Sem check-in há mais de 7 dias. Um recado pode trazer de volta." }),
          // Lista
          el(
            "ul",
            { class: "ac-sumidos" },
            SUMIDOS.map(([nome, dias]) =>
              el("li", {}, [
                // Nome e dias
                el("div", { class: "cm-amigo-info" }, [el("strong", { text: nome }), el("span", { class: "meta", text: `${dias} dias sem vir` })]),
                // Botão de chamar
                el("button", { type: "button", class: "btn-secondary btn-sm", "data-action": "chamar-sumido", "data-nome": nome, text: "Mandar recado" }),
              ]),
            ),
          ),
        ]),
        // Desafio da academia
        el("section", { class: "academia-card" }, [
          // Título
          el("h2", { text: "Desafio da academia" }),
          // Explicação
          el("p", { class: "meta", text: "Aparece para todos os alunos na Comunidade, aba Desafios." }),
          // Desafios já criados
          desafiosAcademia.length ? el("ul", { class: "ac-desafios" }, desafiosAcademia.map((d) => el("li", {}, [el("strong", { text: d.nome }), el("span", { class: "meta", text: ` • meta ${d.meta} ${d.tipo}` })]))) : null,
          // Botão de criar
          el("button", { type: "button", class: "btn-primary", "data-action": "desafio-academia", text: "Criar desafio" }),
        ]),
      );
    }

    // Mandar recado para aluno sumido
    SL.acao("chamar-sumido", (alvo) => {
      // Chat com respostas simuladas
      SL.abrirChat({ chave: "academia:" + alvo.dataset.nome, nome: alvo.dataset.nome, respostas: ["Opa! Volto semana que vem, prometo.", "Tive uma viagem, mas já já volto!", "Obrigado por lembrar! Amanhã tô aí."] });
    });

    // Criar desafio da academia
    SL.acao("desafio-academia", () => {
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Nome
        SL.campo("da-nome", "Nome do desafio", { placeholder: "Ex: 12 treinos no mês", required: true, maxlength: 40 }),
        // Meta
        SL.campo("da-meta", "Meta de treinos no mês", { type: "number", min: 1, max: 31, required: true }),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Publicar desafio" }),
      ]);
      // Meta padrão
      form.querySelector("#da-meta").value = 12;
      // Ao enviar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...nome
        const nome = form.querySelector("#da-nome").value.trim();
        // ...precisa de nome
        if (!nome) return form.querySelector("#da-nome").focus();
        // ...período: o mês atual
        const mes = SL.pontos ? SL.pontos.periodo("mes") : { ini: Date.now(), fim: Date.now() + 30 * 86400000 };
        // ...membros da academia que viram participantes (os que existem como pessoas)
        const participantes = SL.pontos ? SL.pontos.PESSOAS.slice(0, 4).map((p) => p.codigo) : [];
        // ...desafio novo no começo da lista da Comunidade
        storage.set("sl-desafios", [{ id: "d" + Date.now(), nome, tipo: "treinos", meta: Math.max(1, Number(form.querySelector("#da-meta").value) || 12), ini: mes.ini, fim: mes.fim, criador: "academia", participantes, euDentro: false }].concat(storage.get("sl-desafios", [])));
        // ...fecha
        SL.closeModal();
        // ...desenha
        renderDono();
        // ...avisa
        SL.toast("Desafio publicado para os alunos!");
      });
      // Abre o modal
      SL.openModal("Desafio da academia", form);
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
    // Parte extra do dono
    renderDono();
  });
