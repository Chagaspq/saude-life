// Cenas do vídeo: quem fala, título da tela, a fala e o que fazer no site.
const B = "http://localhost:5182";
// Pessoas e cores
exports.PESSOAS = {
  Gabriel: { nome: "Gabriel Chagas", n: "08", cor: "#f0845a" },
  Rafael: { nome: "Rafael (PH) Santos", n: "15", cor: "#4fc29a" },
  Tomas: { nome: "Tomas de Oliveira", n: "17", cor: "#f5c35a" },
  Hiago: { nome: "Hiago Tetsuo", n: "10", cor: "#7ab8ff" },
};

// Cartão (abertura, tecnologia, encerramento)
const cartao = (corpo) => `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(60% 70% at 70% 20%,rgba(240,132,90,.18),transparent),#0e1512;color:#f4f1ea;font-family:Barlow,"DejaVu Sans",Arial,sans-serif;text-align:center}
h1{font-size:96px;margin:18px 0 6px;letter-spacing:-1px} h1 span{color:#f0845a} p{font-size:30px;color:#a3b0a8;margin:6px}
.nomes{display:flex;gap:28px;justify-content:center;margin-top:44px;font-size:26px}.nomes div{padding:14px 22px;border:1px solid #263832;border-radius:14px;background:#16211d}
.cx{display:flex;gap:26px;align-items:center;justify-content:center;margin-top:40px}.b{width:330px;padding:28px;border-radius:18px;background:#16211d;border:2px solid #263832;font-size:28px}.b strong{display:block;font-size:40px;margin-bottom:8px}
.s{font-size:54px;color:#4fc29a}</style></head><body><div>${corpo}</div></body></html>`;
const LOGO = `<svg width="120" height="120" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="g" x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f0845a"/><stop offset="100%" stop-color="#4fc29a"/></linearGradient></defs><path d="M32 9.5A22.5 22.5 0 1 1 12.51 20.75" stroke="url(#g)" stroke-width="6.5" stroke-linecap="round"/><path d="M19.5 33H24.5L28.5 25L33.5 41L37 33H44.5" stroke="url(#g)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const NOMES = `<div class="nomes"><div>Gabriel Chagas · 08</div><div>Rafael (PH) Santos · 15</div><div>Tomas de Oliveira · 17</div><div>Hiago Tetsuo · 10</div></div>`;

exports.CENAS = [
  // ---------------- Gabriel: abertura e site público ----------------
  { quem: "Gabriel", titulo: "Abertura", fala: "Olá! Nós somos Gabriel Chagas, Rafael Santos, Tomas de Oliveira e Hiago Tetsuo, e este é o Saúde Life: um aplicativo de treino que ajuda as pessoas a manter a constância e ajuda as academias a acompanhar os alunos.",
    fazer: async (p) => { await p.setContent(cartao(`${LOGO}<h1>Saúde <span>Life</span></h1><p>Treino guiado e acompanhamento da academia</p>${NOMES}`)); } },
  { quem: "Gabriel", titulo: "Página inicial", fala: "Esta é a página inicial. Ela mostra o problema: muita gente começa a treinar e desiste. A nossa proposta é treino guiado, pontos para manter a motivação e o acompanhamento de quem entende.",
    fazer: async (p, h) => { await h.ir("/welcome/welcome.html"); await h.esperar(2500); await h.rolar(700); await h.esperar(2200); await h.rolar(700); await h.esperar(2200); await h.rolar(-1400); } },
  { quem: "Gabriel", titulo: "Planos", fala: "Na página de planos está o modelo de negócio: o plano Free é grátis e o Premium tem trinta dias de teste. Dá para ver o preço por mês ou por ano, com vinte por cento de desconto.",
    fazer: async (p, h) => { await h.ir("/planos/planos.html"); await h.esperar(2000); await h.rolar(380); await h.esperar(1500); await h.clicar(".billing-option >> nth=1"); await h.esperar(2500); await h.clicar(".billing-option >> nth=0"); } },
  { quem: "Gabriel", titulo: "Blog de dicas", fala: "No blog, profissionais escrevem dicas curtas de treino, alimentação e hábitos. Dá para filtrar por assunto, buscar e mandar o artigo pelo WhatsApp.",
    fazer: async (p, h) => { await h.ir("/blog/blog.html"); await h.esperar(1500); await h.clicar(".blog-filtros .chip >> nth=2"); await h.esperar(1500); await h.clicar(".blog-filtros .chip >> nth=0"); await h.esperar(800); await h.clicar(".blog-card >> nth=0"); await h.esperar(1500); await h.rolar(500); } },
  { quem: "Gabriel", titulo: "Para academias", fala: "Esta página é para as academias. Ela mostra o que o dono ganha e tem um simulador: arrastando, ele vê quantos treinos a mais os alunos fariam por mês.",
    fazer: async (p, h) => { await h.ir("/academias/academias.html"); await h.esperar(1800); await h.rolarAte(".acad-simulador"); await h.esperar(800); await h.arrastar("#acad-alunos", 0.15, 0.75); } },
  { quem: "Gabriel", titulo: "Ajuda e calculadoras", fala: "Também temos a central de ajuda, um glossário e calculadoras de IMC, calorias, água e carga máxima. Por exemplo, o IMC de alguém com setenta e cinco quilos e um metro e setenta e oito.",
    fazer: async (p, h) => { await h.ir("/ajuda/ajuda.html"); await h.esperar(1500); await h.clicar("details summary >> nth=0"); await h.esperar(1500); await h.ir("/calculadoras/calculadoras.html"); await h.esperar(1000); await h.digitar(".calc-card >> nth=0 >> input[name=peso]", "75"); await h.digitar(".calc-card >> nth=0 >> input[name=altura]", "178"); await h.clicar(".calc-card >> nth=0 >> button"); } },

  // ---------------- Rafael: conta, início e treinos ----------------
  { quem: "Rafael", titulo: "Criar conta", fala: "Agora a conta. No cadastro, a pessoa escolhe se é cliente ou administrador, preenche nome, e-mail e senha, e o app mostra na hora as regras de uma senha forte.",
    fazer: async (p, h) => { await h.ir("/cadastro/cadastro.html"); await h.esperar(1200); await h.clicar(".tipo-conta-opcao >> nth=1"); await h.esperar(700); await h.clicar(".tipo-conta-opcao >> nth=0"); await h.digitar("#name", "Ana Souza"); await h.digitar("#email", "ana@exemplo.com"); await h.digitar("#password", "Treino#2026"); await h.digitar("#confirm-password", "Treino#2026"); } },
  { quem: "Rafael", titulo: "Criar conta: passo 2", fala: "No segundo passo os dados são opcionais: foto, apelido, nascimento, altura e peso. Eles servem para o app calcular as metas de água e de calorias.",
    fazer: async (p, h) => { await h.clicar(".btn-submit"); await h.esperar(1200); await h.digitar("#apelido", "Ana"); await h.digitar("#altura", "165"); await h.digitar("#peso", "62"); await h.clicar("#terms"); } },
  { quem: "Rafael", titulo: "Entrar", fala: "Na tela de entrar tem o login normal e, para a apresentação, os botões de demonstração. Vamos entrar como cliente.",
    fazer: async (p, h) => { await h.ir("/login/login.html"); await h.esperar(2500); await h.clicar("text=Demonstração: cliente"); await p.waitForURL(/inicio/); } },
  { quem: "Rafael", titulo: "Questionário inicial", fala: "Na primeira vez, o cliente responde três perguntas: o objetivo, o nível e quantos dias por semana quer treinar. Isso vira a meta da semana.",
    fazer: async (p, h) => { await h.ir("/app/comecar/comecar.html"); await h.esperar(1500); await h.clicar("text=Ganhar massa muscular"); await h.esperar(600); await h.clicar("button[type=submit]"); await h.esperar(1000); await h.clicar("text=Intermediário"); await h.clicar("button[type=submit]"); await h.esperar(1000); await h.clicar(".day-chip >> text=4"); await h.esperar(800); await h.clicar("button[type=submit]"); await p.waitForURL(/inicio/); } },
  { quem: "Rafael", titulo: "Início", fala: "Este é o Início. Ele mostra a meta da semana com os dias treinados, a sequência de semanas, o total de treinos e o tempo. Embaixo ficam os pontos da semana, a liga e o próximo treino sugerido.",
    fazer: async (p, h) => { await h.esperar(3000); await h.rolar(450); await h.esperar(2500); await h.rolar(400); } },
  { quem: "Rafael", titulo: "Meus treinos", fala: "Em Treinos ficam as fichas. Dá para criar, editar e ver os exercícios, e até montar um treino automático, escolhendo o tempo, o foco e se é na academia ou em casa.",
    fazer: async (p, h) => { await h.ir("/app/treinos/treinos.html"); await h.esperar(1800); await h.clicar("[aria-label^='Ver exercícios'] >> nth=0"); await h.esperar(2200); await h.tecla("Escape"); await h.esperar(600); await h.clicar("text=Montar automático"); await h.esperar(1200); await h.clicar(".auto-chip >> text=45 min"); await h.clicar(".auto-chip >> text=Pernas"); await h.esperar(1500); await h.tecla("Escape"); } },

  // ---------------- Tomas: treino, alimentação, evolução, perfil, assinatura ----------------
  { quem: "Tomas", titulo: "Treino guiado", fala: "Esta é a tela do treino. A pessoa marca cada série, ajusta as repetições e a carga, e o descanso começa a contar sozinho. Cada série vale pontos.",
    fazer: async (p, h) => { await h.ir("/app/treinos/treinos.html"); await h.esperar(800); await h.clicar(".workout-card >> nth=0 >> text=Iniciar treino"); await p.waitForURL(/treino\.html/); await h.esperar(1500); await h.digitar(".set-row >> nth=0 >> input >> nth=1", "62"); await h.esperar(600); await h.clicar(".set-check >> nth=0"); await h.esperar(3500); await h.clicar("text=+15 s"); await h.esperar(1500); await h.clicar("text=Pular descanso"); await h.clicar(".set-check >> nth=1"); await h.esperar(1500); await h.clicar("text=Pular descanso"); } },
  { quem: "Tomas", titulo: "Treino: extras e resumo", fala: "Tem também drop set, bi-set, troca de exercício e as dicas de como fazer. No final aparece o resumo: duração, séries, volume levantado e calorias, e a pessoa diz como foi o treino.",
    fazer: async (p, h) => { await h.clicar("text=Como fazer"); await h.esperar(2000); await h.clicar("text=+ Drop set"); await h.esperar(1500); await h.clicar(".player-list-item >> nth=-1"); await h.esperar(800); await h.clicar("text=Finalizar treino"); await h.esperar(1000); await h.clicar(".modal-actions .btn-primary"); await h.esperar(2000); await h.clicar("text=Na medida"); } },
  { quem: "Tomas", titulo: "Alimentação", fala: "Na Alimentação, o app calcula as metas de calorias e de proteína. Ao adicionar uma refeição, a busca de alimentos soma os valores sozinha. E tem o controle de água com a garrafinha.",
    fazer: async (p, h) => { await h.ir("/app/alimentacao/alimentacao.html"); await h.esperar(1500); await h.clicar("text=Adicionar refeição"); await h.esperar(500); await h.digitar("#ref-nome", "Almoço"); await h.digitar("#alim-busca", "arroz"); await h.esperar(500); await h.clicar(".alim-resultados button >> nth=0"); await h.digitar("#alim-busca", "frango"); await h.esperar(500); await h.clicar(".alim-resultados button >> nth=0"); await h.esperar(1200); await h.clicar(".modal-form button[type=submit]"); await h.esperar(1000); await h.clicar(".btn-agua-mais"); await h.esperar(500); await h.clicar(".btn-agua-mais"); } },
  { quem: "Tomas", titulo: "Evolução", fala: "Na Evolução ficam o gráfico do peso, os treinos por semana com a linha da meta, o histórico de treinos e as metas pessoais da pessoa.",
    fazer: async (p, h) => { await h.ir("/app/evolucao/evolucao.html"); await h.esperar(1500); await h.clicar("text=12 sem."); await h.esperar(1800); await h.rolar(550); await h.esperar(2000); await h.rolar(600); } },
  { quem: "Tomas", titulo: "Perfil", fala: "No Perfil aparecem o tipo de conta, os objetivos, as conquistas e os lembretes. A pessoa também pode baixar ou apagar os próprios dados, pensando na LGPD.",
    fazer: async (p, h) => { await h.ir("/app/perfil/perfil.html"); await h.esperar(2000); await h.rolar(500); await h.esperar(2200); await h.rolar(700); await h.esperar(2000); await h.rolar(700); } },
  { quem: "Tomas", titulo: "Assinatura", fala: "E aqui a assinatura: o teste grátis de trinta dias ou o pagamento por Pix ou cartão.",
    fazer: async (p, h) => { await h.ir("/app/planos/planos.html"); await h.esperar(1500); await h.clicar("text=Testar 30 dias grátis"); await h.esperar(1500); await h.clicar("text=Cartão de crédito"); await h.esperar(1500); await h.tecla("Escape"); } },

  // ---------------- Hiago: administrador, acessibilidade e tecnologia ----------------
  { quem: "Hiago", titulo: "Painel do administrador", fala: "Agora o acesso de administrador, que é da academia ou do personal. Ele é reconhecido na hora pelo selo ADMIN e pela faixa verde. O painel mostra os clientes, quantos estão ativos e quanto cada um treinou.",
    fazer: async (p, h) => { await h.ir("/app/perfil/perfil.html"); await h.esperar(600); await h.clicar("text=Sair da conta"); await p.waitForURL(/login/); await h.esperar(800); await h.clicar("text=Demonstração: administrador"); await p.waitForURL(/admin/); await h.esperar(2500); await h.rolar(350); } },
  { quem: "Hiago", titulo: "Mandar treino", fala: "O administrador monta um treino escolhendo os exercícios por grupo muscular e manda direto para o cliente.",
    fazer: async (p, h) => { await h.clicar("text=Mandar treino"); await h.esperar(800); await h.digitar("#adm-nome", "Treino do Personal"); await h.clicar("text=Adicionar exercício"); await h.esperar(500); await p.selectOption("#adm-grupo", "Costas"); await h.esperar(600); await h.clicar("text=Adicionar exercício"); await h.esperar(1200); await h.clicar(".modal-form button[type=submit]"); } },
  { quem: "Hiago", titulo: "Avisos", fala: "Ele também publica avisos para todos os clientes da academia, como um feriado ou uma mudança de horário.",
    fazer: async (p, h) => { await h.rolarAte("#adm-aviso"); await h.digitar("#adm-aviso", "Feriado: a academia fecha às 18h"); await h.esperar(500); await h.clicar("text=Publicar"); } },
  { quem: "Hiago", titulo: "O cliente recebe", fala: "Quando o cliente entra, o aviso aparece no Início, e o treino enviado já está na lista, com o nome de quem mandou.",
    fazer: async (p, h) => { await h.ir("/app/perfil/perfil.html"); await h.esperar(500); await h.clicar("text=Sair da conta"); await p.waitForURL(/login/); await h.esperar(600); await h.clicar("text=Demonstração: cliente"); await p.waitForURL(/inicio/); await h.esperar(1500); await h.rolarAte(".avisos-admin"); await h.esperar(2500); await h.ir("/app/treinos/treinos.html"); } },
  { quem: "Hiago", titulo: "Acessibilidade", fala: "Pensamos em acessibilidade: tema claro e escuro, tamanho da letra, alto contraste, menos movimento e três idiomas. E o site funciona no celular, com o menu embaixo.",
    fazer: async (p, h) => { await h.ir("/app/inicio/inicio.html"); await h.esperar(1200); await h.clicar(".topbar-actions .btn-a11y"); await h.esperar(1500); await h.clicar(".a11y-painel .switch >> nth=0"); await h.esperar(2000); await h.clicar("[aria-label='Aumentar texto']"); await h.esperar(1800); await h.clicar("[aria-label='Diminuir texto']"); await h.esperar(600); await h.clicar(".a11y-painel .switch >> nth=0"); await h.esperar(800); await h.clicar(".topbar-actions .btn-a11y"); await p.setViewportSize({ width: 430, height: 900 }); await h.esperar(2500); await p.setViewportSize({ width: 1600, height: 900 }); } },
  { quem: "Hiago", titulo: "Tecnologia", fala: "Por trás de tudo: o site é feito em React, a API é em Java com Spring Boot, e os dados ficam guardados no banco de dados SQL Server.",
    fazer: async (p) => { await p.setContent(cartao(`<p class="s">Como o Saúde Life funciona</p><div class="cx"><div class="b"><strong>Site</strong>React<br>HTML, CSS e JavaScript</div><div style="font-size:60px;color:#4fc29a">→</div><div class="b"><strong>API</strong>Java + Spring Boot<br>regras e segurança</div><div style="font-size:60px;color:#4fc29a">→</div><div class="b"><strong>Banco</strong>SQL Server<br>12 tabelas</div></div>`)); } },

  // ---------------- Gabriel: encerramento ----------------
  { quem: "Gabriel", titulo: "Encerramento", fala: "Esse é o Saúde Life: simples para quem treina e útil para quem acompanha. Obrigado pela atenção!",
    fazer: async (p) => { await p.setContent(cartao(`${LOGO}<h1>Obrigado!</h1><p>Saúde Life · chagaspq.github.io/saude-life</p>${NOMES}`)); } },
];
exports.B = B;
