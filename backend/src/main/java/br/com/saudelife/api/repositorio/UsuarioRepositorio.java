package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.Academia;
import br.com.saudelife.api.modelo.TipoConta;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Listas e talvez vazio
import java.util.List;
import java.util.Optional;
// Identificador
import java.util.UUID;

// Acesso à tabela de usuários
public interface UsuarioRepositorio extends JpaRepository<Usuario, UUID> {
  // Acha pelo e-mail
  Optional<Usuario> findByEmail(String email);
  // E-mail já cadastrado?
  boolean existsByEmail(String email);
  // Clientes de uma academia (painel do admin), em ordem de nome
  List<Usuario> findByAcademiaAndTipoOrderByNome(Academia academia, TipoConta tipo);
}
