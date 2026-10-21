// Blog de dicas: lista de artigos curtos, filtro por assunto e leitura de um artigo.
// O artigo aberto fica no endereço (?a=nome-do-artigo), então dá para mandar o link.
// Os textos são educativos e não substituem um profissional.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Atalho para achar um pedaço da página
  const $ = (nome) => document.querySelector(`[data-render="${nome}"]`);

  // Artigos do blog (texto = lista de parágrafos; "## " no começo vira subtítulo)
  const ARTIGOS = [
    // Artigo sobre progressão de carga
    {
      // Nome no endereço
      slug: "como-subir-carga",
      // Assunto (usado no filtro)
      assunto: "Treino",
      // Emoji da capa
      emoji: "🏋️",
      // Título
      titulo: "Quando (e quanto) subir a carga",
      // Resumo do card
      resumo: "A regra das 2 repetições a mais e por que subir de 1 a 2 kg já é muito.",
      // Quem escreveu
      autor: "Rafael Souza, Personal Trainer",
      // Minutos de leitura
      minutos: 3,
      // Texto
      texto: [
        "Ficar meses com o mesmo peso é o jeito mais comum de parar de evoluir. O músculo só cresce quando recebe um desafio um pouco maior do que está acostumado.",
        "## A regra das 2 a mais",
        "Se o treino pede 3 séries de 10 e você conseguiu fazer 12 com boa técnica na última série, está na hora de subir.",
        "## Quanto subir",
        "Pouco: 1 a 2 kg em exercícios de braço e ombro, 2 a 5 kg em pernas e costas. Se a técnica piorar, volte o peso anterior.",
        "## E se não der para subir?",
        "Aumente uma repetição por semana ou diminua o descanso. Progredir também é isso. O Saúde Life sugere a carga sozinho com base nas suas últimas séries.",
      ],
    },
    // Artigo sobre agachamento e joelho
    {
      // Nome no endereço
      slug: "agachamento-sem-dor",
      // Assunto
      assunto: "Treino",
      // Emoji
      emoji: "🦵",
      // Título
      titulo: "Agachamento sem dor no joelho",
      // Resumo
      resumo: "Três ajustes simples na posição que deixam o agachamento mais confortável.",
      // Autor
      autor: "Rafael Souza, Personal Trainer",
      // Leitura
      minutos: 4,
      // Texto
      texto: [
        "O agachamento não faz mal ao joelho. O que costuma incomodar é a posição: pés estreitos demais, joelho caindo para dentro ou peso todo na ponta do pé.",
        "## 1. Pés na largura dos ombros",
        "Pontas levemente para fora (uns 15 graus). Isso abre espaço para o quadril descer.",
        "## 2. Joelho segue a ponta do pé",
        "Imagine empurrar o chão para os lados. O joelho deve apontar na mesma direção dos dedos.",
        "## 3. Peso no meio do pé",
        "Calcanhar firme no chão o tempo todo. Se ele levanta, desça menos até ganhar mobilidade.",
        "Dor forte, inchaço ou estalo com dor não são normais: pare e procure um profissional de saúde.",
      ],
    },
    // Artigo sobre marmitas
    {
      // Nome no endereço
      slug: "marmita-da-semana",
      // Assunto
      assunto: "Alimentação",
      // Emoji
      emoji: "🍱",
      // Título
      titulo: "Marmita da semana em 1 hora",
      // Resumo
      resumo: "Um jeito simples de cozinhar no domingo e comer bem até sexta.",
      // Autor
      autor: "Ana Souza, Nutricionista",
      // Leitura
      minutos: 4,
      // Texto
      texto: [
        "A maior inimiga da alimentação saudável é a pressa. Deixar a comida pronta resolve metade do problema.",
        "## A conta da marmita",
        "Metade do pote com legumes e salada, um quarto com proteína (frango, carne, ovo, peixe) e um quarto com carboidrato (arroz, batata-doce, mandioca, macarrão).",
        "## Ordem para não perder tempo",
        "Coloque o arroz e o feijão para cozinhar primeiro. Enquanto isso, asse os legumes no forno e grelhe a proteína. Em 1 hora fica tudo pronto.",
        "## Quanto tempo dura",
        "Até 4 dias na geladeira em pote fechado. Para sexta e sábado, congele.",
      ],
    },
    // Artigo sobre proteína
    {
      // Nome no endereço
      slug: "quanta-proteina",
      // Assunto
      assunto: "Alimentação",
      // Emoji
      emoji: "🥚",
      // Título
      titulo: "Quanta proteína eu preciso?",
      // Resumo
      resumo: "A conta por quilo de peso e como chegar lá sem depender de suplemento.",
      // Autor
      autor: "Ana Souza, Nutricionista",
      // Leitura
      minutos: 3,
      // Texto
      texto: [
        "Para quem treina, a recomendação mais usada fica entre 1,6 e 2,2 gramas de proteína por quilo de peso por dia.",
        "## Fazendo a conta",
        "Uma pessoa de 70 kg precisa de 112 a 154 g por dia. Dividindo em 4 refeições, são uns 30 a 40 g em cada uma.",
        "## Na prática",
        "Um filé de frango tem uns 38 g, dois ovos uns 13 g, um pote de iogurte natural uns 7 g e uma concha de feijão uns 5 g.",
        "## E o whey?",
        "É só comida em pó: prático, mas não obrigatório. Se você bate a meta com comida, não precisa. Quem tem doença nos rins deve falar com o médico antes de aumentar a proteína.",
      ],
    },
    // Artigo sobre água
    {
      // Nome no endereço
      slug: "agua-no-treino",
      // Assunto
      assunto: "Hábitos",
      // Emoji
      emoji: "💧",
      // Título
      titulo: "Água: quanto beber e quando",
      // Resumo
      resumo: "A conta dos 35 ml por quilo e o truque da garrafa sempre por perto.",
      // Autor
      autor: "Ana Souza, Nutricionista",
      // Leitura
      minutos: 2,
      // Texto
      texto: [
        "Uma referência simples é 35 ml de água por quilo de peso por dia. Para 70 kg, dá uns 2,5 litros.",
        "## Nos dias de treino",
        "Some uns 500 ml a cada hora de exercício, e mais se estiver calor ou se você sua muito.",
        "## O truque que funciona",
        "Deixe uma garrafa à vista. Quem vê a garrafa bebe mais. No Saúde Life, cada copo marcado enche a garrafinha e vale pontos.",
        "## Sinal de alerta",
        "Xixi bem escuro e boca seca são sinais de que falta água.",
      ],
    },
    // Artigo sobre constância
    {
      // Nome no endereço
      slug: "constancia",
      // Assunto
      assunto: "Hábitos",
      // Emoji
      emoji: "🔥",
      // Título
      titulo: "Constância vence motivação",
      // Resumo
      resumo: "Por que treinar 3 vezes por semana todo mês rende mais do que 6 vezes por 2 semanas.",
      // Autor
      autor: "Marina Lima, Yoga",
      // Leitura
      minutos: 3,
      // Texto
      texto: [
        "Motivação vem e vai. O que traz resultado é aparecer, mesmo nos dias sem vontade.",
        "## Comece pequeno",
        "Melhor 3 treinos de 30 minutos que você cumpre do que 6 treinos de 1 hora que você abandona na segunda semana.",
        "## Treino ruim também conta",
        "Nos dias cansados, faça a versão curta: 15 minutos já mantêm a sequência viva.",
        "## Use a turma",
        "Treinar com amigos, mesmo à distância, aumenta muito a chance de continuar. É por isso que o Saúde Life tem ranking, desafios e o botão de cutucar. 😉",
      ],
    },
  ];

  // Assuntos para os filtros ("Todos" primeiro)
  const ASSUNTOS = ["Todos"].concat([...new Set(ARTIGOS.map((a) => a.assunto))]);
  // Assunto escolhido agora
  let filtro = "Todos";

  // Cria um elemento: tag, classe e texto
  function criar(tag, classe, texto) {
    // Elemento novo
    const e = document.createElement(tag);
    // Classe (se tiver)
    if (classe) e.className = classe;
    // Texto (se tiver)
    if (texto) e.textContent = texto;
    // Devolve
    return e;
  }

  // Desenha os botões de filtro
  function renderFiltros() {
    // Troca os botões
    $("filtros").replaceChildren(
      // Um botão por assunto
      ...ASSUNTOS.map((assunto) => {
        // Botão
        const b = criar("button", "chip" + (assunto === filtro ? " is-active" : ""), assunto);
        // Tipo botão (não envia formulário)
        b.type = "button";
        // Avisa leitores de tela qual está ligado
        b.setAttribute("aria-pressed", String(assunto === filtro));
        // Ao clicar, troca o filtro
        b.addEventListener("click", () => {
          // Guarda o assunto
          filtro = assunto;
          // Redesenha filtros
          renderFiltros();
          // Redesenha a lista
          renderLista();
        });
        // Devolve o botão
        return b;
      }),
    );
  }

  // Desenha os cards de artigo
  function renderLista() {
    // Artigos do assunto escolhido
    const lista = ARTIGOS.filter((a) => filtro === "Todos" || a.assunto === filtro);
    // Troca os cards
    $("lista").replaceChildren(
      // Um card por artigo
      ...lista.map((a) => {
        // Card é um link (abre o artigo)
        const card = criar("a", "blog-card");
        // Endereço do artigo
        card.href = `?a=${a.slug}`;
        // Capa com emoji
        const capa = criar("span", "blog-capa", a.emoji);
        // Emoji é só enfeite
        capa.setAttribute("aria-hidden", "true");
        // Assunto
        const tag = criar("span", "blog-tag", a.assunto);
        // Título
        const titulo = criar("h2", "", a.titulo);
        // Resumo
        const resumo = criar("p", "", a.resumo);
        // Autor e tempo de leitura
        const meta = criar("small", "blog-meta", `${a.autor} • ${a.minutos} min de leitura`);
        // Junta tudo
        card.append(capa, tag, titulo, resumo, meta);
        // Ao clicar, abre sem recarregar a página
        card.addEventListener("click", (e) => {
          // Impede o link de recarregar
          e.preventDefault();
          // Abre o artigo
          abrir(a.slug, true);
        });
        // Devolve o card
        return card;
      }),
    );
  }

  // Abre um artigo (ou volta para a lista se slug for vazio)
  function abrir(slug, mudarEndereco) {
    // Artigo procurado
    const a = ARTIGOS.find((x) => x.slug === slug);
    // Caixa de leitura
    const caixa = $("artigo");
    // Mostra ou esconde a lista, os filtros e o topo
    [$("lista"), $("filtros"), document.querySelector(".plans-hero")].forEach((x) => (x.hidden = !!a));
    // Mostra ou esconde a leitura
    caixa.hidden = !a;
    // Atualiza o endereço (para poder voltar e compartilhar)
    if (mudarEndereco) history.pushState({}, "", a ? `?a=${a.slug}` : location.pathname);
    // Sem artigo: volta o título da aba e para
    if (!a) return (document.title = "Saúde Life - Blog de dicas");
    // Título da aba
    document.title = `${a.titulo} - Saúde Life`;
    // Botão de voltar
    const voltar = criar("a", "blog-voltar", "← Todos os artigos");
    // Leva à lista
    voltar.href = location.pathname;
    // Volta sem recarregar
    voltar.addEventListener("click", (e) => {
      // Impede o link de recarregar
      e.preventDefault();
      // Fecha o artigo
      abrir("", true);
    });
    // Capa grande
    const capa = criar("span", "blog-capa blog-capa-grande", a.emoji);
    // Emoji é só enfeite
    capa.setAttribute("aria-hidden", "true");
    // Título
    const titulo = criar("h1", "", a.titulo);
    // Autor e tempo
    const meta = criar("p", "blog-meta", `${a.assunto} • ${a.autor} • ${a.minutos} min de leitura`);
    // Parágrafos (os que começam com "## " viram subtítulo)
    const corpo = a.texto.map((t) => (t.startsWith("## ") ? criar("h2", "", t.slice(3)) : criar("p", "", t)));
    // Aviso de que não substitui profissional
    const aviso = criar("p", "blog-aviso", "Conteúdo educativo. Não substitui a orientação de um profissional de saúde.");
    // Chamada para o app
    const cta = criar("a", "btn-hero-primary", "Colocar em prática no Saúde Life");
    // Leva ao cadastro
    cta.href = "../cadastro/cadastro.html";
    // Troca o conteúdo da leitura
    caixa.replaceChildren(voltar, capa, titulo, meta, ...corpo, aviso, cta);
    // Leva o foco para o título (bom para teclado e leitor de tela)
    titulo.tabIndex = -1;
    // Foca
    titulo.focus();
    // Sobe para o topo
    window.scrollTo(0, 0);
  }

  // Botões voltar/avançar do navegador abrem o artigo certo
  window.addEventListener("popstate", () => abrir(new URLSearchParams(location.search).get("a"), false));

  // Desenha os filtros
  renderFiltros();
  // Desenha a lista
  renderLista();
  // Se o endereço já tem um artigo, abre ele
  abrir(new URLSearchParams(location.search).get("a"), false);
})();
