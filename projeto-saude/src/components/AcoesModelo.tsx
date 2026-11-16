"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { criarRegimeDeModelo, getRegimeAtivo } from "@/lib/storage";
import { getModelo } from "@/lib/modelosRegime";

/** Botões do detalhe do modelo: começar já (clona e ativa) ou personalizar antes. */
export default function AcoesModelo({ slug }: { slug: string }) {
  const router = useRouter();

  function comecar() {
    const modelo = getModelo(slug);
    if (!modelo) return;
    const ativo = getRegimeAtivo();
    if (ativo && !window.confirm(`Ativar este plano vai pausar "${ativo.nome}". Continuar?`)) return;
    const regime = criarRegimeDeModelo(modelo, true);
    router.replace(`/planos/${regime.id}`);
  }

  return (
    <div className="mt-6 space-y-2">
      <button
        type="button"
        onClick={comecar}
        className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-[0_10px_30px_-12px_rgba(19,38,30,0.6)] active:scale-[.99]"
      >
        Começar este plano
      </button>
      <Link
        href={`/planos/novo?modelo=${slug}`}
        className="block w-full rounded-2xl border border-brand/20 py-3.5 text-center text-sm font-semibold text-brand"
      >
        Personalizar antes de começar
      </Link>
    </div>
  );
}
