"use client";

import { useState } from "react";
import Link from "next/link";
import { IconeRefeicao } from "./icons";
import { MODELOS_REGIME } from "@/lib/modelosRegime";
import { nomeObjetivo } from "@/lib/refeicoes";
import type { ObjetivoRegime } from "@/lib/tipos";

const FILTROS: { valor: ObjetivoRegime | "todos"; nome: string }[] = [
  { valor: "todos", nome: "Todos" },
  { valor: "perder", nome: "Perder peso" },
  { valor: "manter", nome: "Manter" },
  { valor: "ganhar", nome: "Ganhar massa" },
];

/** Aba "Explorar" de Planos: modelos prontos para clonar (RF-5.7). */
export default function VitrineModelos() {
  const [filtro, setFiltro] = useState<ObjetivoRegime | "todos">("todos");
  const modelos = MODELOS_REGIME.filter((m) => filtro === "todos" || m.objetivo === filtro);

  return (
    <div>
      <p className="mb-3 text-sm text-tinta-2">
        Comece por uma rotina pronta e ajuste do seu jeito. São modelos de organização, não prescrição.
      </p>

      <div className="scroll-limpo -mx-5 mb-4 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Filtrar por objetivo">
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

      <ul className="space-y-3">
        {modelos.map((m, i) => (
          <li key={`${filtro}-${m.slug}`} className="surgir" style={{ "--i": i } as React.CSSProperties}>
            <Link
              href={`/planos/modelos/${m.slug}`}
              className="toque block rounded-[var(--radius-card)] bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-tinta">{m.nome}</p>
                <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
                  {nomeObjetivo(m.objetivo)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-snug text-tinta-2">{m.resumo}</p>

              {/* linha do dia: um ícone por refeição, com horário */}
              <div className="mt-3 flex items-center gap-1" aria-label={`${m.refeicoes.length} refeições por dia`}>
                {m.refeicoes.map((r, i) => (
                  <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-verde-claro/35 text-brand">
                      <IconeRefeicao tipo={r.tipo} width={16} height={16} />
                    </span>
                    <span className="text-[10px] font-semibold tabular-nums text-tinta-2">{r.horario}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 border-t border-black/5 pt-2.5 text-xs text-tinta-2">
                {m.duracaoDias} dias · {m.refeicoes.length} refeições por dia
                <span className="float-right font-semibold text-brand">Ver modelo ›</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
