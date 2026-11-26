// Tradutor em Libras (VLibras, do governo federal) em React.
// Aparece quando a pessoa liga "Tradutor em Libras" no painel Exibição.
import { useEffect, useState } from "react";
import { lerA11y } from "../lib/exibicao.js";

// Componente (fica uma vez só no app, em src/main.jsx)
export default function VLibras() {
  // Ligado?
  const [ligado, setLigado] = useState(() => !!lerA11y().vlibras);

  // Escuta quando a pessoa muda as escolhas de acessibilidade
  useEffect(() => {
    // Mudou: liga ou desliga
    const mudou = (e) => setLigado(!!e.detail.vlibras);
    // Escuta
    window.addEventListener("sl:a11y", mudou);
    // Para
    return () => window.removeEventListener("sl:a11y", mudou);
  }, []);

  // Ligado: carrega o programa do VLibras (uma vez); ele procura a caixa [vw] que o React desenhou abaixo
  useEffect(() => {
    // Desligado ou já carregado: nada
    if (!ligado || window.VLibras) return;
    // Programa do VLibras
    const script = document.createElement("script");
    // Endereço oficial
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    // Carregou: liga o tradutor
    script.onload = () => window.VLibras && new window.VLibras.Widget("https://vlibras.gov.br/app");
    // Entra na página
    document.head.append(script);
  }, [ligado]);

  // Desligado: nada na tela
  if (!ligado) return null;
  // Caixa que o VLibras usa (botão de acesso e janela do intérprete)
  return (
    <div vw="" className="enabled">
      <div vw-access-button="" className="active" />
      <div vw-plugin-wrapper="">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
}
