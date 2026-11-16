# Usuários no projeto tcc-sem2-2026-saudelife

Copie as pastas `backend` e `frontend` deste .zip por cima das do projeto (mesmo lugar). São estes arquivos:

**API (backend/saudelife)**
- `pom.xml` (só adiciona o `spring-security-crypto`, para guardar a senha como hash)
- `src/main/resources/application.properties` (conexão com o SQL Server)
- `src/main/resources/application-h2.properties` (perfil para testar sem SQL Server)
- `src/main/java/br/com/belval/saudelife/model/Usuario.java` (tabela `usuarios`)
- `src/main/java/br/com/belval/saudelife/repository/UsuarioRepository.java`
- `src/main/java/br/com/belval/saudelife/controller/UsuarioController.java` (rotas `/usuarios`)
- `banco/criar-banco.sql` (cria o banco no SSMS)

**Site (frontend/saudelife)**
- `src/services/usuarioService.js` (chama a API)
- `src/pages/ListaUsuarios.jsx`, `NovoUsuario.jsx`, `EditarUsuario.jsx`
- `src/components/FormularioUsuario.jsx` (formulário do Novo e do Editar)
- `src/App.jsx` (rotas `/usuarios`), `src/components/Menu.jsx` (menu Usuários ligado), `src/index.css` (campo de seleção)

## Passo a passo

1. **SQL Server:** no SSMS, abra `backend/saudelife/banco/criar-banco.sql` e aperte F5 (cria o banco `saudelife`).
   O usuário `sa` precisa estar ligado e a porta 1433 habilitada (SQL Server Configuration Manager > TCP/IP).
2. **Senha do banco:** em `application.properties`, troque `SuaSenha#2026` pela senha do seu `sa`.
3. **API:** no Spring Tools, **File > Import > Existing Maven Projects** > pasta `backend/saudelife`.
   Depois, botão direito em `SaudelifeApplication.java` > **Run As > Spring Boot App**.
   Tem que aparecer "Started SaudelifeApplication" no console. A tabela `usuarios` é criada sozinha.
4. **Site:** no terminal (Git Bash), dentro de `frontend/saudelife`: `npm install` e `npm run dev`.
5. Abra http://localhost:5173/usuarios.

**Sem SQL Server ainda?** Rode a API com o perfil H2: no Spring Tools, **Run As > Run Configurations > Arguments >
Program arguments**: `--spring.profiles.active=h2`. Os dados ficam na memória e somem ao desligar.

## Rotas da API
| Método | Endereço | O que faz |
|---|---|---|
| GET | /usuarios | lista todos |
| GET | /usuarios/{id} | busca um |
| POST | /usuarios | cadastra (201) |
| PUT | /usuarios/{id} | altera (senha em branco mantém a antiga) |
| DELETE | /usuarios/{id} | apaga (204) |

JSON de exemplo:
`{ "nomeCompleto": "Maria Souza", "email": "maria@teste.com", "senha": "senha1234", "tipoUsuario": "CLIENTE", "dataNascimento": "2005-03-10" }`
