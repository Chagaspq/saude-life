# Prompt: melhorias do Saúde Life

> Copie tudo abaixo e cole no Claude (ou no Claude Design).

---

Você vai melhorar o **Saúde Life**, um site/app de fitness feito em HTML, CSS e JS puros, sem frameworks e sem bibliotecas. É um projeto escolar. Ele tem estas páginas, cada uma na sua pasta:

- `welcome/` – landing page (é o **padrão visual** de todo o projeto)
- `login/`, `cadastro/`, `esqueci senha/` – autenticação
- `planos/` – página de planos
- `termos/`, `Política/` – textos legais
- `index/` – o app logado (sidebar, topbar e várias "views": início, descobrir, treinos, perfil, profissionais, evolução, alimentação, planos, academia, aulas, salvos)

## Identidade visual (não mudar)

Use os tokens do `welcome.css` em todas as páginas:

```
--bg:#0e1512; --surface:#16211d; --surface-border:#263832;
--ink:#f4f1ea; --muted:#a3b0a8;
--coral:#ff7a45; --coral-light:#ffa06b; --coral-dark:#d85f2e;
--emerald:#34d399; --emerald-dark:#1f9c6f;
```

Fontes: **Space Grotesk** nos títulos e **Inter** no texto. Use a mesma logo do welcome em todas as páginas. O estilo é moderno, escuro, elegante e discreto, sem exageros, principalmente no login.

## 1. Bugs e links quebrados (prioridade máxima)

1. `login/login.html` aponta para `../senha/senha.html`, mas a pasta se chama `esqueci senha/`. Renomeie a pasta para `senha/` (sem espaço) e corrija os links.
2. A pasta `Política/` e o arquivo `política.html` têm acento. Renomeie para `politica/politica.html` e atualize todos os links, incluindo o `politica-de-privacidade.html` citado no `index.html`, que não existe.
3. Os redirecionamentos não batem com a estrutura:
   - `login.js` manda para `../index.html`, mas o correto é `../index/index.html`.
   - `cadastro.js` manda para `index.html`, com o mesmo problema.
4. `senha.js` usa `RESET_PAGE_URL = "https://seusite.com/..."`, que é um placeholder. Troque por uma página real de redefinição ou por uma mensagem simulada.
5. As imagens `avatar-placeholder.png` e `pro-placeholder.png` não existem. Crie avatares com iniciais (só CSS) ou SVGs inline.
6. **Segurança (XSS):** no `index.js`, a busca insere o texto digitado com `innerHTML`. Use `textContent`.

## 2. App logado (`index/`), a parte que mais precisa de trabalho

1. **A navegação não funciona.** Os links da sidebar (`.nav-link[data-view]`) não trocam de view. Implemente a troca de `.view-section` (classes `active`/`hidden`) e sincronize com o `#hash` da URL, para que o botão voltar do navegador funcione.
2. **O menu mobile não abre.** `#sidebar-toggle` e `#sidebar-overlay` não têm JS. Implemente abrir e fechar, atualize `aria-expanded`, feche com a tecla Esc e ao clicar no overlay.
3. **Botões sem ícone.** Configurações, sair e notificações estão vazios. Use ícones SVG inline e mantenha os `aria-label`.
4. **Views vazias ou com "Em breve":**
   - Treinos: lista de treinos com cards (nome, grupo muscular, nº de exercícios, último treino).
   - Profissionais: grid de cards com filtro por especialidade.
   - Evolução: gráficos simples de peso e cargas com SVG puro ou `<canvas>`, sem biblioteca.
   - Alimentação: barras de progresso para cada macro (hoje os valores aparecem só como texto).
   - Descobrir: filtros com opções reais que realmente filtrem os cards.
   - Aulas, Academia e Salvos: preencher com conteúdo de exemplo coerente.
   - Perfil: precisa de um link na sidebar ou no menu do avatar.
5. **Dados fixos no HTML.** O nome "Biel" está escrito à mão. Salve o nome do cadastro/login no `localStorage` e mostre no app. O logout deve limpar esses dados e voltar para o login.
6. **Modais:** adicione foco preso dentro do modal, fechamento com Esc e devolução do foco ao botão que abriu. Os formulários dos modais (criar treino, editar perfil) devem salvar de verdade no `localStorage`.
7. Hoje o `index.css` não carrega as Google Fonts. Adicione-as.

## 3. Consistência entre páginas

- **Header e footer iguais** em todas as páginas públicas (welcome, planos, termos, política), com logo, links e o botão "Começar".
- **Planos duplicados:** existe `planos/planos.html` e também a view `#planos` no index. Use o mesmo conteúdo e o mesmo visual nos dois, com destaque para o plano recomendado e um toggle mensal/anual.
- **Código JS repetido:** `login.js` e `cadastro.js` repetem funções (`qs`, `setFieldError`, `initPasswordToggle`, `passwordStrength`). Junte tudo num `shared/form-utils.js`. O medidor de força de senha só faz sentido no cadastro.
- **Termos e Política:** adicione um sumário com âncoras, um botão "voltar ao topo" e a data da última atualização.

## 4. Visual e UX

- Estados de hover, focus-visible e active em todos os botões, cards e links, com foco visível em coral ou esmeralda.
- Skeletons de carregamento nos cards do app.
- Estados vazios bonitos ("Você ainda não criou treinos" com ilustração SVG e botão de ação).
- Microanimações discretas (fade/slide nas views, entre 150 e 250 ms), respeitando `prefers-reduced-motion`.
- Responsividade testada em 360px, 768px e 1280px, sem scroll horizontal.
- Favicon e `<meta name="theme-color" content="#0e1512">` em todas as páginas.

## 5. Acessibilidade e qualidade

- Só um `<h1>` por view visível e hierarquia correta de títulos.
- Contraste AA: confira `--muted` sobre `--surface`.
- `aria-current="page"` no item ativo da sidebar.
- Labels associados em todos os inputs, incluindo os dos modais.
- Tirar os `style="..."` inline do JS e do HTML e passar para o CSS.
- `<meta name="description">` e `<title>` próprios em cada página.

## Regras

- Não usar frameworks nem bibliotecas: só HTML, CSS e JS puros.
- Manter as cores e a logo do welcome.
- Não remover conteúdo existente, só melhorar e completar.
- Trabalhar em etapas, nesta ordem: 1 → 2 → 3 → 4 → 5. Ao fim de cada etapa, mostrar a prévia das páginas alteradas e listar os arquivos modificados.
