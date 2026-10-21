// Salvos: treinos marcados com o botão de salvar
// Só continua se o núcleo do app (SL) foi carregado
window.SL &&
  // Roda o código desta página quando ela estiver pronta
  SL.pagina(() => {
    // Pega do núcleo a função que cria elementos e a que lê/salva dados
    const { el, storage } = SL;
    // Pega a lista de todos os treinos (o catálogo) do arquivo de dados
    const { CATALOGO } = window.SL_DADOS;
    // Lugar da página onde a lista de salvos vai aparecer
    const alvo = document.querySelector('[data-render="salvos"]');

    // Função que desenha a lista na tela
    function render() {
      // Lê do navegador os ids dos treinos salvos (ou uma lista vazia)
      const salvos = storage.get("sl-salvos", []);
      // Separa do catálogo só os treinos que estão salvos
      const itens = CATALOGO.filter((t) => salvos.includes(t.id));
      // Troca o conteúdo da área por um card para cada treino salvo
      alvo.replaceChildren(...itens.map(SL.cardTreinoCatalogo));
      // Se não tem nenhum treino salvo...
      if (!itens.length) {
        // ...coloca na área uma mensagem de "lista vazia"
        alvo.append(
          // Cria o bloco de estado vazio com título, texto e botão
          SL.estadoVazio(
            // Título da mensagem
            "Nada salvo por aqui",
            // Texto explicando o que fazer
            "Toque no marcador de um treino para guardar e encontrar depois.",
            // Botão que leva para a página Descobrir
            el("a", { href: "../descobrir/descobrir.html", class: "btn-primary", text: "Descobrir treinos" }),
          ),
        );
      }
    }

    // Ao remover um treino dos salvos, a lista se atualiza na hora
    // Quando algum treino é salvo ou removido, desenha a lista de novo
    document.addEventListener("sl:salvos", render);
    // Mostra um carregando rapidinho e depois chama render
    SL.carregar(alvo, render);
  });
