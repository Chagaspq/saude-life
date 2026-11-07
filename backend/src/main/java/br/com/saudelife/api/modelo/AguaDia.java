package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Dia
import java.time.LocalDate;

// Água bebida em um dia (substitui sl-agua). Uma linha por pessoa por dia.
@Entity
@Table(name = "agua_dia", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "dia"}))
public class AguaDia {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Dono
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Dia
  @Column(nullable = false)
  private LocalDate dia;

  // Total em ml
  private int ml;

  // Getters e setters
  public Usuario getUsuario() { return usuario; }
  public void setUsuario(Usuario usuario) { this.usuario = usuario; }
  public LocalDate getDia() { return dia; }
  public void setDia(LocalDate dia) { this.dia = dia; }
  public int getMl() { return ml; }
  public void setMl(int ml) { this.ml = ml; }
}
