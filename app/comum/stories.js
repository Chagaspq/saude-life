/*
 * Resumo no estilo "stories": telas em sequência com barrinhas de progresso
 * em cima (como no Instagram) e um botão que gera uma imagem 1080 x 1920
 * para salvar ou postar. Usado na Evolução (resumo da semana/mês) e no fim do treino.
 * Fica em SL.stories.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";
  // Se o núcleo do app não carregou, para aqui
  if (!window.SL) return;

  // Pega do núcleo o criador de elementos
  const { el } = SL;

  // Modelos de imagem: fundo, brilhos, título, número e legenda
  const MODELOS = {
    // Escuro (verde-carvão, o padrão)
    escuro: { nome: "Escuro", fundo: "#0e1512", brilho1: "240,132,90", brilho2: "79,194,154", titulo: "#f4f1ea", numero: "#f5a37f", legenda: "#a3b0a8" },
    // Claro (creme)
    claro: { nome: "Claro", fundo: "#f6f3ec", brilho1: "240,132,90", brilho2: "79,194,154", titulo: "#16201b", numero: "#c96a43", legenda: "#55615a" },
    // Coral (fundo coral, números brancos)
    coral: { nome: "Coral", fundo: "#c96a43", brilho1: "245,163,127", brilho2: "47,148,116", titulo: "#fffaf5", numero: "#ffffff", legenda: "#ffe3d6" },
  };

  // Gera a imagem do resumo (1080 x 1920) com canvas e devolve como texto de imagem PNG
  // modelo = "escuro", "claro" ou "coral"
  function imagem(titulo, telas, modelo = "escuro") {
    // Cores do modelo (se não existir, usa o escuro)
    const m = MODELOS[modelo] || MODELOS.escuro;
    // Tela de desenho
    const c = document.createElement("canvas");
    // Largura de stories
    c.width = 1080;
    // Altura de stories
    c.height = 1920;
    // Pincel
    const g = c.getContext("2d");
    // Fundo do modelo
    g.fillStyle = m.fundo;
    // Pinta o fundo
    g.fillRect(0, 0, 1080, 1920);
    // Brilho coral em cima
    const b1 = g.createRadialGradient(200, 200, 0, 200, 200, 900);
    // Cor do centro do brilho
    b1.addColorStop(0, `rgba(${m.brilho1},0.35)`);
    // Cor da borda do brilho
    b1.addColorStop(1, `rgba(${m.brilho1},0)`);
    // Usa o brilho
    g.fillStyle = b1;
    // Pinta
    g.fillRect(0, 0, 1080, 1920);
    // Brilho esmeralda embaixo
    const b2 = g.createRadialGradient(900, 1700, 0, 900, 1700, 900);
    // Cor do centro
    b2.addColorStop(0, `rgba(${m.brilho2},0.28)`);
    // Cor da borda
    b2.addColorStop(1, `rgba(${m.brilho2},0)`);
    // Usa o brilho
    g.fillStyle = b2;
    // Pinta
    g.fillRect(0, 0, 1080, 1920);
    // Anel da logo (degradê coral → esmeralda)
    const grad = g.createLinearGradient(380, 520, 700, 200);
    // Coral
    grad.addColorStop(0, "#f0845a");
    // Esmeralda
    grad.addColorStop(1, "#4fc29a");
    // Usa o degradê no traço
    g.strokeStyle = grad;
    // Grossura do anel
    g.lineWidth = 34;
    // Pontas redondas
    g.lineCap = "round";
    // Começa o desenho do anel
    g.beginPath();
    // Anel quase fechado
    g.arc(540, 360, 150, -Math.PI / 2, Math.PI * 1.35);
    // Desenha
    g.stroke();
    // Batimento dentro do anel
    g.lineWidth = 28;
    // Começa o batimento
    g.beginPath();
    // Pontos do batimento
    [[440, 370], [480, 370], [505, 320], [545, 430], [575, 370], [640, 370]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    // Desenha
    g.stroke();
    // Texto centralizado
    g.textAlign = "center";
    // Cor do título
    g.fillStyle = m.titulo;
    // Fonte do título
    g.font = "700 64px 'Barlow Semi Condensed', Barlow, sans-serif";
    // Título
    g.fillText(titulo, 540, 640);
    // Posição do primeiro número
    let y = 820;
    // Para cada tela (até 4)...
    telas.slice(0, 4).forEach((t) => {
      // ...número grande em coral
      g.fillStyle = m.numero;
      // Fonte de placar
      g.font = "700 120px 'Space Mono', monospace";
      // Escreve o número
      g.fillText(t.numero, 540, y);
      // ...legenda embaixo
      g.fillStyle = m.legenda;
      // Fonte da legenda
      g.font = "500 42px Barlow, sans-serif";
      // Escreve a legenda
      g.fillText(t.legenda, 540, y + 64);
      // Próximo bloco mais abaixo
      y += 250;
    });
    // Marca no rodapé
    g.fillStyle = m.titulo;
    // Fonte da marca
    g.font = "700 48px 'Barlow Semi Condensed', Barlow, sans-serif";
    // Nome
    g.fillText("Saúde Life", 540, 1820);
    // Devolve a imagem
    return c.toDataURL("image/png");
  }

  // Abre o resumo em telas. telas = [{ kicker, numero, legenda, texto }]
  function abrir(titulo, telas) {
    // Tela atual
    let atual = 0;
    // Temporizador que passa de tela sozinho
    let timer = null;
    // Barrinhas de progresso em cima
    const barras = el("div", { class: "st-barras", "aria-hidden": "true" }, telas.map(() => el("span", {}, [el("i", {})])));
    // Miolo que troca a cada tela
    const miolo = el("div", { class: "st-miolo", "aria-live": "polite" });
    // Botão de voltar tela
    const voltar = el("button", { type: "button", class: "st-lado st-voltar", "aria-label": "Tela anterior" });
    // Botão de avançar tela
    const avancar = el("button", { type: "button", class: "st-lado st-avancar", "aria-label": "Próxima tela" });
    // Modelo escolhido (fica salvo para a próxima vez)
    let modelo = SL.storage.get("sl-story-modelo", "escuro");
    // Botões dos modelos de imagem
    const modelos = el(
      // Grupo
      "div",
      { class: "st-modelos", role: "group", "aria-label": "Modelo da imagem" },
      // Um botão por modelo
      Object.entries(MODELOS).map(([id, mo]) => el("button", { type: "button", class: "st-modelo st-modelo-" + id, "data-modelo": id, "aria-pressed": String(id === modelo), text: mo.nome })),
    );
    // Ao escolher um modelo, marca e salva
    modelos.addEventListener("click", (e) => {
      // Botão
      const b = e.target.closest("[data-modelo]");
      // Se não foi num botão, para
      if (!b) return;
      // Guarda o modelo
      modelo = b.dataset.modelo;
      // Salva
      SL.storage.set("sl-story-modelo", modelo);
      // Marca só o escolhido
      modelos.querySelectorAll("[data-modelo]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    });
    // Botão de baixar a imagem
    const baixar = el("button", { type: "button", class: "btn-primary btn-block", text: "Baixar imagem para postar" });
    // Caixa do stories
    const caixa = el("div", { class: "st" }, [barras, miolo, voltar, avancar]);

    // Mostra uma tela
    function mostrar(i) {
      // Guarda qual é
      atual = Math.max(0, Math.min(telas.length - 1, i));
      // Dados da tela
      const t = telas[atual];
      // Troca o miolo
      miolo.replaceChildren(
        // Textinho de cima
        el("p", { class: "st-kicker", text: t.kicker }),
        // Número grande
        el("strong", { class: "st-numero", text: t.numero }),
        // Legenda
        el("p", { class: "st-legenda", text: t.legenda }),
        // Texto extra (se tiver)
        t.texto ? el("p", { class: "st-texto", text: t.texto }) : null,
      );
      // Atualiza as barrinhas: as anteriores cheias, a atual enchendo
      barras.querySelectorAll("span").forEach((b, k) => (b.className = k < atual ? "is-cheia" : k === atual ? "is-atual" : ""));
      // Reinicia o temporizador (4 segundos por tela)
      clearTimeout(timer);
      // Passa sozinho para a próxima (menos na última)
      if (atual < telas.length - 1) timer = setTimeout(() => mostrar(atual + 1), 4000);
    }
    // Clique no lado esquerdo volta
    voltar.addEventListener("click", () => mostrar(atual - 1));
    // Clique no lado direito avança
    avancar.addEventListener("click", () => mostrar(atual + 1));
    // Baixar a imagem
    baixar.addEventListener("click", () => {
      // Link temporário
      const a = document.createElement("a");
      // Imagem
      a.href = imagem(titulo, telas, modelo);
      // Nome do arquivo
      a.download = "saude-life-resumo.png";
      // Clica nele (baixa)
      a.click();
    });
    // Abre no modal
    SL.openModal(titulo, [caixa, modelos, baixar]);
    // Para o temporizador quando o modal fecha
    const fechar = document.querySelector('[data-action="close-modal"]');
    // (uma vez só)
    if (fechar) fechar.addEventListener("click", () => clearTimeout(timer), { once: true });
    // Mostra a primeira tela
    mostrar(0);
  }

  // Deixa disponível em SL.stories
  SL.stories = { abrir, imagem, MODELOS };
})();
