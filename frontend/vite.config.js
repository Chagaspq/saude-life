// Configuração do Vite (a ferramenta que monta o site React)
// O site tem várias páginas: cada arquivo .html é uma página com o seu próprio React.
import { defineConfig } from "vite";
// Plugin que ensina o Vite a entender React (JSX)
import react from "@vitejs/plugin-react";
// Ferramentas do Node para achar os arquivos
import { readdirSync, statSync } from "node:fs";
// Caminhos
import { resolve, join, relative } from "node:path";
// Caminho deste arquivo
import { fileURLToPath } from "node:url";

// Pasta do front-end (onde este arquivo está)
const FRONT = fileURLToPath(new URL(".", import.meta.url));

// Pastas que não são páginas do site
const IGNORAR = new Set(["node_modules", "public", "src", "ferramentas", ".git"]);

// Procura todas as páginas .html do front-end (em qualquer pasta)
function paginas(pasta = FRONT) {
  // Lista de páginas: nome -> caminho
  const lista = {};
  // Cada item da pasta
  for (const item of readdirSync(pasta)) {
    // Pula as pastas que não são páginas
    if (IGNORAR.has(item)) continue;
    // Caminho completo
    const caminho = join(pasta, item);
    // Pasta: procura dentro
    if (statSync(caminho).isDirectory()) Object.assign(lista, paginas(caminho));
    // Página .html: entra na lista (nome tirado do caminho, ex.: "app-inicio-inicio")
    else if (item.endsWith(".html")) lista[relative(FRONT, caminho).replace(/\.html$/, "").replace(/[\\/]/g, "-")] = resolve(caminho);
  }
  // Devolve
  return lista;
}

// Configuração
export default defineConfig({
  // Pasta do front-end
  root: FRONT,
  // Caminhos relativos (funciona no GitHub Pages, dentro de /saude-life/)
  base: "./",
  // React
  plugins: [react()],
  // Geração do site pronto
  build: {
    // Vai para a pasta docs/ na raiz do repositório (é ela que o GitHub Pages publica)
    outDir: resolve(FRONT, "../docs"),
    // Limpa a pasta antes (mesmo estando fora do front-end)
    emptyOutDir: true,
    // Todas as páginas
    rollupOptions: { input: paginas() },
  },
});
