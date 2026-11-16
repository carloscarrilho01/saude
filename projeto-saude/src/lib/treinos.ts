// Treinos — módulo PURO: tipos de atividade, meta semanal e conquistas.
// A meta padrão segue a recomendação pública da OMS (2020) para adultos:
// 150 a 300 minutos de atividade moderada por semana. Configurável.

import type { Caminhada } from "./caminhada";

export type TipoTreino =
  | "musculacao"
  | "corrida"
  | "caminhada"
  | "bike"
  | "natacao"
  | "yoga"
  | "funcional"
  | "danca"
  | "casa"
  | "outro";

export type Intensidade = "leve" | "moderada" | "intensa";

export interface Treino {
  id: string;
  tipo: TipoTreino;
  duracaoMin: number;
  intensidade: Intensidade;
  dataLocal: string; // "YYYY-MM-DD"
  registradoEm: string; // ISO
  observacao?: string;
  /** Treino em casa guiado que originou o registro (lib/rotinasCasa.ts). */
  rotina?: string;
}

export const TIPOS_TREINO: { valor: TipoTreino; nome: string }[] = [
  { valor: "musculacao", nome: "Musculação" },
  { valor: "corrida", nome: "Corrida" },
  { valor: "caminhada", nome: "Caminhada" },
  { valor: "bike", nome: "Bike" },
  { valor: "natacao", nome: "Natação" },
  { valor: "yoga", nome: "Yoga / alongamento" },
  { valor: "funcional", nome: "Funcional / HIIT" },
  { valor: "danca", nome: "Dança" },
  { valor: "casa", nome: "Treino em casa" },
  { valor: "outro", nome: "Outro" },
];

export const nomeTipoTreino = (t: TipoTreino) => TIPOS_TREINO.find((x) => x.valor === t)?.nome ?? "Treino";

export const INTENSIDADES: { valor: Intensidade; nome: string; desc: string }[] = [
  { valor: "leve", nome: "Leve", desc: "Dá para conversar e cantar" },
  { valor: "moderada", nome: "Moderada", desc: "Dá para conversar, mas não cantar" },
  { valor: "intensa", nome: "Intensa", desc: "Só algumas palavras de cada vez" },
];

export const LIMITES_TREINO = { duracaoMin: 1, duracaoMax: 600 } as const;

// --- meta semanal ---

export type TipoMeta = "minutos" | "treinos";
export interface MetaAtividade {
  tipo: TipoMeta;
  valor: number;
}

/** Recomendação da OMS (2020): ao menos 150 min/semana de atividade moderada. */
export const META_ATIVIDADE_PADRAO: MetaAtividade = { tipo: "minutos", valor: 150 };
export const LIMITES_META = { minutos: { min: 30, max: 1200 }, treinos: { min: 1, max: 14 } } as const;

/** Uma atividade da semana, venha do GPS ou do registro manual. */
export interface Atividade {
  id: string;
  origem: "gps" | "manual";
  tipo: TipoTreino;
  dataLocal: string;
  minutos: number;
  distanciaM?: number;
  inicioEm: string; // ISO, para ordenar
}

export function unificarAtividades(treinos: Treino[], caminhadas: Caminhada[]): Atividade[] {
  return [
    ...treinos.map((t) => ({
      id: t.id,
      origem: "manual" as const,
      tipo: t.tipo,
      dataLocal: t.dataLocal,
      minutos: t.duracaoMin,
      inicioEm: t.registradoEm,
    })),
    ...caminhadas.map((c) => ({
      id: c.id,
      origem: "gps" as const,
      tipo: "caminhada" as const,
      dataLocal: c.dataLocal,
      minutos: Math.round(c.duracaoS / 60),
      distanciaM: c.distanciaM,
      inicioEm: c.inicioEm,
    })),
  ].sort((a, b) => b.inicioEm.localeCompare(a.inicioEm));
}

export interface ProgressoSemana {
  minutos: number;
  treinos: number;
  /** Valor que conta para a meta (minutos ou nº de treinos). */
  atual: number;
  meta: number;
  pct: number; // 0–100
  bateu: boolean;
}

export function progressoSemana(atividades: Atividade[], segunda: string, domingo: string, meta: MetaAtividade): ProgressoSemana {
  const daSemana = atividades.filter((a) => a.dataLocal >= segunda && a.dataLocal <= domingo);
  const minutos = daSemana.reduce((s, a) => s + a.minutos, 0);
  const treinos = daSemana.length;
  const atual = meta.tipo === "minutos" ? minutos : treinos;
  const pct = meta.valor > 0 ? Math.min(100, Math.round((atual / meta.valor) * 100)) : 0;
  return { minutos, treinos, atual, meta: meta.valor, pct, bateu: atual >= meta.valor };
}

// --- conquistas de atividade ---

export interface ConquistaAtividade {
  id: string;
  titulo: string;
  descricao: string;
  conquistada: boolean;
  progresso: number;
}

export const MARCOS_KM_TOTAL = [10, 42, 100, 250] as const;
export const MARCOS_KM_UNICA = [1, 3, 5, 10] as const;
export const MARCOS_TREINOS = [1, 10, 30, 100] as const;

export function calcularConquistasAtividade(p: {
  kmTotal: number;
  maiorCaminhadaKm: number;
  qtdCaminhadas: number;
  qtdTreinos: number;
  semanasNaMeta: number;
}): ConquistaAtividade[] {
  const prog = (v: number, alvo: number) => Math.max(0, Math.min(1, v / alvo));
  return [
    {
      id: "caminhada-primeira",
      titulo: "Primeiros passos",
      descricao: "Gravou a primeira caminhada",
      conquistada: p.qtdCaminhadas >= 1,
      progresso: prog(p.qtdCaminhadas, 1),
    },
    ...MARCOS_KM_UNICA.map((n) => ({
      id: `caminhada-unica-${n}`,
      titulo: `${n} km de uma vez`,
      descricao: `Caminhou ${n} km numa única caminhada`,
      conquistada: p.maiorCaminhadaKm >= n,
      progresso: prog(p.maiorCaminhadaKm, n),
    })),
    ...MARCOS_KM_TOTAL.map((n) => ({
      id: `caminhada-total-${n}`,
      titulo: n === 42 ? "Uma maratona" : `${n} km no total`,
      descricao: n === 42 ? "Somou 42 km em caminhadas" : `Somou ${n} km em caminhadas`,
      conquistada: p.kmTotal >= n,
      progresso: prog(p.kmTotal, n),
    })),
    ...MARCOS_TREINOS.map((n) => ({
      id: `treinos-${n}`,
      titulo: n === 1 ? "Primeiro treino" : `${n} treinos`,
      descricao: n === 1 ? "Registrou o primeiro treino" : `Registrou ${n} treinos ou caminhadas`,
      conquistada: p.qtdTreinos >= n,
      progresso: prog(p.qtdTreinos, n),
    })),
    {
      id: "semana-ativa",
      titulo: "Semana ativa",
      descricao: "Bateu a meta semanal de atividade",
      conquistada: p.semanasNaMeta >= 1,
      progresso: prog(p.semanasNaMeta, 1),
    },
    {
      id: "semanas-ativas-4",
      titulo: "Um mês ativo",
      descricao: "Bateu a meta de atividade em 4 semanas",
      conquistada: p.semanasNaMeta >= 4,
      progresso: prog(p.semanasNaMeta, 4),
    },
  ];
}

/** Conquistas que passaram a valer entre dois cálculos (para celebrar). */
export function novasConquistas(antes: ConquistaAtividade[], depois: ConquistaAtividade[]): ConquistaAtividade[] {
  const ja = new Set(antes.filter((c) => c.conquistada).map((c) => c.id));
  return depois.filter((c) => c.conquistada && !ja.has(c.id));
}
