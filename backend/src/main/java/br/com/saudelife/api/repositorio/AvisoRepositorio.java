package br.com.saudelife.api.repositorio;

// Modelos
import br.com.saudelife.api.modelo.Academia;
import br.com.saudelife.api.modelo.Aviso;
import br.com.saudelife.api.modelo.Usuario;
// Repositório pronto do Spring
import org.springframework.data.jpa.repository.JpaRepository;
// Lista
import java.util.List;
// Identificador
import java.util.UUID;

// Acesso aos avisos
public interface AvisoRepositorio extends JpaRepository<Aviso, UUID> {
  // Avisos de uma academia, o mais novo primeiro
  List<Aviso> findByAcademiaOrderByDataDesc(Academia academia);
  // Apaga os avisos que uma pessoa publicou
  void deleteByAutor(Usuario autor);
}
