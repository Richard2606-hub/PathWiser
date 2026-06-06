# PathWiser Prototype · Tutorial & Demo Guide

A practical guide to running, exploring, and presenting the PathWiser clickable prototype for the Talentbank Tech Hackathon 2026 Intent Form (Stage 1, due 23:59 MYT, Mon 15 June 2026).

---

## What this prototype is

**PathWiser** is a Career OS navigation platform that uses an evidence-based Career Twin Engine to help candidates, employers, and universities see the realistic landscape of career paths — without overpromising prediction. This is the **clickable prototype** for the Intent Form: a frontend-only interactive demo of the production vision, built with vanilla HTML/CSS/JS.

The production build (Next.js + Supabase + pgvector + Google Gemini) is scheduled for the 28-day Build Phase (Mon 29 June – Sun 26 July 2026) **only after shortlisting**. Per the Participant Agreement section 3, substantial pre-build work could disqualify the team — this prototype is deliberately a clickable mock, not a production system.

---

## How to launch

### Option A — open the file directly

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
2. That's it. No build step, no server, no dependencies. All assets are local.

### Option B — serve it locally (recommended for the demo URL)

If you want a clickable URL for the Intent Form prototype-link field, host the three files (`index.html`, `app.js`, `styles.css`) on any static host:

- **Netlify Drop** (drag-and-drop): https://app.netlify.com/drop
- **Vercel**: `vercel deploy` from this folder
- **GitHub Pages**: push to a repo, enable Pages
- **Local quick server**: `python -m http.server 5173` then visit `http://localhost:5173`

Whichever you choose, the resulting URL goes into the Intent Form's *Prototype Link* field.

---

## Three ways to walk through it

### 1. The fastest demo (60 seconds)

Best for: a judge who only has a minute.

1. Open the prototype. The hero screen appears.
2. Click **🎬 Take the Tour** (the yellow circular button bottom-right of the dashboard — appears after entering).
3. The 10-step guided walkthrough auto-navigates through the architecture, the signature visualisation, the engine internals, and all three audience surfaces. ~90 seconds.
4. Use the keyboard: `→` next, `←` back, `Esc` to exit.

### 2. The structured demo (5 minutes)

Best for: a panel review where you control the pacing.

Recommended path — copy this as your demo script:

1. **Hero** — read the tagline ("Navigate your career, wiser") and the three Career Signal Loop nodes (Candidate → Employer → University). Mention "one engine, three audiences."
2. Click **Aisyah · Junior Data Analyst** on the hero — the demo persona quick-pick. Skips onboarding entirely; lands you on Career Path Navigator with Aisyah's shape pre-loaded.
3. **Career Path Navigator** — the signature visualisation. Point out:
   - The "YOU" node on the left, branching paths to the right
   - Yellow = primary, grey = adjacent (one bridge away)
   - Dashed sky-blue rings around four nodes = MyCOL Critical Occupations (TalentCorp 2024/25)
   - Click **Senior Data Scientist** — surface the side panel
4. **Side panel** — read out: "Within this cohort of **1,240**, **48%** reached this role over a median **2.8 yrs**. Salary anchor **RM 9,500/m** calibrated against DOSM 2024 + recruiter guides. Cohort aggregate. Not a prediction." This is the moment to land the "honest navigation, never prediction" message.
5. Click **Architecture & Vision** in the left sidebar (System Overview). Scroll through:
   - Brief alignment pillars (5 pillars from Talentbank's Career OS brief)
   - 3×3 module grid (every cell is clickable — try Smart Talent Matching to switch persona automatically)
   - 10-step pipeline (Shape → Retrieval → Aggregation → Narrative → Validation → Delivery → Feedback)
   - Competitive differentiation table (LinkedIn, Eightfold, SkyHive, FutureFit, JobStreet, MyNext — where PathWiser differs)
   - Tech stack, data sources, criteria alignment, 28-day timeline
6. Switch to **Employer** in the persona switcher (top right) — surfaces Smart Talent Matching. Talk about inverse retrieval and adjacent candidates.
7. Switch to **University** — surfaces Lifelong Outcome Loop. Talk about 1y / 5y / 10y horizons and the feedback into the Curriculum Engine.
8. Click **Trajectory Retrieval** (sidebar, Engine Layer) — click **▶ Run Vector Search**. Show the live vector-space scatter, the typed retrieval log, and the dashed search ring isolating the top-K. Land the line: "the numbers come from this cohort, never from the LLM."
9. Finish on **Architecture & Vision** → scroll to the bottom "Honest framing as a continuous discipline" callout.

### 3. Free exploration

Best for: a judge who wants to click around.

- The **Signal Loop widget** in the header (C → E → U) is clickable — switches the active audience.
- The **persona switcher buttons** (top right) do the same with more visible labels.
- The **sidebar** organises every module by layer: System Overview / Engine / Candidate / Employer / University / Support.
- The **🎬 tour FAB** can be triggered at any time from any module.
- The **📝 feedback FAB** opens a feedback modal — closes the loop on the Feedback & Reflection module.

---

## Module-by-module reference

### System Overview

**🏗️ Architecture & Vision** — the judge-facing summary. Hero + brief alignment + 3×3 module map + 10-step pipeline + competitive differentiation + data strategy + tech stack + criteria alignment + 28-day timeline + honest framing footer. Start your demo here.

### Engine Layer (the shared infrastructure)

1. **User Profile & Trajectory Shape** — captures the user's structured profile, normalises to ESCO occupation codes + O*NET skills, embeds into a 768-d vector. Click *Inject* on a new skill to see the radar shape shift.
2. **Trajectory Retrieval Engine** — pgvector HNSW similarity search across 42,850 trajectories. Click **▶ Run Vector Search** to see the live cosine search + UMAP-projected scatter. The dashed ring shows the search radius isolating the top-K cohort.
3. **Range-of-Outcomes Aggregation** — deterministic computation of the distribution within the cohort. Bars show the salary percentile spread. Median, P25, P75 pills are surfaced as ground truth — the LLM never sees the raw cohort, only these aggregates.
4. **Honest Narrative Layer** — the AI explanation step. Left panel shows the structured JSON going to the LLM. Right panel shows the hedged narrative coming back. Predictive verbs ("will") are rejected by the validator before reaching the user.

### Candidate Surface

5. **Career Path Navigator** *(signature view)* — the branching trajectory landscape. Click any node to surface the cohort-grounded narrative. Drag the Shape Adjustment sliders to re-explore. MyCOL ✦ ring = Critical Occupations List.
6. **AI Career Coach** — conversational layer over the cohort. Try the quick-topic chips (Career Pivot, Salary Insight, Skill Bridge, Timeline, Trade-offs). Every response is hedged and cohort-referenced.
7. **Fair Pay Engine** — DOSM-calibrated wage percentile analysis. Try changing the MASCO Occupation Code, your current salary, and Years of Experience — the percentile track updates with explicit P10–P90 markers. Sources are visible in the right panel.

### Employer Surface

8. **Smart Talent Matching** — inverse retrieval. The role becomes the query vector; candidates whose trajectory shape fits the inflow are surfaced with match scores. Two of the four candidates carry flags (retention risk, upskill needed) — click for detail.
9. **Talent Retention Signals** — cohort-comparison-based attrition risk per department. Drivers are surfaced as pills, not as a black-box score. Earlier than a resignation letter.
10. **Onboarding Success Predictor** — for new hires, surfaces the realistic range of onboarding outcomes from a cohort of similar past hires plus intervention effectiveness. Manager Briefing modal generates a structured plan.

### University Surface

11. **Lifelong Outcome Loop** — graduate trajectories tracked over 1y / 5y / 10y horizons. Tab through them. The "→ Feed to Curriculum Engine" button shows the loop closing.
12. **Future-State Curriculum Engine** — translates employer demand signal into curriculum recommendations. Skill-gap bars + implementation lag flagged honestly. Click *View Syllabus Recommendations* for the modal.
13. **Adaptive Readiness Profile** — dynamic capability vector replacing the static degree certificate. ESCO-mapped, refreshes continuously, shareable with employers under explicit consent.

### Support Layer

14. **Feedback & Reflection** — captured feedback flows into the corpus curation queue. Star ratings, free-text reflection, private notes.
15. **System Analytics & Monitoring** — internal engineering view. Latency by stage, validation rejection rate, citation coverage, k-anonymity compliance. End users do not see this.
16. **Security, Privacy & Access** — row-level security policies, k-anonymity (k≥5), revocable consent flows. Foundational layer.

---

## What to point out to judges (the five judging criteria)

The Intent Form is reviewed for *cohort fit*, not scored — but the same five criteria will apply to the final submission, so showing alignment now signals maturity.

| Criterion | Weight | Where to point in the prototype |
|---|---|---|
| **Product & UX Thinking** | 30% | Career Path Navigator (signature viz) · Honest Narrative panel · Career Signal Loop widget in the header · Shape Adjustment sliders preserve agency · MyCOL ✦ ground in Malaysia |
| **System Design & Integration** | 25% | Architecture & Vision screen · 10-step pipeline · one engine / three surfaces · pgvector co-location argument · OpenAPI surface for Angular integration |
| **Completeness** | 20% | This is a clickable prototype — Stage 1 expects exactly this. The 28-day plan is laid out; live URL is the next milestone after shortlisting |
| **AI Craft** | 15% | Hybrid architecture (retrieval + aggregation + explanation as three layers) · validator rejects predictive verbs · Honest Narrative Layer screen shows structured JSON → hedged output · provider abstraction (Gemini + HuggingFace fallback) |
| **Code Quality** | 10% | Clean module boundaries · TypeScript planned · documented data sources · risks acknowledged in the Architecture screen footer |

---

## The "honest framing" claim — where it shows up

The product promises *navigation, not prediction*. This is structural, not a disclaimer. Look for it in:

- **Architecture screen** — Brief Alignment pillar 01 calls it out, the differentiation table contrasts PathWiser with predictive incumbents (Eightfold's "1–5 score across 50+ variables" especially)
- **Engine pipeline animation** — explicit Validation step between Narrative and Delivery
- **Honest Narrative Layer screen** — system prompt visible: "Do NOT use predictive verbs like 'will'. Always cite cohort size."
- **Career Path Navigator side panel** — every cohort size disclosed, every salary as a range, italic footer "The LLM never invented these numbers"
- **MyCOL ✦ rings** — grounds the demo in Malaysian national priority data (TalentCorp 2024/25), not a generic global score
- **Trajectory Retrieval screen** — the cohort-too-small fallback is mentioned in the log output; the engine refuses to surface aggregates over cohorts below k=50
- **Honest framing footer** on the Architecture screen — three risks named openly (synthetic-but-calibrated corpus, recruiter-guide licensing, discipline-not-setting)

---

## Things you can break / known limits

- **Onboarding flow** still works (click Enter the Dashboard from the hero) but the quick-pick personas are faster and more impressive for a judge demo. Both paths land in the same dashboard.
- **AI Coach** has 5 well-crafted canned responses tied to keywords (pivot, salary, skill, timeline, trade-off) plus a sensible fallback. There is no real LLM call — by design, this is a clickable prototype.
- **Mobile responsive** below 1100px hides the sidebar; use a desktop browser for the full demo.
- **The 10-step demo tour** keyboard shortcuts: `→` next, `←` back, `Esc` quit. Click "Skip" to exit at any time.

---

## What changes after shortlisting

If the team is shortlisted (notification ~22–27 June 2026):

- The 28-day Build Phase begins **Mon 29 June 2026** and runs through **Sun 26 July 2026**.
- The static prototype is re-implemented as a Next.js + Supabase + pgvector + Google Gemini application — see the Tech Stack and Timeline sections on the Architecture screen for the full plan.
- A live URL goes up on Vercel by day 3 of the build phase.
- Three written checkpoints are submitted at roughly day 10, day 20, and day 28.

Until then: do not build the production stack. Polish the prototype, tighten the concept brief (~800 words), and submit the Intent Form before 23:59 MYT, Mon 15 June 2026.

---

## Files in this folder

- `index.html` — the full clickable demo (single-page app)
- `app.js` — all interactivity (no build step, no framework)
- `styles.css` — design system + every module's styling
- `TUTORIAL.md` — this document
- `PathWiser_Proposal.docx` / `.txt` — the full submitted proposal (~10k words)
- `Research Documents.docx` / `.txt` — the research backing data sources and competitive landscape
- `Idea for the Tech Hackathon.docx` / `.txt` — the original three-layer framing
- `Starter Kit · Talentbank Tech Hackathon 2026.html` — the brief, archived locally
- `.claude/launch.json` — local preview server config (for development)

---

## One-sentence pitch

> PathWiser shows candidates, employers, and universities the realistic landscape of career trajectories — anchored in Malaysian DOSM data, framed as evidence to navigate with, not a prediction of where you'll end up.
