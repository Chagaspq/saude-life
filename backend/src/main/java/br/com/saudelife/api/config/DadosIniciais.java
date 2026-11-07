package br.com.saudelife.api.config;

// Modelos
import br.com.saudelife.api.modelo.*;
// Repositórios
import br.com.saudelife.api.repositorio.*;
// Regras da conta
import br.com.saudelife.api.servico.ContaServico;
// Liga só se a configuração pedir
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
// Roda ao ligar o servidor
import org.springframework.boot.CommandLineRunner;
// Hash de senha
import org.springframework.security.crypto.password.PasswordEncoder;
// Componente do Spring
import org.springframework.stereotype.Component;
// Datas
import java.time.Duration;
import java.time.Instant;
// Lista
import java.util.List;

// Contas de demonstração (para a apresentação do TCC): admin@saudelife.app e demo@saudelife.app, senha demo1234.
// O cliente demo já entra na academia do admin demo (código SL-DEMO) com alguns treinos e pesos.
@Component
@ConditionalOnProperty(name = "saudelife.demo", havingValue = "true")
public class DadosIniciais implements CommandLineRunner {

  // Repositórios e regras
  private final UsuarioRepositorio usuarios;
  private final AcademiaRepositorio academias;
  private final TreinoRepositorio treinos;
  private final SessaoTreinoRepositorio historico;
  private final PesoRepositorio pesos;
  private final PasswordEncoder senhas;

  // Construtor
  public DadosIniciais(UsuarioRepositorio usuarios, AcademiaRepositorio academias, TreinoRepositorio treinos, SessaoTreinoRepositorio historico, PesoRepositorio pesos, PasswordEncoder senhas, ContaServico conta) {
    // Guarda
    this.usuarios = usuarios;
    this.academias = academias;
    this.treinos = treinos;
    this.historico = historico;
    this.pesos = pesos;
    this.senhas = senhas;
  }

  // Ao ligar
  @Override
  public void run(String... args) {
    // Já tem: não repete
    if (usuarios.existsByEmail("admin@saudelife.app")) return;
    // Academia
    Academia a = new Academia();
    // Nome
    a.setNome("Academia Demonstração");
    // Código fixo
    a.setCodigo("SL-DEMO");
    // Guarda
    academias.save(a);
    // Admin
    Usuario admin = conta("Academia Demonstração", "admin@saudelife.app", TipoConta.admin, a);
    // Cliente
    Usuario cliente = conta("Biel Demonstração", "demo@saudelife.app", TipoConta.cliente, a);
    // Objetivo do cliente
    cliente.setObjetivo("Hipertrofia");
    // Nível
    cliente.setNivel("Intermediário");
    // Guarda
    usuarios.save(cliente);
    // Uma ficha
    Treino t = new Treino();
    // Dono
    t.setUsuario(cliente);
    // Nome
    t.setNome("Super Inferiores A");
    // Grupo
    t.setGrupo("Quadríceps e Panturrilhas");
    // Exercícios
    t.trocarItens(List.of(item("Agachamento livre", 4, "10", 60, 90), item("Leg press 45°", 4, "12", 140, 90), item("Cadeira extensora", 3, "12", 45, 60)));
    // Guarda
    treinos.save(t);
    // 6 treinos nos últimos 14 dias e 3 pesos
    for (int d = 1; d <= 6; d++) {
      // Treino
      SessaoTreino s = new SessaoTreino();
      // Dono
      s.setUsuario(cliente);
      // Ficha
      s.setTreinoId(t.getId());
      // Nome
      s.setNome(t.getNome());
      // Data
      s.setData(Instant.now().minus(Duration.ofDays(d * 2L)));
      // Números
      s.setDuracaoMin(45);
      s.setSeries(18);
      s.setVolume(3600 + d * 50);
      s.setKcal(260);
      // Guarda
      historico.save(s);
    }
    // Pesos
    for (int i = 0; i < 3; i++) {
      // Peso
      Peso p = new Peso();
      // Dono
      p.setUsuario(cliente);
      // Valor
      p.setValorKg(79 - i * 0.6);
      // Guarda
      pesos.save(p);
    }
  }

  // Cria uma conta com a senha demo1234
  private Usuario conta(String nome, String email, TipoConta tipo, Academia a) {
    // Nova
    Usuario u = new Usuario();
    // Dados
    u.setNome(nome);
    u.setEmail(email);
    u.setSenhaHash(senhas.encode("demo1234"));
    u.setTipo(tipo);
    u.setAcademia(a);
    // Guarda
    return usuarios.save(u);
  }

  // Monta um exercício
  private TreinoItem item(String nome, int series, String reps, double carga, int descanso) {
    // Novo
    TreinoItem i = new TreinoItem();
    // Dados
    i.setNome(nome);
    i.setSeries(series);
    i.setReps(reps);
    i.setCarga(carga);
    i.setDescansoS(descanso);
    // Pronto
    return i;
  }
}
