// Tela de entrar: e-mail e senha, lembrar de mim, contas de demonstração e "apagar tudo".
import { useState } from "react";
import { montar } from "../montar.jsx";
import AuthLayout from "../componentes/AuthLayout.jsx";
import { Logo } from "../componentes/base.jsx";
import { CampoConta, MensagemGeral, BotaoEnviar, esperar } from "../componentes/Formulario.jsx";
import { acharConta, conferirLogin, criarConta, entrar, limparTudo, emailValido, MIN_SENHA } from "../lib/conta.js";
import { gravar } from "../lib/armazenamento.js";
// API e sincronização
import { apiLigada } from "../lib/api.js";
import { puxar } from "../lib/nuvem.js";
import "../estilos/kit-conta.js";
import "../estilos/login.css";

// Páginas do app que aceitam o "?voltar="
const PAGINAS_APP = ["inicio", "treinos", "alimentacao", "evolucao", "perfil", "planos"];

// Para onde ir depois de entrar
function destino(conta) {
  // Administrador: painel
  if (conta.tipo === "admin") return "../app/admin/admin.html";
  // Página pedida no endereço
  const voltar = new URLSearchParams(location.search).get("voltar");
  // Só aceita páginas conhecidas
  const pagina = PAGINAS_APP.includes(voltar) ? voltar : "inicio";
  // Endereço
  return `../app/${pagina}/${pagina}.html`;
}

// Página
function Login() {
  // Campos
  const [email, setEmail] = useState("");
  // Senha
  const [senha, setSenha] = useState("");
  // Lembrar de mim
  const [lembrar, setLembrar] = useState(true);
  // Erros dos campos
  const [erros, setErros] = useState({});
  // Mensagem geral (conta criada aparece em verde)
  const [msg, setMsg] = useState(() => (new URLSearchParams(location.search).get("cadastro") === "sucesso" ? { ok: true, texto: "Conta criada com sucesso! Faça login para continuar." } : null));
  // Texto do botão enquanto entra
  const [carregando, setCarregando] = useState("");

  // Entra com e-mail e senha
  async function enviar(emailUsado = email, senhaUsada = senha) {
    // Erros
    const novos = {};
    // E-mail vazio ou errado
    if (!emailUsado.trim()) novos.email = "Digite seu e-mail.";
    else if (!emailValido(emailUsado)) novos.email = "Digite um e-mail válido.";
    // Senha vazia ou curta
    if (!senhaUsada) novos.senha = "Digite sua senha.";
    else if (senhaUsada.length < MIN_SENHA) novos.senha = `A senha precisa ter no mínimo ${MIN_SENHA} caracteres.`;
    // Mostra
    setErros(novos);
    // Tem erro: foca o primeiro
    if (Object.keys(novos).length) return document.getElementById(novos.email ? "email" : "password")?.focus();
    // Mostra "entrando" (com servidor grátis, a primeira vez pode demorar)
    setCarregando("Entrando...");
    // Confere a conta
    const res = await conferirLogin(emailUsado, senhaUsada);
    // Errou: avisa
    if (res.erro) {
      // Para de carregar
      setCarregando("");
      // Mensagem
      setMsg({ texto: res.erro });
      // Foca a senha
      return document.getElementById("password")?.focus();
    }
    // Some a mensagem
    setMsg(null);
    // Abre a sessão
    entrar(res.conta, lembrar);
    // Mostra "entrando"
    setCarregando("Entrando...");
    // Com API: baixa os dados da conta; sem API: só espera um pouco
    if (apiLigada()) await puxar().catch(() => {});
    else await esperar(900);
    // Vai
    location.href = destino(res.conta);
  }

  // Entra numa conta de demonstração
  async function demo(admin) {
    // E-mail da demonstração
    const emailDemo = admin ? "admin@saudelife.app" : "demo@saudelife.app";
    // Preenche os campos
    setEmail(emailDemo);
    // Senha
    setSenha("demo1234");
    // Com API: as contas de demonstração já existem no servidor
    if (apiLigada()) return enviar(emailDemo, "demo1234");
    // Cria a conta se ainda não existe
    if (!acharConta(emailDemo)) await criarConta({ nome: admin ? "Academia Demonstração" : "Biel Demonstração", email: emailDemo, senha: "demo1234", tipo: admin ? "admin" : "cliente" });
    // Cliente: pede para encher os dados de exemplo
    if (!admin) gravar("sl-demo-preencher", true);
    // Entra
    enviar(emailDemo, "demo1234");
  }

  // Página
  return (
    <AuthLayout titulo="Continue exatamente de onde parou." texto="Cada treino registrado, cada meta batida. Sua evolução está guardada aqui, esperando por você.">
      {/* Topo do cartão */}
      <header className="auth-header">
        <div className="logo-compact" aria-hidden="true">
          <Logo tamanho={34} />
        </div>
        <h1>Entrar</h1>
        <p className="auth-subtitle">Que bom ter você de volta. Acesse sua conta.</p>
      </header>

      {/* Formulário */}
      <form
        id="login-form"
        className="auth-form"
        noValidate
        onSubmit={(e) => {
          // Sem recarregar
          e.preventDefault();
          // Entra
          enviar();
        }}
      >
        {/* E-mail */}
        <CampoConta id="email" rotulo="E-mail" icone="email" type="email" autoComplete="email" required placeholder="seu@email.com" value={email} erro={erros.email} onChange={(e) => (setEmail(e.target.value), setErros({ ...erros, email: "" }))} />
        {/* Senha */}
        <CampoConta
          id="password"
          rotulo="Senha"
          icone="senha"
          senha
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={senha}
          erro={erros.senha}
          onChange={(e) => (setSenha(e.target.value), setErros({ ...erros, senha: "" }))}
          direita={
            <a href="../senha/senha.html" className="forgot-password">
              Esqueci minha senha
            </a>
          }
        />
        {/* Lembrar de mim */}
        <div className="form-group checkbox-group">
          <input type="checkbox" id="lembrar" name="lembrar" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
          <label htmlFor="lembrar">Lembrar de mim neste aparelho</label>
        </div>
        {/* Mensagem geral */}
        <MensagemGeral msg={msg} />
        {/* Entrar */}
        <BotaoEnviar texto="Entrar" carregando={carregando} />
      </form>

      {/* Rodapé */}
      <footer className="auth-footer">
        <p>
          Não tem conta?{" "}
          <a href="../cadastro/cadastro.html" className="btn-comecar">
            Criar conta
          </a>
        </p>
        <p>
          Só conhecendo?{" "}
          <button type="button" className="link-demo" onClick={() => demo(false)}>
            Demonstração: cliente
          </button>{" "}
          ·{" "}
          <button type="button" className="link-demo" onClick={() => demo(true)}>
            Demonstração: administrador
          </button>
        </p>
        <p>
          <button
            type="button"
            className="link-demo link-limpar"
            onClick={() => {
              // Confirma (não dá para desfazer)
              if (!window.confirm("Apagar tudo o que o Saúde Life salvou neste navegador? Contas, treinos e dados somem e não dá para desfazer.")) return;
              // Apaga
              limparTudo();
              // Volta para a página inicial
              location.href = "../welcome/welcome.html";
            }}
          >
            Apagar tudo deste navegador
          </button>
        </p>
      </footer>
    </AuthLayout>
  );
}

// Desenha
montar(Login);
