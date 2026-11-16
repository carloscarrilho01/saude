// Modelos prontos de regime (RF-5.7) — dados estáticos, sem lógica de UI.
//
// São ROTINAS DE ORGANIZAÇÃO, não prescrição: horários + tipo de refeição com
// descrições genéricas, sem calorias nem porções. As orientações seguem os
// princípios gerais do "Guia Alimentar para a População Brasileira"
// (Ministério da Saúde, 2ª ed., 2014). Antes de lançar, revisar com o mesmo
// profissional que validar os parâmetros de hidratação (PRD §10.1).

import type { ObjetivoRegime, TipoRefeicao } from "./tipos";

export interface RefeicaoModelo {
  tipo: TipoRefeicao;
  horario: string; // "HH:MM"
  descricao: string;
}

export interface ModeloRegime {
  slug: string;
  nome: string;
  objetivo: ObjetivoRegime;
  duracaoDias: number;
  /** Uma linha para o card. */
  resumo: string;
  /** Para quem o modelo costuma servir (sem promessa de resultado). */
  praQuem: string;
  orientacoes: string[];
  refeicoes: RefeicaoModelo[];
}

export const FONTE_ORIENTACOES = "Guia Alimentar para a População Brasileira (Ministério da Saúde, 2014)";

export const MODELOS_REGIME: ModeloRegime[] = [
  {
    slug: "rotina-regular",
    nome: "Rotina regular",
    objetivo: "manter",
    duracaoDias: 30,
    resumo: "Quatro refeições em horários fixos para tirar o dia do improviso.",
    praQuem: "Quem pula refeições ou come em horários muito diferentes a cada dia.",
    orientacoes: [
      "Procure comer em horários parecidos todos os dias.",
      "Coma com calma e, quando der, sem telas.",
      "Faça das refeições principais um prato de comida, não um lanche.",
    ],
    refeicoes: [
      { tipo: "cafe", horario: "07:30", descricao: "Fruta, pão ou cuscuz e café com leite" },
      { tipo: "almoco", horario: "12:30", descricao: "Arroz, feijão, uma proteína e salada ou legumes" },
      { tipo: "lanche", horario: "16:00", descricao: "Fruta ou iogurte natural" },
      { tipo: "jantar", horario: "19:30", descricao: "Prato com legumes e uma proteína" },
    ],
  },
  {
    slug: "comida-de-verdade",
    nome: "Comida de verdade",
    objetivo: "manter",
    duracaoDias: 30,
    resumo: "Base de alimentos in natura e preparações caseiras no lugar dos ultraprocessados.",
    praQuem: "Quem quer trocar pacotes e congelados prontos por comida feita em casa.",
    orientacoes: [
      "Faça de alimentos in natura ou minimamente processados a base da alimentação.",
      "Use óleos, sal e açúcar em pequenas quantidades ao cozinhar.",
      "Evite alimentos ultraprocessados, como refrigerantes, salgadinhos e biscoitos recheados.",
    ],
    refeicoes: [
      { tipo: "cafe", horario: "07:30", descricao: "Fruta, ovos mexidos e café sem açúcar ou com pouco" },
      { tipo: "almoco", horario: "12:30", descricao: "Arroz, feijão, legumes refogados e uma proteína feita em casa" },
      { tipo: "lanche", horario: "16:00", descricao: "Fruta com castanhas ou amendoim" },
      { tipo: "jantar", horario: "19:30", descricao: "Sopa ou prato caseiro com legumes" },
    ],
  },
  {
    slug: "reeducacao-alimentar",
    nome: "Reeducação alimentar",
    objetivo: "perder",
    duracaoDias: 30,
    resumo: "Cinco momentos no dia, com mais frutas, verduras e legumes no prato.",
    praQuem: "Quem quer emagrecer organizando a rotina, sem cortar grupos de alimentos.",
    orientacoes: [
      "Encha metade do prato do almoço e do jantar com verduras e legumes.",
      "Prefira água a sucos e refrigerantes.",
      "Para metas de peso e porções, o ideal é o acompanhamento de um nutricionista.",
    ],
    refeicoes: [
      { tipo: "cafe", horario: "07:00", descricao: "Fruta, pão integral ou tapioca e café com leite" },
      { tipo: "lanche", horario: "10:00", descricao: "Fruta" },
      { tipo: "almoco", horario: "12:30", descricao: "Salada, arroz, feijão, legumes e uma proteína" },
      { tipo: "lanche", horario: "16:00", descricao: "Iogurte natural ou fruta" },
      { tipo: "jantar", horario: "19:30", descricao: "Legumes, salada e uma proteína" },
    ],
  },
  {
    slug: "ganho-de-massa",
    nome: "Rotina para ganho de massa",
    objetivo: "ganhar",
    duracaoDias: 30,
    resumo: "Cinco refeições com uma fonte de proteína em cada uma, incluindo o pós-treino.",
    praQuem: "Quem treina e tem dificuldade de manter refeições ao longo do dia.",
    orientacoes: [
      "Inclua uma fonte de proteína em cada refeição: ovos, carnes, leguminosas ou laticínios.",
      "Não pule refeições nos dias de treino.",
      "Quantidades e suplementos devem ser definidos com um nutricionista.",
    ],
    refeicoes: [
      { tipo: "cafe", horario: "07:00", descricao: "Ovos, pão ou cuscuz, fruta e leite" },
      { tipo: "lanche", horario: "10:00", descricao: "Iogurte com fruta e aveia" },
      { tipo: "almoco", horario: "12:30", descricao: "Arroz, feijão, uma proteína e legumes" },
      { tipo: "lanche", horario: "17:00", descricao: "Pós-treino: sanduíche com proteína e uma fruta" },
      { tipo: "jantar", horario: "20:00", descricao: "Prato com carboidrato, uma proteína e legumes" },
    ],
  },
  {
    slug: "dia-corrido",
    nome: "Dia corrido",
    objetivo: "manter",
    duracaoDias: 14,
    resumo: "Marmita e lanches que cabem na bolsa, para quem passa o dia fora.",
    praQuem: "Quem almoça no trabalho e acaba comendo o que aparece.",
    orientacoes: [
      "Planeje as refeições da semana e prepare marmitas com antecedência.",
      "Deixe frutas e castanhas à mão para não depender da máquina de lanches.",
      "Leve uma garrafa de água com você.",
    ],
    refeicoes: [
      { tipo: "cafe", horario: "06:30", descricao: "Café com leite, fruta e pão" },
      { tipo: "almoco", horario: "12:00", descricao: "Marmita: arroz, feijão, uma proteína e legumes" },
      { tipo: "lanche", horario: "15:30", descricao: "Fruta e castanhas levadas de casa" },
      { tipo: "jantar", horario: "20:00", descricao: "Refeição simples e caseira, como omelete com salada" },
    ],
  },
];

export function getModelo(slug: string): ModeloRegime | undefined {
  return MODELOS_REGIME.find((m) => m.slug === slug);
}
