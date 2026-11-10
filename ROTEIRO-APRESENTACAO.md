# Roteiro da apresentação do TCC: Saúde Life (cerca de 15 minutos)

**Grupo:** Gabriel Chagas (08) · Rafael (PH) Santos (15) · Tomas de Oliveira (17) · Hiago Tetsuo (10)
**Curso:** [curso] · **Instituição:** [instituição]

| Integrante | Nome | Nº | Partes |
|---|---|---|---|
| 1 | Gabriel Chagas | 08 | 1. Abertura · 2. Demonstração · 8. Encerramento |
| 2 | Rafael (PH) Santos | 15 | 3. Front-end · 6. Fluxo completo |
| 3 | Tomas de Oliveira | 17 | 4. Back-end |
| 4 | Hiago Tetsuo | 10 | 5. Banco de dados |
| Todos | — | — | 7. Dificuldades e aprendizados |

## Antes de começar (10 minutos antes)

1. **Acorde o servidor:** abra https://chagaspq.github.io/saude-life, vá em **Entrar > Demonstração: cliente** e espere abrir (na primeira vez pode levar até 1 minuto). Depois **Perfil > Sair da conta**.
2. Deixe abertos no computador:
   - o **site** (tela de Entrar) e, em outra aba, a página inicial (`welcome`);
   - o **VS Code** com a pasta `src/` (front-end React);
   - o **Spring Tools** com o projeto `backend` (API);
   - o **SSMS** com o banco `saudelife` (SQL Server);
   - o **Postman** com a coleção `backend/saude-life-api.postman_collection.json`, já com o **Login cliente demo** rodado.
3. Tema escuro, idioma português.

---

## 1. Abertura (Gabriel, 1 min)

> "Olá! Somos Gabriel Chagas, número 08, Rafael Santos, 15, Tomas de Oliveira, 17, e Hiago Tetsuo, 10, do curso [curso], da [instituição]. Vamos apresentar o **Saúde Life**, um app de treino com acompanhamento de academia."

- **Problema:** muita gente começa a treinar e desiste; a academia não sabe quem sumiu.
- **Solução:** treino guiado, pontos para manter a constância e um painel para a academia ou o personal acompanhar os clientes.
- Dois acessos: **cliente** (quem treina) e **administrador** (academia ou personal).

## 2. Demonstração (Gabriel, 3 min)

Na página inicial e depois em **Entrar > Demonstração: cliente**:
- **Início:** meta da semana, pontos, próximo treino. Só 5 abas: Início, Treinos, Alimentação, Evolução, Perfil.
- **Treinos > Iniciar treino:** marque 2 séries, mostre o descanso contando e os pontos. Finalize e mostre o resumo (duração, séries, volume, calorias).
- **Alimentação:** adicione uma refeição (a busca de comida calcula calorias e proteína) e um copo d'água.
- **Evolução:** gráfico de peso e de treinos por semana.

## 3. Front-end (Rafael, 2 min)

- Feito em **React 18** com **Vite**; publicado no **GitHub Pages**.
- Mostre no VS Code a pasta `src/`:
  - `src/paginas/`: uma página por tela (`login.jsx`, `inicio.jsx`, `treino.jsx`, `admin.jsx`...);
  - `src/componentes/`: peças reaproveitadas (casco do app, janelas, cartões, formulários);
  - `src/lib/api.js`: é aqui que o site conversa com a API.
- Responsivo (celular com menu embaixo), tema claro e escuro, acessibilidade (tamanho da letra, alto contraste, menos movimento) e 3 idiomas (português, inglês e espanhol).

## 4. Back-end (Tomas, 2 min)

- API REST em **Java 17 + Spring Boot 3**, publicada no **Render**.
- Mostre no Spring Tools a pasta `backend/src/main/java/br/com/saudelife/api/`:
  - `modelo/`: as tabelas como classes (Usuario, Treino, Refeicao...);
  - `repositorio/`: acesso ao banco (Spring Data JPA);
  - `controle/`: as rotas;
  - `seguranca/`: login por token.
- Rotas principais: `POST /auth/login`, `POST /auth/cadastro`, `GET /treinos`, `POST /sessoes` (treino concluído), `POST /refeicoes`, `POST /pesos`, `GET /admin/clientes`, `POST /admin/clientes/{id}/treinos`, `POST /admin/avisos`.
- **No Postman:** mostre o `GET /treinos` respondendo em JSON.
- **Segurança:** senha só como hash **BCrypt**; o login gera um token; o admin só vê os clientes da academia dele.

## 5. Banco de dados (Hiago, 2 min)

- **SQL Server** (no computador, com o SSMS). No ar, a mesma API usa **PostgreSQL**, porque o servidor grátis só oferece esse; o código não muda, só a configuração.
- Mostre no SSMS as **12 tabelas**: `usuarios`, `academias`, `treinos`, `treino_itens`, `sessoes_treino`, `refeicoes`, `agua_dia`, `pesos`, `pontos`, `avisos`, `sessoes_login` e `redefinicoes_senha`.
- Relações principais: um **usuário** pertence a uma **academia**; um usuário tem vários **treinos**, cada treino tem vários **exercícios** (`treino_itens`); um usuário tem vários **treinos concluídos**, **refeições**, **pesos** e **pontos**; a academia tem vários **avisos**.
- Mostre os dados: botão direito em `usuarios` > **Select Top 1000 Rows** (repare que a senha está como hash, nunca o texto).
- Script do banco: `backend/banco/banco-de-dados-sqlserver.sql`.

## 6. Fluxo completo (Rafael, 2 min)

Mostra as três partes conversando:
1. No site, **Sair** e entrar com **Demonstração: administrador**: selo ADMIN, faixa verde e código da academia **SL-DEMO**.
2. O treino que o Gabriel fez agora há pouco já aparece no cliente de demonstração.
3. **Mandar treino** para o cliente e **publicar um aviso**.
4. Sair, entrar como cliente: o aviso aparece no Início e o treino recebido aparece em Treinos.
5. (Opcional) Atualize o SSMS: a linha nova aparece na tabela `avisos`.

> Caminho: **site (React)** → **API (Spring Boot)** → **banco (SQL Server / PostgreSQL)**.

## 7. Dificuldades e aprendizados (todos, 2 min — cada um fala uma)

Sugestões (troquem pelo que viveram de verdade):
- **Gabriel:** deixar o app simples (MVP): tiramos várias telas para focar no que importa.
- **Rafael:** passar o site para React e manter o mesmo visual.
- **Tomas:** segurança do login (hash de senha, token) e cada pessoa só ver os próprios dados.
- **Hiago:** desenhar as tabelas e fazer a mesma API funcionar com SQL Server e PostgreSQL.

## 8. Encerramento (Gabriel, 1 min)

- **Próximos passos:** pagamento de verdade (Mercado Pago, já integrado, falta ativar), e-mail de recuperação de senha, app na loja e conta de academia verificada.
- "Obrigado! Ficamos à disposição para perguntas."

---

## Perguntas que a banca pode fazer

- **Onde ficam os dados?** No banco do servidor. A pessoa entra de qualquer celular e vê os mesmos dados.
- **Por que dois bancos?** O servidor grátis (Render) só oferece PostgreSQL; no computador usamos SQL Server. A API usa JPA, então troca de banco sem mudar o código.
- **A senha é segura?** Fica só como hash BCrypt. O token do login fica no banco só como resumo (SHA-256). Trocar a senha derruba os logins antigos.
- **Um cliente vê dados de outro?** Não: a API confere o token em toda chamada, e o admin só vê os clientes da própria academia.
- **Qualquer um pode ser administrador?** No MVP sim, para a demonstração. Na versão comercial, só academias e personais verificados.
- **E o pagamento?** A integração com o Mercado Pago (Pix e cartão) está no código; falta colocar a chave da conta. Hoje é demonstração.
- **E a LGPD?** Termos de Uso, Política de Privacidade e, no Perfil, baixar ou excluir todos os próprios dados.
- **Como testaram?** Teste automático da API e testes de ponta a ponta (site + API) no PostgreSQL e no SQL Server.

## Se algo der errado

- **Login demorando:** o servidor está acordando; espere até 1 minuto.
- **Travou:** Ctrl+F5.
- **Sem internet:** rode a API no Spring Tools com o SQL Server (perfil `sqlserver`) e mostre pelo Postman.
