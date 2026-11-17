// Mural de planos (Comunidade, fase 1) — tipos compartilhados.
// Só a ESTRUTURA do plano é pública. Nunca fotos, progresso, aderência ou perfil de saúde.

import type { ObjetivoRegime, TipoRefeicao } from "../tipos";

export interface RefeicaoMural {
  tipo: TipoRefeicao;
  horario: string;
  descricao: string;
}

export interface PlanoMural {
  id: string;
  /** Apelido público escolhido ao publicar (não é o nome do perfil). */
  apelido: string;
  oficial: boolean; // modelos da equipe Orvalho
  nome: string;
  descricao: string;
  objetivo: ObjetivoRegime;
  duracaoDias: number;
  refeicoes: RefeicaoMural[];
  publicadoEm: string; // ISO
  /** Contadores reais (no modo local: só as suas interações). */
  salvamentos: number;
  uteis: number;
  /** Do ponto de vista de quem está vendo. */
  meu: boolean;
  marqueiUtil: boolean;
  salvei: boolean;
}

export type OrdemMural = "recentes" | "mais_salvos";

export type MotivoDenuncia = "saude" | "spam" | "ofensivo" | "outro";

export const MOTIVOS_DENUNCIA: { valor: MotivoDenuncia; nome: string; desc: string }[] = [
  { valor: "saude", nome: "Pode fazer mal à saúde", desc: "Promete resultado rápido, restrição extrema ou jejum perigoso" },
  { valor: "spam", nome: "Propaganda ou spam", desc: "Vende produto, tem link ou contato" },
  { valor: "ofensivo", nome: "Ofensivo ou inadequado", desc: "Linguagem ofensiva ou conteúdo impróprio" },
  { valor: "outro", nome: "Outro motivo", desc: "Algo que não deveria estar aqui" },
];

export interface NovaPublicacao {
  apelido: string;
  nome: string;
  descricao: string;
  objetivo: ObjetivoRegime;
  duracaoDias: number;
  refeicoes: RefeicaoMural[];
}
