// Comunidade: feed de treinos dos amigos, amigos, desafios em grupo e mensagens.
// Sem servidor, os amigos são simulados: o que eles fazem vem de um "sorteio" fixo,
// e o que a pessoa faz (reações, comentários, mensagens, desafios) fica salvo no navegador.
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  SL.pagina(() => {
    // Se os pontos não carregaram, para (a comunidade usa os amigos de lá)
    if (!SL.pontos) return;
    // Pega do núcleo: criar elementos, ler/salvar dados, ícones
    const { el, storage, icone, ICONES } = SL;
    // Atalho para o motor de pontos
    const P = SL.pontos;
    // Pega o catálogo de treinos
    const { CATALOGO } = window.SL_DADOS;
    // Quantos milissegundos tem um dia
    const DIA = 86400000;
    // Atalho para achar um pedaço da página pelo data-render
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Primeiro nome de alguém
    const primeiro = (nome) => nome.split(" ")[0];
    // ID de uma pessoa: o número do código (ANA-3107 vira 3107)
    const idDe = (codigo) => codigo.split("-")[1];

    // Reações possíveis nos treinos
    const REACOES = [
      // Fogo
      { id: "fogo", emoji: "🔥", nome: "Fogo" },
      // Palmas
      { id: "palmas", emoji: "👏", nome: "Palmas" },
      // Força
      { id: "forca", emoji: "💪", nome: "Força" },
    ];

    // Respostas automáticas dos amigos no chat (simuladas)
    const RESPOSTAS = [
      // Resposta 1
      "Boraaa! Hoje é dia de treino 💪",
      // Resposta 2
      "Fechou! Te encontro na academia às 18h?",
      // Resposta 3
      "Valeu pela força! Bati minha meta hoje 🔥",
      // Resposta 4
      "Tô dentro! Me chama no próximo desafio.",
      // Resposta 5
      "Haha você tá voando no ranking essa semana!",
    ];

    /* ---------- Seu perfil (código, link e privacidade) ---------- */

    // Seu código de amigo: primeiro nome + 4 números tirados do e-mail
    function meuCodigo() {
      // Dados da pessoa
      const usuario = SL.getUsuario();
      // Sessão (tem o e-mail)
      const sessao = storage.get("sl-sessao", {});
      // 4 números fixos a partir do e-mail
      const numero = String(1000 + Math.floor(P.sorteio(sessao.email || usuario.nome) * 8999));
      // Primeiro nome sem acentos e em maiúsculas
      const nome = SL.slug(primeiro(usuario.nome)).toUpperCase().slice(0, 8);
      // Junta: NOME-1234
      return `${nome}-${numero}`;
    }

    // Link que adiciona você como amigo
    const meuLink = () => new URL(`comunidade.html?add=${meuCodigo()}`, window.location.href).href;

    // Copia um texto (ou mostra para copiar à mão se o navegador não deixar)
    function copiar(texto, aviso) {
      // Se o navegador sabe copiar...
      if (navigator.clipboard) {
        // ...copia e avisa
        navigator.clipboard.writeText(texto).then(() => SL.toast(aviso), () => SL.toast(texto));
      } else {
        // Se não, mostra o texto no aviso
        SL.toast(texto);
      }
    }

    // Desenha o card do seu perfil
    function renderPerfil() {
      // Código
      const codigo = meuCodigo();
      // Privacidade salva (padrão: só amigos)
      const privacidade = storage.get("sl-privacidade", "amigos");
      // Caixa de seleção da privacidade
      const select = el("select", { class: "cm-select", "aria-label": "Quem vê seu perfil" }, [
        // Público
        el("option", { value: "publico", text: "Público: todo mundo vê" }),
        // Só amigos
        el("option", { value: "amigos", text: "Só amigos veem" }),
        // Privado
        el("option", { value: "privado", text: "Privado: só você vê" }),
      ]);
      // Marca a opção salva
      select.value = privacidade;
      // Quando muda, salva
      select.addEventListener("change", () => {
        // Guarda a escolha
        storage.set("sl-privacidade", select.value);
        // Avisa
        SL.toast("Privacidade atualizada");
      });
      // Botão de copiar o código
      const btnCodigo = el("button", { type: "button", class: "btn-secondary", text: "Copiar código" });
      // Ao clicar, copia
      btnCodigo.addEventListener("click", () => copiar(codigo, "Código copiado!"));
      // Botão de compartilhar o link
      const btnLink = el("button", { type: "button", class: "btn-primary", text: "Convidar amigo" });
      // Ao clicar...
      btnLink.addEventListener("click", () => {
        // ...texto do convite
        const texto = `Bora treinar comigo no Saúde Life? Me adiciona: ${meuLink()}`;
        // ...se o celular sabe compartilhar (WhatsApp etc.), abre a janela de compartilhar
        if (navigator.share) navigator.share({ title: "Saúde Life", text: texto }).catch(() => {});
        // ...se não, copia o link
        else copiar(meuLink(), "Link copiado! Mande no WhatsApp.");
      });
      // Troca o conteúdo do card
      $("perfil").replaceChildren(
        // Bolinha com as iniciais
        el("span", { class: "rk-avatar", "aria-hidden": "true", text: SL.initials(SL.getUsuario().nome) }),
        // Código e ID
        el("div", { class: "cm-perfil-info" }, [
          // Rótulo
          el("span", { class: "meta", text: "Seu código de amigo" }),
          // Código grande
          el("strong", { class: "cm-codigo", text: codigo }),
          // ID
          el("span", { class: "meta", text: `ID ${idDe(codigo)} • ${P.amigos().length} amigos` }),
        ]),
        // Privacidade
        el("label", { class: "cm-privacidade" }, [el("span", { class: "meta", text: "Quem vê seu perfil" }), select]),
        // Botões
        el("div", { class: "cm-perfil-botoes" }, [btnCodigo, btnLink]),
      );
    }

    /* ---------- Feed ---------- */

    // Treinos dos amigos nos últimos 7 dias (simulados com o sorteio fixo)
    function posts() {
      // Lista de posts
      const lista = [];
      // Agora
      const agora = Date.now();
      // Para cada amigo...
      P.amigos().forEach((amigo) => {
        // ...olha os últimos 7 dias
        for (let d = 0; d < 7; d++) {
          // Começo do dia
          const dia = new Date(agora - d * DIA);
          // Zera o horário
          dia.setHours(0, 0, 0, 0);
          // Chave do dia
          const chave = amigo.codigo + dia.toDateString();
          // Chance de treinar nesse dia depende do ritmo da pessoa
          if (P.sorteio(chave) > amigo.ritmo / 1100) continue;
          // Horário do treino (entre 6h e 21h)
          const hora = new Date(dia.getTime() + (6 + Math.floor(P.sorteio(chave + "h") * 15)) * 3600000);
          // Se ainda não chegou essa hora hoje, pula
          if (hora.getTime() > agora) continue;
          // Treino sorteado do catálogo
          const treino = CATALOGO[Math.floor(P.sorteio(chave + "t") * CATALOGO.length)];
          // Quantas séries fez
          const series = 10 + Math.floor(P.sorteio(chave + "s") * 14);
          // Monta o post
          lista.push({
            // id único do post
            id: chave,
            // quem fez
            amigo,
            // treino
            treino,
            // quando
            data: hora,
            // quanto tempo (minutos)
            duracao: treino.duracao + Math.round((P.sorteio(chave + "d") - 0.5) * 10),
            // séries
            series,
            // pontos (respeitando o limite do dia)
            pts: Math.min(P.LIMITE_DIA, P.TABELA.treino + series * P.TABELA.serie),
            // reações de outras pessoas (simuladas)
            outras: Math.floor(P.sorteio(chave + "r") * 12),
          });
        }
      });
      // Ordena do mais novo para o mais velho
      return lista.sort((a, b) => b.data - a.data);
    }

    // Desenha o feed
    function renderFeed() {
      // Reações que você deu
      const reacoes = storage.get("sl-reacoes", {});
      // Comentários que você fez
      const comentarios = storage.get("sl-comentarios", {});
      // Posts dos amigos (no máximo 20)
      const lista = posts().slice(0, 20);
      // Se não tem nenhum...
      if (!lista.length) {
        // ...mostra o estado vazio
        $("feed").replaceChildren(SL.estadoVazio("Seu feed está vazio", "Adicione amigos para ver os treinos deles aqui.", null));
        // ...e para
        return;
      }
      // Troca o feed
      $("feed").replaceChildren(
        // Um item para cada post
        ...lista.map((p, i) => {
          // Reação que você deu neste post (se deu)
          const minha = reacoes[p.id];
          // Comentários deste post
          const meus = comentarios[p.id] || [];
          // Item do feed
          return el("li", { class: "cm-post", style: `animation-delay: ${Math.min(i, 8) * 60}ms` }, [
            // Topo: quem e quando
            el("div", { class: "cm-post-topo" }, [
              // Bolinha com as iniciais
              el("span", { class: "rk-avatar rk-avatar-sm", "aria-hidden": "true", text: SL.initials(p.amigo.nome) }),
              // Nome e quando
              el("div", { class: "cm-post-quem" }, [
                // Nome
                el("strong", { text: p.amigo.nome }),
                // Quando e liga
                el("span", { class: "meta", text: `${SL.dataRelativa(p.data.toISOString())} às ${p.data.getHours()}h • Liga ${P.LIGAS[P.ligaSimulada(p.amigo.ritmo)].nome}` }),
              ]),
              // Escudo da liga do amigo
              P.escudo(P.ligaSimulada(p.amigo.ritmo), "liga-escudo liga-escudo-sm"),
            ]),
            // Miolo: o treino
            el("div", { class: "cm-post-treino" }, [
              // Ícone da categoria do treino
              el("span", { class: "icon-tile icon-tile-coral", "aria-hidden": "true" }, [SL.iconeCategoria(p.treino.objetivo, "icon")]),
              // Textos do treino
              el("div", {}, [
                // Nome do treino
                el("strong", { text: p.treino.nome }),
                // Detalhes
                el("span", { class: "meta", text: `${p.duracao} min • ${p.series} séries • ${p.treino.grupo}` }),
              ]),
              // Pontos que o amigo ganhou
              el("span", { class: "cm-post-pts", text: `+${p.pts}` }),
            ]),
            // Reações e botões
            el("div", { class: "cm-post-acoes" }, [
              // Um botão para cada reação
              ...REACOES.map((r) =>
                // Botão da reação (marcado se foi a sua)
                el("button", {
                  // Tipo botão
                  type: "button",
                  // Classe (marcada se escolhida)
                  class: "cm-reacao" + (minha === r.id ? " is-ativa" : ""),
                  // Ação do clique
                  "data-action": "reagir",
                  // Qual post
                  "data-post": p.id,
                  // Qual reação
                  "data-reacao": r.id,
                  // Avisa se está marcada
                  "aria-pressed": String(minha === r.id),
                  // Nome para leitores de tela
                  "aria-label": `Reagir com ${r.nome}`,
                  // Emoji
                  text: r.emoji,
                }),
              ),
              // Total de reações (as dos outros + a sua)
              el("span", { class: "meta", text: `${p.outras + (minha ? 1 : 0)} reações` }),
              // Botão de copiar o treino
              el("button", { type: "button", class: "btn-link cm-copiar", "data-action": "copiar-treino", "data-treino": p.treino.id, "data-amigo": primeiro(p.amigo.nome), text: "Copiar treino" }),
            ]),
            // Comentários que você fez
            meus.length
              ? el(
                  // Lista de comentários
                  "ul",
                  { class: "cm-comentarios" },
                  // Um item por comentário
                  meus.map((c) => el("li", {}, [el("strong", { text: "Você " }), el("span", { text: c.texto })])),
                )
              : null,
            // Formulário de comentar
            el("form", { class: "cm-comentar", "data-post": p.id }, [
              // Nome escondido do campo
              el("label", { class: "sr-only", for: "com-" + i, text: "Comentário" }),
              // Campo do comentário
              el("input", { id: "com-" + i, type: "text", maxlength: 140, placeholder: "Comente algo de boa…", autocomplete: "off" }),
              // Botão de enviar
              el("button", { type: "submit", class: "btn-secondary", text: "Enviar" }),
            ]),
          ]);
        }),
      );
    }

    // Reagir a um post (clicar de novo tira a reação)
    SL.acao("reagir", (alvo) => {
      // Reações salvas
      const reacoes = storage.get("sl-reacoes", {});
      // Post e reação clicados
      const { post, reacao } = alvo.dataset;
      // Se já era essa reação, tira; se não, troca
      reacoes[post] = reacoes[post] === reacao ? undefined : reacao;
      // Salva
      storage.set("sl-reacoes", reacoes);
      // Desenha o feed de novo
      renderFeed();
    });

    // Enviar comentário (os formulários são criados pelo JavaScript, então ouve na lista toda)
    $("feed").addEventListener("submit", (e) => {
      // Impede a página de recarregar
      e.preventDefault();
      // Campo do comentário
      const campo = e.target.querySelector("input");
      // Texto digitado, sem espaços nas pontas
      const texto = campo.value.trim();
      // Se está vazio, não faz nada
      if (!texto) return;
      // Comentários salvos
      const comentarios = storage.get("sl-comentarios", {});
      // Post comentado
      const post = e.target.dataset.post;
      // Junta o comentário novo
      comentarios[post] = (comentarios[post] || []).concat({ texto, data: new Date().toISOString() });
      // Salva
      storage.set("sl-comentarios", comentarios);
      // Desenha o feed de novo
      renderFeed();
      // Avisa
      SL.toast("Comentário enviado");
    });

    // Copiar o treino de um amigo para "Meus treinos"
    SL.acao("copiar-treino", (alvo) => {
      // Treino do catálogo
      const treino = SL.acharTreino(alvo.dataset.treino);
      // Se não achou, para
      if (!treino) return;
      // Treinos da pessoa
      const meus = SL.treinosDoUsuario();
      // Coloca uma cópia no começo da lista
      meus.unshift({
        // id novo
        id: "t" + Date.now(),
        // nome com o nome do amigo
        nome: `${treino.nome} (de ${alvo.dataset.amigo})`,
        // grupo muscular
        grupo: treino.grupo,
        // exercícios
        itens: SL.exerciciosDe(treino),
        // quantos exercícios
        exercicios: SL.exerciciosDe(treino).length,
      });
      // Salva
      storage.set("sl-treinos", meus);
      // Avisa
      SL.toast("Treino copiado para Meus treinos!");
    });

    /* ---------- Amigos ---------- */

    // Dias desde o último treino de um amigo (pelo feed)
    function diasParado(amigo, lista) {
      // Último post desse amigo
      const ultimo = lista.find((p) => p.amigo.codigo === amigo.codigo);
      // Sem post nos últimos 7 dias: 7+
      return ultimo ? Math.floor((Date.now() - ultimo.data) / DIA) : 7;
    }

    // Desenha a lista de amigos
    function renderAmigos() {
      // Posts (para saber quem está parado)
      const lista = posts();
      // Cutucadas que você deu (por código: data)
      const cutucadas = storage.get("sl-cutucadas", {});
      // Hoje
      const hoje = new Date().toDateString();
      // Troca a lista
      $("amigos").replaceChildren(
        // Um item para cada amigo
        ...P.amigos().map((a) => {
          // Dias sem treinar
          const parado = diasParado(a, lista);
          // Já cutucou hoje?
          const jaCutucou = cutucadas[a.codigo] === hoje;
          // Item do amigo
          return el("li", { class: "cm-amigo" }, [
            // Bolinha com as iniciais
            el("span", { class: "rk-avatar rk-avatar-sm", "aria-hidden": "true", text: SL.initials(a.nome) }),
            // Nome e situação
            el("div", { class: "cm-amigo-info" }, [
              // Nome
              el("strong", { text: a.nome }),
              // Código e quando treinou
              el("span", { class: "meta", text: `${a.codigo} • ${parado === 0 ? "treinou hoje" : parado >= 7 ? "sem treinar há 7+ dias" : `treinou há ${parado} dia${parado > 1 ? "s" : ""}`}` }),
            ]),
            // Botões
            el("div", { class: "cm-amigo-botoes" }, [
              // Cutucar (só para quem está parado há 2+ dias)
              parado >= 2
                ? el("button", { type: "button", class: "btn-secondary", "data-action": "cutucar", "data-codigo": a.codigo, disabled: jaCutucou, text: jaCutucou ? "Cutucado ✓" : "👉 Bora treinar!" })
                : null,
              // Mandar mensagem
              el("button", { type: "button", class: "btn-icon btn-outline", "data-action": "abrir-chat", "data-codigo": a.codigo, "aria-label": `Mandar mensagem para ${a.nome}` }, [
                // Ícone de balão
                icone(["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"]),
              ]),
              // Remover amigo
              el("button", { type: "button", class: "btn-icon btn-outline btn-danger", "data-action": "remover-amigo", "data-codigo": a.codigo, "aria-label": `Remover ${a.nome} dos amigos` }, [SL.iconeLixeira()]),
            ]),
          ]);
        }),
      );
      // Se não tem amigos, mostra o estado vazio
      if (!P.amigos().length) $("amigos").append(SL.estadoVazio("Nenhum amigo ainda", "Procure pelo código, ID ou nome, ou mande seu link de convite.", null));
    }

    // Procura pessoas para adicionar
    function procurar(termo) {
      // Termo em minúsculas e sem espaços nas pontas
      const t = termo.trim().toLowerCase();
      // Se está vazio, limpa os resultados
      if (!t) return $("resultados").replaceChildren();
      // Códigos dos amigos atuais
      const meus = P.amigos().map((a) => a.codigo);
      // Pessoas que batem com o código, o ID ou o nome
      const achados = P.PESSOAS.filter((p) => p.codigo.toLowerCase() === t || idDe(p.codigo) === t || p.nome.toLowerCase().includes(t));
      // Se ninguém bateu...
      if (!achados.length) {
        // ...avisa
        $("resultados").replaceChildren(el("li", { class: "meta", text: `Ninguém encontrado para "${termo.trim()}".` }));
        // ...e para
        return;
      }
      // Mostra os achados
      $("resultados").replaceChildren(
        // Um item para cada pessoa
        ...achados.map((p) =>
          // Item
          el("li", { class: "cm-amigo" }, [
            // Bolinha
            el("span", { class: "rk-avatar rk-avatar-sm", "aria-hidden": "true", text: SL.initials(p.nome) }),
            // Nome e código
            el("div", { class: "cm-amigo-info" }, [el("strong", { text: p.nome }), el("span", { class: "meta", text: `${p.codigo} • ID ${idDe(p.codigo)}` })]),
            // Botão de adicionar (ou "já é amigo")
            meus.includes(p.codigo)
              ? el("span", { class: "tag tag-success", text: "Já é amigo" })
              : el("button", { type: "button", class: "btn-primary", "data-action": "adicionar-amigo", "data-codigo": p.codigo, text: "Adicionar" }),
          ]),
        ),
      );
    }

    // Formulário de procurar amigo
    $("form-amigo").addEventListener("submit", (e) => {
      // Impede a página de recarregar
      e.preventDefault();
      // Procura o que foi digitado
      procurar(document.getElementById("busca-amigo").value);
    });

    // Adicionar amigo
    SL.acao("adicionar-amigo", (alvo) => {
      // Pessoa clicada
      const pessoa = P.PESSOAS.find((p) => p.codigo === alvo.dataset.codigo);
      // Adiciona; se deu certo, avisa
      if (P.adicionarAmigo(alvo.dataset.codigo)) SL.toast(`${primeiro(pessoa.nome)} agora é seu amigo!`);
      // Atualiza a busca
      procurar(document.getElementById("busca-amigo").value);
    });

    // Remover amigo (com confirmação)
    SL.acao("remover-amigo", (alvo) => {
      // Pessoa clicada
      const pessoa = P.PESSOAS.find((p) => p.codigo === alvo.dataset.codigo);
      // Pergunta antes
      SL.confirmar({
        // Título
        titulo: `Remover ${primeiro(pessoa.nome)}?`,
        // Texto
        texto: "Vocês deixam de aparecer no ranking e no feed um do outro.",
        // Botão
        rotulo: "Remover",
        // Botão vermelho
        perigo: true,
        // Se confirmar, remove
        fn: () => P.removerAmigo(pessoa.codigo),
      });
    });

    // Cutucar um amigo parado
    SL.acao("cutucar", (alvo) => {
      // Cutucadas salvas
      const cutucadas = storage.get("sl-cutucadas", {});
      // Marca a de hoje
      cutucadas[alvo.dataset.codigo] = new Date().toDateString();
      // Salva
      storage.set("sl-cutucadas", cutucadas);
      // Pessoa
      const pessoa = P.PESSOAS.find((p) => p.codigo === alvo.dataset.codigo);
      // Avisa
      SL.toast(`Você cutucou ${primeiro(pessoa.nome)}: "Bora treinar!"`);
      // Desenha de novo
      renderAmigos();
    });

    /* ---------- Desafios ---------- */

    // Tipos de desafio
    const TIPOS = {
      // Treinos no período
      treinos: { nome: "Treinos", unidade: "treinos" },
      // Pontos no período
      pontos: { nome: "Pontos", unidade: "pontos" },
      // Dias batendo a meta de água
      agua: { nome: "Dias de água", unidade: "dias" },
    };

    // Desafios salvos (na primeira vez, cria dois de exemplo)
    function desafios() {
      // Lê os salvos
      let lista = storage.get("sl-desafios", null);
      // Primeira vez...
      if (!lista) {
        // Período da semana atual
        const semana = P.periodo("semana");
        // Período do mês atual
        const mes = P.periodo("mes");
        // Dois desafios de exemplo
        lista = [
          // Desafio de uma amiga, do qual você já participa
          { id: "d-ana", nome: "Semana dos 1.000 pontos", tipo: "pontos", meta: 1000, ini: semana.ini, fim: semana.fim, criador: "ANA-3107", participantes: ["ANA-3107", "RAFA-2290", "CAMI-4415"], euDentro: true },
          // Desafio da academia, que você ainda não entrou
          { id: "d-academia", nome: "Mês sem falta", tipo: "treinos", meta: 12, ini: mes.ini, fim: mes.fim, criador: "academia", participantes: ["RAFA-2290", "DIEGO-7781", "JU-5520", "MARCOS-8812"], euDentro: false },
        ];
        // Salva
        storage.set("sl-desafios", lista);
      }
      // Devolve
      return lista;
    }

    // Progresso de alguém num desafio
    function progresso(d, pessoa) {
      // Até agora (ou até o fim, se já acabou)
      const ate = Math.min(Date.now(), d.fim);
      // Você: progresso de verdade
      if (!pessoa) {
        // Pontos no período
        if (d.tipo === "pontos") return P.somar(d.ini, ate);
        // Treinos no período
        if (d.tipo === "treinos") return SL.historico().filter((h) => new Date(h.data) >= d.ini && new Date(h.data) < ate).length;
        // Dias com a meta de água no período
        return new Set(P.eventos().filter((e) => e.tipo === "agua" && new Date(e.data) >= d.ini).map((e) => P.diaDe(e.data))).size;
      }
      // Amigo: pontos simulados
      if (d.tipo === "pontos") return P.pontosSimulados(pessoa, d.ini, ate);
      // Parte do período que já passou
      const fracao = Math.max(0, Math.min(1, (ate - d.ini) / (d.fim - d.ini)));
      // Amigo: progresso simulado pela meta e pelo ritmo
      return Math.round(d.meta * fracao * (0.4 + P.sorteio(pessoa.codigo + d.id) * 0.9) * (pessoa.ritmo / 600));
    }

    // Desenha os desafios
    function renderDesafios() {
      // Troca a lista
      $("desafios").replaceChildren(
        // Um card para cada desafio
        ...desafios().map((d) => {
          // Participantes: você (se está dentro) + os outros
          const pessoas = d.participantes.map((c) => P.PESSOAS.find((p) => p.codigo === c)).filter(Boolean);
          // Linhas de progresso de cada um
          const linhas = pessoas.map((p) => ({ nome: p.nome, valor: progresso(d, p), eu: false }));
          // Se você está dentro, entra também
          if (d.euDentro) linhas.push({ nome: "Você", valor: progresso(d, null), eu: true });
          // Ordena do maior para o menor
          linhas.sort((a, b) => b.valor - a.valor);
          // Dias que faltam
          const faltam = Math.max(0, Math.ceil((d.fim - Date.now()) / DIA));
          // Quem criou
          const criador = d.criador === "academia" ? "Academia" : d.criador === "eu" ? "Você" : primeiro((P.PESSOAS.find((p) => p.codigo === d.criador) || { nome: "Amigo" }).nome);
          // Card do desafio
          return el("article", { class: "cm-desafio" + (d.euDentro ? " is-dentro" : "") }, [
            // Topo
            el("div", { class: "cm-desafio-topo" }, [
              // Título e quem criou
              el("div", {}, [
                // Nome
                el("h3", { text: d.nome }),
                // Detalhes
                el("p", { class: "meta", text: `Criado por ${criador} • meta: ${SL.num(d.meta)} ${TIPOS[d.tipo].unidade} • ${faltam ? `termina em ${faltam} dia${faltam > 1 ? "s" : ""}` : "terminado"}` }),
              ]),
              // Etiqueta do tipo
              el("span", { class: "tag", text: TIPOS[d.tipo].nome }),
            ]),
            // Barras de progresso de cada participante
            el(
              // Lista
              "ol",
              { class: "cm-barras" },
              // Uma linha por pessoa (no máximo 6)
              linhas.slice(0, 6).map((l) =>
                // Linha (destacada se for você)
                el("li", { class: l.eu ? "is-eu" : "" }, [
                  // Nome
                  el("span", { class: "cm-barras-nome", text: l.eu ? "Você" : primeiro(l.nome) }),
                  // Barra
                  el("div", { class: "progress-bar-sm" + (l.valor >= d.meta ? " progress-emerald" : ""), role: "progressbar", "aria-label": `Progresso de ${l.nome}`, "aria-valuenow": Math.min(100, Math.round((l.valor / d.meta) * 100)), "aria-valuemin": 0, "aria-valuemax": 100 }, [
                    // Parte pintada
                    el("div", { class: "fill", "data-progress": Math.min(100, Math.round((l.valor / d.meta) * 100)) }),
                  ]),
                  // Valor
                  el("strong", { text: `${SL.num(l.valor)}${l.valor >= d.meta ? " ✓" : ""}` }),
                ]),
              ),
            ),
            // Botão de entrar ou sair
            el("button", { type: "button", class: d.euDentro ? "btn-secondary" : "btn-primary", "data-action": "entrar-desafio", "data-id": d.id, text: d.euDentro ? "Sair do desafio" : "Participar" }),
          ]);
        }),
      );
      // Pinta as barras
      SL.aplicarProgresso();
    }

    // Entrar ou sair de um desafio
    SL.acao("entrar-desafio", (alvo) => {
      // Lista de desafios
      const lista = desafios();
      // Desafio clicado
      const d = lista.find((x) => x.id === alvo.dataset.id);
      // Troca: dentro ↔ fora
      d.euDentro = !d.euDentro;
      // Salva
      storage.set("sl-desafios", lista);
      // Avisa
      SL.toast(d.euDentro ? "Você entrou no desafio. Bora!" : "Você saiu do desafio");
      // Desenha de novo
      renderDesafios();
    });

    // Criar desafio (no plano Free, 1 desafio criado por vez)
    SL.acao("criar-desafio", () => {
      // Plano da pessoa (padrão: Free)
      const plano = storage.get("sl-plano", "Free");
      // Desafios ativos criados por você
      const meusAtivos = desafios().filter((d) => d.criador === "eu" && d.fim > Date.now());
      // No Free, só 1 por vez
      if (plano === "Free" && meusAtivos.length >= 1) {
        // Avisa e oferece o Premium
        SL.confirmar({
          // Título
          titulo: "Limite do plano Free",
          // Texto
          texto: `No Free você cria 1 desafio por vez ("${meusAtivos[0].nome}" ainda está valendo). No Premium é sem limite.`,
          // Botão
          rotulo: "Ver planos",
          // Leva para os planos
          fn: () => (window.location.href = "../planos/planos.html"),
        });
        // Para
        return;
      }
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Nome do desafio
        SL.campo("des-nome", "Nome do desafio", { placeholder: "Ex: Quem treina mais na semana", required: true, maxlength: 40 }),
        // Linha com dois campos
        el("div", { class: "form-row" }, [
          // Tipo
          el("div", { class: "form-group" }, [
            // Nome do campo
            el("label", { for: "des-tipo", text: "Contar" }),
            // Caixa de seleção
            el("select", { id: "des-tipo", class: "cm-select" }, Object.entries(TIPOS).map(([id, t]) => el("option", { value: id, text: t.nome }))),
          ]),
          // Meta
          SL.campo("des-meta", "Meta", { type: "number", min: 1, max: 5000, required: true }),
        ]),
        // Duração
        el("div", { class: "form-group" }, [
          // Nome do campo
          el("label", { for: "des-dias", text: "Duração" }),
          // Caixa de seleção
          el("select", { id: "des-dias", class: "cm-select" }, [el("option", { value: 7, text: "1 semana" }), el("option", { value: 30, text: "1 mês" })]),
        ]),
        // Amigos convidados
        el("fieldset", { class: "cm-convidar" }, [
          // Título do grupo
          el("legend", { text: "Convidar amigos" }),
          // Uma caixinha para cada amigo
          ...P.amigos().map((a) => el("label", { class: "check-row" }, [el("input", { type: "checkbox", value: a.codigo, checked: true }), " " + a.nome])),
        ]),
        // Botão de criar
        el("button", { type: "submit", class: "btn-primary", text: "Criar desafio" }),
      ]);
      // Meta padrão
      form.querySelector("#des-meta").value = 4;
      // Quando troca o tipo, sugere uma meta
      form.querySelector("#des-tipo").addEventListener("change", (e) => {
        // Treinos: 4; pontos: 1000; água: 5
        form.querySelector("#des-meta").value = { treinos: 4, pontos: 1000, agua: 5 }[e.target.value];
      });
      // Quando envia...
      form.addEventListener("submit", (e) => {
        // ...impede a página de recarregar
        e.preventDefault();
        // ...lê o nome
        const nome = form.querySelector("#des-nome").value.trim();
        // ...se está vazio, foca e para
        if (!nome) return form.querySelector("#des-nome").focus();
        // ...agora
        const agora = Date.now();
        // ...monta o desafio
        const novo = {
          // id
          id: "d" + agora,
          // nome
          nome,
          // tipo
          tipo: form.querySelector("#des-tipo").value,
          // meta (pelo menos 1)
          meta: Math.max(1, Number(form.querySelector("#des-meta").value) || 1),
          // começa agora
          ini: agora,
          // termina daqui a 7 ou 30 dias
          fim: agora + Number(form.querySelector("#des-dias").value) * DIA,
          // você criou
          criador: "eu",
          // amigos marcados
          participantes: [...form.querySelectorAll(".cm-convidar input:checked")].map((c) => c.value),
          // você está dentro
          euDentro: true,
        };
        // ...salva no começo da lista
        storage.set("sl-desafios", [novo].concat(desafios()));
        // ...fecha o modal
        SL.closeModal();
        // ...desenha de novo
        renderDesafios();
        // ...e avisa
        SL.toast("Desafio criado! Seus amigos foram convidados.");
      });
      // Abre o modal
      SL.openModal("Criar desafio", form);
    });

    /* ---------- Mensagens ---------- */

    // Conversas salvas: { codigo: [{ eu, texto, data }] }
    const conversas = () => storage.get("sl-mensagens", {});

    // Desenha a lista de conversas
    function renderConversas() {
      // Conversas salvas
      const todas = conversas();
      // Troca a lista
      $("conversas").replaceChildren(
        // Um item para cada amigo
        ...P.amigos().map((a) => {
          // Mensagens com esse amigo
          const msgs = todas[a.codigo] || [];
          // Última mensagem
          const ultima = msgs[msgs.length - 1];
          // Item (é um botão que abre a conversa)
          return el("li", {}, [
            // Botão
            el("button", { type: "button", class: "cm-conversa", "data-action": "abrir-chat", "data-codigo": a.codigo }, [
              // Bolinha
              el("span", { class: "rk-avatar rk-avatar-sm", "aria-hidden": "true", text: SL.initials(a.nome) }),
              // Nome e última mensagem
              el("span", { class: "cm-amigo-info" }, [el("strong", { text: a.nome }), el("span", { class: "meta", text: ultima ? `${ultima.eu ? "Você: " : ""}${ultima.texto}` : "Comece uma conversa" })]),
            ]),
          ]);
        }),
      );
    }

    // Abre o chat com um amigo (o chat fica no núcleo: SL.abrirChat)
    SL.acao("abrir-chat", (alvo) => {
      // Pessoa
      const pessoa = P.PESSOAS.find((p) => p.codigo === alvo.dataset.codigo);
      // Abre a conversa, com as respostas dos amigos, e atualiza a lista depois
      SL.abrirChat({ chave: pessoa.codigo, nome: pessoa.nome, respostas: RESPOSTAS, aoEnviar: renderConversas });
    });

    /* ---------- Abas ---------- */

    // Abre uma aba
    function abrirAba(nome) {
      // Para cada botão de aba...
      document.querySelectorAll("[data-aba]").forEach((b) => {
        // ...vê se é a escolhida
        const ativa = b.dataset.aba === nome;
        // ...avisa os leitores de tela
        b.setAttribute("aria-selected", String(ativa));
        // ...e mostra ou esconde o painel dela
        document.getElementById("painel-" + b.dataset.aba).hidden = !ativa;
      });
    }

    // Clique nas abas
    document.querySelector(".cm-abas").addEventListener("click", (e) => {
      // Botão clicado
      const b = e.target.closest("[data-aba]");
      // Se foi numa aba, abre
      if (b) abrirAba(b.dataset.aba);
    });

    /* ---------- Começo ---------- */

    // Desenha tudo
    function render() {
      // Perfil
      renderPerfil();
      // Feed
      renderFeed();
      // Amigos
      renderAmigos();
      // Desafios
      renderDesafios();
      // Conversas
      renderConversas();
    }

    // Se veio por um link de convite (?add=CODIGO), adiciona o amigo
    const convite = new URLSearchParams(window.location.search).get("add");
    // Se tem convite...
    if (convite) {
      // ...pessoa do convite
      const pessoa = P.PESSOAS.find((p) => p.codigo === convite.toUpperCase());
      // ...se existe e foi adicionada, avisa
      if (pessoa && P.adicionarAmigo(pessoa.codigo)) SL.toast(`${primeiro(pessoa.nome)} agora é seu amigo!`);
      // ...abre a aba de amigos
      abrirAba("amigos");
    }
    // Se veio pelo link das mensagens (#mensagens), abre essa aba
    if (window.location.hash === "#mensagens") abrirAba("mensagens");

    // Quando os amigos mudam, desenha de novo
    document.addEventListener("sl:pontos", render);
    // Desenha a primeira vez
    render();
  });
