# Prompt: Saúde Life — rodada 2 (deixar mais profissional)

> Copie tudo abaixo e cole no Claude. Faça **uma parte por vez**: termine,
> mostre a prévia, espere minha aprovação e só então siga para a próxima.

---

Você vai continuar melhorando o **Saúde Life**, um site/app de fitness feito em HTML, CSS e JS puros (sem frameworks, sem bibliotecas, sem emojis no código). É um TCC. O objetivo agora é deixar o site com cara de **produto profissional**, sem perder a identidade.

## Identidade visual (manter)

- Tokens: `--bg:#0e1512; --surface:#16211d; --surface-border:#263832; --ink:#f4f1ea; --muted:#a3b0a8; --coral:#ff7a45; --coral-light:#ffa06b; --emerald:#34d399`
- Fontes: **Space Grotesk** nos títulos e **Inter** no texto.
- Botões coral sempre com texto escuro (`#14100c`), por causa do contraste.
- Arquivos compartilhados ficam em `shared/` (`site.css`, `planos.*`, `form-utils.js`, `legal.*`, `favicon.svg`). Reaproveite esses arquivos, não duplique código.

## Parte 1 — Correções visuais no login e no cadastro

1. **Dois ícones de olho no campo de senha.** O Edge/Chrome mostra o botão nativo de "revelar senha" junto do nosso botão. Esconda o nativo no `login.css`, `cadastro.css` e `senha.css`:
   ```css
   input[type="password"]::-ms-reveal,
   input[type="password"]::-ms-clear { display: none; }
   ```
2. **Fundo branco no autofill.** O e-mail preenchido automaticamente fica com fundo branco no login. Aplique o mesmo tratamento de `-webkit-autofill` que já existe no `cadastro.css` (fundo escuro via `box-shadow` inset e `-webkit-text-fill-color`).
3. **Cantos quadrados no card.** A borda em degradê usa `border-image`, que ignora o `border-radius`, por isso os cantos ficam retos. Troque por um pseudo-elemento (`::before` com `mask`) ou por um `background` em duas camadas, para a borda acompanhar o arredondamento.
4. **Linha dentro dos inputs.** Existe uma emenda vertical entre o ícone e o texto. O input interno precisa ter fundo e borda transparentes, e o wrapper deve cuidar da borda.
5. Revisar também `senha.html` e `redefinir.html`, que usam o mesmo padrão.

## Parte 2 — Separar o app em páginas (uma por seção)

Hoje o `index/index.html` tem todas as seções juntas (Início, Descobrir, Treinos, Aulas, Alimentação, Evolução, Profissionais, Planos, Salvos, Academia, Perfil) e troca entre elas por `#hash`. Quero **uma página por seção**, para organizar melhor:

```
app/
  inicio.html        descobrir.html     treinos.html
  aulas.html         alimentacao.html   evolucao.html
  profissionais.html planos.html        salvos.html
  academia.html      perfil.html
  app.css            (layout, sidebar, topbar, cards — comum a todas)
  app.js             (sidebar, menu mobile, busca, modal, toast, usuário, storage)
  dados.js           (catálogo, profissionais, aulas, evolução)
  paginas/<nome>.js  (só o código daquela página)
```

- A sidebar e a topbar ficam iguais em todas as páginas. O item ativo usa `aria-current="page"`, definido pelo nome da página.
- Os links da sidebar viram links normais (`treinos.html`), sem `#hash`.
- Atualizar os redirecionamentos: login → `../app/inicio.html` e logout → `../login/login.html`.
- Manter o `localStorage` com as mesmas chaves (`sl-sessao`, `sl-treinos`, `sl-salvos`, etc.) para ninguém perder dados.
- Proteger as páginas: sem `sl-sessao`, redirecionar para o login.
- Apagar `index/` só no final, depois de testar todas as páginas.

## Parte 3 — Welcome mais profissional

1. **Trocar a seção "Você não precisa fazer isso sozinho".** Os 4 cards de profissionais parecem genéricos. Opções (escolher uma ou combinar):
   - **Prévia do app:** um mockup em HTML/CSS do painel (card de treino, gráfico de evolução e metas), mostrando o produto de verdade.
   - **Recursos em destaque:** 3 ou 4 blocos com ícone SVG (Treinos guiados, Evolução em gráficos, Profissionais verificados, Aulas na academia).
   - **Números e prova social:** treinos registrados, profissionais e avaliação média, mais 2 ou 3 depoimentos curtos.
   - Os profissionais podem continuar, mas como uma faixa menor, sem ser a seção principal.
2. Adicionar uma seção de **Perguntas frequentes** (accordion com `<details>`/`<summary>`, sem JS).
3. Revisar textos, espaçamentos e ritmo vertical para ficar no nível de um SaaS (por exemplo Strava, Nike Training, Apple Fitness).

## Parte 4 — Polimento geral (todas as páginas)

- Escala tipográfica e espaçamentos consistentes, com tokens como `--space-1..8` e `--text-sm..3xl` no `shared/site.css`.
- Ícones SVG consistentes em toda a sidebar (um ícone por item do menu).
- Botões "Google" e "Apple": deixar claro que são demonstração (toast "Em breve") ou remover.
- Página 404 simples com a logo e um botão "Voltar ao início".
- Testar em 360px, 768px e 1280px, com teclado (Tab e Esc) e com `prefers-reduced-motion`.

## Parte 5 — Nova logo (no Claude Design)

Crie a logo como **SVG** no Claude Design, com estas regras:

- **Conceito:** saúde + evolução. Ideias para testar:
  1. **Pulso que vira seta:** a linha de batimento cardíaco termina em uma seta subindo (progresso).
  2. **Monograma "SL":** o S formado por uma linha de pulso e o L como base estável, dentro de um quadrado arredondado.
  3. **Folha + batimento:** uma folha (vida, bem-estar) com o pulso cortando a nervura central.
- **Cores:** degradê coral `#ff7a45` → esmeralda `#34d399`, com versões monocromáticas (branca e escura).
- **Formato:** ícone sozinho (favicon, 32px legível) e ícone + texto "Saúde Life" em Space Grotesk.
- **Entregáveis:** `logo.svg`, `logo-icone.svg`, `logo-mono-branca.svg` e `favicon.svg` (substituir o de `shared/`).
- Depois de aprovada, trocar a logo em todas as páginas de uma vez, de preferência deixando o SVG em um só lugar.

## Regras

- Uma parte por vez, nesta ordem: 1 → 2 → 3 → 4 → 5.
- Ao fim de cada parte: mostrar a prévia (prints) e listar os arquivos alterados.
- Não usar frameworks, bibliotecas nem emojis.
- Não perder conteúdo nem dados salvos.
