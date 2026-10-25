/*
 * Português / inglês / espanhol do Saúde Life.
 * Coloca um botão "EN" / "ES" / "PT" em todas as páginas. Em outro idioma, troca os textos
 * da tela usando o dicionário abaixo (frase em português -> frase em inglês),
 * inclusive os que o JavaScript desenha depois (o "observador" vê as mudanças).
 * O que não está no dicionário (nomes de treinos, pessoas) fica em português.
 * A escolha fica salva em sl-idioma.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Dicionário: português -> inglês
  const D = {
    // ---------- Topo, menus e rodapé ----------
    // Itens do topo do site
    "Blog": "Blog", "Para academias": "For gyms", "Planos": "Plans", "Entrar": "Log in", "Começar": "Get started",
    // Navegação e rodapé
    "Navegação principal": "Main navigation", "Produto": "Product", "Blog de dicas": "Tips blog", "Criar conta": "Sign up", "Legal": "Legal",
    // Links legais
    "Termos de Uso": "Terms of Use", "Política de Privacidade": "Privacy Policy", "Links legais": "Legal links",
    // Direitos
    "© 2026 Saúde Life. Todos os direitos reservados.": "© 2026 Saúde Life. All rights reserved.",
    // Frase do rodapé
    "Treinos guiados, profissionais de confiança e o acompanhamento da sua evolução em um só lugar.": "Guided workouts, trusted professionals and your progress tracking, all in one place.",
    // Menu do app: grupos
    "Treinar": "Train", "Comer": "Eat", "Evoluir": "Progress", "Comunidade": "Community", "Sua conta": "Your account",
    // Menu do app: páginas
    "Início": "Home", "Descobrir": "Discover", "Treinos": "Workouts", "Aulas": "Classes", "Alimentação": "Nutrition", "Evolução": "Progress", "Ranking": "Leaderboard",
    // Mais páginas do menu
    "Profissionais": "Professionals", "Academia": "Gym", "Salvos": "Saved", "Perfil": "Profile", "Galera": "Crew",
    // Páginas e botões novos (comunidade, profissionais, academia e aulas)
    "Área do profissional": "Pro area", "Grupos": "Groups", "Criar grupo": "Create group", "Treinando agora": "Training now", "Treinar junto": "Train together",
    // Mais botões novos
    "Montar treino": "Build workout", "Seus alunos": "Your clients", "Treinos enviados": "Sent workouts", "Sou profissional": "I'm a professional",
    // Academia
    "Horário de funcionamento": "Opening hours", "Aparelhos agora": "Equipment now", "Alunos sumidos": "Missing members", "Desafio da academia": "Gym challenge", "Mandar recado": "Send a note",
    // Chat
    "Treino": "Workout", "Figurinha": "Sticker", "Áudio (simulado)": "Audio (simulated)", "Mandar no WhatsApp": "Send on WhatsApp", "Copiar link": "Copy link", "Convidar amigo": "Invite friend",
    // Botões do topo do app
    "Configurações": "Settings", "Sair da conta": "Log out", "Abrir menu": "Open menu", "Abrir busca": "Open search", "Pesquisar": "Search",
    // Busca
    "Pesquisar treinos, profissionais, conteúdos...": "Search workouts, professionals, content...",
    // Tema
    "Mudar para o tema claro (bom para treinar no sol)": "Switch to light theme (good in the sun)", "Tema claro": "Light theme", "Tema escuro": "Dark theme",
    // Avisos do topo
    "Notificações": "Notifications", "Mensagens": "Messages", "Abrir meu perfil": "Open my profile",
    // Rótulos de acessibilidade do app
    "Navegação lateral principal": "Main side navigation", "Seções do app": "App sections", "Navegação rápida": "Quick navigation", "Fechar modal": "Close dialog",
    // Modal
    "Título do Modal": "Dialog title", "Abrir todas as mensagens": "Open all messages",

    // ---------- Página inicial ----------
    // Topo
    "Seu parceiro de treino": "Your workout buddy", "Progresso de verdade, no seu ritmo.": "Real progress, at your pace.", "Criar minha conta": "Create my account", "Já tenho conta": "I have an account",
    // Demonstração
    "Experimente agora, sem criar conta": "Try it now, no sign-up", "Agachamento livre": "Barbell squat", "Toque no círculo de cada série.": "Tap the circle of each set.",
    // Séries
    "Série 1": "Set 1", "Série 2": "Set 2", "Série 3": "Set 3", "Série 4": "Set 4", "pontos": "points", "Séries de hoje": "Today's sets", "de 3": "of 3",
    // Marcar séries
    "Marcar a série 1 como feita": "Mark set 1 as done", "Marcar a série 2 como feita": "Mark set 2 as done", "Marcar a série 3 como feita": "Mark set 3 as done",
    // Texto da demonstração pronta
    "Treino feito! Agora imagina isso valendo no ranking.": "Workout done! Now imagine that counting on the leaderboard.",
    // Peso
    "Peso": "Weight", "−4,0 kg em 12 semanas": "−4.0 kg in 12 weeks",
    // Números
    "Treinos registrados": "Workouts logged", "Profissionais verificados": "Verified professionals", "Avaliação média": "Average rating", "Saúde Life em números": "Saúde Life in numbers",
    // Aviso de exemplo
    "Números de exemplo. O Saúde Life é um projeto de TCC.": "Sample numbers. Saúde Life is a final course project.",
    // Questionário
    "Em 3 toques": "In 3 taps", "Bora ver como seria o seu treino?": "Want to see what your workout would look like?", "1. O que você quer?": "1. What do you want?",
    // Objetivos do questionário
    "Ganhar massa": "Build muscle", "Emagrecer": "Lose weight", "Mais fôlego": "More stamina", "Bem-estar": "Well-being",
    // Tempo
    "2. Quanto tempo você tem?": "2. How much time do you have?", "3. Como está seu nível?": "3. What's your level?",
    // Nível
    "Começando": "Beginner", "Já treino": "I already train", "Treino há anos": "Years of training",
    // Botão da prévia
    "Criar conta e começar esse treino": "Sign up and start this workout",
    // Ranking de exemplo
    "Treinar junto rende mais": "Training together pays off", "Cada série vale ponto. A semana vira disputa.": "Every set earns points. The week becomes a match.",
    // Texto do ranking de exemplo
    "Some pontos treinando, comendo bem e bebendo água. Suba de liga, ganhe selos e passe a galera no ranking, que zera toda segunda.": "Earn points by training, eating well and drinking water. Climb leagues, earn badges and pass your friends on the leaderboard, which resets every Monday.",
    // Pódio
    "Você?": "You?", "Exemplo de pódio da semana": "Sample weekly podium", "Ligas": "Leagues",
    // Ligas
    "Bronze": "Bronze", "Prata": "Silver", "Ouro": "Gold", "Diamante": "Diamond",
    // Recursos
    "Recursos": "Features", "Tudo o que você precisa pra treinar com constância": "Everything you need to train consistently", "Treinos guiados": "Guided workouts",
    // Recurso: treinos
    "Séries, cargas e descanso explicados passo a passo, do aquecimento ao alongamento.": "Sets, loads and rest explained step by step, from warm-up to stretching.",
    // Recurso: evolução
    "Evolução visível": "Visible progress", "Gráficos de peso e carga semana a semana pra você ver o esforço virando resultado.": "Weekly weight and load charts so you can see effort turning into results.",
    // Recurso: profissionais
    "Personal, nutricionista e fisioterapeuta com registro conferido, prontos pra te orientar.": "Personal trainers, nutritionists and physiotherapists with verified licenses, ready to guide you.",
    // Recurso: aulas
    "Aulas na academia": "Gym classes", "Veja a grade da semana e reserve sua vaga sem fila e sem grupo de mensagem.": "See the weekly schedule and book your spot, no queues, no group chats.",
    // Como funciona
    "Como funciona": "How it works", "Do primeiro clique ao primeiro resultado": "From first click to first result", "Comece em menos de 1 minuto": "Start in under 1 minute", "Crie sua conta, diga o que você quer (emagrecer, ganhar massa ou ter mais disposição) e comece a usar. Leva menos de um minuto.": "Create your account, tell us what you want (lose weight, build muscle or have more energy) and start using it. It takes less than a minute.", "A gente monta treinos e metas de acordo com sua rotina, seu nível e seu objetivo. Se precisar, um profissional ajusta com você.": "We build workouts and goals around your routine, level and goal. If needed, a professional fine-tunes them with you.",
    // Passos
    "Um plano com a sua cara": "A plan that fits you", "Veja o progresso acontecer": "Watch progress happen",
    // Texto do passo 3
    "Cada treino, cada meta batida, cada pequena vitória fica registrada. Gráficos simples mostram sua evolução real, pra você ver que o esforço está valendo a pena.": "Every workout, every goal hit, every small win is logged. Simple charts show your real progress, so you can see the effort is paying off.",
    // Por dentro do app
    "Por dentro do app": "Inside the app", "Cada série registrada, sem caderninho": "Every set logged, no notebook needed",
    // Texto
    "Marque as séries, ajuste a carga na hora e deixe o cronômetro de descanso avisar quando voltar.": "Check off sets, adjust the load on the fly and let the rest timer tell you when to go again.",
    // Treino de exemplo
    "Exercício 2 de 6": "Exercise 2 of 6", "Descanso": "Rest", "para a série 3": "until set 3", "Treino concluído": "Workout complete", "Séries": "Sets", "Volume": "Volume", "Meta da semana": "Weekly goal",
    // Profissionais
    "Você não precisa fazer isso sozinho": "You don't have to do it alone", "Nutricionista": "Nutritionist", "Personal Trainer": "Personal trainer", "Instrutora de Yoga": "Yoga instructor", "Fisioterapeuta": "Physiotherapist", "Yoga": "Yoga",
    // Depoimentos
    "Depoimentos": "Testimonials", "Quem usa, continua": "Those who use it, stick with it",
    // Depoimento 1
    "“Perdi 6 kg em 3 meses e, pela primeira vez, entendi o meu progresso.”": "“I lost 6 kg in 3 months and, for the first time, understood my progress.”", "27 anos, emagrecimento": "27, weight loss",
    // Depoimento 2
    "“Os treinos se encaixam na minha rotina de trabalho. Treino 4 vezes por semana sem pular.”": "“The workouts fit my work routine. I train 4 times a week without skipping.”", "34 anos, hipertrofia": "34, muscle gain",
    // Depoimento 3
    "“Minha nutricionista acompanha tudo pelo app. Ficou muito mais fácil seguir o plano.”": "“My nutritionist follows everything in the app. Sticking to the plan got much easier.”", "22 anos, saúde": "22, health",
    // Aviso de exemplo
    "Depoimentos de exemplo. O Saúde Life é um projeto de TCC.": "Sample testimonials. Saúde Life is a final course project.",
    // Perguntas
    "Dúvidas": "Questions", "Perguntas frequentes": "FAQ", "O Saúde Life é gratuito?": "Is Saúde Life free?",
    // Resposta 1
    "Sim. O plano Free é gratuito para sempre. Os planos pagos liberam treinos personalizados, relatórios avançados e suporte prioritário.": "Yes. The Free plan is free forever. Paid plans unlock personalized workouts, advanced reports and priority support.",
    // Pergunta 2
    "Preciso ir à academia?": "Do I need a gym?", "Não. Há treinos para fazer em casa, sem equipamento, e treinos completos para quem já frequenta academia.": "No. There are home workouts with no equipment, and full workouts for gym-goers.",
    // Pergunta 3
    "Os profissionais são verificados?": "Are the professionals verified?", "Sim. Conferimos o registro profissional de cada especialista (CREF, CRN ou CREFITO) antes de liberar o perfil.": "Yes. We check each specialist's professional license (CREF, CRN or CREFITO) before publishing the profile.",
    // Pergunta 4
    "Posso cancelar quando quiser?": "Can I cancel anytime?", "Pode. Não existe fidelidade nem multa: o cancelamento vale no fim do período já pago.": "Yes. No commitment, no fee: cancellation takes effect at the end of the paid period.",
    // Pergunta 5
    "Meus dados de saúde ficam seguros?": "Is my health data safe?", "Sim. Seus dados são usados só para personalizar sua experiência. Veja os detalhes na": "Yes. Your data is only used to personalize your experience. See the details in the",
    // Pergunta 6
    "Funciona no celular?": "Does it work on my phone?", "Funciona. O Saúde Life se adapta a qualquer tela: celular, tablet ou computador.": "Yes. Saúde Life adapts to any screen: phone, tablet or computer.",
    // Chamada final
    "Seu primeiro treino começa hoje.": "Your first workout starts today.", "Crie sua conta em menos de um minuto e conheça os planos quando fizer sentido pra você.": "Create your account in under a minute and check the plans when it makes sense for you.",
    // Botões finais
    "Criar conta grátis": "Create free account", "Ver planos": "See plans", "Saúde Life - Boas-vindas": "Saúde Life - Welcome",

    // ---------- Planos ----------
    // Topo
    "Planos Saúde Life": "Saúde Life plans", "Escolha o plano ideal pra sua jornada": "Choose the right plan for your journey",
    // Texto do topo
    "Comece de graça e evolua pra um plano maior quando fizer sentido pra você. Sem contrato de fidelidade, cancele quando quiser.": "Start free and upgrade when it makes sense for you. No contract, cancel anytime.",
    // Cobrança
    "Mensal": "Monthly", "Anual": "Yearly", "Período de cobrança": "Billing period", "/mês": "/mo", "Mais escolhido": "Most popular", "Consulte": "Contact us",
    // Itens do Free
    "Treinos básicos da plataforma": "Basic platform workouts", "Acompanhamento simples de evolução": "Simple progress tracking", "Acesso à comunidade": "Community access", "Começar grátis": "Start free",
    // Itens do Premium
    "Acesso total à plataforma": "Full platform access", "Treinos montados para o seu objetivo": "Workouts built around your goal", "Relatórios avançados de evolução": "Advanced progress reports", "Suporte prioritário": "Priority support", "Assinar Premium": "Get Premium",
    // Itens do Profissional
    "Profissional": "Professional", "Ferramentas pra personal trainers": "Tools for personal trainers", "Gestão de alunos e planos de treino": "Client and workout plan management", "Relatórios de desempenho dos alunos": "Client performance reports", "Assinar Pro": "Get Pro",
    // Itens do Academia
    "Sistema completo de gestão": "Complete management system", "Múltiplos professores e alunos": "Multiple trainers and members", "Relatórios e suporte dedicado": "Reports and dedicated support", "Falar com consultor": "Talk to a consultant",
    // Plano atual
    "Seu plano atual": "Your current plan", "Seu plano": "Your plan",
    // Chamada
    "Pronto pra dar o primeiro passo?": "Ready to take the first step?", "Leva menos de um minuto pra criar sua conta.": "It takes less than a minute to sign up.", "Comparativo de planos": "Plan comparison", "Saúde Life - Planos": "Saúde Life - Plans",

    // ---------- Login, cadastro e senha ----------
    // Login
    "Continue exatamente de onde parou.": "Pick up right where you left off.", "Cada treino registrado, cada meta batida. Sua evolução está guardada aqui, esperando por você.": "Every workout logged, every goal hit. Your progress is saved here, waiting for you.",
    // Números do login
    "treinos registrados": "workouts logged", "profissionais verificados": "verified professionals", "avaliação média": "average rating",
    // Formulário
    "Que bom ter você de volta. Acesse sua conta.": "Great to have you back. Log in to your account.", "E-mail": "Email", "Senha": "Password", "Esqueci minha senha": "Forgot my password",
    // Social
    "ou continue com": "or continue with", "Entrar com o Google": "Log in with Google", "Entrar com a Apple": "Log in with Apple", "Criar conta com o Google": "Sign up with Google", "Criar conta com a Apple": "Sign up with Apple",
    // Rodapé do login
    "Não tem conta?": "No account?", "Só conhecendo?": "Just looking?", "Entrar na demonstração": "Try the demo", "Mostrar senha": "Show password", "Ocultar senha": "Hide password", "Saúde Life - Entrar": "Saúde Life - Log in", "seu@email.com": "you@email.com",
    // Mensagens do login
    "E-mail ou senha incorretos.": "Wrong email or password.", "Não encontramos uma conta com esse e-mail neste aparelho. Crie sua conta para começar.": "We couldn't find an account with this email on this device. Sign up to get started.",
    // Mensagens
    "Conta criada com sucesso! Faça login para continuar.": "Account created! Log in to continue.", "Login social disponível em breve. Use seu e-mail por enquanto.": "Social login coming soon. Use your email for now.",
    // Erros dos campos
    "Digite seu e-mail.": "Enter your email.", "Digite um e-mail válido.": "Enter a valid email.", "Digite sua senha.": "Enter your password.", "Digite seu nome completo.": "Enter your full name.", "As senhas não coincidem.": "Passwords don't match.",
    // Mais erros
    "A senha precisa ter no mínimo 8 caracteres.": "Password must be at least 8 characters.", "Você precisa aceitar os Termos de Uso para continuar.": "You need to accept the Terms of Use to continue.",
    // Lado do cadastro
    "Crie sua conta grátis em menos de um minuto e receba um plano que cabe na sua rotina.": "Create your free account in under a minute and get a plan that fits your routine.",
    // Itens do cadastro
    "Treinos guiados com séries, cargas e descanso": "Guided workouts with sets, loads and rest", "Gráficos da sua evolução semana a semana": "Weekly progress charts", "Profissionais com registro verificado": "Professionals with verified licenses", "Grátis para sempre no plano Free, sem cartão": "Free forever on the Free plan, no card",
    // Formulário do cadastro
    "Comece agora sua jornada com o Saúde Life.": "Start your Saúde Life journey now.", "Passo 1: sua conta": "Step 1: your account", "Passo 2: sobre você": "Step 2: about you", "Nome completo": "Full name", "Confirmar senha": "Confirm password",
    // Passo 2
    "Tudo opcional. Serve para o app calcular suas metas de água, calorias e proteína.": "All optional. It helps the app calculate your water, calorie and protein goals.", "Escolher foto de perfil": "Choose profile photo", "Trocar foto": "Change photo",
    // Campos do passo 2
    "Como quer ser chamado(a)?": "What should we call you?", "Nascimento": "Birth date", "Altura (cm)": "Height (cm)", "Peso (kg)": "Weight (kg)", "Li e aceito os": "I have read and accept the", "e a": "and the",
    // Botões
    "← Voltar": "← Back", "Continuar": "Continue", "Já tem conta?": "Already have an account?", "Seu nome completo": "Your full name", "Ex.: Biel": "E.g.: Biel", "Saúde Life - Criar conta": "Saúde Life - Sign up", "Criando conta...": "Creating account...", "Entrando...": "Logging in...",
    // Erros do passo 2
    "Altura entre 120 e 230 cm.": "Height between 120 and 230 cm.", "Peso entre 30 e 300 kg.": "Weight between 30 and 300 kg.", "Você precisa ter pelo menos 13 anos.": "You must be at least 13 years old.", "Já existe uma conta com esse e-mail. Entre ou use outro.": "An account with this email already exists. Log in or use another.",
    // Senha
    "Recuperar senha": "Recover password", "Digite seu e-mail para receber as instruções de redefinição.": "Enter your email to receive reset instructions.", "E-mail cadastrado": "Registered email", "Enviar instruções": "Send instructions",
    // Mais senha
    "Lembrou a senha?": "Remembered it?", "Voltar ao login": "Back to login", "Saúde Life - Recuperar Senha": "Saúde Life - Recover password", "Redefinir senha": "Reset password",
    // Redefinir
    "Escolha uma nova senha para acessar sua conta.": "Choose a new password for your account.", "Nova senha": "New password", "Confirmar nova senha": "Confirm new password", "Salvar nova senha": "Save new password",
    // Dicas dos campos
    "Mínimo de 8 caracteres": "At least 8 characters", "Repita a nova senha": "Repeat the new password", "Saúde Life - Redefinir Senha": "Saúde Life - Reset password",
    // Mensagens da senha
    "Se esse e-mail estiver cadastrado, você vai receber as instruções em instantes.": "If this email is registered, you'll receive the instructions shortly.", "Modo demonstração: abrir link de redefinição →": "Demo mode: open reset link →", "Senha alterada! Redirecionando para o login...": "Password changed! Redirecting to login...",
    // Link inválido
    "Este link de redefinição é inválido ou expirou. Solicite um novo.": "This reset link is invalid or has expired. Request a new one.",

    // ---------- Blog ----------
    // Topo
    "Dicas rápidas de quem entende": "Quick tips from the pros", "Treino, alimentação e hábitos em textos curtos, escritos pelos profissionais do Saúde Life.": "Training, nutrition and habits in short reads, written by Saúde Life professionals.",
    // Filtros
    "Todos": "All", "Treino": "Training", "Hábitos": "Habits", "Filtrar por assunto": "Filter by topic", "Artigos": "Articles", "Saúde Life - Blog de dicas": "Saúde Life - Tips blog",
    // Artigos
    "Quando (e quanto) subir a carga": "When (and how much) to add weight", "A regra das 2 repetições a mais e por que subir de 1 a 2 kg já é muito.": "The 2-extra-reps rule and why adding 1 to 2 kg is plenty.",
    // Artigo 2
    "Agachamento sem dor no joelho": "Squats without knee pain", "Três ajustes simples na posição que deixam o agachamento mais confortável.": "Three simple position tweaks that make squats more comfortable.",
    // Artigo 3
    "Marmita da semana em 1 hora": "A week of meal prep in 1 hour", "Um jeito simples de cozinhar no domingo e comer bem até sexta.": "A simple way to cook on Sunday and eat well until Friday.",
    // Artigo 4
    "Quanta proteína eu preciso?": "How much protein do I need?", "A conta por quilo de peso e como chegar lá sem depender de suplemento.": "The per-kilo math and how to get there without supplements.",
    // Artigo 5
    "Água: quanto beber e quando": "Water: how much and when", "A conta dos 35 ml por quilo e o truque da garrafa sempre por perto.": "The 35 ml per kilo rule and the bottle-in-sight trick.",
    // Artigo 6
    "Constância vence motivação": "Consistency beats motivation", "Por que treinar 3 vezes por semana todo mês rende mais do que 6 vezes por 2 semanas.": "Why training 3 times a week every month beats 6 times for 2 weeks.",
    // Leitura
    "← Todos os artigos": "← All articles", "Conteúdo educativo. Não substitui a orientação de um profissional de saúde.": "Educational content. It does not replace advice from a health professional.", "Colocar em prática no Saúde Life": "Put it into practice on Saúde Life",

    // ---------- Para academias ----------
    // Topo
    "Seus alunos treinando mais, e voltando sempre": "Your members training more, and coming back", "Quero uma demonstração": "I want a demo",
    // Texto do topo
    "Ranking da unidade, check-in por QR code, lotação em tempo real e aulas com fila de espera. Tudo no app que o aluno já usa para treinar.": "Gym leaderboard, QR check-in, live occupancy and classes with waitlists. All in the app your members already use to train.",
    // Benefícios
    "O que sua academia ganha": "What your gym gets", "Ranking da unidade": "Gym leaderboard", "Os alunos somam pontos treinando e disputam a semana. Competição saudável faz a pessoa voltar.": "Members earn points by training and compete every week. Healthy competition brings people back.",
    // Check-in
    "Check-in por QR code": "QR code check-in", "O aluno mostra o código do app na catraca. Você sabe quem veio e quem sumiu.": "Members show the app code at the turnstile. You know who came and who disappeared.",
    // Lotação
    "Lotação em tempo real": "Live occupancy", "O app mostra se a academia está cheia e sugere o melhor horário. Menos fila nos aparelhos.": "The app shows whether the gym is busy and suggests the best time. Fewer lines at the machines.",
    // Aulas
    "Aulas com fila de espera": "Classes with waitlists", "Grade de aulas, reserva de vaga e fila automática quando lota. Os alunos ainda avaliam cada aula.": "Class schedule, booking and an automatic waitlist when full. Members also rate each class.",
    // Avisos
    "Avisos para os alunos": "Announcements for members", "Feriado, aula nova ou manutenção: publique no painel e todo mundo vê no app.": "Holiday, new class or maintenance: post it on the dashboard and everyone sees it in the app.",
    // Painel
    "Painel do dono": "Owner dashboard", "Alunos ativos, check-ins da semana e horários de pico em uma tela só.": "Active members, weekly check-ins and peak hours on a single screen.",
    // Passos
    "Cadastro da unidade": "Gym setup", "A gente cria a sua academia no Saúde Life com horários e aulas.": "We set up your gym on Saúde Life with hours and classes.", "Alunos entram": "Members join",
    // Mais passos
    "Cada aluno escolhe a sua academia no app e já aparece no ranking da unidade.": "Each member picks your gym in the app and shows up on its leaderboard.", "Você acompanha": "You follow along", "Pelo painel do dono você vê os números e publica avisos.": "From the owner dashboard you see the numbers and post announcements.",
    // Simulador
    "Faça a conta": "Do the math", "Arraste para o número de alunos da sua academia. A estimativa usa uma melhora de 15% na frequência (exemplo ilustrativo).": "Drag to your gym's number of members. The estimate assumes a 15% attendance improvement (illustrative example).",
    // Resultado
    "Alunos ativos:": "Active members:", "Cerca de": "About", "treinos a mais por mês na sua unidade.": "extra workouts per month at your gym.",
    // Formulário
    "Fale com um consultor": "Talk to a consultant", "Plano Academia: preço por unidade, combinado com o consultor. Deixe seu contato.": "Gym plan: price per location, agreed with the consultant. Leave your contact.",
    // Campos
    "Seu nome": "Your name", "Nome da academia": "Gym name", "Cidade": "City", "Saúde Life - Para academias": "Saúde Life - For gyms", "Preencha nome, academia e e-mail.": "Fill in name, gym and email.", "Confira o e-mail.": "Check the email.",

    // ---------- 404 ----------
    // Textos
    "Página não encontrada": "Page not found", "O endereço pode ter mudado ou a página não existe mais. Que tal voltar pro começo?": "The address may have changed or the page no longer exists. How about going back to the start?",
    // Botões
    "Voltar ao início": "Back to home", "Abrir o app": "Open the app",

    // ---------- App: Início ----------
    // Saudações
    "Bom dia": "Good morning", "Boa tarde": "Good afternoon", "Boa noite": "Good evening", "Meus treinos": "My workouts",
    // Semana
    "Resumo da sua semana": "Your week at a glance", "Sequência": "Streak", "treinando sem parar": "training non-stop", "Treinos realizados": "Workouts done", "desde que você começou": "since you started",
    // Tempo
    "Tempo treinado": "Time trained", "somando todos os treinos": "across all workouts", "Pulso": "Pulso", "Recado do Pulso, seu parceiro de treino": "Message from Pulso, your workout buddy",
    // Frases do Pulso
    "Bora? Um treino de 20 minutos já conta muito.": "Let's go? A 20-minute workout already counts a lot.", "Pulso, seu parceiro de treino, feliz": "Pulso, your workout buddy, happy",
    // Momento do dia
    "Sugestão para agora": "Suggestion for now", "Bom dia! Começa com proteína": "Good morning! Start with protein", "Ovo, iogurte ou queijo no café ajudam a bater a meta de proteína.": "Eggs, yogurt or cheese at breakfast help you hit your protein goal.", "Registrar café": "Log breakfast",
    // Almoço
    "Hora do almoço": "Lunch time", "Metade do prato com salada e legumes. Registra e ganha 5 pontos.": "Half the plate with salad and veggies. Log it and earn 5 points.", "Registrar almoço": "Log lunch",
    // Tarde
    "Tarde de energia": "Afternoon energy", "Um lanche com carboidrato e um copo d'água antes do treino.": "A carb snack and a glass of water before training.", "Ver treinos": "See workouts",
    // Noite
    "Treino feito hoje!": "Workout done today!", "Agora é recuperar: janta com proteína e uma boa noite de sono.": "Now recover: a protein dinner and a good night's sleep.", "Ver evolução": "See progress",
    // Noite sem treino
    "Ainda dá tempo de treinar": "There's still time to train", "20 minutos já valem pontos e mantêm sua sequência.": "20 minutes already earn points and keep your streak.", "Começar treino": "Start workout",
    // Madrugada
    "Hora de descansar": "Time to rest", "Sono também é treino: 7 a 9 horas ajudam o músculo a crescer.": "Sleep is training too: 7 to 9 hours help muscles grow.", "Ver resumo": "See summary",
    // Passos
    "Passos de hoje": "Today's steps", "Simulado (sem pulseira conectada)": "Simulated (no band connected)", "Seus pontos da semana": "Your weekly points", "Ver ranking": "See leaderboard",
    // Treino sugerido
    "Próximo treino sugerido": "Suggested next workout", "Iniciar treino": "Start workout", "Desafio ativo": "Active challenge", "Desafio 30 Dias Abdominais": "30-Day Abs Challenge",
    // Desafio
    "Definição e resistência do core": "Core definition and endurance", "Participar do desafio": "Join the challenge", "Participando": "Joined", "Progresso do desafio": "Challenge progress",
    // Recomendados
    "Recomendados para você": "Recommended for you", "Ver todos": "See all", "Nota": "Rating", "Abrir": "Open", "Profissionais em destaque": "Featured professionals", "Ver perfil": "View profile", "Seguir": "Follow", "Seguindo": "Following",
    // Objetivos e níveis
    "Hipertrofia": "Muscle gain", "Resistência": "Endurance", "Yoga & Mobilidade": "Yoga & Mobility", "Iniciante": "Beginner", "Intermediário": "Intermediate", "Avançado": "Advanced",
    // Grupos
    "Corpo inteiro": "Full body", "Inferiores": "Lower body", "Superiores": "Upper body", "Core": "Core",
    // Avisos
    "Meta semanal em andamento": "Weekly goal in progress", "Meta semanal batida!": "Weekly goal reached!", "Fim de semana chegando": "Weekend's coming", "Você lidera o ranking": "You're leading the leaderboard", "Cutucar": "Nudge", "Cutucado ✓": "Nudged ✓",
    // Avisos de amigos
    "Manda um cutucão na Galera ou treina também para não ficar para trás.": "Nudge them in Crew or train too so you don't fall behind.",

    // ---------- App: Ranking ----------
    // Topo
    "Cada série vale pontos. A semana zera toda segunda e o mês fecha no dia 1º.": "Every set earns points. The week resets every Monday and the month closes on the 1st.", "pontos na semana": "points this week", "Sua liga": "Your league",
    // Filtros
    "Semana": "Week", "Mês": "Month", "Amigos": "Friends", "Minha academia": "My gym", "Classificação": "Standings", "Você": "You", "Você está aqui": "You are here",
    // Regras
    "Todo domingo: quem fez 500+ pontos na semana sobe, quem fez menos de 150 desce.": "Every Sunday: 500+ points in the week moves you up, under 150 moves you down.", "Período do ranking": "Leaderboard period", "Com quem comparar": "Compare with",
    // Selos
    "Selos": "Badges", "Pódio da semana": "Weekly podium", "Terminou uma semana entre os 3 primeiros dos amigos": "Finished a week in your friends' top 3", "Conquistado": "Earned", "Ainda não conquistado": "Not earned yet",
    // Mais selos
    "Campeão do mês": "Champion of the month", "Ficou em 1º lugar entre os amigos no mês": "Finished 1st among friends in the month", "Subiu de liga": "Moved up a league", "Fez 500 pontos numa semana e subiu": "Scored 500 points in a week and moved up",
    // Mais selos
    "Chegou à liga mais alta": "Reached the top league", "4 semanas seguidas": "4 weeks in a row", "Treinou 4 semanas sem parar": "Trained 4 weeks non-stop", "Rei da água": "Water king", "Bateu a meta de água em 7 dias": "Hit the water goal on 7 days",
    // Mais selos
    "Prato completo": "Full plate", "Registrou refeições em 7 dias": "Logged meals on 7 days", "Recorde pessoal": "Personal record", "Bateu a própria carga máxima": "Beat your own max load",
    // Como ganhar
    "Como ganhar pontos": "How to earn points", "Série feita": "Set done", "Refeição registrada": "Meal logged", "Meta de proteína": "Protein goal", "Meta de água": "Water goal", "Dia de sequência": "Streak day", "Aula reservada": "Class booked",
    // Regra
    "Limite de 300 pontos por dia. Refeições valem pontos até 4 por dia. Iniciantes ganham +20% nas 4 primeiras semanas.": "Limit of 300 points per day. Meals earn points up to 4 per day. Beginners get +20% in their first 4 weeks.",

    // ---------- App: Treinos ----------
    // Topo
    "Monte suas fichas e registre cada série durante o treino.": "Build your routines and log every set while you train.", "Montar automático": "Auto-build", "Novo treino": "New workout",
    // Cards
    "exercícios": "exercises", "séries": "sets", "Ontem": "Yesterday", "Hoje": "Today",

    // ---------- App: Perfil ----------
    // Números
    "treinos feitos": "workouts done", "semanas seguidas": "weeks in a row", "profissionais seguidos": "professionals followed", "Editar perfil": "Edit profile",
    // Objetivos
    "Meus objetivos": "My goals", "Alterar": "Change", "Objetivo": "Goal", "Nível": "Level", "Meta semanal": "Weekly goal",
    // Conquistas
    "Conquistas": "Achievements", "Primeiro treino": "First workout", "Registrou o primeiro treino": "Logged the first workout", "Conquistada": "Earned", "Ainda não conquistada": "Not earned yet",
    // Mais conquistas
    "10 treinos": "10 workouts", "Dez treinos concluídos": "Ten workouts completed", "25 treinos": "25 workouts", "Constância": "Consistency", "4 semanas seguidas treinando": "4 weeks of training in a row", "Desafiante": "Challenger", "Entrou em um desafio": "Joined a challenge",
    // Atividade e preferências
    "Atividade recente": "Recent activity", "Preferências": "Preferences", "Lembretes de treino": "Workout reminders", "Aviso nos dias combinados da sua meta": "Reminders on your goal days",
    // Mais preferências
    "Vibrar no fim do descanso": "Vibrate when rest ends", "No celular, durante o treino": "On your phone, during workouts", "Conta": "Account", "Plano": "Plan", "Restaurar dados de exemplo": "Reset sample data",
    // Demonstração
    "Modo demonstração": "Demo mode", "Para apresentar o TCC: enche o app de dados e avança o tempo para mostrar o ranking zerando e a liga mudando.": "For presenting the project: fills the app with data and moves time forward to show the leaderboard resetting and the league changing.",
    // Botões da demonstração
    "Hoje no app:": "Today in the app:", "Encher com dados de exemplo": "Fill with sample data", "Avançar 1 dia": "Skip 1 day", "Fechar a semana": "Close the week", "Voltar para hoje": "Back to today",
    // Editar perfil
    "Nome": "Name", "Apelido (aparece na saudação)": "Nickname (shown in greetings)", "Bio": "Bio", "Capa do perfil": "Profile cover", "Roupa do Pulso": "Pulso's outfit", "Selos em destaque (até 3)": "Featured badges (up to 3)",
    // Mais do editar perfil
    "Remover foto": "Remove photo", "Salvar alterações": "Save changes", "Perfil atualizado": "Profile updated", "Conquiste selos no Ranking para mostrar aqui.": "Earn badges on the Leaderboard to show them here.",

    // ---------- App: Começar ----------
    // Questionário
    "Vamos personalizar seu Saúde Life": "Let's personalize your Saúde Life", "Qual é o seu objetivo principal?": "What's your main goal?", "Ganhar massa muscular": "Build muscle",
    // Objetivos
    "Treinos de força com progressão de carga": "Strength training with progressive load", "Treinos intensos e curtos que queimam mais": "Short, intense workouts that burn more", "Melhorar o condicionamento": "Improve fitness",
    // Mais objetivos
    "Mais fôlego no dia a dia e nos esportes": "More stamina in daily life and sports", "Flexibilidade e bem-estar": "Flexibility and well-being", "Mobilidade, alongamento e menos dores": "Mobility, stretching and less pain",
    // Nível
    "Como está seu nível hoje?": "What's your level today?", "Estou começando ou voltando depois de um tempo": "I'm starting or coming back after a while", "Treino há alguns meses com regularidade": "I've trained regularly for a few months", "Treino há anos e conheço bem os exercícios": "I've trained for years and know the exercises well",
    // Dias
    "Quantos dias por semana você quer treinar?": "How many days a week do you want to train?", "Essa vai ser sua meta semanal. Dá para mudar depois no Perfil.": "This will be your weekly goal. You can change it later in Profile.",
    // Botões
    "Voltar": "Back", "Pular por enquanto": "Skip for now", "Começar a treinar": "Start training", "Progresso do questionário": "Questionnaire progress", "Personalize seu Saúde Life": "Personalize your Saúde Life",

    // ---------- Tour ----------
    // Passos do tour
    "Oi! Eu sou o Pulso": "Hi! I'm Pulso", "Vou ser seu parceiro de treino. Em 30 segundos te mostro como tudo funciona.": "I'll be your workout buddy. In 30 seconds I'll show you how it all works.",
    // Passo 2
    "Tudo vale ponto": "Everything earns points", "Cada série, treino, refeição e copo d'água soma pontos. Quanto mais constante, mais pontos.": "Every set, workout, meal and glass of water adds points. The more consistent, the more points.",
    // Passo 3
    "Seu treino de hoje": "Today's workout", "Seu próximo treino fica sempre aqui. Um toque e você começa.": "Your next workout always lives here. One tap and you're off.",
    // Passo 4
    "Ranking da semana": "Weekly leaderboard", "Toda segunda o placar zera. Suba de liga: Bronze, Prata, Ouro e Diamante.": "Every Monday the scoreboard resets. Climb leagues: Bronze, Silver, Gold and Diamond.",
    // Passo 5
    "Traga a galera": "Bring your crew", "Adicione amigos pelo código, crie desafios e mande um cutucão em quem sumiu.": "Add friends by code, create challenges and nudge whoever disappeared.",
    // Passo 6
    "Bora pro primeiro treino?": "Ready for your first workout?", "Eu fico aqui no Início com um recado por dia. Bom treino!": "I'll be here on Home with a message every day. Have a great workout!",
    // Botões do tour
    "Pular": "Skip", "Próximo": "Next",

    // ---------- Conta (segurança, backup, excluir) ----------
    // Login e senha
    "Lembrar de mim neste aparelho": "Remember me on this device", "Regras da senha": "Password rules", "Pelo menos 8 caracteres": "At least 8 characters", "Um número": "One number", "Uma letra maiúscula": "One uppercase letter", "Um símbolo (! @ # ...)": "One symbol (! @ # ...)",
    // Perfil: conta
    "Trocar e-mail ou senha": "Change email or password", "Baixar meus dados": "Download my data", "Restaurar backup": "Restore backup", "Excluir minha conta": "Delete my account", "Trocar e-mail": "Change email", "Trocar senha": "Change password",
    // Campos e mensagens
    "E-mail novo": "New email", "Sua senha atual": "Your current password", "Senha atual": "Current password", "Senha nova (mínimo 8 caracteres)": "New password (at least 8 characters)", "Salvar e-mail": "Save email", "Salvar senha": "Save password",
    // Avisos
    "E-mail trocado": "Email changed", "Senha trocada": "Password changed", "Backup baixado": "Backup downloaded", "Senha atual incorreta.": "Current password is wrong.", "Já existe uma conta com esse e-mail.": "An account with this email already exists.",
    // Excluir
    "Excluir sua conta?": "Delete your account?", "Excluir para sempre": "Delete forever", "Restaurar este backup?": "Restore this backup?", "Restaurar": "Restore", "Esse arquivo não é um backup do Saúde Life.": "This file is not a Saúde Life backup.",
    // Texto do excluir
    "Sua conta e todos os seus dados (treinos, pesos, fotos, refeições) serão apagados deste aparelho. Não dá para desfazer.": "Your account and all your data (workouts, weights, photos, meals) will be erased from this device. This can't be undone.",

    // ---------- Treino, exercícios, programas e corrida ----------
    // Menu e páginas novas
    "Exercícios": "Exercises", "Programas": "Programs", "Corrida": "Running", "Corrida e caminhada": "Running and walking",
    // Tela de treino
    "+ Drop set": "+ Drop set", "Bi-set com o próximo": "Superset with next", "Trocar exercício": "Swap exercise", "Drop": "Drop", "Calorias (estimativa)": "Calories (estimate)", "Duração": "Duration", "Volume total": "Total volume",
    // Fim do treino
    "Primeira vez com este treino: na próxima a gente compara.": "First time with this workout: next time we'll compare.", "Mesmo volume da última vez. Constância também é evolução.": "Same volume as last time. Consistency is progress too.",
    // Exercícios
    "Mais de 100 exercícios com passo a passo, dicas e o erro mais comum.": "Over 100 exercises with step-by-step drawings, tips and the most common mistake.", "Buscar exercício": "Search exercise", "Músculo": "Muscle", "Equipamento": "Equipment", "Lugar": "Place", "Só favoritos": "Favorites only", "Ver como fazer": "How to do it",
    // Lugares e equipamentos
    "Dá para fazer em casa": "Can be done at home", "Só na academia": "Gym only", "Em casa": "At home", "Casa ou academia": "Home or gym", "Halteres": "Dumbbells", "Barra": "Barbell", "Polia": "Cable", "Máquina": "Machine", "Peso do corpo": "Bodyweight", "Elástico": "Band", "Barra fixa": "Pull-up bar",
    // Grupos
    "Peito": "Chest", "Costas": "Back", "Pernas": "Legs", "Ombros": "Shoulders", "Braços": "Arms", "Cardio": "Cardio", "Mobilidade": "Mobility",
    // Passo a passo
    "1. Começo": "1. Start", "2. Meio": "2. Middle", "3. Fim": "3. End", "Cuidado:": "Watch out:", "Nenhum exercício encontrado": "No exercise found",
    // Programas
    "Planos de várias semanas com começo, meio e fim. E treinos prontos para fazer em casa.": "Multi-week plans with a beginning, middle and end. Plus ready-made home workouts.", "Programas de semanas": "Multi-week programs", "Treinos em casa": "Home workouts", "Só com o peso do corpo. Grátis, é só começar.": "Bodyweight only. Free, just start.",
    // Botões dos programas
    "Começar programa": "Start program", "Desbloquear com Premium": "Unlock with Premium", "Em andamento": "In progress", "Ver os treinos": "See workouts", "Parar programa": "Stop program", "Programas são Premium": "Programs are Premium", "Ver o Premium": "See Premium",
    // Corrida
    "Registre distância e tempo. O ritmo é calculado sozinho e cada corrida vale pontos.": "Log distance and time. Pace is calculated for you and every run earns points.", "Registrar": "Log", "Caminhada": "Walk", "Distância (km)": "Distance (km)", "Tempo (minutos)": "Time (minutes)", "Últimas": "Latest",
    // Corrida: números e plano
    "Km neste mês": "Km this month", "Saídas neste mês": "Sessions this month", "Melhor ritmo": "Best pace", "Do zero aos 5 km": "Couch to 5K", "Começar o plano": "Start the plan", "Nenhuma ainda. Bora para a primeira?": "None yet. Ready for the first one?",
    // Lembrete
    "Horário do lembrete": "Reminder time", "Hora do treino! Bora manter a sequência?": "Workout time! Keep your streak going?",

    // ---------- Alimentação e saúde ----------
    // Alimentação
    "Restrições": "Restrictions", "Repetir ontem": "Repeat yesterday", "Receitas": "Recipes", "Lista de compras da semana": "Weekly shopping list", "Usar este cardápio hoje": "Use this meal plan today", "Copiar lista": "Copy list",
    // Restrições
    "Restrições alimentares": "Dietary restrictions", "Vegetariano": "Vegetarian", "Vegano": "Vegan", "Sem lactose": "Lactose-free", "Sem glúten": "Gluten-free", "Alergia a amendoim": "Peanut allergy", "Alergia a frutos do mar": "Shellfish allergy", "Alergia a ovo": "Egg allergy", "Restrições salvas": "Restrictions saved",
    // Receitas e repetir
    "Ingredientes": "Ingredients", "Modo de fazer": "Directions", "Registrar 1 porção como refeição": "Log 1 serving as a meal", "Repetir refeições de ontem": "Repeat yesterday's meals", "Repetir": "Repeat", "Repetir todas": "Repeat all", "O que tem no prato? Toque para somar:": "What's on the plate? Tap to add:",
    // Saúde
    "Saúde": "Health", "Sono, humor, medidas do corpo e ciclo. Tudo fica só neste aparelho.": "Sleep, mood, body measurements and cycle. Everything stays on this device.", "Sono": "Sleep", "Como você está hoje?": "How are you today?", "IMC e gordura corporal": "BMI and body fat", "Medidas do corpo": "Body measurements",
    // Sono e humor
    "Dormi às": "Went to bed at", "Acordei às": "Woke up at", "Registrar noite": "Log night", "Noite registrada ✓": "Night logged ✓", "Com energia": "Energetic", "Normal": "Normal", "Cansado": "Tired", "Com dor muscular": "Sore",
    // Medidas e ciclo
    "Cintura": "Waist", "Quadril": "Hips", "Braço": "Arm", "Coxa": "Thigh", "Salvar medidas": "Save measurements", "Ciclo menstrual": "Menstrual cycle", "Acompanhar o ciclo": "Track cycle", "Menstruação": "Period", "Fase folicular": "Follicular phase", "Ovulação": "Ovulation", "Fase lútea": "Luteal phase",
    // Evolução
    "Relatório para o profissional": "Report for your professional", "Carga no exercício": "Load per exercise", "Volume por músculo nesta semana": "Volume per muscle this week", "6 meses": "6 months", "1 ano": "1 year", "Relatório dos últimos 30 dias": "Last 30 days report", "Copiar": "Copy", "Baixar arquivo": "Download file",

    // ---------- Competição e Pulso ----------
    // Ranking
    "Mesmo nível": "Same level", "Missões de hoje": "Today's missions", "3 missões novas por dia. Cada uma vale 15 pontos.": "3 new missions a day. Each one is worth 15 points.", "Duelos": "Duels", "Duelo": "Duel", "Começar duelo": "Start duel", "Empatado": "Tied", "Você está ganhando": "You're winning", "Você está perdendo": "You're losing", "Você venceu!": "You won!", "Você perdeu": "You lost",
    // Duelos e temporada
    "1 contra 1 por 7 dias: quem fizer mais pontos ganha. Desafie um amigo na Galera.": "1 vs 1 for 7 days: whoever scores more wins. Challenge a friend in Crew.", "Termine o mês no top 3 dos amigos para ganhar o selo exclusivo da temporada.": "Finish the month in your friends' top 3 to win the exclusive season badge.",
    // Ligas novas e selos
    "Esmeralda": "Emerald", "Lenda": "Legend", "Ainda não": "Not yet", "Completo!": "Complete!", "Bronze": "Bronze", "Prata": "Silver", "Ouro": "Gold",
    // Missões
    "Registre 3 refeições": "Log 3 meals", "Bata a meta de água": "Hit your water goal", "Faça 12 séries": "Do 12 sets", "Conclua um treino": "Finish a workout", "Registre como dormiu": "Log your sleep", "Bata a meta de proteína": "Hit your protein goal", "Conte como você está hoje (Saúde)": "Tell us how you feel today (Health)", "Faça uma corrida ou caminhada": "Go for a run or walk",
    // Loja
    "Loja do Pulso": "Pulso's Shop", "Troque suas moedas por roupas e acessórios. Gastar moedas não muda o seu ranking.": "Trade your coins for clothes and accessories. Spending coins doesn't change your ranking.", "Cada ponto que você ganha vira uma moeda.": "Every point you earn becomes a coin.", "Usar": "Wear", "Usando ✓": "Wearing ✓", "Só no Premium": "Premium only", "Chegue à liga Lenda": "Reach the Legend league",
    // Itens
    "Boné coral": "Coral cap", "Fone de ouvido": "Headphones", "Coroa da Lenda": "Legend crown", "Óculos escuros": "Sunglasses", "Tênis branco": "White sneakers", "Tênis neon": "Neon sneakers", "Tênis roxo": "Purple sneakers", "Cabeça": "Head", "Rosto": "Face", "Pés": "Feet",
    // Editar perfil
    "Seu parceiro de treino": "Your workout buddy", "Roupa": "Outfit", "Tom de pele": "Skin tone", "Cabelo": "Hair", "Castanho": "Brown", "Preto": "Black", "Loiro": "Blond", "Ruivo": "Red",

    // ---------- Comuns ----------
    // Botões e palavras soltas
    "Salvar": "Save", "Cancelar": "Cancel", "Confirmar": "Confirm", "Fechar": "Close", "Excluir": "Delete", "Editar": "Edit", "Sim": "Yes", "Não": "No",
    // ---------- Telas novas (comunidade, profissionais, academia, aulas, planos, ajuda e acessibilidade) ----------
    // Água
    "Água": "Water",
    // Série
    "Série": "Set",
    // Glossário
    "Glossário": "Glossary",
    // Confirmação simples na hora de assinar
    "Confirmação simples na hora de assinar": "Simple confirmation when you subscribe",
    // Área do profissional completa
    "Área do profissional completa": "Full professional area",
    // Montar e mandar treinos para alunos
    "Montar e mandar treinos para alunos": "Build and send workouts to clients",
    // Painel do dono com frequência e alunos sumidos
    "Painel do dono com frequência e alunos sumidos": "Owner dashboard with attendance and missing members",
    // Desafios e avisos para os alunos
    "Desafios e avisos para os alunos": "Challenges and notices for members",
    // 30 dias grátis
    "30 dias grátis": "30 days free",
    // Programas completos e treino automático
    "Programas completos e treino automático": "Full programs and automatic workouts",
    // Testar 30 dias grátis
    "Testar 30 dias grátis": "Try 30 days free",
    // Tudo do Premium
    "Tudo do Premium": "Everything in Premium",
    // Para estudantes com matrícula ativa
    "Para estudantes com matrícula ativa": "For enrolled students",
    // Família
    "Família": "Family",
    // Tudo do Premium para até 4 pessoas
    "Tudo do Premium para até 4 pessoas": "Everything in Premium for up to 4 people",
    // Cada um com sua conta e seus dados
    "Cada um com sua conta e seus dados": "Each person with their own account and data",
    // Ranking da família
    "Ranking da família": "Family leaderboard",
    // Assinar Família
    "Assinar Família": "Subscribe to Family",
    // Estudante
    "Estudante": "Student",
    // Assinar Estudante
    "Assinar Estudante": "Subscribe to Student",
    // Comunidade e ranking
    "Comunidade e ranking": "Community and leaderboard",
    // Pulso especial e desafios sem limite
    "Pulso especial e desafios sem limite": "Special Pulso and unlimited challenges",
    // Central de ajuda
    "Central de ajuda": "Help center",
    // Como podemos ajudar?
    "Como podemos ajudar?": "How can we help?",
    // Respostas rápidas sobre conta, treinos, pontos, planos e pri
    "Respostas rápidas sobre conta, treinos, pontos, planos e privacidade.": "Quick answers about your account, workouts, points, plans and privacy.",
    // Conta e acesso
    "Conta e acesso": "Account and access",
    // Pontos, ligas e ranking
    "Pontos, ligas e ranking": "Points, leagues and leaderboard",
    // Planos e pagamento
    "Planos e pagamento": "Plans and payment",
    // Privacidade e segurança
    "Privacidade e segurança": "Privacy and security",
    // Acessibilidade
    "Acessibilidade": "Accessibility",
    // Não achou a resposta?
    "Não achou a resposta?": "Didn't find the answer?",
    // Fale com a gente pelo e-mail
    "Fale com a gente pelo e-mail": "Email us at",
    // . Respondemos em até 2 dias úteis.
    ". Respondemos em até 2 dias úteis.": ". We reply within 2 business days.",
    // Como começo um treino?
    "Como começo um treino?": "How do I start a workout?",
    // O que é o treino automático?
    "O que é o treino automático?": "What is the automatic workout?",
    // Dá para treinar em casa?
    "Dá para treinar em casa?": "Can I train at home?",
    // Como adiciono o treino na minha agenda?
    "Como adiciono o treino na minha agenda?": "How do I add the workout to my calendar?",
    // Como subo de liga?
    "Como subo de liga?": "How do I move up a league?",
    // Como funciona o teste grátis?
    "Como funciona o teste grátis?": "How does the free trial work?",
    // Quais formas de pagamento?
    "Quais formas de pagamento?": "Which payment methods?",
    // Quem vê meu perfil?
    "Quem vê meu perfil?": "Who sees my profile?",
    // Você escolhe na Comunidade: público, só amigos ou privado.
    "Você escolhe na Comunidade: público, só amigos ou privado.": "You choose in Community: public, friends only or private.",
    // Como bloqueio ou denuncio alguém?
    "Como bloqueio ou denuncio alguém?": "How do I block or report someone?",
    // Meus dados de saúde são vendidos?
    "Meus dados de saúde são vendidos?": "Is my health data sold?",
    // Esqueci minha senha. E agora?
    "Esqueci minha senha. E agora?": "I forgot my password. Now what?",
    // Como troco meu e-mail ou senha?
    "Como troco meu e-mail ou senha?": "How do I change my email or password?",
    // Como excluo minha conta?
    "Como excluo minha conta?": "How do I delete my account?",
    // Meus dados ficam em outro celular?
    "Meus dados ficam em outro celular?": "Is my data on other phones?",
    // Como ganho pontos?
    "Como ganho pontos?": "How do I earn points?",
    // Quando o ranking zera?
    "Quando o ranking zera?": "When does the leaderboard reset?",
    // Gastar moedas na loja muda meu ranking?
    "Gastar moedas na loja muda meu ranking?": "Does spending coins change my ranking?",
    // Quanto custa o Premium?
    "Quanto custa o Premium?": "How much is Premium?",
    // Como aumento o tamanho das letras?
    "Como aumento o tamanho das letras?": "How do I make the text bigger?",
    // O app tem outros idiomas?
    "O app tem outros idiomas?": "Does the app have other languages?",
    // O que significa cada termo
    "O que significa cada termo": "What each term means",
    // Série, repetição, drop set, RM, macro... tudo explicado em u
    "Série, repetição, drop set, RM, macro... tudo explicado em uma frase.": "Set, rep, drop set, RM, macros... all explained in one sentence.",
    // Buscar termo...
    "Buscar termo...": "Search term...",
    // Calculadoras
    "Calculadoras": "Calculators",
    // Faça as contas em segundos
    "Faça as contas em segundos": "Do the math in seconds",
    // IMC, calorias do dia, água e carga máxima (1RM). Resultados 
    "IMC, calorias do dia, água e carga máxima (1RM). Resultados são estimativas: um profissional ajusta para você.": "BMI, daily calories, water and max load (1RM). Results are estimates: a professional fine-tunes them for you.",
    // Calorias do dia
    "Calorias do dia": "Daily calories",
    // Sexo
    "Sexo": "Sex",
    // Feminino
    "Feminino": "Female",
    // Masculino
    "Masculino": "Male",
    // Idade
    "Idade": "Age",
    // Atividade
    "Atividade": "Activity",
    // Parado (sem exercício)
    "Parado (sem exercício)": "Sedentary (no exercise)",
    // Leve (1 a 3 treinos por semana)
    "Leve (1 a 3 treinos por semana)": "Light (1 to 3 workouts a week)",
    // Moderada (3 a 5 treinos)
    "Moderada (3 a 5 treinos)": "Moderate (3 to 5 workouts)",
    // Alta (6 a 7 treinos)
    "Alta (6 a 7 treinos)": "High (6 to 7 workouts)",
    // Minutos de treino hoje
    "Minutos de treino hoje": "Workout minutes today",
    // Carga máxima (1RM)
    "Carga máxima (1RM)": "Max load (1RM)",
    // Carga usada (kg)
    "Carga usada (kg)": "Load used (kg)",
    // Repetições feitas
    "Repetições feitas": "Reps done",
    // Calcular
    "Calcular": "Calculate",
    // Estimativas educativas. Não substituem a avaliação de um pro
    "Estimativas educativas. Não substituem a avaliação de um profissional de saúde.": "Educational estimates. They don't replace an assessment by a health professional.",
    // IMC
    "IMC": "BMI",
    // Dica do dia:
    "Dica do dia:": "Tip of the day:",
    // Glossário de termos
    "Glossário de termos": "Glossary",
    // Calculadoras (IMC, calorias, água, 1RM)
    "Calculadoras (IMC, calorias, água, 1RM)": "Calculators (BMI, calories, water, 1RM)",
    // Buscar: proteína, sono, agachamento...
    "Buscar: proteína, sono, agachamento...": "Search: protein, sleep, squat...",
    // Compartilhar
    "Compartilhar": "Share",
    // Não precisa ser perfeito, precisa ser feito.
    "Não precisa ser perfeito, precisa ser feito.": "It doesn't have to be perfect, it has to be done.",
    // • escudo da semana já usado
    "• escudo da semana já usado": "• weekly shield already used",
    // Subida garantida nesta semana!
    "Subida garantida nesta semana!": "Promotion locked in this week!",
    // Para começar com o pé direito
    "Para começar com o pé direito": "To start on the right foot",
    // Dá pra fazer em casa
    "Dá pra fazer em casa": "You can do it at home",
    // Procurar com filtros
    "Procurar com filtros": "Search with filters",
    // Até 20 min
    "Até 20 min": "Up to 20 min",
    // Mais de 40 min
    "Mais de 40 min": "Over 40 min",
    // Série a série
    "Série a série": "Set by set",
    // Proteína em dia
    "Proteína em dia": "Protein on track",
    // Pódio
    "Pódio": "Podium",
    // Bom de cama
    "Bom de cama": "Sleep champ",
    // Fim de semana ativo
    "Fim de semana ativo": "Active weekend",
    // Missão dada
    "Missão dada": "Mission accomplished",
    // Missão do dia
    "Missão do dia": "Daily mission",
    // Reserve sua vaga nas aulas coletivas da academia, sem fila.
    "Reserve sua vaga nas aulas coletivas da academia, sem fila.": "Book your spot in group classes, no waiting line.",
    // Grade da semana
    "Grade da semana": "Weekly schedule",
    // Entrar na lista de espera
    "Entrar na lista de espera": "Join the waitlist",
    // Sair da fila
    "Sair da fila": "Leave the waitlist",
    // Também online
    "Também online": "Also online",
    // Turma lotada
    "Turma lotada": "Class full",
    // Reservar vaga (+30 pts)
    "Reservar vaga (+30 pts)": "Book a spot (+30 pts)",
    // Cancelar reserva
    "Cancelar reserva": "Cancel booking",
    // Avaliar aula
    "Avaliar aula": "Rate class",
    // Adicionar à agenda
    "Adicionar à agenda": "Add to calendar",
    // Entrar na aula online
    "Entrar na aula online": "Join online class",
    // O link da aula online libera 15 min antes
    "O link da aula online libera 15 min antes": "The online class link opens 15 min before",
    // Você pode cancelar até 2h antes. Avisamos 1h antes.
    "Você pode cancelar até 2h antes. Avisamos 1h antes.": "You can cancel up to 2h before. We'll remind you 1h before.",
    // Não dá mais para cancelar (menos de 2h para a aula)
    "Não dá mais para cancelar (menos de 2h para a aula)": "Can't cancel anymore (less than 2h to class)",
    // Área funcional
    "Área funcional": "Functional area",
    // Estúdio 1
    "Estúdio 1": "Studio 1",
    // Estúdio 2
    "Estúdio 2": "Studio 2",
    // Sala bike
    "Sala bike": "Bike room",
    // metas calculadas para você
    "metas calculadas para você": "goals calculated for you",
    // Adicionar refeição
    "Adicionar refeição": "Add meal",
    // Metas do dia
    "Metas do dia": "Daily goals",
    // Proteínas
    "Proteínas": "Protein",
    // Refeições de hoje
    "Refeições de hoje": "Today's meals",
    // Café da manhã
    "Café da manhã": "Breakfast",
    // Almoço
    "Almoço": "Lunch",
    // Jantar
    "Jantar": "Dinner",
    // Lanche
    "Lanche": "Snack",
    // Lanche pré-treino
    "Lanche pré-treino": "Pre-workout snack",
    // Me lembrar de beber água a cada 2 horas
    "Me lembrar de beber água a cada 2 horas": "Remind me to drink water every 2 hours",
    // Cardápio sugerido para o seu objetivo
    "Cardápio sugerido para o seu objetivo": "Suggested menu for your goal",
    // Mais 15 pontos
    "Mais 15 pontos": "15 more points",
    // Seu progresso semana a semana.
    "Seu progresso semana a semana.": "Your progress week by week.",
    // Resumo da semana
    "Resumo da semana": "Week summary",
    // Resumo do mês
    "Resumo do mês": "Month summary",
    // Resumo do período
    "Resumo do período": "Period summary",
    // Treinos no período
    "Treinos no período": "Workouts in the period",
    // soma de carga × repetições
    "soma de carga × repetições": "sum of load × reps",
    // Últimas 8 semanas
    "Últimas 8 semanas": "Last 8 weeks",
    // Treinos por semana
    "Treinos por semana": "Workouts per week",
    // Histórico de treinos
    "Histórico de treinos": "Workout history",
    // Peso alvo, carga alvo e até quando: o app mostra quanto falt
    "Peso alvo, carga alvo e até quando: o app mostra quanto falta.": "Target weight, target load and deadline: the app shows how far you are.",
    // Músculos mais treinados
    "Músculos mais treinados": "Most trained muscles",
    // Últimos 30 dias. Quanto mais forte a cor, mais séries.
    "Últimos 30 dias. Quanto mais forte a cor, mais séries.": "Last 30 days. The stronger the color, the more sets.",
    // Seu ano de treinos
    "Seu ano de treinos": "Your year of training",
    // Só quem atende online
    "Só quem atende online": "Online only",
    // Qualquer preço
    "Qualquer preço": "Any price",
    // Até R$ 150
    "Até R$ 150": "Up to R$ 150",
    // Até R$ 300
    "Até R$ 300": "Up to R$ 300",
    // Menor preço
    "Menor preço": "Lowest price",
    // Melhor nota
    "Melhor nota": "Top rated",
    // Todas as cidades
    "Todas as cidades": "All cities",
    // Toque numa cidade para filtrar. No perfil de cada profission
    "Toque numa cidade para filtrar. No perfil de cada profissional tem o link do Google Maps.": "Tap a city to filter. Each professional's profile has a Google Maps link.",
    // Ver no Google Maps
    "Ver no Google Maps": "View on Google Maps",
    // Para agendar, combine dia e horário direto no chat.
    "Para agendar, combine dia e horário direto no chat.": "To book, agree on the day and time in the chat.",
    // Chamar no chat
    "Chamar no chat": "Message in chat",
    // Quem acompanha você
    "Quem acompanha você": "Who supports you",
    // Conversar
    "Conversar": "Chat",
    // Os treinos que você marcou para fazer depois.
    "Os treinos que você marcou para fazer depois.": "Workouts you saved for later.",
    // Toque no marcador de um treino para guardar e encontrar depo
    "Toque no marcador de um treino para guardar e encontrar depois.": "Tap a workout's bookmark to save it for later.",
    // Movimento, horários de pico e avisos da sua unidade.
    "Movimento, horários de pico e avisos da sua unidade.": "Traffic, peak hours and notices from your gym.",
    // Lotação agora
    "Lotação agora": "Crowd now",
    // Melhor horário hoje:
    "Melhor horário hoje:": "Best time today:",
    // Mostre na catraca (simulado no TCC). O código muda todo dia.
    "Mostre na catraca (simulado no TCC). O código muda todo dia.": "Show it at the turnstile (simulated). The code changes every day.",
    // Fazer check-in
    "Fazer check-in": "Check in",
    // Quantos estão livres neste momento (estimativa pela lotação)
    "Quantos estão livres neste momento (estimativa pela lotação).": "How many are free right now (estimated from the crowd).",
    // Em manutenção
    "Em manutenção": "Under maintenance",
    // Sou aluno
    "Sou aluno": "I'm a member",
    // Sou dono
    "Sou dono": "I'm the owner",
    // Ocupação por horário
    "Ocupação por horário": "Occupancy by hour",
    // Publicar aviso
    "Publicar aviso": "Post notice",
    // Publicar
    "Publicar": "Post",
    // Avisos recentes
    "Avisos recentes": "Recent notices",
    // Sem check-in há mais de 7 dias. Um recado pode trazer de vol
    "Sem check-in há mais de 7 dias. Um recado pode trazer de volta.": "No check-in for over 7 days. A note might bring them back.",
    // Aparece para todos os alunos na Comunidade, aba Desafios.
    "Aparece para todos os alunos na Comunidade, aba Desafios.": "Shows for all members in Community, Challenges tab.",
    // Criar desafio
    "Criar desafio": "Create challenge",
    // Frequência (14 dias)
    "Frequência (14 dias)": "Attendance (14 days)",
    // Avisos que você quer receber
    "Avisos que você quer receber": "Notifications you want",
    // Lembrete do horário e saudade do Pulso
    "Lembrete do horário e saudade do Pulso": "Workout time reminder and Pulso missing you",
    // A cada 2 horas, se ainda não bateu a meta
    "A cada 2 horas, se ainda não bateu a meta": "Every 2 hours, if you haven't hit the goal",
    // 1 hora antes das aulas reservadas
    "1 hora antes das aulas reservadas": "1 hour before booked classes",
    // Quando você sobe de liga
    "Quando você sobe de liga": "When you move up a league",
    // Horário de silêncio
    "Horário de silêncio": "Quiet hours",
    // Não me avisar à noite
    "Não me avisar à noite": "Don't notify me at night",
    // Nenhum aviso nesse intervalo
    "Nenhum aviso nesse intervalo": "No notifications during this time",
    // Das
    "Das": "From",
    // às
    "às": "to",
    // Pular para o exercício
    "Pular para o exercício": "Jump to exercise",
    // Próximo exercício
    "Próximo exercício": "Next exercise",
    // Música para treinar
    "Música para treinar": "Workout music",
    // Abre no app de música do seu celular.
    "Abre no app de música do seu celular.": "Opens in your phone's music app.",
    // Treino pesado
    "Treino pesado": "Heavy lifting",
    // Corrida e HIIT
    "Corrida e HIIT": "Running and HIIT",
    // Funk e pop para treinar
    "Funk e pop para treinar": "Funk and pop for training",
    // Yoga e alongamento
    "Yoga e alongamento": "Yoga and stretching",
    // Veja quem treinou, mande um "bora!" e crie desafios com a ga
    "Veja quem treinou, mande um \"bora!\" e crie desafios com a galera.": "See who trained, send a \"let's go!\" and create challenges with your crew.",
    // Seu código de amigo
    "Seu código de amigo": "Your friend code",
    // Quem vê seu perfil
    "Quem vê seu perfil": "Who sees your profile",
    // Público: todo mundo vê
    "Público: todo mundo vê": "Public: everyone",
    // Só amigos veem
    "Só amigos veem": "Friends only",
    // Privado: só você vê
    "Privado: só você vê": "Private: only you",
    // Copiar código
    "Copiar código": "Copy code",
    // Comentário
    "Comentário": "Comment",
    // Copiar treino
    "Copiar treino": "Copy workout",
    // Comente algo de boa…
    "Comente algo de boa…": "Leave a kind comment…",
    // Enviar
    "Enviar": "Send",
    // Desafios
    "Desafios": "Challenges",
    // Feed
    "Feed": "Feed",
    // Procurar
    "Procurar": "Search",
    // Participar
    "Participar": "Join",
    // Sair do desafio
    "Sair do desafio": "Leave challenge",
    // Chat do grupo
    "Chat do grupo": "Group chat",
    // Sair do grupo
    "Sair do grupo": "Leave group",
    // Esconder este post
    "Esconder este post": "Hide this post",
    // Denunciar
    "Denunciar": "Report",
    // Enviar denúncia
    "Enviar denúncia": "Send report",
    // Qual o problema?
    "Qual o problema?": "What's the problem?",
    // Mandar mensagem
    "Mandar mensagem": "Send message",
    // Adicionar amigo
    "Adicionar amigo": "Add friend",
    // Últimos treinos
    "Últimos treinos": "Latest workouts",
    // Começar o mesmo treino
    "Começar o mesmo treino": "Start the same workout",
    // Mandar força
    "Mandar força": "Send support",
    // Bloqueados
    "Bloqueados": "Blocked",
    // Desbloquear
    "Desbloquear": "Unblock",
    // Mande um parabéns
    "Mande um parabéns": "Send congrats",
    // Relógio inteligente
    "Relógio inteligente": "Smartwatch",
    // média das últimas noites
    "média das últimas noites": "average of recent nights",
    // Conta pra gente: o Pulso ajusta a dica do dia.
    "Conta pra gente: o Pulso ajusta a dica do dia.": "Tell us: Pulso adjusts the daily tip.",
    // Últimos 7 dias: nada ainda
    "Últimos 7 dias: nada ainda": "Last 7 days: nothing yet",
    // Sexo biológico (para a conta)
    "Sexo biológico (para a conta)": "Biological sex (for the calculation)",
    // Meça a cada 2 semanas para ver o gráfico da cintura.
    "Meça a cada 2 semanas para ver o gráfico da cintura.": "Measure every 2 weeks to see the waist chart.",
    // Braço (cm)
    "Braço (cm)": "Arm (cm)",
    // Cintura (cm)
    "Cintura (cm)": "Waist (cm)",
    // Quadril (cm)
    "Quadril (cm)": "Hips (cm)",
    // Coxa (cm)
    "Coxa (cm)": "Thigh (cm)",
    // O app ajusta as dicas de treino para cada fase. Só você vê.
    "O app ajusta as dicas de treino para cada fase. Só você vê.": "The app adjusts workout tips for each phase. Only you see it.",
    // Usar o sono do relógio
    "Usar o sono do relógio": "Use sleep from watch",
    // Desconectar
    "Desconectar": "Disconnect",
    // passos hoje
    "passos hoje": "steps today",
    // em repouso
    "em repouso": "at rest",
    // de sono ontem
    "de sono ontem": "of sleep last night",
    // Para personal trainers e nutricionistas
    "Para personal trainers e nutricionistas": "For personal trainers and nutritionists",
    // Acompanhe seus alunos, monte treinos e mande direto para o a
    "Acompanhe seus alunos, monte treinos e mande direto para o app deles.": "Follow your clients, build workouts and send them straight to their app.",
    // Avaliações
    "Avaliações": "Reviews",
    // Alunos ativos
    "Alunos ativos": "Active clients",
    // acompanhando pelo app
    "acompanhando pelo app": "following through the app",
    // no total
    "no total": "in total",
    // nota média 4,9 de 5
    "nota média 4,9 de 5": "average rating 4.9 of 5",
    // Nenhum treino enviado ainda. Toque em "Montar treino".
    "Nenhum treino enviado ainda. Toque em \"Montar treino\".": "No workouts sent yet. Tap \"Build workout\".",
    // Mandar para o aluno
    "Mandar para o aluno": "Send to client",
    // Para quem
    "Para quem": "For whom",
    // Nome do treino
    "Nome do treino": "Workout name",
    // Grupo
    "Grupo": "Group",
    // Exercício
    "Exercício": "Exercise",
    // Adicionar
    "Adicionar": "Add",
    // Tirar
    "Tirar": "Remove",
    // Recado para o aluno (opcional)
    "Recado para o aluno (opcional)": "Note to the client (optional)",
    // Começar teste grátis
    "Começar teste grátis": "Start free trial",
    // ou assine agora
    "ou assine agora": "or subscribe now",
    // Cartão de crédito
    "Cartão de crédito": "Credit card",
    // Já paguei
    "Já paguei": "I've paid",
    // Número do cartão
    "Número do cartão": "Card number",
    // Nome impresso no cartão
    "Nome impresso no cartão": "Name on card",
    // Validade
    "Validade": "Expiry",
    // Pagar
    "Pagar": "Pay",
    // Processando…
    "Processando…": "Processing…",
    // Conferindo pagamento…
    "Conferindo pagamento…": "Checking payment…",
    // Ambiente de demonstração: nenhum valor é cobrado. Os dados d
    "Ambiente de demonstração: nenhum valor é cobrado. Os dados do cartão não são guardados.": "Demo environment: nothing is charged. Card details are not stored.",
    // Anual -20%
    "Anual -20%": "Yearly -20%",
    // Tamanho do texto
    "Tamanho do texto": "Text size",
    // Alto contraste
    "Alto contraste": "High contrast",
    // Cores para daltônicos
    "Cores para daltônicos": "Color-blind friendly colors",
    // Modo simples (letras e botões maiores)
    "Modo simples (letras e botões maiores)": "Simple mode (bigger text and buttons)",
    // Tradutor em Libras (VLibras)
    "Tradutor em Libras (VLibras)": "Brazilian Sign Language (VLibras)",
    // Ler a página em voz alta
    "Ler a página em voz alta": "Read page aloud",
    // Parar leitura
    "Parar leitura": "Stop reading",
    // Instale o Saúde Life
    "Instale o Saúde Life": "Install Saúde Life",
    // Instalar app
    "Instalar app": "Install app",
    // Agora não
    "Agora não": "Not now",
    // Abre mais rápido e funciona sem internet.
    "Abre mais rápido e funciona sem internet.": "Opens faster and works offline.",
    // Ajuda
    "Ajuda": "Help",
    // ---------- Telas novas (comunidade, profissionais, academia, aulas, planos, ajuda e acessibilidade) ----------
    // bateu a própria marca
    "bateu a própria marca": "beat their own record",
    // Seu treino de 30 min ficaria assim:
    "Seu treino de 30 min ficaria assim:": "Your 30-min workout would look like this:",
    // Nesta página
    "Nesta página": "On this page",
    // Na prática
    "Na prática": "In practice",
    // Terça
    "Terça": "Tuesday",
    // Sábado
    "Sábado": "Saturday",
    // Segunda
    "Segunda": "Monday",
    // Quarta
    "Quarta": "Wednesday",
    // Quinta
    "Quinta": "Thursday",
    // Sexta
    "Sexta": "Friday",
    // Domingo
    "Domingo": "Sunday",
    // Saúde Life Centro
    "Saúde Life Centro": "Saúde Life Downtown",
    // Manutenção da esteira 3
    "Manutenção da esteira 3": "Treadmill 3 maintenance",
    // Previsão de retorno: sexta-feira
    "Previsão de retorno: sexta-feira": "Expected back: Friday",
    // Nova turma de Pilates
    "Nova turma de Pilates": "New Pilates class",
    // Terças e quintas, às 19h
    "Terças e quintas, às 19h": "Tuesdays and Thursdays, 7 pm",
    // Foco em hipertrofia e consistência diária.
    "Foco em hipertrofia e consistência diária.": "Focus on hypertrophy and daily consistency.",
    // Desbloqueie com o Premium para seguir as 8 semanas.
    "Desbloqueie com o Premium para seguir as 8 semanas.": "Unlock with Premium to follow all 8 weeks.",
    // Calculadas para
    "Calculadas para": "Calculated for",
    // ---------- Telas novas (comunidade, profissionais, academia, aulas, planos, ajuda e acessibilidade) ----------
    // Seg e Qua
    "Seg e Qua": "Mon and Wed",
    // Ter e Qui
    "Ter e Qui": "Tue and Thu",
    // Seg a Sex
    "Seg a Sex": "Mon to Fri",
    // Qua e Sex
    "Qua e Sex": "Wed and Fri",
    // Treinos para iniciantes
    "Treinos para iniciantes": "Beginner workouts",
    // Sem aparelho de academia
    "Sem aparelho de academia": "No gym equipment",
    // Os mais bem avaliados
    "Os mais bem avaliados": "Top rated",
    // Até 20 minutos
    "Até 20 minutos": "Up to 20 minutes",
    // • conclua um treino, faça 12 séries
    "• conclua um treino, faça 12 séries": "• finish a workout, do 12 sets",
  };

  // Dias da semana e meses (para datas por extenso)
  const PALAVRAS = {
    // Dias
    "segunda-feira": "Monday", "terça-feira": "Tuesday", "quarta-feira": "Wednesday", "quinta-feira": "Thursday", "sexta-feira": "Friday", "sábado": "Saturday", "domingo": "Sunday",
    // Meses
    janeiro: "January", fevereiro: "February", "março": "March", abril: "April", maio: "May", junho: "June", julho: "July", agosto: "August", setembro: "September", outubro: "October", novembro: "November", dezembro: "December",
  };

  // Frases que mudam (com números): [regra, como fica em inglês]
  const REGRAS = [
    // "Passo 1 de 2 · Sua conta"
    [/^Passo (\d+) de (\d+)(?: · (.+))?$/, (m, a, b, c) => `Step ${a} of ${b}${c ? " · " + traduzir(c) : ""}`],
    // "Faltam 230 pontos para subir de liga"
    [/^Faltam (\d+) pontos para (subir de liga|garantir o Diamante)$/, (m, n, o) => `${n} points to ${o === "subir de liga" ? "move up a league" : "secure Diamond"}`],
    // "Faltam 230 pontos para subir para Diamante."
    [/^Faltam (\d+) pontos para subir para (.+)\.$/, (m, n, l) => `${n} points to move up to ${traduzir(l)}.`],
    // "Faltam 150 pontos para não cair de liga."
    [/^Faltam (\d+) pontos para não cair de liga\.$/, (m, n) => `${n} points to avoid dropping a league.`],
    // "zera em 5 dias"
    [/^zera em (\d+) dias?$/, (m, n) => `resets in ${n} day${n === "1" ? "" : "s"}`],
    // "Semana zera em 5 dias"
    [/^Semana zera em (\d+) dias?$/, (m, n) => `Week resets in ${n} day${n === "1" ? "" : "s"}`],
    // "Você está em 1º de 8 entre os amigos"
    [/^Você está em (\d+)º de (\d+) entre os amigos$/, (m, a, b) => `You're #${a} of ${b} among friends`],
    // "1º de 8 entre os amigos"
    [/^(\d+)º de (\d+) entre os amigos$/, (m, a, b) => `#${a} of ${b} among friends`],
    // "2º lugar"
    [/^(\d+)º lugar$/, (m, a) => `#${a}`],
    // "Hoje: 0 de 300"
    [/^Hoje: (\d+) de (\d+)$/, (m, a, b) => `Today: ${a} of ${b}`],
    // "Liga Ouro"
    [/^Liga (.+)$/, (m, l) => `${traduzir(l)} League`],
    // "Liga Lenda" / "Missões de hoje: 1 de 3"
    [/^Missões de hoje: (\d+) de (\d+)$/, (m, a, b) => `Today's missions: ${a} of ${b}`],
    // "8 dias seguidos"
    [/^(\d+) dias? seguidos?$/, (m, n) => `${n} day${n === "1" ? "" : "s"} in a row`],
    // "Comprar por 300"
    [/^Comprar por (.+)$/, (m, n) => `Buy for ${n}`],
    // "Faltam 300" (loja)
    [/^Faltam (\d[\d.]*)$/, (m, n) => `${n} short`],
    // "Você x Ana"
    [/^Você x (.+)$/, (m, q) => `You vs ${q}`],
    // "1 de 4"
    [/^(\d+) de (\d+)$/, (m, a, b) => `${a} of ${b}`],
    // "Dia 6"
    [/^Dia (\d+)$/, (m, a) => `Day ${a}`],
    // "Há 3 dias"
    [/^Há (\d+) dias?$/, (m, n) => `${n} day${n === "1" ? "" : "s"} ago`],
    // "Há 1 semana"
    [/^Há (\d+) semanas?$/, (m, n) => `${n} week${n === "1" ? "" : "s"} ago`],
    // "12 semanas"
    [/^(\d+) semanas$/, (m, n) => `${n} weeks`],
    // "6 exercícios"
    [/^(\d+) exercícios$/, (m, n) => `${n} exercises`],
    // "450 participantes"
    [/^(\d+) participantes$/, (m, n) => `${n} participants`],
    // "1.2k seguidores"
    [/^(.+) seguidores$/, (m, n) => `${n} followers`],
    // "3 min de leitura"
    [/^(\d+) min de leitura$/, (m, n) => `${n} min read`],
    // "passos hoje • meta 8.000"
    [/^passos hoje$/, () => "steps today"],
    // "meta 8.000"
    [/^meta (.+)$/, (m, n) => `goal ${n}`],
    // "Último: Ontem"
    [/^Último: (.+)$/, (m, q) => `Last: ${traduzir(q)}`],
    // "Última vez: Há 5 dias"
    [/^Última vez: (.+)$/, (m, q) => `Last time: ${traduzir(q)}`],
    // "Começa com: Puxada frontal"
    [/^Começa com: (.+)$/, (m, q) => `Starts with: ${q}`],
    // "Salvar Pernas Pesadas"
    [/^Salvar (.+)$/, (m, q) => `Save ${q}`],
    // "Ver exercícios de X"
    [/^Ver exercícios de (.+)$/, (m, q) => `See exercises of ${q}`],
    // "Editar treino X"
    [/^Editar treino (.+)$/, (m, q) => `Edit workout ${q}`],
    // "Excluir treino X"
    [/^Excluir treino (.+)$/, (m, q) => `Delete workout ${q}`],
    // "Registro CRN-3 48213 conferido"
    [/^Registro (.+) conferido$/, (m, q) => `License ${q} verified`],
    // "São Paulo • atende online"
    [/^atende online$/, () => "online sessions"],
    // "Faltam 3 treinos para bater sua meta da semana."
    [/^Faltam? (\d+) treinos? para bater sua meta da semana\.$/, (m, n) => `${n} workout${n === "1" ? "" : "s"} left to hit your weekly goal.`],
    // "Faltam 3 treinos para completar 4/4."
    [/^Faltam? (\d+) treinos? para completar (.+)\.$/, (m, n, q) => `${n} workout${n === "1" ? "" : "s"} left to complete ${q}.`],
    // "Ranking: você está em 2º"
    [/^Ranking: você está em (\d+)º$/, (m, n) => `Leaderboard: you're #${n}`],
    // "Rafael está 40 pontos na sua frente. Bora passar?"
    [/^(.+) está (\d+) pontos na sua frente\. Bora passar\?$/, (m, q, n) => `${q} is ${n} points ahead of you. Let's pass them?`],
    // "Rafael está 85 pontos atrás. Não deixa chegar!"
    [/^(.+) está (\d+) pontos atrás\. Não deixa chegar!$/, (m, q, n) => `${q} is ${n} points behind. Don't let them catch up!`],
    // "Camila treinou hoje"
    [/^(.+) treinou hoje$/, (m, q) => `${q} trained today`],
    // "4 treinos por semana"
    [/^(\d+) treinos por semana$/, (m, n) => `${n} workouts per week`],
    // "25 de 25 treinos"
    [/^(\d+) de (\d+) treinos$/, (m, a, b) => `${a} of ${b} workouts`],
    // "1 de 4 nesta semana"
    [/^(\d+) de (\d+) nesta semana$/, (m, a, b) => `${a} of ${b} this week`],
    // "Seu treino de 30 min ficaria assim:"
    [/^Seu treino de (\d+) min ficaria assim:$/, (m, n) => `Your ${n}-min workout would look like this:`],
    // "Boa! Faltam 2 séries."
    [/^Boa! Faltam (\d+) séries?\.$/, (m, n) => `Nice! ${n} set${n === "1" ? "" : "s"} to go.`],
    // "Demonstração: +5 dias"
    [/^Demonstração: \+(\d+) dias?$/, (m, n) => `Demo: +${n} day${n === "1" ? "" : "s"}`],
    // "Você subiu para a liga Ouro!"
    [/^Você subiu para a liga (.+)!$/, (m, l) => `You moved up to the ${traduzir(l)} league!`],
    // "Página — Saúde Life" (títulos das abas do app)
    [/^(.+) — Saúde Life$/, (m, q) => `${traduzir(q)} — Saúde Life`],
    // "Saúde Life — Início"
    [/^Saúde Life — (.+)$/, (m, q) => `Saúde Life — ${traduzir(q)}`],
    // Datas por extenso: "quarta-feira, 21 de outubro"
    [/^([A-Za-zçá-]+-feira|sábado|domingo|Segunda-feira|Terça-feira|Quarta-feira|Quinta-feira|Sexta-feira|Sábado|Domingo), (\d+) de ([a-zç]+)$/i, (m, d, n, mes) => `${PALAVRAS[d.toLowerCase()] || d}, ${PALAVRAS[mes] || mes} ${n}`],
    // ---------- Regras das telas novas ----------
    // "4 de 20 vagas disponíveis"
    [/^(\d+) de (\d+) vagas disponíveis$/, (m, a, b) => `${a} of ${b} spots left`],
    // "Próxima: segunda-feira às 07:00"
    [/^Próxima: (.+) às (\d\d:\d\d)$/, (m, d, h) => `Next: ${PALAVRAS[d] || d} at ${h}`],
    // "Próxima: acontecendo agora"
    [/^Próxima: acontecendo agora$/, () => "Next: happening now"],
    // "6 reações"
    [/^(\d+) reações$/, (m, n) => `${n} reaction${n === "1" ? "" : "s"}`],
    // "3 de 4 livres"
    [/^(\d+) de (\d+) livres$/, (m, a, b) => `${a} of ${b} free`],
    // "3 treinos esta semana"
    [/^(\d+) treinos? esta semana$/, (m, n) => `${n} workout${n === "1" ? "" : "s"} this week`],
    // "Rafael Souza, Personal Trainer • 3 min de leitura" (o "•" separa; o autor fica)
    // "Há 2 dias às 20h", "Hoje às 9h", "Ontem às 18h"
    [/^Há (\d+) dias? às (\d+)h$/, (m, n, h) => `${n} day${n === "1" ? "" : "s"} ago at ${h}h`],
    // Hoje às
    [/^Hoje às (\d+)h$/, (m, h) => `Today at ${h}h`],
    // Ontem às
    [/^Ontem às (\d+)h$/, (m, h) => `Yesterday at ${h}h`],
    // "22 séries"
    [/^(\d+) séries$/, (m, n) => `${n} sets`],
    // "(15% de lotação)"
    [/^\((\d+)% de lotação\)$/, (m, n) => `(${n}% full)`],
    // "0 check-ins este mês"
    [/^(\d+) check-ins este mês$/, (m, n) => `${n} check-ins this month`],
    // "Novo recorde: Supino"
    [/^Novo recorde: (.+)$/, (m, q) => `New record: ${q}`],
    // "Subiu para a liga Ouro!"
    [/^Subiu para a liga (.+)!$/, (m, l) => `Moved up to the ${traduzir(l)} league!`],
    // "Você (Biel, para testar)"
    [/^Você \((.+), para testar\)$/, (m, q) => `You (${q}, for testing)`],
    // "25 dias treinados no último ano"
    [/^(\d+) dias treinados no último ano$/, (m, n) => `${n} days trained in the last year`],
    // "Média de 104 check-ins por dia"
    [/^Média de (\d+) check-ins por dia$/, (m, n) => `Average of ${n} check-ins per day`],
    // "12 dias sem vir"
    [/^(\d+) dias sem vir$/, (m, n) => `${n} days away`],
    // "Total do dia: 3009 kcal • ..." (partes separadas pelo "•")
    [/^Total do dia: (.+)$/, (m, q) => `Daily total: ${q}`],
    // "291 g de proteína"
    [/^(\d+) g de proteína$/, (m, n) => `${n} g of protein`],
    // "média de 2,6 por semana"
    [/^média de (.+) por semana$/, (m, n) => `average of ${n} per week`],
    // "−2,3 kg no período"
    [/^(.+) no período$/, (m, q) => `${q} in the period`],
    // "10 min • 1 porção"
    [/^(\d+) porç(ão|ões)$/, (m, n) => `${n} serving${n === "1" ? "" : "s"}`],
    // "Semana de 12/10: subiu para Ouro (970 pts)"
    [/^Semana de (.+): subiu para (.+) \((.+)\)$/, (m, d, l, n) => `Week of ${d}: moved up to ${traduzir(l)} (${n})`],
    // "há 24 min"
    [/^há (\d+) min$/, (m, n) => `${n} min ago`],
    // "7 amigos"
    [/^(\d+) amigos?$/, (m, n) => `${n} friend${n === "1" ? "" : "s"}`],
    // "Jantar: Omelete" (a refeição traduz, o prato fica)
    [/^(Café da manhã|Almoço|Lanche|Jantar): (.+)$/, (m, r, q) => `${traduzir(r)}: ${q}`],
    // "com Carla Mendes" (professor da aula)
    [/^com (.+)$/, (m, q) => `with ${q}`],
    // "Mais treinados: ..."
    [/^Mais treinados: (.+)$/, (m, q) => `Most trained: ${q}`],
  ];

  // Regras do espanhol (as mais comuns)
  // Dias e meses em espanhol
  const PALAVRAS_ES = {
    // Dias
    "segunda-feira": "lunes", "terça-feira": "martes", "quarta-feira": "miércoles", "quinta-feira": "jueves", "sexta-feira": "viernes", "sábado": "sábado", "domingo": "domingo",
    // Meses
    janeiro: "enero", fevereiro: "febrero", "março": "marzo", abril: "abril", maio: "mayo", junho: "junio", julho: "julio", agosto: "agosto", setembro: "septiembre", outubro: "octubre", novembro: "noviembre", dezembro: "diciembre",
  };
  // Plural simples em espanhol
  const pl = (n, um, varios) => (n === "1" ? um : varios);
  // Regras do espanhol (frases com números)
  const REGRAS_ES = [
    // "Passo 1 de 2"
    [/^Passo (\d+) de (\d+)(?: · (.+))?$/, (m, a, b, c) => `Paso ${a} de ${b}${c ? " · " + traduzir(c) : ""}`],
    // Faltam pontos
    [/^Faltam (\d+) pontos para (subir de liga|garantir o Diamante)$/, (m, n, o) => `Faltan ${n} puntos para ${o === "subir de liga" ? "subir de liga" : "asegurar Diamante"}`],
    // Faltam pontos para subir
    [/^Faltam (\d+) pontos para subir para (.+)\.$/, (m, n, l) => `Faltan ${n} puntos para subir a ${traduzir(l)}.`],
    // Não cair
    [/^Faltam (\d+) pontos para não cair de liga\.$/, (m, n) => `Faltan ${n} puntos para no bajar de liga.`],
    // Zera
    [/^(Semana zera|zera) em (\d+) dias?$/, (m, q, n) => `${q === "zera" ? "se reinicia" : "La semana se reinicia"} en ${n} ${pl(n, "día", "días")}`],
    // Posição
    [/^Você está em (\d+)º de (\d+) entre os amigos$/, (m, a, b) => `Estás en el ${a}.º de ${b} entre tus amigos`],
    // Posição curta
    [/^(\d+)º de (\d+) entre os amigos$/, (m, a, b) => `${a}.º de ${b} entre tus amigos`],
    // Lugar
    [/^(\d+)º lugar$/, (m, a) => `${a}.º lugar`],
    // Hoje
    [/^Hoje: (\d+) de (\d+)$/, (m, a, b) => `Hoy: ${a} de ${b}`],
    // Liga
    [/^Liga (.+)$/, (m, l) => `Liga ${traduzir(l)}`],
    // Missões
    [/^Missões de hoje: (\d+) de (\d+)$/, (m, a, b) => `Misiones de hoy: ${a} de ${b}`],
    // Dias seguidos
    [/^(\d+) dias? seguidos?$/, (m, n) => `${n} ${pl(n, "día seguido", "días seguidos")}`],
    // Comprar
    [/^Comprar por (.+)$/, (m, n) => `Comprar por ${n}`],
    // Faltam moedas
    [/^Faltam (\d[\d.]*)$/, (m, n) => `Faltan ${n}`],
    // Duelo
    [/^Você x (.+)$/, (m, q) => `Tú vs ${q}`],
    // Dia
    [/^Dia (\d+)$/, (m, a) => `Día ${a}`],
    // Há N dias
    [/^Há (\d+) dias?$/, (m, n) => `Hace ${n} ${pl(n, "día", "días")}`],
    // Há N semanas
    [/^Há (\d+) semanas?$/, (m, n) => `Hace ${n} ${pl(n, "semana", "semanas")}`],
    // Há N dias às Hh
    [/^Há (\d+) dias? às (\d+)h$/, (m, n, h) => `Hace ${n} ${pl(n, "día", "días")} a las ${h} h`],
    // Hoje às
    [/^Hoje às (\d+)h$/, (m, h) => `Hoy a las ${h} h`],
    // Ontem às
    [/^Ontem às (\d+)h$/, (m, h) => `Ayer a las ${h} h`],
    // Contagens
    [/^(\d+) (séries|pontos|exercícios|treinos|semanas|participantes|reações)$/, (m, n, q) => `${n} ${{ séries: "series", pontos: "puntos", exercícios: "ejercicios", treinos: "entrenamientos", semanas: "semanas", participantes: "participantes", reações: "reacciones" }[q]}`],
    // Seguidores
    [/^(.+) seguidores$/, (m, n) => `${n} seguidores`],
    // Leitura
    [/^(\d+) min de leitura$/, (m, n) => `${n} min de lectura`],
    // Meta
    [/^meta (.+)$/, (m, n) => `meta ${n}`],
    // Último
    [/^Último: (.+)$/, (m, q) => `Último: ${traduzir(q)}`],
    // Última vez
    [/^Última vez: (.+)$/, (m, q) => `Última vez: ${traduzir(q)}`],
    // Começa com
    [/^Começa com: (.+)$/, (m, q) => `Empieza con: ${q}`],
    // Atende online
    [/^atende online$/, () => "atiende en línea"],
    // Faltam treinos
    [/^Faltam? (\d+) treinos? para bater sua meta da semana\.$/, (m, n) => `${pl(n, "Falta", "Faltan")} ${n} ${pl(n, "entrenamiento", "entrenamientos")} para cumplir tu meta semanal.`],
    // Treinou hoje
    [/^(.+) treinou hoje$/, (m, q) => `${q} entrenó hoy`],
    // Treinos por semana
    [/^(\d+) treinos por semana$/, (m, n) => `${n} entrenamientos por semana`],
    // N de M treinos
    [/^(\d+) de (\d+) treinos$/, (m, a, b) => `${a} de ${b} entrenamientos`],
    // Nesta semana
    [/^(\d+) de (\d+) nesta semana$/, (m, a, b) => `${a} de ${b} esta semana`],
    // Treino de N min
    [/^Seu treino de (\d+) min ficaria assim:$/, (m, n) => `Tu entrenamiento de ${n} min sería así:`],
    // Faltam séries
    [/^Boa! Faltam (\d+) séries?\.$/, (m, n) => `¡Bien! ${pl(n, "Falta", "Faltan")} ${n} ${pl(n, "serie", "series")}.`],
    // Demonstração
    [/^Demonstração: \+(\d+) dias?$/, (m, n) => `Demo: +${n} ${pl(n, "día", "días")}`],
    // Subiu de liga
    [/^Você subiu para a liga (.+)!$/, (m, l) => `¡Subiste a la liga ${traduzir(l)}!`],
    // Post de liga
    [/^Subiu para a liga (.+)!$/, (m, l) => `¡Subió a la liga ${traduzir(l)}!`],
    // Recorde
    [/^Novo recorde: (.+)$/, (m, q) => `Nuevo récord: ${q}`],
    // Vagas
    [/^(\d+) de (\d+) vagas disponíveis$/, (m, a, b) => `${a} de ${b} lugares disponibles`],
    // Próxima aula
    [/^Próxima: (.+) às (\d\d:\d\d)$/, (m, d, h) => `Próxima: ${PALAVRAS_ES[d] || d} a las ${h}`],
    // Acontecendo agora
    [/^Próxima: acontecendo agora$/, () => "Próxima: en curso ahora"],
    // Livres
    [/^(\d+) de (\d+) livres$/, (m, a, b) => `${a} de ${b} libres`],
    // Treinos esta semana
    [/^(\d+) treinos? esta semana$/, (m, n) => `${n} ${pl(n, "entrenamiento", "entrenamientos")} esta semana`],
    // Lotação
    [/^\((\d+)% de lotação\)$/, (m, n) => `(${n}% de ocupación)`],
    // Check-ins
    [/^(\d+) check-ins este mês$/, (m, n) => `${n} check-ins este mes`],
    // Para testar
    [/^Você \((.+), para testar\)$/, (m, q) => `Tú (${q}, para probar)`],
    // Ano
    [/^(\d+) dias treinados no último ano$/, (m, n) => `${n} días entrenados en el último año`],
    // Média de check-ins
    [/^Média de (\d+) check-ins por dia$/, (m, n) => `Promedio de ${n} check-ins por día`],
    // Dias sem vir
    [/^(\d+) dias sem vir$/, (m, n) => `${n} días sin venir`],
    // Total do dia
    [/^Total do dia: (.+)$/, (m, q) => `Total del día: ${q}`],
    // Proteína
    [/^(\d+) g de proteína$/, (m, n) => `${n} g de proteína`],
    // Média por semana
    [/^média de (.+) por semana$/, (m, n) => `promedio de ${n} por semana`],
    // No período
    [/^(.+) no período$/, (m, q) => `${q} en el período`],
    // Porções
    [/^(\d+) porç(ão|ões)$/, (m, n) => `${n} ${pl(n, "porción", "porciones")}`],
    // Mais treinados
    [/^Mais treinados: (.+)$/, (m, q) => `Más entrenados: ${q}`],
    // Professor da aula
    [/^com (.+)$/, (m, q) => `con ${q}`],
    // "há 24 min"
    [/^há (\d+) min$/, (m, n) => `hace ${n} min`],
    // "7 amigos"
    [/^(\d+) amigos?$/, (m, n) => `${n} ${pl(n, "amigo", "amigos")}`],
    // Refeição do post
    [/^(Café da manhã|Almoço|Lanche|Jantar): (.+)$/, (m, r, q) => `${traduzir(r)}: ${q}`],
    // N de M (genérico, por último)
    [/^(\d+) de (\d+)$/, (m, a, b) => `${a} de ${b}`],
    // Títulos das abas
    [/^(.+) — Saúde Life$/, (m, q) => `${traduzir(q)} — Saúde Life`],
    // Títulos das abas
    [/^Saúde Life — (.+)$/, (m, q) => `Saúde Life — ${traduzir(q)}`],
    // Datas por extenso: "domingo, 25 de outubro"
    [/^([A-Za-zçá-]+-feira|sábado|domingo), (\d+) de ([a-zç]+)$/i, (m, d, n, mes) => `${PALAVRAS_ES[d.toLowerCase()] || d}, ${n} de ${PALAVRAS_ES[mes] || mes}`],
  ];

  // Traduz uma frase (sem os espaços das pontas). Devolve a mesma frase se não souber
  function traduzir(texto) {
    // Dicionário do idioma escolhido
    const dic = idioma === "es" ? window.SL_ES || {} : D;
    // Está no dicionário?
    if (dic[texto]) return dic[texto];
    // Alguma regra com números serve?
    for (const [regra, fn] of idioma === "es" ? REGRAS_ES : REGRAS) {
      // Testa a regra
      const m = texto.match(regra);
      // Se serviu, usa
      if (m) return fn(...m);
    }
    // Frase com partes separadas por "•": traduz cada parte (e mantém o "•" do fim, se tiver)
    if (texto.includes("•")) return texto.split("•").map((parte) => (parte.trim() ? traduzir(parte.trim()) : "")).join(" • ").trim();
    // Não sabe: deixa como está
    return texto;
  }

  // Endereço deste arquivo (para achar o idioma-es.js na mesma pasta)
  const esteArquivo = document.currentScript && document.currentScript.src;
  // Ordem dos idiomas no botão: português -> inglês -> espanhol -> português
  const PROXIMO = { pt: "en", en: "es", es: "pt" };
  // Nome de cada idioma (para o leitor de tela)
  const NOMES = { pt: "Mudar para inglês (English)", en: "Switch to Spanish (Español)", es: "Cambiar a portugués (Português)" };
  // Idioma escolhido ("pt", "en" ou "es")
  let idioma = "pt";
  // Tenta ler a escolha salva
  try {
    // Lê do navegador
    idioma = JSON.parse(localStorage.getItem("sl-idioma")) || "pt";
    // Valor estranho: volta para o português
    if (!PROXIMO[idioma]) idioma = "pt";
  // Se o navegador bloquear...
  } catch (e) {
    // ...fica em português
    idioma = "pt";
  }

  // Atributos que também têm texto
  const ATRIBUTOS = ["placeholder", "aria-label", "title", "alt"];

  // Traduz um pedaço da página (um elemento e tudo dentro dele)
  function traduzirArvore(raiz) {
    // Caminhante que visita os textos
    const caminhante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    // Para cada texto...
    while (caminhante.nextNode()) {
      // ...nó de texto
      const no = caminhante.currentNode;
      // ...pula scripts e estilos
      if (/^(SCRIPT|STYLE)$/.test(no.parentNode.nodeName)) continue;
      // ...pula o nome da marca ("Saúde Life" nunca é traduzido)
      if (no.parentNode.querySelector && no.parentNode.querySelector(":scope > .brand-life")) continue;
      // ...texto sem espaços nas pontas
      const limpo = no.nodeValue.replace(/\s+/g, " ").trim();
      // ...se não tem letra, pula
      if (!limpo || !/[A-Za-zÀ-ú]/.test(limpo)) continue;
      // ...tradução
      const novo = traduzir(limpo);
      // ...se mudou, troca mantendo os espaços das pontas
      if (novo !== limpo) no.nodeValue = no.nodeValue.replace(/^(\s*)[\s\S]*?(\s*)$/, `$1${novo}$2`);
    }
    // Elementos com atributos de texto (inclusive a própria raiz)
    const elementos = raiz.querySelectorAll ? [raiz, ...raiz.querySelectorAll("[placeholder],[aria-label],[title],[alt]")] : [];
    // Para cada um...
    elementos.forEach((el) =>
      // ...para cada atributo de texto...
      ATRIBUTOS.forEach((a) => {
        // ...valor atual
        const v = el.getAttribute && el.getAttribute(a);
        // ...se tem, traduz
        if (v) {
          // Tradução
          const novo = traduzir(v.trim());
          // Se mudou, troca
          if (novo !== v.trim()) el.setAttribute(a, novo);
        }
      }),
    );
  }

  // Liga o idioma escolhido: traduz a página e passa a traduzir o que aparecer depois
  function ligarIngles() {
    // Espanhol: primeiro carrega o dicionário (arquivo separado), depois traduz
    if (idioma === "es" && !window.SL_ES && esteArquivo) {
      // Script do dicionário
      const script = document.createElement("script");
      // Mesmo lugar deste arquivo
      script.src = new URL("idioma-es.js", esteArquivo).href;
      // Quando carregar, traduz
      script.onload = ligarIngles;
      // Carrega
      document.head.append(script);
      // Espera
      return;
    }
    // Avisa o navegador e os leitores de tela qual é o idioma da página
    document.documentElement.lang = idioma;
    // Traduz o título da aba
    document.title = traduzir(document.title);
    // Traduz a página inteira
    traduzirArvore(document.body);
    // Observador: quando o JavaScript desenhar algo novo, traduz também
    new MutationObserver((mudancas) =>
      // Para cada mudança...
      mudancas.forEach((m) => {
        // ...nós novos
        m.addedNodes.forEach((n) => (n.nodeType === 1 ? traduzirArvore(n) : n.nodeType === 3 && n.parentNode && traduzirArvore(n.parentNode)));
        // ...texto que mudou dentro de um nó
        if (m.type === "characterData" && m.target.parentNode) traduzirArvore(m.target.parentNode);
      }),
    ).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  // Quando a página terminar de carregar...
  document.addEventListener("DOMContentLoaded", function () {
    // ...cria o botão de idioma
    const botao = document.createElement("button");
    // Tipo botão
    botao.type = "button";
    // Classe do visual
    botao.className = "btn-idioma";
    // Mostra o idioma para o qual vai trocar
    botao.textContent = PROXIMO[idioma].toUpperCase();
    // Nome para leitores de tela
    botao.setAttribute("aria-label", NOMES[idioma]);
    // Ao clicar: salva a escolha e recarrega a página no outro idioma
    botao.addEventListener("click", function () {
      // Tenta salvar
      try {
        // Salva o outro idioma
        localStorage.setItem("sl-idioma", JSON.stringify(PROXIMO[idioma]));
      // Se o navegador bloquear...
      } catch (e) {
        /* armazenamento indisponível */
      }
      // Recarrega
      window.location.reload();
    });
    // Lugar do botão: topo do app, topo do site ou (sem topo) solto no canto
    const lugar = document.querySelector(".topbar-actions, .player-topbar, .top-bar-actions");
    // Coloca no começo do topo...
    if (lugar) lugar.prepend(botao);
    // ...ou solto no canto da tela
    else {
      // Marca como solto
      botao.classList.add("btn-idioma-solto");
      // Coloca na página
      document.body.append(botao);
    }
    // Se a escolha não é português, traduz
    if (idioma !== "pt") ligarIngles();
  });

  // Deixa a tradução disponível para outros arquivos (ex.: toasts)
  window.SL_IDIOMA = { idioma, traduzir };
})();
