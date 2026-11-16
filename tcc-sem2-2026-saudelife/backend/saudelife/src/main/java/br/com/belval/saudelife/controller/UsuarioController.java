package br.com.belval.saudelife.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.belval.saudelife.model.Usuario;
import br.com.belval.saudelife.repository.UsuarioRepository;

// Rotas da API de usuários: http://localhost:8080/usuarios
@RestController
@RequestMapping("/usuarios")
// Deixa o site React (npm run dev, porta 5173) chamar esta API
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class UsuarioController {

	// Tipos de usuário aceitos
	private static final List<String> TIPOS = List.of("CLIENTE", "ADMINISTRADOR");

	// Acesso ao banco
	private final UsuarioRepository repositorio;

	// Embaralha a senha (hash BCrypt): o banco nunca guarda a senha de verdade
	private final BCryptPasswordEncoder codificador = new BCryptPasswordEncoder();

	// O Spring entrega o repositório pronto (injeção pelo construtor)
	public UsuarioController(UsuarioRepository repositorio) {
		// Guarda
		this.repositorio = repositorio;
	}

	// GET /usuarios: lista todos (ordem de cadastro)
	@GetMapping
	public List<Usuario> listar() {
		// SELECT * FROM usuarios
		return repositorio.findAll();
	}

	// GET /usuarios/{id}: busca um (404 se não existe)
	@GetMapping("/{id}")
	public ResponseEntity<Usuario> buscar(@PathVariable Long id) {
		// Achou: 200 com o usuário; não achou: 404
		return repositorio.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	// POST /usuarios: cadastra (201 se deu certo, 400 se faltou algo, 409 se o e-mail já existe)
	@PostMapping
	public ResponseEntity<?> criar(@RequestBody Usuario novo) {
		// Confere os campos (senha obrigatória ao criar)
		String problema = conferir(novo, true);
		// Tem problema: 400 com a frase
		if (problema != null) {
			return ResponseEntity.badRequest().body(problema);
		}
		// E-mail repetido: 409
		if (repositorio.existsByEmailIgnoreCase(novo.getEmail().trim())) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Já existe um usuário com este e-mail.");
		}
		// Garante que é um cadastro novo (o banco gera o id)
		novo.setId(null);
		// Limpa os textos
		limpar(novo);
		// Senha vira hash
		novo.setSenha(codificador.encode(novo.getSenha()));
		// INSERT INTO usuarios ...
		Usuario salvo = repositorio.save(novo);
		// 201 Created com o usuário salvo (sem a senha)
		return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
	}

	// PUT /usuarios/{id}: altera (senha em branco = mantém a senha antiga)
	@PutMapping("/{id}")
	public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Usuario dados) {
		// Usuário que vai ser alterado
		Usuario atual = repositorio.findById(id).orElse(null);
		// Não existe: 404
		if (atual == null) {
			return ResponseEntity.notFound().build();
		}
		// Confere os campos (senha opcional ao editar)
		String problema = conferir(dados, false);
		// Tem problema: 400
		if (problema != null) {
			return ResponseEntity.badRequest().body(problema);
		}
		// E-mail já usado por outro usuário: 409
		if (repositorio.existsByEmailIgnoreCaseAndIdNot(dados.getEmail().trim(), id)) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Já existe um usuário com este e-mail.");
		}
		// Limpa os textos
		limpar(dados);
		// Copia os campos novos
		atual.setNomeCompleto(dados.getNomeCompleto());
		// E-mail
		atual.setEmail(dados.getEmail());
		// Tipo
		atual.setTipoUsuario(dados.getTipoUsuario());
		// Nascimento
		atual.setDataNascimento(dados.getDataNascimento());
		// Senha nova (se veio)
		if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
			// Hash da senha nova
			atual.setSenha(codificador.encode(dados.getSenha()));
		}
		// UPDATE usuarios SET ... WHERE id = ?
		return ResponseEntity.ok(repositorio.save(atual));
	}

	// DELETE /usuarios/{id}: apaga (204 se apagou, 404 se não existe)
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> apagar(@PathVariable Long id) {
		// Não existe: 404
		if (!repositorio.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		// DELETE FROM usuarios WHERE id = ?
		repositorio.deleteById(id);
		// 204 No Content
		return ResponseEntity.noContent().build();
	}

	// Confere os campos e devolve a frase do problema (ou null se está tudo certo)
	private String conferir(Usuario u, boolean senhaObrigatoria) {
		// Nome
		if (vazio(u.getNomeCompleto())) {
			return "Informe o nome completo.";
		}
		// E-mail vazio
		if (vazio(u.getEmail())) {
			return "Informe o e-mail.";
		}
		// E-mail sem formato de e-mail
		if (!u.getEmail().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
			return "Informe um e-mail válido.";
		}
		// Senha (obrigatória ao criar; ao editar só confere se veio)
		if ((senhaObrigatoria || !vazio(u.getSenha())) && (vazio(u.getSenha()) || u.getSenha().length() < 8)) {
			return "A senha precisa ter pelo menos 8 caracteres.";
		}
		// Tipo
		if (vazio(u.getTipoUsuario()) || !TIPOS.contains(u.getTipoUsuario().trim().toUpperCase())) {
			return "Escolha o tipo de usuário: CLIENTE ou ADMINISTRADOR.";
		}
		// Nascimento no futuro
		if (u.getDataNascimento() != null && u.getDataNascimento().isAfter(LocalDate.now())) {
			return "A data de nascimento não pode ser no futuro.";
		}
		// Tudo certo
		return null;
	}

	// Tira espaços das pontas e padroniza e-mail (minúsculo) e tipo (maiúsculo)
	private void limpar(Usuario u) {
		// Nome
		u.setNomeCompleto(u.getNomeCompleto().trim());
		// E-mail
		u.setEmail(u.getEmail().trim().toLowerCase());
		// Tipo
		u.setTipoUsuario(u.getTipoUsuario().trim().toUpperCase());
	}

	// Texto vazio ou só com espaços?
	private boolean vazio(String texto) {
		// Nulo ou em branco
		return texto == null || texto.isBlank();
	}
}
