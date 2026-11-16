import Link from "next/link";
import { notFound } from "next/navigation";
import { TopoFolha } from "@/components/decor";
import { IconeCronometro, IconeSetaEsq, IconePlay } from "@/components/icons";
import { OBJETIVOS_TREINO, ROTINAS_CASA, getRotina } from "@/lib/rotinasCasa";
import DemonstracaoExercicio from "@/components/treinos/DemonstracaoExercicio";

export function generateStaticParams() {
  return ROTINAS_CASA.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/treinos/casa/[slug]">) {
  const { slug } = await params;
  return { title: `${getRotina(slug)?.nome ?? "Treino"} · Orvalho` };
}

const medida = (e: { segundos?: number; repeticoes?: number }) => (e.segundos ? `${e.segundos} s` : `${e.repeticoes}×`);

export default async function PaginaRotina({ params }: PageProps<"/treinos/casa/[slug]">) {
  const { slug } = await params;
  const r = getRotina(slug);
  if (!r) notFound();
  const objetivo = OBJETIVOS_TREINO.find((o) => o.valor === r.objetivo)?.nome;

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-4 flex items-center">
        <Link href="/treinos" aria-label="Voltar para Treinos" className="-ml-1 rounded-full p-1.5 text-tinta">
          <IconeSetaEsq width={22} height={22} />
        </Link>
        <span className="flex-1 pr-8 text-center text-sm font-semibold text-tinta-2">Treino em casa</span>
      </header>

      <h1 className="relative text-[28px] font-extrabold leading-tight tracking-tight text-tinta">{r.nome}</h1>
      <p className="mt-2 text-sm leading-relaxed text-tinta-2">{r.resumo}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-brand">
          <IconeCronometro width={12} height={12} aria-hidden /> {r.minutos} min
        </span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 capitalize text-tinta-2">{r.nivel}</span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">{objetivo}</span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">Sem equipamento</span>
      </div>

      {r.blocos.map((b) => (
        <section key={b.titulo} className="mt-5 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="flex items-baseline justify-between text-sm font-bold text-tinta">
            {b.titulo}
            {b.voltas > 1 && <span className="text-xs font-semibold text-tinta-2">{b.voltas} voltas · descanso {b.descansoS} s</span>}
          </h2>
          <ol className="mt-3 space-y-3">
            {b.exercicios.map((e) => (
              <li key={e.nome} className="flex gap-3">
                <span className="flex h-[68px] w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-superficie">
                  <DemonstracaoExercicio exercicio={e} tamanho={80} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-tinta">
                    {e.nome} <span className="ml-1 rounded-md bg-verde-claro/35 px-1.5 py-0.5 text-[11px] tabular-nums text-brand">{medida(e)}</span>
                  </p>
                  <p className="text-sm text-tinta-2">{e.como}</p>
                  <p className="mt-0.5 text-xs text-brand">Mais fácil: {e.facil}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <Link href={`/treinos/casa/${r.slug}/guiado`} className="toque mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-[0_10px_30px_-12px_rgba(19,38,30,0.6)]">
        <IconePlay width={18} height={18} aria-hidden /> Começar treino guiado
      </Link>

      <div className="mt-4 rounded-2xl bg-alerta/5 px-4 py-3 text-xs leading-relaxed text-tinta-2">
        <strong className="text-tinta">Antes de começar:</strong> faça no seu ritmo e use a versão mais fácil sempre que precisar.
        Pare se sentir dor no peito, tontura, falta de ar fora do normal ou dor nas articulações. Se tem alguma condição de saúde,
        está grávida ou voltando de lesão, converse antes com um profissional.
      </div>
    </div>
  );
}
