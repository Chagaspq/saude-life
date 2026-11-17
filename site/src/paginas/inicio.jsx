// Início do cliente: resumo da semana, avisos da academia, pontos e próximo treino.
import AppLayout from "../componentes/AppLayout.jsx";
import { Icone, ICONES, CartaoNumero, EstadoVazio, Escudo, Anel } from "../componentes/base.jsx";
import { usuario, estatisticas, historico, treinoAtual, treinosDoUsuario, acharTreino, exerciciosDe, ultimaVez, linkTreino } from "../lib/nucleo.js";
import { num, duracaoTexto, dataRelativa, inicioDaSemana, saudacao, hojeTexto } from "../lib/formato.js";
import { situacaoDaLiga, LIGAS, SOBE } from "../lib/pontos.js";
import { ler } from "../lib/armazenamento.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssApp from "../estilos/app.css?inline";
import cssAppInicio from "../estilos/app-inicio.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssApp, cssAppInicio];

// Letras dos dias (segunda a domingo)
const DIAS = ["S", "T", "Q", "Q", "S", "S", "D"];

// Cartão do próximo treino (ou do que está em andamento)
function ProximoTreino() {
  // Treino em andamento
  const atual = treinoAtual();
  // Treino do andamento
  let treino = atual && acharTreino(atual.treinoId);
  // Sem andamento: o treino feito há mais tempo
  if (!treino) treino = treinosDoUsuario().slice().sort((a, b) => String(ultimaVez(a.id) || "").localeCompare(String(ultimaVez(b.id) || "")))[0];
  // Nenhum treino: estado vazio
  if (!treino)
    return (
      <section aria-labelledby="heading-continue">
        <h2 id="heading-continue">Seu próximo treino</h2>
        <EstadoVazio titulo="Nenhum treino ainda" texto="Crie seu primeiro treino ou escolha um pronto.">
          <Link to="/app/treinos" className="btn-primary">
            Criar meu primeiro treino
          </Link>
        </EstadoVazio>
      </section>
    );
  // Exercícios
  const exercicios = exerciciosDe(treino);
  // Total
  const total = exercicios.length;
  // Feitos (só com andamento)
  const feitos = atual ? atual.feitos || 0 : 0;
  // Próximo exercício
  const proximo = exercicios[Math.min(feitos, total - 1)];
  // Porcentagem
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  // Cartão
  return (
    <section aria-labelledby="heading-continue">
      <h2 id="heading-continue">{atual ? "Continue seu treino" : "Próximo treino sugerido"}</h2>
      <article className="workout-hero">
        {/* Topo */}
        <div className="workout-hero-top">
          <span className="icon-tile icon-tile-coral icon-tile-lg" aria-hidden="true">
            <Icone d={ICONES.haltere} />
          </span>
          <div className="workout-hero-info">
            <h3>{treino.nome}</h3>
            <p className="meta">
              {treino.grupo} • {total} exercícios
            </p>
          </div>
        </div>
        {/* Próximo exercício */}
        <p className="workout-hero-next">
          <span>{atual ? `Exercício ${feitos + 1} de ${total}` : `Última vez: ${dataRelativa(ultimaVez(treino.id))}`}</span>
          <strong>
            {atual ? "Próximo" : "Começa com"}: {proximo?.nome}
          </strong>
        </p>
        {/* Barra (só com andamento) */}
        {atual && (
          <div className="progress-bar-sm" role="progressbar" aria-label="Progresso do treino" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="fill" style={{ width: pct + "%" }} />
          </div>
        )}
        {/* Botão */}
        <Link to={linkTreino(treino.id)} className="btn-primary btn-with-icon">
          <Icone d={ICONES.play} />
          {atual ? "Continuar treino" : "Iniciar treino"}
        </Link>
      </article>
    </section>
  );
}

// Página
function Inicio() {
  // Usuário
  const u = usuario();
  // Números
  const stats = estatisticas();
  // Treinos que faltam para a meta
  const faltam = Math.max(0, stats.meta - stats.nestaSemana);
  // Dias desta semana com treino (0 = segunda)
  const semana = inicioDaSemana(new Date());
  // Conjunto de dias
  const diasComTreino = new Set(historico().filter((h) => new Date(h.data) >= semana).map((h) => (new Date(h.data).getDay() + 6) % 7));
  // Hoje
  const hoje = (new Date().getDay() + 6) % 7;
  // Pontos e liga
  const s = situacaoDaLiga();
  // Avisos do administrador
  const avisos = ler("sl-avisos-admin", []);
  // Página
  return (
    <AppLayout pagina="inicio">
      <section id="view-inicio" className="view-section active" aria-labelledby="heading-inicio">
        {/* Topo */}
        <header className="page-header">
          <div>
            <p className="page-kicker">{hojeTexto()}</p>
            <h1 id="heading-inicio">
              {saudacao()}, {u.primeiro}
            </h1>
            <p className="page-lead">{faltam ? `${faltam > 1 ? "Faltam" : "Falta"} ${faltam} treino${faltam > 1 ? "s" : ""} para bater sua meta da semana.` : "Meta da semana batida. Que tal um treino leve de mobilidade?"}</p>
          </div>
          <Link to="/app/treinos" className="btn-secondary">
            Meus treinos
          </Link>
        </header>

        {/* Resumo */}
        <section aria-labelledby="heading-semana">
          <h2 id="heading-semana" className="sr-only">
            Resumo da sua semana
          </h2>
          <div className="stats-grid stats-grid-4">
            {/* Meta com as bolinhas dos dias */}
            <CartaoNumero rotulo="Meta da semana" valor={`${stats.nestaSemana} de ${stats.meta}`} icone={ICONES.alvo}>
              <div className="week-dots" aria-label={`Treinou em ${diasComTreino.size} dia(s) desta semana`}>
                {DIAS.map((l, i) => (
                  <span key={i} className={"week-dot" + (diasComTreino.has(i) ? " is-done" : "") + (i === hoje ? " is-today" : "")} aria-hidden="true">
                    {l}
                  </span>
                ))}
              </div>
            </CartaoNumero>
            {/* Sequência */}
            <CartaoNumero rotulo="Sequência" valor={`${stats.sequencia} semana${stats.sequencia === 1 ? "" : "s"}`} detalhe="treinando sem parar" icone={ICONES.fogo} />
            {/* Total */}
            <CartaoNumero rotulo="Treinos realizados" valor={num(stats.total)} detalhe="desde que você começou" icone={ICONES.trofeu} cor="emerald" />
            {/* Tempo */}
            <CartaoNumero rotulo="Tempo treinado" valor={duracaoTexto(stats.minutos)} detalhe="somando todos os treinos" icone={ICONES.relogio} cor="emerald" />
          </div>
        </section>

        {/* Avisos da academia */}
        {avisos.length > 0 && (
          <section className="avisos-admin" aria-label="Avisos da sua academia">
            <h2>Avisos da academia</h2>
            <ul className="list-panel">
              {avisos.slice(0, 3).map((a) => (
                <li key={a.data}>
                  <div>
                    <strong>{a.texto}</strong>
                    <span>
                      {a.autor || "Administrador"} • {dataRelativa(a.data)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pontos */}
        <section className="pontos-card" aria-label="Seus pontos da semana">
          <Anel pct={s.pts / SOBE} texto={num(s.pts)} legenda="pontos" />
          <div className="pontos-card-info">
            <div className="pontos-card-liga">
              <Escudo indice={s.atual} ligas={LIGAS} />
              <strong className={`rk-liga-nome liga-${LIGAS[s.atual].id}`}>Liga {LIGAS[s.atual].nome}</strong>
            </div>
            <p className="meta">Cada série, treino, refeição e copo d'água valem pontos. A semana zera toda segunda.</p>
          </div>
        </section>

        {/* Próximo treino */}
        <div className="home-grid home-grid-um">
          <ProximoTreino />
        </div>
      </section>
    </AppLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Inicio;
