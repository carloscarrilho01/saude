// Opções de perfil exibidas na UI (onboarding e edição). Rótulos pt-BR.

import type { Clima, NivelAtividade, Sexo } from "./tipos";

export const ATIVIDADES: { valor: NivelAtividade; nome: string; desc: string }[] = [
  { valor: "sedentario", nome: "Sedentário", desc: "Pouco ou nenhum exercício" },
  { valor: "leve", nome: "Leve", desc: "1–3× por semana" },
  { valor: "moderado", nome: "Moderado", desc: "3–5× por semana" },
  { valor: "intenso", nome: "Intenso", desc: "Treino diário / pesado" },
];

export const CLIMAS: { valor: Clima; nome: string }[] = [
  { valor: "ameno", nome: "Ameno" },
  { valor: "quente", nome: "Quente" },
  { valor: "muito_quente", nome: "Muito quente" },
];

export const SEXOS: { valor: Sexo; nome: string }[] = [
  { valor: "feminino", nome: "Feminino" },
  { valor: "masculino", nome: "Masculino" },
  { valor: "outro", nome: "Outro" },
];

export const nomeAtividade = (v?: NivelAtividade) => ATIVIDADES.find((a) => a.valor === v)?.nome ?? "—";
export const nomeClima = (v?: Clima) => CLIMAS.find((c) => c.valor === v)?.nome ?? "Ameno";

/** Limites de entrada (sanidade do formulário, não regra clínica). */
export const LIMITES = {
  pesoKg: { min: 20, max: 300 },
  alturaCm: { min: 80, max: 250 },
  idade: { min: 1, max: 120 },
  metaManualMl: { min: 500, max: 8000 },
} as const;

/** Converte "70,5" → 70.5; vazio/inválido → undefined. */
export function lerNumero(texto: string): number | undefined {
  const n = parseFloat(texto.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function dentro(n: number | undefined, f: { min: number; max: number }): n is number {
  return n != null && n >= f.min && n <= f.max;
}
