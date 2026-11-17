# Roteiro do vídeo do TCC: Saúde Life

**Grupo:** Gabriel Chagas (08) · Rafael (PH) Santos (15) · Tomas de Oliveira (17) · Hiago Tetsuo (10)
**Curso:** [curso] · **Instituição:** [instituição]

| Integrante | Nome | Nº | Partes |
|---|---|---|---|
| 1 | Gabriel Chagas | 08 | 1. Abertura · 2. Demonstração · 8. Encerramento |
| 2 | Rafael (PH) Santos | 15 | 3. Front-end · 6. Fluxo completo |
| 3 | Tomas de Oliveira | 17 | 4. Back-end |
| 4 | Hiago Tetsuo | 10 | 5. Banco de dados |
| Todos | — | — | 7. Dificuldades e aprendizados |

**Tecnologias:** front-end em **React** (com React Router, HTML, CSS e JavaScript), back-end em **Java + Spring Boot**, banco **SQL Server**.

**Onde está cada parte no GitHub (https://github.com/Chagaspq/saude-life):**
- `backend/`: a API (Java + Spring Boot) e o script do banco (SQL Server)
- `frontend/`: a tela de usuários (React), ligada na API
- `site/`: o site do Saúde Life (React), no ar em https://chagaspq.github.io/saude-life/

---

## Antes de gravar: deixar tudo rodando no computador

1. **Banco (SQL Server):** no SSMS, abra `backend/banco/criar-banco.sql` e aperte **F5** (cria o banco `saudelife`).
2. **API (Spring Tools):** **File > Import > Existing Maven Projects** > pasta `backend`. Em `src/main/resources/application.properties`, coloque a senha do `sa`. Rode `SaudelifeApplication` (**Run As > Spring Boot App**). A tabela `usuarios` é criada sozinha.
3. **Tela de usuários (Git Bash):** dentro de `frontend`: `npm install` (só na primeira vez) e `npm run dev`. Abra http://localhost:5173/usuarios e cadastre 2 ou 3 usuários de verdade.
4. **Site Saúde Life:** abra https://chagaspq.github.io/saude-life/ (ou, dentro de `site/`, `npm install` e `npm run dev`).
5. **Postman:** deixe pronto um `GET http://localhost:8080/usuarios` e um `POST` com o JSON de exemplo (fim deste roteiro).
6. **Dados realistas no site:** entre como cliente demo e faça 1 treino antes de gravar, para o Início e a Evolução terem números.
7. Zoom do VS Code, do Spring Tools e do SSMS em 150%. Tema escuro no site.

---

## 1. Abertura | Gabriel (1 min)

**Na tela:** slide de abertura com "Saúde Life" e os 4 nomes.

> "Olá! Somos Gabriel Chagas, número 08, Rafael Santos, 15, Tomas de Oliveira, 17, e Hiago Tetsuo, 10, do curso [curso], da [instituição]. Nosso TCC é o **Saúde Life**, um aplicativo de treino com acompanhamento da academia."

- **Problema:** muita gente começa a treinar e desiste, e a academia não sabe quem sumiu nem consegue acompanhar cada aluno.
- **Objetivo:** ajudar a pessoa a manter a constância (treino guiado, metas e pontos) e dar à academia ou ao personal um painel para acompanhar os clientes, mandar treinos e avisos.
- **Ordem do vídeo:** demonstração, front-end, back-end, banco de dados, um fluxo completo, dificuldades e conclusão.

## 2. Demonstração do aplicativo | Gabriel (3 min)

**Na tela:** navegador com o app rodando.

- **Login e cadastro:** mostre a escolha **Sou cliente / Sou administrador** e o campo **Código da academia**. Entre com **Demonstração: cliente**.
- **Tela principal (Início):** meta da semana, sequência, pontos da semana e o próximo treino. Só 5 abas: Início, Treinos, Alimentação, Evolução e Perfil.
- **Funcionalidade 1 (Treino guiado):** Treinos > Iniciar treino. Marque 2 séries, mostre o descanso contando e os pontos. Finalize e mostre o resumo.
- **Funcionalidade 2 (Painel do administrador):** saia e entre com **Demonstração: administrador**. Selo ADMIN, código da academia **SL-DEMO**, a lista de clientes com quanto cada um treinou.
- (Se der tempo) Alimentação: refeição e água; Evolução: gráfico de peso.

## 3. Front-end | Rafael (2 min 30)

**Na tela:** VS Code e navegador lado a lado.

- **Tecnologias:** **React 18** (componentes em JSX) com **React Router** (troca de telas), **HTML**, **CSS** e **JavaScript**, e o **Vite** para rodar e gerar o site.
- **Estrutura de pastas (`site/src/`):**
  - `paginas/` = as telas (`login.jsx`, `inicio.jsx`, `treino.jsx`, `admin.jsx`...);
  - `componentes/` = peças reaproveitadas (`AppLayout.jsx`, `base.jsx`, `Formulario.jsx`);
  - `main.jsx` = começo do app e `rotas.jsx` = as rotas (cada endereço mostra uma tela);
  - `lib/` = funções e dados: `navegar.js`, `conta.js` (login), `pontos.js`, `exercicios.js`...;
  - `estilos/` = o CSS (cada tela carrega o seu, pelo componente `Tela.jsx`).
- **O que é um componente:** uma função que devolve um pedaço de tela e pode ser reaproveitada. Exemplo real: `CartaoNumero` em `site/src/componentes/base.jsx`. Ele é usado no Início ("Meta da semana", "Sequência"...), na Evolução e no Painel do admin, só trocando o texto e o ícone.
- **Rotas entre as telas (React Router):** o app tem um `index.html` só. Em `site/src/rotas.jsx`, cada endereço (`/login`, `/app/inicio`, `/app/treino?id=`...) mostra uma tela, e o `<Link>` troca de tela sem recarregar a página. O componente `AppLayout.jsx` (função `destino`) controla quem pode abrir cada tela: sem login vai para o Login; cliente sem questionário vai para o questionário; cliente não abre o painel do admin, e o admin não abre as telas do cliente.
- **CSS e responsividade:** cores e espaços em variáveis (`site/src/estilos/tokens.css`). Em `site/src/estilos/app.css`, os `@media (max-width: 900px)` e `(max-width: 640px)` trocam o menu lateral pelo **menu de baixo** no celular. Mostre: diminua a janela do navegador (ou F12 > modo celular).

## 4. Back-end | Tomas (3 min)

**Na tela:** Spring Tools com o código e o Postman.

- **Tecnologia:** **Java 17 + Spring Boot**, com **Spring Data JPA** para falar com o banco (projeto `backend`).
- **Estrutura de pastas** (`src/main/java/br/com/belval/saudelife/`):
  - `model/Usuario.java` = a tabela `usuarios` como classe (nome completo, e-mail, senha, tipo, data de nascimento, data de cadastro);
  - `repository/UsuarioRepository.java` = os comandos no banco (o Spring cria o SQL: `findAll`, `findById`, `save`, `deleteById`);
  - `controller/UsuarioController.java` = as rotas da API;
  - `resources/application.properties` = a conexão com o SQL Server.
- **Papel da API:** recebe as requisições da tela (React), confere os dados e grava ou lê no SQL Server.
- **Rotas (`/usuarios`):**
  - `GET /usuarios`: lista todos;
  - `GET /usuarios/{id}`: busca um;
  - `POST /usuarios`: cadastra (responde **201**);
  - `PUT /usuarios/{id}`: altera;
  - `DELETE /usuarios/{id}`: apaga (responde **204**).
- **Conexão com o SQL Server:** linha `jdbc:sqlserver://localhost:1433;databaseName=saudelife` no `application.properties` e o driver `mssql-jdbc` no `pom.xml`. `ddl-auto=update` cria a tabela a partir da classe.
- **Regras e validações** (método `conferir` do controller): nome e e-mail obrigatórios, e-mail com formato válido, senha com pelo menos 8 caracteres, tipo CLIENTE ou ADMINISTRADOR, nascimento não pode ser no futuro. Erro volta **400** com a frase; e-mail repetido volta **409**.
- **Segurança:** a senha é guardada só como **hash BCrypt** e nunca aparece no JSON (`@JsonProperty(access = WRITE_ONLY)`). O `@CrossOrigin` libera só o site do `localhost:5173`.
- **No Postman:** rode `GET /usuarios` e mostre o JSON (sem a senha). Depois um `POST` com um e-mail que já existe: volta **409** com "Já existe um usuário com este e-mail."

## 5. Banco de dados | Hiago (3 min)

**Na tela:** SSMS com a tabela e as consultas rodando.

- **SQL Server e por quê:** banco relacional da Microsoft que estudamos no curso. Tem chaves, restrições e o SSMS facilita ver os dados.
- **Criação:** `banco/criar-banco.sql` cria o banco `saudelife`; a tabela `usuarios` é criada pela API (JPA) a partir da classe `Usuario`.
- **Tabela `usuarios`:**
  - `id` = chave primária (bigint com IDENTITY: o banco gera 1, 2, 3...);
  - `nome_completo`, `email` (único: não repete), `senha` (hash), `tipo_usuario`, `data_nascimento`, `data_criacao`.
  - Mostre no SSMS: **Bancos de dados > saudelife > Tabelas > dbo.usuarios > Colunas** e **Chaves**.
- **Consultas** (nova consulta no SSMS):
  - **SELECT:** `SELECT id, nome_completo, email, tipo_usuario, data_nascimento FROM usuarios;`
  - **Senha protegida:** `SELECT email, senha FROM usuarios;` (a senha aparece só como hash `$2a$10$...`)
  - **WHERE e ORDER BY:** `SELECT nome_completo FROM usuarios WHERE tipo_usuario = 'CLIENTE' ORDER BY nome_completo;`
  - **GROUP BY:** `SELECT tipo_usuario, COUNT(*) AS total FROM usuarios GROUP BY tipo_usuario;`
  - **E-mail único:** tente `INSERT` com um e-mail repetido e mostre o erro de chave única.
- **Diagrama ER:** mostre a tabela `usuarios` e explique que as próximas (treinos, refeições, pesos) vão se ligar a ela pela chave estrangeira `usuario_id`.

## 6. Fluxo completo: cadastrar um usuário | Rafael (2 min)

**Na tela:** tela de usuários, código e banco, em sequência.

1. **Usuário clica (React):** http://localhost:5173/usuarios > **+ Novo Usuário** > preenche nome, e-mail, senha, tipo e nascimento > **Salvar**. Código: `frontend/src/components/FormularioUsuario.jsx` (função `salvar`).
2. **O front envia para a API:** `frontend/src/services/usuarioService.js`, função `criarUsuario`, faz `fetch("http://localhost:8080/usuarios", { method: "POST", body: JSON })`.
3. **A API valida e executa:** `UsuarioController.java`, método `criar`. Confere os dados (`conferir`), vê se o e-mail já existe, faz o hash da senha e `repositorio.save(novo)` faz o `INSERT`.
4. **O SQL Server grava:** no SSMS, rode `SELECT TOP 5 id, nome_completo, email FROM usuarios ORDER BY id DESC;` e o usuário novo aparece.
5. **A API responde e a tela atualiza:** a API devolve **201 Created** com o usuário (sem a senha), a tela mostra "Usuário criado com sucesso" e a lista já traz o usuário novo. Mostre também **editar** (lápis) e **apagar** (X com confirmação).

> Caminho: **tela (React)** → **API (Spring Boot)** → **SQL Server** → **resposta** → **tela atualizada**.

## 7. Dificuldades e aprendizados | Todos (2 min, uns 30 s cada)

Troquem pelo que viveram de verdade:
- **Gabriel:** o app tinha telas demais; aprendemos a fazer um **MVP**, focar no essencial e tirar o resto.
- **Rafael:** passar o site de várias páginas HTML para **um app React só, com React Router**, sem mudar o visual; aprendemos a dividir a tela em componentes.
- **Tomas:** segurança do login (hash de senha e token) e garantir que cada pessoa só vê os próprios dados.
- **Hiago:** desenhar as tabelas, ligar a API no SQL Server (usuário `sa`, porta 1433) e garantir que o e-mail não se repete.
- **O grupo aprendeu:** front-end, back-end e banco conversando; Git e GitHub; publicar na internet.
- **Melhorias futuras:** ligar as outras telas do Saúde Life (treinos, alimentação, evolução) na API e no banco, login com a tabela de usuários, pagamento de verdade e app na loja. O site no ar (deploy) **já foi feito**.

## 8. Encerramento | Gabriel (1 min)

**Na tela:** slide final com os nomes e os contatos.

> "Mostramos o Saúde Life funcionando, o front-end em React com React Router, a API em Java com Spring Boot e o banco no SQL Server, e como um cadastro na tela chega até o banco. Obrigado pela atenção!"

---

## Dicas de gravação

- Ensaiar uma vez e cronometrar (meta: uns 15 minutos).
- Zoom do editor e do SSMS em 150%.
- API, banco e site já abertos e funcionando antes de começar.
- Usar dados realistas (cliente demo com treinos, uma refeição de verdade).
- Revisar o áudio: ele importa mais que a imagem.

## Se algo der errado

- **"Failed to fetch" na tela de usuários:** a API não está ligada (rode `SaudelifeApplication` no Spring Tools) ou está em outra porta (tem que ser 8080).
- **API não conecta no SQL Server:** confira a senha do `sa` no `application.properties`, o "SQL Server Authentication" ligado e o TCP/IP na porta 1433 (SQL Server Configuration Manager); reinicie o serviço do SQL Server.
- **"Cannot open database saudelife":** rode antes o `criar-banco.sql` no SSMS.
- **Sem SQL Server na hora:** rode a API com o perfil H2 (Program arguments: `--spring.profiles.active=h2`); os dados ficam na memória.
- **Plano B do site:** mostre o site no ar (https://chagaspq.github.io/saude-life/).

## JSON de exemplo (Postman)

`POST http://localhost:8080/usuarios` (Body > raw > JSON):

```json
{ "nomeCompleto": "Maria Souza", "email": "maria@teste.com", "senha": "senha1234", "tipoUsuario": "CLIENTE", "dataNascimento": "2005-03-10" }
```
