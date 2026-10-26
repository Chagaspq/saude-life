// Loja do Pulso: troca moedas (pontos já ganhos) por roupas e acessórios do personagem.
// Comprar não muda o ranking. Itens Premium e o da liga Lenda têm regra própria.
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo: criar elementos e ler/salvar dados
    const { el, storage } = SL;
    // Motor de pontos (moedas)
    const P = SL.pontos;
    // Atalho para achar um pedaço da página
    const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);

    // Itens à venda: [id, lugar no corpo, nome, preço, regra extra]
    const ITENS = [
      // Boné
      ["bone", "cabeca", "Boné coral", 300, ""],
      // Fone
      ["fone", "cabeca", "Fone de ouvido", 500, ""],
      // Coroa (só na liga Lenda)
      ["coroa", "cabeca", "Coroa da Lenda", 1500, "lenda"],
      // Óculos
      ["oculos", "olhos", "Óculos escuros", 400, ""],
      // Tênis branco
      ["branco", "pes", "Tênis branco", 250, ""],
      // Tênis neon
      ["neon", "pes", "Tênis neon", 350, ""],
      // Tênis roxo (Premium)
      ["roxo", "pes", "Tênis roxo", 450, "premium"],
    ];
    // Nomes dos lugares
    const LUGARES = { cabeca: "Cabeça", olhos: "Rosto", pes: "Pés" };

    // Estado da loja: { gasto, itens: [ids comprados], usando: { lugar: id } }
    const loja = () => ({ gasto: 0, itens: [], usando: {}, ...storage.get("sl-loja", {}) });

    // Desenha tudo
    function render() {
      // Estado
      const l = loja();
      // Saldo
      const saldo = P.moedas();
      // Liga atual (para a coroa)
      const ligaAtual = P.liga().atual;
      // Saldo no topo
      $("saldo").replaceChildren(el("strong", { text: SL.num(saldo) }), " moedas");
      // Prévia grande com os itens em uso
      $("previa").replaceChildren(SL.personagem ? SL.personagem.desenhar({ humor: "feliz" }) : "");
      // Cards dos itens
      $("itens").replaceChildren(
        ...ITENS.map(([id, lugar, nome, preco, regra]) => {
          // Já comprou?
          const tem = l.itens.includes(id);
          // Está usando?
          const usando = l.usando[lugar] === id;
          // Bloqueado pela regra (Premium ou liga Lenda)
          const bloqueio = regra === "premium" && !SL.premium() ? "Só no Premium" : regra === "lenda" && ligaAtual < 5 ? "Chegue à liga Lenda" : "";
          // Botão conforme a situação
          const botao = tem
            ? el("button", { type: "button", class: usando ? "btn-secondary is-active" : "btn-secondary", "data-action": "usar-item", "data-id": id, "data-lugar": lugar, "aria-pressed": String(usando), text: usando ? "Usando ✓" : "Usar" })
            : el("button", { type: "button", class: "btn-primary", "data-action": "comprar-item", "data-id": id, disabled: Boolean(bloqueio) || saldo < preco, text: bloqueio || (saldo < preco ? `Faltam ${SL.num(preco - saldo)}` : `Comprar por ${SL.num(preco)}`) });
          // Prévia do item no personagem
          const previa = SL.personagem ? SL.personagem.desenhar({ humor: "feliz", usando: { ...l.usando, [lugar]: id } }) : "";
          // Card
          return el("article", { class: "loja-item" + (usando ? " is-usando" : "") }, [el("div", { class: "loja-item-previa" }, [previa]), el("strong", { text: nome }), el("span", { class: "meta", text: LUGARES[lugar] }), botao]);
        }),
      );
    }

    // Comprar um item
    SL.acao("comprar-item", (alvo) => {
      // Item
      const [id, lugar, nome, preco] = ITENS.find((x) => x[0] === alvo.dataset.id);
      // Estado
      const l = loja();
      // Sem moedas suficientes
      if (P.moedas() < preco) return SL.toast("Moedas insuficientes");
      // Gasta, guarda o item e já veste
      storage.set("sl-loja", { ...l, gasto: l.gasto + preco, itens: l.itens.concat(id), usando: { ...l.usando, [lugar]: id } });
      // Comemora
      if (SL.confete) SL.confete();
      // Avisa
      SL.toast(`${nome} é seu!`);
      // Desenha
      render();
    });

    // Usar ou tirar um item comprado
    SL.acao("usar-item", (alvo) => {
      // Estado
      const l = loja();
      // Lugar do item
      const lugar = alvo.dataset.lugar;
      // Se já está usando, tira; se não, coloca
      const usando = { ...l.usando, [lugar]: l.usando[lugar] === alvo.dataset.id ? null : alvo.dataset.id };
      // Salva
      storage.set("sl-loja", { ...l, usando });
      // Desenha
      render();
    });

    // Desenha a primeira vez
    SL.carregar($("itens"), render);
  });
