/*
 * Importado primeiro no src/main.jsx, antes do React desenhar:
 * aplica o tema (claro/escuro) e as escolhas de acessibilidade salvas,
 * para a página já abrir certa (sem piscar). Também desliga a cópia
 * offline antiga do site (service worker), se o navegador ainda tiver.
 */
// Lê uma chave salva (ou nada)
function ler(chave) {
  // Tenta...
  try {
    // ...ler e converter
    return JSON.parse(localStorage.getItem(chave));
  } catch (e) {
    // Nada salvo
    return null;
  }
}
// Tema salvo ("claro" ou "escuro")
const tema = localStorage.getItem("sl-tema");
// Tema claro: marca o <html>
if (tema === "claro") document.documentElement.dataset.tema = "claro";
// Escolhas de acessibilidade
const a = ler("sl-a11y") || {};
// Tamanho do texto (o modo simples já começa no 2)
document.documentElement.dataset.fonte = String(Math.max(a.fonte || 0, a.simples ? 2 : 0));
// Alto contraste
if (a.contraste) document.documentElement.setAttribute("data-contraste", "");
// Daltônico
if (a.daltonico) document.documentElement.setAttribute("data-daltonico", "");
// Modo simples
if (a.simples) document.documentElement.setAttribute("data-simples", "");
// Cópia offline antiga: desliga e apaga
if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations().then(function (l) { l.forEach(function (r) { r.unregister(); }); }).catch(function () {});
// Caixas de arquivos guardados que sobraram
if ("caches" in window) caches.keys().then(function (n) { n.forEach(function (k) { caches.delete(k); }); }).catch(function () {});
