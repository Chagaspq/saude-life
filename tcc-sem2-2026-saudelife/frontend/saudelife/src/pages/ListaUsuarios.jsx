import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listarUsuarios, apagarUsuario } from '../services/usuarioService';
import Modal from '../components/Modal';

// Nome do tipo de usuário na tela
const NOMES_TIPO = { CLIENTE: 'Cliente', ADMINISTRADOR: 'Administrador' };

// Ícone de lápis (botão editar)
function IconeLapis() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

// Data "2005-03-10" (da API) vira "10/03/2005"
function formatarData(data) {
  // Sem data: vazio
  if (!data) {
    return '';
  }
  // Partes da data
  const [ano, mes, dia] = String(data).split('-');
  // Formato brasileiro
  return dia && mes && ano ? dia + '/' + mes + '/' + ano : data;
}

// Tela: lista de usuários com botões de novo, editar e apagar
export default function ListaUsuarios() {
  // Troca de tela
  const navigate = useNavigate();
  // Endereço atual (traz a mensagem de sucesso do Novo/Editar)
  const location = useLocation();

  // Usuários vindos da API
  const [usuarios, setUsuarios] = useState([]);
  // Carregando?
  const [carregando, setCarregando] = useState(true);
  // Mensagem de erro
  const [erro, setErro] = useState('');

  // Usuário escolhido para apagar (abre o modal de confirmação)
  const [usuarioParaApagar, setUsuarioParaApagar] = useState(null);
  // Mensagem de sucesso exibida em modal
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Busca a lista na API: GET /usuarios
  async function carregarUsuarios() {
    // Mostra "Carregando..."
    setCarregando(true);
    // Some o erro anterior
    setErro('');
    try {
      // Lista
      const lista = await listarUsuarios();
      // Guarda
      setUsuarios(lista);
    } catch (e) {
      // Erro (ex.: API desligada)
      setErro('Não foi possível carregar os usuários. ' + e.message);
    } finally {
      // Terminou
      setCarregando(false);
    }
  }

  // Ao abrir a tela: carrega a lista e mostra a mensagem de sucesso, se veio do Novo/Editar
  useEffect(() => {
    // Carrega
    carregarUsuarios();
    // Veio com mensagem
    if (location.state && location.state.mensagem) {
      // Mostra
      setMensagemSucesso(location.state.mensagem);
      // Limpa o state para o modal não voltar ao atualizar a página (F5)
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.key]);

  // Apaga de verdade: DELETE /usuarios/{id}
  async function confirmarApagar() {
    // Usuário escolhido
    const usuario = usuarioParaApagar;
    // Fecha o modal
    setUsuarioParaApagar(null);
    try {
      // Apaga na API
      await apagarUsuario(usuario.id);
      // Atualiza a lista
      await carregarUsuarios();
      // Avisa
      setMensagemSucesso('Usuário apagado com sucesso');
    } catch (e) {
      // Erro
      setErro('Não foi possível apagar o usuário. ' + e.message);
    }
  }

  return (
    <div>
      <h1>Lista de Usuários</h1>

      {/* Botão de novo */}
      <div className="barra-topo">
        <button className="botao botao-primario" onClick={() => navigate('/usuarios/novo')}>
          + Novo Usuário
        </button>
      </div>

      {/* Erro */}
      {erro && <div className="erro">{erro}</div>}

      {/* Tabela */}
      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table className="tabela-zebrada">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome completo</th>
              <th>E-mail</th>
              <th>Tipo de usuário</th>
              <th>Data de nascimento</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="7" className="vazio">Nenhum usuário cadastrado.</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nomeCompleto}</td>
                  <td>{usuario.email}</td>
                  <td>{NOMES_TIPO[usuario.tipoUsuario] || usuario.tipoUsuario}</td>
                  <td>{formatarData(usuario.dataNascimento)}</td>
                  {/* Apagar */}
                  <td className="celula-acao">
                    <button
                      className="botao-icone botao-apagar"
                      data-tooltip="Apagar usuário"
                      aria-label={'Apagar usuário ' + usuario.nomeCompleto}
                      onClick={() => setUsuarioParaApagar(usuario)}
                    >
                      X
                    </button>
                  </td>
                  {/* Editar */}
                  <td className="celula-acao">
                    <button
                      className="botao-icone botao-editar"
                      data-tooltip="Editar usuário"
                      aria-label={'Editar usuário ' + usuario.nomeCompleto}
                      onClick={() => navigate('/usuarios/editar/' + usuario.id)}
                    >
                      <IconeLapis />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Confirmação de apagar */}
      {usuarioParaApagar && (
        <Modal mensagem={'Deseja realmente apagar o usuário ' + usuarioParaApagar.id + ' - ' + usuarioParaApagar.nomeCompleto + '?'}>
          <button className="botao botao-secundario" onClick={() => setUsuarioParaApagar(null)}>Cancelar</button>
          <button className="botao botao-perigo" onClick={confirmarApagar}>Apagar</button>
        </Modal>
      )}

      {/* Sucesso */}
      {mensagemSucesso && (
        <Modal mensagem={mensagemSucesso}>
          <button className="botao botao-primario" onClick={() => setMensagemSucesso('')}>OK</button>
        </Modal>
      )}
    </div>
  );
}
