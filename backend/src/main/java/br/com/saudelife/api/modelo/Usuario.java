package br.com.saudelife.api.modelo;

// Anotações do banco (JPA)
import jakarta.persistence.*;
// Data e hora
import java.time.Instant;
// Identificador aleatório
import java.util.UUID;

// Conta de usuário com o perfil (substitui sl-contas, sl-perfil e sl-onboarding do navegador)
@Entity
@Table(name = "usuarios")
public class Usuario {

  // Identificador
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  // Nome completo
  @Column(nullable = false)
  private String nome;

  // E-mail do login (sempre minúsculo)
  @Column(nullable = false, unique = true)
  private String email;

  // Senha guardada só como hash BCrypt (nunca o texto)
  @Column(nullable = false)
  private String senhaHash;

  // Cliente ou administrador
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TipoConta tipo = TipoConta.cliente;

  // Academia (cliente: onde treina; admin: a que administra)
  @ManyToOne
  private Academia academia;

  // Quando a conta foi criada
  private Instant criadoEm = Instant.now();

  // Perfil: apelido (aparece na saudação)
  private String apelido;
  // Perfil: bio
  private String bio;
  // Perfil: altura em centímetros
  private Integer alturaCm;
  // Questionário: objetivo (Hipertrofia, HIIT, Resistência, Yoga & Mobilidade)
  private String objetivo;
  // Questionário: nível (Iniciante, Intermediário, Avançado)
  private String nivel;
  // Questionário: meta de treinos por semana
  private Integer diasSemana = 4;
  // Plano atual (Free, Premium, Estudante...)
  private String plano = "Free";
  // Fim do teste grátis (vazio se não estiver em teste)
  private Instant planoFim;
  // Já usou o teste grátis?
  private boolean testeUsado;

  // Getters e setters
  public UUID getId() { return id; }
  public String getNome() { return nome; }
  public void setNome(String nome) { this.nome = nome; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getSenhaHash() { return senhaHash; }
  public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
  public TipoConta getTipo() { return tipo; }
  public void setTipo(TipoConta tipo) { this.tipo = tipo; }
  public Academia getAcademia() { return academia; }
  public void setAcademia(Academia academia) { this.academia = academia; }
  public Instant getCriadoEm() { return criadoEm; }
  public String getApelido() { return apelido; }
  public void setApelido(String apelido) { this.apelido = apelido; }
  public String getBio() { return bio; }
  public void setBio(String bio) { this.bio = bio; }
  public Integer getAlturaCm() { return alturaCm; }
  public void setAlturaCm(Integer alturaCm) { this.alturaCm = alturaCm; }
  public String getObjetivo() { return objetivo; }
  public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
  public String getNivel() { return nivel; }
  public void setNivel(String nivel) { this.nivel = nivel; }
  public Integer getDiasSemana() { return diasSemana; }
  public void setDiasSemana(Integer diasSemana) { this.diasSemana = diasSemana; }
  public String getPlano() { return plano; }
  public void setPlano(String plano) { this.plano = plano; }
  public Instant getPlanoFim() { return planoFim; }
  public void setPlanoFim(Instant planoFim) { this.planoFim = planoFim; }
  public boolean isTesteUsado() { return testeUsado; }
  public void setTesteUsado(boolean testeUsado) { this.testeUsado = testeUsado; }

  // É administrador?
  public boolean ehAdmin() { return tipo == TipoConta.admin; }
}
