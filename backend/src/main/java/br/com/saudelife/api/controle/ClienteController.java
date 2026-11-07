package br.com.saudelife.api.controle;

// Formatos de dados
import br.com.saudelife.api.dto.Dtos.*;
// Erros
import br.com.saudelife.api.erro.ErroApi;
// Modelos
import br.com.saudelife.api.modelo.*;
// Repositórios
import br.com.saudelife.api.repositorio.*;
// Usuário logado
import br.com.saudelife.api.seguranca.Autenticacao;
// Regras
import br.com.saudelife.api.servico.Datas;
import br.com.saudelife.api.servico.PontosServico;
// Validação
import jakarta.validation.Valid;
// Formato de data no endereço
import org.springframework.format.annotation.DateTimeFormat;
// Códigos HTTP
import org.springframework.http.HttpStatus;
// Transação
import org.springframework.transaction.annotation.Transactional;
// Anotações de rota
import org.springframework.web.bind.annotation.*;
// Datas
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
// Lista
import java.util.List;
// Identificador
import java.util.UUID;

// Rotas do dia a dia do cliente: histórico de treinos, refeições, água, peso, resumo, pontos e avisos
@RestController
public class ClienteController {

  // Repositórios e regras
  private final SessaoTreinoRepositorio historico;
  private final RefeicaoRepositorio refeicoes;
  private final AguaDiaRepositorio agua;
  private final PesoRepositorio pesos;
  private final PontoRepositorio pontosRepo;
  private final AvisoRepositorio avisos;
  private final PontosServico pontos;

  // Construtor
  public ClienteController(SessaoTreinoRepositorio historico, RefeicaoRepositorio refeicoes, AguaDiaRepositorio agua, PesoRepositorio pesos, PontoRepositorio pontosRepo, AvisoRepositorio avisos, PontosServico pontos) {
    // Guarda
    this.historico = historico;
    this.refeicoes = refeicoes;
    this.agua = agua;
    this.pesos = pesos;
    this.pontosRepo = pontosRepo;
    this.avisos = avisos;
    this.pontos = pontos;
  }

  // ---------- Treinos concluídos ----------

  // GET /sessoes?de=2026-10-01&ate=2026-11-07: histórico no período (sem datas: últimos 90 dias)
  @GetMapping("/sessoes")
  public List<SessaoDto> sessoes(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
    // Começo
    Instant ini = de == null ? Instant.now().minus(90, ChronoUnit.DAYS) : de.atStartOfDay(Datas.FUSO).toInstant();
    // Fim (fim do dia)
    Instant fim = ate == null ? Instant.now() : ate.plusDays(1).atStartOfDay(Datas.FUSO).toInstant();
    // Busca e converte
    return historico.findByUsuarioAndDataBetweenOrderByDataDesc(u, ini, fim).stream().map(SessaoDto::de).toList();
  }

  // POST /sessoes: registra um treino concluído e dá os pontos
  @PostMapping("/sessoes")
  @ResponseStatus(HttpStatus.CREATED)
  public SessaoDto concluir(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody SessaoPedido p) {
    // Novo registro
    SessaoTreino s = new SessaoTreino();
    // Dono
    s.setUsuario(u);
    // Ficha
    s.setTreinoId(p.treinoId());
    // Nome
    s.setNome(p.nome());
    // Duração
    s.setDuracaoMin(p.duracaoMin());
    // Séries
    s.setSeries(p.series());
    // Volume
    s.setVolume(p.volume());
    // Calorias
    s.setKcal(p.kcal());
    // Esforço
    s.setEsforco(p.esforco());
    // Guarda
    historico.save(s);
    // Pontos do treino
    pontos.ganhar(u, "treino", "treino:" + s.getId());
    // Bateu a meta da semana: pontos extras (uma vez por semana)
    if (historico.countByUsuarioAndDataAfter(u, Datas.inicioDaSemana()) >= u.getDiasSemana()) pontos.ganhar(u, "metaSemana", "metaSemana:" + Datas.inicioDaSemana());
    // Devolve
    return SessaoDto.de(s);
  }

  // GET /resumo/semana: números do Início
  @GetMapping("/resumo/semana")
  public ResumoSemana resumo(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Todos os treinos
    List<SessaoTreino> todos = historico.findByUsuarioOrderByDataDesc(u);
    // Desta semana
    long semana = todos.stream().filter(s -> !s.getData().isBefore(Datas.inicioDaSemana())).count();
    // Minutos
    long minutos = todos.stream().mapToLong(SessaoTreino::getDuracaoMin).sum();
    // Monta
    return new ResumoSemana(u.getDiasSemana(), semana, todos.size(), minutos, pontos.daSemana(u));
  }

  // ---------- Refeições e água ----------

  // GET /refeicoes?dia=2026-11-07: refeições do dia, totais e água (sem dia: hoje)
  @GetMapping("/refeicoes")
  public DiaRefeicoes dia(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dia) {
    // Dia
    LocalDate d = dia == null ? Datas.hoje() : dia;
    // Refeições
    List<RefeicaoDto> lista = refeicoes.findByUsuarioAndDiaOrderByHora(u, d).stream().map(RefeicaoDto::de).toList();
    // Água
    int ml = agua.findByUsuarioAndDia(u, d).map(AguaDia::getMl).orElse(0);
    // Totais
    return new DiaRefeicoes(d, lista, lista.stream().mapToInt(RefeicaoDto::kcal).sum(), lista.stream().mapToInt(RefeicaoDto::proteina).sum(), lista.stream().mapToInt(RefeicaoDto::carbo).sum(), lista.stream().mapToInt(RefeicaoDto::gordura).sum(), ml);
  }

  // POST /refeicoes: registra uma refeição e dá pontos (até 4 por dia)
  @PostMapping("/refeicoes")
  @ResponseStatus(HttpStatus.CREATED)
  public RefeicaoDto refeicao(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody RefeicaoPedido p) {
    // Nova
    Refeicao r = new Refeicao();
    // Dono
    r.setUsuario(u);
    // Dia (padrão: hoje)
    r.setDia(p.dia() == null ? Datas.hoje() : p.dia());
    // Hora
    r.setHora(p.hora());
    // Nome
    r.setNome(p.nome().trim());
    // Descrição
    r.setDescricao(p.descricao());
    // Calorias e macros
    r.setKcal(p.kcal());
    r.setProteina(p.proteina());
    r.setCarbo(p.carbo());
    r.setGordura(p.gordura());
    // Guarda
    refeicoes.save(r);
    // Pontos
    pontos.ganhar(u, "refeicao", "refeicao:" + r.getId());
    // Devolve
    return RefeicaoDto.de(r);
  }

  // DELETE /refeicoes/{id}: apaga e devolve os pontos
  @DeleteMapping("/refeicoes/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Transactional
  public void apagarRefeicao(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @PathVariable UUID id) {
    // Procura
    Refeicao r = refeicoes.findById(id).filter(x -> x.getUsuario().getId().equals(u.getId())).orElseThrow(() -> ErroApi.naoAchou("Refeição não encontrada."));
    // Apaga
    refeicoes.delete(r);
    // Devolve os pontos
    pontosRepo.deleteByUsuarioAndRef(u, "refeicao:" + id);
  }

  // PUT /agua/{dia}: grava o total de água do dia ({ "ml": 1500 })
  @PutMapping("/agua/{dia}")
  public AguaPedido agua(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dia, @Valid @RequestBody AguaPedido p) {
    // Linha do dia (ou nova)
    AguaDia a = agua.findByUsuarioAndDia(u, dia).orElseGet(AguaDia::new);
    // Dono
    a.setUsuario(u);
    // Dia
    a.setDia(dia);
    // Total
    a.setMl(p.ml());
    // Guarda
    agua.save(a);
    // Devolve
    return p;
  }

  // ---------- Peso ----------

  // GET /pesos?de=...&ate=...: pesos do período (sem datas: tudo)
  @GetMapping("/pesos")
  public List<PesoDto> pesos(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
    // Sem período: tudo
    if (de == null && ate == null) return pesos.findByUsuarioOrderByData(u).stream().map(PesoDto::de).toList();
    // Começo
    Instant ini = de == null ? Instant.EPOCH : de.atStartOfDay(Datas.FUSO).toInstant();
    // Fim
    Instant fim = ate == null ? Instant.now() : ate.plusDays(1).atStartOfDay(Datas.FUSO).toInstant();
    // Busca e converte
    return pesos.findByUsuarioAndDataBetweenOrderByData(u, ini, fim).stream().map(PesoDto::de).toList();
  }

  // POST /pesos: registra o peso de hoje (troca o de hoje se já tinha)
  @PostMapping("/pesos")
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public PesoDto peso(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody PesoPedido p) {
    // Apaga o de hoje
    pesos.deleteAll(pesos.findByUsuarioAndDataAfter(u, Datas.inicioDeHoje()));
    // Novo
    Peso novo = new Peso();
    // Dono
    novo.setUsuario(u);
    // Valor com 1 casa
    novo.setValorKg(Math.round(p.valorKg() * 10) / 10.0);
    // Guarda e devolve
    return PesoDto.de(pesos.save(novo));
  }

  // ---------- Pontos e avisos ----------

  // GET /pontos/semana: pontos da semana e quanto falta para subir de liga
  @GetMapping("/pontos/semana")
  public PontosResposta semana(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Pontos
    long pts = pontos.daSemana(u);
    // Monta
    return new PontosResposta(0, pts, PontosServico.SOBE, Math.max(0, PontosServico.SOBE - pts));
  }

  // POST /pontos: ganha pontos de uma ação (série feita, meta de água, proteína...)
  @PostMapping("/pontos")
  public PontosResposta ganhar(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody PontoPedido p) {
    // Treino só pontua por POST /sessoes
    if (p.tipo().equals("treino") || p.tipo().equals("metaSemana")) throw ErroApi.invalido("Esses pontos vêm ao concluir o treino.");
    // Ganha
    int g = pontos.ganhar(u, p.tipo(), p.ref());
    // Semana
    long pts = pontos.daSemana(u);
    // Monta
    return new PontosResposta(g, pts, PontosServico.SOBE, Math.max(0, PontosServico.SOBE - pts));
  }

  // GET /avisos: avisos da minha academia
  @GetMapping("/avisos")
  public List<AvisoDto> avisos(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Sem academia: nenhum
    if (u.getAcademia() == null) return List.of();
    // Busca e converte
    return avisos.findByAcademiaOrderByDataDesc(u.getAcademia()).stream().map(AvisoDto::de).toList();
  }
}
