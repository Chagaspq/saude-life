# Gera a narração de cada cena e salva as durações em cenas.json
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
T="./"  # pasta com kokoro-v1.0.int8.onnx e voices-v1.0.bin
k=Kokoro(T+"kokoro-v1.0.int8.onnx",T+"voices-v1.0.bin")
# (fala para a voz, legenda na tela)
cenas=[
 ("Olá! Esta é a Mesa Negra, uma organização que combate a fome da população negra no Brasil, e valoriza a culinária afro-brasileira. Porque comida é direito, cultura e memória.",
  "Olá! Esta é a Mesa Negra, uma organização que combate a fome da população negra no Brasil e valoriza a culinária afro-brasileira."),
 ("No Brasil, a fome tem cor. Segundo a pesquisa da Rede Penssan, sessenta e cinco por cento dos lares chefiados por pessoas negras convivem com algum nível de insegurança alimentar. E a fome atinge dezoito por cento desses lares. Quase o dobro dos lares chefiados por pessoas brancas.",
  "No Brasil, a fome tem cor: 65% dos lares chefiados por pessoas negras convivem com insegurança alimentar, e 18,1% passam fome — quase o dobro dos lares brancos."),
 ("Nossa ideia é simples: servir um prato bom de verdade. Saboroso, nutritivo, e cheio de história. O foco é a população negra, mas a nossa mesa não fecha a porta para ninguém.",
  "Nossa ideia: servir um prato bom de verdade. O foco é a população negra, mas a nossa mesa não fecha a porta para ninguém."),
 ("Para isso, distribuímos refeições e cestas, apoiamos hortas comunitárias e agricultores quilombolas, fazemos oficinas de culinária, e resgatamos receitas tradicionais.",
  "Distribuímos refeições, apoiamos hortas e agricultores quilombolas, fazemos oficinas e resgatamos receitas tradicionais."),
 ("Acarajé, vatapá, feijoada, mungunzá. A culinária afro-brasileira está na mesa de todo o país. E ela merece ser valorizada.",
  "Acarajé, vatapá, feijoada, mungunzá: a culinária afro-brasileira está na mesa de todo o país."),
 ("Hoje, a Mesa Negra ainda está começando. Nosso plano tem quatro fases: planejar e escutar as comunidades, registrar a organização, abrir uma cozinha piloto, e só depois, crescer com responsabilidade.",
  "Nosso plano do zero: planejar e escutar, registrar a ONG, abrir uma cozinha piloto e só depois crescer com responsabilidade."),
 ("O dinheiro vem de doações, feijoadas solidárias, parcerias com o comércio do bairro, e editais. De cada cem reais, a nossa meta é que sessenta e cinco virem comida no prato.",
  "O dinheiro vem de doações, feijoadas solidárias, comércio do bairro e editais. Meta: de cada R$ 100, R$ 65 viram comida."),
 ("E a gente promete transparência: prestação de contas todo mês, nenhum salário para a equipe, e respeito total à dignidade de quem atendemos.",
  "Nosso compromisso: prestação de contas todo mês, nenhum salário para a equipe e respeito à dignidade de quem atendemos."),
 ("Você pode ajudar doando alimentos, sendo voluntário, ou divulgando o projeto. As doações em dinheiro vão abrir assim que a organização tiver registro e conta bancária própria.",
  "Ajude doando alimentos, sendo voluntário ou divulgando. Doações em dinheiro abrem quando a ONG tiver CNPJ e conta própria."),
 ("Mesa Negra. Comida é direito, cultura e memória. Puxe uma cadeira, e venha com a gente.",
  "Mesa Negra. Comida é direito, cultura e memória. Puxe uma cadeira e venha com a gente."),
]
PAUSA_ANTES, PAUSA_DEPOIS = 0.6, 0.9
audio=[]; info=[]; t=0.0; sr=24000
for i,(fala,leg) in enumerate(cenas):
    import os
    gravado=f"voz/cena{i+1}.wav"
    if os.path.exists(gravado):          # voz gravada pelo grupo tem prioridade
        s,sr=sf.read(gravado,dtype="float32")
    else:
        s,sr=k.create(fala,voice="pf_dora",speed=1.0,lang="pt-br")
        # iguala o volume da voz sintética ao das gravações (-17 LUFS)
        import pyloudnorm as pyln
        s=pyln.normalize.loudness(s,pyln.Meter(sr).integrated_loudness(s),-17.0)
        s=0.89*np.tanh(s/0.89)  # limitador suave, sem estalos
    dur=PAUSA_ANTES+len(s)/sr+PAUSA_DEPOIS
    audio += [np.zeros(int(PAUSA_ANTES*sr)), s, np.zeros(int(PAUSA_DEPOIS*sr))]
    info.append({"inicio":round(t,3),"dur":round(dur,3),"legenda":leg})
    t+=dur
sf.write("narracao.wav",np.concatenate(audio).astype(np.float32),sr)
json.dump(info,open("cenas.json","w"),ensure_ascii=False,indent=1)
print("total",round(t,1),"s"); [print(round(c["dur"],1)) for c in info]
