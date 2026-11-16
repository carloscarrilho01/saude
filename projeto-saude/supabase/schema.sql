-- Projeto Saúde — schema inicial (Postgres / Supabase)
-- Segue PRD §5 e §4.1 (segurança/privacidade). RLS por usuário em TODAS as
-- tabelas, auth.uid() sempre envolvido em (select ...) para performance, e
-- índices nas colunas usadas por RLS e por filtros de data.
--
-- Rode no SQL Editor do Supabase (ou via migration). Idempotente onde possível.

-- ============================================================
-- PERFIL (1:1 com auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  peso_kg numeric(5,2),
  altura_cm numeric(5,1),
  idade int,
  sexo text check (sexo in ('feminino','masculino','outro')),
  nivel_atividade text not null default 'moderado'
    check (nivel_atividade in ('sedentario','leve','moderado','intenso')),
  clima text not null default 'ameno'
    check (clima in ('ameno','quente','muito_quente')),
  unidade text not null default 'ml' check (unidade in ('ml','oz')),
  fuso text not null default 'America/Sao_Paulo',
  consentimento_aceito_em timestamptz,
  consentimento_versao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- METAS DE ÁGUA (histórico; nunca sobrescreve)
-- ============================================================
create table if not exists public.water_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meta_ml int not null,
  metodo text not null default 'auto' check (metodo in ('auto','manual')),
  coeficiente_idade int,
  ajuste_atividade_ml int not null default 0,
  ajuste_clima_ml int not null default 0,
  valido_desde timestamptz not null default now(),
  valido_ate timestamptz
);
create index if not exists water_goals_user_idx on public.water_goals (user_id);
create index if not exists water_goals_vigente_idx
  on public.water_goals (user_id) where valido_ate is null;

-- ============================================================
-- REGISTROS DE ÁGUA
-- ============================================================
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quantidade_ml int not null check (quantidade_ml > 0),
  origem text not null default 'botao_rapido'
    check (origem in ('botao_rapido','manual','outro')),
  registrado_em timestamptz not null default now(),
  data_local date not null
);
create index if not exists water_logs_user_data_idx
  on public.water_logs (user_id, data_local);

-- ============================================================
-- CONFIGURAÇÃO DE LEMBRETES (1 por usuário)
-- ============================================================
create table if not exists public.reminder_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ativo boolean not null default false,
  intervalo_min int not null default 90,
  hora_inicio time not null default '08:00',
  hora_fim time not null default '22:00',
  dias_semana int[] not null default '{0,1,2,3,4,5,6}',
  pausar_apos_meta boolean not null default true,
  snooze_min int not null default 15,
  ultimo_lembrete_em timestamptz,
  adiado_ate timestamptz
);

-- ============================================================
-- REGIMES (planos alimentares)
-- ============================================================
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  objetivo text not null check (objetivo in ('perder','manter','ganhar','hidratacao')),
  data_inicio date not null,
  duracao_dias int not null check (duracao_dias > 0),
  data_fim date,
  meta_calorias int,
  status text not null default 'pausado' check (status in ('ativo','pausado','encerrado')),
  ativado_em timestamptz,
  encerrado_em timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists meal_plans_user_idx on public.meal_plans (user_id);
-- garante no máximo UM plano ativo por usuário
create unique index if not exists meal_plans_um_ativo_idx
  on public.meal_plans (user_id) where status = 'ativo';

-- ============================================================
-- REFEIÇÕES PLANEJADAS
-- ============================================================
create table if not exists public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.meal_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('cafe','almoco','lanche','jantar','outro')),
  horario time not null,
  descricao text not null default '',
  ordem int not null default 0,
  -- PRD §3.5: mudanças valem a partir da data local da alteração.
  -- Remover = preencher removida_em (soft delete); o histórico de aderência não muda.
  ativa_desde date,                  -- null = desde o início do plano
  removida_em date,                  -- null = vigente
  constraint planned_meals_vigencia_chk check (removida_em is null or ativa_desde is null or removida_em >= ativa_desde)
);
create index if not exists planned_meals_plan_idx on public.planned_meals (plan_id);
-- leitura mais comum: refeições vigentes de um plano
create index if not exists planned_meals_vigentes_idx on public.planned_meals (plan_id, ordem) where removida_em is null;
create index if not exists planned_meals_user_idx on public.planned_meals (user_id);

-- ============================================================
-- CONCLUSÕES DE REFEIÇÃO (por dia)
-- ============================================================
create table if not exists public.meal_completions (
  id uuid primary key default gen_random_uuid(),
  planned_meal_id uuid not null references public.planned_meals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  data_local date not null,
  concluida boolean not null default true,
  concluida_em timestamptz not null default now(),
  unique (planned_meal_id, data_local)
);
create index if not exists meal_completions_user_data_idx
  on public.meal_completions (user_id, data_local);

-- ============================================================
-- DIÁRIO ALIMENTAR
-- ============================================================
create table if not exists public.diary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  planned_meal_id uuid references public.planned_meals (id) on delete set null,
  tipo_refeicao text not null check (tipo_refeicao in ('cafe','almoco','lanche','jantar','outro')),
  alimento text not null,
  quantidade numeric not null check (quantidade > 0),
  unidade text not null check (unidade in ('g','ml','unidade','porcao','fatia','colher')),
  observacao text,
  calorias int,
  eh_bebida boolean not null default false,
  registrado_em timestamptz not null default now(),
  data_local date not null
);
create index if not exists diary_items_user_data_idx
  on public.diary_items (user_id, data_local);
create index if not exists diary_items_planned_meal_idx
  on public.diary_items (planned_meal_id);

-- ============================================================
-- AUDITORIA DE SEGURANÇA (SEC-9)
-- ============================================================
create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null,
  detalhe text,
  created_at timestamptz not null default now()
);
create index if not exists security_events_user_idx on public.security_events (user_id);

-- ============================================================
-- ROW LEVEL SECURITY — isolamento por usuário (SEC-1, SEC-2)
-- Habilita RLS e cria policy "dono das linhas" em cada tabela.
-- auth.uid() envolvido em (select ...) para ser avaliado uma vez (performance).
-- ============================================================
do $$
declare
  t text;
  col text;
  tabelas text[] := array[
    'water_goals','water_logs','reminder_settings','meal_plans',
    'planned_meals','meal_completions','diary_items','security_events'
  ];
begin
  foreach t in array tabelas loop
    execute format('alter table public.%I enable row level security;', t);
    -- reminder_settings usa user_id como PK; todas têm coluna user_id
    col := 'user_id';
    execute format($f$
      drop policy if exists %1$I_own on public.%1$I;
      create policy %1$I_own on public.%1$I
        for all
        using ((select auth.uid()) = %2$I)
        with check ((select auth.uid()) = %2$I);
    $f$, t, col);
  end loop;
end $$;

-- profiles: a chave é o próprio id (= auth.uid())
alter table public.profiles enable row level security;
drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
  for all
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ============================================================
-- TRIGGER: cria o profile automaticamente ao criar o usuário
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- COMUNIDADE — FASE 1: MURAL DE PLANOS (RF-5.10)
-- Só a ESTRUTURA do plano é pública. Nunca fotos, progresso ou perfil de saúde.
-- Leitura pública (anon) das publicações ativas; escrita só autenticado e só o
-- que é seu. Contadores e ocultação por denúncia são mantidos por triggers
-- (security definer) — o cliente não consegue alterá-los.
-- ============================================================
create table if not exists public.mural_planos (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references auth.users (id) on delete cascade,
  apelido text not null check (char_length(apelido) between 2 and 24),
  oficial boolean not null default false,
  nome text not null check (char_length(nome) between 3 and 60),
  descricao text not null check (char_length(descricao) between 10 and 280),
  objetivo text not null check (objetivo in ('perder','manter','ganhar','hidratacao')),
  duracao_dias int not null check (duracao_dias between 1 and 365),
  -- [{tipo, horario, descricao}] — validado também no cliente (lib/mural/regras.ts)
  refeicoes jsonb not null check (jsonb_typeof(refeicoes) = 'array' and jsonb_array_length(refeicoes) between 1 and 12),
  status text not null default 'publicado' check (status in ('publicado','oculto','removido')),
  salvamentos int not null default 0,
  uteis int not null default 0,
  denuncias int not null default 0,
  publicado_em timestamptz not null default now()
);
-- feed: publicações ativas por data ou por salvamentos
create index if not exists mural_planos_feed_recentes_idx on public.mural_planos (publicado_em desc) where status = 'publicado';
create index if not exists mural_planos_feed_salvos_idx on public.mural_planos (salvamentos desc) where status = 'publicado';
create index if not exists mural_planos_autor_idx on public.mural_planos (autor_id);

create table if not exists public.mural_uteis (
  plano_id uuid not null references public.mural_planos (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (plano_id, usuario_id)
);
create index if not exists mural_uteis_usuario_idx on public.mural_uteis (usuario_id);

create table if not exists public.mural_salvamentos (
  plano_id uuid not null references public.mural_planos (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (plano_id, usuario_id)
);
create index if not exists mural_salvamentos_usuario_idx on public.mural_salvamentos (usuario_id);

create table if not exists public.mural_denuncias (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid not null references public.mural_planos (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  motivo text not null check (motivo in ('saude','spam','ofensivo','outro')),
  criado_em timestamptz not null default now(),
  resolvida_em timestamptz,
  unique (plano_id, usuario_id)
);
create index if not exists mural_denuncias_pendentes_idx on public.mural_denuncias (criado_em) where resolvida_em is null;
create index if not exists mural_denuncias_usuario_idx on public.mural_denuncias (usuario_id);

alter table public.mural_planos enable row level security;
alter table public.mural_uteis enable row level security;
alter table public.mural_salvamentos enable row level security;
alter table public.mural_denuncias enable row level security;

-- publicações: todos leem as ativas; o autor também vê as suas
drop policy if exists mural_planos_ler on public.mural_planos;
create policy mural_planos_ler on public.mural_planos for select
  using (status = 'publicado' or autor_id = (select auth.uid()));
drop policy if exists mural_planos_publicar on public.mural_planos;
create policy mural_planos_publicar on public.mural_planos for insert to authenticated
  with check (autor_id = (select auth.uid()) and oficial = false and status = 'publicado'
              and salvamentos = 0 and uteis = 0 and denuncias = 0);
-- o autor só pode remover a própria publicação (status → 'removido'); demais colunas protegidas pelo trigger abaixo
drop policy if exists mural_planos_remover on public.mural_planos;
create policy mural_planos_remover on public.mural_planos for update to authenticated
  using (autor_id = (select auth.uid()))
  with check (autor_id = (select auth.uid()) and status = 'removido');

create or replace function public.mural_proteger_colunas()
returns trigger language plpgsql set search_path = '' as $$
begin
  -- atualizações feitas pelos triggers de contagem (profundidade > 1) passam
  if pg_trigger_depth() > 1 then
    return new;
  end if;
  -- usuários comuns só mudam o status; contadores e conteúdo ficam como estavam
  if (select auth.role()) = 'authenticated' then
    new := jsonb_populate_record(old, jsonb_build_object('status', new.status));
  end if;
  return new;
end;
$$;
drop trigger if exists mural_proteger_colunas on public.mural_planos;
create trigger mural_proteger_colunas before update on public.mural_planos
  for each row execute function public.mural_proteger_colunas();

-- interações: cada um vê e mexe só nas suas
drop policy if exists mural_uteis_own on public.mural_uteis;
create policy mural_uteis_own on public.mural_uteis for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
drop policy if exists mural_salvamentos_own on public.mural_salvamentos;
create policy mural_salvamentos_own on public.mural_salvamentos for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
-- denúncia: insere e vê só as suas; não dá para denunciar o próprio plano
drop policy if exists mural_denuncias_inserir on public.mural_denuncias;
create policy mural_denuncias_inserir on public.mural_denuncias for insert to authenticated
  with check (usuario_id = (select auth.uid())
              and not exists (select 1 from public.mural_planos p where p.id = plano_id and p.autor_id = (select auth.uid())));
drop policy if exists mural_denuncias_ler on public.mural_denuncias;
create policy mural_denuncias_ler on public.mural_denuncias for select to authenticated
  using (usuario_id = (select auth.uid()));

-- contadores mantidos pelo banco
create or replace function public.mural_contar()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  alvo uuid := coalesce(new.plano_id, old.plano_id);
  delta int := case when tg_op = 'INSERT' then 1 else -1 end;
begin
  if tg_table_name = 'mural_uteis' then
    update public.mural_planos set uteis = greatest(0, uteis + delta) where id = alvo;
  elsif tg_table_name = 'mural_salvamentos' then
    update public.mural_planos set salvamentos = greatest(0, salvamentos + delta) where id = alvo;
  elsif tg_table_name = 'mural_denuncias' and tg_op = 'INSERT' then
    -- 3 denúncias de pessoas diferentes ocultam até revisão manual
    update public.mural_planos
      set denuncias = denuncias + 1,
          status = case when denuncias + 1 >= 3 and status = 'publicado' then 'oculto' else status end
      where id = alvo;
  end if;
  return null;
end;
$$;
drop trigger if exists mural_uteis_contar on public.mural_uteis;
create trigger mural_uteis_contar after insert or delete on public.mural_uteis
  for each row execute function public.mural_contar();
drop trigger if exists mural_salvamentos_contar on public.mural_salvamentos;
create trigger mural_salvamentos_contar after insert or delete on public.mural_salvamentos
  for each row execute function public.mural_contar();
drop trigger if exists mural_denuncias_contar on public.mural_denuncias;
create trigger mural_denuncias_contar after insert on public.mural_denuncias
  for each row execute function public.mural_contar();
