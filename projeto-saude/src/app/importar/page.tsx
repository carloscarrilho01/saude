"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoSaude } from "@/components/decor";
import { IconeRefeicao, IconeLink } from "@/components/icons";
import { codigoDoFragmento, decodificarPlano } from "@/lib/compartilharRegime";
import { criarRegimeDeModelo, definirPlanoPendente, getPlanoPendente, getRegimeAtivo, temPerfil } from "@/lib/storage";
import { nomeObjetivo, nomeRefeicao } from "@/lib/refeicoes";

// Destino do link "Compartilhar plano" (/importar#p=…). Fica fora do grupo (app)
// para quem ainda não tem perfil ver o plano antes de criar a conta.

const assinarHash = (fn: () => void) => {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
};

export default function ImportarPlano() {
  const router = useRouter();
  const hash = useSyncExternalStore(assinarHash, () => window.location.hash, () => null);
  const comPerfil = useSyncExternalStore(() => () => {}, temPerfil, () => false);
  const [salvando, setSalvando] = useState(false);

  if (hash === null) return <Moldura><div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-black/5" /></Moldura>;

  // link novo tem prioridade; sem fragmento, usa o plano guardado antes do onboarding
  const codigo = codigoDoFragmento(hash) ?? getPlanoPendente();
  const plano = codigo ? decodificarPlano(codigo) : null;

  if (!plano || !codigo) {
    return (
      <Moldura>
        <div className="rounded-[var(--radius-card)] bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-alerta/10 text-alerta">
            <IconeLink width={22} height={22} />
          </span>
          <h1 className="mt-4 text-lg font-bold text-tinta">Este link de plano não abriu</h1>
          <p className="mt-1 text-sm text-tinta-2">
            Ele pode ter sido cortado ao copiar. Peça para a pessoa compartilhar de novo, ou veja os modelos prontos.
          </p>
          <Link href={comPerfil ? "/planos?aba=explorar" : "/"} className="mt-5 inline-block rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">
            {comPerfil ? "Ver modelos prontos" : "Conhecer o Orvalho"}
          </Link>
        </div>
      </Moldura>
    );
  }

  function adicionar(ativar: boolean) {
    if (!plano) return;
    const ativo = getRegimeAtivo();
    if (ativar && ativo && !window.confirm(`Começar este plano vai pausar "${ativo.nome}". Continuar?`)) return;
    setSalvando(true);
    const regime = criarRegimeDeModelo(plano, ativar);
    definirPlanoPendente(null);
    router.replace(`/planos/${regime.id}`);
  }

  function criarConta() {
    definirPlanoPendente(codigo);
    router.push("/onboarding");
  }

  return (
    <Moldura>
      <p className="surgir text-xs font-semibold uppercase tracking-wide text-tinta-2">Plano compartilhado com você</p>
      <h1 className="surgir mt-1 text-[28px] font-extrabold leading-tight tracking-tight text-tinta" style={{ "--i": 1 } as React.CSSProperties}>
        {plano.nome}
      </h1>
      <div className="surgir mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold" style={{ "--i": 2 } as React.CSSProperties}>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">{nomeObjetivo(plano.objetivo)}</span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">{plano.duracaoDias} dias</span>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-tinta-2">{plano.refeicoes.length} refeições por dia</span>
      </div>

      <section className="surgir mt-5 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]" style={{ "--i": 3 } as React.CSSProperties}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-tinta-2">O dia neste plano</h2>
        {plano.refeicoes.length === 0 ? (
          <p className="text-sm text-tinta-2">Este plano ainda não tem refeições. Você pode montar depois de adicionar.</p>
        ) : (
          <ol className="space-y-3">
            {plano.refeicoes.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-verde-claro/40 text-brand">
                  <IconeRefeicao tipo={r.tipo} width={18} height={18} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-bold text-tinta">
                    {nomeRefeicao(r.tipo)} <span className="font-semibold tabular-nums text-tinta-2">· {r.horario}</span>
                  </p>
                  <p className="break-words text-sm text-tinta-2">{r.descricao}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="surgir mt-6 space-y-2" style={{ "--i": 4 } as React.CSSProperties}>
        {comPerfil ? (
          <>
            <button type="button" disabled={salvando} onClick={() => adicionar(true)}
              className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white disabled:opacity-50">
              Começar este plano
            </button>
            <button type="button" disabled={salvando} onClick={() => adicionar(false)}
              className="w-full rounded-2xl border border-brand/20 py-3.5 text-sm font-semibold text-brand disabled:opacity-50">
              Só salvar nos meus planos
            </button>
          </>
        ) : (
          <button type="button" onClick={criarConta} className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white">
            Criar minha meta e usar este plano
          </button>
        )}
      </div>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-tinta-2">
        Plano criado por outra pessoa, não por um profissional de saúde. Para metas de peso ou restrições, procure um nutricionista.
      </p>
    </Moldura>
  );
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[480px] px-5 pb-10" style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
      <Link href="/" className="mb-6 flex items-center gap-2" aria-label="Orvalho, página inicial">
        <LogoSaude size={30} />
        <span className="text-base font-extrabold tracking-tight text-brand">Orvalho</span>
      </Link>
      {children}
    </div>
  );
}
