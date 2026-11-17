"use client";

import { useState } from "react";
import { IconeCompartilhar } from "./icons";
import { codificarPlano } from "@/lib/compartilharRegime";
import type { RefeicaoPlanejada, Regime } from "@/lib/tipos";

/** Compartilha a estrutura do plano por link (Web Share ou área de transferência). */
export default function BotaoCompartilharPlano({ regime, refeicoes }: { regime: Regime; refeicoes: RefeicaoPlanejada[] }) {
  const [aviso, setAviso] = useState<string | null>(null);

  async function compartilhar() {
    const codigo = codificarPlano({
      nome: regime.nome,
      objetivo: regime.objetivo,
      duracaoDias: regime.duracaoDias,
      refeicoes: refeicoes.map((r) => ({ tipo: r.tipo, horario: r.horario, descricao: r.descricao })),
    });
    const url = `${window.location.origin}/importar#p=${codigo}`;
    const texto = `Montei o plano "${regime.nome}" no Orvalho. Dá uma olhada:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: regime.nome, text: texto, url });
        return;
      }
      await navigator.clipboard.writeText(`${texto} ${url}`);
      setAviso("Link copiado. Cole no WhatsApp ou onde quiser.");
    } catch (e) {
      // cancelar a folha de compartilhamento não é erro
      if (e instanceof DOMException && e.name === "AbortError") return;
      setAviso("Não deu para compartilhar daqui. Tente de novo.");
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={compartilhar}
        className="toque flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-semibold text-brand shadow-[var(--shadow-card)]"
      >
        <IconeCompartilhar width={18} height={18} aria-hidden /> Compartilhar plano
      </button>
      <p role="status" className="mt-1.5 text-center text-[11px] text-tinta-2">
        {aviso ?? "Vão só o nome e as refeições. Fotos e seu progresso ficam com você."}
      </p>
    </div>
  );
}
