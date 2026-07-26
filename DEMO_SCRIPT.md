# PathWiser — Demo Script & Usage Guide

A tight, judge-ready walkthrough of PathWiser. Use the **2–3 minute script** for the
submission video; the **per-audience guides** and **talking points** are for live Q&A
or a longer demo.

> **One-line pitch:** PathWiser turns privacy-protected career *trajectories* into
> realistic options for candidates, employers, and universities — **navigation, not
> prediction.** Every number is cohort-grounded, with the cohort size, source, and
> limits shown. The LLM only *explains* computed evidence; it never invents an
> individual's outcome.

---

## 0. Before you record (2 minutes of setup)

1. **Clean browser:** use a fresh/incognito window, **disable extensions** (Grammarly,
   password managers) so no popups or icons appear on screen.
2. **Live URL:** `https://path-wiser-sigma.vercel.app`
3. **Two ways to demo — pick one:**
   - **Fastest (recommended for the video): anonymous quick-launch.** No login. On the
     homepage, use the workspace picker — every audience is one click away, always works.
   - **Full story: the three demo accounts** (below) — shows real signup/login + saved
     profiles. Sign in at `/auth`.
4. **Demo accounts** (run `npm run seed:demo-accounts` once to create them):

   | Audience | Email | Password |
   |---|---|---|
   | Candidate | `demo.candidate@pathwiser.app` | `PathWiserDemo!2026` |
   | Employer | `demo.employer@pathwiser.app` | `PathWiserDemo!2026` |
   | University | `demo.university@pathwiser.app` | `PathWiserDemo!2026` |

   Each lands directly in a working workspace with a pre-filled profile.

---

## 1. The 2–3 minute video script (golden path)

**Scene 1 — The promise (0:00–0:20)**
> *[Homepage]* "This is PathWiser — a Career OS that helps people make their next move
> with **evidence, not guesswork**. It serves three audiences on one shared engine:
> candidates, employers, and universities. The key idea: we **navigate**, we don't
> predict — every result shows its cohort, source, and limits."

Point at the three trust chips: *Cohort-based evidence · Revocable consent · No
individual prediction score.*

**Scene 2 — Candidate: the signature module (0:20–1:00)**
> *[Click "See a live candidate example" → Career Path Navigator]* "Here's a junior
> data analyst. Instead of a black-box score, PathWiser retrieves a **cohort of 300
> similar trajectories** and shows the realistic next moves — Senior Data Scientist,
> Cloud Architect, ML Engineer — each with a salary range and **how many of the cohort
> actually took that route.**"

Click a node:
> "Notice the honesty: it says **'based on 21 of 300'** and flags a **thin sample** —
> it won't over-claim. And the narrative is written by the LLM but **every number comes
> from deterministic aggregation, not the model.**"

Optionally: open **Fair Pay** → pick any role (e.g., *Staff Nurse* or *Electrician*):
> "Fair Pay works for the **whole workforce** — 440 roles across 34 sectors — not just
> tech. Here's a DOSM-calibrated wage band for a nurse in Selangor."

**Scene 3 — Employer (1:00–1:30)**
> *[Homepage → Employer → Smart Talent Matching]* "The employer declares a role demand
> shape, and PathWiser surfaces direct and adjacent candidates with **explainable
> evidence** — which skills align, which need a bridge — and **no single match score.**
> The employer decides; consent is revocable."

**Scene 4 — University (1:30–2:00)**
> *[Homepage → University → Lifelong Outcome Loop]* "Universities connect graduate
> outcomes to curriculum. Pick a programme — say **Nursing** — and a time horizon:
> first job, 5-year, 10-year. Then **send that evidence straight into the Curriculum
> Engine.** That's the Career Signal Loop: candidate choices, employer demand, and
> university outcomes all reinforcing each other."

**Scene 5 — Close (2:00–2:20)**
> "One engine, three perspectives, honest by design — and it stays useful across a
> whole career, from student to executive. That's PathWiser."

---

## 2. Per-audience usage guide

### 👤 Candidate
- **Career Path Navigator** *(signature)* — realistic next moves with cohort share,
  salary range, skill bridges, and a thin-sample caveat. Adjust the 5 capability
  dimensions to re-shape the landscape; use **Compare paths** to weigh 2–3 side by side.
- **Fair Pay Engine** — pick any of 440 roles + any of 16 states; get a DOSM-calibrated
  wage band and a Below/At/Above-market verdict.
- **AI Career Coach** — ask a decision question; every answer cites the cohort and
  refuses predictive language (honesty validation gate).
- **Living Portfolio / Life Chapter Designer** — turn skills into shareable evidence;
  plan the next chapter across life stages.

### 🏢 Employer
- **Smart Talent Matching** *(signature)* — declare the role demand shape; review
  explainable candidate evidence (aligned skills vs. bridges), no black-box score.
- **Talent Re-Engagement / Retention Signals / Onboarding Predictor / Workforce
  Resilience** — consent-led talent-system tools.

### 🎓 University
- **Lifelong Outcome Loop** *(signature)* — programme × horizon → aggregated graduate
  destinations; export evidence or push it to the Curriculum Engine.
- **Curriculum Engine / Readiness Profile / Internship Marketplace / Learning Wallet.**

---

## 3. Talking points (why it wins)

- **Honest navigation, not prediction** — the whole product refuses individual
  prediction scores; it shows cohort size, source, ranges, and thin-sample warnings.
- **Deterministic core** — numbers come from pure aggregation; the LLM only narrates,
  behind a validation gate. "The part of the system that must not lie."
- **Whole-workforce** — 34 sectors, 440 roles, 10,200 modelled trajectories, 16 states.
  A nurse, electrician, or teacher is navigable, not just graduates.
- **The Career Signal Loop** — one engine serving three audiences, connected with
  consent and privacy gates.
- **Calibration + SDGs** — DOSM, ESCO, O*NET, TalentCorp MyCOL; SDG 4/5/8/9/10 tags.
- **Production-oriented** — Supabase Auth + RLS, revocable consent, audit events,
  OpenAPI contract, a11y (WCAG A/AA), and a full test + release-preflight suite.

---

## 4. If something looks off on the day
- Prefer **anonymous quick-launch** — it never depends on login state.
- Every module shows an **evidence provenance** line; if a cohort is too small it says
  so honestly rather than inventing numbers — that's a feature, not a bug.
- Data is **modelled/synthetic** and labelled as such (per the brief); nothing here
  claims to be real individuals.
