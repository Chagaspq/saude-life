package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.Ponto;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Consulta escrita à mão
import org.springframework.data.jpa.repository.Query;
// Parâmetro com nome
import org.springframework.data.repository.query.Param;
// Data e hora
import java.time.Instant;
// Lista
import java.util.List;

// Acesso aos pontos
public interface PontoRepositorio extends JpaRepository<Ponto, Long> {
  // Essa ação já pontuou?
  boolean existsByUsuarioAndRef(Usuario usuario, String ref);
  // Soma dos pontos desde uma data
  @Query("select coalesce(sum(p.pts), 0) from Ponto p where p.usuario = :u and p.data >= :desde")
  long somaDesde(@Param("u") Usuario usuario, @Param("desde") Instant desde);
  // Quantos pontos de um tipo desde uma data (limite de refeições por dia)
  long countByUsuarioAndTipoAndDataAfter(Usuario usuario, String tipo, Instant desde);
  // Todos os pontos (exportar)
  List<Ponto> findByUsuarioOrderByDataDesc(Usuario usuario);
  // Devolve os pontos de uma ação desfeita
  void deleteByUsuarioAndRef(Usuario usuario, String ref);
  // Apaga os pontos de uma pessoa
  void deleteByUsuario(Usuario usuario);
}
