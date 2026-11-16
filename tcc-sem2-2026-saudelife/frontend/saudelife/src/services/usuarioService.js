// Camada de acesso à API REST de usuários (Spring Boot em http://localhost:8080).
// Cada função faz uma única chamada HTTP e lança erro se o status não for o esperado.

// Endereço da API de usuários
const API_URL = 'http://localhost:8080/usuarios';

// Monta o erro com o status e a frase que a API mandou (ex.: "Já existe um usuário com este e-mail.")
async function lerErro(resposta) {
  // Frase da API
  let detalhe = '';
  // Tenta ler o texto da resposta
  try {
    detalhe = await resposta.text();
  } catch (e) {
    detalhe = '';
  }
  // Erro com o código e a frase
  return new Error('Erro ' + resposta.status + (detalhe ? ': ' + detalhe : ''));
}

// GET /usuarios: lista todos
export async function listarUsuarios() {
  // Chama a API
  const resposta = await fetch(API_URL);
  // Deu errado: lança o erro
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
  // Lista em JSON
  return resposta.json();
}

// GET /usuarios/{id}: busca um
export async function buscarUsuario(id) {
  // Chama a API
  const resposta = await fetch(API_URL + '/' + id);
  // Deu errado: lança o erro
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
  // Usuário em JSON
  return resposta.json();
}

// POST /usuarios: cadastra (a API responde 201 Created)
export async function criarUsuario(usuario) {
  // Chama a API mandando o usuário em JSON
  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario)
  });
  // Só 201 é sucesso
  if (resposta.status !== 201) {
    throw await lerErro(resposta);
  }
}

// PUT /usuarios/{id}: altera
export async function atualizarUsuario(id, usuario) {
  // Chama a API mandando os dados novos
  const resposta = await fetch(API_URL + '/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario)
  });
  // Deu errado: lança o erro
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
}

// DELETE /usuarios/{id}: apaga (a API responde 204 No Content)
export async function apagarUsuario(id) {
  // Chama a API
  const resposta = await fetch(API_URL + '/' + id, {
    method: 'DELETE'
  });
  // Deu errado: lança o erro
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
}
