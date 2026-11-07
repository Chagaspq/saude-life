package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.Treino;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Lista
import java.util.List;
// Identificador
import java.util.UUID;

// Acesso às fichas de treino
public interface TreinoRepositorio extends JpaRepository<Treino, UUID> {
  // Fichas de uma pessoa, a mais nova primeiro
  List<Treino> findByUsuarioOrderByCriadoEmDesc(Usuario usuario);
  // Apaga as fichas de uma pessoa
  void deleteByUsuario(Usuario usuario);
}
