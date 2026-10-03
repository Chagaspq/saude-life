// Início: completa "Recomendados para você" com treinos do catálogo
window.SL &&
  SL.pagina(() => {
    const { CATALOGO } = window.SL_DADOS;
    const alvo = document.querySelector('[data-render="recomendados"]');
    CATALOGO.filter((t) => t.id !== "fullbody-explosivo")
      .slice(0, 4)
      .forEach((t) => alvo.append(SL.cardTreinoCatalogo(t)));
  });
