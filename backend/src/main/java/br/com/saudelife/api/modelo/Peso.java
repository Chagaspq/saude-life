package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;

// Peso registrado (substitui sl-pesos)
@Entity
@Table(name = "pesos", indexes = @Index(columnList = "usuario_id, data"))
public class Peso {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Dono
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Quando
  @Column(nullable = false)
  private Instant data = Instant.now();

  // Peso em kg
  private double valorKg;

  // Getters e setters
  public Long getId() { return id; }
  public Usuario getUsuario() { return usuario; }
  public void setUsuario(Usuario usuario) { this.usuario = usuario; }
  public Instant getData() { return data; }
  public double getValorKg() { return valorKg; }
  public void setValorKg(double valorKg) { this.valorKg = valorKg; }
}
