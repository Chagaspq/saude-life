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
      { id: "fogo", icone: "fogo", nome: "Fogo" },
      // Palmas
      { id: "palmas", icone: "joinha", nome: "Joinha" },
      // Força
      { id: "forca", icone: "haltere", nome: "Força" },
    ];

    // Respostas automáticas dos amigos no chat (simuladas)
    const RESPOSTAS = [
      // Resposta 1
      "Bora! Hoje é dia de treino.",
      // Resposta 2
      "Fechou! Te encontro na academia às 18h?",
      // Resposta 3
      "Valeu pela força! Bati minha meta hoje.",
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
      // Ao clicar, abre o modal de convite
      btnLink.addEventListener("click", abrirConvite);
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

    // Modal de convite: link, QR code e WhatsApp
    function abrirConvite() {
      // Link de convite
      const link = meuLink();
      // Texto do convite
      const texto = `Bora treinar comigo no Saúde Life? Entrando pelo meu link você ganha 50 pontos: ${link}`;
      // Campo com o link (só leitura, para copiar)
      const campo = el("input", { type: "text", class: "cm-convite-link", readonly: true, value: link, "aria-label": "Seu link de convite" });
      // QR code do link (gerado por um serviço de QR; se estiver sem internet, some)
      const qr = el("img", { class: "cm-convite-qr", width: 180, height: 180, alt: "QR code do seu link de convite", src: "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=" + encodeURIComponent(link) });
      // Se o QR não carregar (sem internet), esconde
      qr.addEventListener("error", () => (qr.hidden = true));
      // Botão de copiar
      const btnCopiar = el("button", { type: "button", class: "btn-secondary", text: "Copiar link" });
      // Ao clicar, copia
      btnCopiar.addEventListener("click", () => copiar(link, "Link copiado!"));
      // Link do WhatsApp com a mensagem pronta
      const whats = el("a", { class: "btn-primary", href: "https://wa.me/?text=" + encodeURIComponent(texto), target: "_blank", rel: "noopener", text: "Mandar no WhatsApp" });
      // Botão de compartilhar do celular (só se o navegador souber)
      const btnShare = navigator.share ? el("button", { type: "button", class: "btn-secondary", text: "Outros apps" }) : null;
      // Ao clicar, abre a janela de compartilhar
      if (btnShare) btnShare.addEventListener("click", () => navigator.share({ title: "Saúde Life", text: texto }).catch(() => {}));
      // Abre o modal
      SL.openModal("Convidar amigo", [
        // Explicação
        el("p", { class: "meta", text: "Quem entrar pelo seu link ganha 50 pontos e já vira seu amigo." }),
        // QR code
        el("div", { class: "cm-convite-qr-caixa" }, [qr]),
        // Link
        campo,
        // Botões
        el("div", { class: "cm-convite-botoes" }, [whats, btnCopiar, btnShare]),
      ]);
    }

    /* ---------- Bloqueios, posts ocultos e denúncias ---------- */

    // Pessoas bloqueadas (códigos)
    const bloqueados = () => storage.get("sl-bloqueados", []);
    // Posts que a pessoa escondeu (ids)
    const ocultos = () => storage.get("sl-ocultos", []);
    // Acha uma pessoa pelo código
    const pessoaDe = (codigo) => P.PESSOAS.find((p) => p.codigo === codigo);

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
            // tipo do post
            tipo: "treino",
          });
          // Às vezes o treino teve recorde: vira outro post
          if (P.sorteio(chave + "rec") < 0.25) {
            // Nomes dos exercícios do catálogo
            const nomes = Object.keys(window.SL_EXERCICIOS || {});
            // Exercício sorteado
            const exercicio = nomes[Math.floor(P.sorteio(chave + "ex") * nomes.length)] || "Supino reto";
            // Post do recorde (uns minutos depois do treino)
            lista.push({ id: chave + "-rec", amigo, tipo: "recorde", data: new Date(hora.getTime() + 60000), exercicio, kg: 10 + Math.round(P.sorteio(chave + "kg") * 18) * 5, outras: Math.floor(P.sorteio(chave + "r2") * 15) });
          }
        }
        // Refeição com foto (uma por dia, às vezes)
        for (let d = 0; d < 7; d++) {
          // Chave da refeição
          const chave = amigo.codigo + "ref" + new Date(agora - d * DIA).toDateString();
          // Só em parte dos dias
          if (P.sorteio(chave) > 0.3) continue;
          // Começo do dia
          const dia = new Date(agora - d * DIA);
          // Zera o horário
          dia.setHours(12, 30, 0, 0);
          // Se ainda não chegou essa hora hoje, pula
          if (dia.getTime() > agora) continue;
          // Pratos possíveis
          const PRATOS = [["Almoço", "Frango, arroz integral e salada", 620], ["Almoço", "Peixe com legumes", 540], ["Lanche", "Iogurte com granola e banana", 320], ["Jantar", "Omelete com espinafre", 410]];
          // Prato sorteado
          const [refeicao, prato, kcal] = PRATOS[Math.floor(P.sorteio(chave + "p") * PRATOS.length)];
          // Post da refeição
          lista.push({ id: chave, amigo, tipo: "refeicao", data: dia, refeicao, prato, kcal, outras: Math.floor(P.sorteio(chave + "r") * 9) });
        }
        // Subiu de liga (uma vez na semana, para alguns amigos)
        if (P.sorteio(amigo.codigo + P.periodo("semana").ini) < 0.3) {
          // Dia da subida (entre hoje e 6 dias atrás)
          const d = Math.floor(P.sorteio(amigo.codigo + "liga") * 7);
          // Quando
          const data = new Date(agora - d * DIA - 3 * 3600000);
          // Liga do amigo
          const liga = P.ligaSimulada(amigo.ritmo);
          // Só se não for a primeira liga
          if (liga > 0) lista.push({ id: amigo.codigo + "liga" + d, amigo, tipo: "liga", data, liga, outras: Math.floor(P.sorteio(amigo.codigo + "lr") * 20) });
        }
      });
      // Tira bloqueados e posts escondidos
      const fora = bloqueados();
      // Escondidos
      const esc = ocultos();
      // Ordena do mais novo para o mais velho
      return lista.filter((p) => !fora.includes(p.amigo.codigo) && !esc.includes(p.id)).sort((a, b) => b.data - a.data);
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
                // Nome (botão que abre o perfil)
                el("button", { type: "button", class: "cm-nome", "data-action": "ver-perfil", "data-codigo": p.amigo.codigo, text: p.amigo.nome }),
                // Quando e liga
                el("span", { class: "meta", text: `${SL.dataRelativa(p.data.toISOString())} às ${p.data.getHours()}h • Liga ${P.LIGAS[P.ligaSimulada(p.amigo.ritmo)].nome}` }),
              ]),
              // Escudo da liga do amigo
              P.escudo(P.ligaSimulada(p.amigo.ritmo), "liga-escudo liga-escudo-sm"),
              // Menu do post (ocultar, denunciar, bloquear)
              el("button", { type: "button", class: "btn-icon cm-post-menu", "data-action": "menu-post", "data-post": p.id, "data-codigo": p.amigo.codigo, "aria-label": `Opções do post de ${primeiro(p.amigo.nome)}` }, [icone(["M5 12h.01", "M12 12h.01", "M19 12h.01"])]),
            ]),
            // Miolo: muda conforme o tipo do post
            miolo(p),
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
                  // Ícone da reação (desenhado em SVG)
                }, [SL.icone(SL.ICONES[r.icone])]),
              ),
              // Total de reações (as dos outros + a sua)
              el("span", { class: "meta", text: `${p.outras + (minha ? 1 : 0)} reações` }),
              // Botão de copiar o treino (só nos posts de treino)
              p.tipo === "treino" ? el("button", { type: "button", class: "btn-link cm-copiar", "data-action": "copiar-treino", "data-treino": p.treino.id, "data-amigo": primeiro(p.amigo.nome), text: "Copiar treino" }) : null,
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

    // Miolo do post conforme o tipo: treino, recorde, refeição ou liga
    function miolo(p) {
      // Recorde de carga
      if (p.tipo === "recorde")
        return el("div", { class: "cm-post-treino cm-post-recorde" }, [
          // Troféu
          el("span", { class: "icon-tile icon-tile-star", "aria-hidden": "true" }, [icone(ICONES.trofeu)]),
          // Textos
          el("div", {}, [el("strong", { text: `Novo recorde: ${p.exercicio}` }), el("span", { class: "meta", text: `${p.kg} kg • bateu a própria marca` })]),
          // Pontos do recorde
          el("span", { class: "cm-post-pts", text: `+${P.TABELA.recorde}` }),
        ]);
      // Refeição com foto (a "foto" é um prato desenhado)
      if (p.tipo === "refeicao")
        return el("div", { class: "cm-post-refeicao" }, [
          // Foto do prato
          el("div", { class: "cm-post-foto", role: "img", "aria-label": `Foto do prato: ${p.prato}` }, [icone(ICONES.talheres)]),
          // Textos
          el("div", {}, [el("strong", { text: `${p.refeicao}: ${p.prato}` }), el("span", { class: "meta", text: `${SL.num(p.kcal)} kcal` })]),
        ]);
      // Subiu de liga
      if (p.tipo === "liga")
        return el("div", { class: "cm-post-treino cm-post-liga" }, [
          // Escudo da liga nova
          P.escudo(p.liga, "liga-escudo"),
          // Textos
          el("div", {}, [el("strong", { text: `Subiu para a liga ${P.LIGAS[p.liga].nome}!` }), el("span", { class: "meta", text: "Mande um parabéns" })]),
        ]);
      // Treino (padrão)
      return el("div", { class: "cm-post-treino" }, [
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
      ]);
    }

    // Menu de um post: ver perfil, esconder, denunciar e bloquear
    SL.acao("menu-post", (alvo) => {
      // Post e pessoa
      const { post, codigo } = alvo.dataset;
      // Pessoa
      const pessoa = pessoaDe(codigo);
      // Botão de cada opção
      const opcao = (texto, acao, perigo) => el("button", { type: "button", class: perigo ? "btn-secondary btn-danger" : "btn-secondary", "data-action": acao, "data-post": post, "data-codigo": codigo, text: texto });
      // Abre o modal com as opções
      SL.openModal(`Post de ${primeiro(pessoa.nome)}`, [
        // Lista de opções
        el("div", { class: "cm-menu-opcoes" }, [
          // Ver perfil
          opcao("Ver perfil", "ver-perfil"),
          // Esconder este post
          opcao("Esconder este post", "ocultar-post"),
          // Denunciar
          opcao("Denunciar", "denunciar", true),
          // Bloquear
          opcao(`Bloquear ${primeiro(pessoa.nome)}`, "bloquear", true),
        ]),
      ]);
    });

    // Esconder um post do feed
    SL.acao("ocultar-post", (alvo) => {
      // Junta o id na lista de escondidos
      storage.set("sl-ocultos", ocultos().concat(alvo.dataset.post));
      // Fecha o modal
      SL.closeModal();
      // Desenha o feed
      renderFeed();
      // Avisa
      SL.toast("Post escondido");
    });

    // Denunciar: escolhe o motivo e envia
    SL.acao("denunciar", (alvo) => {
      // Pessoa
      const pessoa = pessoaDe(alvo.dataset.codigo);
      // Motivos
      const MOTIVOS = ["Conteúdo ofensivo", "Spam ou propaganda", "Informação falsa de saúde", "Perfil falso", "Outro motivo"];
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Grupo de opções
        el("fieldset", { class: "cm-motivos" }, [
          // Título
          el("legend", { text: "Qual o problema?" }),
          // Uma opção por motivo
          ...MOTIVOS.map((m, i) => el("label", { class: "check-row" }, [el("input", { type: "radio", name: "motivo", value: m, checked: i === 0 }), " " + m])),
        ]),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Enviar denúncia" }),
      ]);
      // Ao enviar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...guarda a denúncia (sem servidor, fica salva para a equipe ver quando tiver)
        storage.set("sl-denuncias", storage.get("sl-denuncias", []).concat({ codigo: pessoa.codigo, post: alvo.dataset.post || null, motivo: form.querySelector("input:checked").value, data: new Date().toISOString() }));
        // ...esconde o post denunciado
        if (alvo.dataset.post) storage.set("sl-ocultos", ocultos().concat(alvo.dataset.post));
        // ...fecha
        SL.closeModal();
        // ...desenha
        renderFeed();
        // ...avisa
        SL.toast("Denúncia enviada. Obrigado por avisar!");
      });
      // Abre o modal
      SL.openModal(`Denunciar ${primeiro(pessoa.nome)}`, form);
    });

    // Bloquear: some do feed, dos amigos e das buscas
    SL.acao("bloquear", (alvo) => {
      // Pessoa
      const pessoa = pessoaDe(alvo.dataset.codigo);
      // Confirma
      SL.confirmar({
        // Título
        titulo: `Bloquear ${primeiro(pessoa.nome)}?`,
        // Texto
        texto: "A pessoa sai dos seus amigos e não aparece mais no feed nem nas buscas. Dá para desbloquear na aba Amigos.",
        // Botão
        rotulo: "Bloquear",
        // Vermelho
        perigo: true,
        // Se confirmar...
        fn: () => {
          // ...junta na lista de bloqueados
          storage.set("sl-bloqueados", bloqueados().concat(pessoa.codigo));
          // ...remove dos amigos (isso desenha tudo de novo)
          P.removerAmigo(pessoa.codigo);
          // ...avisa
          SL.toast(`${primeiro(pessoa.nome)} foi bloqueado`);
        },
      });
    });

    // Desbloquear
    SL.acao("desbloquear", (alvo) => {
      // Tira da lista
      storage.set("sl-bloqueados", bloqueados().filter((c) => c !== alvo.dataset.codigo));
      // Desenha tudo
      render();
      // Avisa
      SL.toast("Desbloqueado");
    });

    /* ---------- Perfil público de um amigo ---------- */

    // Abre o perfil de alguém
    SL.acao("ver-perfil", (alvo) => {
      // Pessoa
      const pessoa = pessoaDe(alvo.dataset.codigo);
      // Se não achou, para
      if (!pessoa) return;
      // Período da semana
      const semana = P.periodo("semana");
      // Posts da pessoa (últimos 7 dias)
      const dela = posts().filter((p) => p.amigo.codigo === pessoa.codigo);
      // Treinos dela
      const treinos = dela.filter((p) => p.tipo === "treino");
      // Liga dela
      const liga = P.ligaSimulada(pessoa.ritmo);
      // É amigo?
      const amigo = P.amigos().some((a) => a.codigo === pessoa.codigo);
      // Abre o modal
      SL.openModal(pessoa.nome, [
        // Topo: bolinha, código e liga
        el("div", { class: "cm-perfil-pub" }, [
          // Bolinha
          el("span", { class: "rk-avatar", "aria-hidden": "true", text: SL.initials(pessoa.nome) }),
          // Código e liga
          el("div", {}, [el("strong", { text: pessoa.codigo }), el("span", { class: "meta", text: `Liga ${P.LIGAS[liga].nome}` })]),
          // Escudo
          P.escudo(liga, "liga-escudo"),
        ]),
        // Números
        el("div", { class: "cm-perfil-numeros" }, [
          // Pontos na semana
          el("div", {}, [el("strong", { text: SL.num(P.pontosSimulados(pessoa, semana.ini, Date.now())) }), el("span", { class: "meta", text: "pontos na semana" })]),
          // Treinos em 7 dias
          el("div", {}, [el("strong", { text: String(treinos.length) }), el("span", { class: "meta", text: "treinos em 7 dias" })]),
          // Recordes em 7 dias
          el("div", {}, [el("strong", { text: String(dela.filter((p) => p.tipo === "recorde").length) }), el("span", { class: "meta", text: "recordes" })]),
        ]),
        // Últimos treinos
        el("h3", { class: "cm-perfil-sub", text: "Últimos treinos" }),
        treinos.length
          ? el("ul", { class: "cm-perfil-treinos" }, treinos.slice(0, 3).map((t) => el("li", {}, [el("strong", { text: t.treino.nome }), el("span", { class: "meta", text: ` • ${SL.dataRelativa(t.data.toISOString())}` })])))
          : el("p", { class: "meta", text: "Nenhum treino nos últimos 7 dias." }),
        // Botões
        el("div", { class: "cm-convite-botoes" }, [
          // Mensagem ou adicionar
          amigo
            ? el("button", { type: "button", class: "btn-primary", "data-action": "abrir-chat", "data-codigo": pessoa.codigo, text: "Mandar mensagem" })
            : el("button", { type: "button", class: "btn-primary", "data-action": "adicionar-amigo", "data-codigo": pessoa.codigo, text: "Adicionar amigo" }),
          // Duelo (só amigos)
          amigo ? el("button", { type: "button", class: "btn-secondary", "data-action": "duelo", "data-codigo": pessoa.codigo, text: "Duelo" }) : null,
        ]),
      ]);
    });

    /* ---------- Treinando agora (ao vivo, simulado) ---------- */

    // Amigos treinando agora: muda a cada hora, de forma fixa (sorteio)
    function treinandoAgora() {
      // Hora atual
      const agora = new Date();
      // Chave da hora
      const hora = agora.toDateString() + agora.getHours();
      // Só entre 6h e 22h
      if (agora.getHours() < 6 || agora.getHours() >= 22) return [];
      // Amigos que caíram no sorteio desta hora (e não estão bloqueados)
      return P.amigos()
        .filter((a) => !bloqueados().includes(a.codigo) && P.sorteio(a.codigo + hora) < a.ritmo / 2200)
        .map((a) => ({
          // Amigo
          amigo: a,
          // Treino sorteado
          treino: CATALOGO[Math.floor(P.sorteio(a.codigo + hora + "t") * CATALOGO.length)],
          // Começou há quantos minutos (5 a 40)
          ha: 5 + Math.floor(P.sorteio(a.codigo + hora + "m") * 36),
        }));
    }

    // Desenha a faixa "treinando agora"
    function renderAoVivo() {
      // Lista
      const lista = treinandoAgora();
      // Lugar da faixa
      const caixa = $("ao-vivo");
      // Sem ninguém: esconde
      caixa.hidden = !lista.length;
      // Troca o conteúdo
      caixa.replaceChildren(
        // Título com bolinha piscando
        el("p", { class: "cm-ao-vivo-titulo" }, [el("span", { class: "cm-ao-vivo-ponto", "aria-hidden": "true" }), "Treinando agora"]),
        // Um cartãozinho por amigo
        el(
          "ul",
          { class: "cm-ao-vivo-lista" },
          lista.map((x) =>
            el("li", {}, [
              // Bolinha
              el("span", { class: "rk-avatar rk-avatar-sm", "aria-hidden": "true", text: SL.initials(x.amigo.nome) }),
              // Nome e treino
              el("span", { class: "cm-amigo-info" }, [el("strong", { text: primeiro(x.amigo.nome) }), el("span", { class: "meta", text: `${x.treino.nome} • há ${x.ha} min` })]),
              // Botão de treinar junto
              el("button", { type: "button", class: "btn-secondary btn-sm", "data-action": "treinar-junto", "data-codigo": x.amigo.codigo, text: "Treinar junto" }),
            ]),
          ),
        ),
      );
    }

    // Treinar junto: mostra o progresso do amigo "ao vivo" e deixa começar o mesmo treino
    SL.acao("treinar-junto", (alvo) => {
      // Dados do amigo treinando
      const x = treinandoAgora().find((t) => t.amigo.codigo === alvo.dataset.codigo);
      // Se parou de treinar, avisa
      if (!x) return SL.toast("Ele acabou de terminar o treino");
      // Total de séries do treino
      const total = SL.exerciciosDe(x.treino).reduce((s, e) => s + (Number(e.series) || 3), 0) || 12;
      // Séries que o amigo já fez (pelo tempo que começou)
      let feitas = Math.min(total - 1, Math.round(x.ha / 3));
      // Texto do progresso
      const texto = el("p", { class: "meta", "aria-live": "polite" });
      // Barra
      const barra = el("div", { class: "progress-bar-sm progress-emerald" }, [el("div", { class: "fill" })]);
      // Atualiza o texto e a barra
      const atualizar = () => {
        // Texto
        texto.textContent = `${primeiro(x.amigo.nome)} está na série ${feitas} de ${total}`;
        // Barra
        barra.firstChild.style.width = Math.round((feitas / total) * 100) + "%";
      };
      // Primeira vez
      atualizar();
      // A cada 8 segundos o amigo faz mais uma série (simulado)
      const timer = setInterval(() => {
        // Se o modal fechou, para
        if (!texto.isConnected) return clearInterval(timer);
        // Mais uma série (até o fim)
        feitas = Math.min(total, feitas + 1);
        // Atualiza
        atualizar();
      }, 8000);
      // Abre o modal
      SL.openModal(`Treinando com ${primeiro(x.amigo.nome)}`, [
        // Treino
        el("p", {}, [el("strong", { text: x.treino.nome }), ` • ${x.treino.grupo}`]),
        // Progresso
        texto,
        // Barra
        barra,
        // Botões
        el("div", { class: "cm-convite-botoes" }, [
          // Começar o mesmo treino
          el("a", { class: "btn-primary", href: `../treino/treino.html?id=${encodeURIComponent(x.treino.id)}`, text: "Começar o mesmo treino" }),
          // Mandar força
          el("button", { type: "button", class: "btn-secondary", "data-action": "abrir-chat", "data-codigo": x.amigo.codigo, text: "Mandar força" }),
        ]),
      ]);
    });

    /* ---------- Grupos ---------- */

    // Grupos salvos (na primeira vez, cria um de exemplo)
    function grupos() {
      // Lê os salvos
      let lista = storage.get("sl-grupos", null);
      // Primeira vez: grupo de exemplo com os amigos de exemplo
      if (!lista) {
        // Grupo de exemplo
        lista = [{ id: "g-turma", nome: "Turma das 18h", membros: P.amigos().slice(0, 4).map((a) => a.codigo), criado: new Date().toISOString() }];
        // Salva
        storage.set("sl-grupos", lista);
      }
      // Devolve
      return lista;
    }

    // Respostas automáticas no chat do grupo
    const RESPOSTAS_GRUPO = ["Bora, galera! Quem vai hoje?", "Fiz perna hoje, tô morta haha", "Semana que vem eu passo vocês no ranking!", "Alguém topa correr no sábado?", "Partiu treino!"];

    // Desenha os grupos
    function renderGrupos() {
      // Semana atual
      const semana = P.periodo("semana");
      // Troca a lista
      $("grupos").replaceChildren(
        // Um card por grupo
        ...grupos().map((g) => {
          // Membros que existem (e não estão bloqueados)
          const membros = g.membros.map(pessoaDe).filter((p) => p && !bloqueados().includes(p.codigo));
          // Ranking da semana do grupo: membros + você
          const linhas = membros.map((p) => ({ nome: primeiro(p.nome), pts: P.pontosSimulados(p, semana.ini, Date.now()), eu: false })).concat({ nome: "Você", pts: P.somar(semana.ini, Date.now()), eu: true }).sort((a, b) => b.pts - a.pts);
          // Card
          return el("article", { class: "cm-desafio cm-grupo" }, [
            // Topo
            el("div", { class: "cm-desafio-topo" }, [
              // Nome e membros
              el("div", {}, [el("h3", { text: g.nome }), el("p", { class: "meta", text: `${membros.length + 1} pessoas • ranking da semana` })]),
              // Etiqueta
              el("span", { class: "tag", text: "Grupo" }),
            ]),
            // Ranking
            el(
              "ol",
              { class: "cm-grupo-ranking" },
              linhas.map((l, i) => el("li", { class: l.eu ? "is-eu" : "" }, [el("span", { class: "cm-grupo-pos", text: `${i + 1}º` }), el("span", { text: l.nome }), el("strong", { text: `${SL.num(l.pts)} pts` })])),
            ),
            // Botões
            el("div", { class: "cm-convite-botoes" }, [
              // Chat do grupo
              el("button", { type: "button", class: "btn-primary", "data-action": "chat-grupo", "data-id": g.id, text: "Chat do grupo" }),
              // Sair
              el("button", { type: "button", class: "btn-secondary", "data-action": "sair-grupo", "data-id": g.id, text: "Sair do grupo" }),
            ]),
          ]);
        }),
      );
      // Sem grupos: estado vazio
      if (!grupos().length) $("grupos").append(SL.estadoVazio("Nenhum grupo ainda", "Crie um grupo com seus amigos para ter um ranking só de vocês.", null));
    }

    // Abre o chat do grupo
    SL.acao("chat-grupo", (alvo) => {
      // Grupo
      const g = grupos().find((x) => x.id === alvo.dataset.id);
      // Abre a conversa
      SL.abrirChat({ chave: "grupo-" + g.id, nome: g.nome, respostas: RESPOSTAS_GRUPO });
    });

    // Sair de um grupo
    SL.acao("sair-grupo", (alvo) => {
      // Grupo
      const g = grupos().find((x) => x.id === alvo.dataset.id);
      // Confirma
      SL.confirmar({
        // Título
        titulo: `Sair de "${g.nome}"?`,
        // Texto
        texto: "O grupo some da sua lista e a conversa é apagada.",
        // Botão
        rotulo: "Sair",
        // Vermelho
        perigo: true,
        // Se confirmar...
        fn: () => {
          // ...tira o grupo
          storage.set("sl-grupos", grupos().filter((x) => x.id !== g.id));
          // ...desenha
          renderGrupos();
        },
      });
    });

    // Criar grupo
    SL.acao("criar-grupo", () => {
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Nome
        SL.campo("grupo-nome", "Nome do grupo", { placeholder: "Ex: Galera do crossfit", required: true, maxlength: 30 }),
        // Amigos
        el("fieldset", { class: "cm-convidar" }, [
          // Título
          el("legend", { text: "Quem entra" }),
          // Uma caixinha por amigo
          ...P.amigos().map((a) => el("label", { class: "check-row" }, [el("input", { type: "checkbox", value: a.codigo }), " " + a.nome])),
        ]),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Criar grupo" }),
      ]);
      // Ao enviar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...nome
        const nome = form.querySelector("#grupo-nome").value.trim();
        // ...membros marcados
        const membros = [...form.querySelectorAll(".cm-convidar input:checked")].map((c) => c.value);
        // ...precisa de nome
        if (!nome) return form.querySelector("#grupo-nome").focus();
        // ...e de pelo menos 1 amigo
        if (!membros.length) return SL.toast("Escolha pelo menos 1 amigo");
        // ...salva no começo
        storage.set("sl-grupos", [{ id: "g" + Date.now(), nome, membros, criado: new Date().toISOString() }].concat(grupos()));
        // ...fecha
        SL.closeModal();
        // ...desenha
        renderGrupos();
        // ...avisa
        SL.toast("Grupo criado!");
      });
      // Abre o modal
      SL.openModal("Criar grupo", form);
    });

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
                ? el("button", { type: "button", class: "btn-secondary", "data-action": "cutucar", "data-codigo": a.codigo, disabled: jaCutucou, text: jaCutucou ? "Cutucado ✓" : "Cutucar" })
                : null,
              // Duelo de 7 dias com esse amigo
              el("button", { type: "button", class: "btn-secondary", "data-action": "duelo", "data-codigo": a.codigo, text: "Duelo" }),
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
      // Pessoas bloqueadas (com botão de desbloquear)
      const fora = bloqueados().map(pessoaDe).filter(Boolean);
      // Se tem alguém bloqueado, mostra no fim
      if (fora.length)
        $("amigos").append(
          el("li", { class: "cm-bloqueados" }, [
            // Título
            el("strong", { text: "Bloqueados" }),
            // Um por pessoa
            ...fora.map((p) => el("div", { class: "cm-amigo" }, [el("span", { text: p.nome }), el("button", { type: "button", class: "btn-link", "data-action": "desbloquear", "data-codigo": p.codigo, text: "Desbloquear" })])),
          ]),
        );
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
      const achados = P.PESSOAS.filter((p) => !bloqueados().includes(p.codigo)).filter((p) => p.codigo.toLowerCase() === t || idDe(p.codigo) === t || p.nome.toLowerCase().includes(t));
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
      // Grupos
      renderGrupos();
      // Treinando agora
      renderAoVivo();
    }

    // Se veio por um link de convite (?add=CODIGO), adiciona o amigo
    const convite = new URLSearchParams(window.location.search).get("add");
    // Se tem convite...
    if (convite) {
      // ...pessoa do convite
      const pessoa = P.PESSOAS.find((p) => p.codigo === convite.toUpperCase());
      // ...se existe e foi adicionada, avisa
      if (pessoa && P.adicionarAmigo(pessoa.codigo)) SL.toast(`${primeiro(pessoa.nome)} agora é seu amigo!`);
      // ...quem entra pelo convite ganha 50 pontos (uma vez só)
      if (pessoa) P.ganhar("convite", "convite-unico");
      // ...abre a aba de amigos
      abrirAba("amigos");
    }
    // Se veio pelo link das mensagens (#mensagens) ou dos grupos (#grupos), abre essa aba
    if (["#mensagens", "#grupos"].includes(window.location.hash)) abrirAba(window.location.hash.slice(1));

    // Quando os amigos mudam, desenha de novo
    document.addEventListener("sl:pontos", render);
    // Desenha a primeira vez
    render();

    // Botão "Duelo": desafia o amigo para 7 dias de pontos, 1 contra 1
    SL.acao("duelo", (alvo) => {
      // Amigo
      const amigo = P.PESSOAS.find((p) => p.codigo === alvo.dataset.codigo);
      // Confirma
      SL.confirmar({
        // Título
        titulo: `Duelo com ${primeiro(amigo.nome)}?`,
        // Texto
        texto: "Por 7 dias, quem fizer mais pontos ganha. O placar fica no Ranking.",
        // Botão
        rotulo: "Começar duelo",
        // Se confirmar...
        fn: () => SL.toast(P.criarDuelo(amigo.codigo) ? `Duelo com ${primeiro(amigo.nome)} começou! Veja o placar no Ranking.` : `Vocês já têm um duelo em andamento.`),
      });
    });
  });
