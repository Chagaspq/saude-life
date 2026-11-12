// Começo do app React: tema, tradução, sincronização e o roteador com todas as telas.
// Tema e acessibilidade salvos (antes de desenhar, para não piscar)
import "./lib/antes.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { roteador } from "./rotas.jsx";
// Tradução (inglês e espanhol)
import { ligar as ligarIdioma } from "./lib/idioma.js";
// Sincronização com a API (não faz nada sem API)
import { ligarSincronizacao } from "./lib/nuvem.js";

// Liga a sincronização com o servidor (quando tiver)
ligarSincronizacao();

// Desenha o app dentro do <div id="raiz">
createRoot(document.getElementById("raiz")).render(
  <StrictMode>
    <RouterProvider router={roteador} future={{ v7_startTransition: true }} />
  </StrictMode>,
);

// Liga a tradução (se a pessoa escolheu outro idioma)
ligarIdioma();
