package br.com.belval.saudelife.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.belval.saudelife.model.AguaDia;

@Repository
public interface AguaDiaRepository extends JpaRepository<AguaDia, Long> {
    Optional<AguaDia> findByUsuarioIdAndDia(UUID usuarioId, LocalDate dia);
}