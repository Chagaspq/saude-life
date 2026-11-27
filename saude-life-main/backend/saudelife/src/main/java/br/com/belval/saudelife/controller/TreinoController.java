package br.com.belval.saudelife.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.belval.saudelife.model.Treino;
import br.com.belval.saudelife.model.TreinoItem;
import br.com.belval.saudelife.repository.TreinoItemRepository;
import br.com.belval.saudelife.repository.TreinoRepository;

@RestController
@RequestMapping("/treinos")
public class TreinoController {

    @Autowired
    private TreinoRepository treinoRepository;

    @Autowired
    private TreinoItemRepository treinoItemRepository;

    // 1. Listar treinos de um usuário específico
    @GetMapping("/usuario/{usuarioId}")
    public List<Treino> listarPorUsuario(@PathVariable UUID usuarioId) {
        return treinoRepository.findByUsuarioId(usuarioId);
    }

    // 2. Cadastrar novo treino
    @PostMapping
    public ResponseEntity<Treino> criarTreino(@RequestBody Treino treino) {
        Treino novoTreino = treinoRepository.save(treino);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoTreino);
    }

    // 3. Listar os itens (exercícios) de um treino
    @GetMapping("/{treinoId}/itens")
    public List<TreinoItem> listarItensDoTreino(@PathVariable UUID treinoId) {
        return treinoItemRepository.findByTreinoIdOrderByOrdemAsc(treinoId);
    }

    // 4. Adicionar um exercício (item) a um treino
    @PostMapping("/itens")
    public ResponseEntity<TreinoItem> adicionarItemTreino(@RequestBody TreinoItem treinoItem) {
        TreinoItem novoItem = treinoItemRepository.save(treinoItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoItem);
    }

    // 5. Deletar um treino
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletarTreino(@PathVariable UUID id) {
        Optional<Treino> treino = treinoRepository.findById(id);
        if (treino.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Treino não encontrado!");
        }
        treinoRepository.deleteById(id);
        return ResponseEntity.ok("Treino apagado com sucesso!");
    }
}