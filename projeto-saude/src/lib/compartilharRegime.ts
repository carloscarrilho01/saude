// Compartilhar plano por link — módulo PURO.
//
// O link carrega só a estrutura do plano (nome, objetivo, duração, refeições).
// Nunca vai foto, progresso, aderência ou dado do perfil. O conteúdo fica no
// fragmento (#…) da URL, que o navegador não envia ao servidor.
// Quem recebe o link é desconhecido: decodificar valida e limita tudo.

import type { ObjetivoRegime, TipoRefeicao } from "./tipos";

export interface PlanoCompartilhado {
  nome: string;
  objetivo: ObjetivoRegime;
  duracaoDias: number;
  refeicoes: { tipo: TipoRefeicao; horario: string; descricao: string }[];
}

const OBJETIVOS: ObjetivoRegime[] = ["perder", "manter", "ganhar", "hidratacao"];
const TIPOS: TipoRefeicao[] = ["cafe", "almoco", "lanche", "jantar", "outro"];
const LIMITES = { nome: 60, descricao: 120, refeicoes: 12, duracaoMin: 1, duracaoMax: 365 };
const VERSAO = 1;

function paraBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(codigo: string): string {
  const b64 = codigo.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Remove caracteres de controle e corta no tamanho máximo. */
const limpar = (s: unknown, max: number) =>
  typeof s === "string" ? s.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "";

export function codificarPlano(plano: PlanoCompartilhado): string {
  const compacto = {
    v: VERSAO,
    n: limpar(plano.nome, LIMITES.nome),
    o: plano.objetivo,
    d: plano.duracaoDias,
    r: plano.refeicoes.slice(0, LIMITES.refeicoes).map((r) => [r.tipo, r.horario, limpar(r.descricao, LIMITES.descricao)]),
  };
  return paraBase64Url(JSON.stringify(compacto));
}

/** Decodifica e valida; devolve null se o código for inválido ou adulterado. */
export function decodificarPlano(codigo: string): PlanoCompartilhado | null {
  if (!codigo || codigo.length > 8000 || !/^[A-Za-z0-9_-]+$/.test(codigo)) return null;
  let dados: unknown;
  try {
    dados = JSON.parse(deBase64Url(codigo));
  } catch {
    return null;
  }
  if (!dados || typeof dados !== "object") return null;
  const d = dados as Record<string, unknown>;
  if (d.v !== VERSAO) return null;

  const nome = limpar(d.n, LIMITES.nome);
  const objetivo = OBJETIVOS.includes(d.o as ObjetivoRegime) ? (d.o as ObjetivoRegime) : null;
  const duracao = typeof d.d === "number" && Number.isInteger(d.d) ? d.d : NaN;
  if (!nome || !objetivo || !(duracao >= LIMITES.duracaoMin && duracao <= LIMITES.duracaoMax)) return null;
  if (!Array.isArray(d.r) || d.r.length > LIMITES.refeicoes) return null;

  const refeicoes: PlanoCompartilhado["refeicoes"] = [];
  for (const item of d.r) {
    if (!Array.isArray(item) || item.length !== 3) return null;
    const [tipo, horario, descricao] = item;
    if (!TIPOS.includes(tipo as TipoRefeicao)) return null;
    if (typeof horario !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) return null;
    const desc = limpar(descricao, LIMITES.descricao);
    if (!desc) return null;
    refeicoes.push({ tipo: tipo as TipoRefeicao, horario, descricao: desc });
  }
  return { nome, objetivo, duracaoDias: duracao, refeicoes };
}

/** Lê o código de um fragmento de URL no formato "#p=CODIGO". */
export function codigoDoFragmento(hash: string): string | null {
  const m = /(?:^#|&)p=([A-Za-z0-9_-]+)/.exec(hash);
  return m ? m[1] : null;
}
