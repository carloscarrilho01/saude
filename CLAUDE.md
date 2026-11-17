# CLAUDE.md — Orvalho (ex-"Projeto Saúde")

Instruções de projeto para o agente. Leia antes de implementar qualquer coisa.

## O que é este projeto
**Nome do produto: Orvalho** (marca exibida ao usuário). Pastas, repositório e chaves do
localStorage (`saude.*`) mantêm o nome antigo de propósito — não renomear sem migração.
PWA (web app instalável, mobile-first) de saúde e hidratação. O usuário calcula sua meta
diária de água pelo peso/idade, registra consumo de água e refeições, recebe lembretes e
segue regimes (planos alimentares).

- **Documento de referência:** `PRD.md` (raiz). É a fonte da verdade do produto. Sempre que
  houver dúvida de regra de negócio, consulte o PRD antes de decidir.
- **Mockups aprovados:** `imagens/` — o visual DEVE seguir essas telas (premium, estilo iOS, verde).
- **Código da aplicação:** subpasta `projeto-saude/` (Next.js). O `index.html` na raiz é um
  protótipo antigo ("Vida+") — **não usar, não apagar sem pedir.**

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — ATENÇÃO: config é via CSS (`@theme` em `src/app/globals.css`),
  **não existe `tailwind.config.js`**. Defina tokens de cor/fonte dentro de `@theme`.
- **Supabase** (Auth + Postgres) — entra na fase de "Fundação"; ainda não configurado.
- Deploy pretendido: **Vercel**.

### Decisão de arquitetura atual (importante)
Estamos construindo **frontend primeiro**: o app roda localmente com persistência em
**localStorage** (sem backend). O Supabase (login real + banco) entra depois, sem reescrever
a UI. Portanto: isole o acesso a dados numa camada (ex.: `src/lib/storage.ts` / repositórios)
para que trocar localStorage → Supabase seja transparente para os componentes.

**Fundação Supabase (preparada, aguardando credenciais do usuário):**
- `@supabase/supabase-js` + `@supabase/ssr` instalados.
- `src/lib/supabaseClient.ts` — só ativa quando `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`
  existem; sem elas, `supabaseDisponivel()` é false e o app segue no localStorage.
- `supabase/schema.sql` — schema completo com RLS por usuário + índices.
- `supabase/SETUP.md` — passo a passo pro usuário criar o projeto e passar as chaves.
- Próximo passo (quando houver chaves): auth, repositórios Supabase, migração do
  localStorage e requisitos de privacidade do PRD §4.1.

## Comandos
Rode sempre dentro de `projeto-saude/`:
- `npm run dev` — servidor de desenvolvimento (http://localhost:3000)
- `npm run build` — build de produção
- `npm run lint` — ESLint

Rotas: `/` = landing pública · `/inicio` = dashboard do app. Publicação: ver `projeto-saude/DEPLOY.md`.

## Convenções de código
- **Idioma:** UI e textos em **português (pt-BR)**. Nomes de código em português quando for
  domínio (ex.: `calcularMeta`, `registroAgua`), inglês para termos técnicos neutros é ok.
- **Componentes:** React Server Components por padrão; use `"use client"` só quando precisar
  de estado/efeito/interação.
- **Estilo:** Tailwind utilitário + tokens do design system (§Design abaixo). Evite CSS solto.
- **Lógica pura separada da UI:** o cálculo de hidratação, aderência, etc. ficam em módulos
  puros e testáveis em `src/lib/` — nunca dentro de componentes.
- **Datas/fuso:** toda contagem diária respeita o fuso do usuário; agrupar por `data_local`.

## Design System (resumo — detalhes no PRD §12)
Definir estes tokens no `@theme` do `globals.css`:
- Verde primário `#1B4B3A` · Verde card hidratação `#143D2B` · Menta/esmeralda `#34D399`
- Verde claro `#A7D8C4` · Fundo `#F2F6F2` · Card `#FFFFFF` · Texto `#13261E` · Texto 2 `#6B7D74`
- Alerta `#E5484D`
- Fonte sans moderna (Inter/Geist), títulos bold/extrabold grandes.
- Cards bem arredondados, sombras suaves, tab bar inferior de 5 abas:
  **Início · Água · Diário · Planos · Treinos** (Perfil abre pelo avatar no Início — decisão nov/2026).
- Prever estados: carregando, vazio, erro, offline (PRD §12.7).

## Regras de negócio que não podem ser violadas
- **Cálculo de água:** coeficiente por idade — até 17: 40 ml/kg · 18–55: 35 · 56–65: 30 ·
  66+: 30 (padrão). Sem idade → 35. Mais ajustes de atividade e clima (PRD §3.2). Os
  coeficientes são **configuráveis**, não constantes cravadas na UI.
- **Disclaimer de saúde:** resultado é "estimativa", não prescrição (PRD §3.2 regra de
  lançamento e §11). Não apresentar como recomendação médica.
- **Só água pura conta para a meta de hidratação**; outras bebidas vão só para o diário (§3.6).
- **Aderência (v1):** refeições concluídas ÷ planejadas; sem parcial; água não entra na % (§3.5).
- **Sem IA / sem reconhecimento por foto na v1.** Registro de alimento é manual.
- **Privacidade (LGPD):** isolamento por usuário, consentimento, exportar e excluir dados
  são requisitos obrigatórios e testáveis (PRD §4.1) — relevante quando o Supabase entrar.

## Skills do projeto (em `.claude/skills/`)
Acione o skill relevante ANTES da tarefa correspondente — não improvise quando há um skill:

- **frontend-design** + **ui-ux-pro-max** → ao criar/redesenhar qualquer tela ou componente.
  Garantem visual intencional (não-template) e fiel ao mockup verde.
- **web-design-guidelines** → ao revisar UI (acessibilidade, UX, estados, responsivo).
- **vercel-react-best-practices** → ao escrever/refatorar componentes React/Next.js (performance,
  Server vs Client Components, data fetching).
- **supabase-postgres-best-practices** → ANTES de criar/alterar schema, tabelas, RLS, migrations,
  índices ou queries Postgres (na fase Supabase).
- **improve-codebase-architecture** → ao estruturar módulos, separar camada de dados da UI,
  ou quando a arquitetura começar a embolar.
- **copywriting** → textos de UI persuasivos, onboarding, e a futura landing/página de vendas.

## Ordem de desenvolvimento (PRD §14)
1. Fundação (conta, perfil, banco, segurança, estrutura PWA)
2. Hidratação (cálculo, registro, histórico, lembretes) ← núcleo do produto
3. Dashboard
4. Diário alimentar
5. Regimes
6. Relatórios & configurações
7. Testes & lançamento

## Ao terminar uma mudança
- Rode `npm run lint` e, quando fizer sentido, `npm run build` antes de dar como pronto.
- Não invente dados de saúde/clínicos; siga o PRD.
