// Monta uma página React dentro do <div id="raiz"> do HTML.
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { EVENTO_MUDOU } from "./lib/armazenamento.js";

// Redesenha a página toda vez que os dados salvos mudam (nesta aba ou em outra)
function Redesenhar({ Pagina }) {
  // Versão dos dados
  const [versao, setVersao] = useState(0);
  // Escuta as mudanças
  useEffect(() => {
    // Sobe a versão
    const mudou = () => setVersao((v) => v + 1);
    // Mudança nesta aba
    window.addEventListener(EVENTO_MUDOU, mudou);
    // Mudança em outra aba
    window.addEventListener("storage", mudou);
    // Para ao sair
    return () => {
      window.removeEventListener(EVENTO_MUDOU, mudou);
      window.removeEventListener("storage", mudou);
    };
  }, []);
  // Página (a versão nova força o redesenho)
  return <Pagina versao={versao} />;
}

// Desenha o componente da página
export function montar(Pagina) {
  // Raiz
  createRoot(document.getElementById("raiz")).render(
    <StrictMode>
      <Redesenhar Pagina={Pagina} />
    </StrictMode>,
  );
}
