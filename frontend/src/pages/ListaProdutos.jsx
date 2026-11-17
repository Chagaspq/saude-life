import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { listarProdutos, apagarProduto } from '../services/produtoService';
import Modal from '../components/Modal';

function IconeLapis() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export default function ListaProdutos() {
  const navigate = useNavigate();
  const location = useLocation();

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Produto selecionado para exclusão (abre o modal de confirmação)
  const [produtoParaApagar, setProdutoParaApagar] = useState(null);
  // Mensagem de sucesso exibida em modal
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  async function carregarProdutos() {
    setCarregando(true);
    setErro('');
    try {
      const lista = await listarProdutos();
      setProdutos(lista);
    } catch (e) {
      setErro('Não foi possível carregar os produtos. ' + e.message);
    } finally {
      setCarregando(false);
    }
  }

  // Sempre que a página é carregada, busca a lista na API.
  // Se viemos de "Novo" ou "Editar" com uma mensagem, exibe o modal de sucesso.
  useEffect(() => {
    carregarProdutos();
    if (location.state && location.state.mensagem) {
      setMensagemSucesso(location.state.mensagem);
      // Limpa o state para o modal não reaparecer ao atualizar a página (F5)
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.key]);

  function abrirConfirmacaoApagar(produto) {
    setProdutoParaApagar(produto);
  }

  function cancelarApagar() {
    setProdutoParaApagar(null);
    carregarProdutos();
  }

  async function confirmarApagar() {
    const produto = produtoParaApagar;
    setProdutoParaApagar(null);
    try {
      await apagarProduto(produto.id);
      await carregarProdutos();
      setMensagemSucesso('Produto apagado com sucesso');
    } catch (e) {
      setErro('Não foi possível apagar o produto. ' + e.message);
    }
  }

  function formatarPreco(preco) {
    if (preco === null || preco === undefined) {
      return '';
    }
    return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatarData(data) {
    if (!data) {
      return '';
    }
    const d = new Date(data);
    if (isNaN(d.getTime())) {
      return data;
    }
    return d.toLocaleString('pt-BR');
  }

  return (
    <div>
      <h1>Lista Produtos</h1>

      <div className="barra-topo">
        <button className="botao botao-primario" onClick={() => navigate('/produtos/novo')}>
          + Novo
        </button>
      </div>

      {erro && <div className="erro">{erro}</div>}

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table className="tabela-zebrada">
          <thead>
            <tr>
              <th>id</th>
              <th>nome</th>
              <th>descrição</th>
              <th>preco</th>
              <th>dataCriacao</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan="7" className="vazio">Nenhum produto cadastrado.</td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.id}</td>
                  <td>{produto.nome}</td>
                  <td>{produto.descricao}</td>
                  <td className="numero">{formatarPreco(produto.preco)}</td>
                  <td>{formatarData(produto.dataCriacao)}</td>
                  <td className="celula-acao">
                    <button
                      className="botao-icone botao-apagar"
                      data-tooltip="Apagar produto"
                      aria-label="Apagar produto"
                      onClick={() => abrirConfirmacaoApagar(produto)}
                    >
                      X
                    </button>
                  </td>
                  <td className="celula-acao">
                    <button
                      className="botao-icone botao-editar"
                      data-tooltip="Editar produto"
                      aria-label="Editar produto"
                      onClick={() => navigate('/produtos/editar/' + produto.id)}
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

      {produtoParaApagar && (
        <Modal mensagem={'Deseja realmente apagar o produto ' + produtoParaApagar.id + ' - ' + produtoParaApagar.nome + '?'}>
          <button className="botao botao-secundario" onClick={cancelarApagar}>Cancelar</button>
          <button className="botao botao-perigo" onClick={confirmarApagar}>Apagar</button>
        </Modal>
      )}

      {mensagemSucesso && (
        <Modal mensagem={mensagemSucesso}>
          <button className="botao botao-primario" onClick={() => setMensagemSucesso('')}>OK</button>
        </Modal>
      )}
    </div>
  );
}
