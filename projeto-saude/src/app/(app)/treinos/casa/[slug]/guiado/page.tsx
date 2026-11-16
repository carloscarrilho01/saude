"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AnelProgresso from "@/components/AnelProgresso";
import { IconeCheck, IconeFechar, IconePausa, IconePlay, IconeSetaDir } from "@/components/icons";
import AvisoConquistas from "@/components/treinos/AvisoConquistas";
import DemonstracaoExercicio from "@/components/treinos/DemonstracaoExercicio";
import { getRotina, passosDaRotina } from "@/lib/rotinasCasa";
import { adicionarTreino, conquistasAtividade, dataLocalHoje, getPerfil } from "@/lib/storage";
import { novasConquistas, type ConquistaAtividade } from "@/lib/treinos";
import { formatarDuracao } from "@/lib/caminhada";

// Treino guiado: um passo por vez. Exercício por tempo conta sozinho; por
// repetição espera "Feito". Ao terminar, registra o treino com o tempo real.

export default function TreinoGuiado() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const rotina = getRotina(String(slug));
  const passos = rotina ? passosDaRotina(rotina) : [];
  const [i, setI] = useState(0);
  const [restante, setRestante] = useState<number | null>(passos[0]?.segundos ?? null);
  const [pausado, setPausado] = useState(false);
  const [decorridoS, setDecorridoS] = useState(0);
  const [fim, setFim] = useState(false);
  const [novas, setNovas] = useState<ConquistaAtividade[]>([]);
  const iRef = useRef(0);

  const ir = (n: number) => {
    if (n >= passos.length) {
      setFim(true);
      if ("vibrate" in navigator) navigator.vibrate?.([30, 60, 30, 60, 60]);
      return;
    }
    iRef.current = n;
    setI(n);
    setRestante(passos[n].segundos ?? null);
    if ("vibrate" in navigator) navigator.vibrate?.(25);
  };

  // relógio: tempo total e contagem regressiva do passo
  useEffect(() => {
    if (pausado || fim) return;
    const t = setInterval(() => {
      setDecorridoS((d) => d + 1);
      setRestante((r) => (r == null ? r : r - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [pausado, fim]);

  // passo por tempo acabou → próximo
  useEffect(() => {
    if (restante !== null && restante <= 0 && !fim) {
      const t = setTimeout(() => ir(iRef.current + 1), 0);
      return () => clearTimeout(t);
    }
  });

  if (!rotina) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-tinta-2">Treino não encontrado.</p>
        <Link href="/treinos" className="mt-4 inline-block text-sm font-semibold text-brand">Voltar</Link>
      </div>
    );
  }

  function registrar() {
    if (!rotina) return;
    const antes = conquistasAtividade();
    adicionarTreino({
      tipo: "casa",
      duracaoMin: Math.max(1, Math.round(decorridoS / 60)),
      intensidade: rotina.objetivo === "perder" ? "moderada" : rotina.nivel === "iniciante" ? "leve" : "moderada",
      dataLocal: dataLocalHoje(getPerfil()?.fuso),
      rotina: rotina.slug,
      observacao: rotina.nome,
    });
    const n = novasConquistas(antes, conquistasAtividade());
    if (n.length) {
      setNovas(n);
      setTimeout(() => router.push("/treinos"), 2500);
    } else router.push("/treinos");
  }

  if (fim) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center bg-brand-deep px-6 text-center text-white">
        <span className="check-pop flex h-24 w-24 items-center justify-center rounded-full bg-menta text-brand-deep shadow-[0_0_0_10px_rgba(52,211,153,0.2)]">
          <IconeCheck width={44} height={44} />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold">Treino concluído</h1>
        <p className="mt-2 text-white/75">{rotina.nome} · {formatarDuracao(decorridoS)}</p>
        <button type="button" onClick={registrar} className="mt-8 w-full max-w-xs rounded-2xl bg-white py-4 font-bold text-brand-deep">
          Registrar na minha semana
        </button>
        <Link href="/treinos" className="mt-3 text-sm font-semibold text-white/70">Sair sem registrar</Link>
        <AvisoConquistas novas={novas} aoFechar={() => setNovas([])} />
      </div>
    );
  }

  const p = passos[i];
  const total = p.segundos ?? 0;
  const pct = p.segundos ? Math.round(((total - (restante ?? 0)) / total) * 100) : 0;
  const prox = passos.slice(i + 1).find((x) => x.tipo === "exercicio");

  return (
    <div className={`flex min-h-[calc(100dvh-5rem)] flex-col px-5 pb-8 text-white ${p.tipo === "descanso" ? "bg-[#0f2e21]" : "bg-brand-deep"}`} style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => window.confirm("Sair do treino? O progresso não será registrado.") && router.push(`/treinos/casa/${rotina.slug}`)}
          aria-label="Sair do treino" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <IconeFechar width={18} height={18} />
        </button>
        <span className="text-sm font-semibold tabular-nums text-white/70">{formatarDuracao(decorridoS)}</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10" aria-label={`Passo ${i + 1} de ${passos.length}`}>
        <div className="h-full rounded-full bg-menta transition-[width] duration-500" style={{ width: `${((i + 1) / passos.length) * 100}%` }} />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-verde-claro">
        {p.bloco}{p.voltas > 1 && ` · volta ${p.volta} de ${p.voltas}`}
      </p>

      <div key={i} className="entrar-pagina flex flex-1 flex-col items-center justify-center text-center">
        {p.tipo === "descanso" ? (
          <>
            <p className="text-2xl font-bold text-white/80">Descanse</p>
            <p className="mt-2 text-8xl font-extrabold tabular-nums">{restante}</p>
            {prox && <p className="mt-6 text-sm text-white/60">A seguir: <strong className="text-white">{prox.exercicio?.nome}</strong></p>}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold">{p.exercicio!.nome}</h1>
            <DemonstracaoExercicio exercicio={p.exercicio!} tamanho={230} escuro className="mt-2" />
            <div className="mt-2">
              {p.segundos ? (
                <AnelProgresso percentual={pct} tamanho={120} espessura={10}>
                  <span className="text-4xl font-extrabold tabular-nums">{restante}</span>
                  <span className="text-xs text-white/60">segundos</span>
                </AnelProgresso>
              ) : (
                <p className="text-6xl font-extrabold tabular-nums">{p.exercicio!.repeticoes}<span className="text-2xl text-white/60">×</span></p>
              )}
            </div>
            <p className="mt-4 max-w-sm text-base text-white/85">{p.exercicio!.como}</p>
            <p className="mt-2 max-w-sm text-sm text-menta">Mais fácil: {p.exercicio!.facil}</p>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-6">
        <span className="h-16 w-16" aria-hidden />
        {p.segundos ? (
          <button type="button" onClick={() => setPausado((x) => !x)} aria-label={pausado ? "Continuar" : "Pausar"}
            className="toque flex h-20 w-20 items-center justify-center rounded-full bg-menta text-brand-deep">
            {pausado ? <IconePlay width={30} height={30} /> : <IconePausa width={30} height={30} />}
          </button>
        ) : (
          <button type="button" onClick={() => ir(i + 1)} className="toque flex h-20 min-w-20 items-center justify-center gap-1 rounded-full bg-menta px-6 font-bold text-brand-deep">
            <IconeCheck width={24} height={24} /> Feito
          </button>
        )}
        <button type="button" onClick={() => ir(i + 1)} aria-label="Pular" className="toque flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          <IconeSetaDir width={22} height={22} />
        </button>
      </div>
    </div>
  );
}
