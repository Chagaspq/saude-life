package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;

// Pedido de "esqueci a senha": o link leva um token que vale 1 hora e só pode ser usado uma vez
@Entity
@Table(name = "redefinicoes_senha")
public class RedefinicaoSenha {

  // Resumo SHA-256 do token do link
  @Id
  private String tokenHash;

  // Dono da conta
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Até quando vale
  @Column(nullable = false)
  private Instant expiraEm;

  // Já foi usado?
  private boolean usado;

  // Construtor vazio (o JPA precisa)
  protected RedefinicaoSenha() {}

  // Construtor
  public RedefinicaoSenha(String tokenHash, Usuario usuario, Instant expiraEm) {
    // Resumo do token
    this.tokenHash = tokenHash;
    // Dono
    this.usuario = usuario;
    // Validade
    this.expiraEm = expiraEm;
  }

  // Getters e setters
  public Usuario getUsuario() { return usuario; }
  public Instant getExpiraEm() { return expiraEm; }
  public boolean isUsado() { return usado; }
  public void setUsado(boolean usado) { this.usado = usado; }
}
