"use client";

import { useState } from "react";
import IconeTreino from "./IconeTreino";
import { adicionarTreino, conquistasAtividade, dataLocalHoje, getPerfil } from "@/lib/storage";
import { somarDias } from "@/lib/habitos";
import { INTENSIDADES, LIMITES_TREINO, TIPOS_TREINO, novasConquistas, type ConquistaAtividade, type Intensidade, type TipoTreino } from "@/lib/treinos";

/** Folha de registro manual de treino. Devolve conquistas novas, se houver. */
export default function RegistrarTreino({ aoFechar, aoSalvar }: { aoFechar: () => void; aoSalvar: (novas: ConquistaAtividade[]) => void }) {
  const [tipo, setTipo] = useState<TipoTreino>("musculacao");
  const [duracao, setDuracao] = useState("45");
  const [intensidade, setIntensidade] = useState<Intensidade>("moderada");
  const [quando, setQuando] = useState<"hoje" | "ontem">("hoje");
  const [obs, setObs] = useState("");
  const n = parseInt(duracao, 10);
  const valido = Number.isInteger(n) && n >= LIMITES_TREINO.duracaoMin && n <= LIMITES_TREINO.duracaoMax;

  function salvar() {
    if (!valido) return;
    const antes = conquistasAtividade();
    const hoje = dataLocalHoje(getPerfil()?.fuso);
    adicionarTreino({
      tipo,
      duracaoMin: n,
      intensidade,
      dataLocal: quando === "hoje" ? hoje : somarDias(hoje, -1),
      observacao: obs.trim().slice(0, 140) || undefined,
    });
    aoSalvar(novasConquistas(antes, conquistasAtividade()));
  }

  return (
    <div className="fundo-aparece fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={aoFechar}>
      <div role="dialog" aria-modal="true" aria-labelledby="treino-titulo"
        className="folha-sobe max-h-[92dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }} onClick={(e) => e.stopPropagation()}>
        <h2 id="treino-titulo" className="text-lg font-bold text-tinta">Registrar treino</h2>

        <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">O que você fez</p>
        <div className="grid grid-cols-3 gap-2">
          {TIPOS_TREINO.filter((t) => t.valor !== "casa").map((t) => (
            <button key={t.valor} type="button" aria-pressed={tipo === t.valor} onClick={() => setTipo(t.valor)}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-[11px] font-semibold transition ${tipo === t.valor ? "border-brand bg-brand/5 text-brand" : "border-black/5 text-tinta-2"}`}>
              <IconeTreino tipo={t.valor} width={20} height={20} />
              <span className="text-center leading-tight">{t.nome}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">Duração</p>
        <div className="flex flex-wrap items-center gap-2">
          {[15, 30, 45, 60, 90].map((m) => (
            <button key={m} type="button" onClick={() => setDuracao(String(m))}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${String(m) === duracao ? "border-brand bg-brand/5 text-brand" : "border-black/10 text-tinta-2"}`}>{m} min</button>
          ))}
          <label className="flex w-24 items-center rounded-full border border-black/10 px-3 focus-within:border-brand">
            <span className="sr-only">Duração em minutos</span>
            <input value={duracao} onChange={(e) => setDuracao(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="w-full bg-transparent py-1.5 text-sm outline-none" />
            <span className="text-xs text-tinta-2">min</span>
          </label>
        </div>
        {!valido && <p className="mt-1 text-xs text-alerta">Informe de 1 a 600 minutos.</p>}

        <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">Intensidade</p>
        <div className="grid grid-cols-3 gap-2">
          {INTENSIDADES.map((i) => (
            <button key={i.valor} type="button" aria-pressed={intensidade === i.valor} onClick={() => setIntensidade(i.valor)}
              className={`rounded-2xl border p-2 text-left transition ${intensidade === i.valor ? "border-brand bg-brand/5" : "border-black/5"}`}>
              <span className="block text-sm font-semibold text-tinta">{i.nome}</span>
              <span className="block text-[10px] leading-tight text-tinta-2">{i.desc}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex rounded-xl bg-superficie p-1 text-sm font-semibold" role="radiogroup" aria-label="Quando">
          {(["hoje", "ontem"] as const).map((q) => (
            <button key={q} type="button" role="radio" aria-checked={quando === q} onClick={() => setQuando(q)}
              className={`flex-1 rounded-lg py-2 capitalize ${quando === q ? "bg-card text-brand shadow-sm" : "text-tinta-2"}`}>{q}</button>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Observação</span>
          <input value={obs} onChange={(e) => setObs(e.target.value)} maxLength={140} placeholder="Observação (opcional): ex. treino de pernas"
            className="w-full rounded-xl border border-black/10 bg-superficie px-3 py-2.5 text-sm text-tinta outline-none focus:border-brand" />
        </label>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={aoFechar} className="flex-1 rounded-2xl bg-superficie py-3.5 text-sm font-semibold text-tinta">Cancelar</button>
          <button type="button" onClick={salvar} disabled={!valido} className="flex-[2] rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40">Salvar treino</button>
        </div>
      </div>
    </div>
  );
}
