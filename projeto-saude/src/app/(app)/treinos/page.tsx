"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { TopoFolha } from "@/components/decor";
import { IconeLixeira, IconeMais, IconePlay, IconeSetaDir, IconeTenis, IconeTrofeu, IconeCronometro } from "@/components/icons";
import IconeTreino from "@/components/treinos/IconeTreino";
import MetaSemanal from "@/components/treinos/MetaSemanal";
import RegistrarTreino from "@/components/treinos/RegistrarTreino";
import AvisoConquistas from "@/components/treinos/AvisoConquistas";
import { useStorePronto } from "@/lib/hooks";
import { getAtividades, getObjetivoTreino, getRegimeAtivo, progressoAtividadeSemana, removerTreino, salvarObjetivoTreino } from "@/lib/storage";
import { assinarRastreio, lerRastreio, rastreioServidor } from "@/lib/rastreador";
import { OBJETIVOS_TREINO, recomendarRotinas, type ObjetivoTreino } from "@/lib/rotinasCasa";
import { nomeTipoTreino, type ConquistaAtividade } from "@/lib/treinos";
import { formatarKm } from "@/lib/caminhada";

function objetivoPadrao(): ObjetivoTreino {
  const salvo = getObjetivoTreino();
  if (salvo) return salvo;
  const o = getRegimeAtivo()?.objetivo;
  return o === "perder" ? "perder" : o === "manter" || o === "ganhar" ? "manter" : "comecar";
}

export default function PaginaTreinos() {
  const pronto = useStorePronto();
  const rastreio = useSyncExternalStore(assinarRastreio, lerRastreio, rastreioServidor);
  const [registrando, setRegistrando] = useState(false);
  const [novas, setNovas] = useState<ConquistaAtividade[]>([]);
  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const objetivo = objetivoPadrao();
  const rotinas = recomendarRotinas(objetivo);
  const { segunda } = progressoAtividadeSemana();
  const daSemana = getAtividades().filter((a) => a.dataLocal >= segunda);
  const caminhando = rastreio.status !== "parado";

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-5 flex items-center justify-between">
        <h1 className="text-[26px] font-extrabold leading-tight text-tinta">Treinos</h1>
        <Link href="/conquistas" aria-label="Conquistas" className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-claro/40 text-brand">
          <IconeTrofeu width={22} height={22} />
        </Link>
      </header>

      <MetaSemanal />

      <div className="surgir mt-3 grid grid-cols-2 gap-3" style={{ "--i": 1 } as React.CSSProperties}>
        <Link href="/caminhada" className={`toque flex flex-col gap-2 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-card)] ${caminhando ? "bg-brand text-white" : "bg-card"}`}>
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${caminhando ? "bg-white/15" : "bg-verde-claro/35 text-brand"}`}>
            <IconeTenis width={22} height={22} aria-hidden />
          </span>
          <span className={`text-sm font-bold ${caminhando ? "" : "text-tinta"}`}>{caminhando ? `${formatarKm(rastreio.distanciaM)} km agora` : "Caminhada GPS"}</span>
          <span className={`text-xs ${caminhando ? "text-white/75" : "text-tinta-2"}`}>{caminhando ? "Toque para voltar" : "Grave seu percurso"}</span>
        </Link>
        <button type="button" onClick={() => setRegistrando(true)} className="toque flex flex-col gap-2 rounded-[var(--radius-card)] bg-card p-4 text-left shadow-[var(--shadow-card)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-verde-claro/35 text-brand">
            <IconeMais width={22} height={22} aria-hidden />
          </span>
          <span className="text-sm font-bold text-tinta">Registrar treino</span>
          <span className="text-xs text-tinta-2">Academia, corrida, bike…</span>
        </button>
      </div>

      {/* treinos em casa */}
      <section className="surgir mt-6" style={{ "--i": 2 } as React.CSSProperties} aria-labelledby="casa-titulo">
        <h2 id="casa-titulo" className="text-lg font-bold text-tinta">Treinos em casa</h2>
        <p className="text-sm text-tinta-2">Sem equipamento. Escolha seu foco e a gente sugere por onde começar.</p>
        <div className="scroll-limpo -mx-5 mt-3 flex gap-2 overflow-x-auto px-5" role="radiogroup" aria-label="Seu foco">
          {OBJETIVOS_TREINO.map((o) => (
            <button key={o.valor} type="button" role="radio" aria-checked={objetivo === o.valor} onClick={() => salvarObjetivoTreino(o.valor)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${objetivo === o.valor ? "border-brand bg-brand text-white" : "border-black/10 bg-card text-tinta-2"}`}>
              {o.nome}
            </button>
          ))}
        </div>

        <Link href={`/treinos/casa/${rotinas[0].slug}`} className="toque relative mt-3 block overflow-hidden rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
          <span className="rounded-full bg-menta/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">Recomendado pra você</span>
          <p className="mt-2 text-xl font-extrabold text-tinta">{rotinas[0].nome}</p>
          <p className="mt-1 text-sm text-tinta-2">{rotinas[0].resumo}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-tinta-2">
              <IconeCronometro width={15} height={15} aria-hidden /> {rotinas[0].minutos} min · {rotinas[0].nivel}
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white">
              <IconePlay width={18} height={18} aria-hidden />
            </span>
          </div>
        </Link>
        <ul className="mt-2 space-y-2">
          {rotinas.slice(1).map((r) => (
            <li key={r.slug}>
              <Link href={`/treinos/casa/${r.slug}`} className="toque flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-tinta">{r.nome}</p>
                  <p className="text-xs text-tinta-2">{r.minutos} min · {r.nivel}</p>
                </div>
                <IconeSetaDir width={16} height={16} className="text-tinta-2" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* semana */}
      <section className="surgir mt-6" style={{ "--i": 3 } as React.CSSProperties} aria-labelledby="semana-titulo">
        <h2 id="semana-titulo" className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">Esta semana</h2>
        {daSemana.length === 0 ? (
          <div className="rounded-[var(--radius-card)] bg-card p-6 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
            Nenhuma atividade ainda. Uma caminhada de 20 minutos já conta.
          </div>
        ) : (
          <ul className="space-y-2">
            {daSemana.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verde-claro/35 text-brand">
                  <IconeTreino tipo={a.tipo} width={20} height={20} />
                </span>
                <Link href={a.origem === "gps" ? `/caminhada/${a.id}` : "#"} className="min-w-0 flex-1" aria-disabled={a.origem !== "gps"} onClick={(e) => a.origem !== "gps" && e.preventDefault()}>
                  <p className="text-sm font-semibold text-tinta">
                    {nomeTipoTreino(a.tipo)}
                    {a.origem === "gps" && <span className="ml-1.5 rounded bg-brand/10 px-1 py-px text-[9px] font-bold text-brand">GPS</span>}
                  </p>
                  <p className="text-xs text-tinta-2">
                    {new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${a.dataLocal}T12:00:00Z`))} · {a.minutos} min
                    {a.distanciaM != null && ` · ${formatarKm(a.distanciaM)} km`}
                  </p>
                </Link>
                {a.origem === "manual" && (
                  <button type="button" onClick={() => window.confirm("Apagar este treino?") && removerTreino(a.id)} aria-label="Apagar treino" className="text-tinta-2 hover:text-alerta">
                    <IconeLixeira width={17} height={17} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-tinta-2">
        Sugestões gerais de atividade, não prescrição. Se tiver alguma condição de saúde, dor ou ficar muito tempo parado, converse
        com um médico ou profissional de educação física antes de começar.
      </p>

      {registrando && (
        <RegistrarTreino
          aoFechar={() => setRegistrando(false)}
          aoSalvar={(n) => {
            setRegistrando(false);
            setNovas(n);
          }}
        />
      )}
      <AvisoConquistas novas={novas} aoFechar={() => setNovas([])} />
    </div>
  );
}
