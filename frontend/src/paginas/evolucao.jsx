// Evolução: resumo do período, gráfico do peso, treinos por semana, histórico e metas pessoais.
import { useState } from "react";
import AppLayout from "../componentes/AppLayout.jsx";
import { Icone, ICONES, CartaoNumero, EstadoVazio, Modal } from "../componentes/base.jsx";
import { historico, estatisticas, treinosDoUsuario, exerciciosDe, toast } from "../lib/nucleo.js";
import { num, inicioDaSemana, dataRelativa, duracaoTexto } from "../lib/formato.js";
import { ler, gravar } from "../lib/armazenamento.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssApp from "../estilos/app.css?inline";
import cssAppEvolucao from "../estilos/app-evolucao.css?inline";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssApp, cssAppEvolucao];

// Um dia em milissegundos
const DIA = 86400000;
// Períodos: [semanas, nome]
const PERIODOS = [
  [4, "4 sem."],
  [8, "8 sem."],
  [12, "12 sem."],
  [26, "6 meses"],
  [52, "1 ano"],
];
// Data curta (dd/mm)
const dataCurta = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
// Carga em texto
const kg = (v) => `${num(v, v % 1 ? 1 : 0)} kg`;
// Sinal da variação
const sinal = (v) => (v > 0 ? "+" : v < 0 ? "−" : "");

// Pesos registrados (ou o do perfil, se ainda não registrou)
function pontosPeso() {
  // Registrados
  const reg = ler("sl-pesos", []).map((p) => ({ data: new Date(p.data), valor: p.valor }));
  // Do perfil
  const doPerfil = ler("sl-perfil", {}).peso;
  // Lista em ordem de data
  return (reg.length ? reg : doPerfil ? [{ data: new Date(), valor: Number(doPerfil) }] : []).sort((a, b) => a.data - b.data);
}

// Maiores cargas: dos treinos e dos recordes batidos no app
function listaRecordes() {
  // Batidos
  const batidos = ler("sl-recordes", {});
  // Lista
  const lista = {};
  // Cargas dos treinos
  treinosDoUsuario().forEach((t) => exerciciosDe(t).forEach((e) => e.carga && typeof e.reps === "number" && (lista[e.nome] = Math.max(lista[e.nome] || 0, e.carga))));
  // Recordes
  Object.entries(batidos).forEach(([n, v]) => v >= (lista[n] || 0) && (lista[n] = v));
  // Ordem da maior
  return Object.entries(lista)
    .map(([nome, v]) => ({ nome, v }))
    .sort((a, b) => b.v - a.v);
}

// Gráfico de linha (peso)
function GraficoLinha({ pontos, unidade, casas }) {
  // Menos de 2 pontos: aviso
  if (pontos.length < 2) return <p className="grafico-vazio meta">{pontos.length ? "Registre mais uma vez para ver o gráfico." : "Ainda sem registros. O gráfico aparece quando você começar a registrar."}</p>;
  // Tamanho
  const W = 520;
  // Altura
  const H = 220;
  // Margens
  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  // Valores
  const valores = pontos.map((p) => p.valor);
  // Menor e maior
  const min = Math.min(...valores);
  // Maior
  const max = Math.max(...valores);
  // Folga em cima e embaixo
  const folga = (max - min) * 0.15 || 1;
  // Limites
  const yMin = min - folga;
  // Limite de cima
  const yMax = max + folga;
  // Quantidade
  const n = pontos.length;
  // Posição x
  const x = (i) => pad.left + (i / (n - 1)) * (W - pad.left - pad.right);
  // Posição y
  const y = (v) => pad.top + ((yMax - v) * (H - pad.top - pad.bottom)) / (yMax - yMin);
  // Linha
  const linha = pontos.map((p, i) => `${x(i)},${y(p.valor)}`).join(" ");
  // De quantos em quantos rótulos
  const passo = n > 9 ? 2 : 1;
  // Desenho
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label={`De ${num(valores[0], casas)} para ${num(valores[n - 1], casas)} ${unidade} entre ${dataCurta(pontos[0].data)} e ${dataCurta(pontos[n - 1].data)}`}>
      {/* Linhas de fundo */}
      {[0, 0.5, 1].map((t) => {
        // Valor
        const v = yMin + (yMax - yMin) * t;
        // Linha e rótulo
        return (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(v)} y2={y(v)} className="chart-grid" />
            <text x={pad.left - 8} y={y(v) + 4} className="chart-label" textAnchor="end">
              {num(v, yMax - yMin < 6 ? 1 : 0)}
            </text>
          </g>
        );
      })}
      {/* Datas */}
      {pontos.map((p, i) =>
        (n - 1 - i) % passo ? null : (
          <text key={"d" + i} x={x(i)} y={H - 8} className="chart-label" textAnchor="middle">
            {dataCurta(p.data)}
          </text>
        ),
      )}
      {/* Área */}
      <polygon points={`${x(0)},${H - pad.bottom} ${linha} ${x(n - 1)},${H - pad.bottom}`} className="chart-area" />
      {/* Linha */}
      <polyline points={linha} className="chart-line" />
      {/* Pontos */}
      {pontos.map((p, i) => (
        <circle key={"p" + i} cx={x(i)} cy={y(p.valor)} r={i === n - 1 ? 5 : 4} className={"chart-dot" + (i === n - 1 ? " is-last" : "")}>
          <title>
            {dataCurta(p.data)}: {num(p.valor, casas)} {unidade}
          </title>
        </circle>
      ))}
    </svg>
  );
}

// Gráfico de barras (treinos por semana)
function GraficoFrequencia({ semanas, meta }) {
  // Treinos
  const hist = historico();
  // Começo desta semana
  const hoje = inicioDaSemana(new Date()).getTime();
  // Uma barra por semana
  const barras = Array.from({ length: semanas }, (_, i) => {
    // Começo da semana
    const ini = hoje - (semanas - 1 - i) * 7 * DIA;
    // Treinos nela
    return { data: new Date(ini), qtd: hist.filter((h) => inicioDaSemana(h.data).getTime() === ini).length };
  });
  // Tamanho
  const W = 520;
  // Altura
  const H = 200;
  // Margens
  const pad = { top: 16, right: 12, bottom: 28, left: 28 };
  // Maior valor
  const maxY = Math.max(meta + 1, ...barras.map((b) => b.qtd));
  // Largura de cada barra
  const larg = (W - pad.left - pad.right) / barras.length;
  // Posição y
  const y = (v) => pad.top + ((maxY - v) * (H - pad.top - pad.bottom)) / maxY;
  // Desenho
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label={`Treinos por semana nas últimas ${semanas} semanas. Meta: ${meta} por semana.`}>
      {barras.map((b, i) => {
        // Posição
        const bx = pad.left + i * larg + larg * 0.22;
        // Largura
        const bw = larg * 0.56;
        // Barra e data
        return (
          <g key={i}>
            <rect x={bx} y={y(b.qtd)} width={bw} height={Math.max(0, H - pad.bottom - y(b.qtd))} rx="6" className={"chart-bar" + (b.qtd >= meta ? " is-goal" : "")}>
              <title>
                Semana de {dataCurta(b.data)}: {b.qtd} treino(s)
              </title>
            </rect>
            {(semanas <= 8 || i % 2 === (semanas - 1) % 2) && (
              <text x={bx + bw / 2} y={H - 8} className="chart-label" textAnchor="middle">
                {dataCurta(b.data)}
              </text>
            )}
          </g>
        );
      })}
      {/* Linha da meta */}
      <line x1={pad.left} x2={W - pad.right} y1={y(meta)} y2={y(meta)} className="chart-goal" />
      <text x={pad.left - 8} y={y(meta) + 4} className="chart-label" textAnchor="end">
        {meta}
      </text>
    </svg>
  );
}

// Cartão de uma meta pessoal
function CartaoMeta({ titulo, valor, pct, falta }) {
  // Cartão
  return (
    <article className={"ev-meta" + (pct === 1 ? " is-batida" : "")}>
      <span className="meta">{titulo}</span>
      <strong className="ev-meta-valor">{valor}</strong>
      {pct != null && (
        <div className="progress-bar-sm progress-emerald" role="progressbar" aria-label={`Progresso: ${titulo}`} aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="fill" style={{ width: Math.round(pct * 100) + "%" }} />
        </div>
      )}
      <span className="meta">{falta}</span>
    </article>
  );
}

// Formulário das metas pessoais
function FormMetas({ onSalvar }) {
  // Metas salvas
  const m = ler("sl-metas-pessoais", {}) || {};
  // Campos
  const [c, setC] = useState({ peso: m.peso || "", exercicio: m.exercicio || "", carga: m.carga || "", data: m.data || "" });
  // Muda
  const mudar = (k) => (e) => setC({ ...c, [k]: e.target.value });
  // Formulário
  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Guarda
        gravar("sl-metas-pessoais", { peso: Number(c.peso) || null, pesoInicio: m.pesoInicio || pontosPeso().slice(-1)[0]?.valor || null, exercicio: c.exercicio || null, carga: Number(c.carga) || null, data: c.data || null });
        // Pronto
        onSalvar();
      }}
    >
      <div className="form-group">
        <label htmlFor="mp-peso">Peso alvo (kg)</label>
        <input id="mp-peso" type="number" min="30" max="300" step="0.1" value={c.peso} onChange={mudar("peso")} />
      </div>
      <div className="form-group">
        <label htmlFor="mp-ex">Exercício da meta de carga</label>
        <select id="mp-ex" className="ev-select" value={c.exercicio} onChange={mudar("exercicio")}>
          <option value="">Sem meta de carga</option>
          {listaRecordes().map((r) => (
            <option key={r.nome} value={r.nome}>
              {r.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="mp-carga">Carga alvo (kg)</label>
        <input id="mp-carga" type="number" min="1" max="500" step="0.5" value={c.carga} onChange={mudar("carga")} />
      </div>
      <div className="form-group">
        <label htmlFor="mp-data">Até quando?</label>
        <input id="mp-data" type="date" value={c.data} onChange={mudar("data")} />
      </div>
      <button type="submit" className="btn-primary">
        Salvar metas
      </button>
    </form>
  );
}

// Página
function Evolucao() {
  // Semanas do período
  const [semanas, setSemanas] = useState(8);
  // Janela aberta: "peso" | "metas"
  const [janela, setJanela] = useState("");
  // Peso digitado
  const [pesoNovo, setPesoNovo] = useState("");
  // Começo do período
  const limite = inicioDaSemana(new Date()).getTime() - (semanas - 1) * 7 * DIA;
  // Todos os pesos
  const todosPesos = pontosPeso();
  // Pesos do período
  const peso = todosPesos.filter((p) => p.data.getTime() >= limite);
  // Treinos do período
  const hist = historico().filter((h) => new Date(h.data).getTime() >= limite);
  // Meta da semana
  const meta = estatisticas().meta;
  // Variação do peso
  const varPeso = peso.length ? peso[peso.length - 1].valor - peso[0].valor : 0;
  // Metas pessoais
  const m = ler("sl-metas-pessoais", null);
  // Fecha
  const fechar = () => setJanela("");

  // Cartões das metas
  const cartoes = [];
  // Tem metas
  if (m) {
    // Peso atual
    const pesoAtual = todosPesos.slice(-1)[0]?.valor || m.pesoInicio || 0;
    // Peso do começo
    const pesoInicio = m.pesoInicio || todosPesos[0]?.valor || pesoAtual;
    // Meta de peso
    if (m.peso) {
      // Andou quanto
      const pct = pesoInicio === m.peso ? 1 : Math.max(0, Math.min(1, (pesoInicio - pesoAtual) / (pesoInicio - m.peso)));
      // Cartão
      cartoes.push(<CartaoMeta key="peso" titulo="Peso" valor={`${num(pesoAtual, 1)} → ${num(m.peso, 1)} kg`} pct={pct} falta={Math.abs(pesoAtual - m.peso) < 0.05 ? "Meta batida!" : `Faltam ${num(Math.abs(pesoAtual - m.peso), 1)} kg`} />);
    }
    // Meta de carga
    if (m.exercicio && m.carga) {
      // Recorde
      const rec = listaRecordes().find((r) => r.nome === m.exercicio)?.v || 0;
      // Cartão
      cartoes.push(<CartaoMeta key="carga" titulo={m.exercicio} valor={`${kg(rec)} → ${kg(m.carga)}`} pct={Math.min(1, rec / m.carga)} falta={rec >= m.carga ? "Meta batida!" : `Faltam ${kg(m.carga - rec)}`} />);
    }
    // Prazo
    if (m.data) {
      // Dias
      const dias = Math.ceil((new Date(m.data) - Date.now()) / DIA);
      // Cartão
      cartoes.push(<CartaoMeta key="prazo" titulo="Prazo" valor={new Date(m.data + "T12:00").toLocaleDateString("pt-BR")} pct={null} falta={dias > 0 ? `Faltam ${dias} dias` : "Chegou o dia!"} />);
    }
  }

  // Salva o peso de hoje
  function salvarPeso(e) {
    // Sem recarregar
    e.preventDefault();
    // Valor (aceita vírgula)
    const valor = Math.round(Number(String(pesoNovo).replace(",", ".")) * 10) / 10;
    // Fora da faixa: foca
    if (!(valor >= 30 && valor <= 300)) return document.getElementById("peso-valor").focus();
    // Hoje
    const hoje = new Date().toDateString();
    // Troca o de hoje (se já tinha)
    gravar("sl-pesos", ler("sl-pesos", []).filter((p) => new Date(p.data).toDateString() !== hoje).concat({ data: new Date().toISOString(), valor }));
    // Fecha
    fechar();
    // Avisa
    toast(`Peso registrado: ${num(valor, 1)} kg`);
  }

  // Página
  return (
    <AppLayout pagina="evolucao">
      <section id="view-evolucao" className="view-section active" aria-labelledby="heading-evolucao">
        {/* Topo */}
        <header className="page-header">
          <div>
            <h1 id="heading-evolucao">Evolução</h1>
            <p className="page-lead">Seu progresso semana a semana.</p>
          </div>
          <div className="page-header-actions">
            {/* Período */}
            <div className="segmented" role="group" aria-label="Período dos gráficos">
              {PERIODOS.map(([s, nome]) => (
                <button key={s} type="button" aria-pressed={s === semanas} className={s === semanas ? "is-active" : undefined} onClick={() => setSemanas(s)}>
                  {nome}
                </button>
              ))}
            </div>
            {/* Registrar peso */}
            <button
              className="btn-primary btn-with-icon"
              onClick={() => {
                // Começa com o último peso
                setPesoNovo(todosPesos.slice(-1)[0]?.valor?.toFixed(1) || "");
                // Abre
                setJanela("peso");
              }}
            >
              <Icone d={ICONES.balanca} />
              Registrar peso
            </button>
          </div>
        </header>

        {/* Resumo */}
        <section aria-labelledby="heading-resumo-evolucao">
          <h2 id="heading-resumo-evolucao" className="sr-only">
            Resumo do período
          </h2>
          <div className="stats-grid">
            <CartaoNumero rotulo="Peso atual" valor={peso.length ? `${num(peso[peso.length - 1].valor, 1)} kg` : "—"} detalhe={`${sinal(varPeso)}${num(Math.abs(varPeso), 1)} kg no período`} icone={ICONES.balanca} cor="emerald" />
            <CartaoNumero rotulo="Treinos no período" valor={num(hist.length)} detalhe={`média de ${num(hist.length / semanas, 1)} por semana`} icone={ICONES.calendario} cor="emerald" />
            <CartaoNumero rotulo="Volume levantado" valor={`${num(hist.reduce((s, h) => s + (h.volume || 0), 0) / 1000, 1)} t`} detalhe="soma de carga × repetições" icone={ICONES.trofeu} />
          </div>
        </section>

        {/* Peso e treinos por semana */}
        <div className="evolution-dashboard">
          <figure className="chart-container">
            <figcaption>
              <h2>Peso corporal</h2>
              <span className="chart-meta">Últimas {semanas} semanas</span>
            </figcaption>
            <div>
              {/* Resumo do gráfico */}
              {peso.length ? (
                <p className="chart-summary">
                  <strong>{num(peso[peso.length - 1].valor, 1)} kg</strong>
                  <span className={varPeso <= 0 ? "trend-good" : "trend-bad"}>
                    {sinal(varPeso)}
                    {num(Math.abs(varPeso), 1)} kg no período
                  </span>
                </p>
              ) : null}
              <GraficoLinha pontos={peso} unidade="kg" casas={1} />
            </div>
          </figure>
          <figure className="chart-container">
            <figcaption>
              <h2>Treinos por semana</h2>
              <span className="chart-meta">Linha tracejada: sua meta de {meta} por semana</span>
            </figcaption>
            <GraficoFrequencia semanas={semanas} meta={meta} />
          </figure>
        </div>

        {/* Histórico */}
        <div className="ev-historico">
          <section className="chart-container" aria-labelledby="heading-historico">
            <h2 id="heading-historico">Histórico de treinos</h2>
            <ul className="history-list">
              {!hist.length && <li className="meta">Nenhum treino neste período.</li>}
              {hist.slice(0, 6).map((h) => (
                <li key={h.data} className="history-item">
                  <span className="icon-tile icon-tile-coral" aria-hidden="true">
                    <Icone d={ICONES.check} />
                  </span>
                  <div>
                    <strong>{h.nome}</strong>
                    <span>
                      {dataRelativa(h.data)} • {duracaoTexto(h.duracao)} • {h.series} séries
                    </span>
                  </div>
                  {h.volume ? <span className="tag">{num(h.volume)} kg</span> : null}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Metas pessoais */}
        <section className="ev-painel" aria-labelledby="heading-metas">
          <div className="section-head">
            <h2 id="heading-metas">Minhas metas</h2>
            <button type="button" className="btn-link" onClick={() => setJanela("metas")}>
              Definir metas
            </button>
          </div>
          <div className="ev-metas">
            {cartoes.length ? (
              cartoes
            ) : (
              <EstadoVazio titulo="Defina uma meta" texto="Peso alvo, carga alvo e até quando: o app mostra quanto falta.">
                <button type="button" className="btn-primary" onClick={() => setJanela("metas")}>
                  Definir metas
                </button>
              </EstadoVazio>
            )}
          </div>
        </section>
      </section>

      {/* Registrar peso */}
      <Modal titulo="Registrar peso" aberto={janela === "peso"} onFechar={fechar}>
        <form className="modal-form" onSubmit={salvarPeso}>
          <div className="form-group">
            <label htmlFor="peso-valor">Peso de hoje (kg)</label>
            <input id="peso-valor" type="number" inputMode="decimal" min="30" max="300" step="0.1" required value={pesoNovo} onChange={(e) => setPesoNovo(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">
            Salvar peso
          </button>
        </form>
      </Modal>

      {/* Metas */}
      <Modal titulo="Minhas metas" aberto={janela === "metas"} onFechar={fechar}>
        <FormMetas onSalvar={() => (fechar(), toast("Metas salvas. Bora!"))} />
      </Modal>
    </AppLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Evolucao;
