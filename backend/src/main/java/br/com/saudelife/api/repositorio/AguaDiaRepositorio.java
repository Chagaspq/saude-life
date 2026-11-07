package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.AguaDia;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Dia
import java.time.LocalDate;
// Talvez vazio
import java.util.Optional;

// Acesso à água de cada dia
public interface AguaDiaRepositorio extends JpaRepository<AguaDia, Long> {
  // Água de um dia
  Optional<AguaDia> findByUsuarioAndDia(Usuario usuario, LocalDate dia);
  // Apaga a água de uma pessoa
  void deleteByUsuario(Usuario usuario);
}
