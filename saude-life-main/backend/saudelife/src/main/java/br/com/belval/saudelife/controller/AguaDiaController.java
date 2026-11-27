package br.com.belval.saudelife.controller;

import br.com.belval.saudelife.model.AguaDia;
import br.com.belval.saudelife.repository.AguaDiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/agua")
public class AguaDiaController {

    @Autowired
    private AguaDiaRepository aguaDiaRepository;

    // 1. Buscar consumo de água de um usuário no dia
    @GetMapping("/usuario/{usuarioId}/dia/{dia}")
    public ResponseEntity<AguaDia> buscarPorUsuarioEDia(
            @PathVariable UUID usuarioId,
            @PathVariable LocalDate dia) {
        Optional<AguaDia> agua = aguaDiaRepository.findByUsuarioIdAndDia(usuarioId, dia);
        if (agua.isPresent()) {
            return ResponseEntity.ok(agua.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 2. Registrar ou atualizar a quantidade de água do dia (Upsert)
    @PostMapping
    public ResponseEntity<AguaDia> salvarOuAtualizarAgua(@RequestBody AguaDia aguaDia) {
        Optional<AguaDia> existente = aguaDiaRepository.findByUsuarioIdAndDia(aguaDia.getUsuarioId(), aguaDia.getDia());
        
        AguaDia salva;
        if (existente.isPresent()) {
            AguaDia aguaAtual = existente.get();
            aguaAtual.setMl(aguaDia.getMl());
            salva = aguaDiaRepository.save(aguaAtual);
        } else {
            salva = aguaDiaRepository.save(aguaDia);
        }
        
        return ResponseEntity.ok(salva);
    }
}