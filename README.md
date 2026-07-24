# PathWiser · Career OS Navigation Platform

> **Release status:** the application code implements the proposal-defined community product, including authenticated profiles, organisation roles, revocable consent, privacy-safe matching, all nine audience modules, health/telemetry and responsive UX. The bundled evidence is still modelled. A public launch requires the owner-controlled deployment and governed-data steps in [`COMMUNITY_RELEASE.md`](COMMUNITY_RELEASE.md).

**Previous preview reference:** [path-wiser-sigma.vercel.app](https://path-wiser-sigma.vercel.app/) (this is not a verified deployment of the community-release changes in this workspace)

Submitted to the **Talentbank Tech Hackathon 2026** — First Cohort. PathWiser is an evidence-based Career OS navigation platform built around the **Career Twin Engine**: a hybrid retrieval + deterministic aggregation + LLM explanation architecture that helps candidates, employers, and universities across Asia make wiser career decisions.

Navigation, **not** prediction. Every claim is cohort-grounded, with explicit cohort size and range disclosure. The LLM only converts numbers into hedged language — it never invents claims about individuals.

---

## Table of Contents

- [What we built](#what-we-built)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [Integration notes for Talentbank](#integration-notes-for-talentbank)
- [File map](#file-map)
- [Data sources & attribution](#data-sources--attribution)
- [Judging criteria alignment](#judging-criteria-alignment)
- [AI tools used](#ai-tools-used)
- [Licenses](#licenses)

---

## What we built

Sixteen modules across four layers, all backed by a single shared engine:

| Layer | Modules |
|---|---|
| **Engine** | User Profile & Shape · Trajectory Retrieval · Outcomes Aggregation · Honest Narrative |
| **Candidate surface** | Career Path Navigator · AI Career Coach · Fair Pay Engine |
| **Employer surface** | Smart Talent Matching · Talent Retention Signals · Onboarding Success Predictor |
| **University surface** | Lifelong Outcome Loop · Future-State Curriculum Engine · Alumni Readiness Profile |
| **Support** | Feedback & Reflection · System Analytics · Security & Access |
| **Marketplace** | Job Listings · Company Directory |
| **Meta** | Architecture & Vision (system overview screen) |

### Signature features

- **Career Twin Engine** — retrieval → deterministic aggregation → LLM explanation. Numbers come from aggregation, never from the LLM.
- **Compare Paths** — pick 2–3 destinations on the Career Path Navigator and get a side-by-side trade-off table with an honest verdict.
- **🐾 Work Animal quiz** (Menagerie Method) — 8-question personality read aligned with Talentbank's own `yourworkanimal.com` framework.
- **UN SDG mapping** — every module tagged with the Sustainable Development Goals it addresses (4 · 5 · 8 · 9 · 10 · 17).
- **Honest cohort disclosure** everywhere — cohort size, range, and "cohort aggregates, not individual predictions" on every output.
- **Server-enforced audience workspaces** — authenticated accounts are restricted to candidate, employer or university routes; the optional review switch is disabled by default and still requires an admin/judge server role.
- **Community preview personas** — three clearly labelled modelled personas can launch the local evidence workflow when authentication is optional.
- **Full close/back UX on every overlay** — ESC to close, × button, backdrop click. No sudden-modal traps.

---

## Quick start

**Requirements**
- Node ≥ 18.17
- npm ≥ 9

**Boot the app in demo mode** (no external credentials needed):

```bash
npm install
npm run dev
# → http://localhost:3000
```

This runs the engine end-to-end using an in-memory corpus of ~1,500 modelled, DOSM-calibrated trajectories. The interface discloses that evidence mode.

**Optional: enable full mode** (real Supabase + Gemini):

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
npm run dev
```

After migrations and a governed data import, set `ALLOW_FULL_MODE=true` to switch retrieval to pgvector HNSW cosine over the persisted corpus. AI narratives fall back to deterministic cohort summaries when the provider is unavailable or fails honesty validation.

**Available scripts**

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | tsc --noEmit |
| `npm run test` | Vitest (engine aggregation, normalization, ranking and AI honesty) |
| `npm run test:smoke` | Production HTTP, API, security-header and route smoke suite (server required) |
| `npm run test:a11y` | WCAG A/AA semantic audit across 16 representative routes (server required) |

---

## Architecture

### The three-layer engine

```
User shape
    ↓
[1] Trajectory Retrieval
    ─ pgvector HNSW cosine similarity (or in-memory feature-vector cosine in demo mode)
    ─ Audience filters (life stage, geography, sector)
    ─ Cohort-too-small honesty guard (k_min = 50)
    ↓
[2] Range-of-Outcomes Aggregation
    ─ Pure deterministic functions over the retrieved cohort
    ─ Next-role distribution, salary percentiles, skill bridges, trade-offs
    ─ Unit-testable. Numbers come from HERE, never from the LLM.
    ↓
[3] Honest Narrative
    ─ LLM converts structured aggregates → hedged prose
    ─ Post-generation validator rejects predictive verbs + hallucinated numbers
    ─ Template fallback if provider is unavailable (demo never breaks)
    ↓
UI (16 proposal modules sharing one engine and platform-control layer)
```

### The Career Signal Loop

```
       ┌─→ Candidate (Navigate) ──→ trajectory data
       │                                   │
       │                                   ↓
Engine ↑                             Corpus updates
       │                                   ↑
       │                                   │
       └─── University (Outcomes) ←── Employer (Demand)
```

Same engine. Three surfaces. Candidate decisions become anonymised trajectory signal that strengthens the cohort evidence available to all three audiences. Employer demand patterns feed back to universities via the curriculum engine.

---

## Integration notes for Talentbank

**Grep for `adoption hook` in the source** to find every integration seam.

### 1. AI provider

Set `AI_PROVIDER=talentbank-internal` in env. Add one case in [`lib/ai/index.ts`](lib/ai/index.ts). Create [`lib/ai/talentbank-internal.ts`](lib/ai/) implementing the `AIProvider` interface at [`lib/ai/interface.ts`](lib/ai/interface.ts). Nothing else changes.

The interface is only three methods:

```ts
interface AIProvider {
  getEmbedding(text: string): Promise<number[]>;
  getEmbeddings(texts: string[]): Promise<number[][]>;
  generateNarrative(aggregate: Aggregate, audience: 'candidate'|'employer'|'university'): Promise<Explanation>;
  chatCompletion(systemPrompt: string, userMessage: string, cohortContext: Aggregate): Promise<string>;
}
```

### 2. Vector store / retrieval

Replace [`lib/engine/retrieve.ts`](lib/engine/retrieve.ts). The rest of the engine (aggregate, explain) is store-agnostic. Signature:

```ts
retrieveCohort(shape: UserShape, opts?: RetrieveOptions): Promise<Cohort>
```

Return the same `Cohort` shape and everything downstream works.

### 3. Data source (trajectory corpus)

- **Demo mode:** in-memory generator at [`lib/corpus/generate.ts`](lib/corpus/generate.ts). ~1,500 synthetic Malaysian trajectories, DOSM-calibrated, deterministic seed = 42.
- **Full mode:** Supabase `trajectories` table (see [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)). HNSW index on `embedding vector(768)`.

To swap for Talentbank's real trajectory data: replace the corpus source. The engine reads from whatever's in `public.trajectories`.

### 4. Auth

Supabase Auth by default (see [`lib/supabase/`](lib/supabase/)). To swap for Talentbank SSO: replace the client factory. RLS policies in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).

### 5. Salary anchors

Currently DOSM 2024 hard-coded in [`lib/engine/aggregate.ts`](lib/engine/aggregate.ts) as calibration constants. Recruiter guide (Michael Page, Hays, Robert Walters) values used as headline anchors only — NOT reproduced from copyrighted tables.

### 6. HTTP API surface

The public contract covers health, navigation, coach, matching, profile, consent, feedback, durable workflow records, and marketplace endpoints in [`openapi.yaml`](openapi.yaml).

Talentbank's Angular team can call this directly from their frontend without ever running React — the engine is framework-agnostic.

### Owner-controlled work before public launch

The code includes consent records, RLS, organisations, profile persistence and privacy-safe matching. Legal approval, the governed evidence import, production credentials/domain, representative fairness and accessibility studies, distributed rate limiting, incident response and ongoing operations remain deployment responsibilities. See [`COMMUNITY_RELEASE.md`](COMMUNITY_RELEASE.md).

---

## File map

```
app/
  api/engine/navigate/      # Single engine endpoint
  dashboard/
    architecture/           # System overview screen
    candidate/              # 3 candidate modules
    employer/               # 3 employer modules
    university/             # 3 university modules
    engine/                 # 4 engine internals views
    marketplace/            # Jobs + companies
    support/                # Feedback + analytics + security
  page.tsx                  # Hero + one-click login bypass
  layout.tsx                # Root layout with fonts + metadata
  globals.css               # Design tokens

components/
  common/                   # Button · StatBox · Callout · Pill · SdgChip · ClosableOverlay
  layout/                   # Header · Sidebar · MobileDrawer · PanelHeader · LockedExplainer
  hero/                     # HeroSection · HeroCanvas
  onboarding/               # OnboardingShell + 5 step components
  path-navigator/           # PathGraph · ComparePanel · ShapeAdjustment
  ai-coach/                 # AICoachView (chat + quick topics)
  fair-pay/                 # FairPayView
  talent-matching/          # TalentMatchingView (with adjacent candidates)
  retention/                # RetentionSignalsView
  onboarding-predictor/     # OnboardingPredictorView
  outcome-loop/             # OutcomeLoopView
  curriculum-engine/        # CurriculumEngineView
  readiness-profile/        # ReadinessProfileView
  marketplace/              # JobListingsView · CompanyDirectoryView
  engine/                   # UserProfileView · TrajectoryRetrievalView
  architecture/             # ArchitectureView (system overview)
  support/                  # FeedbackView

lib/
  ai/                       # Provider interface + Gemini implementation + factory
  supabase/                 # Client (browser) + server (SSR) + service-role
  engine/                   # retrieve + aggregate + explain + client wrapper
  corpus/                   # occupations · generate · work-animals · sdgs · modules · jobs · companies · personas
  utils.ts                  # cn · cosineSimilarity · formatMYR · seededRandom · env helpers

types/                      # UserShape · Cohort · Aggregate · Explanation · Trajectory · WorkAnimalKey
store/                      # useAppStore (Zustand · persisted persona + shape + judgeMode + workAnimal)
supabase/migrations/        # 0001–0004 · core data · organisations/consent · durable workflows · erasure/retention controls
openapi.yaml                # Engine API contract for Talentbank's Angular team
legacy/                     # Stage 1 static clickable prototype (archived for reference)
```

---

## Data sources & attribution

| Source | Use | License |
|---|---|---|
| **O*NET** (US Dept of Labor) | Occupation + skill taxonomy | CC-BY 4.0 |
| **ESCO** (European Commission) | Occupation graph, ISCO mapping | EU Decision 2011/833/EU |
| **DOSM Malaysia** — Salaries & Wages Survey 2024, Graduates Statistics 2024 | Salary anchors (MASCO groups, sectors, states) | CC-BY 4.0 |
| **Michael Page MY / Hays Asia / Robert Walters MY** salary guides | Role-level calibration (headline figures only, not reproduced) | Public reports, cited |
| **TalentCorp MyMahir Critical Occupations List** | MyCOL badges on relevant roles | Public |
| **Synthetic corpus** | ~1,500 anonymised trajectories, DOSM-calibrated | Internal, disclosed |

Attribution is displayed in-product on the Architecture & Vision screen.

---

## Judging criteria alignment

| Criterion | Weight | How we address it |
|---|---|---|
| **Product & UX Thinking** | 30% | Honest navigation framing everywhere; branching trajectory viz + Compare Paths as signature moments; cohort disclosure on every output; three-audience Signal Loop |
| **System Design & Integration** | 25% | One shared engine (`lib/engine/`) serving all nine audience modules; retrieval/aggregation/explanation cleanly separated; support controls, OpenAPI and provider abstraction create clear integration seams |
| **Completeness** | 20% | Every proposal module has a connected workflow; one-command local setup; `.env.example`; durable account records; deterministic fallback so provider outages do not break core evidence flows |
| **AI Craft** | 15% | Numbers from deterministic aggregation, LLM only explains; post-generation validator rejects predictive verbs; provider abstraction so Talentbank swaps in one env var |
| **Code Quality** | 10% | TypeScript strict + Zod schemas at every boundary; module boundaries at `lib/engine/`, `lib/ai/`, `lib/supabase/`; RLS policies in-migration; conventional-commit history |

---

## AI tools used

Declared per the Kick-Off requirement:

- **Claude Code** — codebase authoring, engine architecture, module scaffolding
- **Google AI Studio (Gemini)** — narrative generation via provider abstraction (default provider when API key is present)

---

## Licenses

Source code © 2026 the PathWiser team, submitted to Talentbank Tech Hackathon 2026 under the Participant Agreement's review + adoption license. On adoption, IP transfers to Talentbank per the Adoption Terms.

Third-party licenses:
- O*NET data — CC-BY 4.0
- ESCO — EU Decision 2011/833/EU
- DOSM open data — CC-BY 4.0
- All npm packages — see individual license files in `node_modules/`
