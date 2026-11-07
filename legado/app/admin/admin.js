// Painel do administrador (academia ou personal): clientes de verdade cadastrados neste aparelho,
// o que cada um registrou, mandar treino para um cliente e publicar avisos.
// Sem servidor, os dados de cada cliente ficam na "gaveta" dele no navegador (sl-dados:e-mail).
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos e ler/salvar dados
    const { el, storage } = SL;
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);
    // Biblioteca de exercícios (para montar treinos)
    const BIBLIOTECA = window.SL_EXERCICIOS || {};
    // Grupos musculares (sem repetir)
    const GRUPOS = [...new Set(Object.values(BIBLIOTECA).map((e) => e.grupo))];
    // Um dia em milissegundos
    const DIA = 86400000;

    // Lê um valor do navegador (JSON) sem quebrar se estiver estragado
    const ler = (chave, padrao) => {
      // Tenta...
      try {
        // ...ler e converter
        return JSON.parse(localStorage.getItem(chave)) ?? padrao;
      } catch (e) {
        // Se não der, o padrão
        return padrao;
      }
    };

    // Clientes: contas do tipo "cliente" criadas neste aparelho
    const clientes = () => ler("sl-contas", []).filter((c) => (c.tipo || "cliente") === "cliente");

    // Dados de um cliente (da gaveta dele): devolve o valor de uma chave
    function dadoDoCliente(email, chave, padrao) {
      // Gaveta do cliente
      const gaveta = ler("sl-dados:" + email, {});
      // Tenta converter o valor guardado
      try {
        // Valor
        return gaveta[chave] != null ? JSON.parse(gaveta[chave]) : padrao;
      } catch (e) {
        // Estragado: padrão
        return padrao;
      }
    }

    // Grava uma chave na gaveta de um cliente
    function gravarNoCliente(email, chave, valor) {
      // Gaveta
      const gaveta = ler("sl-dados:" + email, {});
      // Valor novo (como texto, igual ao resto da gaveta)
      gaveta[chave] = JSON.stringify(valor);
      // Salva
      localStorage.setItem("sl-dados:" + email, JSON.stringify(gaveta));
    }

    // Avisos publicados (valem para todos os clientes do aparelho)
    const avisos = () => ler("sl-avisos-admin", []);

    // Desenha tudo
    function render() {
      // Lista de clientes
      const lista = clientes();
      // Resumo de cada um
      const resumos = lista.map((c) => {
        // Histórico de treinos do cliente
        const hist = dadoDoCliente(c.email, "sl-historico", []);
        // Último treino
        const ultimo = hist.slice().sort((a, b) => (a.data < b.data ? 1 : -1))[0];
        // Treinos nos últimos 7 dias
        const semana = hist.filter((h) => Date.now() - new Date(h.data) < 7 * DIA).length;
        // Último peso
        const pesos = dadoDoCliente(c.email, "sl-pesos", []);
        // Devolve
        return { ...c, total: hist.length, semana, ultimo, peso: pesos.length ? pesos[pesos.length - 1].valor : null };
      });
      // Ativos: treinaram nos últimos 7 dias
      const ativos = resumos.filter((r) => r.semana > 0).length;
      // Números do topo
      $("numeros").replaceChildren(
        // Clientes
        SL.statTile({ rotulo: "Clientes", valor: String(lista.length), detalhe: "cadastrados neste aparelho", iconePaths: SL.ICONES.joinha }),
        // Ativos
        SL.statTile({ rotulo: "Ativos na semana", valor: String(ativos), detalhe: "treinaram nos últimos 7 dias", iconePaths: SL.ICONES.fogo, cor: "emerald" }),
        // Treinos na semana
        SL.statTile({ rotulo: "Treinos na semana", valor: String(resumos.reduce((s, r) => s + r.semana, 0)), detalhe: "somando todos os clientes", iconePaths: SL.ICONES.haltere }),
      );
      // Lista de clientes
      $("clientes").replaceChildren(
        ...resumos.map((r) =>
          el("li", { class: "adm-cliente" }, [
            // Bolinha com as iniciais
            el("span", { class: "adm-avatar", "aria-hidden": "true", text: SL.initials(r.nome) }),
            // Nome e números
            el("div", { class: "adm-cliente-info" }, [
              // Nome
              el("strong", { text: r.nome }),
              // E-mail
              el("span", { class: "meta", text: r.email }),
              // Números
              el("span", { class: "meta", text: `${r.total} treino${r.total === 1 ? "" : "s"} no total • ${r.semana} na semana • ${r.ultimo ? "último " + SL.dataRelativa(r.ultimo.data).toLowerCase() : "ainda não treinou"}${r.peso ? ` • ${SL.num(r.peso, 1)} kg` : ""}` }),
            ]),
            // Mandar treino
            el("button", { type: "button", class: "btn-secondary", "data-action": "adm-mandar-treino", "data-email": r.email, text: "Mandar treino" }),
          ]),
        ),
      );
      // Sem clientes: explica como aparecem
      if (!lista.length) $("clientes").append(el("li", { class: "meta", text: 'Nenhum cliente ainda. Quando alguém criar uma conta "Sou cliente" neste aparelho, aparece aqui.' }));
      // Avisos publicados
      $("avisos").replaceChildren(
        ...avisos().map((a) =>
          el("li", {}, [
            // Texto e data
            el("div", {}, [el("strong", { text: a.texto }), el("span", { class: "meta", text: ` • ${SL.dataRelativa(a.data)}` })]),
            // Apagar
            el("button", { type: "button", class: "btn-link", "data-action": "adm-apagar-aviso", "data-id": a.id, text: "Apagar" }),
          ]),
        ),
      );
      // Sem avisos
      if (!avisos().length) $("avisos").append(el("li", { class: "meta", text: "Nenhum aviso publicado." }));
    }

    // Publicar aviso
    $("form-aviso").addEventListener("submit", (e) => {
      // Não recarrega
      e.preventDefault();
      // Campo
      const campo = document.getElementById("adm-aviso");
      // Texto
      const texto = campo.value.trim();
      // Vazio: para
      if (!texto) return;
      // Guarda no começo
      localStorage.setItem("sl-avisos-admin", JSON.stringify([{ id: "a" + Date.now(), texto, data: new Date().toISOString(), autor: SL.getUsuario().nome }].concat(avisos())));
      // Limpa
      campo.value = "";
      // Desenha
      render();
      // Avisa
      SL.toast("Aviso publicado para os clientes");
    });

    // Apagar aviso
    SL.acao("adm-apagar-aviso", (alvo) => {
      // Tira da lista
      localStorage.setItem("sl-avisos-admin", JSON.stringify(avisos().filter((a) => a.id !== alvo.dataset.id)));
      // Desenha
      render();
    });

    // Mandar treino para um cliente: monta e grava nos treinos dele
    SL.acao("adm-mandar-treino", (alvo) => {
      // Cliente
      const cliente = clientes().find((c) => c.email === alvo.dataset.email);
      // Exercícios escolhidos
      const escolhidos = el("ol", { class: "adm-escolhidos" });
      // Caixa do grupo
      const selGrupo = el("select", { id: "adm-grupo" }, GRUPOS.map((g) => el("option", { value: g, text: g })));
      // Caixa do exercício
      const selEx = el("select", { id: "adm-ex" });
      // Preenche os exercícios do grupo
      const encher = () => selEx.replaceChildren(...Object.entries(BIBLIOTECA).filter(([, e]) => e.grupo === selGrupo.value).map(([nome]) => el("option", { value: nome, text: nome })));
      // Primeira vez
      encher();
      // Trocar o grupo troca a lista
      selGrupo.addEventListener("change", encher);
      // Botão de adicionar
      const btnAdd = el("button", { type: "button", class: "btn-secondary", text: "Adicionar exercício" });
      // Ao clicar, junta (3 x 12 por padrão)
      btnAdd.addEventListener("click", () => {
        // Já está: avisa
        if ([...escolhidos.children].some((li) => li.dataset.nome === selEx.value)) return SL.toast("Esse já está no treino");
        // Linha do exercício com botão de tirar
        const li = el("li", { "data-nome": selEx.value }, [el("span", { text: `${selEx.value} • 3 x 12` }), el("button", { type: "button", class: "btn-link", text: "Tirar" })]);
        // Tirar
        li.querySelector("button").addEventListener("click", () => li.remove());
        // Junta
        escolhidos.append(li);
      });
      // Formulário
      const form = el("form", { class: "modal-form" }, [
        // Nome do treino
        SL.campo("adm-nome", "Nome do treino", { placeholder: "Ex: Treino A - Pernas", required: true, maxlength: 40 }),
        // Grupo e exercício
        el("div", { class: "form-row" }, [el("div", { class: "form-group" }, [el("label", { for: "adm-grupo", text: "Grupo" }), selGrupo]), el("div", { class: "form-group" }, [el("label", { for: "adm-ex", text: "Exercício" }), selEx])]),
        // Adicionar
        btnAdd,
        // Lista
        escolhidos,
        // Enviar
        el("button", { type: "submit", class: "btn-primary", text: `Mandar para ${cliente.nome.split(" ")[0]}` }),
      ]);
      // Ao enviar...
      form.addEventListener("submit", (e) => {
        // ...não recarrega
        e.preventDefault();
        // ...nome
        const nome = form.querySelector("#adm-nome").value.trim();
        // ...exercícios
        const itens = [...escolhidos.children].map((li) => ({ nome: li.dataset.nome, series: 3, reps: 12, carga: (BIBLIOTECA[li.dataset.nome] || {}).carga || 0, descanso: 60 }));
        // ...precisa de nome e exercício
        if (!nome) return form.querySelector("#adm-nome").focus();
        // (pelo menos 1 exercício)
        if (!itens.length) return SL.toast("Adicione pelo menos 1 exercício");
        // ...treinos atuais do cliente
        const treinos = dadoDoCliente(cliente.email, "sl-treinos", []);
        // ...coloca o novo no começo, com quem mandou
        gravarNoCliente(cliente.email, "sl-treinos", [{ id: "t" + Date.now(), nome, grupo: `Enviado por ${SL.getUsuario().nome}`, itens, exercicios: itens.length, autor: SL.getUsuario().nome }].concat(treinos));
        // ...fecha
        SL.closeModal();
        // ...avisa
        SL.toast(`Treino enviado para ${cliente.nome.split(" ")[0]}! Aparece em Treinos quando ele entrar.`);
      });
      // Abre
      SL.openModal(`Treino para ${cliente.nome}`, form);
    });

    // Desenha a primeira vez
    render();
  });
