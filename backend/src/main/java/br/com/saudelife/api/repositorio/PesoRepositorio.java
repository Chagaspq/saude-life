package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.Peso;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Data e hora
import java.time.Instant;
// Listas e talvez vazio
import java.util.List;
import java.util.Optional;

// Acesso aos pesos
public interface PesoRepositorio extends JpaRepository<Peso, Long> {
  // Pesos de um período, do mais antigo ao mais novo (para o gráfico)
  List<Peso> findByUsuarioAndDataBetweenOrderByData(Usuario usuario, Instant de, Instant ate);
  // Todos os pesos
  List<Peso> findByUsuarioOrderByData(Usuario usuario);
  // Último peso
  Optional<Peso> findFirstByUsuarioOrderByDataDesc(Usuario usuario);
  // Pesos depois de uma data (troca o de hoje)
  List<Peso> findByUsuarioAndDataAfter(Usuario usuario, Instant desde);
  // Apaga os pesos de uma pessoa
  void deleteByUsuario(Usuario usuario);
}
