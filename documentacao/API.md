# Saúde Life: base da API

Desenho da API REST. As tabelas usadas pela API estão em [`backend/banco/banco-de-dados.sql`](../backend/banco/banco-de-dados.sql).

**Feita em:** Java 17 + Spring Boot 3 + PostgreSQL. O código está na pasta [`backend/`](../backend/README.md) (abre no Spring Tools). Esta página é o desenho completo; o `backend/README.md` lista as rotas que já funcionam.

## Regras gerais

- Endereço base: `https://api.saudelife.com.br/v1`
- Tudo em JSON. Datas em ISO 8601 (`2026-11-06T18:30:00Z`).
- **Login:** a resposta do login traz um `token` de acesso (válido por 30 dias). As outras rotas recebem `Authorization: Bearer <token>`.
- **Quem pode o quê:** cada rota diz se é **pública**, **cliente**, **admin** ou **logado** (os dois). Um cliente só vê os próprios dados; um admin só vê os clientes da academia dele.
- **Erros:** `{ "erro": "texto para mostrar na tela" }` com o código certo (400 dado inválido, 401 sem login, 403 sem permissão, 404 não achou, 409 já existe).
- **Senha:** nunca volta em nenhuma resposta; no banco fica só o hash.

## 1. Conta e login

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| POST | `/auth/cadastro` | pública | Cria a conta (nome, e-mail, senha, tipo `cliente` ou `admin`). Admin também cria a academia. |
| POST | `/auth/login` | pública | Entra. Devolve o token e os dados básicos (com o `tipo`). |
| POST | `/auth/renovar` | pública (cookie) | Gera um token novo sem pedir a senha. |
| POST | `/auth/sair` | logado | Sai neste aparelho. |
| POST | `/auth/esqueci-senha` | pública | Manda o e-mail com o link (responde igual mesmo se o e-mail não existir). |
| POST | `/auth/redefinir-senha` | pública | Troca a senha com o token do link. |

Exemplo de cadastro:

```http
POST /v1/auth/cadastro
{ "nome": "Ana Souza", "email": "ana@exemplo.com", "senha": "Treino#2026", "tipo": "cliente", "codigoAcademia": "SL-4F2K" }
```

Resposta `201`:

```json
{ "token": "eyJ...", "usuario": { "id": "8c1e...", "nome": "Ana Souza", "email": "ana@exemplo.com", "tipo": "cliente", "academia": { "id": "b2d0...", "nome": "Academia X" } } }
```

## 2. Meu perfil

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| GET | `/me` | logado | Dados da conta, perfil e plano. |
| PATCH | `/me` | logado | Atualiza nome, apelido, bio, altura, objetivo, nível, meta semanal e preferências. |
| PATCH | `/me/email` | logado | Troca o e-mail (pede a senha atual). |
| PATCH | `/me/senha` | logado | Troca a senha (pede a senha atual). |
| GET | `/me/exportar` | logado | Baixa todos os dados (LGPD). |
| DELETE | `/me` | logado | Exclui a conta e todos os dados (pede a senha). |

## 3. Treinos (cliente)

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| GET | `/exercicios?grupo=Pernas&lugar=casa` | logado | Catálogo de exercícios com filtros. |
| GET | `/treinos` | cliente | Minhas fichas (as minhas e as que o admin mandou, com `autor`). |
| POST | `/treinos` | cliente | Cria uma ficha com os exercícios. |
| PATCH | `/treinos/:id` | cliente | Edita uma ficha minha. |
| DELETE | `/treinos/:id` | cliente | Apaga uma ficha minha. |
| POST | `/sessoes` | cliente | Começa um treino (`treinoId`). |
| POST | `/sessoes/:id/series` | cliente | Marca uma série (exercício, número, reps, carga). Dá pontos. |
| POST | `/sessoes/:id/concluir` | cliente | Termina o treino. Calcula duração e volume e dá os pontos do treino. |
| GET | `/sessoes?de=2026-10-01&ate=2026-11-06` | cliente | Histórico de treinos no período. |

Exemplo de ficha:

```http
POST /v1/treinos
{ "nome": "Treino A - Pernas", "grupo": "Quadríceps e glúteos",
  "itens": [ { "exercicioId": "agachamento-livre", "series": 4, "reps": 10, "carga": 40, "descansoS": 90 },
             { "exercicioId": "leg-press", "series": 3, "reps": 12, "carga": 120, "descansoS": 60 } ] }
```

## 4. Alimentação e evolução (cliente)

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| GET | `/refeicoes?dia=2026-11-06` | cliente | Refeições do dia e totais (kcal e macros). |
| POST | `/refeicoes` | cliente | Registra uma refeição. Dá pontos (até 4 por dia). |
| DELETE | `/refeicoes/:id` | cliente | Apaga uma refeição. |
| PUT | `/agua/:dia` | cliente | Grava o total de água do dia (`{ "ml": 1500 }`). |
| GET | `/pesos?de=...&ate=...` | cliente | Pesos registrados para o gráfico. |
| POST | `/pesos` | cliente | Registra o peso de hoje. |
| GET | `/metas` / PUT `/metas` | cliente | Lê e salva as metas pessoais. |
| GET | `/resumo/semana` | cliente | Números do Início: meta da semana, sequência, total de treinos e tempo. |

## 5. Pontos e avisos (cliente)

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| GET | `/pontos/semana` | cliente | Pontos da semana e liga atual. |
| GET | `/avisos` | cliente | Avisos da minha academia, com `lido: true/false`. |
| POST | `/avisos/:id/lido` | cliente | Marca um aviso como lido (some a bolinha do sino). |

**Regra dos pontos no servidor:** a tabela `pontos` tem `UNIQUE (usuario_id, ref)`, então a mesma ação nunca pontua duas vezes. O limite de 300 pontos por dia é conferido antes de gravar.

## 6. Administrador

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| GET | `/admin/resumo` | admin | Números do painel: clientes, ativos na semana e treinos na semana. |
| GET | `/admin/clientes` | admin | Lista de clientes da academia, com o total de treinos, os da semana, o último treino e o último peso. |
| GET | `/admin/clientes/:id` | admin | Detalhe de um cliente (histórico e evolução). Só da própria academia. |
| POST | `/admin/clientes/:id/treinos` | admin | Monta e manda uma ficha para o cliente (fica com `autor_id` do admin). |
| GET | `/admin/avisos` | admin | Avisos publicados. |
| POST | `/admin/avisos` | admin | Publica um aviso para todos os clientes. |
| DELETE | `/admin/avisos/:id` | admin | Apaga um aviso. |
| GET | `/admin/academia` | admin | Dados da academia e o código para os clientes entrarem. |

Exemplo da lista de clientes:

```json
[ { "id": "8c1e...", "nome": "Ana Souza", "email": "ana@exemplo.com", "treinosTotal": 12, "treinosSemana": 3,
    "ultimoTreino": "2026-11-05T18:30:00Z", "ultimoPesoKg": 62.5 } ]
```

## 7. Assinatura

| Método | Rota | Quem | O que faz |
|---|---|---|---|
| GET | `/planos` | pública | Planos e preços. |
| POST | `/assinaturas/teste` | cliente | Começa o teste grátis de 30 dias (uma vez por conta). |
| POST | `/assinaturas/checkout` | logado | Cria o pagamento no intermediário (Pix ou cartão) e devolve o link ou QR code. |
| POST | `/webhooks/pagamento` | intermediário | O intermediário avisa que o pagamento foi aprovado; o servidor ativa o plano. |
| POST | `/assinaturas/cancelar` | logado | Cancela no fim do período pago. |

## De onde vem cada dado hoje (localStorage → servidor)

| Hoje no navegador | No servidor |
|---|---|
| `sl-contas`, `sl-conta`, `sl-sessao` | `usuarios`, `sessoes_login`, rotas `/auth` |
| `sl-perfil`, `sl-onboarding` | `perfis`, rota `/me` |
| `sl-treinos` | `treinos` + `treino_itens`, rota `/treinos` |
| `sl-historico`, `sl-treino-atual`, `sl-cargas` | `sessoes_treino` + `series_feitas`, rota `/sessoes` |
| `sl-refeicoes`, `sl-agua` | `refeicoes`, `agua_dia` |
| `sl-pesos`, `sl-metas-pessoais` | `pesos`, `metas` |
| `sl-pontos` | `pontos` |
| `sl-avisos-admin`, `sl-lidas` | `avisos`, `avisos_lidos` |
| `sl-plano`, `sl-assinatura`, `sl-teste-usado` | `assinaturas` |
| `sl-dados:<e-mail>` (gaveta de cada conta) | some: cada usuário tem os próprios registros no banco |

## Ordem sugerida para construir

1. Login e cadastro (`/auth`, `/me`), com tipo de conta e academia.
2. Treinos e histórico (`/treinos`, `/sessoes`), que é o coração do app.
3. Painel do admin (`/admin/clientes`, `/admin/avisos`, mandar treino).
4. Alimentação, água, peso e pontos.
5. Assinatura com pagamento de verdade.
6. Trocar, no site, cada `SL.storage.get/set` por chamadas `fetch` para essas rotas, uma tela por vez.
