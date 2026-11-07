package br.com.saudelife.api.controle;

// Formatos de dados
import br.com.saudelife.api.dto.Dtos.*;
// Erros
import br.com.saudelife.api.erro.ErroApi;
// Modelos
import br.com.saudelife.api.modelo.RedefinicaoSenha;
// Repositórios
import br.com.saudelife.api.repositorio.RedefinicaoSenhaRepositorio;
import br.com.saudelife.api.repositorio.SessaoLoginRepositorio;
import br.com.saudelife.api.repositorio.UsuarioRepositorio;
// Tokens
import br.com.saudelife.api.seguranca.Tokens;
// Regras da conta e e-mail
import br.com.saudelife.api.servico.ContaServico;
import br.com.saudelife.api.servico.EmailServico;
// Validação do corpo
import jakarta.validation.Valid;
// Lê do application.properties
import org.springframework.beans.factory.annotation.Value;
// Códigos HTTP
import org.springframework.http.HttpStatus;
// Transação
import org.springframework.transaction.annotation.Transactional;
// Anotações de rota
import org.springframework.web.bind.annotation.*;
// Data e hora
import java.time.Duration;
import java.time.Instant;
// Mapas (viram JSON)
import java.util.HashMap;
import java.util.Map;

// Rotas de conta: cadastro, login, sair e senha
@RestController
@RequestMapping("/auth")
public class AuthController {

  // Regras e repositórios
  private final ContaServico conta;
  private final UsuarioRepositorio usuarios;
  private final SessaoLoginRepositorio sessoes;
  private final RedefinicaoSenhaRepositorio redefinicoes;
  // Mostrar o link de senha na resposta (só na demonstração)
  private final boolean mostrarLink;
  // E-mail
  private final EmailServico email;
  // Endereço do site (para montar o link)
  private final String site;

  // Construtor
  public AuthController(ContaServico conta, UsuarioRepositorio usuarios, SessaoLoginRepositorio sessoes, RedefinicaoSenhaRepositorio redefinicoes, @Value("${saudelife.mostrar-link-senha}") boolean mostrarLink, EmailServico email, @Value("${saudelife.site}") String site) {
    // Guarda
    this.conta = conta;
    this.usuarios = usuarios;
    this.sessoes = sessoes;
    this.redefinicoes = redefinicoes;
    this.mostrarLink = mostrarLink;
    this.email = email;
    this.site = site;
  }

  // POST /auth/cadastro: cria a conta (cliente ou admin) e já entra
  @PostMapping("/cadastro")
  @ResponseStatus(HttpStatus.CREATED)
  public LoginResposta cadastro(@Valid @RequestBody CadastroPedido p) {
    // Cria
    return conta.cadastrar(p);
  }

  // POST /auth/login: entra e devolve o token
  @PostMapping("/login")
  public LoginResposta login(@Valid @RequestBody LoginPedido p) {
    // Entra
    return conta.entrar(p);
  }

  // POST /auth/sair: fecha o login deste aparelho
  @PostMapping("/sair")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void sair(@RequestHeader("Authorization") String cabecalho) {
    // Apaga pelo resumo do token
    sessoes.deleteById(Tokens.hash(cabecalho.substring(7).trim()));
  }

  // POST /auth/esqueci-senha: cria o link de redefinição (responde igual se o e-mail não existir)
  @PostMapping("/esqueci-senha")
  public Map<String, String> esqueci(@Valid @RequestBody EsqueciPedido p) {
    // Resposta
    Map<String, String> r = new HashMap<>();
    // Mensagem
    r.put("mensagem", "Se esse e-mail estiver cadastrado, você vai receber as instruções em instantes.");
    // Procura a conta
    usuarios.findByEmail(p.email().trim().toLowerCase()).ifPresent(u -> {
      // Token do link
      String token = Tokens.novo();
      // Guarda só o resumo, vale 1 hora
      redefinicoes.save(new RedefinicaoSenha(Tokens.hash(token), u, Instant.now().plus(Duration.ofHours(1))));
      // Link da página de nova senha
      String link = site + "/senha/redefinir.html?token=" + token;
      // Manda o e-mail
      email.enviar(u.getEmail(), "Saúde Life: crie uma senha nova", "Olá, " + u.getNome().split(" ")[0] + "!\n\nPara criar uma senha nova, abra o link abaixo (vale 1 hora):\n" + link + "\n\nSe não foi você, ignore este e-mail.");
      // Na demonstração (sem e-mail), o token também vai na resposta
      if (mostrarLink) r.put("tokenDemo", token);
    });
    // Responde
    return r;
  }

  // POST /auth/redefinir-senha: troca a senha com o token do link
  @PostMapping("/redefinir-senha")
  @Transactional
  public LoginResposta redefinir(@Valid @RequestBody RedefinirPedido p) {
    // Procura o pedido
    RedefinicaoSenha pedido = redefinicoes.findById(Tokens.hash(p.token())).orElseThrow(() -> ErroApi.invalido("Este link de redefinição é inválido ou expirou. Solicite um novo."));
    // Usado ou vencido
    if (pedido.isUsado() || pedido.getExpiraEm().isBefore(Instant.now())) throw ErroApi.invalido("Este link de redefinição é inválido ou expirou. Solicite um novo.");
    // Gasta o link
    pedido.setUsado(true);
    // Guarda
    redefinicoes.save(pedido);
    // Troca a senha e entra
    return conta.trocarSenha(pedido.getUsuario(), p.senha());
  }
}
