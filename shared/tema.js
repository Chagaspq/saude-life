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

  // Site inteiro offline: registra o service worker (sw.js fica na raiz, uma pasta acima de shared/)
  // Endereço deste arquivo (tema.js), para achar o sw.js a partir dele
  const esteArquivo = document.currentScript && document.currentScript.src;
  // Se o navegador suporta, a página está num servidor e sabemos onde estamos...
  if ("serviceWorker" in navigator && location.protocol.startsWith("http") && esteArquivo) {
    // ...quando a página terminar de carregar, registra (erros são ignorados)
    window.addEventListener("load", () => navigator.serviceWorker.register(new URL("../sw.js", esteArquivo)).catch(() => {}));
  }
})();
