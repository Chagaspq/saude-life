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
// Datas
import br.com.saudelife.api.servico.Datas;
// Validação
import jakarta.validation.Valid;
// Códigos HTTP
import org.springframework.http.HttpStatus;
// Anotações de rota
import org.springframework.web.bind.annotation.*;
// Lista e mapa
import java.util.List;
import java.util.Map;
// Identificador
import java.util.UUID;

// Painel do administrador. Todas as rotas /admin/** só abrem para contas admin (a Autenticacao confere).
// O admin só vê e mexe nos clientes da academia dele.
@RestController
@RequestMapping("/admin")
public class AdminController {

  // Repositórios
  private final UsuarioRepositorio usuarios;
  private final SessaoTreinoRepositorio historico;
  private final PesoRepositorio pesos;
  private final TreinoRepositorio treinos;
  private final AvisoRepositorio avisos;

  // Construtor
  public AdminController(UsuarioRepositorio usuarios, SessaoTreinoRepositorio historico, PesoRepositorio pesos, TreinoRepositorio treinos, AvisoRepositorio avisos) {
    // Guarda
    this.usuarios = usuarios;
    this.historico = historico;
    this.pesos = pesos;
    this.treinos = treinos;
    this.avisos = avisos;
  }

  // GET /admin/academia: dados da academia e o código para os clientes entrarem
  @GetMapping("/academia")
  public AcademiaDto academia(@RequestAttribute(Autenticacao.USUARIO) Usuario admin) {
    // Academia
    Academia a = admin.getAcademia();
    // Monta
    return new AcademiaDto(a.getId(), a.getNome(), a.getCodigo());
  }

  // GET /admin/clientes: clientes com o resumo de cada um
  @GetMapping("/clientes")
  public List<ClienteResumo> clientes(@RequestAttribute(Autenticacao.USUARIO) Usuario admin) {
    // Clientes da academia, com o resumo
    return usuarios.findByAcademiaAndTipoOrderByNome(admin.getAcademia(), TipoConta.cliente).stream().map(this::resumoCliente).toList();
  }

  // GET /admin/resumo: números do painel
  @GetMapping("/resumo")
  public AdminResumo resumo(@RequestAttribute(Autenticacao.USUARIO) Usuario admin) {
    // Resumos
    List<ClienteResumo> lista = clientes(admin);
    // Clientes, ativos na semana e treinos na semana
    return new AdminResumo(lista.size(), lista.stream().filter(c -> c.treinosSemana() > 0).count(), lista.stream().mapToLong(ClienteResumo::treinosSemana).sum());
  }

  // GET /admin/clientes/{id}: histórico e pesos de um cliente
  @GetMapping("/clientes/{id}")
  public Map<String, Object> cliente(@RequestAttribute(Autenticacao.USUARIO) Usuario admin, @PathVariable UUID id) {
    // Cliente da academia
    Usuario c = doAdmin(admin, id);
    // Resumo, histórico e pesos
    return Map.of("cliente", resumoCliente(c), "historico", historico.findByUsuarioOrderByDataDesc(c).stream().map(SessaoDto::de).toList(), "pesos", pesos.findByUsuarioOrderByData(c).stream().map(PesoDto::de).toList());
  }

  // POST /admin/clientes/{id}/treinos: monta e manda uma ficha para o cliente
  @PostMapping("/clientes/{id}/treinos")
  @ResponseStatus(HttpStatus.CREATED)
  public TreinoDto mandarTreino(@RequestAttribute(Autenticacao.USUARIO) Usuario admin, @PathVariable UUID id, @Valid @RequestBody TreinoPedido p) {
    // Cliente da academia
    Usuario c = doAdmin(admin, id);
    // Nova ficha
    Treino t = new Treino();
    // Dono: o cliente
    t.setUsuario(c);
    // Autor: o admin
    t.setAutor(admin);
    // Preenche (grupo padrão "Enviado por ...")
    TreinoController.preencher(t, new TreinoPedido(p.nome(), p.grupo() == null || p.grupo().isBlank() ? "Enviado por " + admin.getNome() : p.grupo(), p.itens()));
    // Guarda e devolve
    return TreinoDto.de(treinos.save(t));
  }

  // GET /admin/avisos: avisos publicados
  @GetMapping("/avisos")
  public List<AvisoDto> avisos(@RequestAttribute(Autenticacao.USUARIO) Usuario admin) {
    // Busca e converte
    return avisos.findByAcademiaOrderByDataDesc(admin.getAcademia()).stream().map(AvisoDto::de).toList();
  }

  // POST /admin/avisos: publica um aviso para todos os clientes
  @PostMapping("/avisos")
  @ResponseStatus(HttpStatus.CREATED)
  public AvisoDto publicar(@RequestAttribute(Autenticacao.USUARIO) Usuario admin, @Valid @RequestBody AvisoPedido p) {
    // Novo
    Aviso a = new Aviso();
    // Academia
    a.setAcademia(admin.getAcademia());
    // Autor
    a.setAutor(admin);
    // Texto
    a.setTexto(p.texto().trim());
    // Guarda e devolve
    return AvisoDto.de(avisos.save(a));
  }

  // DELETE /admin/avisos/{id}: apaga um aviso da academia
  @DeleteMapping("/avisos/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void apagarAviso(@RequestAttribute(Autenticacao.USUARIO) Usuario admin, @PathVariable UUID id) {
    // Procura na academia do admin
    Aviso a = avisos.findById(id).filter(x -> x.getAcademia().getId().equals(admin.getAcademia().getId())).orElseThrow(() -> ErroApi.naoAchou("Aviso não encontrado."));
    // Apaga
    avisos.delete(a);
  }

  // Acha um cliente e confere se é da academia do admin
  private Usuario doAdmin(Usuario admin, UUID id) {
    // Procura
    Usuario c = usuarios.findById(id).orElseThrow(() -> ErroApi.naoAchou("Cliente não encontrado."));
    // De outra academia (ou admin): finge que não existe
    if (c.ehAdmin() || c.getAcademia() == null || !c.getAcademia().getId().equals(admin.getAcademia().getId())) throw ErroApi.naoAchou("Cliente não encontrado.");
    // Devolve
    return c;
  }

  // Resumo de um cliente para a lista
  private ClienteResumo resumoCliente(Usuario c) {
    // Último treino
    var ultimo = historico.findFirstByUsuarioOrderByDataDesc(c);
    // Último peso
    var peso = pesos.findFirstByUsuarioOrderByDataDesc(c);
    // Monta
    return new ClienteResumo(c.getId(), c.getNome(), c.getEmail(), historico.countByUsuario(c), historico.countByUsuarioAndDataAfter(c, java.time.Instant.now().minus(java.time.Duration.ofDays(7))), ultimo.map(SessaoTreino::getData).orElse(null), peso.map(Peso::getValorKg).orElse(null));
  }
}
