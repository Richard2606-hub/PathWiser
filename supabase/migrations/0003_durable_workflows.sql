-- Durable user workflows for production PathWiser modules.

create table if not exists public.workspace_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null check (module in (
    'retention_signals',
    'onboarding_predictor',
    'outcome_loop',
    'curriculum_engine',
    'readiness_profile'
  )),
  record_type text not null,
  title text not null,
  status text not null default 'active' check (status in ('draft','active','review_due','completed','archived')),
  payload jsonb not null default '{}'::jsonb,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_records_user_module_idx
  on public.workspace_records(user_id, module, updated_at desc);
create index if not exists workspace_records_review_idx
  on public.workspace_records(user_id, next_review_at)
  where status in ('active','review_due');

create table if not exists public.saved_marketplace_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_kind text not null check (item_kind in ('job','company')),
  item_key text not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, item_kind, item_key)
);

alter table public.feedback_sessions
  add column if not exists source_path text,
  add column if not exists output_reference text,
  add column if not exists curation_status text not null default 'received'
    check (curation_status in ('received','triaged','accepted','declined'));

alter table public.workspace_records enable row level security;
alter table public.saved_marketplace_items enable row level security;

create policy workspace_records_own_all on public.workspace_records for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saved_marketplace_items_own_all on public.saved_marketplace_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audit_events_own_insert on public.audit_events for insert
  with check (actor_user_id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspace_records_touch_updated_at on public.workspace_records;
create trigger workspace_records_touch_updated_at
before update on public.workspace_records
for each row execute procedure public.touch_updated_at();
