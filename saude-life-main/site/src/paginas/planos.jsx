// Página pública de planos.
import PublicLayout from "../componentes/PublicLayout.jsx";
import Planos from "../componentes/Planos.jsx";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssPlanos from "../estilos/planos.css?inline";
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssWelcome from "../estilos/welcome.css?inline";
import cssSite from "../estilos/site.css?inline";
import cssPlanosPublico from "../estilos/planos-publico.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";

// Lista do CSS da tela, na ordem
export const estilos = [cssPlanos, cssTokens, cssBase, cssWelcome, cssSite, cssPlanosPublico];

// Página
function PaginaPlanos() {
  // Conteúdo
  return (
    <PublicLayout atual="planos">
      {/* Topo */}
      <section className="plans-hero">
        <p className="hero-kicker">Planos Saúde Life</p>
        <h1>Escolha o plano ideal pra sua jornada</h1>
        <p className="plans-hero-lead">Comece de graça e evolua pra um plano maior quando fizer sentido pra você. Sem contrato de fidelidade, cancele quando quiser.</p>
      </section>
      {/* Cartões (o botão leva para o cadastro) */}
      <section className="plans-full-grid" aria-label="Comparativo de planos">
        <Planos cta="/cadastro" />
      </section>
      {/* Convite */}
      <section className="plans-cta">
        <h2>Pronto pra dar o primeiro passo?</h2>
        <p>Leva menos de um minuto pra criar sua conta.</p>
        <Link to="/cadastro" className="btn-hero-primary">
          Criar conta grátis
        </Link>
      </section>
    </PublicLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default PaginaPlanos;
