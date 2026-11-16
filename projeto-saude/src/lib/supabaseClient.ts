"use client";

// Client do Supabase para uso no navegador. Lê as chaves públicas do ambiente.
// Enquanto NÃO houver chaves configuradas, `supabaseDisponivel()` é false e o
// app continua usando o localStorage (storage.ts). Isso permite ligar o
// Supabase sem quebrar o app durante a migração.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseDisponivel(): boolean {
  return Boolean(url && anonKey);
}

let cliente: SupabaseClient | null = null;

/** Retorna o client (singleton) ou null se as chaves não estiverem configuradas. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseDisponivel()) return null;
  if (!cliente) {
    cliente = createBrowserClient(url as string, anonKey as string);
  }
  return cliente;
}
