# Saúde Life

Site e app de fitness feito como TCC (MVP). Treinos guiados, registro de séries e cargas, evolução, alimentação e dois tipos de acesso: **cliente** (quem treina) e **administrador** (academia ou personal).

- **Front-end:** React 18 + Vite (pasta `frontend/`)
- **Back-end:** Java 17 + Spring Boot 3 (pasta `backend/`)
- **Banco:** SQL Server (no computador) e PostgreSQL (no ar, no Render)

![Saúde Life](frontend/public/shared/og-image.png)

## Ver online

**https://chagaspq.github.io/saude-life/**

O GitHub Pages publica a pasta `docs/` (o site pronto, gerado a partir do `frontend/`).
Configuração: **Settings > Pages > Deploy from a branch > `main` / `/docs`**.

## Organização das pastas

```
saude-life/
├── frontend/          SITE (React + Vite): tudo o que aparece na tela
│   ├── src/
│   │   ├── paginas/       uma tela por arquivo (login.jsx, inicio.jsx, treino.jsx, admin.jsx...)
│   │   ├── componentes/   peças reaproveitadas (casco do app, janelas, cartões, formulários)
│   │   ├── lib/           serviços: api.js (fala com a API), nuvem.js, conta.js, pontos.js...
│   │   ├── estilos/       CSS (cores, base, site, app e um arquivo por tela)
│   │   └── config.js      endereço da API
│   ├── public/        ícones, imagem de compartilhar, tradução EN/ES
│   ├── welcome/ login/ cadastro/ app/ ...   o .html de entrada de cada página
│   ├── ferramentas/   scripts de apoio (gerar os HTML das páginas)
│   ├── .env.development / .env.production   endereço da API no computador / no ar
│   ├── package.json   dependências (React, Vite)
│   └── vite.config.js configuração do Vite
│
├── backend/           API (Java + Spring Boot): regras, segurança e banco
│   ├── src/main/java/br/com/saudelife/api/   controle, modelo, repositorio, dto, servico, seguranca...
│   ├── src/main/resources/                   configurações (H2, PostgreSQL, SQL Server)
│   ├── banco/         scripts SQL (SQL Server e PostgreSQL), diagrama ER e consultas de exemplo
│   ├── saude-life-api.postman_collection.json   testes no Postman
│   ├── Dockerfile     para publicar no Render
│   └── README.md      como rodar no Spring Tools, rotas e banco
│
├── docs/              SITE PRONTO (gerado pelo build do frontend; não editar à mão)
├── documentacao/      desenho da API (API.md)
├── apresentacao/      vídeo da apresentação, falas e os scripts que geraram o vídeo
├── ROTEIRO-APRESENTACAO.md
├── render.yaml        publicação da API e do banco no Render
└── index.html         leva da raiz do repositório para o site pronto
```

## Rodar o front-end (site)

Precisa do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
cd frontend
npm install        # instala o React e o Vite (só na primeira vez)
npm run dev        # abre o site em http://localhost:5173 e atualiza sozinho
npm run build      # gera o site pronto na pasta docs/ da raiz (é ela que vai para o ar)
```

Depois de mudar qualquer arquivo em `frontend/`, rode `npm run build` e mande a pasta `docs/` junto no commit.

## Rodar o back-end (API)

Abra a pasta `backend` no **Spring Tools** (**File > Import > Existing Maven Projects**) e rode `SaudeLifeApplication` (**Run As > Spring Boot App**). Passo a passo, rotas e como usar o SQL Server em **`backend/README.md`**.

Para o site usar a API do computador: em `frontend/.env.development`, coloque `VITE_API_URL=http://localhost:8080/v1` e rode `npm run dev` de novo.

## Como testar rápido

Na tela **Entrar**:
- **Demonstração: cliente** entra com treinos de exemplo.
- **Demonstração: administrador** entra no Painel do administrador.
- **Apagar tudo deste navegador** zera tudo para começar do zero.

## O que tem

**Site público:** boas-vindas, planos, blog, para academias, ajuda, glossário, calculadoras, termos, política de privacidade e 404.
**Conta:** entrar, criar conta (cliente ou administrador), recuperar e redefinir senha.

**Cliente (5 telas):** Início, Treinos (e a tela do treino), Alimentação, Evolução e Perfil. Mais o questionário inicial e os planos.
**Administrador (2 telas):** Painel (clientes, mandar treino, avisos) e Perfil. Selo **ADMIN** verde no topo e faixa verde.

## Onde os dados ficam

Com a API ligada (`VITE_API_URL` no `frontend/.env.production`), tudo vai para o servidor (pasta `backend/`) e o banco, e funciona em qualquer aparelho. Sem a API, o site salva só no navegador (modo demonstração). A senha fica guardada só como hash BCrypt.

## Acessibilidade

Botão de exibição em todas as telas: tema claro/escuro, tamanho da letra, alto contraste, menos movimento e idioma (português, inglês e espanhol). Respeita "reduzir movimento" do sistema, funciona no teclado e no celular.
