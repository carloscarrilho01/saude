"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconePessoas } from "../icons";
import { getMural } from "@/lib/mural/repositorio";
import { LIMITES_MURAL, validarPublicacao, type ErrosPublicacao } from "@/lib/mural/regras";
import { getApelidoMural, getPerfil, salvarApelidoMural } from "@/lib/storage";
import type { RefeicaoPlanejada, Regime } from "@/lib/tipos";

/** Folha "Publicar na comunidade" a partir de um plano do usuário. */
export default function PublicarPlano({ regime, refeicoes, aoFechar }: { regime: Regime; refeicoes: RefeicaoPlanejada[]; aoFechar: () => void }) {
  const router = useRouter();
  const [apelido, setApelido] = useState(() => getApelidoMural() ?? (getPerfil()?.nome ?? "").split(" ")[0] ?? "");
  const [nome, setNome] = useState(regime.nome);
  const [descricao, setDescricao] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<ErrosPublicacao>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function publicar() {
    const { dados, erros: e } = validarPublicacao({
      apelido,
      nome,
      descricao,
      objetivo: regime.objetivo,
      duracaoDias: regime.duracaoDias,
      refeicoes: refeicoes.map((r) => ({ tipo: r.tipo, horario: r.horario, descricao: r.descricao })),
    });
    setErros(e);
    if (Object.keys(e).length || !aceite) return;
    setEnviando(true);
    try {
      const pub = await getMural().publicar(dados);
      salvarApelidoMural(dados.apelido);
      router.push(`/planos/comunidade/${pub.id}`);
    } catch (err) {
      setErroGeral(err instanceof Error ? err.message : "Não foi possível publicar agora.");
      setEnviando(false);
    }
  }

  const campo = "w-full rounded-xl border border-black/10 bg-superficie px-3 py-2.5 text-sm text-tinta outline-none focus:border-brand";

  return (
    <div className="fundo-aparece fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publicar-titulo"
        className="folha-sobe max-h-[92dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-claro/40 text-brand">
          <IconePessoas width={22} height={22} />
        </span>
        <h2 id="publicar-titulo" className="mt-4 text-lg font-bold text-tinta">Publicar na comunidade</h2>
        <p className="mt-1 text-sm text-tinta-2">
          Outras pessoas vão ver o nome, a descrição e as {refeicoes.length} refeições deste plano, e poderão salvá-lo.
        </p>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-tinta-2">Como você aparece</span>
            <input value={apelido} onChange={(e) => { setApelido(e.target.value); setErros((x) => ({ ...x, apelido: undefined })); }} maxLength={LIMITES_MURAL.apelido.max} placeholder="Um apelido" className={campo} aria-invalid={!!erros.apelido} />
            {erros.apelido ? <span className="mt-1 block text-xs text-alerta">{erros.apelido}</span> : <span className="mt-1 block text-[11px] text-tinta-2">Não precisa ser seu nome real.</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-tinta-2">Nome do plano</span>
            <input value={nome} onChange={(e) => { setNome(e.target.value); setErros((x) => ({ ...x, nome: undefined })); }} maxLength={LIMITES_MURAL.nome.max} className={campo} aria-invalid={!!erros.nome} />
            {erros.nome && <span className="mt-1 block text-xs text-alerta">{erros.nome}</span>}
          </label>
          <label className="block">
            <span className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-tinta-2">
              Pra quem é este plano
              <span className="font-normal normal-case tabular-nums">{descricao.length}/{LIMITES_MURAL.descricao.max}</span>
            </span>
            <textarea
              value={descricao}
              onChange={(e) => { setDescricao(e.target.value); setErros((x) => ({ ...x, descricao: undefined })); }}
              maxLength={LIMITES_MURAL.descricao.max}
              rows={3}
              placeholder="Ex.: Para quem trabalha fora e quer parar de pular o almoço."
              className={`${campo} resize-none`}
              aria-invalid={!!erros.descricao}
            />
            {erros.descricao && <span className="mt-1 block text-xs text-alerta">{erros.descricao}</span>}
          </label>
          {erros.refeicoes && <p className="text-xs text-alerta">{erros.refeicoes}</p>}
        </div>

        <label className="mt-4 flex cursor-pointer gap-3 rounded-2xl bg-superficie p-3">
          <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[color:var(--color-brand)]" />
          <span className="text-xs leading-relaxed text-tinta">
            Entendo que este plano fica visível para outras pessoas. <strong>Fotos, aderência e meus dados de saúde não são publicados.</strong> Não vou prometer resultados nem divulgar produtos.
          </span>
        </label>

        {erroGeral && <p className="mt-3 text-xs text-alerta">{erroGeral}</p>}

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={aoFechar} className="flex-1 rounded-2xl bg-superficie py-3.5 text-sm font-semibold text-tinta">
            Cancelar
          </button>
          <button type="button" onClick={publicar} disabled={!aceite || enviando} className="flex-[2] rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40">
            {enviando ? "Publicando…" : "Publicar plano"}
          </button>
        </div>
      </div>
    </div>
  );
}
