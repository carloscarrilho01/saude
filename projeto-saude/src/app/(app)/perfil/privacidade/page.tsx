"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconeSetaEsq } from "@/components/icons";
import { TopoFolha } from "@/components/decor";
import { useStorePronto } from "@/lib/hooks";
import { exportarDados, limparTudo } from "@/lib/storage";
import { apagarTodasAsFotos, assinarFotos, blobParaDataUrl, todasAsFotos } from "@/lib/fotos";

// Privacidade e dados (PRD §4.1): exportar e excluir tudo.
// Na fase localStorage os dados vivem só neste navegador; com o Supabase,
// as mesmas ações passam a valer para a conta.

const PALAVRA_CONFIRMACAO = "EXCLUIR";

export default function PaginaPrivacidade() {
  useStorePronto();
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [qtdFotos, setQtdFotos] = useState<number | null>(null);
  useEffect(() => {
    let vivo = true;
    const contar = () => todasAsFotos().then((f) => vivo && setQtdFotos(f.length)).catch(() => vivo && setQtdFotos(0));
    contar();
    const sair = assinarFotos(contar);
    return () => {
      vivo = false;
      sair();
    };
  }, []);

  const dados = exportarDados();
  const contagem = [
    { rotulo: "Registros de água", n: dados.registrosAgua.length },
    { rotulo: "Itens do diário", n: dados.itensDiario.length },
    { rotulo: "Planos alimentares", n: dados.regimes.length },
    { rotulo: "Fotos de progresso", n: qtdFotos ?? "…" },
    { rotulo: "Caminhadas", n: dados.caminhadas.length },
  ];

  async function baixar() {
    try {
      // fotos entram como data URL para a cópia ser completa (PRD §4.1)
      const fotos = await Promise.all(
        (await todasAsFotos()).map(async (f) => ({
          id: f.id,
          regimeId: f.regimeId,
          dataLocal: f.dataLocal,
          criadaEm: f.criadaEm,
          largura: f.largura,
          altura: f.altura,
          imagem: await blobParaDataUrl(f.imagem),
        })),
      );
      const blob = new Blob([JSON.stringify({ ...exportarDados(), fotosProgresso: fotos }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orvalho-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setAviso("Arquivo baixado. Ele contém dados de saúde: guarde em local seguro.");
    } catch {
      setAviso("Não foi possível gerar o arquivo neste navegador. Tente em outro navegador.");
    }
  }

  async function excluir() {
    if (texto.trim().toUpperCase() !== PALAVRA_CONFIRMACAO) return;
    await apagarTodasAsFotos();
    limparTudo();
    router.replace("/onboarding");
  }

  return (
    <div className="relative px-5 pb-8 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <TopoFolha />
      <header className="relative mb-5 flex items-center">
        <Link href="/perfil" aria-label="Voltar ao perfil" className="-ml-1 rounded-full p-1.5 text-tinta">
          <IconeSetaEsq width={22} height={22} />
        </Link>
        <h1 className="flex-1 pr-8 text-center text-xl font-extrabold text-tinta">Privacidade e dados</h1>
      </header>

      <div className="rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-tinta">Onde seus dados estão</p>
        <p className="mt-1 text-sm leading-relaxed text-tinta-2">
          Nesta versão, tudo fica salvo apenas neste navegador. Nada é enviado para servidores, e
          ninguém além de você tem acesso.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          {contagem.map((c) => (
            <div key={c.rotulo} className="rounded-2xl bg-superficie px-2 py-3">
              <p className="text-xl font-extrabold tabular-nums text-brand">{c.n}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-tinta-2">{c.rotulo}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">Exportar</h2>
      <div className="rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm text-tinta-2">
          Baixe uma cópia completa (perfil, meta, água, diário, planos, lembretes, fotos e caminhadas) em JSON.
        </p>
        <button type="button" onClick={baixar}
          className="mt-4 w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white active:scale-[.99]">
          Baixar meus dados
        </button>
        {aviso && <p className="mt-3 text-xs text-tinta-2" role="status">{aviso}</p>}
      </div>

      <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-tinta-2">Excluir</h2>
      <div className="rounded-[var(--radius-card)] border border-alerta/20 bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="text-sm text-tinta-2">
          Apaga permanentemente todos os seus dados deste aparelho. Não dá para desfazer — se quiser
          guardar uma cópia, exporte antes.
        </p>
        {!confirmando ? (
          <button type="button" onClick={() => setConfirmando(true)}
            className="mt-4 w-full rounded-2xl border border-alerta/30 py-3.5 text-sm font-semibold text-alerta">
            Excluir todos os dados
          </button>
        ) : (
          <div className="mt-4">
            <label htmlFor="confirmacao" className="text-xs text-tinta">
              Para confirmar, digite <strong>{PALAVRA_CONFIRMACAO}</strong>
            </label>
            <input id="confirmacao" value={texto} onChange={(e) => setTexto(e.target.value)} autoComplete="off" autoFocus
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-superficie px-3 py-2.5 text-sm text-tinta outline-none focus:border-alerta" />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => { setConfirmando(false); setTexto(""); }}
                className="flex-1 rounded-2xl border border-black/10 py-3 text-sm font-semibold text-tinta">
                Cancelar
              </button>
              <button type="button" onClick={excluir} disabled={texto.trim().toUpperCase() !== PALAVRA_CONFIRMACAO}
                className="flex-1 rounded-2xl bg-alerta py-3 text-sm font-semibold text-white disabled:opacity-40">
                Excluir definitivamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
