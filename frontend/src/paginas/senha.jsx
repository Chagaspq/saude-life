// Recuperar senha: pede o e-mail e gera o link de redefinição (na demonstração, o link aparece na tela).
import { useState } from "react";
import CascoSenha from "../componentes/CascoSenha.jsx";
import { CampoConta, BotaoEnviar, esperar } from "../componentes/Formulario.jsx";
import { emailValido } from "../lib/conta.js";
import { ler, gravar } from "../lib/armazenamento.js";
// API
import { api, apiLigada } from "../lib/api.js";
// CSS desta tela (entra quando a tela abre e sai quando ela fecha, na mesma ordem de sempre)
import cssTokens from "../estilos/tokens.css?inline";
import cssBase from "../estilos/base.css?inline";
import cssAuth from "../estilos/auth.css?inline";
import cssSenha from "../estilos/senha.css?inline";

// Lista do CSS da tela, na ordem
export const estilos = [cssTokens, cssBase, cssAuth, cssSenha];

// Página
function Senha() {
  // E-mail
  const [email, setEmail] = useState("");
  // Erro do campo
  const [erro, setErro] = useState("");
  // Link gerado (demonstração)
  const [link, setLink] = useState("");
  // Esperando
  const [carregando, setCarregando] = useState("");

  // Envia
  async function enviar(e) {
    // Sem recarregar
    e.preventDefault();
    // Some o link anterior
    setLink("");
    // Confere o e-mail
    const problema = !email.trim() ? "Digite seu e-mail." : !emailValido(email) ? "Digite um e-mail válido." : "";
    // Mostra
    setErro(problema);
    // Tem erro: foca
    if (problema) return document.getElementById("email")?.focus();
    // Esperando
    setCarregando("Enviando...");
    // Com API: o servidor manda o e-mail
    if (apiLigada()) {
      // Tenta
      try {
        // Pede
        const r = await api("POST", "/auth/esqueci-senha", { email: email.trim() });
        // Sem e-mail configurado no servidor: mostra o link de demonstração
        setLink(r.tokenDemo ? location.origin + import.meta.env.BASE_URL + "senha/redefinir?token=" + r.tokenDemo : "enviado");
      } catch (e) {
        // Erro
        setErro(e.message);
      }
      // Limpa
      setEmail("");
      // Pronto
      return setCarregando("");
    }
    // Código do pedido
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    // Guarda o pedido (código → e-mail)
    gravar("sl-reset-pedidos", { ...ler("sl-reset-pedidos", {}), [token]: email.trim().toLowerCase() });
    // Guarda o código desta aba
    sessionStorage.setItem("sl-reset-token", token);
    // Espera
    await esperar(800);
    // Mostra o link
    setLink(location.origin + import.meta.env.BASE_URL + "senha/redefinir?token=" + token);
    // Limpa
    setEmail("");
    // Pronto
    setCarregando("");
  }

  // Página
  return (
    <CascoSenha titulo="Recuperar senha" subtitulo="Digite seu e-mail para receber as instruções de redefinição.">
      <form id="recovery-form" className="auth-form" noValidate onSubmit={enviar}>
        {/* E-mail */}
        <CampoConta id="email" rotulo="E-mail cadastrado" icone="email" type="email" autoComplete="email" required autoFocus placeholder="seu@email.com" value={email} erro={erro} onChange={(e) => (setEmail(e.target.value), setErro(""))} />
        {/* Sucesso */}
        <p id="form-global-success" className="field-success" role="status" aria-live="polite" hidden={!link}>
          Se esse e-mail estiver cadastrado, você vai receber as instruções em instantes.
          {link !== "enviado" && (
            <>
              <br />
              <a href={link} className="demo-link">
                Modo demonstração: abrir link de redefinição →
              </a>
            </>
          )}
        </p>
        {/* Enviar */}
        <BotaoEnviar texto="Enviar instruções" carregando={carregando} />
      </form>
    </CascoSenha>
  );
}

// Tela exportada (o roteador em src/rotas.jsx mostra ela no endereço certo)
export default Senha;
