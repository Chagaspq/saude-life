// Casco do site público: topo com marca e links, conteúdo e rodapé.
import { useEffect, useState } from "react";
import { Logo, Marca, GradienteIcones, Avisos } from "./base.jsx";
import Exibicao from "./Exibicao.jsx";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";

// Botão "voltar ao topo" (aparece depois de rolar 400 px)
function VoltarTopo() {
  // Escondido no começo
  const [escondido, setEscondido] = useState(true);
  // Escuta a rolagem
  useEffect(() => {
    // Confere a posição
    const ver = () => setEscondido(window.scrollY < 400);
    // Liga
    window.addEventListener("scroll", ver, { passive: true });
    // Confere já
    ver();
    // Desliga ao sair
    return () => window.removeEventListener("scroll", ver);
  }, []);
  // Botão
  return (
    <a href="#topo" className={"back-to-top" + (escondido ? " is-hidden" : "")} aria-label="Voltar ao topo">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m18 15-6-6-6 6" />
      </svg>
    </a>
  );
}

// Casco (atual = id da página para marcar o link do topo; classe = classe do <main>; topo = mostra "voltar ao topo")
export default function PublicLayout({ atual, classe, topo, children }) {
  // Página
  return (
    <>
      {/* Degradê dos ícones */}
      <GradienteIcones />
      {/* Topo */}
      <header className="top-bar">
        {/* Marca */}
        <Link to="/" className="brand" aria-current={atual === "welcome" ? "page" : undefined}>
          <Logo tamanho={30} />
          <Marca />
        </Link>
        {/* Links */}
        <nav className="top-bar-actions" aria-label="Navegação principal">
          {/* Exibição (tema, idioma e acessibilidade) */}
          <Exibicao />
          {/* Blog */}
          <Link to="/blog" className="link-entrar" aria-current={atual === "blog" ? "page" : undefined}>
            Blog
          </Link>
          {/* Para academias */}
          <Link to="/academias" className="link-entrar link-esconde-celular" aria-current={atual === "academias" ? "page" : undefined}>
            Para academias
          </Link>
          {/* Planos */}
          <Link to="/planos" className="link-entrar" aria-current={atual === "planos" ? "page" : undefined}>
            Planos
          </Link>
          {/* Entrar */}
          <Link to="/login" className="link-entrar">
            Entrar
          </Link>
          {/* Começar */}
          <Link to="/cadastro" className="btn-criar-conta">
            Começar
          </Link>
        </nav>
      </header>

      {/* Conteúdo */}
      <main id="conteudo" className={classe || undefined}>
        {/* Âncora do topo */}
        {topo && <span id="topo" />}
        {children}
      </main>
      {/* Voltar ao topo */}
      {topo && <VoltarTopo />}

      {/* Rodapé */}
      <footer className="site-footer-public">
        <div className="footer-grid">
          {/* Sobre */}
          <div className="footer-about">
            <Link to="/" className="brand">
              <Logo tamanho={24} id="logo-gradiente-rodape" />
              <Marca />
            </Link>
            <p>Treinos guiados, alimentação e o acompanhamento da sua evolução em um só lugar.</p>
          </div>
          {/* Produto */}
          <nav aria-labelledby="footer-produto">
            <h2 id="footer-produto">Produto</h2>
            <ul>
              <li><Link to="/planos">Planos</Link></li>
              <li><Link to="/blog">Blog de dicas</Link></li>
              <li><Link to="/ajuda">Ajuda</Link></li>
              <li><Link to="/glossario">Glossário</Link></li>
              <li><Link to="/calculadoras">Calculadoras</Link></li>
              <li><Link to="/academias">Para academias</Link></li>
              <li><Link to="/cadastro">Criar conta</Link></li>
              <li><Link to="/login">Entrar</Link></li>
            </ul>
          </nav>
          {/* Legal */}
          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal">Legal</h2>
            <ul>
              <li><Link to="/termos">Termos de Uso</Link></li>
              <li><Link to="/politica">Política de Privacidade</Link></li>
            </ul>
          </nav>
        </div>
        {/* Direitos */}
        <p className="footer-copy">&copy; 2026 Saúde Life. Todos os direitos reservados.</p>
      </footer>
      {/* Avisos rápidos */}
      <Avisos />
    </>
  );
}
