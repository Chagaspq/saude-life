// Ranking: pontos da semana, pódio, ligas, selos e como ganhar pontos
// Só continua se o núcleo do app (SL) e os pontos (SL.pontos) foram carregados
window.SL &&
  SL.pagina(() => {
    // Se os pontos não carregaram, para
    if (!SL.pontos) return;
    // Pega do núcleo: criar elementos, ícones e números
    const { el, icone, ICONES } = SL;
    // Pega o motor de pontos
    const P = SL.pontos;
    // Pega as academias de exemplo
    const { ACADEMIAS } = window.SL_DADOS;
    // Período escolhido: "semana" ou "mes"
    let periodo = "semana";
    // Com quem comparar: "amigos" ou "academia"
    let escopo = "amigos";
    // Atalho para achar um pedaço da página pelo data-render
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);

    // Desenhos dos selos (ícones de traço)
    const ICONES_SELO = {
      // Pódio: troféu
      podio: ICONES.trofeu,
      // Campeão: coroa
      campeao: ["M3 18h18", "M4 18 3 7l5 4 4-6 4 6 5-4-1 11"],
      // Subiu de liga: seta para cima
      subiu: ["M12 19V5", "m5 12 7-7 7 7"],
      // Diamante: pedra preciosa
      diamante: ["M6 3h12l4 6-10 12L2 9z", "M2 9h20"],
      // Sequência: fogo
      sequencia: ICONES.fogo,
      // Água: gota
      agua: ICONES.gota,
      // Prato: prato com talheres
      prato: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
      // Recorde: haltere
      recorde: ICONES.haltere,
    };

    // Primeiro nome de alguém (a pessoa logada vira "Você")
    const nomeCurto = (p) => (p.eu ? "Você" : p.nome.split(" ")[0]);

    // Escreve "Zera em X dias" no topo
    function renderZera() {
      // Situação da semana
      const s = P.situacaoDaLiga();
      // Dias até o fim do mês
      const fimMes = Math.ceil((P.periodo("mes").fim - Date.now()) / 86400000);
      // Texto conforme o período escolhido
      $("zera").textContent = periodo === "semana" ? `Semana zera em ${s.diasParaZerar} dia${s.diasParaZerar === 1 ? "" : "s"}` : `Mês fecha em ${fimMes} dia${fimMes === 1 ? "" : "s"}`;
    }

    // Desenha o card grande com o anel dos pontos e a liga
    function renderHero() {
      // Situação da semana (pontos, liga, quanto falta)
      const s = P.situacaoDaLiga();
      // Liga atual
      const liga = P.LIGAS[s.atual];
      // Posição entre os amigos
      const pos = P.minhaPosicao("amigos", "semana");
      // Frase da liga conforme a situação
      let frase;
      // Já fez 500: garantiu a subida (ou o topo)
      if (!s.faltaSubir) frase = s.noTopo ? "Você segurou o Diamante nesta semana. Brabo!" : `Subida garantida! Domingo você vai para ${P.LIGAS[s.atual + 1].nome}.`;
      // Ainda não fez 150: corre risco de cair
      else if (s.faltaManter && s.atual > 0) frase = `Faltam ${s.faltaManter} pontos para não cair de liga.`;
      // No meio do caminho
      else frase = s.noTopo ? `Faltam ${s.faltaSubir} pontos para garantir o Diamante.` : `Faltam ${s.faltaSubir} pontos para subir para ${P.LIGAS[s.atual + 1].nome}.`;

      // Troca o conteúdo do card
      $("hero").replaceChildren(
        // Anel com os pontos da semana (cheio = 500 pontos)
        P.anel(s.pts / P.SOBE, SL.num(s.pts), "pontos na semana"),
        // Lado das informações
        el("div", { class: "rk-hero-info" }, [
          // Linha da liga: escudo + nome
          el("div", { class: "rk-hero-liga" }, [
            // Escudo da liga
            P.escudo(s.atual, "liga-escudo liga-escudo-lg"),
            // Textos da liga
            el("div", {}, [
              // "Liga"
              el("span", { class: "meta", text: "Sua liga" }),
              // Nome da liga
              el("strong", { class: `rk-liga-nome liga-${liga.id}`, text: liga.nome }),
            ]),
          ]),
          // Frase do que falta
          el("p", { class: "rk-hero-frase", text: frase }),
          // Etiquetas embaixo
          el("div", { class: "rk-hero-tags" }, [
            // Posição entre os amigos
            pos ? el("span", { class: "tag", text: `${pos.posicao}º de ${pos.total} entre os amigos` }) : null,
            // Pontos de hoje / limite
            el("span", { class: "tag", text: `Hoje: ${P.somar(new Date().setHours(0, 0, 0, 0), Date.now() + 1)} de ${P.LIMITE_DIA}` }),
            // Bônus de iniciante (se tiver)
            P.temBonus() ? el("span", { class: "tag tag-success", text: "+20% iniciante" }) : null,
          ]),
        ]),
      );
    }

    // Desenha o pódio e a lista
    function renderRanking() {
      // Ranking do período e escopo escolhidos
      const lista = P.ranking(escopo, periodo);
      // Lugar do pódio
      const podio = $("podio");
      // Lugar da lista
      const resto = $("lista");

      // Ranking da academia sem academia escolhida: mostra a escolha
      if (escopo === "academia" && !P.minhaAcademia()) {
        // Caixa de seleção com as academias
        const select = el("select", { "aria-label": "Escolha sua academia", class: "rk-select" }, [
          // Primeira opção vazia
          el("option", { value: "", text: "Escolha sua academia" }),
          // Uma opção para cada academia
          ...ACADEMIAS.map((a) => el("option", { value: a.id, text: `${a.nome} (${a.bairro})` })),
        ]);
        // Quando escolhe, salva e desenha de novo
        select.addEventListener("change", () => select.value && P.escolherAcademia(select.value));
        // Mostra a mensagem com a escolha
        podio.replaceChildren(
          // Estado vazio com a caixa de escolha
          SL.estadoVazio("Você ainda não tem academia", "Escolha a sua para competir com a galera da unidade. Sem academia? Tudo bem: o ranking dos amigos continua valendo.", select),
        );
        // Esvazia a lista
        resto.replaceChildren();
        // Para aqui
        return;
      }

      // Ordem visual do pódio: 2º, 1º, 3º
      const tres = [lista[1], lista[0], lista[2]].filter(Boolean);
      // Troca o pódio
      podio.replaceChildren(
        // Um degrau para cada um dos 3 primeiros
        ...tres.map((p) =>
          // Degrau (destacado se for a pessoa logada)
          el("div", { class: `rk-degrau rk-degrau-${p.posicao}` + (p.eu ? " is-eu" : "") }, [
            // Bolinha com as iniciais
            el("span", { class: "rk-avatar", "aria-hidden": "true", text: SL.initials(p.nome) }),
            // Nome
            el("strong", { class: "rk-degrau-nome", text: nomeCurto(p) }),
            // Pontos
            el("span", { class: "rk-degrau-pts", text: `${SL.num(p.pts)} pts` }),
            // Bloco do degrau com o número da posição
            el("span", { class: "rk-degrau-bloco", "aria-hidden": "true", text: `${p.posicao}º` }),
            // Posição para leitores de tela
            el("span", { class: "sr-only", text: `${p.posicao}º lugar` }),
          ]),
        ),
      );

      // Troca a lista do 4º em diante
      resto.replaceChildren(
        // Uma linha para cada pessoa
        ...lista.slice(3).map((p) =>
          // Linha (destacada se for a pessoa logada)
          el("li", { class: "rk-linha" + (p.eu ? " is-eu" : "") }, [
            // Número da posição
            el("span", { class: "rk-pos", text: `${p.posicao}º` }),
            // Bolinha com as iniciais
            el("span", { class: "rk-avatar rk-avatar-sm", "aria-hidden": "true", text: SL.initials(p.nome) }),
            // Nome e liga
            el("span", { class: "rk-linha-nome" }, [el("strong", { text: p.eu ? "Você" : p.nome }), el("small", { text: P.LIGAS[p.liga].nome })]),
            // Escudo pequeno da liga
            P.escudo(p.liga, "liga-escudo liga-escudo-sm"),
            // Pontos
            el("span", { class: "rk-linha-pts", text: `${SL.num(p.pts)} pts` }),
          ]),
        ),
      );

      // No ranking da academia, mostra o nome dela e um botão de trocar
      if (escopo === "academia") {
        // Academia da pessoa
        const academia = P.minhaAcademia();
        // Botão de trocar
        const trocar = el("button", { type: "button", class: "btn-link", text: "Trocar academia" });
        // Ao clicar, tira a academia (volta para a escolha)
        trocar.addEventListener("click", () => P.escolherAcademia(null));
        // Coloca no fim da lista
        resto.append(el("li", { class: "rk-academia" }, [el("span", { class: "meta", text: academia.nome }), trocar]));
      }
    }

    // Desenha as ligas e as últimas mudanças
    function renderLigas() {
      // Estado da liga
      const estado = P.liga();
      // Explica a regra
      $("regra-liga").textContent = `Todo domingo: quem fez ${P.SOBE}+ pontos na semana sobe, quem fez menos de ${P.DESCE} desce.`;
      // Troca os escudos
      $("ligas").replaceChildren(
        // Um item para cada liga
        ...P.LIGAS.map((liga, i) =>
          // Item (destacado na liga atual)
          el("li", { class: "rk-liga" + (i === estado.atual ? " is-atual" : "") + (i < estado.atual ? " is-passada" : "") }, [
            // Escudo
            P.escudo(i),
            // Nome
            el("strong", { text: liga.nome }),
            // "Você está aqui" na liga atual
            i === estado.atual ? el("span", { class: "tag tag-success", text: "Você está aqui" }) : null,
          ]),
        ),
      );
      // Data curta (ex.: 06/10)
      const curta = (ms) => new Date(ms).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      // Últimas 3 mudanças de liga
      const itens = estado.mudancas.slice(0, 3).map((m) =>
        // Linha da mudança
        el("li", {}, [
          // Seta para cima ou para baixo
          el("span", { class: m.para > m.de ? "trend-good" : "trend-bad", text: m.para > m.de ? "▲" : "▼" }),
          // Texto da mudança
          el("span", { text: ` Semana de ${curta(m.semana)}: ${m.para > m.de ? "subiu" : "desceu"} para ${P.LIGAS[m.para].nome} (${SL.num(m.pts)} pts)` }),
        ]),
      );
      // Mostra as mudanças (ou um texto se ainda não teve)
      $("mudancas").replaceChildren(...(itens.length ? itens : [el("li", { class: "meta", text: "Nenhuma mudança de liga ainda." })]));
    }

    // Desenha os selos
    function renderSelos() {
      // Lista de selos
      const lista = P.selos();
      // Quantos já ganhou
      $("selos-total").textContent = `${lista.filter((s) => s.feito).length} de ${lista.length}`;
      // Troca a grade
      $("selos").replaceChildren(
        // Um item para cada selo
        ...lista.map((s) =>
          // Item (aceso se ganhou)
          el("li", { class: "rk-selo" + (s.feito ? " is-feito" : "") }, [
            // Medalha: anel com o ícone no meio
            el("span", { class: "rk-selo-medalha", "aria-hidden": "true" }, [icone(ICONES_SELO[s.id] || ICONES.trofeu)]),
            // Nome do selo
            el("strong", { text: s.nome }),
            // Como ganhar
            el("small", { text: s.texto }),
            // Texto para leitores de tela
            el("span", { class: "sr-only", text: s.feito ? "Conquistado" : "Ainda não conquistado" }),
          ]),
        ),
      );
    }

    // Desenha a tabela de como ganhar pontos
    function renderTabela() {
      // Tipos na ordem da tabela
      const tipos = ["serie", "treino", "refeicao", "proteina", "agua", "sequencia", "aula", "recorde", "metaSemana"];
      // Troca a tabela
      $("tabela").replaceChildren(
        // Uma linha para cada tipo
        ...tipos.map((t) =>
          // Linha: nome e pontos
          el("li", {}, [el("span", { text: P.NOMES[t] }), el("strong", { text: `+${P.TABELA[t]}` })]),
        ),
      );
      // Regras extras
      $("regras-extra").textContent = `Limite de ${P.LIMITE_DIA} pontos por dia. Refeições valem pontos até ${P.LIMITE_REFEICOES} por dia. Iniciantes ganham +20% nas 4 primeiras semanas.`;
    }

    // Desenha a página toda
    function render() {
      // Topo
      renderZera();
      // Card grande
      renderHero();
      // Pódio e lista
      renderRanking();
      // Ligas
      renderLigas();
      // Selos
      renderSelos();
      // Tabela
      renderTabela();
    }

    // Liga os botões de período e de escopo
    document.querySelectorAll(".rk-segmented").forEach((grupo) => {
      // Quando clicam no grupo...
      grupo.addEventListener("click", (e) => {
        // ...acha o botão clicado
        const btn = e.target.closest("button");
        // Se não foi em um botão, para
        if (!btn) return;
        // Guarda a escolha certa
        if (btn.dataset.periodo) periodo = btn.dataset.periodo;
        // (ou o escopo)
        if (btn.dataset.escopo) escopo = btn.dataset.escopo;
        // Para cada botão do grupo...
        grupo.querySelectorAll("button").forEach((b) => {
          // ...destaca o escolhido
          b.classList.toggle("is-active", b === btn);
          // ...e avisa os leitores de tela
          b.setAttribute("aria-pressed", String(b === btn));
        });
        // Desenha de novo
        render();
      });
    });

    // Quando os pontos ou a academia mudam, desenha de novo
    document.addEventListener("sl:pontos", render);
    // Desenha a primeira vez
    render();
  });
