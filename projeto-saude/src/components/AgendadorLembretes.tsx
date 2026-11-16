"use client";

// Agendador client-side: enquanto o app está aberto (ou instalado como PWA),
// checa a cada minuto se é hora de disparar um lembrete de água.
// Lembrete com app totalmente fechado depende de push do servidor (fase backend).

import { useEffect } from "react";
import {
  getConfigLembretes,
  getMeta,
  totalAguaDia,
  getPerfil,
  marcarLembreteDisparado,
} from "@/lib/storage";
import { deveDisparar, infoAgora } from "@/lib/lembretes";
import {
  registrarServiceWorker,
  mostrarLembrete,
  estadoPermissao,
} from "@/lib/notificacoes";

const INTERVALO_CHECK_MS = 60_000;

export default function AgendadorLembretes() {
  useEffect(() => {
    registrarServiceWorker();

    function checar() {
      if (estadoPermissao() !== "granted") return;
      const config = getConfigLembretes();
      if (!config.ativo) return;

      const perfil = getPerfil();
      const metaMl = getMeta()?.metaMl ?? Infinity;
      const metaAtingida = totalAguaDia() >= metaMl;
      const info = infoAgora(perfil?.fuso);

      if (deveDisparar(config, info, metaAtingida)) {
        mostrarLembrete().then((ok) => {
          if (ok) marcarLembreteDisparado();
        });
      }
    }

    // checa logo após montar e depois a cada minuto
    const t0 = setTimeout(checar, 3000);
    const intervalo = setInterval(checar, INTERVALO_CHECK_MS);
    return () => {
      clearTimeout(t0);
      clearInterval(intervalo);
    };
  }, []);

  return null;
}
