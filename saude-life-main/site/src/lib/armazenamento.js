// Armazenamento no navegador (localStorage) e aviso de mudança para o React redesenhar.
// Todas as chaves do Saúde Life começam com "sl-".

// Nome do evento que avisa "algum dado mudou" (os componentes escutam e redesenham)
export const EVENTO_MUDOU = "sl:mudou";

// Lê uma chave (ou devolve o padrão se não tiver ou estiver estragada)
export function ler(chave, padrao) {
  // Tenta...
  try {
    // ...pegar o texto salvo
    const texto = localStorage.getItem(chave);
    // ...converter de JSON (ou o padrão se não tem)
    return texto === null ? padrao : JSON.parse(texto);
  } catch (e) {
    // Estragado ou navegador sem armazenamento: padrão
    return padrao;
  }
}

// Salva uma chave e avisa a página
export function gravar(chave, valor) {
  // Tenta salvar
  try {
    // Salva como JSON
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (e) {
    /* armazenamento indisponível: segue sem salvar */
  }
  // Avisa os componentes que algo mudou
  window.dispatchEvent(new CustomEvent(EVENTO_MUDOU, { detail: chave }));
}

// Apaga uma chave e avisa a página
export function apagar(chave) {
  // Tenta apagar
  try {
    // Apaga
    localStorage.removeItem(chave);
  } catch (e) {
    /* armazenamento indisponível */
  }
  // Avisa os componentes
  window.dispatchEvent(new CustomEvent(EVENTO_MUDOU, { detail: chave }));
}
