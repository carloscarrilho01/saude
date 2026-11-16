# Fundação Supabase — passo a passo

Esta é a fase que destrava o **login real**, o **banco multiusuário** e os
**lembretes com o app fechado** (push via servidor). Precisa de alguns passos
seus (criar a conta/projeto) porque eu não tenho como logar na sua conta.

## O que você faz (uma vez)

1. Crie uma conta grátis em https://supabase.com e um **novo projeto** (escolha
   uma senha de banco e a região mais perto — ex.: São Paulo).
2. Quando o projeto subir, vá em **SQL Editor** → **New query**, cole TODO o
   conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria as tabelas,
   as políticas de segurança (RLS por usuário) e o gatilho de perfil.
3. Vá em **Settings → API** e copie dois valores:
   - **Project URL** (ex.: `https://abcxyz.supabase.co`)
   - **anon public** key (a chave pública; NÃO a `service_role`).
4. Me mande esses dois valores aqui no chat **ou** crie o arquivo
   `projeto-saude/.env.local` (copiando de `.env.local.example`) e cole lá.

> A `anon key` é pública por design (vai pro navegador); a segurança vem das
> políticas RLS do banco. **Nunca** me mande a `service_role` key.

## O que eu faço (depois que você me passar as chaves)

1. Ligar a **autenticação** (cadastro/login por e-mail) nas telas de onboarding
   e "Já tenho uma conta".
2. Trocar a camada de dados (`storage.ts` → repositórios Supabase) **sem mexer
   nas telas** — elas já só conhecem as funções de dados.
3. Migrar os dados que estiverem no `localStorage` para a conta ao fazer login.
4. Implementar os requisitos de privacidade testáveis do PRD §4.1 (exportar
   dados, excluir conta, registro de auditoria).
5. (Opcional, fase seguinte) **Push com app fechado**: Edge Function + VAPID para
   enviar os lembretes mesmo sem o app aberto.

## Status atual (já pronto no código)

- `@supabase/supabase-js` e `@supabase/ssr` instalados.
- `src/lib/supabaseClient.ts` — client que só ativa quando as chaves existem;
  enquanto não existem, o app segue no localStorage (nada quebra).
- `supabase/schema.sql` — schema completo com RLS e índices (boas práticas).
- `.env.local.example` — modelo das variáveis.
- **Mural de planos (Comunidade, fase 1)** — tabelas `mural_*` no mesmo `schema.sql`,
  com leitura pública, escrita só autenticada, contadores e ocultação por denúncia
  mantidos por triggers. O schema foi executado e as regras de RLS testadas num
  Postgres 16 local com um `auth` simulado (publicar como outra pessoa, forjar selo
  oficial, inflar contador, autodenúncia e denúncia dupla são bloqueados; 3 denúncias
  ocultam). A camada `src/lib/mural/supabase.ts` ainda **não foi testada contra um
  projeto Supabase real** — validar assim que houver chaves. Ela depende do login
  (passo 1 acima) para publicar, marcar útil, salvar e denunciar.
- **Moderação:** denúncias ficam em `mural_denuncias` (`resolvida_em` nulo =
  pendente). Até existir um painel, revisar pelo Table Editor do Supabase: para
  liberar, mude `status` de `oculto` para `publicado`; para remover, `removido`.
