// Cálculo da meta diária de hidratação — módulo PURO e testável.
// Regras conforme PRD §3.2. Os coeficientes são parâmetros configuráveis,
// não constantes clínicas definitivas (precisam de validação profissional).

import type { Clima, NivelAtividade } from "./tipos";

/** Coeficiente de ml de água por kg de peso, por faixa etária. Configurável. */
export const COEFICIENTE_POR_IDADE = {
  ate17: 40,
  adulto18a55: 35,
  de56a65: 30,
  idoso66mais: 30, // faixa 25–30; usamos 30 como padrão
} as const;

/** Coeficiente padrão quando a idade não é informada (faixa adulta). */
export const COEFICIENTE_PADRAO = COEFICIENTE_POR_IDADE.adulto18a55;

/** Acréscimo fixo (ml) por nível de atividade física. */
export const AJUSTE_ATIVIDADE_ML: Record<NivelAtividade, number> = {
  sedentario: 0,
  leve: 250,
  moderado: 500,
  intenso: 750,
};

/** Acréscimo fixo (ml) por clima. */
export const AJUSTE_CLIMA_ML: Record<Clima, number> = {
  ameno: 0,
  quente: 300,
  muito_quente: 500,
};

/** Faixa de sanidade da interface (NÃO é regra universal de segurança). */
export const FAIXA_PROVISORIA = { minMl: 1500, maxMl: 4000 } as const;

/** Volume de um copo de referência, em ml. */
export const COPO_ML = 250;

/** Seleciona o coeficiente (ml/kg) pela idade. Sem idade → padrão adulto. */
export function coeficientePorIdade(idade?: number): number {
  if (idade == null || Number.isNaN(idade)) return COEFICIENTE_PADRAO;
  if (idade <= 17) return COEFICIENTE_POR_IDADE.ate17;
  if (idade <= 55) return COEFICIENTE_POR_IDADE.adulto18a55;
  if (idade <= 65) return COEFICIENTE_POR_IDADE.de56a65;
  return COEFICIENTE_POR_IDADE.idoso66mais;
}

export interface ParametrosMeta {
  pesoKg: number;
  idade?: number;
  nivelAtividade: NivelAtividade;
  clima: Clima;
}

export interface ResultadoMeta {
  metaMl: number;
  baseMl: number;
  coeficienteIdade: number;
  ajusteAtividadeMl: number;
  ajusteClimaMl: number;
  /** true se fora da faixa provisória — a UI apenas avisa, não bloqueia. */
  foraDaFaixa: boolean;
}

/** Calcula a meta de hidratação em ml: base por idade/peso + ajustes. */
export function calcularMeta(p: ParametrosMeta): ResultadoMeta {
  const coeficienteIdade = coeficientePorIdade(p.idade);
  const baseMl = Math.round(p.pesoKg * coeficienteIdade);
  const ajusteAtividadeMl = AJUSTE_ATIVIDADE_ML[p.nivelAtividade] ?? 0;
  const ajusteClimaMl = AJUSTE_CLIMA_ML[p.clima] ?? 0;
  const metaMl = baseMl + ajusteAtividadeMl + ajusteClimaMl;
  return {
    metaMl,
    baseMl,
    coeficienteIdade,
    ajusteAtividadeMl,
    ajusteClimaMl,
    foraDaFaixa: metaMl < FAIXA_PROVISORIA.minMl || metaMl > FAIXA_PROVISORIA.maxMl,
  };
}

// --- Conversões e formatação de apresentação ---

/** Converte ml para litros (número). */
export function mlParaLitros(ml: number): number {
  return ml / 1000;
}

/** Formata ml como litros no padrão pt-BR, ex.: 2450 → "2,45 L". */
export function formatarLitros(ml: number, casas = 2): string {
  const litros = mlParaLitros(ml);
  return `${litros.toFixed(casas).replace(".", ",")} L`;
}

/** Quantidade aproximada de copos (de COPO_ML) para um volume. */
export function emCopos(ml: number): number {
  return Math.round(ml / COPO_ML);
}

/** Percentual consumido da meta, limitado a 0–100 para barras de progresso. */
export function percentualMeta(consumidoMl: number, metaMl: number): number {
  if (metaMl <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((consumidoMl / metaMl) * 100)));
}

/**
 * Meta do dia considerando um clima informado só para aquele dia.
 * Troca o ajuste de clima embutido na meta pelo ajuste do clima do dia.
 * Sem clima do dia → a própria meta.
 */
export function metaComClimaDoDia(
  meta: { metaMl: number; ajusteClimaMl: number },
  climaDia?: Clima | null,
): number {
  if (!climaDia) return meta.metaMl;
  return meta.metaMl - meta.ajusteClimaMl + (AJUSTE_CLIMA_ML[climaDia] ?? 0);
}
