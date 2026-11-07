package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.Refeicao;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Dia
import java.time.LocalDate;
// Lista
import java.util.List;
// Identificador
import java.util.UUID;

// Acesso às refeições
public interface RefeicaoRepositorio extends JpaRepository<Refeicao, UUID> {
  // Refeições de um dia, por horário
  List<Refeicao> findByUsuarioAndDiaOrderByHora(Usuario usuario, LocalDate dia);
  // Todas as refeições (exportar)
  List<Refeicao> findByUsuarioOrderByDiaDesc(Usuario usuario);
  // Apaga as refeições de uma pessoa
  void deleteByUsuario(Usuario usuario);
}
