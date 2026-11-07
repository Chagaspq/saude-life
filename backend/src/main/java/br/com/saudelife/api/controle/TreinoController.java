package br.com.saudelife.api.controle;

// Formatos de dados
import br.com.saudelife.api.dto.Dtos.*;
// Erros
import br.com.saudelife.api.erro.ErroApi;
// Modelos
import br.com.saudelife.api.modelo.Treino;
import br.com.saudelife.api.modelo.Usuario;
// Repositório
import br.com.saudelife.api.repositorio.TreinoRepositorio;
// Usuário logado
import br.com.saudelife.api.seguranca.Autenticacao;
// Validação
import jakarta.validation.Valid;
// Códigos HTTP
import org.springframework.http.HttpStatus;
// Anotações de rota
import org.springframework.web.bind.annotation.*;
// Lista
import java.util.List;
// Identificador
import java.util.UUID;

// Fichas de treino do cliente (as dele e as que o admin mandou)
@RestController
@RequestMapping("/treinos")
public class TreinoController {

  // Repositório
  private final TreinoRepositorio treinos;

  // Construtor
  public TreinoController(TreinoRepositorio treinos) {
    // Guarda
    this.treinos = treinos;
  }

  // GET /treinos: minhas fichas
  @GetMapping
  public List<TreinoDto> listar(@RequestAttribute(Autenticacao.USUARIO) Usuario u) {
    // Busca e converte
    return treinos.findByUsuarioOrderByCriadoEmDesc(u).stream().map(TreinoDto::de).toList();
  }

  // POST /treinos: cria uma ficha
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public TreinoDto criar(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @Valid @RequestBody TreinoPedido p) {
    // Nova ficha
    Treino t = new Treino();
    // Dono
    t.setUsuario(u);
    // Preenche e guarda
    return TreinoDto.de(treinos.save(preencher(t, p)));
  }

  // PATCH /treinos/{id}: edita uma ficha minha
  @PatchMapping("/{id}")
  public TreinoDto editar(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @PathVariable UUID id, @Valid @RequestBody TreinoPedido p) {
    // Ficha minha
    Treino t = minha(u, id);
    // Preenche e guarda
    return TreinoDto.de(treinos.save(preencher(t, p)));
  }

  // DELETE /treinos/{id}: apaga uma ficha minha (o histórico continua)
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void apagar(@RequestAttribute(Autenticacao.USUARIO) Usuario u, @PathVariable UUID id) {
    // Apaga
    treinos.delete(minha(u, id));
  }

  // Acha a ficha e confere se é da pessoa
  private Treino minha(Usuario u, UUID id) {
    // Procura
    Treino t = treinos.findById(id).orElseThrow(() -> ErroApi.naoAchou("Treino não encontrado."));
    // De outra pessoa: finge que não existe
    if (!t.getUsuario().getId().equals(u.getId())) throw ErroApi.naoAchou("Treino não encontrado.");
    // Devolve
    return t;
  }

  // Copia os dados do pedido para a ficha (usado também pelo admin)
  static Treino preencher(Treino t, TreinoPedido p) {
    // Nome
    t.setNome(p.nome().trim());
    // Grupo (padrão "Corpo inteiro")
    t.setGrupo(p.grupo() == null || p.grupo().isBlank() ? "Corpo inteiro" : p.grupo().trim());
    // Exercícios
    t.trocarItens(p.itens().stream().map(ItemDto::modelo).toList());
    // Devolve
    return t;
  }
}
