package br.com.belval.saudelife.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "AGUA_DIA")
public class AguaDia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, columnDefinition = "UNIQUEIDENTIFIER")
    private UUID usuarioId;

    @Column(nullable = false)
    private LocalDate dia;

    @Column(nullable = false)
    private Integer ml;

    public AguaDia() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public LocalDate getDia() { return dia; }
    public void setDia(LocalDate dia) { this.dia = dia; }

    public Integer getMl() { return ml; }
    public void setMl(Integer ml) { this.ml = ml; }
}