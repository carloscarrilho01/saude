import type { ReactNode } from "react";

interface Props {
  /** 0–100 */
  percentual: number;
  tamanho?: number;
  espessura?: number;
  corTrilho?: string;
  corProgresso?: string;
  children?: ReactNode;
}

/** Anel de progresso circular (SVG). Preenche no sentido horário a partir do topo. */
export default function AnelProgresso({
  percentual,
  tamanho = 160,
  espessura = 14,
  corTrilho = "rgba(255,255,255,0.18)",
  corProgresso = "var(--color-menta)",
  children,
}: Props) {
  const pct = Math.max(0, Math.min(100, percentual));
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const preenchido = (pct / 100) * circunferencia;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: tamanho, height: tamanho }}
    >
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={corTrilho}
          strokeWidth={espessura}
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={corProgresso}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia - preenchido}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
