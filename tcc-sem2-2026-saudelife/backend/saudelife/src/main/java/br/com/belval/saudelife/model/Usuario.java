package br.com.belval.saudelife.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

// Usuário do Saúde Life (vira a tabela "usuarios" no banco)
@Entity
@Table(name = "usuarios")
public class Usuario {

	// Chave primária: número que o banco gera sozinho (1, 2, 3...)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Nome completo (obrigatório)
	@Column(nullable = false, length = 100)
	private String nomeCompleto;

	// E-mail (obrigatório e sem repetir entre usuários)
	@Column(nullable = false, unique = true, length = 150)
	private String email;

	// Senha guardada como hash (BCrypt). WRITE_ONLY: a API recebe, mas nunca devolve no JSON
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Column(nullable = false, length = 100)
	private String senha;

	// Tipo de usuário: "CLIENTE" ou "ADMINISTRADOR"
	@Column(nullable = false, length = 20)
	private String tipoUsuario;

	// Data de nascimento (opcional)
	private LocalDate dataNascimento;

	// Quando o usuário foi cadastrado (o banco preenche ao salvar a primeira vez)
	@Column(nullable = false, updatable = false)
	private LocalDateTime dataCriacao;

	// Antes de salvar pela primeira vez: anota a data de criação
	@PrePersist
	public void antesDeCriar() {
		// Agora
		this.dataCriacao = LocalDateTime.now();
	}

	// ----- Getters e setters (o Spring e o JSON usam) -----

	// id
	public Long getId() {
		return id;
	}

	// id
	public void setId(Long id) {
		this.id = id;
	}

	// nomeCompleto
	public String getNomeCompleto() {
		return nomeCompleto;
	}

	// nomeCompleto
	public void setNomeCompleto(String nomeCompleto) {
		this.nomeCompleto = nomeCompleto;
	}

	// email
	public String getEmail() {
		return email;
	}

	// email
	public void setEmail(String email) {
		this.email = email;
	}

	// senha
	public String getSenha() {
		return senha;
	}

	// senha
	public void setSenha(String senha) {
		this.senha = senha;
	}

	// tipoUsuario
	public String getTipoUsuario() {
		return tipoUsuario;
	}

	// tipoUsuario
	public void setTipoUsuario(String tipoUsuario) {
		this.tipoUsuario = tipoUsuario;
	}

	// dataNascimento
	public LocalDate getDataNascimento() {
		return dataNascimento;
	}

	// dataNascimento
	public void setDataNascimento(LocalDate dataNascimento) {
		this.dataNascimento = dataNascimento;
	}

	// dataCriacao
	public LocalDateTime getDataCriacao() {
		return dataCriacao;
	}

	// dataCriacao
	public void setDataCriacao(LocalDateTime dataCriacao) {
		this.dataCriacao = dataCriacao;
	}
}
