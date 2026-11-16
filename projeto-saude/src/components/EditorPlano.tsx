"use client";

import { useState } from "react";
import { IconeLixeira, IconeMais } from "./icons";
import { atualizarRegime, salvarRefeicoesDoPlano } from "@/lib/storage";
import { TIPOS_REFEICAO, nomeRefeicao } from "@/lib/refeicoes";
import type { RefeicaoPlanejada, Regime, TipoRefeicao } from "@/lib/tipos";

// Edição de um plano já criado (RF-5.2/RF-5.5). As mudanças nas refeições
// valem a partir de hoje e não reescrevem a aderência de dias anteriores (§3.5).

interface Linha {
  chave: string; // estável para o React, inclusive em linhas novas
  id?: string;
  tipo: TipoRefeicao;
  horario: string;
  descricao: string;
}

const HORARIO_PADRAO: Record<TipoRefeicao, string> = {
  cafe: "08:00",
  almoco: "12:00",
  lanche: "15:00",
  jantar: "19:00",
  outro: "21:00",
};

let contador = 0;
const novaChave = () => `nova-${++contador}`;

export default function EditorPlano({
  regime,
  refeicoes,
  aoTerminar,
}: {
  regime: Regime;
  refeicoes: RefeicaoPlanejada[];
  aoTerminar: () => void;
}) {
  const [nome, setNome] = useState(regime.nome);
  const [duracao, setDuracao] = useState(String(regime.duracaoDias));
  const [linhas, setLinhas] = useState<Linha[]>(() =>
    refeicoes.map((r) => ({ chave: r.id, id: r.id, tipo: r.tipo, horario: r.horario, descricao: r.descricao })),
  );

  const duracaoNum = parseInt(duracao, 10);
  const duracaoValida = Number.isInteger(duracaoNum) && duracaoNum >= 1 && duracaoNum <= 365;
  const linhasValidas = linhas.every((l) => l.descricao.trim() !== "" && /^\d{2}:\d{2}$/.test(l.horario));
  const valido = nome.trim() !== "" && duracaoValida && linhasValidas;
  const removidas = refeicoes.filter((r) => !linhas.some((l) => l.id === r.id)).length;
  const novas = linhas.filter((l) => !l.id).length;

  const atualizar = (chave: string, dados: Partial<Linha>) =>
    setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, ...dados } : l)));

  function adicionar() {
    setLinhas((ls) => [...ls, { chave: novaChave(), tipo: "lanche", horario: HORARIO_PADRAO.lanche, descricao: "" }]);
  }

  function salvar() {
    if (!valido) return;
    atualizarRegime(regime.id, { nome: nome.trim(), duracaoDias: duracaoNum });
    salvarRefeicoesDoPlano(
      regime.id,
      linhas.map((l) => ({ id: l.id, tipo: l.tipo, horario: l.horario, descricao: l.descricao.trim() })),
    );
    aoTerminar();
  }

  return (
    <section aria-labelledby="editar-titulo" className="mt-6">
      <h2 id="editar-titulo" className="sr-only">Editar plano</h2>

      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-tinta-2">Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60}
            className="w-full rounded-2xl bg-card px-4 py-3 text-sm text-tinta shadow-[var(--shadow-card)] outline-none focus:ring-2 focus:ring-brand/30" />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-tinta-2">Dias</span>
          <input value={duracao} onChange={(e) => setDuracao(e.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-invalid={!duracaoValida}
            className="w-full rounded-2xl bg-card px-4 py-3 text-sm text-tinta shadow-[var(--shadow-card)] outline-none focus:ring-2 focus:ring-brand/30" />
        </label>
      </div>
      {!duracaoValida && <p className="mt-1 text-xs text-alerta">A duração vai de 1 a 365 dias.</p>}

      <div className="mt-5 mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-tinta">Refeições</span>
        <button type="button" onClick={adicionar} className="flex items-center gap-1 text-sm font-semibold text-brand">
          <IconeMais width={16} height={16} /> Adicionar
        </button>
      </div>

      {linhas.length === 0 ? (
        <p className="rounded-2xl bg-card p-5 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
          Sem refeições. Toque em Adicionar para montar o dia.
        </p>
      ) : (
        <ul className="space-y-2">
          {linhas.map((l) => (
            <li key={l.chave} className="rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`tipo-${l.chave}`}>Tipo de refeição</label>
                <select id={`tipo-${l.chave}`} value={l.tipo}
                  onChange={(e) => {
                    const tipo = e.target.value as TipoRefeicao;
                    atualizar(l.chave, l.id ? { tipo } : { tipo, horario: HORARIO_PADRAO[tipo] });
                  }}
                  className="rounded-lg bg-superficie px-2 py-2 text-sm text-tinta outline-none">
                  {TIPOS_REFEICAO.map((t) => <option key={t.valor} value={t.valor}>{nomeRefeicao(t.valor)}</option>)}
                </select>
                <label className="sr-only" htmlFor={`hora-${l.chave}`}>Horário</label>
                <input id={`hora-${l.chave}`} type="time" value={l.horario} onChange={(e) => atualizar(l.chave, { horario: e.target.value })}
                  className="rounded-lg bg-superficie px-2 py-2 text-sm text-tinta outline-none" />
                {!l.id && <span className="rounded-full bg-menta/20 px-2 py-0.5 text-[10px] font-semibold text-brand">nova</span>}
                <button type="button" onClick={() => setLinhas((ls) => ls.filter((x) => x.chave !== l.chave))}
                  aria-label={`Remover ${nomeRefeicao(l.tipo)} das ${l.horario}`}
                  className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-tinta-2 hover:text-alerta">
                  <IconeLixeira width={16} height={16} />
                </button>
              </div>
              <label className="sr-only" htmlFor={`desc-${l.chave}`}>O que comer</label>
              <input id={`desc-${l.chave}`} value={l.descricao} onChange={(e) => atualizar(l.chave, { descricao: e.target.value })}
                placeholder="O que comer (ex.: Omelete, frutas e chá)" maxLength={120} aria-invalid={l.descricao.trim() === ""}
                className="mt-2 w-full rounded-lg bg-superficie px-3 py-2 text-sm text-tinta outline-none placeholder:text-tinta-2/60" />
            </li>
          ))}
        </ul>
      )}
      {!linhasValidas && <p className="mt-2 text-xs text-alerta">Preencha o que comer em todas as refeições.</p>}

      <p className="mt-4 rounded-2xl bg-verde-claro/25 px-4 py-3 text-xs leading-relaxed text-brand">
        As mudanças valem a partir de hoje. A aderência dos dias anteriores continua como estava.
        {(removidas > 0 || novas > 0) && (
          <>
            {" "}
            <strong>
              {[novas > 0 && `${novas} ${novas === 1 ? "nova" : "novas"}`, removidas > 0 && `${removidas} ${removidas === 1 ? "removida" : "removidas"}`]
                .filter(Boolean)
                .join(", ")}
              .
            </strong>
          </>
        )}
      </p>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={aoTerminar} className="flex-1 rounded-2xl bg-card py-3.5 text-sm font-semibold text-tinta shadow-[var(--shadow-card)]">
          Cancelar
        </button>
        <button type="button" onClick={salvar} disabled={!valido}
          className="flex-[2] rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40">
          Salvar alterações
        </button>
      </div>
    </section>
  );
}
