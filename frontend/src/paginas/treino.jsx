// Tela do treino: marca as séries, ajusta reps e carga, descanso com contagem, drop set, bi-set,
// troca de exercício, sugestão de carga, recordes e o resumo no fim.
import { useEffect, useRef, useState } from "react";
import AppLayout from "../componentes/AppLayout.jsx";
import { Icone, ICONES, CartaoNumero, Modal, Confirmar } from "../componentes/base.jsx";
import { treinoAtual, treinosDoUsuario, acharTreino, exerciciosDe, historico, estatisticas, dadosCorpo, onboarding, resumoExercicio, toast, linkTreino } from "../lib/nucleo.js";
import { num, duracaoTexto } from "../lib/formato.js";
import { ler, gravar, apagar } from "../lib/armazenamento.js";
import { ganhar, perder, conferirTreino } from "../lib/pontos.js";
import { BIBLIOTECA } from "../lib/exercicios.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssApp from "../estilos/app.css?inline";
import cssAppTreino from "../estilos/app-treino.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link, useSearchParams } from "react-router-dom";
// Troca de tela pelo código (React Router; "irParaTela" porque esta tela já tem uma função irPara)
import { irPara as irParaTela } from "../lib/navegar.js";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssApp, cssAppTreino];

// Treino desta tela (preenchido toda vez que a tela abre, em carregarTreino)
// Treino em andamento salvo
let salvo = null;
// Treino
let TREINO = null;
// Exercícios (cópia: a troca muda o nome)
let BASE = [];
// Outro treino em andamento com séries feitas?
let OUTRO = null;

// Lê o treino pedido no endereço (ou o que está em andamento, ou o primeiro da lista)
function carregarTreino(idDoEndereco) {
  // Treino em andamento
  salvo = treinoAtual();
  // Código do treino
  const idPedido = idDoEndereco || salvo?.treinoId || treinosDoUsuario()[0]?.id;
  // Treino
  TREINO = acharTreino(idPedido);
  // Exercícios
  BASE = TREINO ? exerciciosDe(TREINO).map((e) => ({ ...e })) : [];
  // Outro treino com séries feitas
  OUTRO = salvo && TREINO && salvo.treinoId !== TREINO.id && salvo.series?.some((l) => l.some((s) => s.feito)) ? salvo : null;
}
// Playlists: [nome, busca]
const PLAYLISTS = [
  ["Treino pesado", "treino pesado musculação"],
  ["Corrida e HIIT", "corrida hiit"],
  ["Funk e pop para treinar", "funk academia"],
  ["Yoga e alongamento", "yoga relax"],
];
// Opções de esforço do fim
const ESFORCOS = [
  ["facil", 1, "Fácil"],
  ["ok", 2, "Na medida"],
  ["pesado", 3, "Pesado"],
  ["muito", 4, "Muito pesado"],
];
// Volta do anel do descanso
const CIRC = 2 * Math.PI * 52;

// Exercício contado em tempo (ex.: "40 s")?
const ehTempo = (e) => typeof e.reps !== "number";
// Segundos de um texto como "40 s" ou "1 min"
const segundosDe = (t) => (/min/.test(t) ? Math.round(parseFloat(String(t).replace(",", ".")) * 60) : Math.round(parseFloat(String(t).replace(",", "."))) || 30);
// Número com 1 casa só quando precisa
const kg = (n) => num(n, n % 1 ? 1 : 0);
// Vibra (se a pessoa deixou e já tocou na tela)
const vibrar = (p) => navigator.vibrate && ler("sl-pref-vibrar", true) && (!navigator.userActivation || navigator.userActivation.hasBeenActive) && navigator.vibrate(p);

// Tempo em 00:00 (ou 0:00:00)
function mmss(segundos) {
  // Inteiro e positivo
  const s = Math.max(0, Math.round(segundos));
  // Horas
  const h = Math.floor(s / 3600);
  // Minutos
  const m = Math.floor((s % 3600) / 60);
  // Segundos
  const r = String(s % 60).padStart(2, "0");
  // Texto
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${String(m).padStart(2, "0")}:${r}`;
}

// Estado novo do treino
function novoEstado() {
  // Uma lista de séries por exercício
  return { treinoId: TREINO.id, inicio: new Date().toISOString(), indice: 0, feitos: 0, trocas: {}, biset: {}, series: BASE.map((e) => Array.from({ length: e.series }, () => ({ reps: e.reps, carga: e.carga, feito: false }))) };
}

// Sugestão de carga com base na última vez
function Sugestao({ e, series, onUsar }) {
  // Por tempo: nada
  if (ehTempo(e)) return null;
  // Última vez
  const ult = ler("sl-ultimas", {})[e.nome];
  // Sem histórico: nada
  if (!ult || !ult.carga) return null;
  // Carga e motivo
  let carga = ult.carga;
  // Motivo
  let motivo = "mesma carga da última vez";
  // Foi fácil ou fez tudo: sobe
  if (ult.esforco === "facil" || (ult.todas && !ult.esforco)) {
    // Sobe 2,5 kg
    carga = ult.carga + 2.5;
    // Motivo
    motivo = ult.esforco === "facil" ? "da última vez foi fácil" : "você fez todas as séries da última vez";
  } else if (ult.esforco === "muito") {
    // Desce 2,5 kg
    carga = Math.max(0, ult.carga - 2.5);
    // Motivo
    motivo = "da última vez foi muito pesado";
  }
  // Próxima série
  const proxima = series.find((x) => !x.feito);
  // Já está certo: nada
  if (!proxima || proxima.carga === carga) return null;
  // Caixa
  return (
    <div className="sugestao-carga">
      <span className="icon-tile icon-tile-emerald" aria-hidden="true">
        <Icone d={carga > ult.carga ? ["M12 19V5", "m5 12 7-7 7 7"] : ["M12 5v14", "m19 12-7 7-7-7"]} />
      </span>
      <p>
        <strong>Sugestão: {kg(carga)} kg</strong>
        <span className="meta"> ({motivo})</span>
      </p>
      <button type="button" className="btn-secondary" onClick={() => onUsar(carga)}>
        Usar
      </button>
    </div>
  );
}

// Dicas de como fazer o exercício
function ComoFazer({ e }) {
  // Informações da biblioteca
  const info = BIBLIOTECA[e.nome];
  // Sem dicas: nada
  if (!info) return null;
  // Caixa (aberta para iniciantes)
  return (
    <details className="como-fazer" open={onboarding().nivel === "Iniciante" || undefined}>
      <summary>Como fazer</summary>
      <div className="como-fazer-miolo">
        <div className="como-fazer-dicas">
          <ul>
            {info.dicas.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="como-fazer-erro">
            <strong>Cuidado: </strong>
            {info.erro}
          </p>
          <p className="meta">
            Trabalha: {info.grupo.toLowerCase()} • {info.lugar === "casa" ? "dá para fazer em casa" : info.lugar === "academia" ? "na academia" : "em casa ou na academia"}
          </p>
        </div>
      </div>
    </details>
  );
}

// Resumo do fim do treino
function Fim({ r }) {
  // Esforço escolhido
  const [esforco, setEsforco] = useState("");
  // Guarda o esforço (ajusta a sugestão de carga da próxima vez)
  function escolher(id) {
    // Marca
    setEsforco(id);
    // Últimas cargas
    const ult = ler("sl-ultimas", {});
    // Anota em cada exercício do treino
    r.nomes.forEach((n) => ult[n] && (ult[n].esforco = id));
    // Guarda
    gravar("sl-ultimas", ult);
    // Histórico
    const hist = ler("sl-historico", []);
    // Anota no treino que acabou
    if (hist[0]) hist[0].esforco = id;
    // Guarda
    gravar("sl-historico", hist);
    // Avisa
    toast(id === "facil" ? "Anotado! Na próxima a gente sobe a carga." : id === "muito" ? "Anotado! Na próxima a gente alivia um pouco." : "Anotado! Valeu por contar.");
  }
  // Cartão
  return (
    <section className="finish-card" aria-labelledby="heading-fim">
      {/* Selo */}
      <svg viewBox="0 0 96 96" className="finish-badge" aria-hidden="true">
        <circle cx="48" cy="48" r="44" className="finish-badge-ring" />
        <circle cx="48" cy="48" r="34" className="finish-badge-core" />
        <path d="M33 49l10 10 20-22" className="finish-badge-check" />
      </svg>
      <h2 id="heading-fim" tabIndex="-1">
        Treino concluído!
      </h2>
      <p className="page-lead">
        {TREINO.nome} registrado. Isso conta para sua meta: {r.stats.nestaSemana} de {r.stats.meta} nesta semana.
      </p>
      <p className="finish-comparacao">{r.comparacao}</p>
      {/* Números */}
      <div className="stats-grid stats-grid-4">
        <CartaoNumero rotulo="Duração" valor={duracaoTexto(r.minutos)} icone={ICONES.relogio} />
        <CartaoNumero rotulo="Séries" valor={num(r.series)} icone={ICONES.check} cor="emerald" />
        <CartaoNumero rotulo="Volume total" valor={`${num(r.volume)} kg`} icone={ICONES.haltere} />
        <CartaoNumero rotulo="Calorias (estimativa)" valor={`${num(r.kcal)} kcal`} icone={ICONES.fogo} cor="emerald" />
      </div>
      {/* Esforço */}
      <fieldset className="esforco">
        <legend>Como foi o treino?</legend>
        {ESFORCOS.map(([id, nivel, nome]) => (
          <button key={id} type="button" aria-pressed={esforco === id} onClick={() => escolher(id)}>
            <span className={`esforco-barras nivel-${nivel}`} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            {nome}
          </button>
        ))}
      </fieldset>
      {/* Botões */}
      <div className="finish-actions">
        <Link to="/app/inicio" className="btn-primary">
          Voltar ao início
        </Link>
        <Link to="/app/evolucao" className="btn-secondary">
          Ver minha evolução
        </Link>
      </div>
    </section>
  );
}

// Tela: lê o treino do endereço (?id=) assim que abre e depois mostra o treino
function Treino() {
  // Endereço lido pelo React Router
  const [parametros] = useSearchParams();
  // Carrega o treino uma vez, antes de desenhar
  useState(() => carregarTreino(parametros.get("id")));
  // Treino
  return <TreinoEmAndamento />;
}

// Treino em andamento
function TreinoEmAndamento() {
  // Estado do treino (continua o salvo, se for o mesmo)
  const [estado, setEstado] = useState(() => (salvo && TREINO && salvo.treinoId === TREINO.id ? { trocas: {}, biset: {}, ...salvo } : TREINO ? novoEstado() : null));
  // Segundos de treino (cronômetro)
  const [agora, setAgora] = useState(Date.now());
  // Descanso: { restante, duracao, texto } ou nada
  const [descanso, setDescanso] = useState(null);
  // Contagem da série por tempo: { n, falta }
  const [contando, setContando] = useState(null);
  // Janela aberta: "musica" | "trocar"
  const [janela, setJanela] = useState("");
  // Pedido de confirmação
  const [pedido, setPedido] = useState(() =>
    OUTRO
      ? {
          titulo: "Você tem um treino em andamento",
          texto: `"${acharTreino(OUTRO.treinoId)?.nome || "Treino anterior"}" não foi finalizado. Começar "${TREINO.nome}" descarta o progresso dele.`,
          rotulo: `Começar ${TREINO.nome}`,
          // Começa este (o estado novo já está na tela)
          fn: () => {},
          // Cancelar: volta para o outro
          cancelar: () => (gravar("sl-treino-atual", OUTRO), irParaTela(linkTreino(OUTRO.treinoId), true)),
        }
      : null,
  );
  // Resumo do fim (quando acaba)
  const [fim, setFim] = useState(null);
  // Exercício para ir depois do descanso
  const depois = useRef(null);
  // Trava de tela acesa
  const trava = useRef(null);

  // Sem treino: volta para a lista
  useEffect(() => {
    // Volta
    if (!TREINO) irParaTela("/app/treinos", true);
  }, []);

  // Classe da tela cheia, título e tela acesa
  useEffect(() => {
    // Sem treino: nada
    if (!TREINO) return;
    // Classe
    document.body.classList.add("focus-page");
    // Título da aba
    document.title = `${TREINO.nome} — Saúde Life`;
    // Pede a tela acesa
    const acender = async () => {
      // Tenta
      try {
        // Pede
        if ("wakeLock" in navigator) trava.current = await navigator.wakeLock.request("screen");
      } catch (e) {
        // Sem permissão: segue
        trava.current = null;
      }
    };
    // Pede já
    acender();
    // Volta para a aba: pede de novo
    const voltar = () => document.visibilityState === "visible" && !document.body.classList.contains("is-finished") && acender();
    // Escuta
    document.addEventListener("visibilitychange", voltar);
    // Para
    return () => document.removeEventListener("visibilitychange", voltar);
  }, []);

  // Cronômetro (1 vez por segundo, até acabar)
  useEffect(() => {
    // Acabou: para
    if (fim) return;
    // Relógio
    const t = setInterval(() => setAgora(Date.now()), 1000);
    // Para
    return () => clearInterval(t);
  }, [fim]);

  // Descanso contando
  useEffect(() => {
    // Sem descanso: nada
    if (!descanso) return;
    // Acabou
    if (descanso.restante <= 0) {
      // Avisa
      toast("Descanso concluído. Bora para a próxima!");
      // Vibra
      vibrar([120, 60, 120]);
      // Termina
      return terminarDescanso();
    }
    // Conta 1 segundo
    const t = setTimeout(() => setDescanso((d) => d && { ...d, restante: d.restante - 1 }), 1000);
    // Para
    return () => clearTimeout(t);
  }, [descanso]);

  // Série por tempo contando
  useEffect(() => {
    // Nada contando
    if (!contando) return;
    // Acabou: marca a série
    if (contando.falta <= 0) {
      // Vibra
      vibrar([120, 60, 120]);
      // Para a contagem
      setContando(null);
      // Marca
      return marcar(contando.n);
    }
    // Conta 1 segundo
    const t = setTimeout(() => setContando((c) => c && { ...c, falta: c.falta - 1 }), 1000);
    // Para
    return () => clearTimeout(t);
  }, [contando]);

  // Sem treino: nada na tela
  if (!TREINO || !estado) return null;

  // Exercícios com as trocas
  const exercicios = BASE.map((e, k) => (estado.trocas[k] ? { ...e, nome: estado.trocas[k] } : e));
  // Exercício atual
  const i = estado.indice;
  // Exercício
  const e = exercicios[i];
  // Séries dele
  const series = estado.series[i];
  // Todas as séries
  const todas = estado.series.flat();
  // Feitas
  const feitas = todas.filter((s) => s.feito).length;
  // Porcentagem
  const pct = todas.length ? Math.round((feitas / todas.length) * 100) : 0;

  // Guarda o estado (na tela e no navegador)
  function salvar(novo) {
    // Exercícios completos
    novo.feitos = novo.series.filter((l) => l.every((s) => s.feito)).length;
    // Guarda
    gravar("sl-treino-atual", novo);
    // Tela
    setEstado(novo);
    // Devolve
    return novo;
  }
  // Cópia funda do estado (para mudar com segurança)
  const copia = () => JSON.parse(JSON.stringify(estado));

  // Começa um descanso
  function iniciarDescanso(segundos, texto) {
    // Sem tempo: nada
    if (!segundos) return setDescanso(null);
    // Liga
    setDescanso({ restante: segundos, duracao: segundos, texto });
  }
  // Termina o descanso (e vai para o próximo exercício, se combinado)
  function terminarDescanso() {
    // Desliga
    setDescanso(null);
    // Tem para onde ir: vai
    if (depois.current !== null) irPara(depois.current);
  }
  // Vai para um exercício
  function irPara(indice, base = estado) {
    // Esquece o "depois"
    depois.current = null;
    // Para o descanso
    setDescanso(null);
    // Para a contagem
    setContando(null);
    // Muda
    salvar({ ...base, indice: Math.max(0, Math.min(exercicios.length - 1, indice)) });
    // Foco no exercício
    document.getElementById("conteudo")?.focus({ preventScroll: true });
    // Sobe
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Muda reps ou carga de uma série (as próximas não feitas acompanham)
  function mudarCampo(n, campo, valor) {
    // Cópia
    const novo = copia();
    // Valor positivo
    const v = Math.max(0, Number(valor) || 0);
    // Esta e as próximas não feitas
    novo.series[i].forEach((s, k) => (k === n || (k > n && !s.feito)) && (s[campo] = v));
    // Guarda
    salvar(novo);
  }

  // Confere recorde de carga
  function conferirRecorde(serie) {
    // Por tempo ou sem carga: nada
    if (ehTempo(e) || !serie.carga) return;
    // Recordes
    const lista = ler("sl-recordes", {});
    // Recorde atual (ou a última carga)
    const atual = lista[e.nome] != null ? lista[e.nome] : ler("sl-ultimas", {})[e.nome]?.carga;
    // Primeira vez: só anota
    if (atual == null) return gravar("sl-recordes", { ...lista, [e.nome]: serie.carga });
    // Não passou: nada
    if (serie.carga <= atual) return;
    // Anota
    gravar("sl-recordes", { ...lista, [e.nome]: serie.carga });
    // Pontos
    ganhar("recorde", `recorde:${estado.inicio}:${i}`);
    // Avisa
    toast(`Novo recorde no ${e.nome}: ${kg(serie.carga)} kg!`);
  }

  // Marca ou desmarca uma série
  function marcar(n) {
    // Cópia
    const novo = copia();
    // Série
    const serie = novo.series[i][n];
    // Inverte
    serie.feito = !serie.feito;
    // Código da série (pontos)
    const ref = `serie:${estado.inicio}:${i}:${n}`;
    // Ganha ou devolve os pontos
    serie.feito ? ganhar("serie", ref) : perder(ref);
    // Feita: recorde e vibração
    if (serie.feito) conferirRecorde(serie), vibrar(25);
    // Guarda
    salvar(novo);
    // Desmarcou: para aqui
    if (!serie.feito) return;
    // Bi-set com o próximo: vai direto, sem descanso
    if (novo.biset[i] && novo.series[i + 1]?.some((x) => !x.feito)) return irPara(i + 1, novo);
    // Segundo exercício do bi-set: descansa e volta ao primeiro
    if (novo.biset[i - 1] && novo.series[i - 1].some((x) => !x.feito)) {
      // Descanso
      iniciarDescanso(e.descanso || 60, `A seguir: ${exercicios[i - 1].nome}`);
      // Depois volta
      depois.current = i - 1;
      // Pronto
      return;
    }
    // Séries do exercício
    const lista = novo.series[i];
    // Exercício completo?
    const completo = lista.every((s) => s.feito);
    // Último exercício completo: acabou
    if (completo && i === exercicios.length - 1) return setDescanso(null), toast("Última série feita! Finalize o treino quando quiser.");
    // Próxima série
    const prox = lista.findIndex((s) => !s.feito);
    // Completo sem descanso: próximo
    if (completo && !e.descanso) return irPara(i + 1, novo);
    // Próxima é drop set: sem descanso
    if (!completo && lista[prox].drop) return setDescanso(null);
    // Descanso
    iniciarDescanso(e.descanso, completo ? `A seguir: ${exercicios[i + 1].nome}` : `A seguir: série ${prox + 1} de ${lista.length}`);
    // Completo: depois vai para o próximo
    depois.current = completo ? i + 1 : null;
  }

  // Drop set: série extra com 80% da carga
  function dropSet() {
    // Cópia
    const novo = copia();
    // Séries
    const lista = novo.series[i];
    // Última série
    const ult = lista[lista.length - 1];
    // Carga (de 0,5 em 0,5)
    const carga = Math.max(0, Math.round(ult.carga * 0.8 * 2) / 2);
    // Adiciona
    lista.push({ reps: ult.reps, carga, feito: false, drop: true });
    // Guarda
    salvar(novo);
    // Avisa
    toast(`Drop set: ${kg(carga)} kg, sem descanso`);
  }

  // Liga ou desliga o bi-set com o próximo
  function biSet() {
    // Cópia
    const novo = copia();
    // Inverte
    novo.biset[i] = !novo.biset[i];
    // Guarda
    salvar(novo);
    // Avisa
    toast(novo.biset[i] ? `Bi-set: uma série de cada, sem descanso entre ${e.nome} e ${exercicios[i + 1].nome}` : "Bi-set desligado");
  }

  // Opções de troca (mesmo grupo, fora do treino)
  const grupo = BIBLIOTECA[e.nome]?.grupo;
  // Lista
  const trocas = Object.keys(BIBLIOTECA).filter((n) => BIBLIOTECA[n].grupo === grupo && !exercicios.some((x) => x.nome === n));
  // Troca o exercício
  function trocar(nome) {
    // Cópia
    const novo = copia();
    // Anota
    novo.trocas[i] = nome;
    // Guarda
    salvar(novo);
    // Fecha
    setJanela("");
    // Avisa
    toast(`Trocado por ${nome}`);
  }

  // Termina o treino e guarda tudo
  function concluir() {
    // Para o descanso
    setDescanso(null);
    // Minutos
    const minutos = Math.max(1, Math.round((Date.now() - new Date(estado.inicio)) / 60000));
    // Séries feitas
    const nFeitas = estado.series.flat().filter((s) => s.feito).length;
    // Volume (reps × carga)
    const volume = estado.series.reduce((soma, l, k) => soma + l.filter((s) => s.feito && !ehTempo(exercicios[k])).reduce((p, s) => p + s.reps * s.carga, 0), 0);
    // Calorias (estimativa por MET)
    const kcal = Math.round(((TREINO.objetivo === "HIIT" ? 6 : 5) * dadosCorpo().peso * minutos) / 60);
    // Última vez deste treino
    const anterior = historico().find((h) => h.treinoId === TREINO.id && h.volume);
    // Diferença em %
    const dif = anterior && volume ? Math.round(((volume - anterior.volume) / anterior.volume) * 100) : null;
    // Frase de comparação
    const comparacao = dif === null ? "Primeira vez com este treino: na próxima a gente compara." : dif > 0 ? `Você levantou ${dif}% a mais que na última vez (${num(anterior.volume)} kg).` : dif === 0 ? "Mesmo volume da última vez. Constância também é evolução." : `${Math.abs(dif)}% a menos que na última vez. Dia mais leve conta também.`;
    // Últimas cargas, histórico de cargas e volume por grupo
    const ult = ler("sl-ultimas", {});
    // Histórico de cargas
    const cargas = ler("sl-cargas", {});
    // Volume por grupo
    const grupos = {};
    // Agora
    const data = new Date().toISOString();
    // Para cada exercício com série feita
    exercicios.forEach((ex, k) => {
      // Séries feitas
      const f = estado.series[k].filter((x) => x.feito);
      // Nenhuma ou por tempo: pula
      if (!f.length || ehTempo(ex)) return;
      // Maior carga
      const maior = Math.max(...f.map((x) => x.carga));
      // Última
      ult[ex.nome] = { carga: maior, todas: f.length === estado.series[k].length, data };
      // Histórico (até 60)
      cargas[ex.nome] = (cargas[ex.nome] || []).concat({ data, carga: maior }).slice(-60);
      // Grupo
      const g = BIBLIOTECA[ex.nome]?.grupo || "Outros";
      // Soma
      grupos[g] = (grupos[g] || 0) + f.reduce((t, x) => t + x.reps * x.carga, 0);
    });
    // Guarda o treino no histórico
    gravar("sl-historico", [{ treinoId: TREINO.id, nome: TREINO.nome, data, duracao: minutos, series: nFeitas, volume, kcal, grupos }].concat(ler("sl-historico", [])));
    // Guarda as últimas
    gravar("sl-ultimas", ult);
    // Guarda as cargas
    gravar("sl-cargas", cargas);
    // Fim do andamento
    apagar("sl-treino-atual");
    // Pontos do treino
    ganhar("treino", "treino:" + estado.inicio);
    // Meta da semana
    conferirTreino();
    // Solta a tela
    trava.current?.release().catch(() => {});
    // Marca o fim no <body>
    document.body.classList.add("is-finished");
    // Mostra o resumo
    setFim({ minutos, series: nFeitas, volume, kcal, comparacao, stats: estatisticas(), nomes: exercicios.map((x) => x.nome) });
    // Foco no título
    setTimeout(() => document.getElementById("heading-fim")?.focus(), 50);
  }

  // Botão "Finalizar treino"
  function finalizar() {
    // Nenhuma série
    if (!feitas)
      return setPedido({ titulo: "Nenhuma série concluída", texto: "Marque as séries que você fez para o treino contar na sua evolução.", rotulo: "Sair sem salvar", perigo: true, fn: () => (apagar("sl-treino-atual"), irParaTela("/app/inicio")) });
    // Faltam séries
    if (feitas < todas.length) return setPedido({ titulo: "Finalizar agora?", texto: `Você concluiu ${feitas} de ${todas.length} séries. As que faltaram não entram no resumo.`, rotulo: "Finalizar treino", fn: concluir });
    // Tudo feito
    concluir();
  }

  // Botão de sair
  function sairDoTreino() {
    // Nada feito: sai e apaga
    if (!feitas) return apagar("sl-treino-atual"), irParaTela("/app/inicio");
    // Pergunta
    setPedido({ titulo: "Sair do treino?", texto: "Seu progresso fica salvo. Você pode continuar depois pelo Início.", rotulo: "Sair e continuar depois", fn: () => irParaTela("/app/inicio") });
  }

  // Último exercício?
  const ultimo = i === exercicios.length - 1;
  // Repetições no texto
  const repsTexto = ehTempo(e) ? e.reps : `${e.reps} reps`;
  // Página
  return (
    <AppLayout pagina="treino" semMenu>
      <a className="skip-link" href="#conteudo">
        Pular para o exercício
      </a>
      <div className="player">
        {/* Topo */}
        <header className="player-topbar">
          {/* Sair */}
          {!fim && (
            <button className="btn-icon btn-icon-lg" aria-label="Sair do treino" onClick={sairDoTreino}>
              <Icone d={["M18 6 6 18", "m6 6 12 12"]} />
            </button>
          )}
          {/* Nome */}
          <div className="player-title">
            <h1>{TREINO.nome}</h1>
            <p className="meta">
              {TREINO.grupo || TREINO.objetivo} • {exercicios.length} exercícios
            </p>
          </div>
          {/* Música */}
          <button className="btn-icon" aria-label="Música para treinar" title="Música para treinar" onClick={() => setJanela("musica")}>
            <Icone d={["M9 18V5l12-2v13", "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]} />
          </button>
          {/* Relógio */}
          <div className="player-clock" aria-label="Tempo de treino">
            <Icone d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"]} />
            <span role="timer" aria-live="off">
              {mmss((agora - new Date(estado.inicio)) / 1000)}
            </span>
          </div>
        </header>

        {/* Progresso */}
        {!fim && (
          <div className="player-progress">
            <div className="progress-bar-sm progress-emerald" role="progressbar" aria-label="Séries concluídas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div className="fill" style={{ width: pct + "%" }} />
            </div>
            <span className="meta">
              {feitas} de {todas.length} séries
            </span>
          </div>
        )}

        {/* Miolo */}
        <main id="conteudo" className="player-main" tabIndex="-1">
          {fim ? (
            <Fim r={fim} />
          ) : (
            <>
              {/* Exercício atual */}
              <section className="player-current" aria-live="polite">
                <p className="page-kicker">
                  Exercício {i + 1} de {exercicios.length}
                </p>
                <h2 className="player-exercise">{e.nome}</h2>
                <p className="meta">
                  {e.series} séries × {repsTexto}
                  {e.descanso ? ` • descanso de ${e.descanso} s` : ""}
                </p>
                {/* Cabeçalho das séries */}
                <div className="set-head" aria-hidden="true">
                  <span>Série</span>
                  <span>{ehTempo(e) ? "Tempo" : "Reps"}</span>
                  <span>Carga</span>
                  <span>Feito</span>
                </div>
                {/* Séries */}
                <ol className="set-list">
                  {series.map((s, n) => (
                    <li key={n} className={"set-row" + (s.feito ? " is-done" : "")}>
                      {/* Número */}
                      <span className={"set-number" + (s.drop ? " is-drop" : "")}>{s.drop ? "Drop" : `Série ${n + 1}`}</span>
                      {/* Reps ou tempo */}
                      <label className="set-field">
                        {ehTempo(e) ? (
                          <button type="button" className="set-timer" disabled={s.feito || !!contando} aria-label={`Contar ${e.reps} da série ${n + 1}`} onClick={() => (vibrar(30), setContando({ n, falta: segundosDe(e.reps) }))}>
                            {contando?.n === n ? mmss(contando.falta) : `▶ ${e.reps}`}
                          </button>
                        ) : (
                          <input type="number" inputMode="numeric" min="0" max="100" className="set-input" aria-label={`Repetições da série ${n + 1}`} value={s.reps} onChange={(ev) => mudarCampo(n, "reps", ev.target.value)} />
                        )}
                        <span className="set-unit">{ehTempo(e) ? "" : "reps"}</span>
                      </label>
                      {/* Carga */}
                      <label className="set-field">
                        {e.carga || !ehTempo(e) ? (
                          <input type="number" inputMode="decimal" min="0" max="500" step="0.5" className="set-input" aria-label={`Carga da série ${n + 1} em quilos`} value={s.carga} onChange={(ev) => mudarCampo(n, "carga", ev.target.value)} />
                        ) : (
                          <span className="set-static">—</span>
                        )}
                        <span className="set-unit">{e.carga || !ehTempo(e) ? "kg" : ""}</span>
                      </label>
                      {/* Feito */}
                      <button type="button" className="set-check" aria-pressed={s.feito} aria-label={`${s.feito ? "Desmarcar" : "Concluir"} série ${n + 1}`} onClick={() => marcar(n)}>
                        <Icone d={ICONES.check} />
                      </button>
                    </li>
                  ))}
                </ol>
                {/* Opções */}
                <div className="set-opcoes">
                  {!ehTempo(e) && (
                    <button type="button" className="btn-secondary btn-sm" onClick={dropSet}>
                      + Drop set
                    </button>
                  )}
                  {!ultimo && (
                    <button type="button" className={"btn-secondary btn-sm" + (estado.biset[i] ? " is-active" : "")} aria-pressed={!!estado.biset[i]} onClick={biSet}>
                      {estado.biset[i] ? `Bi-set com ${exercicios[i + 1].nome} ✓` : "Bi-set com o próximo"}
                    </button>
                  )}
                  <button type="button" className="btn-secondary btn-sm" onClick={() => (trocas.length ? setJanela("trocar") : toast("Não achamos um exercício parecido para trocar."))}>
                    Trocar exercício
                  </button>
                </div>
                {/* Sugestão de carga */}
                <Sugestao
                  e={e}
                  series={series}
                  onUsar={(carga) => {
                    // Cópia
                    const novo = copia();
                    // Muda as não feitas
                    novo.series[i].forEach((x) => !x.feito && (x.carga = carga));
                    // Guarda
                    salvar(novo);
                    // Avisa
                    toast(`Carga ajustada para ${kg(carga)} kg`);
                  }}
                />
                {/* Como fazer */}
                <ComoFazer key={e.nome} e={e} />
              </section>

              {/* Lista de exercícios */}
              <aside className="player-list" aria-labelledby="heading-lista">
                <h2 id="heading-lista">Exercícios</h2>
                <ol>
                  {exercicios.map((ex, n) => {
                    // Completo?
                    const completo = estado.series[n].every((s) => s.feito);
                    // Item
                    return (
                      <li key={n}>
                        <button type="button" className={"player-list-item" + (n === i ? " is-current" : "") + (completo ? " is-done" : "")} aria-current={n === i ? "step" : undefined} onClick={() => irPara(n)}>
                          <span className="exercise-index" aria-hidden="true">
                            {completo ? <Icone d={ICONES.check} /> : n + 1}
                          </span>
                          <span className="player-list-text">
                            <strong>{ex.nome}</strong>
                            <span>{resumoExercicio(ex)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </aside>
            </>
          )}
        </main>

        {/* Rodapé */}
        {!fim && (
          <footer className="player-footer">
            <button className="btn-secondary" disabled={i === 0} onClick={() => irPara(i - 1)}>
              Anterior
            </button>
            <button className="btn-primary" onClick={() => (ultimo ? finalizar() : irPara(i + 1))}>
              {ultimo ? "Finalizar treino" : "Próximo exercício"}
            </button>
          </footer>
        )}
      </div>

      {/* Descanso */}
      {descanso && (
        <div className="rest-panel">
          <div className="rest-ring" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <circle className="rest-ring-bg" cx="60" cy="60" r="52" />
              <circle className="rest-ring-fill" cx="60" cy="60" r="52" style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - descanso.restante / descanso.duracao) }} />
            </svg>
            <span className="rest-time">{mmss(descanso.restante)}</span>
          </div>
          <div className="rest-info">
            <p className="rest-title">Descanso</p>
            <p className="meta">{descanso.texto}</p>
            <div className="rest-actions">
              <button className="btn-secondary" onClick={() => (descanso.restante <= 15 ? terminarDescanso() : setDescanso({ ...descanso, restante: descanso.restante - 15 }))}>
                −15 s
              </button>
              <button className="btn-secondary" onClick={() => setDescanso({ ...descanso, restante: descanso.restante + 15, duracao: Math.max(descanso.duracao, descanso.restante + 15) })}>
                +15 s
              </button>
              <button className="btn-primary" onClick={terminarDescanso}>
                Pular descanso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Música */}
      <Modal titulo="Música para treinar" aberto={janela === "musica"} onFechar={() => setJanela("")}>
        <p className="meta">Abre no app de música do seu celular.</p>
        <ul className="playlists">
          {PLAYLISTS.map(([nome, busca]) => (
            <li key={nome}>
              <strong>{nome}</strong>
              <a className="btn-secondary btn-sm" href={"https://open.spotify.com/search/" + encodeURIComponent(busca) + "/playlists"} target="_blank" rel="noopener">
                Spotify
              </a>
              <a className="btn-secondary btn-sm" href={"https://music.youtube.com/search?q=" + encodeURIComponent(busca)} target="_blank" rel="noopener">
                YouTube Music
              </a>
            </li>
          ))}
        </ul>
      </Modal>

      {/* Trocar exercício */}
      <Modal titulo={`Trocar ${e.nome}`} aberto={janela === "trocar"} onFechar={() => setJanela("")}>
        <ul className="list-panel troca-lista">
          {trocas.map((n) => (
            <li key={n}>
              <button type="button" className="btn-link" onClick={() => trocar(n)}>
                <strong>{n}</strong>
                <span>
                  {BIBLIOTECA[n].musculos || grupo} • {BIBLIOTECA[n].equip || BIBLIOTECA[n].lugar || ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      {/* Confirmação (o "Cancelar" pode ter ação própria) */}
      <Confirmar pedido={pedido} onFechar={() => setPedido(null)} />
    </AppLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Treino;
