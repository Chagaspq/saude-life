// Alimentação: metas do dia (calorias e macros), refeições de hoje, água e "repetir ontem".
import { useEffect, useState } from "react";
import { montar } from "../montar.jsx";
import AppLayout from "../componentes/AppLayout.jsx";
import { Icone, ICONES, Modal } from "../componentes/base.jsx";
import { dadosCorpo, onboarding, toast } from "../lib/nucleo.js";
import { num, slug, hojeTexto } from "../lib/formato.js";
import { ler, gravar } from "../lib/armazenamento.js";
import { ganhar, perder } from "../lib/pontos.js";
import { ALIMENTOS } from "../lib/alimentos.js";
import { SL_DADOS } from "../lib/dados.js";
import "../estilos/kit-app.js";
import "../estilos/app-alimentacao.css";

// Tamanho do copo (ml)
const COPO = 250;
// Macros: [chave, nome, unidade, cor]
const MACROS = [
  ["kcal", "Calorias", "kcal", "coral"],
  ["proteina", "Proteínas", "g", "emerald"],
  ["carbo", "Carboidratos", "g", "warning"],
  ["gordura", "Gorduras", "g", "info"],
];
// Comidas sugeridas quando a pessoa põe a foto do prato
const DO_PRATO = ["Arroz branco", "Feijão carioca", "Peito de frango grelhado", "Bife de patinho", "Ovo cozido", "Salada verde com tomate", "Batata-doce cozida", "Macarrão cozido", "Tofu grelhado", "Farofa"];

// Dia de hoje (texto)
const hoje = () => new Date().toDateString();
// Hora agora (00:00)
const horaAgora = () => new Date().toTimeString().slice(0, 5);

// Metas do dia (calculadas ou as da nutricionista)
function calcularMetas() {
  // Manual: as digitadas
  if (ler("sl-metas-modo", "auto") === "manual") return ler("sl-metas-manual", SL_DADOS.METAS_NUTRICAO);
  // Corpo
  const { peso, altura, idade } = dadosCorpo();
  // Objetivo e dias
  const { objetivo, dias } = onboarding();
  // Gasto em repouso (média entre homem e mulher)
  const repouso = 10 * peso + 6.25 * altura - 5 * idade - 78;
  // Atividade pelos dias de treino
  const atividade = dias <= 2 ? 1.375 : dias <= 4 ? 1.55 : 1.725;
  // Ajuste do objetivo
  const ajuste = { Hipertrofia: 300, HIIT: -400 }[objetivo] || 0;
  // Proteína por kg
  const protKg = { Hipertrofia: 2, HIIT: 1.8, Resistência: 1.6 }[objetivo] || 1.4;
  // Calorias (de 10 em 10)
  const kcal = Math.round((repouso * atividade + ajuste) / 10) * 10;
  // Proteína
  const proteina = Math.round(peso * protKg);
  // Gordura
  const gordura = Math.round(peso * 0.9);
  // Carboidrato (o resto)
  const carbo = Math.max(0, Math.round((kcal - proteina * 4 - gordura * 9) / 4));
  // Água (35 ml por kg, de copo em copo)
  const aguaMl = Math.round((peso * 35) / COPO) * COPO;
  // Metas
  return { kcal, proteina, carbo, gordura, aguaMl };
}

// Refeições de hoje
function refeicoes() {
  // Salvas
  const s = ler("sl-refeicoes", null);
  // Só valem as de hoje
  return s && s.data === hoje() ? s.itens : SL_DADOS.REFEICOES_PADRAO.slice();
}
// Guarda as refeições de hoje (e um histórico de 14 dias para o "repetir ontem")
function guardarRefeicoes(itens) {
  // Hoje
  gravar("sl-refeicoes", { data: hoje(), itens });
  // Histórico
  const dias = ler("sl-refeicoes-dias", {});
  // Sem foto (ocupa espaço)
  dias[hoje()] = itens.map((x) => ({ ...x, foto: "" }));
  // 14 dias mais novos
  const chaves = Object.keys(dias).sort((a, b) => new Date(b) - new Date(a)).slice(0, 14);
  // Guarda
  gravar("sl-refeicoes-dias", Object.fromEntries(chaves.map((k) => [k, dias[k]])));
}
// Água de hoje (ml)
function agua() {
  // Salva
  const s = ler("sl-agua", null);
  // Só vale a de hoje
  return s && s.data === hoje() ? s.ml : 0;
}

// Soma os nutrientes de [[nome, porções]]
function somarAlimentos(lista) {
  // Total
  const t = { kcal: 0, proteina: 0, carbo: 0, gordura: 0 };
  // Cada alimento
  lista.forEach(([nome, p]) => {
    // Alimento
    const a = ALIMENTOS.find((x) => x.nome === nome);
    // Soma
    if (a) Object.keys(t).forEach((k) => (t[k] += a[k] * p));
  });
  // Arredonda
  Object.keys(t).forEach((k) => (t[k] = Math.round(t[k])));
  // Devolve
  return t;
}
// Descreve [[nome, porções]] em texto
const descrever = (lista) => lista.map(([nome, p]) => (p === 1 ? nome : `${String(p).replace(".", ",")}× ${nome}`)).join(", ");

// Diminui uma foto (lado maior) e devolve em texto
function diminuirFoto(arquivo, lado) {
  // Promessa
  return new Promise((ok) => {
    // Imagem
    const img = new Image();
    // Carregou
    img.onload = () => {
      // Escala
      const e = Math.min(1, lado / Math.max(img.width, img.height));
      // Tela
      const c = document.createElement("canvas");
      // Largura
      c.width = Math.round(img.width * e);
      // Altura
      c.height = Math.round(img.height * e);
      // Desenha
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      // Devolve
      ok(c.toDataURL("image/jpeg", 0.7));
      // Libera
      URL.revokeObjectURL(img.src);
    };
    // Abre
    img.src = URL.createObjectURL(arquivo);
  });
}

// Garrafa de água (nível de 0 a 1)
function Garrafa({ nivel }) {
  // Forma da garrafa
  const forma = "M30 6h20v14c0 6 16 12 16 30v94a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V50c0-18 16-24 16-30z";
  // Altura da água
  const topo = 154 - nivel * 134;
  // Desenho
  return (
    <svg viewBox="0 0 80 160">
      <defs>
        <clipPath id="garrafa-corte">
          <path d={forma} />
        </clipPath>
      </defs>
      <path d={forma} className="garrafa-vidro" />
      <g clipPath="url(#garrafa-corte)">
        <path d={`M-80 ${topo} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V160 H-80z`} className="garrafa-agua" />
      </g>
      <path d={forma} className="garrafa-contorno" />
      <path d="M22 60v70" className="garrafa-brilho" />
    </svg>
  );
}

// Barra de progresso
const Barra = ({ pct, rotulo, cor }) => (
  <div className={`progress-bar-sm progress-${cor}`} role="progressbar" aria-label={rotulo} aria-valuenow={Math.min(100, pct)} aria-valuemin={0} aria-valuemax={100}>
    <div className="fill" style={{ width: Math.min(100, pct) + "%" }} />
  </div>
);

// Formulário de adicionar refeição (com busca de comidas que calcula sozinha)
function FormRefeicao({ onSalvar }) {
  // Campos
  const [c, setC] = useState({ nome: "", hora: horaAgora(), desc: "", kcal: "", proteina: "", carbo: "", gordura: "" });
  // Busca
  const [busca, setBusca] = useState("");
  // Comidas escolhidas [[alimento, porções]]
  const [escolhidos, setEscolhidos] = useState([]);
  // Foto
  const [foto, setFoto] = useState("");
  // Comidas do prato já usadas
  const [usados, setUsados] = useState([]);
  // Muda um campo
  const mudar = (k) => (e) => setC({ ...c, [k]: e.target.value });
  // Atualiza as comidas escolhidas e recalcula os campos
  function escolher(lista) {
    // Guarda
    setEscolhidos(lista);
    // Soma
    const t = somarAlimentos(lista.map(([a, p]) => [a.nome, p]));
    // Preenche
    setC((x) => ({ ...x, ...t, desc: descrever(lista.map(([a, p]) => [a.nome, p])) }));
  }
  // Adiciona uma porção de um alimento
  function adicionar(nome) {
    // Alimento
    const a = ALIMENTOS.find((x) => x.nome === nome);
    // Não existe
    if (!a) return;
    // Já tem: +1
    const ja = escolhidos.find(([x]) => x === a);
    // Lista nova
    escolher(ja ? escolhidos.map(([x, p]) => [x, x === a ? p + 1 : p]) : escolhidos.concat([[a, 1]]));
    // Limpa a busca
    setBusca("");
  }
  // Muda a porção (meia em meia)
  const mudarPorcao = (i, d) => escolher(escolhidos.map(([a, p], k) => [a, k === i ? p + d : p]).filter(([, p]) => p > 0));
  // Resultados da busca
  const achados = busca.trim() ? ALIMENTOS.filter((a) => slug(a.nome).includes(slug(busca))).slice(0, 6) : [];
  // Número inteiro positivo
  const n = (v) => Math.max(0, Math.round(Number(v) || 0));
  // Formulário
  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Sem nome: foca
        if (!c.nome.trim()) return document.getElementById("ref-nome").focus();
        // Salva
        onSalvar({ id: "r" + Date.now(), nome: c.nome.trim(), hora: c.hora || horaAgora(), descricao: c.desc.trim(), kcal: n(c.kcal), proteina: n(c.proteina), carbo: n(c.carbo), gordura: n(c.gordura), foto });
      }}
    >
      {/* Nome e horário */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ref-nome">Refeição</label>
          <input id="ref-nome" placeholder="Ex: Lanche da tarde" required maxLength={40} value={c.nome} onChange={mudar("nome")} />
        </div>
        <div className="form-group">
          <label htmlFor="ref-hora">Horário</label>
          <input id="ref-hora" type="time" required value={c.hora} onChange={mudar("hora")} />
        </div>
      </div>
      {/* Busca de comidas */}
      <div className="alim">
        <label className="alim-titulo" htmlFor="alim-busca">
          Buscar comida (calcula sozinho)
        </label>
        <input id="alim-busca" type="search" className="alim-busca" placeholder="Buscar comida (arroz, frango, tapioca…)" autoComplete="off" value={busca} onChange={(e) => setBusca(e.target.value)} />
        {/* Resultados */}
        <ul className="alim-resultados">
          {achados.map((a) => (
            <li key={a.nome}>
              <button type="button" onClick={() => adicionar(a.nome)}>
                <strong>{a.nome}</strong>
                <small className="meta">
                  {" "}
                  {a.porcao} • {a.kcal} kcal
                </small>
              </button>
            </li>
          ))}
        </ul>
        {/* Escolhidos */}
        <ul className="alim-escolhidos">
          {escolhidos.map(([a, p], i) => (
            <li key={a.nome}>
              <span>
                <strong>{a.nome}</strong>
                <small className="meta"> {a.porcao}</small>
              </span>
              <button type="button" className="btn-icon" aria-label={`Menos ${a.nome}`} onClick={() => mudarPorcao(i, -0.5)}>
                −
              </button>
              <strong className="alim-qtd">{String(p).replace(".", ",")}×</strong>
              <button type="button" className="btn-icon" aria-label={`Mais ${a.nome}`} onClick={() => mudarPorcao(i, 0.5)}>
                +
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Descrição */}
      <div className="form-group">
        <label htmlFor="ref-desc">O que você comeu</label>
        <input id="ref-desc" placeholder="Ex: Pão integral com ovo" maxLength={120} value={c.desc} onChange={mudar("desc")} />
      </div>
      {/* Números */}
      <div className="form-row form-row-4">
        {[
          ["ref-kcal", "Calorias", "kcal", 3000, "kcal"],
          ["ref-prot", "Proteína", "proteina", 300, "g"],
          ["ref-carbo", "Carbo", "carbo", 500, "g"],
          ["ref-gord", "Gordura", "gordura", 300, "g"],
        ].map(([id, rot, k, max, ph]) => (
          <div key={id} className="form-group">
            <label htmlFor={id}>{rot}</label>
            <input id={id} type="number" min="0" max={max} placeholder={ph} value={c[k]} onChange={mudar(k)} />
          </div>
        ))}
      </div>
      {/* Foto */}
      <div className="form-group">
        <label htmlFor="ref-foto">Foto do prato (opcional)</label>
        <input
          id="ref-foto"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            // Arquivo
            const arq = e.target.files[0];
            // Diminui e guarda
            if (arq) diminuirFoto(arq, 240).then(setFoto);
          }}
        />
        {/* Prévia e sugestões */}
        {foto && (
          <>
            <img className="meal-foto meal-foto-previa" src={foto} alt="" />
            <div className="foto-sugestoes">
              <p className="meta">O que tem no prato? Toque para somar:</p>
              <div className="foto-chips">
                {DO_PRATO.map((nome) => (
                  <button key={nome} type="button" className={"chip-alim" + (usados.includes(nome) ? " is-usado" : "")} onClick={() => (adicionar(nome), setUsados(usados.concat(nome)))}>
                    {nome}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {/* Salvar */}
      <button type="submit" className="btn-primary">
        Salvar refeição
      </button>
    </form>
  );
}

// Formulário de ajustar metas
function FormMetas({ onSalvar }) {
  // Perfil
  const perfil = ler("sl-perfil", {});
  // Corpo
  const corpo = dadosCorpo();
  // Metas digitadas antes (ou as atuais)
  const manuais = ler("sl-metas-manual", calcularMetas());
  // Campos
  const [c, setC] = useState({ modo: ler("sl-metas-modo", "auto"), peso: corpo.peso, altura: corpo.altura, nasc: perfil.nascimento || "", ...manuais });
  // Muda um campo
  const mudar = (k) => (e) => setC({ ...c, [k]: e.target.value });
  // Campo numérico
  const Num = ({ id, rot, k, ...p }) => (
    <div className="form-group">
      <label htmlFor={id}>{rot}</label>
      <input id={id} type="number" value={c[k]} onChange={mudar(k)} {...p} />
    </div>
  );
  // Formulário
  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Corpo no perfil
        gravar("sl-perfil", { ...perfil, peso: Number(c.peso) || perfil.peso, altura: Number(c.altura) || perfil.altura, nascimento: c.nasc || perfil.nascimento });
        // Modo
        gravar("sl-metas-modo", c.modo);
        // Metas digitadas
        gravar("sl-metas-manual", { kcal: Number(c.kcal), proteina: Number(c.proteina), carbo: Number(c.carbo), gordura: Number(c.gordura), aguaMl: Number(c.aguaMl) });
        // Pronto
        onSalvar();
      }}
    >
      {/* Modo */}
      <fieldset className="metas-modo">
        <legend>De onde vêm suas metas?</legend>
        <label className="check-row">
          <input type="radio" name="modo" value="auto" checked={c.modo === "auto"} onChange={mudar("modo")} /> Calcular para mim
        </label>
        <label className="check-row">
          <input type="radio" name="modo" value="manual" checked={c.modo === "manual"} onChange={mudar("modo")} /> Usar as metas da minha nutricionista
        </label>
      </fieldset>
      {/* Corpo */}
      <div className="form-row">
        {Num({ id: "m-peso", rot: "Peso (kg)", k: "peso", min: 30, max: 300, step: 0.1 })}
        {Num({ id: "m-altura", rot: "Altura (cm)", k: "altura", min: 120, max: 230 })}
      </div>
      <div className="form-group">
        <label htmlFor="m-nasc">Data de nascimento</label>
        <input id="m-nasc" type="date" value={c.nasc} onChange={mudar("nasc")} />
      </div>
      {/* Metas */}
      <div className="form-row form-row-4">
        {Num({ id: "m-kcal", rot: "Calorias", k: "kcal", min: 800, max: 6000 })}
        {Num({ id: "m-prot", rot: "Proteína (g)", k: "proteina", min: 0, max: 400 })}
        {Num({ id: "m-carbo", rot: "Carbo (g)", k: "carbo", min: 0, max: 800 })}
        {Num({ id: "m-gord", rot: "Gordura (g)", k: "gordura", min: 0, max: 300 })}
      </div>
      {Num({ id: "m-agua", rot: "Água (ml)", k: "aguaMl", min: 500, max: 8000, step: 250 })}
      <button type="submit" className="btn-primary">
        Salvar metas
      </button>
    </form>
  );
}

// Página
function Alimentacao() {
  // Janela aberta: "refeicao" | "metas" | "ontem"
  const [janela, setJanela] = useState("");
  // Refeições de ontem já repetidas (índices)
  const [repetidas, setRepetidas] = useState([]);
  // Metas
  const META = calcularMetas();
  // Refeições
  const itens = refeicoes();
  // Água
  const ml = agua();
  // Modo manual?
  const manual = ler("sl-metas-modo", "auto") === "manual";
  // Corpo
  const corpo = dadosCorpo();
  // Refeições de ontem
  const deOntem = ler("sl-refeicoes-dias", {})[new Date(Date.now() - 86400000).toDateString()] || [];
  // Fecha a janela
  const fechar = () => setJanela("");

  // Soma de um nutriente no dia
  const total = (k) => itens.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  // Proteína do dia
  const proteinaHoje = total("proteina");
  // Meta de proteína batida: pontos (depois de desenhar)
  useEffect(() => {
    // Bateu
    if (proteinaHoje >= META.proteina) ganhar("proteina", "proteina:" + hoje());
  }, [proteinaHoje >= META.proteina]);

  // Muda a água
  function mudarAgua(d) {
    // Novo valor (0 a 6 L)
    const novo = Math.max(0, Math.min(6000, ml + d));
    // Guarda
    gravar("sl-agua", { data: hoje(), ml: novo });
    // Bebeu: anota a hora (lembrete)
    if (d > 0) gravar("sl-agua-ultimo", Date.now());
    // Bateu a meta agora
    if (d > 0 && novo >= META.aguaMl && ml < META.aguaMl) toast("Meta de água batida!");
    // Pontos da água
    if (d > 0 && novo >= META.aguaMl) ganhar("agua", "agua:" + hoje());
  }

  // Remove uma refeição (com desfazer)
  function remover(r) {
    // Tira
    guardarRefeicoes(itens.filter((x) => x.id !== r.id));
    // Devolve os pontos
    perder("refeicao:" + r.id);
    // Avisa com desfazer
    toast(`${r.nome} removido`, { rotulo: "Desfazer", fn: () => (guardarRefeicoes(refeicoes().concat(r)), ganhar("refeicao", "refeicao:" + r.id)) });
  }

  // Repete refeições de ontem ("todas" ou um índice)
  function repetir(qual) {
    // Escolhidas
    const escolhidas = qual === "todas" ? deOntem : [deOntem[qual]];
    // Com código novo
    const novas = escolhidas.map((r, k) => ({ ...r, id: "r" + Date.now() + k }));
    // Guarda
    guardarRefeicoes(refeicoes().concat(novas));
    // Pontos
    novas.forEach((r) => ganhar("refeicao", "refeicao:" + r.id));
    // Todas: fecha; uma: marca como repetida
    qual === "todas" ? fechar() : setRepetidas(repetidas.concat(qual));
    // Avisa
    toast(novas.length > 1 ? "Refeições de ontem repetidas" : "Refeição repetida");
  }

  // Lembrete de água
  const lembrete = ler("sl-lembrete-agua", false);
  // Página
  return (
    <AppLayout pagina="alimentacao">
      <section id="view-alimentacao" className="view-section active" aria-labelledby="heading-alimentacao">
        {/* Topo */}
        <header className="page-header">
          <div>
            <h1 id="heading-alimentacao">Alimentação</h1>
            <p className="page-lead">
              {hojeTexto()} • {manual ? "metas definidas com sua nutricionista" : "metas calculadas para você"}
            </p>
          </div>
          <div className="alim-topo-botoes">
            <button className="btn-secondary" onClick={() => (deOntem.length ? (setRepetidas([]), setJanela("ontem")) : toast("Não achamos refeições de ontem neste aparelho."))}>
              Repetir ontem
            </button>
            <button className="btn-primary btn-with-icon" onClick={() => setJanela("refeicao")}>
              <Icone d={ICONES.mais} />
              Adicionar refeição
            </button>
          </div>
        </header>

        {/* Metas do dia */}
        <section aria-labelledby="heading-macros">
          <h2 id="heading-macros" className="sr-only">
            Metas do dia
          </h2>
          <div className="nutrition-overview">
            {MACROS.map(([k, nome, un, cor]) => {
              // Comido
              const atual = total(k);
              // Meta
              const meta = META[k];
              // Porcentagem
              const pct = meta ? Math.round((atual / meta) * 100) : 0;
              // Cartão
              return (
                <div key={k} className={`macro-card macro-${cor}`}>
                  <span className="macro-name">
                    <span className="macro-dot" aria-hidden="true" />
                    {nome}
                  </span>
                  <strong>
                    {num(atual)}
                    <small>
                      {" "}
                      / {num(meta)} {un}
                    </small>
                  </strong>
                  <Barra pct={pct} rotulo={nome} cor={cor} />
                  <small className="macro-pct">{meta - atual > 0 ? `${pct}% • faltam ${num(meta - atual)} ${un}` : `${pct}% • meta batida`}</small>
                </div>
              );
            })}
          </div>
          {/* De onde vêm as metas */}
          <p className="metas-info">
            <span>{manual ? "Usando as metas que você digitou. " : `Calculadas para ${num(corpo.peso, 1)} kg, ${corpo.altura} cm, ${corpo.idade} anos e objetivo "${onboarding().rotulo || onboarding().objetivo}". `}</span>
            <button type="button" className="btn-link" onClick={() => setJanela("metas")}>
              Ajustar
            </button>
          </p>
        </section>

        <div className="nutrition-grid">
          {/* Refeições */}
          <section aria-labelledby="heading-refeicoes">
            <h2 id="heading-refeicoes">Refeições de hoje</h2>
            <ul className="list-panel meal-list">
              {!itens.length && (
                <li className="meal-empty">
                  <span>Nenhuma refeição registrada hoje.</span>
                </li>
              )}
              {itens
                .slice()
                .sort((a, b) => a.hora.localeCompare(b.hora))
                .map((r) => (
                  <li key={r.id} className="meal-item">
                    <span className="meal-time">{r.hora}</span>
                    {r.foto && <img className="meal-foto" src={r.foto} alt={`Foto do prato: ${r.nome}`} />}
                    <div className="meal-info">
                      <strong>{r.nome}</strong>
                      <span>{r.descricao || "Sem descrição"}</span>
                      <span className="meal-macros">
                        <span className="macro-chip macro-emerald">P {num(r.proteina)} g</span>
                        <span className="macro-chip macro-warning">C {num(r.carbo)} g</span>
                        <span className="macro-chip macro-info">G {num(r.gordura)} g</span>
                      </span>
                    </div>
                    <span className="tag">{num(r.kcal)} kcal</span>
                    <button className="btn-icon btn-danger" aria-label={`Remover ${r.nome}`} onClick={() => remover(r)}>
                      <Icone d={ICONES.lixeira} />
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          {/* Água */}
          <section className="water-card" aria-labelledby="heading-agua">
            <h2 id="heading-agua">Água</h2>
            <p className="water-value" aria-live="polite">
              <strong>{num(ml / 1000, ml % 100 ? 2 : 1)} L</strong>
              <span> de {num(META.aguaMl / 1000, 1)} L</span>
            </p>
            <div className="garrafa" aria-hidden="true">
              <Garrafa nivel={Math.min(1, ml / META.aguaMl)} />
            </div>
            <Barra pct={Math.round((ml / META.aguaMl) * 100)} rotulo="Meta de água" cor="info" />
            <div className="water-actions">
              <button className="btn-secondary" aria-label="Remover 250 ml de água" disabled={ml <= 0} onClick={() => mudarAgua(-COPO)}>
                − 250 ml
              </button>
              <button className="btn-secondary btn-agua-mais" aria-label="Adicionar 250 ml de água" onClick={() => mudarAgua(COPO)}>
                + 250 ml
              </button>
            </div>
            <label className="check-row lembrete-agua">
              <input
                type="checkbox"
                checked={lembrete}
                onChange={(e) => {
                  // Guarda
                  gravar("sl-lembrete-agua", e.target.checked);
                  // Pede permissão de notificação
                  if (e.target.checked && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
                  // Avisa
                  toast(e.target.checked ? "Combinado! Te lembro a cada 2 horas (com o app aberto)." : "Lembrete de água desligado");
                }}
              />
              <span>Me lembrar de beber água a cada 2 horas</span>
            </label>
          </section>
        </div>
      </section>

      {/* Adicionar refeição */}
      <Modal titulo="Adicionar refeição" aberto={janela === "refeicao"} onFechar={fechar}>
        <FormRefeicao
          onSalvar={(r) => {
            // Guarda
            guardarRefeicoes(refeicoes().concat(r));
            // Fecha
            fechar();
            // Avisa
            toast("Refeição adicionada");
            // Pontos
            ganhar("refeicao", "refeicao:" + r.id);
          }}
        />
      </Modal>

      {/* Ajustar metas */}
      <Modal titulo="Ajustar metas" aberto={janela === "metas"} onFechar={fechar}>
        <FormMetas onSalvar={() => (fechar(), toast("Metas atualizadas"))} />
      </Modal>

      {/* Repetir ontem */}
      <Modal titulo="Repetir refeições de ontem" aberto={janela === "ontem"} onFechar={fechar}>
        <ul className="list-panel">
          {deOntem.map((r, i) => (
            <li key={i}>
              <div>
                <strong>
                  {r.hora} • {r.nome}
                </strong>
                <span>
                  {r.descricao || ""} • {num(r.kcal)} kcal
                </span>
              </div>
              <button type="button" className="btn-secondary" disabled={repetidas.includes(i)} onClick={() => repetir(i)}>
                Repetir
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-primary btn-block" onClick={() => repetir("todas")}>
          Repetir todas
        </button>
      </Modal>
    </AppLayout>
  );
}

// Desenha
montar(Alimentacao);
