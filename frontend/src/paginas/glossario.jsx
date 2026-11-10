// Glossário: termos de treino e alimentação explicados em uma frase, com busca e letras.
import { useState } from "react";
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import { TERMOS } from "../lib/glossario-termos.js";
import { simples } from "../lib/formato.js";
import "../estilos/kit-publico.js";
import "../estilos/paginas.css";

// Página
function Glossario() {
  // Texto da busca
  const [busca, setBusca] = useState("");
  // Termos que batem com a busca, em ordem alfabética
  const achados = TERMOS.filter(([t, e]) => !busca || simples(t + " " + e).includes(simples(busca))).sort((x, y) => x[0].localeCompare(y[0], "pt-BR"));
  // Letras que aparecem (a primeira de cada uma ganha a âncora)
  const letras = [...new Set(achados.map(([t]) => simples(t[0]).toUpperCase()))];
  // Letras já marcadas na lista
  const marcadas = new Set();
  // Página
  return (
    <PublicLayout>
      {/* Topo */}
      <section className="plans-hero">
        <p className="hero-kicker">Glossário</p>
        <h1>O que significa cada termo</h1>
        <p className="plans-hero-lead">Série, repetição, drop set, RM, macro... tudo explicado em uma frase.</p>
      </section>
      {/* Busca e lista */}
      <div className="pg-largura">
        {/* Nome escondido do campo */}
        <label className="sr-only" htmlFor="glossario-busca">
          Buscar termo
        </label>
        {/* Campo */}
        <input type="search" id="glossario-busca" className="pg-busca" placeholder="Buscar termo..." autoComplete="off" value={busca} onChange={(e) => setBusca(e.target.value.trimStart())} />
        {/* Letras para pular */}
        <nav className="glossario-letras" aria-label="Pular para a letra">
          {letras.map((l) => (
            <a key={l} href={"#letra-" + l}>
              {l}
            </a>
          ))}
        </nav>
        {/* Termos */}
        <dl className="glossario-lista">
          {achados.map(([t, e]) => {
            // Letra do termo
            const l = simples(t[0]).toUpperCase();
            // Primeira vez da letra: ganha a âncora
            const id = marcadas.has(l) ? undefined : "letra-" + l;
            // Marca
            marcadas.add(l);
            // Termo e explicação
            return [
              <dt key={t} id={id}>
                {t}
              </dt>,
              <dd key={t + "-e"}>{e}</dd>,
            ];
          })}
        </dl>
        {/* Nada encontrado */}
        {!achados.length && <p>Nenhum termo com "{busca}".</p>}
      </div>
    </PublicLayout>
  );
}

// Desenha
montar(Glossario);
