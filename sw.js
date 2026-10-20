/*
 * Service worker do Saúde Life: permite instalar o app no celular
 * e abrir as páginas já visitadas mesmo sem internet.
 *
 * Estratégia "rede primeiro": sempre busca a versão nova e só usa a
 * cópia guardada quando está offline. Assim, editar um arquivo e
 * recarregar a página continua mostrando a mudança na hora.
 */
// Nome da "caixa" (cache) onde as páginas ficam guardadas; trocar o v1 apaga as cópias antigas
const CACHE = "saude-life-v1";

// Quando o service worker é instalado, ele já começa a funcionar sem esperar
self.addEventListener("install", () => self.skipWaiting());

// Quando ele é ativado, faz uma limpeza
self.addEventListener("activate", (evento) => {
  // Pede para o navegador esperar a limpeza terminar
  evento.waitUntil(
    // Abre a lista de caches guardados
    caches
      // Pega o nome de todos os caches
      .keys()
      // Apaga todos os caches que não são o atual (versões antigas)
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      // Passa a controlar as abas que já estavam abertas
      .then(() => self.clients.claim()),
  );
});

// Toda vez que a página pede um arquivo (HTML, CSS, imagem...)
self.addEventListener("fetch", (evento) => {
  // Pega o pedido que a página fez
  const { request } = evento;
  // Ignora pedidos que não são de leitura (GET) ou que vão para outros sites
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Responde o pedido do nosso jeito
  evento.respondWith(
    // Primeiro tenta buscar o arquivo na internet
    fetch(request)
      // Se a internet respondeu...
      .then((resposta) => {
        // ...e a resposta veio certinha (sem erro)
        if (resposta.ok) {
          // Faz uma cópia da resposta (uma resposta só pode ser lida uma vez)
          const copia = resposta.clone();
          // Guarda essa cópia no cache para usar quando estiver offline
          caches.open(CACHE).then((cache) => cache.put(request, copia));
        }
        // Entrega a resposta da internet para a página
        return resposta;
      })
      // Se não tem internet, entrega a cópia guardada no cache
      .catch(() => caches.match(request, { ignoreSearch: true })),
  );
});
