package br.com.saudelife.api.controle;

// Erros
import br.com.saudelife.api.erro.ErroApi;
// Formato do usuário
import br.com.saudelife.api.dto.Dtos.UsuarioDto;
// Modelo
import br.com.saudelife.api.modelo.Usuario;
// Repositório
import br.com.saudelife.api.repositorio.UsuarioRepositorio;
// Pagamento
import br.com.saudelife.api.servico.MercadoPagoServico;
// Validação
import jakarta.validation.constraints.NotBlank;
// Registro no console
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// Período (mês, ano)
import java.time.ZoneOffset;
import java.util.UUID;
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

  // Console
  private static final Logger LOG = LoggerFactory.getLogger(PlanoController.class);
  // Repositório
  private final UsuarioRepositorio usuarios;
  // Mercado Pago
  private final MercadoPagoServico mp;

  // Pedido de assinatura
  public record AssinaturaPedido(@NotBlank String plano, boolean anual) {}

  // Construtor
  public PlanoController(UsuarioRepositorio usuarios, MercadoPagoServico mp) {
    // Guarda
    this.usuarios = usuarios;
    this.mp = mp;
  }

  // GET /assinaturas/config: o pagamento de verdade está ligado? (o site escolhe a tela)
  @GetMapping("/assinaturas/config")
  public Map<String, Object> config() {
    // Responde
    return Map.of("pagamentoReal", mp.ligado());
  }

  // POST /assinaturas/checkout: cria o pagamento no Mercado Pago e devolve o link
  @PostMapping("/assinaturas/checkout")
  public Map<String, String> checkout(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @jakarta.validation.Valid @RequestBody AssinaturaPedido p) {
    // Link da página de pagamento
    return Map.of("link", mp.criarPagamento(u, p.plano(), p.anual()));
  }

  // POST /webhooks/pagamento: o Mercado Pago avisa aqui. A API confere o pagamento lá antes de ativar.
  @PostMapping("/webhooks/pagamento")
  public Map<String, String> aviso(@RequestBody(required = false) Map<String, Object> corpo, @RequestParam(name = "data.id", required = false) String idParam, @RequestParam(name = "id", required = false) String idTopico) {
    // Desligado: ignora
    if (!mp.ligado()) return Map.of("ok", "ignorado");
    // Id do pagamento (vem no corpo ou no endereço)
    String id = idParam != null ? idParam : idTopico;
    // Do corpo
    if (id == null && corpo != null && corpo.get("data") instanceof Map<?, ?> d && d.get("id") != null) id = String.valueOf(d.get("id"));
    // Sem id: nada a fazer
    if (id == null) return Map.of("ok", "sem id");
    // Confere no Mercado Pago
    Map<String, Object> pg = mp.buscarPagamento(id);
    // Só pagamento aprovado
    if (!"approved".equals(pg.get("status"))) return Map.of("ok", "não aprovado");
    // Quem e o quê: "idDoUsuario|Plano|anual"
    String[] ref = String.valueOf(pg.get("external_reference")).split("\\|");
    // Formato estranho: ignora
    if (ref.length != 3) return Map.of("ok", "referência inválida");
    // Acha a pessoa
    usuarios.findById(UUID.fromString(ref[0])).ifPresent(u -> {
      // Ativa o plano
      u.setPlano(ref[1]);
      // Até: 1 ano ou 1 mês (somando ao que ainda falta)
      Instant base = u.getPlanoFim() != null && u.getPlanoFim().isAfter(Instant.now()) ? u.getPlanoFim() : Instant.now();
      // Novo fim
      u.setPlanoFim("anual".equals(ref[2]) ? base.atZone(ZoneOffset.UTC).plusYears(1).toInstant() : base.atZone(ZoneOffset.UTC).plusMonths(1).toInstant());
      // Não é teste
      u.setTesteUsado(true);
      // Guarda
      usuarios.save(u);
      // Console
      LOG.info("Plano {} ativado para {}", ref[1], u.getEmail());
    });
    // Recebido
    return Map.of("ok", "ativado");
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
