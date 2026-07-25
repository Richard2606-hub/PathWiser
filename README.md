# PathWiser - Career OS Navigation Platform

> Release status: PathWiser is a production-built preview covering all fifteen audience modules from the proposal core and the Final Kit challenge library. Anonymous preview personas use clearly labelled modelled evidence; authenticated community evidence remains cohort-gated until a governed, consented corpus is approved. Complete the owner-controlled gates in [COMMUNITY_RELEASE.md](COMMUNITY_RELEASE.md) before inviting real community data.

Live production preview: [path-wiser-sigma.vercel.app](https://path-wiser-sigma.vercel.app/)

Submitted to the Talentbank Tech Hackathon 2026 - First Cohort. PathWiser is an evidence-based Career OS navigation platform built around the Career Twin Engine: retrieval, deterministic aggregation, and honest explanation for candidates, employers, and universities.

Navigation, not prediction. Every claim is cohort-grounded, with explicit cohort size, source and range disclosure. The LLM only explains computed evidence; it never invents individual predictions.

## What we built

All fifteen audience modules from the proposal core plus the Final Kit challenge library are implemented, backed by one shared engine and shared platform controls.

| Layer | Modules |
|---|---|
| Engine | User Profile and Shape; Trajectory Retrieval; Outcomes Aggregation; Honest Narrative |
| Candidate surface | Career Path Navigator; Living Portfolio; AI Career Coach; Fair Pay Engine; Life Chapter Designer |
| Employer surface | Smart Talent Matching; Talent Re-Engagement; Talent Retention Signals; Onboarding Success Predictor; Workforce Resilience Planner |
| University surface | Lifelong Outcome Loop; Live Internship Marketplace; Future-State Curriculum Engine; Alumni Readiness Profile; Lifelong Learning Wallet |
| Support | Feedback and Reflection; System Analytics; Security and Access |
| Marketplace | Job Listings; Company Directory |
| Meta | Architecture and Vision |

### Signature features

- Career Twin Engine: retrieval -> deterministic aggregation -> LLM explanation. Numbers come from aggregation, never from the LLM.
- Compare Paths: side-by-side destination trade-offs on the candidate navigator.
- Work Animal quiz: an 8-question personality read aligned with Talentbank's Menagerie-style framework.
- UN SDG mapping: every audience module is mapped to SDGs 4, 5, 8, 9, 10 and/or 17.
- Honest cohort disclosure: outputs state cohort size, source and limits.
- Server-enforced audience workspaces: authenticated accounts are restricted to candidate, employer or university routes.
- Community preview personas: three labelled modelled personas keep the product explorable while real community data is not yet approved.
- Full close/back UX: overlays include close buttons, Escape handling and backdrop/return paths.

## Quick start

Requirements:

- Node >= 18.17
- npm >= 9

Boot the app in preview mode:

```bash
npm install
npm run dev
# http://localhost:3000
```

This runs the engine end-to-end using an in-memory, modelled, DOSM-calibrated corpus. The interface discloses that evidence mode.

Enable full mode after migrations, credentials and governed data import:

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY and server-only DB URL for migrations.
npm run supabase:migrate
npm run dev
```

Set `ALLOW_FULL_MODE=true` only after Supabase, Gemini, consent/RLS policies, and the governed trajectory import are ready.

## Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint with zero warnings |
| `npm run typecheck` | TypeScript strict check |
| `npm run test` | Vitest coverage for engine, AI honesty, marketplace ranking, workspace fallback and module registry integrity |
| `npm run test:smoke` | Production HTTP, API, security-header and route smoke suite; server required |
| `npm run test:a11y` | WCAG A/AA semantic audit across public/auth, audience, marketplace and support routes; server required |
| `npm run test:hardening` | Repeatable smoke/accessibility hardening cycles; set `HARD_TEST_MINUTES=120` for the full two-hour soak |
| `npm run test:openapi` | Parse and verify the OpenAPI 3.1 evidence contract |
| `npm run test:rls:production` | Temporary two-account live RLS, consent and workspace-record test with verified cleanup; production credentials required |
| `npm run supabase:migrate` | Apply checksum-locked migrations `0001` through `0007` with `DATABASE_URL` or `SUPABASE_DB_URL` |
| `npm run release:preflight` | Non-secret launch readiness preflight for migrations, required environment names and optional target `/api/health` |

## Architecture

```text
User shape
  -> Trajectory Retrieval
     - pgvector HNSW cosine similarity in full mode
     - in-memory feature-vector cosine in modelled preview mode
     - audience, life-stage, geography and sector filters
     - minimum publishable cohort guard, k >= 50
  -> Range-of-Outcomes Aggregation
     - next-role distribution
     - salary percentiles
     - skill bridges
     - trade-offs
  -> Honest Narrative
     - LLM converts computed aggregates into hedged language
     - validator rejects predictive verbs and hallucinated numbers
     - deterministic template fallback if the provider is unavailable
  -> UI
     - 15 audience modules sharing one engine and platform-control layer
```

### Career Signal Loop

```text
Candidate choices and outcomes -> governed trajectory evidence
Employer demand and hiring feedback -> demand signal
University programme outcomes -> curriculum signal

All three surfaces feed the shared evidence loop only through consented,
aggregated and privacy-gated data.
```

## Integration notes for Talentbank

The integration seams are intentionally narrow:

- AI provider: implement the `AIProvider` interface in [lib/ai/interface.ts](lib/ai/interface.ts) and select it in [lib/ai/index.ts](lib/ai/index.ts).
- Retrieval/vector store: replace [lib/engine/retrieve.ts](lib/engine/retrieve.ts) while preserving the `retrieveCohort` contract.
- Trajectory corpus: load approved records into `public.trajectories`; the rest of the engine reads from the configured corpus.
- Auth: Supabase Auth is the default; Talentbank SSO can replace the client factory while keeping route and RLS boundaries.
- HTTP API: [openapi.yaml](openapi.yaml) covers health, navigation, coach, matching, profile, consent, feedback, durable records and marketplace endpoints.

## File map

```text
app/
  api/                       Engine, coach, matching, profile, consent, feedback, records, marketplace, health
  dashboard/
    candidate/               5 candidate modules
    employer/                5 employer modules
    university/              5 university modules
    engine/                  4 engine internals views
    marketplace/             Jobs and companies
    support/                 Feedback, analytics and security
    architecture/            System overview
  page.tsx                   Hero, storytelling and preview launch

components/
  common/                    Shared UI primitives and ClosableOverlay
  final-kit/                 Six Final Kit expansion module views
  hero/                      Product storytelling and audience launcher
  layout/                    Header, sidebar, route guards and bootstrap
  path-navigator/            Candidate graph and comparison
  marketplace/               Jobs and company directory
  support/                   Feedback, analytics and privacy/security

lib/
  ai/                        Provider interface, Gemini provider and validation
  corpus/                    Modules, SDGs, personas, generated trajectories, jobs and companies
  engine/                    Retrieval, aggregation, explanation and client wrapper
  records/                   Account/device workspace persistence
  security/                  Rate limits and same-origin mutation checks
  supabase/                  Browser/server/service clients

scripts/
  hard-test.mjs              Repeatable hardening harness
  migrate.ts                 Checksum-locked Supabase migration runner
  production-rls-test.ts     Live two-account RLS/consent/workspace test

supabase/migrations/         0001-0007 schema, RLS, consent, workflows, controls and Final Kit records
openapi.yaml                 Integration contract
legacy/                      Archived static prototype from the demo phase
```

## Data sources and attribution

| Source | Use | License |
|---|---|---|
| O*NET | Occupation and skill taxonomy | CC-BY 4.0 |
| ESCO | Occupation graph and ISCO mapping | EU Decision 2011/833/EU |
| DOSM Malaysia | Salary and graduate-outcome calibration anchors | CC-BY 4.0 |
| Michael Page / Hays / Robert Walters public salary guides | Headline role calibration only; tables are not reproduced | Public reports, cited |
| TalentCorp MyMahir Critical Occupations List | MyCOL badges | Public |
| Modelled PathWiser corpus | Disclosed preview evidence | Internal, disclosed |

Attribution is displayed in-product on the Architecture and Vision screen.

## Judging criteria alignment

| Criterion | How PathWiser addresses it |
|---|---|
| Product and UX Thinking | Evidence-first career navigation, interactive audience workspaces, close/back UX, responsive surfaces and preserved demo storytelling |
| System Design and Integration | One shared engine serving all fifteen audience modules, OpenAPI contract, provider abstraction, RLS and consent boundaries |
| Completeness | Proposal core plus Final Kit module library, durable workspace records, marketplace, feedback, analytics, security and release runbooks |
| AI Craft | Deterministic numbers, LLM explanation only, validation and template fallback |
| Code Quality | TypeScript strictness, Zod validation, automated tests, hardening harness, GitHub production quality gate |

## Owner-controlled work before public launch

The code includes consent records, RLS, organisations, profile persistence, privacy-safe matching, durable records and preview UX. A populated real-data community launch still requires:

- applying migration `0007` to production Supabase;
- running `RELEASE_PREFLIGHT_STRICT=true npm run release:preflight` with the final environment and `PATHWISER_BASE_URL`;
- rerunning `npm run test:rls:production`;
- running `HARD_TEST_MINUTES=120 npm run test:hardening` against the final URL;
- importing governed consented community data;
- completing PDPA/legal, fairness, backup/restore, monitoring, support and incident-response checks.

See [COMMUNITY_RELEASE.md](COMMUNITY_RELEASE.md) for the launch runbook.

## AI tools used

Declared per the Kick-Off requirement:

- Claude Code / Codex-style coding assistance for codebase authoring, architecture, module scaffolding and QA.
- Google AI Studio / Gemini via provider abstraction when API keys are present.

## Licenses

Source code copyright 2026 the PathWiser team, submitted to Talentbank Tech Hackathon 2026 under the Participant Agreement's review and adoption terms.

Third-party data/package licenses remain governed by their original sources and npm package license files.
