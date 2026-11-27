package br.com.belval.saudelife.repository;

import br.com.belval.saudelife.model.TreinoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TreinoItemRepository extends JpaRepository<TreinoItem, Long> {
    List<TreinoItem> findByTreinoIdOrderByOrdemAsc(UUID treinoId);
}