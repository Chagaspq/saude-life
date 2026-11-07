/*
 * Biblioteca de exercícios do Saúde Life.
 * Cada exercício tem:
 *   grupo    = área principal (Peito, Costas, Pernas, Ombros, Braços, Core, Cardio, Mobilidade)
 *   musculos = músculos trabalhados (acendem no corpo desenhado da Evolução)
 *   lugar    = "casa", "academia" ou "ambos"
 *   mov      = tipo de movimento, para o Pulso animar: agachar, empurrar, puxar, core, cardio, alongar
 *   carga    = carga inicial sugerida em kg (0 = peso do corpo)
 *   dicas    = 2 dicas curtas de como fazer
 *   erro     = o erro mais comum
 *   equip    = equipamento (calculado no fim do arquivo, para os filtros)
 * Fica em window.SL_EXERCICIOS para todas as páginas usarem.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Atalho que monta um exercício: x(grupo, músculos, lugar, movimento, carga, [dica1, dica2], erro)
  const x = (grupo, musculos, lugar, mov, carga, dicas, erro) => ({ grupo, musculos, lugar, mov, carga, dicas, erro });

  // A biblioteca, pelo nome do exercício
  window.SL_EXERCICIOS = {
    /* ---------- Pernas ---------- */
    // Agachamento livre
    "Agachamento livre": x("Pernas", ["quadriceps", "gluteos"], "ambos", "agachar", 40, ["Pés na largura dos ombros, pontas um pouco para fora.", "Desça como se fosse sentar numa cadeira, peito aberto."], "Deixar os joelhos caírem para dentro na subida."),
    // Agachamento com salto
    "Agachamento com salto": x("Pernas", ["quadriceps", "gluteos", "panturrilhas"], "casa", "agachar", 0, ["Agache até a metade e suba explodindo.", "Aterrisse macio, com os joelhos levemente dobrados."], "Cair com as pernas esticadas (machuca o joelho)."),
    // Agachamento búlgaro
    "Agachamento búlgaro": x("Pernas", ["quadriceps", "gluteos"], "ambos", "agachar", 8, ["Pé de trás apoiado num banco ou sofá.", "Desça reto, o joelho da frente acompanha o pé."], "Jogar o corpo para a frente e tirar o calcanhar do chão."),
    // Leg press
    "Leg press 45°": x("Pernas", ["quadriceps", "gluteos"], "academia", "agachar", 100, ["Lombar sempre encostada no banco.", "Desça até os joelhos formarem 90 graus."], "Travar os joelhos esticados no fim do movimento."),
    // Cadeira extensora
    "Cadeira extensora": x("Pernas", ["quadriceps"], "academia", "agachar", 35, ["Ajuste o encosto para o joelho ficar no eixo da máquina.", "Segure 1 segundo lá em cima."], "Subir dando tranco, com o quadril saindo do banco."),
    // Cadeira flexora
    "Cadeira flexora": x("Pernas", ["posteriores"], "academia", "agachar", 30, ["Quadril bem preso no banco.", "Volte devagar, sem deixar o peso bater."], "Levantar o quadril para ajudar a puxar."),
    // Afundo
    "Afundo com halteres": x("Pernas", ["quadriceps", "gluteos"], "ambos", "agachar", 10, ["Passo largo, tronco reto.", "O joelho de trás quase encosta no chão."], "Dar um passo curto e jogar o joelho da frente muito à frente."),
    // Passada
    "Passada com barra": x("Pernas", ["quadriceps", "gluteos"], "academia", "agachar", 20, ["Barra apoiada nas costas, não no pescoço.", "Olhar para a frente durante todo o movimento."], "Perder o equilíbrio por andar com os pés na mesma linha."),
    // Stiff
    "Stiff": x("Pernas", ["posteriores", "gluteos"], "academia", "puxar", 40, ["Joelhos levemente dobrados e fixos.", "Desça a barra rente às pernas, quadril para trás."], "Arredondar as costas para descer mais."),
    // Levantamento terra
    "Levantamento terra": x("Pernas", ["posteriores", "gluteos", "costas"], "academia", "puxar", 50, ["Barra encostada na canela, costas retas.", "Empurre o chão com os pés para subir."], "Puxar com as costas arredondadas."),
    // Ponte de glúteo
    "Ponte de glúteo": x("Pernas", ["gluteos", "posteriores"], "casa", "core", 0, ["Deitado, pés apoiados perto do bumbum.", "Suba o quadril e aperte o glúteo lá em cima."], "Subir arqueando a lombar em vez de usar o glúteo."),
    // Panturrilha em pé
    "Panturrilha em pé": x("Pernas", ["panturrilhas"], "ambos", "agachar", 40, ["Suba o máximo na ponta dos pés.", "Desça devagar até alongar bem."], "Fazer rápido e curtinho, sem amplitude."),
    // Panturrilha sentado
    "Panturrilha sentado": x("Pernas", ["panturrilhas"], "academia", "agachar", 25, ["Peso apoiado perto dos joelhos.", "Pausa de 1 segundo lá em cima."], "Quicar o peso no fim do movimento."),
    // Panturrilha no leg press
    "Panturrilha no leg press": x("Pernas", ["panturrilhas"], "academia", "agachar", 100, ["Só a ponta dos pés na plataforma.", "Joelhos esticados, mas sem travar."], "Dobrar os joelhos e transformar em leg press."),

    /* ---------- Peito ---------- */
    // Supino reto
    "Supino reto": x("Peito", ["peito", "triceps", "ombros"], "academia", "empurrar", 40, ["Escápulas juntas e pés firmes no chão.", "Desça a barra até a linha do peito."], "Tirar o quadril do banco para empurrar mais."),
    // Supino inclinado
    "Supino inclinado com halteres": x("Peito", ["peito", "ombros", "triceps"], "academia", "empurrar", 14, ["Banco entre 30 e 45 graus.", "Halteres descem até a altura do peito."], "Bater um haltere no outro lá em cima."),
    // Crucifixo com halteres
    "Crucifixo com halteres": x("Peito", ["peito"], "academia", "empurrar", 10, ["Cotovelos levemente dobrados o tempo todo.", "Abra como se fosse abraçar uma árvore."], "Descer demais e forçar o ombro."),
    // Crucifixo na máquina
    "Crucifixo na máquina": x("Peito", ["peito"], "academia", "empurrar", 30, ["Ajuste o banco para as mãos ficarem na altura do peito.", "Feche apertando o peito, sem tranco."], "Usar os braços em vez do peito."),
    // Flexão de braço
    "Flexão de braço": x("Peito", ["peito", "triceps", "ombros"], "casa", "empurrar", 0, ["Corpo reto como uma prancha.", "Mãos um pouco mais abertas que os ombros."], "Deixar o quadril cair (vira 'minhoca')."),

    /* ---------- Costas ---------- */
    // Puxada frontal
    "Puxada frontal": x("Costas", ["costas", "biceps"], "academia", "puxar", 40, ["Puxe a barra até o queixo, peito para cima.", "Pense em levar os cotovelos para baixo."], "Jogar o corpo para trás para puxar mais peso."),
    // Remada curvada
    "Remada curvada": x("Costas", ["costas", "biceps"], "academia", "puxar", 30, ["Tronco inclinado, costas retas.", "Puxe a barra até o umbigo."], "Ficar com o tronco quase em pé."),
    // Remada baixa
    "Remada baixa": x("Costas", ["costas", "biceps"], "academia", "puxar", 35, ["Peito aberto, ombros para trás.", "Puxe até o triângulo encostar na barriga."], "Balançar o tronco para frente e para trás."),
    // Remada unilateral
    "Remada unilateral": x("Costas", ["costas", "biceps"], "ambos", "puxar", 14, ["Apoie mão e joelho no banco (ou no sofá).", "Puxe o haltere até a cintura."], "Girar o tronco para subir o peso."),
    // Pulldown com corda
    "Pulldown com corda": x("Costas", ["costas"], "academia", "puxar", 20, ["Braços quase esticados o tempo todo.", "Leve a corda até as coxas."], "Dobrar os cotovelos e virar um tríceps."),
    // Superman
    "Superman": x("Costas", ["costas", "gluteos"], "casa", "core", 0, ["Deitado de barriga para baixo, braços à frente.", "Suba braços e pernas juntos e segure 2 segundos."], "Jogar a cabeça para trás e forçar o pescoço."),

    /* ---------- Ombros ---------- */
    // Desenvolvimento
    "Desenvolvimento com halteres": x("Ombros", ["ombros", "triceps"], "ambos", "empurrar", 10, ["Comece com os halteres na altura das orelhas.", "Suba sem travar os cotovelos."], "Arquear a lombar para empurrar."),
    // Elevação lateral
    "Elevação lateral": x("Ombros", ["ombros"], "ambos", "empurrar", 6, ["Suba até a altura dos ombros, não mais.", "Cotovelos levemente dobrados."], "Usar embalo do corpo para subir."),

    /* ---------- Braços ---------- */
    // Rosca direta
    "Rosca direta": x("Braços", ["biceps"], "ambos", "puxar", 16, ["Cotovelos colados no corpo.", "Desça devagar até esticar quase tudo."], "Balançar as costas para subir a barra."),
    // Rosca martelo
    "Rosca martelo": x("Braços", ["biceps"], "ambos", "puxar", 8, ["Palmas viradas uma para a outra.", "Suba um braço de cada vez, sem pressa."], "Subir o cotovelo junto com o peso."),
    // Rosca com elástico
    "Rosca com elástico": x("Braços", ["biceps"], "casa", "puxar", 0, ["Pise no elástico com os dois pés.", "Segure 1 segundo lá em cima."], "Deixar o elástico voltar sozinho, sem controle."),
    // Tríceps na corda
    "Tríceps na corda": x("Braços", ["triceps"], "academia", "empurrar", 15, ["Cotovelos parados do lado do corpo.", "Abra a corda no final do movimento."], "Mexer os ombros para ajudar."),
    // Tríceps francês
    "Tríceps francês": x("Braços", ["triceps"], "ambos", "empurrar", 8, ["Cotovelos apontando para o teto.", "Desça o peso atrás da cabeça com calma."], "Abrir os cotovelos para os lados."),
    // Tríceps no banco
    "Tríceps no banco": x("Braços", ["triceps"], "casa", "empurrar", 0, ["Mãos na beirada do banco ou da cadeira.", "Desça até os cotovelos formarem 90 graus."], "Descer demais e forçar o ombro."),

    /* ---------- Core ---------- */
    // Prancha
    "Prancha": x("Core", ["abdomen"], "casa", "core", 0, ["Cotovelos embaixo dos ombros.", "Contraia a barriga e o bumbum."], "Deixar o quadril cair ou subir demais."),
    // Prancha lateral
    "Prancha lateral": x("Core", ["abdomen"], "casa", "core", 0, ["Cotovelo embaixo do ombro, corpo em linha.", "Quadril alto o tempo todo."], "Deixar o quadril afundar no meio da série."),
    // Abdominal bicicleta
    "Abdominal bicicleta": x("Core", ["abdomen"], "casa", "core", 0, ["Leve o cotovelo em direção ao joelho oposto.", "Vá devagar, girando o tronco."], "Puxar o pescoço com as mãos."),
    // Abdominal supra
    "Abdominal supra": x("Core", ["abdomen"], "casa", "core", 0, ["Suba só até tirar as escápulas do chão.", "Solte o ar na subida."], "Puxar a cabeça com as mãos."),
    // Elevação de pernas
    "Elevação de pernas": x("Core", ["abdomen"], "casa", "core", 0, ["Lombar colada no chão.", "Desça as pernas devagar, sem encostar."], "Arquear a lombar quando as pernas descem."),

    /* ---------- Cardio ---------- */
    // Polichinelo
    "Polichinelo": x("Cardio", ["corpo"], "casa", "cardio", 0, ["Ritmo constante, respirando pelo nariz.", "Aterrisse na ponta dos pés."], "Fazer sem coordenar braços e pernas."),
    // Burpee
    "Burpee": x("Cardio", ["corpo", "peito", "quadriceps"], "casa", "cardio", 0, ["Agache, jogue as pernas para trás e volte.", "Termine com um pulinho e palmas acima da cabeça."], "Deixar o quadril cair na hora da prancha."),
    // Escalador
    "Escalador": x("Cardio", ["abdomen", "corpo"], "casa", "cardio", 0, ["Posição de prancha, mãos firmes.", "Traga um joelho de cada vez rápido ao peito."], "Subir o quadril e virar um 'V'."),
    // Aquecimento
    "Aquecimento leve": x("Cardio", ["corpo"], "ambos", "cardio", 0, ["Comece andando e aumente aos poucos.", "Dá para conversar: está no ritmo certo."], "Começar já no máximo."),
    // Tiro forte
    "Tiro forte": x("Cardio", ["corpo", "quadriceps"], "ambos", "cardio", 0, ["Esforço quase máximo durante o tiro.", "No descanso, ande e recupere o fôlego."], "Pular o descanso e quebrar no meio."),
    // Desaquecimento
    "Desaquecimento": x("Cardio", ["corpo"], "ambos", "cardio", 0, ["Diminua o ritmo aos poucos.", "Aproveite para alongar no final."], "Parar de uma vez depois do esforço forte."),

    /* ---------- Mobilidade ---------- */
    // Saudação ao sol
    "Saudação ao sol": x("Mobilidade", ["corpo"], "casa", "alongar", 0, ["Siga a respiração: inspira subindo, expira descendo.", "Movimentos lentos e contínuos."], "Prender a respiração."),
    // Cachorro olhando para baixo
    "Cachorro olhando para baixo": x("Mobilidade", ["posteriores", "ombros"], "casa", "alongar", 0, ["Empurre o chão e leve o quadril para cima.", "Pode dobrar os joelhos se puxar muito."], "Forçar os calcanhares no chão e arredondar as costas."),
    // Guerreiro II
    "Postura do guerreiro II": x("Mobilidade", ["quadriceps", "gluteos"], "casa", "alongar", 0, ["Joelho da frente sobre o tornozelo.", "Braços abertos e ombros relaxados."], "Deixar o joelho da frente cair para dentro."),
    // Torção sentada
    "Torção sentada": x("Mobilidade", ["costas"], "casa", "alongar", 0, ["Cresça a coluna antes de girar.", "Gire devagar, olhando por cima do ombro."], "Girar com as costas curvadas."),
    // Postura da criança
    "Postura da criança": x("Mobilidade", ["costas"], "casa", "alongar", 0, ["Joelhos afastados, bumbum nos calcanhares.", "Respire fundo e solte as costas."], "Ficar tenso: aqui é para relaxar."),
    // Rotação de quadril
    "Rotação de quadril em pé": x("Mobilidade", ["gluteos"], "casa", "alongar", 0, ["Apoie a mão numa parede.", "Desenhe círculos grandes com o joelho."], "Fazer rápido e sem controle."),
    // Postura do pombo
    "Postura do pombo": x("Mobilidade", ["gluteos"], "casa", "alongar", 0, ["Perna da frente dobrada, de trás esticada.", "Desça o tronco aos poucos."], "Torcer o joelho da frente para caber na posição."),
    // Alongamento 90/90
    "Alongamento 90/90": x("Mobilidade", ["gluteos"], "casa", "alongar", 0, ["As duas pernas dobradas em 90 graus.", "Incline o tronco sobre a perna da frente."], "Arredondar as costas para descer mais."),

    /* ---------- Mais exercícios (biblioteca ampliada) ---------- */
    // Supino reto com halteres
    "Supino reto com halteres": x("Peito", ["peito", "triceps"], "ambos", "empurrar", 14, ["Halteres na linha do peito, cotovelos a 45 graus.", "Desça devagar e suba sem bater um halter no outro."], "Abrir demais os cotovelos e forçar o ombro."),
    // Supino declinado
    "Supino declinado": x("Peito", ["peito", "triceps"], "academia", "empurrar", 30, ["Pés bem presos no apoio do banco.", "A barra desce na parte de baixo do peito."], "Deixar a barra cair rápido no peito."),
    // Crucifixo inclinado
    "Crucifixo inclinado": x("Peito", ["peito", "ombros"], "ambos", "empurrar", 8, ["Braços levemente dobrados o tempo todo.", "Abra até sentir alongar o peito, sem passar da linha do ombro."], "Esticar os cotovelos e pesar demais."),
    // Crossover na polia
    "Crossover na polia": x("Peito", ["peito"], "academia", "empurrar", 15, ["Um pé à frente para ter equilíbrio.", "Junte as mãos na frente do quadril, apertando o peito."], "Usar o corpo para jogar o peso."),
    // Flexão inclinada
    "Flexão inclinada": x("Peito", ["peito", "triceps"], "casa", "empurrar", 0, ["Mãos num banco, sofá ou mesa firme.", "Corpo reto como uma prancha."], "Deixar o quadril cair."),
    // Flexão diamante
    "Flexão diamante": x("Peito", ["triceps", "peito"], "casa", "empurrar", 0, ["Mãos juntas formando um diamante embaixo do peito.", "Cotovelos rentes ao corpo."], "Abrir os cotovelos para os lados."),
    // Peck deck
    "Peck deck": x("Peito", ["peito"], "academia", "empurrar", 30, ["Costas coladas no encosto.", "Segure 1 segundo com os braços fechados."], "Soltar o peso de uma vez na volta."),
    // Barra fixa
    "Barra fixa": x("Costas", ["costas", "biceps"], "ambos", "puxar", 0, ["Pegada um pouco mais larga que os ombros.", "Puxe até o queixo passar da barra."], "Balançar o corpo para subir."),
    // Barra fixa com elástico
    "Barra fixa com elástico": x("Costas", ["costas", "biceps"], "ambos", "puxar", 0, ["O elástico ajuda a subir: quanto mais grosso, mais ajuda.", "Desça controlando até esticar os braços."], "Descer de uma vez."),
    // Remada cavalinho
    "Remada cavalinho": x("Costas", ["costas"], "academia", "puxar", 30, ["Peito apoiado ou tronco firme, coluna reta.", "Puxe levando os cotovelos para trás."], "Arredondar a lombar."),
    // Remada com elástico
    "Remada com elástico": x("Costas", ["costas", "biceps"], "casa", "puxar", 0, ["Prenda o elástico numa porta ou nos pés.", "Aperte as escápulas no fim do movimento."], "Puxar só com os braços, sem usar as costas."),
    // Puxada com pegada fechada
    "Puxada com pegada fechada": x("Costas", ["costas", "biceps"], "academia", "puxar", 35, ["Triângulo na polia, peito para cima.", "Leve o triângulo até perto do peito."], "Jogar o tronco para trás."),
    // Pullover com halter
    "Pullover com halter": x("Costas", ["costas", "peito"], "ambos", "puxar", 12, ["Deitado no banco, halter com as duas mãos.", "Leve o halter para trás da cabeça com os braços quase esticados."], "Dobrar muito os cotovelos e virar um tríceps."),
    // Hiperextensão lombar
    "Hiperextensão lombar": x("Costas", ["costas", "gluteos"], "academia", "puxar", 0, ["Quadril apoiado no banco romano.", "Suba até alinhar o corpo, sem passar disso."], "Jogar o corpo para trás com tranco."),
    // Desenvolvimento com barra
    "Desenvolvimento com barra": x("Ombros", ["ombros", "triceps"], "academia", "empurrar", 20, ["Barra na frente do rosto, abdômen firme.", "Empurre para cima até quase esticar."], "Arquear demais a lombar."),
    // Elevação frontal
    "Elevação frontal": x("Ombros", ["ombros"], "ambos", "empurrar", 5, ["Suba os halteres até a altura dos ombros.", "Desça devagar."], "Balançar o tronco para subir."),
    // Crucifixo inverso
    "Crucifixo inverso": x("Ombros", ["ombros", "costas"], "ambos", "puxar", 5, ["Tronco inclinado para a frente, costas retas.", "Abra os braços como asas."], "Usar peso demais e encolher os ombros."),
    // Encolhimento com halteres
    "Encolhimento com halteres": x("Ombros", ["ombros", "costas"], "ambos", "puxar", 16, ["Suba os ombros em direção às orelhas.", "Segure 1 segundo no alto."], "Girar os ombros (só sobe e desce)."),
    // Arnold press
    "Arnold press": x("Ombros", ["ombros", "triceps"], "ambos", "empurrar", 8, ["Comece com as palmas viradas para você.", "Gire os punhos enquanto sobe."], "Fazer rápido e sem controle."),
    // Elevação lateral na polia
    "Elevação lateral na polia": x("Ombros", ["ombros"], "academia", "empurrar", 5, ["Um braço por vez, cabo cruzando na frente do corpo.", "Suba até a linha do ombro."], "Subir acima da linha do ombro."),
    // Flexão pike
    "Flexão pike": x("Ombros", ["ombros", "triceps"], "casa", "empurrar", 0, ["Quadril alto, corpo em V invertido.", "Desça a cabeça entre as mãos."], "Fazer com o quadril baixo (vira flexão comum)."),
    // Rosca concentrada
    "Rosca concentrada": x("Braços", ["biceps"], "ambos", "puxar", 8, ["Cotovelo apoiado na parte de dentro da coxa.", "Suba devagar e aperte no alto."], "Tirar o cotovelo do apoio."),
    // Rosca scott
    "Rosca scott": x("Braços", ["biceps"], "academia", "puxar", 15, ["Braços apoiados no banco scott.", "Desça até quase esticar, sem travar."], "Soltar o peso de uma vez na descida."),
    // Rosca na polia
    "Rosca na polia": x("Braços", ["biceps"], "academia", "puxar", 15, ["Cotovelos colados no corpo.", "Suba sem mexer os ombros."], "Jogar o corpo para trás."),
    // Tríceps testa
    "Tríceps testa": x("Braços", ["triceps"], "ambos", "empurrar", 15, ["Deitado, barra ou halteres acima do rosto.", "Dobre só os cotovelos, levando o peso até a testa."], "Abrir os cotovelos."),
    // Tríceps coice
    "Tríceps coice": x("Braços", ["triceps"], "ambos", "empurrar", 5, ["Tronco inclinado, cotovelo colado ao corpo.", "Estique o braço para trás e segure 1 segundo."], "Balançar o braço."),
    // Mergulho nas paralelas
    "Mergulho nas paralelas": x("Braços", ["triceps", "peito"], "academia", "empurrar", 0, ["Corpo reto para focar no tríceps.", "Desça até os cotovelos fazerem 90 graus."], "Descer demais e forçar o ombro."),
    // Abdominal infra no banco
    "Abdominal infra no banco": x("Core", ["abdomen"], "ambos", "core", 0, ["Mãos segurando o banco atrás da cabeça.", "Suba as pernas tirando o quadril do banco."], "Balançar as pernas."),
    // Prancha com toque no ombro
    "Prancha com toque no ombro": x("Core", ["abdomen", "ombros"], "casa", "core", 0, ["Pés afastados para ter equilíbrio.", "Toque o ombro oposto sem girar o quadril."], "Rebolar o quadril a cada toque."),
    // Dead bug
    "Dead bug": x("Core", ["abdomen"], "casa", "core", 0, ["Lombar colada no chão o tempo todo.", "Estique braço e perna opostos devagar."], "Tirar a lombar do chão."),
    // Russian twist
    "Russian twist": x("Core", ["abdomen"], "casa", "core", 0, ["Tronco inclinado para trás, pés no chão ou no ar.", "Gire o tronco de um lado para o outro."], "Mexer só os braços."),
    // Abdominal na polia
    "Abdominal na polia": x("Core", ["abdomen"], "academia", "core", 25, ["Ajoelhado, corda atrás da cabeça.", "Enrole o tronco levando os cotovelos aos joelhos."], "Puxar com os braços."),
    // Roda abdominal
    "Roda abdominal": x("Core", ["abdomen", "ombros"], "ambos", "core", 0, ["Comece ajoelhado.", "Vá até onde conseguir sem cair a lombar."], "Deixar o quadril afundar."),
    // Hack squat
    "Hack squat": x("Pernas", ["quadriceps", "gluteos"], "academia", "agachar", 40, ["Costas apoiadas, pés no meio da plataforma.", "Desça até 90 graus."], "Tirar os calcanhares da plataforma."),
    // Agachamento sumô
    "Agachamento sumô": x("Pernas", ["quadriceps", "gluteos"], "ambos", "agachar", 16, ["Pés bem afastados, pontas para fora.", "Segure um halter entre as pernas."], "Deixar os joelhos caírem para dentro."),
    // Elevação pélvica com barra
    "Elevação pélvica com barra": x("Pernas", ["gluteos", "posteriores"], "academia", "agachar", 40, ["Costas apoiadas num banco, barra no quadril (use proteção).", "Suba apertando o glúteo e segure 1 segundo."], "Arquear a lombar no alto em vez de usar o glúteo."),
    // Cadeira abdutora
    "Cadeira abdutora": x("Pernas", ["gluteos"], "academia", "agachar", 30, ["Costas no encosto.", "Abra as pernas e volte devagar."], "Voltar soltando o peso."),
    // Subida no banco
    "Subida no banco": x("Pernas", ["quadriceps", "gluteos"], "ambos", "agachar", 0, ["Banco ou degrau firme, na altura do joelho.", "Empurre com a perna de cima, sem pular com a de baixo."], "Dar impulso com o pé de baixo."),
    // Agachamento na parede
    "Agachamento na parede": x("Pernas", ["quadriceps"], "casa", "agachar", 0, ["Costas coladas na parede, joelhos a 90 graus.", "Segure o tempo combinado respirando."], "Deixar os joelhos passarem muito da ponta do pé."),
    // Mesa flexora
    "Mesa flexora": x("Pernas", ["posteriores"], "academia", "agachar", 25, ["Deitado, quadril colado no banco.", "Puxe até perto do glúteo e volte devagar."], "Levantar o quadril."),
    // Pular corda
    "Pular corda": x("Cardio", ["corpo", "panturrilhas"], "ambos", "cardio", 0, ["Pulos baixos, na ponta dos pés.", "Gire a corda com os punhos, não com os braços."], "Pular alto demais e cansar rápido."),
    // Corrida estacionária
    "Corrida estacionária": x("Cardio", ["corpo", "quadriceps"], "casa", "cardio", 0, ["Corra no lugar levantando os joelhos.", "Mantenha o ritmo constante."], "Bater os calcanhares com força no chão."),
    // Bicicleta ergométrica
    "Bicicleta ergométrica": x("Cardio", ["corpo", "quadriceps"], "academia", "cardio", 0, ["Banco na altura do quadril.", "Joelho quase esticado embaixo."], "Banco baixo demais (força o joelho)."),
    // Remo ergômetro
    "Remo ergômetro": x("Cardio", ["corpo", "costas"], "academia", "cardio", 0, ["Empurre com as pernas primeiro, depois puxe com os braços.", "Volte na ordem contrária."], "Puxar só com os braços."),
    // Elíptico
    "Elíptico": x("Cardio", ["corpo"], "academia", "cardio", 0, ["Use os braços junto com as pernas.", "Postura reta, sem apoiar o peso nos braços."], "Ficar pendurado nas alças."),
    // Caminhada rápida
    "Caminhada rápida": x("Cardio", ["corpo"], "ambos", "cardio", 0, ["Passos rápidos, braços balançando.", "Respiração forte, mas ainda dá para falar."], "Andar devagar demais para contar como treino."),
    // Skipping
    "Skipping": x("Cardio", ["corpo", "quadriceps"], "casa", "cardio", 0, ["Joelhos na altura do quadril.", "Braços acompanham as pernas."], "Inclinar o tronco para trás."),
    // Alongamento de posterior
    "Alongamento de posterior": x("Mobilidade", ["posteriores"], "casa", "alongar", 0, ["Perna esticada num degrau, coluna reta.", "Incline o tronco até sentir alongar."], "Arredondar as costas para descer mais."),
    // Gato e vaca
    "Gato e vaca": x("Mobilidade", ["costas"], "casa", "alongar", 0, ["De quatro apoios, mãos embaixo dos ombros.", "Arredonde e arqueie a coluna seguindo a respiração."], "Mexer só o pescoço."),
    // Abertura de peito na parede
    "Abertura de peito na parede": x("Mobilidade", ["peito", "ombros"], "casa", "alongar", 0, ["Antebraço apoiado na parede.", "Gire o corpo para o lado oposto devagar."], "Forçar até doer."),
  };

  // Equipamento de cada exercício (para o filtro), pelo nome e pelo lugar
  function equipamentoDe(nome, ex) {
    // Corda de pular (antes da polia, que também tem "corda" no nome)
    if (/pular corda/i.test(nome)) return "Corda";
    // Elástico
    if (/elástico/i.test(nome)) return "Elástico";
    // Polia (cabo)
    if (/polia|corda|crossover|puxada|pulldown/i.test(nome)) return "Polia";
    // Máquinas
    if (/cadeira|leg press|hack|peck|mesa|máquina|bicicleta|remo erg|elíptico|abdutora/i.test(nome)) return "Máquina";
    // Barra fixa e paralelas
    if (/barra fixa|paralelas/i.test(nome)) return "Barra fixa";
    // Barra
    if (/barra|stiff|terra|supino reto$|supino declinado|remada curvada|cavalinho|rosca direta|scott/i.test(nome)) return "Barra";
    // Halteres
    if (/halter|rosca|elevação lateral$|elevação frontal|crucifixo|arnold|coice|testa|francês|encolhimento|sumô|afundo|búlgaro|supino inclinado/i.test(nome)) return "Halteres";
    // Sem carga: peso do corpo
    return ex.carga ? "Halteres" : "Peso do corpo";
  }
  // Coloca o equipamento em cada exercício
  Object.entries(window.SL_EXERCICIOS).forEach(([nome, ex]) => (ex.equip = ex.equip || equipamentoDe(nome, ex)));
})();
