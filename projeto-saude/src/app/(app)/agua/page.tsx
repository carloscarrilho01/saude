"use client";

import { useState } from "react";
import AnelProgresso from "@/components/AnelProgresso";
import { IconeGota, IconeLixeira, IconeMais } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import {
  getMeta,
  getPerfil,
  totalAguaDia,
  getRegistrosAgua,
  adicionarRegistroAgua,
  removerRegistroAgua,
  consumoUltimosDias,
} from "@/lib/storage";
import { formatarLitros, percentualMeta } from "@/lib/hidratacao";

type Periodo = "hoje" | "semana" | "mes";
const ATALHOS = [200, 300, 500];

export default function PaginaAgua() {
  const pronto = useStorePronto();
  const [periodo, setPeriodo] = useState<Periodo>("hoje");

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const perfil = getPerfil();
  const metaMl = getMeta()?.metaMl ?? 2000;

  return (
    <div className="relative px-5 pb-6 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <h1 className="relative mb-4 text-center text-xl font-extrabold text-tinta">Hidratação</h1>

      {/* chips de período */}
      <div className="mx-auto mb-6 flex max-w-xs rounded-full bg-black/5 p-1">
        {(["hoje", "semana", "mes"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition ${
              periodo === p ? "bg-brand text-white" : "text-tinta-2"
            }`}
          >
            {p === "mes" ? "Mês" : p}
          </button>
        ))}
      </div>

      {periodo === "hoje" ? (
        <VistaHoje metaMl={metaMl} fuso={perfil?.fuso} />
      ) : (
        <VistaGrafico dias={periodo === "semana" ? 7 : 30} metaMl={metaMl} fuso={perfil?.fuso} />
      )}
    </div>
  );
}

function VistaHoje({ metaMl, fuso }: { metaMl: number; fuso?: string }) {
  const consumido = totalAguaDia();
  const pct = percentualMeta(consumido, metaMl);
  const registros = getRegistrosAgua();

  return (
    <>
      <div className="flex flex-col items-center">
        <AnelProgresso
          percentual={pct}
          tamanho={200}
          espessura={16}
          corTrilho="rgba(19,38,30,0.08)"
        >
          <span className="text-4xl font-extrabold text-brand">{pct}%</span>
          <span className="text-xs text-tinta-2">da meta</span>
        </AnelProgresso>
        <p className="mt-3 text-lg font-bold text-tinta">
          {formatarLitros(consumido)}{" "}
          <span className="font-medium text-tinta-2">de {formatarLitros(metaMl)}</span>
        </p>
      </div>

      <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">
        Registrar consumo
      </p>
      <div className="grid grid-cols-4 gap-2">
        {ATALHOS.map((ml) => (
          <button
            key={ml}
            onClick={() => adicionarRegistroAgua(ml, "botao_rapido")}
            className="flex flex-col items-center gap-1 rounded-2xl bg-card py-3 shadow-[var(--shadow-card)] active:scale-95"
          >
            <IconeGota width={22} height={22} className="text-brand" />
            <span className="text-xs font-semibold text-tinta">{ml} ml</span>
          </button>
        ))}
        <button
          onClick={() => adicionarRegistroAgua(100, "manual")}
          className="flex flex-col items-center gap-1 rounded-2xl bg-card py-3 shadow-[var(--shadow-card)] active:scale-95"
        >
          <IconeMais width={22} height={22} className="text-brand" />
          <span className="text-xs font-semibold text-tinta">100 ml</span>
        </button>
      </div>

      <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">
        Registros de hoje
      </p>
      {registros.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
          Você ainda não registrou água hoje. Toque em um atalho acima para começar.
        </div>
      ) : (
        <ul className="space-y-2">
          {registros.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]"
            >
              <span className="flex items-center gap-3">
                <IconeGota width={20} height={20} className="text-brand" />
                <span className="font-semibold text-tinta">{r.quantidadeMl} ml</span>
                <span className="text-xs text-tinta-2">{horaDe(r.registradoEm, fuso)}</span>
              </span>
              <button
                onClick={() => removerRegistroAgua(r.id)}
                aria-label="Remover"
                className="text-tinta-2 hover:text-alerta"
              >
                <IconeLixeira width={18} height={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function VistaGrafico({ dias, metaMl, fuso }: { dias: number; metaMl: number; fuso?: string }) {
  const dados = consumoUltimosDias(dias, fuso);
  const maxMl = Math.max(metaMl, ...dados.map((d) => d.totalMl), 1);
  const media = Math.round(dados.reduce((s, d) => s + d.totalMl, 0) / dados.length);
  const diasBatidos = dados.filter((d) => d.totalMl >= metaMl).length;

  return (
    <>
      <div className="rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Média diária</p>
        <p className="text-3xl font-extrabold text-tinta">{formatarLitros(media)}</p>

        <div className="mt-5 flex h-40 items-end gap-1.5">
          {dados.map((d) => {
            const altura = Math.round((d.totalMl / maxMl) * 100);
            const bateu = d.totalMl >= metaMl;
            return (
              <div key={d.data} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end">
                  <div
                    className={`w-full rounded-t-md ${bateu ? "bg-brand" : "bg-verde-claro"}`}
                    style={{ height: `${Math.max(4, altura)}%` }}
                  />
                </div>
                {dias <= 7 && (
                  <span className="text-[10px] text-tinta-2">{rotuloDia(d.data, fuso)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-card)] bg-card p-4 text-center shadow-[var(--shadow-card)]">
          <p className="text-2xl font-extrabold text-brand">{diasBatidos}</p>
          <p className="text-xs text-tinta-2">dias batendo a meta</p>
        </div>
        <div className="rounded-[var(--radius-card)] bg-card p-4 text-center shadow-[var(--shadow-card)]">
          <p className="text-2xl font-extrabold text-brand">{formatarLitros(metaMl)}</p>
          <p className="text-xs text-tinta-2">meta diária</p>
        </div>
      </div>
    </>
  );
}

function horaDe(iso: string, fuso?: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: fuso,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function rotuloDia(dataLocal: string, fuso?: string): string {
  // dataLocal "YYYY-MM-DD" → inicial do dia da semana
  const d = new Date(`${dataLocal}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: fuso, weekday: "short" })
    .format(d)
    .slice(0, 3);
}
