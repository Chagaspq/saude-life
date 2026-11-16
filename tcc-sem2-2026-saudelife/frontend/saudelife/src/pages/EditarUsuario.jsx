import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buscarUsuario, atualizarUsuario } from '../services/usuarioService';
import FormularioUsuario from '../components/FormularioUsuario';

// Tela: editar usuário (GET /usuarios/{id} para carregar, PUT /usuarios/{id} para salvar)
export default function EditarUsuario() {
  // Troca de tela
  const navigate = useNavigate();
  // Id do endereço (/usuarios/editar/5)
  const { id } = useParams();

  // Usuário carregado da API
  const [usuario, setUsuario] = useState(null);
  // Erro ao carregar
  const [erro, setErro] = useState('');

  // Ao abrir: busca o usuário
  useEffect(() => {
    // Busca
    buscarUsuario(id)
      // Guarda
      .then(setUsuario)
      // Erro (ex.: não existe)
      .catch((e) => setErro('Não foi possível carregar o usuário. ' + e.message));
  }, [id]);

  // Salva na API e volta para a lista com a mensagem de sucesso
  async function salvar(dados) {
    // Atualiza
    await atualizarUsuario(id, dados);
    // Volta
    navigate('/usuarios', { state: { mensagem: 'Usuário atualizado com sucesso' } });
  }

  return (
    <div>
      <h1>Editar Usuário</h1>

      {/* Erro ao carregar */}
      {erro && <div className="erro">{erro}</div>}

      {/* Carregando ou formulário preenchido */}
      {!usuario ? (
        !erro && <p>Carregando...</p>
      ) : (
        <>
          {/* Dados que não mudam */}
          <p className="info-usuario">ID {usuario.id}{usuario.dataCriacao ? ' · cadastrado em ' + new Date(usuario.dataCriacao).toLocaleString('pt-BR') : ''}</p>
          {/* Formulário */}
          <FormularioUsuario inicial={usuario} aoSalvar={salvar} />
        </>
      )}
    </div>
  );
}
