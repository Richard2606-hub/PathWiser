-- Supabase installs pgcrypto in the `extensions` schema. The matching function
-- deliberately fixes its search_path to `public`, so digest must be qualified.

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
  select encode(extensions.digest(s.user_id::text, 'sha256'), 'hex'),
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
