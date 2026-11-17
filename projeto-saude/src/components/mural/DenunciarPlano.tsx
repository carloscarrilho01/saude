"use client";

import { useState } from "react";
import { IconeBandeira } from "../icons";
import { getMural } from "@/lib/mural/repositorio";
import { MOTIVOS_DENUNCIA, type MotivoDenuncia } from "@/lib/mural/tipos";

export default function DenunciarPlano({ planoId, aoTerminar, aoFechar }: { planoId: string; aoTerminar: () => void; aoFechar: () => void }) {
  const [motivo, setMotivo] = useState<MotivoDenuncia | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const local = getMural().modo === "local";

  async function enviar() {
    if (!motivo) return;
    setEnviando(true);
    try {
      await getMural().denunciar(planoId, motivo);
      aoTerminar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar.");
      setEnviando(false);
    }
  }

  return (
    <div className="fundo-aparece fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="denuncia-titulo"
        className="folha-sobe w-full max-w-[440px] rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-alerta/10 text-alerta">
          <IconeBandeira width={20} height={20} />
        </span>
        <h2 id="denuncia-titulo" className="mt-4 text-lg font-bold text-tinta">O que há de errado com este plano?</h2>
        <fieldset className="mt-3 space-y-2">
          <legend className="sr-only">Motivo</legend>
          {MOTIVOS_DENUNCIA.map((m) => (
            <label
              key={m.valor}
              className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${motivo === m.valor ? "border-alerta/50 bg-alerta/5" : "border-black/5"}`}
            >
              <input type="radio" name="motivo" value={m.valor} checked={motivo === m.valor} onChange={() => setMotivo(m.valor)} className="mt-1 accent-[color:var(--color-alerta)]" />
              <span>
                <span className="block text-sm font-semibold text-tinta">{m.nome}</span>
                <span className="block text-xs text-tinta-2">{m.desc}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="mt-3 text-[11px] text-tinta-2">
          {local
            ? "O plano sai do seu mural agora. Com a comunidade aberta, as denúncias vão para revisão."
            : "Sua denúncia é anônima para quem publicou. Com 3 denúncias, o plano sai do ar até ser revisado."}
        </p>
        {erro && <p className="mt-2 text-xs text-alerta">{erro}</p>}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={aoFechar} className="flex-1 rounded-2xl bg-superficie py-3.5 text-sm font-semibold text-tinta">
            Cancelar
          </button>
          <button type="button" onClick={enviar} disabled={!motivo || enviando} className="flex-[2] rounded-2xl bg-alerta py-3.5 text-sm font-semibold text-white disabled:opacity-40">
            {enviando ? "Enviando…" : "Denunciar plano"}
          </button>
        </div>
      </div>
    </div>
  );
}
