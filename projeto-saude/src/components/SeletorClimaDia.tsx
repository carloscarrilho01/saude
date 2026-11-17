"use client";

import { IconeSol } from "./icons";
import { definirClimaDoDia, getClimaDoDia, getMeta, getPerfil } from "@/lib/storage";
import { AJUSTE_CLIMA_ML } from "@/lib/hidratacao";
import type { Clima } from "@/lib/tipos";

// "Como está o dia?" — ajusta a meta só para hoje (PRD §3.2: clima informado
// pelo usuário). Sem palpite automático de temperatura: quem decide é a pessoa.

const OPCOES: { valor: Clima; nome: string }[] = [
  { valor: "ameno", nome: "Ameno" },
  { valor: "quente", nome: "Quente" },
  { valor: "muito_quente", nome: "Muito quente" },
];

export default function SeletorClimaDia() {
  const climaPerfil = getPerfil()?.clima ?? "ameno";
  const climaDia = getClimaDoDia();
  const ativo = climaDia ?? climaPerfil;
  const meta = getMeta();
  if (!meta) return null;

  function escolher(c: Clima) {
    // voltar ao clima do perfil = sem ajuste pontual
    definirClimaDoDia(c === climaPerfil ? null : c);
  }

  const delta = (c: Clima) => AJUSTE_CLIMA_ML[c] - meta.ajusteClimaMl;

  return (
    <section className="mt-6" aria-labelledby="clima-dia-titulo">
      <div className="mb-2 flex items-center gap-1.5">
        <IconeSol width={14} height={14} className="text-tinta-2" />
        <h2 id="clima-dia-titulo" className="text-xs font-semibold uppercase tracking-wide text-tinta-2">
          Como está o dia hoje?
        </h2>
      </div>
      <div className="flex gap-2">
        {OPCOES.map((o) => {
          const d = delta(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              aria-pressed={ativo === o.valor}
              onClick={() => escolher(o.valor)}
              className={`flex-1 rounded-2xl border px-1 py-2 text-sm font-medium transition ${
                ativo === o.valor ? "border-brand bg-brand/5 text-brand" : "border-black/5 bg-card text-tinta-2"
              }`}
            >
              {o.nome}
              {d !== 0 && (
                <span className="block text-[10px] font-normal opacity-80">
                  {d > 0 ? "+" : "−"}
                  {Math.abs(d)} ml
                </span>
              )}
            </button>
          );
        })}
      </div>
      {climaDia && (
        <p className="mt-2 text-[11px] text-tinta-2">Ajuste vale só para hoje. Amanhã a meta volta ao normal.</p>
      )}
    </section>
  );
}
