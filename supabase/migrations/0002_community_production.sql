-- PathWiser community production model: organisations, consent, discoverability,
-- immutable audit events, and privacy-safe employer discovery.

create extension if not exists pgcrypto;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('employer','university')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.organisation_members (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);

alter table public.user_shapes
  add column if not exists display_name text,
  add column if not exists profile_summary text,
  add column if not exists discoverable boolean not null default false,
  add column if not exists dimensions jsonb not null default '{"technical":50,"domain":50,"leadership":50,"analytics":50,"communication":50}'::jsonb;

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('trajectory_contribution','employer_discovery','programme_outcomes','research')),
  grantee_organisation_id uuid references public.organisations(id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique nulls not distinct (user_id, consent_type, grantee_organisation_id)
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists consent_records_active_idx
  on public.consent_records(user_id, consent_type) where revoked_at is null;
create index if not exists user_shapes_discoverable_idx
  on public.user_shapes(persona, discoverable) where discoverable = true;

alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.consent_records enable row level security;
alter table public.audit_events enable row level security;

create policy organisations_member_read on public.organisations for select
  using (exists (select 1 from public.organisation_members m where m.organisation_id = id and m.user_id = auth.uid()));
create policy organisations_authenticated_create on public.organisations for insert
  with check (auth.uid() = created_by);
create policy organisation_members_member_read on public.organisation_members for select
  using (user_id = auth.uid());
create policy consent_records_own_all on public.consent_records for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audit_events_own_read on public.audit_events for select using (actor_user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_shapes (user_id, persona, role_title, education, years_experience, state, skills, life_stage, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'persona', 'candidate'),
    coalesce(new.raw_user_meta_data->>'role_title', 'Getting started'),
    '', 0, '', '{}',
    case when coalesce(new.raw_user_meta_data->>'persona', 'candidate') = 'university' then 'senior_career' else 'early_career' end,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  ) on conflict (user_id) do nothing;
  if coalesce(new.raw_user_meta_data->>'persona', 'candidate') in ('employer', 'university') then
    with created as (
      insert into public.organisations (name, kind, created_by)
      values (
        coalesce(new.raw_user_meta_data->>'organisation_name', new.raw_user_meta_data->>'display_name', 'New organisation'),
        new.raw_user_meta_data->>'persona',
        new.id
      ) returning id
    )
    insert into public.organisation_members (organisation_id, user_id, member_role)
    select id, new.id, 'owner' from created;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Only authenticated employer members can retrieve candidates who explicitly
-- opted into employer discovery. The function returns no email or account ID.
create or replace function public.match_consented_candidates(
  query_embedding vector(768),
  match_count int default 20
) returns table (
  candidate_key text,
  display_name text,
  "current_role" text,
  state text,
  skills text[],
  similarity float
)
language plpgsql security definer stable set search_path = public as $$
begin
  if not exists (
    select 1 from public.organisation_members m
    join public.organisations o on o.id = m.organisation_id
    where m.user_id = auth.uid() and o.kind = 'employer'
  ) then
    raise exception 'Employer organisation membership required';
  end if;

  return query
  select encode(digest(s.user_id::text, 'sha256'), 'hex'),
         coalesce(s.display_name, 'Consented candidate'), s.role_title, s.state, s.skills,
         1 - (s.shape_vector <=> query_embedding)
  from public.user_shapes s
  where s.persona = 'candidate'
    and s.discoverable = true
    and s.shape_vector is not null
    and exists (
      select 1 from public.consent_records c
      where c.user_id = s.user_id and c.consent_type = 'employer_discovery' and c.revoked_at is null
    )
  order by s.shape_vector <=> query_embedding
  limit least(match_count, 50);
end;
$$;

revoke all on function public.match_consented_candidates(vector, int) from public;
grant execute on function public.match_consented_candidates(vector, int) to authenticated;
