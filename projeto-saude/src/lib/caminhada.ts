// Caminhada com GPS — módulo PURO (distância, filtros, ritmo, desenho do percurso).
// Sem calorias: estimar gasto exigiria parâmetros clínicos que o PRD não define.

/** [latitude, longitude, timestamp ms] */
export type Ponto = [number, number, number];

export interface Caminhada {
  id: string;
  inicioEm: string; // ISO
  fimEm: string; // ISO
  dataLocal: string; // "YYYY-MM-DD"
  distanciaM: number;
  duracaoS: number; // tempo em movimento (sem pausas)
  /** Trechos entre pausas; pontos já simplificados. Pode ser apagado mantendo os números. */
  trechos: Ponto[][];
}

/** Leituras com precisão pior que isso são descartadas (metros). */
export const PRECISAO_MAXIMA_M = 35;
/** Acima disso entre dois pontos é salto de GPS, não deslocamento (m/s ≈ 25 km/h). */
export const VELOCIDADE_MAXIMA_MS = 7;
/** Deslocamentos menores que isso são ruído de GPS parado (metros). */
export const PASSO_MINIMO_M = 4;

const R_TERRA = 6371008.8;
const rad = (g: number) => (g * Math.PI) / 180;

/** Distância em metros entre dois pontos (haversine). */
export function distanciaEntre(a: Ponto, b: Ponto): number {
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R_TERRA * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Decide se uma nova leitura entra no trecho. Rejeita leituras imprecisas,
 * saltos impossíveis a pé e micro-movimentos de GPS parado.
 */
export function aceitarPonto(ultimo: Ponto | undefined, novo: Ponto, precisaoM: number): boolean {
  if (!Number.isFinite(novo[0]) || !Number.isFinite(novo[1])) return false;
  if (precisaoM > PRECISAO_MAXIMA_M) return false;
  if (!ultimo) return true;
  const d = distanciaEntre(ultimo, novo);
  if (d < PASSO_MINIMO_M) return false;
  const dt = (novo[2] - ultimo[2]) / 1000;
  if (dt <= 0) return false;
  return d / dt <= VELOCIDADE_MAXIMA_MS;
}

export function distanciaTrecho(pontos: Ponto[]): number {
  let total = 0;
  for (let i = 1; i < pontos.length; i++) total += distanciaEntre(pontos[i - 1], pontos[i]);
  return total;
}

/** Soma dos trechos — o intervalo entre trechos (pausa) não conta. */
export function distanciaTotal(trechos: Ponto[][]): number {
  return trechos.reduce((s, t) => s + distanciaTrecho(t), 0);
}

/** Ritmo em segundos por km (null se a distância for pequena demais para ter sentido). */
export function ritmoSPorKm(distanciaM: number, duracaoS: number): number | null {
  if (distanciaM < 50 || duracaoS <= 0) return null;
  return duracaoS / (distanciaM / 1000);
}

// --- formatação pt-BR ---

export function formatarKm(m: number): string {
  return (m / 1000).toFixed(2).replace(".", ",");
}

export function formatarDuracao(s: number): string {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const min = Math.floor((t % 3600) / 60);
  const seg = t % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(min)}:${p(seg)}` : `${p(min)}:${p(seg)}`;
}

/** 545 s/km → "9'05\"" (padrão de corrida/caminhada). */
export function formatarRitmo(sPorKm: number | null): string {
  if (sPorKm == null || !Number.isFinite(sPorKm)) return "–'––\"";
  const t = Math.round(sPorKm);
  return `${Math.floor(t / 60)}'${String(t % 60).padStart(2, "0")}"`;
}

// --- armazenamento e desenho ---

/** Simplifica (Ramer–Douglas–Peucker) para guardar o percurso com poucos pontos. */
export function simplificar(pontos: Ponto[], toleranciaM = 3): Ponto[] {
  if (pontos.length <= 2) return pontos;
  const lat0 = rad(pontos[0][0]);
  const xy = pontos.map((p) => [R_TERRA * rad(p[1]) * Math.cos(lat0), R_TERRA * rad(p[0])] as const);
  const manter = new Uint8Array(pontos.length);
  manter[0] = manter[pontos.length - 1] = 1;
  const pilha: [number, number][] = [[0, pontos.length - 1]];
  while (pilha.length) {
    const [i, j] = pilha.pop()!;
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[j];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let maxD = -1;
    let idx = -1;
    for (let k = i + 1; k < j; k++) {
      const d = Math.abs(dy * xy[k][0] - dx * xy[k][1] + x2 * y1 - y2 * x1) / len;
      if (d > maxD) {
        maxD = d;
        idx = k;
      }
    }
    if (maxD > toleranciaM && idx > 0) {
      manter[idx] = 1;
      pilha.push([i, idx], [idx, j]);
    }
  }
  return pontos.filter((_, k) => manter[k]);
}

/**
 * Projeta os trechos numa caixa (largura × altura) mantendo a proporção.
 * Devolve só formas relativas — nenhuma coordenada real vai para o desenho.
 */
export function desenharPercurso(trechos: Ponto[][], largura: number, altura: number, margem = 8): string[] {
  const todos = trechos.flat();
  if (todos.length < 2) return [];
  const lat0 = rad(todos[0][0]);
  const xy = (p: Ponto) => [rad(p[1]) * Math.cos(lat0), -rad(p[0])] as const;
  const proj = todos.map(xy);
  const xs = proj.map((p) => p[0]);
  const ys = proj.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX || 1e-9;
  const h = Math.max(...ys) - minY || 1e-9;
  const escala = Math.min((largura - 2 * margem) / w, (altura - 2 * margem) / h);
  const offX = (largura - w * escala) / 2;
  const offY = (altura - h * escala) / 2;
  return trechos
    .filter((t) => t.length > 1)
    .map((t) =>
      t
        .map((p, i) => {
          const [x, y] = xy(p);
          return `${i === 0 ? "M" : "L"}${((x - minX) * escala + offX).toFixed(1)} ${((y - minY) * escala + offY).toFixed(1)}`;
        })
        .join(" "),
    );
}

/** Totais de um conjunto de caminhadas (ex.: semana). */
export function totaisCaminhadas(lista: Pick<Caminhada, "distanciaM" | "duracaoS">[]) {
  return {
    quantidade: lista.length,
    distanciaM: lista.reduce((s, c) => s + c.distanciaM, 0),
    duracaoS: lista.reduce((s, c) => s + c.duracaoS, 0),
  };
}
