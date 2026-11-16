"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { IconeBandeira, IconeLixeira, IconeMarcador, IconeRefeicao, IconeSetaEsq } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { Autor, BotaoUtil } from "@/components/mural/CartaoMural";
import DenunciarPlano from "@/components/mural/DenunciarPlano";
import { usePlanoMural } from "@/components/mural/useMural";
import { getMural } from "@/lib/mural/repositorio";
import { criarRegimeDeModelo, getRegimeAtivo } from "@/lib/storage";
import { nomeObjetivo, nomeRefeicao } from "@/lib/refeicoes";

export default function PlanoDaComunidade() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { dados: plano, carregando } = usePlanoMural(String(id));
  const [denunciando, setDenunciando] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const voltar = (
    <Link href="/planos?aba=comunidade" aria-label="Voltar para a comunidade" className="-ml-1 rounded-full p-1.5 text-tinta">
      <IconeSetaEsq width={22} height={22} />
    </Link>
  );

  if (carregando) return <div className="p-6"><div className="h-72 animate-pulse rounded-[var(--radius-card)] bg-black/5" /></div>;
  if (!plano) {
    return (
      <div className="px-5 pt-6 text-center">
        <div className="text-left">{voltar}</div>
        <p className="mt-10 font-semibold text-tinta">Este plano não está mais no mural</p>
        <p className="mt-1 text-sm text-tinta-2">Ele pode ter sido removido por quem publicou ou estar em revisão.</p>
      </div>
    );
  }

  async function salvar(ativar: boolean) {
    if (!plano) return;
    const ativo = getRegimeAtivo();
    if (ativar && ativo && !window.confirm(`Começar este plano vai pausar "${ativo.nome}". Continuar?`)) return;
    setOcupado(true);
    const regime = criarRegimeDeModelo(plano, ativar);
    try {
      await getMural().registrarSalvamento(plano.id);
    } catch {
      /* o plano já está salvo localmente; a contagem pública é secundária */
    }
    router.push(`/planos/${regime.id}`);
  }

  async function removerPublicacao() {
    if (!plano || !window.confirm("Tirar este plano do mural? Ele continua nos seus planos.")) return;
    setOcupado(true);
    await getMural().removerMinha(plano.id);
    router.replace("/planos?aba=comunidade");
  }

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-4 flex items-center">
        {voltar}
        <span className="flex-1 pr-8 text-center text-sm font-semibold text-tinta-2">Comunidade</span>
      </header>

      <div className="surgir">
        <Autor plano={plano} tamanho={40} />
      </div>
      <h1 className="surgir mt-4 text-[26px] font-extrabold leading-tight tracking-tight text-tinta" style={{ "--i": 1 } as React.CSSProperties}>
        {plano.nome}
      </h1>
      <p className="surgir mt-2 text-sm leading-relaxed text-tinta-2" style={{ "--i": 2 } as React.CSSProperties}>{plano.descricao}</p>
      <div className="surgir mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold" style={{ "--i": 3 } as React.CSSProperties}>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">{nomeObjetivo(plano.objetivo)}</span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">{plano.duracaoDias} dias</span>
        <span className="flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">
          <IconeMarcador width={12} height={12} aria-hidden /> {plano.salvamentos} {plano.salvamentos === 1 ? "salvou" : "salvaram"}
        </span>
      </div>

      <section className="surgir mt-5 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]" style={{ "--i": 4 } as React.CSSProperties}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-tinta-2">O dia neste plano</h2>
        <ol className="space-y-3">
          {plano.refeicoes.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-verde-claro/40 text-brand">
                <IconeRefeicao tipo={r.tipo} width={18} height={18} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-bold text-tinta">
                  {nomeRefeicao(r.tipo)} <span className="font-semibold tabular-nums text-tinta-2">· {r.horario}</span>
                </p>
                <p className="break-words text-sm text-tinta-2">{r.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 space-y-2">
        <button type="button" disabled={ocupado} onClick={() => salvar(true)} className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white disabled:opacity-50">
          Começar este plano
        </button>
        <button type="button" disabled={ocupado} onClick={() => salvar(false)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand/20 py-3.5 text-sm font-semibold text-brand disabled:opacity-50">
          <IconeMarcador width={16} height={16} aria-hidden /> {plano.salvei ? "Salvar outra cópia" : "Salvar nos meus planos"}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <BotaoUtil plano={plano} />
        {plano.meu ? (
          <button type="button" onClick={removerPublicacao} disabled={ocupado} className="flex items-center gap-1.5 text-xs font-semibold text-alerta">
            <IconeLixeira width={15} height={15} aria-hidden /> Tirar do mural
          </button>
        ) : !plano.oficial ? (
          <button type="button" onClick={() => setDenunciando(true)} className="flex items-center gap-1.5 text-xs font-semibold text-tinta-2">
            <IconeBandeira width={15} height={15} aria-hidden /> Denunciar
          </button>
        ) : null}
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-tinta-2">
        {plano.oficial
          ? "Modelo de organização da rotina, não uma prescrição."
          : "Plano criado por uma pessoa da comunidade, não por um profissional de saúde."}{" "}
        Para metas de peso ou restrições, procure um nutricionista.
      </p>

      {denunciando && (
        <DenunciarPlano planoId={plano.id} aoFechar={() => setDenunciando(false)} aoTerminar={() => router.replace("/planos?aba=comunidade")} />
      )}
    </div>
  );
}
