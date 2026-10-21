/*
 * Tour guiado pelo Pulso: na primeira vez que a pessoa entra no Início,
 * o Pulso mostra, passo a passo, onde ficam os pontos, o treino do dia,
 * o ranking e a galera. Dá para pular a qualquer hora (botão ou tecla Esc).
 * Fica em SL.tour (SL.tour.abrir() mostra de novo).
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";
  // Se o núcleo do app não carregou, para aqui
  if (!window.SL) return;

  // Pega do núcleo o criador de elementos e o armazenamento
  const { el, storage } = SL;
  // Confere se a pessoa pediu menos animação
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Passos do tour: alvo (lista de seletores, usa o primeiro visível), título e texto
  const PASSOS = [
    // Boas-vindas (sem alvo)
    { titulo: "Oi! Eu sou o Pulso 👋", texto: "Vou ser seu parceiro de treino. Em 30 segundos te mostro como tudo funciona." },
    // Pontos
    { alvo: ['[data-render="pontos"]'], titulo: "Tudo vale ponto", texto: "Cada série, treino, refeição e copo d'água soma pontos. Quanto mais constante, mais pontos." },
    // Treino do dia
    { alvo: ['[data-render="continue"]'], titulo: "Seu treino de hoje", texto: "Seu próximo treino fica sempre aqui. Um toque e você começa." },
    // Ranking
    { alvo: ['.bottom-nav-link[data-pagina="ranking"]', '.sidebar-nav a[href*="ranking"]'], titulo: "Ranking da semana", texto: "Toda segunda o placar zera. Suba de liga: Bronze, Prata, Ouro e Diamante." },
    // Galera
    { alvo: ['.bottom-nav-link[data-pagina="comunidade"]', '.sidebar-nav a[href*="comunidade"]'], titulo: "Traga a galera", texto: "Adicione amigos pelo código, crie desafios e mande um cutucão em quem sumiu. 😉" },
    // Fim
    { titulo: "Bora pro primeiro treino?", texto: "Eu fico aqui no Início com um recado por dia. Bom treino!" },
  ];

  // Diz se um elemento está visível na tela (não escondido nem fora da tela)
  function visivel(elemento) {
    // Tamanho e posição
    const r = elemento.getBoundingClientRect();
    // Tem tamanho e está dentro da largura da tela
    return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth;
  }

  // Abre o tour
  function abrir() {
    // Se já está aberto, não abre de novo
    if (document.querySelector(".tour")) return;
    // Passo atual
    let atual = 0;
    // Elemento que estava com foco (para devolver no fim)
    const focoAntes = document.activeElement;
    // Recorte que destaca o alvo (escurece o resto da tela)
    const destaque = el("div", { class: "tour-destaque", "aria-hidden": "true" });
    // Título do balão
    const titulo = el("h2", { id: "tour-titulo", class: "tour-titulo" });
    // Texto do balão
    const texto = el("p", { class: "tour-texto" });
    // Bolinhas dos passos
    const bolinhas = el("div", { class: "tour-bolinhas", "aria-hidden": "true" }, PASSOS.map(() => el("span", {})));
    // Botão de pular
    const pular = el("button", { type: "button", class: "btn-secondary tour-pular", text: "Pular" });
    // Botão de avançar
    const proximo = el("button", { type: "button", class: "btn-primary", text: "Próximo" });
    // Balão com o Pulso
    const balao = el("div", { class: "tour-balao", role: "dialog", "aria-modal": "true", "aria-labelledby": "tour-titulo" }, [
      // Pulso pequeno, comemorando
      el("div", { class: "tour-pulso" }, [SL.personagem ? SL.personagem.desenhar({ humor: "comemorando" }) : null]),
      // Textos
      el("div", { class: "tour-conteudo" }, [
        // Título
        titulo,
        // Texto
        texto,
        // Rodapé com bolinhas e botões
        el("div", { class: "tour-rodape" }, [bolinhas, el("div", { class: "tour-botoes" }, [pular, proximo])]),
      ]),
    ]);
    // Caixa que junta tudo
    const tour = el("div", { class: "tour" }, [destaque, balao]);

    // Alvo do passo atual (o primeiro seletor visível), ou nada
    function alvoAtual() {
      // Seletores do passo
      const lista = PASSOS[atual].alvo || [];
      // Para cada seletor...
      for (const seletor of lista) {
        // ...procura o elemento
        const achado = document.querySelector(seletor);
        // ...se achou e está visível, usa ele
        if (achado && visivel(achado)) return achado;
      }
      // Nenhum alvo visível
      return null;
    }

    // Coloca o recorte em volta do alvo e o balão no lugar certo
    function posicionar() {
      // Alvo do passo
      const alvo = alvoAtual();
      // Sem alvo: recorte some (a tela fica toda escura) e o balão vai para o meio
      if (!alvo) {
        // Marca "sem alvo"
        destaque.classList.add("is-vazio");
        // Balão no meio
        balao.dataset.lugar = "meio";
        // Para aqui
        return;
      }
      // Tem alvo
      destaque.classList.remove("is-vazio");
      // Posição do alvo na tela
      const r = alvo.getBoundingClientRect();
      // Folga em volta do alvo
      const folga = 8;
      // Recorte: esquerda
      destaque.style.left = r.left - folga + "px";
      // Recorte: topo
      destaque.style.top = r.top - folga + "px";
      // Recorte: largura
      destaque.style.width = r.width + folga * 2 + "px";
      // Recorte: altura
      destaque.style.height = r.height + folga * 2 + "px";
      // Balão em cima se o alvo está na metade de baixo; senão, embaixo
      balao.dataset.lugar = r.top + r.height / 2 > window.innerHeight / 2 ? "cima" : "baixo";
    }

    // Mostra um passo
    function mostrar(i) {
      // Guarda o passo
      atual = i;
      // Dados do passo
      const p = PASSOS[i];
      // Escreve o título
      titulo.textContent = p.titulo;
      // Escreve o texto
      texto.textContent = p.texto;
      // Último passo: botão vira "Começar" e o pular some
      proximo.textContent = i === PASSOS.length - 1 ? "Começar" : "Próximo";
      // Esconde o pular no último passo
      pular.hidden = i === PASSOS.length - 1;
      // Acende as bolinhas até o passo atual
      bolinhas.querySelectorAll("span").forEach((b, k) => b.classList.toggle("is-ativa", k <= i));
      // Alvo do passo
      const alvo = alvoAtual();
      // Rola até o alvo (no meio da tela)
      if (alvo) alvo.scrollIntoView({ block: "center", behavior: reduzir ? "auto" : "smooth" });
      // Posiciona agora e de novo depois da rolagem
      posicionar();
      // (depois que a rolagem suave termina)
      setTimeout(posicionar, reduzir ? 0 : 400);
      // Foco no botão principal
      proximo.focus();
    }

    // Fecha o tour e marca como visto
    function fechar() {
      // Marca como visto
      storage.set("sl-tour", { visto: true, data: new Date().toISOString() });
      // Tira da tela
      tour.remove();
      // Para de ouvir rolagem e tamanho da tela
      window.removeEventListener("resize", posicionar);
      // (rolagem)
      window.removeEventListener("scroll", posicionar, true);
      // Para de ouvir o teclado
      document.removeEventListener("keydown", teclado);
      // Devolve o foco
      if (focoAntes && focoAntes.focus) focoAntes.focus();
    }

    // Teclado: Esc fecha; Tab fica preso entre os botões do balão
    function teclado(e) {
      // Esc pula o tour
      if (e.key === "Escape") return fechar();
      // Só cuida do Tab daqui pra baixo
      if (e.key !== "Tab") return;
      // Botões que podem receber foco
      const botoes = [pular, proximo].filter((b) => !b.hidden);
      // Posição do foco atual
      const pos = botoes.indexOf(document.activeElement);
      // Impede o Tab de sair do balão
      e.preventDefault();
      // Vai para o próximo (ou o anterior com Shift)
      botoes[(pos + (e.shiftKey ? -1 : 1) + botoes.length) % botoes.length].focus();
    }

    // Botão próximo: avança ou termina
    proximo.addEventListener("click", () => (atual < PASSOS.length - 1 ? mostrar(atual + 1) : fechar()));
    // Botão pular fecha
    pular.addEventListener("click", fechar);
    // Recalcula ao mudar o tamanho da tela
    window.addEventListener("resize", posicionar);
    // Recalcula ao rolar
    window.addEventListener("scroll", posicionar, true);
    // Ouve o teclado
    document.addEventListener("keydown", teclado);
    // Coloca na página
    document.body.append(tour);
    // Mostra o primeiro passo
    mostrar(0);
  }

  // Deixa disponível em SL.tour
  SL.tour = { abrir };

  // Primeira vez no app (já respondeu o questionário e ainda não viu o tour): abre sozinho
  SL.pagina(() => {
    // Se já viu, não abre
    if (storage.get("sl-tour", null)) return;
    // Espera a página desenhar os cards (contagem de números etc.)
    setTimeout(abrir, 700);
  });
})();
