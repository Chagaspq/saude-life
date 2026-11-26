# Prompt de melhoria visual do Saúde Life

Use este texto no Claude Design, no Figma ou com outro designer para gerar uma versão nova das telas.

---

Redesenhe as telas do **Saúde Life**, um app web de treino (MVP de TCC que será vendido depois). Público: pessoas comuns que treinam em academia ou em casa, e academias/personais que acompanham esses clientes.

**Identidade (não mudar):**
- Logo: anel com batimento cardíaco, degradê coral → esmeralda.
- Fundo verde-carvão `#0e1512`; cartões `#16211d` e `#1e2b25`; bordas `#263832`.
- Coral `#f0845a` (claro `#f5a37f`): **só** para a ação principal de cada tela (um botão por tela).
- Esmeralda `#4fc29a`: estados bons (meta batida, ativo), ícones de navegação do topo e tudo que é do acesso de administrador.
- Texto `#f4f1ea`, texto apagado `#a3b0a8`.
- Fontes: Barlow Semi Condensed (títulos) e Barlow (texto); Space Mono só em números grandes.

**Telas do cliente (só 5):** Início, Treinos, Alimentação, Evolução e Perfil.
**Telas do administrador (só 2):** Painel e Perfil. O admin precisa ser reconhecido em 1 segundo: selo **ADMIN** verde no topo, faixa verde fina em cima da tela e o título "Administração" no menu.

**Regras de visual:**
1. Visual limpo, estilo dashboard de SaaS: muito espaço em branco, no máximo 4 blocos por tela antes de rolar.
2. Cartões todos iguais: cantos de 16 px, espaço interno de 20 px, borda de 1 px, sem sombra pesada.
3. Um único botão coral por tela; os outros botões são "fantasma" (fundo do cartão, borda fina).
4. Ícones de traço fino (1,75 px), todos do mesmo estilo; nada de emoji.
5. Telas começam vazias: cada estado vazio tem um ícone, uma frase curta e um botão de ação.
6. Topo: botões redondos de 40 px no canto direito (exibição, notificações) e uma "pílula" com a foto e o nome. Notificações abrem num painel embaixo do sino, com um ícone por aviso.
7. Números grandes só nos cartões de resumo; o resto em texto normal.
8. Contraste AA, foco visível no teclado, áreas de toque de pelo menos 44 px, e tudo funcionando no celular (menu de baixo com 5 ícones).
9. Animações curtas (até 200 ms) e desligadas para quem pede menos movimento.

**Entregue:** as 5 telas do cliente e as 2 do administrador, no computador (1280 px) e no celular (390 px), mais um quadro com cores, fontes, botões, cartões, campos e ícones.

---

## O que já foi aplicado no site a partir deste prompt

- Topo com botões e pílula em esmeralda; contador de notificações verde.
- Coral só no botão principal; botões secundários "fantasma".
- Cartões e estados vazios padronizados.
