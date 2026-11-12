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

**Tecnologias:** front-end em **React** (com HTML, CSS e JavaScript), back-end em **Java + Spring Boot**, banco **SQL Server**.

---

## Antes de gravar: deixar tudo rodando no computador

Para o vídeo, rode as 3 partes **no computador**. Assim o registro que aparece na tela é o mesmo que aparece no SQL Server.
(O site no ar, https://chagaspq.github.io/saude-life, usa um banco PostgreSQL na nuvem; ele serve como plano B.)

1. **Banco (SQL Server):** no SSMS, abra `backend/banco/banco-de-dados-sqlserver.sql` e aperte **F5** (cria o banco `saudelife` e as 12 tabelas).
2. **API (Spring Tools):** em `backend/src/main/resources/application-sqlserver.properties`, coloque a senha do `sa`. Rode `SaudeLifeApplication` com o **Profile `sqlserver`**. Ela cria as contas de demonstração.
3. **Site (VS Code):** no arquivo `frontend/.env.development`, deixe `VITE_API_URL=http://localhost:8080/v1`. No terminal, dentro da pasta `frontend`: `npm install` (só na primeira vez) e `npm run dev`. Abra o endereço que aparecer (ex.: http://localhost:5173/).
4. **Postman:** importe `backend/saude-life-api.postman_collection.json`, troque a variável `base` para `http://localhost:8080/v1` e rode **Login cliente demo**.
5. **Dados realistas:** entre como cliente demo e faça 1 treino antes de gravar, para o Início e a Evolução terem números.
6. Zoom do VS Code e do SSMS em 150%. Tema escuro no site.

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

- **Tecnologias:** **React 18** (componentes em JSX), **HTML**, **CSS** e **JavaScript**, com o **Vite** para rodar e gerar o site.
- **Estrutura de pastas (`frontend/src/`):**
  - `paginas/` = as telas (`login.jsx`, `inicio.jsx`, `treino.jsx`, `admin.jsx`...);
  - `componentes/` = peças reaproveitadas (`AppLayout.jsx`, `base.jsx`, `Formulario.jsx`);
  - `lib/` = os "serviços": `api.js` (conversa com a API), `nuvem.js` (sincroniza os dados), `conta.js` (login);
  - `estilos/` = o CSS.
- **O que é um componente:** uma função que devolve um pedaço de tela e pode ser reaproveitada. Exemplo real: `CartaoNumero` em `frontend/src/componentes/base.jsx`. Ele é usado no Início ("Meta da semana", "Sequência"...), na Evolução e no Painel do admin, só trocando o texto e o ícone.
- **Rotas entre as telas (React Router):** o app tem um `index.html` só. Em `frontend/src/rotas.jsx`, cada endereço (`/login`, `/app/inicio`, `/app/treino?id=`...) mostra uma tela, e o `<Link>` troca de tela sem recarregar a página. O componente `AppLayout.jsx` (função `destino`) controla quem pode abrir cada tela: sem login vai para o Login; cliente sem questionário vai para o questionário; cliente não abre o painel do admin, e o admin não abre as telas do cliente.
- **CSS e responsividade:** cores e espaços em variáveis (`frontend/src/estilos/tokens.css`). Em `frontend/src/estilos/app.css`, os `@media (max-width: 900px)` e `(max-width: 640px)` trocam o menu lateral pelo **menu de baixo** no celular. Mostre: diminua a janela do navegador (ou F12 > modo celular).

## 4. Back-end | Tomas (3 min)

**Na tela:** Spring Tools com o código e o Postman.

- **Tecnologia:** **Java 17 + Spring Boot 3** (no lugar do Node.js com Express), com Spring Data JPA para falar com o banco.
- **Estrutura de pastas** (`backend/src/main/java/br/com/saudelife/api/`):
  - `controle/` = as rotas (o "routes + controllers"): `AuthController`, `TreinoController`, `ClienteController`, `AdminController`...;
  - `modelo/` = as tabelas como classes (`Usuario`, `Treino`, `Refeicao`...);
  - `repositorio/` = os comandos no banco;
  - `config/` e `seguranca/` = configuração, CORS e login;
  - `dto/` = o formato dos dados que entram e saem (JSON).
- **Papel da API:** recebe as requisições do site (React), aplica as regras e grava ou lê no SQL Server.
- **Rotas principais:**
  - `GET /treinos`: minhas fichas;
  - `POST /treinos`: criar ficha;
  - `PATCH /treinos/{id}`: editar ficha;
  - `PUT /agua/{dia}`: água do dia;
  - `DELETE /treinos/{id}`: apagar ficha;
  - `POST /auth/login`, `POST /refeicoes`, `GET /admin/clientes`, `POST /admin/avisos`.
- **Conexão com o SQL Server:** arquivo `application-sqlserver.properties` (linha `jdbc:sqlserver://localhost:1433;databaseName=saudelife`) e o driver da Microsoft no `pom.xml`.
- **Regras e validações:** em `dto/Dtos.java` (`@NotBlank`, `@Email`, `@Size(min = 8)` na senha, peso entre 30 e 300 kg). Os pontos têm limite de 300 por dia e a mesma ação não pontua duas vezes (`servico/PontosServico.java`). Os erros voltam como `{ "erro": "frase" }` (`erro/TratadorDeErros.java`).
- **Autenticação:** a senha é guardada só como **hash BCrypt**. O `POST /auth/login` devolve um **token**, e o site manda esse token em toda chamada. `seguranca/Autenticacao.java` confere o token, e as rotas `/admin` só abrem para administrador.
- **No Postman:** rode `GET /treinos` (com o token) e mostre o JSON. Mostre também um erro: login com a senha errada devolve **401** com a mensagem.

## 5. Banco de dados | Hiago (3 min)

**Na tela:** SSMS com as tabelas e as consultas rodando.

- **SQL Server e por quê:** banco relacional da Microsoft que estudamos no curso. Tem chaves e relacionamentos, e o SSMS facilita ver os dados. A API usa JPA, então o mesmo código funciona também no PostgreSQL (é o que está no ar, porque o servidor grátis só oferece esse).
- **Modelo entidade-relacionamento:** mostre `backend/banco/diagrama-er.png`.
- **Principais tabelas e relacionamentos:**
  - `academias` 1:N `usuarios` (FK `academia_id`);
  - `usuarios` 1:N `treinos` (FK `usuario_id`; e `autor_id` = o admin que mandou a ficha);
  - `treinos` 1:N `treino_itens` (os exercícios, FK `treino_id`);
  - `usuarios` 1:N `sessoes_treino`, `refeicoes`, `pesos`, `agua_dia`, `pontos`;
  - `academias` 1:N `avisos`.
  - Chaves primárias: `id` (uniqueidentifier ou bigint com IDENTITY). Únicos: `email`, `codigo` da academia, e um registro de água por dia.
- **Scripts de criação:** `backend/banco/banco-de-dados-sqlserver.sql` (os `CREATE TABLE`).
- **Consultas:** em `backend/banco/consultas-exemplo.sql` (selecione um bloco e aperte F5):
  - **SELECT:** as contas (repare que a senha aparece só como hash);
  - **JOIN:** cliente + academia; fichas + exercícios (3 tabelas);
  - **GROUP BY:** treinos de cada cliente (é o que o painel do admin mostra);
  - **INSERT:** um aviso direto pelo banco (depois ele aparece no app!);
  - **UPDATE:** a meta semanal de um cliente.
- **View e índices:** a view `vw_resumo_clientes` (resumo por academia) e os índices `sessoes_treino_usuario_data`, `refeicoes_usuario_dia` e `pesos_usuario_data`, que deixam as buscas por pessoa e data rápidas.

## 6. Fluxo completo: registrar uma refeição | Rafael (2 min)

**Na tela:** app, código e banco, em sequência.

1. **Usuário clica (React):** Alimentação > **Adicionar refeição** > "Almoço, 600 kcal" > **Salvar refeição**. Código: `frontend/src/paginas/alimentacao.jsx`, botão "Salvar refeição" (`onSalvar`).
2. **O front envia para a API:** `frontend/src/lib/nuvem.js` (função `empurrarRefeicoes`) chama `api("POST", "/refeicoes", {...})` em `frontend/src/lib/api.js`, com o token do login.
3. **A API valida e executa:** `ClienteController.java`, método `refeicao`. O `@Valid RefeicaoPedido` confere os dados (nome obrigatório, calorias até 3000), e `refeicoes.save(...)` faz o `INSERT`. Também dá os pontos (`PontosServico`).
4. **O SQL Server grava:** no SSMS, rode
   `SELECT TOP 5 nome, kcal, proteina, dia FROM refeicoes ORDER BY dia DESC;` e a refeição nova aparece.
5. **A API responde e a tela atualiza:** a API devolve **201 Created** com a refeição e o `id` do banco, e o site mostra a refeição na lista e soma as calorias e a proteína nas barras.

> Caminho: **tela (React)** → **API (Spring Boot)** → **SQL Server** → **resposta** → **tela atualizada**.

## 7. Dificuldades e aprendizados | Todos (2 min, uns 30 s cada)

Troquem pelo que viveram de verdade:
- **Gabriel:** o app tinha telas demais; aprendemos a fazer um **MVP**, focar no essencial e tirar o resto.
- **Rafael:** passar o site de HTML/JS puro para **React** sem mudar o visual; aprendemos a dividir a tela em componentes.
- **Tomas:** segurança do login (hash de senha e token) e garantir que cada pessoa só vê os próprios dados.
- **Hiago:** desenhar as tabelas e os relacionamentos e fazer a API funcionar com SQL Server e PostgreSQL.
- **O grupo aprendeu:** front-end, back-end e banco conversando; Git e GitHub; publicar na internet.
- **Melhorias futuras:** pagamento de verdade (Mercado Pago, já integrado, falta ativar), e-mail de recuperação de senha, app na loja e conta de academia verificada. Testes automáticos e o site no ar (deploy) **já foram feitos**.

## 8. Encerramento | Gabriel (1 min)

**Na tela:** slide final com os nomes e os contatos.

> "Mostramos o Saúde Life funcionando, o front-end em React, a API em Java com Spring Boot e o banco no SQL Server, e como uma ação na tela chega até o banco. Obrigado pela atenção!"

---

## Dicas de gravação

- Ensaiar uma vez e cronometrar (meta: uns 15 minutos).
- Zoom do editor e do SSMS em 150%.
- API, banco e site já abertos e funcionando antes de começar.
- Usar dados realistas (cliente demo com treinos, uma refeição de verdade).
- Revisar o áudio: ele importa mais que a imagem.

## Se algo der errado

- **API não liga ("Schema-validation: missing table"):** rode antes o `banco-de-dados-sqlserver.sql` no SSMS.
- **API não conecta no SQL Server:** confira a senha do `sa`, o "SQL Server Authentication" ligado e o TCP/IP na porta 1433 (passo a passo em `backend/README.md`).
- **Site sem dados:** confira o `VITE_API_URL` no `frontend/.env.development` e reinicie o `npm run dev`.
- **Plano B:** mostre o site no ar (https://chagaspq.github.io/saude-life); a primeira entrada pode demorar até 1 minuto.
