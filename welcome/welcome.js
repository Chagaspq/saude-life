// Página inicial: demonstração (marcar séries e ganhar pontos), prévia do treino em 3 toques
// e entrada suave das seções ao rolar a página.
// Sem JS (ou com movimento reduzido), tudo aparece normalmente.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Confere se a pessoa pediu ao sistema para reduzir animações
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Demonstração: marcar séries ---------- */

  // Atalho para achar um pedaço da demonstração
  const demo = (nome) => document.querySelector(`[data-demo="${nome}"]`);
  // Botões das séries
  const checks = document.querySelectorAll(".demo-check");
  // Tamanho da volta do anel (raio 48)
  const VOLTA = 2 * Math.PI * 48;
  // Pontos da demonstração
  let pontos = 0;

  // Atualiza o anel, o placar e o texto
  function atualizarDemo() {
    // Quantas séries estão marcadas
    const feitas = document.querySelectorAll('.demo-check[aria-pressed="true"]').length;
    // Escreve "x de 3"
    demo("feitas").textContent = feitas;
    // Enche o anel conforme as séries
    demo("anel").style.strokeDashoffset = VOLTA * (1 - feitas / 3);
    // Escreve os pontos
    demo("pontos").textContent = pontos;
    // Texto conforme o progresso
    demo("texto").textContent = feitas === 3 ? "Treino feito! Agora imagina isso valendo no ranking." : feitas ? `Boa! Faltam ${3 - feitas} série${3 - feitas > 1 ? "s" : ""}.` : "Toque no círculo de cada série.";
  }

  // Mostra o "+10" saindo do botão
  function voar(botao, texto) {
    // Cria o número
    const bolha = document.createElement("span");
    // Classe do visual
    bolha.className = "demo-voando";
    // Texto
    bolha.textContent = texto;
    // Posição do botão na tela
    const r = botao.getBoundingClientRect();
    // Coloca no meio do botão
    bolha.style.left = r.left + r.width / 2 + "px";
    // (altura)
    bolha.style.top = r.top + "px";
    // Coloca na página
    document.body.append(bolha);
    // Some depois de 1,2 segundo
    setTimeout(() => bolha.remove(), 1200);
  }

  // Chuva rápida de confete
  function confete() {
    // Quem pediu menos movimento não vê
    if (reduzirMovimento) return;
    // Caixa
    const caixa = document.createElement("div");
    // Classe do visual
    caixa.className = "confete";
    // Cores da marca
    const cores = ["#f0845a", "#4fc29a", "#f5b544", "#f5a37f"];
    // 40 pedacinhos
    for (let i = 0; i < 40; i++) {
      // Pedacinho
      const p = document.createElement("span");
      // Posição
      p.style.left = Math.random() * 100 + "%";
      // Cor
      p.style.background = cores[i % cores.length];
      // Atraso
      p.style.animationDelay = Math.random() * 0.3 + "s";
      // Giro
      p.style.setProperty("--giro", Math.round(Math.random() * 720 - 360) + "deg");
      // Balanço
      p.style.setProperty("--lado", Math.round(Math.random() * 160 - 80) + "px");
      // Coloca
      caixa.append(p);
    }
    // Coloca na página
    document.body.append(caixa);
    // Tira depois
    setTimeout(() => caixa.remove(), 2400);
  }

  // Clique em cada série
  checks.forEach((botao) =>
    // Quando clica...
    botao.addEventListener("click", () => {
      // ...troca entre feita e não feita
      const feita = botao.getAttribute("aria-pressed") !== "true";
      // ...marca no botão
      botao.setAttribute("aria-pressed", String(feita));
      // ...marca a linha
      botao.closest("li").classList.toggle("is-done", feita);
      // ...soma ou tira 10 pontos
      pontos += feita ? 10 : -10;
      // ...mostra o "+10"
      if (feita) voar(botao, "+10");
      // ...atualiza tudo
      atualizarDemo();
      // ...se fez as 3, bônus de treino concluído e confete
      if (feita && document.querySelectorAll('.demo-check[aria-pressed="true"]').length === 3) {
        // Bônus
        pontos += 50;
        // Atualiza o placar
        atualizarDemo();
        // "+50" saindo do placar
        voar(demo("pontos"), "+50 treino!");
        // Confete
        confete();
      }
    }),
  );
  // Estado inicial
  if (checks.length) atualizarDemo();

  /* ---------- Treino em 3 toques ---------- */

  // Formulário do questionário
  const quiz = document.querySelector("[data-quiz]");
  // Biblioteca de exercícios (carregada antes deste arquivo)
  const BIBLIOTECA = window.SL_EXERCICIOS || {};
  // Grupos de exercício de cada objetivo
  const GRUPOS = { Hipertrofia: ["Pernas", "Peito", "Costas", "Ombros", "Braços"], HIIT: ["Cardio", "Core", "Pernas"], "Resistência": ["Cardio", "Pernas", "Core"], "Yoga & Mobilidade": ["Mobilidade", "Core"] };

  // Monta a prévia do treino com as respostas
  function previa() {
    // Respostas
    const r = Object.fromEntries(new FormData(quiz));
    // Quantos exercícios cabem no tempo
    const qtd = { 20: 3, 30: 4, 45: 5 }[r.tempo];
    // Séries e repetições pelo nível
    const series = { Iniciante: "3 × 10", "Intermediário": "3 × 12", "Avançado": "4 × 8" }[r.nivel];
    // Um exercício de cada grupo, em rodízio
    const grupos = GRUPOS[r.objetivo];
    // Lista final
    const lista = [];
    // Para cada vaga...
    for (let i = 0; lista.length < qtd && i < 40; i++) {
      // ...grupo da vez
      const g = grupos[i % grupos.length];
      // ...exercícios desse grupo (iniciante: só os que dão para fazer em casa ou nos dois)
      const opcoes = Object.entries(BIBLIOTECA).filter(([nome, x]) => x.grupo === g && !lista.includes(nome) && (r.nivel !== "Iniciante" || x.lugar !== "academia" || g === "Pernas"));
      // ...pega o primeiro que ainda não entrou
      if (opcoes.length) lista.push(opcoes[Math.floor(i / grupos.length) % opcoes.length][0]);
    }
    // Endereço do cadastro com as respostas (o cadastro já preenche o questionário)
    const link = `../cadastro/cadastro.html?objetivo=${encodeURIComponent(r.objetivo)}&nivel=${encodeURIComponent(r.nivel)}`;
    // Lugar da prévia
    const alvo = quiz.querySelector("[data-quiz-previa]");
    // Esvazia
    alvo.replaceChildren();
    // Título da prévia
    const titulo = document.createElement("h3");
    // Texto do título
    titulo.textContent = `Seu treino de ${r.tempo} min ficaria assim:`;
    // Lista numerada
    const ol = document.createElement("ol");
    // Um item por exercício
    lista.forEach((nome) => {
      // Item
      const li = document.createElement("li");
      // Nome do exercício
      const forte = document.createElement("strong");
      // Texto
      forte.textContent = nome;
      // Detalhe: séries e dica
      const det = document.createElement("span");
      // "3 × 12 • dica"
      det.textContent = `${BIBLIOTECA[nome].mov === "alongar" || BIBLIOTECA[nome].grupo === "Cardio" ? "3 × 40 s" : series} • ${BIBLIOTECA[nome].dicas[0]}`;
      // Junta
      li.append(forte, det);
      // Coloca na lista
      ol.append(li);
    });
    // Botão de criar conta com essas respostas
    const cta = document.createElement("a");
    // Leva ao cadastro
    cta.href = link;
    // Visual do botão principal
    cta.className = "btn-hero-primary";
    // Texto
    cta.textContent = "Criar conta e começar esse treino";
    // Monta a prévia
    alvo.append(titulo, ol, cta);
  }

  // Se a página tem o questionário, liga ele
  if (quiz) {
    // Cada mudança refaz a prévia
    quiz.addEventListener("change", previa);
    // Prévia inicial
    previa();
  }

  /* ---------- Vídeo de fundo do topo e fotos dos depoimentos ---------- */

  // Vídeo do topo
  const video = document.querySelector(".hero-video");
  // Só no computador (tela larga) e se a pessoa não pediu menos movimento
  if (video && !reduzirMovimento && window.matchMedia("(min-width: 641px)").matches) {
    // Para cada formato (webm é mais leve, mp4 funciona em todo lugar)...
    [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(([chave, tipo]) => {
      // ...cria a fonte do vídeo
      const fonte = document.createElement("source");
      // Endereço do arquivo
      fonte.src = video.dataset[chave];
      // Tipo do arquivo
      fonte.type = tipo;
      // Coloca no vídeo
      video.append(fonte);
    });
    // Quando começar a tocar, aparece suave
    video.addEventListener("playing", () => video.classList.add("is-tocando"));
    // Tenta tocar (se o arquivo não existir, fica só o fundo animado)
    video.play().catch(() => {});
  }

  // Fotos dos depoimentos: só aparecem se o arquivo existir (senão ficam as iniciais)
  document.querySelectorAll("[data-foto]").forEach((avatar) => {
    // Imagem de teste
    const img = new Image();
    // Se carregou...
    img.onload = () => {
      // ...usa como fundo do círculo
      avatar.style.backgroundImage = `url(${avatar.dataset.foto})`;
      // ...e esconde as iniciais
      avatar.classList.add("tem-foto");
    };
    // Tenta carregar
    img.src = avatar.dataset.foto;
  });

  /* ---------- Entrada suave das seções ---------- */

  // Com movimento reduzido (ou navegador antigo), não faz animação nenhuma
  if (reduzirMovimento || !("IntersectionObserver" in window)) return;

  // Pega todas as seções da página, menos a primeira (hero)
  const secoes = document.querySelectorAll("main > section:not(.hero)");

  // Cria um "observador" que avisa quando uma seção aparece na tela
  const observer = new IntersectionObserver(
    // Recebe a lista de seções que mudaram
    (entradas) => {
      // Olha uma por uma
      entradas.forEach((entrada) => {
        // Se a seção ainda não está visível, ignora
        if (!entrada.isIntersecting) return;
        // Adiciona a classe que faz a seção aparecer com animação
        entrada.target.classList.add("is-visible");
        // Para de observar essa seção (a animação só acontece uma vez)
        observer.unobserve(entrada.target);
      });
    },
    // Só conta como visível quando a seção passa 10% da parte de baixo da tela
    { rootMargin: "0px 0px -10% 0px" },
  );

  // Para cada seção...
  secoes.forEach((secao) => {
    // ...começa escondida (classe reveal)
    secao.classList.add("reveal");
    // ...e passa a ser observada
    observer.observe(secao);
  });
})();
