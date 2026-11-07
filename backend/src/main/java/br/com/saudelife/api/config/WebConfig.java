package br.com.saudelife.api.config;

// Interceptador do login
import br.com.saudelife.api.seguranca.Autenticacao;
// Lê valores do application.properties
import org.springframework.beans.factory.annotation.Value;
// Cria objetos para o Spring
import org.springframework.context.annotation.Bean;
// Classe de configuração
import org.springframework.context.annotation.Configuration;
// BCrypt (hash de senha)
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
// Configuração de CORS e interceptadores
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Configurações gerais: quem pode chamar a API (CORS), quais rotas pedem login e o hash de senha
@Configuration
public class WebConfig implements WebMvcConfigurer {

  // Interceptador do login
  private final Autenticacao autenticacao;
  // Sites que podem chamar a API
  private final String[] origens;

  // Construtor
  public WebConfig(Autenticacao autenticacao, @Value("${saudelife.origens}") String[] origens) {
    // Guarda o interceptador
    this.autenticacao = autenticacao;
    // Guarda as origens
    this.origens = origens;
  }

  // CORS: deixa o site (GitHub Pages e Vite) chamar a API
  @Override
  public void addCorsMappings(CorsRegistry registro) {
    // Todas as rotas
    registro.addMapping("/**")
        // Só estes sites
        .allowedOrigins(origens)
        // Métodos usados
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        // Cabeçalhos usados
        .allowedHeaders("Authorization", "Content-Type");
  }

  // Login obrigatório em tudo, menos nas rotas públicas
  @Override
  public void addInterceptors(InterceptorRegistry registro) {
    // Confere o login
    registro.addInterceptor(autenticacao)
        // Todas as rotas
        .addPathPatterns("/**")
        // Menos: cadastro, login e senha (mas "sair" precisa de login)
        .excludePathPatterns("/auth/cadastro", "/auth/login", "/auth/esqueci-senha", "/auth/redefinir-senha", "/planos", "/error");
  }

  // Hash de senha BCrypt (custo 10)
  @Bean
  public PasswordEncoder senhas() {
    // BCrypt
    return new BCryptPasswordEncoder();
  }
}
