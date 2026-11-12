// Peças dos formulários de conta: campo com ícone, mostrar senha, botão com "carregando" e mensagem geral.
import { useState, forwardRef } from "react";

// Desenhos dos ícones dos campos
const ICONES_CAMPO = {
  // Envelope
  email: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m4 7 8 6 8-6"],
  // Cadeado
  senha: ["M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z", "M7 10V7a5 5 0 0 1 10 0v3"],
  // Pessoa
  nome: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
};

// Campo de formulário (icone = email | senha | nome; erro = texto do erro; senha = mostra o botão do olho)
// forwardRef: a tela pode pegar o campo com ref (ex.: para focar quando tiver erro)
export const CampoConta = forwardRef(function CampoConta({ id, rotulo, icone, erro, senha, direita, children, ...props }, ref) {
  // Senha visível?
  const [ver, setVer] = useState(false);
  // Grupo
  return (
    <div className={"form-group" + (erro ? " has-error" : "")}>
      {/* Rótulo (com link à direita, se tiver) */}
      {direita ? (
        <div className="label-row">
          <label htmlFor={id}>{rotulo}</label>
          {direita}
        </div>
      ) : (
        <label htmlFor={id}>{rotulo}</label>
      )}
      {/* Caixa do campo */}
      <div className={"input-wrapper" + (senha ? " password-wrapper" : "")}>
        {/* Ícone */}
        {icone && (
          <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONES_CAMPO[icone].map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        )}
        {/* Campo */}
        <input ref={ref} id={id} name={id} type={senha ? (ver ? "text" : "password") : props.type || "text"} aria-invalid={!!erro} aria-describedby={id + "-error"} {...props} />
        {/* Mostrar ou esconder a senha */}
        {senha && (
          <button type="button" className="toggle-password" aria-label={ver ? "Ocultar senha" : "Mostrar senha"} aria-pressed={ver} onClick={() => setVer(!ver)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
      {/* Extra (regras da senha, etc.) */}
      {children}
      {/* Erro */}
      <span id={id + "-error"} className="field-error" role="alert" aria-live="polite">
        {erro}
      </span>
    </div>
  );
});

// Mensagem geral do formulário ({ texto, ok })
export function MensagemGeral({ msg }) {
  // Caixa
  return (
    <p id="form-global-error" className={"field-error" + (msg?.ok ? " is-success" : "")} role="alert" aria-live="assertive" hidden={!msg}>
      {msg?.texto}
    </p>
  );
}

// Botão de enviar (carregando = texto enquanto espera)
export function BotaoEnviar({ texto, carregando }) {
  // Botão
  return (
    <button type="submit" className="btn-submit" disabled={!!carregando} aria-busy={!!carregando}>
      <span className="btn-text">{carregando || texto}</span>
      <span className="spinner" aria-hidden="true" hidden={!carregando} />
      <span aria-hidden="true" className="arrow" hidden={!!carregando}>
        →
      </span>
    </button>
  );
}

// Lista das regras da senha, marcando as que já foram cumpridas
export function RegrasSenha({ regras, senha, id }) {
  // Lista
  return (
    <ul className="senha-regras" id={id} aria-label="Regras da senha">
      {regras.map(([texto, ok]) => (
        <li key={texto} className={ok(senha) ? "is-ok" : ""}>
          {texto}
        </li>
      ))}
    </ul>
  );
}

// Espera um pouco (efeito de "carregando")
export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
