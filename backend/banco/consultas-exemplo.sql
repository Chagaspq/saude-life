-- =====================================================================
-- Saúde Life: consultas de exemplo para mostrar no SQL Server (SSMS)
-- Rode depois de criar o banco (banco-de-dados-sqlserver.sql) e de ligar a API
-- com o perfil "sqlserver" (ela cria as contas de demonstração).
-- Selecione um bloco e aperte F5 para rodar só ele.
-- =====================================================================
USE saudelife;
GO

-- ---------------------------------------------------------------------
-- 1. SELECT: todas as contas (repare: a senha está só como hash BCrypt)
-- ---------------------------------------------------------------------
SELECT nome, email, tipo, senha_hash, criado_em
FROM usuarios
ORDER BY criado_em;

-- ---------------------------------------------------------------------
-- 2. JOIN: cada cliente com o nome da academia dele
-- ---------------------------------------------------------------------
SELECT u.nome AS cliente, u.email, a.nome AS academia, a.codigo
FROM usuarios u
JOIN academias a ON a.id = u.academia_id
WHERE u.tipo = 'cliente';

-- ---------------------------------------------------------------------
-- 3. JOIN + GROUP BY: quantos treinos cada cliente fez e quando foi o último
--    (é o que aparece no Painel do administrador)
-- ---------------------------------------------------------------------
SELECT u.nome AS cliente,
       COUNT(s.id)  AS treinos_feitos,
       MAX(s.data)  AS ultimo_treino,
       SUM(s.volume) AS volume_total_kg
FROM usuarios u
LEFT JOIN sessoes_treino s ON s.usuario_id = u.id
WHERE u.tipo = 'cliente'
GROUP BY u.nome
ORDER BY treinos_feitos DESC;

-- ---------------------------------------------------------------------
-- 4. JOIN de 3 tabelas: as fichas de treino com os exercícios, em ordem
-- ---------------------------------------------------------------------
SELECT u.nome AS cliente, t.nome AS ficha, i.ordem, i.nome AS exercicio,
       i.series, i.reps, i.carga AS carga_kg
FROM treinos t
JOIN usuarios u     ON u.id = t.usuario_id
JOIN treino_itens i ON i.treino_id = t.id
ORDER BY u.nome, t.nome, i.ordem;

-- ---------------------------------------------------------------------
-- 5. INSERT: publicar um aviso direto pelo banco
--    (pega a academia e o admin de demonstração; o aviso aparece no Início dos clientes)
-- ---------------------------------------------------------------------
INSERT INTO avisos (id, academia_id, autor_id, texto, data)
SELECT NEWID(), a.id, u.id, N'Aviso inserido direto pelo SQL Server', SYSDATETIMEOFFSET()
FROM academias a
JOIN usuarios u ON u.academia_id = a.id AND u.tipo = 'admin'
WHERE a.codigo = 'SL-DEMO';

-- Confere
SELECT TOP 5 texto, data FROM avisos ORDER BY data DESC;

-- ---------------------------------------------------------------------
-- 6. UPDATE: mudar a meta de treinos por semana de um cliente
-- ---------------------------------------------------------------------
UPDATE usuarios
SET dias_semana = 5
WHERE email = 'demo@saudelife.app';

-- Confere
SELECT nome, dias_semana FROM usuarios WHERE email = 'demo@saudelife.app';

-- ---------------------------------------------------------------------
-- 7. VIEW: resumo dos clientes por academia (uma "consulta salva")
-- ---------------------------------------------------------------------
GO
CREATE OR ALTER VIEW vw_resumo_clientes AS
SELECT a.nome AS academia,
       u.nome AS cliente,
       u.email,
       (SELECT COUNT(*) FROM sessoes_treino s WHERE s.usuario_id = u.id) AS treinos_feitos,
       (SELECT TOP 1 CAST(p.valor_kg AS decimal(5,1)) FROM pesos p WHERE p.usuario_id = u.id ORDER BY p.data DESC) AS ultimo_peso_kg,
       (SELECT COALESCE(SUM(pt.pts), 0) FROM pontos pt WHERE pt.usuario_id = u.id) AS pontos
FROM usuarios u
JOIN academias a ON a.id = u.academia_id
WHERE u.tipo = 'cliente';
GO

-- Usa a view como se fosse uma tabela
SELECT * FROM vw_resumo_clientes ORDER BY treinos_feitos DESC;

-- ---------------------------------------------------------------------
-- 8. Índices que existem para deixar as buscas rápidas
-- ---------------------------------------------------------------------
SELECT t.name AS tabela, i.name AS indice, i.type_desc AS tipo, i.is_unique AS unico
FROM sys.indexes i
JOIN sys.tables t ON t.object_id = i.object_id
WHERE i.name IS NOT NULL
ORDER BY t.name, i.name;
GO
