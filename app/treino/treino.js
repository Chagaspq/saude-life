// Treino em andamento: séries, cargas, descanso entre séries e resumo no final.
// O progresso fica em sl-treino-atual, então dá para sair e continuar depois.
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ícones e ler/salvar dados
    const { el, icone, ICONES, storage } = SL;

    // Lê o que vem depois do ? no endereço (ex.: ?id=t1)
    const params = new URLSearchParams(window.location.search);
    // Treino em andamento salvo (se tiver)
    const salvo = SL.treinoAtual();
    // Qual treino abrir: o do endereço, o em andamento ou o primeiro da pessoa
    const idPedido = params.get("id") || (salvo && salvo.treinoId) || (SL.treinosDoUsuario()[0] || {}).id;
    // Acha os dados desse treino
    const treino = SL.acharTreino(idPedido);

    // Se não achou o treino...
    if (!treino) {
      // ...volta para Meus treinos
      window.location.replace("../treinos/treinos.html");
      // ...e para
      return;
    }

    // Lista de exercícios do treino
    const exercicios = SL.exerciciosDe(treino);
    // Diz se o exercício é por tempo (ex.: "40 s") em vez de repetições
    const ehTempo = (e) => typeof e.reps !== "number";

    // Cria o estado de um treino começando do zero
    function novoEstado() {
      // Devolve:
      return {
        // qual treino é
        treinoId: treino.id,
        // a hora que começou
        inicio: new Date().toISOString(),
        // em qual exercício está (começa no primeiro)
        indice: 0,
        // quantos exercícios já terminou
        feitos: 0,
        // as séries de cada exercício...
        series: exercicios.map((e) =>
          // ...cada uma com reps, carga e se já foi feita
          Array.from({ length: e.series }, () => ({ reps: e.reps, carga: e.carga, feito: false })),
        ),
      };
    }

    // Outro treino em andamento? Pergunta antes de descartar
    // Continua o treino salvo se for o mesmo; se não, começa do zero
    let estado = salvo && salvo.treinoId === treino.id ? salvo : novoEstado();
    // Vê se tem outro treino em andamento...
    const outroEmAndamento =
      // ...com pelo menos uma série feita
      salvo && salvo.treinoId !== treino.id && salvo.series && salvo.series.some((lista) => lista.some((s) => s.feito));

    // Atalho para achar um pedaço da página pelo data-render
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Troca o nome da aba do navegador
    document.title = `${treino.nome} — Saúde Life`;
    // Mostra o nome do treino
    $("nome").textContent = treino.nome;
    // Mostra o grupo e quantos exercícios
    $("grupo").textContent = `${treino.grupo || treino.objetivo} • ${exercicios.length} exercícios`;

    // Salva o progresso no navegador
    function salvar() {
      // Conta quantos exercícios têm todas as séries feitas
      estado.feitos = estado.series.filter((lista) => lista.every((s) => s.feito)).length;
      // Guarda na chave "sl-treino-atual"
      storage.set("sl-treino-atual", estado);
    }

    // Conta as séries feitas e o total
    function totais() {
      // Junta as séries de todos os exercícios numa lista só
      const todas = estado.series.flat();
      // Devolve feitas e total
      return { feitas: todas.filter((s) => s.feito).length, total: todas.length };
    }

    /* ---------- Cronômetro do treino ---------- */

    // Transforma segundos em texto de relógio (ex.: 01:05 ou 1:02:05)
    function mmss(segundos) {
      // Arredonda e nunca deixa negativo
      const s = Math.max(0, Math.round(segundos));
      // Horas
      const h = Math.floor(s / 3600);
      // Minutos
      const m = Math.floor((s % 3600) / 60);
      // Segundos com dois dígitos
      const resto = String(s % 60).padStart(2, "0");
      // Mostra as horas só se tiver
      return h ? `${h}:${String(m).padStart(2, "0")}:${resto}` : `${String(m).padStart(2, "0")}:${resto}`;
    }

    // Lugar do relógio na página
    const relogio = $("cronometro");
    // Atualiza o relógio
    function tick() {
      // Mostra quanto tempo passou desde o começo do treino
      relogio.textContent = mmss((Date.now() - new Date(estado.inicio)) / 1000);
    }
    // Atualiza uma vez agora
    tick();
    // E depois a cada 1 segundo
    const relogioTimer = setInterval(tick, 1000);

    /* ---------- Exercício atual ---------- */

    // Desenha o exercício atual e a lista
    function render() {
      // Número do exercício atual
      const i = estado.indice;
      // Dados do exercício atual
      const e = exercicios[i];
      // Séries do exercício atual
      const series = estado.series[i];
      // Séries feitas e total do treino
      const { feitas, total } = totais();
      // Porcentagem do treino
      const pct = total ? Math.round((feitas / total) * 100) : 0;

      // Escreve "X de Y séries"
      $("contador").textContent = `${feitas} de ${total} séries`;
      // Avisa os leitores de tela a porcentagem
      $("barra").setAttribute("aria-valuenow", pct);
      // Guarda a porcentagem na barra
      $("barra").querySelector(".fill").dataset.progress = pct;
      // Pinta a barra
      SL.aplicarProgresso();

      // Monta uma linha para cada série:
      const linhas = series.map((s, n) => {
        // se for por tempo...
        const reps = ehTempo(e)
          // ...mostra o tempo fixo
          ? el("span", { class: "set-static", text: e.reps })
          // se não, um campo de número para as repetições
          : el("input", {
              // (campo de número)
              type: "number",
              // (teclado numérico no celular)
              inputmode: "numeric",
              // (mínimo 0)
              min: 0,
              // (máximo 100)
              max: 100,
              // (valor atual)
              value: s.reps,
              // (classe do campo)
              class: "set-input",
              // (nome para leitores de tela)
              "aria-label": `Repetições da série ${n + 1}`,
              // (qual campo é)
              "data-campo": "reps",
              // (qual série é)
              "data-serie": n,
            });
        // Se tem carga (ou é por repetições), cria o campo de carga
        const carga = e.carga || !ehTempo(e)
          // (campo de número)
          ? el("input", {
              // (teclado com vírgula no celular)
              type: "number",
              // (mínimo 0)
              inputmode: "decimal",
              // (máximo 500)
              min: 0,
              // (de meio em meio quilo)
              max: 500,
              // (valor atual)
              step: 0.5,
              // (classe do campo)
              value: s.carga,
              // (nome para leitores de tela)
              class: "set-input",
              // (qual campo é)
              "aria-label": `Carga da série ${n + 1} em quilos`,
              // (qual série é)
              "data-campo": "carga",
              "data-serie": n,
            })
          // Se não tem carga, mostra um traço
          : el("span", { class: "set-static", text: "—" });

        // Linha da série (verde se já foi feita)
        return el("li", { class: "set-row" + (s.feito ? " is-done" : "") }, [
          // Número da série
          el("span", { class: "set-number", text: `Série ${n + 1}` }),
          // Repetições
          el("label", { class: "set-field" }, [reps, el("span", { class: "set-unit", text: ehTempo(e) ? "" : "reps" })]),
          // Carga
          el("label", { class: "set-field" }, [carga, el("span", { class: "set-unit", text: e.carga || !ehTempo(e) ? "kg" : "" })]),
          // Botão de marcar a série
          el(
            // (é um botão)
            "button",
            {
              // (tipo botão, não envia formulário)
              type: "button",
              // (classe)
              class: "set-check",
              // (ação do clique)
              "data-action": "marcar-serie",
              // (qual série)
              "data-serie": n,
              // (avisa se está marcado)
              "aria-pressed": String(s.feito),
              // (nome para leitores de tela)
              "aria-label": `${s.feito ? "Desmarcar" : "Concluir"} série ${n + 1}`,
            },
            // Ícone de check
            [icone(ICONES.check)],
          ),
        ]);
      });

      // Texto das repetições (ex.: 12 reps ou 40 s)
      const reps = ehTempo(e) ? e.reps : `${e.reps} reps`;
      // Troca o bloco do exercício atual:
      $("atual").replaceChildren(
        // "Exercício X de Y"
        el("p", { class: "page-kicker", text: `Exercício ${i + 1} de ${exercicios.length}` }),
        // Nome do exercício
        el("h2", { class: "player-exercise", text: e.nome }),
        // Séries, repetições e descanso
        el("p", { class: "meta", text: `${e.series} séries × ${reps}${e.descanso ? ` • descanso de ${e.descanso} s` : ""}` }),
        // Cabeçalho da tabela
        el("div", { class: "set-head", "aria-hidden": "true" }, [
          // Coluna Série
          el("span", { text: "Série" }),
          // Coluna Tempo ou Reps
          el("span", { text: ehTempo(e) ? "Tempo" : "Reps" }),
          // Coluna Carga
          el("span", { text: "Carga" }),
          // Coluna Feito
          el("span", { text: "Feito" }),
        ]),
        // Lista das séries
        el("ol", { class: "set-list" }, linhas),
      );

      // Troca a lista lateral de exercícios:
      $("lista").replaceChildren(
        // um item para cada exercício
        ...exercicios.map((ex, n) => {
          // vê se todas as séries dele foram feitas
          const completo = estado.series[n].every((s) => s.feito);
          // item da lista
          return el("li", {}, [
            // botão do exercício
            el(
              // (é um botão)
              "button",
              {
                // (tipo botão)
                type: "button",
                // (destaca o atual e os completos)
                class: "player-list-item" + (n === i ? " is-current" : "") + (completo ? " is-done" : ""),
                // (ação do clique)
                "data-action": "ir-exercicio",
                // (qual exercício)
                "data-indice": n,
                // (avisa os leitores de tela qual é o atual)
                "aria-current": n === i ? "step" : false,
              },
              [
                // Número do exercício (ou check se completo)
                el("span", { class: "exercise-index", "aria-hidden": "true" }, [completo ? icone(ICONES.check) : String(n + 1)]),
                // Nome e resumo do exercício
                el("span", { class: "player-list-text" }, [el("strong", { text: ex.nome }), el("span", { text: SL.resumoExercicio(ex) })]),
              ],
            ),
          ]);
        }),
      );

      // O botão da direita alterna entre "Próximo" e "Finalizar", então é buscado pela posição
      // Botão "Anterior"
      const anterior = document.querySelector(".player-footer .btn-secondary");
      // Botão da direita
      const proximo = document.querySelector(".player-footer .btn-primary");
      // Desativa o "Anterior" no primeiro exercício
      anterior.disabled = i === 0;
      // Vê se é o último exercício
      const ultimo = i === exercicios.length - 1;
      // No último, o botão vira "Finalizar treino"
      proximo.textContent = ultimo ? "Finalizar treino" : "Próximo exercício";
      // E muda a ação do clique
      proximo.dataset.action = ultimo ? "finalizar-treino" : "exercicio-proximo";
    }

    // Edição de reps e carga: vale para a série e para as próximas ainda não feitas
    // Quando a pessoa muda reps ou carga...
    $("atual").addEventListener("change", (ev) => {
      // ...vê qual campo foi
      const campo = ev.target.dataset.campo;
      // Se não foi um desses campos, para
      if (!campo) return;
      // Qual série foi
      const n = Number(ev.target.dataset.serie);
      // Novo valor (nunca negativo)
      const valor = Math.max(0, Number(ev.target.value) || 0);
      // Séries do exercício atual
      const series = estado.series[estado.indice];
      // Para cada série...
      series.forEach((s, k) => {
        // ...muda esta e as próximas que ainda não foram feitas
        if (k === n || (k > n && !s.feito)) s[campo] = valor;
      });
      // Salva
      salvar();
      // Desenha de novo
      render();
    });

    // Vai para outro exercício
    function irPara(indice) {
      // Cancela o avanço automático
      avancarDepois = null;
      // Muda o exercício (sem passar do primeiro nem do último)
      estado.indice = Math.max(0, Math.min(exercicios.length - 1, indice));
      // Salva
      salvar();
      // Para o descanso
      pararDescanso();
      // Desenha de novo
      render();
      // Coloca o foco no conteúdo (bom para leitores de tela)
      document.getElementById("conteudo").focus({ preventScroll: true });
      // Rola a página até o topo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ---------- Descanso ---------- */

    // Painel do descanso
    const painel = $("descanso");
    // Anel do descanso
    const anel = $("anel");
    // Tamanho da volta do anel (2 × pi × raio)
    const CIRCUNFERENCIA = 2 * Math.PI * 52;
    // O traço do anel tem o tamanho da volta inteira
    anel.style.strokeDasharray = CIRCUNFERENCIA;
    // Temporizador do descanso
    let descansoTimer = null;
    // Segundos que faltam
    let restante = 0;
    // Duração total do descanso
    let duracaoDescanso = 0;
    // Exercício terminado: só avança quando o descanso acaba (evita pular dois de uma vez)
    // Exercício para ir quando o descanso acabar
    let avancarDepois = null;

    // Desenha o tempo e o anel do descanso
    function desenharDescanso() {
      // Escreve o tempo que falta
      $("descanso-tempo").textContent = mmss(restante);
      // Esvazia o anel conforme o tempo passa
      anel.style.strokeDashoffset = CIRCUNFERENCIA * (1 - restante / duracaoDescanso);
    }

    // Começa um descanso
    function iniciarDescanso(segundos, textoProximo) {
      // Para o descanso anterior
      pararDescanso();
      // Se o descanso é zero, para
      if (!segundos) return;
      // Guarda a duração
      duracaoDescanso = segundos;
      // Começa com o tempo todo
      restante = segundos;
      // Mostra qual é o próximo passo
      $("descanso-proximo").textContent = textoProximo;
      // Limpa o aviso para leitores de tela
      $("descanso-aviso").textContent = "";
      // Mostra o painel
      painel.hidden = false;
      // Desenha
      desenharDescanso();
      // A cada 1 segundo...
      descansoTimer = setInterval(() => {
        // ...tira um segundo
        restante -= 1;
        // ...desenha de novo
        desenharDescanso();
        // ...se acabou o tempo...
        if (restante <= 0) {
          // ...termina o descanso
          fimDoDescanso();
          // ...avisa os leitores de tela
          $("descanso-aviso").textContent = "Descanso concluído";
          // ...mostra o aviso na tela
          SL.toast("Descanso concluído. Bora para a próxima!");
          // ...e vibra o celular (se a pessoa deixou ligado)
          if (navigator.vibrate && storage.get("sl-pref-vibrar", true)) navigator.vibrate([120, 60, 120]);
        }
      }, 1000);
    }

    // Para o descanso
    function pararDescanso() {
      // Para o temporizador
      clearInterval(descansoTimer);
      // Esquece o temporizador
      descansoTimer = null;
      // Esconde o painel
      painel.hidden = true;
    }

    // Botão de +15 segundos...
    SL.acao("descanso-mais", () => {
      // ...soma 15 segundos
      restante += 15;
      // ...aumenta a duração total se precisar
      duracaoDescanso = Math.max(duracaoDescanso, restante);
      // ...e desenha de novo
      desenharDescanso();
    });
    // Termina o descanso
    function fimDoDescanso() {
      // Para o descanso
      pararDescanso();
      // Se tinha exercício para ir, vai para ele
      if (avancarDepois !== null) irPara(avancarDepois);
    }

    // Botão de pular o descanso
    SL.acao("descanso-pular", fimDoDescanso);

    /* ---------- Ações ---------- */

    // Botão de marcar a série...
    SL.acao("marcar-serie", (alvo) => {
      // ...exercício atual
      const i = estado.indice;
      // ...qual série foi clicada
      const n = Number(alvo.dataset.serie);
      // ...dados da série
      const serie = estado.series[i][n];
      // ...troca entre feita e não feita
      serie.feito = !serie.feito;
      // ...nome único desta série neste treino (para não pontuar duas vezes)
      const refSerie = `serie:${estado.inicio}:${i}:${n}`;
      // ...se marcou, ganha os pontos (o "+10" sai do botão); se desmarcou, perde
      if (SL.pontos) serie.feito ? SL.pontos.ganhar("serie", refSerie, { origem: alvo }) : SL.pontos.perder(refSerie);
      // ...salva
      salvar();
      // ...desenha de novo
      render();

      // Se desmarcou, para por aqui
      if (!serie.feito) return;
      // Séries do exercício
      const series = estado.series[i];
      // Vê se todas foram feitas
      const exercicioCompleto = series.every((s) => s.feito);
      // Vê se é o último exercício
      const ultimoExercicio = i === exercicios.length - 1;

      // Se terminou o último exercício...
      if (exercicioCompleto && ultimoExercicio) {
        // ...para o descanso
        pararDescanso();
        // ...avisa que pode finalizar
        SL.toast("Última série feita! Finalize o treino quando quiser.");
        // ...e para
        return;
      }
      // Próxima série que falta
      const proximaSerie = series.findIndex((s) => !s.feito);
      // Texto do próximo passo:
      const texto = exercicioCompleto
        // o próximo exercício
        ? `A seguir: ${exercicios[i + 1].nome}`
        // ou a próxima série
        : `A seguir: série ${proximaSerie + 1} de ${series.length}`;
      // Se terminou o exercício e ele não tem descanso...
      if (exercicioCompleto && !exercicios[i].descanso) {
        // ...vai direto para o próximo
        irPara(i + 1);
        // ...e para
        return;
      }
      // Começa o descanso
      iniciarDescanso(exercicios[i].descanso, texto);
      // Se terminou o exercício, vai para o próximo quando o descanso acabar
      if (exercicioCompleto) avancarDepois = i + 1;
    });

    // Clique na lista lateral: vai para o exercício
    SL.acao("ir-exercicio", (alvo) => irPara(Number(alvo.dataset.indice)));
    // Botão "Anterior": volta um exercício
    SL.acao("exercicio-anterior", () => irPara(estado.indice - 1));
    // Botão "Próximo": avança um exercício
    SL.acao("exercicio-proximo", () => irPara(estado.indice + 1));

    // Botão X de sair do treino...
    SL.acao("sair-treino", () => {
      // ...conta as séries feitas
      const { feitas } = totais();
      // Se não fez nenhuma...
      if (!feitas) {
        // ...apaga o treino em andamento
        storage.remove("sl-treino-atual");
        // ...vai para o Início
        window.location.href = "../inicio/inicio.html";
        // ...e para
        return;
      }
      // Se fez alguma, pergunta antes
      SL.confirmar({
        // Título
        titulo: "Sair do treino?",
        // Texto
        texto: "Seu progresso fica salvo. Você pode continuar depois pelo Início.",
        // Texto do botão
        rotulo: "Sair e continuar depois",
        // Se confirmar, vai para o Início (o progresso fica salvo)
        fn: () => (window.location.href = "../inicio/inicio.html"),
      });
    });

    // Botão de finalizar o treino...
    SL.acao("finalizar-treino", () => {
      // ...conta as séries
      const { feitas, total } = totais();
      // Se não fez nenhuma...
      if (!feitas) {
        // ...pergunta se quer sair sem salvar
        SL.confirmar({
          // Título
          titulo: "Nenhuma série concluída",
          // Texto
          texto: "Marque as séries que você fez para o treino contar na sua evolução.",
          // Texto do botão
          rotulo: "Sair sem salvar",
          // Botão vermelho
          perigo: true,
          // Se confirmar...
          fn: () => {
            // ...apaga o treino em andamento
            storage.remove("sl-treino-atual");
            // ...e vai para o Início
            window.location.href = "../inicio/inicio.html";
          },
        });
        // ...e para
        return;
      }
      // Se faltaram séries...
      if (feitas < total) {
        // ...pergunta se quer finalizar mesmo assim
        SL.confirmar({
          // Título
          titulo: "Finalizar agora?",
          // Texto
          texto: `Você concluiu ${feitas} de ${total} séries. As que faltaram não entram no resumo.`,
          // Texto do botão
          rotulo: "Finalizar treino",
          // Se confirmar, conclui
          fn: concluir,
        });
        // ...e para
        return;
      }
      // Se fez tudo, conclui direto
      concluir();
    });

    /* ---------- Fim do treino ---------- */

    // Conclui o treino e mostra o resumo
    function concluir() {
      // Para o descanso
      pararDescanso();
      // Para o relógio
      clearInterval(relogioTimer);
      // Quantos minutos durou (pelo menos 1)
      const minutos = Math.max(1, Math.round((Date.now() - new Date(estado.inicio)) / 60000));
      // Séries feitas
      const feitas = estado.series.flat().filter((s) => s.feito);
      // Volume: soma de reps × carga das séries feitas
      const volume = estado.series.reduce(
        // (para cada exercício...)
        (soma, lista, i) =>
          // (soma...)
          soma +
          // (das séries...)
          lista
            // (feitas e que não são por tempo...)
            .filter((s) => s.feito && !ehTempo(exercicios[i]))
            // (reps × carga)
            .reduce((parcial, s) => parcial + s.reps * s.carga, 0),
        // (começa do zero)
        0,
      );

      // Salva o treino no histórico...
      storage.set(
        // (chave do histórico)
        "sl-historico",
        // ...com os dados deste treino na frente
        [{ treinoId: treino.id, nome: treino.nome, data: new Date().toISOString(), duracao: minutos, series: feitas.length, volume }].concat(
          // ...e os treinos antigos depois
          storage.get("sl-historico", []),
        ),
      );
      // Apaga o treino em andamento
      storage.remove("sl-treino-atual");
      // Se o motor de pontos carregou...
      if (SL.pontos) {
        // ...ganha os pontos do treino concluído
        SL.pontos.ganhar("treino", "treino:" + estado.inicio);
        // ...e confere sequência e meta da semana
        SL.pontos.conferirTreino();
      }

      // Calcula os números atualizados
      const stats = SL.estatisticas();
      // Muda a página para o modo "terminado"
      document.body.classList.add("is-finished");
      // Esconde a barra de baixo
      document.querySelector(".player-footer").hidden = true;
      // Esconde o progresso
      document.querySelector(".player-progress").hidden = true;
      // Esconde o botão de sair
      document.querySelector('[data-action="sair-treino"]').hidden = true;

      // Desenha o selo de conquista
      const conquista = svgConquista();
      // Troca o conteúdo pelo resumo:
      document.getElementById("conteudo").replaceChildren(
        // card do resumo
        el("section", { class: "finish-card", "aria-labelledby": "heading-fim" }, [
          // selo
          conquista,
          // título
          el("h2", { id: "heading-fim", text: "Treino concluído!" }),
          // texto com a meta da semana
          el("p", { class: "page-lead", text: `${treino.nome} registrado. Isso conta para sua meta: ${stats.nestaSemana} de ${stats.meta} nesta semana.` }),
          // números do treino
          el("div", { class: "stats-grid stats-grid-3" }, [
            // duração
            SL.statTile({ rotulo: "Duração", valor: SL.duracaoTexto(minutos), iconePaths: ICONES.relogio }),
            // séries
            SL.statTile({ rotulo: "Séries", valor: SL.num(feitas.length), iconePaths: ICONES.check, cor: "emerald" }),
            // volume
            SL.statTile({ rotulo: "Volume total", valor: `${SL.num(volume)} kg`, iconePaths: ICONES.haltere }),
          ]),
          // botões
          el("div", { class: "finish-actions" }, [
            // voltar ao Início
            el("a", { href: "../inicio/inicio.html", class: "btn-primary", text: "Voltar ao início" }),
            // ver a evolução
            el("a", { href: "../evolucao/evolucao.html", class: "btn-secondary", text: "Ver minha evolução" }),
          ]),
        ]),
      );
      // Coloca o foco no resumo
      document.getElementById("conteudo").focus();
    }

    // Desenha o selo de conquista em SVG
    function svgConquista() {
      // Cria o desenho
      const s = SL.svg("svg", { viewBox: "0 0 96 96", class: "finish-badge", "aria-hidden": "true" });
      // Coloca dentro:
      s.append(
        // anel de fora
        SL.svg("circle", { cx: 48, cy: 48, r: 44, class: "finish-badge-ring" }),
        // círculo do meio
        SL.svg("circle", { cx: 48, cy: 48, r: 34, class: "finish-badge-core" }),
        // check
        SL.svg("path", { d: "M33 49l10 10 20-22", class: "finish-badge-check" }),
      );
      // Devolve o desenho
      return s;
    }

    /* ---------- Início ---------- */

    // Salva o estado (garante que está gravado)
    salvar();
    // Desenha a tela
    render();

    // Se tem outro treino em andamento...
    if (outroEmAndamento) {
      // ...acha esse outro treino
      const outro = SL.acharTreino(salvo.treinoId);
      // ...pergunta se quer descartar
      SL.confirmar({
        // Título
        titulo: "Você tem um treino em andamento",
        // Texto
        texto: `"${outro ? outro.nome : "Treino anterior"}" não foi finalizado. Começar "${treino.nome}" descarta o progresso dele.`,
        // Texto do botão
        rotulo: `Começar ${treino.nome}`,
        // Se confirmar, só continua neste
        fn: () => {},
      });
      // Cancelar volta para o treino que já estava em andamento
      // Se cancelar...
      document.querySelector(".modal-actions .btn-secondary").addEventListener("click", () => {
        // ...guarda de novo o treino antigo
        storage.set("sl-treino-atual", salvo);
        // ...e volta para ele
        window.location.replace(SL.linkTreino(salvo.treinoId));
      });
    }
  });
