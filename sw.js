/*
 * Service worker do Saúde Life: permite instalar o app no celular
 * e usar o site inteiro sem internet (offline completo).
 *
 * Ao instalar, ele já guarda TODOS os arquivos do site (lista abaixo).
 * Depois, usa a estratégia "rede primeiro": sempre busca a versão nova e
 * só usa a cópia guardada quando está offline. Assim, editar um arquivo e
 * recarregar a página continua mostrando a mudança na hora.
 */
// Nome da caixa de arquivos guardados (mudar o número apaga as caixas antigas)
const CACHE = "saude-life-v2";

// Todos os arquivos do site (caminhos a partir da pasta do sw.js)
const ARQUIVOS = [
  // Arquivos da raiz do site
  "./404.html", "./index.html",
  // Página para academias
  "./academias/academias.css", "./academias/academias.html", "./academias/academias.js",
  // Páginas e arquivos do app (todas as telas)
  "./app/academia/academia.css", "./app/academia/academia.html", "./app/academia/academia.js", "./app/alimentacao/alimentacao.css", "./app/alimentacao/alimentacao.html", "./app/alimentacao/alimentacao.js", "./app/alimentacao/alimentos.js", "./app/aulas/aulas.css", "./app/aulas/aulas.html", "./app/aulas/aulas.js", "./app/comecar/comecar.css", "./app/comecar/comecar.html", "./app/comecar/comecar.js", "./app/comum/app.css", "./app/comum/app.js", "./app/comum/dados.js", "./app/comum/demo.js", "./app/comum/exercicios.js", "./app/comum/personagem.js", "./app/comum/pontos.js", "./app/comum/relogio.js", "./app/comum/stories.js", "./app/comum/tour.js", "./app/comunidade/comunidade.css", "./app/comunidade/comunidade.html", "./app/comunidade/comunidade.js", "./app/descobrir/descobrir.css", "./app/descobrir/descobrir.html", "./app/descobrir/descobrir.js", "./app/evolucao/evolucao.css", "./app/evolucao/evolucao.html", "./app/evolucao/evolucao.js", "./app/inicio/inicio.css", "./app/inicio/inicio.html", "./app/inicio/inicio.js", "./app/perfil/perfil.css", "./app/perfil/perfil.html", "./app/perfil/perfil.js", "./app/planos/planos.css", "./app/planos/planos.html", "./app/planos/planos.js", "./app/profissionais/profissionais.css", "./app/profissionais/profissionais.html", "./app/profissionais/profissionais.js", "./app/ranking/ranking.css", "./app/ranking/ranking.html", "./app/ranking/ranking.js", "./app/salvos/salvos.css", "./app/salvos/salvos.html", "./app/salvos/salvos.js", "./app/treino/treino.css", "./app/treino/treino.html", "./app/treino/treino.js", "./app/treinos/treinos.css", "./app/treinos/treinos.html", "./app/treinos/treinos.js",
  // Blog de dicas
  "./blog/blog.css", "./blog/blog.html", "./blog/blog.js",
  // Cadastro
  "./cadastro/cadastro.css", "./cadastro/cadastro.html", "./cadastro/cadastro.js",
  // Redirecionamento antigo
  "./index/index.html",
  // Login
  "./login/login.css", "./login/login.html", "./login/login.js",
  // Planos
  "./planos/planos.css", "./planos/planos.html",
  // Política de privacidade
  "./politica/politica.html",
  // Esqueci a senha e redefinir
  "./senha/redefinir.html", "./senha/redefinir.js", "./senha/senha.css", "./senha/senha.html", "./senha/senha.js",
  // Arquivos comuns (cores, ícones, manifesto)
  "./shared/auth.css", "./shared/base.css", "./shared/favicon.svg", "./shared/form-utils.js", "./shared/icon-192.png", "./shared/icon-512.png", "./shared/legal.css", "./shared/legal.js", "./shared/manifest.webmanifest", "./shared/og-image.png", "./shared/planos.css", "./shared/planos.js", "./shared/site.css", "./shared/tema.js", "./shared/tokens.css",
  // Termos de uso
  "./termos/termos.html",
  // Página inicial pública
  "./welcome/welcome.css", "./welcome/welcome.html", "./welcome/welcome.js",
];

// Endereços de fora que também podem ser guardados (fontes do Google)
const FONTES = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

// Ao instalar: guarda todos os arquivos (um por um, para um erro não estragar o resto)
self.addEventListener("install", (evento) => {
  // Espera terminar de guardar antes de ativar
  evento.waitUntil(
    // Abre a caixa
    caches
      .open(CACHE)
      // Guarda cada arquivo (se um falhar, segue com os outros)
      .then((cache) => Promise.all(ARQUIVOS.map((url) => cache.add(url).catch(() => null))))
      // Ativa logo, sem esperar fechar as abas
      .then(() => self.skipWaiting()),
  );
});

// Ao ativar: apaga as caixas antigas e assume as páginas abertas
self.addEventListener("activate", (evento) => {
  // Espera terminar
  evento.waitUntil(
    // Lista as caixas
    caches
      .keys()
      // Apaga as que não são a atual
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      // Assume as páginas abertas
      .then(() => self.clients.claim()),
  );
});

// A cada pedido de arquivo...
self.addEventListener("fetch", (evento) => {
  // ...pega o pedido
  const { request } = evento;
  // Endereço do pedido
  const url = new URL(request.url);
  // Só cuida de GET do próprio site ou das fontes do Google
  if (request.method !== "GET" || (url.origin !== self.location.origin && !FONTES.includes(url.origin))) return;

  // Responde com...
  evento.respondWith(
    // ...a versão da internet
    fetch(request)
      // Se veio...
      .then((resposta) => {
        // ...e deu certo (ou é uma fonte de fora, que vem "opaca"), guarda uma cópia
        if (resposta.ok || resposta.type === "opaque") {
          // Copia (a resposta só pode ser lida uma vez)
          const copia = resposta.clone();
          // Guarda na caixa
          caches.open(CACHE).then((cache) => cache.put(request, copia));
        }
        // Devolve a resposta
        return resposta;
      })
      // Sem internet: usa a cópia guardada (ignorando o ?id=... do endereço)
      .catch(() =>
        // Procura a cópia
        caches.match(request, { ignoreSearch: true }).then(
          // Se não tem cópia de uma página, mostra a página de "não encontrado"
          (copia) => copia || (request.mode === "navigate" ? caches.match("./404.html") : undefined),
        ),
      ),
  );
});
