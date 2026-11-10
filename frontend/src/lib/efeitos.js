// Efeitos visuais: confete e textinho voando. Respeitam quem pediu menos movimento.

// Pediu menos movimento? (sistema ou modo simples)
export const menosMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-simples");

// Confete na tela (comemorações)
export function confete() {
  // Menos movimento: nada
  if (menosMovimento()) return;
  // Caixa
  const caixa = document.createElement("div");
  // Classe
  caixa.className = "confete";
  // Cores da marca
  const cores = ["#f0845a", "#4fc29a", "#f5b544", "#f5a37f"];
  // 40 pedacinhos
  for (let i = 0; i < 40; i++) {
    // Pedaço
    const p = document.createElement("span");
    // Posição
    p.style.left = Math.random() * 100 + "%";
    // Cor
    p.style.background = cores[i % cores.length];
    // Atraso
    p.style.animationDelay = Math.random() * 0.3 + "s";
    // Giro
    p.style.setProperty("--giro", Math.round(Math.random() * 720 - 360) + "deg");
    // Lado
    p.style.setProperty("--lado", Math.round(Math.random() * 160 - 80) + "px");
    // Junta
    caixa.append(p);
  }
  // Coloca
  document.body.append(caixa);
  // Some
  setTimeout(() => caixa.remove(), 2400);
}

// Textinho voando a partir de um elemento (ex.: "+10")
export function voarTexto(origem, texto, classe = "demo-voando") {
  // Bolha
  const bolha = document.createElement("span");
  // Classe
  bolha.className = classe;
  // Texto
  bolha.textContent = texto;
  // Posição do elemento
  const r = origem.getBoundingClientRect();
  // Centro
  bolha.style.left = r.left + r.width / 2 + "px";
  // Topo
  bolha.style.top = r.top + "px";
  // Coloca
  document.body.append(bolha);
  // Some
  setTimeout(() => bolha.remove(), 1200);
}
