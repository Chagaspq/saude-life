/*
 * Funções compartilhadas pelos formulários de login e cadastro.
 * Ficam em window.SaudeLifeForm para os outros scripts usarem.
 */
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Tamanho mínimo da senha: 8 caracteres
  const MIN_PASSWORD_LENGTH = 8;

  // Atalho para achar um elemento (dentro de um lugar ou na página toda)
  function qs(selector, scope) {
    // Procura o primeiro elemento que combina com o seletor
    return (scope || document).querySelector(selector);
  }

  // Confere se o e-mail tem formato válido (algo@algo.algo)
  function isValidEmail(value) {
    // Regra que testa o formato
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Mostra (ou apaga, se a mensagem for vazia) o erro de um campo
  function setFieldError(input, message) {
    // Se o campo não existe, para
    if (!input) return;

    // Pega o id do lugar da mensagem de erro
    const errorId = input.getAttribute("aria-describedby");
    // Acha esse lugar na página
    const errorEl = errorId ? document.getElementById(errorId) : null;
    // Escreve a mensagem (ou deixa vazio)
    if (errorEl) errorEl.textContent = message || "";

    // Tem erro se a mensagem não está vazia
    const hasError = Boolean(message);

    // Avisa os leitores de tela se o campo está inválido
    input.setAttribute("aria-invalid", String(hasError));

    // Acha o grupo do campo
    const formGroup = input.closest(".form-group");
    // Se achou...
    if (formGroup) {
      // ...liga ou desliga a classe de erro (borda vermelha)
      formGroup.classList.toggle("has-error", hasError);
    }
  }

  // Apaga o erro de um campo
  function clearFieldError(input) {
    // (mostra uma mensagem vazia)
    setFieldError(input, "");
  }

  // Mostra o erro geral do formulário
  function showGlobalError(form, message) {
    // Acha a caixa de erro geral
    const el = qs("#form-global-error", form);
    // Se não achou, para
    if (!el) return;
    // Tira o visual de sucesso
    el.classList.remove("is-success");
    // Escreve a mensagem
    el.textContent = message;
    // Mostra a caixa
    el.hidden = false;
  }

  // Mostra uma mensagem de sucesso (usa a mesma caixa)
  function showGlobalSuccess(form, message) {
    // Acha a caixa
    const el = qs("#form-global-error", form);
    // Se não achou, para
    if (!el) return;
    // Põe o visual de sucesso (verde)
    el.classList.add("is-success");
    // Escreve a mensagem
    el.textContent = message;
    // Mostra a caixa
    el.hidden = false;
  }

  // Esconde a caixa de erro geral
  function hideGlobalError(form) {
    // Acha a caixa
    const el = qs("#form-global-error", form);
    // Se não achou, para
    if (!el) return;
    // Esconde
    el.hidden = true;
    // Apaga o texto
    el.textContent = "";
    // Tira o visual de sucesso
    el.classList.remove("is-success");
  }

  // Liga ou desliga o "carregando" do botão
  function setLoading(button, isLoading, loadingText) {
    // Se o botão não existe, para
    if (!button) return;
    // Texto do botão
    const textEl = qs(".btn-text", button);
    // Rodinha de carregando
    const spinnerEl = qs(".spinner", button);
    // Setinha
    const arrowEl = qs(".arrow", button);

    // Desativa o botão enquanto carrega
    button.disabled = isLoading;
    // Avisa os leitores de tela que está ocupado
    button.setAttribute("aria-busy", String(isLoading));

    // Se está carregando...
    if (isLoading) {
      // ...e tem texto...
      if (textEl) {
        // ...guarda o texto original
        button.dataset.originalText = textEl.textContent;
        // ...e troca pelo texto de carregando
        textEl.textContent = loadingText;
      }
      // Mostra a rodinha
      if (spinnerEl) spinnerEl.hidden = false;
      // Esconde a setinha
      if (arrowEl) arrowEl.hidden = true;
    // Se terminou de carregar...
    } else {
      // ...e tem o texto original guardado...
      if (textEl && button.dataset.originalText) {
        // ...volta o texto original
        textEl.textContent = button.dataset.originalText;
      }
      // Esconde a rodinha
      if (spinnerEl) spinnerEl.hidden = true;
      // Mostra a setinha
      if (arrowEl) arrowEl.hidden = false;
    }
  }

  // Liga os botões de olho (mostrar/esconder senha)
  function initPasswordToggle(root) {
    // Acha todos os botões de olho
    const toggles = root.querySelectorAll(".toggle-password");

    // Para cada botão...
    toggles.forEach(function (toggle) {
      // ...quando clicam nele...
      toggle.addEventListener("click", function () {
        // ...acha a caixa do campo de senha
        const wrapper = toggle.closest(".password-wrapper");
        // Se não achou, para
        if (!wrapper) return;
        // Acha o campo dentro da caixa
        const input = qs("input", wrapper);
        // Se não achou, para
        if (!input) return;
        // Vê se a senha está à mostra agora
        const isVisible = input.type === "text";

        // Troca: se estava à mostra esconde, se estava escondida mostra
        input.type = isVisible ? "password" : "text";
        // Avisa os leitores de tela se o botão está apertado
        toggle.setAttribute("aria-pressed", String(!isVisible));
        // Troca o nome do botão para leitores de tela:
        toggle.setAttribute(
          "aria-label",
          // "Mostrar senha" ou "Ocultar senha"
          isVisible ? "Mostrar senha" : "Ocultar senha",
        );
      });
    });
  }

  // Calcula a força da senha
  function passwordStrength(value) {
    // Começa com zero pontos
    let score = 0;
    // +1 ponto se tem 8 caracteres ou mais
    if (value.length >= MIN_PASSWORD_LENGTH) score++;
    // +1 ponto se tem 12 caracteres ou mais
    if (value.length >= 12) score++; // limiar extra para senha "forte"
    // +1 ponto se tem letra maiúscula
    if (/[A-Z]/.test(value)) score++;
    // +1 ponto se tem número
    if (/[0-9]/.test(value)) score++;
    // +1 ponto se tem símbolo
    if (/[^A-Za-z0-9]/.test(value)) score++;

    // Até 1 ponto: fraca (barra em 33%)
    if (score <= 1) return { level: "fraca", percent: 33 };
    // Até 3 pontos: média (barra em 66%)
    if (score <= 3) return { level: "média", percent: 66 };
    // Mais que isso: forte (barra cheia)
    return { level: "forte", percent: 100 };
  }

  // Liga o medidor de força da senha
  function initPasswordStrength(form) {
    // Campo de senha
    const passwordInput = qs("#password", form);
    // Caixa do medidor
    const meter = qs("#password-strength", form);
    // Se faltar algum, para
    if (!passwordInput || !meter) return;

    // Barrinha colorida
    const bar = qs(".strength-bar", meter);
    // Texto da força
    const label = qs(".strength-label", meter);

    // Toda vez que a pessoa digita a senha...
    passwordInput.addEventListener("input", function () {
      // ...se o campo está vazio...
      if (!passwordInput.value) {
        // ...esconde o medidor
        meter.hidden = true;
        // ...e para
        return;
      }
      // Calcula a força
      const { level, percent } = passwordStrength(passwordInput.value);
      // Mostra o medidor
      meter.hidden = false;
      // Se tem a barrinha...
      if (bar) {
        // ...ajusta a largura
        bar.style.width = percent + "%";
        // ...e a cor (pelo nível)
        bar.dataset.level = level;
      }
      // Escreve o texto da força
      if (label) label.textContent = "Força da senha: " + level;
    });
  }

  // Confere o campo de e-mail
  function validateEmailField(emailInput) {
    // Se o campo não existe, está tudo certo
    if (!emailInput) return true;
    // Pega o que foi digitado, sem espaços nas pontas
    const val = emailInput.value.trim();
    // Se está vazio...
    if (!val) {
      // ...mostra o erro
      setFieldError(emailInput, "Digite seu e-mail.");
      // ...e diz que está errado
      return false;
    }
    // Se o formato é inválido...
    if (!isValidEmail(val)) {
      // ...mostra o erro
      setFieldError(emailInput, "Digite um e-mail válido.");
      // ...e diz que está errado
      return false;
    }
    // Se chegou aqui, apaga o erro
    clearFieldError(emailInput);
    // ...e diz que está certo
    return true;
  }

  // Confere o campo de senha
  function validatePasswordField(passwordInput) {
    // Se o campo não existe, está tudo certo
    if (!passwordInput) return true;
    // Pega o que foi digitado
    const val = passwordInput.value;
    // Se está vazio...
    if (!val) {
      // ...mostra o erro
      setFieldError(passwordInput, "Digite sua senha.");
      // ...e diz que está errado
      return false;
    }
    // Se é curta demais...
    if (val.length < MIN_PASSWORD_LENGTH) {
      // ...mostra o erro
      setFieldError(
        passwordInput,
        "A senha precisa ter no mínimo " + MIN_PASSWORD_LENGTH + " caracteres.",
      );
      // ...e diz que está errado
      return false;
    }
    // Se chegou aqui, apaga o erro
    clearFieldError(passwordInput);
    // ...e diz que está certo
    return true;
  }

  // Confere o formulário de login inteiro
  function validateLoginForm(form) {
    // Começa achando que está tudo certo
    let isValid = true;
    // Campo de e-mail
    const email = qs("#email", form);
    // Campo de senha
    const password = qs("#password", form);

    // Se o e-mail está errado, marca erro
    if (!validateEmailField(email)) isValid = false;
    // Se a senha está errada, marca erro
    if (!validatePasswordField(password)) isValid = false;

    // Se teve erro...
    if (!isValid) {
      // ...acha o primeiro campo com erro
      const firstInvalid = form.querySelector(".form-group.has-error input");
      // ...e coloca o foco nele
      if (firstInvalid) firstInvalid.focus();
    }

    // Devolve se está tudo certo
    return isValid;
  }

  // Envia o formulário (simulado) e vai para outra página
  function submitForm(form, loadingText, redirectUrl) {
    // Botão de enviar
    const button = qs(".btn-submit", form);
    // Se não tem botão ou ele já está desativado, para
    if (!button || button.disabled) return;

    // Esconde erros antigos
    hideGlobalError(form);
    // Liga o carregando
    setLoading(button, true, loadingText);

    // Espera 1,2 segundo (simula o servidor)...
    setTimeout(function () {
      // ...desliga o carregando
      setLoading(button, false);
      // ...e vai para a próxima página
      window.location.href = redirectUrl;
    }, 1200);
  }

  // Sem backend: as contas e a sessão ficam salvas no navegador (localStorage).
  // A senha NUNCA é guardada como foi digitada: guardamos só o "hash" dela
  // (um código que não dá para desfazer), igual sistemas de verdade fazem.

  // Lê uma chave do navegador (devolve o padrão se não tiver ou der erro)
  function ler(chave, padrao) {
    // Tenta...
    try {
      // ...ler e transformar o texto em dados
      const valor = JSON.parse(localStorage.getItem(chave));
      // Se não tinha nada, devolve o padrão
      return valor === null ? padrao : valor;
    // Se der erro...
    } catch (e) {
      // ...devolve o padrão
      return padrao;
    }
  }

  // Salva uma chave no navegador
  function gravar(chave, valor) {
    // Tenta...
    try {
      // ...salvar como texto
      localStorage.setItem(chave, JSON.stringify(valor));
    // Se o navegador não deixar salvar...
    } catch (e) {
      /* armazenamento indisponível: segue sem salvar */
    }
  }

  // Gera o hash da senha (SHA-256), misturado com o e-mail para que senhas iguais tenham hashes diferentes
  async function hashSenha(email, senha) {
    // Texto que vai virar hash
    const texto = "saude-life|" + email + "|" + senha;
    // Se o navegador tem a criptografia moderna (sites com https e localhost têm)...
    if (window.crypto && crypto.subtle) {
      // ...transforma o texto em bytes
      const bytes = new TextEncoder().encode(texto);
      // ...calcula o SHA-256
      const resumo = await crypto.subtle.digest("SHA-256", bytes);
      // ...e escreve em hexadecimal (0-9 e a-f)
      return Array.from(new Uint8Array(resumo), (b) => b.toString(16).padStart(2, "0")).join("");
    }
    // Navegador sem criptografia moderna: usa um hash simples (FNV), só para não guardar a senha pura
    let h = 2166136261;
    // Para cada letra...
    for (let i = 0; i < texto.length; i++) {
      // ...mistura a letra no número
      h = Math.imul(h ^ texto.charCodeAt(i), 16777619) >>> 0;
    }
    // Marca que é o hash simples
    return "fnv-" + h.toString(16);
  }

  // Lista de contas criadas neste navegador (traz junto a conta antiga "sl-conta", se existir)
  function lerContas() {
    // Contas salvas
    const contas = ler("sl-contas", []);
    // Conta do jeito antigo (uma só)
    const antiga = ler("sl-conta", null);
    // Se a antiga não está na lista, coloca
    if (antiga && antiga.email && !contas.some((c) => c.email === antiga.email)) contas.push(antiga);
    // Devolve a lista
    return contas;
  }

  // Procura a conta de um e-mail
  function acharConta(email) {
    // Primeira conta com esse e-mail (ou nada)
    return lerContas().find((c) => c.email === email) || null;
  }

  // Salva (cria ou atualiza) uma conta
  function gravarConta(conta) {
    // Tira a versão antiga dessa conta e coloca a nova
    const contas = lerContas().filter((c) => c.email !== conta.email).concat(conta);
    // Salva a lista
    gravar("sl-contas", contas);
    // Mantém "sl-conta" com a última conta (o resto do site ainda lê ela)
    gravar("sl-conta", { nome: conta.nome, email: conta.email });
  }

  // Cria a conta do cadastro (extra = dados do passo 2: apelido, nascimento, altura, peso, foto)
  async function saveAccount(form, extra) {
    // E-mail em letras minúsculas
    const email = qs("#email", form).value.trim().toLowerCase();
    // Dados da conta (sem a senha!)
    const conta = {
      // nome
      nome: qs("#name", form).value.trim(),
      // e-mail
      email,
      // hash da senha
      hash: await hashSenha(email, qs("#password", form).value),
      // quando foi criada
      criada: new Date().toISOString(),
    };
    // Salva a conta
    gravarConta(conta);
    // Se veio o passo 2...
    if (extra) {
      // ...junta com o perfil que já existia (foto, peso, etc. ficam no perfil do app)
      gravar("sl-perfil", Object.assign(ler("sl-perfil", {}), extra));
    }
  }

  // Confere e-mail e senha. Devolve a conta, ou uma mensagem de erro
  async function checkLogin(form) {
    // E-mail digitado
    const email = qs("#email", form).value.trim().toLowerCase();
    // Senha digitada
    const senha = qs("#password", form).value;
    // Conta desse e-mail
    const conta = acharConta(email);
    // Não tem conta: avisa
    if (!conta) return { erro: "Não encontramos uma conta com esse e-mail neste aparelho. Crie sua conta para começar." };
    // Hash da senha digitada
    const hash = await hashSenha(email, senha);
    // Conta antiga sem hash (criada antes desta versão): aceita e já guarda o hash
    if (!conta.hash) {
      // Guarda o hash
      conta.hash = hash;
      // Salva
      gravarConta(conta);
    }
    // Hash diferente: senha errada (mensagem genérica de propósito)
    if (conta.hash !== hash) return { erro: "E-mail ou senha incorretos." };
    // Deu certo
    return { conta };
  }

  // Troca a senha de uma conta (usado na página de redefinir senha)
  async function trocarSenha(email, senha) {
    // Conta desse e-mail
    const conta = acharConta(email);
    // Se não tem, não faz nada
    if (!conta) return false;
    // Novo hash
    conta.hash = await hashSenha(email, senha);
    // Salva
    gravarConta(conta);
    // Deu certo
    return true;
  }

  // Começa a sessão (marca quem está logado)
  function startSession(form, conta) {
    // E-mail digitado, em minúsculas
    const email = qs("#email", form).value.trim().toLowerCase();
    // Nome do cadastro (ou a parte antes do @)
    const nome = (conta && conta.nome) || email.split("@")[0];
    // Salva a sessão no navegador
    gravar("sl-sessao", { nome, email });
  }

  // Mostra "conta criada" quando a pessoa vem do cadastro
  function checkCadastroSuccess(loginForm) {
    // Se não tem formulário, para
    if (!loginForm) return;
    // Lê o que vem depois do ? no endereço
    const params = new URLSearchParams(window.location.search);
    // Se tem cadastro=sucesso...
    if (params.get("cadastro") === "sucesso") {
      // ...mostra a mensagem de sucesso
      showGlobalSuccess(
        loginForm,
        "Conta criada com sucesso! Faça login para continuar.",
      );
    }
  }

  // Apaga o erro de um campo assim que a pessoa digita
  function clearErrorOnInput(form) {
    // Para cada campo do formulário...
    form.querySelectorAll("input").forEach(function (input) {
      // ...toda vez que a pessoa digita...
      input.addEventListener("input", function () {
        // ...acha o grupo do campo
        const formGroup = input.closest(".form-group");
        // ...se ele está com erro...
        if (formGroup && formGroup.classList.contains("has-error")) {
          // ...apaga o erro
          clearFieldError(input);
        }
      });
    });
  }

  // Google e Apple ainda não funcionam: avisa em vez de não fazer nada
  // Liga os botões de Google e Apple (por enquanto só avisam)
  function initSocialButtons() {
    // Procura a caixa de aviso
    let aviso = document.querySelector(".auth-toast");
    // Se ainda não existe...
    if (!aviso) {
      // ...cria uma div
      aviso = document.createElement("div");
      // ...com a classe do aviso
      aviso.className = "auth-toast";
      // ...que os leitores de tela leem
      aviso.setAttribute("role", "status");
      // ...quando muda
      aviso.setAttribute("aria-live", "polite");
      // ...começa escondida
      aviso.hidden = true;
      // ...e coloca no fim da página
      document.body.append(aviso);
    }
    // Guarda o tempo para esconder o aviso
    let timer;
    // Para cada botão social...
    document.querySelectorAll(".btn-social").forEach(function (botao) {
      // ...quando clicam nele...
      botao.addEventListener("click", function () {
        // ...escreve o aviso
        aviso.textContent = "Login social disponível em breve. Use seu e-mail por enquanto.";
        // ...mostra
        aviso.hidden = false;
        // ...cancela o tempo anterior
        clearTimeout(timer);
        // ...e esconde depois de 3 segundos
        timer = setTimeout(function () {
          aviso.hidden = true;
        }, 3000);
      });
    });
  }

  // Deixa as funções disponíveis para login.js e cadastro.js
  window.SaudeLifeForm = {
    initSocialButtons,
    qs,
    setFieldError,
    clearFieldError,
    showGlobalError,
    showGlobalSuccess,
    hideGlobalError,
    initPasswordToggle,
    initPasswordStrength,
    validateEmailField,
    validatePasswordField,
    validateLoginForm,
    submitForm,
    saveAccount,
    startSession,
    checkLogin,
    trocarSenha,
    hashSenha,
    acharConta,
    checkCadastroSuccess,
    clearErrorOnInput,
  };
})();
