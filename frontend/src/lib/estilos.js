// CSS de cada tela: entra quando a tela abre e sai quando ela fecha.
// Assim o CSS de uma tela (ex.: o fundo do login) não vale nas outras.
import { useInsertionEffect } from "react";

// Coloca os textos de CSS na página enquanto o componente estiver na tela
export function usarEstilos(lista) {
  // useInsertionEffect: roda antes de desenhar (a tela já abre com o visual certo)
  useInsertionEffect(() => {
    // Uma tag <style> para cada arquivo de CSS, na ordem da lista
    const tags = lista.map((css) => {
      // Tag nova
      const tag = document.createElement("style");
      // Marca (para achar no inspecionar)
      tag.dataset.tela = "";
      // Conteúdo
      tag.textContent = css;
      // Entra no <head>
      document.head.append(tag);
      // Devolve para tirar depois
      return tag;
    });
    // Ao fechar a tela: tira o CSS dela
    return () => tags.forEach((tag) => tag.remove());
  }, [lista]);
}
