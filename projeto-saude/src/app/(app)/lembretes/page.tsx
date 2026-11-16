"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconeSetaEsq, IconeGota, IconeCheck } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import { getConfigLembretes, atualizarConfigLembretes, getPerfil } from "@/lib/storage";
import { DIAS_LABEL, proximoLembrete } from "@/lib/lembretes";
import {
  estadoPermissao,
  pedirPermissao,
  registrarServiceWorker,
  mostrarLembrete,
} from "@/lib/notificacoes";
import type { DiaSemana } from "@/lib/tipos";

const INTERVALOS = [
  { min: 60, rotulo: "A cada 1 hora" },
  { min: 90, rotulo: "A cada 1h30" },
  { min: 120, rotulo: "A cada 2 horas" },
  { min: 180, rotulo: "A cada 3 horas" },
];

export default function PaginaLembretes() {
  const pronto = useStorePronto();
  const router = useRouter();
  const [, forcar] = useState(0);

  if (!pronto) return <div className="p-6 text-tinta-2">Carregando…</div>;

  const config = getConfigLembretes();
  const fuso = getPerfil()?.fuso;
  const permissao = estadoPermissao();
  const prox = proximoLembrete(config, fuso);

  async function alternarAtivo(valor: boolean) {
    if (valor) {
      const p = await pedirPermissao();
      if (p === "granted") {
        await registrarServiceWorker();
        atualizarConfigLembretes({ ativo: true });
      } else {
        atualizarConfigLembretes({ ativo: false });
      }
    } else {
      atualizarConfigLembretes({ ativo: false });
    }
    forcar((n) => n + 1);
  }

  function alternarDia(dia: DiaSemana) {
    const tem = config.diasSemana.includes(dia);
    const novos = tem
      ? config.diasSemana.filter((d) => d !== dia)
      : [...config.diasSemana, dia];
    atualizarConfigLembretes({ diasSemana: novos });
  }

  const semPermissao = permissao === "denied" || permissao === "indisponivel";

  return (
    <div className="relative px-5 pb-10 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} aria-label="Voltar" className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-2 hover:bg-black/5">
          <IconeSetaEsq width={20} height={20} />
        </button>
        <h1 className="text-xl font-extrabold text-tinta">Lembretes</h1>
      </header>

      {/* aviso de permissão negada/indisponível */}
      {semPermissao && (
        <div className="mb-4 rounded-2xl bg-alerta/10 p-4 text-sm text-alerta">
          {permissao === "indisponivel"
            ? "Este navegador não suporta notificações. No iPhone, adicione o app à tela inicial para ativá-las."
            : "As notificações estão bloqueadas. Permita notificações nas configurações do navegador para receber lembretes."}
        </div>
      )}

      {/* toggle principal */}
      <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-card)]">
        <span className="flex items-center gap-2 font-semibold text-tinta">
          <IconeGota width={20} height={20} className="text-brand" /> Ativar lembretes
        </span>
        <Interruptor ativo={config.ativo} aoMudar={alternarAtivo} />
      </div>

      {config.ativo && prox && (
        <p className="mt-2 text-center text-xs text-tinta-2">
          Próximo lembrete {prox.amanha ? "amanhã" : "hoje"} às <strong>{prox.horario}</strong>
        </p>
      )}

      {/* frequência */}
      <Secao titulo="Frequência">
        <div className="space-y-2">
          {INTERVALOS.map((i) => (
            <button
              key={i.min}
              onClick={() => atualizarConfigLembretes({ intervaloMin: i.min })}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                config.intervaloMin === i.min ? "bg-brand text-white" : "bg-superficie text-tinta"
              }`}
            >
              {i.rotulo}
              {config.intervaloMin === i.min && <IconeCheck width={16} height={16} aria-hidden />}
            </button>
          ))}
        </div>
      </Secao>

      {/* período */}
      <Secao titulo="Período ativo">
        <div className="flex items-center justify-between gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-xs text-tinta-2">Início</span>
            <input
              type="time"
              value={config.horaInicio}
              onChange={(e) => atualizarConfigLembretes({ horaInicio: e.target.value })}
              className="w-full rounded-xl bg-superficie px-3 py-2.5 text-tinta outline-none"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs text-tinta-2">Fim</span>
            <input
              type="time"
              value={config.horaFim}
              onChange={(e) => atualizarConfigLembretes({ horaFim: e.target.value })}
              className="w-full rounded-xl bg-superficie px-3 py-2.5 text-tinta outline-none"
            />
          </label>
        </div>
      </Secao>

      {/* dias da semana */}
      <Secao titulo="Dias da semana">
        <div className="flex flex-wrap gap-2">
          {DIAS_LABEL.map((d) => {
            const ativo = config.diasSemana.includes(d.valor);
            return (
              <button
                key={d.valor}
                onClick={() => alternarDia(d.valor)}
                className={`h-10 w-12 rounded-xl text-sm font-semibold transition ${
                  ativo ? "bg-brand text-white" : "bg-superficie text-tinta-2"
                }`}
              >
                {d.curto}
              </button>
            );
          })}
        </div>
      </Secao>

      {/* pausar após meta */}
      <label className="mt-4 flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-card)]">
        <span className="text-sm text-tinta">Pausar ao atingir a meta do dia</span>
        <Interruptor
          ativo={config.pausarAposMeta}
          aoMudar={(v) => atualizarConfigLembretes({ pausarAposMeta: v })}
        />
      </label>

      {/* prévia */}
      <Secao titulo="Exemplo de notificação">
        <div className="flex items-center gap-3 rounded-xl bg-superficie p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
            <IconeGota width={20} height={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-tinta">Hora de se hidratar</p>
            <p className="text-xs text-tinta-2">Beba cerca de 300 ml de água agora.</p>
          </div>
        </div>
        {config.ativo && permissao === "granted" && (
          <button
            onClick={() => mostrarLembrete("Este é um lembrete de teste.")}
            className="mt-3 w-full rounded-xl border border-brand/30 py-2.5 text-sm font-semibold text-brand"
          >
            Enviar notificação de teste
          </button>
        )}
      </Secao>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-tinta-2">
        Nesta versão, os lembretes tocam enquanto o app está aberto ou instalado na tela inicial.
        Lembretes com o app totalmente fechado chegam na fase com servidor de notificações.
      </p>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">{titulo}</h2>
      <div className="rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]">{children}</div>
    </section>
  );
}

function Interruptor({ ativo, aoMudar }: { ativo: boolean; aoMudar: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={ativo}
      onClick={() => aoMudar(!ativo)}
      className={`relative h-7 w-12 rounded-full transition-colors ${ativo ? "bg-brand" : "bg-black/15"}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          ativo ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
