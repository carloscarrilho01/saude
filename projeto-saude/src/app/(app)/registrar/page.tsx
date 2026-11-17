"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adicionarRegistroAgua } from "@/lib/storage";

// Destino dos atalhos do ícone do app (manifest "shortcuts"): registra a água
// e leva para /agua com a confirmação. Um toque longo no ícone → "+1 copo".

const PADRAO_ML = 250;
const LIMITE = { min: 50, max: 3000 };
// evita registro duplo (StrictMode / remontagem) para o mesmo lançamento
let ultimoRegistroEm = 0;

export default function RegistrarAtalho() {
  return (
    <Suspense fallback={null}>
      <Registrar />
    </Suspense>
  );
}

function Registrar() {
  const router = useRouter();
  const n = parseInt(useSearchParams().get("ml") ?? "", 10);
  const quantidade = Number.isFinite(n) && n >= LIMITE.min && n <= LIMITE.max ? n : PADRAO_ML;

  useEffect(() => {
    if (Date.now() - ultimoRegistroEm > 3000) {
      ultimoRegistroEm = Date.now();
      adicionarRegistroAgua(quantidade, "botao_rapido");
    }
    router.replace(`/agua?registrado=${quantidade}`);
  }, [quantidade, router]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center text-sm text-tinta-2" role="status">
      Registrando {quantidade} ml…
    </div>
  );
}
