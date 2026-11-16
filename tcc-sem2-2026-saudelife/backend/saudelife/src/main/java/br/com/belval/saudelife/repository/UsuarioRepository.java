package br.com.belval.saudelife.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.belval.saudelife.model.Usuario;

// Acesso à tabela "usuarios" (o Spring Data cria o SQL sozinho: findAll, findById, save, deleteById...)
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	// Já existe um usuário com este e-mail? (SELECT ... WHERE email = ?)
	boolean existsByEmailIgnoreCase(String email);

	// Existe outro usuário (id diferente) com este e-mail? Usado ao editar
	boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
