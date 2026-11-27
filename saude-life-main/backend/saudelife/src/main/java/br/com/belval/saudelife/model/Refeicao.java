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
@Table(name = "REFEICOES")
public class Refeicao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UNIQUEIDENTIFIER")
    private UUID id;

    @Column(name = "usuario_id", nullable = false, columnDefinition = "UNIQUEIDENTIFIER")
    private UUID usuarioId;

    @Column(nullable = false)
    private LocalDate dia;

    @Column(nullable = false, length = 100)
    private String nome;

    private Integer kcal;
    private Integer proteina;
    private Integer carbo;
    private Integer gordura;

    public Refeicao() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public LocalDate getDia() { return dia; }
    public void setDia(LocalDate dia) { this.dia = dia; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Integer getKcal() { return kcal; }
    public void setKcal(Integer kcal) { this.kcal = kcal; }

    public Integer getProteina() { return proteina; }
    public void setProteina(Integer proteina) { this.proteina = proteina; }

    public Integer getCarbo() { return carbo; }
    public void setCarbo(Integer carbo) { this.carbo = carbo; }

    public Integer getGordura() { return gordura; }
    public void setGordura(Integer gordura) { this.gordura = gordura; }
}