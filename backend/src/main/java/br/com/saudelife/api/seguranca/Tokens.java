package br.com.saudelife.api.seguranca;

// Resumo SHA-256
import java.security.MessageDigest;
// Números aleatórios seguros
import java.security.SecureRandom;
// Texto em Base64 e em hexadecimal
import java.util.Base64;
import java.util.HexFormat;

// Gera tokens aleatórios e calcula o resumo (hash) que fica guardado no banco
public final class Tokens {

  // Gerador aleatório seguro
  private static final SecureRandom ALEATORIO = new SecureRandom();

  // Ninguém cria objetos desta classe
  private Tokens() {}

  // Token novo (32 bytes aleatórios, em texto seguro para URL)
  public static String novo() {
    // Bytes
    byte[] bytes = new byte[32];
    // Sorteia
    ALEATORIO.nextBytes(bytes);
    // Texto
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  // Resumo SHA-256 do token
  public static String hash(String token) {
    // Tenta
    try {
      // Calcula
      byte[] r = MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
      // Hexadecimal
      return HexFormat.of().formatHex(r);
    } catch (Exception e) {
      // SHA-256 sempre existe no Java; se não, para tudo
      throw new IllegalStateException(e);
    }
  }
}
