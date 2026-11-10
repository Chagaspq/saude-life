// Página de venda para academias e personais: benefícios, como funciona, conta e contato.
import { useState } from "react";
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import { ler, gravar } from "../lib/armazenamento.js";
import { BannerFoto, Passos } from "../componentes/Vitrine.jsx";
import "../estilos/kit-publico.js";
import "../estilos/planos-publico.css";
import "../estilos/academias.css";

// Benefícios: [título, texto, desenhos do ícone]
const BENEFICIOS = [
  // Treinos
  ["Mande treinos para os clientes", "Monte a ficha no painel e ela aparece na hora no app do cliente, com o seu nome.", ["M6 5v14", "M18 5v14", "M3 8v8", "M21 8v8", "M6 12h12"]],
  // Acompanhamento
  ["Veja quem está treinando", "Treinos da semana e último treino de cada cliente em uma tela só. Você sabe quem sumiu.", ["m22 7-8.5 8.5-5-5L2 17", "M16 7h6v6"]],
  // Avisos
  ["Avisos para todos", "Feriado, horário novo ou manutenção: publique no painel e todo mundo vê no Início do app.", ["m3 11 18-5v12L3 14v-3z", "M11.6 16.8a3 3 0 1 1-5.8-1.6"]],
  // Pontos
  ["Pontos que motivam", "Cada série e cada treino valem pontos. Meta da semana batida faz a pessoa voltar.", ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", "M4 22h16", "M18 2H6v7a6 6 0 0 0 12 0V2Z", "M12 15v7"]],
];

// Passos: [título, texto, foto]
const PASSOS = [
  // Passo 1
  ["Crie a conta de administrador", "No cadastro, escolha \"Sou administrador\".", "plano-academia"],
  // Passo 2
  ["Seus clientes entram", "Cada cliente cria a própria conta e aparece no seu painel.", "passo-3"],
  // Passo 3
  ["Você acompanha", "No painel você manda treinos, vê quem treinou e publica avisos.", "plano-pro"],
];

// Página
function Academias() {
  // Alunos no simulador
  const [alunos, setAlunos] = useState(300);
  // Mensagem do formulário {tipo, texto}
  const [msg, setMsg] = useState(null);
  // Treinos a mais por mês (8 treinos por aluno × 15%)
  const extra = Math.round(alunos * 8 * 0.15);
  // Envia o formulário (simulado)
  function enviar(e) {
    // Sem recarregar
    e.preventDefault();
    // Formulário
    const form = e.currentTarget;
    // Primeiro campo com erro
    const errado = [...form.elements].find((c) => c.willValidate && !c.checkValidity());
    // Tem erro: avisa e foca
    if (errado) {
      // Mensagem
      setMsg({ tipo: "is-erro", texto: errado.type === "email" && errado.value ? "Confira o e-mail." : "Preencha nome, academia e e-mail." });
      // Foco
      return errado.focus();
    }
    // Dados
    const dados = Object.fromEntries(new FormData(form));
    // Guarda o pedido neste navegador
    gravar("sl-pedidos-academia", [...ler("sl-pedidos-academia", []), { ...dados, data: new Date().toISOString() }]);
    // Sucesso
    setMsg({ tipo: "is-ok", texto: `Pronto, ${dados.nome.split(" ")[0]}! Um consultor vai falar com você sobre a ${dados.academia}. (Demonstração do TCC: nada foi enviado.)` });
    // Limpa
    form.reset();
  }
  // Página
  return (
    <PublicLayout atual="academias">
      {/* Topo com foto */}
      <BannerFoto foto="academia" chamada="Para academias e personais" titulo="Seus alunos treinando mais, e voltando sempre" texto="Mande treinos, acompanhe quem treinou e publique avisos. Tudo no app que o aluno já usa para treinar.">
        {/* Botão */}
        <a href="#demo" className="vt-btn vt-btn-coral">
          Quero uma demonstração
        </a>
      </BannerFoto>

      {/* Benefícios */}
      <section className="acad-beneficios" aria-labelledby="titulo-beneficios">
        <h2 id="titulo-beneficios">O que sua academia ganha</h2>
        <ul className="acad-grade">
          {BENEFICIOS.map(([titulo, texto, desenho]) => (
            <li key={titulo} className="acad-card">
              {/* Ícone */}
              <span className="acad-icone" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {desenho.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </svg>
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Como funciona em passos com foto */}
      <Passos id="titulo-passos" chamada="Como funciona" titulo="Em três passos" passos={PASSOS} />

      {/* Simulador */}
      <section className="acad-simulador" aria-labelledby="titulo-simulador">
        <h2 id="titulo-simulador">Faça a conta</h2>
        <p className="plans-hero-lead">Arraste para o número de alunos da sua academia. A estimativa usa uma melhora de 15% na frequência (exemplo ilustrativo).</p>
        {/* Rótulo */}
        <label htmlFor="acad-alunos">
          Alunos ativos: <strong>{alunos.toLocaleString("pt-BR")}</strong>
        </label>
        {/* Controle deslizante */}
        <input type="range" id="acad-alunos" min="50" max="2000" step="50" value={alunos} onChange={(e) => setAlunos(Number(e.target.value))} />
        {/* Resultado */}
        <p className="acad-resultado" aria-live="polite">
          Cerca de <strong>{extra.toLocaleString("pt-BR")}</strong> treinos a mais por mês na sua unidade.
        </p>
      </section>

      {/* Contato */}
      <section className="acad-demo" id="demo" aria-labelledby="titulo-demo">
        <h2 id="titulo-demo">Fale com um consultor</h2>
        <p className="plans-hero-lead">Plano Academia: preço por unidade, combinado com o consultor. Deixe seu contato.</p>
        {/* Formulário (simulado) */}
        <form className="acad-form" noValidate onSubmit={enviar}>
          <label>
            Seu nome
            <input name="nome" autoComplete="name" required />
          </label>
          <label>
            Nome da academia
            <input name="academia" required />
          </label>
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Cidade
            <input name="cidade" autoComplete="address-level2" />
          </label>
          {/* Mensagem */}
          <p className={"acad-msg " + (msg?.tipo || "")} role="status">
            {msg?.texto}
          </p>
          {/* Enviar */}
          <button type="submit" className="vt-btn vt-btn-coral">
            Quero uma demonstração
          </button>
        </form>
      </section>
    </PublicLayout>
  );
}

// Desenha
montar(Academias);
