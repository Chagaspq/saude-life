// Blog de dicas: lista com filtro e busca, dica do dia e leitura do artigo (?a=nome-do-artigo).
import { useEffect, useState } from "react";
import PublicLayout from "../componentes/PublicLayout.jsx";
import { ARTIGOS, DICAS, ICONES_BLOG } from "../lib/blog-artigos.js";
import { simples } from "../lib/formato.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssWelcome from "../estilos/welcome.css?inline";
import cssSite from "../estilos/site.css?inline";
import cssPlanosPublico from "../estilos/planos-publico.css?inline";
import cssBlog from "../estilos/blog.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link, useSearchParams } from "react-router-dom";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssWelcome, cssSite, cssPlanosPublico, cssBlog];

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
      <Link className="btn-hero-primary" to="/cadastro">
        Colocar em prática no Saúde Life
      </Link>
    </article>
  );
}

// Página
function Blog() {
  // Endereço (?a=) lido pelo React Router
  const [parametros, setParametros] = useSearchParams();
  // Artigo aberto (do endereço ?a=)
  const aberto = parametros.get("a");
  // Assunto escolhido
  const [filtro, setFiltro] = useState("Todos");
  // Busca
  const [busca, setBusca] = useState("");
  // Abre um artigo (ou volta para a lista). O "voltar" do navegador funciona sozinho (React Router).
  function abrir(slug) {
    // Atualiza o endereço
    setParametros(slug ? { a: slug } : {});
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
            <Link to="/glossario">Glossário de termos</Link> • <Link to="/calculadoras">Calculadoras (IMC, calorias, água, 1RM)</Link>
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

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Blog;
