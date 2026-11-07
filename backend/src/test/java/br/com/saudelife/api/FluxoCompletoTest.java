package br.com.saudelife.api;

// Testes
import org.junit.jupiter.api.Test;
// Liga o servidor de verdade numa porta aleatória
import org.springframework.boot.test.context.SpringBootTest;
// Cliente HTTP de teste
import org.springframework.boot.test.web.client.TestRestTemplate;
// Injeção
import org.springframework.beans.factory.annotation.Autowired;
// HTTP
import org.springframework.http.*;
// Listas e mapas
import java.util.List;
import java.util.Map;

// Verificações
import static org.assertj.core.api.Assertions.assertThat;

// Testa o caminho principal da apresentação: cadastro, login, treino, refeição, peso, admin mandando treino e aviso
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FluxoCompletoTest {

  // Cliente HTTP (já aponta para http://localhost:<porta>/v1)
  @Autowired
  TestRestTemplate http;

  // Usa o cliente HTTP do Java 11+ (lê a resposta 401 de um POST e aceita PATCH)
  @org.junit.jupiter.api.BeforeEach
  void preparar() {
    // Troca o motor do cliente
    http.getRestTemplate().setRequestFactory(new org.springframework.http.client.JdkClientHttpRequestFactory());
  }

  // Monta um pedido com JSON e o token
  private HttpEntity<Object> com(String token, Object corpo) {
    // Cabeçalhos
    HttpHeaders h = new HttpHeaders();
    // JSON
    h.setContentType(MediaType.APPLICATION_JSON);
    // Token
    if (token != null) h.setBearerAuth(token);
    // Pedido
    return new HttpEntity<>(corpo, h);
  }

  // Faz uma chamada e devolve a resposta como mapa
  @SuppressWarnings({"rawtypes", "unchecked"})
  private ResponseEntity<Map> chamar(HttpMethod metodo, String rota, String token, Object corpo) {
    // Chama
    return http.exchange(rota, metodo, com(token, corpo), Map.class);
  }

  // Token de uma resposta de login
  @SuppressWarnings("rawtypes")
  private String token(ResponseEntity<Map> r) {
    // Campo "token"
    return (String) r.getBody().get("token");
  }

  @Test
  @SuppressWarnings({"rawtypes", "unchecked"})
  void caminhoPrincipal() {
    // Sem login: 401
    assertThat(chamar(HttpMethod.GET, "/me", null, null).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

    // Admin entra (conta de demonstração) e pega o código da academia
    ResponseEntity<Map> loginAdmin = chamar(HttpMethod.POST, "/auth/login", null, Map.of("email", "admin@saudelife.app", "senha", "demo1234"));
    // Deu certo
    assertThat(loginAdmin.getStatusCode()).isEqualTo(HttpStatus.OK);
    // Token do admin
    String admin = token(loginAdmin);

    // Cliente novo se cadastra com o código SL-DEMO
    ResponseEntity<Map> cad = chamar(HttpMethod.POST, "/auth/cadastro", null, Map.of("nome", "Ana Teste", "email", "Ana@Teste.com", "senha", "Senha@123", "tipo", "cliente", "codigoAcademia", "sl-demo"));
    // 201
    assertThat(cad.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    // Token da cliente
    String ana = token(cad);
    // E-mail repetido: 409
    assertThat(chamar(HttpMethod.POST, "/auth/cadastro", null, Map.of("nome", "X", "email", "ana@teste.com", "senha", "Senha@123")).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    // Senha curta: 400 com a frase
    ResponseEntity<Map> curta = chamar(HttpMethod.POST, "/auth/cadastro", null, Map.of("nome", "X", "email", "x@teste.com", "senha", "123"));
    // Confere
    assertThat(curta.getBody().get("erro")).isEqualTo("A senha precisa ter no mínimo 8 caracteres.");
    // Senha errada no login: 401
    assertThat(chamar(HttpMethod.POST, "/auth/login", null, Map.of("email", "ana@teste.com", "senha", "errada123")).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

    // Cliente não abre rota de admin: 403
    assertThat(chamar(HttpMethod.GET, "/admin/clientes", ana, null).getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

    // Cliente cria uma ficha
    ResponseEntity<Map> ficha = chamar(HttpMethod.POST, "/treinos", ana, Map.of("nome", "Treino A", "itens", List.of(Map.of("nome", "Supino reto", "series", 3, "reps", "12", "carga", 20, "descansoS", 60))));
    // 201
    assertThat(ficha.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    // Conclui um treino
    assertThat(chamar(HttpMethod.POST, "/sessoes", ana, Map.of("treinoId", ficha.getBody().get("id"), "nome", "Treino A", "duracaoMin", 40, "series", 3, "volume", 720, "kcal", 200)).getStatusCode()).isEqualTo(HttpStatus.CREATED);
    // Registra refeição e peso
    assertThat(chamar(HttpMethod.POST, "/refeicoes", ana, Map.of("nome", "Almoço", "hora", "12:30", "kcal", 600, "proteina", 40, "carbo", 70, "gordura", 15)).getStatusCode()).isEqualTo(HttpStatus.CREATED);
    // Peso
    assertThat(chamar(HttpMethod.POST, "/pesos", ana, Map.of("valorKg", 62.5)).getStatusCode()).isEqualTo(HttpStatus.CREATED);
    // Pontos da semana: treino (50) + refeição (5)
    assertThat(((Number) chamar(HttpMethod.GET, "/pontos/semana", ana, null).getBody().get("semana")).intValue()).isEqualTo(55);
    // Resumo: 1 treino nesta semana
    assertThat(((Number) chamar(HttpMethod.GET, "/resumo/semana", ana, null).getBody().get("nestaSemana")).intValue()).isEqualTo(1);

    // Admin vê a Ana na lista de clientes
    List<Map> clientes = http.exchange("/admin/clientes", HttpMethod.GET, com(admin, null), List.class).getBody();
    // Acha a Ana
    Map anaNaLista = clientes.stream().filter(c -> "ana@teste.com".equals(c.get("email"))).findFirst().orElseThrow();
    // Ela tem 1 treino e o peso
    assertThat(((Number) anaNaLista.get("treinosTotal")).intValue()).isEqualTo(1);
    assertThat(((Number) anaNaLista.get("ultimoPesoKg")).doubleValue()).isEqualTo(62.5);
    // Admin manda um treino para a Ana
    assertThat(chamar(HttpMethod.POST, "/admin/clientes/" + anaNaLista.get("id") + "/treinos", admin, Map.of("nome", "Treino do Personal", "itens", List.of(Map.of("nome", "Remada", "series", 3, "reps", "12", "carga", 30, "descansoS", 60)))).getStatusCode()).isEqualTo(HttpStatus.CREATED);
    // Admin publica um aviso
    assertThat(chamar(HttpMethod.POST, "/admin/avisos", admin, Map.of("texto", "Academia fecha às 18h no feriado")).getStatusCode()).isEqualTo(HttpStatus.CREATED);

    // A Ana vê o treino recebido (com o autor) e o aviso
    List<Map> treinos = http.exchange("/treinos", HttpMethod.GET, com(ana, null), List.class).getBody();
    // Treino do admin está lá
    assertThat(treinos).anyMatch(t -> "Treino do Personal".equals(t.get("nome")) && "Academia Demonstração".equals(t.get("autor")));
    // Aviso
    List<Map> avisos = http.exchange("/avisos", HttpMethod.GET, com(ana, null), List.class).getBody();
    // Está lá
    assertThat(avisos).anyMatch(a -> "Academia fecha às 18h no feriado".equals(a.get("texto")));

    // Esqueci a senha: na demonstração o token vem na resposta
    String tokenSenha = (String) chamar(HttpMethod.POST, "/auth/esqueci-senha", null, Map.of("email", "ana@teste.com")).getBody().get("tokenDemo");
    // Redefine
    assertThat(chamar(HttpMethod.POST, "/auth/redefinir-senha", null, Map.of("token", tokenSenha, "senha", "Nova@1234")).getStatusCode()).isEqualTo(HttpStatus.OK);
    // O link não funciona duas vezes
    assertThat(chamar(HttpMethod.POST, "/auth/redefinir-senha", null, Map.of("token", tokenSenha, "senha", "Outra@1234")).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    // Entra com a senha nova
    String ana2 = token(chamar(HttpMethod.POST, "/auth/login", null, Map.of("email", "ana@teste.com", "senha", "Nova@1234")));

    // Sair fecha o login
    assertThat(chamar(HttpMethod.POST, "/auth/sair", ana2, null).getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    // Token antigo não vale mais
    assertThat(chamar(HttpMethod.GET, "/me", ana2, null).getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }
}
