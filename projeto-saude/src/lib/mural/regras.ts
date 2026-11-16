// Regras do mural — módulo PURO (validação, anti-spam, ordenação).
// O servidor repete estas regras (checks/triggers no schema): o cliente não é confiável.

import type { NovaPublicacao, OrdemMural, PlanoMural } from "./tipos";

export const LIMITES_MURAL = {
  apelido: { min: 2, max: 24 },
  nome: { min: 3, max: 60 },
  descricao: { min: 10, max: 280 },
  refeicoes: { min: 1, max: 12 },
  descricaoRefeicao: 120,
  /** Denúncias de pessoas diferentes que ocultam a publicação até revisão. */
  denunciasParaOcultar: 3,
} as const;

/** Links, e-mails, telefones e @ — o mural não é lugar de propaganda (fase 1). */
const CONTATO = [
  /https?:\/\//i,
  /www\./i,
  /\b[a-z0-9-]+\.(com|net|org|br|io|app|shop|store|link|ly)\b/i,
  /[\w.+-]+@[\w-]+\.[\w.]+/,
  /(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/,
  /(^|\s)@[a-z0-9_.]{3,}/i,
  /\b(whats|zap|wpp|pix|direct|dm|link na bio)\b/i,
];

/** Promessas que o mural não aceita (PRD §11: sem prescrição/promessa de resultado). */
const PROMESSA = [
  /\b(perca|perder|emagre[çc]a)\s+\d+\s*(kg|quilos)/i,
  /\b\d+\s*(kg|quilos)\s+em\s+\d+\s*(dias|semanas)/i,
  /\b(garantid[oa]|milagr\w*|detox|seca barriga|cura)\b/i,
];

export function temContato(texto: string): boolean {
  return CONTATO.some((r) => r.test(texto));
}

export function temPromessa(texto: string): boolean {
  return PROMESSA.some((r) => r.test(texto));
}

const limpar = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();

export type ErrosPublicacao = Partial<Record<"apelido" | "nome" | "descricao" | "refeicoes", string>>;

/** Valida e normaliza uma publicação. Devolve os erros por campo (vazio = ok). */
export function validarPublicacao(p: NovaPublicacao): { dados: NovaPublicacao; erros: ErrosPublicacao } {
  const L = LIMITES_MURAL;
  const dados: NovaPublicacao = {
    ...p,
    apelido: limpar(p.apelido),
    nome: limpar(p.nome),
    descricao: limpar(p.descricao),
    refeicoes: p.refeicoes.map((r) => ({ ...r, descricao: limpar(r.descricao).slice(0, L.descricaoRefeicao) })),
  };
  const erros: ErrosPublicacao = {};

  if (dados.apelido.length < L.apelido.min || dados.apelido.length > L.apelido.max)
    erros.apelido = `Use de ${L.apelido.min} a ${L.apelido.max} caracteres.`;
  else if (temContato(dados.apelido)) erros.apelido = "O apelido não pode ter @, link ou contato.";

  if (dados.nome.length < L.nome.min || dados.nome.length > L.nome.max)
    erros.nome = `O nome do plano precisa ter de ${L.nome.min} a ${L.nome.max} caracteres.`;

  if (dados.descricao.length < L.descricao.min) erros.descricao = "Conte em uma frase para quem é este plano.";
  else if (dados.descricao.length > L.descricao.max) erros.descricao = `Use até ${L.descricao.max} caracteres.`;

  const textos = [dados.nome, dados.descricao, ...dados.refeicoes.map((r) => r.descricao)].join(" ");
  if (temContato(textos)) erros.descricao = "Tire links, telefones, @ e e-mails. O mural não aceita propaganda.";
  else if (temPromessa(textos))
    erros.descricao = "Evite prometer resultado (como “perca 5 kg em 10 dias”). Cada corpo responde de um jeito.";

  if (dados.refeicoes.length < L.refeicoes.min) erros.refeicoes = "Publique um plano com pelo menos uma refeição.";
  else if (dados.refeicoes.length > L.refeicoes.max) erros.refeicoes = `Máximo de ${L.refeicoes.max} refeições.`;
  else if (dados.refeicoes.some((r) => !r.descricao)) erros.refeicoes = "Todas as refeições precisam de descrição.";

  return { dados, erros };
}

/** Oficiais primeiro; depois pela ordem escolhida. */
export function ordenarMural(planos: PlanoMural[], ordem: OrdemMural): PlanoMural[] {
  return [...planos].sort((a, b) => {
    if (a.oficial !== b.oficial) return a.oficial ? -1 : 1;
    if (ordem === "mais_salvos" && a.salvamentos !== b.salvamentos) return b.salvamentos - a.salvamentos;
    return b.publicadoEm.localeCompare(a.publicadoEm);
  });
}

/** "há 3 dias", "hoje" — para o card. */
export function tempoRelativo(iso: string, agora = new Date()): string {
  const dias = Math.floor((agora.getTime() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
}
