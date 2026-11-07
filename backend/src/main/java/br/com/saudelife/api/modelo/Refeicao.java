package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Dia
import java.time.LocalDate;
// Identificador aleatório
import java.util.UUID;

// Refeição registrada (substitui sl-refeicoes)
@Entity
@Table(name = "refeicoes", indexes = @Index(columnList = "usuario_id, dia"))
public class Refeicao {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Dono
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Dia da refeição
  @Column(nullable = false)
  private LocalDate dia;

  // Horário (ex.: 12:30)
  private String hora;

  // Nome (ex.: Almoço)
  @Column(nullable = false)
  private String nome;

  // O que comeu
  private String descricao;

  // Calorias
  private int kcal;
  // Proteína em gramas
  private int proteina;
  // Carboidrato em gramas
  private int carbo;
  // Gordura em gramas
  private int gordura;

  // Getters e setters
  public UUID getId() { return id; }
  public Usuario getUsuario() { return usuario; }
  public void setUsuario(Usuario usuario) { this.usuario = usuario; }
  public LocalDate getDia() { return dia; }
  public void setDia(LocalDate dia) { this.dia = dia; }
  public String getHora() { return hora; }
  public void setHora(String hora) { this.hora = hora; }
  public String getNome() { return nome; }
  public void setNome(String nome) { this.nome = nome; }
  public String getDescricao() { return descricao; }
  public void setDescricao(String descricao) { this.descricao = descricao; }
  public int getKcal() { return kcal; }
  public void setKcal(int kcal) { this.kcal = kcal; }
  public int getProteina() { return proteina; }
  public void setProteina(int proteina) { this.proteina = proteina; }
  public int getCarbo() { return carbo; }
  public void setCarbo(int carbo) { this.carbo = carbo; }
  public int getGordura() { return gordura; }
  public void setGordura(int gordura) { this.gordura = gordura; }
}
