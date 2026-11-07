package br.com.saudelife.api.controle;

// Formatos de dados
import br.com.saudelife.api.dto.Dtos.*;
// Erros
import br.com.saudelife.api.erro.ErroApi;
// Modelos
import br.com.saudelife.api.modelo.Usuario;
// Repositórios
import br.com.saudelife.api.repositorio.*;
// Nome do atributo do usuário logado
import br.com.saudelife.api.seguranca.Autenticacao;
// Regras da conta
import br.com.saudelife.api.servico.ContaServico;
// Validação
import jakarta.validation.Valid;
// Códigos HTTP
import org.springframework.http.HttpStatus;
// Anotações de rota
import org.springframework.web.bind.annotation.*;
// Mapas
import java.util.LinkedHashMap;
import java.util.Map;

// Rotas do próprio usuário: ver e mudar o perfil, senha, e-mail, exportar e excluir
@RestController
@RequestMapping("/me")
public class MeController {

  // Regras e repositórios
  private final ContaServico conta;
  private final UsuarioRepositorio usuarios;
  private final AcademiaRepositorio academias;
  private final TreinoRepositorio treinos;
  private final SessaoTreinoRepositorio historico;
  private final RefeicaoRepositorio refeicoes;
  private final PesoRepositorio pesos;
  private final PontoRepositorio pontos;

  // Construtor
  public MeController(ContaServico conta, UsuarioRepositorio usuarios, AcademiaRepositorio academias, TreinoRepositorio treinos, SessaoTreinoRepositorio historico, RefeicaoRepositorio refeicoes, PesoRepositorio pesos, PontoRepositorio pontos) {
    // Guarda
    this.conta = conta;
    this.usuarios = usuarios;
    this.academias = academias;
    this.treinos = treinos;
    this.historico = historico;
    this.refeicoes = refeicoes;
    this.pesos = pesos;
    this.pontos = pontos;
  }

  // GET /me: dados da conta e do perfil
  @GetMapping
  public UsuarioDto eu(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Converte
    return UsuarioDto.de(u);
  }

  // PATCH /me: muda só o que veio preenchido
  @PatchMapping
  public UsuarioDto atualizar(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody PerfilPedido p) {
    // Nome
    if (p.nome() != null && !p.nome().isBlank()) u.setNome(p.nome().trim());
    // Apelido
    if (p.apelido() != null) u.setApelido(p.apelido().trim());
    // Bio
    if (p.bio() != null) u.setBio(p.bio().trim());
    // Altura
    if (p.alturaCm() != null) u.setAlturaCm(p.alturaCm());
    // Objetivo
    if (p.objetivo() != null) u.setObjetivo(p.objetivo());
    // Nível
    if (p.nivel() != null) u.setNivel(p.nivel());
    // Meta da semana
    if (p.diasSemana() != null) u.setDiasSemana(p.diasSemana());
    // Guarda e devolve
    return UsuarioDto.de(usuarios.save(u));
  }

  // PATCH /me/senha: troca a senha (pede a atual) e devolve um token novo
  @PatchMapping("/senha")
  public LoginResposta senha(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody SenhaPedido p) {
    // Confere a atual
    conta.conferirSenha(u, p.atual());
    // Troca
    return conta.trocarSenha(u, p.nova());
  }

  // PATCH /me/email: troca o e-mail (pede a senha)
  @PatchMapping("/email")
  public UsuarioDto email(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody EmailPedido p) {
    // Confere a senha
    conta.conferirSenha(u, p.senha());
    // E-mail novo
    String novo = p.email().trim().toLowerCase();
    // Já usado por outra conta
    if (!novo.equals(u.getEmail()) && usuarios.existsByEmail(novo)) throw ErroApi.conflito("Já existe uma conta com esse e-mail.");
    // Troca
    u.setEmail(novo);
    // Guarda e devolve
    return UsuarioDto.de(usuarios.save(u));
  }

  // PATCH /me/academia: cliente entra numa academia pelo código
  @PatchMapping("/academia")
  public UsuarioDto academia(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody CodigoPedido p) {
    // Admin não troca
    if (u.ehAdmin()) throw ErroApi.proibido("A conta de administrador já tem a própria academia.");
    // Procura
    u.setAcademia(academias.findByCodigoIgnoreCase(p.codigo().trim()).orElseThrow(() -> ErroApi.naoAchou("Código de academia não encontrado.")));
    // Guarda e devolve
    return UsuarioDto.de(usuarios.save(u));
  }

  // GET /me/exportar: todos os dados da pessoa (LGPD)
  @GetMapping("/exportar")
  public Map<String, Object> exportar(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Mapa na ordem
    Map<String, Object> d = new LinkedHashMap<>();
    // Conta
    d.put("conta", UsuarioDto.de(u));
    // Fichas
    d.put("treinos", treinos.findByUsuarioOrderByCriadoEmDesc(u).stream().map(TreinoDto::de).toList());
    // Histórico
    d.put("historico", historico.findByUsuarioOrderByDataDesc(u).stream().map(SessaoDto::de).toList());
    // Refeições
    d.put("refeicoes", refeicoes.findByUsuarioOrderByDiaDesc(u).stream().map(RefeicaoDto::de).toList());
    // Pesos
    d.put("pesos", pesos.findByUsuarioOrderByData(u).stream().map(PesoDto::de).toList());
    // Pontos
    d.put("pontos", pontos.findByUsuarioOrderByDataDesc(u).stream().map(x -> Map.of("tipo", x.getTipo(), "pts", x.getPts(), "data", x.getData())).toList());
    // Devolve
    return d;
  }

  // DELETE /me: exclui a conta e tudo (pede a senha)
  @DeleteMapping
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void excluir(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody SenhaAtual p) {
    // Confere a senha
    conta.conferirSenha(u, p.senha());
    // Apaga
    conta.excluir(u);
  }
}
