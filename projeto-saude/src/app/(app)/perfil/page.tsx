"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { IconePessoa, IconeSetaDir, IconeAlvo, IconeSino, IconeGrafico, IconeTrofeu, IconeCadeado, IconeTenis } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import { getPerfil, getMeta, limparTudo } from "@/lib/storage";
import { formatarLitros } from "@/lib/hidratacao";
import { nomeAtividade, nomeClima } from "@/lib/perfilOpcoes";

export default function PaginaPerfil() {
  const pronto = useStorePronto();
  const router = useRouter();

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const perfil = getPerfil();
  const meta = getMeta();

  function sair() {
    limparTudo();
    router.replace("/onboarding");
  }

  return (
    <div className="relative px-5 pb-6 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <h1 className="relative mb-5 text-center text-xl font-extrabold text-tinta">Meu perfil</h1>

      <div className="flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-verde-claro/40 text-brand">
          <IconePessoa width={40} height={40} />
        </div>
        <p className="mt-3 text-lg font-bold text-tinta">{perfil?.nome}</p>
        {meta && <p className="text-sm text-tinta-2">Meta: {formatarLitros(meta.metaMl)} / dia</p>}
      </div>

      <div className="mt-6 mb-2 flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Meus dados</p>
        <Link href="/perfil/dados" className="text-sm font-semibold text-brand">Editar</Link>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)]">
        <LinhaDado rotulo="Peso" valor={perfil?.pesoKg ? `${perfil.pesoKg} kg` : "—"} />
        <LinhaDado rotulo="Altura" valor={perfil?.alturaCm ? `${perfil.alturaCm} cm` : "—"} />
        <LinhaDado rotulo="Idade" valor={perfil?.idade ? `${perfil.idade} anos` : "—"} />
        <LinhaDado rotulo="Nível de atividade" valor={nomeAtividade(perfil?.nivelAtividade)} />
        <LinhaDado rotulo="Clima" valor={nomeClima(perfil?.clima)} ultima />
      </div>

      <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">Configurações</p>
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)]">
        <LinhaLink href="/perfil/dados" rotulo="Metas e preferências" Icone={IconeAlvo} />
        <LinhaLink href="/lembretes" rotulo="Lembretes" Icone={IconeSino} />
        <LinhaLink href="/relatorios" rotulo="Relatórios" Icone={IconeGrafico} />
        <LinhaLink href="/conquistas" rotulo="Consistência e conquistas" Icone={IconeTrofeu} />
        <LinhaLink href="/caminhada" rotulo="Caminhadas" Icone={IconeTenis} />
        <LinhaLink href="/perfil/privacidade" rotulo="Privacidade e dados" Icone={IconeCadeado} ultima />
      </div>

      <button
        onClick={sair}
        className="mt-6 w-full rounded-2xl border border-alerta/30 py-3.5 text-sm font-semibold text-alerta"
      >
        Sair / apagar dados locais
      </button>
      <p className="mt-2 text-center text-[11px] text-tinta-2">
        Os dados ficam só neste navegador (versão inicial). O login real entra na próxima fase.
      </p>
    </div>
  );
}

function LinhaDado({ rotulo, valor, ultima }: { rotulo: string; valor: string; ultima?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${
        ultima ? "" : "border-b border-black/5"
      }`}
    >
      <span className="text-sm text-tinta">{rotulo}</span>
      <span className="text-sm font-medium text-tinta-2">{valor}</span>
    </div>
  );
}

function LinhaLink({
  href,
  rotulo,
  Icone,
  ultima,
}: {
  href: string;
  rotulo: string;
  Icone: ComponentType<SVGProps<SVGSVGElement>>;
  ultima?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-4 py-2.5 hover:bg-black/[0.02] ${
        ultima ? "" : "border-b border-black/5"
      }`}
    >
      <span className="flex items-center gap-3 text-sm text-tinta">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-verde-claro/35 text-brand">
          <Icone width={17} height={17} aria-hidden />
        </span>
        {rotulo}
      </span>
      <IconeSetaDir width={16} height={16} className="text-tinta-2" aria-hidden />
    </Link>
  );
}
