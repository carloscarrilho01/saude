"use client";

// Rastreador de caminhada (GPS do navegador). Um único rastreador por aba.
// Limitação de PWA: a localização só chega com o app aberto na tela; por isso
// pedimos Wake Lock (tela acesa) enquanto grava. A sessão em andamento é salva
// a cada ponto e volta como "pausada" se a página recarregar.

import { aceitarPonto, distanciaTotal, simplificar, type Caminhada, type Ponto } from "./caminhada";
import { dataLocalHoje, getPerfil, gravarSessaoCaminhada, getSessaoCaminhada, salvarCaminhada } from "./storage";

export type StatusRastreio = "parado" | "gravando" | "pausado";
export type ErroGps = "negado" | "indisponivel" | "sem-suporte" | null;

export interface EstadoRastreio {
  status: StatusRastreio;
  inicioEm: string | null;
  acumuladoMs: number; // tempo em movimento até a última pausa
  retomadoEm: number | null; // epoch ms do último início/retomada
  trechos: Ponto[][];
  distanciaM: number;
  precisaoM: number | null;
  sinal: "buscando" | "bom" | "fraco" | null;
  erro: ErroGps;
  telaAcesa: boolean;
}

const INICIAL: EstadoRastreio = {
  status: "parado",
  inicioEm: null,
  acumuladoMs: 0,
  retomadoEm: null,
  trechos: [],
  distanciaM: 0,
  precisaoM: null,
  sinal: null,
  erro: null,
  telaAcesa: false,
};

type Sessao = Pick<EstadoRastreio, "inicioEm" | "acumuladoMs" | "trechos">;

let estado: EstadoRastreio = INICIAL;
let watchId: number | null = null;
let travaTela: WakeLockSentinel | null = null;
const ouvintes = new Set<() => void>();
let restaurado = false;

function mudar(parcial: Partial<EstadoRastreio>) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((fn) => fn());
}

function persistir() {
  if (estado.status === "parado") gravarSessaoCaminhada(null);
  else gravarSessaoCaminhada<Sessao>({ inicioEm: estado.inicioEm, acumuladoMs: tempoMs(), trechos: estado.trechos });
}

/** Recupera uma caminhada que estava em andamento (ex.: a página recarregou). */
function restaurar() {
  if (restaurado || typeof window === "undefined") return;
  restaurado = true;
  const s = getSessaoCaminhada<Sessao>();
  if (s?.inicioEm) {
    estado = { ...INICIAL, status: "pausado", inicioEm: s.inicioEm, acumuladoMs: s.acumuladoMs, trechos: s.trechos, distanciaM: distanciaTotal(s.trechos) };
  }
}

export function assinarRastreio(fn: () => void) {
  restaurar();
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}
export function lerRastreio(): EstadoRastreio {
  restaurar();
  return estado;
}
export const rastreioServidor = (): EstadoRastreio => INICIAL;

/** Tempo em movimento até agora, em ms. */
export function tempoMs(e: EstadoRastreio = estado, agora = Date.now()): number {
  return e.acumuladoMs + (e.status === "gravando" && e.retomadoEm ? agora - e.retomadoEm : 0);
}

async function manterTelaAcesa(ligar: boolean) {
  try {
    if (ligar && "wakeLock" in navigator && !travaTela) {
      travaTela = await navigator.wakeLock.request("screen");
      travaTela.addEventListener("release", () => {
        travaTela = null;
        mudar({ telaAcesa: false });
      });
      mudar({ telaAcesa: true });
    } else if (!ligar && travaTela) {
      await travaTela.release();
      travaTela = null;
    }
  } catch {
    mudar({ telaAcesa: false });
  }
}

// o Wake Lock cai quando a aba fica oculta; ao voltar, pede de novo
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && estado.status === "gravando") void manterTelaAcesa(true);
  });
}

function aoPosicao(pos: GeolocationPosition) {
  const novo: Ponto = [pos.coords.latitude, pos.coords.longitude, pos.timestamp || Date.now()];
  const precisao = pos.coords.accuracy;
  const sinal = precisao <= 20 ? "bom" : "fraco";
  if (estado.status !== "gravando") return;
  const trechos = estado.trechos.length ? estado.trechos : [[]];
  const atual = trechos[trechos.length - 1];
  if (!aceitarPonto(atual[atual.length - 1], novo, precisao)) {
    mudar({ precisaoM: precisao, sinal, erro: null });
    return;
  }
  const novosTrechos = [...trechos.slice(0, -1), [...atual, novo]];
  mudar({ trechos: novosTrechos, distanciaM: distanciaTotal(novosTrechos), precisaoM: precisao, sinal, erro: null });
  persistir();
}

function aoErro(err: GeolocationPositionError) {
  const erro: ErroGps = err.code === err.PERMISSION_DENIED ? "negado" : "indisponivel";
  mudar({ erro, sinal: erro === "indisponivel" ? "fraco" : null });
  if (erro === "negado") pausar();
}

function ligarGps() {
  if (!("geolocation" in navigator)) {
    mudar({ erro: "sem-suporte" });
    return false;
  }
  if (watchId == null) {
    watchId = navigator.geolocation.watchPosition(aoPosicao, aoErro, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  }
  return true;
}

function desligarGps() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

export function iniciar() {
  mudar({ ...INICIAL, status: "gravando", inicioEm: new Date().toISOString(), retomadoEm: Date.now(), trechos: [[]], sinal: "buscando" });
  if (!ligarGps()) {
    mudar({ ...INICIAL, erro: "sem-suporte" });
    return;
  }
  void manterTelaAcesa(true);
  persistir();
}

export function pausar() {
  if (estado.status !== "gravando") return;
  mudar({ status: "pausado", acumuladoMs: tempoMs(), retomadoEm: null, sinal: null });
  desligarGps();
  void manterTelaAcesa(false);
  persistir();
}

export function retomar() {
  if (estado.status !== "pausado") return;
  // novo trecho: o deslocamento durante a pausa não conta
  mudar({ status: "gravando", retomadoEm: Date.now(), trechos: [...estado.trechos.filter((t) => t.length), []], sinal: "buscando", erro: null });
  if (!ligarGps()) return;
  void manterTelaAcesa(true);
  persistir();
}

/** Encerra e salva. Devolve a caminhada salva (ou null se não houve percurso). */
export function finalizar(): Caminhada | null {
  const duracaoS = Math.round(tempoMs() / 1000);
  const trechos = estado.trechos.filter((t) => t.length > 1).map((t) => simplificar(t));
  const distanciaM = Math.round(distanciaTotal(estado.trechos));
  const inicioEm = estado.inicioEm;
  desligarGps();
  void manterTelaAcesa(false);
  mudar({ ...INICIAL });
  persistir();
  if (!inicioEm || distanciaM < 10) return null;
  const caminhada: Caminhada = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `cam_${Date.now()}`,
    inicioEm,
    fimEm: new Date().toISOString(),
    dataLocal: dataLocalHoje(getPerfil()?.fuso),
    distanciaM,
    duracaoS,
    trechos,
  };
  salvarCaminhada(caminhada);
  return caminhada;
}

export function descartar() {
  desligarGps();
  void manterTelaAcesa(false);
  mudar({ ...INICIAL });
  persistir();
}
