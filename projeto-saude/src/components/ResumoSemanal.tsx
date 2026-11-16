"use client";

import { IconeFechar } from "./icons";

import Link from "next/link";
import { getResumoVisto, marcarResumoVisto } from "@/lib/storage";
import { inicioDaSemana, resumirSemana, somarDias } from "@/lib/habitos";
import { formatarLitros } from "@/lib/hidratacao";
import type { DiaConsumo } from "@/lib/tipos";

// Resumo da semana passada (seg–dom), mostrado no Início até a pessoa fechar.
// Recebe ao menos 21 dias em ordem cronológica, terminando hoje.

export default function ResumoSemanal({ dias }: { dias: DiaConsumo[] }) {
  const hoje = dias[dias.length - 1]?.data;
  if (!hoje) return null;
  const segundaAtual = inicioDaSemana(hoje);
  if (getResumoVisto() === segundaAtual) return null;

  const entre = (ini: string, fim: string) => dias.filter((d) => d.data >= ini && d.data <= fim);
  const passada = entre(somarDias(segundaAtual, -7), somarDias(segundaAtual, -1));
  const anterior = entre(somarDias(segundaAtual, -14), somarDias(segundaAtual, -8));
  if (passada.length < 7 || passada.every((d) => d.totalMl === 0)) return null;

  const r = resumirSemana(passada, anterior);
  const nomeDia = (data: string) =>
    new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(new Date(`${data}T12:00:00Z`));

  return (
    <section aria-labelledby="resumo-titulo" style={{ "--i": 3 } as React.CSSProperties} className="surgir relative mt-4 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => marcarResumoVisto(segundaAtual)}
        aria-label="Fechar resumo da semana"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5"
      >
        <IconeFechar width={16} height={16} />
      </button>
      <p className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Sua semana passada</p>
      <h2 id="resumo-titulo" className="mt-1 pr-8 text-lg font-bold leading-snug text-tinta">
        {r.diasNaMeta === 7
          ? "Meta batida todos os dias. Semana impecável."
          : r.diasNaMeta >= 4
            ? `Meta batida em ${r.diasNaMeta} de 7 dias. Bom ritmo.`
            : `Meta batida em ${r.diasNaMeta} de 7 dias. Essa semana dá para mais.`}
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-superficie px-2 py-3">
          <p className="text-base font-extrabold tabular-nums text-brand">{formatarLitros(r.mediaMl, 1)}</p>
          <p className="text-[11px] text-tinta-2">média por dia</p>
        </div>
        <div className="rounded-2xl bg-superficie px-2 py-3">
          <p className="text-base font-extrabold tabular-nums text-brand">
            {r.variacaoPct == null ? "—" : `${r.variacaoPct > 0 ? "+" : ""}${r.variacaoPct}%`}
          </p>
          <p className="text-[11px] text-tinta-2">vs. semana anterior</p>
        </div>
        <div className="rounded-2xl bg-superficie px-2 py-3">
          <p className="truncate text-base font-extrabold capitalize text-brand">
            {r.melhorDia ? nomeDia(r.melhorDia.data).replace("-feira", "") : "—"}
          </p>
          <p className="text-[11px] text-tinta-2">seu melhor dia</p>
        </div>
      </div>
      <Link href="/relatorios" className="mt-4 inline-block text-sm font-semibold text-brand">
        Ver relatórios
      </Link>
    </section>
  );
}
