package br.com.saudelife.api.repositorio;

// Modelo
import br.com.saudelife.api.modelo.Academia;
// Repositório pronto do Spring (salvar, buscar, apagar)
import org.springframework.data.jpa.repository.JpaRepository;
// Talvez vazio
import java.util.Optional;
// Identificador
import java.util.UUID;

// Acesso à tabela de academias
public interface AcademiaRepositorio extends JpaRepository<Academia, UUID> {
  // Acha pelo código que o cliente digita
  Optional<Academia> findByCodigoIgnoreCase(String codigo);
  // Código já existe?
  boolean existsByCodigo(String codigo);
}
