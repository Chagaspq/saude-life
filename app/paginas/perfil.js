// Perfil: contagem de treinos criados
window.SL &&
  SL.pagina(() => {
    const treinos = SL.storage.get("sl-treinos", window.SL_DADOS.TREINOS_PADRAO);
    document.querySelectorAll('[data-render="treinos-count"]').forEach((n) => (n.textContent = treinos.length));
  });
