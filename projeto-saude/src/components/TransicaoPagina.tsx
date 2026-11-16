"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Remonta o conteúdo a cada rota para rodar a animação de entrada da tela. */
export default function TransicaoPagina({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="entrar-pagina">
      {children}
    </div>
  );
}
