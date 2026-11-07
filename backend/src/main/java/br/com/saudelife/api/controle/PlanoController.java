package br.com.saudelife.api.controle;

// Erros
import br.com.saudelife.api.erro.ErroApi;
// Formato do usuário
import br.com.saudelife.api.dto.Dtos.UsuarioDto;
// Modelo
import br.com.saudelife.api.modelo.Usuario;
// Repositório
import br.com.saudelife.api.repositorio.UsuarioRepositorio;
// Usuário logado
import br.com.saudelife.api.seguranca.Autenticacao;
// Anotações de rota
import org.springframework.web.bind.annotation.*;
// Datas
import java.time.Duration;
import java.time.Instant;
// Lista e mapa
import java.util.List;
import java.util.Map;

// Planos e assinatura. O pagamento de verdade (Pix e cartão) entra com um intermediário (ex.: Mercado Pago) na próxima versão.
@RestController
public class PlanoController {

  // Repositório
  private final UsuarioRepositorio usuarios;

  // Construtor
  public PlanoController(UsuarioRepositorio usuarios) {
    // Guarda
    this.usuarios = usuarios;
  }

  // GET /planos: planos e preços (pública)
  @GetMapping("/planos")
  public List<Map<String, Object>> planos() {
    // Mesma tabela do site
    return List.of(
        Map.of("nome", "Free", "mensal", 0),
        Map.of("nome", "Premium", "mensal", 14.9, "teste", "30 dias grátis"),
        Map.of("nome", "Estudante", "mensal", 9.9),
        Map.of("nome", "Família", "mensal", 24.9),
        Map.of("nome", "Profissional", "mensal", 49.9),
        Map.of("nome", "Academia", "mensal", "sob consulta"));
  }

  // POST /assinaturas/teste: começa o teste grátis de 30 dias (uma vez por conta)
  @PostMapping("/assinaturas/teste")
  public UsuarioDto teste(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Já usou
    if (u.isTesteUsado()) throw ErroApi.conflito("Você já usou o teste grátis.");
    // Premium
    u.setPlano("Premium");
    // Por 30 dias
    u.setPlanoFim(Instant.now().plus(Duration.ofDays(30)));
    // Marca o teste
    u.setTesteUsado(true);
    // Guarda e devolve
    return UsuarioDto.de(usuarios.save(u));
  }

  // POST /assinaturas/cancelar: volta para o Free
  @PostMapping("/assinaturas/cancelar")
  public UsuarioDto cancelar(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Free
    u.setPlano("Free");
    // Sem prazo
    u.setPlanoFim(null);
    // Guarda e devolve
    return UsuarioDto.de(usuarios.save(u));
  }
}
