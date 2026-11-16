"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconeCadeado, IconeCamera, IconeFechar, IconeLixeira, IconeMais } from "./icons";
import {
  adicionarFoto,
  assinarFotos,
  listarFotos,
  prepararImagem,
  removerFoto,
  type FotoProgresso,
} from "@/lib/fotos";
import { dataLocalHoje, getConsentimentoFotos, getPerfil, registrarConsentimentoFotos } from "@/lib/storage";
import type { Regime } from "@/lib/tipos";

// Fotos de progresso do regime: comparação "início × agora" e linha do tempo.
// Tudo fica no aparelho (ver lib/fotos.ts).

const MAX_FOTOS_POR_PLANO = 60;

function diaDoPlano(dataInicio: string, dataLocal: string): number {
  const ms = new Date(`${dataLocal}T12:00:00Z`).getTime() - new Date(`${dataInicio}T12:00:00Z`).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

const dataCurta = (dataLocal: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" })
    .format(new Date(`${dataLocal}T12:00:00Z`))
    .replace(".", "");

/** Carrega as fotos do regime e recarrega quando mudam. */
function useFotos(regimeId: string) {
  const [estado, setEstado] = useState<{ fotos: FotoProgresso[]; carregando: boolean; erro: boolean }>({
    fotos: [],
    carregando: true,
    erro: false,
  });
  useEffect(() => {
    let vivo = true;
    const carregar = () =>
      listarFotos(regimeId)
        .then((fotos) => vivo && setEstado({ fotos, carregando: false, erro: false }))
        .catch(() => vivo && setEstado({ fotos: [], carregando: false, erro: true }));
    carregar();
    const sair = assinarFotos(carregar);
    return () => {
      vivo = false;
      sair();
    };
  }, [regimeId]);
  return estado;
}

/** URLs temporárias para exibir os blobs; revogadas quando a lista muda. */
function useUrls(fotos: FotoProgresso[]) {
  const urls = useMemo(() => new Map(fotos.map((f) => [f.id, URL.createObjectURL(f.imagem)])), [fotos]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return urls;
}

export default function FotosProgresso({ regime }: { regime: Regime }) {
  const { fotos, carregando, erro } = useFotos(regime.id);
  const urls = useUrls(fotos);
  const entrada = useRef<HTMLInputElement>(null);
  const [pedindoConsentimento, setPedindoConsentimento] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aberta, setAberta] = useState<FotoProgresso | null>(null);

  const cheio = fotos.length >= MAX_FOTOS_POR_PLANO;

  function pedirFoto() {
    setAviso(null);
    if (!getConsentimentoFotos()) {
      setPedindoConsentimento(true);
      return;
    }
    entrada.current?.click();
  }

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;
    setSalvando(true);
    try {
      const { imagem, largura, altura } = await prepararImagem(arquivo);
      const hoje = dataLocalHoje(getPerfil()?.fuso);
      await adicionarFoto({ regimeId: regime.id, dataLocal: hoje, imagem, largura, altura });
      setAviso("Foto salva neste aparelho.");
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "Não foi possível salvar a foto. Tente outra imagem.");
    } finally {
      setSalvando(false);
    }
  }

  const primeira = fotos[0];
  const ultima = fotos.length > 1 ? fotos[fotos.length - 1] : null;

  return (
    <section aria-labelledby="fotos-titulo" className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="fotos-titulo" className="text-sm font-bold text-tinta">Fotos de progresso</h2>
        <span className="flex items-center gap-1 text-[11px] font-medium text-tinta-2">
          <IconeCadeado width={13} height={13} aria-hidden /> Só neste aparelho
        </span>
      </div>

      <input ref={entrada} type="file" accept="image/*" className="hidden" onChange={aoEscolher} aria-hidden tabIndex={-1} />

      {carregando ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-black/5" />
      ) : erro ? (
        <p className="rounded-2xl bg-card p-5 text-center text-sm text-tinta-2 shadow-[var(--shadow-card)]">
          Este navegador não permitiu acessar as fotos salvas. Em janela anônima o armazenamento pode estar bloqueado.
        </p>
      ) : fotos.length === 0 ? (
        <button
          type="button"
          onClick={pedirFoto}
          disabled={salvando}
          className="toque flex w-full flex-col items-center rounded-[var(--radius-card)] border border-dashed border-brand/30 bg-card px-6 py-7 text-center shadow-[var(--shadow-card)]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-claro/40 text-brand">
            <IconeCamera width={24} height={24} />
          </span>
          <span className="mt-3 text-base font-bold text-tinta">{salvando ? "Salvando…" : "Registre como você começou"}</span>
          <span className="mt-1 max-w-xs text-sm text-tinta-2">
            Uma foto agora vira o seu “antes”. Daqui a algumas semanas, compare lado a lado.
          </span>
        </button>
      ) : (
        <>
          {primeira && ultima && (
            <Comparador
              antes={{ url: urls.get(primeira.id)!, rotulo: `Início · ${dataCurta(primeira.dataLocal)}` }}
              depois={{ url: urls.get(ultima.id)!, rotulo: `Agora · Dia ${diaDoPlano(regime.dataInicio, ultima.dataLocal)}` }}
            />
          )}

          <ul className="scroll-limpo -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Todas as fotos">
            {fotos.map((f, i) => (
              <li key={f.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setAberta(f)}
                  aria-label={`Abrir foto do dia ${diaDoPlano(regime.dataInicio, f.dataLocal)}`}
                  className="toque relative block h-28 w-20 overflow-hidden rounded-2xl bg-black/5 shadow-[var(--shadow-card)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urls.get(f.id)} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4 text-[10px] font-semibold text-white">
                    {i === 0 ? "Início" : `Dia ${diaDoPlano(regime.dataInicio, f.dataLocal)}`}
                  </span>
                </button>
              </li>
            ))}
            {!cheio && (
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={pedirFoto}
                  disabled={salvando}
                  aria-label="Adicionar foto"
                  className="toque flex h-28 w-20 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-brand/30 text-brand"
                >
                  <IconeMais width={20} height={20} />
                  <span className="text-[11px] font-semibold">{salvando ? "Salvando" : "Nova"}</span>
                </button>
              </li>
            )}
          </ul>
          {fotos.length === 1 && (
            <p className="mt-2 text-xs text-tinta-2">Adicione outra foto mais para frente para comparar com o início.</p>
          )}
        </>
      )}

      {aviso && (
        <p role="status" className="mt-2 text-xs text-tinta-2">
          {aviso}
        </p>
      )}

      {pedindoConsentimento && (
        <Consentimento
          aoAceitar={() => {
            registrarConsentimentoFotos();
            setPedindoConsentimento(false);
            entrada.current?.click();
          }}
          aoFechar={() => setPedindoConsentimento(false)}
        />
      )}

      {aberta && urls.get(aberta.id) && (
        <VisualizadorFoto
          url={urls.get(aberta.id)!}
          titulo={`Dia ${diaDoPlano(regime.dataInicio, aberta.dataLocal)} · ${dataCurta(aberta.dataLocal)}`}
          aoRemover={async () => {
            await removerFoto(aberta.id);
            setAberta(null);
          }}
          aoFechar={() => setAberta(null)}
        />
      )}
    </section>
  );
}

/** Antes × depois sobrepostos, com divisor arrastável. */
function Comparador({ antes, depois }: { antes: { url: string; rotulo: string }; depois: { url: string; rotulo: string } }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="surgir relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-card)] bg-black shadow-[var(--shadow-card)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={depois.url} alt={`Foto mais recente, ${depois.rotulo}`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={antes.url} alt={`Foto do início, ${antes.rotulo}`} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.4)]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </span>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        {antes.rotulo}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        {depois.rotulo}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Arraste para comparar o início com agora"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

function Consentimento({ aoAceitar, aoFechar }: { aoAceitar: () => void; aoFechar: () => void }) {
  return (
    <div className="fundo-aparece fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-titulo"
        className="folha-sobe w-full max-w-[440px] rounded-t-[28px] bg-card p-6 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-claro/40 text-brand">
          <IconeCadeado width={22} height={22} />
        </span>
        <h2 id="consent-titulo" className="mt-4 text-lg font-bold text-tinta">Suas fotos ficam com você</h2>
        <ul className="mt-3 space-y-2 text-sm text-tinta-2">
          <li>As fotos são salvas só neste aparelho. Não vão para a internet nem para outras pessoas.</li>
          <li>Removemos os dados escondidos da imagem, como a localização onde foi tirada.</li>
          <li>Você apaga uma foto quando quiser, ou tudo de uma vez em Privacidade e dados.</li>
          <li>Se você limpar os dados do navegador, as fotos também são apagadas.</li>
        </ul>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={aoFechar} className="flex-1 rounded-2xl bg-superficie py-3.5 text-sm font-semibold text-tinta">
            Agora não
          </button>
          <button type="button" onClick={aoAceitar} autoFocus className="flex-[2] rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white">
            Entendi, escolher foto
          </button>
        </div>
      </div>
    </div>
  );
}

function VisualizadorFoto({
  url,
  titulo,
  aoRemover,
  aoFechar,
}: {
  url: string;
  titulo: string;
  aoRemover: () => void;
  aoFechar: () => void;
}) {
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} className="fundo-aparece fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-white" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <button type="button" onClick={aoFechar} aria-label="Fechar" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <IconeFechar width={18} height={18} />
        </button>
        <span className="text-sm font-semibold">{titulo}</span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Apagar esta foto? Não dá para desfazer.")) aoRemover();
          }}
          aria-label="Apagar foto"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#FFB4B6]"
        >
          <IconeLixeira width={18} height={18} />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4" onClick={aoFechar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={titulo} className="surgir max-h-full max-w-full rounded-2xl object-contain" />
      </div>
    </div>
  );
}
