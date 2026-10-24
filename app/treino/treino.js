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

    // Exercícios trocados neste treino (aparelho ocupado): { posição: nome novo }
    estado.trocas = estado.trocas || {};
    // Bi-sets ligados: { posição: true } junta o exercício com o próximo
    estado.biset = estado.biset || {};
    // Aplica as trocas na lista de exercícios
    Object.entries(estado.trocas).forEach(([k, nome]) => (exercicios[k] = { ...exercicios[k], nome }));

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
          // ...botão que conta o tempo e marca a série sozinho no fim
          ? el("button", { type: "button", class: "set-timer", "data-action": "cronometrar-serie", "data-serie": n, disabled: s.feito, "aria-label": `Contar ${e.reps} da série ${n + 1}`, text: `▶ ${e.reps}` })
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
          // Número da série (ou "Drop" na série extra com menos peso)
          el("span", { class: "set-number" + (s.drop ? " is-drop" : ""), text: s.drop ? "Drop" : `Série ${n + 1}` }),
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
        // Opções do exercício: drop set, bi-set e trocar
        el("div", { class: "set-opcoes" }, [
          // Drop set: série extra com menos peso, sem descanso antes (só para exercícios com carga)
          !ehTempo(e) ? el("button", { type: "button", class: "btn-secondary btn-sm", "data-action": "drop-set", text: "+ Drop set" }) : null,
          // Bi-set com o próximo exercício (não aparece no último)
          i < exercicios.length - 1
            ? el("button", { type: "button", class: "btn-secondary btn-sm" + (estado.biset[i] ? " is-active" : ""), "data-action": "bi-set", "aria-pressed": String(Boolean(estado.biset[i])), text: estado.biset[i] ? `Bi-set com ${exercicios[i + 1].nome} ✓` : "Bi-set com o próximo" })
            : null,
          // Trocar por um parecido (aparelho ocupado)
          el("button", { type: "button", class: "btn-secondary btn-sm", "data-action": "trocar-exercicio", text: "Trocar exercício" }),
        ]),
        // Sugestão de carga (se tiver; vazio quando não tem, para não aparecer "null")
        sugestaoDeCarga(e, series) || "",
        // Como fazer: Pulso mostrando o movimento + dicas (vazio se o exercício não está na biblioteca)
        comoFazer(e) || "",
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

    /* ---------- Como fazer, sugestão de carga e recordes ---------- */

    // Biblioteca de exercícios (dicas, movimento, músculos)
    const BIBLIOTECA = window.SL_EXERCICIOS || {};

    // Bloco "Como fazer": o Pulso fazendo o movimento + 2 dicas + o erro comum
    function comoFazer(e) {
      // Informações do exercício na biblioteca
      const info = BIBLIOTECA[e.nome];
      // Se o exercício não está na biblioteca (foi digitado pela pessoa), não mostra
      if (!info) return null;
      // Caixa que abre e fecha (começa aberta para iniciantes)
      return el("details", { class: "como-fazer", open: SL.onboarding().nivel === "Iniciante" }, [
        // Título clicável
        el("summary", { text: "Como fazer" }),
        // Miolo
        el("div", { class: "como-fazer-miolo" }, [
          // Passo a passo: o Pulso em 3 momentos do movimento (começo, meio e fim)
          SL.personagem ? SL.personagem.passoAPasso(info.mov) : null,
          // Dicas
          el("div", { class: "como-fazer-dicas" }, [
            // Lista das dicas
            el("ul", {}, info.dicas.map((d) => el("li", { text: d }))),
            // Erro comum
            el("p", { class: "como-fazer-erro" }, [el("strong", { text: "Cuidado: " }), info.erro]),
            // Músculos trabalhados
            el("p", { class: "meta", text: `Trabalha: ${info.grupo.toLowerCase()} • ${info.lugar === "casa" ? "dá para fazer em casa" : info.lugar === "academia" ? "na academia" : "em casa ou na academia"}` }),
          ]),
        ]),
      ]);
    }

    // Resultado da última vez de cada exercício: { nome: { carga, todas, esforco, data } }
    const ultimas = () => storage.get("sl-ultimas", {});
    // Maior carga de cada exercício: { nome: kg }
    const recordes = () => storage.get("sl-recordes", {});

    // Sugestão de carga para hoje, a partir da última vez
    function sugestaoDeCarga(e, series) {
      // Exercícios por tempo ou sem carga não têm sugestão
      if (ehTempo(e)) return null;
      // Última vez deste exercício
      const ult = ultimas()[e.nome];
      // Se nunca fez, não tem sugestão
      if (!ult || !ult.carga) return null;
      // Carga sugerida e o motivo
      let carga = ult.carga;
      // Motivo da sugestão
      let motivo = "mesma carga da última vez";
      // Foi fácil (ou fez todas as séries sem dizer que foi pesado): sobe 2,5 kg
      if (ult.esforco === "facil" || (ult.todas && !ult.esforco)) {
        // Sobe
        carga = ult.carga + 2.5;
        // Motivo
        motivo = ult.esforco === "facil" ? "da última vez foi fácil" : "você fez todas as séries da última vez";
      } else if (ult.esforco === "muito") {
        // Foi muito pesado: desce 2,5 kg
        carga = Math.max(0, ult.carga - 2.5);
        // Motivo
        motivo = "da última vez foi muito pesado";
      }
      // Primeira série ainda não feita
      const proxima = series.find((x) => !x.feito);
      // Se já fez tudo ou a carga já é a sugerida, não mostra
      if (!proxima || proxima.carga === carga) return null;
      // Botão de usar a sugestão
      const usar = el("button", { type: "button", class: "btn-secondary", text: "Usar" });
      // Ao clicar...
      usar.addEventListener("click", () => {
        // ...troca a carga das séries que faltam
        series.forEach((x) => !x.feito && (x.carga = carga));
        // ...salva
        salvar();
        // ...desenha de novo
        render();
        // ...e avisa
        SL.toast(`Carga ajustada para ${SL.num(carga, carga % 1 ? 1 : 0)} kg`);
      });
      // Caixa da sugestão
      return el("div", { class: "sugestao-carga" }, [
        // Ícone de seta para cima/baixo
        el("span", { class: "icon-tile icon-tile-emerald", "aria-hidden": "true" }, [icone(carga > ult.carga ? ["M12 19V5", "m5 12 7-7 7 7"] : ["M12 5v14", "m19 12-7 7-7-7"])]),
        // Texto
        el("p", {}, [el("strong", { text: `Sugestão: ${SL.num(carga, carga % 1 ? 1 : 0)} kg` }), el("span", { class: "meta", text: ` (${motivo})` })]),
        // Botão
        usar,
      ]);
    }

    // Confere se a série marcada bateu o recorde de carga do exercício
    function conferirRecorde(i, serie, origem) {
      // Exercício
      const e = exercicios[i];
      // Por tempo ou sem carga: não tem recorde
      if (ehTempo(e) || !serie.carga) return;
      // Recordes salvos
      const lista = recordes();
      // Recorde atual deste exercício (ou a carga da última vez)
      const atual = lista[e.nome] != null ? lista[e.nome] : (ultimas()[e.nome] || {}).carga;
      // Primeira vez com esse exercício: só guarda, sem comemorar
      if (atual == null) {
        // Guarda a carga como recorde
        lista[e.nome] = serie.carga;
        // Salva
        storage.set("sl-recordes", lista);
        // Para
        return;
      }
      // Não passou do recorde: nada a fazer
      if (serie.carga <= atual) return;
      // Novo recorde! Guarda
      lista[e.nome] = serie.carga;
      // Salva
      storage.set("sl-recordes", lista);
      // Ganha os pontos de recorde (uma vez por exercício neste treino; já solta confete)
      if (SL.pontos) SL.pontos.ganhar("recorde", `recorde:${estado.inicio}:${i}`, { origem });
      // Avisa
      SL.toast(`Novo recorde no ${e.nome}: ${SL.num(serie.carga, serie.carga % 1 ? 1 : 0)} kg!`);
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

    // Botão de -15 segundos (nunca menos que zero; chegando a zero, termina)
    SL.acao("descanso-menos", () => {
      // Tira 15 segundos
      restante = Math.max(0, restante - 15);
      // Se acabou, termina o descanso
      if (!restante) return fimDoDescanso();
      // Desenha de novo
      desenharDescanso();
    });

    /* ---------- Tela sempre acesa durante o treino ---------- */

    // Trava da tela (o celular não apaga enquanto ela existir)
    let travaTela = null;
    // Pede para a tela ficar acesa (se o navegador deixar)
    async function manterTelaAcesa() {
      // Tenta...
      try {
        // ...pedir a trava, se existir no navegador
        if ("wakeLock" in navigator) travaTela = await navigator.wakeLock.request("screen");
      // Se recusar, segue normal
      } catch (erro) {
        // Sem trava
        travaTela = null;
      }
    }
    // Pede agora
    manterTelaAcesa();
    // Ao voltar para a aba, pede de novo (o navegador solta a trava quando a aba some)
    document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && !document.body.classList.contains("is-finished") && manterTelaAcesa());

    /* ---------- Drop set, bi-set, trocar exercício e séries por tempo ---------- */

    // Vibraçãozinha (se a pessoa deixou ligado no Perfil)
    // (só depois de a pessoa tocar na página: antes disso o navegador bloqueia)
    const vibrar = (padrao) => navigator.vibrate && storage.get("sl-pref-vibrar", true) && (!navigator.userActivation || navigator.userActivation.hasBeenActive) && navigator.vibrate(padrao);

    // Drop set: soma uma série com 20% menos peso, sem descanso antes
    SL.acao("drop-set", () => {
      // Séries do exercício atual
      const lista = estado.series[estado.indice];
      // Última série (base do peso)
      const ultima = lista[lista.length - 1];
      // Peso 20% menor, de meio em meio quilo
      const carga = Math.max(0, Math.round(ultima.carga * 0.8 * 2) / 2);
      // Soma a série extra
      lista.push({ reps: ultima.reps, carga, feito: false, drop: true });
      // Salva
      salvar();
      // Desenha
      render();
      // Avisa
      SL.toast(`Drop set: ${SL.num(carga, carga % 1 ? 1 : 0)} kg, sem descanso`);
    });

    // Bi-set: liga ou desliga o exercício atual com o próximo
    SL.acao("bi-set", () => {
      // Exercício atual
      const i = estado.indice;
      // Troca o estado
      estado.biset[i] = !estado.biset[i];
      // Salva
      salvar();
      // Desenha
      render();
      // Avisa
      SL.toast(estado.biset[i] ? `Bi-set: uma série de cada, sem descanso entre ${exercicios[i].nome} e ${exercicios[i + 1].nome}` : "Bi-set desligado");
    });

    // Trocar o exercício por um parecido (mesmo grupo muscular)
    SL.acao("trocar-exercicio", () => {
      // Exercício atual
      const i = estado.indice;
      // Grupo dele na biblioteca
      const grupo = (BIBLIOTECA[exercicios[i].nome] || {}).grupo;
      // Nomes que já estão no treino
      const noTreino = exercicios.map((x) => x.nome);
      // Opções: mesmo grupo, fora do treino
      const opcoes = Object.keys(BIBLIOTECA).filter((nome) => BIBLIOTECA[nome].grupo === grupo && !noTreino.includes(nome));
      // Sem opções
      if (!opcoes.length) return SL.toast("Não achamos um exercício parecido para trocar.");
      // Abre a lista de opções
      SL.openModal(
        // Título
        `Trocar ${exercicios[i].nome}`,
        // Lista de botões
        el(
          "ul",
          { class: "list-panel troca-lista" },
          opcoes.map((nome) =>
            // Uma opção
            el("li", {}, [
              // Botão da opção
              el("button", { type: "button", class: "btn-link", "data-action": "escolher-troca", "data-nome": nome }, [el("strong", { text: nome }), el("span", { text: `${BIBLIOTECA[nome].musculos || grupo} • ${BIBLIOTECA[nome].equip || BIBLIOTECA[nome].lugar || ""}` })]),
            ]),
          ),
        ),
      );
    });

    // Escolheu o exercício novo
    SL.acao("escolher-troca", (alvo) => {
      // Exercício atual
      const i = estado.indice;
      // Guarda a troca
      estado.trocas[i] = alvo.dataset.nome;
      // Troca na lista
      exercicios[i] = { ...exercicios[i], nome: alvo.dataset.nome };
      // Salva
      salvar();
      // Fecha a lista
      SL.closeModal();
      // Desenha
      render();
      // Avisa
      SL.toast(`Trocado por ${alvo.dataset.nome}`);
    });

    // Transforma "40 s", "1 min" ou "5 min" em segundos
    function segundosDe(texto) {
      // Número do texto
      const n = parseFloat(String(texto).replace(",", "."));
      // Minutos ou segundos
      return /min/.test(texto) ? Math.round(n * 60) : Math.round(n) || 30;
    }

    // Série por tempo: conta o tempo e marca a série sozinho no fim
    SL.acao("cronometrar-serie", (alvo) => {
      // Qual série
      const n = alvo.dataset.serie;
      // Segundos que faltam
      let falta = segundosDe(exercicios[estado.indice].reps);
      // Desativa o botão enquanto conta
      alvo.disabled = true;
      // Começo
      vibrar(30);
      // A cada segundo...
      const conta = setInterval(() => {
        // ...tira um segundo
        falta -= 1;
        // ...mostra o tempo
        alvo.textContent = mmss(falta);
        // ...se acabou...
        if (falta <= 0) {
          // Para de contar
          clearInterval(conta);
          // Vibra
          vibrar([120, 60, 120]);
          // Marca a série (clica no check dela)
          const check = document.querySelector(`[data-action="marcar-serie"][data-serie="${n}"]`);
          // Se achou, clica
          if (check) check.click();
        }
      }, 1000);
    });

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
      // ...se marcou, confere se bateu recorde de carga
      if (serie.feito) conferirRecorde(i, serie, alvo);
      // ...vibraçãozinha ao marcar
      if (serie.feito) vibrar(25);
      // ...salva
      salvar();
      // ...desenha de novo
      render();

      // Se desmarcou, para por aqui
      if (!serie.feito) return;
      // Bi-set (1º do par): vai direto para o próximo exercício, sem descanso
      if (estado.biset[i] && estado.series[i + 1] && estado.series[i + 1].some((x) => !x.feito)) {
        // Sem descanso
        pararDescanso();
        // Vai para o par
        irPara(i + 1);
        // Para aqui
        return;
      }
      // Bi-set (2º do par): descansa e volta para o primeiro, se ele ainda tem séries
      if (estado.biset[i - 1] && estado.series[i - 1].some((x) => !x.feito)) {
        // Descanso e depois volta
        iniciarDescanso(exercicios[i].descanso || 60, `A seguir: ${exercicios[i - 1].nome}`);
        // Volta para o primeiro do par quando o descanso acabar
        avancarDepois = i - 1;
        // Para aqui
        return;
      }
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
      // Próxima série é um drop set: sem descanso
      if (!exercicioCompleto && series[proximaSerie].drop) return pararDescanso();
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

      // Calorias gastas (estimativa): esforço do treino × peso × horas
      // MET: 6 para treino intenso (HIIT), 5 para musculação e os outros
      const met = treino.objetivo === "HIIT" ? 6 : 5;
      // Peso da pessoa (do perfil ou da evolução)
      const peso = SL.dadosCorpo ? SL.dadosCorpo().peso : 70;
      // Calorias arredondadas
      const kcal = Math.round((met * peso * minutos) / 60);
      // Última vez que fez este mesmo treino (para comparar o volume)
      const anterior = SL.historico().find((h) => h.treinoId === treino.id && h.volume);
      // Diferença de volume em % (null se não tem com o que comparar)
      const diferenca = anterior && volume ? Math.round(((volume - anterior.volume) / anterior.volume) * 100) : null;
      // Frase da comparação
      const comparacao =
        // Sem treino anterior igual
        diferenca === null
          ? "Primeira vez com este treino: na próxima a gente compara."
          : // Levantou mais
            diferenca > 0
            ? `Você levantou ${diferenca}% a mais que na última vez (${SL.num(anterior.volume)} kg).`
            : // Igual
              diferenca === 0
              ? "Mesmo volume da última vez. Constância também é evolução."
              : // Levantou menos
                `${Math.abs(diferenca)}% a menos que na última vez. Dia mais leve conta também.`;
      // Solta a trava da tela
      if (travaTela) travaTela.release().catch(() => {});

      // Salva o treino no histórico...
      storage.set(
        // (chave do histórico)
        "sl-historico",
        // ...com os dados deste treino na frente
        [{ treinoId: treino.id, nome: treino.nome, data: new Date().toISOString(), duracao: minutos, series: feitas.length, volume, kcal }].concat(
          // ...e os treinos antigos depois
          storage.get("sl-historico", []),
        ),
      );
      // Guarda como foi cada exercício (para sugerir a carga da próxima vez)
      const ult = ultimas();
      // Para cada exercício do treino...
      exercicios.forEach((ex, k) => {
        // ...séries feitas dele
        const feitasEx = estado.series[k].filter((x) => x.feito);
        // ...se não fez nenhuma ou é por tempo, pula
        if (!feitasEx.length || ehTempo(ex)) return;
        // ...guarda a maior carga, se fez todas e a data
        ult[ex.nome] = { carga: Math.max(...feitasEx.map((x) => x.carga)), todas: feitasEx.length === estado.series[k].length, data: new Date().toISOString() };
      });
      // Salva
      storage.set("sl-ultimas", ult);
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
          // comparação com a última vez
          el("p", { class: "finish-comparacao", text: comparacao }),
          // números do treino
          el("div", { class: "stats-grid stats-grid-4" }, [
            // duração
            SL.statTile({ rotulo: "Duração", valor: SL.duracaoTexto(minutos), iconePaths: ICONES.relogio }),
            // séries
            SL.statTile({ rotulo: "Séries", valor: SL.num(feitas.length), iconePaths: ICONES.check, cor: "emerald" }),
            // volume
            SL.statTile({ rotulo: "Volume total", valor: `${SL.num(volume)} kg`, iconePaths: ICONES.haltere }),
            // calorias (estimativa)
            SL.statTile({ rotulo: "Calorias (estimativa)", valor: `${SL.num(kcal)} kcal`, iconePaths: ICONES.fogo, cor: "emerald" }),
          ]),
          // Como foi o treino? (esforço com emoji)
          perguntaEsforco(),
          // botões
          el("div", { class: "finish-actions" }, [
            // voltar ao Início
            el("a", { href: "../inicio/inicio.html", class: "btn-primary", text: "Voltar ao início" }),
            // ver a evolução
            el("a", { href: "../evolucao/evolucao.html", class: "btn-secondary", text: "Ver minha evolução" }),
            // compartilhar o treino (cartão de stories)
            SL.stories ? el("button", { type: "button", class: "btn-secondary", "data-action": "compartilhar-treino", "data-min": minutos, "data-series": feitas.length, "data-volume": volume, text: "Compartilhar" }) : null,
          ]),
        ]),
      );
      // Coloca o foco no resumo
      document.getElementById("conteudo").focus();
    }

    // Botão "Compartilhar": abre o cartão do treino no estilo stories
    SL.acao("compartilhar-treino", (alvo) => {
      // Números do treino guardados no botão
      const { min, series, volume } = alvo.dataset;
      // Pontos ganhos hoje
      const pts = SL.pontos ? SL.pontos.somar(new Date().setHours(0, 0, 0, 0), Date.now() + 1) : 0;
      // Abre o stories
      SL.stories.abrir("Treino concluído!", [
        // Tela 1: o treino
        { kicker: "Treino concluído", numero: treino.nome, legenda: `${SL.duracaoTexto(Number(min))} de treino`, texto: "" },
        // Tela 2: séries
        { kicker: "Séries", numero: SL.num(Number(series)), legenda: "séries feitas", texto: `${SL.num(Number(volume))} kg levantados` },
        // Tela 3: pontos
        { kicker: "Pontos de hoje", numero: `+${SL.num(pts)}`, legenda: "pontos no ranking", texto: SL.personagem ? SL.personagem.frase() : "" },
      ]);
    });

    // Pergunta "Como foi o treino?" com 4 níveis (barrinhas de intensidade); a resposta ajusta a sugestão de carga da próxima vez
    function perguntaEsforco() {
      // Opções
      const opcoes = [
        // Fácil
        { id: "facil", nivel: 1, nome: "Fácil" },
        // Ok
        { id: "ok", nivel: 2, nome: "Na medida" },
        // Pesado
        { id: "pesado", nivel: 3, nome: "Pesado" },
        // Muito pesado
        { id: "muito", nivel: 4, nome: "Muito pesado" },
      ];
      // Caixa da pergunta
      const caixa = el("fieldset", { class: "esforco" }, [
        // Pergunta
        el("legend", { text: "Como foi o treino?" }),
        // Um botão para cada opção
        ...opcoes.map((o) => el("button", { type: "button", "data-esforco": o.id, "aria-pressed": "false" }, [el("span", { class: `esforco-barras nivel-${o.nivel}`, "aria-hidden": "true" }, [1, 2, 3, 4].map(() => el("i", {}))), o.nome])),
      ]);
      // Quando escolhe...
      caixa.addEventListener("click", (ev) => {
        // ...botão clicado
        const b = ev.target.closest("[data-esforco]");
        // ...se não foi num botão, para
        if (!b) return;
        // ...marca só o escolhido
        caixa.querySelectorAll("[data-esforco]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        // ...guarda o esforço nos exercícios deste treino
        const ult = ultimas();
        // Para cada exercício do treino que foi guardado...
        exercicios.forEach((ex) => ult[ex.nome] && (ult[ex.nome].esforco = b.dataset.esforco));
        // ...salva
        storage.set("sl-ultimas", ult);
        // ...guarda também no histórico (o treino que acabou é o primeiro da lista)
        const hist = storage.get("sl-historico", []);
        // Se tem histórico, marca o esforço no primeiro
        if (hist[0]) hist[0].esforco = b.dataset.esforco;
        // Salva o histórico
        storage.set("sl-historico", hist);
        // ...e agradece
        SL.toast(b.dataset.esforco === "facil" ? "Anotado! Na próxima a gente sobe a carga." : b.dataset.esforco === "muito" ? "Anotado! Na próxima a gente alivia um pouco." : "Anotado! Valeu por contar.");
      });
      // Devolve a caixa
      return caixa;
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
