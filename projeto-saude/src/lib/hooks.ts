"use client";

// Hooks que ligam a UI à camada de dados (storage.ts) de forma reativa.

import { useSyncExternalStore } from "react";
import { assinar, getVersao } from "./storage";

const nada = () => () => {};

/** true no cliente, false no servidor/hidratação — sem setState em effect. */
export function useNoCliente(): boolean {
  return useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
}

/**
 * Re-renderiza o componente sempre que o storage muda e indica quando já
 * estamos no cliente (hidratado) — evita mismatch de SSR ao ler localStorage.
 */
export function useStorePronto(): boolean {
  useSyncExternalStore(assinar, getVersao, () => -1);
  return useNoCliente();
}
