// Animações dos exercícios dos treinos em casa (poses-chave do boneco).
// Convenção de ângulos em lib/boneco.ts. Chave = nome do exercício (rotinasCasa.ts).

import type { Animacao, Pose } from "./boneco";

// --- poses base ---
const EM_PE: Pose = { tronco: 180, bracoA: [4, 6], bracoB: [-4, -2], pernaA: [0, 0], pernaB: [0, 0] };
const EM_PE_FRENTE: Pose = { tronco: 180, bracoA: [10, 6], bracoB: [-10, -6], pernaA: [3, 2], pernaB: [-3, -2] };
const MAOS_NA_CINTURA_FRENTE = { bracoA: [40, -75] as [number, number], bracoB: [-40, 75] as [number, number] };

export const ANIMACOES: Record<string, Animacao> = {
  // ---------- aquecimento ----------
  "Marcha parada": {
    vista: "lado",
    ancora: "pelve",
    ciclo: 1400,
    quadros: [
      { ...EM_PE, bracoA: [-28, 30], bracoB: [32, 95], pernaA: [80, 0], pernaB: [0, 0] },
      { ...EM_PE, bracoA: [32, 95], bracoB: [-28, 30], pernaA: [0, 0], pernaB: [80, 0] },
    ],
  },
  "Círculos de braço": {
    vista: "lado",
    ancora: "peA",
    ciclo: 2400,
    quadros: [
      { ...EM_PE, bracoA: [0, 0], bracoB: [0, 0] },
      { ...EM_PE, bracoA: [90, 90], bracoB: [90, 90] },
      { ...EM_PE, bracoA: [180, 180], bracoB: [180, 180] },
      { ...EM_PE, bracoA: [-90, -90], bracoB: [-90, -90] },
    ],
  },
  "Rotação de quadril": {
    vista: "frente",
    ancora: "peA",
    ciclo: 2400,
    quadros: [
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, tronco: 186, pernaA: [2, 2], pernaB: [-14, -14] },
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, tronco: 180, pernaA: [8, 8], pernaB: [-8, -8] },
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, tronco: 174, pernaA: [14, 14], pernaB: [-2, -2] },
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, tronco: 180, pernaA: [8, 8], pernaB: [-8, -8] },
    ],
  },

  // ---------- força / circuito ----------
  "Sentar e levantar da cadeira": {
    vista: "lado",
    ancora: "peA",
    objeto: "cadeira",
    ciclo: 2600,
    quadros: [
      { ...EM_PE, bracoA: [70, 85], bracoB: [70, 85] },
      { tronco: 160, bracoA: [75, 90], bracoB: [75, 90], pernaA: [90, 0], pernaB: [90, 0] },
    ],
  },
  "Flexão na parede": {
    vista: "lado",
    ancora: "peA",
    objeto: "parede",
    ciclo: 2200,
    quadros: [
      { tronco: 160, bracoA: [88, 88], bracoB: [88, 88], pernaA: [-20, -20], pernaB: [-20, -20] },
      { tronco: 154, bracoA: [58, 122], bracoB: [58, 122], pernaA: [-26, -26], pernaB: [-26, -26] },
    ],
  },
  "Ponte de glúteo": {
    vista: "lado",
    ancora: "peA",
    objeto: "tapete",
    ciclo: 2600,
    quadros: [
      { tronco: -90, cabeca: 0, bracoA: [90, 90], bracoB: [90, 90], pernaA: [140, 25], pernaB: [140, 25] },
      { tronco: -70, cabeca: -20, bracoA: [100, 90], bracoB: [100, 90], pernaA: [120, 10], pernaB: [120, 10] },
    ],
  },
  "Elevação de panturrilha": {
    vista: "lado",
    ancora: "peA",
    ciclo: 1800,
    quadros: [
      { ...EM_PE, peA: 90, peB: 90 },
      { ...EM_PE, peA: 18, peB: 18 },
    ],
  },
  Polichinelo: {
    vista: "frente",
    ancora: "pelve",
    ciclo: 1100,
    quadros: [
      { ...EM_PE_FRENTE, bracoA: [12, 8], bracoB: [-12, -8], pernaA: [3, 2], pernaB: [-3, -2] },
      { ...EM_PE_FRENTE, bracoA: [150, 165], bracoB: [-150, -165], pernaA: [18, 18], pernaB: [-18, -18] },
    ],
  },
  Agachamento: {
    vista: "lado",
    ancora: "peA",
    ciclo: 2400,
    quadros: [
      { ...EM_PE, bracoA: [10, 10], bracoB: [10, 10] },
      { tronco: 145, bracoA: [90, 90], bracoB: [90, 90], pernaA: [78, -28], pernaB: [78, -28] },
    ],
  },
  Escalador: {
    vista: "lado",
    ancora: "maoA",
    ciclo: 1000,
    quadros: [
      { tronco: 105, cabeca: -10, bracoA: [5, 5], bracoB: [5, 5], pernaA: [35, -55], pernaB: [-75, -75], peA: 160, peB: 170 },
      { tronco: 105, cabeca: -10, bracoA: [5, 5], bracoB: [5, 5], pernaA: [-75, -75], pernaB: [35, -55], peA: 170, peB: 160 },
    ],
  },
  "Avanço alternado": {
    vista: "lado",
    ancora: "pelve",
    ciclo: 2600,
    quadros: [
      { ...EM_PE, bracoA: [40, -70], bracoB: [40, -70] },
      { tronco: 180, bracoA: [40, -70], bracoB: [40, -70], pernaA: [80, 0], pernaB: [-25, -85], peB: 170 },
    ],
  },
  "Corrida parada": {
    vista: "lado",
    ancora: "pelve",
    ciclo: 800,
    quadros: [
      { tronco: 175, bracoA: [-35, 55], bracoB: [35, 120], pernaA: [55, -40], pernaB: [-8, -40] },
      { tronco: 175, bracoA: [35, 120], bracoB: [-35, 55], pernaA: [-8, -40], pernaB: [55, -40] },
    ],
  },
  "Flexão de braço": {
    vista: "lado",
    ancora: "maoA",
    objeto: "tapete",
    ciclo: 2200,
    quadros: [
      { tronco: 103, bracoA: [0, 0], bracoB: [0, 0], pernaA: [-77, -77], pernaB: [-77, -77], peA: 175, peB: 175 },
      { tronco: 94, bracoA: [-55, 5], bracoB: [-55, 5], pernaA: [-86, -86], pernaB: [-86, -86], peA: 175, peB: 175 },
    ],
  },
  Superman: {
    vista: "lado",
    ancora: "pelve",
    objeto: "tapete",
    ciclo: 2400,
    quadros: [
      { tronco: 90, bracoA: [90, 90], bracoB: [90, 90], pernaA: [-90, -90], pernaB: [-90, -90], peA: 180, peB: 180 },
      { tronco: 103, cabeca: 5, bracoA: [110, 112], bracoB: [110, 112], pernaA: [-103, -103], pernaB: [-103, -103], peA: 190, peB: 190 },
    ],
  },
  Prancha: {
    vista: "lado",
    ancora: "maoA",
    objeto: "tapete",
    ciclo: 3000,
    quadros: [
      { tronco: 98, bracoA: [0, 90], bracoB: [0, 90], pernaA: [-82, -82], pernaB: [-82, -82], peA: 175, peB: 175 },
      { tronco: 99, curva: 1.5, bracoA: [0, 90], bracoB: [0, 90], pernaA: [-81, -81], pernaB: [-81, -81], peA: 175, peB: 175 },
    ],
  },

  // ---------- mobilidade / alongamento ----------
  "Gato e camelo": {
    vista: "lado",
    ancora: "maoA",
    objeto: "tapete",
    ciclo: 3600,
    quadros: [
      { tronco: 90, curva: 9, cabeca: -35, bracoA: [0, 0], bracoB: [0, 0], pernaA: [0, -90], pernaB: [0, -90], peA: 180, peB: 180 },
      { tronco: 90, curva: -7, cabeca: 30, bracoA: [0, 0], bracoB: [0, 0], pernaA: [0, -90], pernaB: [0, -90], peA: 180, peB: 180 },
    ],
  },
  "Rotação de tronco": {
    vista: "frente",
    ancora: "pelve",
    objeto: "cadeira-frente",
    ciclo: 3000,
    quadros: [
      { tronco: 180, ombros: 12, bracoA: [60, -60], bracoB: [-60, 60], pernaA: [6, 0], pernaB: [-6, 0], coxa: 0.35 },
      { tronco: 180, ombros: 5, cabeca: 0, bracoA: [70, -40], bracoB: [10, 80], pernaA: [6, 0], pernaB: [-6, 0], coxa: 0.35 },
      { tronco: 180, ombros: 12, bracoA: [60, -60], bracoB: [-60, 60], pernaA: [6, 0], pernaB: [-6, 0], coxa: 0.35 },
      { tronco: 180, ombros: 5, bracoA: [-10, -80], bracoB: [-70, 40], pernaA: [6, 0], pernaB: [-6, 0], coxa: 0.35 },
    ],
  },
  "Abertura de quadril": {
    vista: "frente",
    ancora: "peB",
    ciclo: 2600,
    quadros: [
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, pernaA: [3, 2] },
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, pernaA: [35, 0] },
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, pernaA: [80, 15] },
      { ...EM_PE_FRENTE, ...MAOS_NA_CINTURA_FRENTE, pernaA: [40, 5] },
    ],
  },
  "Alongamento de peito": {
    vista: "lado",
    ancora: "peA",
    objeto: "porta",
    ciclo: 3200,
    quadros: [
      { ...EM_PE, bracoA: [-95, -95], bracoB: [5, 5], pernaA: [0, 0], pernaB: [0, 0] },
      { ...EM_PE, tronco: 172, bracoA: [-100, -100], bracoB: [5, 5], pernaA: [-6, -6], pernaB: [-6, -6] },
    ],
  },
  Pescoço: {
    vista: "frente",
    ancora: "pelve",
    ciclo: 4000,
    quadros: [
      { ...EM_PE_FRENTE, cabeca: 0 },
      { ...EM_PE_FRENTE, cabeca: 28 },
      { ...EM_PE_FRENTE, cabeca: 0 },
      { ...EM_PE_FRENTE, cabeca: -28 },
    ],
  },
  "Alongamento de coxa": {
    vista: "lado",
    ancora: "peB",
    ciclo: 3000,
    quadros: [
      { ...EM_PE, bracoA: [-14, -6], bracoB: [60, 75], pernaA: [-4, -160], peA: 180 },
      { ...EM_PE, tronco: 178, bracoA: [-16, -8], bracoB: [65, 80], pernaA: [-8, -164], peA: 180 },
    ],
  },
  "Alongamento de posterior": {
    vista: "lado",
    ancora: "peA",
    ciclo: 3600,
    quadros: [
      { ...EM_PE, bracoA: [0, 0], bracoB: [0, 0] },
      { ...EM_PE, tronco: 92, cabeca: -20, bracoA: [5, 5], bracoB: [5, 5], pernaA: [-6, -6], pernaB: [-6, -6] },
    ],
  },
  Respiração: {
    vista: "lado",
    ancora: "peA",
    ciclo: 6000,
    quadros: [
      { ...EM_PE, bracoA: [5, 5], bracoB: [5, 5] },
      { ...EM_PE, curva: -2, cabeca: 5, bracoA: [150, 160], bracoB: [150, 160] },
    ],
  },
};

export function getAnimacao(nomeExercicio: string): Animacao | undefined {
  return ANIMACOES[nomeExercicio];
}
