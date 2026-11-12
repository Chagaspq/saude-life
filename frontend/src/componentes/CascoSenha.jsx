// Casco simples das telas de senha (recuperar e redefinir): cartão com logo, título e rodapé.
import { Logo } from "./base.jsx";
import Exibicao from "./Exibicao.jsx";
// Links entre as telas (React Router: troca de tela sem recarregar)
import { Link } from "react-router-dom";

// Casco
export default function CascoSenha({ titulo, subtitulo, children }) {
  // Página
  return (
    <>
      {/* Exibição no canto */}
      <Exibicao solto />
      {/* Cartão */}
      <main className="auth-container">
        <header className="auth-header">
          <div className="logo-compact" aria-hidden="true">
            <Logo tamanho={34} />
          </div>
          <h1>{titulo}</h1>
          <p className="auth-subtitle">{subtitulo}</p>
        </header>
        {children}
        {/* Rodapé */}
        <footer className="auth-footer">
          <p>
            Lembrou a senha? <Link to="/login">Voltar ao login</Link>
          </p>
        </footer>
      </main>
    </>
  );
}
