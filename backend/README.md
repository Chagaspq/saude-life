# Saúde Life — API (Java + Spring Boot)

Servidor do Saúde Life: contas (cliente e administrador), treinos, histórico, refeições, água, peso, pontos, avisos e painel do admin.
Feito em **Java 17** com **Spring Boot 3**, **Spring Data JPA** e banco **H2** (para testar) ou **PostgreSQL** (de verdade).

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

## Testes automáticos

No STS: botão direito em `src/test/java` > **Run As > JUnit Test**.
O teste `FluxoCompletoTest` liga o servidor e faz o caminho da apresentação: cadastro, login, treino, refeição, peso, pontos, admin mandando treino e aviso, troca de senha e sair.

Pelo terminal: `mvn test`.

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
  application-postgres.properties   PostgreSQL
```

## Próximo passo

Ligar o site (React) na API: trocar, tela por tela, o que hoje é salvo no navegador por chamadas `fetch` para estas rotas.
