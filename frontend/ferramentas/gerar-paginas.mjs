// Gera os arquivos .html de todas as páginas (cada um só carrega o React da página).
// Uso (dentro da pasta frontend): node ferramentas/gerar-paginas.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Páginas: [arquivo, título, descrição, componente em src/paginas]
const PAGINAS = [
  // Site público
  ["welcome/welcome.html", "Saúde Life - Boas-vindas", "Treinos guiados, alimentação e evolução em um só app.", "welcome"],
  // Planos
  ["planos/planos.html", "Saúde Life - Planos", "Conheça os planos do Saúde Life.", "planos"],
  // Blog
  ["blog/blog.html", "Saúde Life - Blog de dicas", "Dicas rápidas de treino, alimentação e hábitos.", "blog"],
  // Academias
  ["academias/academias.html", "Saúde Life - Para academias", "O Saúde Life para academias e personais.", "academias"],
  // Termos
  ["termos/termos.html", "Saúde Life - Termos de Uso", "Termos de Uso do Saúde Life.", "termos"],
  // Política
  ["politica/politica.html", "Saúde Life - Política de Privacidade", "Política de Privacidade do Saúde Life.", "politica"],
  // Ajuda
  ["ajuda/ajuda.html", "Saúde Life - Ajuda", "Central de ajuda do Saúde Life.", "ajuda"],
  // Glossário
  ["glossario/glossario.html", "Saúde Life - Glossário", "Glossário de termos de treino e nutrição.", "glossario"],
  // Calculadoras
  ["calculadoras/calculadoras.html", "Saúde Life - Calculadoras", "Calculadoras de IMC, calorias, água e 1RM.", "calculadoras"],
  // Página não encontrada
  ["404.html", "Saúde Life - Página não encontrada", "Página não encontrada.", "erro404"],
  // Contas
  ["login/login.html", "Saúde Life - Entrar", "Entre na sua conta do Saúde Life.", "login"],
  // Cadastro
  ["cadastro/cadastro.html", "Saúde Life - Criar conta", "Crie sua conta no Saúde Life.", "cadastro"],
  // Esqueci a senha
  ["senha/senha.html", "Saúde Life - Recuperar Senha", "Recupere a senha da sua conta.", "senha"],
  // Redefinir
  ["senha/redefinir.html", "Saúde Life - Redefinir Senha", "Escolha uma nova senha.", "redefinir"],
  // App do cliente
  ["app/comecar/comecar.html", "Personalize seu Saúde Life", "Questionário inicial.", "comecar"],
  // Início
  ["app/inicio/inicio.html", "Início — Saúde Life", "Resumo da sua semana.", "inicio"],
  // Treinos
  ["app/treinos/treinos.html", "Treinos — Saúde Life", "Seus treinos.", "treinos"],
  // Treino em andamento
  ["app/treino/treino.html", "Treino — Saúde Life", "Treino em andamento.", "treino"],
  // Alimentação
  ["app/alimentacao/alimentacao.html", "Alimentação — Saúde Life", "Refeições e água do dia.", "alimentacao"],
  // Evolução
  ["app/evolucao/evolucao.html", "Evolução — Saúde Life", "Seu progresso semana a semana.", "evolucao"],
  // Perfil
  ["app/perfil/perfil.html", "Perfil — Saúde Life", "Seu perfil e preferências.", "perfil"],
  // Planos (app)
  ["app/planos/planos.html", "Planos — Saúde Life", "Planos e assinatura.", "app-planos"],
  // Painel do administrador
  ["app/admin/admin.html", "Painel do administrador — Saúde Life", "Clientes, treinos e avisos.", "admin"],
];

// Para cada página...
for (const [arquivo, titulo, descricao, componente] of PAGINAS) {
  // ...quantas pastas acima fica a raiz (welcome/ = 1, app/inicio/ = 2)
  const nivel = arquivo.split("/").length - 1;
  // ...caminho até a raiz
  const raiz = nivel ? "../".repeat(nivel) : "./";
  // ...HTML
  const html = `<!doctype html>
<!-- Página do Saúde Life feita em React (o conteúdo vem de src/paginas/${componente}.jsx) -->
<html lang="pt-BR">
  <head>
    <!-- Acentos certos -->
    <meta charset="UTF-8" />
    <!-- Ajusta à tela do celular -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Cor da barra do navegador no celular -->
    <meta name="theme-color" content="#0e1512" />
    <!-- Título da aba -->
    <title>${titulo}</title>
    <!-- Descrição para buscadores -->
    <meta name="description" content="${descricao}" />
    <!-- Ícone da aba -->
    <link rel="icon" href="${raiz}shared/favicon.svg" type="image/svg+xml" />
    <!-- App instalável -->
    <link rel="manifest" href="${raiz}shared/manifest.webmanifest" />
    <!-- Ícone no iPhone -->
    <link rel="apple-touch-icon" href="${raiz}shared/icon-192.png" />
    <!-- Prévia ao compartilhar -->
    <meta property="og:title" content="${titulo}" />
    <!-- Imagem da prévia -->
    <meta property="og:image" content="https://chagaspq.github.io/saude-life/shared/og-image.png" />
    <!-- Fontes -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <!-- Fontes -->
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <!-- Fontes: Barlow, Barlow Semi Condensed e Space Mono -->
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
    <!-- Tema e acessibilidade antes de desenhar (sem piscar) -->
    <script src="${raiz}shared/antes.js"></script>
    <!-- Tradução para inglês e espanhol -->
    <script src="${raiz}shared/idioma.js" defer></script>
  </head>
  <body>
    <!-- Lugar onde o React desenha a página -->
    <div id="raiz"></div>
    <!-- Sem JavaScript: aviso -->
    <noscript>Ative o JavaScript para usar o Saúde Life.</noscript>
    <!-- Página em React -->
    <script type="module" src="/src/paginas/${componente}.jsx"></script>
  </body>
</html>
`;
  // ...cria a pasta
  mkdirSync(dirname(arquivo), { recursive: true });
  // ...salva
  writeFileSync(arquivo, html);
}
// Página raiz: vai para a página inicial.
// Funciona nos dois jeitos do GitHub Pages: servindo a pasta /docs (site pronto)
// ou a raiz do repositório (aí o site pronto fica em docs/).
writeFileSync(
  "index.html",
  `<!doctype html>
<!-- Endereço raiz do site: vai direto para a página inicial -->
<html lang="pt-BR">
  <head>
    <!-- Acentos certos -->
    <meta charset="UTF-8" />
    <!-- Título -->
    <title>Saúde Life</title>
    <!-- Se o JavaScript estiver desligado, vai para a página inicial depois de 2 segundos -->
    <noscript><meta http-equiv="refresh" content="2; url=welcome/welcome.html" /></noscript>
    <!-- Escolhe para onde ir -->
    <script>
      // Se existe a pasta docs/ aqui, o site pronto está nela
      fetch("docs/welcome/welcome.html", { method: "HEAD" })
        // Achou: vai para o site pronto; não achou: já estamos no site pronto
        .then((r) => location.replace(r.ok ? "docs/welcome/welcome.html" : "welcome/welcome.html"))
        // Erro de rede: vai para a página inicial daqui
        .catch(() => location.replace("welcome/welcome.html"));
    </script>
  </head>
  <body>
    <!-- Link, se o navegador não for sozinho -->
    <a href="welcome/welcome.html">Abrir o Saúde Life</a>
  </body>
</html>
`,
);
// Avisa
console.log(PAGINAS.length + 1, "páginas geradas");
