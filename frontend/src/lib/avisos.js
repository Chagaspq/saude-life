// Avisos: notificações do sino, lembretes (água e treino) e horário de silêncio.
import { ler } from "./armazenamento.js";
import { ehAdmin } from "./conta.js";
import { estatisticas, historico, toast } from "./nucleo.js";
import { dataRelativa } from "./formato.js";

// Lista do sino: [título, texto, tipo] (meta da semana e avisos da academia)
export function listaAvisos() {
  // Lista
  const lista = [];
  // Cliente: aviso da meta
  if (!ehAdmin()) {
    // Números
    const { nestaSemana, meta } = estatisticas();
    // Faltam
    const faltam = Math.max(0, meta - nestaSemana);
    // Aviso
    lista.push(faltam ? ["Meta semanal em andamento", `${faltam > 1 ? "Faltam" : "Falta"} ${faltam} treino${faltam > 1 ? "s" : ""} para completar ${meta}/${meta}.`, "meta"] : ["Meta semanal batida!", `Você completou ${nestaSemana} treinos nesta semana.`, "meta"]);
  }
  // Avisos do administrador (os 5 mais novos)
  ler("sl-avisos-admin", []).slice(0, 5).forEach((a) => lista.push([a.texto, `${a.autor || "Administrador"} • ${dataRelativa(a.data)}`, "aviso"]));
  // Devolve
  return lista;
}

// Mostra um aviso, respeitando os tipos desligados e o horário de silêncio
export function avisar(tipo, texto) {
  // Tipo desligado no Perfil
  if (ler("sl-avisos-tipos", {})[tipo] === false) return;
  // Silêncio (padrão: 22h às 7h, ligado)
  const s = ler("sl-silencio", { ligado: true, de: "22:00", ate: "07:00" });
  // Minutos de agora
  const agora = new Date().getHours() * 60 + new Date().getMinutes();
  // "22:00" em minutos
  const min = (t) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
  // Dentro do silêncio (o intervalo pode passar da meia-noite)
  const quieto = s.ligado && (min(s.de) <= min(s.ate) ? agora >= min(s.de) && agora < min(s.ate) : agora >= min(s.de) || agora < min(s.ate));
  // No silêncio: nada
  if (quieto) return;
  // Aviso na tela
  toast(texto);
  // Notificação do sistema (se a pessoa deixou)
  if ("Notification" in window && Notification.permission === "granted") new Notification("Saúde Life", { body: texto });
}

// Confere os lembretes (água a cada 2 h e horário do treino)
export function conferirLembretes() {
  // Administrador não recebe lembretes de cliente
  if (ehAdmin()) return;
  // Agora
  const agora = new Date();
  // Água: ligado, entre 8h e 22h, 2 h desde o último gole e o último aviso
  if (ler("sl-lembrete-agua", false) && agora.getHours() >= 8 && agora.getHours() < 22) {
    // Duas horas
    const duas = 2 * 3600000;
    // Último gole e último aviso
    if (Date.now() - ler("sl-agua-ultimo", Date.now()) >= duas && Date.now() - ler("sl-agua-aviso", 0) >= duas) {
      // Marca o aviso
      localStorage.setItem("sl-agua-aviso", JSON.stringify(Date.now()));
      // Avisa
      avisar("agua", "Hora de beber água. Já faz 2 horas.");
    }
  }
  // Treino: lembrete ligado
  if (!ler("sl-pref-notif", true)) return;
  // Horário e dias (padrão: 18h, segunda a sexta)
  const l = ler("sl-lembrete-treino", { hora: "18:00", dias: [1, 2, 3, 4, 5] });
  // Hoje
  const hoje = agora.toDateString();
  // Não é dia ou já avisou hoje
  if (!l.dias.includes(agora.getDay()) || ler("sl-lembrete-dia", "") === hoje) return;
  // Hora e minuto
  const [h, m] = l.hora.split(":").map(Number);
  // Ainda não chegou a hora
  if (agora.getHours() * 60 + agora.getMinutes() < h * 60 + m) return;
  // Já treinou hoje
  if (historico().some((x) => new Date(x.data).toDateString() === hoje)) return;
  // Marca
  localStorage.setItem("sl-lembrete-dia", JSON.stringify(hoje));
  // Avisa
  avisar("treino", "Hora do treino! Bora manter a sequência?");
}
