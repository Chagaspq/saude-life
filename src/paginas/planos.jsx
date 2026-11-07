// Página pública de planos.
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import Planos from "../componentes/Planos.jsx";
import "../estilos/kit-publico.js";
import "../estilos/planos-publico.css";

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
        <Planos cta="../cadastro/cadastro.html" />
      </section>
      {/* Convite */}
      <section className="plans-cta">
        <h2>Pronto pra dar o primeiro passo?</h2>
        <p>Leva menos de um minuto pra criar sua conta.</p>
        <a href="../cadastro/cadastro.html" className="btn-hero-primary">
          Criar conta grátis
        </a>
      </section>
    </PublicLayout>
  );
}

// Desenha
montar(PaginaPlanos);
