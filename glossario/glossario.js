// Glossário: termos de treino e nutrição em ordem alfabética, com busca e letras para pular.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Termos: [termo, explicação]
  const TERMOS = [
    // Aeróbico
    ["Aeróbico", "Exercício longo e moderado que usa oxigênio como principal fonte de energia, como correr ou pedalar."],
    // Anaeróbico
    ["Anaeróbico", "Esforço curto e intenso, como musculação pesada ou tiros de corrida."],
    // Bi-set
    ["Bi-set", "Dois exercícios feitos em seguida, sem descanso entre eles."],
    // Caloria
    ["Caloria", "Unidade de energia dos alimentos e do gasto do corpo."],
    // Carboidrato
    ["Carboidrato", "Nutriente que é a principal fonte de energia rápida: arroz, pão, frutas, batata."],
    // Carga
    ["Carga", "Peso usado no exercício."],
    // Cadência
    ["Cadência", "Velocidade de cada repetição, por exemplo 2 segundos descendo e 1 subindo."],
    // Core
    ["Core", "Músculos do meio do corpo: abdômen, lombar e quadril. Dão estabilidade em todo exercício."],
    // Déficit calórico
    ["Déficit calórico", "Comer menos calorias do que o corpo gasta. É o que faz emagrecer."],
    // Descanso
    ["Descanso", "Pausa entre as séries para o músculo se recuperar."],
    // Drop set
    ["Drop set", "Ao chegar no limite, diminuir a carga e continuar a série sem pausa."],
    // Falha
    ["Falha", "Ponto em que não dá para fazer mais nenhuma repetição com boa técnica."],
    // Fibra
    ["Fibra", "Parte dos vegetais que o corpo não digere e ajuda na saciedade e no intestino."],
    // Ficha de treino
    ["Ficha de treino", "Lista dos exercícios do dia, com séries, repetições e carga."],
    // HIIT
    ["HIIT", "Treino intervalado de alta intensidade: tiros fortes com pausas curtas."],
    // Hipertrofia
    ["Hipertrofia", "Aumento do tamanho do músculo."],
    // IMC
    ["IMC", "Índice de massa corporal: peso dividido pela altura ao quadrado. É uma estimativa simples."],
    // Isometria
    ["Isometria", "Segurar uma posição parada, como na prancha."],
    // Macronutrientes
    ["Macronutrientes", "Os três grandes grupos de nutrientes: carboidrato, proteína e gordura."],
    // Mobilidade
    ["Mobilidade", "Capacidade de mexer uma articulação em toda a amplitude com controle."],
    // Progressão de carga
    ["Progressão de carga", "Aumentar aos poucos o peso, as repetições ou as séries para continuar evoluindo."],
    // Proteína
    ["Proteína", "Nutriente que ajuda a construir e reparar o músculo: carnes, ovos, leite, feijão."],
    // Repetição
    ["Repetição", "Uma vez que você faz o movimento completo do exercício."],
    // RM
    ["RM", "Repetição máxima. 1RM é a maior carga que você consegue levantar uma vez."],
    // Série
    ["Série", "Um grupo de repetições seguidas. Ex.: 3 séries de 12."],
    // Superávit calórico
    ["Superávit calórico", "Comer mais calorias do que gasta. Ajuda a ganhar peso e massa."],
    // Supino
    ["Supino", "Exercício de empurrar o peso deitado, para o peito."],
    // Treino A/B
    ["Treino A/B", "Divisão do treino em dias: um dia treina um grupo de músculos, no outro, outro grupo."],
    // Volume
    ["Volume", "Total de trabalho do treino: séries × repetições × carga."],
  ];

  // Tira acentos e deixa minúsculo (para a busca e as letras)
  const simples = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  // Lista
  const lista = document.querySelector('[data-render="termos"]');
  // Letras
  const letras = document.querySelector('[data-render="letras"]');

  // Desenha os termos (filtrados pela busca)
  function desenhar(busca) {
    // Busca sem acento
    const b = simples(busca || "");
    // Termos achados, em ordem alfabética
    const achados = TERMOS.filter(([t, e]) => !b || simples(t + " " + e).includes(b)).sort((x, y) => x[0].localeCompare(y[0], "pt-BR"));
    // Letras que já ganharam âncora
    const vistas = new Set();
    // Troca a lista
    lista.replaceChildren(
      ...achados.flatMap(([t, e]) => {
        // Primeira letra (sem acento)
        const letra = simples(t[0]).toUpperCase();
        // Termo
        const dt = document.createElement("dt");
        // Texto
        dt.textContent = t;
        // A primeira de cada letra ganha a âncora
        if (!vistas.has(letra)) (dt.id = "letra-" + letra), vistas.add(letra);
        // Explicação
        const dd = document.createElement("dd");
        // Texto
        dd.textContent = e;
        // Devolve os dois
        return [dt, dd];
      }),
    );
    // Letras para pular
    letras.replaceChildren(
      ...[...vistas].map((l) => {
        // Link
        const a = document.createElement("a");
        // Vai para a letra
        a.href = "#letra-" + l;
        // Texto
        a.textContent = l;
        // Devolve
        return a;
      }),
    );
  }

  // Busca enquanto digita
  document.getElementById("glossario-busca").addEventListener("input", (e) => desenhar(e.target.value.trim()));
  // Desenha a primeira vez
  desenhar("");
})();
