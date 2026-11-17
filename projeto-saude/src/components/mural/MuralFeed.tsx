"use client";

import { useState } from "react";
import { IconePessoas } from "../icons";
import CartaoMural from "./CartaoMural";
import { useFeedMural } from "./useMural";
import { getMural } from "@/lib/mural/repositorio";
import type { OrdemMural } from "@/lib/mural/tipos";
import type { ObjetivoRegime } from "@/lib/tipos";

const FILTROS: { valor: ObjetivoRegime | "todos"; nome: string }[] = [
  { valor: "todos", nome: "Todos" },
  { valor: "perder", nome: "Perder peso" },
  { valor: "manter", nome: "Manter" },
  { valor: "ganhar", nome: "Ganhar massa" },
];

/** Aba "Comunidade" de Planos: mural de planos publicados (fase 1). */
export default function MuralFeed() {
  const [ordem, setOrdem] = useState<OrdemMural>("recentes");
  const [filtro, setFiltro] = useState<ObjetivoRegime | "todos">("todos");
  const { dados, carregando, erro } = useFeedMural(ordem);
  const planos = dados.filter((p) => filtro === "todos" || p.objetivo === filtro);
  const local = getMural().modo === "local";

  return (
    <div>
      {local && (
        <div className="mb-4 flex gap-3 rounded-2xl bg-verde-claro/25 px-4 py-3">
          <IconePessoas width={20} height={20} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <p className="text-xs leading-relaxed text-brand">
            A comunidade está começando. Por enquanto, o mural mostra os planos da equipe Orvalho e os que você publicar
            neste aparelho. Quando abrir para todos, os planos de outras pessoas aparecem aqui.
          </p>
        </div>
      )}

      <div className="scroll-limpo -mx-5 mb-3 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Filtrar por objetivo">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            aria-pressed={filtro === f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filtro === f.valor ? "border-brand bg-brand text-white" : "border-black/10 bg-card text-tinta-2"
            }`}
          >
            {f.nome}
          </button>
        ))}
      </div>
      <div className="mb-4 flex items-center gap-1 text-xs" role="group" aria-label="Ordenar">
        <span className="mr-1 text-tinta-2">Ordenar:</span>
        {(
          [
            ["recentes", "Recentes"],
            ["mais_salvos", "Mais salvos"],
          ] as const
        ).map(([v, r]) => (
          <button
            key={v}
            type="button"
            aria-pressed={ordem === v}
            onClick={() => setOrdem(v)}
            className={`rounded-full px-2.5 py-1 font-semibold ${ordem === v ? "bg-black/5 text-tinta" : "text-tinta-2"}`}
          >
            {r}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-[var(--radius-card)] bg-black/5" />
          ))}
        </div>
      ) : erro ? (
        <div className="rounded-[var(--radius-card)] bg-card p-6 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
          {erro} Verifique sua conexão e tente de novo.
        </div>
      ) : planos.length === 0 ? (
        <div className="rounded-[var(--radius-card)] bg-card p-6 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
          Nenhum plano com esse objetivo ainda. Que tal publicar o seu? Abra um plano seu e toque em “Publicar na comunidade”.
        </div>
      ) : (
        <ul className="space-y-3">
          {planos.map((p, i) => (
            <li key={`${ordem}-${filtro}-${p.id}`} className="surgir" style={{ "--i": Math.min(i, 6) } as React.CSSProperties}>
              <CartaoMural plano={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
