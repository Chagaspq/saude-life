// Página 404: aparece quando o endereço não existe.
import { Logo } from "../componentes/base.jsx";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssErro404 from "../estilos/erro404.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssErro404];

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
        <Link to="/" className="btn btn-primario">
          Voltar ao início
        </Link>
        <Link to="/app/inicio" className="btn btn-secundario">
          Abrir o app
        </Link>
      </div>
    </main>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Erro404;
