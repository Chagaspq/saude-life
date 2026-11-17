# Saúde Life

Site e app de fitness feito como TCC (MVP). Treinos guiados, registro de séries e cargas, evolução, alimentação e dois tipos de acesso: **cliente** (quem treina) e **administrador** (academia ou personal).

- **`backend/`**: API em **Java 17 + Spring Boot**, com a tabela de usuários no **SQL Server**
- **`frontend/`**: tela de usuários em **React** (lista, novo, editar e apagar), ligada na API
- **`site/`**: o site do Saúde Life em **React + React Router** (o que está no ar)

**Como rodar a API e a tela de usuários: veja o [`COMO-RODAR.md`](COMO-RODAR.md).**

![Saúde Life](site/public/shared/og-image.png)

## Ver online

**https://chagaspq.github.io/saude-life/** (leva para o app em https://chagaspq.github.io/saude-life/docs/)

O GitHub Pages publica a raiz do repositório (**Settings > Pages > Deploy from a branch > `main` / `/ (root)`**).
O `index.html` da raiz leva para a pasta `docs/`, que é o site pronto (gerado a partir do `site/`).
O `404.html` da raiz é uma cópia do app: faz qualquer endereço do app (ex.: `/saude-life/docs/app/inicio`) abrir certo.

## Organização das pastas

```
saude-life/
├── backend/           API (Java + Spring Boot): abre no Spring Tools
│   ├── src/main/java/br/com/belval/saudelife/
│   │   ├── model/Usuario.java                  a tabela usuarios
│   │   ├── repository/UsuarioRepository.java   acesso ao banco
│   │   └── controller/UsuarioController.java   as rotas /usuarios
│   ├── src/main/resources/application.properties   conexão com o SQL Server
│   ├── banco/criar-banco.sql                        cria o banco no SSMS
│   └── pom.xml        dependências (Spring Boot, JPA, SQL Server)
│
├── frontend/          TELA DE USUÁRIOS (React + Vite): conversa com a API
│   ├── src/services/usuarioService.js   chama a API
│   ├── src/pages/     ListaUsuarios, NovoUsuario, EditarUsuario (e as de produtos)
│   └── src/components/ Menu, Modal, FormularioUsuario
│
├── site/              SITE DO SAÚDE LIFE (React + React Router + Vite)
│   ├── index.html     a única página HTML: o React desenha tudo dentro dela
│   ├── src/
│   │   ├── main.jsx       começo do app (tema salvo, roteador, efeitos, tradução e Libras)
│   │   ├── rotas.jsx      rotas do React Router: cada endereço mostra uma tela
│   │   ├── paginas/       uma tela por arquivo (login.jsx, inicio.jsx, treino.jsx, admin.jsx...)
│   │   ├── componentes/   componentes React: Tela, casco do app, janelas, formulários, Efeitos, Traducao, VLibras
│   │   ├── lib/           funções e dados: navegar.js, conta.js, pontos.js, exercicios.js, alimentos.js, idioma.js...
│   │   └── estilos/       CSS (cores, base, site, app e um arquivo por tela)
│   ├── public/        ícones e imagem de compartilhar
│   └── vite.config.js configuração do Vite
│
├── docs/              SITE PRONTO (gerado pelo build do site/; não editar à mão)
├── apresentacao/      vídeo, falas e o roteiro em PDF
├── COMO-RODAR.md      passo a passo da API e da tela de usuários
├── ROTEIRO-SIMPLES.md / ROTEIRO-POR-PESSOA.md / ROTEIRO-APRESENTACAO.md
└── index.html         leva da raiz do repositório para o site pronto
```

## Rodar a API e a tela de usuários

Passo a passo completo no **[`COMO-RODAR.md`](COMO-RODAR.md)**. Resumo:

```powershell
# Terminal 1: a API (pasta backend)
cd backend
.\mvnw spring-boot:run          # http://localhost:8080/usuarios

# Terminal 2: a tela de usuários (pasta frontend)
cd frontend
npm install
npm run dev                     # http://localhost:5173/usuarios
```

## Rodar o site do Saúde Life

Precisa do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
cd site
npm install        # instala o React e o Vite (só na primeira vez)
npm run dev        # abre o site em http://localhost:5173 e atualiza sozinho
npm run build      # gera o site pronto na pasta docs/ da raiz (é ela que vai para o ar)
```

Depois de mudar qualquer arquivo em `site/`, rode `npm run build` e mande a pasta `docs/` junto no commit.
Para ver o site pronto no computador antes de mandar: `npm run preview` (abre em http://localhost:4173/saude-life/docs/).

## Telas e endereços (React Router)

| Endereço | Tela |
|---|---|
| `/` | Boas-vindas |
| `/planos`, `/blog`, `/academias`, `/ajuda`, `/glossario`, `/calculadoras`, `/termos`, `/politica` | Site público |
| `/login`, `/cadastro`, `/senha`, `/senha/redefinir?token=` | Conta |
| `/app/inicio`, `/app/treinos`, `/app/treino?id=`, `/app/alimentacao`, `/app/evolucao`, `/app/perfil`, `/app/planos`, `/app/comecar` | App do cliente |
| `/app/admin` | Painel do administrador |
| qualquer outro | Página não encontrada (404) |

As rotas ficam em `site/src/rotas.jsx`. Cada tela só carrega quando a pessoa abre (e traz o próprio CSS, que sai quando ela fecha: `componentes/Tela.jsx`). A troca de tela é feita pelo `<Link>` do React Router, sem recarregar a página. O `AppLayout.jsx` (função `destino`) decide quem pode abrir cada tela do app.

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

O site do Saúde Life (`site/`) ainda salva só no navegador (modo demonstração). Os usuários da tela `frontend/` já vão para a API e o SQL Server (`backend/`).

## Acessibilidade

Botão de exibição em todas as telas: tema claro/escuro, tamanho da letra, alto contraste, menos movimento e idioma (português, inglês e espanhol). Respeita "reduzir movimento" do sistema, funciona no teclado e no celular.
