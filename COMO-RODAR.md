# Como rodar a API e a tela de usuários

O projeto tem três pastas principais:

| Pasta | O que é | Como abre |
|---|---|---|
| `backend/` | **API** em Java + Spring Boot, com a tabela `usuarios` no **SQL Server** | Spring Tools ou terminal (`.\mvnw spring-boot:run`) |
| `frontend/` | **Tela de usuários** em React (lista, novo, editar e apagar), ligada na API | VS Code + terminal (`npm run dev`) |
| `site/` | **Site do Saúde Life** em React (o que está no ar) | VS Code + terminal (`npm run dev`) |

## 1. Banco (SQL Server)
1. No **SQL Server Management Studio**, abra `backend/banco/criar-banco.sql` e aperte **F5** (cria o banco `saudelife`).
2. O usuário `sa` precisa estar ligado ("Autenticação do SQL Server") e a porta **1433** habilitada (SQL Server Configuration Manager > TCP/IP).
3. Em `backend/src/main/resources/application.properties`, troque `SuaSenha#2026` pela senha do seu `sa`.

## 2. API (pasta `backend`)
- **No Spring Tools:** **File > Import > Existing Maven Projects** > pasta `backend`. Botão direito em `SaudelifeApplication.java` > **Run As > Spring Boot App**.
- **Ou no terminal (PowerShell), dentro da pasta `backend`:**
  ```
  .\mvnw spring-boot:run
  ```
- Tem que aparecer **"Started SaudelifeApplication"**. A tabela `usuarios` é criada sozinha.
- **Sem SQL Server ainda?** Rode com o banco de teste na memória:
  `.\mvnw spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=h2"`

A API fica em **http://localhost:8080/usuarios**.

## 3. Tela de usuários (pasta `frontend`)
Em **outro terminal**, dentro da pasta `frontend`:
```
npm install
npm run dev
```
Abra **http://localhost:5173/usuarios**. A API (passo 2) precisa estar ligada ao mesmo tempo.

## Arquivos da parte de usuários

**API (`backend`)**
- `src/main/java/br/com/belval/saudelife/model/Usuario.java`: a tabela `usuarios`
- `src/main/java/br/com/belval/saudelife/repository/UsuarioRepository.java`: acesso ao banco
- `src/main/java/br/com/belval/saudelife/controller/UsuarioController.java`: as rotas `/usuarios`
- `src/main/resources/application.properties`: conexão com o SQL Server
- `src/main/resources/application-h2.properties`: banco de teste (perfil `h2`)
- `banco/criar-banco.sql`: cria o banco no SSMS

**Tela (`frontend`)**
- `src/services/usuarioService.js`: chama a API
- `src/pages/ListaUsuarios.jsx`, `NovoUsuario.jsx`, `EditarUsuario.jsx`: as telas
- `src/components/FormularioUsuario.jsx`: o formulário do Novo e do Editar
- `src/App.jsx`: as rotas `/usuarios`; `src/components/Menu.jsx`: o menu

## Rotas da API
| Método | Endereço | O que faz |
|---|---|---|
| GET | /usuarios | lista todos |
| GET | /usuarios/{id} | busca um |
| POST | /usuarios | cadastra (201) |
| PUT | /usuarios/{id} | altera (senha em branco mantém a antiga) |
| DELETE | /usuarios/{id} | apaga (204) |

JSON de exemplo (Postman, POST):
`{ "nomeCompleto": "Maria Souza", "email": "maria@teste.com", "senha": "senha1234", "tipoUsuario": "CLIENTE", "dataNascimento": "2005-03-10" }`

## Erros comuns
- **"Failed to fetch" na tela:** a API não está ligada (passo 2).
- **`npm install` dá erro de package.json:** você está na pasta errada. O `npm` é só na pasta `frontend` (ou `site`); na pasta `backend` use o `.\mvnw`.
- **API não conecta no banco:** confira a senha do `sa`, a porta 1433 e se rodou o `criar-banco.sql`.
