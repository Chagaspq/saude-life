// Saúde: sono (vale pontos com 7h ou mais), humor do dia, IMC e gordura corporal,
// medidas do corpo com gráfico e ciclo menstrual (opcional, para ajustar o treino).
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, desenhos e ler/salvar dados
    const { el, svg, storage } = SL;
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Um dia em milissegundos
    const DIA = 86400000;
    // Hoje (texto)
    const hoje = new Date().toDateString();

    /* ---------- Sono ---------- */

    // Noites registradas: [{ data, dormiu, acordou, horas }]
    const noites = () => storage.get("sl-sono", []);

    // Horas entre dormir e acordar (passa da meia-noite)
    function horasDeSono(dormiu, acordou) {
      // Converte "23:30" em minutos
      const min = (t) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
      // Diferença (se acordou "antes", é no dia seguinte)
      let d = min(acordou) - min(dormiu);
      // Passa da meia-noite
      if (d <= 0) d += 24 * 60;
      // Em horas, com uma casa
      return Math.round((d / 60) * 10) / 10;
    }

    // Desenha o cartão do sono
    function renderSono() {
      // Últimas 7 noites
      const lista = noites().slice(0, 7);
      // Média das 7
      const media = lista.length ? lista.reduce((t, n) => t + n.horas, 0) / lista.length : 0;
      // Já registrou hoje?
      const jaHoje = lista.some((n) => new Date(n.data).toDateString() === hoje);
      // Formulário
      const form = el("form", { class: "saude-form" }, [
        // Dormiu
        el("label", { class: "corrida-campo" }, ["Dormi às", el("input", { type: "time", id: "sono-dormiu", value: "23:00", required: true })]),
        // Acordou
        el("label", { class: "corrida-campo" }, ["Acordei às", el("input", { type: "time", id: "sono-acordou", value: "07:00", required: true })]),
        // Botão
        el("button", { type: "submit", class: "btn-primary", disabled: jaHoje, text: jaHoje ? "Noite registrada ✓" : "Registrar noite" }),
      ]);
      // Ao registrar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...horas
        const horas = horasDeSono(form.querySelector("#sono-dormiu").value, form.querySelector("#sono-acordou").value);
        // ...salva (a mais nova primeiro)
        storage.set("sl-sono", [{ data: new Date().toISOString(), dormiu: form.querySelector("#sono-dormiu").value, acordou: form.querySelector("#sono-acordou").value, horas }].concat(noites()).slice(0, 60));
        // ...7 horas ou mais: pontos
        if (horas >= 7 && SL.pontos) SL.pontos.ganhar("sono", "sono:" + hoje, { origem: form.querySelector("button") });
        // ...avisa
        SL.toast(horas >= 7 ? `${SL.num(horas, 1)} h de sono. Boa!` : `${SL.num(horas, 1)} h de sono. Tenta dormir um pouco mais hoje.`);
        // ...desenha
        renderSono();
      });
      // Troca o conteúdo
      $("sono").replaceChildren(
        // Média
        el("p", { class: "saude-numero" }, [el("strong", { text: lista.length ? `${SL.num(media, 1)} h` : "--" }), el("span", { class: "meta", text: " média das últimas noites" })]),
        // Barrinhas das 7 noites
        el(
          "div",
          { class: "sono-barras", role: "img", "aria-label": `Horas de sono das últimas ${lista.length} noites` },
          lista
            .slice()
            .reverse()
            .map((n) => el("span", { class: n.horas >= 7 ? "is-boa" : "", style: `height:${Math.min(100, (n.horas / 10) * 100)}%`, title: `${new Date(n.data).toLocaleDateString("pt-BR")}: ${n.horas} h` })),
        ),
        // Formulário
        form,
        // Dica
        el("p", { class: "meta", text: "7 a 9 horas por noite ajudam na recuperação. Com 7h ou mais, ganha 10 pontos." }),
      );
    }

    /* ---------- Humor e energia ---------- */

    // Opções de humor
    const HUMORES = [
      // Ótimo
      ["otimo", "Com energia", "Bom dia para tentar subir a carga."],
      // Normal
      ["ok", "Normal", "Treino normal, no seu ritmo."],
      // Cansado
      ["cansado", "Cansado", "Faça a versão leve: 20 minutos já contam."],
      // Dolorido
      ["dolorido", "Com dor muscular", "Dia de mobilidade ou de treinar outro grupo."],
    ];

    // Desenha o cartão do humor
    function renderHumor() {
      // Humores salvos por dia
      const dias = storage.get("sl-humor", {});
      // Humor de hoje
      const atual = dias[hoje];
      // Opção escolhida
      const escolhido = HUMORES.find(([id]) => id === atual);
      // Troca o conteúdo
      $("humor").replaceChildren(
        // Botões
        el(
          "div",
          { class: "humor-opcoes", role: "group", "aria-label": "Como você está hoje" },
          HUMORES.map(([id, nome]) => el("button", { type: "button", class: "btn-secondary" + (atual === id ? " is-active" : ""), "data-action": "humor", "data-humor": id, "aria-pressed": String(atual === id), text: nome })),
        ),
        // Dica do Pulso para o dia
        el("p", { class: "prog-dica", text: escolhido ? `Pulso: ${escolhido[2]}` : "Conta pra gente: o Pulso ajusta a dica do dia." }),
        // Últimos 7 dias
        el("p", { class: "meta", text: `Últimos 7 dias: ${Object.entries(dias).filter(([d]) => Date.now() - new Date(d) < 7 * DIA).map(([, h]) => (HUMORES.find(([id]) => id === h) || [, ""])[1]).join(", ") || "nada ainda"}` }),
      );
    }

    // Escolher o humor de hoje
    SL.acao("humor", (alvo) => {
      // Humores salvos
      const dias = storage.get("sl-humor", {});
      // Guarda o de hoje
      dias[hoje] = alvo.dataset.humor;
      // Salva
      storage.set("sl-humor", dias);
      // Desenha
      renderHumor();
    });

    /* ---------- IMC e gordura corporal ---------- */

    // Medidas salvas: [{ data, cintura, quadril, braco, coxa }]
    const medidas = () => storage.get("sl-medidas", []);

    // Desenha o cartão do IMC
    function renderImc() {
      // Peso e altura (do perfil ou da evolução)
      const { peso, altura } = SL.dadosCorpo();
      // Perfil (sexo para a conta da gordura)
      const perfil = storage.get("sl-perfil", {});
      // IMC = peso / altura²
      const imc = peso / Math.pow(altura / 100, 2);
      // Faixa do IMC (classificação da OMS)
      const faixa = imc < 18.5 ? "abaixo do peso" : imc < 25 ? "peso adequado" : imc < 30 ? "sobrepeso" : "obesidade";
      // Última cintura medida
      const cintura = (medidas().find((m) => m.cintura) || {}).cintura;
      // Gordura estimada pela fórmula RFM (altura e cintura): homens 64, mulheres 76
      const gordura = cintura && perfil.sexo ? Math.round((perfil.sexo === "feminino" ? 76 : 64) - 20 * (altura / cintura)) : null;
      // Escolha do sexo biológico (só para a conta)
      const sexo = el("select", { "aria-label": "Sexo biológico (para a conta da gordura)", id: "saude-sexo" }, [el("option", { value: "", text: "Sexo biológico (para a conta)" }), el("option", { value: "feminino", text: "Feminino" }), el("option", { value: "masculino", text: "Masculino" })]);
      // Marca o salvo
      sexo.value = perfil.sexo || "";
      // Ao mudar, salva e redesenha
      sexo.addEventListener("change", () => {
        // Guarda no perfil
        storage.set("sl-perfil", { ...storage.get("sl-perfil", {}), sexo: sexo.value });
        // Desenha
        renderImc();
      });
      // Troca o conteúdo
      $("imc").replaceChildren(
        // IMC
        el("p", { class: "saude-numero" }, [el("strong", { text: SL.num(imc, 1) }), el("span", { class: "meta", text: ` IMC • ${faixa}` })]),
        // Explicação simples
        el("p", { class: "meta", text: `Peso ${SL.num(peso, 1)} kg e altura ${altura} cm. O IMC não separa músculo de gordura: quem treina pesado pode ter IMC alto sem estar acima do peso.` }),
        // Gordura
        el("p", { class: "saude-numero" }, [el("strong", { text: gordura !== null ? `${gordura}%` : "--" }), el("span", { class: "meta", text: gordura !== null ? " gordura corporal (estimativa pela cintura)" : " gordura: preencha o sexo e a cintura nas medidas" })]),
        // Sexo
        sexo,
      );
    }

    /* ---------- Medidas do corpo ---------- */

    // Nomes das medidas
    const PARTES = [
      // Cintura
      ["cintura", "Cintura"],
      // Quadril
      ["quadril", "Quadril"],
      // Braço
      ["braco", "Braço"],
      // Coxa
      ["coxa", "Coxa"],
    ];

    // Gráfico de linha simples de uma medida
    function grafico(valores) {
      // Largura e altura
      const L = 300;
      // Altura
      const A = 90;
      // Menor e maior valor (com folga)
      const min = Math.min(...valores) - 1;
      // Maior
      const max = Math.max(...valores) + 1;
      // Pontos da linha
      const pontos = valores.map((v, i) => [valores.length === 1 ? L / 2 : 10 + (i * (L - 20)) / (valores.length - 1), A - 10 - ((v - min) / (max - min)) * (A - 20)]);
      // Desenho
      const s = svg("svg", { viewBox: `0 0 ${L} ${A}`, class: "medidas-grafico", role: "img", "aria-label": `Cintura de ${valores[0]} a ${valores[valores.length - 1]} cm` });
      // Linha
      s.append(svg("polyline", { points: pontos.map((p) => p.join(",")).join(" "), class: "medidas-linha" }));
      // Pontos
      pontos.forEach(([x, y]) => s.append(svg("circle", { cx: x, cy: y, r: 3.5, class: "medidas-ponto" })));
      // Devolve
      return s;
    }

    // Desenha o cartão das medidas
    function renderMedidas() {
      // Lista (a mais nova primeiro)
      const lista = medidas();
      // Última
      const ultima = lista[0] || {};
      // Primeira (para comparar)
      const primeira = lista[lista.length - 1] || {};
      // Formulário
      const form = el(
        "form",
        { class: "saude-form medidas-form" },
        [
          // Um campo por medida
          ...PARTES.map(([id, nome]) => el("label", { class: "corrida-campo" }, [`${nome} (cm)`, el("input", { type: "number", id: "med-" + id, inputmode: "decimal", min: 15, max: 250, step: 0.5, placeholder: ultima[id] || "" })])),
          // Salvar
          el("button", { type: "submit", class: "btn-primary", text: "Salvar medidas" }),
        ],
      );
      // Ao salvar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...valores preenchidos
        const nova = { data: new Date().toISOString() };
        // ...lê cada campo
        PARTES.forEach(([id]) => {
          // Valor
          const v = Number(form.querySelector("#med-" + id).value);
          // Guarda se está na faixa
          if (v >= 15 && v <= 250) nova[id] = v;
        });
        // ...nada preenchido
        if (Object.keys(nova).length === 1) return SL.toast("Preencha pelo menos uma medida.");
        // ...salva
        storage.set("sl-medidas", [nova].concat(lista).slice(0, 52));
        // ...avisa
        SL.toast("Medidas salvas");
        // ...desenha (e o IMC, que usa a cintura)
        renderMedidas();
        // (IMC)
        renderImc();
      });
      // Cinturas (da mais antiga para a mais nova)
      const cinturas = lista.filter((m) => m.cintura).map((m) => m.cintura).reverse();
      // Troca o conteúdo
      $("medidas").replaceChildren(
        // Resumo de cada medida: última e diferença desde a primeira
        el(
          "ul",
          { class: "medidas-resumo" },
          PARTES.map(([id, nome]) => {
            // Diferença
            const dif = ultima[id] && primeira[id] ? ultima[id] - primeira[id] : 0;
            // Linha
            return el("li", {}, [el("span", { class: "meta", text: nome }), el("strong", { text: ultima[id] ? `${SL.num(ultima[id], 1)} cm` : "--" }), dif ? el("small", { class: dif < 0 ? "is-menos" : "is-mais", text: `${dif > 0 ? "+" : ""}${SL.num(dif, 1)}` }) : ""]);
          }),
        ),
        // Gráfico da cintura (com 2 medidas ou mais)
        cinturas.length > 1 ? grafico(cinturas) : el("p", { class: "meta", text: "Meça a cada 2 semanas para ver o gráfico da cintura." }),
        // Formulário
        form,
      );
    }

    /* ---------- Ciclo menstrual ---------- */

    // Fases do ciclo e o que fazer no treino
    function faseDoCiclo(dia, duracao, menstruacao) {
      // Menstruação
      if (dia <= menstruacao) return ["Menstruação", "Energia mais baixa: treinos leves, mobilidade e caminhada. Beba bastante água."];
      // Folicular (até uns 2 dias antes da ovulação)
      if (dia < duracao - 16) return ["Fase folicular", "Energia subindo: ótima fase para treinos fortes e para buscar recordes."];
      // Ovulatória
      if (dia <= duracao - 12) return ["Ovulação", "Força em alta. Atenção ao aquecimento: as articulações ficam mais soltas."];
      // Lútea
      return ["Fase lútea", "Pode bater cansaço e inchaço: mantenha o treino, mas sem cobrança de recorde."];
    }

    // Desenha o cartão do ciclo
    function renderCiclo() {
      // Dados salvos (ou desligado)
      const ciclo = storage.get("sl-ciclo", { ligado: false, inicio: "", duracao: 28, menstruacao: 5 });
      // Chave de ligar
      const liga = el("label", { class: "switch-row" }, [el("span", {}, [el("strong", { text: "Acompanhar o ciclo" }), el("small", { text: "O app ajusta as dicas de treino para cada fase. Só você vê." })]), el("input", { type: "checkbox", class: "switch", role: "switch", id: "ciclo-liga", checked: ciclo.ligado })]);
      // Ao ligar ou desligar...
      liga.querySelector("input").addEventListener("change", (e) => {
        // ...salva
        storage.set("sl-ciclo", { ...ciclo, ligado: e.target.checked });
        // ...desenha
        renderCiclo();
      });
      // Desligado: só a chave
      if (!ciclo.ligado) return $("ciclo").replaceChildren(liga);
      // Formulário dos dados do ciclo
      const form = el("form", { class: "saude-form ciclo-form" }, [
        // Início da última menstruação
        el("label", { class: "corrida-campo" }, ["Começo da última menstruação", el("input", { type: "date", id: "ciclo-inicio", value: ciclo.inicio, required: true })]),
        // Duração do ciclo
        el("label", { class: "corrida-campo" }, ["Duração do ciclo (dias)", el("input", { type: "number", id: "ciclo-duracao", min: 20, max: 45, value: ciclo.duracao })]),
        // Dias de menstruação
        el("label", { class: "corrida-campo" }, ["Dias de menstruação", el("input", { type: "number", id: "ciclo-dias", min: 2, max: 10, value: ciclo.menstruacao })]),
        // Salvar
        el("button", { type: "submit", class: "btn-primary", text: "Salvar" }),
      ]);
      // Ao salvar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...salva os dados
        storage.set("sl-ciclo", { ligado: true, inicio: form.querySelector("#ciclo-inicio").value, duracao: Number(form.querySelector("#ciclo-duracao").value) || 28, menstruacao: Number(form.querySelector("#ciclo-dias").value) || 5 });
        // ...desenha
        renderCiclo();
      });
      // Fase atual (se tem o começo)
      let fase = null;
      // Dia do ciclo
      let dia = 0;
      // Se preencheu o começo...
      if (ciclo.inicio) {
        // ...dia do ciclo (1 até a duração), contando a partir do começo
        dia = (((Math.floor((Date.now() - new Date(ciclo.inicio + "T00:00")) / DIA) % ciclo.duracao) + ciclo.duracao) % ciclo.duracao) + 1;
        // ...fase
        fase = faseDoCiclo(dia, ciclo.duracao, ciclo.menstruacao);
      }
      // Troca o conteúdo
      $("ciclo").replaceChildren(liga, fase ? el("div", { class: "ciclo-fase" }, [el("p", { class: "page-kicker", text: `Dia ${dia} de ${ciclo.duracao}` }), el("strong", { text: fase[0] }), el("p", { class: "prog-dica", text: fase[1] })]) : el("p", { class: "meta", text: "Preencha o começo da última menstruação para ver a fase." }), form);
    }

    // Desenha tudo
    renderSono();
    // Humor
    renderHumor();
    // IMC
    renderImc();
    // Medidas
    renderMedidas();
    // Ciclo
    renderCiclo();
  });
