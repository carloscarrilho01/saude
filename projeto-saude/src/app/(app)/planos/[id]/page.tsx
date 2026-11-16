"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconeSetaEsq, IconeCheck, IconeLapis, IconeRefeicao } from "@/components/icons";
import EditorPlano from "@/components/EditorPlano";
import FotosProgresso from "@/components/FotosProgresso";
import BotaoCompartilharPlano from "@/components/BotaoCompartilharPlano";
import { useStorePronto } from "@/lib/hooks";
import {
  getRegime,
  getRefeicoesPlanejadas,
  getTodasConclusoes,
  getTodosItensDiario,
  alternarConclusao,
  ativarRegime,
  atualizarRegime,
  encerrarRegime,
  removerRegime,
  dataLocalHoje,
  getPerfil,
} from "@/lib/storage";
import { aderenciaDoDia, refeicaoConcluida } from "@/lib/aderencia";
import { nomeObjetivo, nomeRefeicao } from "@/lib/refeicoes";

export default function DetalhePlano() {
  const pronto = useStorePronto();
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [editando, setEditando] = useState(false);

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const regime = getRegime(id);
  if (!regime) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-tinta-2">Plano não encontrado.</p>
        <button onClick={() => router.replace("/planos")} className="mt-4 text-sm font-semibold text-brand">
          Voltar aos planos
        </button>
      </div>
    );
  }

  const fuso = getPerfil()?.fuso;
  const hoje = dataLocalHoje(fuso);
  const refeicoes = getRefeicoesPlanejadas(id);
  const conclusoes = getTodasConclusoes();
  const itens = getTodosItensDiario();
  const ader = aderenciaDoDia(refeicoes, hoje, conclusoes, itens);

  function removerComConfirmacao() {
    if (confirm("Remover este plano e suas refeições? Esta ação não pode ser desfeita.")) {
      removerRegime(id);
      router.replace("/planos");
    }
  }

  return (
    <div className="px-5 pb-10 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <header className="mb-4 flex items-center gap-3">
        <button onClick={() => router.replace("/planos")} aria-label="Voltar" className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5">
          <IconeSetaEsq width={20} height={20} />
        </button>
        <h1 className="truncate text-xl font-extrabold text-tinta">{regime.nome}</h1>
      </header>

      <div className="rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm text-tinta-2">
          {nomeObjetivo(regime.objetivo)} · {regime.duracaoDias} dias
        </p>
        {regime.status === "ativo" && refeicoes.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-tinta-2">Aderência hoje</span>
              <span className="font-bold text-brand">{ader.pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${ader.pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-tinta-2">
              {ader.concluidas} de {ader.total} refeições concluídas
            </p>
          </div>
        )}
      </div>

      {editando ? (
        <EditorPlano regime={regime} refeicoes={refeicoes} aoTerminar={() => setEditando(false)} />
      ) : (
      <>
      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-tinta">Refeições do dia</h2>
        {regime.status !== "encerrado" && (
          <button type="button" onClick={() => setEditando(true)} className="flex items-center gap-1 text-sm font-semibold text-brand">
            <IconeLapis width={15} height={15} /> Editar plano
          </button>
        )}
      </div>
      {refeicoes.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
          Este plano ainda não tem refeições.
          {regime.status !== "encerrado" && (
            <button type="button" onClick={() => setEditando(true)} className="mt-3 block w-full font-semibold text-brand">
              Adicionar refeições
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {refeicoes.map((r, i) => {
            const concluida = refeicaoConcluida(r.id, hoje, conclusoes, itens);
            return (
              <li key={r.id} style={{ "--i": i } as React.CSSProperties} className="surgir flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-verde-claro/30 text-brand">
                  <IconeRefeicao tipo={r.tipo} width={18} height={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-tinta">
                    {nomeRefeicao(r.tipo)} <span className="font-normal text-tinta-2">· {r.horario}</span>
                  </p>
                  <p className="truncate text-xs text-tinta-2">{r.descricao}</p>
                </div>
                <button
                  onClick={() => alternarConclusao(r.id, hoje)}
                  aria-label={concluida ? "Desmarcar" : "Marcar como concluída"}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    concluida ? "check-pop border-brand bg-brand text-white" : "border-black/15 text-transparent"
                  }`}
                >
                  <IconeCheck width={16} height={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <FotosProgresso regime={regime} />

      {refeicoes.length > 0 && <BotaoCompartilharPlano regime={regime} refeicoes={refeicoes} />}

      {/* ações */}
      <div className="mt-6 space-y-2">
        {regime.status !== "ativo" && regime.status !== "encerrado" && (
          <button onClick={() => ativarRegime(id)} className="w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white">
            Ativar este plano
          </button>
        )}
        {regime.status === "ativo" && (
          <button onClick={() => atualizarRegime(id, { status: "pausado" })} className="w-full rounded-2xl bg-card py-3.5 text-sm font-semibold text-tinta shadow-[var(--shadow-card)]">
            Pausar plano
          </button>
        )}
        {regime.status !== "encerrado" && (
          <button onClick={() => encerrarRegime(id)} className="w-full rounded-2xl bg-card py-3.5 text-sm font-semibold text-tinta-2 shadow-[var(--shadow-card)]">
            Encerrar plano
          </button>
        )}
        <button onClick={removerComConfirmacao} className="w-full rounded-2xl border border-alerta/30 py-3.5 text-sm font-semibold text-alerta">
          Remover plano
        </button>
      </div>
      </>
      )}
    </div>
  );
}
