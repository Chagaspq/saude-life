// Tela: o que toda página do app faz ao abrir (CSS, título da aba e rolagem).
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { EVENTO_MUDOU } from "../lib/armazenamento.js";
import { traduzirTexto } from "../lib/idioma.js";

// Número que sobe toda vez que algum dado salvo muda (a tela redesenha)
function useVersaoDosDados() {
  // Versão
  const [versao, setVersao] = useState(0);
  // Escuta as mudanças
  useEffect(() => {
    // Sobe a versão
    const mudou = () => setVersao((v) => v + 1);
    // Mudança nesta aba
    window.addEventListener(EVENTO_MUDOU, mudou);
    // Mudança em outra aba
    window.addEventListener("storage", mudou);
    // Para ao sair
    return () => {
      window.removeEventListener(EVENTO_MUDOU, mudou);
      window.removeEventListener("storage", mudou);
    };
  }, []);
  // Devolve
  return versao;
}

// Tela (Pagina = componente da tela; estilos = CSS dela; titulo = título da aba;
// chaveComBusca = abre de novo quando muda o ?id= do endereço, ex.: trocar de treino)
export default function Tela({ Pagina, estilos, titulo, chaveComBusca }) {
  // Versão dos dados (redesenha quando mudam)
  const versao = useVersaoDosDados();
  // Endereço atual
  const { hash, search } = useLocation();

  // Título da aba e rolagem (antes de desenhar)
  useLayoutEffect(() => {
    // Título (traduzido se a pessoa escolheu outro idioma)
    document.title = traduzirTexto(titulo);
    // Endereço com âncora (ex.: #heading-preferencias): rola até ela
    const alvo = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    // Tem âncora: vai até ela; senão: topo
    if (alvo) alvo.scrollIntoView();
    else window.scrollTo(0, 0);
  }, []);

  // Limpeza do <body> ao sair
  useEffect(() => {
    // Ao sair da tela: tira as marcas que ela deixou no <body> (ex.: tela cheia do treino)
    return () => {
      // Classes
      document.body.className = "";
      // Atributos data-*
      Object.keys(document.body.dataset).forEach((k) => delete document.body.dataset[k]);
    };
  }, []);

  // Desenha o CSS da tela (cada arquivo numa tag <style>, na ordem; sai junto quando a tela fecha) e a tela
  return (
    <>
      {estilos.map((css, i) => (
        <style key={i}>{css}</style>
      ))}
      <Pagina key={chaveComBusca ? search : undefined} versao={versao} />
    </>
  );
}
