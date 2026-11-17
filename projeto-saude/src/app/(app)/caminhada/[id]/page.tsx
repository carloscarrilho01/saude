"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AvisoConquistas from "@/components/treinos/AvisoConquistas";
import { TopoFolha } from "@/components/decor";
import DesenhoPercurso from "@/components/caminhada/DesenhoPercurso";
import { IconeCompartilhar, IconeLixeira, IconeSetaEsq, IconeTenis } from "@/components/icons";
import { useStorePronto } from "@/lib/hooks";
import { apagarPercursoCaminhada, conquistasAtividade, getCaminhada, removerCaminhada } from "@/lib/storage";
import { formatarDuracao, formatarKm, formatarRitmo, ritmoSPorKm } from "@/lib/caminhada";
import { compartilharCaminhada } from "@/lib/imagemCaminhada";

export default function DetalheCaminhada() {
  const pronto = useStorePronto();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [comPercurso, setComPercurso] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;
  const c = getCaminhada(String(id));
  if (!c) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-tinta-2">Caminhada não encontrada.</p>
        <Link href="/caminhada" className="mt-4 inline-block text-sm font-semibold text-brand">Voltar</Link>
      </div>
    );
  }
  const temPercurso = c.trechos.some((t) => t.length > 1);
  const data = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(c.inicioEm));

  async function compartilhar() {
    if (!c) return;
    setGerando(true);
    setAviso(null);
    try {
      const r = await compartilharCaminhada(c, comPercurso && temPercurso);
      if (r === "baixado") setAviso("Imagem salva. Agora é só postar onde quiser.");
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Não foi possível gerar a imagem.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-4 flex items-center">
        <Link href="/caminhada" aria-label="Voltar" className="-ml-1 rounded-full p-1.5 text-tinta">
          <IconeSetaEsq width={22} height={22} />
        </Link>
        <span className="flex-1 pr-8 text-center text-sm font-semibold capitalize text-tinta-2">{data}</span>
      </header>

      <Suspense fallback={null}>
        <ConquistasDaCaminhada />
      </Suspense>

      <section className="surgir overflow-hidden rounded-[var(--radius-card)] bg-brand-deep p-5 text-white shadow-[var(--shadow-float)]">
        <div className="flex h-56 items-center justify-center">
          {temPercurso ? (
            <DesenhoPercurso trechos={c.trechos} largura={320} altura={220} espessura={4} className="h-full w-full" />
          ) : (
            <IconeTenis width={56} height={56} className="text-menta/60" />
          )}
        </div>
        <p className="mt-2 text-6xl font-extrabold tabular-nums">
          {formatarKm(c.distanciaM)} <span className="text-2xl font-bold text-verde-claro">km</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-verde-claro">Tempo</p>
            <p className="text-2xl font-extrabold tabular-nums">{formatarDuracao(c.duracaoS)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-verde-claro">Ritmo</p>
            <p className="text-2xl font-extrabold tabular-nums">{formatarRitmo(ritmoSPorKm(c.distanciaM, c.duracaoS))} /km</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-bold text-tinta">Compartilhar</h2>
        <p className="mt-1 text-xs text-tinta-2">Gera uma imagem com os números para postar ou mandar. Sem mapa e sem endereço.</p>
        {temPercurso && (
          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl bg-superficie px-3 py-2.5 text-sm text-tinta">
            Incluir o desenho do percurso
            <input type="checkbox" checked={comPercurso} onChange={(e) => setComPercurso(e.target.checked)} className="h-5 w-5 accent-[color:var(--color-brand)]" />
          </label>
        )}
        <button type="button" onClick={compartilhar} disabled={gerando} className="toque mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-50">
          <IconeCompartilhar width={18} height={18} aria-hidden /> {gerando ? "Gerando imagem…" : "Compartilhar caminhada"}
        </button>
        {aviso && <p role="status" className="mt-2 text-center text-xs text-tinta-2">{aviso}</p>}
      </section>

      <div className="mt-5 space-y-2">
        {temPercurso && (
          <button
            type="button"
            onClick={() => window.confirm("Apagar o percurso e manter só a distância e o tempo?") && apagarPercursoCaminhada(c.id)}
            className="w-full rounded-2xl bg-card py-3.5 text-sm font-semibold text-tinta-2 shadow-[var(--shadow-card)]"
          >
            Apagar só o percurso
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Excluir esta caminhada?")) {
              removerCaminhada(c.id);
              router.replace("/caminhada");
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-alerta/30 py-3.5 text-sm font-semibold text-alerta"
        >
          <IconeLixeira width={16} height={16} aria-hidden /> Excluir caminhada
        </button>
      </div>
    </div>
  );
}

/** Mostra as conquistas desbloqueadas por esta caminhada (?novas=ids). */
function ConquistasDaCaminhada() {
  const ids = (useSearchParams().get("novas") ?? "").split(",").filter(Boolean);
  const [aberto, setAberto] = useState(true);
  const novas = aberto ? conquistasAtividade().filter((c) => ids.includes(c.id) && c.conquistada) : [];
  return <AvisoConquistas novas={novas} aoFechar={() => setAberto(false)} />;
}
