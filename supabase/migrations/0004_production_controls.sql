-- PathWiser production controls: data portability, self-service erasure and
-- operational retention. Apply after 0003_durable_workflows.sql.

create table if not exists public.retention_runs (
  id bigint generated always as identity primary key,
  engine_sessions_deleted int not null default 0,
  feedback_deleted int not null default 0,
  revoked_consents_deleted int not null default 0,
  archived_records_deleted int not null default 0,
  audit_events_deleted int not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.retention_runs enable row level security;
-- Deliberately no user-facing policy. Only service-role operations may access it.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_user uuid := auth.uid();
begin
  if target_user is null then
    raise exception 'Authentication required';
  end if;

  delete from auth.users where id = target_user;
  if not found then
    raise exception 'Account not found';
  end if;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

create or replace function public.purge_expired_operational_data(
  run_at timestamptz default now()
)
returns table (
  engine_sessions_deleted int,
  feedback_deleted int,
  revoked_consents_deleted int,
  archived_records_deleted int,
  audit_events_deleted int,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  engine_count int := 0;
  feedback_count int := 0;
  consent_count int := 0;
  record_count int := 0;
  audit_count int := 0;
  finished timestamptz;
begin
  delete from public.engine_sessions where created_at < run_at - interval '90 days';
  get diagnostics engine_count = row_count;

  delete from public.feedback_sessions where created_at < run_at - interval '365 days';
  get diagnostics feedback_count = row_count;

  delete from public.consent_records
  where revoked_at is not null and revoked_at < run_at - interval '730 days';
  get diagnostics consent_count = row_count;

  delete from public.workspace_records
  where status = 'archived' and updated_at < run_at - interval '365 days';
  get diagnostics record_count = row_count;

  delete from public.audit_events where created_at < run_at - interval '730 days';
  get diagnostics audit_count = row_count;

  insert into public.retention_runs (
    engine_sessions_deleted,
    feedback_deleted,
    revoked_consents_deleted,
    archived_records_deleted,
    audit_events_deleted
  ) values (engine_count, feedback_count, consent_count, record_count, audit_count)
  returning retention_runs.completed_at into finished;

  return query select engine_count, feedback_count, consent_count, record_count, audit_count, finished;
end;
$$;

revoke all on function public.purge_expired_operational_data(timestamptz) from public;
revoke all on function public.purge_expired_operational_data(timestamptz) from anon;
revoke all on function public.purge_expired_operational_data(timestamptz) from authenticated;
grant execute on function public.purge_expired_operational_data(timestamptz) to service_role;
