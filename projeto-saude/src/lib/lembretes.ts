// Lógica de lembretes — helpers PUROS (sem acesso a storage/DOM).
// Regras do PRD §3.4: janela de horário, dias da semana, pausa após meta,
// dedup por intervalo e adiamento (snooze).

import type { ConfigLembretes, DiaSemana } from "./tipos";

export const CONFIG_LEMBRETES_PADRAO: ConfigLembretes = {
  ativo: false,
  intervaloMin: 90,
  horaInicio: "08:00",
  horaFim: "22:00",
  diasSemana: [0, 1, 2, 3, 4, 5, 6],
  pausarAposMeta: true,
  snoozeMin: 15,
};

export const DIAS_LABEL: { valor: DiaSemana; curto: string }[] = [
  { valor: 1, curto: "Seg" },
  { valor: 2, curto: "Ter" },
  { valor: 3, curto: "Qua" },
  { valor: 4, curto: "Qui" },
  { valor: 5, curto: "Sex" },
  { valor: 6, curto: "Sáb" },
  { valor: 0, curto: "Dom" },
];

/** "08:30" -> 510 (minutos desde a meia-noite). */
export function minutosDoHorario(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

/** minutos -> "HH:MM". */
export function horarioDeMinutos(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export interface InfoAgora {
  minutos: number; // minutos desde meia-noite no fuso
  dia: DiaSemana; // dia da semana no fuso
  ms: number; // epoch ms
}

const MAP_DIA: Record<string, DiaSemana> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Momento atual no fuso do usuário, em partes úteis para a lógica. */
export function infoAgora(fuso?: string, base: Date = new Date()): InfoAgora {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(base);
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  const hora = parseInt(get("hour"), 10) % 24;
  const minuto = parseInt(get("minute"), 10);
  return {
    minutos: hora * 60 + minuto,
    dia: MAP_DIA[get("weekday")] ?? 0,
    ms: base.getTime(),
  };
}

export function dentroDaJanela(config: ConfigLembretes, minutos: number): boolean {
  const ini = minutosDoHorario(config.horaInicio);
  const fim = minutosDoHorario(config.horaFim);
  return minutos >= ini && minutos <= fim;
}

/** Decide se um lembrete deve disparar AGORA. */
export function deveDisparar(
  config: ConfigLembretes,
  info: InfoAgora,
  metaAtingida: boolean,
): boolean {
  if (!config.ativo) return false;
  if (config.pausarAposMeta && metaAtingida) return false;
  if (!config.diasSemana.includes(info.dia)) return false;
  if (!dentroDaJanela(config, info.minutos)) return false;
  if (config.adiadoAte && info.ms < Date.parse(config.adiadoAte)) return false;
  if (config.ultimoLembreteEm) {
    const diffMin = (info.ms - Date.parse(config.ultimoLembreteEm)) / 60000;
    if (diffMin < config.intervaloMin) return false;
  }
  return true;
}

export interface ProximoLembrete {
  horario: string; // "HH:MM"
  amanha: boolean;
}

/** Calcula o horário do próximo lembrete para exibição (ou null se inativo). */
export function proximoLembrete(
  config: ConfigLembretes,
  fuso?: string,
  base: Date = new Date(),
): ProximoLembrete | null {
  if (!config.ativo) return null;
  const info = infoAgora(fuso, base);
  const ini = minutosDoHorario(config.horaInicio);
  const fim = minutosDoHorario(config.horaFim);

  // ponto de partida: último + intervalo, senão agora
  let proxMin = info.minutos;
  if (config.ultimoLembreteEm) {
    const infoUltimo = infoAgora(fuso, new Date(config.ultimoLembreteEm));
    // só considera "hoje" se o último foi no mesmo dia da semana e <= agora
    if (infoUltimo.dia === info.dia && infoUltimo.minutos <= info.minutos) {
      proxMin = Math.max(info.minutos, infoUltimo.minutos + config.intervaloMin);
    }
  }
  // respeita adiamento (snooze)
  if (config.adiadoAte) {
    const infoAdiado = infoAgora(fuso, new Date(config.adiadoAte));
    if (Date.parse(config.adiadoAte) > info.ms && infoAdiado.dia === info.dia) {
      proxMin = Math.max(proxMin, infoAdiado.minutos);
    }
  }

  if (proxMin < ini) proxMin = ini;
  if (proxMin <= fim) return { horario: horarioDeMinutos(proxMin), amanha: false };
  // passou da janela de hoje → amanhã no início
  return { horario: config.horaInicio, amanha: true };
}
