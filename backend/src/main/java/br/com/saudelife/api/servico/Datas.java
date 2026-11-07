package br.com.saudelife.api.servico;

// Datas e fuso horário
import java.time.*;

// Ajuda com datas no horário de Brasília (o "dia" e a "semana" do app)
public final class Datas {

  // Fuso de Brasília
  public static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

  // Ninguém cria objetos desta classe
  private Datas() {}

  // Hoje (em Brasília)
  public static LocalDate hoje() { return LocalDate.now(FUSO); }

  // Começo de hoje
  public static Instant inicioDeHoje() { return hoje().atStartOfDay(FUSO).toInstant(); }

  // Começo da semana (segunda-feira 00:00)
  public static Instant inicioDaSemana() { return hoje().with(DayOfWeek.MONDAY).atStartOfDay(FUSO).toInstant(); }
}
