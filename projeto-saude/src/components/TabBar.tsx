"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  IconeCasa,
  IconeGota,
  IconeGarfo,
  IconeCalendario,
  IconePessoa,
} from "./icons";

type Aba = {
  href: string;
  rotulo: string;
  Icone: ComponentType<SVGProps<SVGSVGElement>>;
};

const ABAS: Aba[] = [
  { href: "/inicio", rotulo: "Início", Icone: IconeCasa },
  { href: "/agua", rotulo: "Água", Icone: IconeGota },
  { href: "/diario", rotulo: "Diário", Icone: IconeGarfo },
  { href: "/planos", rotulo: "Planos", Icone: IconeCalendario },
  { href: "/perfil", rotulo: "Perfil", Icone: IconePessoa },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-20 border-t border-black/5 bg-card/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-[480px] items-stretch justify-around px-2 py-2">
        {ABAS.map(({ href, rotulo, Icone }) => {
          const ativo = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={`group flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
                  ativo ? "text-brand" : "text-tinta-2"
                }`}
              >
                <span className="relative flex h-9 w-12 items-center justify-center">
                  {ativo && <span aria-hidden className="aba-ativa absolute inset-0 rounded-full bg-verde-claro/40" />}
                  <Icone width={22} height={22} strokeWidth={ativo ? 2.1 : 1.8} className="relative transition-transform duration-200 group-active:scale-90" />
                </span>
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
