package br.com.belval.saudelife.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, length = 100)
	private String nomeCompleto;

	@Column(nullable = false, unique = true, length = 150)
	private String email;

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Column(nullable = false, length = 100)
	private String senha;

	@Column(nullable = false, length = 20)
	private String tipoUsuario;

	private LocalDate dataNascimento;

	private String objetivo;
	private Integer diasSemana;
	private String plano;

	@Column(nullable = false, updatable = false)
	private LocalDateTime dataCriacao;

	@PrePersist
	public void antesDeCriar() {
		this.dataCriacao = LocalDateTime.now();
	}

	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }

	public String getNomeCompleto() { return nomeCompleto; }
	public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getSenha() { return senha; }
	public void setSenha(String senha) { this.senha = senha; }

	public String getTipoUsuario() { return tipoUsuario; }
	public void setTipoUsuario(String tipoUsuario) { this.tipoUsuario = tipoUsuario; }

	public LocalDate getDataNascimento() { return dataNascimento; }
	public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

	public String getObjetivo() { return objetivo; }
	public void setObjetivo(String objetivo) { this.objetivo = objetivo; }

	public Integer getDiasSemana() { return diasSemana; }
	public void setDiasSemana(Integer diasSemana) { this.diasSemana = diasSemana; }

	public String getPlano() { return plano; }
	public void setPlano(String plano) { this.plano = plano; }

	public LocalDateTime getDataCriacao() { return dataCriacao; }
	public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

	@Override
	public String toString() {
		return "Usuario [id=" + id + ", nomeCompleto=" + nomeCompleto + ", email=" + email + "]";
	}
}