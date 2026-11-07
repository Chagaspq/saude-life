// Monta uma página React dentro do <div id="raiz"> do HTML.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Desenha o componente da página
export function montar(Pagina) {
  // Raiz
  createRoot(document.getElementById("raiz")).render(
    <StrictMode>
      <Pagina />
    </StrictMode>,
  );
}
