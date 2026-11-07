// Casco do app: confere o login, menu lateral, topo, menu de baixo (celular) e rodapé.
// O menu muda conforme o tipo de conta: cliente (5 páginas) ou administrador (Painel e Perfil).
import { useEffect, useRef, useState } from "react";
import { Icone, ICONES, Logo, Marca, GradienteIcones, Avisos, useDados } from "./base.jsx";
import Exibicao from "./Exibicao.jsx";
import { lerSessao, sair } from "../lib/conta.js";
import { ler, gravar } from "../lib/armazenamento.js";
import { usuario } from "../lib/nucleo.js";
import { iniciais } from "../lib/formato.js";
import { listaAvisos, conferirLembretes } from "../lib/avisos.js";
import { preencherDemo } from "../lib/demo.js";

// Páginas do cliente: [id, nome, ícone]
const MENU_CLIENTE = [
  // Início
  ["inicio", "Início", ["M3 10.5 12 3l9 7.5", "M5 9v11h14V9", "M10 20v-6h4v6"]],
  // Treinos
  ["treinos", "Treinos", ["M6.5 6.5h11", "M6.5 17.5h11", "M2 12h20", "M2 9v6", "M22 9v6"]],
  // Alimentação
  ["alimentacao", "Alimentação", ["M12 21c-4.4 0-8-3.6-8-8 0-3 2-6 5-6 1.2 0 2 .5 3 .5s1.8-.5 3-.5c3 0 5 3 5 6 0 4.4-3.6 8-8 8z", "M12 7.5c0-2 1-3.5 3-4.5"]],
  // Evolução
  ["evolucao", "Evolução", ["M3 3v18h18", "m7 14 4-4 3 3 6-6"]],
  // Perfil
  ["perfil", "Perfil", ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"]],
];
// Páginas do administrador
const MENU_ADMIN = [
  // Painel
  ["admin", "Painel", ["M3 3h7v9H3z", "M14 3h7v5h-7z", "M14 12h7v9h-7z", "M3 16h7v5H3z"]],
  // Perfil
  MENU_CLIENTE[4],
];
// Páginas que cada tipo pode abrir
const PODE = { cliente: ["inicio", "treinos", "treino", "alimentacao", "evolucao", "perfil", "comecar", "planos"], admin: ["admin", "perfil"] };

// Confere se pode ficar na página (devolve o endereço para onde ir, ou nada)
function destino(pagina) {
  // Sessão
  const sessao = lerSessao();
  // Ninguém logado: login (e volta para cá depois)
  if (!sessao) return "../../login/login.html?voltar=" + pagina;
  // Tipo
  const tipo = sessao.tipo === "admin" ? "admin" : "cliente";
  // Cliente sem questionário respondido: questionário
  if (tipo === "cliente" && !ler("sl-onboarding", null) && pagina !== "comecar") return "../comecar/comecar.html";
  // Página de outro tipo de conta
  if (!PODE[tipo].includes(pagina)) return tipo === "admin" ? "../admin/admin.html" : "../inicio/inicio.html";
  // Pode ficar
  return null;
}

// Casco (semMenu = tela de treino e questionário)
export default function AppLayout({ pagina, children, semMenu }) {
  // Redesenha quando os dados mudam
  useDados();
  // Para onde ir (se não pode ficar aqui)
  const ir = destino(pagina);
  // Menu do celular aberto?
  const [menuAberto, setMenuAberto] = useState(false);
  // Painel de notificações aberto?
  const [notifAberto, setNotifAberto] = useState(false);
  // Caixa das notificações (fechar ao clicar fora)
  const caixaNotif = useRef(null);

  // Ao abrir a página
  useEffect(() => {
    // Precisa ir para outra página: vai
    if (ir) return window.location.replace(ir);
    // Marca a página no <body> (o CSS usa)
    document.body.dataset.pagina = pagina;
    // Marca o tipo de conta (o CSS destaca o administrador)
    document.body.classList.add(lerSessao()?.tipo === "admin" ? "is-admin" : "is-cliente");
    // Conta de demonstração: enche os dados de exemplo uma vez
    if (ler("sl-demo-preencher", false)) {
      // Apaga o pedido
      localStorage.removeItem("sl-demo-preencher");
      // Enche
      preencherDemo();
    }
    // Lembretes agora e a cada minuto
    conferirLembretes();
    // A cada minuto
    const timer = setInterval(conferirLembretes, 60000);
    // Para ao sair
    return () => clearInterval(timer);
  }, []);

  // Clique fora fecha as notificações
  useEffect(() => {
    // Fechado: nada
    if (!notifAberto) return;
    // Clique fora
    const fora = (e) => !caixaNotif.current?.contains(e.target) && setNotifAberto(false);
    // Escuta
    document.addEventListener("mousedown", fora);
    // Para
    return () => document.removeEventListener("mousedown", fora);
  }, [notifAberto]);

  // Indo embora: não desenha nada
  if (ir) return null;
  // Pessoa
  const u = usuario();
  // É admin?
  const admin = u.tipo === "admin";
  // Menu do tipo de conta
  const menu = admin ? MENU_ADMIN : MENU_CLIENTE;
  // Avisos do sino
  const avisos = listaAvisos();
  // Marca de "lido" de hoje
  const chaveLido = "notificacoes-" + new Date().toDateString();
  // Já leu hoje?
  const lido = ler("sl-lidas", []).includes(chaveLido);

  // Abre/fecha as notificações (e marca como lidas)
  function abrirNotificacoes() {
    // Marca como lido
    if (!lido) gravar("sl-lidas", ler("sl-lidas", []).concat(chaveLido));
    // Troca
    setNotifAberto(!notifAberto);
  }

  // Tela sem menu (treino em andamento e questionário)
  if (semMenu)
    return (
      <>
        {/* Degradê dos ícones */}
        <GradienteIcones />
        {/* Conteúdo */}
        {children}
        {/* Avisos rápidos */}
        <Avisos />
      </>
    );

  // Casco completo
  return (
    <>
      {/* Degradê dos ícones */}
      <GradienteIcones />
      <div id="app-container" className="app-layout">
        {/* Fundo escuro do menu no celular */}
        <div className={"sidebar-overlay" + (menuAberto ? "" : " hidden")} onClick={() => setMenuAberto(false)} />
        {/* Menu lateral */}
        <aside id="app-sidebar" className={"app-sidebar" + (menuAberto ? " is-open" : "")} aria-label="Navegação lateral principal">
          {/* Marca */}
          <div className="sidebar-brand">
            <a href={`../${menu[0][0]}/${menu[0][0]}.html`} className="brand" aria-label="Saúde Life — Início">
              <Logo />
              <Marca />
            </a>
          </div>
          {/* Links */}
          <nav className="sidebar-nav" aria-label="Seções do app">
            <ul>
              {/* Título da área (deixa claro qual acesso é) */}
              <li className="nav-area" aria-hidden="true">
                {admin ? "Administração" : "Meu treino"}
              </li>
              {/* Um link por página */}
              {menu.map(([id, nome, tracos]) => (
                <li key={id}>
                  <a href={`../${id}/${id}.html`} className={"nav-link" + (id === pagina ? " active" : "")} aria-current={id === pagina ? "page" : undefined}>
                    <Icone d={tracos} className="icon nav-icon" />
                    <span>{nome}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {/* Rodapé do menu: pessoa, configurações e sair */}
          <div className="sidebar-footer">
            {/* Pessoa */}
            <a href="../perfil/perfil.html" className="user-profile-summary">
              <span className={"user-avatar avatar-initials" + (u.foto ? " tem-foto" : "")} aria-hidden="true" style={u.foto ? { backgroundImage: `url(${u.foto})` } : undefined}>
                {u.foto ? "" : iniciais(u.nome)}
              </span>
              <span className="user-name">{u.nome}</span>
            </a>
            {/* Configurações (preferências no Perfil) */}
            <a href="../perfil/perfil.html#heading-preferencias" className="btn-icon" aria-label="Configurações">
              <Icone d={ICONES.engrenagem} />
            </a>
            {/* Sair */}
            <button
              type="button"
              className="btn-icon"
              aria-label="Sair da conta"
              onClick={() => {
                // Sai
                sair();
                // Vai para o login
                window.location.href = "../../login/login.html";
              }}
            >
              <Icone d={ICONES.sair} />
            </button>
          </div>
        </aside>

        {/* Parte principal */}
        <div className="app-main-wrapper">
          {/* Topo */}
          <header className="app-topbar">
            {/* Abrir o menu (celular) */}
            <button type="button" id="sidebar-toggle" className="btn-icon btn-menu-toggle" aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto} aria-controls="app-sidebar" onClick={() => setMenuAberto(!menuAberto)}>
              <Icone d={ICONES.menu} />
            </button>
            {/* Botões do lado direito */}
            <div className="topbar-actions">
              {/* Selo ADMIN */}
              {admin && (
                <span className="selo-admin" title="Você está no acesso de administrador">
                  ADMIN
                </span>
              )}
              {/* Exibição */}
              <Exibicao />
              {/* Notificações */}
              <div className="notif-caixa" ref={caixaNotif}>
                <button type="button" className="btn-icon" aria-label={lido || !avisos.length ? "Notificações" : `Notificações (${avisos.length} novas)`} aria-expanded={notifAberto} onClick={abrirNotificacoes}>
                  <Icone d={ICONES.sino} />
                  {/* Contador */}
                  {!lido && avisos.length > 0 && (
                    <span className="badge" aria-hidden="true">
                      {avisos.length}
                    </span>
                  )}
                </button>
                {/* Painel */}
                {notifAberto && (
                  <div className="notif-painel" role="dialog" aria-label="Notificações">
                    {/* Topo */}
                    <div className="notif-topo">
                      <strong>Notificações</strong>
                      <span className="meta">{avisos.length ? `${avisos.length} ${avisos.length === 1 ? "aviso" : "avisos"}` : ""}</span>
                    </div>
                    {/* Lista ou vazio */}
                    {avisos.length ? (
                      <ul className="notif-lista">
                        {avisos.map(([titulo, texto, tipo], i) => (
                          <li key={i} className={"notif-item notif-" + tipo}>
                            {/* Ícone */}
                            <span className="notif-icone" aria-hidden="true">
                              <Icone d={tipo === "aviso" ? ICONES.megafone : ICONES.alvo} />
                            </span>
                            {/* Textos */}
                            <div>
                              <strong>{titulo}</strong>
                              <span>{texto}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="notif-vazio">Tudo em dia. Nenhuma notificação.</p>
                    )}
                  </div>
                )}
              </div>
              {/* Pílula da pessoa */}
              <a href="../perfil/perfil.html" className="user-menu-trigger" aria-label="Abrir meu perfil">
                <span className={"avatar-small avatar-initials" + (u.foto ? " tem-foto" : "")} aria-hidden="true" style={u.foto ? { backgroundImage: `url(${u.foto})` } : undefined}>
                  {u.foto ? "" : iniciais(u.nome)}
                </span>
                <span className="username-top">{u.primeiro}</span>
              </a>
            </div>
          </header>

          {/* Conteúdo da página */}
          <main className="app-views-container" id="conteudo" tabIndex="-1">
            {children}
          </main>

          {/* Rodapé */}
          <footer className="app-footer">
            <p>&copy; 2026 Saúde Life</p>
            <nav aria-label="Links legais">
              <a href="../../ajuda/ajuda.html">Ajuda</a>
              <a href="../../termos/termos.html">Termos de Uso</a>
              <a href="../../politica/politica.html">Política de Privacidade</a>
            </nav>
          </footer>
        </div>
      </div>

      {/* Menu de baixo (celular) */}
      <nav className="bottom-nav" aria-label="Navegação rápida">
        {menu.map(([id, nome, tracos]) => (
          <a key={id} href={`../${id}/${id}.html`} className={"bottom-nav-link" + (id === pagina ? " active" : "")} aria-current={id === pagina ? "page" : undefined}>
            <Icone d={tracos} />
            <span>{nome}</span>
          </a>
        ))}
      </nav>

      {/* Avisos rápidos */}
      <Avisos />
    </>
  );
}
