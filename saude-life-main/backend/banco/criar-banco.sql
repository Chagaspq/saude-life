-- Saúde Life: cria o banco no SQL Server Management Studio (SSMS)
-- Abra este arquivo no SSMS e aperte F5. A tabela "usuarios" a API cria sozinha ao ligar.
IF DB_ID(N'saudelife') IS NULL CREATE DATABASE saudelife;
GO
-- Usa o banco
USE saudelife;
GO
-- Depois de ligar a API e cadastrar usuários, veja os dados:
-- SELECT id, nome_completo, email, tipo_usuario, data_nascimento, data_criacao FROM usuarios;
