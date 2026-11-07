// Configuração do Vite (a ferramenta que monta o site React)
// O site tem várias páginas: cada arquivo .html é uma página com o seu próprio React.
import { defineConfig } from "vite";
// Plugin que ensina o Vite a entender React (JSX)
import react from "@vitejs/plugin-react";
// Ferramentas do Node para achar os arquivos
import { readdirSync, statSync } from "node:fs";
// Caminhos
import { resolve, join } from "node:path";

// Pastas que não são páginas do site
const IGNORAR = new Set(["node_modules", "docs", "documentacao", "legado", "public", "src", "ferramentas", ".git"]);

// Procura todas as páginas .html do projeto (em qualquer pasta)
function paginas(pasta = ".") {
  // Lista de páginas: { nome: caminho }
  const lista = {};
  // Para cada item da pasta...
  for (const item of readdirSync(pasta)) {
    // ...pula as pastas que não são páginas
    if (IGNORAR.has(item)) continue;
    // ...caminho completo
    const caminho = join(pasta, item);
    // ...se é pasta, procura dentro
    if (statSync(caminho).isDirectory()) Object.assign(lista, paginas(caminho));
    // ...se é .html, é uma página
    else if (item.endsWith(".html")) lista[caminho.replace(/\.html$/, "").replace(/[\\/]/g, "-")] = resolve(caminho);
  }
  // Devolve
  return lista;
}

// Configuração
export default defineConfig({
  // Caminhos relativos: funciona em https://chagaspq.github.io/saude-life/
  base: "./",
  // React
  plugins: [react()],
  // Montagem final
  build: {
    // O GitHub Pages publica a pasta docs/
    outDir: "docs",
    // Apaga a docs/ antiga antes de montar
    emptyOutDir: true,
    // Todas as páginas
    rollupOptions: { input: paginas() },
  },
});
