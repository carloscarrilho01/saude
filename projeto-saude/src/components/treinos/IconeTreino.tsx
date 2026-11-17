import type { SVGProps } from "react";
import { IconeBike, IconeCasa, IconeHalter, IconeMusica, IconeOndas, IconeRaio, IconeTenis, IconeYoga, IconeCronometro } from "../icons";
import type { TipoTreino } from "@/lib/treinos";

/** Ícone de linha por tipo de treino. */
export default function IconeTreino({ tipo, ...p }: { tipo: TipoTreino } & SVGProps<SVGSVGElement>) {
  switch (tipo) {
    case "musculacao":
      return <IconeHalter {...p} />;
    case "corrida":
    case "caminhada":
      return <IconeTenis {...p} />;
    case "bike":
      return <IconeBike {...p} />;
    case "natacao":
      return <IconeOndas {...p} />;
    case "yoga":
      return <IconeYoga {...p} />;
    case "funcional":
      return <IconeRaio {...p} />;
    case "danca":
      return <IconeMusica {...p} />;
    case "casa":
      return <IconeCasa {...p} />;
    default:
      return <IconeCronometro {...p} />;
  }
}
