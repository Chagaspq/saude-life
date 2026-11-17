import { useNavigate } from 'react-router-dom';
import { criarUsuario } from '../services/usuarioService';
import FormularioUsuario from '../components/FormularioUsuario';

// Tela: cadastrar usuário (POST /usuarios)
export default function NovoUsuario() {
  // Troca de tela
  const navigate = useNavigate();

  // Salva na API e volta para a lista com a mensagem de sucesso
  async function salvar(usuario) {
    // Cria
    await criarUsuario(usuario);
    // Volta
    navigate('/usuarios', { state: { mensagem: 'Usuário criado com sucesso' } });
  }

  return (
    <div>
      <h1>Novo Usuário</h1>
      {/* Formulário vazio (senha obrigatória) */}
      <FormularioUsuario inicial={{}} novo aoSalvar={salvar} />
    </div>
  );
}
