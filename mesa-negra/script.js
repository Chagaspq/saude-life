/* ==========================================================
   MESA NEGRA — Script
   Funções: menu mobile, rolagem suave, animações ao rolar
   e formulários (sem envio real por enquanto)
   ========================================================== */

// Avisa o CSS que o JavaScript está ativo (ativa as animações)
document.documentElement.classList.add("js");

// Verifica se o usuário prefere menos movimento
const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Menu mobile (hambúrguer) ---------- */
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

function fecharMenu() {
  menu.classList.remove("aberto");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Abrir menu");
}

menuBtn.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  menuBtn.setAttribute("aria-expanded", String(aberto));
  menuBtn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});

// Fecha o menu com a tecla Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("aberto")) {
    fecharMenu();
    menuBtn.focus();
  }
});

/* ---------- 2. Rolagem suave até cada seção ---------- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (id === "#") return; // links das redes sociais ainda sem endereço

    const alvo = document.querySelector(id);
    if (!alvo) return;

    e.preventDefault();
    alvo.scrollIntoView({ behavior: menosMovimento ? "auto" : "smooth" });
    history.replaceState(null, "", id);
    fecharMenu();
  });
});

/* ---------- 3. Sombra no menu + link ativo ao rolar ---------- */
const topo = document.getElementById("topo");
const linksMenu = document.querySelectorAll(".menu a");
const secoes = document.querySelectorAll("main section[id]");

window.addEventListener("scroll", () => {
  topo.classList.toggle("com-sombra", window.scrollY > 10);
}, { passive: true });

// Marca no menu a seção que está na tela
const observadorSecoes = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    linksMenu.forEach((a) => {
      a.classList.toggle("ativo", a.getAttribute("href") === "#" + entrada.target.id);
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });

secoes.forEach((s) => observadorSecoes.observe(s));

/* ---------- 4. Animação de aparecer ao rolar ---------- */
const elementosRevelar = document.querySelectorAll(".revelar");

if (menosMovimento || !("IntersectionObserver" in window)) {
  // Sem animação: mostra tudo direto
  elementosRevelar.forEach((el) => el.classList.add("visivel"));
} else {
  const observadorRevelar = new IntersectionObserver((entradas, obs) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        obs.unobserve(entrada.target); // anima só uma vez
      }
    });
  }, { threshold: 0.15 });

  elementosRevelar.forEach((el) => observadorRevelar.observe(el));
}

/* ---------- 5. Formulários ---------- */
// Ainda não há servidor nem conta da ONG: os formulários só confirmam
// o interesse na tela, sem enviar dados nem cobrar nada.
const form = document.getElementById("formAjuda");
const aviso = document.getElementById("formAviso");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const campos = form.querySelectorAll("input, select");
  let valido = true;
  campos.forEach((campo) => {
    const ok = campo.checkValidity();
    campo.classList.toggle("invalido", !ok);
    if (!ok) valido = false;
  });

  if (!valido) {
    aviso.textContent = "Preencha todos os campos corretamente.";
    aviso.classList.add("erro");
    return;
  }

  const nome = form.nome.value.trim().split(" ")[0];
  aviso.textContent = `Obrigado, ${nome}! Assim que abrirmos as inscrições, entraremos em contato.`;
  aviso.classList.remove("erro");
  form.reset();
});

// Formulário de doação
const formDoar = document.getElementById("formDoar");
const doarAviso = document.getElementById("doarAviso");

formDoar.addEventListener("submit", (e) => {
  e.preventDefault();

  const valor = formDoar.querySelector('input[name="valor"]:checked');
  const grupoValores = formDoar.querySelector(".opcoes--valores");
  grupoValores.classList.toggle("invalido", !valor);

  if (!valor) {
    doarAviso.textContent = "Escolha um valor para continuar.";
    doarAviso.classList.add("erro");
    return;
  }

  const tipo = formDoar.querySelector('input[name="tipo"]:checked').value;
  const quando = tipo === "mensal" ? " por mês" : "";
  doarAviso.textContent = `Obrigado por querer doar R$ ${valor.value}${quando}! Nenhum valor foi cobrado: avisaremos aqui quando as doações estiverem abertas.`;
  doarAviso.classList.remove("erro");
});
