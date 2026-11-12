// Redefinir senha: abre pelo link com ?token=, pede a senha nova e troca.
import { useState } from "react";
import { CampoConta, BotaoEnviar, RegrasSenha, esperar } from "../componentes/Formulario.jsx";
import { trocarSenha, REGRAS_SENHA, MIN_SENHA } from "../lib/conta.js";
import { ler, gravar } from "../lib/armazenamento.js";
// API
import { api, apiLigada } from "../lib/api.js";
import CascoSenha from "../componentes/CascoSenha.jsx";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssAuth from "../estilos/auth.css?inline";
import cssSenha from "../estilos/senha.css?inline";
// Troca de tela pelo código (React Router)
import { irPara } from "../lib/navegar.js";
// Lê o ?token= do endereço (React Router)
import { useSearchParams } from "react-router-dom";
// Campos com ref (focar o campo com erro)
import { useCampos } from "../lib/campos.js";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssAuth, cssSenha];

// Página
function Redefinir() {
  // Campos da tela (ref do React) para focar o que tiver erro
  const campos = useCampos();
  // Endereço (?token=) lido pelo React Router
  const [parametros] = useSearchParams();
  // Código do link
  const token = parametros.get("token");
  // Código guardado nesta aba
  const tokenSalvo = sessionStorage.getItem("sl-reset-token");
  // Link válido?
  const valido = !!token && (apiLigada() || !tokenSalvo || token === tokenSalvo);
  // Senha nova
  const [senha, setSenha] = useState("");
  // Confirmação
  const [confirmar, setConfirmar] = useState("");
  // Erros
  const [erros, setErros] = useState({});
  // Mensagem geral
  const [msg, setMsg] = useState(valido ? null : { texto: "Este link de redefinição é inválido ou expirou. Solicite um novo." });
  // Esperando
  const [carregando, setCarregando] = useState("");

  // Envia
  async function enviar(e) {
    // Sem recarregar
    e.preventDefault();
    // Link ruim: nada
    if (!valido) return;
    // Erros
    const novos = {};
    // Senha curta
    if (senha.length < MIN_SENHA) novos.senha = `A senha precisa ter no mínimo ${MIN_SENHA} caracteres.`;
    // Não bate
    else if (confirmar !== senha) novos.confirmar = "As senhas não coincidem.";
    // Mostra
    setErros(novos);
    // Erro: foca
    if (novos.senha) return campos.focar("new-password");
    // Erro: foca
    if (novos.confirmar) return campos.focar("confirm-new-password");
    // Esperando
    setCarregando("Salvando...");
    // Com API: o servidor confere o link e troca a senha
    if (apiLigada()) {
      // Tenta
      try {
        // Troca
        await api("POST", "/auth/redefinir-senha", { token, senha });
      } catch (e) {
        // Erro (link vencido ou usado)
        setCarregando("");
        // Mostra
        return setMsg({ texto: e.message });
      }
      // Sucesso
      setMsg({ ok: true, texto: "Senha alterada! Redirecionando para o login..." });
      // Espera
      await esperar(1500);
      // Vai
      return irPara("/login");
    }
    // Pedidos
    const pedidos = ler("sl-reset-pedidos", {});
    // E-mail do pedido
    const email = pedidos[token];
    // Gasta o código
    delete pedidos[token];
    // Guarda
    gravar("sl-reset-pedidos", pedidos);
    // Apaga o código da aba
    sessionStorage.removeItem("sl-reset-token");
    // Troca a senha (se a conta existe)
    if (email) await trocarSenha(email, senha);
    // Sucesso
    setMsg({ ok: true, texto: "Senha alterada! Redirecionando para o login..." });
    // Espera
    await esperar(1500);
    // Vai
    irPara("/login");
  }

  // Página
  return (
    <CascoSenha titulo="Redefinir senha" subtitulo="Escolha uma nova senha para acessar sua conta.">
      <form id="reset-form" className="auth-form" noValidate onSubmit={enviar}>
        {/* Senha nova */}
        <CampoConta id="new-password" ref={campos.ref("new-password")} rotulo="Nova senha" senha autoComplete="new-password" required autoFocus minLength={8} placeholder="Mínimo de 8 caracteres" value={senha} erro={erros.senha} disabled={!valido} onChange={(e) => (setSenha(e.target.value), setErros({}))}>
          <RegrasSenha regras={REGRAS_SENHA} senha={senha} />
        </CampoConta>
        {/* Confirmar */}
        <CampoConta id="confirm-new-password" ref={campos.ref("confirm-new-password")} rotulo="Confirmar nova senha" senha autoComplete="new-password" required placeholder="Repita a nova senha" value={confirmar} erro={erros.confirmar} disabled={!valido} onChange={(e) => (setConfirmar(e.target.value), setErros({}))} />
        {/* Mensagens */}
        <p id="form-global-error" className="field-error" role="alert" aria-live="assertive" hidden={!msg || msg.ok}>
          {msg?.texto}
        </p>
        <p id="form-global-success" className="field-success" role="status" aria-live="polite" hidden={!msg?.ok}>
          {msg?.texto}
        </p>
        {/* Salvar */}
        <BotaoEnviar texto="Salvar nova senha" carregando={carregando} />
      </form>
    </CascoSenha>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Redefinir;
