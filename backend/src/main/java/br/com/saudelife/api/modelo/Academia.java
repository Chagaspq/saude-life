package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;
// Identificador aleatório
import java.util.UUID;

// Academia (ou personal). Cada administrador cuida de uma; os clientes entram pelo código.
@Entity
@Table(name = "academias")
public class Academia {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Nome que aparece para os clientes
  @Column(nullable = false)
  private String nome;

  // Código curto para o cliente entrar (ex.: SL-4F2K)
  @Column(nullable = false, unique = true)
  private String codigo;

  // Quando foi criada
  private Instant criadaEm = Instant.now();

  // Getters e setters
  public UUID getId() { return id; }
  public String getNome() { return nome; }
  public void setNome(String nome) { this.nome = nome; }
  public String getCodigo() { return codigo; }
  public void setCodigo(String codigo) { this.codigo = codigo; }
  public Instant getCriadaEm() { return criadaEm; }
}
