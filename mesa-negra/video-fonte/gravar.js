// Captura o vídeo quadro a quadro (30 fps) para ficar liso
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + __dirname + '/video.html');
  await p.waitForTimeout(2500); // fontes
  const total = await p.evaluate(() => window.TOTAL);
  const fps = 30, n = Math.ceil(total / 1000 * fps);
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  require('fs').mkdirSync(__dirname + '/q', { recursive: true });
  for (let i = 0; i < n; i++) {
    const ms = i * 1000 / fps;
    if (only && !only.some(s => Math.abs(s * 1000 - ms) < 17)) continue;
    await p.evaluate(t => window.setTempo(t), ms);
    await p.screenshot({ path: `${__dirname}/q/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  console.log('frames', n);
  await b.close();
})();
