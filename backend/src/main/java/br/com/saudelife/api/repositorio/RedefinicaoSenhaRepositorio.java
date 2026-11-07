package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.RedefinicaoSenha;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;

// Acesso aos pedidos de "esqueci a senha"
public interface RedefinicaoSenhaRepositorio extends JpaRepository<RedefinicaoSenha, String> {
  // Apaga os pedidos de uma pessoa
  void deleteByUsuario(Usuario usuario);
}
