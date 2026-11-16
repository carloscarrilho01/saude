"use client";

import Link from "next/link";
import { LogoSaude } from "../decor";
import { IconeMarcador, IconeRefeicao, IconeUtil } from "../icons";
import { getMural } from "@/lib/mural/repositorio";
import { tempoRelativo } from "@/lib/mural/regras";
import { nomeObjetivo } from "@/lib/refeicoes";
import type { PlanoMural } from "@/lib/mural/tipos";

export function Autor({ plano, tamanho = 32 }: { plano: PlanoMural; tamanho?: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {plano.oficial ? (
        <span className="flex shrink-0 items-center justify-center rounded-full bg-verde-claro/40" style={{ width: tamanho, height: tamanho }}>
          <LogoSaude size={tamanho * 0.7} />
        </span>
      ) : (
        <span
          aria-hidden
          className="flex shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold uppercase text-white"
          style={{ width: tamanho, height: tamanho }}
        >
          {plano.apelido.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0 leading-tight">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-tinta">
          {plano.apelido}
          {plano.oficial && <span className="rounded-full bg-brand px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">Oficial</span>}
          {plano.meu && <span className="rounded-full bg-menta/25 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-brand">Você</span>}
        </p>
        <p className="text-[11px] text-tinta-2">{tempoRelativo(plano.publicadoEm)}</p>
      </div>
    </div>
  );
}

export function BotaoUtil({ plano, compacto }: { plano: PlanoMural; compacto?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        void getMural().alternarUtil(plano.id).catch((err: Error) => window.alert(err.message));
      }}
      aria-pressed={plano.marqueiUtil}
      aria-label={plano.marqueiUtil ? "Desmarcar útil" : "Marcar como útil"}
      className={`toque flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        plano.marqueiUtil ? "bg-brand text-white" : "bg-superficie text-tinta-2"
      } ${compacto ? "" : "py-2"}`}
    >
      <IconeUtil width={15} height={15} className={plano.marqueiUtil ? "check-pop" : ""} aria-hidden />
      Útil{plano.uteis > 0 && <span className="tabular-nums"> · {plano.uteis}</span>}
    </button>
  );
}

export default function CartaoMural({ plano }: { plano: PlanoMural }) {
  return (
    <Link
      href={`/planos/comunidade/${plano.id}`}
      className="toque block rounded-[var(--radius-card)] bg-card p-4 shadow-[var(--shadow-card)]"
    >
      <Autor plano={plano} />
      <p className="mt-3 font-bold text-tinta">{plano.nome}</p>
      <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-tinta-2">{plano.descricao}</p>

      <div className="mt-3 flex items-center gap-1" aria-label={`${plano.refeicoes.length} refeições por dia`}>
        {plano.refeicoes.slice(0, 6).map((r, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-verde-claro/35 text-brand">
              <IconeRefeicao tipo={r.tipo} width={14} height={14} />
            </span>
            <span className="text-[10px] font-semibold tabular-nums text-tinta-2">{r.horario}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-black/5 pt-3">
        <BotaoUtil plano={plano} compacto />
        <span className="flex items-center gap-1 text-xs font-medium text-tinta-2">
          <IconeMarcador width={14} height={14} aria-hidden />
          <span className="tabular-nums">{plano.salvamentos}</span> {plano.salvamentos === 1 ? "salvou" : "salvaram"}
        </span>
        <span className="ml-auto rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
          {nomeObjetivo(plano.objetivo)} · {plano.duracaoDias}d
        </span>
      </div>
    </Link>
  );
}
