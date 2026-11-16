"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { IconePlay, IconeTenis } from "../icons";
import { assinarRastreio, lerRastreio, rastreioServidor } from "@/lib/rastreador";
import { dataLocalHoje, getCaminhadas, getPerfil } from "@/lib/storage";
import { formatarKm, totaisCaminhadas } from "@/lib/caminhada";
import { inicioDaSemana } from "@/lib/habitos";

/** Card do Início: km da semana, ou atalho para a caminhada em andamento. */
export default function CartaoCaminhada() {
  const r = useSyncExternalStore(assinarRastreio, lerRastreio, rastreioServidor);
  const ativa = r.status !== "parado";
  const segunda = inicioDaSemana(dataLocalHoje(getPerfil()?.fuso));
  const semana = totaisCaminhadas(getCaminhadas().filter((c) => c.dataLocal >= segunda));

  return (
    <Link
      href="/caminhada"
      style={{ "--i": 3 } as React.CSSProperties}
      className={`surgir toque mt-4 flex items-center gap-4 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-card)] ${ativa ? "bg-brand text-white" : "bg-card"}`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ativa ? "bg-white/15" : "bg-verde-claro/35 text-brand"}`}>
        <IconeTenis width={24} height={24} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold uppercase tracking-wide ${ativa ? "text-menta-soft" : "text-tinta-2"}`}>
          {ativa ? (r.status === "gravando" ? "Caminhada em andamento" : "Caminhada pausada") : "Caminhada"}
        </p>
        <p className={`text-xl font-extrabold tabular-nums ${ativa ? "" : "text-tinta"}`}>
          {ativa ? `${formatarKm(r.distanciaM)} km` : `${formatarKm(semana.distanciaM)} km na semana`}
        </p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${ativa ? "bg-menta text-brand-deep" : "bg-brand text-white"}`} aria-hidden>
        <IconePlay width={18} height={18} />
      </span>
    </Link>
  );
}
