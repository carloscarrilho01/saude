"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AgendadorLembretes from "@/components/AgendadorLembretes";
import { temPerfil } from "@/lib/storage";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"verificando" | "ok">("verificando");

  useEffect(() => {
    if (temPerfil()) {
      setEstado("ok");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  if (estado === "verificando") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-superficie">
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
