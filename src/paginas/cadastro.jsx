// Criar conta em 2 passos: 1) tipo de conta, nome, e-mail e senha; 2) dados opcionais e termos.
import { useState } from "react";
import { montar } from "../montar.jsx";
import AuthLayout from "../componentes/AuthLayout.jsx";
import { Logo } from "../componentes/base.jsx";
import { CampoConta, MensagemGeral, BotaoEnviar, RegrasSenha, esperar } from "../componentes/Formulario.jsx";
import { acharConta, criarConta, emailValido, REGRAS_SENHA, MIN_SENHA } from "../lib/conta.js";
// Servidor (quando ligado)
import { apiLigada } from "../lib/api.js";
import "../estilos/kit-conta.js";
import "../estilos/cadastro.css";

// Nome de cada passo
const NOMES_PASSOS = ["Sua conta", "Sobre você"];
// Vantagens do lado visual
const VANTAGENS = ["Treinos guiados com séries, cargas e descanso", "Gráficos da sua evolução semana a semana", "Acompanhamento da sua academia ou personal", "Grátis para sempre no plano Free, sem cartão"];

// Corta a foto em quadrado de 256 px e devolve em texto (data URL)
function lerFoto(arquivo, pronto) {
  // Leitor
  const leitor = new FileReader();
  // Leu
  leitor.onload = () => {
    // Imagem
    const img = new Image();
    // Carregou
    img.onload = () => {
      // Tela de desenho
      const c = document.createElement("canvas");
      // Tamanho
      c.width = c.height = 256;
      // Lado do quadrado
      const lado = Math.min(img.width, img.height);
      // Desenha o meio da foto
      c.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 256, 256);
      // Devolve
      pronto(c.toDataURL("image/jpeg", 0.8));
    };
    // Abre
    img.src = leitor.result;
  };
  // Lê
  leitor.readAsDataURL(arquivo);
}

// Página
function Cadastro() {
  // Passo (1 ou 2)
  const [passo, setPasso] = useState(1);
  // Campos
  const [c, setC] = useState({ tipo: "cliente", nome: "", email: "", senha: "", confirmar: "", apelido: "", nascimento: "", altura: "", peso: "", termos: false, codigo: "" });
  // Foto
  const [foto, setFoto] = useState("");
  // Erros
  const [erros, setErros] = useState({});
  // Mensagem geral
  const [msg, setMsg] = useState(null);
  // Texto do botão enquanto cria
  const [carregando, setCarregando] = useState("");

  // Muda um campo e apaga o erro dele
  const mudar = (nome) => (e) => {
    // Valor (caixa de marcar usa checked)
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    // Guarda
    setC({ ...c, [nome]: v });
    // Apaga o erro
    setErros({ ...erros, [nome]: "" });
    // Aceitou os termos: some a mensagem
    if (nome === "termos" && v) setMsg(null);
  };

  // Confere o passo 1
  function validar1() {
    // Erros
    const novos = {};
    // Nome
    if (!c.nome.trim()) novos.nome = "Digite seu nome completo.";
    // E-mail
    if (!c.email.trim()) novos.email = "Digite seu e-mail.";
    else if (!emailValido(c.email)) novos.email = "Digite um e-mail válido.";
    else if (acharConta(c.email.trim().toLowerCase())) novos.email = "Já existe uma conta com esse e-mail. Entre ou use outro.";
    // Senha
    if (!c.senha) novos.senha = "Digite sua senha.";
    else if (c.senha.length < MIN_SENHA) novos.senha = `A senha precisa ter no mínimo ${MIN_SENHA} caracteres.`;
    // Confirmação
    if (c.confirmar !== c.senha) novos.confirmar = "As senhas não coincidem.";
    // Mostra
    setErros(novos);
    // Nome do campo na tela
    const ids = { nome: "name", email: "email", senha: "password", confirmar: "confirm-password" };
    // Primeiro campo com erro
    const primeiro = Object.keys(ids).find((k) => novos[k]);
    // Foca
    if (primeiro) document.getElementById(ids[primeiro])?.focus();
    // Certo?
    return !Object.keys(novos).length;
  }

  // Confere o passo 2
  function validar2() {
    // Erros
    const novos = {};
    // Altura
    if (c.altura && (c.altura < 120 || c.altura > 230)) novos.altura = "Altura entre 120 e 230 cm.";
    // Peso
    if (c.peso && (c.peso < 30 || c.peso > 300)) novos.peso = "Peso entre 30 e 300 kg.";
    // Idade
    const idade = c.nascimento ? (Date.now() - new Date(c.nascimento)) / 31557600000 : null;
    // Muito novo ou data errada
    if (idade !== null && (idade < 13 || idade > 100)) novos.nascimento = "Você precisa ter pelo menos 13 anos.";
    // Mostra
    setErros(novos);
    // Termos
    if (!c.termos) setMsg({ texto: "Você precisa aceitar os Termos de Uso para continuar." });
    // Foca o primeiro problema
    const primeiro = ["nascimento", "altura", "peso"].find((k) => novos[k]) || (!c.termos && "terms");
    // Foca
    if (primeiro) document.getElementById(primeiro)?.focus();
    // Certo?
    return !primeiro;
  }

  // Muda de passo
  function irPara(n) {
    // Guarda
    setPasso(n);
    // Some a mensagem
    setMsg(null);
    // Foca o primeiro campo do passo
    setTimeout(() => document.getElementById(n === 1 ? "name" : "apelido")?.focus(), 0);
  }

  // Envia
  async function enviar(e) {
    // Sem recarregar
    e.preventDefault();
    // Passo 1: confere e avança
    if (passo === 1) return validar1() && irPara(2);
    // Passo 2: confere
    if (!validar2()) return;
    // Dados opcionais
    const extra = {};
    // Apelido
    if (c.apelido.trim()) extra.apelido = c.apelido.trim();
    // Nascimento
    if (c.nascimento) extra.nascimento = c.nascimento;
    // Altura
    if (c.altura) extra.altura = Number(c.altura);
    // Peso
    if (c.peso) extra.peso = Number(c.peso);
    // Foto
    if (foto) extra.foto = foto;
    // Cria
    const erro = await criarConta({ nome: c.nome, email: c.email, senha: c.senha, tipo: c.tipo, codigoAcademia: c.codigo }, Object.keys(extra).length ? extra : null);
    // Deu erro
    if (erro) return setMsg({ texto: erro });
    // Mostra "criando"
    setCarregando("Criando conta...");
    // Espera
    await esperar(900);
    // Vai para o login
    location.href = "../login/login.html?cadastro=sucesso";
  }

  // Lista de vantagens do lado visual
  const lista = (
    <ul className="auth-visual-list">
      {VANTAGENS.map((v) => (
        <li key={v}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {v}
        </li>
      ))}
    </ul>
  );

  // Página
  return (
    <AuthLayout titulo="Seu primeiro treino começa hoje." texto="Crie sua conta grátis em menos de um minuto e receba um plano que cabe na sua rotina." lista={lista}>
      {/* Topo do cartão */}
      <header className="auth-header">
        <div className="logo-compact" aria-hidden="true">
          <Logo tamanho={34} />
        </div>
        <h1>Criar conta</h1>
        <p className="auth-subtitle">Comece agora sua jornada com o Saúde Life.</p>
      </header>

      {/* Formulário */}
      <form id="cadastro-form" className="auth-form" noValidate onSubmit={enviar}>
        {/* Progresso */}
        <div className="cad-progresso">
          <p className="cad-progresso-texto" aria-live="polite">
            Passo {passo} de 2 · {NOMES_PASSOS[passo - 1]}
          </p>
          <div className="cad-progresso-barra" aria-hidden="true">
            <span style={{ width: passo === 1 ? "50%" : "100%" }} />
          </div>
        </div>

        {/* Passo 1 */}
        <fieldset className="cad-passo" hidden={passo !== 1}>
          <legend className="sr-only">Passo 1: sua conta</legend>
          {/* Tipo de conta */}
          <div className="tipo-conta" role="radiogroup" aria-label="Tipo de conta">
            <label className="tipo-conta-opcao">
              <input type="radio" name="tipo-conta" value="cliente" checked={c.tipo === "cliente"} onChange={() => setC({ ...c, tipo: "cliente" })} />
              <span>
                <strong>Sou cliente</strong>
                <small>Registro meus treinos, refeições e evolução</small>
              </span>
            </label>
            <label className="tipo-conta-opcao">
              <input type="radio" name="tipo-conta" value="admin" checked={c.tipo === "admin"} onChange={() => setC({ ...c, tipo: "admin" })} />
              <span>
                <strong>Sou administrador</strong>
                <small>Academia ou personal: acompanho clientes e mando treinos</small>
              </span>
            </label>
          </div>
          {/* Nome */}
          <CampoConta id="name" rotulo="Nome completo" icone="nome" autoComplete="name" required placeholder="Seu nome completo" value={c.nome} erro={erros.nome} onChange={mudar("nome")} />
          {/* E-mail */}
          <CampoConta id="email" rotulo="E-mail" icone="email" type="email" autoComplete="email" required placeholder="seu@email.com" value={c.email} erro={erros.email} onChange={mudar("email")} />
          {/* Senha com as regras */}
          <CampoConta id="password" rotulo="Senha" icone="senha" senha autoComplete="new-password" required minLength={8} placeholder="••••••••" value={c.senha} erro={erros.senha} onChange={mudar("senha")}>
            <RegrasSenha regras={REGRAS_SENHA} senha={c.senha} />
          </CampoConta>
          {/* Confirmar */}
          <CampoConta id="confirm-password" rotulo="Confirmar senha" icone="senha" senha autoComplete="new-password" required placeholder="••••••••" value={c.confirmar} erro={erros.confirmar} onChange={mudar("confirmar")} />
          {/* Código da academia (só cliente e com servidor) */}
          {apiLigada() && c.tipo === "cliente" && <CampoConta id="codigo" rotulo="Código da academia (opcional)" placeholder="Ex.: SL-4F2K" autoComplete="off" value={c.codigo} erro={erros.codigo} onChange={mudar("codigo")} />}
        </fieldset>

        {/* Passo 2 */}
        <fieldset className="cad-passo" hidden={passo !== 2}>
          <legend className="sr-only">Passo 2: sobre você</legend>
          <p className="cad-explica">Tudo opcional. Serve para o app calcular suas metas de água, calorias e proteína.</p>
          {/* Foto */}
          <div className="cad-foto">
            <span className="cad-foto-previa" aria-hidden="true" style={foto ? { backgroundImage: `url(${foto})` } : undefined}>
              {!foto && (c.nome.trim()[0] || "?").toUpperCase()}
            </span>
            <label className="cad-foto-botao" htmlFor="foto">
              {foto ? "Trocar foto" : "Escolher foto de perfil"}
            </label>
            <input
              className="sr-only"
              type="file"
              id="foto"
              name="foto"
              accept="image/*"
              onChange={(e) => {
                // Arquivo
                const arq = e.target.files[0];
                // Só imagem
                if (arq && arq.type.startsWith("image/")) lerFoto(arq, setFoto);
              }}
            />
          </div>
          {/* Apelido */}
          <CampoConta id="apelido" rotulo="Como quer ser chamado(a)?" autoComplete="nickname" maxLength={20} placeholder="Ex.: Biel" value={c.apelido} erro={erros.apelido} onChange={mudar("apelido")} />
          {/* Nascimento, altura e peso */}
          <div className="cad-linha">
            <CampoConta id="nascimento" rotulo="Nascimento" type="date" autoComplete="bday" value={c.nascimento} erro={erros.nascimento} onChange={mudar("nascimento")} />
            <CampoConta id="altura" rotulo="Altura (cm)" type="number" inputMode="numeric" min="120" max="230" placeholder="170" value={c.altura} erro={erros.altura} onChange={mudar("altura")} />
            <CampoConta id="peso" rotulo="Peso (kg)" type="number" inputMode="decimal" min="30" max="300" step="0.1" placeholder="70" value={c.peso} erro={erros.peso} onChange={mudar("peso")} />
          </div>
          {/* Termos */}
          <div className="form-group checkbox-group">
            <input type="checkbox" id="terms" name="terms" required checked={c.termos} onChange={mudar("termos")} />
            <label htmlFor="terms">
              Li e aceito os{" "}
              <a href="../termos/termos.html" className="btn-comecar">
                Termos de Uso
              </a>{" "}
              e a{" "}
              <a href="../politica/politica.html" className="btn-comecar">
                Política de Privacidade
              </a>
              .
            </label>
          </div>
        </fieldset>

        {/* Mensagem geral */}
        <MensagemGeral msg={msg} />

        {/* Botões */}
        <div className="cad-botoes">
          {/* Voltar (só no passo 2) */}
          <button type="button" className="cad-voltar" hidden={passo === 1} onClick={() => irPara(1)}>
            ← Voltar
          </button>
          {/* Continuar ou criar */}
          <BotaoEnviar texto={passo === 1 ? "Continuar" : "Criar conta"} carregando={carregando} />
        </div>
      </form>

      {/* Rodapé */}
      <footer className="auth-footer">
        <p>
          Já tem conta? <a href="../login/login.html">Entrar</a>
        </p>
      </footer>
    </AuthLayout>
  );
}

// Desenha
montar(Cadastro);
