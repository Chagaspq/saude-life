// Campos da tela guardados com ref (React), para focar o campo com erro sem procurar na página.
import { useRef } from "react";

// Hook: const campos = useCampos();  <input ref={campos.ref("email")} />  campos.focar("email")
export function useCampos() {
  // Campos guardados: nome -> elemento
  const guardados = useRef({});
  // Funções (as mesmas a cada desenho)
  const api = useRef(null);
  // Cria uma vez
  if (!api.current) {
    api.current = {
      // ref de um campo (o React chama com o elemento ao desenhar e com null ao tirar)
      ref: (nome) => (el) => {
        // Guarda (ou apaga)
        if (el) guardados.current[nome] = el;
        else delete guardados.current[nome];
      },
      // Foca um campo pelo nome (opcoes: ex.: { preventScroll: true })
      focar: (nome, opcoes) => {
        // Campo
        const el = guardados.current[nome];
        // Tem: foca
        if (el) el.focus(opcoes);
      },
    };
  }
  // Devolve
  return api.current;
}
