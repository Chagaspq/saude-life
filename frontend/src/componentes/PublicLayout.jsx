// Casco do site público: topo com marca e links, conteúdo e rodapé.
import { useEffect, useState } from "react";
import { Logo, Marca, GradienteIcones, Avisos } from "./base.jsx";
import Exibicao from "./Exibicao.jsx";

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
        {/* Nome da marca gigante no fim da página (só enfeite) */}
        <p className="vt-marca-gigante" aria-hidden="true">
          Saúde Life
        </p>
        {/* Direitos */}
        <p className="footer-copy">&copy; 2026 Saúde Life. Todos os direitos reservados.</p>
      </footer>
      {/* Avisos rápidos */}
      <Avisos />
    </>
  );
}
