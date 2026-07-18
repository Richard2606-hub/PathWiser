-- ═══════════════════════════════════════════
-- PathWiser · Initial schema
-- Paste this into Supabase SQL Editor after creating a new project.
-- Enables pgvector, creates trajectory + user tables, adds RLS policies.
-- ═══════════════════════════════════════════

-- 1. Extensions
create extension if not exists vector;   -- pgvector for embeddings
create extension if not exists pgcrypto; -- gen_random_uuid()

-- 2. Users (extends Supabase auth.users via user_shapes)
create table if not exists public.user_shapes (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  persona       text not null check (persona in ('candidate','employer','university')),
  role_title    text not null,
  esco_code     text,
  onet_code     text,
  masco_code    text,
  education     text,
  years_experience int not null default 0,
  state         text,
  skills        text[] not null default '{}',
  life_stage    text not null check (life_stage in ('student','young_adult','early_career','mid_career','senior_career','executive')),
  work_animal   text check (work_animal in ('owl','fox','bear','dolphin','eagle','ant')),
  shape_vector  vector(768), -- text-embedding-004 output dim
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 3. Trajectory corpus — anonymised, synthetic-but-DOSM-calibrated
create table if not exists public.trajectories (
  id            uuid primary key default gen_random_uuid(),
  persona       text not null check (persona in ('candidate','employer','university')),
  life_stage    text not null,
  state         text,
  sector        text,
  path          jsonb not null,        -- array of TrajectoryNode
  esco_codes    text[] not null default '{}',
  synthetic     boolean not null default true,
  calibration_source text not null,
  embedding     vector(768) not null,  -- text-embedding-004
  created_at    timestamptz not null default now()
);

-- HNSW index for fast cosine similarity
create index if not exists trajectories_embedding_hnsw_idx
  on public.trajectories using hnsw (embedding vector_cosine_ops);

-- Filter indexes
create index if not exists trajectories_life_stage_idx on public.trajectories(life_stage);
create index if not exists trajectories_state_idx on public.trajectories(state);
create index if not exists trajectories_sector_idx on public.trajectories(sector);

-- 4. Job listings
create table if not exists public.job_listings (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  company_id    uuid references public.companies(id),
  location      text not null,
  sector        text,
  salary_min    int,
  salary_max    int,
  experience    text,
  remote_mode   text check (remote_mode in ('Onsite','Hybrid','Remote')),
  skills        text[] not null default '{}',
  mycol_critical boolean not null default false,
  posted_at     timestamptz not null default now(),
  description   text,
  active        boolean not null default true,
  role_shape_vector vector(768)  -- optional: for trajectory-fit ranking
);

create index if not exists job_listings_role_shape_hnsw_idx
  on public.job_listings using hnsw (role_shape_vector vector_cosine_ops)
  where role_shape_vector is not null;
create index if not exists job_listings_active_idx on public.job_listings(active);

-- 5. Companies (employer directory)
create table if not exists public.companies (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  logo_emoji     text,
  sector         text,
  headcount_band text,
  hires_per_year int,
  retention_pct  numeric,
  culture        text,
  hiring_shape   text,
  mycol_roles_count int not null default 0,
  next_destinations text[] not null default '{}',
  sdgs           int[] not null default '{}'
);

-- 6. Feedback (Support Layer)
create table if not exists public.feedback_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  module        text not null,
  accuracy_rating int check (accuracy_rating between 1 and 5),
  freshness_rating int check (freshness_rating between 1 and 5),
  reflection    text,
  private_note  text,
  created_at    timestamptz not null default now()
);

-- 7. Engine session log (Analytics)
create table if not exists public.engine_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  module        text not null,
  cohort_size   int,
  similarity_mean numeric,
  latency_ms    int,
  validation_passed boolean,
  created_at    timestamptz not null default now()
);

-- ═══════════════════════════════════════════
-- pgvector RPC for retrieval
-- ═══════════════════════════════════════════
create or replace function public.match_trajectories(
  query_embedding vector(768),
  match_count int default 1200,
  filter_life_stage text default null,
  filter_state text default null,
  filter_sector text default null
) returns table (
  id uuid,
  persona text,
  life_stage text,
  state text,
  sector text,
  path jsonb,
  esco_codes text[],
  synthetic boolean,
  calibration_source text,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query
  select
    t.id, t.persona, t.life_stage, t.state, t.sector,
    t.path, t.esco_codes, t.synthetic, t.calibration_source,
    1 - (t.embedding <=> query_embedding) as similarity
  from public.trajectories t
  where (filter_life_stage is null or t.life_stage = filter_life_stage)
    and (filter_state is null or t.state = filter_state)
    and (filter_sector is null or t.sector = filter_sector)
  order by t.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ═══════════════════════════════════════════
-- Row-Level Security
-- ═══════════════════════════════════════════
alter table public.user_shapes enable row level security;
alter table public.feedback_sessions enable row level security;
alter table public.engine_sessions enable row level security;
-- trajectories, job_listings, companies are read-public (they're the corpus)
alter table public.trajectories enable row level security;
alter table public.job_listings enable row level security;
alter table public.companies enable row level security;

-- Users read/write only their own shape
create policy user_shapes_own_read on public.user_shapes
  for select using (auth.uid() = user_id);
create policy user_shapes_own_write on public.user_shapes
  for insert with check (auth.uid() = user_id);
create policy user_shapes_own_update on public.user_shapes
  for update using (auth.uid() = user_id);

-- Users read/write only their own feedback
create policy feedback_own_all on public.feedback_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Engine sessions: user reads only their own; server writes for anyone (service role bypasses RLS)
create policy engine_own_read on public.engine_sessions
  for select using (auth.uid() = user_id);

-- Trajectories, jobs, companies: public read (anonymised corpus)
create policy trajectories_public_read on public.trajectories for select using (true);
create policy job_listings_public_read on public.job_listings for select using (true);
create policy companies_public_read on public.companies for select using (true);
