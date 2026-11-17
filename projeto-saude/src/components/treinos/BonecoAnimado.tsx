"use client";

import { useEffect, useRef, useState } from "react";
import { DIM, montar, poseNoTempo, type Animacao, type Esqueleto, type Pt } from "@/lib/boneco";

// Desenha e anima o boneco de um exercício. Com "reduzir movimento" ligado,
// mostra a posição inicial e a final sobrepostas (sem animar).

const linha = (a: Pt, b: Pt) => `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

function Corpo({ e, cor, corLonge, opacidade = 1 }: { e: Esqueleto; cor: string; corLonge: string; opacidade?: number }) {
  const membro = (pts: Pt[]) => pts.slice(1).map((p, i) => linha(pts[i], p)).join("");
  return (
    <g opacity={opacidade} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* lado de longe primeiro */}
      <path d={membro([e.quadrilB, e.joelhoB, e.tornozeloB, e.ponteiraB])} stroke={corLonge} strokeWidth={9} />
      <path d={membro([e.ombroB, e.cotoveloB, e.maoB])} stroke={corLonge} strokeWidth={7.5} />
      {/* tronco (curvo) e cabeça */}
      <path
        d={`M${e.pelve.x} ${e.pelve.y}Q${e.controleTronco.x} ${e.controleTronco.y} ${e.pescoco.x} ${e.pescoco.y}`}
        stroke={cor}
        strokeWidth={13}
      />
      {(e.ombroA.x !== e.ombroB.x || e.ombroA.y !== e.ombroB.y) && <path d={linha(e.ombroB, e.ombroA)} stroke={cor} strokeWidth={9} />}
      {(e.quadrilA.x !== e.quadrilB.x || e.quadrilA.y !== e.quadrilB.y) && <path d={linha(e.quadrilB, e.quadrilA)} stroke={cor} strokeWidth={9} />}
      <circle cx={e.cabeca.x} cy={e.cabeca.y} r={DIM.raioCabeca} fill={cor} stroke="none" />
      {/* lado de perto por cima */}
      <path d={membro([e.quadrilA, e.joelhoA, e.tornozeloA, e.ponteiraA])} stroke={cor} strokeWidth={9} />
      <path d={membro([e.ombroA, e.cotoveloA, e.maoA])} stroke={cor} strokeWidth={7.5} />
    </g>
  );
}

function Objeto({ tipo, e0 }: { tipo: Animacao["objeto"]; e0: Esqueleto }) {
  const c = "currentColor";
  if (tipo === "cadeira") {
    // assento atrás dos pés, na altura de quem está sentado (≈ joelho)
    const x = e0.tornozeloA.x - 54;
    const y = DIM.chao - 34;
    return (
      <g stroke={c} strokeWidth={4} strokeLinecap="round" opacity={0.35} fill="none">
        <path d={`M${x} ${y}H${x + 28}M${x + 2} ${y}V${DIM.chao}M${x + 26} ${y}V${DIM.chao}M${x + 2} ${y}V${y - 34}`} />
      </g>
    );
  }
  if (tipo === "cadeira-frente") {
    const x = DIM.largura / 2;
    const y = DIM.chao - 34;
    return (
      <g stroke={c} strokeWidth={4} strokeLinecap="round" opacity={0.35} fill="none">
        <path d={`M${x - 26} ${y}H${x + 26}M${x - 22} ${y}V${DIM.chao}M${x + 22} ${y}V${DIM.chao}`} />
      </g>
    );
  }
  if (tipo === "parede") {
    const x = Math.max(e0.maoA.x, e0.maoB.x) + 4;
    return <path d={`M${x} 20V${DIM.chao}`} stroke={c} strokeWidth={5} opacity={0.3} strokeLinecap="round" />;
  }
  if (tipo === "porta") {
    const x = Math.min(e0.maoA.x, e0.maoB.x) - 4;
    return <path d={`M${x} 18V${DIM.chao}M${x} 18H${x + 14}`} stroke={c} strokeWidth={5} opacity={0.3} strokeLinecap="round" fill="none" />;
  }
  if (tipo === "tapete") {
    return <rect x={18} y={DIM.chao - 3} width={DIM.largura - 36} height={5} rx={2.5} fill={c} opacity={0.18} />;
  }
  return null;
}

export default function BonecoAnimado({
  animacao,
  tamanho = 160,
  cor = "var(--color-brand)",
  corLonge = "var(--color-verde-claro)",
  rotulo,
  className = "",
}: {
  animacao: Animacao;
  tamanho?: number;
  cor?: string;
  corLonge?: string;
  rotulo?: string;
  className?: string;
}) {
  const [t, setT] = useState(0);
  const [reduzir, setReduzir] = useState(false);
  const inicio = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setReduzir(mq.matches);
    aplicar();
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  useEffect(() => {
    if (reduzir) return;
    let id = 0;
    const quadro = (agora: number) => {
      if (inicio.current == null) inicio.current = agora;
      setT(((agora - inicio.current) % animacao.ciclo) / animacao.ciclo);
      id = requestAnimationFrame(quadro);
    };
    id = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(id);
  }, [animacao, reduzir]);

  const e0 = montar(animacao.quadros[0], animacao);
  const atual = montar(poseNoTempo(animacao, reduzir ? 0 : t), animacao);
  const meio = Math.floor(animacao.quadros.length / 2);
  const eMeio = montar(animacao.quadros[meio], animacao);

  return (
    <svg
      viewBox={`0 0 ${DIM.largura} ${DIM.altura}`}
      width={tamanho}
      height={(tamanho * DIM.altura) / DIM.largura}
      role="img"
      aria-label={rotulo ? `Demonstração: ${rotulo}` : "Demonstração do exercício"}
      className={className}
    >
      <path d={`M10 ${DIM.chao}H${DIM.largura - 10}`} stroke="currentColor" strokeWidth={2} opacity={0.2} strokeLinecap="round" />
      <Objeto tipo={animacao.objeto} e0={e0} />
      {reduzir ? (
        <>
          <Corpo e={eMeio} cor={cor} corLonge={corLonge} opacidade={0.35} />
          <Corpo e={e0} cor={cor} corLonge={corLonge} />
        </>
      ) : (
        <Corpo e={atual} cor={cor} corLonge={corLonge} />
      )}
    </svg>
  );
}
