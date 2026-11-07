package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;

// Um exercício dentro de uma ficha
@Entity
@Table(name = "treino_itens")
public class TreinoItem {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Ficha a que pertence
  @ManyToOne(optional = false)
  private Treino treino;

  // Posição na ficha (0, 1, 2...)
  private int ordem;

  // Nome do exercício
  @Column(nullable = false)
  private String nome;

  // Quantas séries
  private int series = 3;

  // Repetições ("12") ou tempo ("40 s")
  private String reps = "12";

  // Carga em kg
  private double carga;

  // Descanso em segundos
  private int descansoS = 60;

  // Getters e setters
  public Long getId() { return id; }
  public void setTreino(Treino treino) { this.treino = treino; }
  public int getOrdem() { return ordem; }
  public void setOrdem(int ordem) { this.ordem = ordem; }
  public String getNome() { return nome; }
  public void setNome(String nome) { this.nome = nome; }
  public int getSeries() { return series; }
  public void setSeries(int series) { this.series = series; }
  public String getReps() { return reps; }
  public void setReps(String reps) { this.reps = reps; }
  public double getCarga() { return carga; }
  public void setCarga(double carga) { this.carga = carga; }
  public int getDescansoS() { return descansoS; }
  public void setDescansoS(int descansoS) { this.descansoS = descansoS; }
}
