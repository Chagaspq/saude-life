// Salvos: treinos marcados com o botão de salvar
window.SL &&
  SL.pagina(() => {
    const { el, storage } = SL;
    const { CATALOGO } = window.SL_DADOS;
    const alvo = document.querySelector('[data-render="salvos"]');

    function render() {
      const salvos = storage.get("sl-salvos", []);
      const itens = CATALOGO.filter((t) => salvos.includes(t.id));
      alvo.replaceChildren(...itens.map(SL.cardTreinoCatalogo));
      if (!itens.length) {
        alvo.append(
          SL.estadoVazio(
            "Nada salvo por aqui",
            "Toque no marcador de um treino para guardar e encontrar depois.",
            el("a", { href: "descobrir.html", class: "btn-primary", text: "Descobrir treinos" }),
          ),
        );
      }
    }

    // Ao remover um treino dos salvos, a lista se atualiza na hora
    document.addEventListener("sl:salvos", render);
    SL.carregar(alvo, render);
  });
