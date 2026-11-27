package br.com.belval.saudelife.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "TREINO_ITENS")
public class TreinoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "treino_id", nullable = false, columnDefinition = "UNIQUEIDENTIFIER")
    private UUID treinoId;

    private Integer ordem;

    @Column(nullable = false, length = 100)
    private String nome;

    private Integer series;

    @Column(length = 50)
    private String reps;

    private Double carga;

    private Integer descanso;

    public TreinoItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getTreinoId() { return treinoId; }
    public void setTreinoId(UUID treinoId) { this.treinoId = treinoId; }

    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Integer getSeries() { return series; }
    public void setSeries(Integer series) { this.series = series; }

    public String getReps() { return reps; }
    public void setReps(String reps) { this.reps = reps; }

    public Double getCarga() { return carga; }
    public void setCarga(Double carga) { this.carga = carga; }

    public Integer getDescanso() { return descanso; }
    public void setDescanso(Integer descanso) { this.descanso = descanso; }
}