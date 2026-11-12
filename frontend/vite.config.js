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
// Pasta do site pronto (docs/ na raiz do repositório: é ela que o GitHub Pages publica)
const SAIDA = resolve(FRONT, "../docs");

// GitHub Pages: endereço que não existe (ex.: /saude-life/app/inicio) abre o 404.html.
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
    // Copia
    copyFileSync(resolve(pastaDeSaida, "index.html"), resolve(pastaDeSaida, "404.html"));
  },
};

// Configuração (command = "serve" no npm run dev, "build" no npm run build; isPreview = npm run preview)
export default defineConfig(({ command, isPreview }) => ({
  // Pasta do front-end
  root: FRONT,
  // Endereço base: no ar (e no preview) fica em /saude-life/, como em https://chagaspq.github.io/saude-life/;
  // no npm run dev fica na raiz (http://localhost:5173/)
  base: command === "build" || isPreview ? "/saude-life/" : "/",
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
