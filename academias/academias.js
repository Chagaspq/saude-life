// Página para donos de academia: simulador de treinos a mais e formulário de demonstração.
// O formulário é simulado (TCC): o pedido fica guardado só neste navegador.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Atalho para achar um pedaço da página
  const $ = (nome) => document.querySelector(`[data-acad="${nome}"]`);

  /* ---------- Simulador ---------- */

  // Controle deslizante de alunos
  const range = document.getElementById("acad-alunos");

  // Recalcula a estimativa
  function calcular() {
    // Número de alunos escolhido
    const alunos = Number(range.value);
    // Média de 8 treinos por aluno no mês, com 15% a mais
    const extra = Math.round(alunos * 8 * 0.15);
    // Escreve o número de alunos
    $("alunos").textContent = alunos.toLocaleString("pt-BR");
    // Escreve a estimativa
    $("treinos").textContent = extra.toLocaleString("pt-BR");
  }

  // Se o simulador existe, liga ele
  if (range) {
    // Recalcula ao arrastar
    range.addEventListener("input", calcular);
    // Conta inicial
    calcular();
  }

  /* ---------- Formulário ---------- */

  // Formulário de demonstração
  const form = document.querySelector("[data-acad-form]");

  // Ao enviar...
  if (form)
    form.addEventListener("submit", (e) => {
      // ...não recarrega a página
      e.preventDefault();
      // ...lugar da mensagem
      const msg = $("msg");
      // ...primeiro campo com problema (vazio ou e-mail inválido)
      const errado = [...form.elements].find((c) => c.willValidate && !c.checkValidity());
      // ...se tem erro, avisa e leva o foco até o campo
      if (errado) {
        // Marca a mensagem como erro
        msg.className = "acad-msg is-erro";
        // Texto do erro
        msg.textContent = errado.type === "email" && errado.value ? "Confira o e-mail." : "Preencha nome, academia e e-mail.";
        // Foco no campo
        errado.focus();
        // Para aqui
        return;
      }
      // ...dados preenchidos
      const dados = Object.fromEntries(new FormData(form));
      // ...guarda o pedido neste navegador (simulação)
      try {
        // Pedidos anteriores
        const pedidos = JSON.parse(localStorage.getItem("sl-pedidos-academia") || "[]");
        // Soma o novo com a data
        pedidos.push({ ...dados, data: new Date().toISOString() });
        // Salva
        localStorage.setItem("sl-pedidos-academia", JSON.stringify(pedidos));
      } catch (erro) {
        // Se o navegador bloquear, segue sem guardar
      }
      // ...mensagem de sucesso
      msg.className = "acad-msg is-ok";
      // Texto de sucesso
      msg.textContent = `Pronto, ${dados.nome.split(" ")[0]}! Um consultor vai falar com você sobre a ${dados.academia}. (Demonstração do TCC: nada foi enviado.)`;
      // ...limpa o formulário
      form.reset();
    });
})();
