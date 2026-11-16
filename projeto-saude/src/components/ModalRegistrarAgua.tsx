"use client";

import { useState } from "react";
import { adicionarRegistroAgua } from "@/lib/storage";
import { IconeMais, IconeMenos } from "./icons";
import { CopoDagua } from "./decor";

const ATALHOS = [200, 300, 500, 1000];
const rotuloMl = (ml: number) => (ml >= 1000 ? `${ml / 1000} L` : `${ml} ml`);

export default function ModalRegistrarAgua({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  const [valor, setValor] = useState(300);
  if (!aberto) return null;

  function registrar() {
    adicionarRegistroAgua(valor, "botao_rapido");
    aoFechar();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onClick={aoFechar}
    >
      <div
        className="w-full max-w-[440px] rounded-t-[28px] bg-card p-6 pb-8 shadow-[var(--shadow-float)] sm:rounded-[28px]"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">Registrar água</h2>
          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-tinta-2"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center py-2">
          <CopoDagua nivel={Math.min(1, valor / 1000)} size={120} />
          <div className="mt-1 flex items-center justify-center gap-6">
            <button
              onClick={() => setValor((v) => Math.max(50, v - 50))}
              aria-label="Diminuir"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie text-brand active:scale-95"
            >
              <IconeMenos />
            </button>
            <span className="min-w-[96px] text-center text-4xl font-extrabold text-brand">
              {rotuloMl(valor)}
            </span>
            <button
              onClick={() => setValor((v) => Math.min(3000, v + 50))}
              aria-label="Aumentar"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie text-brand active:scale-95"
            >
              <IconeMais />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {ATALHOS.map((ml) => (
            <button
              key={ml}
              onClick={() => setValor(ml)}
              className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                valor === ml ? "bg-brand text-white" : "bg-superficie text-tinta"
              }`}
            >
              {rotuloMl(ml)}
            </button>
          ))}
        </div>

        <button
          onClick={registrar}
          className="mt-6 w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white active:scale-[.99]"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}
