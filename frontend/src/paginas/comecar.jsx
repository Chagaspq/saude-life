// Questionário inicial (3 passos): objetivo, nível e dias por semana. Vira a meta da semana.
import { useEffect, useState } from "react";
import AppLayout from "../componentes/AppLayout.jsx";
import { Logo, Marca } from "../componentes/base.jsx";
import { ler, gravar } from "../lib/armazenamento.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssApp from "../estilos/app.css?inline";
import cssAppComecar from "../estilos/app-comecar.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";
// Troca de tela pelo código (React Router)
import { irPara } from "../lib/navegar.js";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssApp, cssAppComecar];

// Objetivos: [valor, título, texto]
const OBJETIVOS = [
  ["Hipertrofia", "Ganhar massa muscular", "Treinos de força com progressão de carga"],
  ["HIIT", "Emagrecer", "Treinos intensos e curtos que queimam mais"],
  ["Resistência", "Melhorar o condicionamento", "Mais fôlego no dia a dia e nos esportes"],
  ["Yoga & Mobilidade", "Flexibilidade e bem-estar", "Mobilidade, alongamento e menos dores"],
];
// Níveis: [valor, texto]
const NIVEIS = [
  ["Iniciante", "Estou começando ou voltando depois de um tempo"],
  ["Intermediário", "Treino há alguns meses com regularidade"],
  ["Avançado", "Treino há anos e conheço bem os exercícios"],
];
// Perguntas de cada passo
const PERGUNTAS = ["Qual é o seu objetivo principal?", "Como está seu nível hoje?", "Quantos dias por semana você quer treinar?"];

// Cartão de escolha (rádio)
function Escolha({ nome, valor, titulo, texto, marcado, onEscolher }) {
  // Cartão
  return (
    <label className="choice-card">
      <input type="radio" name={nome} value={valor} checked={marcado} onChange={onEscolher} />
      <span className="choice-text">
        <strong>{titulo}</strong>
        <small>{texto}</small>
      </span>
    </label>
  );
}

// Página
function Comecar() {
  // Respostas (começa com as anteriores, se tiver)
  const [r, setR] = useState(() => ({ objetivo: "Hipertrofia", nivel: "Intermediário", dias: 4, ...(ler("sl-onboarding", null) || {}) }));
  // Passo (0 a 2)
  const [passo, setPasso] = useState(0);
  // Classes da tela cheia no <body>
  useEffect(() => document.body.classList.add("focus-page", "onboarding-page"), []);
  // Foca a opção marcada ao trocar de passo
  useEffect(() => {
    // Primeiro passo: não rouba o foco
    if (passo) document.querySelector(".onboarding-step:not([hidden]) input:checked")?.focus();
  }, [passo]);
  // Guarda e vai para o Início
  function concluir(resp) {
    // Nome do objetivo
    const rotulo = OBJETIVOS.find((o) => o[0] === resp.objetivo)?.[1];
    // Guarda
    gravar("sl-onboarding", { objetivo: resp.objetivo, nivel: resp.nivel, dias: Number(resp.dias), rotulo, data: new Date().toISOString() });
    // Vai
    irPara("/app/inicio");
  }
  // Porcentagem
  const pct = Math.round(((passo + 1) / 3) * 100);
  // Página
  return (
    <AppLayout pagina="comecar" semMenu>
      <main id="conteudo" className="onboarding" tabIndex="-1">
        <div className="onboarding-card">
          {/* Marca */}
          <Link to="/app/inicio" className="brand" aria-label="Saúde Life">
            <Logo tamanho={30} />
            <Marca />
          </Link>
          {/* Título */}
          <h1 className="onboarding-title">Vamos personalizar seu Saúde Life</h1>
          {/* Progresso */}
          <div className="onboarding-progress">
            <span className="meta">Passo {passo + 1} de 3</span>
            <div className="progress-bar-sm" role="progressbar" aria-label="Progresso do questionário" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div className="fill" style={{ width: pct + "%" }} />
            </div>
          </div>
          {/* Formulário */}
          <form
            id="onboarding-form"
            noValidate
            onSubmit={(e) => {
              // Sem recarregar
              e.preventDefault();
              // Avança ou conclui
              passo < 2 ? setPasso(passo + 1) : concluir(r);
            }}
          >
            {/* Passo 1: objetivo */}
            <fieldset className="onboarding-step" hidden={passo !== 0}>
              <legend>{PERGUNTAS[0]}</legend>
              <div className="choice-list">
                {OBJETIVOS.map(([v, t, x]) => (
                  <Escolha key={v} nome="objetivo" valor={v} titulo={t} texto={x} marcado={r.objetivo === v} onEscolher={() => setR({ ...r, objetivo: v })} />
                ))}
              </div>
            </fieldset>
            {/* Passo 2: nível */}
            <fieldset className="onboarding-step" hidden={passo !== 1}>
              <legend>{PERGUNTAS[1]}</legend>
              <div className="choice-list">
                {NIVEIS.map(([v, x]) => (
                  <Escolha key={v} nome="nivel" valor={v} titulo={v} texto={x} marcado={r.nivel === v} onEscolher={() => setR({ ...r, nivel: v })} />
                ))}
              </div>
            </fieldset>
            {/* Passo 3: dias */}
            <fieldset className="onboarding-step" hidden={passo !== 2}>
              <legend>{PERGUNTAS[2]}</legend>
              <p className="meta">Essa vai ser sua meta semanal. Dá para mudar depois no Perfil.</p>
              <div className="day-chips">
                {[2, 3, 4, 5, 6].map((d) => (
                  <label key={d} className="day-chip">
                    <input type="radio" name="dias" value={d} checked={Number(r.dias) === d} onChange={() => setR({ ...r, dias: d })} />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {/* Botões */}
            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" hidden={passo === 0} onClick={() => setPasso(passo - 1)}>
                Voltar
              </button>
              <button type="submit" className="btn-primary">
                {passo === 2 ? "Começar a treinar" : "Continuar"}
              </button>
            </div>
          </form>
          {/* Pular */}
          <button type="button" className="btn-link onboarding-skip" onClick={() => concluir({ objetivo: "Hipertrofia", nivel: "Intermediário", dias: 4 })}>
            Pular por enquanto
          </button>
        </div>
      </main>
    </AppLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Comecar;
