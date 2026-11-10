// Página pública de planos.
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import Planos from "../componentes/Planos.jsx";
import { BannerFoto, Cabeca, Passos, Duvidas } from "../componentes/Vitrine.jsx";
import Revelar from "../componentes/Revelar.jsx";
import "../estilos/kit-publico.js";
import "../estilos/planos-publico.css";

// Como assinar: [título, texto, foto]
const PASSOS = [
  // Passo 1
  ["Escolha o plano", "Compare os planos e escolha o que combina com a sua rotina.", "passo-1"],
  // Passo 2
  ["Crie sua conta", "Nome, e-mail e senha. Leva menos de um minuto.", "passo-2"],
  // Passo 3
  ["Pague com segurança", "Pagamento pelo Mercado Pago: Pix ou cartão.", "passo-3"],
  // Passo 4
  ["Comece a treinar", "Seu plano já aparece no app. É só abrir o primeiro treino.", "passo-4"],
];

// Dúvidas sobre os planos: [pergunta, resposta]
const PERGUNTAS = [
  // Fidelidade
  ["Tem fidelidade ou multa?", "Não. Você cancela quando quiser e o plano vale até o fim do período já pago."],
  // Anual
  ["Como funciona o plano anual?", "Você paga o ano de uma vez e ganha 20% de desconto no valor de cada mês."],
  // Teste
  ["Como funcionam os 30 dias grátis do Premium?", "Você usa tudo do Premium por 30 dias. Se não quiser continuar, é só cancelar antes do fim do teste."],
  // Estudante
  ["Quem pode assinar o plano Estudante?", "Quem tem matrícula ativa em escola, curso técnico ou faculdade. A confirmação é feita na hora de assinar."],
  // Trocar
  ["Posso trocar de plano depois?", "Pode. Na tela Planos do app você muda de plano quando quiser."],
];

// Página
function PaginaPlanos() {
  // Conteúdo
  return (
    <PublicLayout atual="planos">
      {/* Topo com foto */}
      <BannerFoto foto="planos-topo" chamada="Planos Saúde Life" titulo="Escolha o plano ideal pra sua jornada" texto="Comece de graça e mude de plano quando fizer sentido. Sem fidelidade, cancele quando quiser." />
      {/* Cartões com foto (o botão leva para o cadastro) */}
      <Revelar className="vt-secao" aria-labelledby="titulo-planos">
        {/* Cabeçalho */}
        <Cabeca id="titulo-planos" chamada="Compare" titulo="Todos os planos" texto="No anual você economiza 20%." />
        {/* Cartões */}
        <Planos cta="../cadastro/cadastro.html" fotos />
      </Revelar>
      {/* Como assinar */}
      <Passos id="titulo-passos" chamada="Como assinar" titulo="Em quatro passos você já está treinando" passos={PASSOS} />
      {/* Dúvidas */}
      <Duvidas id="titulo-duvidas" titulo="Dúvidas sobre os planos" perguntas={PERGUNTAS} />
      {/* Convite final com foto */}
      <BannerFoto foto="faixa" titulo="Pronto pra dar o primeiro passo?" texto="Leva menos de um minuto pra criar sua conta.">
        {/* Botão */}
        <a href="../cadastro/cadastro.html" className="vt-btn vt-btn-coral">
          Criar conta grátis
        </a>
      </BannerFoto>
    </PublicLayout>
  );
}

// Desenha
montar(PaginaPlanos);
