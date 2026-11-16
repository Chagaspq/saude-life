# Roteiro por pessoa: Saúde Life

Ordem do vídeo: **1. Abertura (Gabriel) → 2. Demonstração (Gabriel) → 3. Front-end (Rafael) → 4. Back-end (Tomas) → 5. Banco de dados (Hiago) → 6. Fluxo completo (Rafael) → 7. Dificuldades (todos) → 8. Encerramento (Gabriel)**. Meta: uns 15 minutos.

Preencham antes: **[curso]** e **[instituição]**.

---

## GABRIEL CHAGAS (08): Abertura, Demonstração, Dificuldade e Encerramento (uns 5 min)

### Parte 1: Abertura (1 min)
**Na tela:** slide com "Saúde Life" e os 4 nomes.

> "Olá! Somos Gabriel Chagas, número 08, Rafael Santos, 15, Tomas de Oliveira, 17, e Hiago Tetsuo, 10, do curso [curso], da [instituição]. Nosso TCC é o Saúde Life, um aplicativo de treino com acompanhamento da academia."
>
> "O problema que a gente quis resolver: muita gente começa a treinar e desiste, e a academia não sabe quem sumiu nem consegue acompanhar cada aluno."
>
> "O nosso objetivo é ajudar a pessoa a manter a constância, com treino guiado, metas e pontos, e dar à academia um painel para acompanhar os clientes, mandar treinos e avisos."
>
> "No vídeo vamos mostrar o app funcionando, o front-end, o back-end, o banco de dados, um fluxo completo da tela até o banco, as dificuldades e a conclusão."

### Parte 2: Demonstração do aplicativo (3 min)
**Na tela:** o site aberto (https://chagaspq.github.io/saude-life/).

1. **Página inicial:** mostre o topo, os planos e "Marque uma série" (marque as 3 séries e mostre o confete).
   > "Essa é a página inicial. Dá para testar o app sem criar conta."
2. **Criar conta e entrar:** abra **Criar conta**, mostre a escolha **Sou cliente / Sou administrador**. Volte e entre com **Demonstração: cliente**.
3. **Início:** meta da semana, sequência e pontos.
   > "No Início a pessoa vê quanto falta para bater a meta da semana. O app tem só 5 abas: Início, Treinos, Alimentação, Evolução e Perfil."
4. **Treino guiado:** Treinos > **Iniciar treino**. Marque 2 séries, mostre o descanso contando e os pontos. Finalize e mostre o resumo.
   > "O treino é guiado: cada série marcada vale pontos e o descanso conta sozinho."
5. **Painel do administrador:** saia e entre com **Demonstração: administrador**. Mostre o selo ADMIN e a lista de clientes.
   > "A academia tem o painel dela: vê quem treinou, manda treinos e publica avisos."
6. (Se der tempo) Alimentação (refeição e água) e Evolução (gráfico de peso).

### Parte 7: Dificuldade (30 s)
> "A minha dificuldade foi que o app começou com telas demais. Aprendemos a fazer um MVP: focar no essencial e tirar o resto."
>
> "Como melhorias futuras, queremos ligar as outras telas do Saúde Life (treinos, alimentação e evolução) na API e no banco, fazer o login usando a tabela de usuários, o pagamento de verdade e o app na loja."

### Parte 8: Encerramento (1 min)
**Na tela:** slide final com os nomes e contatos.
> "Mostramos o Saúde Life funcionando, o front-end em React com React Router, a API em Java com Spring Boot e o banco no SQL Server, e como um cadastro na tela chega até o banco. Obrigado pela atenção!"

---

## RAFAEL (PH) SANTOS (15): Front-end, Fluxo completo e Dificuldade (uns 5 min)

### Parte 3: Front-end (2 min 30)
**Na tela:** VS Code e navegador lado a lado.

> "O front-end foi feito em React 18, com HTML, CSS e JavaScript. Usamos o Vite para rodar e gerar o site, e o React Router para trocar de tela."

- **Pastas** (abra `frontend/src/`):
  > "Em `paginas` ficam as telas, como login, início, treino e admin. Em `componentes` ficam as peças que a gente reaproveita. O `main.jsx` é o começo do app e o `rotas.jsx` tem as rotas: cada endereço mostra uma tela. Em `estilos` fica o CSS."
- **Componente** (abra `componentes/base.jsx`, `CartaoNumero`):
  > "Um componente é uma função que devolve um pedaço da tela e pode ser reaproveitada. O `CartaoNumero` aparece no Início, na Evolução e no painel do admin, só trocando o texto e o ícone."
- **Rotas** (abra `rotas.jsx` e depois `AppLayout.jsx`, função `destino`):
  > "O app tem um `index.html` só. Quando clico num link, o React Router troca a tela sem recarregar a página. O `AppLayout` controla quem pode abrir cada tela: sem login vai para o Login, e o cliente não abre o painel do admin."
- **CSS e celular** (abra `estilos/tokens.css` e `app.css`; diminua a janela ou use F12 > modo celular):
  > "As cores ficam em variáveis. No celular, o menu do lado vira o menu de baixo."

### Parte 6: Fluxo completo: cadastrar um usuário (2 min)
**Na tela:** tela de usuários, código e SSMS, nessa ordem.

1. **Usuário clica:** abra http://localhost:5173/usuarios > **+ Novo Usuário** > preencha > **Salvar**.
   > "O usuário preenche o formulário e clica em Salvar. Esse código está no `FormularioUsuario.jsx`, na função `salvar`."
2. **O front envia:** abra `services/usuarioService.js`, função `criarUsuario`.
   > "O front manda os dados em JSON para a API com um `fetch` do tipo POST em `/usuarios`."
3. **A API valida:** abra `UsuarioController.java`, método `criar`.
   > "A API confere os dados, vê se o e-mail já existe, embaralha a senha e salva com `repositorio.save`, que faz o INSERT."
4. **O banco grava:** no SSMS, rode `SELECT TOP 5 id, nome_completo, email FROM usuarios ORDER BY id DESC;`
   > "O usuário novo já está no SQL Server."
5. **A tela atualiza:**
   > "A API responde 201, a tela mostra 'Usuário criado com sucesso' e a lista já traz o usuário novo. Dá também para editar no lápis e apagar no X."
   > "Resumindo: tela, API, banco, resposta e tela atualizada."

### Parte 7: Dificuldade (30 s)
> "A minha dificuldade foi passar o site, que tinha várias páginas HTML, para um app React só com React Router, sem mudar o visual. Aprendi a dividir a tela em componentes."

---

## TOMAS DE OLIVEIRA (17): Back-end e Dificuldade (uns 3 min 30)

### Parte 4: Back-end (3 min)
**Na tela:** Spring Tools com o código e o Postman.

> "O back-end é uma API em Java 17 com Spring Boot. Usamos o Spring Data JPA para falar com o banco."

- **Pastas** (abra `backend/saudelife/src/main/java/br/com/belval/saudelife/`):
  > "Em `model` está a classe `Usuario`, que vira a tabela de usuários. Em `repository` está o `UsuarioRepository`: o Spring cria o SQL sozinho, como o `findAll` e o `save`. Em `controller` está o `UsuarioController`, com as rotas. A conexão com o banco fica no `application.properties`."
- **Papel da API:**
  > "A API recebe o que a tela manda, confere e grava ou lê no SQL Server."
- **Rotas** (mostre no controller):
  > "`GET /usuarios` lista todos, `GET /usuarios/{id}` busca um, `POST` cadastra, `PUT` altera e `DELETE` apaga."
- **Conexão** (abra `application.properties`):
  > "Essa linha liga no SQL Server: `localhost`, porta 1433, banco `saudelife`. O `ddl-auto=update` cria a tabela a partir da classe."
- **Validações** (mostre o método `conferir`):
  > "A API não aceita nome vazio, e-mail inválido, senha com menos de 8 caracteres nem nascimento no futuro. Se der errado, volta erro 400 com a frase. E-mail repetido volta 409."
- **Segurança:**
  > "A senha é guardada como hash BCrypt e nunca aparece no JSON. E o `@CrossOrigin` só libera o nosso site."
- **No Postman:**
  1. `GET http://localhost:8080/usuarios`
     > "Aqui está a lista em JSON. Reparem que não aparece a senha."
  2. `POST` com um e-mail que já existe
     > "E aqui o erro 409: 'Já existe um usuário com este e-mail.'"

### Parte 7: Dificuldade (30 s)
> "A minha dificuldade foi a segurança: guardar a senha como hash e fazer a API recusar dados errados com uma mensagem clara."

---

## HIAGO TETSUO (10): Banco de dados e Dificuldade (uns 3 min 30)

### Parte 5: Banco de dados (3 min)
**Na tela:** SSMS com a tabela e as consultas.

> "O nosso banco é o SQL Server, um banco relacional da Microsoft que estudamos no curso. Usamos o SQL Server Management Studio para ver os dados."

- **Criação** (abra `banco/criar-banco.sql`):
  > "Esse script cria o banco `saudelife`. A tabela de usuários a própria API cria quando liga, a partir da classe `Usuario`."
- **Tabela** (no SSMS: Bancos de dados > saudelife > Tabelas > dbo.usuarios > Colunas e Chaves):
  > "A chave primária é o `id`: o banco gera 1, 2, 3 sozinho. Também tem nome completo, e-mail, senha, tipo, data de nascimento e data de cadastro. O e-mail é único: não deixa repetir."
- **Consultas** (nova consulta no SSMS; rode uma de cada vez):
  - `SELECT id, nome_completo, email, tipo_usuario, data_nascimento FROM usuarios;`
    > "Aqui estão os usuários que cadastramos pela tela."
  - `SELECT email, senha FROM usuarios;`
    > "A senha aparece só embaralhada, começando com `$2a$10$`."
  - `SELECT nome_completo FROM usuarios WHERE tipo_usuario = 'CLIENTE' ORDER BY nome_completo;`
    > "Só os clientes, em ordem alfabética."
  - `SELECT tipo_usuario, COUNT(*) AS total FROM usuarios GROUP BY tipo_usuario;`
    > "Quantos clientes e quantos administradores existem."
  - Um `INSERT` com e-mail repetido:
    > "Se eu tento repetir um e-mail, o banco recusa por causa da chave única."
- **Próximos passos:**
  > "As próximas tabelas, como treinos, refeições e pesos, vão se ligar à tabela de usuários pela chave estrangeira `usuario_id`."

### Parte 7: Dificuldade (30 s)
> "A minha dificuldade foi ligar a API no SQL Server: habilitar o usuário `sa`, a porta 1433 e garantir que o e-mail não se repete."

---

## TODOS: no fim da Parte 7
> "O que o grupo aprendeu: fazer o front-end, o back-end e o banco conversarem, usar Git e GitHub e publicar o site na internet."

## Antes de gravar (checklist)
- [ ] SSMS: rodar `criar-banco.sql` (F5) e colocar a senha do `sa` no `application.properties`.
- [ ] API ligada (Spring Tools: Run As > Spring Boot App, ou no terminal: `.\mvnw spring-boot:run`) e com "Started SaudelifeApplication" no console.
- [ ] Tela de usuários ligada (`npm install` e `npm run dev` em `tcc-sem2-2026-saudelife\frontend\saudelife`) e 2 ou 3 usuários cadastrados.
- [ ] Site aberto: https://chagaspq.github.io/saude-life/ (cliente demo com 1 treino feito).
- [ ] Postman com o GET e o POST prontos.
- [ ] Zoom em 150% no VS Code, Spring Tools e SSMS.
