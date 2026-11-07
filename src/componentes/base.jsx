// Componentes pequenos usados em todas as telas.
import { useEffect, useRef, useState } from "react";
import { EVENTO_MUDOU } from "../lib/armazenamento.js";

// Desenhos dos ícones (traços de 24 x 24)
export const ICONES = {
  // Calendário
  calendario: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  // Fogo
  fogo: ["M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"],
  // Relógio
  relogio: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
  // Haltere
  haltere: ["M6 5v14", "M18 5v14", "M3 8v8", "M21 8v8", "M6 12h12"],
  // Troféu
  trofeu: ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", "M4 22h16", "M18 2H6v7a6 6 0 0 0 12 0V2Z", "M12 15v7"],
  // Balança
  balanca: ["M16 16.5 12 3 8 16.5", "M3 16.5h18", "M5 21h14"],
  // Alvo
  alvo: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  // Gota
  gota: ["M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"],
  // Play
  play: ["M6 3l14 9-14 9V3z"],
  // Check
  check: ["M20 6 9 17l-5-5"],
  // Lápis
  lapis: ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"],
  // Mais
  mais: ["M12 5v14", "M5 12h14"],
  // Sair
  sair: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "m16 17 5-5-5-5", "M21 12H9"],
  // Talheres
  talheres: ["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2", "M7 2v20", "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"],
  // Raio
  raio: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
  // Lua
  lua: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
  // Joinha
  joinha: ["M7 10v12", "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"],
  // Lixeira
  lixeira: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"],
  // Marcador (salvar)
  salvar: ["M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"],
  // Engrenagem
  engrenagem: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"],
  // Sino
  sino: ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10.3 21a1.94 1.94 0 0 0 3.4 0"],
  // Pessoa de braços abertos (acessibilidade)
  acessibilidade: ["M12 6.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z", "M4 8.5l8 1.5 8-1.5", "M12 10v5", "M9 21l3-6 3 6"],
  // Megafone
  megafone: ["m3 11 18-5v12L3 14v-3z", "M11.6 16.8a3 3 0 1 1-5.8-1.6"],
  // Menu (três risquinhos)
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  // Pulso (batimento)
  pulso: ["M22 12h-4l-3 9L9 3l-3 9H2"],
};

// Ícone de traço
export function Icone({ d, className = "icon", titulo }) {
  // Desenho 24 x 24 (escondido dos leitores de tela, a não ser que tenha título)
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={titulo ? undefined : "true"} role={titulo ? "img" : undefined} aria-label={titulo}>
      {/* Um traço para cada caminho */}
      {d.map((caminho) => (
        <path key={caminho} d={caminho} />
      ))}
    </svg>
  );
}

// Logo do Saúde Life (anel com batimento, degradê coral → esmeralda)
export function Logo({ tamanho = 28, id = "logo-gradiente" }) {
  // Desenho
  return (
    <svg aria-hidden="true" width={tamanho} height={tamanho} viewBox="0 0 64 64" fill="none">
      {/* Degradê */}
      <defs>
        <linearGradient id={id} x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0845a" />
          <stop offset="100%" stopColor="#4fc29a" />
        </linearGradient>
      </defs>
      {/* Anel */}
      <path d="M32 9.5A22.5 22.5 0 1 1 12.51 20.75" stroke={`url(#${id})`} strokeWidth="6.5" strokeLinecap="round" />
      {/* Batimento */}
      <path d="M19.5 33H24.5L28.5 25L33.5 41L37 33H44.5" stroke={`url(#${id})`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Nome da marca ("Saúde" + "Life" em coral)
export const Marca = () => (
  // Texto
  <span>
    Saúde <span className="brand-life">Life</span>
  </span>
);

// Degradê dos ícones (o CSS usa "stroke: url(#sl-grad)")
export const GradienteIcones = () => (
  // Desenho escondido, sem tamanho
  <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
    <defs>
      {/* Para ícones de 24 */}
      <linearGradient id="sl-grad" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
        <stop offset="0" stopColor="#f5a37f" />
        <stop offset="1" stopColor="#4fc29a" />
      </linearGradient>
      {/* Para o desenho do estado vazio (64) */}
      <linearGradient id="sl-grad-64" gradientUnits="userSpaceOnUse" x1="6" y1="6" x2="58" y2="58">
        <stop offset="0" stopColor="#f5a37f" />
        <stop offset="1" stopColor="#4fc29a" />
      </linearGradient>
    </defs>
  </svg>
);

// Faz o componente redesenhar quando algum dado salvo muda
export function useDados() {
  // Contador que muda a cada aviso
  const [, setVersao] = useState(0);
  // Escuta os avisos
  useEffect(() => {
    // Redesenha
    const mudou = () => setVersao((v) => v + 1);
    // Mudança nesta aba
    window.addEventListener(EVENTO_MUDOU, mudou);
    // Mudança em outra aba
    window.addEventListener("storage", mudou);
    // Para de escutar ao sair
    return () => {
      // Tira
      window.removeEventListener(EVENTO_MUDOU, mudou);
      // Tira
      window.removeEventListener("storage", mudou);
    };
  }, []);
}

// Janela (modal) com título, botão de fechar, Esc e foco preso dentro
export function Modal({ titulo, aberto, onFechar, children, largo }) {
  // Caixa da janela
  const janela = useRef(null);
  // Função de fechar mais recente (sem refazer o efeito a cada desenho)
  const fechar = useRef(onFechar);
  // Atualiza
  fechar.current = onFechar;
  // Ao abrir: foca o primeiro campo, Esc fecha e trava a rolagem da página
  useEffect(() => {
    // Fechado: nada
    if (!aberto) return;
    // Elemento que estava focado (volta o foco ao fechar)
    const antes = document.activeElement;
    // Marca a página
    document.body.classList.add("modal-aberto");
    // Foca o primeiro campo (ou o botão de fechar)
    setTimeout(() => (janela.current?.querySelector("input, select, textarea, button:not(.btn-close-modal)") || janela.current?.querySelector("button"))?.focus(), 30);
    // Esc fecha
    const tecla = (e) => e.key === "Escape" && fechar.current();
    // Escuta
    document.addEventListener("keydown", tecla);
    // Ao fechar
    return () => {
      // Tira a marca
      document.body.classList.remove("modal-aberto");
      // Para de escutar
      document.removeEventListener("keydown", tecla);
      // Devolve o foco
      antes?.focus?.();
    };
  }, [aberto]);
  // Fechado: não desenha
  if (!aberto) return null;
  // Janela
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      {/* Caixa */}
      <div className={"modal-window" + (largo ? " modal-largo" : "")} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={janela}>
        {/* Topo */}
        <header className="modal-header">
          {/* Título */}
          <h2 id="modal-title">{titulo}</h2>
          {/* Fechar */}
          <button type="button" className="btn-close-modal" aria-label="Fechar modal" onClick={onFechar}>
            &times;
          </button>
        </header>
        {/* Conteúdo */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Janela de confirmação (sim / cancelar)
export function Confirmar({ pedido, onFechar }) {
  // Sem pedido: nada
  if (!pedido) return null;
  // Cancelar: faz a ação do cancelar (se tiver) e fecha
  const cancelar = () => {
    // Fecha
    onFechar();
    // Ação opcional
    pedido.cancelar?.();
  };
  // Janela
  return (
    <Modal titulo={pedido.titulo} aberto onFechar={cancelar}>
      {/* Texto */}
      <p className="modal-text">{pedido.texto}</p>
      {/* Botões */}
      <div className="modal-actions">
        {/* Cancelar */}
        <button type="button" className="btn-secondary" onClick={cancelar}>
          Cancelar
        </button>
        {/* Confirmar */}
        <button
          type="button"
          className={pedido.perigo ? "btn-danger-solid" : "btn-primary"}
          onClick={() => {
            // Fecha
            onFechar();
            // Faz a ação
            pedido.fn();
          }}
        >
          {pedido.rotulo || "Confirmar"}
        </button>
      </div>
    </Modal>
  );
}

// Aviso rápido no rodapé da tela (escuta o pedido "sl:toast")
export function Avisos() {
  // Aviso atual
  const [aviso, setAviso] = useState(null);
  // Escuta os pedidos
  useEffect(() => {
    // Temporizador para sumir
    let timer;
    // Novo aviso
    const mostrar = (e) => {
      // Mostra
      setAviso(e.detail);
      // Reinicia o tempo
      clearTimeout(timer);
      // Some depois de 2,6 s (6 s se tiver botão)
      timer = setTimeout(() => setAviso(null), e.detail.acao ? 6000 : 2600);
    };
    // Escuta
    window.addEventListener("sl:toast", mostrar);
    // Para
    return () => window.removeEventListener("sl:toast", mostrar);
  }, []);
  // Caixa (sempre na página, para o leitor de tela anunciar)
  return (
    <div className={"toast" + (aviso ? " is-visible" : "")} role="status" aria-live="polite" hidden={!aviso}>
      {/* Texto */}
      {aviso && <span>{aviso.texto}</span>}
      {/* Botão opcional (ex.: Desfazer) */}
      {aviso?.acao && (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            // Some
            setAviso(null);
            // Faz a ação
            aviso.acao.fn();
          }}
        >
          {aviso.acao.rotulo}
        </button>
      )}
    </div>
  );
}

// Estado vazio: desenho, título, texto e ação
export function EstadoVazio({ titulo, texto, children }) {
  // Caixa
  return (
    <div className="empty-state">
      {/* Desenho: anel e batimento */}
      <svg viewBox="0 0 64 64" className="empty-illustration" aria-hidden="true">
        {/* Anel */}
        <circle cx="32" cy="32" r="26" className="empty-ring" />
        {/* Batimento */}
        <path d="M14 34h8l4-10 6 18 5-12h13" className="empty-pulse" />
      </svg>
      {/* Título */}
      <h3>{titulo}</h3>
      {/* Texto */}
      <p>{texto}</p>
      {/* Ação */}
      {children}
    </div>
  );
}

// Cartão de número com ícone (resumos)
export function CartaoNumero({ rotulo, valor, detalhe, icone, cor = "coral", children }) {
  // Cartão
  return (
    <div className="stat-box stat-tile">
      {/* Topo: nome e ícone */}
      <div className="stat-tile-top">
        {/* Nome */}
        <span className="stat-label">{rotulo}</span>
        {/* Ícone */}
        {icone && (
          <span className={`icon-tile icon-tile-${cor}`} aria-hidden="true">
            <Icone d={icone} />
          </span>
        )}
      </div>
      {/* Valor */}
      <strong className="stat-value">{valor}</strong>
      {/* Detalhe */}
      {detalhe && <span className="stat-detail">{detalhe}</span>}
      {/* Extra (ex.: bolinhas da semana) */}
      {children}
    </div>
  );
}

// Escudo da liga
export function Escudo({ indice, ligas, className = "liga-escudo" }) {
  // Desenho
  return (
    <svg viewBox="0 0 48 56" className={`${className} liga-${ligas[indice].id}`} aria-hidden="true">
      {/* Fundo */}
      <path d="M24 3 5 10v15c0 13 8.5 23.5 19 28 10.5-4.5 19-15 19-28V10Z" className="liga-escudo-fundo" />
      {/* Miolo */}
      <path d="M24 10 11 15v10c0 9 5.8 16.6 13 20 7.2-3.4 13-11 13-20V15Z" className="liga-escudo-miolo" />
      {/* Uma estrelinha por nível */}
      {Array.from({ length: indice + 1 }, (_, i) => (
        <circle key={i} cx={24 + (i - indice / 2) * 7} cy="29" r="2.4" className="liga-escudo-estrela" />
      ))}
    </svg>
  );
}

// Anel de progresso com texto no meio
export function Anel({ pct, texto, legenda }) {
  // Volta completa
  const volta = 2 * Math.PI * 52;
  // Caixa
  return (
    <div className="pontos-anel" role="img" aria-label={`${texto} ${legenda}`}>
      {/* Desenho */}
      <svg viewBox="0 0 120 120" aria-hidden="true">
        {/* Fundo */}
        <circle cx="60" cy="60" r="52" className="pontos-anel-fundo" />
        {/* Parte cheia */}
        <circle cx="60" cy="60" r="52" className="pontos-anel-cor" strokeDasharray={volta} strokeDashoffset={volta * (1 - Math.min(1, pct))} />
      </svg>
      {/* Texto */}
      <span className="pontos-anel-texto" aria-hidden="true">
        <strong>{texto}</strong>
        <small>{legenda}</small>
      </span>
    </div>
  );
}

// Campo de formulário com rótulo
export function Campo({ id, rotulo, ...props }) {
  // Grupo
  return (
    <div className="form-group">
      {/* Rótulo */}
      <label htmlFor={id}>{rotulo}</label>
      {/* Campo */}
      <input id={id} {...props} />
    </div>
  );
}
