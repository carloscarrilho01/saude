"use client";

import { useState } from "react";
import type { SVGProps } from "react";
import { IconeCaneca, IconeCopo, IconeGarrafa, IconeLixeira } from "./icons";
import { adicionarRecipiente, getRecipientes, removerRecipiente } from "@/lib/storage";
import type { TipoRecipiente } from "@/lib/tipos";

const TIPOS: { valor: TipoRecipiente; nome: string }[] = [
  { valor: "copo", nome: "Copo" },
  { valor: "garrafa", nome: "Garrafa" },
  { valor: "caneca", nome: "Caneca" },
];
const LIMITE = { min: 50, max: 3000 };
const MAX_RECIPIENTES = 7;

export function IconeRecipiente({ tipo, ...p }: { tipo: TipoRecipiente } & SVGProps<SVGSVGElement>) {
  if (tipo === "garrafa") return <IconeGarrafa {...p} />;
  if (tipo === "caneca") return <IconeCaneca {...p} />;
  return <IconeCopo {...p} />;
}

/** Folha inferior para cadastrar copos/garrafas próprios (RF-3.1). */
export default function GerenciarRecipientes({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const [nome, setNome] = useState("");
  const [ml, setMl] = useState("");
  const [tipo, setTipo] = useState<TipoRecipiente>("garrafa");
  if (!aberto) return null;

  const recipientes = getRecipientes();
  const mlNum = parseInt(ml, 10);
  const mlValido = Number.isFinite(mlNum) && mlNum >= LIMITE.min && mlNum <= LIMITE.max;
  const cheio = recipientes.length >= MAX_RECIPIENTES;
  const podeSalvar = nome.trim().length > 0 && mlValido && !cheio;

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!podeSalvar) return;
    adicionarRecipiente({ nome: nome.trim().slice(0, 20), ml: mlNum, tipo });
    setNome("");
    setMl("");
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipientes-titulo"
        className="max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 id="recipientes-titulo" className="text-lg font-bold text-tinta">Meus recipientes</h2>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-tinta-2">
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-tinta-2">Cadastre o copo do trabalho ou a sua garrafa e registre com um toque.</p>

        {recipientes.length === 0 ? (
          <p className="rounded-2xl bg-superficie p-4 text-center text-sm text-tinta-2">Nenhum recipiente. Adicione o primeiro abaixo.</p>
        ) : (
          <ul className="divide-y divide-black/5 rounded-2xl bg-superficie">
            {recipientes.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <IconeRecipiente tipo={r.tipo} width={20} height={20} className="text-brand" />
                <span className="flex-1 text-sm font-semibold text-tinta">{r.nome}</span>
                <span className="text-sm text-tinta-2">{r.ml} ml</span>
                <button type="button" onClick={() => removerRecipiente(r.id)} aria-label={`Remover ${r.nome}`} className="text-tinta-2 hover:text-alerta">
                  <IconeLixeira width={18} height={18} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={salvar} className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Adicionar</p>
          <div className="flex gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.valor}
                type="button"
                aria-pressed={tipo === t.valor}
                onClick={() => setTipo(t.valor)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 text-xs font-semibold transition ${
                  tipo === t.valor ? "border-brand bg-brand/5 text-brand" : "border-black/5 text-tinta-2"
                }`}
              >
                <IconeRecipiente tipo={t.valor} width={20} height={20} />
                {t.nome}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="sr-only">Nome</span>
              <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={20} placeholder="Ex.: Garrafa azul"
                className="w-full rounded-xl border border-black/10 bg-superficie px-3 py-2.5 text-sm text-tinta outline-none focus:border-brand" />
            </label>
            <label className="flex w-28 items-center rounded-xl border border-black/10 bg-superficie px-3 focus-within:border-brand">
              <span className="sr-only">Volume em ml</span>
              <input value={ml} onChange={(e) => setMl(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="750"
                className="w-full bg-transparent py-2.5 text-right text-sm text-tinta outline-none" />
              <span className="ml-1 text-sm text-tinta-2">ml</span>
            </label>
          </div>
          {ml && !mlValido && <p className="text-xs text-alerta">Use um volume entre {LIMITE.min} e {LIMITE.max} ml.</p>}
          {cheio && <p className="text-xs text-tinta-2">Limite de {MAX_RECIPIENTES} recipientes. Remova um para adicionar outro.</p>}
          <button type="submit" disabled={!podeSalvar} className="w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40">
            Adicionar recipiente
          </button>
        </form>
      </div>
    </div>
  );
}
