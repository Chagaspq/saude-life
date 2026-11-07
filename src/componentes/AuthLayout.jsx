// Casco das telas de conta (entrar, criar conta, senha): lado visual e o cartão do formulário.
import { Logo, Marca, Avisos } from "./base.jsx";
import Exibicao from "./Exibicao.jsx";

// Casco (titulo e texto = frase do lado visual)
export default function AuthLayout({ titulo, texto, lista, children }) {
  // Página
  return (
    <div className="auth-split">
      {/* Exibição solta no canto */}
      <Exibicao solto />
      {/* Lado visual (enfeite) */}
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-content">
          {/* Marca */}
          <div className="auth-visual-brand">
            <Logo tamanho={30} id="logo-gradiente-visual" />
            <Marca />
          </div>
          {/* Frase */}
          <p className="visual-heading">{titulo}</p>
          {/* Texto */}
          <p>{texto}</p>
          {/* Lista de vantagens (cadastro) */}
          {lista}
          {/* Desenho de batimento */}
          {!lista && (
            <svg className="auth-visual-graphic" viewBox="0 0 320 320" fill="none">
              <circle cx="160" cy="160" r="150" className="pulse-ring pulse-ring-1" />
              <circle cx="160" cy="160" r="110" className="pulse-ring pulse-ring-2" />
              <path d="M 40 170 L 100 170 L 120 110 L 150 220 L 175 90 L 195 170 L 280 170" className="pulse-line" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </aside>
      {/* Formulário */}
      <main className="auth-form-panel">
        <div className="auth-container">{children}</div>
      </main>
      {/* Avisos rápidos */}
      <Avisos />
    </div>
  );
}
