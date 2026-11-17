"use client";

import { useState } from "react";
import AnelProgresso from "../AnelProgresso";
import { IconeLapis } from "../icons";
import { getMetaAtividade, progressoAtividadeSemana, salvarMetaAtividade } from "@/lib/storage";
import { LIMITES_META, META_ATIVIDADE_PADRAO, type TipoMeta } from "@/lib/treinos";

export default function MetaSemanal() {
  const [editando, setEditando] = useState(false);
  const p = progressoAtividadeSemana();
  const meta = getMetaAtividade();
  const unidade = meta.tipo === "minutos" ? "min" : meta.valor === 1 ? "treino" : "treinos";
  const falta = Math.max(0, p.meta - p.atual);

  return (
    <section className="surgir relative overflow-hidden rounded-[var(--radius-card)] bg-brand-deep p-5 text-white shadow-[var(--shadow-float)]">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(90% 70% at 100% 0%, rgba(52,211,153,0.22), transparent 65%)" }} />
      <div className="relative flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-verde-claro">Meta da semana</p>
        <button type="button" onClick={() => setEditando(true)} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
          <IconeLapis width={13} height={13} aria-hidden /> Ajustar
        </button>
      </div>
      <div className="relative mt-3 flex items-center gap-5">
        <AnelProgresso percentual={p.pct} tamanho={112} espessura={11}>
          <span className="text-xl font-extrabold">{p.pct}%</span>
        </AnelProgresso>
        <div className="min-w-0">
          <p className="text-4xl font-extrabold leading-none tabular-nums">
            {p.atual}
            <span className="text-lg font-bold text-white/70"> / {p.meta} {unidade}</span>
          </p>
          <p className="mt-2 text-sm text-white/75">
            {p.bateu ? "Meta batida. Semana ativa!" : `Faltam ${falta} ${unidade} até domingo.`}
          </p>
          <p className="mt-1 text-xs text-white/55">
            {p.minutos} min · {p.treinos} {p.treinos === 1 ? "atividade" : "atividades"}
          </p>
        </div>
      </div>
      {editando && <EditorMeta aoFechar={() => setEditando(false)} />}
    </section>
  );
}

function EditorMeta({ aoFechar }: { aoFechar: () => void }) {
  const atual = getMetaAtividade();
  const [tipo, setTipo] = useState<TipoMeta>(atual.tipo);
  const [valor, setValor] = useState(String(atual.valor));
  const n = parseInt(valor, 10);
  const lim = LIMITES_META[tipo];
  const valido = Number.isInteger(n) && n >= lim.min && n <= lim.max;

  return (
    <div className="fundo-aparece fixed inset-0 z-40 flex items-end justify-center bg-black/40 text-tinta sm:items-center sm:p-6" onClick={aoFechar}>
      <div role="dialog" aria-modal="true" aria-labelledby="meta-ativ-titulo"
        className="folha-sobe w-full max-w-[440px] rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }} onClick={(e) => e.stopPropagation()}>
        <h2 id="meta-ativ-titulo" className="text-lg font-bold">Meta semanal de atividade</h2>
        <p className="mt-1 text-sm text-tinta-2">
          A Organização Mundial da Saúde recomenda para adultos de 150 a 300 minutos de atividade moderada por semana.
          Comece pelo que cabe na sua rotina.
        </p>
        <div className="mt-4 flex rounded-xl bg-superficie p-1 text-sm font-semibold" role="radiogroup" aria-label="Medir por">
          {([["minutos", "Minutos"], ["treinos", "Nº de treinos"]] as const).map(([v, r]) => (
            <button key={v} type="button" role="radio" aria-checked={tipo === v}
              onClick={() => { setTipo(v); setValor(String(v === "minutos" ? META_ATIVIDADE_PADRAO.valor : 3)); }}
              className={`flex-1 rounded-lg py-2 ${tipo === v ? "bg-brand text-white" : "text-tinta-2"}`}>{r}</button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(tipo === "minutos" ? [75, 150, 225, 300] : [2, 3, 4, 5]).map((v) => (
            <button key={v} type="button" onClick={() => setValor(String(v))}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${String(v) === valor ? "border-brand bg-brand/5 text-brand" : "border-black/10 text-tinta-2"}`}>
              {v} {tipo === "minutos" ? "min" : "treinos"}
            </button>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-black/10 bg-superficie px-3 focus-within:border-brand">
          <span className="sr-only">Valor da meta</span>
          <input value={valor} onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="w-full bg-transparent py-2.5 text-sm outline-none" />
          <span className="text-sm text-tinta-2">{tipo === "minutos" ? "min/semana" : "por semana"}</span>
        </label>
        {!valido && <p className="mt-1 text-xs text-alerta">Use entre {lim.min} e {lim.max}.</p>}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={aoFechar} className="flex-1 rounded-2xl bg-superficie py-3.5 text-sm font-semibold">Cancelar</button>
          <button type="button" disabled={!valido} onClick={() => { salvarMetaAtividade({ tipo, valor: n }); aoFechar(); }}
            className="flex-[2] rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40">Salvar meta</button>
        </div>
      </div>
    </div>
  );
}
