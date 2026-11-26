// Tradução da tela (inglês e espanhol) em React.
// Fora do português, traduz o que o React desenhou e continua traduzindo o que ele desenhar depois
// (troca de tela, janelas, avisos). O idioma é escolhido no painel Exibição.
import { useEffect } from "react";
import { idiomaEscolhido, carregarDicionario, traduzirArvore, traduzirTexto } from "../lib/idioma.js";

// Componente (fica uma vez só no app, em src/main.jsx); não desenha nada
export default function Traducao() {
  // Liga a tradução quando o app abre
  useEffect(() => {
    // Português: nada a traduzir
    if (idiomaEscolhido === "pt") return;
    // Observador das mudanças da tela
    let observador = null;
    // Desligado antes de carregar o dicionário?
    let cancelado = false;
    // Carrega o dicionário e começa
    carregarDicionario().then(() => {
      // Já saiu: nada
      if (cancelado) return;
      // Idioma da página (leitor de tela e corretor)
      document.documentElement.lang = idiomaEscolhido;
      // Título da aba
      document.title = traduzirTexto(document.title);
      // Traduz o que já está na tela
      traduzirArvore(document.body);
      // Observa o que o React desenhar depois
      observador = new MutationObserver((mudancas) =>
        // Cada mudança
        mudancas.forEach((m) => {
          // Elementos ou textos novos
          m.addedNodes.forEach((n) => (n.nodeType === 1 ? traduzirArvore(n) : n.nodeType === 3 && n.parentNode && traduzirArvore(n.parentNode)));
          // Texto que mudou dentro de um elemento
          if (m.type === "characterData" && m.target.parentNode) traduzirArvore(m.target.parentNode);
        }),
      );
      // Liga o observador na página toda
      observador.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    // Ao sair: para de observar
    return () => {
      // Marca como cancelado
      cancelado = true;
      // Desliga
      observador?.disconnect();
    };
  }, []);

  // Não desenha nada (só cuida da tradução)
  return null;
}
