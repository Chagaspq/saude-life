// Página 404: aparece quando o endereço não existe.
import { montar } from "../montar.jsx";
import { Logo } from "../componentes/base.jsx";
import "../estilos/tokens.css";
import "../estilos/base.css";
import "../estilos/erro404.css";

// Página
function Erro404() {
  // Conteúdo
  return (
    <main className="erro404">
      {/* Logo */}
      <Logo tamanho={48} />
      {/* Número com degradê */}
      <p className="codigo">404</p>
      {/* Título */}
      <h1>Página não encontrada</h1>
      {/* Explicação */}
      <p>O endereço pode ter mudado ou a página não existe mais. Que tal voltar pro começo?</p>
      {/* Botões */}
      <div className="acoes">
        <a href="welcome/welcome.html" className="btn btn-primario">
          Voltar ao início
        </a>
        <a href="app/inicio/inicio.html" className="btn btn-secundario">
          Abrir o app
        </a>
      </div>
    </main>
  );
}

// Desenha
montar(Erro404);
