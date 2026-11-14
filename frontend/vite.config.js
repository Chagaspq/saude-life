// Configuração do Vite (a ferramenta que monta o site React)
// O site é um app React só: um index.html e o React Router trocando as telas.
import { defineConfig } from "vite";
// Plugin que ensina o Vite a entender React (JSX)
import react from "@vitejs/plugin-react";
// Copiar arquivo (para o 404.html do GitHub Pages)
import { copyFileSync } from "node:fs";
// Caminhos
import { resolve } from "node:path";
// Caminho deste arquivo
import { fileURLToPath } from "node:url";

// Pasta do front-end (onde este arquivo está)
const FRONT = fileURLToPath(new URL(".", import.meta.url));
// Pasta do site pronto (docs/ na raiz do repositório)
const SAIDA = resolve(FRONT, "../docs");
// Raiz do repositório (o GitHub Pages deste projeto publica a raiz, então o site fica em /saude-life/docs/)
const RAIZ = resolve(FRONT, "..");

// GitHub Pages: endereço que não existe (ex.: /saude-life/docs/app/inicio) abre o 404.html da raiz do repositório.
// Uma cópia do index.html como 404.html faz o React abrir e o React Router mostrar a tela certa.
// Pasta de saída de verdade (pode mudar com --outDir)
let pastaDeSaida = SAIDA;
// Plugin
const copiar404 = {
  // Nome do plugin
  name: "copiar-404",
  // Só no build
  apply: "build",
  // Guarda a pasta de saída de verdade (pode mudar com --outDir)
  configResolved(config) {
    // Pasta de saída
    pastaDeSaida = config.build.outDir;
  },
  // Depois de gerar o site: index.html -> 404.html
  closeBundle() {
    // Cópia dentro da pasta do site
    copyFileSync(resolve(pastaDeSaida, "index.html"), resolve(pastaDeSaida, "404.html"));
    // Site de verdade (pasta docs/): cópia também na raiz do repositório, que é onde o GitHub Pages procura o 404.html
    if (pastaDeSaida === SAIDA) copyFileSync(resolve(SAIDA, "index.html"), resolve(RAIZ, "404.html"));
  },
};

// Configuração (command = "serve" no npm run dev, "build" no npm run build; isPreview = npm run preview)
export default defineConfig(({ command, isPreview }) => ({
  // Pasta do front-end
  root: FRONT,
  // Endereço base: no ar (e no preview) fica em /saude-life/docs/ (https://chagaspq.github.io/saude-life/docs/),
  // porque o GitHub Pages publica a raiz do repositório; no npm run dev fica na raiz (http://localhost:5173/)
  base: command === "build" || isPreview ? "/saude-life/docs/" : "/",
  // React e o 404.html
  plugins: [react(), copiar404],
  // Geração do site pronto
  build: {
    // Vai para a pasta docs/
    outDir: SAIDA,
    // Limpa a pasta antes (mesmo estando fora do front-end)
    emptyOutDir: true,
  },
}));
