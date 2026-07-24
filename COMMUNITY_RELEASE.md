# PathWiser community release runbook

The repository is community-product capable, but it is not a public deployment by itself. Complete the following owner-controlled steps before inviting real people.

## Required launch configuration

1. Create the production Supabase project and apply `0001_init.sql`, `0002_community_production.sql`, `0003_durable_workflows.sql`, and `0004_production_controls.sql` in order.
2. Import a governed, consented trajectory corpus; validate embeddings and set `EVIDENCE_CORPUS_SYNTHETIC=false` only after that import is approved.
3. Set `AUTH_MODE=required`, `ALLOW_FULL_MODE=true`, `NEXT_PUBLIC_ENABLE_JUDGE_MODE=false`, Supabase credentials and the AI provider key in the hosting platform.
4. Complete PDPA/legal review, retention/deletion rules, incident response, accessibility testing and a documented fairness review for candidate discovery.
5. Configure a distributed rate limiter and production observability. Schedule `POST /api/operations/retention` with `Authorization: Bearer CRON_SECRET`; the bundled limiter is intentionally per application instance and is not sufficient across a multi-instance deployment.
6. Run `npm run lint`, `npm run test`, `npm run typecheck`, `npm run build`, `npm run test:smoke`, `npm run test:a11y`, and `npm audit --json`, then complete the authenticated acceptance suite in `TESTING_AND_SYSTEM_DESIGN.md` for candidate, employer, university and admin accounts.
7. Configure the production domain, email confirmation templates, backups, uptime alerts and a user-support route.

## Go/no-go checks

- `/api/health` returns `200`, `full_mode_requested: true`, authentication `required`, and evidence mode `community`.
- An employer account cannot access university/candidate pages and cannot retrieve a candidate who revoked employer-discovery consent.
- Candidate/account identifiers and email addresses never appear in matching responses.
- Account export returns only the requesting user's RLS-scoped data, and self-service deletion removes the auth identity plus account-owned records.
- Every numeric claim can be traced to deterministic aggregation and every user-facing evidence panel states its source and cohort size.
- A provider outage produces a deterministic coach summary rather than an error or invented answer.
