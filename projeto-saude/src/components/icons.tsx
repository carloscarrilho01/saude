// Ícones inline (SVG) — traço limpo, estilo iOS. herdam currentColor.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconeCasa = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
  </svg>
);

export const IconeGota = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c2.5 4 7 7.8 7 12a7 7 0 0 1-14 0c0-4.2 4.5-8 7-12Z" />
  </svg>
);

export const IconeGarfo = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 3v6a2 2 0 0 0 4 0V3" />
    <path d="M8 9v12" />
    <path d="M17 3c-1.5 0-3 1.8-3 5s1 4 2 4h1V3Z" />
    <path d="M17 12v9" />
  </svg>
);

export const IconeCalendario = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="3" />
    <path d="M3.5 9.5h17M8 3v3M16 3v3" />
  </svg>
);

export const IconePessoa = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
);

export const IconeSino = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const IconeMais = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconeMenos = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const IconeFogo = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c1 3-1 4-1 6a3 3 0 0 0 5 1c1 3 1.5 4 1.5 6a5.5 5.5 0 1 1-11 0c0-3 2.5-5 3-7 .4-1.6 1.5-2.5 2.5-6Z" />
  </svg>
);

export const IconeCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconeLapis = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16.5 4.5 19.5 7.5 8 19l-4 1 1-4 11.5-11.5Z" />
  </svg>
);

export const IconeLixeira = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </svg>
);

export const IconeSetaEsq = (p: P) => (
  <svg {...base} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const IconeSetaDir = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconeCafe = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
    <path d="M16 10h2.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M7 3c-.6 1 .6 2 0 3M11 3c-.6 1 .6 2 0 3" />
  </svg>
);

export const IconeMaca = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 8c-1.5-1.5-5-1.5-6.5 1-1.3 2.2-.6 6 1.5 8.5 1 1.2 2 1.5 3 .8" />
    <path d="M12 8c1.5-1.5 5-1.5 6.5 1 1.3 2.2.6 6-1.5 8.5-1 1.2-2 1.5-3 .8" />
    <path d="M12 8c0-2 .5-3.5 2.5-4.5" />
  </svg>
);

export const IconePrato = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);

import type { TipoRefeicao } from "@/lib/tipos";

/** Ícone de linha por tipo de refeição (consistente, sem emoji). */
export function IconeRefeicao({ tipo, ...p }: { tipo: TipoRefeicao } & P) {
  switch (tipo) {
    case "cafe":
      return <IconeCafe {...p} />;
    case "lanche":
      return <IconeMaca {...p} />;
    case "jantar":
      return <IconePrato {...p} />;
    default:
      return <IconeGarfo {...p} />;
  }
}

export const IconeTrofeu = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 21h8M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M17 6h2.5a1.5 1.5 0 0 1 1.5 1.5c0 2-1.8 3.5-4 3.5M7 6H4.5A1.5 1.5 0 0 0 3 7.5C3 9.5 4.8 11 7 11" />
  </svg>
);

export const IconeGarrafa = (p: P) => (
  <svg {...base} {...p}>
    <path d="M10 2h4v3l1.5 2.5V20a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V7.5L10 5V2Z" />
    <path d="M8.5 12h7" />
  </svg>
);

export const IconeCaneca = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h12v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z" />
    <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
  </svg>
);

export const IconeCopo = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 4h14l-1.6 15.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 4Z" />
    <path d="M6 10h12" />
  </svg>
);

export const IconeSol = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconeFechar = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconeBrilho = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1" />
  </svg>
);

export const IconeCadeado = (p: P) => (
  <svg {...base} {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconeGrafico = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 20h16" />
    <path d="M7 16v-4M12 16V8M17 16v-6" />
  </svg>
);

export const IconeAlvo = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
);
