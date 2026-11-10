# Saúde Life — API (Java + Spring Boot)

Servidor do Saúde Life: contas (cliente e administrador), treinos, histórico, refeições, água, peso, pontos, avisos e painel do admin.
Feito em **Java 17** com **Spring Boot 3**, **Spring Data JPA** e banco **H2** (para testar), **SQL Server** ou **PostgreSQL**.

## Abrir e rodar no Spring Tools (STS)

1. Instale o **Spring Tools 4** (https://spring.io/tools) e o **Java 17** ou mais novo.
2. No STS: **File > Import > Maven > Existing Maven Projects** e escolha a pasta `backend`.
3. Espere o Maven baixar as bibliotecas (barra de progresso no canto de baixo).
4. Abra `src/main/java/br/com/saudelife/api/SaudeLifeApplication.java`, clique com o botão direito e escolha **Run As > Spring Boot App**.
5. Pronto: a API fica em **http://localhost:8080/v1**.

Ao ligar, ela já cria as contas de demonstração (senha `demo1234`):
- `admin@saudelife.app`: administrador da **Academia Demonstração** (código `SL-DEMO`).
- `demo@saudelife.app`: cliente dessa academia, com treinos e pesos de exemplo.

Para ver o banco: **http://localhost:8080/v1/h2-console** (JDBC URL `jdbc:h2:mem:saudelife`, usuário `sa`, senha vazia).

> O H2 fica na memória: os dados somem ao desligar. Para guardar de verdade, use o PostgreSQL (abaixo).

## Usar o PostgreSQL

1. Instale o PostgreSQL e crie o banco: `CREATE DATABASE saudelife;`
2. Se o usuário/senha não forem `postgres`/`postgres`, ajuste em `src/main/resources/application-postgres.properties`.
3. No STS: **Run As > Run Configurations > Spring Boot App > Profile: `postgres`** e rode.
4. As tabelas são criadas sozinhas na primeira vez.

## Usar o SQL Server (Microsoft)

A API também roda no **SQL Server** (ex.: SQL Server Express + SQL Server Management Studio no seu computador).
O site no ar (Render) continua usando PostgreSQL, porque o Render não oferece SQL Server; o código é o mesmo para os dois.

1. Instale o **SQL Server Express** e o **SSMS** (https://www.microsoft.com/pt-br/sql-server/sql-server-downloads).
2. No instalador do SQL Server, escolha **Mixed Mode** (autenticação do Windows **e** do SQL Server) e crie a senha do usuário **sa**.
   - Já instalou sem isso? No SSMS: botão direito no servidor > **Properties > Security > SQL Server and Windows Authentication**; depois **Security > Logins > sa** > habilite e defina a senha; reinicie o serviço.
3. Habilite o TCP: **SQL Server Configuration Manager > SQL Server Network Configuration > Protocols for SQLEXPRESS > TCP/IP = Enabled**; em **IP Addresses > IPAll**, coloque **TCP Port = 1433**; reinicie o serviço.
4. No SSMS, abra **`banco/banco-de-dados-sqlserver.sql`** e aperte **F5**: cria o banco `saudelife` e as 12 tabelas. (Com o perfil `sqlserver`, a API não cria tabelas: ela confere se o banco do script está certo.)
5. Em `src/main/resources/application-sqlserver.properties`, troque a senha (`DB_SENHA`) pela senha do `sa`.
6. No Spring Tools: **Run As > Run Configurations > Spring Boot App > Profile: `sqlserver`** e rode.
7. Os dados aparecem no SSMS: **saudelife > Tables** > botão direito > **Select Top 1000 Rows**.

Também na pasta `banco/`: **`diagrama-er.png`** (diagrama entidade-relacionamento) e **`consultas-exemplo.sql`** (SELECT, JOIN, GROUP BY, INSERT, UPDATE, uma VIEW e os índices, para mostrar no SSMS).

Conferido: a API roda em cima desse script no modo `validate` (sem nenhuma diferença), e o caminho completo (cadastro, treino, refeição, peso, admin, avisos, senha e excluir conta) passou no SQL Server 2022.

## Testes automáticos

No STS: botão direito em `src/test/java` > **Run As > JUnit Test**.
O teste `FluxoCompletoTest` liga o servidor e faz o caminho da apresentação: cadastro, login, treino, refeição, peso, pontos, admin mandando treino e aviso, troca de senha e sair.

Pelo terminal: `mvn test`.

## Banco de dados

Dois arquivos com as 12 tabelas (comentadas) que a API usa: **`banco/banco-de-dados-sqlserver.sql`** (SQL Server, para o SSMS) e **`banco/banco-de-dados.sql`** (PostgreSQL, usado no Render). A API cria tudo sozinha ao ligar, mas dá para criar à mão no pgAdmin (Query Tool) e mostrar no TCC.
Ele foi conferido: a API roda em cima dele no modo `validate` sem nenhuma diferença.

Tabelas: `academias`, `usuarios`, `sessoes_login`, `redefinicoes_senha`, `treinos`, `treino_itens`, `sessoes_treino`, `refeicoes`, `agua_dia`, `pesos`, `pontos`, `avisos`.

## Testar no Postman

Importe **`saude-life-api.postman_collection.json`** no Postman (**Import**). São 34 chamadas separadas por assunto.
Rode primeiro **Login cliente demo** e **Login admin demo**: o token é guardado sozinho para as outras.

## Como testar as rotas na mão

Com o **Postman** (ou Insomnia):

1. `POST http://localhost:8080/v1/auth/login` com o corpo JSON `{ "email": "demo@saudelife.app", "senha": "demo1234" }`.
2. Copie o `token` da resposta.
3. Nas outras rotas, mande o cabeçalho `Authorization: Bearer <token>`. Exemplo: `GET http://localhost:8080/v1/treinos`.

## Rotas

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| POST | `/auth/cadastro` | pública | Cria a conta (`tipo`: `cliente` ou `admin`; cliente pode mandar `codigoAcademia`) e já entra |
| POST | `/auth/login` | pública | Entra e devolve o `token` |
| POST | `/auth/sair` | logado | Fecha o login deste aparelho |
| POST | `/auth/esqueci-senha` | pública | Cria o link de nova senha (na demonstração devolve `tokenDemo`) |
| POST | `/auth/redefinir-senha` | pública | Troca a senha com o token do link |
| GET / PATCH | `/me` | logado | Ver e mudar o perfil (nome, apelido, bio, altura, objetivo, nível, meta) |
| PATCH | `/me/senha`, `/me/email` | logado | Trocar senha ou e-mail (pede a senha atual) |
| PATCH | `/me/academia` | cliente | Entrar numa academia pelo código |
| GET | `/me/exportar` | logado | Baixa todos os dados (LGPD) |
| DELETE | `/me` | logado | Exclui a conta e tudo (pede a senha) |
| GET / POST | `/treinos` | logado | Minhas fichas / criar ficha |
| PATCH / DELETE | `/treinos/{id}` | logado | Editar / apagar ficha |
| GET / POST | `/sessoes` | logado | Histórico (`?de=&ate=`) / registrar treino concluído (dá pontos) |
| GET | `/resumo/semana` | logado | Números do Início |
| GET / POST | `/refeicoes` | logado | Refeições do dia com totais e água (`?dia=`) / registrar refeição |
| DELETE | `/refeicoes/{id}` | logado | Apagar refeição (devolve os pontos) |
| PUT | `/agua/{dia}` | logado | Total de água do dia (`{ "ml": 1500 }`) |
| GET / POST | `/pesos` | logado | Pesos (`?de=&ate=`) / registrar peso de hoje |
| GET | `/pontos/semana` | logado | Pontos da semana e quanto falta para subir de liga |
| POST | `/pontos` | logado | Pontos de uma ação (`serie`, `agua`, `proteina`, `recorde`) |
| GET | `/avisos` | cliente | Avisos da minha academia |
| GET | `/admin/academia` | admin | Academia e código para os clientes |
| GET | `/admin/resumo` | admin | Números do painel |
| GET | `/admin/clientes` | admin | Clientes com treinos, último treino e peso |
| GET | `/admin/clientes/{id}` | admin | Histórico e pesos de um cliente |
| POST | `/admin/clientes/{id}/treinos` | admin | Mandar uma ficha para o cliente |
| GET / POST | `/admin/avisos` | admin | Avisos / publicar aviso |
| DELETE | `/admin/avisos/{id}` | admin | Apagar aviso |
| GET | `/planos` | pública | Planos e preços |
| POST | `/assinaturas/teste`, `/assinaturas/cancelar` | logado | Teste grátis de 30 dias / voltar para o Free |

Erros sempre vêm como `{ "erro": "frase para mostrar na tela" }` com o código certo (400, 401, 403, 404, 409).

## Segurança

- Senha guardada só como **hash BCrypt**.
- O login gera um **token aleatório** que vale 30 dias; no banco fica só o **resumo SHA-256** dele.
- Rotas `/admin/**` só abrem para contas de administrador, e o admin só vê os clientes da **própria academia**.
- **CORS** liberado só para o site no GitHub Pages e para o Vite no computador (`saudelife.origens`).

## Organização do código

```
src/main/java/br/com/saudelife/api/
  SaudeLifeApplication.java   liga o servidor
  modelo/        tabelas do banco (Usuario, Academia, Treino, SessaoTreino, Refeicao, Peso, Ponto, Aviso...)
  repositorio/   acesso ao banco (Spring Data: buscar, salvar, apagar)
  dto/           formatos do JSON que entra e sai
  controle/      rotas (Auth, Me, Treino, Cliente, Admin, Plano)
  servico/       regras (conta, pontos, datas)
  seguranca/     login por token
  config/        CORS, rotas públicas e contas de demonstração
  erro/          erros no formato { "erro": "..." }
src/main/resources/
  application.properties            H2 (padrão)
  application-postgres.properties   PostgreSQL (Render)
  application-sqlserver.properties  SQL Server
```

## Colocar na internet (Render, grátis)

O arquivo `render.yaml` (na raiz do repositório) cria a API e o banco PostgreSQL de uma vez.

1. Crie uma conta em https://render.com (pode entrar com o GitHub).
2. **New > Blueprint**, escolha o repositório `saude-life` e clique em **Apply**.
3. Espere uns 5 minutos. A API fica em **https://saudelife-api.onrender.com/v1** (confira o nome no painel; se for outro, ajuste `SAUDELIFE_API` no painel e o passo 4).
4. Ligue o site na API: no arquivo `.env.production` (raiz do projeto), troque para
   `VITE_API_URL=https://saudelife-api.onrender.com/v1`, rode `npm run build` e mande para o GitHub.

> No plano grátis, a API "dorme" depois de 15 minutos parada: a primeira chamada demora uns 50 segundos. Antes de apresentar, abra o site uma vez para acordar.
> O banco grátis do Render vale por 30 dias; depois é preciso criar outro (ou pagar o plano básico).

## E-mail de verdade (esqueci a senha)

No painel do Render (**saudelife-api > Environment**), preencha:

| Variável | Exemplo (Gmail) |
|---|---|
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_USUARIO` | `seuemail@gmail.com` |
| `MAIL_SENHA` | "Senha de app" do Google (Conta Google > Segurança > Senhas de app) |

Depois troque `SAUDELIFE_MOSTRAR_LINK` para `false` (o link deixa de aparecer na tela e só vai por e-mail).

## Pagamento de verdade (Mercado Pago)

1. Crie uma conta em https://www.mercadopago.com.br/developers e uma aplicação.
2. Copie o **Access Token** (para testar, use o de **teste**; para cobrar de verdade, o de **produção**).
3. No painel do Render, preencha `MERCADOPAGO_TOKEN` com ele.

Pronto: na tela **Planos** do site aparece "Pagar com Pix ou cartão (Mercado Pago)". A pessoa paga na página do Mercado Pago, volta para o site e o plano ativa sozinho quando o pagamento é aprovado (o Mercado Pago avisa a rota `/webhooks/pagamento`, e a API confere o pagamento direto no Mercado Pago antes de ativar).

## Como o site usa a API

Com `VITE_API_URL` preenchido, o site:
- entra, cria conta e troca senha pela API;
- ao abrir cada tela, baixa os dados da conta do servidor (fichas, histórico, pesos, refeições, água, avisos);
- a cada mudança, sobe para o servidor (fichas, treinos feitos, refeições, água, peso, perfil, pontos, avisos do admin);
- o painel do admin lista os clientes da academia pelo servidor e manda treinos por ele.

Sem `VITE_API_URL`, tudo continua salvo só no navegador (modo demonstração).
