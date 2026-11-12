// Efeitos da tela em React: confete e textinhos voando ("+10").
// O resto do app pede com confete() e voarTexto() (src/lib/efeitos.js); este componente desenha e tira depois.
import { useEffect, useState } from "react";
import { EVENTO_EFEITO } from "../lib/efeitos.js";

// Cores da marca para o confete
const CORES = ["#f0845a", "#4fc29a", "#f5b544", "#f5a37f"];
// Quanto tempo cada efeito fica na tela (ms)
const DURACAO = { confete: 2400, "pontos-voando": 1300 };

// Cria os 40 pedacinhos do confete (posição, cor, atraso, giro e lado sorteados)
function pedacos() {
  // Lista de 40
  return Array.from({ length: 40 }, (_, i) => ({
    // Posição na largura da tela
    left: Math.random() * 100 + "%",
    // Cor
    background: CORES[i % CORES.length],
    // Atraso para não caírem juntos
    animationDelay: Math.random() * 0.3 + "s",
    // Giro (variável do CSS)
    "--giro": Math.round(Math.random() * 720 - 360) + "deg",
    // Desvio para o lado (variável do CSS)
    "--lado": Math.round(Math.random() * 160 - 80) + "px",
  }));
}

// Componente (fica uma vez só no app, em src/main.jsx)
export default function Efeitos() {
  // Efeitos na tela agora
  const [lista, setLista] = useState([]);

  // Escuta os pedidos
  useEffect(() => {
    // Número de cada efeito
    let numero = 0;
    // Chegou um pedido
    function chegou(e) {
      // Efeito novo com número e, no confete, os pedacinhos
      const novo = { ...e.detail, id: ++numero, pedacos: e.detail.tipo === "confete" ? pedacos() : null };
      // Entra na tela
      setLista((l) => [...l, novo]);
      // Sai depois do tempo
      setTimeout(() => setLista((l) => l.filter((x) => x.id !== novo.id)), DURACAO[novo.tipo === "confete" ? "confete" : novo.classe] || 1200);
    }
    // Liga
    window.addEventListener(EVENTO_EFEITO, chegou);
    // Desliga ao sair
    return () => window.removeEventListener(EVENTO_EFEITO, chegou);
  }, []);

  // Desenha cada efeito
  return lista.map((ef) =>
    ef.tipo === "confete" ? (
      // Confete: caixa com os pedacinhos
      <div key={ef.id} className="confete">
        {ef.pedacos.map((estilo, i) => (
          <span key={i} style={estilo} />
        ))}
      </div>
    ) : (
      // Texto voando a partir do botão
      <span key={ef.id} className={ef.classe} aria-hidden={ef.escondido || undefined} style={ef.x === null ? undefined : { left: ef.x + "px", top: ef.y + "px" }}>
        {ef.texto}
      </span>
    ),
  );
}
