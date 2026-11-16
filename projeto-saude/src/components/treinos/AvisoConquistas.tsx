"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { IconeFechar, IconeTrofeu } from "../icons";
import type { ConquistaAtividade } from "@/lib/treinos";

/** Aviso de conquista(s) nova(s): aparece em cima da tab bar e some sozinho. */
export default function AvisoConquistas({ novas, aoFechar }: { novas: ConquistaAtividade[]; aoFechar: () => void }) {
  const fechar = useRef(aoFechar);
  useEffect(() => {
    fechar.current = aoFechar;
  });
  useEffect(() => {
    if (!novas.length) return;
    if ("vibrate" in navigator) navigator.vibrate?.([20, 40, 30]);
    const t = setTimeout(() => fechar.current(), 7000);
    return () => clearTimeout(t);
  }, [novas]);
  if (!novas.length) return null;
  return (
    <div role="status" className="folha-sobe fixed inset-x-0 bottom-24 z-30 mx-auto w-[calc(100%-2.5rem)] max-w-[440px]">
      <div className="flex items-center gap-3 rounded-2xl bg-brand-deep p-3 pr-2 text-white shadow-[var(--shadow-float)]">
        <span className="check-pop flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-menta text-brand-deep">
          <IconeTrofeu width={22} height={22} aria-hidden />
        </span>
        <Link href="/conquistas" className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-menta">
            {novas.length === 1 ? "Nova conquista" : `${novas.length} novas conquistas`}
          </p>
          <p className="truncate text-sm font-bold">{novas.map((c) => c.titulo).join(" · ")}</p>
        </Link>
        <button type="button" onClick={aoFechar} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-full text-white/70">
          <IconeFechar width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
