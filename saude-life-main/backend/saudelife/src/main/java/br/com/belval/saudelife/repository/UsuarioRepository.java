package br.com.belval.saudelife.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.belval.saudelife.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

	boolean existsByEmailIgnoreCase(String email);

	boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
}