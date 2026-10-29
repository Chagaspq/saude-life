# Roteiro da apresentação do TCC (cerca de 10 minutos)

O site tem muita coisa. Na banca, mostre **só este caminho**. O resto existe, mas só aparece se perguntarem.

## Antes de começar (5 minutos antes)

1. Abra o site e entre com **"Entrar na demonstração"** (tela de login).
2. Vá em **Perfil > Modo demonstração** e ligue **Modo apresentação**: o menu fica só com 7 páginas.
3. No mesmo painel, toque em **Encher com dados de exemplo**.
4. Deixe o tema escuro, o idioma em português e o volume do computador ligado.
5. Deixe uma segunda aba aberta na página inicial pública (`welcome`).

## O caminho (quem fala o quê)

| Tempo | Pessoa | Tela | O que mostrar e falar |
|---|---|---|---|
| 1 min | Pessoa 1 | Página inicial pública | O problema: as pessoas começam a treinar e desistem. A proposta: treino guiado + pontos + amigos. Marque uma série no card de exemplo. |
| 1 min | Pessoa 1 | Início (app) | Meta da semana, o Pulso (parceiro de treino) e o próximo treino sugerido. |
| 2 min | Pessoa 2 | Treinos > Iniciar treino | Marque 2 séries, mostre o descanso contando e os pontos voando. Termine o treino e mostre o resumo (calorias e comparação). |
| 1 min | Pessoa 2 | Alimentação | Adicione uma refeição e toque em +250 ml de água. |
| 1 min | Pessoa 2 | Evolução | Gráfico de peso e de treinos por semana. |
| 2 min | Pessoa 3 | Ranking | Liga, pódio e missões do dia. Volte ao Perfil, toque em **Fechar a semana** e mostre a liga mudando. |
| 1 min | Pessoa 3 | Comunidade | Feed dos amigos, reação e convite por link. |
| 1 min | Pessoa 3 | Fechamento (sem tela) | Planos (Free e Premium R$ 14,90), funciona no celular e sem internet, acessibilidade e 3 idiomas. Próximo passo: servidor e pagamento de verdade. |

## Perguntas que a banca pode fazer

- **Onde ficam os dados?** No navegador da pessoa (localStorage). Cada conta tem seus dados separados. O próximo passo é um servidor com banco de dados.
- **A senha é segura?** Ela é guardada como resumo (hash SHA-256), não o texto da senha.
- **O pagamento funciona?** É simulado (Pix e cartão). Nada é cobrado. Para vender, entraria um intermediário como Mercado Pago.
- **Os amigos são reais?** São simulados, para mostrar como funcionaria com várias pessoas.
- **E a LGPD?** Tem Termos de Uso e Política de Privacidade, e a pessoa pode baixar ou apagar os próprios dados no Perfil.
- **Por que HTML, CSS e JavaScript puro?** Para mostrar o domínio da base, sem depender de bibliotecas, e o site abre rápido até em celular simples.

## Se algo der errado

- Travou ou ficou estranho: **Perfil > Restaurar dados de exemplo** e recarregue a página.
- Sem internet: o site continua abrindo (funciona offline), só a fonte e o QR code podem mudar.
