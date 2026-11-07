package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;

// Login aberto em um aparelho. O token vai para o site; aqui fica só o resumo (hash) dele.
@Entity
@Table(name = "sessoes_login")
public class SessaoLogin {

  // Resumo SHA-256 do token (se o banco vazar, o token não vaza)
  @Id
  private String tokenHash;

  // Dono do login
  @ManyToOne(optional = false)
  private Usuario usuario;

  // Até quando vale
  @Column(nullable = false)
  private Instant expiraEm;

  // Construtor vazio (o JPA precisa)
  protected SessaoLogin() {}

  // Construtor
  public SessaoLogin(String tokenHash, Usuario usuario, Instant expiraEm) {
    // Resumo do token
    this.tokenHash = tokenHash;
    // Dono
    this.usuario = usuario;
    // Validade
    this.expiraEm = expiraEm;
  }

  // Getters
  public String getTokenHash() { return tokenHash; }
  public Usuario getUsuario() { return usuario; }
  public Instant getExpiraEm() { return expiraEm; }
}
