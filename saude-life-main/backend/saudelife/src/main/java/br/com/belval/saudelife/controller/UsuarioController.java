package br.com.belval.saudelife.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

	private static final List<String> TIPOS = List.of("CLIENTE", "ADMINISTRADOR");

	@Autowired
	private UsuarioRepository usuarioRepository;

	@PostMapping
	public ResponseEntity<Object> criarUsuario(@RequestBody Usuario usuario) {
		String problema = conferir(usuario, true);
		if (problema != null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problema);
		}
		if (usuarioRepository.existsByEmailIgnoreCase(usuario.getEmail().trim())) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Já existe um usuário com este e-mail.");
		}
		usuario.setId(null);
		limpar(usuario);
		usuario.setSenha(criptografar(usuario.getSenha()));
		System.out.println("Chegou: " + usuario);
		Usuario salvo = usuarioRepository.save(usuario);
		return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Object> obterUsuario(@PathVariable UUID id) {
		Optional<Usuario> optional = usuarioRepository.findById(id);
		if (optional.isPresent()) {
			return ResponseEntity.status(HttpStatus.OK).body(optional.get());
		}
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario não encontrado!");
	}

	@GetMapping
	public ResponseEntity<List<Usuario>> listarUsuarios() {
		return ResponseEntity.status(HttpStatus.OK).body(usuarioRepository.findAll());
	}

	@PutMapping("/{id}")
	public ResponseEntity<Object> atualizarUsuario(@PathVariable UUID id, @RequestBody Usuario usuarioNovo) {
		Optional<Usuario> optional = usuarioRepository.findById(id);
		if (optional.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario não encontrado!");
		}
		String problema = conferir(usuarioNovo, false);
		if (problema != null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problema);
		}
		if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(usuarioNovo.getEmail().trim(), id)) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Já existe um usuário com este e-mail.");
		}
		limpar(usuarioNovo);
		Usuario usuarioAtual = optional.get();
		usuarioAtual.setNomeCompleto(usuarioNovo.getNomeCompleto());
		usuarioAtual.setEmail(usuarioNovo.getEmail());
		usuarioAtual.setTipoUsuario(usuarioNovo.getTipoUsuario());
		usuarioAtual.setDataNascimento(usuarioNovo.getDataNascimento());
		usuarioAtual.setObjetivo(usuarioNovo.getObjetivo());
		usuarioAtual.setDiasSemana(usuarioNovo.getDiasSemana());
		usuarioAtual.setPlano(usuarioNovo.getPlano());
		if (usuarioNovo.getSenha() != null && !usuarioNovo.getSenha().isBlank()) {
			usuarioAtual.setSenha(criptografar(usuarioNovo.getSenha()));
		}
		return ResponseEntity.status(HttpStatus.OK).body(usuarioRepository.save(usuarioAtual));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<String> apagarUsuario(@PathVariable UUID id) {
		if (!usuarioRepository.existsById(id)) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario não encontrado!");
		}
		usuarioRepository.deleteById(id);
		return ResponseEntity.status(HttpStatus.OK).body("Usuario apagado com sucesso!");
	}

	private String conferir(Usuario u, boolean senhaObrigatoria) {
		if (vazio(u.getNomeCompleto())) {
			return "Informe o nome completo.";
		}
		if (vazio(u.getEmail()) || !u.getEmail().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
			return "Informe um e-mail válido.";
		}
		if ((senhaObrigatoria || !vazio(u.getSenha())) && (vazio(u.getSenha()) || u.getSenha().length() < 8)) {
			return "A senha precisa ter pelo menos 8 caracteres.";
		}
		if (vazio(u.getTipoUsuario()) || !TIPOS.contains(u.getTipoUsuario().trim().toUpperCase())) {
			return "Escolha o tipo: CLIENTE ou ADMINISTRADOR.";
		}
		if (u.getDataNascimento() != null && u.getDataNascimento().isAfter(LocalDate.now())) {
			return "A data de nascimento não pode ser no futuro.";
		}
		return null;
	}

	private void limpar(Usuario u) {
		u.setNomeCompleto(u.getNomeCompleto().trim());
		u.setEmail(u.getEmail().trim().toLowerCase());
		u.setTipoUsuario(u.getTipoUsuario().trim().toUpperCase());
	}

	private boolean vazio(String texto) {
		return texto == null || texto.isBlank();
	}

	private String criptografar(String senha) {
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			byte[] hash = md.digest(senha.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hash);
		} catch (Exception e) {
			throw new RuntimeException("Erro ao criptografar a senha", e);
		}
	}
}