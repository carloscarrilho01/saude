// Repositório do mural: a UI só conhece esta interface.
// Sem chaves do Supabase → implementação local (só este aparelho).
// Com chaves → implementação Supabase (mural compartilhado de verdade).

import { supabaseDisponivel } from "../supabaseClient";
import type { MotivoDenuncia, NovaPublicacao, OrdemMural, PlanoMural } from "./tipos";
import { muralLocal } from "./local";
import { muralSupabase } from "./supabase";

export interface RepositorioMural {
  /** "local" = só neste aparelho; "nuvem" = compartilhado entre usuários. */
  modo: "local" | "nuvem";
  listar(ordem: OrdemMural): Promise<PlanoMural[]>;
  obter(id: string): Promise<PlanoMural | null>;
  publicar(p: NovaPublicacao): Promise<PlanoMural>;
  removerMinha(id: string): Promise<void>;
  alternarUtil(id: string): Promise<void>;
  /** Registra que a pessoa salvou o plano nos próprios planos. */
  registrarSalvamento(id: string): Promise<void>;
  denunciar(id: string, motivo: MotivoDenuncia): Promise<void>;
  assinar(fn: () => void): () => void;
}

export function getMural(): RepositorioMural {
  return supabaseDisponivel() ? muralSupabase : muralLocal;
}
