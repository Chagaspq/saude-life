-- =====================================================================
-- Saúde Life: base do banco de dados (PostgreSQL)
-- Proposta para quando o site sair do navegador (localStorage) e ganhar
-- um servidor. Cobre o MVP: cliente e administrador, treinos, refeições,
-- água, peso, pontos, avisos e assinatura.
-- Cada tabela diz, no comentário, qual chave "sl-..." ela substitui.
-- =====================================================================

-- Extensão para gerar ids aleatórios (uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tipos fixos: tipo de conta
CREATE TYPE tipo_conta AS ENUM ('cliente', 'admin');
-- Tipos fixos: objetivo do cliente
CREATE TYPE objetivo AS ENUM ('Hipertrofia', 'HIIT', 'Resistência', 'Yoga & Mobilidade');
-- Tipos fixos: nível do cliente
CREATE TYPE nivel AS ENUM ('Iniciante', 'Intermediário', 'Avançado');

-- ---------------------------------------------------------------------
-- Academias (cada administrador cuida de uma academia ou é um personal)
-- ---------------------------------------------------------------------
CREATE TABLE academias (
  -- Identificador
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nome que aparece para os clientes
  nome          text NOT NULL,
  -- Código curto para o cliente entrar na academia (ex.: "SL-4F2K")
  codigo        text NOT NULL UNIQUE,
  -- Quando foi criada
  criada_em     timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Usuários (substitui sl-contas, sl-conta e sl-sessao)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  -- Identificador
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nome completo
  nome            text NOT NULL,
  -- E-mail (login), sempre em minúsculas
  email           text NOT NULL UNIQUE CHECK (email = lower(email)),
  -- Senha guardada só como hash (bcrypt ou argon2 no servidor; nunca o texto)
  senha_hash      text NOT NULL,
  -- Cliente ou administrador
  tipo            tipo_conta NOT NULL DEFAULT 'cliente',
  -- Academia do usuário (cliente: onde treina; admin: a que ele administra)
  academia_id     uuid REFERENCES academias(id) ON DELETE SET NULL,
  -- E-mail confirmado?
  email_confirmado boolean NOT NULL DEFAULT false,
  -- Quando foi criado
  criado_em       timestamptz NOT NULL DEFAULT now()
);
-- Busca rápida dos clientes de uma academia (painel do admin)
CREATE INDEX usuarios_academia_idx ON usuarios (academia_id) WHERE tipo = 'cliente';

-- ---------------------------------------------------------------------
-- Perfil do cliente (substitui sl-perfil e sl-onboarding)
-- ---------------------------------------------------------------------
CREATE TABLE perfis (
  -- Um perfil por usuário
  usuario_id    uuid PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Apelido para a saudação
  apelido       text,
  -- Bio curta
  bio           text,
  -- Foto (endereço do arquivo no armazenamento)
  foto_url      text,
  -- Data de nascimento
  nascimento    date,
  -- Altura em centímetros
  altura_cm     smallint CHECK (altura_cm BETWEEN 120 AND 230),
  -- Objetivo escolhido no questionário
  objetivo      objetivo,
  -- Nível
  nivel         nivel,
  -- Meta de treinos por semana
  meta_semanal  smallint NOT NULL DEFAULT 3 CHECK (meta_semanal BETWEEN 1 AND 7),
  -- Preferências (lembretes, horário de silêncio, idioma, tema...) em JSON
  preferencias  jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------------------------------------------------------------
-- Catálogo de exercícios (hoje em app/comum/exercicios.js)
-- ---------------------------------------------------------------------
CREATE TABLE exercicios (
  -- Identificador curto (ex.: "agachamento-livre")
  id            text PRIMARY KEY,
  -- Nome
  nome          text NOT NULL,
  -- Grupo muscular (Pernas, Peito, Costas...)
  grupo         text NOT NULL,
  -- Músculos trabalhados
  musculos      text[] NOT NULL DEFAULT '{}',
  -- Onde dá para fazer: casa, academia ou ambos
  lugar         text NOT NULL DEFAULT 'ambos',
  -- Carga sugerida para começar (kg)
  carga_sugerida numeric(5,1) NOT NULL DEFAULT 0,
  -- Passo a passo
  dicas         text[] NOT NULL DEFAULT '{}',
  -- Erro mais comum
  erro_comum    text
);

-- ---------------------------------------------------------------------
-- Treinos (fichas) do cliente (substitui sl-treinos)
-- ---------------------------------------------------------------------
CREATE TABLE treinos (
  -- Identificador
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dono da ficha (o cliente)
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Nome (ex.: "Treino A - Pernas")
  nome          text NOT NULL,
  -- Grupo/descrição curta
  grupo         text,
  -- Quem montou: o próprio cliente (NULL) ou um administrador
  autor_id      uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  -- Recado de quem montou
  observacao    text,
  -- Quando foi criada
  criado_em     timestamptz NOT NULL DEFAULT now()
);
-- Treinos de um cliente
CREATE INDEX treinos_usuario_idx ON treinos (usuario_id);

-- Exercícios de cada ficha, em ordem
CREATE TABLE treino_itens (
  -- Ficha
  treino_id     uuid NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
  -- Posição na ficha (1, 2, 3...)
  ordem         smallint NOT NULL,
  -- Exercício do catálogo
  exercicio_id  text NOT NULL REFERENCES exercicios(id),
  -- Séries
  series        smallint NOT NULL DEFAULT 3 CHECK (series BETWEEN 1 AND 10),
  -- Repetições (ou segundos, se for por tempo)
  reps          smallint NOT NULL DEFAULT 12,
  -- Carga em kg
  carga         numeric(5,1) NOT NULL DEFAULT 0,
  -- Descanso em segundos
  descanso_s    smallint NOT NULL DEFAULT 60,
  -- Chave da tabela: ficha + posição
  PRIMARY KEY (treino_id, ordem)
);

-- ---------------------------------------------------------------------
-- Treinos feitos (substitui sl-historico e sl-treino-atual)
-- ---------------------------------------------------------------------
CREATE TABLE sessoes_treino (
  -- Identificador
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Quem treinou
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Ficha usada (pode ter sido apagada depois)
  treino_id     uuid REFERENCES treinos(id) ON DELETE SET NULL,
  -- Nome da ficha no dia (fica mesmo se a ficha mudar)
  nome          text NOT NULL,
  -- Começo
  iniciado_em   timestamptz NOT NULL DEFAULT now(),
  -- Fim (NULL = em andamento)
  concluido_em  timestamptz,
  -- Duração em minutos
  duracao_min   smallint,
  -- Séries feitas
  series        smallint NOT NULL DEFAULT 0,
  -- Volume (carga × repetições, em kg)
  volume_kg     integer NOT NULL DEFAULT 0,
  -- Esforço que a pessoa marcou (facil, ok, pesado)
  esforco       text
);
-- Histórico de um cliente, do mais novo para o mais velho
CREATE INDEX sessoes_usuario_data_idx ON sessoes_treino (usuario_id, iniciado_em DESC);

-- Cada série marcada durante o treino (substitui sl-cargas e sl-recordes)
CREATE TABLE series_feitas (
  -- Identificador
  id            bigserial PRIMARY KEY,
  -- Treino feito
  sessao_id     uuid NOT NULL REFERENCES sessoes_treino(id) ON DELETE CASCADE,
  -- Exercício
  exercicio_id  text NOT NULL REFERENCES exercicios(id),
  -- Número da série
  numero        smallint NOT NULL,
  -- Repetições feitas
  reps          smallint NOT NULL,
  -- Carga usada
  carga         numeric(5,1) NOT NULL DEFAULT 0,
  -- Quando marcou
  feita_em      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Alimentação (substitui sl-refeicoes, sl-refeicoes-dias e sl-agua)
-- ---------------------------------------------------------------------
CREATE TABLE refeicoes (
  -- Identificador
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dono
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Dia
  dia           date NOT NULL,
  -- Nome (Café da manhã, Almoço...)
  nome          text NOT NULL,
  -- Hora
  hora          time,
  -- O que comeu
  descricao     text,
  -- Calorias e macros
  kcal          smallint NOT NULL DEFAULT 0,
  -- Proteína (g)
  proteina_g    smallint NOT NULL DEFAULT 0,
  -- Carboidrato (g)
  carbo_g       smallint NOT NULL DEFAULT 0,
  -- Gordura (g)
  gordura_g     smallint NOT NULL DEFAULT 0
);
-- Refeições de um dia
CREATE INDEX refeicoes_usuario_dia_idx ON refeicoes (usuario_id, dia);

-- Água bebida por dia (um registro por dia)
CREATE TABLE agua_dia (
  -- Dono
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Dia
  dia           date NOT NULL,
  -- Total em ml
  ml            integer NOT NULL DEFAULT 0 CHECK (ml BETWEEN 0 AND 10000),
  -- Um por pessoa por dia
  PRIMARY KEY (usuario_id, dia)
);

-- ---------------------------------------------------------------------
-- Evolução: pesos registrados (substitui sl-pesos) e metas (sl-metas-pessoais)
-- ---------------------------------------------------------------------
CREATE TABLE pesos (
  -- Identificador
  id            bigserial PRIMARY KEY,
  -- Dono
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Quando
  registrado_em timestamptz NOT NULL DEFAULT now(),
  -- Peso em kg
  valor_kg      numeric(5,1) NOT NULL CHECK (valor_kg BETWEEN 30 AND 300)
);

-- Metas pessoais (uma por pessoa)
CREATE TABLE metas (
  -- Dono
  usuario_id    uuid PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Peso alvo
  peso_alvo_kg  numeric(5,1),
  -- Peso no começo
  peso_inicio_kg numeric(5,1),
  -- Exercício da meta de carga
  exercicio_id  text REFERENCES exercicios(id),
  -- Carga alvo
  carga_alvo    numeric(5,1),
  -- Até quando
  data_alvo     date
);

-- ---------------------------------------------------------------------
-- Pontos (substitui sl-pontos). "ref" evita pontuar a mesma ação 2 vezes.
-- ---------------------------------------------------------------------
CREATE TABLE pontos (
  -- Identificador
  id            bigserial PRIMARY KEY,
  -- Dono
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Tipo (serie, treino, refeicao, agua, proteina, sequencia...)
  tipo          text NOT NULL,
  -- Referência única da ação (ex.: "treino:<id da sessão>")
  ref           text NOT NULL,
  -- Pontos ganhos
  pts           smallint NOT NULL,
  -- Quando
  ganho_em      timestamptz NOT NULL DEFAULT now(),
  -- A mesma ação não pontua duas vezes
  UNIQUE (usuario_id, ref)
);
-- Soma da semana
CREATE INDEX pontos_usuario_data_idx ON pontos (usuario_id, ganho_em);

-- ---------------------------------------------------------------------
-- Avisos da academia (substitui sl-avisos-admin)
-- ---------------------------------------------------------------------
CREATE TABLE avisos (
  -- Identificador
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Academia que publicou
  academia_id   uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  -- Administrador que escreveu
  autor_id      uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  -- Texto
  texto         text NOT NULL CHECK (char_length(texto) <= 200),
  -- Quando
  criado_em     timestamptz NOT NULL DEFAULT now()
);

-- Quais avisos cada cliente já leu (substitui sl-lidas)
CREATE TABLE avisos_lidos (
  -- Aviso
  aviso_id      uuid NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
  -- Cliente
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Quando leu
  lido_em       timestamptz NOT NULL DEFAULT now(),
  -- Um por pessoa
  PRIMARY KEY (aviso_id, usuario_id)
);

-- ---------------------------------------------------------------------
-- Assinatura (substitui sl-plano, sl-assinatura e sl-teste-usado)
-- ---------------------------------------------------------------------
CREATE TABLE assinaturas (
  -- Identificador
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dono
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Plano (Free, Premium, Estudante, Família, Profissional, Academia)
  plano         text NOT NULL,
  -- ativa, teste, cancelada, vencida
  status        text NOT NULL DEFAULT 'ativa',
  -- Mensal ou anual
  periodo       text NOT NULL DEFAULT 'mensal',
  -- Começo e fim
  inicio        timestamptz NOT NULL DEFAULT now(),
  -- Fim (teste grátis ou fim do período pago)
  fim           timestamptz,
  -- Id do pagamento no intermediário (Mercado Pago, Stripe...); nunca dados do cartão
  pagamento_ref text
);

-- ---------------------------------------------------------------------
-- Segurança: sessões de login e links de redefinir senha
-- ---------------------------------------------------------------------
CREATE TABLE sessoes_login (
  -- Identificador (vai no token de atualização)
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dono
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Quando expira ("Lembrar de mim" = 30 dias; sem = 1 dia)
  expira_em     timestamptz NOT NULL,
  -- Aparelho/navegador (para a pessoa ver onde está logada)
  aparelho      text,
  -- Quando foi criada
  criada_em     timestamptz NOT NULL DEFAULT now()
);

-- Links de redefinir senha (guardamos só o hash do token)
CREATE TABLE redefinicoes_senha (
  -- Hash do token mandado por e-mail
  token_hash    text PRIMARY KEY,
  -- Dono
  usuario_id    uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  -- Vale por 1 hora
  expira_em     timestamptz NOT NULL,
  -- Já foi usado?
  usado         boolean NOT NULL DEFAULT false
);
