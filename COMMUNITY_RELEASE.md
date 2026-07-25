# PathWiser community release runbook

The repository is community-product capable, but it is not a public deployment by itself. Complete the following owner-controlled steps before inviting real people.

Current verified state (25 July 2026): PR #8 extends the product to the full
Final Kit module library and the preview branch passes Vercel plus the GitHub
Production quality gate. The live production database was previously verified
through migration `0006_pgcrypto_digest_schema.sql`; this branch adds
`0007_final_kit_workspace_records.sql`, which must be applied with the
server-only database connection before account-backed saved records are accepted
for the six new Final Kit modules. Governed community tables are empty, so
anonymous preview personas use the separately labelled modelled corpus and
authenticated evidence remains cohort-gated. The temporary two-account RLS,
employer-membership, consent, revocation and cleanup test passed against
production before this Final Kit expansion; the updated production RLS suite also
checks that all six new Final Kit workspace record modules are insertable,
owner-readable and hidden from another account, so repeat it after applying
`0007`.

## Required launch configuration

1. Create or select the production Supabase project, set the server-only `SUPABASE_DB_URL` or `DATABASE_URL`, and run `npm run supabase:migrate`. The checksum-locked runner applies every numbered migration, currently `0001_init.sql` through `0007_final_kit_workspace_records.sql`, transactionally and in order.
2. Import a governed, consented trajectory corpus; validate embeddings and set `EVIDENCE_CORPUS_SYNTHETIC=false` only after that import is approved.
3. Set `AUTH_MODE=required`, `ALLOW_FULL_MODE=true`, `NEXT_PUBLIC_ENABLE_JUDGE_MODE=false`, Supabase credentials and the AI provider key in the hosting platform.
4. Complete PDPA/legal review, retention/deletion rules, incident response, accessibility testing and a documented fairness review for candidate discovery.
5. Configure a distributed rate limiter and production observability. Schedule `POST /api/operations/retention` with `Authorization: Bearer CRON_SECRET`; the bundled limiter is intentionally per application instance and is not sufficient across a multi-instance deployment.
6. Run `npm run release:preflight`, `npm run lint`, `npm run test`, `npm run typecheck`, `npm run test:openapi`, `npm run build`, `npm run test:smoke`, `npm run test:a11y`, `npm run test:rls:production`, `npm run test:hardening`, and `npm audit --omit=dev --json`, then complete the authenticated acceptance suite in `TESTING_AND_SYSTEM_DESIGN.md` for candidate, employer, university and admin accounts.
7. Configure the production domain, email confirmation templates, backups, uptime alerts and a user-support route.

## Go/no-go checks

- `/api/health` returns `200`, `full_mode_requested: true`, authentication `required`, and evidence mode `community`.
- An employer account cannot access university/candidate pages and cannot retrieve a candidate who revoked employer-discovery consent.
- Candidate/account identifiers and email addresses never appear in matching responses.
- Account export returns only the requesting user's RLS-scoped data, and self-service deletion removes the auth identity plus account-owned records.
- Every numeric claim can be traced to deterministic aggregation and every user-facing evidence panel states its source and cohort size.
- A provider outage produces a deterministic coach summary rather than an error or invented answer.
- The extended hard-testing pass is run against the final target URL, for example:
  `PATHWISER_BASE_URL=https://path-wiser-sigma.vercel.app HARD_TEST_MINUTES=120 npm run test:hardening`.
- The non-secret readiness preflight is run in strict mode with the final environment, for example:
  `PATHWISER_BASE_URL=https://path-wiser-sigma.vercel.app RELEASE_PREFLIGHT_STRICT=true npm run release:preflight`.
