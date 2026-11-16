"use client";

import { useState } from "react";
import {
  adicionarItemDiario,
  editarItemDiario,
  type NovoItemDiario,
} from "@/lib/storage";
import { TIPOS_REFEICAO, UNIDADES } from "@/lib/refeicoes";
import type { ItemDiario, TipoRefeicao, Unidade } from "@/lib/tipos";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  dataLocal: string;
  tipoDefault?: TipoRefeicao;
  /** vincula o item a uma refeição planejada (aderência) */
  refeicaoPlanejadaId?: string;
  itemParaEditar?: ItemDiario | null;
}

export default function ModalAdicionarItem({
  aberto,
  aoFechar,
  dataLocal,
  tipoDefault = "almoco",
  refeicaoPlanejadaId,
  itemParaEditar = null,
}: Props) {
  const editando = Boolean(itemParaEditar);
  const [alimento, setAlimento] = useState(itemParaEditar?.alimento ?? "");
  const [quantidade, setQuantidade] = useState(
    itemParaEditar ? String(itemParaEditar.quantidade) : "",
  );
  const [unidade, setUnidade] = useState<Unidade>(itemParaEditar?.unidade ?? "g");
  const [tipo, setTipo] = useState<TipoRefeicao>(itemParaEditar?.tipoRefeicao ?? tipoDefault);
  const [observacao, setObservacao] = useState(itemParaEditar?.observacao ?? "");
  const [calorias, setCalorias] = useState(
    itemParaEditar?.calorias != null ? String(itemParaEditar.calorias) : "",
  );
  const [ehBebida, setEhBebida] = useState(itemParaEditar?.ehBebida ?? false);

  if (!aberto) return null;

  const qtdNum = parseFloat(quantidade.replace(",", "."));
  const valido = alimento.trim() !== "" && !Number.isNaN(qtdNum) && qtdNum > 0;

  function salvar() {
    if (!valido) return;
    const dados: NovoItemDiario = {
      tipoRefeicao: tipo,
      alimento: alimento.trim(),
      quantidade: qtdNum,
      unidade,
      observacao: observacao.trim() || undefined,
      calorias: calorias ? parseInt(calorias, 10) : undefined,
      ehBebida,
      refeicaoPlanejadaId: itemParaEditar?.refeicaoPlanejadaId ?? refeicaoPlanejadaId,
    };
    if (editando && itemParaEditar) {
      editarItemDiario(itemParaEditar.id, dados);
    } else {
      adicionarItemDiario(dados, dataLocal);
    }
    aoFechar();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={aoFechar}>
      <div
        className="scroll-limpo max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">
            {editando ? "Editar item" : "Adicionar refeição"}
          </h2>
          <button onClick={aoFechar} aria-label="Fechar" className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-tinta-2">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Rotulo>Alimento</Rotulo>
            <input
              value={alimento}
              onChange={(e) => setAlimento(e.target.value)}
              placeholder="Ex.: Arroz integral"
              autoFocus
              className="w-full rounded-2xl bg-superficie px-4 py-3 text-tinta outline-none placeholder:text-tinta-2/60"
            />
          </div>

          <div className="flex gap-3">
            <div className="w-28">
              <Rotulo>Quantidade</Rotulo>
              <input
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                inputMode="decimal"
                placeholder="100"
                className="w-full rounded-2xl bg-superficie px-4 py-3 text-tinta outline-none placeholder:text-tinta-2/60"
              />
            </div>
            <div className="flex-1">
              <Rotulo>Unidade</Rotulo>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value as Unidade)}
                className="w-full rounded-2xl bg-superficie px-4 py-3 text-tinta outline-none"
              >
                {UNIDADES.map((u) => (
                  <option key={u.valor} value={u.valor}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Rotulo>Refeição</Rotulo>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_REFEICAO.map((t) => (
                <button
                  key={t.valor}
                  onClick={() => setTipo(t.valor)}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                    tipo === t.valor ? "bg-brand text-white" : "bg-superficie text-tinta-2"
                  }`}
                >
                  {t.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Rotulo>Horário</Rotulo>
              <input value={horaAgora()} readOnly className="w-full rounded-2xl bg-superficie px-4 py-3 text-tinta-2 outline-none" />
            </div>
            <div className="w-28">
              <Rotulo>Calorias</Rotulo>
              <input
                value={calorias}
                onChange={(e) => setCalorias(e.target.value)}
                inputMode="numeric"
                placeholder="opcional"
                className="w-full rounded-2xl bg-superficie px-4 py-3 text-tinta outline-none placeholder:text-tinta-2/60"
              />
            </div>
          </div>

          <div>
            <Rotulo>Observação</Rotulo>
            <input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: Sem óleo"
              className="w-full rounded-2xl bg-superficie px-4 py-3 text-tinta outline-none placeholder:text-tinta-2/60"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-superficie px-4 py-3">
            <input
              type="checkbox"
              checked={ehBebida}
              onChange={(e) => setEhBebida(e.target.checked)}
              className="h-5 w-5 accent-[color:var(--color-brand)]"
            />
            <span className="text-sm text-tinta">É uma bebida</span>
            <span className="ml-auto text-[11px] text-tinta-2">só água pura conta p/ hidratação</span>
          </label>
        </div>

        <button
          disabled={!valido}
          onClick={salvar}
          className="mt-5 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition active:scale-[.99] disabled:opacity-40"
        >
          {editando ? "Salvar alterações" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-tinta-2">{children}</p>;
}

function horaAgora(): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}
