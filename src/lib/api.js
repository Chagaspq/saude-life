// Conversa com a API (servidor em Java). Só funciona quando API_URL está configurada.
import { API_URL } from "../config.js";
import { ler } from "./armazenamento.js";

// O site está ligado na API?
export const apiLigada = () => !!API_URL;

// Erro da API com a frase para mostrar na tela
export class ErroApi extends Error {
  // Construtor
  constructor(mensagem, status) {
    // Frase
    super(mensagem);
    // Código HTTP
    this.status = status;
  }
}

// Chama uma rota da API e devolve o JSON (lança ErroApi se der errado)
export async function api(metodo, rota, corpo, token = ler("sl-sessao", null)?.token) {
  // Resposta
  let r;
  // Tenta
  try {
    // Chama
    r = await fetch(API_URL + rota, {
      // Método
      method: metodo,
      // Cabeçalhos
      headers: { ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: "Bearer " + token } : {}) },
      // Corpo em JSON
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      // Continua mesmo se a pessoa trocar de página no meio
      keepalive: metodo !== "GET",
    });
  } catch (e) {
    // Sem internet ou servidor dormindo
    throw new ErroApi("Não foi possível falar com o servidor. Confira a internet e tente de novo.", 0);
  }
  // Sem conteúdo (ex.: apagar)
  if (r.status === 204) return null;
  // Lê o JSON (pode vir vazio)
  const dados = await r.json().catch(() => null);
  // Erro: lança com a frase da API
  if (!r.ok) throw new ErroApi(dados?.erro || "Algo deu errado. Tente de novo.", r.status);
  // Devolve
  return dados;
}
