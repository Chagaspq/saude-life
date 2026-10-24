// Calculadoras: IMC, calorias do dia, água e carga máxima (1RM). Tudo calculado aqui mesmo.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Número com vírgula (padrão brasileiro)
  const num = (n, casas = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

  // Contas de cada calculadora: recebem os campos e devolvem [número, explicação]
  const CONTAS = {
    // IMC = peso / altura²
    imc: (c) => {
      // IMC
      const imc = c.peso / (c.altura / 100) ** 2;
      // Faixa
      const faixa = imc < 18.5 ? "abaixo do peso" : imc < 25 ? "peso adequado" : imc < 30 ? "sobrepeso" : "obesidade";
      // Devolve
      return [num(imc, 1), `Faixa: ${faixa}. O IMC não separa músculo de gordura.`];
    },
    // Calorias: fórmula de Mifflin-St Jeor × nível de atividade
    calorias: (c) => {
      // Gasto em repouso
      const basal = 10 * c.peso + 6.25 * c.altura - 5 * c.idade + (c.sexo === "m" ? 5 : -161);
      // Gasto do dia
      const dia = basal * Number(c.atividade);
      // Devolve
      return [`${num(dia)} kcal`, `Para emagrecer: cerca de ${num(dia - 400)} kcal. Para ganhar massa: cerca de ${num(dia + 300)} kcal.`];
    },
    // Água: 35 ml por quilo + 500 ml a cada 30 min de treino
    agua: (c) => {
      // Litros
      const litros = (c.peso * 35 + Math.ceil((c.treino || 0) / 30) * 500) / 1000;
      // Devolve
      return [`${num(litros, 1)} litros`, `Mais ou menos ${Math.round((litros * 1000) / 250)} copos de 250 ml ao longo do dia.`];
    },
    // 1RM: fórmula de Epley
    rm: (c) => {
      // Carga máxima estimada
      const rm = c.carga * (1 + c.reps / 30);
      // Devolve
      return [`${num(rm, 1)} kg`, `Para ganhar massa, treine com ${num(rm * 0.7)} a ${num(rm * 0.8)} kg (70% a 80%).`];
    },
  };

  // Liga cada formulário
  document.querySelectorAll("[data-calc]").forEach((form) => {
    // Ao enviar...
    form.addEventListener("submit", (e) => {
      // ...não recarrega
      e.preventDefault();
      // ...lê os campos (números viram número)
      const campos = {};
      // Cada campo
      new FormData(form).forEach((v, k) => (campos[k] = isNaN(Number(v)) || v === "" ? v : Number(v)));
      // ...faz a conta
      const [valor, texto] = CONTAS[form.dataset.calc](campos);
      // ...lugar do resultado
      const saida = form.querySelector("output");
      // ...número grande
      const forte = document.createElement("strong");
      // Texto do número
      forte.textContent = valor;
      // ...mostra
      saida.replaceChildren(forte, texto);
    });
  });
})();
