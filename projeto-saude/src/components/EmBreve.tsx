import type { ReactNode } from "react";

/** Estado "próxima fase" para abas ainda não implementadas no MVP. */
export default function EmBreve({
  titulo,
  icone,
  descricao,
}: {
  titulo: string;
  icone: ReactNode;
  descricao: string;
}) {
  return (
    <div className="px-5 pb-6 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
      <h1 className="mb-6 text-center text-xl font-extrabold text-tinta">{titulo}</h1>
      <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-verde-claro/40 text-brand">
          {icone}
        </span>
        <p className="text-base font-bold text-tinta">Em breve</p>
        <p className="mt-1 max-w-xs text-sm text-tinta-2">{descricao}</p>
      </div>
    </div>
  );
}
