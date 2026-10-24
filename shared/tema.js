/*
 * Tema claro / escuro do Saúde Life.
 * Este arquivo carrega no <head> das páginas, antes de desenhar a tela,
 * para a página já abrir no tema certo (sem piscar escuro e depois claro).
 * Depois que a página carrega, ele coloca o botão de sol/lua no topo.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // O tema claro vale no app e no site público (a escolha é a mesma nos dois)

  // Lê o tema salvo ("claro" ou "escuro")
  function lerTema() {
    // Fora do app, sempre escuro
    // Tenta...
    try {
      // ...ler do navegador
      return localStorage.getItem("sl-tema") || "escuro";
    } catch (e) {
      // Se não der, usa o escuro
      return "escuro";
    }
  }

  // Aplica um tema na página
  function aplicar(tema) {
    // Tema claro: marca o <html> com data-tema="claro"
    if (tema === "claro") document.documentElement.dataset.tema = "claro";
    // Tema escuro: tira a marca
    else delete document.documentElement.dataset.tema;
    // Cor da barra do navegador no celular
    const meta = document.querySelector('meta[name="theme-color"]');
    // Se a página tem essa meta, troca a cor
    if (meta) meta.setAttribute("content", tema === "claro" ? "#f6efe4" : "#0e1512");
  }

  // Aplica o tema salvo agora mesmo (antes de desenhar)
  aplicar(lerTema());

  // Desenho do sol (aparece no tema escuro: "mudar para claro")
  const SOL = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>';
  // Desenho da lua (aparece no tema claro: "mudar para escuro")
  const LUA = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path></svg>';

  // Atualiza o desenho e o nome do botão conforme o tema
  function atualizarBotao(botao) {
    // Tema atual
    const claro = lerTema() === "claro";
    // Desenho: lua no claro, sol no escuro
    botao.innerHTML = claro ? LUA : SOL;
    // Nome para leitores de tela
    botao.setAttribute("aria-label", claro ? "Mudar para o tema escuro" : "Mudar para o tema claro (bom para treinar no sol)");
    // Dica ao passar o mouse
    botao.title = claro ? "Tema escuro" : "Tema claro";
  }

  // Quando a página terminar de carregar, coloca o botão no topo
  document.addEventListener("DOMContentLoaded", function () {
    // Lugar do botão: topo do app, topo da tela de treino ou topo do site
    const lugar = document.querySelector(".topbar-actions, .player-topbar, .top-bar-actions");
    // Cria o botão
    const botao = document.createElement("button");
    // Tipo botão (não envia formulário)
    botao.type = "button";
    // Classe do visual
    botao.className = "btn-icon btn-tema";
    // Desenha o ícone certo
    atualizarBotao(botao);
    // Quando clicam...
    botao.addEventListener("click", function () {
      // ...troca o tema
      const novo = lerTema() === "claro" ? "escuro" : "claro";
      // ...tenta salvar
      try {
        // Salva no navegador
        localStorage.setItem("sl-tema", novo);
      } catch (e) {
        /* armazenamento indisponível: troca só nesta página */
      }
      // ...aplica
      aplicar(novo);
      // ...e troca o ícone
      atualizarBotao(botao);
    });
    // Na tela de treino, fica antes do relógio; nos outros, é o primeiro botão
    const relogio = lugar && lugar.querySelector(".player-clock");
    // Sem topo (ex.: login): botão solto no canto, ao lado do botão de idioma
    if (!lugar) {
      // Marca como solto
      botao.classList.add("btn-tema-solto");
      // Coloca na página
      document.body.append(botao);
    // Na tela de treino, antes do relógio
    } else if (relogio) lugar.insertBefore(botao, relogio);
    // Nos outros, no começo do topo
    else lugar.prepend(botao);
  });

  /* ---------- Acessibilidade: texto maior, contraste, daltônico, modo simples, voz e VLibras ---------- */

  // Lê as escolhas de acessibilidade salvas
  function lerA11y() {
    // Tenta...
    try {
      // ...ler do navegador
      return JSON.parse(localStorage.getItem("sl-a11y")) || {};
    } catch (e) {
      // Se não der, nada escolhido
      return {};
    }
  }

  // Salva as escolhas
  function salvarA11y(a) {
    // Tenta salvar
    try {
      // Guarda
      localStorage.setItem("sl-a11y", JSON.stringify(a));
    } catch (e) {
      /* armazenamento indisponível: vale só nesta página */
    }
  }

  // Aplica as escolhas no <html> (o CSS do base.css faz o resto)
  function aplicarA11y(a) {
    // Raiz da página
    const raiz = document.documentElement;
    // Tamanho do texto (0 a 3); o modo simples já começa no 2
    raiz.dataset.fonte = String(Math.max(a.fonte || 0, a.simples ? 2 : 0));
    // Alto contraste
    raiz.toggleAttribute("data-contraste", Boolean(a.contraste));
    // Cores para daltônicos
    raiz.toggleAttribute("data-daltonico", Boolean(a.daltonico));
    // Modo simples (botões maiores, sem enfeites)
    raiz.toggleAttribute("data-simples", Boolean(a.simples));
  }

  // Aplica agora mesmo (antes de desenhar)
  aplicarA11y(lerA11y());

  // Carrega o VLibras (tradutor em Libras do governo), uma vez só
  function carregarVLibras() {
    // Já carregou: para
    if (document.querySelector("[vw]")) return;
    // Caixa que o VLibras usa
    const caixa = document.createElement("div");
    // Marca do VLibras
    caixa.setAttribute("vw", "");
    // Classe que ele pede
    caixa.className = "enabled";
    // Botão e janela dele
    caixa.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    // Coloca na página
    document.body.append(caixa);
    // Script do VLibras
    const script = document.createElement("script");
    // Endereço oficial
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    // Quando carregar, liga o widget
    script.onload = function () {
      // Liga (se a internet deixar)
      if (window.VLibras) new window.VLibras.Widget("https://vlibras.gov.br/app");
    };
    // Carrega
    document.head.append(script);
  }

  // Lê a página em voz alta (o miolo da página), ou para se já está lendo
  function lerEmVoz(botao) {
    // Navegador sem voz: avisa
    if (!("speechSynthesis" in window)) return alert("Seu navegador não tem leitura em voz.");
    // Se já está falando, para
    if (speechSynthesis.speaking) {
      // Para
      speechSynthesis.cancel();
      // Volta o texto do botão
      botao.textContent = "Ler a página em voz alta";
      // Para aqui
      return;
    }
    // Miolo da página (sem o menu)
    const miolo = document.querySelector("#conteudo, main, .auth-card, body");
    // Texto (o primeiro modal aberto tem prioridade)
    const modal = document.querySelector(".modal-overlay:not(.hidden) .modal-window");
    // Junta o texto visível
    const texto = (modal || miolo).innerText.replace(/\s+/g, " ").slice(0, 4000);
    // Fala
    const fala = new SpeechSynthesisUtterance(texto);
    // Em português do Brasil (ou no idioma da página)
    fala.lang = document.documentElement.lang || "pt-BR";
    // Um pouco mais devagar
    fala.rate = 0.95;
    // Quando terminar, volta o botão
    fala.onend = function () {
      // Texto do botão
      botao.textContent = "Ler a página em voz alta";
    };
    // Começa
    speechSynthesis.speak(fala);
    // Troca o botão
    botao.textContent = "Parar leitura";
  }

  // Ícone de acessibilidade (pessoa de braços abertos)
  const ICONE_A11Y = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"></circle><path d="M4 8.5l8 1.5 8-1.5"></path><path d="M12 10v5"></path><path d="M9 21l3-6 3 6"></path></svg>';

  // Monta o painel de acessibilidade (abre ao tocar no botão)
  function montarPainel(botao) {
    // Painel
    const painel = document.createElement("div");
    // Classe do visual
    painel.className = "a11y-painel";
    // Começa escondido
    painel.hidden = true;
    // É uma janela (para leitores de tela)
    painel.setAttribute("role", "dialog");
    // Nome da janela
    painel.setAttribute("aria-label", "Acessibilidade");
    // Conteúdo
    painel.innerHTML =
      // Título
      '<p class="a11y-titulo">Acessibilidade</p>' +
      // Tamanho do texto
      '<div class="a11y-linha"><span>Tamanho do texto</span><span class="a11y-fonte"><button type="button" data-a11y="menos" aria-label="Diminuir texto">A-</button><button type="button" data-a11y="mais" aria-label="Aumentar texto">A+</button></span></div>' +
      // Chaves
      '<label class="a11y-linha"><span>Alto contraste</span><input type="checkbox" class="switch" role="switch" data-a11y="contraste"></label>' +
      // Daltônico
      '<label class="a11y-linha"><span>Cores para daltônicos</span><input type="checkbox" class="switch" role="switch" data-a11y="daltonico"></label>' +
      // Modo simples
      '<label class="a11y-linha"><span>Modo simples (letras e botões maiores)</span><input type="checkbox" class="switch" role="switch" data-a11y="simples"></label>' +
      // VLibras
      '<label class="a11y-linha"><span>Tradutor em Libras (VLibras)</span><input type="checkbox" class="switch" role="switch" data-a11y="vlibras"></label>' +
      // Voz
      '<button type="button" class="a11y-voz" data-a11y="voz">Ler a página em voz alta</button>';
    // Marca as chaves conforme o salvo
    function marcar() {
      // Escolhas
      const a = lerA11y();
      // Cada chave
      painel.querySelectorAll('input[data-a11y]').forEach(function (c) {
        // Marca
        c.checked = Boolean(a[c.dataset.a11y]);
      });
    }
    // Primeira vez
    marcar();
    // Mudou uma chave
    painel.addEventListener("change", function (e) {
      // Chave
      const c = e.target.closest("input[data-a11y]");
      // Se não foi numa chave, para
      if (!c) return;
      // Escolhas
      const a = lerA11y();
      // Guarda
      a[c.dataset.a11y] = c.checked;
      // Salva
      salvarA11y(a);
      // Aplica
      aplicarA11y(a);
      // VLibras: carrega quando liga (para desligar, recarrega a página sem ele)
      if (c.dataset.a11y === "vlibras") c.checked ? carregarVLibras() : location.reload();
    });
    // Botões (texto e voz)
    painel.addEventListener("click", function (e) {
      // Botão
      const b = e.target.closest("button[data-a11y]");
      // Se não foi num botão, para
      if (!b) return;
      // Voz
      if (b.dataset.a11y === "voz") return lerEmVoz(b);
      // Escolhas
      const a = lerA11y();
      // Aumenta ou diminui (0 a 3)
      a.fonte = Math.max(0, Math.min(3, (a.fonte || 0) + (b.dataset.a11y === "mais" ? 1 : -1)));
      // Salva
      salvarA11y(a);
      // Aplica
      aplicarA11y(a);
    });
    // Abre e fecha
    botao.addEventListener("click", function () {
      // Troca
      painel.hidden = !painel.hidden;
      // Avisa
      botao.setAttribute("aria-expanded", String(!painel.hidden));
      // Ao abrir, foca o primeiro botão
      if (!painel.hidden) painel.querySelector("button").focus();
    });
    // Esc fecha
    painel.addEventListener("keydown", function (e) {
      // Só Esc
      if (e.key !== "Escape") return;
      // Fecha
      painel.hidden = true;
      // Avisa
      botao.setAttribute("aria-expanded", "false");
      // Volta o foco
      botao.focus();
    });
    // Clique fora fecha
    document.addEventListener("click", function (e) {
      // Se clicou fora do painel e do botão, fecha
      if (!painel.hidden && !painel.contains(e.target) && !botao.contains(e.target)) {
        // Fecha
        painel.hidden = true;
        // Avisa
        botao.setAttribute("aria-expanded", "false");
      }
    });
    // Devolve
    return painel;
  }

  // Quando a página carregar, coloca o botão de acessibilidade ao lado do de tema
  document.addEventListener("DOMContentLoaded", function () {
    // Botão de tema (criado acima)
    const tema = document.querySelector(".btn-tema");
    // Cria o botão
    const botao = document.createElement("button");
    // Tipo botão
    botao.type = "button";
    // Visual igual ao do tema
    botao.className = "btn-icon btn-tema btn-a11y" + (tema && tema.classList.contains("btn-tema-solto") ? " btn-tema-solto btn-a11y-solto" : "");
    // Ícone
    botao.innerHTML = ICONE_A11Y;
    // Nome
    botao.setAttribute("aria-label", "Acessibilidade");
    // Dica
    botao.title = "Acessibilidade";
    // Começa fechado
    botao.setAttribute("aria-expanded", "false");
    // Coloca antes do botão de tema (ou no fim da página)
    if (tema && !tema.classList.contains("btn-tema-solto")) tema.before(botao);
    // (página sem topo)
    else document.body.append(botao);
    // Painel
    document.body.append(montarPainel(botao));
    // VLibras ligado: carrega
    if (lerA11y().vlibras) carregarVLibras();
  });

  // Site inteiro offline: registra o service worker (sw.js fica na raiz, uma pasta acima de shared/)
  // Endereço deste arquivo (tema.js), para achar o sw.js a partir dele
  const esteArquivo = document.currentScript && document.currentScript.src;
  // Se o navegador suporta, a página está num servidor e sabemos onde estamos...
  if ("serviceWorker" in navigator && location.protocol.startsWith("http") && esteArquivo) {
    // ...quando a página terminar de carregar, registra (erros são ignorados)
    window.addEventListener("load", () => navigator.serviceWorker.register(new URL("../sw.js", esteArquivo)).catch(() => {}));
  }
})();
