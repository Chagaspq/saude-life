package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;
// Identificador aleatório
import java.util.UUID;

// Aviso publicado pelo admin para os clientes da academia (substitui sl-avisos-admin)
@Entity
@Table(name = "avisos")
public class Aviso {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Academia que recebe
  @ManyToOne(optional = false)
  private Academia academia;

  // Quem publicou
  @ManyToOne(optional = false)
  private Usuario autor;

  // Texto (até 120 letras)
  @Column(nullable = false, length = 120)
  private String texto;

  // Quando
  private Instant data = Instant.now();

  // Getters e setters
  public UUID getId() { return id; }
  public Academia getAcademia() { return academia; }
  public void setAcademia(Academia academia) { this.academia = academia; }
  public Usuario getAutor() { return autor; }
  public void setAutor(Usuario autor) { this.autor = autor; }
  public String getTexto() { return texto; }
  public void setTexto(String texto) { this.texto = texto; }
  public Instant getData() { return data; }
}
