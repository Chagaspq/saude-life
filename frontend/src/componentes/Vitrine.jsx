// Peças do site público no estilo "vitrine": banner com foto, passos numerados, faixa escura e dúvidas.
import Revelar from "./Revelar.jsx";

// Banner do topo com foto de fundo (foto = nome do arquivo em public/fotos; chamada = texto pequeno de cima)
export function BannerFoto({ foto, chamada, titulo, texto, children }) {
  // Banner
  return (
    // Seção do topo (a foto entra pela variável --foto)
    <section className="vt-banner" style={{ "--foto": `url(../fotos/${foto}.jpg)` }}>
      {/* Escurece a foto para o texto ficar legível */}
      <div className="vt-banner-sombra" aria-hidden="true" />
      {/* Textos */}
      <div className="vt-banner-texto">
        {/* Chamada pequena */}
        {chamada && <p className="vt-chamada">{chamada}</p>}
        {/* Título grande */}
        <h1>{titulo}</h1>
        {/* Texto de apoio */}
        {texto && <p className="vt-banner-lead">{texto}</p>}
        {/* Botões (vêm de quem usa) */}
        {children && <div className="vt-botoes">{children}</div>}
      </div>
    </section>
  );
}

// Cabeçalho de seção (chamada + título grande + texto)
export function Cabeca({ id, chamada, titulo, texto }) {
  // Cabeçalho
  return (
    <div className="vt-cabeca">
      {/* Chamada pequena */}
      {chamada && <p className="vt-chamada">{chamada}</p>}
      {/* Título */}
      <h2 id={id}>{titulo}</h2>
      {/* Texto */}
      {texto && <p className="vt-cabeca-texto">{texto}</p>}
    </div>
  );
}

// Passos numerados com foto (passos = lista de [título, texto, foto])
export function Passos({ id, chamada, titulo, passos }) {
  // Seção
  return (
    <Revelar className="vt-secao" aria-labelledby={id}>
      {/* Cabeçalho */}
      <Cabeca id={id} chamada={chamada} titulo={titulo} />
      {/* Lista em ordem */}
      <ol className="vt-passos">
        {passos.map(([t, txt, foto], i) => (
          // Um passo
          <li key={t} className="vt-passo">
            {/* Foto do passo */}
            <img src={`../fotos/${foto}.jpg`} alt="" loading="lazy" width="700" height="520" />
            {/* Número grande */}
            <span className="vt-passo-num" aria-hidden="true">
              {i + 1}
            </span>
            {/* Título */}
            <h3>{t}</h3>
            {/* Texto */}
            <p>{txt}</p>
          </li>
        ))}
      </ol>
    </Revelar>
  );
}

// Faixa escura arredondada com foto do lado (lado = "esquerda" põe a foto à esquerda)
export function Faixa({ id, foto, chamada, titulo, texto, lado, children }) {
  // Faixa
  return (
    <Revelar className={"vt-faixa" + (lado === "esquerda" ? " vt-faixa-inverte" : "")} aria-labelledby={id}>
      {/* Textos */}
      <div className="vt-faixa-texto">
        {/* Chamada */}
        {chamada && <p className="vt-chamada">{chamada}</p>}
        {/* Título */}
        <h2 id={id}>{titulo}</h2>
        {/* Texto */}
        {texto && <p>{texto}</p>}
        {/* Botões ou lista */}
        {children}
      </div>
      {/* Foto */}
      <div className="vt-faixa-foto" style={{ "--foto": `url(../fotos/${foto}.jpg)` }} aria-hidden="true" />
    </Revelar>
  );
}

// Perguntas frequentes em sanfona (perguntas = lista de [pergunta, resposta])
export function Duvidas({ id, titulo = "Perguntas frequentes", perguntas }) {
  // Seção
  return (
    <Revelar className="vt-secao vt-duvidas" aria-labelledby={id}>
      {/* Cabeçalho */}
      <Cabeca id={id} chamada="Dúvidas" titulo={titulo} />
      {/* Lista */}
      <div className="vt-sanfona">
        {perguntas.map(([p, r]) => (
          // Uma pergunta (abre e fecha sem JavaScript)
          <details key={p}>
            {/* Pergunta com a setinha */}
            <summary>
              {/* Texto */}
              <span>{p}</span>
              {/* Setinha que gira ao abrir */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            {/* Resposta */}
            <p>{r}</p>
          </details>
        ))}
      </div>
    </Revelar>
  );
}
