"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconeSetaEsq } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { getPerfil, getMeta, salvarPerfil, salvarMeta, fusoDoNavegador } from "@/lib/storage";
import { calcularMeta, formatarLitros, emCopos, FAIXA_PROVISORIA } from "@/lib/hidratacao";
import { ATIVIDADES, CLIMAS, SEXOS, LIMITES, lerNumero, dentro } from "@/lib/perfilOpcoes";
import type { Clima, MetodoMeta, NivelAtividade, Sexo } from "@/lib/tipos";

// Tela "Meus dados e meta": edita o perfil e recalcula a estimativa de água.
// O layout (app) só renderiza filhos com perfil carregado no cliente.

export default function PaginaMeusDados() {
  const router = useRouter();
  const perfil = getPerfil();
  const meta = getMeta();

  const [nome, setNome] = useState(perfil?.nome ?? "");
  const [peso, setPeso] = useState(perfil?.pesoKg?.toString().replace(".", ",") ?? "");
  const [altura, setAltura] = useState(perfil?.alturaCm?.toString().replace(".", ",") ?? "");
  const [idade, setIdade] = useState(perfil?.idade?.toString() ?? "");
  const [sexo, setSexo] = useState<Sexo | "">(perfil?.sexo ?? "");
  const [atividade, setAtividade] = useState<NivelAtividade>(perfil?.nivelAtividade ?? "moderado");
  const [clima, setClima] = useState<Clima>(perfil?.clima ?? "ameno");
  const [metodo, setMetodo] = useState<MetodoMeta>(meta?.metodo ?? "auto");
  const [metaManual, setMetaManual] = useState(
    meta?.metodo === "manual" ? String(meta.metaMl) : "",
  );

  const pesoNum = lerNumero(peso);
  const alturaNum = altura ? lerNumero(altura) : undefined;
  const idadeNum = idade ? lerNumero(idade) : undefined;
  const metaManualNum = lerNumero(metaManual);

  const erros = {
    peso: !dentro(pesoNum, LIMITES.pesoKg) ? `Informe um peso entre ${LIMITES.pesoKg.min} e ${LIMITES.pesoKg.max} kg.` : null,
    altura:
      altura && !dentro(alturaNum, LIMITES.alturaCm)
        ? `Altura entre ${LIMITES.alturaCm.min} e ${LIMITES.alturaCm.max} cm.`
        : null,
    idade:
      idade && !(dentro(idadeNum, LIMITES.idade) && Number.isInteger(idadeNum))
        ? `Idade entre ${LIMITES.idade.min} e ${LIMITES.idade.max} anos.`
        : null,
    meta:
      metodo === "manual" && !dentro(metaManualNum, LIMITES.metaManualMl)
        ? `Informe uma meta entre ${LIMITES.metaManualMl.min} e ${LIMITES.metaManualMl.max} ml.`
        : null,
  };
  const valido = !Object.values(erros).some(Boolean);

  const calculo = dentro(pesoNum, LIMITES.pesoKg)
    ? calcularMeta({ pesoKg: pesoNum, idade: idadeNum, nivelAtividade: atividade, clima })
    : null;
  const metaFinalMl = metodo === "manual" ? metaManualNum : calculo?.metaMl;
  const foraDaFaixa =
    metaFinalMl != null && (metaFinalMl < FAIXA_PROVISORIA.minMl || metaFinalMl > FAIXA_PROVISORIA.maxMl);

  function salvar() {
    if (!valido || !perfil || pesoNum == null || metaFinalMl == null || !calculo) return;
    salvarPerfil({
      ...perfil,
      nome: nome.trim() || "Você",
      pesoKg: pesoNum,
      alturaCm: alturaNum,
      idade: idadeNum,
      sexo: sexo || undefined,
      nivelAtividade: atividade,
      clima,
      fuso: perfil.fuso || fusoDoNavegador(),
    });
    const mudouMeta = !meta || meta.metaMl !== metaFinalMl || meta.metodo !== metodo;
    if (mudouMeta) {
      salvarMeta({
        metaMl: Math.round(metaFinalMl),
        metodo,
        coeficienteIdade: calculo.coeficienteIdade,
        ajusteAtividadeMl: metodo === "auto" ? calculo.ajusteAtividadeMl : 0,
        ajusteClimaMl: metodo === "auto" ? calculo.ajusteClimaMl : 0,
        validoDesde: new Date().toISOString(),
      });
    }
    router.push("/perfil");
  }

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-5 flex items-center">
        <Link href="/perfil" aria-label="Voltar ao perfil" className="-ml-1 rounded-full p-1.5 text-tinta">
          <IconeSetaEsq width={22} height={22} />
        </Link>
        <h1 className="flex-1 pr-8 text-center text-xl font-extrabold text-tinta">Meus dados e meta</h1>
      </header>

      <Secao titulo="Dados pessoais">
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)]">
          <Linha rotulo="Nome" id="nome">
            <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="given-name"
              placeholder="Como quer ser chamado?" className={inputCls + " w-44"} />
          </Linha>
          <Linha rotulo="Peso" id="peso" sufixo="kg">
            <input id="peso" value={peso} onChange={(e) => setPeso(e.target.value)} inputMode="decimal"
              aria-invalid={!!erros.peso} className={inputCls + " w-16"} />
          </Linha>
          <Linha rotulo="Altura" id="altura" sufixo="cm">
            <input id="altura" value={altura} onChange={(e) => setAltura(e.target.value)} inputMode="decimal"
              aria-invalid={!!erros.altura} placeholder="—" className={inputCls + " w-16"} />
          </Linha>
          <Linha rotulo="Idade" id="idade" sufixo="anos">
            <input id="idade" value={idade} onChange={(e) => setIdade(e.target.value)} inputMode="numeric"
              aria-invalid={!!erros.idade} placeholder="—" className={inputCls + " w-14"} />
          </Linha>
          <Linha rotulo="Sexo" id="sexo" ultima>
            <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value as Sexo | "")}
              className="bg-transparent text-right text-tinta outline-none">
              <option value="">Prefiro não informar</option>
              {SEXOS.map((s) => <option key={s.valor} value={s.valor}>{s.nome}</option>)}
            </select>
          </Linha>
        </div>
        <Erros lista={[erros.peso, erros.altura, erros.idade]} />
      </Secao>

      <Secao titulo="Nível de atividade">
        <div className="grid grid-cols-2 gap-2">
          {ATIVIDADES.map((a) => (
            <button key={a.valor} type="button" aria-pressed={atividade === a.valor} onClick={() => setAtividade(a.valor)}
              className={`rounded-2xl border p-3 text-left transition ${atividade === a.valor ? "border-brand bg-brand/5" : "border-black/5 bg-card"}`}>
              <span className="block text-sm font-semibold text-tinta">{a.nome}</span>
              <span className="block text-[11px] text-tinta-2">{a.desc}</span>
            </button>
          ))}
        </div>
      </Secao>

      <Secao titulo="Clima onde você vive">
        <div className="flex gap-2">
          {CLIMAS.map((c) => (
            <button key={c.valor} type="button" aria-pressed={clima === c.valor} onClick={() => setClima(c.valor)}
              className={`flex-1 rounded-2xl border py-2.5 text-sm font-medium transition ${clima === c.valor ? "border-brand bg-brand/5 text-brand" : "border-black/5 bg-card text-tinta-2"}`}>
              {c.nome}
            </button>
          ))}
        </div>
      </Secao>

      <Secao titulo="Meta diária de água">
        <div className="rounded-[var(--radius-card)] bg-brand-deep p-5 text-white shadow-[var(--shadow-float)]">
          <div role="radiogroup" aria-label="Como definir a meta" className="flex rounded-xl bg-white/10 p-1 text-sm font-semibold">
            {([["auto", "Calcular por mim"], ["manual", "Definir eu mesmo"]] as const).map(([v, r]) => (
              <button key={v} type="button" role="radio" aria-checked={metodo === v} onClick={() => setMetodo(v)}
                className={`flex-1 rounded-lg py-2 transition ${metodo === v ? "bg-white text-brand-deep" : "text-white/75"}`}>
                {r}
              </button>
            ))}
          </div>

          {metodo === "auto" ? (
            <div className="mt-5">
              <p className="text-4xl font-extrabold tabular-nums">{calculo ? formatarLitros(calculo.metaMl) : "—"}</p>
              {calculo && (
                <p className="mt-1 text-sm text-verde-claro">
                  ≈ {emCopos(calculo.metaMl)} copos · {calculo.coeficienteIdade} ml/kg
                  {calculo.ajusteAtividadeMl > 0 && ` + ${calculo.ajusteAtividadeMl} ml atividade`}
                  {calculo.ajusteClimaMl > 0 && ` + ${calculo.ajusteClimaMl} ml clima`}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <label htmlFor="metaManual" className="text-sm text-verde-claro">Sua meta (ml por dia)</label>
              <div className="mt-1 flex items-baseline gap-2">
                <input id="metaManual" value={metaManual} onChange={(e) => setMetaManual(e.target.value)} inputMode="numeric"
                  placeholder={calculo ? String(calculo.metaMl) : "2000"} aria-invalid={!!erros.meta}
                  className="w-32 rounded-lg bg-white/10 px-3 py-1.5 text-3xl font-extrabold tabular-nums text-white outline-none placeholder:text-white/30 focus:ring-2 focus:ring-menta" />
                <span className="text-lg font-semibold text-white/70">ml</span>
              </div>
              {erros.meta && <p className="mt-2 text-xs text-[#FFB4B6]">{erros.meta}</p>}
            </div>
          )}
        </div>

        {foraDaFaixa && (
          <p className="mt-3 rounded-xl bg-alerta/10 px-4 py-3 text-xs text-alerta">
            Essa meta está fora da faixa usual ({formatarLitros(FAIXA_PROVISORIA.minMl, 1)}–{formatarLitros(FAIXA_PROVISORIA.maxMl, 1)}). Vale confirmar com um profissional de saúde.
          </p>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-tinta-2">
          A meta é uma <strong>estimativa</strong> de apoio ao hábito, não uma recomendação médica.
        </p>
      </Secao>

      <button type="button" onClick={salvar} disabled={!valido}
        className="mt-6 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-[0_10px_30px_-12px_rgba(19,38,30,0.6)] transition active:scale-[.99] disabled:opacity-40">
        Salvar alterações
      </button>
    </div>
  );
}

const inputCls = "bg-transparent text-right text-tinta outline-none placeholder:text-tinta-2/60";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 first-of-type:mt-0">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">{titulo}</h2>
      {children}
    </section>
  );
}

function Linha({ rotulo, id, sufixo, ultima, children }: {
  rotulo: string; id: string; sufixo?: string; ultima?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 focus-within:bg-brand/[0.03] ${ultima ? "" : "border-b border-black/5"}`}>
      <label htmlFor={id} className="text-sm text-tinta">{rotulo}</label>
      <span className="flex items-baseline gap-1.5">
        {children}
        {sufixo && <span className="text-sm text-tinta-2">{sufixo}</span>}
      </span>
    </div>
  );
}

function Erros({ lista }: { lista: (string | null)[] }) {
  const reais = lista.filter(Boolean);
  if (!reais.length) return null;
  return (
    <ul className="mt-2 space-y-0.5" aria-live="polite">
      {reais.map((e) => <li key={e} className="text-xs text-alerta">{e}</li>)}
    </ul>
  );
}
