"use client";

import { useState } from "react";
import ModalAdicionarItem from "@/components/ModalAdicionarItem";
import { IconeMais, IconeLapis, IconeLixeira, IconeSetaEsq, IconeSetaDir } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import { getItensDia, removerItemDiario, dataLocalHoje, getPerfil } from "@/lib/storage";
import { TIPOS_REFEICAO, nomeRefeicao, abreviarUnidade } from "@/lib/refeicoes";
import type { ItemDiario, TipoRefeicao } from "@/lib/tipos";

export default function PaginaDiario() {
  const pronto = useStorePronto();
  const [offsetDias, setOffsetDias] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<ItemDiario | null>(null);

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const fuso = getPerfil()?.fuso;
  const dataLocal = dataComOffset(offsetDias, fuso);
  const itens = getItensDia(dataLocal);
  const porTipo = (t: TipoRefeicao) => itens.filter((i) => i.tipoRefeicao === t);

  function abrirNovo() {
    setItemEditando(null);
    setModalAberto(true);
  }
  function abrirEdicao(item: ItemDiario) {
    setItemEditando(item);
    setModalAberto(true);
  }

  return (
    <div className="relative px-5 pb-28 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <h1 className="relative mb-4 text-center text-xl font-extrabold text-tinta">Diário alimentar</h1>

      {/* navegação de dias */}
      <div className="mb-5 flex items-center justify-between rounded-2xl bg-card px-3 py-2 shadow-[var(--shadow-card)]">
        <button
          onClick={() => setOffsetDias((o) => o - 1)}
          aria-label="Dia anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5"
        >
          <IconeSetaEsq width={18} height={18} />
        </button>
        <span className="text-sm font-semibold text-tinta">{rotuloDia(offsetDias, dataLocal, fuso)}</span>
        <button
          onClick={() => setOffsetDias((o) => Math.min(0, o + 1))}
          disabled={offsetDias >= 0}
          aria-label="Próximo dia"
          className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5 disabled:opacity-30"
        >
          <IconeSetaDir width={18} height={18} />
        </button>
      </div>

      {itens.length === 0 ? (
        <div className="rounded-[var(--radius-card)] bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-tinta-2">
            Nenhum registro {offsetDias === 0 ? "hoje" : "neste dia"}. Toque em adicionar para lançar o que você comeu ou bebeu.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {TIPOS_REFEICAO.map((t) => {
            const lista = porTipo(t.valor);
            if (lista.length === 0) return null;
            return (
              <section key={t.valor}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-tinta">
                  <span>{t.emoji}</span> {nomeRefeicao(t.valor)}
                </h2>
                <ul className="space-y-2">
                  {lista.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-tinta">{item.alimento}</p>
                        <p className="text-xs text-tinta-2">
                          {item.quantidade} {abreviarUnidade(item.unidade, item.quantidade)}
                          {item.calorias != null && ` · ${item.calorias} kcal`}
                          {item.observacao && ` · ${item.observacao}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button onClick={() => abrirEdicao(item)} aria-label="Editar" className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5">
                          <IconeLapis width={16} height={16} />
                        </button>
                        <button onClick={() => removerItemDiario(item.id)} aria-label="Remover" className="flex h-8 w-8 items-center justify-center rounded-full text-tinta-2 hover:text-alerta">
                          <IconeLixeira width={16} height={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* botão flutuante de adicionar */}
      <button
        onClick={abrirNovo}
        className="fixed bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-float)] active:scale-95"
      >
        <IconeMais width={18} height={18} /> Adicionar refeição
      </button>

      <ModalAdicionarItem
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        dataLocal={dataLocal}
        itemParaEditar={itemEditando}
      />
    </div>
  );
}

function dataComOffset(offset: number, fuso?: string): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", { timeZone: fuso }).format(d);
}

function rotuloDia(offset: number, dataLocal: string, fuso?: string): string {
  if (offset === 0) return "Hoje";
  if (offset === -1) return "Ontem";
  const d = new Date(`${dataLocal}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: fuso,
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(d);
}
