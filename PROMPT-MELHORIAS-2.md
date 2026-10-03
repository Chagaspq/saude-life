# Prompt: Saúde Life — rodada 2 (versão detalhada)

> Copie tudo a partir da linha abaixo e cole no Claude.
> Peça **uma parte por vez** ("faz a parte 0", depois "faz a parte 1"...).

---

## Contexto

Você vai continuar melhorando o **Saúde Life**, um site/app de fitness que é meu **TCC**. É feito em **HTML, CSS e JS puros**. O repositório é `chagaspq/saude-life` e a branch principal é `main`.

O objetivo desta rodada é fazer o site parecer um **produto profissional** (referências de nível: Strava, Nike Training Club, Apple Fitness, Linear), sem perder a identidade: tema escuro verde-carvão com coral e esmeralda.

### Estrutura atual

```
welcome/    landing page (welcome.html/.css)
planos/     página pública de planos
login/      login (login.html/.css/.js)
cadastro/   cadastro (cadastro.html/.css/.js)
senha/      recuperar senha (senha.*) e redefinir senha (redefinir.*)
termos/     termos de uso (termos.html)
politica/   política de privacidade (politica.html)
index/      app logado, tudo numa página só (index.html/.css/.js), views trocadas por #hash
shared/     arquivos compartilhados:
            site.css      header e footer públicos
            planos.css/js cards de planos com toggle mensal/anual
            form-utils.js validação de login e cadastro
            legal.css/js  visual de termos e política
            favicon.svg   ícone da aba
```

### Problema de base que precisa ser resolvido

Cada página define as cores com **nomes diferentes**:
- `welcome.css` usa `--coral`.
- `index.css` usa `--red` (que na verdade é coral).
- `login.css` usa `--color-primary`.
- `site.css` usa cores fixas em hex.

Os raios, espaçamentos e tamanhos de fonte também variam de página para página. Por isso a Parte 0 vem antes de tudo.

### Regras gerais (valem para todas as partes)

1. **Proibido:** frameworks, bibliotecas, CDNs de JS e **emojis** (no código, nos textos e nos comentários). Ícones são sempre SVG inline ou desenhados em CSS.
2. **Cores da marca (não mudar):** fundo `#0e1512`, superfície `#16211d`, borda `#263832`, texto `#f4f1ea`, texto secundário `#a3b0a8`, coral `#ff7a45` / `#ffa06b` / `#d85f2e`, esmeralda `#34d399` / `#1f9c6f`.
3. **Fontes:** Space Grotesk (títulos, números) e Inter (texto, botões, formulários).
4. **Botões coral sempre com texto `#14100c`.** Texto branco no coral não passa no contraste AA.
5. **Não perder dados:** manter as chaves do `localStorage` (`sl-conta`, `sl-sessao`, `sl-perfil`, `sl-treinos`, `sl-salvos`, `sl-seguindo`, `sl-reservas`, `sl-pref-notif`).
6. **Não remover conteúdo** sem eu aprovar. Se for trocar uma seção, mostre antes e depois.
7. **Acessibilidade mínima:** foco visível, `aria-label` em botões só com ícone, `prefers-reduced-motion` respeitado, contraste AA e um `<h1>` por página.
8. **Responsivo:** sem scroll horizontal em 360px, 768px e 1280px.
9. **Comentários no código em português**, curtos, explicando o porquê, não o óbvio.

### Como entregar cada parte

Ao terminar cada parte:
1. Mostre **prints** das páginas alteradas no desktop (1280px) e no celular (375px).
2. Liste os **arquivos criados, alterados e removidos**.
3. Diga o que **testou** e como.
4. Faça **commit e push** com uma mensagem clara (ex.: `Parte 1: corrige campos de senha e card do login`).
5. **Pare e espere minha aprovação** antes da próxima parte.

---

## Parte 0 — Design system único (base de tudo)

Crie `shared/tokens.css` com **todas** as variáveis do projeto. Depois faça todas as páginas usarem esse arquivo.

### 0.1 Tokens

```css
:root {
  /* Cores */
  --bg: #0e1512;
  --surface: #16211d;
  --surface-2: #1e2b25;
  --surface-3: #24352e;
  --border: #263832;
  --border-strong: #35503f;
  --ink: #f4f1ea;
  --ink-strong: #ffffff;
  --muted: #a3b0a8;
  --muted-2: #8a968f;

  --coral: #ff7a45;
  --coral-light: #ffa06b;
  --coral-dark: #d85f2e;
  --coral-soft: rgba(255, 122, 69, 0.1);
  --coral-ring: rgba(255, 122, 69, 0.35);

  --emerald: #34d399;
  --emerald-dark: #1f9c6f;
  --emerald-soft: rgba(52, 211, 153, 0.12);

  --warning: #e09f3e;
  --on-coral: #14100c;

  --gradient-brand: linear-gradient(135deg, var(--coral), var(--emerald));
  --gradient-button: linear-gradient(180deg, var(--coral-light), var(--coral) 70%);

  /* Tipografia */
  --font-display: "Space Grotesk", "Inter", sans-serif;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --text-xs: 12px;
  --text-sm: 13.5px;
  --text-base: 15px;
  --text-lg: 17px;
  --text-xl: 20px;
  --text-2xl: 26px;
  --text-3xl: clamp(30px, 4.5vw, 44px);
  --text-hero: clamp(36px, 5.5vw, 58px);

  /* Espaçamento (escala de 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Raios */
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 999px;

  /* Sombras */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 12px 28px rgba(0, 0, 0, 0.35);
  --shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.5);
  --shadow-coral: 0 12px 28px rgba(255, 122, 69, 0.28);

  /* Movimento */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 150ms;
  --dur-base: 200ms;
}
```

### 0.2 Base comum

Crie `shared/base.css` com: reset (`box-sizing`, margens), `body` (fundo, fonte, `-webkit-font-smoothing`), títulos com `--font-display`, foco visível padrão (`:focus-visible { outline: 2px solid var(--coral); outline-offset: 3px; }`), a classe `.sr-only` e o bloco global de `prefers-reduced-motion`.

### 0.3 Migração

- Todas as páginas carregam, nesta ordem: Google Fonts → `shared/tokens.css` → `shared/base.css` → CSS da página.
- Substitua os nomes antigos pelos novos: `--red` → `--coral`, `--color-primary` → `--coral`, `--surface-border` → `--border`, `--success` → `--emerald`. Os hex fixos do `site.css` e do `legal.css` passam a usar os tokens.
- Remova o `@import` de fontes de dentro dos CSS (a fonte vem só pelo `<link>` no HTML).
- **Nada pode mudar visualmente** nesta parte. É só organização. Compare os prints de antes e depois.

**Pronto quando:** `grep` não encontra mais `--red`, `--color-primary` nem `--surface-border` em nenhum CSS, e os prints de antes e depois são iguais.

---

## Parte 1 — Login, cadastro e senha (correções e acabamento)

O login precisa parecer cuidado sem exagero: **sóbrio**, sem animações chamativas.

### 1.1 Dois ícones de olho no campo de senha

**Causa:** o Edge (e o Chrome em alguns casos) mostra um botão nativo de revelar senha, além do nosso `.toggle-password`.

**Correção** em `login.css`, `cadastro.css` e `senha.css` (ou, melhor, no `shared/base.css`):

```css
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}
```

### 1.2 Fundo branco quando o navegador preenche o e-mail

**Causa:** o `:-webkit-autofill` do navegador pinta o campo de branco ou azul claro.

**Correção** para todos os inputs de autenticação:

```css
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--ink);
  box-shadow: 0 0 0 1000px var(--surface-2) inset;
  caret-color: var(--ink);
  transition: background-color 9999s;
}
```

### 1.3 Cantos retos no card de login e cadastro

**Causa:** `.auth-container` usa `border-image`, que **ignora o `border-radius`**.

**Correção:** remova o `border-image` e faça a faixa colorida do topo com um pseudo-elemento:

```css
.auth-container {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.auth-container::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--gradient-brand);
}
```

### 1.4 Linha vertical dentro dos campos

Entre o ícone e o texto aparece uma emenda, como se fosse uma segunda caixa. O `<input>` precisa ficar com `background: transparent; border: 0;`, e **só o `.input-wrapper`** desenha a borda e o fundo. Confira também os estados de autofill e de erro.

### 1.5 Acabamento

- **Caps Lock:** mostrar o aviso "Caps Lock ativado" abaixo do campo de senha, usando `event.getModifierState("CapsLock")`.
- **Mensagens de erro:** ícone SVG pequeno + texto, cor `--warning`, `role="alert"`.
- **Botões Google e Apple:** como não funcionam de verdade, ao clicar mostram o toast "Login social disponível em breve". Ou podemos removê-los; me pergunte antes.
- **Cadastro:** o medidor de força da senha ganha 3 segmentos (fraca, média, forte) em vez de uma barra contínua, com o texto da força ao lado.
- **Padronizar** login, cadastro, recuperar senha e redefinir senha: mesmo card, mesma largura (420px), mesmos espaçamentos, mesma logo.
- **Números do login** ("12k+ treinos", "500+ profissionais", "4.9"): manter, alinhados com o mesmo estilo da Parte 3.

**Pronto quando:**
- Só aparece um olho no Edge e no Chrome.
- O autofill fica escuro.
- O card tem cantos arredondados e uma faixa colorida no topo.
- Não há emenda dentro dos campos.
- As 4 telas têm o mesmo visual.

---

## Parte 2 — App separado em páginas (uma por seção)

Hoje tudo está em `index/index.html`, e o `index.js` tem cerca de 900 linhas. Quero **uma página HTML por item do menu**.

### 2.1 Estrutura nova

```
app/
  inicio.html
  descobrir.html
  treinos.html
  aulas.html
  alimentacao.html
  evolucao.html
  profissionais.html
  planos.html
  salvos.html
  academia.html
  perfil.html
  app.css            layout (sidebar, topbar, grid), cards, botões, modal, toast, skeleton
  js/
    core.js          storage, el(), toast, modal, sidebar mobile, busca, usuário, logout, guarda de sessão
    dados.js         CATALOGO, PROFISSIONAIS, AULAS, TREINOS_PADRAO, EVOLUCAO
    componentes.js   cardTreino(), cardProfissional(), estadoVazio(), skeleton(), grafico()
    paginas/
      inicio.js  descobrir.js  treinos.js  aulas.js  alimentacao.js
      evolucao.js  profissionais.js  planos.js  salvos.js  academia.js  perfil.js
```

### 2.2 Como cada página funciona

- **Esqueleto HTML igual em todas:** sidebar + topbar + `<main id="conteudo">` + modal + toast + footer. Só o miolo do `<main>` muda.
- **Página ativa:** cada HTML tem `<body data-pagina="treinos">`. O `core.js` marca o link da sidebar correspondente com `class="active"` e `aria-current="page"`.
- **Links:** a sidebar usa links normais (`treinos.html`), sem `#hash`.
- **Ordem dos scripts:** `dados.js` → `core.js` → `componentes.js` → `paginas/<nome>.js`. Cada página carrega só o JS dela.
- **Guarda de sessão:** sem `sl-sessao` no `localStorage`, o `core.js` redireciona para `../login/login.html?voltar=<página>`. Depois do login, voltar para a página pedida.
- **Busca da topbar:** os resultados levam para a página certa (`profissionais.html`, `aulas.html`...).

### 2.3 O que tem em cada página

| Página | Conteúdo |
|---|---|
| Início | Saudação com nome e data, "Continue seu treino", recomendados, desafio ativo, resumo da semana (4 números) |
| Descobrir | Filtros (objetivo, nível, duração, grupo), chips de categoria, grid de treinos com salvar |
| Treinos | Lista dos meus treinos, criar, editar, excluir, botão "Iniciar" |
| Aulas | Grade da semana, reservar e cancelar, vagas restantes |
| Alimentação | Macros com barras, refeições do dia, adicionar refeição (modal), meta de água com botão "+250 ml" |
| Evolução | Gráfico de peso, gráfico de carga, seletor de período (4, 8 e 12 semanas), registrar novo peso |
| Profissionais | Filtro por especialidade, cards, seguir, modal com o perfil do profissional |
| Planos | Componente `shared/planos.js` com o plano atual marcado |
| Salvos | Treinos salvos ou estado vazio com botão para Descobrir |
| Academia | Indicadores, ocupação por horário, avisos |
| Perfil | Dados, bio, estatísticas, editar perfil, preferências, sair |

### 2.4 Migração segura

1. Criar `app/` sem mexer no `index/`.
2. Testar todas as páginas.
3. Atualizar os redirecionamentos: login → `../app/inicio.html`.
4. Trocar `index/index.html` por um redirecionamento para `../app/inicio.html` (para links antigos continuarem funcionando).
5. Só depois da minha aprovação, apagar o resto da pasta `index/`.

**Pronto quando:**
- As 11 páginas abrem sem erro no console.
- O item ativo do menu está correto em todas.
- Os dados salvos antes continuam aparecendo.
- Sem login, as páginas redirecionam para o login.
- No celular, o menu abre e fecha em todas as páginas.

---

## Parte 3 — Welcome mais profissional

### 3.1 Nova ordem das seções

1. **Header** (já existe, `shared/site.css`).
2. **Hero:** manter o título "Progresso de verdade, no seu ritmo." Ao lado, em vez de só a animação de pulso, mostrar um **mockup do app** feito em HTML/CSS: um card "Treino de hoje", um mini gráfico de evolução e um anel de meta semanal. A animação de pulso pode ficar atrás, como decoração.
3. **Faixa de números:** "12 mil treinos registrados", "500 profissionais verificados", "4,9 de avaliação média". Tipografia grande em Space Grotesk, com divisores finos.
4. **Recursos (substitui a seção "Você não precisa fazer isso sozinho"):** grid de 4 blocos com ícone SVG, título e uma frase:
   - *Treinos guiados*: séries, cargas e descanso, passo a passo.
   - *Evolução visível*: gráficos de peso e carga semana a semana.
   - *Profissionais verificados*: personal, nutricionista e fisioterapeuta.
   - *Aulas na academia*: reserve sua vaga sem fila.
5. **Como funciona:** a seção atual "Do primeiro clique ao primeiro resultado", com os passos 1, 2 e 3 mantidos.
6. **Profissionais:** faixa compacta com os 4 profissionais atuais (avatar, nome, especialidade, nota), em formato de linha horizontal com scroll no celular. Não é mais a seção principal.
7. **Depoimentos:** 3 cards curtos com nome, objetivo e frase. Exemplos:
   - "Perdi 6 kg em 3 meses e, pela primeira vez, entendi meu progresso." Camila, 27, emagrecimento
   - "Os treinos se adaptam à minha rotina de trabalho." Diego, 34, hipertrofia
   - "Minha nutricionista acompanha tudo pelo app." Larissa, 22, saúde
8. **Perguntas frequentes:** accordion com `<details>` e `<summary>`, sem JS:
   - O Saúde Life é gratuito? *Sim, o plano Free é gratuito para sempre. Os planos pagos liberam recursos extras.*
   - Preciso ir à academia? *Não. Há treinos para casa, sem equipamento.*
   - Os profissionais são verificados? *Sim, conferimos o registro profissional (CREF, CRN, CREFITO).*
   - Posso cancelar quando quiser? *Sim, sem multa e sem fidelidade.*
   - Meus dados de saúde ficam seguros? *Sim, veja nossa Política de Privacidade.* (com link)
   - Funciona no celular? *Sim, o site se adapta a qualquer tela.*
9. **CTA final:** "Seu primeiro treino começa hoje." com os botões "Criar conta grátis" e "Ver planos".
10. **Footer** (já existe).

### 3.2 Detalhes visuais

- Espaço vertical entre seções: `--space-24` no desktop e `--space-16` no celular.
- Títulos de seção com um "kicker" pequeno em esmeralda acima (ex.: "RECURSOS", "DEPOIMENTOS").
- Entrada suave das seções ao rolar, com `IntersectionObserver` e no máximo 250ms, desligada com `prefers-reduced-motion`.
- Largura máxima do conteúdo: 1200px, centralizado.

**Pronto quando:** o welcome tem as 10 seções acima, fica bom em 360px e 1280px, não tem emojis e o FAQ funciona só com teclado.

---

## Parte 4 — Polimento geral (todas as páginas)

### 4.1 Ícones no menu do app

Um SVG de 18px antes de cada item, todos com o mesmo estilo (traço 2px, `stroke-linecap: round`, sem preenchimento):

| Item | Ícone |
|---|---|
| Início | casa |
| Descobrir | bússola |
| Treinos | haltere |
| Aulas | calendário |
| Alimentação | maçã |
| Evolução | gráfico de linha subindo |
| Profissionais | duas pessoas |
| Planos | cartão/etiqueta |
| Salvos | marcador |
| Academia | prédio |
| Perfil | pessoa |

### 4.2 Microtextos

- Botões com verbos claros: "Salvar treino", "Reservar vaga", "Começar agora".
- Datas em português e no formato do Brasil (`toLocaleDateString("pt-BR")`).
- Saudação conforme o horário: "Bom dia", "Boa tarde" ou "Boa noite".

### 4.3 Páginas novas

- **`404.html`** na raiz: logo, título "Página não encontrada", texto curto e botão "Voltar ao início". Mesmo visual do site.
- **`index.html` na raiz**, redirecionando para `welcome/welcome.html`. Assim, quem abrir o projeto cai na página certa.

### 4.4 Qualidade técnica

- Em cada página: `<meta name="description">`, `<title>` próprio e as tags Open Graph (`og:title`, `og:description`, `og:image`) para ficar bonito quando o link é compartilhado no WhatsApp.
- `preconnect` nas Google Fonts e `display=swap` (já existe, só conferir).
- Nada de `style=""` no HTML.
- Nenhum `console.log` esquecido.
- Validar o HTML (sem tags abertas ou ids duplicados).

### 4.5 Teste final

| Teste | Esperado |
|---|---|
| Fluxo completo: welcome → cadastro → login → app → criar treino → recarregar → sair | Funciona sem erros no console |
| Só teclado (Tab, Shift+Tab, Enter, Esc) | Dá para usar tudo |
| 360px, 768px e 1280px | Sem scroll horizontal |
| `prefers-reduced-motion` ligado | Sem animações |
| Chrome e Edge | Mesmo resultado |

---

## Parte 5 — Nova logo (no Claude Design)

### 5.1 Briefing

- **Marca:** Saúde Life.
- **Personalidade:** confiável, moderna, motivadora, sem ser agressiva (nada de "academia raiz" com caveira ou fogo).
- **Ideia central:** **saúde + evolução contínua**.
- **Onde vai aparecer:** favicon (16 e 32px), header do site, sidebar do app, card do login e imagem de compartilhamento.
- **Fundo principal:** escuro (`#0e1512`), mas a logo precisa funcionar também no claro.

### 5.2 Três conceitos para explorar (um artboard para cada)

1. **Pulso que vira seta:** uma linha de batimento cardíaco que, no último pico, vira uma seta subindo em diagonal. Mostra que a saúde está melhorando. Traço contínuo, pontas arredondadas.
2. **Monograma SL:** o "S" desenhado como uma linha de pulso e o "L" como base firme, dentro de um quadrado de cantos bem arredondados (raio de cerca de 28% do lado). Funciona bem como ícone de app.
3. **Folha com batimento:** uma folha simples (bem-estar, vida) cuja nervura central é uma linha de pulso. É mais "saúde" e menos "academia".

### 5.3 Regras de desenho

- Grid de 48×48 com área segura de 4px.
- Traço entre 4 e 4,5px no tamanho de 48px.
- Pontas e junções arredondadas.
- Legível em 16px: testar o favicon de verdade.
- **Cores:** degradê coral `#ff7a45` → esmeralda `#34d399` (diagonal, de baixo à esquerda para cima à direita), com versões chapadas em coral, branca e escura.
- **Wordmark:** "Saúde Life" em Space Grotesk 700, com espaçamento entre letras levemente negativo (-0,01em). O acento do "ú" precisa ficar visível em tamanho pequeno.

### 5.4 Entregáveis (SVG otimizado, sem texto convertido em imagem)

- `logo.svg`: ícone + nome, na horizontal.
- `logo-icone.svg`: só o ícone.
- `logo-icone-app.svg`: ícone dentro do quadrado arredondado de fundo `#0e1512`.
- `logo-mono-branca.svg` e `logo-mono-escura.svg`.
- `favicon.svg`: substitui o atual em `shared/`.
- `og-image.png` (1200×630): logo + frase "Progresso de verdade, no seu ritmo." no fundo escuro, para a tag `og:image`.

### 5.5 Aplicação no site (depois da minha escolha)

- Guardar os arquivos em `shared/logo/`.
- Trocar a logo em **todas** as páginas: header público, sidebar do app, cards de login, cadastro e senha, footer e favicon.
- O degradê do SVG não pode depender de um `id` repetido na mesma página (hoje o `logo-gradient` aparece duplicado em algumas páginas). Usar `<img src="...svg">` ou ids únicos.

---

## Ordem sugerida

**0 → 1 → 2 → 3 → 4 → 5**

A logo (5) pode ser feita em paralelo no Claude Design a qualquer momento, mas só é **aplicada** no site depois que eu escolher.
