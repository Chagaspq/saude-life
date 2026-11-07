// Artigos do blog, dicas do dia e ícones das capas (conteúdo do site).

export const ARTIGOS = [
  // Artigo sobre progressão de carga
  {
    // Nome no endereço
    slug: "como-subir-carga",
    // Assunto (usado no filtro)
    assunto: "Treino",
    // Ícone da capa
    icone: "haltere",
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
    // Ícone da capa
    icone: "joelho",
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
    // Ícone da capa
    icone: "pote",
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
    // Ícone da capa
    icone: "ovo",
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
    // Ícone da capa
    icone: "gota",
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
    // Ícone da capa
    icone: "calendario",
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
      "Treinar com amigos, mesmo à distância, aumenta muito a chance de continuar. É por isso que o Saúde Life tem ranking, desafios e o botão de cutucar.",
    ],
  },
  // Artigo: Quanto descansar entre as séries
  {
    // Nome no endereço
    slug: "descanso-entre-series",
    // Assunto
    assunto: "Treino",
    // Ícone da capa
    icone: "relogio",
    // Título
    titulo: "Quanto descansar entre as séries",
    // Resumo
    resumo: "1 a 3 minutos? Depende do objetivo. Veja a regra simples.",
    // Autor
    autor: "Rafael Souza, Personal Trainer",
    // Leitura
    minutos: 3,
    // Texto
    texto: [
      "O descanso é parte do treino. Descansar pouco demais derruba as repetições; descansar demais esfria o corpo.",
      "## Para ganhar força",
      "Exercícios pesados com poucas repetições (até 6) pedem 2 a 3 minutos de descanso.",
      "## Para ganhar massa",
      "Entre 8 e 12 repetições, 60 a 90 segundos funcionam bem. O cronômetro do Saúde Life já começa com 60.",
      "## Para condicionamento",
      "Circuitos e HIIT usam descansos curtos, de 20 a 45 segundos, para manter o coração acelerado.",
    ],
  },
  // Artigo: Aquecimento de 5 minutos que funciona
  {
    // Nome no endereço
    slug: "aquecimento",
    // Assunto
    assunto: "Treino",
    // Ícone da capa
    icone: "joelho",
    // Título
    titulo: "Aquecimento de 5 minutos que funciona",
    // Resumo
    resumo: "Menos alongamento parado, mais movimento. Um roteiro rápido para qualquer treino.",
    // Autor
    autor: "Gabriel Torres, Fisioterapeuta",
    // Leitura
    minutos: 3,
    // Texto
    texto: [
      "Aquecer não precisa ser longo. O objetivo é subir a temperatura do corpo e lembrar os músculos do movimento que vem pela frente.",
      "## O roteiro",
      "1 minuto de polichinelo ou bicicleta leve. 1 minuto de agachamento sem peso. 1 minuto de rotação de ombros e quadril. 2 séries leves do primeiro exercício do treino.",
      "## E o alongamento?",
      "Alongamento parado e longo fica melhor no fim do treino ou em outro horário. Antes, prefira movimentos.",
    ],
  },
  // Artigo: Dor muscular no dia seguinte: normal ou não?
  {
    // Nome no endereço
    slug: "dor-muscular",
    // Assunto
    assunto: "Treino",
    // Ícone da capa
    icone: "haltere",
    // Título
    titulo: "Dor muscular no dia seguinte: normal ou não?",
    // Resumo
    resumo: "Como diferenciar o cansaço do treino de uma lesão.",
    // Autor
    autor: "Gabriel Torres, Fisioterapeuta",
    // Leitura
    minutos: 4,
    // Texto
    texto: [
      "A dor que aparece 24 a 48 horas depois do treino é comum, principalmente quando você muda de exercício ou volta depois de um tempo parado.",
      "## Sinais de que é normal",
      "Dor espalhada pelo músculo, que melhora com movimento leve e some em até 3 dias.",
      "## Sinais de alerta",
      "Dor pontual na articulação, inchaço, dor que piora a cada treino ou que aparece de repente durante um exercício. Nesses casos, pare e procure um profissional.",
      "## Ajuda a passar",
      "Sono, água, proteína e uma caminhada leve. No Saúde Life, marque \"Com dor muscular\" no humor e o Pulso sugere um treino mais leve.",
    ],
  },
  // Artigo: Café da manhã que segura até o almoço
  {
    // Nome no endereço
    slug: "cafe-da-manha",
    // Assunto
    assunto: "Alimentação",
    // Ícone da capa
    icone: "ovo",
    // Título
    titulo: "Café da manhã que segura até o almoço",
    // Resumo
    resumo: "Proteína + fibra: a combinação que tira a fome do meio da manhã.",
    // Autor
    autor: "Ana Souza, Nutricionista",
    // Leitura
    minutos: 3,
    // Texto
    texto: [
      "Se a fome bate às 10h, o café provavelmente teve pouca proteína e pouca fibra.",
      "## Monte assim",
      "Uma fonte de proteína (ovo, iogurte natural, queijo branco), uma fonte de fibra (fruta inteira, aveia, pão integral) e um líquido sem açúcar.",
      "## Três exemplos",
      "Ovos mexidos com pão integral e mamão. Iogurte com aveia e banana. Tapioca com queijo branco e uma laranja.",
    ],
  },
  // Artigo: O que comer antes de treinar
  {
    // Nome no endereço
    slug: "comer-antes-treino",
    // Assunto
    assunto: "Alimentação",
    // Ícone da capa
    icone: "pote",
    // Título
    titulo: "O que comer antes de treinar",
    // Resumo
    resumo: "Treinar em jejum, logo depois do almoço ou com um lanche? Depende do horário.",
    // Autor
    autor: "Lucas Prado, Nutricionista",
    // Leitura
    minutos: 3,
    // Texto
    texto: [
      "Não existe uma regra única. O importante é não treinar com fome forte nem com o estômago muito cheio.",
      "## 1 a 2 horas antes",
      "Uma refeição leve com carboidrato e um pouco de proteína: pão com ovo, fruta com iogurte, arroz com frango.",
      "## 30 minutos antes",
      "Algo pequeno e fácil de digerir: uma banana ou um punhado de frutas secas.",
      "## E o jejum?",
      "Funciona para algumas pessoas em treinos leves. Se der tontura ou queda de rendimento, coma antes.",
    ],
  },
  // Artigo: Sono: o treino que ninguém vê
  {
    // Nome no endereço
    slug: "sono-e-resultado",
    // Assunto
    assunto: "Hábitos",
    // Ícone da capa
    icone: "lua",
    // Título
    titulo: "Sono: o treino que ninguém vê",
    // Resumo
    resumo: "Dormir menos de 7 horas atrapalha a fome, a força e a recuperação.",
    // Autor
    autor: "Ana Souza, Nutricionista",
    // Leitura
    minutos: 3,
    // Texto
    texto: [
      "É durante o sono que o corpo repara o músculo trabalhado no treino. Dormir pouco também aumenta a fome no dia seguinte.",
      "## Quanto dormir",
      "Adultos: 7 a 9 horas. Se você treina pesado, mire no topo dessa faixa.",
      "## Três hábitos que ajudam",
      "Horário fixo para deitar, tela longe 30 minutos antes e café só até o meio da tarde. Registre suas noites na página Saúde e ganhe 10 pontos por noite de 7 horas ou mais.",
    ],
  },
  // Artigo: Sem tempo? Treino de 20 minutos
  {
    // Nome no endereço
    slug: "treino-curto",
    // Assunto
    assunto: "Hábitos",
    // Ícone da capa
    icone: "relogio",
    // Título
    titulo: "Sem tempo? Treino de 20 minutos",
    // Resumo
    resumo: "Como montar um treino curto que ainda dá resultado.",
    // Autor
    autor: "Carla Mendes, Personal Trainer",
    // Leitura
    minutos: 3,
    // Texto
    texto: [
      "Vinte minutos bem usados valem mais do que uma hora pela metade.",
      "## A receita",
      "Escolha 4 exercícios grandes (agachamento, flexão, remada, prancha). Faça 40 segundos de cada com 20 de descanso, 4 voltas.",
      "## Por que funciona",
      "Exercícios que usam muitos músculos de uma vez gastam mais energia e treinam o corpo todo. O que conta é a constância: 20 minutos, 4 vezes por semana.",
    ],
  },
  // Artigo: Creatina: o que diz a ciência
  {
    // Nome no endereço
    slug: "creatina",
    // Assunto
    assunto: "Alimentação",
    // Ícone da capa
    icone: "gota",
    // Título
    titulo: "Creatina: o que diz a ciência",
    // Resumo
    resumo: "O suplemento mais estudado do mundo, explicado sem exagero.",
    // Autor
    autor: "Lucas Prado, Nutricionista",
    // Leitura
    minutos: 4,
    // Texto
    texto: [
      "A creatina ajuda o músculo a ter energia para esforços curtos e fortes. É um dos suplementos com mais estudos de segurança.",
      "## Quanto tomar",
      "O comum é 3 a 5 gramas por dia, todo dia, em qualquer horário. Não precisa de \"fase de saturação\".",
      "## Quem deve conversar com um profissional antes",
      "Quem tem doença nos rins, está grávida ou toma remédios contínuos. Suplemento não substitui comida: primeiro a base, depois o resto.",
    ],
  },
  // Artigo: Voltando a treinar depois de parar
  {
    // Nome no endereço
    slug: "voltar-a-treinar",
    // Assunto
    assunto: "Hábitos",
    // Ícone da capa
    icone: "calendario",
    // Título
    titulo: "Voltando a treinar depois de parar",
    // Resumo
    resumo: "Comece com metade do que fazia e suba em 3 semanas.",
    // Autor
    autor: "Rafael Souza, Personal Trainer",
    // Leitura
    minutos: 3,
    // Texto
    texto: [
      "Parar faz parte. Voltar com tudo é o que costuma machucar e desanimar.",
      "## Semana 1",
      "Metade das séries e cerca de 60% das cargas que você usava. O objetivo é lembrar o movimento.",
      "## Semanas 2 e 3",
      "Suba aos poucos até as cargas antigas. Se doer, segure por mais uma semana.",
      "## Dica",
      "Marque a volta como uma meta no Saúde Life. A sequência recomeça, mas o seu histórico continua lá.",
    ],
  },
];

export const DICAS = [
  "Deixe a garrafa de água à vista: quem vê, bebe mais.",
  "Subir 1 kg na carga já é progresso. Não precisa pular de 5 em 5.",
  "Durma 7 horas ou mais: é quando o músculo se recupera.",
  "Metade do prato com salada e legumes ajuda a comer menos sem passar fome.",
  "Treino curto feito vale mais do que treino longo planejado.",
  "Proteína em todas as refeições facilita bater a meta do dia.",
  "Caminhar 10 minutos depois do almoço ajuda na digestão e no açúcar do sangue.",
  "Marque o treino na agenda como se fosse um compromisso.",
  "Doeu a articulação? Pare o exercício. Dor no músculo é diferente de dor na junta.",
  "Prepare as marmitas no domingo e a semana fica muito mais fácil.",
];

export const ICONES_BLOG = {
  // Haltere
  haltere: ["M6 5v14", "M18 5v14", "M3 8v8", "M21 8v8", "M6 12h12"],
  // Linha de movimento (articulação do joelho)
  joelho: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  // Pote de marmita com tampa
  pote: ["M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", "M3 7h18v3H3z", "M10 4h4v3h-4z"],
  // Ovo
  ovo: ["M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z"],
  // Gota de água
  gota: ["M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"],
  // Relógio
  relogio: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
  // Lua (sono)
  lua: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"],
  // Calendário com check (constância)
  calendario: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m9 16 2 2 4-4"],
};

