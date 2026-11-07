package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;
// Identificador aleatório
import java.util.UUID;

// Treino concluído (substitui sl-historico): aparece no Início, na Evolução e no painel do admin
@Entity
@Table(name = "sessoes_treino", indexes = @Index(columnList = "usuario_id, data"))
public class SessaoTreino {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Quem treinou
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Ficha usada (pode ter sido apagada depois)
  private UUID treinoId;

  // Nome do treino
  @Column(nullable = false)
  private String nome;

  // Quando terminou
  @Column(nullable = false)
  private Instant data = Instant.now();

  // Duração em minutos
  private int duracaoMin;

  // Séries feitas
  private int series;

  // Volume (soma de reps × carga) em kg
  private double volume;

  // Calorias (estimativa)
  private int kcal;

  // Como foi: facil, ok, pesado ou muito
  private String esforco;

  // Getters e setters
  public UUID getId() { return id; }
  public Usuario getUsuario() { return usuario; }
  public void setUsuario(Usuario usuario) { this.usuario = usuario; }
  public UUID getTreinoId() { return treinoId; }
  public void setTreinoId(UUID treinoId) { this.treinoId = treinoId; }
  public String getNome() { return nome; }
  public void setNome(String nome) { this.nome = nome; }
  public Instant getData() { return data; }
  public void setData(Instant data) { this.data = data; }
  public int getDuracaoMin() { return duracaoMin; }
  public void setDuracaoMin(int duracaoMin) { this.duracaoMin = duracaoMin; }
  public int getSeries() { return series; }
  public void setSeries(int series) { this.series = series; }
  public double getVolume() { return volume; }
  public void setVolume(double volume) { this.volume = volume; }
  public int getKcal() { return kcal; }
  public void setKcal(int kcal) { this.kcal = kcal; }
  public String getEsforco() { return esforco; }
  public void setEsforco(String esforco) { this.esforco = esforco; }
}
