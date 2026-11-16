"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AgendadorLembretes from "@/components/AgendadorLembretes";
import { useStorePronto } from "@/lib/hooks";
import { temPerfil } from "@/lib/storage";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pronto = useStorePronto();
  const comPerfil = pronto && temPerfil();

  useEffect(() => {
    if (pronto && !comPerfil) router.replace("/onboarding");
  }, [pronto, comPerfil, router]);

  if (!comPerfil) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-superficie" role="status" aria-label="Carregando">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-verde-claro border-t-brand" />
      </div>
    );
  }

  return (
    <>
      <AgendadorLembretes />
      <AppShell>{children}</AppShell>
    </>
  );
}
