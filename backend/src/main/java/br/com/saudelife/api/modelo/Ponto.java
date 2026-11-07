package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;

// Pontos ganhos (substitui sl-pontos). A mesma ação ("ref") nunca pontua duas vezes.
@Entity
@Table(name = "pontos", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "ref"}))
public class Ponto {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Dono
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Código da ação (ex.: "treino:2026-11-07T18:30")
  @Column(nullable = false)
  private String ref;

  // Tipo (serie, treino, refeicao, agua...)
  @Column(nullable = false)
  private String tipo;

  // Quantos pontos
  private int pts;

  // Quando
  private Instant data = Instant.now();

  // Construtor vazio (o JPA precisa)
  protected Ponto() {}

  // Construtor
  public Ponto(Usuario usuario, String ref, String tipo, int pts) {
    // Dono
    this.usuario = usuario;
    // Ação
    this.ref = ref;
    // Tipo
    this.tipo = tipo;
    // Pontos
    this.pts = pts;
  }

  // Getters
  public String getRef() { return ref; }
  public String getTipo() { return tipo; }
  public int getPts() { return pts; }
  public Instant getData() { return data; }
}
