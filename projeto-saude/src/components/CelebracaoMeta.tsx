"use client";

import { useEffect } from "react";
import { useStorePronto } from "@/lib/hooks";
import {
  consumoUltimosDias,
  dataLocalHoje,
  getCelebradoEm,
  getMeta,
  getPerfil,
  marcarCelebrado,
  metaDoDia,
  totalAguaDia,
} from "@/lib/storage";
import { calcularSequencia, proximoMarco } from "@/lib/habitos";
import { formatarLitros } from "@/lib/hidratacao";
import { IconeFogo } from "./icons";

// Celebração ao bater a meta do dia (PRD §12.6): água sobe na tela + vibração.
// Aparece uma vez por dia; o estado vem do storage (sem setState em effect).

export default function CelebracaoMeta() {
  const pronto = useStorePronto();
  const fuso = pronto ? getPerfil()?.fuso : undefined;
  const hoje = pronto ? dataLocalHoje(fuso) : "";
  const metaMl = pronto && getMeta() ? metaDoDia(hoje) : 0;
  const total = pronto ? totalAguaDia(hoje) : 0;
  const visivel = pronto && metaMl > 0 && total >= metaMl && getCelebradoEm() !== hoje;

  useEffect(() => {
    if (visivel && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 60, 40]);
      } catch {
        /* sem haptics: tudo bem */
      }
    }
  }, [visivel]);

  if (!visivel) return null;

  const seq = calcularSequencia(consumoUltimosDias(120, fuso));
  const prox = proximoMarco(seq.atual);
  const fechar = () => marcarCelebrado(hoje);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebracao-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-brand-deep/95 px-6 text-center text-white"
      onClick={fechar}
    >
      {/* água subindo */}
      <div aria-hidden className="agua-sobe absolute inset-x-0 bottom-0">
        <div className="onda absolute -top-5 left-0 h-10 w-[200%]" />
        <div className="h-full w-full bg-gradient-to-b from-menta/45 to-menta/10" />
      </div>
      {/* gotas */}
      {[12, 28, 46, 64, 82].map((x, i) => (
        <span
          key={x}
          aria-hidden
          className="gota-sobe absolute bottom-0 h-3 w-3 rounded-full bg-white/50"
          style={{ left: `${x}%`, animationDelay: `${0.3 + i * 0.18}s` }}
        />
      ))}

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <div className="pop mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-menta text-brand-deep shadow-[0_0_0_10px_rgba(52,211,153,0.2)]">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2 id="celebracao-titulo" className="mt-6 text-3xl font-extrabold tracking-tight">Meta do dia batida</h2>
        <p className="mt-2 text-lg text-white/80">
          {formatarLitros(total)} de {formatarLitros(metaMl)}
        </p>
        {seq.atual > 0 && (
          <p className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            <IconeFogo width={16} height={16} className="text-menta" aria-hidden /> {seq.atual} {seq.atual === 1 ? "dia" : "dias"} seguidos
            {prox && <span className="font-normal text-white/70"> · {prox - seq.atual === 1 ? "falta 1" : `faltam ${prox - seq.atual}`} para {prox}</span>}
          </p>
        )}
        <button
          type="button"
          autoFocus
          onClick={fechar}
          className="mt-8 block w-full min-w-64 rounded-2xl bg-white py-4 text-base font-bold text-brand-deep active:scale-[.99]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
