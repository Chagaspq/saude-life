// Perfil: tipo de conta (cliente x administrador), objetivos, conquistas, atividade,
// preferências e lembretes, e a conta (segurança, backup, apagar, sair e excluir).
import { useState } from "react";
import AppLayout from "../componentes/AppLayout.jsx";
import { Icone, ICONES, Modal, Confirmar } from "../componentes/base.jsx";
import { usuario, estatisticas, historico, onboarding, premium, plano, toast } from "../lib/nucleo.js";
import { num, dataRelativa, duracaoTexto, iniciais, slug } from "../lib/formato.js";
import { ler, gravar } from "../lib/armazenamento.js";
import { lerSessao, ehAdmin, sair, trocarEmail, mudarSenha, excluirConta, limparTudo, emailValido } from "../lib/conta.js";
import { preencherDemo } from "../lib/demo.js";
// Servidor (quando ligado)
import { api, apiLigada } from "../lib/api.js";
import { excluirNoServidor } from "../lib/conta.js";
import { puxar } from "../lib/nuvem.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssApp from "../estilos/app.css?inline";
import cssAppPerfil from "../estilos/app-perfil.css?inline";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";
// Troca de tela pelo código (React Router)
import { irPara } from "../lib/navegar.js";
// Campos com ref (focar o campo com erro)
import { useCampos } from "../lib/campos.js";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssApp, cssAppPerfil];

// O que muda entre cliente e administrador: [o quê, cliente, administrador]
const COMPARA = [
  ["Páginas", "Início, Treinos, Alimentação, Evolução e Perfil", "Painel do administrador e Perfil"],
  ["Treinos", "Registra os próprios treinos", "Monta e manda treinos para os clientes"],
  ["Dados", "Vê só os próprios dados", "Vê os clientes e quanto cada um treinou"],
  ["Avisos", "Recebe os avisos no Início", "Publica avisos para todos os clientes"],
  ["Marca na tela", "Nenhuma", "Selo ADMIN no topo e faixa verde"],
];
// Capas do perfil: [id, nome]
const CAPAS = [
  ["brasa", "Brasa"],
  ["mata", "Mata"],
  ["noite", "Noite"],
  ["sol", "Pôr do sol"],
];
// Dias do lembrete: letra e nome (0 = domingo)
const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
// Nomes
const NOMES_DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
// Tipos de aviso: [id, nome, texto]
const TIPOS_AVISO = [
  ["treino", "Treino", "Lembrete no horário combinado"],
  ["agua", "Água", "A cada 2 horas, se ainda não bateu a meta"],
];
// Chaves que não entram no backup (são do navegador, não da pessoa)
const GLOBAIS = ["sl-contas", "sl-conta", "sl-sessao", "sl-tema", "sl-idioma", "sl-reset-pedidos", "sl-pedidos-academia", "sl-dono", "sl-a11y", "sl-avisos-admin"];
// Chaves dos dados da pessoa (o "apagar meus dados" limpa)
const DADOS_PESSOA = ["sl-quiz", "sl-onboarding", "sl-treinos", "sl-perfil", "sl-pesos", "sl-agua", "sl-refeicoes", "sl-historico", "sl-treino-atual", "sl-pontos", "sl-liga", "sl-plano", "sl-assinatura", "sl-teste-usado", "sl-auto-usos", "sl-lugar", "sl-ultimas", "sl-recordes", "sl-metas-modo", "sl-metas-manual", "sl-lembrete-agua", "sl-agua-ultimo", "sl-metas-pessoais", "sl-avisos", "sl-lembrete-treino", "sl-lembrete-dia", "sl-refeicoes-dias", "sl-cargas", "sl-lidas"];

// Baixa um evento de agenda (.ics) que se repete nos dias escolhidos
function baixarAgenda({ titulo, inicio, minutos = 60, descricao = "", repetir }) {
  // Data no formato do calendário
  const fmt = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
  // Fim
  const fim = new Date(inicio.getTime() + minutos * 60000);
  // Siglas dos dias
  const SIGLAS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  // Linhas do arquivo
  const linhas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Saude Life//PT-BR", "BEGIN:VEVENT", `UID:${Date.now()}@saudelife`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(inicio)}`, `DTEND:${fmt(fim)}`, `SUMMARY:${titulo}`, `DESCRIPTION:${descricao}`, repetir?.length ? `RRULE:FREQ=WEEKLY;BYDAY=${repetir.map((d) => SIGLAS[d]).join(",")}` : null, "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", `DESCRIPTION:${titulo}`, "END:VALARM", "END:VEVENT", "END:VCALENDAR"].filter(Boolean);
  // Baixa
  baixar(new Blob([linhas.join("\r\n")], { type: "text/calendar" }), `${slug(titulo) || "treino"}.ics`);
  // Avisa
  toast("Evento baixado. Abra o arquivo para pôr na sua agenda.");
}

// Baixa um arquivo
function baixar(arquivo, nome) {
  // Link
  const a = document.createElement("a");
  // Endereço
  a.href = URL.createObjectURL(arquivo);
  // Nome
  a.download = nome;
  // Clica
  a.click();
  // Libera depois
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Chave liga/desliga com título e texto
function Chave({ titulo, texto, ligado, onMudar, rotulo }) {
  // Linha
  return (
    <label className="switch-row">
      <span>
        <strong>{titulo}</strong>
        <small>{texto}</small>
      </span>
      <input type="checkbox" className="switch" role="switch" aria-label={rotulo} checked={ligado} onChange={(e) => onMudar(e.target.checked)} />
    </label>
  );
}

// Formulário de editar perfil
function FormPerfil({ onSalvar }) {
  // Campos da tela (ref do React) para focar o que tiver erro
  const campos = useCampos();
  // Perfil salvo
  const p = ler("sl-perfil", {});
  // Usuário
  const u = usuario();
  // Campos
  const [c, setC] = useState({ nome: u.nome, apelido: p.apelido || "", bio: p.bio || "", capa: p.capa || "brasa", foto: p.foto || "" });
  // Muda
  const mudar = (k) => (e) => setC({ ...c, [k]: e.target.value });
  // Lê a foto (quadrado de 256 px)
  function lerFoto(f) {
    // Só imagem
    if (!f || !f.type.startsWith("image/")) return;
    // Imagem
    const img = new Image();
    // Carregou
    img.onload = () => {
      // Tela
      const t = document.createElement("canvas");
      // Tamanho
      t.width = t.height = 256;
      // Lado
      const lado = Math.min(img.width, img.height);
      // Desenha o meio
      t.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 256, 256);
      // Guarda
      setC((x) => ({ ...x, foto: t.toDataURL("image/jpeg", 0.8) }));
      // Libera
      URL.revokeObjectURL(img.src);
    };
    // Abre
    img.src = URL.createObjectURL(f);
  }
  // Formulário
  return (
    <form
      className="modal-form"
      onSubmit={(e) => {
        // Sem recarregar
        e.preventDefault();
        // Sem nome: foca
        if (!c.nome.trim()) return campos.focar("perfil-nome");
        // Guarda
        gravar("sl-perfil", { ...p, nome: c.nome.trim(), apelido: c.apelido.trim(), bio: c.bio.trim(), capa: c.capa, foto: c.foto });
        // Pronto
        onSalvar();
      }}
    >
      {/* Foto */}
      <div className="perfil-foto-linha">
        <span className={"profile-avatar-lg avatar-initials perfil-foto-previa" + (c.foto ? " tem-foto" : "")} aria-hidden="true" style={c.foto ? { backgroundImage: `url(${c.foto})` } : undefined}>
          {c.foto ? "" : iniciais(c.nome)}
        </span>
        <label htmlFor="perfil-foto" className="btn-secondary">
          Trocar foto
        </label>
        <input type="file" id="perfil-foto" accept="image/*" className="sr-only" onChange={(e) => lerFoto(e.target.files[0])} />
        {c.foto && (
          <button type="button" className="btn-secondary" onClick={() => setC({ ...c, foto: "" })}>
            Remover foto
          </button>
        )}
      </div>
      {/* Nome */}
      <div className="form-group">
        <label htmlFor="perfil-nome">Nome</label>
        <input id="perfil-nome" ref={campos.ref("perfil-nome")} required maxLength={50} value={c.nome} onChange={mudar("nome")} />
      </div>
      {/* Apelido */}
      <div className="form-group">
        <label htmlFor="perfil-apelido">Apelido (aparece na saudação)</label>
        <input id="perfil-apelido" maxLength={20} value={c.apelido} onChange={mudar("apelido")} />
      </div>
      {/* Bio */}
      <div className="form-group">
        <label htmlFor="perfil-bio">Bio</label>
        <textarea id="perfil-bio" rows={3} maxLength={160} value={c.bio} onChange={mudar("bio")} />
      </div>
      {/* Capa */}
      <fieldset className="form-group perfil-opcoes">
        <legend>Capa do perfil</legend>
        <div className="perfil-opcoes-lista">
          {CAPAS.map(([id, nome]) => (
            <label key={id} className={`perfil-opcao opcao-capa-${id}`} title={nome}>
              <input type="radio" name="capa" value={id} className="sr-only" checked={c.capa === id} onChange={mudar("capa")} />
              <span className="perfil-opcao-cor" aria-hidden="true" />
              <span className="perfil-opcao-nome">{nome}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="btn-primary">
        Salvar alterações
      </button>
    </form>
  );
}

// Formulários de trocar e-mail e senha
function FormSeguranca({ onPronto }) {
  // E-mail atual
  const email = lerSessao()?.email || "";
  // Campos
  const [c, setC] = useState({ email, senhaEmail: "", atual: "", nova: "" });
  // Mensagens de erro
  const [msg, setMsg] = useState({ email: "", senha: "" });
  // Muda
  const mudar = (k) => (e) => setC({ ...c, [k]: e.target.value });
  // Formulários
  return (
    <>
      {/* E-mail */}
      <form
        className="modal-form"
        onSubmit={async (e) => {
          // Sem recarregar
          e.preventDefault();
          // E-mail novo
          const novo = c.email.trim().toLowerCase();
          // Inválido
          if (!emailValido(novo)) return setMsg({ ...msg, email: "Digite um e-mail válido." });
          // Troca
          const erro = await trocarEmail(email, c.senhaEmail, novo);
          // Erro
          if (erro) return setMsg({ ...msg, email: erro });
          // Pronto
          onPronto("E-mail trocado");
        }}
      >
        <h3>Trocar e-mail</h3>
        <div className="form-group">
          <label htmlFor="seg-email">E-mail novo</label>
          <input id="seg-email" type="email" required value={c.email} onChange={mudar("email")} />
        </div>
        <div className="form-group">
          <label htmlFor="seg-senha-email">Sua senha atual</label>
          <input id="seg-senha-email" type="password" required value={c.senhaEmail} onChange={mudar("senhaEmail")} />
        </div>
        <p className="field-error" role="alert">
          {msg.email}
        </p>
        <button type="submit" className="btn-primary">
          Salvar e-mail
        </button>
      </form>
      {/* Senha */}
      <form
        className="modal-form"
        onSubmit={async (e) => {
          // Sem recarregar
          e.preventDefault();
          // Troca
          const erro = await mudarSenha(email, c.atual, c.nova);
          // Erro
          if (erro) return setMsg({ ...msg, senha: erro });
          // Pronto
          onPronto("Senha trocada");
        }}
      >
        <h3>Trocar senha</h3>
        <div className="form-group">
          <label htmlFor="seg-atual">Senha atual</label>
          <input id="seg-atual" type="password" required value={c.atual} onChange={mudar("atual")} />
        </div>
        <div className="form-group">
          <label htmlFor="seg-nova">Senha nova (mínimo 8 caracteres)</label>
          <input id="seg-nova" type="password" required value={c.nova} onChange={mudar("nova")} />
        </div>
        <p className="field-error" role="alert">
          {msg.senha}
        </p>
        <button type="submit" className="btn-primary">
          Salvar senha
        </button>
      </form>
    </>
  );
}

// Página
function Perfil() {
  // Janela aberta: "perfil" | "seguranca"
  const [janela, setJanela] = useState("");
  // Pedido de confirmação
  const [pedido, setPedido] = useState(null);
  // Usuário
  const u = usuario();
  // Perfil salvo
  const p = ler("sl-perfil", {});
  // Números
  const stats = estatisticas();
  // Administrador?
  const admin = ehAdmin();
  // Questionário
  const obj = onboarding();
  // Treinos feitos
  const hist = historico();
  // Lembrete de treino
  const lembrete = ler("sl-lembrete-treino", { hora: "18:00", dias: [1, 2, 3, 4, 5] });
  // Tipos de aviso ligados
  const tipos = ler("sl-avisos-tipos", {});
  // Silêncio
  const silencio = ler("sl-silencio", { ligado: true, de: "22:00", ate: "07:00" });
  // Assinatura
  const assinatura = ler("sl-assinatura", null);
  // Conta de demonstração do cliente?
  const demo = lerSessao()?.email === "demo@saudelife.app";
  // Fecha
  const fechar = () => setJanela("");

  // Conquistas
  const conquistas = [
    { nome: "Primeiro treino", texto: "Registrou o primeiro treino", feito: stats.total >= 1, icone: ICONES.play },
    { nome: "10 treinos", texto: "Dez treinos concluídos", feito: stats.total >= 10, icone: ICONES.haltere },
    { nome: "25 treinos", texto: `${Math.min(stats.total, 25)} de 25 treinos`, feito: stats.total >= 25, icone: ICONES.trofeu },
    { nome: "Meta da semana", texto: `${stats.nestaSemana} de ${stats.meta} nesta semana`, feito: stats.nestaSemana >= stats.meta, icone: ICONES.alvo },
    { nome: "Constância", texto: "4 semanas seguidas treinando", feito: stats.sequencia >= 4, icone: ICONES.fogo },
  ];

  // Guarda o lembrete
  const salvarLembrete = (novo) => gravar("sl-lembrete-treino", { ...lembrete, ...novo });

  // Baixa os dados da pessoa (backup)
  function baixarDados() {
    // Chaves da pessoa
    const chaves = {};
    // Junta
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sl-") && !GLOBAIS.includes(k) && !k.startsWith("sl-dados:"))
      .forEach((k) => (chaves[k] = localStorage.getItem(k)));
    // Arquivo
    baixar(new Blob([JSON.stringify({ app: "saude-life", versao: 1, data: new Date().toISOString(), email: u.email, chaves }, null, 1)], { type: "application/json" }), `saude-life-backup-${new Date().toISOString().slice(0, 10)}.json`);
    // Avisa
    toast("Backup baixado");
  }

  // Restaura um backup
  function restaurar(f) {
    // Sem arquivo
    if (!f) return;
    // Lê
    f.text().then((texto) => {
      // Dados
      let dados = null;
      // Tenta ler
      try {
        // Converte
        dados = JSON.parse(texto);
      } catch (e) {
        // Não é JSON
        dados = null;
      }
      // Não é backup
      if (!dados || dados.app !== "saude-life" || !dados.chaves) return toast("Esse arquivo não é um backup do Saúde Life.");
      // Confirma
      setPedido({
        titulo: "Restaurar este backup?",
        texto: `Seus dados atuais serão trocados pelos do backup de ${new Date(dados.data).toLocaleDateString("pt-BR")}.`,
        rotulo: "Restaurar",
        fn: () => {
          // Grava as chaves
          Object.entries(dados.chaves).forEach(([k, v]) => k.startsWith("sl-") && !GLOBAIS.includes(k) && localStorage.setItem(k, v));
          // Recarrega
          location.reload();
        },
      });
    });
  }

  // Página
  return (
    <AppLayout pagina="perfil">
      <section id="view-perfil" className="view-section active" aria-labelledby="heading-perfil">
        {/* Cartão do topo */}
        <div className="profile-header-card" data-capa={p.capa || "brasa"}>
          <span className={"profile-avatar-lg avatar-initials" + (u.foto ? " tem-foto" : "")} aria-hidden="true" style={u.foto ? { backgroundImage: `url(${u.foto})` } : undefined}>
            {u.foto ? "" : iniciais(u.nome)}
          </span>
          <div className="profile-info">
            <h1 id="heading-perfil">
              {u.nome}
              {!admin && <span className={`perfil-extra tag perfil-plano${premium() ? " is-premium" : ""}`}>{premium() ? plano() : "Free"}</span>}
            </h1>
            <p className="username">{u.arroba}</p>
            {u.bio && <p className="bio">{u.bio}</p>}
            {!admin && (
              <div className="profile-stats-bar">
                <span>
                  <strong>{num(stats.total)}</strong> treinos feitos
                </span>
                <span>
                  <strong>{num(stats.sequencia)}</strong> semanas seguidas
                </span>
              </div>
            )}
          </div>
          <button className="btn-secondary btn-with-icon" onClick={() => setJanela("perfil")}>
            <Icone d={ICONES.lapis} />
            Editar perfil
          </button>
        </div>

        <div className="profile-grid">
          {/* Tipo de conta */}
          <section className="panel panel-wide tipo-conta-painel" aria-labelledby="heading-tipo">
            <h2 id="heading-tipo">
              Tipo de conta: <span className={admin ? "selo-admin" : "selo-cliente"}>{admin ? "ADMIN" : "Cliente"}</span>
            </h2>
            <table className="tipo-conta-tabela">
              <thead>
                <tr>
                  <th scope="col">O que muda</th>
                  <th scope="col" className={admin ? "" : "is-atual"}>
                    Cliente
                  </th>
                  <th scope="col" className={admin ? "is-atual" : ""}>
                    Administrador
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARA.map(([o, c, a]) => (
                  <tr key={o}>
                    <th scope="row">{o}</th>
                    <td className={admin ? "" : "is-atual"}>{c}</td>
                    <td className={admin ? "is-atual" : ""}>{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Só do cliente */}
          {!admin && (
            <>
              {/* Objetivos */}
              <section className="panel" aria-labelledby="heading-objetivos">
                <div className="section-head">
                  <h2 id="heading-objetivos">Meus objetivos</h2>
                  <Link to="/app/comecar" className="section-link">
                    Alterar
                  </Link>
                </div>
                <dl className="facts-list">
                  {[
                    ["Objetivo", obj.rotulo || obj.objetivo],
                    ["Nível", obj.nivel],
                    ["Meta semanal", `${obj.dias} treinos por semana`],
                  ].map(([dt, dd]) => (
                    <div key={dt}>
                      <dt>{dt}</dt>
                      <dd>{dd}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Conquistas */}
              <section className="panel" aria-labelledby="heading-conquistas">
                <div className="section-head">
                  <h2 id="heading-conquistas">Conquistas</h2>
                  <span className="meta">
                    {conquistas.filter((c) => c.feito).length} de {conquistas.length}
                  </span>
                </div>
                <ul className="badges-grid">
                  {conquistas.map((c) => (
                    <li key={c.nome} className={"badge-item" + (c.feito ? " is-earned" : "")}>
                      <span className="badge-icon" aria-hidden="true">
                        <Icone d={c.icone} />
                      </span>
                      <strong>{c.nome}</strong>
                      <span>{c.texto}</span>
                      <span className="sr-only">{c.feito ? "Conquistada" : "Ainda não conquistada"}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Atividade */}
              <section className="panel" aria-labelledby="heading-atividade">
                <div className="section-head">
                  <h2 id="heading-atividade">Atividade recente</h2>
                  <Link to="/app/evolucao" className="section-link">
                    Ver evolução
                  </Link>
                </div>
                <ul className="history-list">
                  {!hist.length && <li className="meta">Nenhum treino registrado ainda.</li>}
                  {hist.slice(0, 4).map((h) => (
                    <li key={h.data} className="history-item">
                      <span className="icon-tile icon-tile-coral" aria-hidden="true">
                        <Icone d={ICONES.check} />
                      </span>
                      <div>
                        <strong>{h.nome}</strong>
                        <span>
                          {dataRelativa(h.data)} • {duracaoTexto(h.duracao)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Preferências */}
              <section className="panel" aria-labelledby="heading-preferencias">
                <h2 id="heading-preferencias">Preferências</h2>
                <div className="switch-list">
                  {/* Lembrete de treino */}
                  <Chave titulo="Lembretes de treino" texto="Aviso nos dias combinados da sua meta" ligado={ler("sl-pref-notif", true)} onMudar={(v) => (gravar("sl-pref-notif", v), toast("Preferência salva"))} />
                  {/* Horário e dias */}
                  <fieldset className="lembrete-config">
                    <legend>Horário do lembrete</legend>
                    <input
                      type="time"
                      id="lembrete-hora"
                      aria-label="Hora do lembrete de treino"
                      value={lembrete.hora}
                      onChange={(e) => {
                        // Guarda
                        salvarLembrete({ hora: e.target.value || "18:00" });
                        // Pede permissão
                        if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
                      }}
                    />
                    <div className="lembrete-dias" role="group" aria-label="Dias do lembrete">
                      {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                        <button key={d} type="button" className={"lembrete-dia" + (lembrete.dias.includes(d) ? " is-on" : "")} aria-pressed={lembrete.dias.includes(d)} aria-label={NOMES_DIAS[d]} onClick={() => salvarLembrete({ dias: lembrete.dias.includes(d) ? lembrete.dias.filter((x) => x !== d) : lembrete.dias.concat(d) })}>
                          {DIAS[d]}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => {
                        // Hora
                        const [h, m] = lembrete.hora.split(":").map(Number);
                        // Próximo dia combinado
                        const ini = new Date();
                        // Ajusta a hora
                        ini.setHours(h, m, 0, 0);
                        // Anda até um dia da lista
                        for (let i = 0; i < 7 && !lembrete.dias.includes(ini.getDay()); i++) ini.setDate(ini.getDate() + 1);
                        // Baixa
                        baixarAgenda({ titulo: "Treino - Saúde Life", inicio: ini, descricao: "Hora do treino! Abra o Saúde Life e bora.", repetir: lembrete.dias });
                      }}
                    >
                      Adicionar à agenda
                    </button>
                  </fieldset>
                  {/* Tipos de aviso */}
                  <fieldset className="avisos-config">
                    <legend>Avisos que você quer receber</legend>
                    {TIPOS_AVISO.map(([id, nome, texto]) => (
                      <Chave key={id} titulo={nome} texto={texto} rotulo={`Avisos de ${nome}`} ligado={tipos[id] !== false} onMudar={(v) => (gravar("sl-avisos-tipos", { ...tipos, [id]: v }), toast(`Avisos de ${nome.toLowerCase()} ${v ? "ligados" : "desligados"}`))} />
                    ))}
                  </fieldset>
                  {/* Silêncio */}
                  <fieldset className="avisos-config">
                    <legend>Horário de silêncio</legend>
                    <Chave titulo="Não me avisar à noite" texto="Nenhum aviso nesse intervalo" rotulo="Horário de silêncio" ligado={silencio.ligado} onMudar={(v) => gravar("sl-silencio", { ...silencio, ligado: v })} />
                    <div className="silencio-horas">
                      <span>Das</span>
                      <input type="time" aria-label="Silêncio começa às" value={silencio.de} onChange={(e) => gravar("sl-silencio", { ...silencio, de: e.target.value || "22:00" })} />
                      <span>às</span>
                      <input type="time" aria-label="Silêncio termina às" value={silencio.ate} onChange={(e) => gravar("sl-silencio", { ...silencio, ate: e.target.value || "07:00" })} />
                    </div>
                  </fieldset>
                  {/* Vibrar */}
                  <Chave titulo="Vibrar no fim do descanso" texto="No celular, durante o treino" ligado={ler("sl-pref-vibrar", true)} onMudar={(v) => (gravar("sl-pref-vibrar", v), toast("Preferência salva"))} />
                </div>
              </section>
            </>
          )}

          {/* Conta */}
          <section className="panel panel-wide" aria-labelledby="heading-conta">
            <h2 id="heading-conta">Conta</h2>
            <dl className="facts-list">
              <div>
                <dt>E-mail</dt>
                <dd>{u.email}</dd>
              </div>
              {!admin && (
                <div>
                  <dt>Plano</dt>
                  <dd>
                    {premium() ? plano() + (assinatura?.teste ? ` (teste: faltam ${Math.max(0, Math.ceil((new Date(assinatura.fim) - Date.now()) / 86400000))} dias)` : "") : "Free"}{" "}
                    <Link to="/app/planos" className="section-link">
                      Ver planos
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            {/* Academia (com servidor, só cliente) */}
            {apiLigada() && !admin && (
              <form
                className="adm-aviso-form"
                onSubmit={async (e) => {
                  // Sem recarregar
                  e.preventDefault();
                  // Código digitado
                  const codigo = new FormData(e.currentTarget).get("codigo").trim();
                  // Vazio
                  if (!codigo) return;
                  // Tenta entrar
                  try {
                    // Entra
                    await api("PATCH", "/me/academia", { codigo });
                    // Atualiza os dados
                    await puxar();
                    // Avisa
                    toast("Pronto! Você entrou na academia.");
                  } catch (erro) {
                    // Código errado
                    toast(erro.message);
                  }
                }}
              >
                <label htmlFor="codigo-academia">{ler("sl-academia", null) ? `Academia: ${ler("sl-academia", null).nome}. Trocar pelo código:` : "Entrar numa academia (código que ela te passou):"}</label>
                <input id="codigo-academia" name="codigo" placeholder="Ex.: SL-4F2K" maxLength={10} />
                <button type="submit" className="btn-secondary">
                  Entrar
                </button>
              </form>
            )}
            <div className="account-actions">
              <button className="btn-secondary" onClick={() => setJanela("seguranca")}>
                Trocar e-mail ou senha
              </button>
              <button className="btn-secondary" onClick={baixarDados}>
                Baixar meus dados
              </button>
              <label className="btn-secondary" htmlFor="arquivo-backup">
                Restaurar backup
              </label>
              <input
                type="file"
                id="arquivo-backup"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => {
                  // Lê
                  restaurar(e.target.files[0]);
                  // Limpa
                  e.target.value = "";
                }}
              />
              <button
                className="btn-secondary"
                onClick={() =>
                  setPedido({
                    titulo: "Apagar tudo deste navegador?",
                    texto: "Contas, treinos e dados de todo mundo que usou este navegador somem. Não dá para desfazer.",
                    rotulo: "Apagar tudo",
                    perigo: true,
                    fn: () => (limparTudo(), irPara("/")),
                  })
                }
              >
                Apagar tudo deste navegador
              </button>
              <button
                className="btn-secondary"
                onClick={() =>
                  setPedido({
                    titulo: "Apagar seus dados?",
                    texto: "Seus treinos, histórico, refeições, pesos e preferências são apagados e o app volta a ficar zerado. A conta continua.",
                    rotulo: "Apagar",
                    perigo: true,
                    fn: () => (DADOS_PESSOA.forEach((k) => localStorage.removeItem(k)), location.reload()),
                  })
                }
              >
                Apagar meus dados
              </button>
              <button className="btn-danger-outline btn-with-icon" onClick={async () => (await sair(), irPara("/login"))}>
                <Icone d={ICONES.sair} />
                Sair da conta
              </button>
              <button
                className="btn-danger-outline"
                onClick={() =>
                  setPedido({
                    titulo: "Excluir sua conta?",
                    texto: "Sua conta e todos os seus dados (treinos, pesos, fotos, refeições) serão apagados deste aparelho. Não dá para desfazer.",
                    rotulo: "Excluir para sempre",
                    perigo: true,
                    fn: async () => {
                      // Com servidor: pede a senha e apaga lá
                      if (apiLigada()) {
                        // Senha
                        const senha = window.prompt("Para excluir, digite sua senha:");
                        // Desistiu
                        if (!senha) return;
                        // Apaga no servidor
                        const erro = await excluirNoServidor(senha);
                        // Erro (senha errada)
                        if (erro) return toast(erro);
                      }
                      // Apaga deste aparelho
                      excluirConta(u.email);
                      // Volta para o começo
                      irPara("/");
                    },
                  })
                }
              >
                Excluir minha conta
              </button>
            </div>
          </section>

          {/* Modo demonstração (só na conta demo do cliente) */}
          {demo && (
            <section className="panel panel-wide demo-painel" aria-labelledby="heading-demo">
              <h2 id="heading-demo">Modo demonstração</h2>
              <p className="meta">Para apresentar o TCC: enche o app com 3 semanas de treinos, pontos e pesos de exemplo.</p>
              <div className="demo-botoes">
                <button type="button" className="btn-primary" onClick={() => (preencherDemo(), toast("Pronto! 3 semanas de treinos, pontos e pesos."))}>
                  Encher com dados de exemplo
                </button>
              </div>
            </section>
          )}
        </div>
      </section>

      {/* Editar perfil */}
      <Modal titulo="Editar perfil" aberto={janela === "perfil"} onFechar={fechar}>
        <FormPerfil onSalvar={() => (fechar(), toast("Perfil atualizado"))} />
      </Modal>

      {/* Segurança */}
      <Modal titulo="Trocar e-mail ou senha" aberto={janela === "seguranca"} onFechar={fechar}>
        <FormSeguranca onPronto={(t) => (fechar(), toast(t))} />
      </Modal>

      {/* Confirmação */}
      <Confirmar pedido={pedido} onFechar={() => setPedido(null)} />
    </AppLayout>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Perfil;
