"use client";

// Hooks que ligam a UI à camada de dados (storage.ts) de forma reativa.

import { useEffect, useState } from "react";
import { assinar } from "./storage";

/**
 * Re-renderiza o componente sempre que o storage muda e indica quando já
 * estamos no cliente (hidratado) — evita mismatch de SSR ao ler localStorage.
 */
export function useStorePronto(): boolean {
  const [, setVersao] = useState(0);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setPronto(true);
    const desassinar = assinar(() => setVersao((v) => v + 1));
    return desassinar;
  }, []);

  return pronto;
}
