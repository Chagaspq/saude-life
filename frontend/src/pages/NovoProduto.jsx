import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarProduto } from '../services/produtoService';

export default function NovoProduto() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro('');

    const produto = {
      nome: nome,
      descricao: descricao,
      preco: preco === '' ? null : Number(preco)
    };

    try {
      await criarProduto(produto);
      navigate('/produtos', { state: { mensagem: 'Produto criado com sucesso' } });
    } catch (e) {
      setErro('Não foi possível criar o produto. ' + e.message);
      setSalvando(false);
    }
  }

  return (
    <div>
      <h1>Novo Produto</h1>

      {erro && <div className="erro">{erro}</div>}

      <form className="formulario" onSubmit={salvar}>
        <label htmlFor="nome">nome</label>
        <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />

        <label htmlFor="descricao">descrição</label>
        <textarea id="descricao" rows="3" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

        <label htmlFor="preco">preco</label>
        <input id="preco" type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />

        <div className="barra-rodape">
          <button type="button" className="botao botao-secundario" onClick={() => navigate('/produtos')}>
            Voltar
          </button>
          <button type="submit" className="botao botao-primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
