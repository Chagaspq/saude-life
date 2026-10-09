# Vídeo da Mesa Negra — arquivos-fonte

O vídeo pronto é `../mesa-negra-video.mp4` (1080p, cerca de 1min54s).

Para editar:
1. **Texto da narração e das legendas:** em `narrar.py`, na lista `cenas`.
   Cada item tem (fala da voz, legenda na tela).
2. **Visual das cenas:** em `video.html`, uma `<section>` por cena, na mesma ordem.
3. **Gerar de novo:**
   - `pip install kokoro-onnx soundfile` e baixe `kokoro-v1.0.int8.onnx` e `voices-v1.0.bin`
     (github.com/thewh1teagle/kokoro-onnx, release "model-files-v1.0") para esta pasta;
   - `python3 narrar.py` (gera `narracao.wav` e `cenas.json`, e cole o novo `cenas.json` no `video.html`);
   - `node gravar.js` (gera os quadros na pasta `q/`);
   - `ffmpeg -framerate 30 -i q/%05d.jpg -i narracao.wav -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -shortest video.mp4`

Voz: "pf_dora" (feminina, português do Brasil), do modelo aberto Kokoro.

## Voz gravada pelo grupo
As falas gravadas (já tratadas: sem ruído, volume uniforme) ficam em `voz/cena1.wav` … `voz/cena10.wav`.
Quando existe o arquivo de uma cena, o `narrar.py` usa a gravação no lugar da voz do computador.

## Edição completa (versão final)
- `trilha.py` gera a trilha original (acordes + percussão) em `trilha.wav`.
- Mistura com a voz, abaixando a música quando alguém fala:
  `ffmpeg -i narracao.wav -i trilha.wav -filter_complex "[0]aresample=44100,aformat=channel_layouts=stereo,asplit=2[voz][sc];[1]volume=0.32,lowpass=f=9000[mus];[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=600[musd];[voz][musd]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5" mix_final.wav`
- O `video.html` tem transições kente, números contando, legenda karaokê, ondas de voz,
  capítulos, "Você sabia?" e QR Code do site no final. As ondas usam `niveis.json`
  (volume da voz por quadro) embutido no próprio HTML.
