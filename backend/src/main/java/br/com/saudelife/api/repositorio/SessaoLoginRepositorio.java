package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.SessaoLogin;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;

// Acesso aos logins abertos
public interface SessaoLoginRepositorio extends JpaRepository<SessaoLogin, String> {
  // Fecha todos os logins de uma pessoa (trocou a senha ou excluiu a conta)
  void deleteByUsuario(Usuario usuario);
}
