package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;
// Listas
import java.util.ArrayList;
import java.util.List;
// Identificador aleatório
import java.util.UUID;

// Ficha de treino (substitui sl-treinos). Pode ter sido mandada por um admin (autor).
@Entity
@Table(name = "treinos")
public class Treino {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Dono da ficha (o cliente que vai treinar)
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Quem mandou (admin). Vazio quando o próprio cliente criou.
  @ManyToOne
  private Usuario autor;

  // Nome da ficha
  @Column(nullable = false)
  private String nome;

  // Grupo muscular
  private String grupo;

  // Quando foi criada
  private Instant criadoEm = Instant.now();

  // Exercícios, na ordem
  @OneToMany(mappedBy = "treino", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @OrderBy("ordem")
  private List<TreinoItem> itens = new ArrayList<>();

  // Troca todos os exercícios
  public void trocarItens(List<TreinoItem> novos) {
    // Tira os antigos
    itens.clear();
    // Põe os novos, ligados a esta ficha
    for (int i = 0; i < novos.size(); i++) {
      // Item
      TreinoItem item = novos.get(i);
      // Liga
      item.setTreino(this);
      // Posição
      item.setOrdem(i);
      // Adiciona
      itens.add(item);
    }
  }

  // Getters e setters
  public UUID getId() { return id; }
  public Usuario getUsuario() { return usuario; }
  public void setUsuario(Usuario usuario) { this.usuario = usuario; }
  public Usuario getAutor() { return autor; }
  public void setAutor(Usuario autor) { this.autor = autor; }
  public String getNome() { return nome; }
  public void setNome(String nome) { this.nome = nome; }
  public String getGrupo() { return grupo; }
  public void setGrupo(String grupo) { this.grupo = grupo; }
  public Instant getCriadoEm() { return criadoEm; }
  public List<TreinoItem> getItens() { return itens; }
}
