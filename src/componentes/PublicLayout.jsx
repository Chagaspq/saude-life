// Casco do site público: topo com marca e links, conteúdo e rodapé.
import { Logo, Marca, GradienteIcones, Avisos } from "./base.jsx";
import Exibicao from "./Exibicao.jsx";

// Casco (atual = id da página para marcar o link do topo)
export default function PublicLayout({ atual, children }) {
  // Página
  return (
    <>
      {/* Degradê dos ícones */}
      <GradienteIcones />
      {/* Topo */}
      <header className="top-bar">
        {/* Marca */}
        <a href="../welcome/welcome.html" className="brand" aria-current={atual === "welcome" ? "page" : undefined}>
          <Logo tamanho={30} />
          <Marca />
        </a>
        {/* Links */}
        <nav className="top-bar-actions" aria-label="Navegação principal">
          {/* Exibição (tema, idioma e acessibilidade) */}
          <Exibicao />
          {/* Blog */}
          <a href="../blog/blog.html" className="link-entrar" aria-current={atual === "blog" ? "page" : undefined}>
            Blog
          </a>
          {/* Para academias */}
          <a href="../academias/academias.html" className="link-entrar link-esconde-celular" aria-current={atual === "academias" ? "page" : undefined}>
            Para academias
          </a>
          {/* Planos */}
          <a href="../planos/planos.html" className="link-entrar" aria-current={atual === "planos" ? "page" : undefined}>
            Planos
          </a>
          {/* Entrar */}
          <a href="../login/login.html" className="link-entrar">
            Entrar
          </a>
          {/* Começar */}
          <a href="../cadastro/cadastro.html" className="btn-criar-conta">
            Começar
          </a>
        </nav>
      </header>

      {/* Conteúdo */}
      <main id="conteudo">{children}</main>

      {/* Rodapé */}
      <footer className="site-footer-public">
        <div className="footer-grid">
          {/* Sobre */}
          <div className="footer-about">
            <a href="../welcome/welcome.html" className="brand">
              <Logo tamanho={24} id="logo-gradiente-rodape" />
              <Marca />
            </a>
            <p>Treinos guiados, alimentação e o acompanhamento da sua evolução em um só lugar.</p>
          </div>
          {/* Produto */}
          <nav aria-labelledby="footer-produto">
            <h2 id="footer-produto">Produto</h2>
            <ul>
              <li><a href="../planos/planos.html">Planos</a></li>
              <li><a href="../blog/blog.html">Blog de dicas</a></li>
              <li><a href="../ajuda/ajuda.html">Ajuda</a></li>
              <li><a href="../glossario/glossario.html">Glossário</a></li>
              <li><a href="../calculadoras/calculadoras.html">Calculadoras</a></li>
              <li><a href="../academias/academias.html">Para academias</a></li>
              <li><a href="../cadastro/cadastro.html">Criar conta</a></li>
              <li><a href="../login/login.html">Entrar</a></li>
            </ul>
          </nav>
          {/* Legal */}
          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal">Legal</h2>
            <ul>
              <li><a href="../termos/termos.html">Termos de Uso</a></li>
              <li><a href="../politica/politica.html">Política de Privacidade</a></li>
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
