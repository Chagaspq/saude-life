package br.com.saudelife.api.erro;

// Códigos HTTP (400, 401, 403...)
import org.springframework.http.HttpStatus;

// Erro com o código HTTP certo e uma frase para mostrar na tela
public class ErroApi extends RuntimeException {

  // Código HTTP
  private final HttpStatus status;

  // Construtor
  public ErroApi(HttpStatus status, String mensagem) {
    // Guarda a frase
    super(mensagem);
    // Guarda o código
    this.status = status;
  }

  // Código HTTP
  public HttpStatus getStatus() { return status; }

  // Atalho: 400 dado inválido
  public static ErroApi invalido(String m) { return new ErroApi(HttpStatus.BAD_REQUEST, m); }
  // Atalho: 401 sem login
  public static ErroApi semLogin() { return new ErroApi(HttpStatus.UNAUTHORIZED, "Entre na sua conta para continuar."); }
  // Atalho: 403 sem permissão
  public static ErroApi proibido(String m) { return new ErroApi(HttpStatus.FORBIDDEN, m); }
  // Atalho: 404 não achou
  public static ErroApi naoAchou(String m) { return new ErroApi(HttpStatus.NOT_FOUND, m); }
  // Atalho: 409 já existe
  public static ErroApi conflito(String m) { return new ErroApi(HttpStatus.CONFLICT, m); }
}
