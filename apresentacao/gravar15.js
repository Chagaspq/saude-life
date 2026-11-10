// Grava o site seguindo as cenas e anota o começo e o fim de cada uma.
const { chromium } = require("playwright");
const fs = require("fs");
const { CENAS } = require("./" + process.argv[2]); const B = "http://localhost:5182";
const W = 1600, H = 900;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: "bruto", size: { width: W, height: H } } });
  // Cursor visível (bolinha que segue o mouse)
  await ctx.addInitScript(() => {
    const por = () => {
      if (document.getElementById("cursor-video")) return;
      const c = document.createElement("div");
      c.id = "cursor-video";
      c.style.cssText = "position:fixed;left:-50px;top:-50px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.85);border:3px solid #f0845a;box-shadow:0 0 0 6px rgba(240,132,90,.25);pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);transition:transform .08s";
      document.documentElement.appendChild(c);
      addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
      addEventListener("mousedown", () => (c.style.transform = "translate(-50%,-50%) scale(.7)"), true);
      addEventListener("mouseup", () => (c.style.transform = "translate(-50%,-50%)"), true);
      if (window.__ultimoMouse) { c.style.left = window.__ultimoMouse[0] + "px"; c.style.top = window.__ultimoMouse[1] + "px"; }
    };
    document.readyState === "loading" ? addEventListener("DOMContentLoaded", por) : por();
  });
  const p = await ctx.newPage();
  const t0 = Date.now();
  let mouse = [W / 2, H / 2];
  const espera = (ms) => p.waitForTimeout(ms);
  const h = {
    esperar: espera,
    ir: async (url) => { await p.goto(B + url); await p.waitForLoadState("networkidle").catch(() => {}); await p.mouse.move(mouse[0], mouse[1]); await espera(300); },
    rolar: async (dy) => { const passos = 12; for (let i = 0; i < passos; i++) { await p.mouse.wheel(0, dy / passos); await espera(35); } },
    rolarAte: async (sel) => { await p.locator(sel).first().evaluate((e) => e.scrollIntoView({ behavior: "smooth", block: "center" })); await espera(900); },
    mover: async (x, y) => { await p.mouse.move(x, y, { steps: 18 }); mouse = [x, y]; },
    clicar: async (sel) => {
      const el = p.locator(sel).first();
      await el.scrollIntoViewIfNeeded().catch(() => {});
      const box = await el.boundingBox();
      if (box) { await h.mover(box.x + box.width / 2, box.y + box.height / 2); await espera(250); }
      await el.click();
      await espera(400);
    },
    digitar: async (sel, texto) => { await h.clicar(sel); await p.locator(sel).first().fill(""); await p.locator(sel).first().pressSequentially(texto, { delay: 55 }); await espera(300); },
    tecla: async (k) => { await p.keyboard.press(k); await espera(400); },
    arrastar: async (sel, de, ate) => {
      const box = await p.locator(sel).first().boundingBox();
      const y = box.y + box.height / 2;
      await h.mover(box.x + box.width * de, y); await p.mouse.down();
      await p.mouse.move(box.x + box.width * ate, y, { steps: 40 }); mouse = [box.x + box.width * ate, y]; await p.mouse.up(); await espera(500);
    },
  };
  // Começa limpo
  await p.goto(B + "/welcome/welcome.html");
  await p.evaluate(() => localStorage.clear());
  const log = [];
  for (const [i, c] of CENAS.entries()) {
    const ini = (Date.now() - t0) / 1000;
    const alvo = (c.fala.split(/\s+/).length / 2.6 + 1.5) * 1000;
    try { await c.fazer(p, h); } catch (e) { console.log("ERRO cena", i, c.titulo, e.message.split("\n")[0]); }
    const gasto = Date.now() - t0 - ini * 1000;
    if (gasto < alvo) await espera(alvo - gasto);
    const fim = (Date.now() - t0) / 1000;
    log.push({ i, parte: c.parte, quem: c.quem, titulo: c.titulo, fala: c.fala, ini, fim });
    console.log(i, c.titulo, (fim - ini).toFixed(1) + "s");
  }
  await espera(500);
  fs.writeFileSync(process.argv[3], JSON.stringify(log, null, 1));
  const video = await p.video().path();
  await ctx.close(); await b.close();
  fs.renameSync(video, process.argv[4]);
  console.log("ok", log[log.length - 1].fim.toFixed(1), "s");
})();
