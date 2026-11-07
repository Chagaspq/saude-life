# Roteiro da apresentação do TCC (cerca de 10 minutos)

O Saúde Life agora é um **MVP**: poucas telas, tudo começa zerado e só mostra o que o próprio usuário registrou.
Existem dois acessos: **cliente** (quem treina) e **administrador** (academia ou personal).

## Antes de começar (5 minutos antes)

1. Abra o site, vá em **Entrar** e toque em **Demonstração: cliente**. Essa conta já entra com 3 semanas de treinos de exemplo.
2. Em outra aba, abra a página inicial pública (`welcome`).
3. Deixe o tema escuro, o idioma em português e o volume ligado.

## O caminho (quem fala o quê)

| Tempo | Pessoa | Tela | O que mostrar e falar |
|---|---|---|---|
| 1 min | Pessoa 1 | Página inicial pública | O problema: as pessoas começam a treinar e desistem. A proposta: treino guiado, pontos e acompanhamento de quem entende. |
| 1 min | Pessoa 1 | Criar conta | Mostre a escolha **Sou cliente** ou **Sou administrador** (não precisa terminar o cadastro). |
| 1 min | Pessoa 2 | Início (cliente) | Só 5 abas: Início, Treinos, Alimentação, Evolução e Perfil. Meta da semana, pontos e próximo treino. |
| 2 min | Pessoa 2 | Treinos > Iniciar treino | Marque 2 séries, mostre o descanso e os pontos. Termine e mostre o resumo. |
| 1 min | Pessoa 2 | Alimentação e Evolução | Adicione uma refeição e um copo d'água. Na Evolução, o gráfico de treinos por semana. |
| 1 min | Pessoa 3 | Perfil > Sair da conta | Volte ao login e toque em **Demonstração: administrador**. |
| 2 min | Pessoa 3 | Painel do administrador | Destaque o **selo ADMIN** e a faixa verde. Mostre o cliente de demonstração e quanto ele treinou. Toque em **Mandar treino**, monte um treino e envie. Publique um aviso. |
| 1 min | Pessoa 3 | Fechamento | Entre de novo como cliente e mostre o aviso no Início e o treino recebido em Treinos. Próximo passo: servidor, pagamento e mais telas. |

## O que muda entre cliente e administrador

| | Cliente | Administrador |
|---|---|---|
| Páginas | Início, Treinos, Alimentação, Evolução e Perfil | Painel do administrador e Perfil |
| Treinos | Registra os próprios treinos | Monta e manda treinos para os clientes |
| Dados | Vê só os próprios dados | Vê os clientes e quanto cada um treinou |
| Avisos | Recebe os avisos no Início | Publica avisos para todos os clientes |
| Marca na tela | Nenhuma | Selo ADMIN no topo e faixa verde |

Essa mesma tabela aparece no **Perfil** de cada conta.

## Perguntas que a banca pode fazer

- **Que tecnologia vocês usaram?** React 18 com Vite. Cada tela é um componente React; as peças que se repetem (casco do app, janelas, cartões, formulários) são componentes reutilizados. O Vite gera o site pronto na pasta `docs/`, que o GitHub Pages publica.

- **Onde ficam os dados?** No navegador (localStorage), separados por conta. Por isso o administrador só vê os clientes cadastrados no mesmo aparelho. O próximo passo é um servidor com banco de dados.
- **Por que as telas começam vazias?** Porque é um MVP: nada é inventado, tudo vem do que o usuário registra.
- **Qualquer um pode criar conta de administrador?** No MVP sim, para facilitar a demonstração. Com servidor, a conta de administrador seria liberada só para academias e personais verificados.
- **A senha é segura?** Ela é guardada como resumo (hash SHA-256), não o texto da senha.
- **E a LGPD?** Tem Termos de Uso e Política de Privacidade, e a pessoa pode baixar ou apagar os próprios dados no Perfil.

## Se algo der errado

- Travou: recarregue a página.
- Quer recomeçar uma conta: **Perfil > Apagar meus dados**.
