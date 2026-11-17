// Cálculo de aderência ao regime — módulo PURO (PRD §3.5, regra simples da v1).
// Uma refeição planejada conta como concluída num dia se foi marcada como
// concluída OU se há pelo menos um item do diário vinculado a ela naquele dia.
// Sem percentual parcial na v1. A água NÃO entra na % de aderência.

import type { ConclusaoRefeicao, ItemDiario, RefeicaoPlanejada } from "./tipos";

export function refeicaoConcluida(
  refeicaoPlanejadaId: string,
  dataLocal: string,
  conclusoes: ConclusaoRefeicao[],
  itens: ItemDiario[],
): boolean {
  const marcada = conclusoes.some(
    (c) =>
      c.refeicaoPlanejadaId === refeicaoPlanejadaId &&
      c.dataLocal === dataLocal &&
      c.concluida,
  );
  if (marcada) return true;
  return itens.some(
    (i) => i.refeicaoPlanejadaId === refeicaoPlanejadaId && i.dataLocal === dataLocal,
  );
}

/**
 * A refeição faz parte do plano naquele dia? (PRD §3.5: alterações valem a
 * partir da data local da alteração e não reescrevem dias anteriores.)
 */
export function refeicaoVigenteEm(r: RefeicaoPlanejada, dataLocal: string): boolean {
  if (r.ativaDesde && dataLocal < r.ativaDesde) return false;
  if (r.removidaEm && dataLocal >= r.removidaEm) return false;
  return true;
}

export interface ResultadoAderencia {
  concluidas: number;
  total: number;
  pct: number;
}

/**
 * Aderência de um dia: concluídas ÷ refeições planejadas vigentes naquele dia.
 * Pode receber também refeições removidas — elas só contam nos dias em que valiam.
 */
export function aderenciaDoDia(
  refeicoes: RefeicaoPlanejada[],
  dataLocal: string,
  conclusoes: ConclusaoRefeicao[],
  itens: ItemDiario[],
): ResultadoAderencia {
  const vigentes = refeicoes.filter((r) => refeicaoVigenteEm(r, dataLocal));
  const total = vigentes.length;
  if (total === 0) return { concluidas: 0, total: 0, pct: 0 };
  const concluidas = vigentes.filter((r) =>
    refeicaoConcluida(r.id, dataLocal, conclusoes, itens),
  ).length;
  return { concluidas, total, pct: Math.round((concluidas / total) * 100) };
}

/** Aderência agregada em várias datas (ex.: últimos 7 dias). */
export function aderenciaPeriodo(
  refeicoes: RefeicaoPlanejada[],
  datasLocais: string[],
  conclusoes: ConclusaoRefeicao[],
  itens: ItemDiario[],
): ResultadoAderencia {
  if (refeicoes.length === 0 || datasLocais.length === 0) {
    return { concluidas: 0, total: 0, pct: 0 };
  }
  let concluidas = 0;
  let total = 0;
  for (const data of datasLocais) {
    const dia = aderenciaDoDia(refeicoes, data, conclusoes, itens);
    concluidas += dia.concluidas;
    total += dia.total;
  }
  return { concluidas, total, pct: total === 0 ? 0 : Math.round((concluidas / total) * 100) };
}
