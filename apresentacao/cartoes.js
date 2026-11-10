// Cartões do vídeo: código real, árvore de pastas, consultas no SQL Server e chamadas na API.
const fs = require("fs");
const { execFileSync } = require("child_process");
const hljs = require("highlight.js");
const RAIZ = "/home/user/saude-life/";
const TEMA = fs.readFileSync(__dirname + "/node_modules/highlight.js/styles/github-dark.css", "utf8");
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Página base dos cartões
const base = (corpo, titulo = "", parte = "") => `<!doctype html><html><head><meta charset="utf-8"><style>${TEMA}
*{box-sizing:border-box} body{margin:0;height:100vh;background:radial-gradient(60% 70% at 85% 0%,rgba(240,132,90,.13),transparent),#0e1512;color:#f4f1ea;font-family:"DejaVu Sans",Arial,sans-serif;padding:34px 44px;display:flex;flex-direction:column;gap:18px;overflow:hidden}
.topo{display:flex;align-items:baseline;gap:18px}.parte{color:#4fc29a;font-weight:700;font-size:22px;letter-spacing:2px;text-transform:uppercase}.tit{font-size:40px;font-weight:700}
.jan{flex:1;min-height:0;display:flex;flex-direction:column;background:#0d1117;border:1px solid #263832;border-radius:16px;overflow:hidden}
.aba{background:#161b22;padding:10px 18px;font-size:19px;color:#a3b0a8;border-bottom:1px solid #263832;display:flex;gap:10px;align-items:center}.aba b{color:#f4f1ea}.bol{width:12px;height:12px;border-radius:50%;display:inline-block}
pre{margin:0;flex:1;overflow:hidden;padding:14px 0;font-family:"DejaVu Sans Mono",monospace;font-size:18px;line-height:1.5}
.l{display:flex}.n{width:62px;text-align:right;padding-right:16px;color:#4b5a54;flex:none}.c{white-space:pre-wrap;flex:1;padding-right:18px}
.lado{display:flex;gap:22px;flex:1;min-height:0}.nota{width:430px;flex:none;background:#16211d;border:1px solid #263832;border-radius:16px;padding:22px;font-size:22px;line-height:1.45}.nota li{margin-bottom:12px}.nota ul{padding-left:22px;margin:0}
table{border-collapse:collapse;font-size:18px;width:100%}th,td{border:1px solid #263832;padding:7px 10px;text-align:left;white-space:nowrap;max-width:420px;overflow:hidden;text-overflow:ellipsis}th{background:#1e2b25;color:#4fc29a}td{background:#111a17}
.grade{overflow:hidden;padding:12px;flex:1}.msg{color:#a3b0a8;font-size:17px;padding:6px 14px}
.cx{background:#16211d;border:1px solid #263832;border-radius:16px;padding:26px 30px;font-size:26px;line-height:1.5}.cx li{margin-bottom:10px}
.met{display:inline-block;padding:4px 12px;border-radius:8px;font-weight:700;margin-right:12px}.st{font-weight:700;padding:4px 12px;border-radius:8px}
</style></head><body><div class="topo"><span class="parte">${esc(parte)}</span><span class="tit">${esc(titulo)}</span></div>${corpo}</body></html>`;

// Trecho de um arquivo: começa na linha que bate com "de" e pega "n" linhas
function trecho(arquivo, de, n) {
  const linhas = fs.readFileSync(RAIZ + arquivo, "utf8").split("\n");
  const i = linhas.findIndex((l) => l.includes(de));
  if (i < 0) throw new Error("não achei " + de + " em " + arquivo);
  return { ini: i + 1, linhas: linhas.slice(i, i + n) };
}

// Cartão de código (janela de editor com número das linhas e uma nota ao lado)
exports.codigo = ({ parte, titulo, arquivo, de, n = 24, lang = "javascript", nota = [] }) => {
  const t = trecho(arquivo, de, n);
  const html = t.linhas.map((l, k) => `<div class="l"><span class="n">${t.ini + k}</span><span class="c">${hljs.highlight(l || " ", { language: lang }).value}</span></div>`).join("");
  const janela = `<div class="jan"><div class="aba"><span class="bol" style="background:#ff5f56"></span><span class="bol" style="background:#ffbd2e"></span><span class="bol" style="background:#27c93f"></span>&nbsp;<b>${esc(arquivo)}</b></div><pre><code class="hljs">${html}</code></pre></div>`;
  return base(nota.length ? `<div class="lado">${janela}<div class="nota"><ul>${nota.map((x) => `<li>${x}</li>`).join("")}</ul></div></div>` : janela, titulo, parte);
};

// Árvore de pastas
exports.arvore = ({ parte, titulo, raiz, itens, nota = [] }) => {
  const linhas = itens.map(([p, d]) => `<div class="l"><span class="c"><span style="color:#f5a37f">${esc(p)}</span>${d ? `<span style="color:#7d8b85">   ${esc(d)}</span>` : ""}</span></div>`).join("");
  const janela = `<div class="jan"><div class="aba">📁 <b>${esc(raiz)}</b></div><pre style="font-size:22px;padding:22px 28px;line-height:1.7"><code>${linhas}</code></pre></div>`;
  return base(nota.length ? `<div class="lado">${janela}<div class="nota"><ul>${nota.map((x) => `<li>${x}</li>`).join("")}</ul></div></div>` : janela, titulo, parte);
};

// Cartão de texto (tópicos)
exports.texto = ({ parte, titulo, itens, grande }) => base(`<div class="cx" style="font-size:${grande ? 34 : 28}px;flex:1"><ul>${itens.map((x) => `<li>${x}</li>`).join("")}</ul></div>`, titulo, parte);

// Cartão com imagem (ex.: diagrama)
exports.imagem = ({ parte, titulo, arquivo }) => {
  const b64 = fs.readFileSync(RAIZ + arquivo).toString("base64");
  return base(`<div class="jan" style="background:#fff;align-items:center;justify-content:center"><img src="data:image/png;base64,${b64}" style="max-width:100%;max-height:100%;object-fit:contain"></div>`, titulo, parte);
};

// Consulta de verdade no SQL Server (janela no estilo do SSMS)
exports.sql = ({ parte, titulo, consulta, mostrar }) => {
  let saida;
  try {
    saida = execFileSync("docker", ["exec", "sqlsl", "/opt/mssql-tools18/bin/sqlcmd", "-C", "-S", "localhost", "-U", "sa", "-P", "Saude#Life2026", "-d", "saudelife", "-W", "-s", "|", "-Q", "SET NOCOUNT ON; " + consulta], { encoding: "utf8" });
  } catch (e) { saida = String(e.stdout || e.message); }
  const blocos = saida.split(/\n\s*\n/).map((b) => b.split("\n").filter((l) => l.trim() !== "")).filter((b) => b.length >= 2 && /^-+(\|-+)*$/.test(b[1].replace(/\s/g, "")));
  const grades = blocos.map((b) => {
    const cab = b[0].split("|"); const linhas = b.slice(2).map((l) => l.split("|"));
    return `<table><tr>${cab.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${linhas.slice(0, 12).map((r) => `<tr>${r.map((c) => `<td>${esc(c === "NULL" ? "" : c)}</td>`).join("")}</tr>`).join("")}</table><div class="msg">(${linhas.length} linha${linhas.length === 1 ? "" : "s"})</div>`;
  }).join("");
  const q = hljs.highlight(mostrar || consulta, { language: "sql" }).value;
  return base(`<div class="jan" style="flex:none;max-height:44%"><div class="aba">SQL Server Management Studio · <b>saudelife</b> · Nova consulta</div><pre style="font-size:21px;padding:14px 20px"><code class="hljs">${q}</code></pre></div><div class="jan"><div class="aba">Resultados</div><div class="grade">${grades || `<div class="msg">Comandos concluídos com sucesso.</div>`}</div></div>`, titulo, parte);
};

// Chamada de verdade na API (janela no estilo do Postman)
exports.api = async ({ parte, titulo, metodo, rota, corpo, token }) => {
  const r = await fetch("http://localhost:8080/v1" + rota, { method: metodo, headers: { ...(corpo ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: "Bearer " + token } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
  const json = await r.json().catch(() => null);
  let texto = JSON.stringify(json, null, 2);
  const linhas = texto.split("\n"); if (linhas.length > 24) texto = linhas.slice(0, 23).join("\n") + "\n  ...";
  const cor = { GET: "#4fc29a", POST: "#f5c35a", PATCH: "#7ab8ff", PUT: "#7ab8ff", DELETE: "#ff6b6b" }[metodo];
  const stCor = r.status < 300 ? "#4fc29a" : "#ff6b6b";
  const pedido = `<div class="jan" style="flex:none"><div class="aba">Postman · Saúde Life API</div><div style="padding:16px 20px;font-size:24px;font-family:'DejaVu Sans Mono'"><span class="met" style="background:${cor};color:#0e1512">${metodo}</span>http://localhost:8080/v1${esc(rota)}${token ? `<div style="font-size:18px;color:#a3b0a8;margin-top:10px">Authorization: Bearer ${esc(token.slice(0, 18))}…</div>` : ""}${corpo ? `<pre style="font-size:19px;margin-top:10px;color:#f5a37f">${esc(JSON.stringify(corpo))}</pre>` : ""}</div></div>`;
  const resp = `<div class="jan"><div class="aba">Resposta &nbsp;<span class="st" style="background:${stCor};color:#0e1512">${r.status} ${r.status === 200 ? "OK" : r.status === 201 ? "Created" : r.status === 401 ? "Unauthorized" : ""}</span></div><pre style="padding:14px 22px;font-size:19px"><code class="hljs">${hljs.highlight(texto, { language: "json" }).value}</code></pre></div>`;
  return { html: base(pedido + resp, titulo, parte), json };
};

// Celular com o site dentro (iframe)
exports.celular = ({ parte, titulo, url, nota = [] }) => base(`<div class="lado" style="align-items:center;justify-content:center"><div style="width:410px;height:780px;border:14px solid #222;border-radius:44px;overflow:hidden;background:#000;box-shadow:0 20px 60px rgba(0,0,0,.6);flex:none"><iframe src="${url}" style="width:100%;height:100%;border:0"></iframe></div>${nota.length ? `<div class="nota" style="flex:none"><ul>${nota.map((x) => `<li>${x}</li>`).join("")}</ul></div>` : ""}</div>`, titulo, parte);
exports.base = base;
