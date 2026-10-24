// Perfil: números iguais aos do Início, objetivos, conquistas,
// atividade recente e preferências
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos, ler/salvar dados e os ícones
    const { el, storage, icone, ICONES } = SL;
    // Calcula os números de treino (total, sequência, semana...)
    const stats = SL.estatisticas();
    // Atalho para achar um pedaço da página pelo data-render
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);

    // Mostra o total de treinos feitos
    $("treinos-count").textContent = SL.num(stats.total);
    // Mostra quantas semanas seguidas a pessoa treinou
    $("sequencia").textContent = SL.num(stats.sequencia);
    // Mostra quantos profissionais a pessoa segue
    $("seguindo-count").textContent = SL.num(storage.get("sl-seguindo", []).length);

    // Desenha o que a pessoa personalizou: capa, Pulso, plano e selos em destaque
    function renderPersonalizado() {
      // Perfil salvo
      const perfil = storage.get("sl-perfil", {});
      // Card do topo
      const card = document.querySelector(".profile-header-card");
      // Capa escolhida (padrão: brasa)
      card.dataset.capa = perfil.capa || "brasa";
      // Tira o que foi desenhado antes (para não repetir)
      card.querySelectorAll(".perfil-extra").forEach((x) => x.remove());
      // Pulso com a roupa escolhida, no canto do card
      if (SL.personagem) card.append(el("div", { class: "perfil-extra perfil-pulso" }, [SL.personagem.desenhar()]));
      // Selo do plano ao lado do nome
      document.getElementById("heading-perfil").append(el("span", { class: `perfil-extra tag perfil-plano${SL.premium() ? " is-premium" : ""}`, text: SL.premium() ? "Premium" : "Free" }));
      // Selos conquistados
      const selos = SL.pontos ? SL.pontos.selos().filter((x) => x.feito) : [];
      // Os escolhidos para destaque (só os que ainda valem)
      const escolhidos = (perfil.selos || []).map((id) => selos.find((x) => x.id === id)).filter(Boolean);
      // Se tem selos em destaque, mostra embaixo da bio
      if (escolhidos.length)
        // Lista de selos
        document.querySelector(".profile-info .bio").after(
          el("ul", { class: "perfil-extra perfil-destaques", "aria-label": "Selos em destaque" }, escolhidos.map((x) => el("li", { title: x.texto }, [SL.icone(SL.ICONES.medalha), x.nome]))),
        );
    }
    // Desenha agora
    renderPersonalizado();
    // E de novo quando a pessoa salvar o perfil
    document.addEventListener("sl:perfil", renderPersonalizado);

    // Lê as respostas do questionário inicial
    const obj = SL.onboarding();
    // Troca a lista de objetivos pelos dados novos
    $("objetivos").replaceChildren(
      // Lista de pares [título, valor]
      ...[
        // Objetivo escolhido
        ["Objetivo", obj.rotulo || obj.objetivo],
        // Nível escolhido
        ["Nível", obj.nivel],
        // Quantos treinos por semana
        ["Meta semanal", `${obj.dias} treinos por semana`],
      // Transforma cada par em um título (dt) e um valor (dd)
      ].map(([dt, dd]) => el("div", {}, [el("dt", { text: dt }), el("dd", { text: dd })])),
    );

    // Lista das conquistas: nome, texto, se já foi feita e o ícone
    const conquistas = [
      // Conquista do primeiro treino
      { nome: "Primeiro treino", texto: "Registrou o primeiro treino", feito: stats.total >= 1, icone: ICONES.play },
      // Conquista de 10 treinos
      { nome: "10 treinos", texto: "Dez treinos concluídos", feito: stats.total >= 10, icone: ICONES.haltere },
      // Conquista de 25 treinos (mostra quanto falta)
      { nome: "25 treinos", texto: `${Math.min(stats.total, 25)} de 25 treinos`, feito: stats.total >= 25, icone: ICONES.trofeu },
      // Conquista de bater a meta da semana
      { nome: "Meta da semana", texto: `${stats.nestaSemana} de ${stats.meta} nesta semana`, feito: stats.nestaSemana >= stats.meta, icone: ICONES.alvo },
      // Conquista de 4 semanas seguidas
      { nome: "Constância", texto: "4 semanas seguidas treinando", feito: stats.sequencia >= 4, icone: ICONES.fogo },
      // Conquista de entrar em um desafio
      { nome: "Desafiante", texto: "Entrou em um desafio", feito: Boolean(storage.get("sl-desafio", null)), icone: ICONES.calendario },
    ];
    // Mostra quantas conquistas foram feitas, ex.: "3 de 6"
    $("conquistas-total").textContent = `${conquistas.filter((c) => c.feito).length} de ${conquistas.length}`;
    // Troca a lista de conquistas pelos cards novos
    $("conquistas").replaceChildren(
      // Um item para cada conquista
      ...conquistas.map((c) =>
        // Item da lista; ganha destaque (is-earned) se foi conquistada
        el("li", { class: "badge-item" + (c.feito ? " is-earned" : "") }, [
          // Ícone da conquista (escondido dos leitores de tela)
          el("span", { class: "badge-icon", "aria-hidden": "true" }, [icone(c.icone)]),
          // Nome da conquista
          el("strong", { text: c.nome }),
          // Texto da conquista
          el("span", { text: c.texto }),
          // Texto só para leitores de tela dizendo se foi conquistada
          el("span", { class: "sr-only", text: c.feito ? "Conquistada" : "Ainda não conquistada" }),
        ]),
      ),
    );

    // Troca a lista de atividade recente
    $("atividade").replaceChildren(
      // Pega o histórico de treinos
      ...SL.historico()
        // Só os 4 mais recentes
        .slice(0, 4)
        // Transforma cada treino em um item da lista
        .map((h) =>
          // Item do histórico
          el("li", { class: "history-item" }, [
            // Ícone de "check" coral
            el("span", { class: "icon-tile icon-tile-coral", "aria-hidden": "true" }, [icone(ICONES.check)]),
            // Nome do treino, quando foi e quanto tempo durou
            el("div", {}, [el("strong", { text: h.nome }), el("span", { text: `${SL.dataRelativa(h.data)} • ${SL.duracaoTexto(h.duracao)}` })]),
          ]),
        ),
    );

    // Para cada chave de preferência (notificações etc.)...
    document.querySelectorAll("[data-pref]").forEach((input) => {
      // ...marca ou desmarca conforme o que está salvo (padrão: ligada)
      input.checked = storage.get(input.dataset.pref, true);
      // Quando a pessoa muda a chave...
      input.addEventListener("change", () => {
        // ...salva a escolha no navegador
        storage.set(input.dataset.pref, input.checked);
        // ...e mostra um aviso rápido
        SL.toast("Preferência salva");
      });
    });

    // Painel do modo demonstração (depois da seção Conta)
    if (SL.demo) {
      // Coloca o painel
      document.querySelector('[aria-labelledby="heading-conta"]').after(SL.demo.painel());
      // Se o endereço pede o painel (#heading-demo), rola até ele
      if (location.hash === "#heading-demo") document.getElementById("heading-demo").scrollIntoView();
    }

    /* ---------- Lembrete de treino: horário fixo e dias ---------- */

    // Lembrete salvo (padrão: 18h, de segunda a sexta)
    const lembrete = storage.get("sl-lembrete-treino", { hora: "18:00", dias: [1, 2, 3, 4, 5] });
    // Campo da hora
    const campoHora = document.getElementById("lembrete-hora");
    // Mostra a hora salva
    campoHora.value = lembrete.hora;
    // Letras dos dias (0 = domingo)
    const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
    // Nomes completos (para leitores de tela)
    const NOMES_DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    // Lugar dos botões dos dias
    const caixaDias = document.querySelector(".lembrete-dias");
    // Desenha os 7 botões (segunda primeiro)
    function renderDias() {
      // Ordem: segunda a domingo
      caixaDias.replaceChildren(
        ...[1, 2, 3, 4, 5, 6, 0].map((d) =>
          // Botão do dia (ligado se está na lista)
          el("button", { type: "button", class: "lembrete-dia" + (lembrete.dias.includes(d) ? " is-on" : ""), "data-dia": d, "aria-pressed": String(lembrete.dias.includes(d)), "aria-label": NOMES_DIAS[d], text: DIAS[d] }),
        ),
      );
    }
    // Desenha
    renderDias();
    // Clique num dia: liga ou desliga
    caixaDias.addEventListener("click", (e) => {
      // Botão clicado
      const b = e.target.closest("[data-dia]");
      // Se não foi num botão, para
      if (!b) return;
      // Dia
      const d = Number(b.dataset.dia);
      // Troca
      lembrete.dias = lembrete.dias.includes(d) ? lembrete.dias.filter((x) => x !== d) : lembrete.dias.concat(d);
      // Salva
      storage.set("sl-lembrete-treino", lembrete);
      // Desenha
      renderDias();
    });
    // Mudou a hora: salva e pede permissão de notificação
    campoHora.addEventListener("change", () => {
      // Guarda a hora
      lembrete.hora = campoHora.value || "18:00";
      // Salva
      storage.set("sl-lembrete-treino", lembrete);
      // Pede para mostrar notificações do sistema (se ainda não pediu)
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
      // Avisa
      SL.toast(`Lembrete às ${lembrete.hora}`);
    });

    /* ---------- Conta: plano, segurança, backup e excluir ---------- */

    // Nome do plano atual na seção Conta
    $("plano-nome").textContent = SL.premium() ? "Premium" : "Free";
    // Funções de conta (shared/form-utils.js)
    const F = window.SaudeLifeForm;
    // E-mail de quem está logado
    const emailAtual = () => (storage.get("sl-sessao", {}) || {}).email;

    // Trocar e-mail ou senha
    SL.acao("seguranca", () => {
      // Formulário do e-mail
      const formEmail = el("form", { class: "modal-form" }, [
        // Título
        el("h3", { text: "Trocar e-mail" }),
        // E-mail novo
        SL.campo("seg-email", "E-mail novo", { type: "email", required: true }),
        // Senha atual (o hash da senha usa o e-mail)
        SL.campo("seg-senha-email", "Sua senha atual", { type: "password", required: true }),
        // Mensagem
        el("p", { class: "field-error", role: "alert", "data-msg": "email" }),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Salvar e-mail" }),
      ]);
      // Formulário da senha
      const formSenha = el("form", { class: "modal-form" }, [
        // Título
        el("h3", { text: "Trocar senha" }),
        // Senha atual
        SL.campo("seg-atual", "Senha atual", { type: "password", required: true }),
        // Senha nova
        SL.campo("seg-nova", "Senha nova (mínimo 8 caracteres)", { type: "password", required: true }),
        // Mensagem
        el("p", { class: "field-error", role: "alert", "data-msg": "senha" }),
        // Botão
        el("button", { type: "submit", class: "btn-primary", text: "Salvar senha" }),
      ]);
      // Campo de e-mail começa com o atual
      formEmail.querySelector("#seg-email").value = emailAtual() || "";
      // Ao salvar o e-mail...
      formEmail.addEventListener("submit", async (e) => {
        // ...não recarrega
        e.preventDefault();
        // E-mail novo
        const novo = formEmail.querySelector("#seg-email").value.trim().toLowerCase();
        // Formato inválido
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novo)) return (formEmail.querySelector('[data-msg="email"]').textContent = "Digite um e-mail válido.");
        // Tenta trocar
        const erro = await F.trocarEmail(emailAtual(), formEmail.querySelector("#seg-senha-email").value, novo);
        // Mostra o erro, se tiver
        if (erro) return (formEmail.querySelector('[data-msg="email"]').textContent = erro);
        // Fecha e avisa
        SL.closeModal();
        // Aviso
        SL.toast("E-mail trocado");
        // Mostra o e-mail novo
        document.querySelectorAll("[data-user-email]").forEach((n) => (n.textContent = novo));
      });
      // Ao salvar a senha...
      formSenha.addEventListener("submit", async (e) => {
        // ...não recarrega
        e.preventDefault();
        // Tenta trocar
        const erro = await F.mudarSenha(emailAtual(), formSenha.querySelector("#seg-atual").value, formSenha.querySelector("#seg-nova").value);
        // Mostra o erro, se tiver
        if (erro) return (formSenha.querySelector('[data-msg="senha"]').textContent = erro);
        // Fecha e avisa
        SL.closeModal();
        // Aviso
        SL.toast("Senha trocada");
      });
      // Abre o modal com os dois formulários
      SL.openModal("Trocar e-mail ou senha", [formEmail, formSenha]);
    });

    // Chaves que são do aparelho (não entram no backup)
    const GLOBAIS = ["sl-contas", "sl-conta", "sl-sessao", "sl-tema", "sl-idioma", "sl-reset-pedidos", "sl-pedidos-academia", "sl-dono", "sl-acessibilidade", "sl-instalar-visto"];

    // Baixar uma cópia dos dados (arquivo .json)
    SL.acao("baixar-backup", () => {
      // Dados da conta
      const chaves = {};
      // Copia cada chave da conta
      Object.keys(localStorage)
        // Só as do app, sem as do aparelho e sem as gavetas de outras contas
        .filter((k) => k.startsWith("sl-") && !GLOBAIS.includes(k) && !k.startsWith("sl-dados:"))
        // Copia o texto
        .forEach((k) => (chaves[k] = localStorage.getItem(k)));
      // Arquivo
      const arquivo = new Blob([JSON.stringify({ app: "saude-life", versao: 1, data: new Date().toISOString(), email: emailAtual(), chaves }, null, 1)], { type: "application/json" });
      // Link temporário
      const a = document.createElement("a");
      // Endereço do arquivo
      a.href = URL.createObjectURL(arquivo);
      // Nome do arquivo com a data
      a.download = `saude-life-backup-${new Date().toISOString().slice(0, 10)}.json`;
      // Baixa
      a.click();
      // Libera a memória depois
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      // Avisa
      SL.toast("Backup baixado");
    });

    // Restaurar um backup
    document.getElementById("arquivo-backup").addEventListener("change", (e) => {
      // Arquivo escolhido
      const f = e.target.files[0];
      // Se não escolheu, para
      if (!f) return;
      // Lê o arquivo
      f.text().then((texto) => {
        // Tenta entender o arquivo
        let dados = null;
        // Tenta...
        try {
          // ...transformar em dados
          dados = JSON.parse(texto);
        // Se não for JSON...
        } catch (erro) {
          // ...fica vazio
          dados = null;
        }
        // Não é um backup do Saúde Life
        if (!dados || dados.app !== "saude-life" || !dados.chaves) return SL.toast("Esse arquivo não é um backup do Saúde Life.");
        // Confirma antes de trocar tudo
        SL.confirmar({
          // Título
          titulo: "Restaurar este backup?",
          // Texto
          texto: `Seus dados atuais serão trocados pelos do backup de ${new Date(dados.data).toLocaleDateString("pt-BR")}.`,
          // Botão
          rotulo: "Restaurar",
          // Se confirmar: grava cada chave e recarrega
          fn: () => {
            // Grava cada chave do backup
            Object.entries(dados.chaves).forEach(([k, v]) => k.startsWith("sl-") && !GLOBAIS.includes(k) && localStorage.setItem(k, v));
            // Recarrega
            window.location.reload();
          },
        });
      });
      // Limpa o campo (para poder escolher o mesmo arquivo de novo)
      e.target.value = "";
    });

    // Excluir a conta
    SL.acao("excluir-conta", () => {
      // Pede confirmação
      SL.confirmar({
        // Título
        titulo: "Excluir sua conta?",
        // Texto
        texto: "Sua conta e todos os seus dados (treinos, pesos, fotos, refeições) serão apagados deste aparelho. Não dá para desfazer.",
        // Botão
        rotulo: "Excluir para sempre",
        // Vermelho
        perigo: true,
        // Se confirmar...
        fn: () => {
          // ...apaga tudo
          F.excluirConta(emailAtual());
          // ...e volta para a página inicial
          window.location.href = "../../welcome/welcome.html";
        },
      });
    });
  });
