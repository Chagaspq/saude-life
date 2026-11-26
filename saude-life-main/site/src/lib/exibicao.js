// Exibição: tema claro/escuro, idioma e acessibilidade (texto maior, contraste, daltônico, modo simples, VLibras e voz).
import { ler } from "./armazenamento.js";

// Escolhas de acessibilidade salvas
export const lerA11y = () => ler("sl-a11y", {}) || {};

// Salva e aplica as escolhas de acessibilidade
export function salvarA11y(a) {
  // Avisa o app que as escolhas mudaram (o componente <VLibras /> escuta)
  window.dispatchEvent(new CustomEvent("sl:a11y", { detail: a }));
  // Salva
  localStorage.setItem("sl-a11y", JSON.stringify(a));
  // Aplica
  aplicarA11y(a);
}

// Aplica as escolhas no <html> (o CSS do base.css faz o resto)
export function aplicarA11y(a) {
  // Raiz
  const raiz = document.documentElement;
  // Tamanho do texto
  raiz.dataset.fonte = String(Math.max(a.fonte || 0, a.simples ? 2 : 0));
  // Contraste
  raiz.toggleAttribute("data-contraste", Boolean(a.contraste));
  // Daltônico
  raiz.toggleAttribute("data-daltonico", Boolean(a.daltonico));
  // Modo simples
  raiz.toggleAttribute("data-simples", Boolean(a.simples));
}

// Tema salvo
export const lerTema = () => localStorage.getItem("sl-tema") || "escuro";

// Troca e salva o tema
export function aplicarTema(tema) {
  // Salva
  localStorage.setItem("sl-tema", tema);
  // Claro: marca o <html>
  if (tema === "claro") document.documentElement.dataset.tema = "claro";
  // Escuro: tira a marca
  else delete document.documentElement.dataset.tema;
  // Cor da barra do navegador no celular
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tema === "claro" ? "#f6efe4" : "#0e1512");
}

// Idioma salvo ("pt", "en" ou "es")
export const lerIdioma = () => ler("sl-idioma", "pt") || "pt";

// Troca o idioma (recarrega a página traduzida pelo idioma.js)
export function trocarIdioma(idioma) {
  // Salva
  localStorage.setItem("sl-idioma", JSON.stringify(idioma));
  // Recarrega
  window.location.reload();
}


// Lê a página em voz alta (ou para). Devolve true se começou a ler
export function lerEmVoz() {
  // Sem voz no navegador
  if (!("speechSynthesis" in window)) return false;
  // Já falando: para
  if (speechSynthesis.speaking) {
    // Para
    speechSynthesis.cancel();
    // Parou
    return false;
  }
  // Miolo da página (ou a janela aberta)
  const alvo = document.querySelector(".modal-window") || document.querySelector("main, .auth-card, body");
  // Fala
  const fala = new SpeechSynthesisUtterance(alvo.innerText.replace(/\s+/g, " ").slice(0, 4000));
  // Idioma da página
  fala.lang = document.documentElement.lang || "pt-BR";
  // Um pouco mais devagar
  fala.rate = 0.95;
  // Começa
  speechSynthesis.speak(fala);
  // Começou
  return true;
}
