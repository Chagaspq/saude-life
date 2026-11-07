// Cadastro em 2 passos: (1) nome, e-mail e senha; (2) foto, apelido, nascimento, altura e peso.
// Se a pessoa veio do questionário da página inicial (?objetivo=...&nivel=...), as respostas
// ficam guardadas e o app já começa com elas marcadas.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Pega as funções de formulário de shared/form-utils.js
  const F = window.SaudeLifeForm;
  // Atalho para achar um elemento
  const qs = F.qs;
  // Atalho para mostrar erro num campo
  const setFieldError = F.setFieldError;
  // Atalho para apagar erro de um campo
  const clearFieldError = F.clearFieldError;
  // Atalho para mostrar o erro geral do formulário
  const showGlobalError = F.showGlobalError;
  // Atalho para validar o e-mail
  const validateEmailField = F.validateEmailField;
  // Atalho para validar a senha
  const validatePasswordField = F.validatePasswordField;
  // Atalho para achar um pedaço marcado com data-cad
  const cad = (nome) => document.querySelector(`[data-cad="${nome}"]`);

  // Nomes dos passos (aparecem no indicador)
  const NOMES_PASSOS = ["Sua conta", "Sobre você"];
  // Passo atual (1 ou 2)
  let passo = 1;
  // Foto escolhida (já diminuída), ou vazio
  let foto = "";

  // Coloca o foco no primeiro campo com erro
  function focarErro(form) {
    // Primeiro campo com erro
    const primeiro = form.querySelector(".form-group.has-error input");
    // Se achou, foca nele
    if (primeiro) primeiro.focus();
  }

  // Confere o passo 1: nome, e-mail, senha e confirmação
  function validarPasso1(form) {
    // Começa achando que está tudo certo
    let isValid = true;
    // Campo do nome
    const name = qs("#name", form);
    // Campo do e-mail
    const email = qs("#email", form);
    // Campo da senha
    const password = qs("#password", form);
    // Campo de confirmar a senha
    const confirmPassword = qs("#confirm-password", form);

    // Se o nome está vazio...
    if (!name.value.trim()) {
      // ...mostra o erro
      setFieldError(name, "Digite seu nome completo.");
      // ...e marca que tem erro
      isValid = false;
    // Se não está vazio...
    } else {
      // ...apaga o erro
      clearFieldError(name);
    }

    // Se o e-mail é inválido, marca erro
    if (!validateEmailField(email)) isValid = false;
    // Se o e-mail já tem conta neste aparelho...
    else if (F.acharConta(email.value.trim().toLowerCase())) {
      // ...avisa
      setFieldError(email, "Já existe uma conta com esse e-mail. Entre ou use outro.");
      // ...e marca que tem erro
      isValid = false;
    }
    // Se a senha é inválida, marca erro
    if (!validatePasswordField(password)) isValid = false;

    // Se a confirmação é diferente da senha...
    if (confirmPassword.value !== password.value) {
      // ...mostra o erro
      setFieldError(confirmPassword, "As senhas não coincidem.");
      // ...e marca que tem erro
      isValid = false;
    // Se são iguais...
    } else {
      // ...apaga o erro
      clearFieldError(confirmPassword);
    }

    // Se teve erro, foca no primeiro campo errado
    if (!isValid) focarErro(form);
    // Devolve se o passo está certo
    return isValid;
  }

  // Confere um número opcional entre um mínimo e um máximo
  function conferirFaixa(campo, min, max, mensagem) {
    // Valor digitado
    const valor = campo.value;
    // Vazio pode (é opcional); fora da faixa não pode
    if (valor && (Number(valor) < min || Number(valor) > max)) {
      // Mostra o erro
      setFieldError(campo, mensagem);
      // Errado
      return false;
    }
    // Apaga o erro
    clearFieldError(campo);
    // Certo
    return true;
  }

  // Confere o passo 2: faixas de altura, peso e idade, e os termos
  function validarPasso2(form) {
    // Começa achando que está tudo certo
    let isValid = true;
    // Altura entre 120 e 230 cm
    if (!conferirFaixa(qs("#altura", form), 120, 230, "Altura entre 120 e 230 cm.")) isValid = false;
    // Peso entre 30 e 300 kg
    if (!conferirFaixa(qs("#peso", form), 30, 300, "Peso entre 30 e 300 kg.")) isValid = false;
    // Campo de nascimento
    const nasc = qs("#nascimento", form);
    // Idade a partir do nascimento
    const idade = nasc.value ? (Date.now() - new Date(nasc.value)) / 31557600000 : null;
    // Precisa ter entre 13 e 100 anos
    if (idade !== null && (idade < 13 || idade > 100)) {
      // Mostra o erro
      setFieldError(nasc, "Você precisa ter pelo menos 13 anos.");
      // Marca que tem erro
      isValid = false;
    // Se está certo...
    } else {
      // ...apaga o erro
      clearFieldError(nasc);
    }
    // Caixinha de aceitar os termos
    const terms = qs("#terms", form);
    // Se não aceitou os termos...
    if (!terms.checked) {
      // ...mostra o erro geral
      showGlobalError(form, "Você precisa aceitar os Termos de Uso para continuar.");
      // ...e marca que tem erro
      isValid = false;
    }
    // Se teve erro...
    if (!isValid) {
      // ...foca no primeiro campo errado, ou na caixinha dos termos
      if (form.querySelector(".form-group.has-error input")) focarErro(form);
      // (termos)
      else terms.focus();
    }
    // Devolve se o passo está certo
    return isValid;
  }

  // Mostra um passo e ajusta o indicador e os botões
  function mostrarPasso(form, n) {
    // Guarda o passo
    passo = n;
    // Mostra só o fieldset desse passo
    form.querySelectorAll(".cad-passo").forEach((f) => (f.hidden = Number(f.dataset.passo) !== n));
    // Texto do indicador
    cad("texto").textContent = `Passo ${n} de 2 · ${NOMES_PASSOS[n - 1]}`;
    // Barrinha: metade ou cheia
    cad("barra").style.width = n === 1 ? "50%" : "100%";
    // Botão voltar só no passo 2
    cad("voltar").hidden = n === 1;
    // Texto do botão principal
    qs(".btn-text", form).textContent = n === 1 ? "Continuar" : "Criar conta";
    // Esconde o erro geral antigo
    F.hideGlobalError(form);
    // No passo 2, mostra a inicial do nome na prévia da foto
    if (n === 2 && !foto) cad("foto-previa").textContent = (qs("#name", form).value.trim()[0] || "?").toUpperCase();
    // Coloca o foco no primeiro campo do passo
    form.querySelector(`.cad-passo[data-passo="${n}"] input:not(.sr-only)`).focus();
  }

  // Diminui a foto para 256 x 256 (para caber no navegador) e mostra a prévia
  function lerFoto(arquivo) {
    // Leitor de arquivos
    const leitor = new FileReader();
    // Quando terminar de ler...
    leitor.onload = () => {
      // ...cria uma imagem
      const img = new Image();
      // ...quando a imagem carregar...
      img.onload = () => {
        // ...tela de desenho quadrada
        const c = document.createElement("canvas");
        // Largura
        c.width = 256;
        // Altura
        c.height = 256;
        // Lado menor da foto (para cortar um quadrado do meio)
        const lado = Math.min(img.width, img.height);
        // Desenha o quadrado do meio da foto, diminuído
        c.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 256, 256);
        // Guarda como JPEG leve
        foto = c.toDataURL("image/jpeg", 0.8);
        // Prévia
        const previa = cad("foto-previa");
        // Tira a inicial
        previa.textContent = "";
        // Mostra a foto de fundo
        previa.style.backgroundImage = `url(${foto})`;
        // Troca o texto do botão
        document.querySelector(".cad-foto-botao").textContent = "Trocar foto";
      };
      // Começa a carregar a imagem
      img.src = leitor.result;
    };
    // Lê o arquivo
    leitor.readAsDataURL(arquivo);
  }

  // Lê as respostas do questionário da página inicial (se vieram no endereço)
  function lerQuiz() {
    // Parâmetros do endereço
    const p = new URLSearchParams(window.location.search);
    // Objetivos aceitos
    const objetivos = { Hipertrofia: "ganhar massa", HIIT: "emagrecer", "Resistência": "ter mais fôlego", "Yoga & Mobilidade": "bem-estar" };
    // Níveis aceitos
    const niveis = ["Iniciante", "Intermediário", "Avançado"];
    // Se as respostas não são válidas, ignora
    if (!objetivos[p.get("objetivo")] || !niveis.includes(p.get("nivel"))) return null;
    // Devolve as respostas
    return { objetivo: p.get("objetivo"), nivel: p.get("nivel"), texto: objetivos[p.get("objetivo")] };
  }

  // Espera o HTML da página carregar inteiro
  document.addEventListener("DOMContentLoaded", function () {
    // Acha o formulário de cadastro
    const cadastroForm = document.getElementById("cadastro-form");
    // Se não achou, para
    if (!cadastroForm) return;

    // Desliga a checagem automática do navegador (usamos a nossa)
    cadastroForm.setAttribute("novalidate", "");
    // Liga os botões de olho da senha
    F.initPasswordToggle(cadastroForm);
    // Liga os botões de Google/Apple (avisam "em breve")
    F.initSocialButtons();
    // Liga o medidor de força da senha
    F.initPasswordStrength(cadastroForm);
    // Apaga o erro quando a pessoa volta a digitar
    F.clearErrorOnInput(cadastroForm);

    // Respostas do questionário (se vieram)
    const quiz = lerQuiz();
    // Se vieram...
    if (quiz) {
      // ...mostra o aviso
      cad("quiz").hidden = false;
      // ...com o resumo
      cad("quiz").textContent = `Seu treino para ${quiz.texto} (${quiz.nivel.toLowerCase()}) já fica salvo na conta.`;
    }

    // Quando escolhem uma foto, diminui e mostra
    qs("#foto", cadastroForm).addEventListener("change", (e) => {
      // Arquivo escolhido
      const arquivo = e.target.files[0];
      // Se é uma imagem, lê
      if (arquivo && arquivo.type.startsWith("image/")) lerFoto(arquivo);
    });

    // Ao marcar os termos, some o aviso de "precisa aceitar"
    qs("#terms", cadastroForm).addEventListener("change", (e) => e.target.checked && F.hideGlobalError(cadastroForm));

    // Botão voltar leva ao passo 1
    cad("voltar").addEventListener("click", () => mostrarPasso(cadastroForm, 1));

    // Quando clicam em Continuar / Criar conta...
    cadastroForm.addEventListener("submit", async function (event) {
      // ...impede a página de recarregar
      event.preventDefault();
      // No passo 1: se está tudo certo, vai para o passo 2
      if (passo === 1) {
        // Confere e avança
        if (validarPasso1(cadastroForm)) mostrarPasso(cadastroForm, 2);
        // Para aqui
        return;
      }
      // No passo 2: se tem erro, para
      if (!validarPasso2(cadastroForm)) return;
      // Valor de um campo
      const valor = (id) => qs("#" + id, cadastroForm).value.trim();
      // Dados do passo 2 (só os preenchidos)
      const extra = {};
      // Apelido
      if (valor("apelido")) extra.apelido = valor("apelido");
      // Nascimento
      if (valor("nascimento")) extra.nascimento = valor("nascimento");
      // Altura
      if (valor("altura")) extra.altura = Number(valor("altura"));
      // Peso
      if (valor("peso")) extra.peso = Number(valor("peso"));
      // Foto
      if (foto) extra.foto = foto;
      // Cria a conta (a senha vira hash)
      await F.saveAccount(cadastroForm, extra);
      // Guarda as respostas do questionário para o app usar no "Começar"
      if (quiz) {
        // Tenta salvar
        try {
          // Fica pendente até a pessoa entrar (aí vai para os dados da conta dela)
          sessionStorage.setItem("sl-quiz-pendente", JSON.stringify({ objetivo: quiz.objetivo, nivel: quiz.nivel }));
        // Se o navegador bloquear...
        } catch (e) {
          /* armazenamento indisponível: segue sem salvar */
        }
      }
      // Mostra "Criando conta..." e vai para o login
      F.submitForm(cadastroForm, "Criando conta...", "../login/login.html?cadastro=sucesso");
    });
  });
})();
