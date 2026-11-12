// Começo do app React: tema salvo, roteador com todas as telas, efeitos, tradução e Libras.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { roteador } from "./rotas.jsx";
// Confete e "+10" voando
import Efeitos from "./componentes/Efeitos.jsx";
// Tradução (inglês e espanhol)
import Traducao from "./componentes/Traducao.jsx";
// Tradutor em Libras
import VLibras from "./componentes/VLibras.jsx";
// Tema e acessibilidade salvos
import { lerTema, aplicarTema, lerA11y, aplicarA11y } from "./lib/exibicao.js";
// Sincronização com a API (não faz nada sem API)
import { ligarSincronizacao } from "./lib/nuvem.js";

// Antes de desenhar: aplica o tema (claro/escuro) e as escolhas de acessibilidade salvas (a tela já abre certa)
aplicarTema(lerTema());
// Texto maior, contraste, daltônico e modo simples
aplicarA11y(lerA11y());

// Cópia offline antiga do site (de versões velhas): desliga e apaga, para abrir sempre a versão nova
if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations().then((l) => l.forEach((r) => r.unregister())).catch(() => {});
// Arquivos guardados por essa cópia antiga: apaga
if ("caches" in window) caches.keys().then((n) => n.forEach((k) => caches.delete(k))).catch(() => {});

// Liga a sincronização com o servidor (quando tiver)
ligarSincronizacao();

// Desenha o app dentro do <div id="raiz">
createRoot(document.getElementById("raiz")).render(
  <StrictMode>
    {/* Telas (React Router) */}
    <RouterProvider router={roteador} future={{ v7_startTransition: true }} />
    {/* Efeitos de comemoração */}
    <Efeitos />
    {/* Tradução */}
    <Traducao />
    {/* Libras */}
    <VLibras />
  </StrictMode>,
);
