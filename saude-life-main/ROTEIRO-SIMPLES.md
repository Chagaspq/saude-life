# Roteiro da apresentação: Saúde Life

**Como ler:** cada pessoa tem as suas falas numeradas, na ordem.
- **MOSTRAR** é o que deixar aberto na tela.
- **FALAR** é o que dizer (pode falar com as suas palavras).

**Ordem do vídeo:**
1. Gabriel abre e mostra o app.
2. Rafael explica o front-end.
3. Tomas explica a API.
4. Hiago explica o banco.
5. Rafael mostra o cadastro do começo ao fim.
6. Todos falam as dificuldades.
7. Gabriel fecha.

Tempo total: uns 15 minutos.

---

## GABRIEL

**1. Abertura**
MOSTRAR: slide com "Saúde Life" e os nomes do grupo.
FALAR: "Olá! Somos Gabriel, Rafael, Tomas e Hiago, do curso ______, da ______. O nosso TCC é o Saúde Life, um app de treino com acompanhamento da academia."

**2. O problema**
MOSTRAR: o mesmo slide.
FALAR: "Muita gente começa a treinar e desiste em poucas semanas. E a academia não sabe quem sumiu."

**3. O objetivo**
MOSTRAR: o mesmo slide.
FALAR: "O Saúde Life ajuda a pessoa a não desistir, com treino guiado, metas e pontos. E a academia tem um painel para acompanhar os alunos."

**4. Página inicial**
MOSTRAR: o site aberto na página inicial. Marque as 3 séries do exemplo.
FALAR: "Essa é a página inicial. Dá para testar o app aqui mesmo, sem criar conta."

**5. Criar conta e entrar**
MOSTRAR: a tela "Criar conta". Depois entre com "Demonstração: cliente".
FALAR: "Na hora de criar a conta, a pessoa escolhe se é cliente ou academia. Vou entrar como cliente."

**6. Tela inicial do app**
MOSTRAR: a tela Início.
FALAR: "Aqui a pessoa vê a meta da semana, quantos dias seguidos treinou e os pontos."

**7. Treino**
MOSTRAR: Treinos, depois Iniciar treino. Marque 2 séries e finalize.
FALAR: "O treino é guiado. Cada série marcada vale pontos e o descanso conta sozinho. No fim aparece o resumo."

**8. Painel da academia**
MOSTRAR: saia e entre com "Demonstração: administrador".
FALAR: "A academia tem o painel dela: vê quem treinou, manda treinos e manda avisos para os alunos."

**9. Minha dificuldade**
MOSTRAR: slide ou o próprio rosto.
FALAR: "A minha dificuldade foi que o app tinha telas demais. Aprendi a focar no que é mais importante."

**10. Encerramento**
MOSTRAR: slide final com os nomes.
FALAR: "Mostramos o app funcionando, a parte visual, a API e o banco de dados. Obrigado pela atenção!"

---

## RAFAEL

**1. Front-end: o que usamos**
MOSTRAR: VS Code com a pasta site aberta.
FALAR: "O front-end é a parte que aparece na tela. Fizemos com React, que é uma biblioteca de JavaScript para montar telas."

**2. Pastas**
MOSTRAR: a pasta src, com as pastas paginas e componentes.
FALAR: "Cada tela fica em um arquivo, na pasta páginas. As peças que se repetem, como cartões e botões, ficam na pasta componentes."

**3. Componente**
MOSTRAR: o arquivo base.jsx, no CartaoNumero. Depois a tela Início.
FALAR: "Esse cartão é um componente. A gente escreve uma vez e usa em várias telas, só trocando o texto."

**4. Troca de telas**
MOSTRAR: o arquivo rotas.jsx. Depois clique entre as telas do site.
FALAR: "Aqui ficam os endereços de cada tela. O React Router troca de tela sem recarregar a página, por isso fica rápido."

**5. Celular**
MOSTRAR: diminua a janela do navegador.
FALAR: "No celular a tela se arruma sozinha e o menu vai para baixo."

**6. Cadastro do começo ao fim: a tela**
MOSTRAR: a tela de usuários. Clique em "+ Novo Usuário", preencha e salve.
FALAR: "Agora vou mostrar um cadastro do começo ao fim. Preencho os dados e clico em Salvar."

**7. Cadastro: o caminho**
MOSTRAR: o arquivo usuarioService.js e depois o UsuarioController.java.
FALAR: "A tela manda os dados para a API. A API confere se está tudo certo e grava no banco."

**8. Cadastro: no banco e de volta**
MOSTRAR: no SQL Server, o SELECT na tabela de usuários. Depois a lista na tela.
FALAR: "O usuário novo já está no banco. E a tela mostra 'Usuário criado com sucesso', com ele na lista. Dá também para editar e apagar."

**9. Minha dificuldade**
MOSTRAR: slide ou o próprio rosto.
FALAR: "A minha dificuldade foi passar o site todo para React sem mudar o visual. Aprendi a dividir a tela em partes menores."

---

## TOMAS

**1. O que é a API**
MOSTRAR: Spring Tools com o projeto aberto.
FALAR: "A API é o meio do caminho entre a tela e o banco. Ela recebe os dados, confere e guarda no banco. Fizemos em Java, com Spring Boot."

**2. As partes da API**
MOSTRAR: as pastas model, repository e controller.
FALAR: "Em model está o usuário, que vira a tabela do banco. Em repository fica o acesso ao banco. E em controller ficam os caminhos que a tela chama."

**3. Os caminhos (rotas)**
MOSTRAR: o arquivo UsuarioController.java.
FALAR: "Temos um caminho para listar os usuários, um para cadastrar, um para editar e um para apagar."

**4. Ligação com o banco**
MOSTRAR: o arquivo application.properties.
FALAR: "Aqui a API se liga no SQL Server. E a tabela de usuários é criada sozinha quando a API liga."

**5. Conferência dos dados**
MOSTRAR: a parte do controller que confere os dados.
FALAR: "A API não aceita dado errado: e-mail inválido, senha curta ou e-mail repetido. Ela devolve uma mensagem explicando o erro."

**6. Senha protegida**
MOSTRAR: a mesma tela.
FALAR: "A senha é guardada embaralhada. Nem quem olha o banco consegue ler."

**7. Teste no Postman**
MOSTRAR: o Postman listando os usuários. Depois um cadastro com e-mail repetido.
FALAR: "Aqui a lista de usuários, sem a senha. E se eu tento repetir o e-mail, a API avisa: 'Já existe um usuário com este e-mail'."

**8. Minha dificuldade**
MOSTRAR: slide ou o próprio rosto.
FALAR: "A minha dificuldade foi a segurança: proteger a senha e não deixar entrar dado errado."

---

## HIAGO

**1. Painel da academia (na demonstração)**
MOSTRAR: o painel do administrador.
FALAR: "A academia vê os alunos, manda treinos e publica avisos. O aluno recebe tudo na tela inicial."

**2. Acessibilidade**
MOSTRAR: o botão de Exibição (tema, letra e idioma).
FALAR: "Pensamos em acessibilidade: tema claro e escuro, letra maior, alto contraste, Libras e três idiomas."

**3. O banco de dados**
MOSTRAR: o SQL Server Management Studio aberto.
FALAR: "O nosso banco é o SQL Server, da Microsoft. É onde ficam guardados os dados de verdade."

**4. A tabela de usuários**
MOSTRAR: a tabela usuarios, nas colunas.
FALAR: "Essa é a tabela de usuários. Cada usuário tem um número (id), que o banco cria sozinho, mais o nome, o e-mail, a senha, o tipo e a data de nascimento."

**5. Ver os usuários**
MOSTRAR: rode `SELECT * FROM usuarios;`
FALAR: "Aqui estão os usuários que cadastramos pela tela."

**6. Senha protegida**
MOSTRAR: a coluna senha.
FALAR: "Reparem que a senha aparece toda embaralhada. Ninguém consegue ler."

**7. Filtrar e contar**
MOSTRAR: rode `SELECT tipo_usuario, COUNT(*) FROM usuarios GROUP BY tipo_usuario;`
FALAR: "Aqui contamos quantos clientes e quantos administradores existem."

**8. E-mail que não repete**
MOSTRAR: tente cadastrar um e-mail que já existe.
FALAR: "O banco não deixa repetir o e-mail. Cada pessoa tem um só."

**9. Minha dificuldade**
MOSTRAR: slide ou o próprio rosto.
FALAR: "A minha dificuldade foi ligar a API no SQL Server. Aprendi que tem que planejar o banco antes de programar."

---

## TODOS (no fim)
FALAR (uma pessoa): "Com esse projeto aprendemos a ligar a tela, a API e o banco de dados, a usar o GitHub e a colocar o site na internet."

---

## ANTES DE GRAVAR
1. SQL Server ligado e o banco criado (arquivo `criar-banco.sql`, apertar F5).
2. API ligada: no terminal, na pasta `backend`, rodar `.\mvnw spring-boot:run`.
3. Tela de usuários ligada: no outro terminal, na pasta `frontend`, rodar `npm run dev`.
4. Cadastrar 2 ou 3 usuários antes.
5. Site aberto: https://chagaspq.github.io/saude-life/
6. Zoom da tela em 150%, para dar para ler no vídeo.
