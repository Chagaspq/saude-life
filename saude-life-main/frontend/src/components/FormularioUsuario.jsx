import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Formulário de usuário (usado no Novo e no Editar).
// inicial = dados que já vêm preenchidos; novo = true no cadastro (senha obrigatória); aoSalvar = função que chama a API
export default function FormularioUsuario({ inicial, novo, aoSalvar }) {
  // Troca de tela
  const navigate = useNavigate();

  // Campos
  const [nomeCompleto, setNomeCompleto] = useState(inicial.nomeCompleto || '');
  // E-mail
  const [email, setEmail] = useState(inicial.email || '');
  // Senha (no Editar fica vazia: só preenche se quiser trocar)
  const [senha, setSenha] = useState('');
  // Tipo
  const [tipoUsuario, setTipoUsuario] = useState(inicial.tipoUsuario || 'CLIENTE');
  // Nascimento
  const [dataNascimento, setDataNascimento] = useState(inicial.dataNascimento || '');
  // Salvando?
  const [salvando, setSalvando] = useState(false);
  // Erro
  const [erro, setErro] = useState('');

  // Enviar o formulário
  async function salvar(evento) {
    // Não recarrega a página
    evento.preventDefault();
    // Some o erro anterior
    setErro('');
    // Confere a senha antes de chamar a API
    if ((novo || senha) && senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    // Mostra "Salvando..."
    setSalvando(true);
    // Dados para a API (data vazia vai como null)
    const usuario = {
      nomeCompleto: nomeCompleto,
      email: email,
      senha: senha,
      tipoUsuario: tipoUsuario,
      dataNascimento: dataNascimento === '' ? null : dataNascimento
    };
    try {
      // Chama a API (criar ou atualizar)
      await aoSalvar(usuario);
    } catch (e) {
      // Mostra a frase da API (ex.: e-mail repetido)
      setErro(e.message);
      // Libera o botão
      setSalvando(false);
    }
  }

  return (
    <>
      {/* Erro */}
      {erro && <div className="erro">{erro}</div>}

      <form className="formulario" onSubmit={salvar}>
        {/* Nome */}
        <label htmlFor="nomeCompleto">Nome completo</label>
        <input id="nomeCompleto" type="text" required maxLength={100} value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />

        {/* E-mail */}
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" required maxLength={150} value={email} onChange={(e) => setEmail(e.target.value)} />

        {/* Senha */}
        <label htmlFor="senha">{novo ? 'Senha' : 'Nova senha (deixe em branco para manter)'}</label>
        <input id="senha" type="password" required={novo} minLength={8} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        {/* Tipo */}
        <label htmlFor="tipoUsuario">Tipo de usuário</label>
        <select id="tipoUsuario" value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
          <option value="CLIENTE">Cliente</option>
          <option value="ADMINISTRADOR">Administrador</option>
        </select>

        {/* Nascimento */}
        <label htmlFor="dataNascimento">Data de nascimento</label>
        <input id="dataNascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />

        {/* Botões */}
        <div className="barra-rodape">
          <button type="button" className="botao botao-secundario" onClick={() => navigate('/usuarios')}>
            Voltar
          </button>
          <button type="submit" className="botao botao-primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </>
  );
}
