# Roteiro da apresentação do TCC (cerca de 12 minutos)

O Saúde Life é um **MVP** de app de treino com dois acessos: **cliente** (quem treina) e **administrador** (academia ou personal).
Ele tem três partes: o **site** (React), a **API** (Java + Spring Boot) e o **banco de dados** (PostgreSQL no ar e SQL Server no computador).

## Antes de começar (10 minutos antes)

1. **Acorde o servidor:** abra https://chagaspq.github.io/saude-life e vá em **Entrar > Demonstração: cliente**. Na primeira vez pode demorar até 1 minuto (o servidor grátis "dorme"). Depois disso fica rápido.
2. Saia da conta (**Perfil > Sair da conta**) e deixe a tela de **Entrar** aberta.
3. Em outra aba, abra a página inicial pública (`welcome`).
4. No computador, deixe abertos (para a parte técnica):
   - **Spring Tools** com o projeto `backend` (a API);
   - **SSMS** (SQL Server Management Studio) com o banco `saudelife`;
   - **Postman** com a coleção `saude-life-api.postman_collection.json` (opcional).
5. Deixe o tema escuro e o idioma em português.

## O caminho (quem fala o quê)

| Tempo | Pessoa | Tela | O que mostrar e falar |
|---|---|---|---|
| 1 min | Pessoa 1 | Página inicial pública | O problema: as pessoas começam a treinar e desistem. A proposta: treino guiado, pontos e acompanhamento de quem entende. |
| 1 min | Pessoa 1 | Criar conta | Mostre a escolha **Sou cliente** ou **Sou administrador** e o campo **Código da academia** (é assim que o cliente entra na academia). Não precisa terminar. |
| 1 min | Pessoa 2 | Entrar > Demonstração: cliente | Só 5 abas: Início, Treinos, Alimentação, Evolução e Perfil. Meta da semana, pontos e próximo treino. |
| 2 min | Pessoa 2 | Treinos > Iniciar treino | Marque 2 séries, mostre o descanso e os pontos. Termine e mostre o resumo. |
| 1 min | Pessoa 2 | Alimentação e Evolução | Adicione uma refeição e um copo d'água. Na Evolução, o gráfico de treinos por semana. |
| 1 min | Pessoa 3 | Perfil > Sair da conta | Volte ao login e toque em **Demonstração: administrador**. |
| 2 min | Pessoa 3 | Painel do administrador | Destaque o **selo ADMIN**, a faixa verde e o **código da academia (SL-DEMO)**. Mostre o cliente de demonstração e quanto ele treinou (o treino de agora há pouco já aparece). Toque em **Mandar treino**, monte e envie. Publique um aviso. |
| 2 min | Pessoa 4 | Parte técnica | **Spring Tools:** a API rodando (pastas modelo, controle, repositório). **SSMS:** as 12 tabelas e os dados (botão direito em `usuarios` > *Select Top 1000 Rows*). Explique: o site chama a API, a API grava no banco. |
| 1 min | Pessoa 4 | Fechamento | Entre de novo como cliente, mostre o aviso no Início e o treino recebido. Os dados estão no servidor: abrem em qualquer celular. Próximos passos: pagamento de verdade (já pronto, falta ativar), e-mail e app na loja. |

## O que muda entre cliente e administrador

| | Cliente | Administrador |
|---|---|---|
| Páginas | Início, Treinos, Alimentação, Evolução e Perfil | Painel do administrador e Perfil |
| Treinos | Registra os próprios treinos | Monta e manda treinos para os clientes |
| Dados | Vê só os próprios dados | Vê só os clientes da própria academia |
| Avisos | Recebe os avisos no Início | Publica avisos para os clientes da academia |
| Marca na tela | Nenhuma | Selo ADMIN no topo e faixa verde |

Essa mesma tabela aparece no **Perfil** de cada conta.

## Como as partes conversam

```
Site (React, GitHub Pages)  --->  API (Java + Spring Boot, Render)  --->  Banco (PostgreSQL no Render / SQL Server no computador)
        tela                        regras e segurança                         12 tabelas
```

## Perguntas que a banca pode fazer

- **Que tecnologias vocês usaram?** Site em **React 18 + Vite** (publicado no GitHub Pages). API em **Java 17 + Spring Boot 3** com **Spring Data JPA** (publicada no Render com Docker). Banco **PostgreSQL** no ar e **SQL Server** no computador: o mesmo código funciona nos dois, só muda a configuração.
- **Onde ficam os dados?** No banco de dados do servidor. Por isso a pessoa entra de qualquer celular e vê os mesmos dados, e o administrador vê os clientes da academia dele.
- **Por que dois bancos?** O servidor grátis (Render) só oferece PostgreSQL. No computador usamos SQL Server, que é o que estudamos. A API usa JPA, então troca de banco sem mudar o código.
- **Quais são as tabelas?** usuarios, academias, treinos, treino_itens, sessoes_treino (histórico), refeicoes, agua_dia, pesos, pontos, avisos, sessoes_login e redefinicoes_senha.
- **A senha é segura?** Fica guardada só como **hash BCrypt**. O login gera um token aleatório; no banco fica só o resumo (SHA-256) dele. Trocar a senha derruba os logins antigos.
- **Um cliente consegue ver dados de outro?** Não. A API confere o token em toda chamada, e o administrador só enxerga os clientes da própria academia.
- **Qualquer um pode criar conta de administrador?** No MVP sim, para facilitar a demonstração. Na versão comercial, a conta de administrador seria liberada só para academias e personais verificados.
- **Por que as telas começam vazias?** Porque é um MVP: nada é inventado, tudo vem do que o usuário registra.
- **E o pagamento?** A integração com o **Mercado Pago** (Pix e cartão) já está no código; para cobrar de verdade só falta colocar a chave da conta. Hoje está em modo de demonstração.
- **E a LGPD?** Tem Termos de Uso e Política de Privacidade, e a pessoa pode baixar ou excluir todos os dados dela pelo Perfil (a API apaga tudo do banco).
- **Como vocês testaram?** Teste automático na API (cadastro, login, treino, refeição, peso, pontos, admin, aviso, troca de senha) e testes de ponta a ponta do site com a API no PostgreSQL e no SQL Server.

## Se algo der errado

- **Login demorando:** o servidor está acordando; espere até 1 minuto.
- **Travou:** recarregue a página (Ctrl+F5).
- **Sem internet:** rode a API no Spring Tools com o SQL Server e mostre pelo Postman (rotas em `backend/README.md`).
- **Quer recomeçar uma conta:** Perfil > Apagar meus dados.
