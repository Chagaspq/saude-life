/*
 * Service worker "desligador" do Saúde Life.
 * O site não guarda mais cópia offline no navegador: assim ele abre sempre
 * direto na versão mais nova. Este arquivo só existe para os navegadores
 * que já tinham a cópia antiga: ele apaga essa cópia, se desliga e
 * recarrega a página aberta.
 */
// Ao instalar, já entra no lugar do antigo (sem esperar)
self.addEventListener("install", () => self.skipWaiting());

// Ao ativar...
self.addEventListener("activate", (evento) => {
  // ...espera terminar tudo antes de sair
  evento.waitUntil(
    // Passos em ordem
    (async () => {
      // Nomes das caixas de arquivos guardados
      const nomes = await caches.keys();
      // Apaga todas
      await Promise.all(nomes.map((n) => caches.delete(n)));
      // Desliga este service worker
      await self.registration.unregister();
      // Páginas do site abertas agora
      const abas = await self.clients.matchAll({ type: "window" });
      // Recarrega cada uma (agora direto da internet, sem cópia)
      abas.forEach((aba) => aba.navigate(aba.url));
    })(),
  );
});
