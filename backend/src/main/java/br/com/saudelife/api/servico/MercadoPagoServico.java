package br.com.saudelife.api.servico;

// Erros da API
import br.com.saudelife.api.erro.ErroApi;
// Modelo
import br.com.saudelife.api.modelo.Usuario;
// Lê do application.properties
import org.springframework.beans.factory.annotation.Value;
// Códigos e tipos HTTP
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
// Serviço do Spring
import org.springframework.stereotype.Service;
// Cliente HTTP do Spring
import org.springframework.web.client.RestClient;
// Listas e mapas
import java.util.List;
import java.util.Map;

// Pagamento pelo Mercado Pago (Checkout Pro: a pessoa paga com Pix ou cartão na página do Mercado Pago).
// Sem MERCADOPAGO_TOKEN, fica desligado e o site usa o pagamento de demonstração.
@Service
public class MercadoPagoServico {

  // Preços por mês
  public static final Map<String, Double> PRECOS = Map.of("Premium", 14.9, "Estudante", 9.9, "Família", 24.9, "Profissional", 49.9);
  // Desconto do anual
  public static final double DESCONTO_ANUAL = 0.2;

  // Token de acesso do Mercado Pago
  private final String token;
  // Endereço do site (volta depois de pagar)
  private final String site;
  // Endereço desta API (aviso de pagamento)
  private final String api;
  // Cliente HTTP
  private final RestClient http = RestClient.create("https://api.mercadopago.com");

  // Construtor
  public MercadoPagoServico(@Value("${saudelife.mercadopago-token}") String token, @Value("${saudelife.site}") String site, @Value("${saudelife.api}") String api) {
    // Guarda
    this.token = token;
    this.site = site;
    this.api = api;
  }

  // Está ligado?
  public boolean ligado() {
    // Precisa do token
    return token != null && !token.isBlank();
  }

  // Valor a pagar
  public static double valor(String plano, boolean anual) {
    // Preço do mês
    Double mes = PRECOS.get(plano);
    // Plano que não se paga aqui
    if (mes == null) throw ErroApi.invalido("Esse plano não pode ser assinado por aqui.");
    // Anual: 12 meses com desconto (2 casas)
    return anual ? Math.round(mes * 12 * (1 - DESCONTO_ANUAL) * 100) / 100.0 : mes;
  }

  // Cria o pagamento e devolve o link da página de pagamento
  @SuppressWarnings("unchecked")
  public String criarPagamento(Usuario u, String plano, boolean anual) {
    // Desligado
    if (!ligado()) throw new ErroApi(HttpStatus.SERVICE_UNAVAILABLE, "Pagamento ainda não configurado.");
    // Pedido para o Mercado Pago
    Map<String, Object> corpo = Map.of(
        // O que está sendo comprado
        "items", List.of(Map.of("title", "Saúde Life " + plano + (anual ? " (anual)" : " (mensal)"), "quantity", 1, "currency_id", "BRL", "unit_price", valor(plano, anual))),
        // Quem paga
        "payer", Map.of("email", u.getEmail()),
        // Quem e o quê (volta no aviso de pagamento)
        "external_reference", u.getId() + "|" + plano + "|" + (anual ? "anual" : "mensal"),
        // Para onde a pessoa volta depois de pagar
        "back_urls", Map.of("success", site + "/app/planos/planos.html?pagamento=ok", "pending", site + "/app/planos/planos.html?pagamento=pendente", "failure", site + "/app/planos/planos.html?pagamento=erro"),
        // Volta sozinho quando aprovado
        "auto_return", "approved",
        // Onde o Mercado Pago avisa
        "notification_url", api + "/webhooks/pagamento");
    // Chama
    Map<String, Object> r = http.post().uri("/checkout/preferences").header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).body(corpo).retrieve().body(Map.class);
    // Link de pagamento
    return (String) r.get("init_point");
  }

  // Busca um pagamento no Mercado Pago (para conferir o aviso, que poderia ser falso)
  @SuppressWarnings("unchecked")
  public Map<String, Object> buscarPagamento(String id) {
    // Chama
    return http.get().uri("/v1/payments/{id}", id).header("Authorization", "Bearer " + token).retrieve().body(Map.class);
  }
}
