// Central de ajuda: perguntas frequentes por assunto, com busca.
import { useState } from "react";
import { montar } from "../montar.jsx";
import PublicLayout from "../componentes/PublicLayout.jsx";
import { simples } from "../lib/formato.js";
import "../estilos/kit-publico.js";
import "../estilos/paginas.css";

// Perguntas: [assunto, [[pergunta, resposta], ...]]
const AJUDA = [
  // Conta
  ["Conta e acesso", [
    ["Esqueci minha senha. E agora?", 'Na tela de entrar, toque em "Esqueci minha senha" e siga as instruções. Na versão de demonstração, o link aparece na própria tela.'],
    ["Como troco meu e-mail ou senha?", 'No app, abra Perfil e toque em "Trocar e-mail" ou "Trocar senha". Para trocar, você confirma a senha atual.'],
    ["Como excluo minha conta?", 'Em Perfil, no fim da página, toque em "Excluir minha conta". Todos os seus dados saem deste aparelho e não dá para desfazer.'],
    ["Meus dados ficam em outro celular?", "Nesta versão, os dados ficam salvos só no navegador que você usa. Em Perfil você pode baixar uma cópia dos seus dados."],
    ["Qual a diferença entre cliente e administrador?", "O cliente registra os próprios treinos, refeições e peso. O administrador (academia ou personal) vê os clientes, manda treinos e publica avisos."],
  ]],
  // Treinos
  ["Treinos", [
    ["Como começo um treino?", 'Em Início ou em Treinos, toque em "Iniciar treino". Marque cada série tocando no círculo.'],
    ["Como crio meu treino?", 'Em Treinos, toque em "Novo treino", dê um nome e escolha os exercícios. Você também pode pedir um treino automático.'],
    ["Recebi um treino do meu personal. Onde ele fica?", "Ele aparece na lista de Treinos com o nome de quem mandou."],
  ]],
  // Pontos
  ["Pontos", [
    ["Como ganho pontos?", "Cada série vale 10 pontos, cada treino concluído 50 e cada refeição registrada 5. O limite é de 300 pontos por dia."],
    ["Para que servem os pontos?", "Eles mostram a sua constância na semana. Quem faz 500 pontos ou mais na semana sobe de liga."],
  ]],
  // Planos
  ["Planos e pagamento", [
    ["Quanto custa o Premium?", "R$ 14,90 por mês, ou 20% a menos no plano anual. Estudantes pagam R$ 9,90 e o plano Família sai R$ 24,90 para até 4 pessoas."],
    ["Como funciona o teste grátis?", "São 30 dias de Premium sem cartão. Se você não assinar, volta sozinho para o Free, sem cobrança."],
    ["Quais formas de pagamento?", "Pix e cartão de crédito. Nesta versão de demonstração, nenhum valor é cobrado de verdade."],
    ["Posso cancelar quando quiser?", "Pode. Não tem fidelidade nem multa: o plano vale até o fim do período já pago."],
  ]],
  // Privacidade
  ["Privacidade e segurança", [
    ["Meus dados de saúde são vendidos?", "Não. Seus dados servem só para personalizar o app. Veja tudo na Política de Privacidade."],
    ["Minha senha fica salva?", "Fica guardada como um resumo (hash), nunca o texto da senha."],
  ]],
  // Acessibilidade
  ["Acessibilidade", [
    ["Como aumento o tamanho das letras?", "Toque no botão de exibição no topo. Lá tem tamanho da letra, alto contraste, menos movimento, tema claro ou escuro e idioma."],
    ["O app tem outros idiomas?", "Sim: português, inglês e espanhol, no mesmo botão de exibição."],
  ]],
];

// Página
function Ajuda() {
  // Busca
  const [busca, setBusca] = useState("");
  // Texto simplificado
  const b = simples(busca);
  // Assuntos com as perguntas que batem
  const grupos = AJUDA.map(([assunto, perguntas]) => [assunto, perguntas.filter(([p, r]) => !b || simples(p + " " + r).includes(b))]).filter(([, p]) => p.length);
  // Página
  return (
    <PublicLayout>
      {/* Topo */}
      <section className="plans-hero">
        <p className="hero-kicker">Central de ajuda</p>
        <h1>Como podemos ajudar?</h1>
        <p className="plans-hero-lead">Respostas rápidas sobre conta, treinos, pontos, planos e privacidade.</p>
      </section>
      {/* Busca e perguntas */}
      <div className="pg-largura">
        {/* Nome escondido do campo */}
        <label className="sr-only" htmlFor="ajuda-busca">
          Buscar na ajuda
        </label>
        {/* Campo */}
        <input type="search" id="ajuda-busca" className="pg-busca" placeholder="Ex: senha, pontos, cancelar..." autoComplete="off" value={busca} onChange={(e) => setBusca(e.target.value.trimStart())} />
        {/* Perguntas */}
        <div className="ajuda-lista">
          {grupos.map(([assunto, perguntas]) => [
            // Título do assunto
            <h2 key={assunto}>{assunto}</h2>,
            // Perguntas (abertas quando há busca)
            ...perguntas.map(([p, r]) => (
              <details key={p} open={!!b || undefined}>
                <summary>{p}</summary>
                <p>{r}</p>
              </details>
            )),
          ])}
          {/* Nada encontrado */}
          {!grupos.length && <p>Nada encontrado. Tente outra palavra ou fale com a gente abaixo.</p>}
        </div>
        {/* Contato */}
        <section className="ajuda-contato" aria-labelledby="titulo-contato">
          <h2 id="titulo-contato">Não achou a resposta?</h2>
          <p>
            Fale com a gente pelo e-mail <a href="mailto:contato@saudelife.app">contato@saudelife.app</a>. Respondemos em até 2 dias úteis.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}

// Desenha
montar(Ajuda);
