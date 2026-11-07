package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.SessaoTreino;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Data e hora
import java.time.Instant;
// Listas e talvez vazio
import java.util.List;
import java.util.Optional;
// Identificador
import java.util.UUID;

// Acesso ao histórico de treinos
public interface SessaoTreinoRepositorio extends JpaRepository<SessaoTreino, UUID> {
  // Treinos de um período, o mais novo primeiro
  List<SessaoTreino> findByUsuarioAndDataBetweenOrderByDataDesc(Usuario usuario, Instant de, Instant ate);
  // Todos os treinos, o mais novo primeiro
  List<SessaoTreino> findByUsuarioOrderByDataDesc(Usuario usuario);
  // Quantos treinos no total
  long countByUsuario(Usuario usuario);
  // Quantos treinos depois de uma data
  long countByUsuarioAndDataAfter(Usuario usuario, Instant desde);
  // Último treino
  Optional<SessaoTreino> findFirstByUsuarioOrderByDataDesc(Usuario usuario);
  // Apaga o histórico de uma pessoa
  void deleteByUsuario(Usuario usuario);
}
