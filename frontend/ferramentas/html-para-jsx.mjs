// Converte um trecho de HTML antigo em JSX (usado uma vez na migração para React).
// Uso: node ferramentas/html-para-jsx.mjs arquivo.html "<seletor-inicio>" "<seletor-fim>"
import { readFileSync } from "node:fs";

// Atributos HTML que mudam de nome no React
const NOMES = { class: "className", for: "htmlFor", tabindex: "tabIndex", autocomplete: "autoComplete", novalidate: "noValidate", readonly: "readOnly", maxlength: "maxLength", minlength: "minLength", inputmode: "inputMode", enterkeyhint: "enterKeyHint", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", "stop-color": "stopColor", "fill-rule": "fillRule", "clip-rule": "clipRule", viewbox: "viewBox", colspan: "colSpan", rowspan: "rowSpan", value: "defaultValue", checked: "defaultChecked", selected: "defaultSelected", srcset: "srcSet", crossorigin: "crossOrigin", datetime: "dateTime" };
// Tags sem fechamento
const VAZIAS = ["input", "br", "img", "hr", "meta", "link", "source", "path", "stop", "circle", "rect", "line", "polyline", "polygon", "ellipse"];

// Converte um texto HTML
export function converter(html) {
  // Comentários HTML viram comentários JSX
  let s = html.replace(/<!--([\s\S]*?)-->/g, (_, t) => `{/*${t.replace(/\*\//g, "* /")}*/}`);
  // Chaves soltas no texto (fora de comentários) viram texto literal
  s = s.replace(/(\{\/\*[\s\S]*?\*\/\})|([{}])/g, (m, c, ch) => c || (ch === "{" ? "{'{'}" : "{'}'}"));
  // Atributos dentro das tags
  s = s.replace(/<([a-zA-Z][\w-]*)(\s[^<>]*?)?(\/?)>/g, (m, tag, attrs = "", fecha) => {
    // Troca cada atributo
    const novos = (attrs || "").replace(/([:\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'))?/g, (a, nome, val) => {
      // Nome no React
      let n = NOMES[nome.toLowerCase()] || nome;
      // Estilo em texto vira objeto
      if (nome === "style" && val) {
        // Pares "a: b"
        const obj = val.slice(1, -1).split(";").filter((x) => x.trim()).map((p) => { const [k, ...v] = p.split(":"); return `${JSON.stringify(k.trim().replace(/-([a-z])/g, (_, l) => l.toUpperCase()))}: ${JSON.stringify(v.join(":").trim())}`; });
        // Devolve
        return `style={{ ${obj.join(", ")} }}`;
      }
      // Atributo sem valor
      if (!val) return n;
      // Com valor
      return `${n}=${val}`;
    });
    // Tag vazia sempre se fecha
    const vazia = VAZIAS.includes(tag.toLowerCase());
    // Monta
    return `<${tag}${novos.replace(/\s*\/$/, "")}${vazia || fecha ? " /" : ""}>`;
  });
  // Tira fechamentos de tags vazias que o HTML trazia
  s = s.replace(/<\/(path|stop|circle|rect|line|polyline|polygon|ellipse|input|br|img)>/g, "");
  // Devolve
  return s;
}

// Linha de comando
if (import.meta.url === `file://${process.argv[1]}`) {
  // Lê o arquivo
  const html = readFileSync(process.argv[2], "utf8");
  // Recorta
  const ini = html.indexOf(process.argv[3]);
  // Fim
  const fim = html.indexOf(process.argv[4], ini);
  // Mostra
  process.stdout.write(converter(html.slice(ini, fim + process.argv[4].length)));
}
