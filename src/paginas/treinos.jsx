// Meus treinos: lista de fichas, criar, editar, excluir (com desfazer), ver exercícios e montar automático.
import { useState } from "react";
import { montar } from "../montar.jsx";
import AppLayout from "../componentes/AppLayout.jsx";
import { Icone, ICONES, EstadoVazio, Modal, Confirmar } from "../componentes/base.jsx";
import { treinosDoUsuario, treinoAtual, exerciciosDe, ultimaVez, linkTreino, toast, premium, onboarding, resumoExercicio, novoExercicio } from "../lib/nucleo.js";
import { dataRelativa } from "../lib/formato.js";
import { ler, gravar } from "../lib/armazenamento.js";
import { BIBLIOTECA } from "../lib/exercicios.js";
import "../estilos/kit-app.js";
import "../estilos/app-treinos.css";

// Grupos da biblioteca (filtro)
const GRUPOS = ["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Cardio", "Mobilidade"];
// Desenho do olho (ver exercícios)
const OLHO = ["M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"];
// Desenho da estrela (automático)
const ESTRELA = ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"];
// Divisões do plano da semana: [nome, grupos]
const DIVISOES = [
  ["Peito, ombros e tríceps", ["Peito", "Ombros", "Braços"]],
  ["Costas e bíceps", ["Costas", "Braços"]],
  ["Pernas e core", ["Pernas", "Core"]],
  ["Corpo inteiro e cardio", ["Cardio", "Pernas", "Peito", "Costas"]],
  ["Ombros, braços e core", ["Ombros", "Braços", "Core"]],
  ["Mobilidade e recuperação", ["Mobilidade", "Core"]],
];

// Mistura uma lista
const embaralhar = (lista) => lista.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

// Sorteia exercícios dos grupos, alternando entre eles
function sortear(grupos, lugar, quantidade) {
  // Exercícios possíveis (em casa, só os que não precisam de aparelho)
  const pool = Object.entries(BIBLIOTECA).filter(([, info]) => grupos.includes(info.grupo) && (lugar === "academia" || info.lugar !== "academia"));
  // Separados por grupo e misturados
  const porGrupo = grupos.map((g) => embaralhar(pool.filter(([, i]) => i.grupo === g))).filter((l) => l.length);
  // Escolhidos
  const escolhidos = [];
  // Um de cada grupo por vez
  for (let r = 0; escolhidos.length < quantidade && porGrupo.some((l) => l.length); r++) {
    // Grupo da vez
    const l = porGrupo[r % porGrupo.length];
    // Pega um
    if (l.length) escolhidos.push(l.shift()[0]);
  }
  // Vira exercício
  return escolhidos.map(novoExercicio);
}

// Formulário de criar ou editar treino
function FormTreino({ treino, onSalvar }) {
  // Nome
  const [nome, setNome] = useState(treino?.nome || "");
  // Grupo
  const [grupo, setGrupo] = useState(treino?.grupo || "");
  // Exercícios (um por linha)
  const [itens, setItens] = useState(treino ? exerciciosDe(treino).map((e) => e.nome).join("\n") : "");
  // Busca na lista
  const [busca, setBusca] = useState("");
  // Filtro de grupo da lista
  const [filtro, setFiltro] = useState("");
  // Nomes digitados
  const nomes = itens.split("\n").map((l) => l.trim()).filter(Boolean);
  // Marca ou desmarca um exercício da lista
  const alternar = (n, marcado) => setItens((marcado ? (nomes.includes(n) ? nomes : nomes.concat(n)) : nomes.filter((x) => x !== n)).join("\n"));
  // Exercícios da lista que batem com a busca e o filtro
  const lista = Object.entries(BIBLIOTECA).filter(([n, info]) => (!filtro || info.grupo === filtro) && (!busca || n.toLowerCase().includes(busca.trim().toLowerCase())));
  // Formulário
  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Sem nome: foca
        if (!nome.trim()) return document.getElementById("treino-nome").focus();
        // Exercícios anteriores (mantém séries e cargas)
        const anteriores = treino ? exerciciosDe(treino) : [];
        // Lista final (no máximo 30)
        const lista = (nomes.length ? nomes : ["Exercício 1"]).slice(0, 30).map((n) => anteriores.find((a) => a.nome.toLowerCase() === n.toLowerCase()) || novoExercicio(n));
        // Salva
        onSalvar({ nome: nome.trim(), grupo: grupo.trim() || "Corpo inteiro", itens: lista, exercicios: lista.length });
      }}
    >
      {/* Nome */}
      <div className="form-group">
        <label htmlFor="treino-nome">Nome do treino</label>
        <input id="treino-nome" placeholder="Ex: Membros Superiores B" required maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      {/* Grupo */}
      <div className="form-group">
        <label htmlFor="treino-grupo">Grupo muscular</label>
        <input id="treino-grupo" placeholder="Ex: Peito e Tríceps" maxLength={60} value={grupo} onChange={(e) => setGrupo(e.target.value)} />
      </div>
      {/* Escolher da lista */}
      <details className="escolha">
        <summary>Escolher da lista ({Object.keys(BIBLIOTECA).length} exercícios com dicas)</summary>
        {/* Filtros */}
        <div className="escolha-filtros">
          <input type="search" className="escolha-busca" placeholder="Buscar exercício…" aria-label="Buscar exercício" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <select className="escolha-grupo" aria-label="Filtrar por grupo" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos os grupos</option>
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        {/* Lista */}
        <div className="escolha-lista">
          {lista.map(([n, info]) => (
            <label key={n} className="check-row">
              <input type="checkbox" value={n} checked={nomes.includes(n)} onChange={(e) => alternar(n, e.target.checked)} />
              <span>
                <strong>{n}</strong>
                <small className="meta">
                  {" "}
                  {info.grupo} • {info.lugar === "casa" ? "casa" : info.lugar === "academia" ? "academia" : "casa ou academia"}
                </small>
              </span>
            </label>
          ))}
        </div>
      </details>
      {/* Exercícios */}
      <div className="form-group">
        <label htmlFor="treino-itens">Exercícios (um por linha)</label>
        <textarea id="treino-itens" rows={6} placeholder={"Supino reto\nCrucifixo\nTríceps na corda"} value={itens} onChange={(e) => setItens(e.target.value)} />
      </div>
      {/* Dica */}
      <p className="form-hint">Cada exercício começa com 3 séries de 12. Você ajusta reps e carga durante o treino.</p>
      {/* Salvar */}
      <button type="submit" className="btn-primary">
        {treino ? "Salvar alterações" : "Salvar treino"}
      </button>
    </form>
  );
}

// Grupo de botões de escolha (rádio)
const Opcoes = ({ titulo, nome, opcoes, valor, onMudar }) => (
  <fieldset className="auto-opcoes">
    <legend>{titulo}</legend>
    {opcoes.map(([v, t]) => (
      <label key={v} className="auto-chip">
        <input type="radio" name={nome} value={v} checked={valor === v} onChange={() => onMudar(v)} />
        <span>{t}</span>
      </label>
    ))}
  </fieldset>
);

// Formulário do treino automático
function FormAutomatico({ onHoje, onSemana }) {
  // Tempo
  const [tempo, setTempo] = useState(30);
  // Foco
  const [foco, setFoco] = useState("Corpo inteiro");
  // Lugar
  const [lugar, setLugar] = useState(() => ler("sl-lugar", "academia"));
  // Formulário
  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Monta
        onHoje(tempo, foco, lugar);
      }}
    >
      <p className="modal-text">Diga quanto tempo você tem, o foco e onde vai treinar. O app monta o treino com dicas em cada exercício.</p>
      {/* Tempo */}
      <Opcoes titulo="Quanto tempo você tem?" nome="auto-tempo" opcoes={[15, 30, 45, 60].map((m) => [m, `${m} min`])} valor={tempo} onMudar={setTempo} />
      {/* Foco */}
      <Opcoes titulo="Qual o foco?" nome="auto-foco" opcoes={["Corpo inteiro", "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Cardio"].map((g) => [g, g])} valor={foco} onMudar={setFoco} />
      {/* Lugar */}
      <Opcoes titulo="Onde?" nome="auto-lugar" opcoes={[["academia", "Academia"], ["casa", "Em casa"]]} valor={lugar} onMudar={setLugar} />
      {/* Botões */}
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={() => onSemana(lugar)}>
          Montar plano da semana
        </button>
        <button type="submit" className="btn-primary">
          Montar treino de hoje
        </button>
      </div>
    </form>
  );
}

// Página
function Treinos() {
  // Treinos
  const treinos = treinosDoUsuario();
  // Janela aberta: { tipo: "novo" | "editar" | "ver" | "auto", treino }
  const [janela, setJanela] = useState(null);
  // Pedido de confirmação
  const [pedido, setPedido] = useState(null);
  // Treino em andamento
  const atual = treinoAtual();
  // Fecha a janela
  const fechar = () => setJanela(null);
  // Guarda a lista
  const guardar = (lista) => gravar("sl-treinos", lista);

  // Confere se pode usar o automático (Free: 1 vez)
  function podeAutomatico() {
    // Usos
    const usos = ler("sl-auto-usos", 0);
    // Premium ou primeiro uso: pode
    if (premium() || usos < 1) return gravar("sl-auto-usos", usos + 1), true;
    // Fecha a janela
    fechar();
    // Oferece o Premium
    setPedido({ titulo: "Treino automático é Premium", texto: "Você já usou o teste grátis. No Premium o app monta treinos e planos da semana sem limite.", rotulo: "Ver planos", fn: () => (location.href = "../planos/planos.html") });
    // Não pode
    return false;
  }

  // Põe treinos novos no topo
  function adicionar(novos, aviso) {
    // Guarda
    guardar(novos.concat(treinos));
    // Fecha
    fechar();
    // Avisa
    toast(aviso);
  }

  // Monta o treino de hoje
  function automaticoHoje(tempo, foco, lugar) {
    // Pode?
    if (!podeAutomatico()) return;
    // Lembra o lugar
    gravar("sl-lugar", lugar);
    // Grupos do foco
    const grupos = foco === "Corpo inteiro" ? ["Pernas", "Peito", "Costas", "Core", "Ombros"] : foco === "Cardio" ? ["Cardio", "Core"] : [foco, foco === "Pernas" ? "Core" : foco];
    // Exercícios (1 a cada 8 min, no mínimo 3)
    const itens = sortear(grupos, lugar, Math.max(3, Math.round(tempo / 8)));
    // Adiciona
    adicionar([{ id: "t" + Date.now(), nome: `${foco} em ${tempo} min`, grupo: `${foco} • ${lugar === "casa" ? "em casa" : "academia"}`, itens, exercicios: itens.length }], "Treino montado! Ele está no topo da lista.");
  }

  // Monta o plano da semana (um treino por dia da meta)
  function automaticoSemana(lugar) {
    // Pode?
    if (!podeAutomatico()) return;
    // Dias da meta (2 a 6)
    const dias = Math.min(6, Math.max(2, Number(onboarding().dias) || 4));
    // Divisões
    const escolha = dias === 2 ? [["Superiores", ["Peito", "Costas", "Ombros", "Braços"]], ["Inferiores e core", ["Pernas", "Core"]]] : DIVISOES.slice(0, dias);
    // Hora (para os códigos)
    const agora = Date.now();
    // Treinos
    const novos = escolha.map(([nome, grupos], i) => {
      // Exercícios
      const itens = sortear(grupos, lugar, 6);
      // Treino
      return { id: `t${agora}${i}`, nome: `Plano ${"ABCDEF"[i]}: ${nome}`, grupo: nome, itens, exercicios: itens.length };
    });
    // Adiciona
    adicionar(novos, `Plano da semana pronto: ${novos.length} treinos (${dias} dias, como a sua meta).`);
  }

  // Salva o formulário de criar/editar
  function salvar(dados) {
    // Editando?
    const editando = janela.tipo === "editar";
    // Atualiza ou cria
    guardar(editando ? treinos.map((t) => (t.id === janela.treino.id ? { ...t, ...dados } : t)) : [{ id: "t" + Date.now(), ...dados }, ...treinos]);
    // Fecha
    fechar();
    // Avisa
    toast(editando ? "Treino atualizado" : "Treino salvo!");
  }

  // Pede para excluir (com desfazer)
  function excluir(treino) {
    // Posição
    const pos = treinos.findIndex((t) => t.id === treino.id);
    // Confirmação
    setPedido({
      titulo: "Excluir treino?",
      texto: `"${treino.nome}" sai da sua lista. O histórico de treinos feitos continua salvo.`,
      rotulo: "Excluir",
      perigo: true,
      fn: () => {
        // Tira
        guardar(treinos.filter((t) => t.id !== treino.id));
        // Avisa com desfazer
        toast("Treino excluído", {
          rotulo: "Desfazer",
          fn: () => {
            // Lista atual
            const lista = treinosDoUsuario();
            // Volta na mesma posição
            lista.splice(pos, 0, treino);
            // Guarda
            guardar(lista);
            // Avisa
            toast("Treino restaurado");
          },
        });
      },
    });
  }

  // Treino que está aberto na janela "ver"
  const visto = janela?.tipo === "ver" ? janela.treino : null;
  // Página
  return (
    <AppLayout pagina="treinos">
      <section id="view-treinos" className="view-section active" aria-labelledby="heading-treinos">
        {/* Topo */}
        <header className="page-header">
          <div>
            <h1 id="heading-treinos">Meus treinos</h1>
            <p className="page-lead">Monte suas fichas e registre cada série durante o treino.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn-secondary btn-with-icon" onClick={() => setJanela({ tipo: "auto" })}>
              <Icone d={ESTRELA} />
              Montar automático
            </button>
            <button className="btn-primary btn-with-icon" onClick={() => setJanela({ tipo: "novo" })}>
              <Icone d={ICONES.mais} />
              Novo treino
            </button>
          </div>
        </header>

        {/* Lista */}
        <div className="workouts-list-container cards-grid">
          {/* Vazio */}
          {!treinos.length && (
            <EstadoVazio titulo="Você ainda não criou treinos" texto="Monte seu primeiro treino e acompanhe cada série.">
              <button className="btn-primary" onClick={() => setJanela({ tipo: "novo" })}>
                Criar treino
              </button>
            </EstadoVazio>
          )}
          {/* Cartões */}
          {treinos.map((t) => {
            // Exercícios
            const ex = exerciciosDe(t);
            // Em andamento?
            const andamento = atual && atual.treinoId === t.id;
            // Cartão
            return (
              <article key={t.id} className="workout-card workout-card-col">
                {/* Topo */}
                <div className="workout-card-head">
                  <span className="icon-tile icon-tile-coral icon-tile-lg" aria-hidden="true">
                    <Icone d={ICONES.haltere} />
                  </span>
                  <div className="card-info">
                    <h3>{t.nome}</h3>
                    <p className="muscle-group">{t.grupo}</p>
                  </div>
                  {andamento && <span className="tag tag-success">Em andamento</span>}
                </div>
                {/* Números */}
                <ul className="workout-facts">
                  <li>
                    <strong>{ex.length}</strong> exercícios
                  </li>
                  <li>
                    <strong>{ex.reduce((s, e) => s + Number(e.series || 0), 0)}</strong> séries
                  </li>
                  <li>Último: {dataRelativa(ultimaVez(t.id))}</li>
                </ul>
                {/* Ações */}
                <div className="card-actions">
                  <a href={linkTreino(t.id)} className="btn-primary btn-with-icon">
                    <Icone d={ICONES.play} />
                    {andamento ? "Continuar" : "Iniciar treino"}
                  </a>
                  <button className="btn-icon btn-outline" aria-label={`Ver exercícios de ${t.nome}`} onClick={() => setJanela({ tipo: "ver", treino: t })}>
                    <Icone d={OLHO} />
                  </button>
                  <button className="btn-icon btn-outline" aria-label={`Editar treino ${t.nome}`} onClick={() => setJanela({ tipo: "editar", treino: t })}>
                    <Icone d={ICONES.lapis} />
                  </button>
                  <button className="btn-icon btn-outline btn-danger" aria-label={`Excluir treino ${t.nome}`} onClick={() => excluir(t)}>
                    <Icone d={ICONES.lixeira} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Criar ou editar */}
      <Modal titulo={janela?.tipo === "editar" ? "Editar treino" : "Criar novo treino"} aberto={janela?.tipo === "novo" || janela?.tipo === "editar"} onFechar={fechar}>
        <FormTreino key={janela?.treino?.id || "novo"} treino={janela?.tipo === "editar" ? janela.treino : null} onSalvar={salvar} />
      </Modal>

      {/* Automático */}
      <Modal titulo="Montar treino automático" aberto={janela?.tipo === "auto"} onFechar={fechar}>
        <FormAutomatico onHoje={automaticoHoje} onSemana={automaticoSemana} />
      </Modal>

      {/* Ver exercícios */}
      <Modal titulo={visto?.nome} aberto={!!visto} onFechar={fechar}>
        {visto && (
          <>
            <p className="modal-text">
              {visto.grupo} • {exerciciosDe(visto).length} exercícios
            </p>
            <ol className="list-panel exercise-preview">
              {exerciciosDe(visto).map((e, i) => (
                <li key={i}>
                  <span className="exercise-index" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <strong>{e.nome}</strong>
                    <span>{resumoExercicio(e)}</span>
                  </div>
                </li>
              ))}
            </ol>
            <a href={linkTreino(visto.id)} className="btn-primary btn-block">
              Iniciar treino
            </a>
          </>
        )}
      </Modal>

      {/* Confirmação */}
      <Confirmar pedido={pedido} onFechar={() => setPedido(null)} />
    </AppLayout>
  );
}

// Desenha
montar(Treinos);
