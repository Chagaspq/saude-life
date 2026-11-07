package br.com.saudelife.api.servico;

// Formatos de dados
import br.com.saudelife.api.dto.Dtos.*;
// Erros da API
import br.com.saudelife.api.erro.ErroApi;
// Modelos
import br.com.saudelife.api.modelo.*;
// Repositórios
import br.com.saudelife.api.repositorio.*;
// Tokens
import br.com.saudelife.api.seguranca.Tokens;
// Hash de senha
import org.springframework.security.crypto.password.PasswordEncoder;
// Serviço do Spring
import org.springframework.stereotype.Service;
// Transação (tudo ou nada)
import org.springframework.transaction.annotation.Transactional;
// Data e hora
import java.time.Duration;
import java.time.Instant;
// Números aleatórios
import java.security.SecureRandom;

// Regras da conta: cadastrar, entrar, sair e apagar tudo
@Service
public class ContaServico {

  // Quanto tempo o login vale
  public static final Duration VALIDADE_LOGIN = Duration.ofDays(30);
  // Letras do código da academia (sem as parecidas: 0/O, 1/I)
  private static final String LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // Repositórios e hash de senha
  private final UsuarioRepositorio usuarios;
  private final AcademiaRepositorio academias;
  private final SessaoLoginRepositorio sessoes;
  private final RedefinicaoSenhaRepositorio redefinicoes;
  private final TreinoRepositorio treinos;
  private final SessaoTreinoRepositorio historico;
  private final RefeicaoRepositorio refeicoes;
  private final AguaDiaRepositorio agua;
  private final PesoRepositorio pesos;
  private final PontoRepositorio pontos;
  private final AvisoRepositorio avisos;
  private final PasswordEncoder senhas;

  // Construtor (o Spring entrega tudo)
  public ContaServico(UsuarioRepositorio usuarios, AcademiaRepositorio academias, SessaoLoginRepositorio sessoes, RedefinicaoSenhaRepositorio redefinicoes, TreinoRepositorio treinos, SessaoTreinoRepositorio historico, RefeicaoRepositorio refeicoes, AguaDiaRepositorio agua, PesoRepositorio pesos, PontoRepositorio pontos, AvisoRepositorio avisos, PasswordEncoder senhas) {
    // Guarda cada um
    this.usuarios = usuarios;
    this.academias = academias;
    this.sessoes = sessoes;
    this.redefinicoes = redefinicoes;
    this.treinos = treinos;
    this.historico = historico;
    this.refeicoes = refeicoes;
    this.agua = agua;
    this.pesos = pesos;
    this.pontos = pontos;
    this.avisos = avisos;
    this.senhas = senhas;
  }

  // Cria a conta e já entra
  @Transactional
  public LoginResposta cadastrar(CadastroPedido p) {
    // E-mail em minúsculas
    String email = p.email().trim().toLowerCase();
    // Já existe
    if (usuarios.existsByEmail(email)) throw ErroApi.conflito("Já existe uma conta com esse e-mail. Entre ou use outro.");
    // Novo usuário
    Usuario u = new Usuario();
    // Nome
    u.setNome(p.nome().trim());
    // E-mail
    u.setEmail(email);
    // Senha só como hash
    u.setSenhaHash(senhas.encode(p.senha()));
    // Tipo
    u.setTipo("admin".equals(p.tipo()) ? TipoConta.admin : TipoConta.cliente);
    // Admin: cria a academia dele
    if (u.ehAdmin()) u.setAcademia(novaAcademia(p.academia() == null || p.academia().isBlank() ? u.getNome() : p.academia().trim()));
    // Cliente com código: entra na academia
    else if (p.codigoAcademia() != null && !p.codigoAcademia().isBlank()) u.setAcademia(academias.findByCodigoIgnoreCase(p.codigoAcademia().trim()).orElseThrow(() -> ErroApi.invalido("Código de academia não encontrado.")));
    // Guarda
    usuarios.save(u);
    // Entra
    return abrirLogin(u);
  }

  // Confere e-mail e senha e entra
  @Transactional
  public LoginResposta entrar(LoginPedido p) {
    // Procura (mesma mensagem para e-mail ou senha errados: não revela quem tem conta)
    Usuario u = usuarios.findByEmail(p.email().trim().toLowerCase()).orElseThrow(() -> new ErroApi(org.springframework.http.HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos."));
    // Senha errada
    if (!senhas.matches(p.senha(), u.getSenhaHash())) throw new ErroApi(org.springframework.http.HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.");
    // Entra
    return abrirLogin(u);
  }

  // Abre um login novo e devolve o token
  public LoginResposta abrirLogin(Usuario u) {
    // Token
    String token = Tokens.novo();
    // Guarda só o resumo
    sessoes.save(new SessaoLogin(Tokens.hash(token), u, Instant.now().plus(VALIDADE_LOGIN)));
    // Resposta
    return new LoginResposta(token, UsuarioDto.de(u));
  }

  // Confere a senha atual
  public void conferirSenha(Usuario u, String senha) {
    // Errada: 403
    if (senha == null || !senhas.matches(senha, u.getSenhaHash())) throw ErroApi.proibido("Senha atual incorreta.");
  }

  // Troca a senha e fecha os outros logins
  @Transactional
  public LoginResposta trocarSenha(Usuario u, String nova) {
    // Hash novo
    u.setSenhaHash(senhas.encode(nova));
    // Guarda
    usuarios.save(u);
    // Fecha todos os logins
    sessoes.deleteByUsuario(u);
    // Abre um novo (este aparelho continua logado)
    return abrirLogin(u);
  }

  // Apaga a conta e todos os dados (LGPD)
  @Transactional
  public void excluir(Usuario u) {
    // Cada tabela
    sessoes.deleteByUsuario(u);
    redefinicoes.deleteByUsuario(u);
    treinos.deleteByUsuario(u);
    historico.deleteByUsuario(u);
    refeicoes.deleteByUsuario(u);
    agua.deleteByUsuario(u);
    pesos.deleteByUsuario(u);
    pontos.deleteByUsuario(u);
    avisos.deleteByAutor(u);
    // A conta
    usuarios.delete(u);
  }

  // Cria uma academia com código único
  public Academia novaAcademia(String nome) {
    // Sorteio
    SecureRandom r = new SecureRandom();
    // Código
    String codigo;
    // Sorteia até achar um livre
    do {
      // Monta "SL-XXXX"
      StringBuilder sb = new StringBuilder("SL-");
      // 4 letras
      for (int i = 0; i < 4; i++) sb.append(LETRAS.charAt(r.nextInt(LETRAS.length())));
      // Pronto
      codigo = sb.toString();
    } while (academias.existsByCodigo(codigo));
    // Nova
    Academia a = new Academia();
    // Nome
    a.setNome(nome);
    // Código
    a.setCodigo(codigo);
    // Guarda
    return academias.save(a);
  }
}
