// Arte do app: foto de folha (do mockup) + vetores (logo, copo d'água).
// Tudo local, para funcionar offline.

/** Logo: gota formada por folha, com brilho — leve e premium. */
export function LogoSaude({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden>
      <defs>
        <linearGradient id="logoGota" x1="48" y1="10" x2="48" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#1b4b3a" />
        </linearGradient>
        <linearGradient id="logoFolha" x1="30" y1="30" x2="66" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a7f3d0" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {/* gota */}
      <path
        d="M48 8c3 7 22 26 22 44a22 22 0 1 1-44 0C26 34 45 15 48 8Z"
        fill="url(#logoGota)"
      />
      {/* folha sobreposta */}
      <path
        d="M40 70c-4-16 4-30 22-36-2 18-8 30-22 36Z"
        fill="url(#logoFolha)"
        opacity="0.9"
      />
      {/* nervura */}
      <path d="M58 40C50 48 44 58 42 68" stroke="#1b4b3a" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* brilho */}
      <path d="M38 44c-3 5-5 10-4 15" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Fundo lush fotográfico (folha desfocada) para telas como boas-vindas. */
export function FundoFolhas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* folhas fotográficas desfocadas nos cantos */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/folha.png"
        alt=""
        className="absolute -right-16 -top-10 w-[22rem] rotate-[8deg] object-cover opacity-45 blur-xl"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/folha.png"
        alt=""
        className="absolute -left-24 bottom-2 w-[26rem] rotate-180 object-cover opacity-35 blur-2xl"
      />
      {/* brilho e tinta para unificar com a superfície */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 55% at 82% -5%, rgba(52,211,153,0.20) 0%, transparent 55%)," +
            "radial-gradient(75% 50% at 0% 105%, rgba(27,75,58,0.12) 0%, transparent 60%)," +
            "linear-gradient(180deg, rgba(242,246,242,0.35) 0%, rgba(242,246,242,0.75) 45%, var(--color-superficie) 100%)",
        }}
      />
    </div>
  );
}

/**
 * Foto real de folha com gotas (recortada do mockup) no canto do card de
 * hidratação. Máscara radial funde a foto no verde do card e um leve
 * escurecimento mantém o texto legível.
 */
export function FolhaCard() {
  const mascara =
    "radial-gradient(130% 130% at 100% 0%, #000 28%, rgba(0,0,0,0.6) 50%, transparent 72%)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 top-0 h-full w-[68%] overflow-hidden rounded-tr-[var(--radius-card)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/folha.png"
        alt=""
        className="absolute right-0 top-0 h-auto w-full object-cover"
        style={{
          maskImage: mascara,
          WebkitMaskImage: mascara,
        }}
      />
      {/* tinta verde para unificar e garantir contraste do texto */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(225deg, rgba(20,61,43,0.15) 0%, rgba(20,61,43,0.55) 60%, #143d2b 100%)",
        }}
      />
    </div>
  );
}

/** Acento sutil de folha no topo da tela (marca discreta, não polui). */
export function TopoFolha() {
  return (
    <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-28 w-48 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/folha.png"
        alt=""
        className="absolute -right-10 -top-12 w-56 rotate-[10deg] object-cover opacity-[0.14] blur-md"
      />
    </div>
  );
}

/** Copo d'água realista com nível preenchível (0–1). */
export function CopoDagua({ nivel = 0.5, size = 140 }: { nivel?: number; size?: number }) {
  const n = Math.max(0, Math.min(1, nivel));
  // corpo do copo: topo largo (y=8) base estreita (y=120)
  const topo = 8;
  const base = 120;
  const alturaUtil = base - topo - 8;
  const ySuperficie = base - 4 - n * alturaUtil;

  return (
    <svg width={size} height={size} viewBox="0 0 120 128" fill="none" aria-hidden>
      <defs>
        <linearGradient id="agua" x1="60" y1="40" x2="60" y2="124" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#2ecc8f" />
        </linearGradient>
        <clipPath id="interiorCopo">
          <path d="M26 10 H94 L86 120 H34 Z" />
        </clipPath>
      </defs>

      {/* água */}
      <g clipPath="url(#interiorCopo)">
        <rect x="20" y={ySuperficie} width="80" height={base} fill="url(#agua)" />
        {/* superfície (elipse) */}
        <ellipse cx="60" cy={ySuperficie} rx="34" ry="5" fill="#a7f3d0" fillOpacity="0.9" />
      </g>

      {/* vidro */}
      <path
        d="M26 10 H94 L86 120 H34 Z"
        stroke="#1b4b3a"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
      />
      {/* borda superior */}
      <ellipse cx="60" cy="10" rx="34" ry="5.5" stroke="#1b4b3a" strokeOpacity="0.35" strokeWidth="3" fill="none" />
      {/* brilho */}
      <path d="M36 24 L31 104" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
