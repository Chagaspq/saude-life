package br.com.saudelife.api.erro;

// Erro de dado repetido no banco
import org.springframework.dao.DataIntegrityViolationException;
// Códigos HTTP
import org.springframework.http.HttpStatus;
// Resposta com código
import org.springframework.http.ResponseEntity;
// JSON ilegível
import org.springframework.http.converter.HttpMessageNotReadableException;
// Validação (@NotBlank etc.) que falhou
import org.springframework.web.bind.MethodArgumentNotValidException;
// Marca o tratador
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
// Mapa (vira JSON)
import java.util.Map;

// Transforma qualquer erro em { "erro": "frase" } com o código certo
@RestControllerAdvice
public class TratadorDeErros {

  // Erros da própria API
  @ExceptionHandler(ErroApi.class)
  public ResponseEntity<Map<String, String>> api(ErroApi e) {
    // Código e frase
    return ResponseEntity.status(e.getStatus()).body(Map.of("erro", e.getMessage()));
  }

  // Campos inválidos: mostra o primeiro problema
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> validacao(MethodArgumentNotValidException e) {
    // Primeiro erro de campo
    String msg = e.getBindingResult().getFieldErrors().stream().findFirst().map(f -> f.getDefaultMessage()).orElse("Dados inválidos.");
    // 400
    return ResponseEntity.badRequest().body(Map.of("erro", msg));
  }

  // JSON quebrado
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, String>> json(HttpMessageNotReadableException e) {
    // 400
    return ResponseEntity.badRequest().body(Map.of("erro", "Não deu para ler os dados enviados."));
  }

  // Dado repetido (ex.: e-mail já cadastrado ao mesmo tempo)
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, String>> repetido(DataIntegrityViolationException e) {
    // 409
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", "Esse dado já existe."));
  }
}
