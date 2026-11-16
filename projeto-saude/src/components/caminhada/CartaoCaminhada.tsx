"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { IconeHalter, IconeTenis } from "../icons";
import { assinarRastreio, lerRastreio, rastreioServidor } from "@/lib/rastreador";
import { getMetaAtividade, progressoAtividadeSemana } from "@/lib/storage";
import { formatarKm } from "@/lib/caminhada";

/** Card do Início: meta semanal de atividade, ou atalho para a caminhada em andamento. */
export default function CartaoCaminhada() {
  const r = useSyncExternalStore(assinarRastreio, lerRastreio, rastreioServidor);
  const ativa = r.status !== "parado";
  const p = progressoAtividadeSemana();
  const unidade = getMetaAtividade().tipo === "minutos" ? "min" : "treinos";

  if (ativa) {
    return (
      <Link href="/caminhada" style={{ "--i": 3 } as React.CSSProperties} className="surgir toque mt-4 flex items-center gap-4 rounded-[var(--radius-card)] bg-brand p-4 text-white shadow-[var(--shadow-card)]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <IconeTenis width={24} height={24} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-menta-soft">
            {r.status === "gravando" ? "Caminhada em andamento" : "Caminhada pausada"}
          </p>
          <p className="text-xl font-extrabold tabular-nums">{formatarKm(r.distanciaM)} km</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/treinos" style={{ "--i": 3 } as React.CSSProperties} className="surgir toque mt-4 block rounded-[var(--radius-card)] bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-verde-claro/35 text-brand">
          <IconeHalter width={24} height={24} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Atividade da semana</p>
          <p className="text-xl font-extrabold tabular-nums text-tinta">
            {p.atual} <span className="text-sm font-semibold text-tinta-2">de {p.meta} {unidade}</span>
          </p>
        </div>
        <span className="text-sm font-bold tabular-nums text-brand">{p.pct}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
        <div className="h-full rounded-full bg-brand transition-[width] duration-700" style={{ width: `${p.pct}%` }} />
      </div>
    </Link>
  );
}
