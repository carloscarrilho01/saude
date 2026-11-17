"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoSaude, FundoFolhas } from "@/components/decor";
import { calcularMeta, formatarLitros, emCopos } from "@/lib/hidratacao";
import { salvarPerfil, salvarMeta, fusoDoNavegador, getPlanoPendente } from "@/lib/storage";
import type { NivelAtividade, Sexo, Clima } from "@/lib/tipos";
import { ATIVIDADES, CLIMAS } from "@/lib/perfilOpcoes";

type Etapa = "boas-vindas" | "dados" | "resultado";

export default function Onboarding() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("boas-vindas");

  // campos
  const [nome, setNome] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState<Sexo | "">("");
  const [atividade, setAtividade] = useState<NivelAtividade>("moderado");
  const [clima, setClima] = useState<Clima>("ameno");

  const pesoNum = parseFloat(peso.replace(",", "."));
  const idadeNum = idade ? parseInt(idade, 10) : undefined;
  const pesoValido = !Number.isNaN(pesoNum) && pesoNum >= 20 && pesoNum <= 300;

  const resultado = pesoValido
    ? calcularMeta({ pesoKg: pesoNum, idade: idadeNum, nivelAtividade: atividade, clima })
    : null;

  function concluir() {
    if (!resultado) return;
    const agora = new Date().toISOString();
    salvarPerfil({
      nome: nome.trim() || "Você",
      pesoKg: pesoNum,
      alturaCm: altura ? parseFloat(altura.replace(",", ".")) : undefined,
      idade: idadeNum,
      sexo: sexo || undefined,
      nivelAtividade: atividade,
      clima,
      unidade: "ml",
      fuso: fusoDoNavegador(),
      criadoEm: agora,
    });
    salvarMeta({
      metaMl: resultado.metaMl,
      metodo: "auto",
      coeficienteIdade: resultado.coeficienteIdade,
      ajusteAtividadeMl: resultado.ajusteAtividadeMl,
      ajusteClimaMl: resultado.ajusteClimaMl,
      validoDesde: agora,
    });
    // chegou por um link de plano compartilhado? volta para ele
    router.push(getPlanoPendente() ? "/importar" : "/inicio");
  }

  return (
    <div
      className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-6 pb-10 pt-12"
      style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}
    >
      {etapa === "boas-vindas" && <FundoFolhas />}

      {etapa === "boas-vindas" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 drop-shadow-sm">
            <LogoSaude size={104} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand">Orvalho</h1>
          <p className="mt-3 max-w-xs text-tinta-2">
            Hidratação, alimentação e hábitos saudáveis em um só lugar.
          </p>
          <button
            onClick={() => setEtapa("dados")}
            className="mt-10 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-[0_10px_30px_-12px_rgba(19,38,30,0.6)] active:scale-[.99]"
          >
            Começar
          </button>
          <button
            onClick={() => router.push("/inicio")}
            className="mt-4 text-sm font-medium text-tinta-2"
          >
            Já tenho uma conta
          </button>
        </div>
      )}

      {etapa === "dados" && (
        <div className="flex flex-1 flex-col">
          <ProgressoPontos ativo={1} total={2} />
          <h2 className="mt-6 text-2xl font-extrabold text-tinta">Vamos começar?</h2>
          <p className="mt-1 text-sm text-tinta-2">
            Informe seus dados para calcular sua meta diária de água.
          </p>

          <div className="mt-6 space-y-3">
            <Campo label="Nome" sufixo="">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="w-full bg-transparent text-right text-tinta outline-none placeholder:text-tinta-2/60"
              />
            </Campo>
            <Campo label="Peso" sufixo="kg">
              <input
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                inputMode="decimal"
                placeholder="70"
                className="w-20 bg-transparent text-right text-tinta outline-none placeholder:text-tinta-2/60"
              />
            </Campo>
            <Campo label="Altura" sufixo="cm">
              <input
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                inputMode="decimal"
                placeholder="168"
                className="w-20 bg-transparent text-right text-tinta outline-none placeholder:text-tinta-2/60"
              />
            </Campo>
            <Campo label="Idade" sufixo="anos">
              <input
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                inputMode="numeric"
                placeholder="29"
                className="w-16 bg-transparent text-right text-tinta outline-none placeholder:text-tinta-2/60"
              />
            </Campo>
            <Campo label="Sexo" sufixo="">
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value as Sexo)}
                className="bg-transparent text-right text-tinta outline-none"
              >
                <option value="">—</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </Campo>
          </div>

          <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">
            Nível de atividade
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ATIVIDADES.map((a) => (
              <button
                key={a.valor}
                onClick={() => setAtividade(a.valor)}
                className={`rounded-2xl border p-3 text-left transition ${
                  atividade === a.valor
                    ? "border-brand bg-brand/5"
                    : "border-black/5 bg-card"
                }`}
              >
                <span className="block text-sm font-semibold text-tinta">{a.nome}</span>
                <span className="block text-[11px] text-tinta-2">{a.desc}</span>
              </button>
            ))}
          </div>

          <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">
            Clima onde você vive
          </p>
          <div className="flex gap-2">
            {CLIMAS.map((c) => (
              <button
                key={c.valor}
                onClick={() => setClima(c.valor)}
                className={`flex-1 rounded-2xl border py-2.5 text-sm font-medium transition ${
                  clima === c.valor ? "border-brand bg-brand/5 text-brand" : "border-black/5 bg-card text-tinta-2"
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>

          <button
            disabled={!pesoValido}
            onClick={() => setEtapa("resultado")}
            className="mt-8 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-[0_10px_30px_-12px_rgba(19,38,30,0.6)] transition active:scale-[.99] disabled:opacity-40"
          >
            Calcular minha meta
          </button>
          {!pesoValido && peso !== "" && (
            <p className="mt-2 text-center text-xs text-alerta">Informe um peso entre 20 e 300 kg.</p>
          )}
        </div>
      )}

      {etapa === "resultado" && resultado && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-tinta-2">
            Sua estimativa diária
          </p>
          <p className="mt-3 text-6xl font-extrabold text-brand">
            {formatarLitros(resultado.metaMl)}
          </p>
          <p className="mt-2 text-tinta-2">≈ {emCopos(resultado.metaMl)} copos de 250 ml por dia</p>

          <div className="mt-6 w-full rounded-[var(--radius-card)] bg-card p-5 text-left shadow-[var(--shadow-card)]">
            <LinhaResumo rotulo="Base pelo peso/idade" valor={formatarLitros(resultado.baseMl)} />
            {resultado.ajusteAtividadeMl > 0 && (
              <LinhaResumo rotulo="Atividade física" valor={`+${resultado.ajusteAtividadeMl} ml`} />
            )}
            {resultado.ajusteClimaMl > 0 && (
              <LinhaResumo rotulo="Clima" valor={`+${resultado.ajusteClimaMl} ml`} />
            )}
          </div>

          {resultado.foraDaFaixa && (
            <p className="mt-4 rounded-xl bg-alerta/10 px-4 py-3 text-xs text-alerta">
              Essa estimativa está fora da faixa usual. Vale confirmar com um profissional de saúde.
            </p>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-tinta-2">
            Esta é uma <strong>estimativa</strong> de apoio ao hábito de hidratação, não uma
            recomendação médica. Pessoas com condições específicas devem consultar um profissional.
          </p>

          <button
            onClick={concluir}
            className="mt-8 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white shadow-[0_10px_30px_-12px_rgba(19,38,30,0.6)] active:scale-[.99]"
          >
            Começar a usar
          </button>
          <button onClick={() => setEtapa("dados")} className="mt-3 text-sm font-medium text-tinta-2">
            Ajustar meus dados
          </button>
        </div>
      )}
    </div>
  );
}

function Campo({
  label,
  sufixo,
  children,
}: {
  label: string;
  sufixo: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-card)]">
      <span className="text-sm font-medium text-tinta-2">{label}</span>
      <span className="flex items-center gap-1.5">
        {children}
        {sufixo && <span className="text-sm text-tinta-2">{sufixo}</span>}
      </span>
    </label>
  );
}

function LinhaResumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-tinta-2">{rotulo}</span>
      <span className="font-semibold text-tinta">{valor}</span>
    </div>
  );
}

function ProgressoPontos({ ativo, total }: { ativo: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < ativo ? "bg-brand" : "bg-black/10"}`}
        />
      ))}
    </div>
  );
}
