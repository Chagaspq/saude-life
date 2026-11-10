// Blog de dicas: lista com filtro e busca, dica do dia e leitura do artigo (?a=nome-do-artigo).
import { useEffect, useState } from "react";
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import { ARTIGOS, DICAS, ICONES_BLOG } from "../lib/blog-artigos.js";
import { simples } from "../lib/formato.js";
import "../estilos/kit-publico.js";
import "../estilos/planos-publico.css";
import "../estilos/blog.css";

// Assuntos para os filtros ("Todos" primeiro)
const ASSUNTOS = ["Todos", ...new Set(ARTIGOS.map((a) => a.assunto))];

// Capa do artigo: quadrado com o ícone do assunto
function Capa({ icone, grande }) {
  // Quadrado
  return (
    <span className={"blog-capa" + (grande ? " blog-capa-grande" : "")} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {(ICONES_BLOG[icone] || ICONES_BLOG.haltere).map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}

// Artigo aberto
function Artigo({ a, onVoltar }) {
  // Link do artigo
  const link = location.origin + location.pathname + "?a=" + a.slug;
  // Texto do botão de copiar
  const [copiado, setCopiado] = useState(false);
  // Título da aba
  useEffect(() => {
    // Troca
    document.title = `${a.titulo} - Saúde Life`;
    // Sobe para o topo
    window.scrollTo(0, 0);
    // Volta o título ao sair
    return () => (document.title = "Saúde Life - Blog de dicas");
  }, [a]);
  // Leitura
  return (
    <article className="blog-artigo">
      {/* Voltar */}
      <a
        className="blog-voltar"
        href={location.pathname}
        onClick={(e) => {
          // Sem recarregar
          e.preventDefault();
          // Volta
          onVoltar();
        }}
      >
        ← Todos os artigos
      </a>
      {/* Capa */}
      <Capa icone={a.icone} grande />
      {/* Título */}
      <h1>{a.titulo}</h1>
      {/* Autor e tempo */}
      <p className="blog-meta">
        {a.assunto} • {a.autor} • {a.minutos} min de leitura
      </p>
      {/* Texto ("## " vira subtítulo) */}
      {a.texto.map((t, i) => (t.startsWith("## ") ? <h2 key={i}>{t.slice(3)}</h2> : <p key={i}>{t}</p>))}
      {/* Compartilhar */}
      <div className="blog-compartilhar">
        {/* WhatsApp */}
        <a className="blog-btn" href={"https://wa.me/?text=" + encodeURIComponent(`${a.titulo}: ${link}`)} target="_blank" rel="noopener">
          Mandar no WhatsApp
        </a>
        {/* Copiar ou compartilhar */}
        <button
          type="button"
          className="blog-btn"
          onClick={() => {
            // Celular: janela de compartilhar
            if (navigator.share) return navigator.share({ title: a.titulo, url: link }).catch(() => {});
            // Computador: copia
            navigator.clipboard?.writeText(link).then(() => setCopiado(true));
          }}
        >
          {navigator.share ? "Compartilhar" : copiado ? "Link copiado ✓" : "Copiar link"}
        </button>
      </div>
      {/* Aviso */}
      <p className="blog-aviso">Conteúdo educativo. Não substitui a orientação de um profissional de saúde.</p>
      {/* Chamada para o app */}
      <a className="btn-hero-primary" href="../cadastro/cadastro.html">
        Colocar em prática no Saúde Life
      </a>
    </article>
  );
}

// Página
function Blog() {
  // Artigo aberto (do endereço ?a=)
  const [aberto, setAberto] = useState(() => new URLSearchParams(location.search).get("a"));
  // Assunto escolhido
  const [filtro, setFiltro] = useState("Todos");
  // Busca
  const [busca, setBusca] = useState("");
  // Voltar/avançar do navegador abre o artigo certo
  useEffect(() => {
    // Lê o endereço
    const ler = () => setAberto(new URLSearchParams(location.search).get("a"));
    // Escuta
    window.addEventListener("popstate", ler);
    // Para
    return () => window.removeEventListener("popstate", ler);
  }, []);
  // Abre um artigo (ou volta para a lista)
  function abrir(slug) {
    // Atualiza o endereço
    history.pushState({}, "", slug ? `?a=${slug}` : location.pathname);
    // Guarda
    setAberto(slug);
  }
  // Artigo procurado
  const artigo = ARTIGOS.find((a) => a.slug === aberto);
  // Lista filtrada
  const lista = ARTIGOS.filter((a) => (filtro === "Todos" || a.assunto === filtro) && (!busca || simples([a.titulo, a.resumo, ...a.texto].join(" ")).includes(simples(busca))));
  // Dia do ano (troca a dica todo dia)
  const dia = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  // Página
  return (
    <PublicLayout atual="blog">
      {artigo ? (
        // Leitura do artigo
        <Artigo a={artigo} onVoltar={() => abrir(null)} />
      ) : (
        <>
          {/* Topo */}
          <section className="plans-hero">
            <p className="hero-kicker">Blog de dicas</p>
            <h1>Dicas rápidas de quem entende</h1>
            <p className="plans-hero-lead">Treino, alimentação e hábitos em textos curtos, escritos pelos profissionais do Saúde Life.</p>
          </section>
          {/* Dica do dia */}
          <aside className="blog-dica" aria-label="Dica do dia">
            <strong>Dica do dia: </strong>
            <span>{DICAS[dia % DICAS.length]}</span>
          </aside>
          {/* Busca */}
          <div className="blog-busca">
            <label className="sr-only" htmlFor="blog-busca">
              Buscar nos artigos
            </label>
            <input type="search" id="blog-busca" placeholder="Buscar: proteína, sono, agachamento..." autoComplete="off" value={busca} onChange={(e) => setBusca(e.target.value.trimStart())} />
          </div>
          {/* Atalhos */}
          <p className="blog-atalhos">
            <a href="../glossario/glossario.html">Glossário de termos</a> • <a href="../calculadoras/calculadoras.html">Calculadoras (IMC, calorias, água, 1RM)</a>
          </p>
          {/* Filtros */}
          <div className="blog-filtros" role="group" aria-label="Filtrar por assunto">
            {ASSUNTOS.map((as) => (
              <button key={as} type="button" className={"chip" + (as === filtro ? " is-active" : "")} aria-pressed={as === filtro} onClick={() => setFiltro(as)}>
                {as}
              </button>
            ))}
          </div>
          {/* Lista */}
          <section className="blog-lista" aria-label="Artigos">
            {lista.map((a) => (
              <a
                key={a.slug}
                className="blog-card"
                href={`?a=${a.slug}`}
                onClick={(e) => {
                  // Sem recarregar
                  e.preventDefault();
                  // Abre
                  abrir(a.slug);
                }}
              >
                <Capa icone={a.icone} />
                <span className="blog-tag">{a.assunto}</span>
                <h2>{a.titulo}</h2>
                <p>{a.resumo}</p>
                <small className="blog-meta">
                  {a.autor} • {a.minutos} min de leitura
                </small>
              </a>
            ))}
            {/* Nada encontrado */}
            {!lista.length && <p className="blog-vazio">Nenhum artigo com "{busca}". Tente outra palavra.</p>}
          </section>
        </>
      )}
    </PublicLayout>
  );
}

// Desenha
montar(Blog);
