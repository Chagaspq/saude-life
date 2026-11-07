// Página inicial pública (welcome): topo com demonstração, recursos, como funciona, dúvidas e convite.
import { useState, useRef } from "react";
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import Revelar from "../componentes/Revelar.jsx";
import { confete, voarTexto } from "../lib/efeitos.js";
import "../estilos/tokens.css";
import "../estilos/base.css";
import "../estilos/welcome.css";
import "../estilos/site.css";

// Séries da demonstração: [nome, carga]
const SERIES = [
  // Série 1
  ["Série 1", "10 × 60 kg"],
  // Série 2
  ["Série 2", "10 × 60 kg"],
  // Série 3
  ["Série 3", "10 × 62,5 kg"],
];

// Recursos: [título, texto, desenho]
const RECURSOS = [
  // Treinos guiados (haltere)
  ["Treinos guiados", "Séries, cargas e descanso explicados passo a passo, do aquecimento ao alongamento.", <><rect className="duo" x="4" y="7" width="3" height="10" rx="1" /><rect className="duo" x="17" y="7" width="3" height="10" rx="1" /><path d="M2 10.5v3" /><path d="M22 10.5v3" /><path d="M7 12h10" /></>],
  // Evolução (gráfico)
  ["Evolução visível", "Gráficos de peso e carga semana a semana pra você ver o esforço virando resultado.", <><path className="duo" stroke="none" d="M4 18 9 12l4 3 7-8v11H4z" /><path d="M4 18 9 12l4 3 7-8" /><circle cx="20" cy="7" r="1.6" /><path d="M3 21h18" /></>],
  // Alimentação (maçã e gota)
  ["Alimentação e água", "Anote as refeições do dia e os copos d'água, com metas calculadas para o seu objetivo.", <><path className="duo" d="M11 20.5c1.3 0 2.2.8 3.3.8 2.4 0 4.7-6.3 4.7-9.6A3.9 3.9 0 0 0 15.1 8c-1.7 0-3.1 1.1-4.1 1.6C10 9.1 8.6 8 6.9 8A3.9 3.9 0 0 0 3 11.7c0 3.3 2.3 9.6 4.7 9.6 1.1 0 2-.8 3.3-.8z" /><path d="M11 9.6c0-2.6 1-4.4 3-5.4" /><path d="M20.5 2.5s1.5 1.8 1.5 2.8a1.5 1.5 0 0 1-3 0c0-1 1.5-2.8 1.5-2.8z" /></>],
  // Acompanhamento (prancheta)
  ["Acompanhamento da academia", "Sua academia ou personal acompanha seu progresso, manda treinos e avisos direto no app.", <><rect className="duo" x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><path d="m9 13.5 2 2 4-4.5" /></>],
];

// Passos: [título, texto]
const PASSOS = [
  // Passo 1
  ["Comece em menos de 1 minuto", "Crie sua conta, diga o que você quer (emagrecer, ganhar massa ou ter mais disposição) e comece a usar. Leva menos de um minuto."],
  // Passo 2
  ["Um plano com a sua cara", "A gente monta treinos e metas de acordo com sua rotina, seu nível e seu objetivo. Se precisar, um profissional ajusta com você."],
  // Passo 3
  ["Veja o progresso acontecer", "Cada treino, cada meta batida, cada pequena vitória fica registrada. Gráficos simples mostram sua evolução real, pra você ver que o esforço está valendo a pena."],
];

// Perguntas: [pergunta, resposta]
const PERGUNTAS = [
  // Grátis
  ["O Saúde Life é gratuito?", "Sim. O plano Free é gratuito para sempre. Os planos pagos liberam treinos personalizados, relatórios avançados e suporte prioritário."],
  // Academia
  ["Preciso ir à academia?", "Não. Há treinos para fazer em casa, sem equipamento, e treinos completos para quem já frequenta academia."],
  // Cancelar
  ["Posso cancelar quando quiser?", "Pode. Não existe fidelidade nem multa: o cancelamento vale no fim do período já pago."],
  // Dados
  ["Meus dados de saúde ficam seguros?", "Sim. Seus dados são usados só para personalizar sua experiência. Veja os detalhes na Política de Privacidade."],
  // Celular
  ["Funciona no celular?", "Funciona. O Saúde Life se adapta a qualquer tela: celular, tablet ou computador."],
];

// Demonstração de séries (marca as 3 e ganha pontos)
function Demo() {
  // Séries feitas
  const [feitas, setFeitas] = useState([false, false, false]);
  // Pontos
  const [pontos, setPontos] = useState(0);
  // Placar (para o "+50" sair dele)
  const placar = useRef(null);
  // Quantas feitas
  const total = feitas.filter(Boolean).length;
  // Volta do anel
  const VOLTA = 2 * Math.PI * 48;
  // Marca ou desmarca uma série
  function marcar(i, botao) {
    // Novo estado
    const novo = feitas.map((f, k) => (k === i ? !f : f));
    // Marcou?
    const marcou = novo[i];
    // Pontos da série
    let pts = pontos + (marcou ? 10 : -10);
    // "+10" voando
    if (marcou) voarTexto(botao, "+10");
    // Completou as 3: bônus do treino
    if (marcou && novo.every(Boolean)) {
      // +50
      pts += 50;
      // Voando do placar
      voarTexto(placar.current, "+50 treino!");
      // Confete
      confete();
    }
    // Guarda
    setFeitas(novo);
    // Guarda
    setPontos(pts);
  }
  // Texto de ajuda
  const texto = total === 3 ? "Treino feito! Agora imagina isso valendo no ranking." : total ? `Boa! Faltam ${3 - total} série${3 - total > 1 ? "s" : ""}.` : "Toque no círculo de cada série.";
  // Cartões
  return (
    <div className="hero-stack">
      {/* Cartão do treino */}
      <div className="mock-card hero-card-workout demo">
        <p className="mock-label">Experimente agora, sem criar conta</p>
        <p className="mock-title">Agachamento livre</p>
        <p className="mock-meta" aria-live="polite">
          {texto}
        </p>
        {/* Séries */}
        <ul className="mock-sets">
          {SERIES.map(([nome, carga], i) => (
            <li key={nome} className={feitas[i] ? "is-done" : ""}>
              <span>{nome}</span>
              <span>{carga}</span>
              {/* Botão de marcar */}
              <button type="button" className="demo-check" aria-pressed={feitas[i]} aria-label={`Marcar a ${nome.toLowerCase()} como feita`} onClick={(e) => marcar(i, e.currentTarget)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        {/* Placar */}
        <p className="demo-pontos" ref={placar}>
          <strong>{pontos}</strong> pontos
        </p>
      </div>
      {/* Anel das séries de hoje */}
      <div className="hero-card-row">
        <div className="mock-card mock-goal hero-card-goal">
          <p className="mock-label">Séries de hoje</p>
          <svg viewBox="0 0 120 120" className="mock-ring" aria-hidden="true">
            <circle cx="60" cy="60" r="48" className="mock-ring-track" />
            <circle cx="60" cy="60" r="48" className="mock-ring-fill" style={{ strokeDashoffset: VOLTA * (1 - total / 3) }} />
          </svg>
          <p className="mock-ring-text">
            <strong>{total}</strong> de 3
          </p>
        </div>
      </div>
    </div>
  );
}

// Página
function Welcome() {
  // Conteúdo
  return (
    <PublicLayout atual="welcome">
      {/* Topo */}
      <div className="hero-faixa">
        {/* Fundo animado (o vídeo entra se existir o arquivo) */}
        <div className="hero-fundo" aria-hidden="true" />
        <section className="hero">
          {/* Textos */}
          <div className="hero-content">
            <p className="hero-kicker">Seu parceiro de treino</p>
            <h1>Progresso de verdade, no seu ritmo.</h1>
            <p className="hero-lead">Registre seus treinos, refeições e evolução em um só lugar. Testa aí do lado: marca uma série.</p>
            {/* Botões */}
            <div className="hero-actions">
              <a href="../cadastro/cadastro.html" className="btn-hero-primary">
                Criar minha conta
              </a>
              <a href="../login/login.html" className="btn-hero-secondary">
                Já tenho conta
              </a>
            </div>
          </div>
          {/* Demonstração */}
          <div className="hero-visual">
            {/* Anéis e batimento ao fundo */}
            <svg className="hero-pulse" viewBox="0 0 320 320" fill="none" aria-hidden="true">
              <circle cx="160" cy="160" r="150" className="pulse-ring pulse-ring-1" />
              <circle cx="160" cy="160" r="110" className="pulse-ring pulse-ring-2" />
              <path d="M 40 170 L 100 170 L 120 110 L 150 220 L 175 90 L 195 170 L 280 170" className="pulse-line" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Demo />
          </div>
        </section>
      </div>

      {/* Recursos */}
      <Revelar className="features" aria-labelledby="features-heading">
        <div className="section-head">
          <p className="section-kicker">Recursos</p>
          <h2 id="features-heading">Tudo o que você precisa pra treinar com constância</h2>
        </div>
        <div className="features-grid">
          {RECURSOS.map(([titulo, texto, desenho]) => (
            <article key={titulo} className="feature">
              {/* Ícone com degradê da marca */}
              <svg className="feature-icon feature-icon-duo" viewBox="0 0 24 24" aria-hidden="true">
                <g stroke="url(#sl-grad)">{desenho}</g>
              </svg>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </Revelar>

      {/* Como funciona */}
      <Revelar className="journey" aria-labelledby="journey-heading">
        <div className="section-head">
          <p className="section-kicker">Como funciona</p>
          <h2 id="journey-heading">Do primeiro clique ao primeiro resultado</h2>
        </div>
        <div className="journey-steps">
          {PASSOS.map(([titulo, texto], i) => (
            <div key={titulo} className="journey-step">
              <div className="journey-step-header">
                <span className="step-num">{i + 1}</span>
                <h3>{titulo}</h3>
              </div>
              <p>{texto}</p>
            </div>
          ))}
        </div>
      </Revelar>

      {/* Dúvidas */}
      <Revelar className="faq" aria-labelledby="faq-heading">
        <div className="section-head">
          <p className="section-kicker">Dúvidas</p>
          <h2 id="faq-heading">Perguntas frequentes</h2>
        </div>
        <div className="faq-list">
          {PERGUNTAS.map(([p, r]) => (
            <details key={p}>
              <summary>{p}</summary>
              <p>{r}</p>
            </details>
          ))}
        </div>
      </Revelar>

      {/* Convite final */}
      <Revelar className="plans-cta">
        <h2>Seu primeiro treino começa hoje.</h2>
        <p>Crie sua conta em menos de um minuto e conheça os planos quando fizer sentido pra você.</p>
        <div className="cta-actions">
          <a href="../cadastro/cadastro.html" className="btn-hero-primary">
            Criar conta grátis
          </a>
          <a href="../planos/planos.html" className="btn-hero-secondary">
            Ver planos
          </a>
        </div>
      </Revelar>
    </PublicLayout>
  );
}

// Desenha a página
montar(Welcome);
