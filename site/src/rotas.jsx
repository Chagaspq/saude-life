// Rotas do app (React Router): cada endereço mostra uma tela.
// As telas carregam só quando a pessoa abre (cada uma vira um arquivo separado no site pronto).
import { createBrowserRouter } from "react-router-dom";
import Tela from "./componentes/Tela.jsx";
import { registrarNavegacao } from "./lib/navegar.js";

// Monta a rota de uma tela (carregar = import da tela; titulo = título da aba)
function tela(caminho, carregar, titulo, extra = {}) {
  // Rota
  return {
    // Endereço
    path: caminho,
    // Carrega a tela só quando precisa
    lazy: async () => {
      // Arquivo da tela (componente + CSS)
      const modulo = await carregar();
      // Componente que o React Router desenha
      return { Component: () => <Tela Pagina={modulo.default} estilos={modulo.estilos} titulo={titulo} {...extra} /> };
    },
  };
}

// Lista das rotas
const ROTAS = [
  // ---------- Site público ----------
  // Boas-vindas
  tela("/", () => import("./paginas/welcome.jsx"), "Saúde Life - Boas-vindas"),
  // Planos
  tela("/planos", () => import("./paginas/planos.jsx"), "Saúde Life - Planos"),
  // Blog
  tela("/blog", () => import("./paginas/blog.jsx"), "Saúde Life - Blog de dicas"),
  // Para academias
  tela("/academias", () => import("./paginas/academias.jsx"), "Saúde Life - Para academias"),
  // Ajuda
  tela("/ajuda", () => import("./paginas/ajuda.jsx"), "Saúde Life - Ajuda"),
  // Glossário
  tela("/glossario", () => import("./paginas/glossario.jsx"), "Saúde Life - Glossário"),
  // Calculadoras
  tela("/calculadoras", () => import("./paginas/calculadoras.jsx"), "Saúde Life - Calculadoras"),
  // Termos de uso
  tela("/termos", () => import("./paginas/termos.jsx"), "Saúde Life - Termos de Uso"),
  // Política de privacidade
  tela("/politica", () => import("./paginas/politica.jsx"), "Saúde Life - Política de Privacidade"),

  // ---------- Conta ----------
  // Entrar
  tela("/login", () => import("./paginas/login.jsx"), "Saúde Life - Entrar"),
  // Criar conta
  tela("/cadastro", () => import("./paginas/cadastro.jsx"), "Saúde Life - Criar conta"),
  // Esqueci a senha
  tela("/senha", () => import("./paginas/senha.jsx"), "Saúde Life - Recuperar Senha"),
  // Senha nova (link com ?token=)
  tela("/senha/redefinir", () => import("./paginas/redefinir.jsx"), "Saúde Life - Redefinir Senha"),

  // ---------- App do cliente ----------
  // Início
  tela("/app/inicio", () => import("./paginas/inicio.jsx"), "Início — Saúde Life"),
  // Treinos
  tela("/app/treinos", () => import("./paginas/treinos.jsx"), "Treinos — Saúde Life"),
  // Treino em andamento (?id=)
  tela("/app/treino", () => import("./paginas/treino.jsx"), "Treino — Saúde Life", { chaveComBusca: true }),
  // Alimentação
  tela("/app/alimentacao", () => import("./paginas/alimentacao.jsx"), "Alimentação — Saúde Life"),
  // Evolução
  tela("/app/evolucao", () => import("./paginas/evolucao.jsx"), "Evolução — Saúde Life"),
  // Perfil (cliente e administrador)
  tela("/app/perfil", () => import("./paginas/perfil.jsx"), "Perfil — Saúde Life"),
  // Planos e assinatura
  tela("/app/planos", () => import("./paginas/app-planos.jsx"), "Planos — Saúde Life"),
  // Questionário inicial
  tela("/app/comecar", () => import("./paginas/comecar.jsx"), "Personalize seu Saúde Life"),

  // ---------- Administrador ----------
  // Painel
  tela("/app/admin", () => import("./paginas/admin.jsx"), "Painel do administrador — Saúde Life"),

  // ---------- Qualquer outro endereço ----------
  // Página não encontrada
  tela("*", () => import("./paginas/erro404.jsx"), "Saúde Life - Página não encontrada"),
];

// Roteador (basename: o site no ar fica dentro de /saude-life/docs/)
export const roteador = createBrowserRouter(ROTAS, {
  // Pasta do site
  basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
  // Já usa o jeito da versão 7 do React Router (sem avisos no console)
  future: { v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true },
});

// Deixa o código fora do JSX trocar de tela (src/lib/navegar.js)
registrarNavegacao((caminho, opcoes) => roteador.navigate(caminho, opcoes));
