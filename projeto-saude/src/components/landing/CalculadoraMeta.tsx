"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { calcularMeta, emCopos, formatarLitros } from "@/lib/hidratacao";
import { ATIVIDADES } from "@/lib/perfilOpcoes";
import type { NivelAtividade } from "@/lib/tipos";

// Calculadora da landing: mesma função pura do app (calcularMeta), sem salvar nada.
// A "proveta" graduada sobe até a meta — o elemento visual central da página.

const FAIXAS_IDADE = [
  { rotulo: "Até 17", idade: 16 },
  { rotulo: "18–55", idade: 30 },
  { rotulo: "56–65", idade: 60 },
  { rotulo: "66+", idade: 70 },
] as const;

const ESCALA_MAX_ML = 5000;
const MARCAS = [1000, 2000, 3000, 4000];

export default function CalculadoraMeta() {
  const [peso, setPeso] = useState(70);
  const [faixa, setFaixa] = useState(1);
  const [atividade, setAtividade] = useState<NivelAtividade>("leve");
  const idPeso = useId();

  const r = calcularMeta({
    pesoKg: peso,
    idade: FAIXAS_IDADE[faixa].idade,
    nivelAtividade: atividade,
    clima: "ameno",
  });
  const nivel = Math.min(1, r.metaMl / ESCALA_MAX_ML);

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-brand-deep p-6 text-white shadow-[var(--shadow-float)] sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(80% 60% at 100% 0%, rgba(52,211,153,0.22), transparent 60%)" }}
      />
      <div className="relative flex gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-verde-claro">Faça a conta agora</p>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <label htmlFor={idPeso} className="text-sm text-white/80">Seu peso</label>
              <span className="text-lg font-bold tabular-nums">{peso} kg</span>
            </div>
            <input
              id={idPeso}
              type="range"
              min={40}
              max={150}
              value={peso}
              onChange={(e) => setPeso(Number(e.target.value))}
              className="faixa-peso mt-2 w-full"
            />
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm text-white/80">Sua idade</legend>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {FAIXAS_IDADE.map((f, i) => (
                <Chip key={f.rotulo} ativo={faixa === i} onClick={() => setFaixa(i)}>{f.rotulo}</Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-sm text-white/80">Atividade física</legend>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {ATIVIDADES.map((a) => (
                <Chip key={a.valor} ativo={atividade === a.valor} onClick={() => setAtividade(a.valor)}>{a.nome}</Chip>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 border-t border-white/10 pt-5" aria-live="polite">
            <p className="text-sm text-verde-claro">Sua estimativa diária</p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight tabular-nums">{formatarLitros(r.metaMl)}</p>
            <p className="mt-1 text-sm text-white/70">≈ {emCopos(r.metaMl)} copos de 250 ml</p>
          </div>
        </div>

        <Proveta nivel={nivel} />
      </div>

      <Link
        href="/onboarding"
        className="relative mt-6 block rounded-2xl bg-menta py-3.5 text-center text-sm font-bold text-brand-deep transition hover:bg-menta-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Criar minha meta completa
      </Link>
      <p className="relative mt-3 text-center text-[11px] leading-relaxed text-white/55">
        Estimativa de apoio ao hábito, não recomendação médica. No app você ainda ajusta o clima e
        pode definir a meta por conta própria.
      </p>
    </div>
  );
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`rounded-xl px-2 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-menta ${
        ativo ? "bg-white text-brand-deep" : "bg-white/[0.08] text-white/75 hover:bg-white/[0.14]"
      }`}
    >
      {children}
    </button>
  );
}

/** Proveta graduada em litros; a água sobe até a meta. */
function Proveta({ nivel }: { nivel: number }) {
  return (
    <div aria-hidden className="relative hidden w-16 shrink-0 min-[400px]:block">
      <div className="absolute inset-x-2 bottom-0 top-1 overflow-hidden rounded-b-[1.25rem] rounded-t-md border-2 border-white/25 bg-white/[0.04]">
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{
            height: `${nivel * 100}%`,
            background: "linear-gradient(180deg, #6ee7b7 0%, #34d399 35%, #1f9e70 100%)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-white/50" />
        </div>
        {MARCAS.map((ml) => (
          <div key={ml} className="absolute left-0 flex items-center" style={{ bottom: `${(ml / ESCALA_MAX_ML) * 100}%` }}>
            <span className="h-px w-3 bg-white/60" />
          </div>
        ))}
      </div>
      {MARCAS.map((ml) => (
        <span
          key={ml}
          className="absolute -right-3 translate-y-1/2 text-[10px] font-semibold tabular-nums text-white/50"
          style={{ bottom: `${(ml / ESCALA_MAX_ML) * 100}%` }}
        >
          {ml / 1000}L
        </span>
      ))}
    </div>
  );
}
