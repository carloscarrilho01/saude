// Hábitos — módulo PURO: sequência (streak), conquistas e resumo semanal.
// Recebe dias já agregados (com a meta vigente em cada dia) e não lê storage.

import type { DiaConsumo } from "./tipos";

export const bateuMeta = (d: DiaConsumo) => d.metaMl > 0 && d.totalMl >= d.metaMl;

export interface Sequencia {
  /** Dias seguidos batendo a meta, terminando hoje (ou ontem, se hoje ainda não bateu). */
  atual: number;
  /** Maior sequência dentro da janela recebida. */
  melhor: number;
  /** Hoje já conta na sequência atual? */
  hojeConta: boolean;
}

/** `dias` em ordem cronológica; o último item é hoje. */
export function calcularSequencia(dias: DiaConsumo[]): Sequencia {
  let melhor = 0;
  let corrida = 0;
  for (const d of dias) {
    corrida = bateuMeta(d) ? corrida + 1 : 0;
    melhor = Math.max(melhor, corrida);
  }
  const hoje = dias[dias.length - 1];
  const hojeConta = hoje ? bateuMeta(hoje) : false;
  // hoje ainda não bateu: não quebra a sequência, só não conta
  let atual = 0;
  for (let i = dias.length - 1 - (hojeConta ? 0 : 1); i >= 0; i--) {
    if (!bateuMeta(dias[i])) break;
    atual++;
  }
  return { atual, melhor, hojeConta };
}

// --- Conquistas ---

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  conquistada: boolean;
  /** 0–1, progresso até a conquista. */
  progresso: number;
}

export const MARCOS_SEQUENCIA = [3, 7, 14, 30, 60, 100] as const;
export const MARCOS_LITROS = [10, 50, 100, 365] as const;

/**
 * Lista de conquistas a partir do histórico. `melhorSequencia` deve vir de
 * uma janela longa (ex.: 365 dias) para não "perder" conquistas antigas.
 */
export function calcularConquistas(params: {
  totalRegistros: number;
  diasNaMeta: number;
  melhorSequencia: number;
  totalMlHistorico: number;
}): Conquista[] {
  const { totalRegistros, diasNaMeta, melhorSequencia, totalMlHistorico } = params;
  const litros = totalMlHistorico / 1000;
  const p = (v: number, alvo: number) => Math.max(0, Math.min(1, v / alvo));

  return [
    {
      id: "primeiro-copo",
      titulo: "Primeiro gole",
      descricao: "Registrou água pela primeira vez",
      conquistada: totalRegistros >= 1,
      progresso: p(totalRegistros, 1),
    },
    {
      id: "primeira-meta",
      titulo: "Meta batida",
      descricao: "Atingiu a meta de um dia inteiro",
      conquistada: diasNaMeta >= 1,
      progresso: p(diasNaMeta, 1),
    },
    ...MARCOS_SEQUENCIA.map((n) => ({
      id: `sequencia-${n}`,
      titulo: `${n} dias seguidos`,
      descricao: `Bateu a meta ${n} dias sem falhar`,
      conquistada: melhorSequencia >= n,
      progresso: p(melhorSequencia, n),
    })),
    ...MARCOS_LITROS.map((n) => ({
      id: `litros-${n}`,
      titulo: `${n} litros`,
      descricao: `Somou ${n} litros de água registrados`,
      conquistada: litros >= n,
      progresso: p(litros, n),
    })),
  ];
}

/** Próximo marco de sequência ainda não alcançado (para motivar). */
export function proximoMarco(atual: number): number | null {
  return MARCOS_SEQUENCIA.find((m) => m > atual) ?? null;
}

// --- Resumo semanal ---

export interface ResumoSemana {
  mediaMl: number;
  diasNaMeta: number;
  totalDias: number;
  melhorDia: DiaConsumo | null;
  /** Variação % da média vs semana anterior (null se não há base). */
  variacaoPct: number | null;
}

/** `semana` e `anterior` com 7 dias cada, em ordem cronológica. */
export function resumirSemana(semana: DiaConsumo[], anterior: DiaConsumo[] = []): ResumoSemana {
  const soma = (xs: DiaConsumo[]) => xs.reduce((s, d) => s + d.totalMl, 0);
  const mediaMl = semana.length ? Math.round(soma(semana) / semana.length) : 0;
  const mediaAnt = anterior.length ? soma(anterior) / anterior.length : 0;
  const melhorDia = semana.reduce<DiaConsumo | null>(
    (m, d) => (d.totalMl > 0 && (!m || d.totalMl > m.totalMl) ? d : m),
    null,
  );
  return {
    mediaMl,
    diasNaMeta: semana.filter(bateuMeta).length,
    totalDias: semana.length,
    melhorDia,
    variacaoPct: mediaAnt > 0 ? Math.round(((mediaMl - mediaAnt) / mediaAnt) * 100) : null,
  };
}

/** Segunda-feira (YYYY-MM-DD) da semana que contém `dataLocal`. */
export function inicioDaSemana(dataLocal: string): string {
  const d = new Date(`${dataLocal}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0 = domingo
  d.setUTCDate(d.getUTCDate() - ((dow + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** Soma `n` dias a uma data local "YYYY-MM-DD". */
export function somarDias(dataLocal: string, n: number): string {
  const d = new Date(`${dataLocal}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
