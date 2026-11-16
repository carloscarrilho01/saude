"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconeSetaEsq } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import {
  getPerfil,
  metaDoDia,
  consumoUltimosDias,
  getRegimeAtivo,
  getRefeicoesPlanejadas,
  getTodasConclusoes,
  getTodosItensDiario,
} from "@/lib/storage";
import { formatarLitros } from "@/lib/hidratacao";
import { aderenciaDoDia, aderenciaPeriodo } from "@/lib/aderencia";
import { bateuMeta } from "@/lib/habitos";

type Aba = "agua" | "alimentacao" | "geral";

export default function PaginaRelatorios() {
  const pronto = useStorePronto();
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("agua");

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const fuso = getPerfil()?.fuso;
  const metaMl = metaDoDia();

  // água — últimos 14 dias (para comparar semana atual vs anterior)
  const dias14 = consumoUltimosDias(14, fuso);
  const semanaAtual = dias14.slice(7);
  const semanaAnterior = dias14.slice(0, 7);
  const mediaAtual = media(semanaAtual.map((d) => d.totalMl));
  const mediaAnterior = media(semanaAnterior.map((d) => d.totalMl));
  const variacao = mediaAnterior > 0 ? Math.round(((mediaAtual - mediaAnterior) / mediaAnterior) * 100) : 0;
  const diasBatidos = semanaAtual.filter(bateuMeta).length;

  // alimentação
  const regime = getRegimeAtivo();
  const refeicoes = regime ? getRefeicoesPlanejadas(regime.id) : [];
  const conclusoes = getTodasConclusoes();
  const itens = getTodosItensDiario();
  const datas7 = semanaAtual.map((d) => d.data);
  const aderSemana = aderenciaPeriodo(refeicoes, datas7, conclusoes, itens);
  const aderPorDia = datas7.map((d) => aderenciaDoDia(refeicoes, d, conclusoes, itens).pct);

  return (
    <div className="relative px-5 pb-10 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-4 flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Voltar" className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5">
          <IconeSetaEsq width={20} height={20} />
        </button>
        <h1 className="text-xl font-extrabold text-tinta">Relatórios</h1>
      </header>

      <div className="mb-5 flex rounded-full bg-black/5 p-1">
        {(
          [
            ["agua", "Água"],
            ["alimentacao", "Alimentação"],
            ["geral", "Geral"],
          ] as [Aba, string][]
        ).map(([v, rotulo]) => (
          <button
            key={v}
            onClick={() => setAba(v)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              aba === v ? "bg-brand text-white" : "text-tinta-2"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === "agua" && (
        <>
          <div className="rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Média diária</p>
                <p className="text-3xl font-extrabold text-tinta">{formatarLitros(mediaAtual)}</p>
                <p className="text-xs text-tinta-2">Últimos 7 dias</p>
              </div>
              {mediaAnterior > 0 && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${variacao >= 0 ? "bg-brand/10 text-brand" : "bg-alerta/10 text-alerta"}`}>
                  {variacao >= 0 ? "+" : ""}
                  {variacao}% vs. semana anterior
                </span>
              )}
            </div>
            <Barras valores={semanaAtual.map((d) => d.totalMl)} datas={datas7} max={Math.max(metaMl, ...semanaAtual.map((d) => d.totalMl), 1)} limiar={metaMl} fuso={fuso} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Cartao destaque={`${diasBatidos} de 7`} rotulo="Meta atingida" />
            <Cartao destaque={formatarLitros(metaMl)} rotulo="Meta diária" />
          </div>
        </>
      )}

      {aba === "alimentacao" &&
        (regime && refeicoes.length > 0 ? (
          <>
            <div className="rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Aderência média</p>
              <p className="text-3xl font-extrabold text-tinta">{aderSemana.pct}%</p>
              <p className="text-xs text-tinta-2">Plano: {regime.nome} · últimos 7 dias</p>
              <Barras valores={aderPorDia} datas={datas7} max={100} limiar={100} fuso={fuso} unidade="%" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Cartao destaque={`${aderSemana.concluidas}`} rotulo="Refeições concluídas (7d)" />
              <Cartao destaque={`${aderSemana.total}`} rotulo="Refeições planejadas (7d)" />
            </div>
          </>
        ) : (
          <div className="rounded-[var(--radius-card)] bg-card p-8 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
            Ative um plano com refeições para ver a aderência aqui.
          </div>
        ))}

      {aba === "geral" && (
        <div className="space-y-3">
          <LinhaGeral rotulo="Hidratação — média diária" valor={formatarLitros(mediaAtual)} />
          <LinhaGeral rotulo="Dias batendo a meta (7d)" valor={`${diasBatidos} de 7`} />
          <LinhaGeral rotulo="Aderência média (7d)" valor={regime && refeicoes.length > 0 ? `${aderSemana.pct}%` : "—"} />
          <LinhaGeral rotulo="Plano ativo" valor={regime?.nome ?? "Nenhum"} />
        </div>
      )}
    </div>
  );
}

function Barras({
  valores,
  datas,
  max,
  limiar,
  fuso,
  unidade,
}: {
  valores: number[];
  datas: string[];
  max: number;
  limiar: number;
  fuso?: string;
  unidade?: string;
}) {
  return (
    <div className="mt-5 flex h-36 items-end gap-1.5">
      {valores.map((v, i) => {
        const altura = Math.round((v / max) * 100);
        const bateu = v >= limiar;
        return (
          <div key={datas[i] ?? i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-28 w-full items-end">
              <div
                className={`w-full rounded-t-md ${bateu ? "bg-brand" : "bg-verde-claro"}`}
                style={{ height: `${Math.max(4, altura)}%` }}
                title={unidade === "%" ? `${v}%` : `${v} ml`}
              />
            </div>
            <span className="text-[10px] text-tinta-2">{rotuloDia(datas[i], fuso)}</span>
          </div>
        );
      })}
    </div>
  );
}

function Cartao({ destaque, rotulo }: { destaque: string; rotulo: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-card p-4 text-center shadow-[var(--shadow-card)]">
      <p className="text-2xl font-extrabold text-brand">{destaque}</p>
      <p className="text-xs text-tinta-2">{rotulo}</p>
    </div>
  );
}

function LinhaGeral({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-card)]">
      <span className="text-sm text-tinta-2">{rotulo}</span>
      <span className="font-semibold text-tinta">{valor}</span>
    </div>
  );
}

function media(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

function rotuloDia(dataLocal: string | undefined, fuso?: string): string {
  if (!dataLocal) return "";
  const d = new Date(`${dataLocal}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: fuso, weekday: "short" }).format(d).slice(0, 3);
}
