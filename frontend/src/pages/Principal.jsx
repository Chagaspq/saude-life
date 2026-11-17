import { Link } from 'react-router-dom';

// Página inicial: boas-vindas e atalho para os usuários
export default function Principal() {
  return (
    <div>
      <h1>Bem-vindo ao Saúde Life!</h1>
      <p>Cadastre e gerencie os usuários do sistema.</p>
      {/* Atalho para a lista de usuários */}
      <Link className="botao botao-primario" to="/usuarios">Ver usuários</Link>
    </div>
  );
}
