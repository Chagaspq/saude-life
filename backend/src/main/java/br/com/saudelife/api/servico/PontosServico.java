package br.com.saudelife.api.servico;

// Erros da API
import br.com.saudelife.api.erro.ErroApi;
// Modelos
import br.com.saudelife.api.modelo.Ponto;
import br.com.saudelife.api.modelo.Usuario;
// Repositório dos pontos
import br.com.saudelife.api.repositorio.PontoRepositorio;
// Serviço do Spring
import org.springframework.stereotype.Service;
// Mapa
import java.util.Map;

// Regras dos pontos (as mesmas do site): cada ação pontua uma vez, até 300 por dia, refeições até 4 por dia
@Service
public class PontosServico {

  // Quanto vale cada ação
  public static final Map<String, Integer> TABELA = Map.of("serie", 10, "treino", 50, "refeicao", 5, "proteina", 15, "agua", 10, "recorde", 20, "metaSemana", 100);
  // Limite por dia
  public static final int LIMITE_DIA = 300;
  // Refeições que pontuam por dia
  public static final int LIMITE_REFEICOES = 4;
  // Pontos na semana para subir de liga
  public static final int SOBE = 500;

  // Repositório
  private final PontoRepositorio pontos;

  // Construtor
  public PontosServico(PontoRepositorio pontos) {
    // Guarda
    this.pontos = pontos;
  }

  // Dá os pontos de uma ação (devolve quantos ganhou; 0 se já tinha ganhado ou bateu o limite)
  public int ganhar(Usuario u, String tipo, String ref) {
    // Tipo desconhecido
    if (!TABELA.containsKey(tipo)) throw ErroApi.invalido("Tipo de ponto desconhecido.");
    // Essa ação já pontuou
    if (pontos.existsByUsuarioAndRef(u, ref)) return 0;
    // Refeições além do limite do dia não pontuam
    if (tipo.equals("refeicao") && pontos.countByUsuarioAndTipoAndDataAfter(u, "refeicao", Datas.inicioDeHoje()) >= LIMITE_REFEICOES) return 0;
    // Quanto ainda cabe hoje
    long cabe = LIMITE_DIA - pontos.somaDesde(u, Datas.inicioDeHoje());
    // Pontos (no máximo o que cabe)
    int pts = (int) Math.min(TABELA.get(tipo), Math.max(0, cabe));
    // Nada: para
    if (pts <= 0) return 0;
    // Guarda
    pontos.save(new Ponto(u, ref, tipo, pts));
    // Devolve
    return pts;
  }

  // Pontos desta semana
  public long daSemana(Usuario u) {
    // Soma desde segunda
    return pontos.somaDesde(u, Datas.inicioDaSemana());
  }
}
