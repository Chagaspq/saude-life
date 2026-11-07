package br.com.saudelife.api;

// Classe que liga o Spring Boot
import org.springframework.boot.SpringApplication;
// Marca a classe principal
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Programa principal do servidor. No Spring Tools: botão direito > Run As > Spring Boot App
@SpringBootApplication
public class SaudeLifeApplication {

  // Ponto de partida
  public static void main(String[] args) {
    // Liga o servidor (http://localhost:8080/v1)
    SpringApplication.run(SaudeLifeApplication.class, args);
  }
}
