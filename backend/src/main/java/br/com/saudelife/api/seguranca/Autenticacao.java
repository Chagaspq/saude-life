package br.com.saudelife.api.seguranca;

// Erros da API
import br.com.saudelife.api.erro.ErroApi;
// Modelos
import br.com.saudelife.api.modelo.SessaoLogin;
import br.com.saudelife.api.modelo.Usuario;
// Repositório dos logins
import br.com.saudelife.api.repositorio.SessaoLoginRepositorio;
// Pedido e resposta HTTP
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
// Componente do Spring
import org.springframework.stereotype.Component;
// Pedido de "posso chamar?" do navegador (CORS)
import org.springframework.web.cors.CorsUtils;
// Interceptador (roda antes de cada rota)
import org.springframework.web.servlet.HandlerInterceptor;
// Data e hora
import java.time.Instant;

// Confere o login: lê "Authorization: Bearer <token>", acha o usuário e guarda no pedido.
// Rotas /admin/** exigem conta de administrador.
@Component
public class Autenticacao implements HandlerInterceptor {

  // Nome do atributo onde o usuário fica guardado (os controladores leem com @RequestAttribute)
  public static final String USUARIO = "usuario";

  // Logins abertos
  private final SessaoLoginRepositorio sessoes;

  // Construtor (o Spring entrega o repositório)
  public Autenticacao(SessaoLoginRepositorio sessoes) {
    // Guarda
    this.sessoes = sessoes;
  }

  // Antes de cada rota protegida
  @Override
  public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
    // Pergunta do navegador (CORS): deixa passar
    if (CorsUtils.isPreFlightRequest(req)) return true;
    // Cabeçalho do login
    String cabecalho = req.getHeader("Authorization");
    // Sem token: 401
    if (cabecalho == null || !cabecalho.startsWith("Bearer ")) throw ErroApi.semLogin();
    // Procura o login pelo resumo do token
    SessaoLogin sessao = sessoes.findById(Tokens.hash(cabecalho.substring(7).trim())).orElseThrow(ErroApi::semLogin);
    // Vencido: apaga e 401
    if (sessao.getExpiraEm().isBefore(Instant.now())) {
      // Apaga
      sessoes.delete(sessao);
      // 401
      throw ErroApi.semLogin();
    }
    // Usuário
    Usuario u = sessao.getUsuario();
    // Caminho da rota sem o /v1
    String caminho = req.getRequestURI().substring(req.getContextPath().length());
    // Rota de admin com conta de cliente: 403
    if (caminho.startsWith("/admin") && !u.ehAdmin()) throw ErroApi.proibido("Só administradores podem fazer isso.");
    // Guarda para os controladores
    req.setAttribute(USUARIO, u);
    // Segue
    return true;
  }
}
