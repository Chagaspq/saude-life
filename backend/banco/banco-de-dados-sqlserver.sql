-- =====================================================================
-- Saúde Life: banco de dados para o Microsoft SQL Server (T-SQL)
-- São as mesmas tabelas que a API (pasta backend/) usa com o perfil "sqlserver".
-- A API cria tudo sozinha ao ligar; este arquivo serve para criar à mão
-- no SQL Server Management Studio (SSMS) e para mostrar o banco no TCC.
--
-- Como usar no SSMS:
--   1. Conecte no servidor (ex.: localhost\SQLEXPRESS).
--   2. New Query > cole este arquivo inteiro > Execute (F5).
-- =====================================================================

-- Cria o banco (se ainda não existe)
IF DB_ID(N'saudelife') IS NULL CREATE DATABASE saudelife;
GO
-- Usa o banco
USE saudelife;
GO

-- ---------------------------------------------------------------------
-- Academias (ou personais). O admin cuida de uma; o cliente entra pelo código.
-- ---------------------------------------------------------------------
CREATE TABLE academias (
  -- Identificador
  id          uniqueidentifier NOT NULL PRIMARY KEY,
  -- Nome que aparece para os clientes
  nome        nvarchar(255) NOT NULL,
  -- Código para o cliente entrar (ex.: SL-4F2K)
  codigo      nvarchar(255) NOT NULL UNIQUE,
  -- Quando foi criada
  criada_em   datetimeoffset(6) NULL
);

-- ---------------------------------------------------------------------
-- Usuários: a conta e o perfil (cliente ou admin)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  -- Identificador
  id           uniqueidentifier NOT NULL PRIMARY KEY,
  -- Nome completo
  nome         nvarchar(255) NOT NULL,
  -- E-mail do login (único)
  email        nvarchar(255) NOT NULL UNIQUE,
  -- Senha guardada só como hash BCrypt
  senha_hash   nvarchar(255) NOT NULL,
  -- Tipo de conta
  tipo         nvarchar(255) NOT NULL CHECK (tipo IN (N'cliente', N'admin')),
  -- Academia (cliente: onde treina; admin: a que administra)
  academia_id  uniqueidentifier NULL REFERENCES academias(id),
  -- Quando a conta foi criada
  criado_em    datetimeoffset(6) NULL,
  -- Perfil: apelido, bio e altura
  apelido      nvarchar(255) NULL,
  bio          nvarchar(255) NULL,
  altura_cm    int NULL,
  -- Questionário: objetivo, nível e meta de treinos por semana
  objetivo     nvarchar(255) NULL,
  nivel        nvarchar(255) NULL,
  dias_semana  int NULL,
  -- Plano (Free, Premium...), fim do plano e se já usou o teste
  plano        nvarchar(255) NULL,
  plano_fim    datetimeoffset(6) NULL,
  teste_usado  bit NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- Logins abertos (o token fica no site; aqui só o resumo SHA-256 dele)
-- ---------------------------------------------------------------------
CREATE TABLE sessoes_login (
  -- Resumo do token
  token_hash  nvarchar(255) NOT NULL PRIMARY KEY,
  -- Dono
  usuario_id  uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Até quando vale
  expira_em   datetimeoffset(6) NOT NULL
);

-- ---------------------------------------------------------------------
-- Pedidos de "esqueci a senha" (link vale 1 hora, uma vez só)
-- ---------------------------------------------------------------------
CREATE TABLE redefinicoes_senha (
  -- Resumo do token do link
  token_hash  nvarchar(255) NOT NULL PRIMARY KEY,
  -- Dono
  usuario_id  uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Até quando vale
  expira_em   datetimeoffset(6) NOT NULL,
  -- Já foi usado?
  usado       bit NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- Fichas de treino (do cliente ou mandadas pelo admin)
-- ---------------------------------------------------------------------
CREATE TABLE treinos (
  -- Identificador
  id          uniqueidentifier NOT NULL PRIMARY KEY,
  -- Dono (o cliente que vai treinar)
  usuario_id  uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Quem mandou (admin); vazio se o cliente criou
  autor_id    uniqueidentifier NULL REFERENCES usuarios(id),
  -- Nome e grupo muscular
  nome        nvarchar(255) NOT NULL,
  grupo       nvarchar(255) NULL,
  -- Quando foi criada
  criado_em   datetimeoffset(6) NULL
);

-- ---------------------------------------------------------------------
-- Exercícios de cada ficha, em ordem
-- ---------------------------------------------------------------------
CREATE TABLE treino_itens (
  -- Identificador (número automático)
  id         bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
  -- Ficha
  treino_id  uniqueidentifier NOT NULL REFERENCES treinos(id),
  -- Posição na ficha
  ordem      int NOT NULL,
  -- Exercício
  nome       nvarchar(255) NOT NULL,
  -- Séries, repetições (ou tempo, ex.: "40 s"), carga em kg e descanso em segundos
  series     int NOT NULL,
  reps       nvarchar(255) NULL,
  carga      float NOT NULL,
  descansos  int NOT NULL
);

-- ---------------------------------------------------------------------
-- Treinos concluídos (histórico): Início, Evolução e painel do admin
-- ---------------------------------------------------------------------
CREATE TABLE sessoes_treino (
  -- Identificador
  id           uniqueidentifier NOT NULL PRIMARY KEY,
  -- Quem treinou
  usuario_id   uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Ficha usada (pode ter sido apagada depois)
  treino_id    uniqueidentifier NULL,
  -- Nome do treino e quando terminou
  nome         nvarchar(255) NOT NULL,
  data         datetimeoffset(6) NOT NULL,
  -- Duração (min), séries feitas, volume (kg) e calorias
  duracao_min  int NOT NULL,
  series       int NOT NULL,
  volume       float NOT NULL,
  kcal         int NOT NULL,
  -- Como foi: facil, ok, pesado ou muito
  esforco      nvarchar(255) NULL
);
-- Busca rápida do histórico de cada pessoa
CREATE INDEX sessoes_treino_usuario_data ON sessoes_treino (usuario_id, data);

-- ---------------------------------------------------------------------
-- Refeições
-- ---------------------------------------------------------------------
CREATE TABLE refeicoes (
  -- Identificador
  id          uniqueidentifier NOT NULL PRIMARY KEY,
  -- Dono
  usuario_id  uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Dia e horário
  dia         date NOT NULL,
  hora        nvarchar(255) NULL,
  -- Nome e o que comeu
  nome        nvarchar(255) NOT NULL,
  descricao   nvarchar(255) NULL,
  -- Calorias e macros (gramas)
  kcal        int NOT NULL,
  proteina    int NOT NULL,
  carbo       int NOT NULL,
  gordura     int NOT NULL
);
-- Busca rápida das refeições do dia
CREATE INDEX refeicoes_usuario_dia ON refeicoes (usuario_id, dia);

-- ---------------------------------------------------------------------
-- Água de cada dia (uma linha por pessoa por dia)
-- ---------------------------------------------------------------------
CREATE TABLE agua_dia (
  -- Identificador
  id          bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
  -- Dono
  usuario_id  uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Dia e total em ml
  dia         date NOT NULL,
  ml          int NOT NULL,
  -- Um registro por dia
  UNIQUE (usuario_id, dia)
);

-- ---------------------------------------------------------------------
-- Pesos registrados
-- ---------------------------------------------------------------------
CREATE TABLE pesos (
  -- Identificador
  id          bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
  -- Dono
  usuario_id  uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Quando e quanto
  data        datetimeoffset(6) NOT NULL,
  valor_kg    float NOT NULL
);
-- Busca rápida para o gráfico
CREATE INDEX pesos_usuario_data ON pesos (usuario_id, data);

-- ---------------------------------------------------------------------
-- Pontos (a mesma ação nunca pontua duas vezes)
-- ---------------------------------------------------------------------
CREATE TABLE pontos (
  -- Identificador
  id          bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
  -- Dono
  usuario_id  uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Código da ação (ex.: "treino:<id>") e tipo (serie, treino, refeicao...)
  ref         nvarchar(255) NOT NULL,
  tipo        nvarchar(255) NOT NULL,
  -- Quantos pontos e quando
  pts         int NOT NULL,
  data        datetimeoffset(6) NULL,
  -- Cada ação uma vez só
  UNIQUE (usuario_id, ref)
);

-- ---------------------------------------------------------------------
-- Avisos do admin para os clientes da academia
-- ---------------------------------------------------------------------
CREATE TABLE avisos (
  -- Identificador
  id           uniqueidentifier NOT NULL PRIMARY KEY,
  -- Academia que recebe e quem publicou
  academia_id  uniqueidentifier NOT NULL REFERENCES academias(id),
  autor_id     uniqueidentifier NOT NULL REFERENCES usuarios(id),
  -- Texto (até 120 letras) e quando
  texto        nvarchar(120) NOT NULL,
  data         datetimeoffset(6) NULL
);
GO
