// Central de ajuda: perguntas por assunto que abrem e fecham, com busca.
// Função que roda sozinha assim que o arquivo carrega
(function () {
  // Modo estrito: o JavaScript avisa mais erros
  "use strict";

  // Perguntas: [assunto, [[pergunta, resposta], ...]]
  const AJUDA = [
    // Conta
    ["Conta e acesso", [
      // Pergunta 1
      ["Esqueci minha senha. E agora?", "Na tela de entrar, toque em \"Esqueci minha senha\" e siga as instruções. Na versão de demonstração, o link aparece na própria tela."],
      // Pergunta 2
      ["Como troco meu e-mail ou senha?", "No app, abra Perfil e toque em \"Trocar e-mail ou senha\". Para trocar, você confirma a senha atual."],
      // Pergunta 3
      ["Como excluo minha conta?", "Em Perfil, no fim da página, toque em \"Excluir minha conta\". Todos os seus dados saem deste aparelho e não dá para desfazer."],
      // Pergunta 4
      ["Meus dados ficam em outro celular?", "Nesta versão, os dados ficam salvos só no aparelho que você usa. Em Perfil você pode baixar uma cópia (backup) e restaurar em outro aparelho."],
    ]],
    // Treinos
    ["Treinos", [
      // Pergunta 1
      ["Como começo um treino?", "Em Início, toque em \"Iniciar treino\", ou abra Treinos e escolha uma ficha. Marque cada série tocando no círculo."],
      // Pergunta 2
      ["O que é o treino automático?", "O app monta um treino para o seu objetivo, nível e tempo. No plano Free você pode usar uma vez; no Premium, sem limite."],
      // Pergunta 3
      ["Dá para treinar em casa?", "Sim. Em Programas, a parte \"Treinos em casa\" só usa o peso do corpo e é grátis."],
      // Pergunta 4
      ["Como adiciono o treino na minha agenda?", "No fim do treino ou na ficha, toque em \"Adicionar à agenda\". O app baixa um arquivo que abre no Google Agenda, no calendário do iPhone ou no Outlook."],
    ]],
    // Pontos
    ["Pontos, ligas e ranking", [
      // Pergunta 1
      ["Como ganho pontos?", "Cada série vale 10 pontos, cada treino concluído 50, refeições 5 (até 4 por dia), meta de água 10, missão do dia 15 e muito mais. O limite é de 300 pontos por dia."],
      // Pergunta 2
      ["Quando o ranking zera?", "O ranking da semana zera toda segunda-feira e o do mês no dia 1º. Seus pontos totais e selos continuam."],
      // Pergunta 3
      ["Como subo de liga?", "Quem faz 500 pontos ou mais na semana sobe de liga no domingo. Quem faz menos de 150 desce. As ligas vão de Bronze até Lenda."],
      // Pergunta 4
      ["Gastar moedas na loja muda meu ranking?", "Não. As moedas são os pontos que você já ganhou, mas gastar na loja do Pulso não tira nada do ranking."],
    ]],
    // Planos
    ["Planos e pagamento", [
      // Pergunta 1
      ["Quanto custa o Premium?", "R$ 14,90 por mês, ou 20% a menos no plano anual. Estudantes pagam R$ 9,90 e o plano Família sai R$ 24,90 para até 4 pessoas."],
      // Pergunta 2
      ["Como funciona o teste grátis?", "São 30 dias de Premium sem cartão. Se você não assinar, volta sozinho para o Free, sem cobrança."],
      // Pergunta 3
      ["Quais formas de pagamento?", "Pix e cartão de crédito. Nesta versão de demonstração, nenhum valor é cobrado de verdade."],
      // Pergunta 4
      ["Posso cancelar quando quiser?", "Pode. Não tem fidelidade nem multa: o plano vale até o fim do período já pago."],
    ]],
    // Privacidade
    ["Privacidade e segurança", [
      // Pergunta 1
      ["Quem vê meu perfil?", "Você escolhe na Comunidade: público, só amigos ou privado."],
      // Pergunta 2
      ["Como bloqueio ou denuncio alguém?", "No feed, toque nos três pontinhos do post e escolha \"Denunciar\" ou \"Bloquear\". Para desbloquear, abra a aba Amigos."],
      // Pergunta 3
      ["Meus dados de saúde são vendidos?", "Não. Seus dados servem só para personalizar o app. Veja tudo na Política de Privacidade."],
    ]],
    // Acessibilidade
    ["Acessibilidade", [
      // Pergunta 1
      ["Como aumento o tamanho das letras?", "Toque no botão de acessibilidade (o bonequinho no topo) e use A+ e A-. Lá também tem alto contraste, cores para daltônicos, modo simples, leitura em voz alta e tradutor em Libras."],
      // Pergunta 2
      ["O app tem outros idiomas?", "Sim: português, inglês e espanhol. Toque no botão de idioma no topo (EN, ES ou PT)."],
    ]],
  ];

  // Tira acentos e deixa minúsculo (para a busca)
  const simples = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  // Lugar das perguntas
  const lista = document.querySelector('[data-render="perguntas"]');

  // Desenha as perguntas (filtradas pela busca)
  function desenhar(busca) {
    // Busca sem acento
    const b = simples(busca || "");
    // Limpa
    lista.replaceChildren();
    // Quantas apareceram
    let total = 0;
    // Para cada assunto...
    AJUDA.forEach(([assunto, perguntas]) => {
      // ...perguntas que batem com a busca
      const achadas = perguntas.filter(([p, r]) => !b || simples(p + " " + r).includes(b));
      // ...se nenhuma, pula o assunto
      if (!achadas.length) return;
      // ...título do assunto
      const titulo = document.createElement("h2");
      // Texto
      titulo.textContent = assunto;
      // Coloca
      lista.append(titulo);
      // ...cada pergunta
      achadas.forEach(([p, r]) => {
        // Caixa que abre e fecha
        const d = document.createElement("details");
        // Pergunta
        const s = document.createElement("summary");
        // Texto
        s.textContent = p;
        // Resposta
        const t = document.createElement("p");
        // Texto
        t.textContent = r;
        // Junta
        d.append(s, t);
        // Com busca, já abre
        if (b) d.open = true;
        // Coloca
        lista.append(d);
        // Conta
        total++;
      });
    });
    // Nada encontrado
    if (!total) {
      // Aviso
      const p = document.createElement("p");
      // Texto
      p.textContent = "Nada encontrado. Tente outra palavra ou fale com a gente abaixo.";
      // Coloca
      lista.append(p);
    }
  }

  // Busca enquanto digita
  document.getElementById("ajuda-busca").addEventListener("input", (e) => desenhar(e.target.value.trim()));
  // Desenha a primeira vez
  desenhar("");
})();
