# Saúde Life

Site e app de fitness feito como TCC (MVP). Treinos guiados, registro de séries e cargas, evolução, alimentação e dois tipos de acesso: **cliente** (quem treina) e **administrador** (academia ou personal).

Feito em **React 18** com **Vite**. Cada página do site é uma página React própria (mesmos endereços de antes).

![Saúde Life](public/shared/og-image.png)

## Ver online

**https://chagaspq.github.io/saude-life/**

O GitHub Pages publica a pasta `docs/` (o site pronto, gerado pelo Vite).
Configuração: **Settings > Pages > Deploy from a branch > `main` / `/docs`**.

## Como rodar no computador

Precisa do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
npm install        # instala o React e o Vite (só na primeira vez)
npm run dev        # abre o site em http://localhost:5173 e atualiza sozinho
npm run build      # gera o site pronto na pasta docs/ (é ela que vai para o ar)
```

Depois de mudar qualquer arquivo em `src/`, rode `npm run build` e mande a pasta `docs/` junto no commit.

## Como testar rápido

Na tela **Entrar**:
- **Demonstração: cliente** entra com 3 semanas de treinos de exemplo.
- **Demonstração: administrador** entra no Painel do administrador.
- **Apagar tudo deste navegador** zera tudo para começar do zero.

## O que tem

**Site público:** boas-vindas, planos, blog, para academias, ajuda, glossário, calculadoras, termos, política de privacidade e 404.
**Conta:** entrar, criar conta (cliente ou administrador), recuperar e redefinir senha.

**Cliente (5 telas):** Início, Treinos (e a tela do treino), Alimentação, Evolução e Perfil. Mais o questionário inicial e os planos.
**Administrador (2 telas):** Painel (clientes, mandar treino, avisos) e Perfil. Selo **ADMIN** verde no topo e faixa verde.

Tudo começa zerado: as telas só mostram o que a própria pessoa registrou.

## Estrutura

```
src/
  paginas/        uma página React por tela (welcome.jsx, login.jsx, inicio.jsx, treino.jsx...)
  componentes/    peças usadas em várias páginas (casco do app, do site, janelas, cartões, formulários)
  lib/            regras do app sem tela (conta e senha, dados salvos, pontos, avisos, formatos)
  estilos/        CSS (cores, base, site, app e um arquivo por tela)
  montar.jsx      liga a página React no HTML

public/           arquivos copiados do jeito que estão (ícones, imagem de compartilhar, tradução EN/ES)
ferramentas/      scripts de apoio (gerar os HTML das páginas)
backend/          API em Java + Spring Boot (abre no Spring Tools; veja backend/README.md)
documentacao/     banco de dados (SQL) e API para a próxima versão
docs/             SITE PRONTO (gerado pelo `npm run build`; não editar à mão)

*.html nas pastas (welcome/, login/, app/inicio/...)  entrada de cada página para o Vite
```

## Onde os dados ficam

No próprio navegador (`localStorage`), separados por conta. A senha é guardada como resumo (SHA-256), nunca o texto.
O servidor já está pronto na pasta `backend/` (Java + Spring Boot + PostgreSQL); o próximo passo é ligar o site nele. Desenho completo em `documentacao/API.md` e `documentacao/banco-de-dados.sql`.

## Acessibilidade

Botão de exibição em todas as telas: tema claro/escuro, tamanho da letra, alto contraste, menos movimento e idioma (português, inglês e espanhol). Respeita "reduzir movimento" do sistema, funciona no teclado e no celular.
