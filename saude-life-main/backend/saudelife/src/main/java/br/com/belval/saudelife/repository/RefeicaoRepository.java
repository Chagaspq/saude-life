package br.com.belval.saudelife.repository;

import br.com.belval.saudelife.model.Refeicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RefeicaoRepository extends JpaRepository<Refeicao, UUID> {
    List<Refeicao> findByUsuarioIdAndDia(UUID usuarioId, LocalDate dia);
}