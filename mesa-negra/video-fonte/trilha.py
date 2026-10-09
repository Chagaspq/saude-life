# Trilha original gerada por código (sem direitos autorais):
# base de acordes suave + percussão leve inspirada em ritmos afro-brasileiros.
import numpy as np, soundfile as sf, json
SR=44100
cenas=json.load(open('cenas.json'))
TOTAL=cenas[-1]['inicio']+cenas[-1]['dur']+0.5
N=int(TOTAL*SR); t=np.arange(N)/SR
BPM=92; BEAT=60/BPM; BAR=4*BEAT
rng=np.random.default_rng(7)
mix=np.zeros(N)

def nota(f): return 440*2**((f-69)/12)
# progressão: Am9 - Fmaj7 - C - G6 (calorosa, sem tristeza)
acordes=[[57,60,64,67,71],[53,57,60,64,69],[48,55,60,64,67],[55,59,62,64,67]]
# pad: senos com leve desafinação, ataque e soltura lentos
pad=np.zeros(N)
nbar=int(TOTAL/BAR)+1
for b in range(nbar):
    ac=acordes[b%4]; ini=int(b*BAR*SR); fim=min(N,int((b+1)*BAR*SR)+int(0.8*SR))
    if ini>=N: break
    tt=np.arange(fim-ini)/SR
    env=np.minimum(1,tt/1.2)*np.minimum(1,np.maximum(0,(BAR+0.8-tt)/1.0))
    s=np.zeros(fim-ini)
    for m in ac:
        f=nota(m)
        for d in (-0.15,0.15): s+=np.sin(2*np.pi*f*(1+d/100)*tt)+0.25*np.sin(2*np.pi*2*f*tt)
    pad[ini:fim]+=s*env/len(ac)
mix+=0.22*pad
# baixo: fundamental do acorde em semínimas pontuadas
for b in range(nbar):
    raiz=acordes[b%4][0]-12
    for pos in (0,1.5,2.5):
        ini=int((b*BAR+pos*BEAT)*SR)
        if ini>=N: continue
        L=int(0.5*SR); tt=np.arange(min(L,N-ini))/SR
        mix[ini:ini+len(tt)]+=0.30*np.sin(2*np.pi*nota(raiz)*tt)*np.exp(-tt*5)
# percussão: tambor grave (estilo atabaque/djembê) e ganzá
def tambor(ini,f0,amp):
    L=int(0.35*SR); tt=np.arange(min(L,N-ini))/SR
    f=f0*(1+1.2*np.exp(-tt*30))
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*14)+0.15*rng.standard_normal(len(tt))*np.exp(-tt*60)
    mix[ini:ini+len(tt)]+=amp*s
def ganza(ini,amp):
    L=int(0.09*SR); tt=np.arange(min(L,N-ini))/SR
    ruido=rng.standard_normal(len(tt)); ruido=np.diff(np.r_[0,ruido])   # puxa para os agudos
    mix[ini:ini+len(tt)]+=amp*ruido*np.exp(-tt*45)
padrao_tambor=[(0,95,.55),(1.5,95,.35),(2,140,.4),(2.75,140,.28),(3.5,110,.3)]
for b in range(nbar):
    entrada = b>=1          # percussão entra depois do primeiro compasso
    for k in range(8):
        ini=int((b*BAR+k*BEAT/2)*SR)
        if ini<N and entrada: ganza(ini,0.05 if k%2 else 0.08)
    if entrada:
        for pos,f,a in padrao_tambor:
            ini=int((b*BAR+pos*BEAT)*SR)
            if ini<N: tambor(ini,f,a)
# fade in / out
fade=np.ones(N); fi=int(2*SR); fo=int(4*SR)
fade[:fi]=np.linspace(0,1,fi); fade[-fo:]=np.linspace(1,0,fo)
mix*=fade
mix/=np.max(np.abs(mix))*1.05
sf.write('trilha.wav',np.stack([mix,mix],1).astype(np.float32),SR)
print('trilha',round(TOTAL,1),'s')
