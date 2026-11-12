// Painel do administrador: números dos clientes, lista de clientes, mandar treino e avisos.
// Os dados de cada cliente ficam na "gaveta" dele (sl-dados:e-mail) neste navegador.
import { useEffect, useState } from "react";
import AppLayout from "../componentes/AppLayout.jsx";
import { ICONES, CartaoNumero, Modal } from "../componentes/base.jsx";
import { usuario, toast } from "../lib/nucleo.js";
import { num, dataRelativa, iniciais } from "../lib/formato.js";
import { ler, gravar } from "../lib/armazenamento.js";
import { BIBLIOTECA } from "../lib/exercicios.js";
// Servidor (quando ligado)
import { api, apiLigada } from "../lib/api.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssApp from "../estilos/app.css?inline";
import cssAppAdmin from "../estilos/app-admin.css?inline";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssApp, cssAppAdmin];

// Um dia em milissegundos
const DIA = 86400000;
// Grupos da biblioteca
const GRUPOS = [...new Set(Object.values(BIBLIOTECA).map((e) => e.grupo))];

// Contas de cliente deste navegador
const clientes = () => ler("sl-contas", []).filter((c) => (c.tipo || "cliente") === "cliente");

// Lê um dado da gaveta de um cliente
function dadoDoCliente(email, chave, padrao) {
  // Gaveta
  const gaveta = ler("sl-dados:" + email, {});
  // Tenta ler
  try {
    // Valor
    return gaveta[chave] != null ? JSON.parse(gaveta[chave]) : padrao;
  } catch (e) {
    // Estragado
    return padrao;
  }
}

// Grava um dado na gaveta de um cliente
function gravarNoCliente(email, chave, valor) {
  // Gaveta
  const gaveta = ler("sl-dados:" + email, {});
  // Valor em texto
  gaveta[chave] = JSON.stringify(valor);
  // Guarda
  gravar("sl-dados:" + email, gaveta);
}

// Formulário de montar e mandar um treino
function FormTreino({ cliente, onEnviar }) {
  // Nome
  const [nome, setNome] = useState("");
  // Grupo
  const [grupo, setGrupo] = useState(GRUPOS[0]);
  // Exercícios do grupo
  const doGrupo = Object.keys(BIBLIOTECA).filter((n) => BIBLIOTECA[n].grupo === grupo);
  // Exercício escolhido
  const [ex, setEx] = useState(doGrupo[0]);
  // Lista do treino
  const [lista, setLista] = useState([]);
  // Formulário
  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Sem nome
        if (!nome.trim()) return document.getElementById("adm-nome").focus();
        // Sem exercício
        if (!lista.length) return toast("Adicione pelo menos 1 exercício");
        // Manda
        onEnviar(nome.trim(), lista.map((n) => ({ nome: n, series: 3, reps: 12, carga: BIBLIOTECA[n]?.carga || 0, descanso: 60 })));
      }}
    >
      {/* Nome */}
      <div className="form-group">
        <label htmlFor="adm-nome">Nome do treino</label>
        <input id="adm-nome" placeholder="Ex: Treino A - Pernas" required maxLength={40} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      {/* Grupo e exercício */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="adm-grupo">Grupo</label>
          <select
            id="adm-grupo"
            value={grupo}
            onChange={(e) => {
              // Troca o grupo
              setGrupo(e.target.value);
              // Primeiro exercício dele
              setEx(Object.keys(BIBLIOTECA).find((n) => BIBLIOTECA[n].grupo === e.target.value));
            }}
          >
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="adm-ex">Exercício</label>
          <select id="adm-ex" value={ex} onChange={(e) => setEx(e.target.value)}>
            {doGrupo.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Adicionar */}
      <button type="button" className="btn-secondary" onClick={() => (lista.includes(ex) ? toast("Esse já está no treino") : setLista(lista.concat(ex)))}>
        Adicionar exercício
      </button>
      {/* Escolhidos */}
      <ol className="adm-escolhidos">
        {lista.map((n) => (
          <li key={n}>
            <span>{n} • 3 x 12</span>
            <button type="button" className="btn-link" onClick={() => setLista(lista.filter((x) => x !== n))}>
              Tirar
            </button>
          </li>
        ))}
      </ol>
      {/* Mandar */}
      <button type="submit" className="btn-primary">
        Mandar para {cliente.nome.split(" ")[0]}
      </button>
    </form>
  );
}

// Página
function Admin() {
  // Cliente que vai receber o treino
  const [para, setPara] = useState(null);
  // Texto do aviso
  const [aviso, setAviso] = useState("");
  // Administrador
  const eu = usuario();
  // Clientes vindos do servidor (null = carregando)
  const [doServidor, setDoServidor] = useState(null);
  // Com servidor: busca os clientes da academia (de novo quando os dados mudam)
  const carregar = () => api("GET", "/admin/clientes").then((l) => setDoServidor(l.map((c) => ({ id: c.id, nome: c.nome, email: c.email, total: c.treinosTotal, semana: c.treinosSemana, ultimo: c.ultimoTreino ? { data: c.ultimoTreino } : null, peso: c.ultimoPesoKg })))).catch((e) => toast(e.message));
  // Ao abrir
  useEffect(() => {
    // Só com servidor
    if (apiLigada()) carregar();
  }, []);
  // Clientes com o resumo de cada um (do servidor ou deste navegador)
  const resumos = apiLigada() ? doServidor || [] : clientes().map((c) => {
    // Treinos
    const hist = dadoDoCliente(c.email, "sl-historico", []);
    // Último
    const ultimo = hist.slice().sort((a, b) => (a.data < b.data ? 1 : -1))[0];
    // Pesos
    const pesos = dadoDoCliente(c.email, "sl-pesos", []);
    // Resumo
    return { ...c, total: hist.length, semana: hist.filter((h) => Date.now() - new Date(h.data) < 7 * DIA).length, ultimo, peso: pesos.length ? pesos[pesos.length - 1].valor : null };
  });
  // Avisos publicados
  const avisos = ler("sl-avisos-admin", []);

  // Publica um aviso
  function publicar(e) {
    // Sem recarregar
    e.preventDefault();
    // Texto
    const texto = aviso.trim();
    // Vazio
    if (!texto) return;
    // Guarda (o mais novo primeiro)
    gravar("sl-avisos-admin", [{ id: "a" + Date.now(), texto, data: new Date().toISOString(), autor: eu.nome }].concat(avisos));
    // Limpa
    setAviso("");
    // Avisa
    toast("Aviso publicado para os clientes");
  }

  // Página
  return (
    <AppLayout pagina="admin">
      <section id="view-admin" className="view-section active" aria-labelledby="heading-admin">
        {/* Faixa do administrador */}
        <div className="faixa-admin" role="note">
          <span className="selo-admin">ADMIN</span>
          <span>
            Você está no <strong>acesso de administrador</strong>. Aqui você acompanha seus clientes, manda treinos e publica avisos. Clientes não veem esta página.
          </span>
        </div>
        {/* Topo */}
        <header className="page-header">
          <div>
            <h1 id="heading-admin">Painel do administrador</h1>
            <p className="page-lead">{apiLigada() ? "Clientes da sua academia e o que eles registraram." : "Clientes cadastrados neste aparelho e o que eles registraram."}</p>
            {/* Código para os clientes entrarem (com servidor) */}
            {apiLigada() && ler("sl-academia", null)?.codigo && (
              <p className="meta">
                Código da academia para os clientes: <strong>{ler("sl-academia", null).codigo}</strong>
              </p>
            )}
          </div>
        </header>
        {/* Números */}
        <div className="stats-grid">
          <CartaoNumero rotulo="Clientes" valor={String(resumos.length)} detalhe={apiLigada() ? "na sua academia" : "cadastrados neste aparelho"} icone={ICONES.joinha} />
          <CartaoNumero rotulo="Ativos na semana" valor={String(resumos.filter((r) => r.semana > 0).length)} detalhe="treinaram nos últimos 7 dias" icone={ICONES.fogo} cor="emerald" />
          <CartaoNumero rotulo="Treinos na semana" valor={String(resumos.reduce((s, r) => s + r.semana, 0))} detalhe="somando todos os clientes" icone={ICONES.haltere} />
        </div>
        {/* Clientes */}
        <section className="panel" aria-labelledby="titulo-clientes">
          <h2 id="titulo-clientes">Clientes</h2>
          <ul className="adm-clientes">
            {!resumos.length && <li className="meta">{apiLigada() ? (doServidor ? `Nenhum cliente ainda. Passe o código da academia (${ler("sl-academia", null)?.codigo || "veja no topo"}) para seus clientes.` : "Carregando clientes...") : 'Nenhum cliente ainda. Quando alguém criar uma conta "Sou cliente" neste aparelho, aparece aqui.'}</li>}
            {resumos.map((r) => (
              <li key={r.email} className="adm-cliente">
                <span className="adm-avatar" aria-hidden="true">
                  {iniciais(r.nome)}
                </span>
                <div className="adm-cliente-info">
                  <strong>{r.nome}</strong>
                  <span className="meta">{r.email}</span>
                  <span className="meta">
                    {r.total} treino{r.total === 1 ? "" : "s"} no total • {r.semana} na semana • {r.ultimo ? "último " + dataRelativa(r.ultimo.data).toLowerCase() : "ainda não treinou"}
                    {r.peso ? ` • ${num(r.peso, 1)} kg` : ""}
                  </span>
                </div>
                <button type="button" className="btn-secondary" onClick={() => setPara(r)}>
                  Mandar treino
                </button>
              </li>
            ))}
          </ul>
        </section>
        {/* Avisos */}
        <section className="panel" aria-labelledby="titulo-avisos">
          <h2 id="titulo-avisos">Avisos para os clientes</h2>
          <p className="meta">O aviso aparece no Início de todos os clientes.</p>
          <form className="adm-aviso-form" onSubmit={publicar}>
            <label className="sr-only" htmlFor="adm-aviso">
              Texto do aviso
            </label>
            <input id="adm-aviso" type="text" maxLength={120} placeholder="Ex: Academia fecha às 18h no feriado" required value={aviso} onChange={(e) => setAviso(e.target.value)} />
            <button type="submit" className="btn-primary">
              Publicar
            </button>
          </form>
          <ul className="adm-avisos">
            {!avisos.length && <li className="meta">Nenhum aviso publicado.</li>}
            {avisos.map((a) => (
              <li key={a.id}>
                <div>
                  <strong>{a.texto}</strong>
                  <span className="meta"> • {dataRelativa(a.data)}</span>
                </div>
                <button type="button" className="btn-link" onClick={() => gravar("sl-avisos-admin", avisos.filter((x) => x.id !== a.id))}>
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        </section>
      </section>

      {/* Mandar treino */}
      <Modal titulo={para ? `Treino para ${para.nome}` : ""} aberto={!!para} onFechar={() => setPara(null)}>
        {para && (
          <FormTreino
            cliente={para}
            onEnviar={async (nome, itens) => {
              // Com servidor: manda pela API
              if (apiLigada()) {
                // Tenta
                try {
                  // Manda (formato do servidor)
                  await api("POST", `/admin/clientes/${para.id}/treinos`, { nome, itens: itens.map((i) => ({ nome: i.nome, series: i.series, reps: String(i.reps), carga: i.carga, descansoS: i.descanso })) });
                } catch (e) {
                  // Erro
                  return toast(e.message);
                }
                // Avisa
                toast(`Treino enviado para ${para.nome.split(" ")[0]}!`);
                // Fecha
                return setPara(null);
              }
              // Treinos do cliente
              const treinos = dadoDoCliente(para.email, "sl-treinos", []);
              // Põe o novo no topo
              gravarNoCliente(para.email, "sl-treinos", [{ id: "t" + Date.now(), nome, grupo: `Enviado por ${eu.nome}`, itens, exercicios: itens.length, autor: eu.nome }].concat(treinos));
              // Avisa
              toast(`Treino enviado para ${para.nome.split(" ")[0]}! Aparece em Treinos quando ele entrar.`);
              // Fecha
              setPara(null);
            }}
          />
        )}
      </Modal>
    </AppLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Admin;
