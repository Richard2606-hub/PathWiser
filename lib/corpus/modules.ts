/**
 * Module registry — 16 modules across 4 layers.
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
    purpose: 'How the engine knows who you are.',
    desc: 'The structured representation of who you are — skills, education, prior roles, geography, life stage. Embedded as a 768-d vector for retrieval.',
    href: '/dashboard/engine/user-profile',
  },
  trajectory_retrieval: {
    key: 'trajectory_retrieval',
    title: 'Trajectory Retrieval Engine',
    abbr: 'TR', badge: 'Engine · Retrieval',
    cap: 'Engine', persona: 'engine', layer: 'engine',
    purpose: 'How the engine finds people like you.',
    desc: 'pgvector HNSW similarity search over the trajectory corpus. Returns the cohort of anonymised paths whose shape resembles yours.',
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
    purpose: 'Walk into your next salary conversation with evidence.',
    desc: "Find out if you're paid what you're worth. DOSM-calibrated percentile for your role, location, and experience.",
    href: '/dashboard/candidate/fair-pay',
  },

  // ─ Employer Surface ─
  talent_matching: {
    key: 'talent_matching',
    title: 'Smart Talent Matching',
    abbr: 'STM', badge: 'For Employers · Navigation',
    cap: 'Navigation', persona: 'employer', layer: 'nav',
    purpose: "Find the right person, including the ones you'd never have searched for.",
    desc: 'Surface candidates whose trajectory direction fits the role — including adjacent ones a keyword search would miss.',
    href: '/dashboard/employer/talent-matching',
  },
  retention_signals: {
    key: 'retention_signals',
    title: 'Talent Retention Signals',
    abbr: 'TRS', badge: 'For Employers · Intelligence',
    cap: 'Intelligence', persona: 'employer', layer: 'intel',
    purpose: 'Have the conversation before the letter arrives.',
    desc: 'Spot disengagement patterns before they become resignation letters.',
    href: '/dashboard/employer/retention-signals',
  },
  onboarding_predictor: {
    key: 'onboarding_predictor',
    title: 'Onboarding Success Predictor',
    abbr: 'OSP', badge: 'For Employers · Valuation',
    cap: 'Valuation', persona: 'employer', layer: 'val',
    purpose: 'Focus your onboarding effort where it actually makes a difference.',
    desc: 'See which new hires are likely to thrive and which need support.',
    href: '/dashboard/employer/onboarding-predictor',
  },

  // ─ University Surface ─
  outcome_loop: {
    key: 'outcome_loop',
    title: 'Lifelong Outcome Loop',
    abbr: 'LOL', badge: 'For Universities · Navigation',
    cap: 'Navigation', persona: 'university', layer: 'nav',
    purpose: 'Stop losing sight of your graduates after the diploma.',
    desc: 'Track where your graduates actually land at 1, 5, and 10 years out — not just first jobs.',
    href: '/dashboard/university/outcome-loop',
  },
  curriculum_engine: {
    key: 'curriculum_engine',
    title: 'Future-State Curriculum Engine',
    abbr: 'FCE', badge: 'For Universities · Intelligence',
    cap: 'Intelligence', persona: 'university', layer: 'intel',
    purpose: 'Teach what will still be useful when this cohort graduates.',
    desc: "See the gap between what employers are hiring for and what you're teaching.",
    href: '/dashboard/university/curriculum-engine',
  },
  readiness_profile: {
    key: 'readiness_profile',
    title: 'Alumni Readiness Profile',
    abbr: 'ARP', badge: 'For Universities · Valuation',
    cap: 'Valuation', persona: 'university', layer: 'val',
    purpose: 'Show employers what your student can actually do — right now.',
    desc: 'A live capability profile that grows with the student — replaces the static degree certificate.',
    href: '/dashboard/university/readiness-profile',
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
    desc: 'Row-level security, revocable consent flows, k-anonymity (k≥5) enforced before any cohort surfaces.',
    href: '/dashboard/support/security',
  },

  // ─ Marketplace ─
  job_listings: {
    key: 'job_listings',
    title: 'Job Listings',
    abbr: '💼', badge: 'Marketplace · Openings',
    cap: 'Marketplace', persona: 'all', layer: 'marketplace',
    purpose: 'Real openings, ranked by trajectory fit — not keyword match.',
    desc: "Live openings across Malaysia's employer network — each ranked by how well the role's inflow trajectory fits your shape.",
    href: '/dashboard/marketplace/jobs',
  },
  company_directory: {
    key: 'company_directory',
    title: 'Company Directory',
    abbr: '🏢', badge: 'Marketplace · Employers',
    cap: 'Marketplace', persona: 'all', layer: 'marketplace',
    purpose: 'See who employers actually hire — and where their people go.',
    desc: 'Employers in the network with their hiring shape.',
    href: '/dashboard/marketplace/companies',
  },

  // ─ Meta / Overview ─
  architecture: {
    key: 'architecture',
    title: 'Architecture & Vision',
    abbr: '🏗️', badge: 'System Overview',
    cap: 'Overview', persona: 'all', layer: 'meta',
    purpose: 'The whole vision on one screen — start here.',
    desc: 'The Career Signal Loop architecture, the 9-module map, data strategy, tech stack, and 28-day plan in one view.',
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
