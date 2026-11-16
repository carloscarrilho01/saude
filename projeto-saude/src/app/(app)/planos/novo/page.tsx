"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconeSetaEsq, IconeMais, IconeLixeira } from "@/components/icons";
import {
  criarRegime,
  adicionarRefeicaoPlanejada,
  ativarRegime,
  dataLocalHoje,
  getPerfil,
} from "@/lib/storage";
import { OBJETIVOS, TIPOS_REFEICAO, nomeRefeicao } from "@/lib/refeicoes";
import type { ObjetivoRegime, TipoRefeicao } from "@/lib/tipos";

interface RefeicaoRascunho {
  tipo: TipoRefeicao;
  horario: string;
  descricao: string;
}

const SUGESTAO_HORARIO: Record<TipoRefeicao, string> = {
  cafe: "08:00",
  almoco: "12:00",
  lanche: "15:00",
  jantar: "19:00",
  outro: "21:00",
};

export default function NovoPlano() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState<ObjetivoRegime>("perder");
  const [duracao, setDuracao] = useState("30");
  const [ativarAoCriar, setAtivarAoCriar] = useState(true);
  const [refeicoes, setRefeicoes] = useState<RefeicaoRascunho[]>([
    { tipo: "cafe", horario: "08:00", descricao: "" },
    { tipo: "almoco", horario: "12:00", descricao: "" },
  ]);

  const duracaoNum = parseInt(duracao, 10);
  const valido = nome.trim() !== "" && !Number.isNaN(duracaoNum) && duracaoNum > 0;

  function adicionarLinha() {
    setRefeicoes((r) => [...r, { tipo: "lanche", horario: "15:00", descricao: "" }]);
  }
  function removerLinha(i: number) {
    setRefeicoes((r) => r.filter((_, idx) => idx !== i));
  }
  function atualizarLinha(i: number, dados: Partial<RefeicaoRascunho>) {
    setRefeicoes((r) => r.map((item, idx) => (idx === i ? { ...item, ...dados } : item)));
  }

  function salvar() {
    if (!valido) return;
    const regime = criarRegime({
      nome: nome.trim(),
      objetivo,
      dataInicio: dataLocalHoje(getPerfil()?.fuso),
      duracaoDias: duracaoNum,
    });
    refeicoes
      .filter((r) => r.descricao.trim() !== "")
      .forEach((r, ordem) =>
        adicionarRefeicaoPlanejada({
          regimeId: regime.id,
          tipo: r.tipo,
          horario: r.horario,
          descricao: r.descricao.trim(),
          ordem,
        }),
      );
    if (ativarAoCriar) ativarRegime(regime.id);
    router.replace(`/planos/${regime.id}`);
  }

  return (
    <div className="px-5 pb-10 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <header className="mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Voltar" className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5">
          <IconeSetaEsq width={20} height={20} />
        </button>
        <h1 className="text-xl font-extrabold text-tinta">Criar plano</h1>
      </header>

      <div className="space-y-3">
        <div>
          <Rotulo>Nome do plano</Rotulo>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Emagrecimento Nov/26"
            className="w-full rounded-2xl bg-card px-4 py-3 text-tinta shadow-[var(--shadow-card)] outline-none placeholder:text-tinta-2/60"
          />
        </div>

        <div>
          <Rotulo>Objetivo</Rotulo>
          <div className="grid grid-cols-2 gap-2">
            {OBJETIVOS.map((o) => (
              <button
                key={o.valor}
                onClick={() => setObjetivo(o.valor)}
                className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                  objetivo === o.valor ? "bg-brand text-white" : "bg-card text-tinta-2 shadow-[var(--shadow-card)]"
                }`}
              >
                {o.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="w-40">
          <Rotulo>Duração (dias)</Rotulo>
          <input
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-2xl bg-card px-4 py-3 text-tinta shadow-[var(--shadow-card)] outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-tinta">Refeições do plano</h2>
        <button onClick={adicionarLinha} className="flex items-center gap-1 text-sm font-semibold text-brand">
          <IconeMais width={16} height={16} /> Adicionar
        </button>
      </div>

      <div className="mt-2 space-y-2">
        {refeicoes.map((r, i) => (
          <div key={i} className="rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <select
                value={r.tipo}
                onChange={(e) => {
                  const tipo = e.target.value as TipoRefeicao;
                  atualizarLinha(i, { tipo, horario: SUGESTAO_HORARIO[tipo] });
                }}
                className="rounded-lg bg-superficie px-2 py-2 text-sm text-tinta outline-none"
              >
                {TIPOS_REFEICAO.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {nomeRefeicao(t.valor)}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={r.horario}
                onChange={(e) => atualizarLinha(i, { horario: e.target.value })}
                className="rounded-lg bg-superficie px-2 py-2 text-sm text-tinta outline-none"
              />
              <button onClick={() => removerLinha(i)} aria-label="Remover" className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-tinta-2 hover:text-alerta">
                <IconeLixeira width={16} height={16} />
              </button>
            </div>
            <input
              value={r.descricao}
              onChange={(e) => atualizarLinha(i, { descricao: e.target.value })}
              placeholder="O que comer (ex.: Omelete, frutas e chá)"
              className="mt-2 w-full rounded-lg bg-superficie px-3 py-2 text-sm text-tinta outline-none placeholder:text-tinta-2/60"
            />
          </div>
        ))}
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
        <input
          type="checkbox"
          checked={ativarAoCriar}
          onChange={(e) => setAtivarAoCriar(e.target.checked)}
          className="h-5 w-5 accent-[color:var(--color-brand)]"
        />
        <span className="text-sm text-tinta">Ativar este plano ao criar</span>
      </label>

      <button
        disabled={!valido}
        onClick={salvar}
        className="mt-6 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition active:scale-[.99] disabled:opacity-40"
      >
        Salvar plano
      </button>
    </div>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-tinta-2">{children}</p>;
}
