"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopoFolha } from "@/components/decor";
import DesenhoPercurso from "@/components/caminhada/DesenhoPercurso";
import { IconeCadeado, IconeLocal, IconePausa, IconePlay, IconeParar, IconeSetaDir, IconeTenis } from "@/components/icons";
import { useStorePronto } from "@/lib/hooks";
import { getCaminhadas, getConsentimentoLocalizacao, registrarConsentimentoLocalizacao, dataLocalHoje, getPerfil } from "@/lib/storage";
import {
  assinarRastreio,
  descartar,
  finalizar,
  iniciar,
  lerRastreio,
  pausar,
  rastreioServidor,
  retomar,
  tempoMs,
  type EstadoRastreio,
} from "@/lib/rastreador";
import { formatarDuracao, formatarKm, formatarRitmo, ritmoSPorKm, totaisCaminhadas } from "@/lib/caminhada";
import { inicioDaSemana } from "@/lib/habitos";

export default function PaginaCaminhada() {
  const pronto = useStorePronto();
  const rastreio = useSyncExternalStore(assinarRastreio, lerRastreio, rastreioServidor);
  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;
  return rastreio.status === "parado" ? <Inicio erro={rastreio.erro} /> : <Gravando r={rastreio} />;
}

// ---------------- parado: começar + histórico ----------------

function Inicio({ erro }: { erro: EstadoRastreio["erro"] }) {
  const [consentindo, setConsentindo] = useState(false);
  const caminhadas = getCaminhadas();
  const segunda = inicioDaSemana(dataLocalHoje(getPerfil()?.fuso));
  const semana = totaisCaminhadas(caminhadas.filter((c) => c.dataLocal >= segunda));

  function comecar() {
    if (!getConsentimentoLocalizacao()) setConsentindo(true);
    else iniciar();
  }

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <h1 className="relative mb-5 text-center text-xl font-extrabold text-tinta">Caminhada</h1>

      <section className="surgir relative overflow-hidden rounded-[var(--radius-card)] bg-brand-deep p-6 text-center text-white shadow-[var(--shadow-float)]">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(80% 60% at 50% 0%, rgba(52,211,153,0.25), transparent 70%)" }} />
        <p className="relative text-xs font-semibold uppercase tracking-wide text-verde-claro">Esta semana</p>
        <p className="relative mt-1 text-5xl font-extrabold tabular-nums">
          {formatarKm(semana.distanciaM)} <span className="text-2xl font-bold text-white/70">km</span>
        </p>
        <p className="relative mt-1 text-sm text-white/70">
          {semana.quantidade} {semana.quantidade === 1 ? "caminhada" : "caminhadas"} · {formatarDuracao(semana.duracaoS)} em movimento
        </p>
        <button
          type="button"
          onClick={comecar}
          className="toque relative mx-auto mt-6 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-menta text-brand-deep shadow-[0_0_0_10px_rgba(52,211,153,0.18)]"
        >
          <IconePlay width={30} height={30} aria-hidden />
          <span className="mt-0.5 text-xs font-bold">Começar</span>
        </button>
        <p className="relative mt-5 text-[11px] leading-relaxed text-white/60">
          Deixe o Orvalho aberto na tela durante a caminhada: o navegador só envia a localização com o app à vista.
          A tela fica acesa sozinha enquanto grava.
        </p>
      </section>

      {erro && <AvisoErro erro={erro} />}

      <div className="mt-6 mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-tinta-2">Histórico</h2>
        <span className="flex items-center gap-1 text-[11px] text-tinta-2">
          <IconeCadeado width={12} height={12} aria-hidden /> Só neste aparelho
        </span>
      </div>
      {caminhadas.length === 0 ? (
        <div className="rounded-[var(--radius-card)] bg-card p-6 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
          Suas caminhadas aparecem aqui, com distância, tempo e o desenho do percurso.
        </div>
      ) : (
        <ul className="space-y-2">
          {caminhadas.map((c, i) => (
            <li key={c.id} className="surgir" style={{ "--i": Math.min(i, 6) } as React.CSSProperties}>
              <Link href={`/caminhada/${c.id}`} className="toque flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-deep">
                  {c.trechos.length ? (
                    <DesenhoPercurso trechos={c.trechos} largura={56} altura={56} espessura={2.5} className="h-14 w-14" />
                  ) : (
                    <IconeTenis width={22} height={22} className="text-menta" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold tabular-nums text-tinta">{formatarKm(c.distanciaM)} km</p>
                  <p className="text-xs text-tinta-2">
                    {new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(c.inicioEm))} ·{" "}
                    {formatarDuracao(c.duracaoS)} · {formatarRitmo(ritmoSPorKm(c.distanciaM, c.duracaoS))}/km
                  </p>
                </div>
                <IconeSetaDir width={16} height={16} className="text-tinta-2" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {consentindo && (
        <ConsentimentoLocalizacao
          aoAceitar={() => {
            registrarConsentimentoLocalizacao();
            setConsentindo(false);
            iniciar();
          }}
          aoFechar={() => setConsentindo(false)}
        />
      )}
    </div>
  );
}

function AvisoErro({ erro }: { erro: NonNullable<EstadoRastreio["erro"]> }) {
  const textos = {
    negado: "O acesso à localização foi negado. Libere em Ajustes do navegador → Localização para este site e tente de novo.",
    indisponivel: "Não conseguimos sinal de GPS. Tente em um lugar aberto, longe de prédios altos.",
    "sem-suporte": "Este navegador não oferece localização. Tente no Chrome ou no Safari do celular.",
  } as const;
  return <p role="alert" className="mt-3 rounded-2xl bg-alerta/10 px-4 py-3 text-sm text-alerta">{textos[erro]}</p>;
}

// ---------------- gravando / pausado ----------------

function useAgora(ativo: boolean) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    if (!ativo) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [ativo]);
  return agora;
}

function Gravando({ r }: { r: EstadoRastreio }) {
  const router = useRouter();
  const gravando = r.status === "gravando";
  const agora = useAgora(gravando);
  const segundos = Math.floor(tempoMs(r, agora) / 1000);
  const ritmo = ritmoSPorKm(r.distanciaM, segundos);

  function terminar() {
    if (r.distanciaM < 10) {
      if (window.confirm("Quase nada foi registrado. Descartar esta caminhada?")) descartar();
      return;
    }
    if (!window.confirm("Finalizar e salvar a caminhada?")) return;
    const c = finalizar();
    router.push(c ? `/caminhada/${c.id}` : "/caminhada");
  }

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col bg-brand-deep px-5 pb-8 text-white" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${gravando ? "bg-menta/20 text-menta" : "bg-white/10 text-white/70"}`}>
          {gravando && <span className="h-2 w-2 animate-pulse rounded-full bg-menta" />}
          {gravando ? "Gravando" : "Pausada"}
        </span>
        <span className="flex items-center gap-1 text-white/60">
          <IconeLocal width={14} height={14} aria-hidden />
          {r.sinal === "buscando" ? "Buscando GPS…" : r.sinal === "bom" ? "GPS bom" : r.sinal === "fraco" ? "GPS fraco" : "GPS desligado"}
        </span>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[88px] font-extrabold leading-none tracking-tight tabular-nums">{formatarKm(r.distanciaM)}</p>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-verde-claro">quilômetros</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl bg-white/[0.06] py-4">
          <p className="text-3xl font-extrabold tabular-nums">{formatarDuracao(segundos)}</p>
          <p className="mt-0.5 text-xs text-white/60">tempo</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] py-4">
          <p className="text-3xl font-extrabold tabular-nums">{formatarRitmo(ritmo)}</p>
          <p className="mt-0.5 text-xs text-white/60">ritmo /km</p>
        </div>
      </div>

      <div className="mt-6 flex flex-1 items-center justify-center">
        {r.trechos.some((t) => t.length > 1) ? (
          <DesenhoPercurso trechos={r.trechos} largura={320} altura={220} espessura={4} className="h-full max-h-56 w-full" />
        ) : (
          <p className="text-center text-sm text-white/50">{gravando ? "O desenho do percurso aparece quando você começar a andar." : "Toque em continuar quando quiser seguir."}</p>
        )}
      </div>

      {r.erro && <div className="mb-4"><AvisoErro erro={r.erro} /></div>}
      {gravando && !r.telaAcesa && (
        <p className="mb-3 text-center text-[11px] text-white/50">Não deu para manter a tela acesa: evite bloquear o celular durante a caminhada.</p>
      )}

      <div className="flex items-center justify-center gap-6">
        <button type="button" onClick={terminar} aria-label="Finalizar caminhada" className="toque flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
          <IconeParar width={24} height={24} />
        </button>
        <button
          type="button"
          onClick={gravando ? pausar : retomar}
          aria-label={gravando ? "Pausar" : "Continuar"}
          className="toque flex h-24 w-24 items-center justify-center rounded-full bg-menta text-brand-deep shadow-[0_0_0_10px_rgba(52,211,153,0.18)]"
        >
          {gravando ? <IconePausa width={34} height={34} /> : <IconePlay width={34} height={34} />}
        </button>
        <span className="h-16 w-16" aria-hidden />
      </div>
    </div>
  );
}

function ConsentimentoLocalizacao({ aoAceitar, aoFechar }: { aoAceitar: () => void; aoFechar: () => void }) {
  return (
    <div className="fundo-aparece fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="loc-titulo"
        className="folha-sobe w-full max-w-[440px] rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-claro/40 text-brand">
          <IconeLocal width={22} height={22} />
        </span>
        <h2 id="loc-titulo" className="mt-4 text-lg font-bold text-tinta">Sua localização fica com você</h2>
        <ul className="mt-3 space-y-2 text-sm text-tinta-2">
          <li>Usamos o GPS só enquanto a caminhada está gravando, para medir a distância.</li>
          <li>O percurso fica salvo só neste aparelho. Não vai para a internet.</li>
          <li>Ao compartilhar, vai uma imagem com os números e, se você quiser, só o desenho do caminho. Nunca o mapa ou o endereço.</li>
          <li>Você pode apagar o percurso de uma caminhada e manter só os números.</li>
        </ul>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={aoFechar} className="flex-1 rounded-2xl bg-superficie py-3.5 text-sm font-semibold text-tinta">
            Agora não
          </button>
          <button type="button" onClick={aoAceitar} autoFocus className="flex-[2] rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white">
            Entendi, começar
          </button>
        </div>
      </div>
    </div>
  );
}
