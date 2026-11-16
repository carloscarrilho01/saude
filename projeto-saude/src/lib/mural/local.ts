// Mural no modo local (sem servidor): mostra os modelos oficiais do Orvalho
// e o que VOCÊ publicou neste aparelho. Não inventa usuários nem números:
// contadores refletem só as suas interações.

import { MODELOS_REGIME } from "../modelosRegime";
import type { RepositorioMural } from "./repositorio";
import type { NovaPublicacao, PlanoMural } from "./tipos";
import { ordenarMural, validarPublicacao } from "./regras";

const CHAVE = "saude.mural";
// data fixa das publicações oficiais (lançamento dos modelos)
const PUBLICADO_OFICIAL = "2026-11-16T12:00:00.000Z";

interface EstadoLocal {
  minhas: Omit<PlanoMural, "meu" | "marqueiUtil" | "salvei" | "uteis" | "salvamentos">[];
  uteis: string[];
  salvos: string[];
  denunciados: string[];
}

const vazio = (): EstadoLocal => ({ minhas: [], uteis: [], salvos: [], denunciados: [] });
const ouvintes = new Set<() => void>();

function ler(): EstadoLocal {
  if (typeof window === "undefined") return vazio();
  try {
    return { ...vazio(), ...(JSON.parse(window.localStorage.getItem(CHAVE) ?? "null") ?? {}) };
  } catch {
    return vazio();
  }
}
function gravar(e: EstadoLocal) {
  window.localStorage.setItem(CHAVE, JSON.stringify(e));
  ouvintes.forEach((fn) => fn());
}

function oficiais(): EstadoLocal["minhas"] {
  return MODELOS_REGIME.map((m) => ({
    id: `oficial-${m.slug}`,
    apelido: "Equipe Orvalho",
    oficial: true,
    nome: m.nome,
    descricao: m.resumo,
    objetivo: m.objetivo,
    duracaoDias: m.duracaoDias,
    refeicoes: m.refeicoes,
    publicadoEm: PUBLICADO_OFICIAL,
  }));
}

function montar(e: EstadoLocal): PlanoMural[] {
  return [...oficiais(), ...e.minhas]
    .filter((p) => !e.denunciados.includes(p.id))
    .map((p) => ({
      ...p,
      meu: e.minhas.some((m) => m.id === p.id),
      marqueiUtil: e.uteis.includes(p.id),
      salvei: e.salvos.includes(p.id),
      uteis: e.uteis.includes(p.id) ? 1 : 0,
      salvamentos: e.salvos.includes(p.id) ? 1 : 0,
    }));
}

const alternar = (lista: string[], id: string) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);

export const muralLocal: RepositorioMural = {
  modo: "local",
  async listar(ordem) {
    return ordenarMural(montar(ler()), ordem);
  },
  async obter(id) {
    return montar(ler()).find((p) => p.id === id) ?? null;
  },
  async publicar(nova: NovaPublicacao) {
    const { dados, erros } = validarPublicacao(nova);
    if (Object.keys(erros).length) throw new Error(Object.values(erros)[0]);
    const e = ler();
    const item = {
      ...dados,
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `mural_${Date.now()}`,
      oficial: false,
      publicadoEm: new Date().toISOString(),
    };
    gravar({ ...e, minhas: [item, ...e.minhas] });
    return montar(ler()).find((p) => p.id === item.id)!;
  },
  async removerMinha(id) {
    const e = ler();
    gravar({ ...e, minhas: e.minhas.filter((m) => m.id !== id) });
  },
  async alternarUtil(id) {
    const e = ler();
    gravar({ ...e, uteis: alternar(e.uteis, id) });
  },
  async registrarSalvamento(id) {
    const e = ler();
    if (!e.salvos.includes(id)) gravar({ ...e, salvos: [...e.salvos, id] });
  },
  async denunciar(id) {
    // sem servidor não há moderação: só esconde do seu mural
    const e = ler();
    if (!e.denunciados.includes(id)) gravar({ ...e, denunciados: [...e.denunciados, id] });
  },
  assinar(fn) {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  },
};
