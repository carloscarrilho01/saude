import { desenharPercurso, type Ponto } from "@/lib/caminhada";

/** Desenho do percurso em SVG, sem mapa (só a forma relativa do trajeto). */
export default function DesenhoPercurso({
  trechos,
  largura = 300,
  altura = 200,
  cor = "var(--color-menta)",
  espessura = 4,
  className = "",
}: {
  trechos: Ponto[][];
  largura?: number;
  altura?: number;
  cor?: string;
  espessura?: number;
  className?: string;
}) {
  const caminhos = desenharPercurso(trechos, largura, altura, espessura * 3);
  if (!caminhos.length) return null;
  const primeiro = caminhos[0].match(/M(-?[\d.]+) (-?[\d.]+)/);
  const ultimo = caminhos[caminhos.length - 1].match(/(-?[\d.]+) (-?[\d.]+)$/);
  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className={className} aria-hidden>
      {caminhos.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={cor} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {primeiro && <circle cx={primeiro[1]} cy={primeiro[2]} r={espessura * 1.4} fill="#fff" stroke={cor} strokeWidth={espessura * 0.7} />}
      {ultimo && <circle cx={ultimo[1]} cy={ultimo[2]} r={espessura * 1.6} fill={cor} />}
    </svg>
  );
}
