"use client";

import BonecoAnimado from "./BonecoAnimado";
import { getAnimacao } from "@/lib/animacoesExercicios";
import type { Exercicio } from "@/lib/rotinasCasa";

/**
 * Mostra como fazer o exercício: vídeo real, se houver (campo `video`),
 * senão a animação do boneco. Vídeos devem ser gravados/revisados por um
 * profissional de educação física antes de entrar aqui.
 */
export default function DemonstracaoExercicio({
  exercicio,
  tamanho = 160,
  escuro = false,
  className = "",
}: {
  exercicio: Exercicio;
  tamanho?: number;
  escuro?: boolean;
  className?: string;
}) {
  if (exercicio.video) {
    return (
      <video
        src={exercicio.video}
        autoPlay
        muted
        loop
        playsInline
        aria-label={`Vídeo: ${exercicio.nome}`}
        className={`rounded-2xl object-cover ${className}`}
        style={{ width: tamanho }}
      />
    );
  }
  const animacao = getAnimacao(exercicio.nome);
  if (!animacao) return null;
  return (
    <BonecoAnimado
      animacao={animacao}
      tamanho={tamanho}
      rotulo={exercicio.nome}
      cor={escuro ? "#ffffff" : "var(--color-brand)"}
      corLonge={escuro ? "rgba(255,255,255,0.35)" : "var(--color-verde-claro)"}
      className={`${escuro ? "text-white" : "text-tinta"} ${className}`}
    />
  );
}
