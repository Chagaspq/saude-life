package br.com.belval.saudelife.controller;

import br.com.belval.saudelife.model.Refeicao;
import br.com.belval.saudelife.repository.RefeicaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/refeicoes")
public class RefeicaoController {

    @Autowired
    private RefeicaoRepository refeicaoRepository;

    // 1. Listar refeições de um usuário em um dia específico (Ex: /refeicoes/usuario/{uuid}/dia/2026-11-12)
    @GetMapping("/usuario/{usuarioId}/dia/{dia}")
    public List<Refeicao> listarPorUsuarioEDia(
            @PathVariable UUID usuarioId,
            @PathVariable LocalDate dia) {
        return refeicaoRepository.findByUsuarioIdAndDia(usuarioId, dia);
    }

    // 2. Cadastrar nova refeição
    @PostMapping
    public ResponseEntity<Refeicao> criarRefeicao(@RequestBody Refeicao refeicao) {
        Refeicao novaRefeicao = refeicaoRepository.save(refeicao);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaRefeicao);
    }

    // 3. Deletar uma refeição
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletarRefeicao(@PathVariable UUID id) {
        Optional<Refeicao> refeicao = refeicaoRepository.findById(id);
        if (refeicao.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Refeição não encontrada!");
        }
        refeicaoRepository.deleteById(id);
        return ResponseEntity.ok("Refeição apagada com sucesso!");
    }
}