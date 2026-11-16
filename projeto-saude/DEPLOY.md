# Publicação na Vercel — Orvalho

## Configuração do projeto (uma vez)
| Campo | Valor |
|---|---|
| Repositório | `carloscarrilho01/saude` |
| **Root Directory** | `projeto-saude` (o app não está na raiz do repo) |
| Framework | Next.js (detectado automaticamente) |
| Build / Install | padrão (`next build` / `npm install`) |
| Node | 22.x ou 24.x |

## Fluxo de branches
- **`main` → Produção** (domínio principal). Só entra via Pull Request.
- **Qualquer outra branch / PR → Preview** (URL própria, para testar antes de juntar).
- Rollback: na Vercel, *Deployments → (deploy anterior) → Promote to Production*.

## Variáveis de ambiente
Hoje o app roda 100% no navegador (localStorage) e **não precisa de nenhuma variável**.
Quando o Supabase entrar (ver `supabase/SETUP.md`), cadastrar em
*Project Settings → Environment Variables* para Production e Preview:

| Nome | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (chave `anon`/publishable) |

Nunca colocar a `service_role` em variável `NEXT_PUBLIC_*`.

## Rotas
- `/` — landing pública (página de vendas, renderizada estática)
- `/onboarding` — cálculo da meta e criação do perfil
- `/inicio`, `/agua`, `/diario`, `/planos`, `/perfil`… — o app (PWA, `start_url` = `/inicio`)

## Checklist antes de promover para produção
- [ ] `npm run lint` e `npm run build` sem erros
- [ ] Testar o preview no celular (instalar na tela inicial, lembrete de teste)
- [ ] Landing: textos conferidos, links "Criar minha meta" → `/onboarding`
- [ ] Domínio próprio apontado (opcional): *Settings → Domains*
- [ ] Antes de abrir para o público: aprovação clínica dos coeficientes (PRD §10.1) e política de privacidade publicada
