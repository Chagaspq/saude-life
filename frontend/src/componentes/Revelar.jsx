// Seção que aparece suave quando entra na tela.
import { useEffect, useRef, useState } from "react";
import { menosMovimento } from "../lib/efeitos.js";

// Seção com entrada suave
export default function Revelar({ className = "", children, ...props }) {
  // Seção
  const ref = useRef(null);
  // Já apareceu?
  const [visivel, setVisivel] = useState(() => menosMovimento() || !("IntersectionObserver" in window));
  // Observa a entrada na tela
  useEffect(() => {
    // Já visível: nada
    if (visivel) return;
    // Observador
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && (setVisivel(true), obs.disconnect()), { rootMargin: "0px 0px -10% 0px" });
    // Observa
    obs.observe(ref.current);
    // Para
    return () => obs.disconnect();
  }, [visivel]);
  // Seção
  return (
    <section ref={ref} className={`${className} reveal${visivel ? " is-visible" : ""}`} {...props}>
      {children}
    </section>
  );
}
