import { notFound } from "next/navigation";
import Link from "next/link";
import { IconeSetaEsq, IconeRefeicao } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import AcoesModelo from "@/components/AcoesModelo";
import { FONTE_ORIENTACOES, MODELOS_REGIME, getModelo } from "@/lib/modelosRegime";
import { nomeObjetivo, nomeRefeicao } from "@/lib/refeicoes";

// Detalhe de um modelo pronto (Server Component, gerado estático).

export function generateStaticParams() {
  return MODELOS_REGIME.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/planos/modelos/[slug]">) {
  const { slug } = await params;
  const m = getModelo(slug);
  return { title: m ? `${m.nome} · Orvalho` : "Modelo · Orvalho" };
}

export default async function PaginaModelo({ params }: PageProps<"/planos/modelos/[slug]">) {
  const { slug } = await params;
  const modelo = getModelo(slug);
  if (!modelo) notFound();

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-4 flex items-center">
        <Link href="/planos?aba=explorar" aria-label="Voltar para Explorar" className="-ml-1 rounded-full p-1.5 text-tinta">
          <IconeSetaEsq width={22} height={22} />
        </Link>
        <span className="flex-1 pr-8 text-center text-sm font-semibold text-tinta-2">Modelo de plano</span>
      </header>

      <h1 className="relative text-[28px] font-extrabold leading-tight tracking-tight text-tinta">{modelo.nome}</h1>
      <p className="mt-2 text-sm leading-relaxed text-tinta-2">{modelo.resumo}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">{nomeObjetivo(modelo.objetivo)}</span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">{modelo.duracaoDias} dias</span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">{modelo.refeicoes.length} refeições por dia</span>
      </div>

      <section className="mt-5 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Pra quem é</h2>
        <p className="mt-1 text-sm text-tinta">{modelo.praQuem}</p>
      </section>

      <section className="mt-4 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-tinta-2">Seu dia neste plano</h2>
        <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[18px] before:top-3 before:w-px before:bg-black/10">
          {modelo.refeicoes.map((r, i) => (
            <li key={i} className="relative flex gap-3">
              <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-verde-claro/40 text-brand">
                <IconeRefeicao tipo={r.tipo} width={18} height={18} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-bold text-tinta">
                  {nomeRefeicao(r.tipo)} <span className="font-semibold tabular-nums text-tinta-2">· {r.horario}</span>
                </p>
                <p className="text-sm text-tinta-2">{r.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">Orientações</h2>
        <ul className="space-y-2">
          {modelo.orientacoes.map((o) => (
            <li key={o} className="flex gap-2 text-sm text-tinta">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-menta" />
              {o}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-tinta-2">Baseado no {FONTE_ORIENTACOES}.</p>
      </section>

      <AcoesModelo slug={modelo.slug} />

      <p className="mt-4 text-center text-[11px] leading-relaxed text-tinta-2">
        Modelo de organização da rotina, não uma prescrição. Para metas de peso, restrições ou condições
        de saúde, procure um nutricionista.
      </p>
    </div>
  );
}
