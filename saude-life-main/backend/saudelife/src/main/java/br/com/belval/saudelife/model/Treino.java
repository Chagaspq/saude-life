package br.com.belval.saudelife.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "TREINOS")
public class Treino {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UNIQUEIDENTIFIER")
    private UUID id;

    @Column(name = "usuario_id", nullable = false, columnDefinition = "UNIQUEIDENTIFIER")
    private UUID usuarioId;

    @Column(name = "autor_id", columnDefinition = "UNIQUEIDENTIFIER")
    private UUID autorId;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 100)
    private String grupo;

    public Treino() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public UUID getAutorId() { return autorId; }
    public void setAutorId(UUID autorId) { this.autorId = autorId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getGrupo() { return grupo; }
    public void setGrupo(String grupo) { this.grupo = grupo; }
}