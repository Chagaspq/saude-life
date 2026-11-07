// Planos dentro do app: escolher plano e pagar (demonstração): teste grátis, Pix ou cartão.
import { useEffect, useState } from "react";
import { montar } from "../montar.jsx";
import AppLayout from "../componentes/AppLayout.jsx";
import { Modal, Confirmar } from "../componentes/base.jsx";
import Planos, { PLANOS, reais, DESCONTO_ANUAL } from "../componentes/Planos.jsx";
import { plano as planoAtual, toast } from "../lib/nucleo.js";
import { ler, gravar } from "../lib/armazenamento.js";
import { confete } from "../lib/efeitos.js";
// Servidor (quando ligado)
import { api, apiLigada } from "../lib/api.js";
import { puxar } from "../lib/nuvem.js";
import "../estilos/kit-app.js";
import "../estilos/app-planos.css";

// Confere o número do cartão (conta de Luhn)
function cartaoValido(numero) {
  // Só números
  const d = numero.replace(/\D/g, "");
  // Tamanho
  if (d.length < 13 || d.length > 19) return false;
  // Soma
  let soma = 0;
  // De trás para frente, dobrando um sim e um não
  for (let i = 0; i < d.length; i++) {
    // Dígito
    let n = Number(d[d.length - 1 - i]);
    // Dobra
    if (i % 2) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
    // Soma
    soma += n;
  }
  // Válido quando termina em 0
  return soma % 10 === 0;
}

// Ativa o plano e recarrega
function ativarPlano(nome, extra = {}) {
  // Plano
  gravar("sl-plano", nome);
  // Assinatura
  gravar("sl-assinatura", { plano: nome, desde: new Date().toISOString(), ...extra });
  // Festa
  confete();
  // Avisa
  toast(extra.teste ? "Teste grátis de 30 dias ativado!" : `Plano ${nome} ativado!`);
}

// Janela de pagamento
function Checkout({ nome, anualInicial, onPronto }) {
  // Plano
  const info = PLANOS.find((p) => p.nome === nome);
  // Anual?
  const [anual, setAnual] = useState(anualInicial);
  // Forma: "pix" | "cartao"
  const [metodo, setMetodo] = useState("pix");
  // Estudante confirmou?
  const [estudante, setEstudante] = useState(false);
  // Campos do cartão
  const [c, setC] = useState({ numero: "", nome: "", validade: "", cvv: "" });
  // Erro do cartão
  const [erro, setErro] = useState("");
  // Processando ("pix" | "cartao")
  const [esperando, setEsperando] = useState("");
  // Valor a pagar
  const valor = anual ? info.mensal * 12 * (1 - DESCONTO_ANUAL) : info.mensal;
  // Código do Pix (exemplo)
  const [codigoPix] = useState(() => `00020126SAUDELIFE${nome.toUpperCase()}${Date.now().toString().slice(-6)}5204000053039865802BR6009SAOPAULO`);
  // Pode testar grátis?
  const teste = nome === "Premium" && !ler("sl-teste-usado", false);
  // Pagamento travado (estudante sem confirmar)?
  const travado = nome === "Estudante" && !estudante;

  // Termina com sucesso
  const concluir = (extra) => (ativarPlano(nome, { anual, valor, ...extra }), onPronto());
  // Pagamento de verdade ligado no servidor?
  const [real, setReal] = useState(false);
  // Pergunta ao servidor
  useEffect(() => {
    // Só com servidor
    if (apiLigada()) api("GET", "/assinaturas/config").then((c) => setReal(!!c.pagamentoReal)).catch(() => {});
  }, []);
  // Vai para a página de pagamento do Mercado Pago
  async function pagarDeVerdade() {
    // Esperando
    setEsperando("mp");
    // Tenta
    try {
      // Cria o pagamento
      const r = await api("POST", "/assinaturas/checkout", { plano: nome, anual });
      // Vai pagar
      location.href = r.link;
    } catch (e) {
      // Erro
      setErro(e.message);
      // Para de esperar
      setEsperando("");
    }
  }

  // Paga com cartão
  function pagarCartao(e) {
    // Sem recarregar
    e.preventDefault();
    // Mês e ano
    const [mm, aa] = c.validade.split("/").map(Number);
    // Confere
    if (!cartaoValido(c.numero)) return setErro("Número do cartão inválido. Confira os dígitos.");
    // Nome
    if (!c.nome.trim()) return setErro("Escreva o nome como está no cartão.");
    // Validade
    if (!mm || mm > 12 || new Date(2000 + aa, mm) < new Date()) return setErro("Validade inválida ou cartão vencido.");
    // CVV
    if (!/^\d{3,4}$/.test(c.cvv)) return setErro("CVV deve ter 3 ou 4 números.");
    // Sem erro
    setErro("");
    // Processando
    setEsperando("cartao");
    // Termina depois de um tempinho
    setTimeout(() => concluir({ metodo: "cartao", final: c.numero.replace(/\D/g, "").slice(-4) }), 1500);
  }

  // Conteúdo
  return (
    <>
      {/* Teste grátis */}
      {teste && (
        <div className="ck-teste">
          <p>
            <strong>30 dias grátis. </strong>Sem cartão agora. Se não gostar, volta para o Free sozinho.
          </p>
          <button
            type="button"
            className="btn-primary btn-block"
            onClick={() => {
              // Marca o teste como usado
              gravar("sl-teste-usado", true);
              // Ativa por 30 dias
              ativarPlano(nome, { teste: true, fim: new Date(Date.now() + 30 * 86400000).toISOString() });
              // Fecha
              onPronto();
            }}
          >
            Começar teste grátis
          </button>
          <p className="ck-ou meta">ou assine agora</p>
        </div>
      )}
      {/* Período */}
      <div className="billing-toggle" role="group" aria-label="Período">
        <button type="button" className={"billing-option" + (anual ? "" : " is-active")} aria-pressed={!anual} onClick={() => setAnual(false)}>
          Mensal
        </button>
        <button type="button" className={"billing-option" + (anual ? " is-active" : "")} aria-pressed={anual} onClick={() => setAnual(true)}>
          Anual -20%
        </button>
      </div>
      {/* Valor */}
      <p className="ck-resumo">{anual ? `${reais(valor)} por ano (${reais(valor / 12)}/mês)` : `${reais(valor)} por mês`}</p>
      {/* Estudante */}
      {nome === "Estudante" && (
        <label className="check-row ck-estudante">
          <input type="checkbox" id="ck-estudante" checked={estudante} onChange={(e) => setEstudante(e.target.checked)} /> Confirmo que sou estudante com matrícula ativa (podemos pedir comprovante)
        </label>
      )}
      {/* Pagamento de verdade (Mercado Pago: Pix ou cartão na página dele) */}
      {real && (
        <div className={"ck-pagamento" + (travado ? " is-travado" : "")} inert={travado ? "" : undefined}>
          <button type="button" className="btn-primary btn-block" disabled={esperando === "mp"} onClick={pagarDeVerdade}>
            {esperando === "mp" ? "Abrindo o pagamento…" : "Pagar com Pix ou cartão (Mercado Pago)"}
          </button>
          <p className="ck-erro" role="alert">
            {erro}
          </p>
          <p className="meta ck-aviso">Você paga na página segura do Mercado Pago e volta para cá. O plano ativa assim que o pagamento for aprovado.</p>
        </div>
      )}
      {/* Pagamento de demonstração */}
      {!real && (
      <div className={"ck-pagamento" + (travado ? " is-travado" : "")} inert={travado ? "" : undefined}>
        {/* Forma */}
        <div className="billing-toggle ck-metodos" role="group" aria-label="Forma de pagamento">
          <button type="button" className={"billing-option" + (metodo === "pix" ? " is-active" : "")} aria-pressed={metodo === "pix"} onClick={() => setMetodo("pix")}>
            Pix
          </button>
          <button type="button" className={"billing-option" + (metodo === "cartao" ? " is-active" : "")} aria-pressed={metodo === "cartao"} onClick={() => setMetodo("cartao")}>
            Cartão de crédito
          </button>
        </div>
        {/* Pix */}
        {metodo === "pix" && (
          <div className="ck-pix">
            <img className="cm-convite-qr" width="160" height="160" alt="QR code do Pix (exemplo)" src={"https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=" + encodeURIComponent(codigoPix)} onError={(e) => (e.target.hidden = true)} />
            <input type="text" readOnly value={codigoPix} className="cm-convite-link" aria-label="Pix copia e cola" />
            <button type="button" className="btn-primary btn-block" disabled={esperando === "pix"} onClick={() => (setEsperando("pix"), setTimeout(() => concluir({ metodo: "pix" }), 2000))}>
              {esperando === "pix" ? "Conferindo pagamento…" : "Já paguei"}
            </button>
          </div>
        )}
        {/* Cartão */}
        {metodo === "cartao" && (
          <form className="ck-cartao modal-form" noValidate onSubmit={pagarCartao}>
            <div className="form-group">
              <label htmlFor="ck-numero">Número do cartão</label>
              <input id="ck-numero" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={23} value={c.numero} onChange={(e) => setC({ ...c, numero: e.target.value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
            </div>
            <div className="form-group">
              <label htmlFor="ck-nome">Nome impresso no cartão</label>
              <input id="ck-nome" autoComplete="cc-name" value={c.nome} onChange={(e) => setC({ ...c, nome: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ck-validade">Validade</label>
                <input id="ck-validade" placeholder="MM/AA" inputMode="numeric" autoComplete="cc-exp" maxLength={5} value={c.validade} onChange={(e) => setC({ ...c, validade: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") })} />
              </div>
              <div className="form-group">
                <label htmlFor="ck-cvv">CVV</label>
                <input id="ck-cvv" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={c.cvv} onChange={(e) => setC({ ...c, cvv: e.target.value.replace(/\D/g, "") })} />
              </div>
            </div>
            <p className="ck-erro" role="alert">
              {erro}
            </p>
            <button type="submit" className="btn-primary btn-block" disabled={esperando === "cartao"}>
              {esperando === "cartao" ? "Processando…" : "Pagar"}
            </button>
          </form>
        )}
      </div>
      )}
      {/* Aviso */}
      {!real && <p className="meta ck-aviso">Ambiente de demonstração: nenhum valor é cobrado. Os dados do cartão não são guardados.</p>}
    </>
  );
}

// Página
function AppPlanos() {
  // Plano escolhido para pagar: { nome, anual }
  const [escolha, setEscolha] = useState(null);
  // Pedido de confirmação
  const [pedido, setPedido] = useState(null);
  // Voltou do Mercado Pago
  useEffect(() => {
    // Resultado no endereço
    const r = new URLSearchParams(location.search).get("pagamento");
    // Aprovado: atualiza o plano
    if (r === "ok") toast("Pagamento aprovado! Seu plano já está ativo."), puxar().catch(() => {});
    // Pendente (ex.: Pix ainda não pago)
    if (r === "pendente") toast("Pagamento em análise. O plano ativa assim que for aprovado.");
    // Recusado
    if (r === "erro") toast("O pagamento não foi aprovado. Tente de novo ou use outra forma.");
  }, []);

  // Escolheu um plano
  function escolher(nome, anual) {
    // Academia: com a recepção
    if (nome === "Academia") return toast("O plano Academia é contratado pela sua academia. Fale com a recepção.");
    // Voltar para o Free
    if (nome === "Free")
      return setPedido({ titulo: "Voltar para o Free?", texto: "Você perde o treino automático sem limite e os recursos do Premium.", rotulo: "Voltar para o Free", fn: () => (gravar("sl-plano", "Free"), gravar("sl-assinatura", null), toast("Você voltou para o Free")) });
    // Pagar
    setEscolha({ nome, anual });
  }

  // Página
  return (
    <AppLayout pagina="planos">
      <section id="view-planos" className="view-section active" aria-labelledby="heading-planos">
        <header className="page-header">
          <div>
            <h1 id="heading-planos">Planos</h1>
            <p className="page-lead">Comece de graça e evolua quando fizer sentido. Sem fidelidade, cancele quando quiser.</p>
          </div>
        </header>
        <Planos atual={planoAtual()} onEscolher={escolher} />
      </section>

      {/* Pagamento */}
      <Modal titulo={escolha ? `Plano ${escolha.nome}` : ""} aberto={!!escolha} onFechar={() => setEscolha(null)}>
        {escolha && <Checkout nome={escolha.nome} anualInicial={escolha.anual} onPronto={() => setEscolha(null)} />}
      </Modal>

      {/* Confirmação */}
      <Confirmar pedido={pedido} onFechar={() => setPedido(null)} />
    </AppLayout>
  );
}

// Desenha
montar(AppPlanos);
