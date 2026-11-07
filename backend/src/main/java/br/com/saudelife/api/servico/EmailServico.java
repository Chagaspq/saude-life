package br.com.saudelife.api.servico;

// Lê do application.properties
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
// Envio de e-mail
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
// Serviço do Spring
import org.springframework.stereotype.Service;
// Registro no console
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Manda e-mails. Sem servidor de e-mail configurado (MAIL_HOST vazio), só escreve no console.
@Service
public class EmailServico {

  // Console
  private static final Logger LOG = LoggerFactory.getLogger(EmailServico.class);

  // Carteiro do Spring (pode não existir)
  private final ObjectProvider<JavaMailSender> carteiro;
  // Servidor de e-mail configurado
  private final String host;
  // Remetente
  private final String de;

  // Construtor
  public EmailServico(ObjectProvider<JavaMailSender> carteiro, @Value("${spring.mail.host:}") String host, @Value("${saudelife.email-de}") String de) {
    // Guarda
    this.carteiro = carteiro;
    this.host = host;
    this.de = de;
  }

  // Tem servidor de e-mail?
  public boolean configurado() {
    // Precisa do endereço do servidor e do carteiro
    return host != null && !host.isBlank() && carteiro.getIfAvailable() != null;
  }

  // Manda um e-mail simples (devolve true se mandou)
  public boolean enviar(String para, String assunto, String texto) {
    // Sem servidor: só avisa no console
    if (!configurado()) {
      // Console
      LOG.info("E-mail não enviado (sem MAIL_HOST). Para: {} | {}", para, assunto);
      // Não mandou
      return false;
    }
    // Mensagem
    SimpleMailMessage m = new SimpleMailMessage();
    // Remetente
    m.setFrom(de);
    // Destinatário
    m.setTo(para);
    // Assunto
    m.setSubject(assunto);
    // Texto
    m.setText(texto);
    // Tenta mandar
    try {
      // Manda
      carteiro.getObject().send(m);
      // Mandou
      return true;
    } catch (Exception e) {
      // Falhou: registra (a pessoa recebe a mesma resposta, por segurança)
      LOG.warn("Falha ao enviar e-mail para {}: {}", para, e.getMessage());
      // Não mandou
      return false;
    }
  }
}
