// Camada de acesso à API REST de produtos.
// Cada função faz uma única chamada HTTP e lança erro se o status não for o esperado.

const API_URL = 'http://localhost:8080/produtos';

async function lerErro(resposta) {
  let detalhe = '';
  try {
    detalhe = await resposta.text();
  } catch (e) {
    detalhe = '';
  }
  return new Error('Erro ' + resposta.status + (detalhe ? ': ' + detalhe : ''));
}

export async function listarProdutos() {
  const resposta = await fetch(API_URL);
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
  return resposta.json();
}

export async function buscarProduto(id) {
  const resposta = await fetch(API_URL + '/' + id);
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
  return resposta.json();
}

export async function criarProduto(produto) {
  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(produto)
  });
  if (resposta.status !== 201) {
    throw await lerErro(resposta);
  }
}

export async function atualizarProduto(id, produto) {
  const resposta = await fetch(API_URL + '/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(produto)
  });
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
}

export async function apagarProduto(id) {
  const resposta = await fetch(API_URL + '/' + id, {
    method: 'DELETE'
  });
  if (!resposta.ok) {
    throw await lerErro(resposta);
  }
}
