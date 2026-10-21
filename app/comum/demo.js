/*
 * Modo demonstração (para apresentar o TCC):
 * - enche o app com 3 semanas de treinos, pontos e pesos de exemplo;
 * - avança o tempo (1 dia ou até a próxima semana) para mostrar o ranking zerando
 *   e a liga subindo, sem esperar dias de verdade (ver app/comum/relogio.js);
 * - volta para hoje.
 * Fica em SL.demo. O painel aparece no Perfil.
 */
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";
  // Se o núcleo do app não carregou, para aqui
  if (!window.SL) return;

  // Pega do núcleo o criador de elementos e o armazenamento
  const { el, storage } = SL;
  // Um dia em milissegundos
  const DIA = 86400000;

  // Quantos dias o relógio está avançado
  const diasAvancados = () => Number(storage.get("sl-demo-dias", 0)) || 0;

  // Enche o app com 3 semanas de treinos, pontos e pesos
  function preencher() {
    // Treinos da pessoa (para usar nomes de verdade)
    const treinos = SL.treinosDoUsuario();
    // Histórico novo
    const historico = [];
    // Eventos de pontos novos
    const eventos = [];
    // Pesos novos
    const pesos = [];
    // Hoje (do relógio da demonstração)
    const hoje = new Date();
    // Para cada um dos últimos 21 dias...
    for (let d = 21; d >= 1; d--) {
      // ...data desse dia, às 18h30
      const data = new Date(hoje.getTime() - d * DIA);
      // (horário do treino)
      data.setHours(18, 30, 0, 0);
      // ...texto da data
      const iso = data.toISOString();
      // ...dia em texto (para as referências dos pontos)
      const dia = data.toDateString();
      // ...água e 3 refeições todos os dias
      eventos.push({ ref: "demo-agua:" + dia, tipo: "agua", pts: 10, data: iso });
      // (refeições)
      for (let r = 0; r < 3; r++) eventos.push({ ref: `demo-ref${r}:` + dia, tipo: "refeicao", pts: 5, data: iso });
      // ...treina em 4 de cada 7 dias (segunda, terça, quinta e sábado)
      if (![1, 2, 4, 6].includes(data.getDay())) continue;
      // ...treino da vez (vai revezando)
      const treino = treinos[d % treinos.length] || { id: "t1", nome: "Treino" };
      // ...séries feitas
      const series = 16 + (d % 4) * 2;
      // ...entra no histórico
      historico.push({ treinoId: treino.id, nome: treino.nome, data: iso, duracao: 40 + (d % 3) * 8, series, volume: 3200 + d * 90, esforco: ["😮‍💨", "🙂", "💪"][d % 3] });
      // ...pontos do treino
      eventos.push({ ref: "demo-treino:" + dia, tipo: "treino", pts: 50, data: iso });
      // ...pontos de 8 séries (o limite do dia segura o resto)
      for (let s = 0; s < 8; s++) eventos.push({ ref: `demo-serie${s}:` + dia, tipo: "serie", pts: 10, data: iso });
      // ...proteína batida
      eventos.push({ ref: "demo-proteina:" + dia, tipo: "proteina", pts: 15, data: iso });
      // ...um peso por semana (descendo devagar)
      if (data.getDay() === 1) pesos.push({ data: iso, valor: Math.round((79 - (21 - d) * 0.12) * 10) / 10 });
    }
    // Junta com o que a pessoa já tinha (o que é dela fica)
    storage.set("sl-historico", storage.get("sl-historico", []).filter((h) => !h.demo).concat(historico.reverse().map((h) => ({ ...h, demo: true }))));
    // Pontos: tira os da demonstração antiga e põe os novos
    storage.set("sl-pontos", storage.get("sl-pontos", []).filter((e) => !String(e.ref).startsWith("demo-")).concat(eventos));
    // Pesos
    storage.set("sl-pesos", pesos);
    // Marca que o modo demonstração está ligado
    storage.set("sl-demo", true);
  }

  // Avança o relógio alguns dias e recarrega a página
  function avancar(dias) {
    // Soma os dias
    storage.set("sl-demo-dias", diasAvancados() + dias);
    // Recarrega (o relógio é lido ao abrir a página)
    window.location.reload();
  }

  // Avança até a próxima segunda-feira (o ranking da semana zera)
  function fecharSemana() {
    // Dia da semana de "hoje" (0 = domingo)
    const dia = new Date().getDay();
    // Dias até segunda (de 1 a 7)
    avancar(((8 - dia) % 7) || 7);
  }

  // Volta para a data de verdade
  function voltarHoje() {
    // Apaga o avanço
    storage.remove("sl-demo-dias");
    // Recarrega
    window.location.reload();
  }

  // Monta o painel do modo demonstração (usado no Perfil)
  function painel() {
    // Dias avançados
    const dias = diasAvancados();
    // Data que o app acha que é hoje
    const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    // Botão com ação
    const botao = (texto, fn, classe = "btn-secondary") => {
      // Cria o botão
      const b = el("button", { type: "button", class: classe, text: texto });
      // Liga a ação
      b.addEventListener("click", fn);
      // Devolve
      return b;
    };
    // Painel
    return el("section", { class: "panel panel-wide demo-painel", "aria-labelledby": "heading-demo" }, [
      // Título
      el("h2", { id: "heading-demo", text: "Modo demonstração" }),
      // Explicação
      el("p", { class: "meta", text: "Para apresentar o TCC: enche o app de dados e avança o tempo para mostrar o ranking zerando e a liga mudando." }),
      // Data atual do app
      el("p", { class: "demo-data" }, ["Hoje no app: ", el("strong", { text: hoje }), dias ? ` (+${dias} dia${dias > 1 ? "s" : ""})` : ""]),
      // Botões
      el("div", { class: "demo-botoes" }, [
        // Encher de dados
        botao("Encher com dados de exemplo", () => {
          // Preenche
          preencher();
          // Avisa
          SL.toast("Pronto! 3 semanas de treinos, pontos e pesos.");
          // Recarrega para mostrar
          setTimeout(() => window.location.reload(), 900);
        }, "btn-primary"),
        // Avançar 1 dia
        botao("Avançar 1 dia", () => avancar(1)),
        // Fechar a semana
        botao("Fechar a semana", fecharSemana),
        // Voltar para hoje (só se avançou)
        dias ? botao("Voltar para hoje", voltarHoje) : null,
      ]),
    ]);
  }

  // Deixa disponível em SL.demo
  SL.demo = { preencher, avancar, fecharSemana, voltarHoje, painel, diasAvancados };

  // Ao abrir qualquer página do app...
  SL.pagina(() => {
    // ...se veio do botão "conta de demonstração" do login, enche os dados uma vez
    if (storage.get("sl-demo-preencher", false)) {
      // Apaga o pedido
      storage.remove("sl-demo-preencher");
      // Preenche
      preencher();
      // Recarrega para mostrar tudo
      return window.location.reload();
    }
    // ...se o relógio está avançado, mostra um aviso fixo com a data simulada
    const dias = diasAvancados();
    // Sem avanço, para
    if (!dias) return;
    // Aviso no topo da tela
    document.body.append(el("a", { class: "demo-pilula", href: "../perfil/perfil.html#heading-demo", text: `Demonstração: +${dias} dia${dias > 1 ? "s" : ""}` }));
  });
})();
