// Troca de tela pelo código (fora do JSX), usando o React Router.
// O roteador (src/rotas.jsx) se registra aqui quando é criado.

// Função de navegar do roteador (fica guardada aqui)
let navegarDoRoteador = null;

// O roteador chama isto ao ser criado
export function registrarNavegacao(funcao) {
  // Guarda a função do roteador
  navegarDoRoteador = funcao;
}

// Vai para outra tela (substituir = não deixa a tela atual no "voltar" do navegador)
export function irPara(caminho, substituir = false) {
  // Roteador pronto: troca de tela sem recarregar a página
  if (navegarDoRoteador) return navegarDoRoteador(caminho, { replace: substituir });
  // Sem roteador (não deveria acontecer): carrega o endereço
  window.location.assign(import.meta.env.BASE_URL + caminho.replace(/^\//, ""));
}
