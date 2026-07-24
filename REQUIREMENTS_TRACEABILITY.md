# PathWiser Production Requirements Traceability

Last audited: 24 July 2026

This matrix treats `PathWiser_Proposal.docx` as the product commitment and uses
the Talentbank Kick-Off Deck, Kick-Off Session Summary, and Final Kit as the
official competition constraints. The official brief allowed a narrower
prototype; PathWiser's proposal voluntarily committed to a complete sixteen
module system. Therefore the stricter proposal scope is the acceptance target.

Status meanings:

- **Complete** - implemented and connected to a real application flow.
- **Conditional** - implemented, but account/database/provider configuration is
  needed to use the durable or community-backed path.
- **In progress** - visible implementation exists but a proposal requirement is
  still illustrative, transient, or incomplete.
- **External prerequisite** - cannot be completed in source code alone.

## Official competition requirements

| ID | Source | Requirement | Implementation | Status | Acceptance test |
|---|---|---|---|---|---|
| OFF-01 | Kick-Off Summary pp. 1-2 | Public homepage, job listings, company directory, and a dashboard serving talent, employers, and universities | `/`, `/dashboard/marketplace/jobs`, `/dashboard/marketplace/companies`, persona dashboards | Complete | Browser route and interaction audit |
| OFF-02 | Kick-Off Summary pp. 1, 4 | One-click judge/login bypass | Audience preview launchers on the homepage | Complete | Launch every preview without credentials |
| OFF-03 | Kick-Off Summary pp. 2, 4 | One unified platform with different persona views | One Next.js application with candidate, employer, and university route guards | Complete | Persona route-guard tests |
| OFF-04 | Kick-Off Summary pp. 3-4 | Clean, professional, editorial design for ages 20-50; mobile-friendly candidate experience and desktop dashboards | Responsive light SaaS design, mobile drawer, conventional navigation, touch-sized mobile path cards | Complete | Fresh desktop, 390 × 844 phone and 768 × 1024 tablet browser audits pass |
| OFF-05 | Final Kit section 03 | Clear architecture, working marketplace, differentiators, integrated core flow, documentation | Architecture view, engine API, marketplace, module registry, README/OpenAPI/system design | Complete | Build, OpenAPI review, route audit |
| OFF-06 | Final Kit section 05 | Live interactive demo URL | Source is deployable, but no verified public deployment is currently attached to this workspace | External prerequisite | Production deployment smoke test |
| OFF-07 | Kick-Off Deck p. 23 and Summary pp. 2, 4 | Prioritise product/UX, functional depth, innovation, career impact, and sustainability | Career Twin differentiation, Career Signal Loop, SDG mappings, evidence disclosures | Complete | UX heuristic and content audit |
| OFF-08 | Final Kit | Career OS core plus selected modules; live demo and 2-3 minute judge walkthrough | Product build is in scope; walkthrough recording is a separate media deliverable | External prerequisite | Verify final URL and video |

## Shared engine and platform modules

| ID | Proposal module | Required behaviour | Current implementation | Status | Remaining acceptance work |
|---|---|---|---|---|---|
| ENG-01 | User Profile and Trajectory Shape | Registration, persona onboarding, structured profile, ESCO-aligned fields, embedding, continuous updates, completeness prompts, RLS-backed persistence | Registration, email callback and password recovery, organisation-aware persona onboarding, editable account profile, deterministic taxonomy normalization, embedding provenance, device preview fallback and RLS schema | Conditional | Verify saved profile, recovery and embedding against a working production Supabase project |
| ENG-02 | Trajectory Retrieval | Reusable retrieval API, vector similarity, filters, minimum cohort gate, deterministic contract, short-lived reuse | Live engine-room retrieval, `retrieveCohort`, `/api/engine/navigate`, pgvector RPC, disclosed modelled fallback, cohort gate | Complete | Browser interaction and connected full-mode performance test |
| ENG-03 | Range-of-Outcomes Aggregation | Deterministic next roles, salary percentiles, time in role, skill bridges, trade-offs, calibration metadata | Pure tested aggregation plus live active-profile inspection view | Complete | Cross-check displayed values against API fixture |
| ENG-04 | AI Explanation and Honest Narrative | Audience prompt, provider abstraction, schema/honesty validation, retries/fallback, cohort disclosure | Live structured input/output inspection, provider retry, validation gate, deterministic fallback and visible generation reason | Complete | Provider failure and validation-failure integration test |
| PLAT-01 | End-to-end system flow | Auth -> onboarding -> shape -> retrieval -> aggregation -> validated narrative -> interaction -> feedback | End-to-end routes and UI exist | Conditional | Verify with a working production Supabase project and live provider |
| PLAT-02 | OpenAPI/integration | Typed, versioned, framework-agnostic API surface | OpenAPI 3.1 contract plus typed TypeScript routes for engine, account, workflow and marketplace APIs | Complete | YAML parse and production smoke suite |
| PLAT-03 | Health/readiness | Health endpoint and operational state | `/api/health` | Complete | Test healthy/degraded responses |
| PLAT-04 | Observability | Structured events, latency, validation, cost/capacity hooks | Engine event log, admin summary, transactional retention function and scheduler-authenticated cleanup endpoint | Conditional | Connect the hosting scheduler and verify populated admin telemetry against production data |

## Candidate modules

| ID | Proposal module | Required behaviour | Implementation | Status | Acceptance test |
|---|---|---|---|---|---|
| C-01 | Career Path Navigator | Branching next-move landscape; node probability/salary/cohort/time; detail narrative; skill bridges; inline shape changes | Live navigate API, graph, node details, comparison, shape adjustment | Complete | Adjust profile, select nodes, compare paths, inspect mobile/touch flow |
| C-02 | AI Career Coach | Explicitly invoked conversation grounded in the latest cohort; skill bridges and learning paths; honest validation | Live coach API, history, suggested questions, provider fallback | Complete | Multi-turn, invalid input, provider failure, predictive-language validation |
| C-03 | Fair Pay Engine | Current/next-role percentile ranges, Malaysian calibration, cohort/source disclosure | Live aggregation-based pay view | Complete | Role/location/experience changes, unavailable cohort, range consistency |

## Employer modules

| ID | Proposal module | Required behaviour | Implementation | Status | Acceptance test |
|---|---|---|---|---|---|
| E-01 | Smart Talent Matching | Role intake, ESCO-shaped inverse retrieval, direct and adjacent consented candidates, evidence rationale without a black-box score | `/api/talent/match`, consented RPC path, modelled evaluation path, interactive filters | Conditional | Verify employer membership plus opted-in candidate against production database |
| E-02 | Talent Retention Signals | Consent-aware cohort comparisons, tenure deviation, evidence and constructive conversation prompts, periodic review | Consent/de-identification gate, cohort comparison, constructive prompts, saved reviews and next-review cadence; no individual risk score | Conditional | Verify account records and organisation authorization in production |
| E-03 | Onboarding Success Predictor | New-hire/role intake, cohort outcomes, support interventions, manager briefing, six-month refresh | Cohort-based support planner, durable cases, check-in history, next review and downloadable briefing; individual prediction disabled | Conditional | Verify account records and manager authorization in production |

## University modules

| ID | Proposal module | Required behaviour | Implementation | Status | Acceptance test |
|---|---|---|---|---|---|
| U-01 | Lifelong Outcome Loop | Consented programme cohorts; first, five, ten-year outcomes; salary/destination distributions; peer comparison only by agreement; curriculum handoff | Horizon/programme controls, live aggregation, CSV export, curriculum handoff, saved snapshots and six-month review | Conditional | Verify programme consent and account records in production |
| U-02 | Future-State Curriculum Engine | Employer demand plus programme outcomes, gap analysis, emerging/decreasing skills, evidence/trade-offs, semester/annual planning | Live gap analysis, trade-offs, faculty pack, outcome handoff, saved faculty reviews and planning cadence | Conditional | Verify faculty authorization and account records in production |
| U-03 | Adaptive Readiness Profile | Continuously updated capability landscape, learning history, readiness gaps, explicit sharing consent | Live capability map, editable learning evidence, current consent read, durable snapshots and downloadable dossier | Conditional | Verify consent/account persistence and credential-governance process |

## Support modules

| ID | Proposal module | Required behaviour | Implementation | Status | Acceptance test |
|---|---|---|---|---|---|
| S-01 | Feedback and Reflection | Point-of-output feedback, accuracy/freshness ratings, private notes, session history, human curation queue | Contextual desktop/mobile entry from every module, source/output reference, curation status, account persistence and device fallback | Complete | Verify curation workflow against production database |
| S-02 | System Analytics and Monitoring | Usage/performance telemetry, retrieval latency, validation rejection, errors, AI cost, internal dashboard | Structured engine sessions and admin-only summary | Conditional | Production admin authorization and populated telemetry required |
| S-03 | Security, Privacy and Access | Auth, persona authorization, RLS, revocable consent, anonymisation, minimum cohort, audit logs | Middleware, route guard, RLS migrations, consent page/API, consented matching RPC, portable account export, self-service erasure and device-data cleanup | Conditional | Apply migrations and verify policies, export and erasure with multiple production accounts |

## Marketplace and product experience

| ID | Requirement | Current implementation | Status | Remaining acceptance work |
|---|---|---|---|---|
| MKT-01 | Working job marketplace connected to candidate direction | Community-table API with explicitly labelled modelled fallback, active-shape/cohort ranking, honest counters, filters, details, save and application brief | Conditional | Populate and verify the production marketplace tables |
| MKT-02 | Company directory | Community-table API with labelled modelled fallback, honest counters, search/filter, detail, save and employer-to-role flow | Conditional | Populate and verify the production company table |
| UX-01 | Every overlay has a visible escape path | Reusable close button, Escape, backdrop close, focus trap, restore focus, confirmation for onboarding progress | Complete | Fresh browser tests pass for onboarding close/Escape/focus restoration and marketplace Escape |
| UX-02 | Preserve useful demo storytelling | Public CareerOS 15-65+ life arc, evidence trust strip, interactive Career Signal Loop, nine-module map and inspectable six-stage engine pipeline | Complete | Fresh desktop, phone and tablet visual/interaction audits pass |
| UX-03 | Dynamic, familiar interface | Conventional navigation, tabs, forms, graphs, feedback, exports, responsive layouts, live marketplace and service status | Complete | Browser interaction audit |
| UX-04 | Accessible interaction | Semantic fields, keyboard focus, modal trap, responsive layouts, touch-sized primary controls | Complete | Automated WCAG A/AA semantic audit passes on 16 routes; keyboard dialogs and 390 px touch targets verified |

## Production configuration findings

- The configured Supabase URL and keys have valid shapes and the REST endpoint is
  reachable, but authenticated table requests currently return HTTP 403. Live
  database mode must remain disabled until the project access policy or keys are
  corrected and migrations are verified.
- Modelled Malaysian-calibrated evidence remains an honest, labelled fallback for
  local evaluation. Production must fail visibly rather than silently substituting
  modelled evidence when `ALLOW_FULL_MODE=true` and fallback is not explicitly
  authorised.
- A production launch still requires a verified public deployment, production
  environment values, applied migrations, seeded/licensed corpus data, backup and
  alert configuration, and a final multi-account authorization test.
