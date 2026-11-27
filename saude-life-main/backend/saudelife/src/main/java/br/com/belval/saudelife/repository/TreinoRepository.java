package br.com.belval.saudelife.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.belval.saudelife.model.Treino;

@Repository
public interface TreinoRepository extends JpaRepository<Treino, UUID> {
    List<Treino> findByUsuarioId(UUID usuarioId);
}