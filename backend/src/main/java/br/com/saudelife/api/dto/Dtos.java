package br.com.saudelife.api.dto;

// Modelos (para converter em resposta)
import br.com.saudelife.api.modelo.*;
// Regras de validação
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
// Data e hora
import java.time.Instant;
import java.time.LocalDate;
// Lista
import java.util.List;
// Identificador
import java.util.UUID;

// Formatos dos dados que entram (pedidos) e saem (respostas) da API, em JSON.
// "record" é uma classe curta só com dados.
public final class Dtos {

  // Ninguém cria objetos desta classe
  private Dtos() {}

  // ---------- Conta ----------

  // Pedido de cadastro
  public record CadastroPedido(
      // Nome
      @NotBlank(message = "Digite seu nome completo.") @Size(max = 80) String nome,
      // E-mail
      @NotBlank(message = "Digite seu e-mail.") @Email(message = "Digite um e-mail válido.") String email,
      // Senha (mínimo 8)
      @NotBlank(message = "Digite sua senha.") @Size(min = 8, max = 100, message = "A senha precisa ter no mínimo 8 caracteres.") String senha,
      // "cliente" ou "admin" (vazio = cliente)
      String tipo,
      // Cliente: código da academia (opcional)
      String codigoAcademia,
      // Admin: nome da academia (opcional)
      String academia) {}

  // Pedido de login
  public record LoginPedido(@NotBlank(message = "Digite seu e-mail.") String email, @NotBlank(message = "Digite sua senha.") String senha) {}

  // Resposta do login e do cadastro
  public record LoginResposta(String token, UsuarioDto usuario) {}

  // Academia na resposta (o código só aparece para o admin)
  public record AcademiaDto(UUID id, String nome, String codigo) {}

  // Usuário na resposta (nunca leva a senha)
  public record UsuarioDto(UUID id, String nome, String email, String tipo, AcademiaDto academia, String apelido, String bio, Integer alturaCm, String objetivo, String nivel, Integer diasSemana, String plano, Instant planoFim) {
    // Converte o modelo
    public static UsuarioDto de(Usuario u) {
      // Academia (com código só para admin)
      AcademiaDto a = u.getAcademia() == null ? null : new AcademiaDto(u.getAcademia().getId(), u.getAcademia().getNome(), u.ehAdmin() ? u.getAcademia().getCodigo() : null);
      // Plano vencido volta a ser Free
      boolean vencido = u.getPlanoFim() != null && u.getPlanoFim().isBefore(Instant.now());
      // Monta
      return new UsuarioDto(u.getId(), u.getNome(), u.getEmail(), u.getTipo().name(), a, u.getApelido(), u.getBio(), u.getAlturaCm(), u.getObjetivo(), u.getNivel(), u.getDiasSemana(), vencido ? "Free" : u.getPlano(), vencido ? null : u.getPlanoFim());
    }
  }

  // Atualizar perfil (só os campos que vierem preenchidos)
  public record PerfilPedido(@Size(max = 80) String nome, @Size(max = 20) String apelido, @Size(max = 160) String bio, @Min(120) @Max(230) Integer alturaCm, String objetivo, String nivel, @Min(1) @Max(7) Integer diasSemana) {}

  // Trocar senha
  public record SenhaPedido(@NotBlank String atual, @NotBlank @Size(min = 8, message = "A senha nova precisa ter no mínimo 8 caracteres.") String nova) {}

  // Trocar e-mail
  public record EmailPedido(@NotBlank String senha, @NotBlank @Email(message = "Digite um e-mail válido.") String email) {}

  // Pedidos com só a senha, só o e-mail, ou só o código
  public record SenhaAtual(@NotBlank String senha) {}
  public record EsqueciPedido(@NotBlank @Email String email) {}
  public record RedefinirPedido(@NotBlank String token, @NotBlank @Size(min = 8, message = "A senha precisa ter no mínimo 8 caracteres.") String senha) {}
  public record CodigoPedido(@NotBlank String codigo) {}

  // ---------- Treinos ----------

  // Um exercício da ficha
  public record ItemDto(@NotBlank String nome, @Min(1) @Max(20) int series, String reps, @Min(0) double carga, @Min(0) int descansoS) {
    // Converte o modelo
    public static ItemDto de(TreinoItem i) { return new ItemDto(i.getNome(), i.getSeries(), i.getReps(), i.getCarga(), i.getDescansoS()); }
    // Vira modelo
    public TreinoItem modelo() {
      // Novo
      TreinoItem i = new TreinoItem();
      // Nome
      i.setNome(nome);
      // Séries
      i.setSeries(series);
      // Reps (padrão 12)
      i.setReps(reps == null || reps.isBlank() ? "12" : reps);
      // Carga
      i.setCarga(carga);
      // Descanso
      i.setDescansoS(descansoS);
      // Pronto
      return i;
    }
  }

  // Pedido de criar ou editar ficha
  public record TreinoPedido(@NotBlank(message = "Dê um nome ao treino.") @Size(max = 60) String nome, @Size(max = 60) String grupo, @NotEmpty(message = "Adicione pelo menos 1 exercício.") @Size(max = 30) List<@Valid ItemDto> itens) {}

  // Ficha na resposta
  public record TreinoDto(UUID id, String nome, String grupo, String autor, Instant criadoEm, List<ItemDto> itens) {
    // Converte o modelo
    public static TreinoDto de(Treino t) { return new TreinoDto(t.getId(), t.getNome(), t.getGrupo(), t.getAutor() == null ? null : t.getAutor().getNome(), t.getCriadoEm(), t.getItens().stream().map(ItemDto::de).toList()); }
  }

  // Treino concluído (o site manda o resumo no fim do treino)
  public record SessaoPedido(UUID treinoId, @NotBlank String nome, @Min(0) int duracaoMin, @Min(0) int series, @Min(0) double volume, @Min(0) int kcal, String esforco) {}

  // Treino concluído na resposta
  public record SessaoDto(UUID id, UUID treinoId, String nome, Instant data, int duracaoMin, int series, double volume, int kcal, String esforco) {
    // Converte o modelo
    public static SessaoDto de(SessaoTreino s) { return new SessaoDto(s.getId(), s.getTreinoId(), s.getNome(), s.getData(), s.getDuracaoMin(), s.getSeries(), s.getVolume(), s.getKcal(), s.getEsforco()); }
  }

  // ---------- Alimentação e evolução ----------

  // Pedido de refeição
  public record RefeicaoPedido(LocalDate dia, String hora, @NotBlank(message = "Dê um nome à refeição.") @Size(max = 40) String nome, @Size(max = 120) String descricao, @Min(0) @Max(3000) int kcal, @Min(0) int proteina, @Min(0) int carbo, @Min(0) int gordura) {}

  // Refeição na resposta
  public record RefeicaoDto(UUID id, LocalDate dia, String hora, String nome, String descricao, int kcal, int proteina, int carbo, int gordura) {
    // Converte o modelo
    public static RefeicaoDto de(Refeicao r) { return new RefeicaoDto(r.getId(), r.getDia(), r.getHora(), r.getNome(), r.getDescricao(), r.getKcal(), r.getProteina(), r.getCarbo(), r.getGordura()); }
  }

  // Refeições do dia com os totais
  public record DiaRefeicoes(LocalDate dia, List<RefeicaoDto> refeicoes, int kcal, int proteina, int carbo, int gordura, int aguaMl) {}

  // Água do dia
  public record AguaPedido(@Min(0) @Max(6000) int ml) {}

  // Pedido de peso
  public record PesoPedido(@DecimalMin(value = "30", message = "Peso entre 30 e 300 kg.") @DecimalMax(value = "300", message = "Peso entre 30 e 300 kg.") double valorKg) {}

  // Peso na resposta
  public record PesoDto(Instant data, double valorKg) {
    // Converte o modelo
    public static PesoDto de(Peso p) { return new PesoDto(p.getData(), p.getValorKg()); }
  }

  // Números do Início
  public record ResumoSemana(int meta, long nestaSemana, long total, long minutos, long pontosSemana) {}

  // ---------- Pontos e avisos ----------

  // Pedido de pontos (série feita, meta de água...)
  public record PontoPedido(@NotBlank String tipo, @NotBlank @Size(max = 120) String ref) {}

  // Resposta dos pontos
  public record PontosResposta(int ganhos, long semana, int sobe, long faltamParaSubir) {}

  // Pedido de aviso
  public record AvisoPedido(@NotBlank(message = "Escreva o aviso.") @Size(max = 120, message = "No máximo 120 letras.") String texto) {}

  // Aviso na resposta
  public record AvisoDto(UUID id, String texto, String autor, Instant data) {
    // Converte o modelo
    public static AvisoDto de(Aviso a) { return new AvisoDto(a.getId(), a.getTexto(), a.getAutor().getNome(), a.getData()); }
  }

  // ---------- Administrador ----------

  // Cliente na lista do painel
  public record ClienteResumo(UUID id, String nome, String email, long treinosTotal, long treinosSemana, Instant ultimoTreino, Double ultimoPesoKg) {}

  // Números do painel
  public record AdminResumo(long clientes, long ativosSemana, long treinosSemana) {}
}
