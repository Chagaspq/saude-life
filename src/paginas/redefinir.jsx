// Redefinir senha: abre pelo link com ?token=, pede a senha nova e troca.
import { useState } from "react";
import { montar } from "../montar.jsx";
import { CampoConta, BotaoEnviar, RegrasSenha, esperar } from "../componentes/Formulario.jsx";
import { trocarSenha, REGRAS_SENHA, MIN_SENHA } from "../lib/conta.js";
import { ler, gravar } from "../lib/armazenamento.js";
import CascoSenha from "../componentes/CascoSenha.jsx";
import "../estilos/kit-conta.js";
import "../estilos/senha.css";

// Código do link
const token = new URLSearchParams(location.search).get("token");
// Código guardado nesta aba
const tokenSalvo = sessionStorage.getItem("sl-reset-token");
// Link válido?
const valido = !!token && (!tokenSalvo || token === tokenSalvo);

// Página
function Redefinir() {
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
    if (novos.senha) return document.getElementById("new-password")?.focus();
    // Erro: foca
    if (novos.confirmar) return document.getElementById("confirm-new-password")?.focus();
    // Esperando
    setCarregando("Salvando...");
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
    location.href = "../login/login.html";
  }

  // Página
  return (
    <CascoSenha titulo="Redefinir senha" subtitulo="Escolha uma nova senha para acessar sua conta.">
      <form id="reset-form" className="auth-form" noValidate onSubmit={enviar}>
        {/* Senha nova */}
        <CampoConta id="new-password" rotulo="Nova senha" senha autoComplete="new-password" required autoFocus minLength={8} placeholder="Mínimo de 8 caracteres" value={senha} erro={erros.senha} disabled={!valido} onChange={(e) => (setSenha(e.target.value), setErros({}))}>
          <RegrasSenha regras={REGRAS_SENHA} senha={senha} />
        </CampoConta>
        {/* Confirmar */}
        <CampoConta id="confirm-new-password" rotulo="Confirmar nova senha" senha autoComplete="new-password" required placeholder="Repita a nova senha" value={confirmar} erro={erros.confirmar} disabled={!valido} onChange={(e) => (setConfirmar(e.target.value), setErros({}))} />
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

// Desenha
montar(Redefinir);
