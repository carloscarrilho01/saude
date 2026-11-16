import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogoSaude } from "@/components/decor";
import { IconeSetaDir } from "@/components/icons";
import CalculadoraMeta from "@/components/landing/CalculadoraMeta";

// Landing pública (Server Component). O app em si vive em /inicio.

export const metadata: Metadata = {
  title: "Orvalho — sua meta de água, calculada e lembrada",
  description:
    "Descubra quanto de água beber pelo seu peso e idade, receba lembretes no seu horário e acompanhe água, refeições e plano alimentar num só lugar.",
  openGraph: {
    title: "Orvalho — sua meta de água, calculada e lembrada",
    description:
      "Meta de hidratação personalizada, lembretes no seu horário e diário alimentar simples. Funciona no navegador, sem baixar nada.",
    locale: "pt_BR",
    type: "website",
  },
};

const DORES = [
  {
    titulo: "Você só lembra da água quando a sede aparece",
    texto: "Reunião, trânsito, tela. Quando percebe, já é fim de tarde e a garrafa está cheia.",
  },
  {
    titulo: "Não sabe se bebeu um litro ou dois",
    texto: "Sem registro, todo dia parece “mais ou menos”. E mais ou menos não vira hábito.",
  },
  {
    titulo: "O plano alimentar começa na segunda e some na quarta",
    texto: "Anotar em papel, app de dieta, planilha… cada coisa num lugar, nenhuma no seu bolso.",
  },
];

const RECURSOS = [
  {
    titulo: "Uma meta feita para você",
    texto:
      "Calculada pelo seu peso, idade, nível de atividade e clima. Mudou de rotina? Recalcule ou defina a sua própria meta.",
  },
  {
    titulo: "Lembretes que respeitam sua rotina",
    texto:
      "Escolha o intervalo, o horário (das 8h às 22h, por exemplo) e os dias. Quando você bate a meta, eles param sozinhos.",
  },
  {
    titulo: "Registro em um toque",
    texto:
      "200 ml, 300 ml, meio litro. Só água pura conta para a meta; café, chá e suco vão para o diário sem bagunçar a conta.",
  },
  {
    titulo: "Diário e plano alimentar juntos",
    texto:
      "Monte seu plano, marque as refeições feitas e veja quanto do planejado você cumpriu na semana.",
  },
];

const PASSOS = [
  { titulo: "Conte um pouco sobre você", texto: "Peso, idade e quanto você se movimenta. Leva menos de um minuto." },
  { titulo: "Receba sua meta diária", texto: "Em litros e em copos, com a conta aberta para você entender de onde veio." },
  { titulo: "Beba, toque, acompanhe", texto: "Registre cada copo e deixe os lembretes cuidarem do resto do dia." },
];

const DUVIDAS = [
  {
    p: "Isso substitui a orientação de um médico ou nutricionista?",
    r: "Não. A meta é uma estimativa para apoiar o hábito de se hidratar, não uma prescrição. Se você tem alguma condição de saúde, gestação ou restrição de líquidos, siga a orientação do seu profissional.",
  },
  {
    p: "Preciso baixar na App Store ou no Google Play?",
    r: "Não. O Orvalho abre no navegador do celular ou do computador e pode ser instalado na tela inicial como um app, sem passar pela loja.",
  },
  {
    p: "Os lembretes funcionam no iPhone?",
    r: "Sim, depois que você adiciona o app à tela de início (no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início) e permite as notificações. É uma exigência do iOS para apps web.",
  },
  {
    p: "E o café, o chá e o suco que eu bebo?",
    r: "Você registra no diário normalmente. Para a meta de hidratação, só a água pura entra na conta, para o número não enganar você.",
  },
  {
    p: "O app tira foto do prato ou usa IA?",
    r: "Não. O registro é manual e você decide o que anotar. Nada de câmera obrigatória.",
  },
];

export default function Landing() {
  return (
    <div className="relative overflow-x-clip bg-superficie text-tinta">
      {/* luz e folha de fundo do topo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[44rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/folha.png" alt="" className="absolute -right-24 -top-24 w-[34rem] rotate-[12deg] opacity-25 blur-2xl" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 70% at 85% 0%, rgba(52,211,153,0.18), transparent 70%)" }}
        />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Orvalho, página inicial">
          <LogoSaude size={36} />
          <span className="text-lg font-extrabold tracking-tight text-brand">Orvalho</span>
        </Link>
        <nav aria-label="Seções" className="hidden items-center gap-7 text-sm font-medium text-tinta-2 md:flex">
          <a href="#como-funciona" className="hover:text-brand">Como funciona</a>
          <a href="#recursos" className="hover:text-brand">Recursos</a>
          <a href="#duvidas" className="hover:text-brand">Dúvidas</a>
        </nav>
        <Link
          href="/inicio"
          className="rounded-full border border-brand/15 bg-card/70 px-4 py-2 text-sm font-semibold text-brand backdrop-blur hover:bg-card"
        >
          Abrir o app
        </Link>
      </header>

      <main>
        {/* HERO */}
        <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-16">
          <div>
            <p style={{ "--i": 0 } as React.CSSProperties} className="surgir inline-flex items-center gap-2 rounded-full bg-verde-claro/35 px-3 py-1 text-xs font-semibold text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-menta" />
              Hidratação, alimentação e hábitos
            </p>
            <h1 style={{ "--i": 1 } as React.CSSProperties} className="surgir mt-5 text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-brand sm:text-6xl lg:text-[4.4rem]">
              Quanto de água o seu corpo pede&nbsp;hoje?
            </h1>
            <p style={{ "--i": 2 } as React.CSSProperties} className="surgir mt-5 max-w-xl text-lg leading-relaxed text-tinta-2">
              Descubra em segundos, pelo seu peso e idade. Depois, o Orvalho lembra você de beber no
              seu horário e reúne água, refeições e plano alimentar num só lugar.
            </p>
            <div style={{ "--i": 3 } as React.CSSProperties} className="surgir mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/onboarding"
                className="rounded-2xl bg-brand px-7 py-4 text-center text-base font-semibold text-white shadow-[0_14px_34px_-14px_rgba(19,38,30,0.7)] transition hover:bg-brand-deep"
              >
                Criar minha meta
              </Link>
              <a href="#como-funciona" className="px-2 py-3 text-center text-sm font-semibold text-brand hover:underline">
                Ver como funciona
              </a>
            </div>
            <p className="mt-4 text-sm text-tinta-2">Funciona no navegador do celular ou do computador. Sem baixar nada.</p>
          </div>

          <div className="surgir" style={{ "--i": 4 } as React.CSSProperties}>
            <CalculadoraMeta />
          </div>
        </section>

        {/* DORES */}
        <section aria-labelledby="dores-titulo" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="dores-titulo" className="max-w-2xl text-3xl font-extrabold tracking-tight text-tinta sm:text-4xl">
            A sede chega tarde. O dia passa rápido.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {DORES.map((d) => (
              <div key={d.titulo} className="rounded-[var(--radius-card)] bg-card p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-bold leading-snug text-tinta">{d.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-2">{d.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RECURSOS + telas reais do app */}
        <section id="recursos" aria-labelledby="recursos-titulo" className="scroll-mt-6 bg-brand-deep py-20 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
            <div className="relative mx-auto flex w-full max-w-md justify-center gap-4 lg:order-2">
              <Celular src="/landing/app-inicio.png" alt="Tela inicial do app com o progresso de hidratação do dia" />
              <Celular
                src="/landing/app-agua.png"
                alt="Tela de hidratação com os registros de água do dia"
                className="mt-14 hidden sm:block"
              />
            </div>
            <div>
              <h2 id="recursos-titulo" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Tudo o que importa no seu dia, numa tela só
              </h2>
              <dl className="mt-8 space-y-6">
                {RECURSOS.map((r) => (
                  <div key={r.titulo} className="border-l-2 border-menta/60 pl-5">
                    <dt className="text-lg font-bold">{r.titulo}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-white/70">{r.texto}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" aria-labelledby="como-titulo" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6">
          <h2 id="como-titulo" className="text-3xl font-extrabold tracking-tight text-tinta sm:text-4xl">
            Três passos até o primeiro copo
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="relative rounded-[var(--radius-card)] bg-card p-6 shadow-[var(--shadow-card)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold text-tinta">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-tinta-2">{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* INSTALAR + PRIVACIDADE */}
        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-2">
          <div className="rounded-[var(--radius-card)] bg-card p-7 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-extrabold tracking-tight text-tinta">Instale como um app, sem loja</h2>
            <p className="mt-2 text-sm leading-relaxed text-tinta-2">
              Abra no navegador e adicione à tela inicial. Ele ganha ícone, abre em tela cheia e fica a um
              toque de distância.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-tinta">
              <li><Passos rotulo="iPhone" passos={["Safari", "Compartilhar", "Adicionar à Tela de Início"]} /></li>
              <li><Passos rotulo="Android" passos={["Chrome", "Menu de três pontos", "Instalar app"]} /></li>
              <li><Passos rotulo="Computador" passos={["Ícone de instalar na barra de endereço"]} /></li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] bg-card p-7 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-extrabold tracking-tight text-tinta">Seus dados de saúde são seus</h2>
            <p className="mt-2 text-sm leading-relaxed text-tinta-2">
              Peso, refeições e hábitos são informações sensíveis. Por isso, dentro do app você baixa uma
              cópia completa dos seus dados ou apaga tudo quando quiser, sem precisar pedir para ninguém.
            </p>
          </div>
        </section>

        {/* DÚVIDAS */}
        <section id="duvidas" aria-labelledby="duvidas-titulo" className="mx-auto max-w-3xl scroll-mt-6 px-4 pb-20 sm:px-6">
          <h2 id="duvidas-titulo" className="text-3xl font-extrabold tracking-tight text-tinta sm:text-4xl">
            Perguntas frequentes
          </h2>
          <div className="mt-8 divide-y divide-black/5 overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)]">
            {DUVIDAS.map((d) => (
              <details key={d.p} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-tinta [&::-webkit-details-marker]:hidden">
                  {d.p}
                  <span aria-hidden className="text-xl font-light text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-tinta-2">{d.r}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brand px-6 py-14 text-center text-white sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(50% 80% at 50% 0%, rgba(52,211,153,0.25), transparent 70%)" }}
            />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-5xl">Seu primeiro copo começa agora.</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-white/75">
              Calcule sua meta, registre a primeira água do dia e deixe os lembretes cuidarem do resto.
            </p>
            <Link
              href="/onboarding"
              className="relative mt-8 inline-block rounded-2xl bg-menta px-8 py-4 text-base font-bold text-brand-deep transition hover:bg-menta-soft"
            >
              Criar minha meta
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-tinta-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <LogoSaude size={22} />
            <span className="font-semibold text-tinta">Orvalho</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <p className="max-w-xl sm:text-right">
            As metas e informações do Orvalho são estimativas de apoio a hábitos e não substituem
            avaliação, diagnóstico ou prescrição de profissionais de saúde.
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Caminho de toques: "Safari > Compartilhar > …" com ícone de seta entre os passos. */
function Passos({ rotulo, passos }: { rotulo: string; passos: string[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-1 gap-y-1">
      <strong className="mr-1 font-semibold">{rotulo}:</strong>
      {passos.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && <IconeSetaDir width={12} height={12} className="text-tinta-2" aria-label="depois" />}
          <span className="rounded-md bg-superficie px-1.5 py-0.5">{p}</span>
        </span>
      ))}
    </span>
  );
}

function Celular({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`w-[62%] max-w-[230px] shrink-0 sm:w-[46%] rounded-[2.2rem] bg-black/40 p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/15 ${className}`}>
      <Image src={src} alt={alt} width={390} height={844} className="h-auto w-full rounded-[1.9rem]" />
    </div>
  );
}
