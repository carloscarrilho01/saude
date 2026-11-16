// Rótulos e constantes compartilhados de refeições/unidades.

import type { TipoRefeicao, Unidade, ObjetivoRegime } from "./tipos";

export const TIPOS_REFEICAO: { valor: TipoRefeicao; nome: string }[] = [
  { valor: "cafe", nome: "Café da manhã" },
  { valor: "almoco", nome: "Almoço" },
  { valor: "lanche", nome: "Lanche" },
  { valor: "jantar", nome: "Jantar" },
  { valor: "outro", nome: "Outro" },
];

export function nomeRefeicao(tipo: TipoRefeicao): string {
  return TIPOS_REFEICAO.find((t) => t.valor === tipo)?.nome ?? "Outro";
}


export const UNIDADES: { valor: Unidade; nome: string }[] = [
  { valor: "g", nome: "Gramas (g)" },
  { valor: "ml", nome: "Mililitros (ml)" },
  { valor: "unidade", nome: "Unidade" },
  { valor: "porcao", nome: "Porção" },
  { valor: "fatia", nome: "Fatia" },
  { valor: "colher", nome: "Colher" },
];

export function abreviarUnidade(u: Unidade, qtd: number): string {
  switch (u) {
    case "g":
      return "g";
    case "ml":
      return "ml";
    case "unidade":
      return qtd === 1 ? "unidade" : "unidades";
    case "porcao":
      return qtd === 1 ? "porção" : "porções";
    case "fatia":
      return qtd === 1 ? "fatia" : "fatias";
    case "colher":
      return qtd === 1 ? "colher" : "colheres";
  }
}

export const OBJETIVOS: { valor: ObjetivoRegime; nome: string }[] = [
  { valor: "perder", nome: "Perder peso" },
  { valor: "manter", nome: "Manter" },
  { valor: "ganhar", nome: "Ganhar massa" },
  { valor: "hidratacao", nome: "Só hidratação" },
];

export function nomeObjetivo(o: ObjetivoRegime): string {
  return OBJETIVOS.find((x) => x.valor === o)?.nome ?? o;
}
