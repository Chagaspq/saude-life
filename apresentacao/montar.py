import json, sys, subprocess, textwrap
from PIL import Image, ImageDraw, ImageFont
V = sys.argv[1]
cenas = json.load(open(V + "/cenas.json"))
P = {"Gabriel": ("Gabriel Chagas", "08", "#f0845a"), "Rafael": ("Rafael (PH) Santos", "15", "#4fc29a"), "Tomas": ("Tomas de Oliveira", "17", "#f5c35a"), "Hiago": ("Hiago Tetsuo", "10", "#7ab8ff")}
F = "/usr/share/fonts/truetype/dejavu/"
f = lambda n, s: ImageFont.truetype(F + n, s)
BG, CARD, BORDA, TXT, APAG = "#0b110f", "#16211d", "#263832", "#f4f1ea", "#a3b0a8"
TELA = (32, 32, 32 + 1408, 32 + 792)
ROSTO = (1472, 32, 1888, 32 + 416)

def quadro(c, n, total):
    nome, num, cor = P[c["quem"]]
    im = Image.new("RGB", (1920, 1080), BG)
    d = ImageDraw.Draw(im)
    # Moldura da tela do site
    d.rounded_rectangle((TELA[0] - 4, TELA[1] - 4, TELA[2] + 4, TELA[3] + 4), 14, outline=BORDA, width=3)
    # Espaço do rosto (tracejado na cor de quem fala)
    d.rounded_rectangle(ROSTO, 22, fill=CARD)
    x0, y0, x1, y1 = ROSTO
    for x in range(x0 + 20, x1 - 20, 28):
        d.line((x, y0, x + 14, y0), fill=cor, width=4); d.line((x, y1, x + 14, y1), fill=cor, width=4)
    for y in range(y0 + 20, y1 - 20, 28):
        d.line((x0, y, x0, y + 14), fill=cor, width=4); d.line((x1, y, x1, y + 14), fill=cor, width=4)
    # Ícone de câmera e texto
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2 - 30
    d.rounded_rectangle((cx - 60, cy - 36, cx + 40, cy + 36), 12, outline=APAG, width=5)
    d.polygon([(cx + 40, cy - 14), (cx + 72, cy - 34), (cx + 72, cy + 34), (cx + 40, cy + 14)], outline=APAG, width=5)
    t = "ESPAÇO PARA O ROSTO"; w = d.textlength(t, font=f("DejaVuSans-Bold.ttf", 24)); d.text((cx - w / 2, cy + 64), t, font=f("DejaVuSans-Bold.ttf", 24), fill=APAG)
    t = nome; w = d.textlength(t, font=f("DejaVuSans-Bold.ttf", 26)); d.text((cx - w / 2, cy + 100), t, font=f("DejaVuSans-Bold.ttf", 26), fill=cor)
    # Quem fala agora
    y = ROSTO[3] + 30
    d.text((1472, y), "FALANDO AGORA", font=f("DejaVuSans-Bold.ttf", 20), fill=APAG)
    d.text((1472, y + 30), nome, font=f("DejaVuSans-Bold.ttf", 34), fill=cor)
    d.text((1472, y + 76), f"nº {num}", font=f("DejaVuSans.ttf", 24), fill=APAG)
    # Tela atual
    y += 132
    d.text((1472, y), f"TELA {n} DE {total}", font=f("DejaVuSans-Bold.ttf", 20), fill=APAG)
    lin = textwrap.wrap(c["titulo"], 20)
    for k, l in enumerate(lin[:2]):
        d.text((1472, y + 30 + k * 38), l, font=f("DejaVuSans-Bold.ttf", 32), fill=TXT)
    # Os 4 do grupo (destaca quem fala)
    y = 776
    for k, (q, (nm, nu, co)) in enumerate(P.items()):
        yy = y + k * 0
    pos = 1472
    for q, (nm, nu, co) in P.items():
        ativo = q == c["quem"]
        d.rounded_rectangle((pos, y, pos + 96, y + 44), 22, fill=co if ativo else CARD, outline=co, width=2)
        t = nm.split()[0]; w = d.textlength(t, font=f("DejaVuSans-Bold.ttf", 17))
        d.text((pos + 48 - w / 2, y + 11), t, font=f("DejaVuSans-Bold.ttf", 17), fill="#0b110f" if ativo else co)
        pos += 106
    # Legenda: quem fala e a fala
    L = (32, 848, 1888, 1048)
    d.rounded_rectangle(L, 18, fill=CARD, outline=cor, width=3)
    d.rounded_rectangle((L[0], L[1], L[0] + 12, L[3]), 6, fill=cor)
    d.text((L[0] + 36, L[1] + 18), f"{nome.upper()}:", font=f("DejaVuSans-Bold.ttf", 26), fill=cor)
    fala = f("DejaVuSans.ttf", 29)
    linhas, atual = [], ""
    for p in c["fala"].split():
        teste = (atual + " " + p).strip()
        if d.textlength(teste, font=fala) > L[2] - L[0] - 72: linhas.append(atual); atual = p
        else: atual = teste
    linhas.append(atual)
    for k, l in enumerate(linhas[:4]):
        d.text((L[0] + 36, L[1] + 58 + k * 38), l, font=fala, fill=TXT)
    return im

lista = []
total = len(cenas)
for k, c in enumerate(cenas):
    caminho = f"{V}/ov_{k:02d}.png"; quadro(c, k + 1, total).save(caminho)
    ini = 0 if k == 0 else c["ini"]
    fim = cenas[k + 1]["ini"] if k + 1 < total else c["fim"]
    lista.append((caminho, fim - ini))
with open(V + "/lista.txt", "w") as arq:
    for c, d in lista: arq.write(f"file '{c}'\nduration {d:.3f}\n")
    arq.write(f"file '{lista[-1][0]}'\n")
dur = cenas[-1]["fim"]
saida = sys.argv[2]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", V + "/lista.txt", "-i", V + "/tela.webm",
  "-filter_complex", "[0:v]fps=30,format=yuv420p[bg];[1:v]fps=30,scale=1408:792:flags=lanczos[s];[bg][s]overlay=32:32[v]",
  "-map", "[v]", "-t", f"{dur:.2f}", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida], check=True)
print("ok", round(dur, 1), "s")
