// Botão "Exibição" e o painel com tema, idioma e acessibilidade.
import { useEffect, useRef, useState } from "react";
import { Icone, ICONES } from "./base.jsx";
import { lerA11y, salvarA11y, lerTema, aplicarTema, lerIdioma, trocarIdioma, carregarVLibras, lerEmVoz } from "../lib/exibicao.js";

// Chaves de liga/desliga do painel: [chave, texto]
const CHAVES = [
  // Contraste
  ["contraste", "Alto contraste"],
  // Daltônico
  ["daltonico", "Cores para daltônicos"],
  // Modo simples
  ["simples", "Modo simples (letras e botões maiores)"],
  // VLibras
  ["vlibras", "Tradutor em Libras (VLibras)"],
];

// Botão e painel (solto = páginas sem topo, como o login)
export default function Exibicao({ solto }) {
  // Painel aberto?
  const [aberto, setAberto] = useState(false);
  // Escolhas de acessibilidade
  const [a11y, setA11y] = useState(lerA11y);
  // Tema
  const [tema, setTema] = useState(lerTema);
  // Lendo em voz alta?
  const [lendo, setLendo] = useState(false);
  // Caixa (para fechar ao clicar fora)
  const caixa = useRef(null);
  // Idioma atual
  const idioma = lerIdioma();

  // VLibras ligado: carrega ao abrir a página
  useEffect(() => {
    // Liga
    if (a11y.vlibras) carregarVLibras();
  }, []);

  // Clique fora fecha
  useEffect(() => {
    // Fechado: nada
    if (!aberto) return;
    // Clique
    const fora = (e) => !caixa.current?.contains(e.target) && setAberto(false);
    // Esc
    const tecla = (e) => e.key === "Escape" && setAberto(false);
    // Escuta
    document.addEventListener("mousedown", fora);
    // Escuta
    document.addEventListener("keydown", tecla);
    // Para
    return () => {
      // Tira
      document.removeEventListener("mousedown", fora);
      // Tira
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  // Muda uma escolha de acessibilidade
  function mudar(chave, valor) {
    // Novas escolhas
    const novo = { ...a11y, [chave]: valor };
    // Salva e aplica
    salvarA11y(novo);
    // Guarda no estado
    setA11y(novo);
    // VLibras: liga carregando; desliga recarregando a página
    if (chave === "vlibras") valor ? carregarVLibras() : window.location.reload();
  }

  // Caixa com botão e painel
  return (
    <div className={"exibicao" + (solto ? " exibicao-solta" : "")} ref={caixa}>
      {/* Botão */}
      <button type="button" className={"btn-icon btn-tema btn-a11y" + (solto ? " btn-tema-solto btn-a11y-solto" : "")} aria-label="Exibição: tema, idioma e acessibilidade" title="Exibição e acessibilidade" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
        <Icone d={ICONES.acessibilidade} />
      </button>
      {/* Painel */}
      {aberto && (
        <div className="a11y-painel" role="dialog" aria-label="Exibição e acessibilidade">
          {/* Título */}
          <p className="a11y-titulo">Exibição</p>
          {/* Tema claro */}
          <label className="a11y-linha">
            <span>Tema claro</span>
            <input
              type="checkbox"
              className="switch"
              role="switch"
              checked={tema === "claro"}
              onChange={(e) => {
                // Tema novo
                const novo = e.target.checked ? "claro" : "escuro";
                // Aplica
                aplicarTema(novo);
                // Guarda
                setTema(novo);
              }}
            />
          </label>
          {/* Idioma */}
          <div className="a11y-linha">
            <span>Idioma</span>
            <span className="a11y-fonte" role="group" aria-label="Idioma">
              {/* Um botão por idioma */}
              {["pt", "en", "es"].map((i) => (
                <button key={i} type="button" lang={i} aria-pressed={i === idioma} onClick={() => i !== idioma && trocarIdioma(i)}>
                  {i.toUpperCase()}
                </button>
              ))}
            </span>
          </div>
          {/* Subtítulo */}
          <p className="a11y-sub">Acessibilidade</p>
          {/* Tamanho do texto */}
          <div className="a11y-linha">
            <span>Tamanho do texto</span>
            <span className="a11y-fonte">
              {/* Menor */}
              <button type="button" aria-label="Diminuir texto" onClick={() => mudar("fonte", Math.max(0, (a11y.fonte || 0) - 1))}>
                A-
              </button>
              {/* Maior */}
              <button type="button" aria-label="Aumentar texto" onClick={() => mudar("fonte", Math.min(3, (a11y.fonte || 0) + 1))}>
                A+
              </button>
            </span>
          </div>
          {/* Chaves */}
          {CHAVES.map(([chave, texto]) => (
            <label key={chave} className="a11y-linha">
              <span>{texto}</span>
              <input type="checkbox" className="switch" role="switch" checked={Boolean(a11y[chave])} onChange={(e) => mudar(chave, e.target.checked)} />
            </label>
          ))}
          {/* Voz */}
          <button type="button" className="a11y-voz" onClick={() => setLendo(lerEmVoz())}>
            {lendo ? "Parar leitura" : "Ler a página em voz alta"}
          </button>
        </div>
      )}
    </div>
  );
}
