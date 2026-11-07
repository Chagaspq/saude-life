// Contas do Saúde Life (sem servidor: tudo fica no navegador).
// Cadastro, login, sessão, troca de dados entre contas, trocar e-mail/senha e excluir.
import { ler, gravar, apagar } from "./armazenamento.js";

// Tamanho mínimo da senha
export const MIN_SENHA = 8;

// Chaves que valem para o aparelho todo (não são de uma conta só)
const GLOBAIS = ["sl-contas", "sl-conta", "sl-sessao", "sl-avisos-admin", "sl-tema", "sl-idioma", "sl-dono", "sl-a11y", "sl-instalar-dispensado"];
// Diz se uma chave é de uma conta (vai para a gaveta quando troca de conta)
const daConta = (chave) => chave.startsWith("sl-") && !GLOBAIS.includes(chave) && !chave.startsWith("sl-dados:");

// Resumo da senha (SHA-256): a senha nunca fica salva em texto
export async function hashSenha(email, senha) {
  // Texto que vira resumo (o e-mail entra para duas contas com a mesma senha terem resumos diferentes)
  const texto = "saude-life|" + email + "|" + senha;
  // Navegador com criptografia: SHA-256
  if (window.crypto && crypto.subtle) {
    // Bytes do texto
    const bytes = new TextEncoder().encode(texto);
    // Resumo
    const resumo = await crypto.subtle.digest("SHA-256", bytes);
    // Em hexadecimal
    return Array.from(new Uint8Array(resumo), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Navegador antigo: resumo simples (FNV)
  let h = 2166136261;
  // Para cada letra
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619) >>> 0;
  // Devolve
  return "fnv-" + h.toString(16);
}

// Lista de contas criadas neste navegador
export const lerContas = () => ler("sl-contas", []);
// Conta de um e-mail (ou nada)
export const acharConta = (email) => lerContas().find((c) => c.email === email) || null;

// Salva (cria ou atualiza) uma conta
function gravarConta(conta) {
  // Tira a versão antiga e coloca a nova
  gravar("sl-contas", lerContas().filter((c) => c.email !== conta.email).concat(conta));
}

// Cria a conta do cadastro (extra = perfil do passo 2: apelido, nascimento, altura, peso, foto)
export async function criarConta({ nome, email, senha, tipo = "cliente" }, extra) {
  // E-mail em minúsculas
  email = email.trim().toLowerCase();
  // Já existe
  if (acharConta(email)) return "Já existe uma conta com esse e-mail. Entre ou use outro.";
  // Salva a conta (só o resumo da senha)
  gravarConta({ nome: nome.trim(), email, hash: await hashSenha(email, senha), criada: new Date().toISOString(), tipo });
  // Guarda o perfil do passo 2 na gaveta da conta nova (abre quando a pessoa entrar)
  if (extra) {
    // Gaveta da conta
    const gaveta = ler("sl-dados:" + email, {});
    // Junta o perfil
    gaveta["sl-perfil"] = JSON.stringify({ ...JSON.parse(gaveta["sl-perfil"] || "{}"), ...extra });
    // Salva
    gravar("sl-dados:" + email, gaveta);
  }
  // Deu certo
  return "";
}

// Confere e-mail e senha. Devolve { conta } ou { erro }
export async function conferirLogin(email, senha) {
  // E-mail em minúsculas
  email = email.trim().toLowerCase();
  // Conta
  const conta = acharConta(email);
  // Não existe
  if (!conta) return { erro: "Não encontramos uma conta com esse e-mail neste aparelho. Crie sua conta para começar." };
  // Senha errada (mensagem genérica de propósito)
  if (conta.hash !== (await hashSenha(email, senha))) return { erro: "E-mail ou senha incorretos." };
  // Certo
  return { conta };
}

// Guarda os dados da conta que sai numa "gaveta" e abre a gaveta da que entra
function trocarDados(email) {
  // Dono atual dos dados soltos
  const dono = ler("sl-dono", null);
  // Mesma conta: nada a fazer
  if (dono === email) return;
  // Tenta...
  try {
    // ...guardar os dados do dono anterior
    if (dono) {
      // Gaveta
      const gaveta = {};
      // Cada chave da conta vai para a gaveta
      Object.keys(localStorage).filter(daConta).forEach((chave) => {
        // Copia
        gaveta[chave] = localStorage.getItem(chave);
        // Tira do lugar
        localStorage.removeItem(chave);
      });
      // Salva a gaveta
      gravar("sl-dados:" + dono, gaveta);
    }
    // ...abrir a gaveta da conta nova
    const gaveta = ler("sl-dados:" + email, {});
    // Cada chave volta para o lugar
    Object.keys(gaveta).forEach((chave) => localStorage.setItem(chave, gaveta[chave]));
    // Gaveta vazia
    localStorage.removeItem("sl-dados:" + email);
    // Novo dono
    gravar("sl-dono", email);
  } catch (e) {
    /* armazenamento indisponível */
  }
}

// Começa a sessão (lembrar = continuar logado depois de fechar o navegador)
export function entrar(conta, lembrar = true) {
  // Troca os dados para os da conta
  trocarDados(conta.email);
  // Salva a sessão
  gravar("sl-sessao", { nome: conta.nome, email: conta.email, tipo: conta.tipo || "cliente", lembrar });
  // Marca o navegador como aberto (sem "lembrar", fechar o navegador desloga)
  document.cookie = "sl-aberta=1; path=/; SameSite=Lax";
}

// Lê quem está logado (ou nada)
export function lerSessao() {
  // Sessão salva
  const sessao = ler("sl-sessao", null);
  // Sem "lembrar de mim" e o navegador foi fechado: sai
  if (sessao && sessao.lembrar === false && !document.cookie.includes("sl-aberta=1")) {
    // Apaga a sessão
    apagar("sl-sessao");
    // Ninguém logado
    return null;
  }
  // Devolve
  return sessao;
}

// Sai da conta
export function sair() {
  // Apaga a sessão
  apagar("sl-sessao");
}

// É administrador?
export const ehAdmin = () => (lerSessao() || {}).tipo === "admin";

// Troca a senha de uma conta (redefinir senha)
export async function trocarSenha(email, senha) {
  // Conta
  const conta = acharConta(email);
  // Não existe
  if (!conta) return false;
  // Salva com o resumo novo
  gravarConta({ ...conta, hash: await hashSenha(email, senha) });
  // Certo
  return true;
}

// Troca a senha pedindo a atual
export async function mudarSenha(email, atual, nova) {
  // Conta
  const conta = acharConta(email);
  // Senha atual errada
  if (!conta || conta.hash !== (await hashSenha(email, atual))) return "Senha atual incorreta.";
  // Senha curta
  if (nova.length < MIN_SENHA) return `A senha nova precisa ter no mínimo ${MIN_SENHA} caracteres.`;
  // Troca
  await trocarSenha(email, nova);
  // Certo
  return "";
}

// Troca o e-mail pedindo a senha
export async function trocarEmail(emailAtual, senha, emailNovo) {
  // E-mail novo em minúsculas
  emailNovo = emailNovo.trim().toLowerCase();
  // Conta
  const conta = acharConta(emailAtual);
  // Senha errada
  if (!conta || conta.hash !== (await hashSenha(emailAtual, senha))) return "Senha atual incorreta.";
  // E-mail já usado
  if (acharConta(emailNovo)) return "Já existe uma conta com esse e-mail.";
  // Tira a conta antiga
  gravar("sl-contas", lerContas().filter((c) => c.email !== emailAtual));
  // Salva com o e-mail novo
  gravarConta({ ...conta, email: emailNovo, hash: await hashSenha(emailNovo, senha) });
  // Atualiza o dono dos dados
  if (ler("sl-dono", null) === emailAtual) gravar("sl-dono", emailNovo);
  // Atualiza a sessão
  gravar("sl-sessao", { ...ler("sl-sessao", {}), email: emailNovo });
  // Certo
  return "";
}

// Exclui a conta e todos os dados dela deste aparelho
export function excluirConta(email) {
  // Tira da lista
  gravar("sl-contas", lerContas().filter((c) => c.email !== email));
  // Apaga a gaveta
  apagar("sl-dados:" + email);
  // Se os dados soltos são dela, apaga também
  if (ler("sl-dono", null) === email) {
    // Cada chave da conta
    Object.keys(localStorage).filter(daConta).forEach((chave) => localStorage.removeItem(chave));
    // Sem dono
    apagar("sl-dono");
  }
  // Sai
  apagar("sl-sessao");
}

// Apaga TUDO o que o site salvou neste navegador
export function limparTudo() {
  // Tenta...
  try {
    // ...apagar cada chave do site
    Object.keys(localStorage).filter((k) => k.startsWith("sl-")).forEach((k) => localStorage.removeItem(k));
    // ...e as da sessão
    Object.keys(sessionStorage).filter((k) => k.startsWith("sl-")).forEach((k) => sessionStorage.removeItem(k));
  } catch (e) {
    /* nada salvo */
  }
  // Apaga o cookie
  document.cookie = "sl-aberta=; max-age=0; path=/";
}

// Regras da senha (para a lista que fica verde)
export const REGRAS_SENHA = [
  // Tamanho
  ["Pelo menos 8 caracteres", (s) => s.length >= 8],
  // Número
  ["Um número", (s) => /\d/.test(s)],
  // Maiúscula
  ["Uma letra maiúscula", (s) => /[A-Z]/.test(s)],
  // Símbolo
  ["Um símbolo (! @ # ...)", (s) => /[^A-Za-z0-9]/.test(s)],
];

// E-mail com formato válido?
export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
