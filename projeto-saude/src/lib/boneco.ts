// Boneco articulado 2D para animar exercícios — módulo PURO.
//
// Ângulos em graus, absolutos: 0 = para baixo, 90 = para a frente (+x),
// 180 = para cima, -90 = para trás. Cada segmento parte da articulação anterior.
// "A" é o lado de perto (traço forte); "B" o de longe (traço claro).
// Na vista "frente", A é o lado direito da tela e B o esquerdo.

export interface Pose {
  tronco: number; // direção pelve → ombros (em pé = 180)
  curva?: number; // arqueamento da coluna (+ para cima/fora, − afunda)
  cabeca?: number; // inclinação extra da cabeça em relação ao tronco
  bracoA: [number, number]; // [ombro→cotovelo, cotovelo→mão]
  bracoB: [number, number];
  pernaA: [number, number]; // [quadril→joelho, joelho→tornozelo]
  pernaB: [number, number];
  peA?: number; // direção tornozelo → ponta do pé (padrão 90 = pé apoiado)
  peB?: number;
  coxa?: number; // escala da coxa (encurtamento em perspectiva, ex.: sentado de frente)
  ombros?: number; // meia largura dos ombros na vista de frente (padrão 12)
}

export type Ancora = "peA" | "peB" | "maoA" | "pelve";

export interface Animacao {
  vista: "lado" | "frente";
  quadros: Pose[];
  /** Duração de um ciclo completo (ms). */
  ciclo: number;
  /** O que fica parado na horizontal (o chão segura a vertical). */
  ancora: Ancora;
  objeto?: "cadeira" | "cadeira-frente" | "parede" | "porta" | "tapete";
}

export const DIM = {
  largura: 200,
  altura: 170,
  chao: 158,
  tronco: 48,
  pescoco: 6,
  raioCabeca: 9.5,
  braco: 25,
  antebraco: 24,
  coxa: 32,
  canela: 32,
  pe: 10,
  quadrilFrente: 7,
} as const;

export type Pt = { x: number; y: number };
export interface Esqueleto {
  pelve: Pt;
  pescoco: Pt;
  cabeca: Pt;
  controleTronco: Pt;
  ombroA: Pt;
  ombroB: Pt;
  cotoveloA: Pt;
  cotoveloB: Pt;
  maoA: Pt;
  maoB: Pt;
  quadrilA: Pt;
  quadrilB: Pt;
  joelhoA: Pt;
  joelhoB: Pt;
  tornozeloA: Pt;
  tornozeloB: Pt;
  ponteiraA: Pt;
  ponteiraB: Pt;
}

const rad = (g: number) => (g * Math.PI) / 180;
const passo = (p: Pt, ang: number, len: number): Pt => ({ x: p.x + Math.sin(rad(ang)) * len, y: p.y + Math.cos(rad(ang)) * len });

/** Cinemática direta a partir da pelve na origem. */
function cinematica(p: Pose, vista: Animacao["vista"]): Esqueleto {
  const pelve = { x: 0, y: 0 };
  const pescoco = passo(pelve, p.tronco, DIM.tronco);
  const curva = p.curva ?? 0;
  // ponto de controle do tronco: meio do segmento deslocado na perpendicular
  const meio = passo(pelve, p.tronco, DIM.tronco / 2);
  const controleTronco = passo(meio, p.tronco - 90, curva);
  const cabeca = passo(pescoco, p.tronco + (p.cabeca ?? 0), DIM.pescoco + DIM.raioCabeca);
  const largOmbro = vista === "frente" ? (p.ombros ?? 12) : 0;
  const largQuadril = vista === "frente" ? DIM.quadrilFrente : 0;
  // na vista de frente, ombros/quadris abrem na perpendicular do tronco
  const ombroA = passo(pescoco, p.tronco + 90, largOmbro);
  const ombroB = passo(pescoco, p.tronco - 90, largOmbro);
  const quadrilA = passo(pelve, p.tronco + 90, largQuadril);
  const quadrilB = passo(pelve, p.tronco - 90, largQuadril);
  const cotoveloA = passo(ombroA, p.bracoA[0], DIM.braco);
  const cotoveloB = passo(ombroB, p.bracoB[0], DIM.braco);
  const maoA = passo(cotoveloA, p.bracoA[1], DIM.antebraco);
  const maoB = passo(cotoveloB, p.bracoB[1], DIM.antebraco);
  const coxa = DIM.coxa * (p.coxa ?? 1);
  const joelhoA = passo(quadrilA, p.pernaA[0], coxa);
  const joelhoB = passo(quadrilB, p.pernaB[0], coxa);
  const tornozeloA = passo(joelhoA, p.pernaA[1], DIM.canela);
  const tornozeloB = passo(joelhoB, p.pernaB[1], DIM.canela);
  const pe = vista === "frente" ? 4 : DIM.pe; // de frente o pé aparece curto
  const ponteiraA = passo(tornozeloA, vista === "frente" ? 0 : (p.peA ?? 90), pe);
  const ponteiraB = passo(tornozeloB, vista === "frente" ? 0 : (p.peB ?? 90), pe);
  return { pelve, pescoco, cabeca, controleTronco, ombroA, ombroB, cotoveloA, cotoveloB, maoA, maoB, quadrilA, quadrilB, joelhoA, joelhoB, tornozeloA, tornozeloB, ponteiraA, ponteiraB };
}

/**
 * Posiciona o esqueleto na cena: o ponto mais baixo toca o chão e a âncora
 * fica no x de referência (assim o pé não "patina" durante o movimento).
 */
export function montar(p: Pose, anim: Pick<Animacao, "vista" | "ancora">, xAncora = DIM.largura / 2): Esqueleto {
  const e = cinematica(p, anim.vista);
  const pts = Object.values(e) as Pt[];
  const contato = pts.filter((pt) => pt !== e.controleTronco);
  const maxY = Math.max(...contato.map((pt) => pt.y)) + (anim.vista === "frente" ? 0 : 0);
  const ref = anim.ancora === "pelve" ? e.pelve : anim.ancora === "maoA" ? e.maoA : anim.ancora === "peB" ? e.tornozeloB : e.tornozeloA;
  const dx = xAncora - ref.x;
  const dy = DIM.chao - 2 - maxY;
  const mov = (pt: Pt) => ({ x: pt.x + dx, y: pt.y + dy });
  return Object.fromEntries(Object.entries(e).map(([k, v]) => [k, mov(v)])) as unknown as Esqueleto;
}

/** Diferença angular pelo caminho mais curto (−180…180). */
const delta = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAng = (a: number, b: number, t: number) => a + delta(a, b) * t;

export function interpolar(a: Pose, b: Pose, t: number): Pose {
  const par = (x: [number, number], y: [number, number]): [number, number] => [lerpAng(x[0], y[0], t), lerpAng(x[1], y[1], t)];
  return {
    tronco: lerpAng(a.tronco, b.tronco, t),
    curva: lerp(a.curva ?? 0, b.curva ?? 0, t),
    cabeca: lerpAng(a.cabeca ?? 0, b.cabeca ?? 0, t),
    bracoA: par(a.bracoA, b.bracoA),
    bracoB: par(a.bracoB, b.bracoB),
    pernaA: par(a.pernaA, b.pernaA),
    pernaB: par(a.pernaB, b.pernaB),
    peA: lerpAng(a.peA ?? 90, b.peA ?? 90, t),
    peB: lerpAng(a.peB ?? 90, b.peB ?? 90, t),
    coxa: lerp(a.coxa ?? 1, b.coxa ?? 1, t),
    ombros: lerp(a.ombros ?? 12, b.ombros ?? 12, t),
  };
}

/** Pose no instante t (0–1 do ciclo), com suavização entre quadros. */
export function poseNoTempo(anim: Animacao, t: number): Pose {
  const n = anim.quadros.length;
  if (n === 1) return anim.quadros[0];
  const pos = (((t % 1) + 1) % 1) * n;
  const i = Math.floor(pos);
  const frac = pos - i;
  const suave = 0.5 - Math.cos(frac * Math.PI) / 2; // ease-in-out
  return interpolar(anim.quadros[i], anim.quadros[(i + 1) % n], suave);
}
