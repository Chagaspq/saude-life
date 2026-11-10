// Cartões dos planos com a chave mensal/anual (site público e app usam).
import { useState } from "react";
import "../estilos/planos.css";

// Lista dos planos
export const PLANOS = [
  // Free
  { nome: "Free", mensal: 0, itens: ["Treinos básicos da plataforma", "Acompanhamento simples de evolução", "Comunidade e ranking"], cta: "Começar grátis" },
  // Premium
  { nome: "Premium", mensal: 14.9, destaque: true, teste: "30 dias grátis", itens: ["Programas completos e treino automático", "Relatórios avançados de evolução", "Pulso especial e desafios sem limite", "Suporte prioritário"], cta: "Testar 30 dias grátis" },
  // Estudante
  { nome: "Estudante", mensal: 9.9, itens: ["Tudo do Premium", "Para estudantes com matrícula ativa", "Confirmação simples na hora de assinar"], cta: "Assinar Estudante" },
  // Família
  { nome: "Família", mensal: 24.9, itens: ["Tudo do Premium para até 4 pessoas", "Cada um com sua conta e seus dados", "Ranking da família"], cta: "Assinar Família" },
  // Profissional
  { nome: "Profissional", mensal: 49.9, itens: ["Área do profissional completa", "Montar e mandar treinos para alunos", "Relatórios de desempenho dos alunos"], cta: "Assinar Pro" },
  // Academia
  { nome: "Academia", mensal: null, itens: ["Painel do dono com frequência e alunos sumidos", "Desafios e avisos para os alunos", "Relatórios e suporte dedicado"], cta: "Falar com consultor" },
];

// Foto de cada plano (só no site público, com fotos=true)
const FOTO = {
  // Free: abdominal em casa
  Free: "plano-free",
  // Premium: barra na academia
  Premium: "plano-premium",
  // Estudante: flexão com halteres
  Estudante: "plano-estudante",
  // Família: aula em grupo
  Família: "plano-familia",
  // Profissional: rosca com barra
  Profissional: "plano-pro",
  // Academia: salão de musculação
  Academia: "plano-academia",
};

// Desconto do plano anual
export const DESCONTO_ANUAL = 0.2;

// Dinheiro (R$ 14,90)
export const reais = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Preço do card
function Preco({ plano, anual }) {
  // Sob consulta
  if (plano.mensal === null) return <span className="plan-price-value">Consulte</span>;
  // Grátis
  if (plano.mensal === 0) return <span className="plan-price-value">R$ 0</span>;
  // Por mês (com desconto no anual)
  const mensal = anual ? plano.mensal * (1 - DESCONTO_ANUAL) : plano.mensal;
  // Valor
  return (
    <>
      {/* No anual: preço cheio riscado */}
      {anual && <s className="plan-price-old">{reais(plano.mensal)}</s>}
      {/* Preço */}
      <span className="plan-price-value">{reais(mensal)}</span>
      <span className="plan-price-period">/mês</span>
      {/* Total do ano */}
      {anual && <small className="plan-price-note">{reais(mensal * 12)} cobrados por ano</small>}
    </>
  );
}

// Cartões (cta = link do botão no site público; onEscolher = ação no app; atual = plano da pessoa; fotos = cartão com foto em cima; so = mostra só estes planos)
export default function Planos({ cta, onEscolher, atual, fotos, so }) {
  // Mostrando o anual?
  const [anual, setAnual] = useState(false);
  // Chave e grade
  return (
    <div data-planos="" className={fotos ? "plans-vitrine" : undefined}>
      {/* Mensal / anual */}
      <div className="billing-toggle" role="group" aria-label="Período de cobrança">
        <button type="button" className={"billing-option" + (anual ? "" : " is-active")} aria-pressed={!anual} onClick={() => setAnual(false)}>
          Mensal
        </button>
        <button type="button" className={"billing-option" + (anual ? " is-active" : "")} aria-pressed={anual} onClick={() => setAnual(true)}>
          Anual <span className="billing-badge">-20%</span>
        </button>
      </div>
      {/* Cartões */}
      <div className="plans-grid">
        {PLANOS.filter((p) => !so || so.includes(p.nome)).map((p) => {
          // É o plano da pessoa?
          const ehAtual = p.nome === atual;
          // Classe do botão
          const classeBotao = p.destaque ? "plan-btn plan-btn-primary" : "plan-btn plan-btn-secondary";
          // Cartão
          return (
            <article key={p.nome} className={"plan-card" + (p.destaque ? " plan-card-highlight" : "") + (ehAtual ? " plan-card-current" : "")}>
              {/* Foto do plano (site público) */}
              {fotos && <img className="plan-foto" src={`../fotos/${FOTO[p.nome]}.jpg`} alt="" loading="lazy" width="800" height="520" />}
              {/* Etiquetas */}
              {p.destaque && <span className="plan-tag">{fotos ? "Mais vantajoso" : "Mais escolhido"}</span>}
              {ehAtual && <span className="plan-tag plan-tag-current">Seu plano</span>}
              {p.teste && !ehAtual && <span className="plan-teste">{p.teste}</span>}
              {/* Nome */}
              <h2 className="plan-name">{p.nome}</h2>
              {/* Preço */}
              <p className="plan-price">
                <Preco plano={p} anual={anual} />
              </p>
              {/* O que tem */}
              <ul className="plan-features">
                {p.itens.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              {/* Botão */}
              {ehAtual ? (
                <button type="button" className="plan-btn plan-btn-secondary" disabled>
                  Seu plano atual
                </button>
              ) : cta ? (
                <a href={cta} className={classeBotao}>
                  {p.cta}
                </a>
              ) : (
                <button type="button" className={classeBotao} onClick={() => onEscolher(p.nome, anual)}>
                  {p.cta}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
