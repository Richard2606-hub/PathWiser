/**
 * Module registry — proposal core plus the full Final Kit challenge library.
 *
 * `desc` = one sentence answering "what decision does this help the user make?"
 * `purpose` = prominent purpose line shown under the module title
 * `cap` = capability row (Navigation / Intelligence / Valuation / Engine / Support)
 */

import type { Persona } from '@/types';

export interface ModuleMeta {
  key: string;
  title: string;
  abbr: string;
  badge: string;
  cap: 'Engine' | 'Navigation' | 'Intelligence' | 'Valuation' | 'Support' | 'Overview' | 'Marketplace';
  persona: Persona | 'engine' | 'all';
  layer: 'engine' | 'nav' | 'intel' | 'val' | 'support' | 'meta' | 'marketplace';
  purpose: string;
  desc: string;
  href: string;
}

export const MODULES: Record<string, ModuleMeta> = {
  // ─ Engine Layer ─
  user_profile: {
    key: 'user_profile',
    title: 'User Profile & Trajectory Shape',
    abbr: 'UP', badge: 'Engine · Shape',
    cap: 'Engine', persona: 'engine', layer: 'engine',
    purpose: 'Review the information used to represent your career context.',
    desc: 'A structured profile of skills, education, role, geography and life stage, normalized before retrieval and embedded only when the configured provider is available.',
    href: '/dashboard/engine/user-profile',
  },
  trajectory_retrieval: {
    key: 'trajectory_retrieval',
    title: 'Trajectory Retrieval Engine',
    abbr: 'TR', badge: 'Engine · Retrieval',
    cap: 'Engine', persona: 'engine', layer: 'engine',
    purpose: 'Inspect how the engine retrieves comparable trajectory evidence.',
    desc: 'Similarity retrieval over the configured trajectory corpus, followed by a minimum-cohort privacy gate before any aggregate is published.',
    href: '/dashboard/engine/trajectory-retrieval',
  },
  outcomes_aggregation: {
    key: 'outcomes_aggregation',
    title: 'Range-of-Outcomes Aggregation',
    abbr: 'OA', badge: 'Engine · Aggregation',
    cap: 'Engine', persona: 'engine', layer: 'engine',
    purpose: 'How the engine computes the numbers honestly.',
    desc: 'Deterministic computation of the distribution within the cohort. Numbers come from here, not from the LLM.',
    href: '/dashboard/engine/outcomes-aggregation',
  },
  ai_explanation: {
    key: 'ai_explanation',
    title: 'Honest Narrative Layer',
    abbr: 'AI', badge: 'Engine · Narrative',
    cap: 'Engine', persona: 'engine', layer: 'engine',
    purpose: 'How the engine turns evidence into honest language.',
    desc: 'Structured aggregates → hedged narrative. The LLM only explains. A validator rejects predictive verbs before output reaches the user.',
    href: '/dashboard/engine/ai-explanation',
  },

  // ─ Candidate Surface ─
  path_navigator: {
    key: 'path_navigator',
    title: 'Career Path Navigator',
    abbr: 'CPN', badge: 'For Candidates · Navigation',
    cap: 'Navigation', persona: 'candidate', layer: 'nav',
    purpose: 'Decide your next move with evidence, not gut feel.',
    desc: 'See 4–5 realistic next moves from where you are — with cohort size, salary range, time-in-role, and the trade-offs of each.',
    href: '/dashboard/candidate/path-navigator',
  },
  living_portfolio: {
    key: 'living_portfolio',
    title: 'Living Portfolio',
    abbr: 'LP', badge: 'For Candidates · Portfolio',
    cap: 'Valuation', persona: 'candidate', layer: 'val',
    purpose: 'Turn declared skills into evidence a person can review and share with consent.',
    desc: 'A dynamic evidence board for projects, learning and capability proof, with private-by-default sharing controls.',
    href: '/dashboard/candidate/living-portfolio',
  },
  ai_coach: {
    key: 'ai_coach',
    title: 'AI Career Coach',
    abbr: 'ACC', badge: 'For Candidates · Intelligence',
    cap: 'Intelligence', persona: 'candidate', layer: 'intel',
    purpose: "Get a senior mentor's answer to the question you're afraid to ask.",
    desc: "Ask the questions you can't ask anyone else. Every answer cites the cohort it draws on. Never a prediction.",
    href: '/dashboard/candidate/ai-coach',
  },
  fair_pay: {
    key: 'fair_pay',
    title: 'Fair Pay Engine',
    abbr: 'FPE', badge: 'For Candidates · Valuation',
    cap: 'Valuation', persona: 'candidate', layer: 'val',
    purpose: 'Bring disclosed salary ranges into your next pay conversation.',
    desc: 'Compare a salary with DOSM-calibrated cohort percentiles for the selected role, location and experience context.',
    href: '/dashboard/candidate/fair-pay',
  },
  life_chapter_designer: {
    key: 'life_chapter_designer',
    title: 'Life Chapter Designer',
    abbr: 'LCD', badge: 'For Candidates · Planning',
    cap: 'Navigation', persona: 'candidate', layer: 'nav',
    purpose: 'Plan the next chapter of work without pretending there is only one correct path.',
    desc: 'A trade-off planner for exploration, acceleration and transition chapters, with review cadence and constraint-aware actions.',
    href: '/dashboard/candidate/life-chapter-designer',
  },

  // ─ Employer Surface ─
  talent_matching: {
    key: 'talent_matching',
    title: 'Smart Talent Matching',
    abbr: 'STM', badge: 'For Employers · Navigation',
    cap: 'Navigation', persona: 'employer', layer: 'nav',
    purpose: 'Review direct and adjacent candidates with explainable evidence.',
    desc: 'Surface opted-in or clearly modelled profiles with aligned requirements and assessable skill bridges—without a black-box match score.',
    href: '/dashboard/employer/talent-matching',
  },
  talent_reengagement: {
    key: 'talent_reengagement',
    title: 'Talent Re-Engagement',
    abbr: 'TRE', badge: 'For Employers · Alumni',
    cap: 'Intelligence', persona: 'employer', layer: 'intel',
    purpose: 'Invite former or dormant talent back into conversation with consent-led context.',
    desc: 'Draft alumni and silver-medalist re-engagement campaigns using trajectory bridges instead of cold outreach spam.',
    href: '/dashboard/employer/talent-reengagement',
  },
  retention_signals: {
    key: 'retention_signals',
    title: 'Talent Retention Signals',
    abbr: 'TRS', badge: 'For Employers · Intelligence',
    cap: 'Intelligence', persona: 'employer', layer: 'intel',
    purpose: 'Decide when a supportive career conversation may be timely.',
    desc: 'Compare de-identified role-and-tenure patterns without assigning an employee a resignation risk score.',
    href: '/dashboard/employer/retention-signals',
  },
  onboarding_predictor: {
    key: 'onboarding_predictor',
    title: 'Onboarding Success Predictor',
    abbr: 'OSP', badge: 'For Employers · Valuation',
    cap: 'Valuation', persona: 'employer', layer: 'val',
    purpose: 'Focus your onboarding effort where it actually makes a difference.',
    desc: 'Compare cohort outcomes and plan practical support without assigning an individual success probability.',
    href: '/dashboard/employer/onboarding-predictor',
  },
  workforce_resilience: {
    key: 'workforce_resilience',
    title: 'Workforce Resilience Planner',
    abbr: 'WRP', badge: 'For Employers · Resilience',
    cap: 'Valuation', persona: 'employer', layer: 'val',
    purpose: 'Plan team support before change turns into avoidable churn.',
    desc: 'A scenario planner for team exposure, reskilling priorities and practical interventions, without employee surveillance.',
    href: '/dashboard/employer/workforce-resilience',
  },

  // ─ University Surface ─
  outcome_loop: {
    key: 'outcome_loop',
    title: 'Lifelong Outcome Loop',
    abbr: 'LOL', badge: 'For Universities · Navigation',
    cap: 'Navigation', persona: 'university', layer: 'nav',
    purpose: 'Keep approved graduate-outcome evidence useful beyond the first job.',
    desc: 'Explore aggregated destinations at first-job, five-year and ten-year horizons with source and privacy disclosures.',
    href: '/dashboard/university/outcome-loop',
  },
  live_internship_marketplace: {
    key: 'live_internship_marketplace',
    title: 'Live Internship Marketplace',
    abbr: 'LIM', badge: 'For Universities · Internship',
    cap: 'Marketplace', persona: 'university', layer: 'marketplace',
    purpose: 'Turn internship demand into a live employability signal loop.',
    desc: 'A faculty-facing internship planner that aggregates employer briefs, seat capacity and requested skill evidence.',
    href: '/dashboard/university/live-internship-marketplace',
  },
  curriculum_engine: {
    key: 'curriculum_engine',
    title: 'Future-State Curriculum Engine',
    abbr: 'FCE', badge: 'For Universities · Intelligence',
    cap: 'Intelligence', persona: 'university', layer: 'intel',
    purpose: 'Review curriculum gaps against configured trajectory evidence.',
    desc: 'Compare declared curriculum coverage with cohort-observed skill bridges while retaining faculty and accreditation review.',
    href: '/dashboard/university/curriculum-engine',
  },
  readiness_profile: {
    key: 'readiness_profile',
    title: 'Alumni Readiness Profile',
    abbr: 'ARP', badge: 'For Universities · Valuation',
    cap: 'Valuation', persona: 'university', layer: 'val',
    purpose: 'Help learners present current capability evidence with consent.',
    desc: 'A living, self-declared capability profile that complements formal credentials and stays private until sharing is enabled.',
    href: '/dashboard/university/readiness-profile',
  },
  lifelong_learning_wallet: {
    key: 'lifelong_learning_wallet',
    title: 'Lifelong Learning Wallet',
    abbr: 'LLW', badge: 'For Universities · Learning',
    cap: 'Valuation', persona: 'university', layer: 'val',
    purpose: 'Keep formal, employer and self-directed learning evidence portable across a career.',
    desc: 'A consent-controlled learning record for microcredentials, projects and reflections that can feed readiness evidence.',
    href: '/dashboard/university/lifelong-learning-wallet',
  },

  // ─ Support Layer ─
  feedback: {
    key: 'feedback',
    title: 'Feedback & Reflection Surface',
    abbr: 'F&R', badge: 'Support · Loop',
    cap: 'Support', persona: 'all', layer: 'support',
    purpose: 'Help the engine get better, see your past sessions.',
    desc: 'Capture your reactions to engine outputs. Feedback flows into the corpus curation queue — the loop closes.',
    href: '/dashboard/support/feedback',
  },
  analytics: {
    key: 'analytics',
    title: 'System Analytics & Monitoring',
    abbr: 'SAM', badge: 'Support · Operations',
    cap: 'Support', persona: 'all', layer: 'support',
    purpose: 'Visible to the engineering team only.',
    desc: 'Internal engineering dashboard — latency by stage, validation rejection rate, citation coverage.',
    href: '/dashboard/support/analytics',
  },
  security: {
    key: 'security',
    title: 'Security, Privacy & Access',
    abbr: 'SPA', badge: 'Support · Trust',
    cap: 'Support', persona: 'all', layer: 'support',
    purpose: 'How the system stays trustworthy.',
    desc: 'Row-level security, revocable consent flows, and a minimum publishable cohort of 50 enforced before aggregates surface.',
    href: '/dashboard/support/security',
  },

  // ─ Marketplace ─
  job_listings: {
    key: 'job_listings',
    title: 'Job Listings',
    abbr: '💼', badge: 'Marketplace · Openings',
    cap: 'Marketplace', persona: 'all', layer: 'marketplace',
    purpose: 'Explore openings with explainable trajectory context—not keyword scores.',
    desc: 'Browse the currently configured marketplace; every listing states whether it is community-supplied or modelled for evaluation.',
    href: '/dashboard/marketplace/jobs',
  },
  company_directory: {
    key: 'company_directory',
    title: 'Company Directory',
    abbr: '🏢', badge: 'Marketplace · Employers',
    cap: 'Marketplace', persona: 'all', layer: 'marketplace',
    purpose: 'Explore employer profiles and their declared hiring context.',
    desc: 'Browse the currently configured company directory with explicit community or modelled data scope.',
    href: '/dashboard/marketplace/companies',
  },

  // ─ Meta / Overview ─
  architecture: {
    key: 'architecture',
    title: 'Architecture & Vision',
    abbr: '🏗️', badge: 'System Overview',
    cap: 'Overview', persona: 'all', layer: 'meta',
    purpose: 'The whole vision on one screen — start here.',
    desc: 'The Career Signal Loop architecture, proposal core, Final Kit module coverage, data strategy, tech stack, and 28-day plan in one view.',
    href: '/dashboard/architecture',
  },
};

export function modulesForPersona(persona: Persona) {
  return Object.values(MODULES).filter((m) => m.persona === persona);
}
export function engineModules() {
  return Object.values(MODULES).filter((m) => m.layer === 'engine');
}
export function supportModules() {
  return Object.values(MODULES).filter((m) => m.layer === 'support');
}
export function marketplaceModules() {
  return Object.values(MODULES).filter((m) => m.layer === 'marketplace');
}
