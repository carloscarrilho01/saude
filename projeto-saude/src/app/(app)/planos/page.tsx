"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import VitrineModelos from "@/components/VitrineModelos";
import { IconeMais } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import {
  getRegimes,
  getRefeicoesPlanejadas,
  getTodasConclusoes,
  getTodosItensDiario,
  dataLocalHoje,
  getPerfil,
} from "@/lib/storage";
import { aderenciaDoDia } from "@/lib/aderencia";
import { nomeObjetivo } from "@/lib/refeicoes";
import type { Regime, StatusRegime } from "@/lib/tipos";

export default function PaginaPlanos() {
  return (
    <Suspense fallback={<div className="p-6 text-tinta-2">Carregando…</div>}>
      <ConteudoPlanos />
    </Suspense>
  );
}

function ConteudoPlanos() {
  const pronto = useStorePronto();
  const router = useRouter();
  // aba na URL: voltar do detalhe de um modelo retorna para "Explorar"
  const aba: "meus" | "explorar" = useSearchParams().get("aba") === "explorar" ? "explorar" : "meus";
  const setAba = (a: "meus" | "explorar") => router.replace(a === "explorar" ? "/planos?aba=explorar" : "/planos", { scroll: false });

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const regimes = getRegimes();

  return (
    <div className="relative px-5 pb-6 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <h1 className="relative mb-4 text-center text-xl font-extrabold text-tinta">Planos (Regimes)</h1>

      <div className="mx-auto mb-5 flex max-w-xs rounded-full bg-black/5 p-1">
        {(["meus", "explorar"] as const).map((a) => (
          <button
            key={a}
            aria-pressed={aba === a}
            onClick={() => setAba(a)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              aba === a ? "bg-brand text-white" : "text-tinta-2"
            }`}
          >
            {a === "meus" ? "Meus planos" : "Explorar"}
          </button>
        ))}
      </div>

      {aba === "explorar" ? (
        <VitrineModelos />
      ) : regimes.length === 0 ? (
        <div className="rounded-[var(--radius-card)] bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-tinta-2">
            Você ainda não tem planos. Crie um do zero ou comece por um modelo pronto.
          </p>
          <button
            type="button"
            onClick={() => setAba("explorar")}
            className="mt-4 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
          >
            Ver modelos prontos
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {regimes.map((r) => (
            <li key={r.id}>
              <CartaoRegime regime={r} fuso={getPerfil()?.fuso} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/planos/novo"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand/40 py-4 text-sm font-semibold text-brand"
      >
        <IconeMais width={18} height={18} /> {aba === "explorar" ? "Prefiro criar do zero" : "Criar novo plano"}
      </Link>
    </div>
  );
}

function CartaoRegime({ regime, fuso }: { regime: Regime; fuso?: string }) {
  const refeicoes = getRefeicoesPlanejadas(regime.id);
  const hoje = dataLocalHoje(fuso);
  const ader = aderenciaDoDia(refeicoes, hoje, getTodasConclusoes(), getTodosItensDiario());

  return (
    <Link
      href={`/planos/${regime.id}`}
      className="block rounded-[var(--radius-card)] bg-card p-4 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-tinta">{regime.nome}</p>
          <p className="text-xs text-tinta-2">
            {nomeObjetivo(regime.objetivo)} · {regime.duracaoDias} dias · {refeicoes.length} refeições
          </p>
        </div>
        <Selo status={regime.status} />
      </div>

      {regime.status === "ativo" && refeicoes.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-tinta-2">Aderência hoje</span>
            <span className="font-semibold text-brand">{ader.pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/5">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${ader.pct}%` }} />
          </div>
        </div>
      )}
    </Link>
  );
}

function Selo({ status }: { status: StatusRegime }) {
  const estilo: Record<StatusRegime, string> = {
    ativo: "bg-brand/10 text-brand",
    pausado: "bg-black/5 text-tinta-2",
    encerrado: "bg-black/5 text-tinta-2",
  };
  const rotulo: Record<StatusRegime, string> = {
    ativo: "Ativo",
    pausado: "Pausado",
    encerrado: "Encerrado",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${estilo[status]}`}>
      {rotulo[status]}
    </span>
  );
}
