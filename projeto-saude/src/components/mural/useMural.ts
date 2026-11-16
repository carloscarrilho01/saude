"use client";

import { useEffect, useState } from "react";
import { getMural } from "@/lib/mural/repositorio";
import type { OrdemMural, PlanoMural } from "@/lib/mural/tipos";

type Estado<T> = { dados: T; carregando: boolean; erro: string | null };

/** Feed do mural; recarrega quando algo muda no repositório. */
export function useFeedMural(ordem: OrdemMural): Estado<PlanoMural[]> {
  const [estado, setEstado] = useState<Estado<PlanoMural[]>>({ dados: [], carregando: true, erro: null });
  useEffect(() => {
    const mural = getMural();
    let vivo = true;
    const carregar = () =>
      mural
        .listar(ordem)
        .then((dados) => vivo && setEstado({ dados, carregando: false, erro: null }))
        .catch((e: Error) => vivo && setEstado((s) => ({ ...s, carregando: false, erro: e.message })));
    carregar();
    const sair = mural.assinar(carregar);
    return () => {
      vivo = false;
      sair();
    };
  }, [ordem]);
  return estado;
}

export function usePlanoMural(id: string): Estado<PlanoMural | null> {
  const [estado, setEstado] = useState<Estado<PlanoMural | null>>({ dados: null, carregando: true, erro: null });
  useEffect(() => {
    const mural = getMural();
    let vivo = true;
    const carregar = () =>
      mural
        .obter(id)
        .then((dados) => vivo && setEstado({ dados, carregando: false, erro: null }))
        .catch((e: Error) => vivo && setEstado({ dados: null, carregando: false, erro: e.message }));
    carregar();
    const sair = mural.assinar(carregar);
    return () => {
      vivo = false;
      sair();
    };
  }, [id]);
  return estado;
}
