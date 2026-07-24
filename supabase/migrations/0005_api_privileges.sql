-- Explicit PostgREST privileges for PathWiser API roles.
-- RLS policies remain the row-level authority; these grants only make the
-- intended operations reachable through Supabase's API gateway.

grant usage on schema public to anon, authenticated, service_role;

-- Public, anonymised evidence and marketplace data.
grant select on table
  public.trajectories,
  public.companies,
  public.job_listings
to anon, authenticated;

-- Account-owned data. Existing RLS policies restrict every operation to the
-- signed-in user's own rows and organisation memberships.
grant select, insert, update, delete on table
  public.user_shapes,
  public.feedback_sessions,
  public.consent_records,
  public.workspace_records,
  public.saved_marketplace_items
to authenticated;

grant select, insert on table public.organisations to authenticated;
grant select on table public.organisation_members to authenticated;
grant select, insert on table public.audit_events to authenticated;
grant select on table public.engine_sessions to authenticated;

-- Identity-backed tables require sequence access for permitted inserts.
grant usage, select on all sequences in schema public to authenticated;

-- Server-only modules use the service role for observability, aggregation,
-- retrieval, retention and account administration.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Retrieval is server-mediated so callers cannot enumerate raw vectors.
revoke all on function public.match_trajectories(vector, int, text, text, text)
  from public, anon, authenticated;
grant execute on function public.match_trajectories(vector, int, text, text, text)
  to service_role;

-- Preserve the deliberately narrower function contracts established earlier.
revoke all on function public.match_consented_candidates(vector, int) from public, anon;
grant execute on function public.match_consented_candidates(vector, int) to authenticated, service_role;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated, service_role;

revoke all on function public.purge_expired_operational_data(timestamptz)
  from public, anon, authenticated;
grant execute on function public.purge_expired_operational_data(timestamptz)
  to service_role;

-- Future server-side objects created by the same migration owner remain
-- available to the service role without broadening anonymous access.
alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant all privileges on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to service_role;
