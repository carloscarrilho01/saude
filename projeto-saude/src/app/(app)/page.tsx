"use client";

import { useState } from "react";
import Link from "next/link";
import AnelProgresso from "@/components/AnelProgresso";
import ModalRegistrarAgua from "@/components/ModalRegistrarAgua";
import { IconeGota, IconeGarfo, IconeFogo, IconePessoa, IconeMais, IconeCheck, IconeRefeicao } from "@/components/icons";
import { FolhaCard } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import {
  getPerfil,
  getMeta,
  totalAguaDia,
  getRegistrosAgua,
  consumoUltimosDias,
  getRegimeAtivo,
  getRefeicoesPlanejadas,
  getTodasConclusoes,
  getTodosItensDiario,
  alternarConclusao,
  dataLocalHoje,
  getConfigLembretes,
} from "@/lib/storage";
import { formatarLitros, percentualMeta } from "@/lib/hidratacao";
import { aderenciaDoDia, refeicaoConcluida } from "@/lib/aderencia";
import { proximoLembrete } from "@/lib/lembretes";
import { nomeRefeicao } from "@/lib/refeicoes";
import { saudacao, dataExtenso } from "@/lib/datas";

export default function Dashboard() {
  const pronto = useStorePronto();
  const [modalAberto, setModalAberto] = useState(false);

  if (!pronto) return <EsqueletoDashboard />;

  const perfil = getPerfil();
  const meta = getMeta();
  const metaMl = meta?.metaMl ?? 2000;
  const consumido = totalAguaDia();
  const pct = percentualMeta(consumido, metaMl);
  const registros = getRegistrosAgua();
  const ultimo = registros[0];
  const streak = calcularStreak(metaMl, perfil?.fuso);
  const bateuMeta = consumido >= metaMl;

  const primeiroNome = (perfil?.nome ?? "Você").split(" ")[0];

  // dados de alimentação do regime ativo
  const fuso = perfil?.fuso;
  const hoje = dataLocalHoje(fuso);
  const regime = getRegimeAtivo();
  const refeicoes = regime ? getRefeicoesPlanejadas(regime.id) : [];
  const conclusoes = getTodasConclusoes();
  const itensDiario = getTodosItensDiario();
  const ader = aderenciaDoDia(refeicoes, hoje, conclusoes, itensDiario);

  const prox = proximoLembrete(getConfigLembretes(), fuso);

  return (
    <div className="px-5 pb-6 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      {/* Cabeçalho */}
      <header className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-tinta-2">{dataExtenso(perfil?.fuso)}</p>
          <h1 className="mt-0.5 text-[26px] font-extrabold leading-tight text-tinta">
            {saudacao(perfil?.fuso)}, {primeiroNome}.
          </h1>
        </div>
        <Link
          href="/perfil"
          aria-label="Perfil"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-verde-claro/40 text-brand"
        >
          <IconePessoa />
        </Link>
      </header>

      {/* Card de hidratação */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-card)] p-5 text-white shadow-[var(--shadow-card)]"
        style={{
          background:
            "radial-gradient(120% 120% at 100% 0%, #1e6b4a 0%, #143d2b 55%)",
        }}
      >
        <FolhaCard />
        <div className="relative mb-4 flex items-center gap-2 text-white/80">
          <IconeGota width={20} height={20} />
          <span className="text-sm font-semibold uppercase tracking-wide">Hidratação</span>
        </div>

        <div className="relative flex items-center gap-5">
          <AnelProgresso percentual={pct} tamanho={128} espessura={12}>
            <span className="text-2xl font-extrabold">{pct}%</span>
            <span className="text-[11px] text-white/70">da meta</span>
          </AnelProgresso>
          <div className="flex-1">
            <p className="text-4xl font-extrabold leading-none">{formatarLitros(consumido)}</p>
            <p className="mt-1 text-sm text-white/70">de {formatarLitros(metaMl)} diários</p>
            {ultimo ? (
              <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
                + {ultimo.quantidadeMl} ml no último registro
              </span>
            ) : (
              <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
                Nenhum registro hoje
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/12 py-3.5 text-sm font-semibold backdrop-blur active:scale-[.99]"
        >
          <IconeMais width={18} height={18} /> Registrar consumo de água
        </button>

        {bateuMeta && (
          <p className="mt-3 text-center text-xs font-medium text-menta-soft">
            🎉 Meta do dia atingida! Mandou bem.
          </p>
        )}
      </section>

      {/* Próximo lembrete */}
      {prox && (
        <Link
          href="/lembretes"
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-card px-4 py-2.5 text-sm text-tinta-2 shadow-[var(--shadow-card)]"
        >
          🔔 Próximo lembrete {prox.amanha ? "amanhã" : "hoje"} às{" "}
          <strong className="text-tinta">{prox.horario}</strong>
        </Link>
      )}

      {/* Cards de métrica */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <CartaoMetrica
          icone={<IconeGarfo width={22} height={22} />}
          titulo="Alimentação"
          destaque={regime && refeicoes.length > 0 ? `${ader.concluidas} de ${ader.total}` : "—"}
          sub={regime && refeicoes.length > 0 ? "refeições concluídas" : "Crie um plano"}
          href={regime ? `/planos/${regime.id}` : "/planos"}
        />
        <CartaoMetrica
          icone={<IconeFogo width={22} height={22} />}
          titulo="Consistência"
          destaque={`${streak} ${streak === 1 ? "dia" : "dias"}`}
          sub="Sua sequência atual"
        />
      </section>

      {/* Sua rotina */}
      <section className="mt-4 rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">Sua rotina</h2>
          <Link href="/diario" className="text-sm font-semibold text-brand">
            Ver diário
          </Link>
        </div>

        {regime && refeicoes.length > 0 ? (
          <ul className="space-y-1">
            {refeicoes.map((r) => {
              const concluida = refeicaoConcluida(r.id, hoje, conclusoes, itensDiario);
              return (
                <li key={r.id} className="flex items-center gap-3 py-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-verde-claro/30 text-brand">
                    <IconeRefeicao tipo={r.tipo} width={20} height={20} />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-tinta">{nomeRefeicao(r.tipo)}</span>
                  <button
                    onClick={() => alternarConclusao(r.id, hoje)}
                    aria-label={concluida ? "Desmarcar" : "Marcar como concluída"}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                      concluida ? "border-brand bg-brand text-white" : "border-black/15 text-transparent"
                    }`}
                  >
                    <IconeCheck width={14} height={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl bg-superficie p-5 text-center">
            <p className="text-sm text-tinta-2">
              Você ainda não tem um plano ativo. Crie um regime para montar sua rotina de refeições.
            </p>
            <Link href="/planos" className="mt-3 inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
              Criar plano
            </Link>
          </div>
        )}
      </section>

      <ModalRegistrarAgua aberto={modalAberto} aoFechar={() => setModalAberto(false)} />
    </div>
  );
}

function CartaoMetrica({
  icone,
  titulo,
  destaque,
  sub,
  href,
}: {
  icone: React.ReactNode;
  titulo: string;
  destaque: string;
  sub: string;
  href?: string;
}) {
  const conteudo = (
    <div className="h-full rounded-[var(--radius-card)] bg-card p-4 shadow-[var(--shadow-card)]">
      <span className="text-brand">{icone}</span>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">{titulo}</p>
      <p className="mt-0.5 text-2xl font-extrabold text-tinta">{destaque}</p>
      <p className="text-xs text-tinta-2">{sub}</p>
    </div>
  );
  return href ? <Link href={href}>{conteudo}</Link> : conteudo;
}

/** Dias consecutivos (terminando hoje ou ontem) em que a meta foi batida. */
function calcularStreak(metaMl: number, fuso?: string): number {
  const dias = consumoUltimosDias(60, fuso);
  let streak = 0;
  for (let i = dias.length - 1; i >= 0; i--) {
    const bateu = dias[i].totalMl >= metaMl;
    if (bateu) {
      streak++;
    } else if (i === dias.length - 1) {
      // hoje ainda não bateu: não zera a sequência anterior, só não conta hoje
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function EsqueletoDashboard() {
  return (
    <div className="px-5 pt-8">
      <div className="mb-5 h-8 w-48 animate-pulse rounded-lg bg-black/5" />
      <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-black/5" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-black/5" />
        <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-black/5" />
      </div>
    </div>
  );
}
