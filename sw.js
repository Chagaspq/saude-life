/*
 * Service worker do Saúde Life: permite instalar o app no celular
 * e abrir as páginas já visitadas mesmo sem internet.
 *
 * Estratégia "rede primeiro": sempre busca a versão nova e só usa a
 * cópia guardada quando está offline. Assim, editar um arquivo e
 * recarregar a página continua mostrando a mudança na hora.
 */
const CACHE = "saude-life-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  evento.respondWith(
    fetch(request)
      .then((resposta) => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copia));
        }
        return resposta;
      })
      .catch(() => caches.match(request, { ignoreSearch: true })),
  );
});
