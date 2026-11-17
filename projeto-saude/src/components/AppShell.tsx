import type { ReactNode } from "react";
import TabBar from "./TabBar";
import TransicaoPagina from "./TransicaoPagina";

/**
 * Moldura mobile-first: coluna centralizada (~480px) no desktop, conteúdo
 * rolável e tab bar fixa na base. Usada pelas telas principais do app.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-superficie">
      <main className="scroll-limpo flex-1">
        <TransicaoPagina>{children}</TransicaoPagina>
      </main>
      <TabBar />
    </div>
  );
}
