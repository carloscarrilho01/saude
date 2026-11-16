"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { IconeFogo, IconeGota, IconeSetaEsq, IconeTenis, IconeTrofeu } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import { consumoUltimosDias, conquistasAtividade, estatisticasAgua, getPerfil } from "@/lib/storage";
import { bateuMeta, calcularConquistas, calcularSequencia, proximoMarco } from "@/lib/habitos";

const JANELA_DIAS = 400;

export default function PaginaConquistas() {
  const pronto = useStorePronto();
  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const dias = consumoUltimosDias(JANELA_DIAS, getPerfil()?.fuso);
  const seq = calcularSequencia(dias);
  const { totalRegistros, totalMl } = estatisticasAgua();
  const conquistas = calcularConquistas({
    totalRegistros,
    diasNaMeta: dias.filter(bateuMeta).length,
    melhorSequencia: seq.melhor,
    totalMlHistorico: totalMl,
  });
  const prox = proximoMarco(seq.atual);
  const ultimos14 = dias.slice(-14);

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-5 flex items-center">
        <Link href="/inicio" aria-label="Voltar ao início" className="-ml-1 rounded-full p-1.5 text-tinta">
          <IconeSetaEsq width={22} height={22} />
        </Link>
        <h1 className="flex-1 pr-8 text-center text-xl font-extrabold text-tinta">Consistência</h1>
      </header>

      {/* sequência */}
      <section className="surgir rounded-[var(--radius-card)] bg-brand-deep p-6 text-white shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 text-verde-claro">
          <IconeFogo width={18} height={18} />
          <span className="text-xs font-semibold uppercase tracking-wide">Sequência atual</span>
        </div>
        <p className="mt-2 text-5xl font-extrabold tabular-nums">
          {seq.atual} <span className="text-2xl font-bold text-white/70">{seq.atual === 1 ? "dia" : "dias"}</span>
        </p>
        <p className="mt-1 text-sm text-white/70">
          {seq.atual === 0
            ? "Bata a meta hoje para começar uma sequência."
            : !seq.hojeConta
              ? "Bata a meta hoje para manter a sequência."
              : prox
                ? prox - seq.atual === 1
                  ? `Falta 1 dia para ${prox} seguidos.`
                  : `Faltam ${prox - seq.atual} dias para ${prox} seguidos.`
                : "Você passou de 100 dias seguidos."}
        </p>

        <div className="mt-5 flex gap-1" aria-label="Últimos 14 dias">
          {ultimos14.map((d, i) => (
            <span
              key={d.data}
              title={d.data}
              className={`h-7 flex-1 rounded-md ${
                bateuMeta(d) ? "bg-menta" : i === ultimos14.length - 1 ? "border border-dashed border-white/40" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-white/50">
          <span>14 dias atrás</span>
          <span>hoje</span>
        </div>
        <p className="mt-4 border-t border-white/10 pt-3 text-sm text-white/80">
          Recorde: <strong className="text-white">{seq.melhor} {seq.melhor === 1 ? "dia" : "dias"}</strong>
        </p>
      </section>

      <GradeConquistas titulo="Hidratação" itens={conquistas} icone={IconeGota} />
      <GradeConquistas titulo="Caminhada e treinos" itens={conquistasAtividade()} icone={IconeTenis} />
    </div>
  );
}

function GradeConquistas({
  titulo,
  itens,
  icone: Icone,
}: {
  titulo: string;
  itens: { id: string; titulo: string; descricao: string; conquistada: boolean; progresso: number }[];
  icone: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  const feitas = itens.filter((c) => c.conquistada).length;
  return (
    <section className="mt-6" aria-label={titulo}>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-tinta-2">
          <Icone width={14} height={14} aria-hidden /> {titulo}
        </h2>
        <span className="text-xs font-semibold text-tinta-2">
          {feitas} de {itens.length}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {itens.map((c, i) => (
          <li
            key={c.id}
            style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
            className={`surgir rounded-[var(--radius-card)] p-4 ${
              c.conquistada ? "bg-card shadow-[var(--shadow-card)]" : "border border-dashed border-black/10"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                c.conquistada ? "bg-menta/25 text-brand" : "bg-black/5 text-tinta-2/50"
              }`}
            >
              <IconeTrofeu width={20} height={20} />
            </span>
            <p className={`mt-3 text-sm font-bold ${c.conquistada ? "text-tinta" : "text-tinta-2"}`}>{c.titulo}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-tinta-2">{c.descricao}</p>
            {!c.conquistada && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5" aria-label={`${Math.round(c.progresso * 100)}% concluído`}>
                <div className="h-full origin-left rounded-full bg-verde-claro transition-[width] duration-700" style={{ width: `${c.progresso * 100}%` }} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
