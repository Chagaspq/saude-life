// Efeitos visuais: confete e textinho voando. Respeitam quem pediu menos movimento.
// Estas funções só avisam o componente <Efeitos /> (src/componentes/Efeitos.jsx), que desenha na tela.

// Nome do evento que leva o pedido até o componente
export const EVENTO_EFEITO = "sl:efeito";

// Pediu menos movimento? (sistema ou modo simples)
export const menosMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-simples");

// Manda um efeito para o componente desenhar
function pedir(efeito) {
  // Avisa o componente <Efeitos />
  window.dispatchEvent(new CustomEvent(EVENTO_EFEITO, { detail: efeito }));
}

// Confete na tela (comemorações)
export function confete() {
  // Menos movimento: nada
  if (menosMovimento()) return;
  // Pede o confete
  pedir({ tipo: "confete" });
}

// Textinho voando a partir de um elemento (ex.: "+10"). escondido = leitor de tela não lê (o aviso vai no toast)
export function voarTexto(origem, texto, classe = "demo-voando", escondido = false) {
  // Posição do elemento (se tiver)
  const r = origem && origem.getBoundingClientRect ? origem.getBoundingClientRect() : null;
  // Pede o texto voando (do meio do elemento; sem elemento, o CSS decide o lugar)
  pedir({ tipo: "texto", texto, classe, escondido, x: r ? r.left + r.width / 2 : null, y: r ? r.top + (classe === "pontos-voando" ? r.height / 2 : 0) : null });
}
