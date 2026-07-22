# PathWiser frontend and UX evaluation

Evaluation date: 21 July 2026. Scope: proposal-defined candidate, employer and university journeys in the local community-preview configuration.

## Outcome

The frontend now uses a familiar modern SaaS visual system rather than the original dark technical-dashboard treatment: a light neutral canvas, conventional sticky navigation, strong typographic hierarchy, indigo primary actions, soft elevation, standard form controls and progressive disclosure. The landing page includes an interactive audience selector and product-specific calls to action. Inside the workspace, the career visualization and selected outcome are prioritised before secondary metrics, avoiding a first viewport made only of statistic blocks.

It also has a coherent role-based information architecture, responsive navigation, evidence provenance at the point of use, accessible form labels, honest empty/error states, and end-to-end actions for all nine audience modules. The strongest interaction is the Candidate Path Navigator: capability sliders rerun retrieval, destination nodes expose cohort shares, and Compare Paths turns two or three choices into an understandable trade-off table.

The browser checks passed at desktop width and 390 × 844 px. At mobile width the candidate page had no horizontal overflow (`scrollWidth 385`, viewport `390`), the closed menu was absent from the accessibility tree, and the opened drawer exposed a named `Navigation` complementary landmark.

## Journey evaluation

| Audience | Primary flow | Evaluation |
|---|---|---|
| Candidate | Profile → path landscape → inspect destination → compare → coach/fair pay | Strong. Cohort size, provenance, ranges and limitations remain visible. The coach remains useful during provider outages through a deterministic evidence fallback. |
| Employer | Demand shape → direct/adjacent profiles → bridge review → retention/onboarding support | Good. Matching avoids a seductive but unjustified individual score. Local profiles are unmistakably marked synthetic; connected results require explicit candidate consent and employer organisation membership. |
| University | Programme + horizon → outcome destinations → curriculum handoff → readiness dossier | Strong. Programme/horizon changes rerun evidence; context is carried into the Curriculum Engine; exports support faculty review instead of pretending to automate governance. |

## Improvements completed in the recommended sequence

1. Trust and safety: evidence labels, minimum cohort guard, removal of fabricated attrition/readiness/match scores, no hard-coded pay fallback, validated coach language.
2. Core flow: persisted profile shape, working shape sliders, role landing redirects, outcome-to-curriculum context, functional downloads and consent toggles.
3. Information architecture: one audience surface per account, shared marketplace/support areas, technical details de-emphasised, production judge access disabled by default.
4. Accessibility and responsive UX: explicit labels, button states, dialog/drawer semantics, keyboard-operable graph nodes, live regions, focus styles and mobile overflow checks.
5. Resilience: loading, empty, insufficient-evidence and provider-outage states; health endpoint and deterministic AI fallback.

## Remaining release validation

Before opening to the public, conduct moderated usability sessions with candidates, hiring teams and programme staff; test with screen readers and 200% zoom; verify translated/plain-language copy with Malaysian users; run contrast automation; and measure task completion, abandonment and comprehension of “cohort evidence, not prediction.” These require representative participants and the final hosted environment, so they cannot be honestly completed from source code alone.
