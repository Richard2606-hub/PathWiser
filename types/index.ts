/**
 * Shared TypeScript types across the PathWiser engine + UI.
 * These are the contracts Talentbank's Angular team would call into.
 * See the OpenAPI spec (openapi.yaml) for the language-agnostic version.
 */

export type Persona = 'candidate' | 'employer' | 'university';

export type LifeStage =
  | 'student'          // 13–17
  | 'young_adult'      // 18–22
  | 'early_career'     // 23–34
  | 'mid_career'       // 35–44
  | 'senior_career'    // 45–54
  | 'executive';       // 55+

/**
 * The core user shape — feeds retrieval.
 * Talentbank can extend this with their own fields (Work Animal alignment, etc.).
 */
export interface UserShape {
  userId: string;
  persona: Persona;
  role: string;
  esco_code?: string;
  onet_code?: string;
  masco_code?: string;
  education: string;
  years_experience: number;
  state: string; // MY state
  skills: string[];
  life_stage: LifeStage;
  work_animal?: WorkAnimalKey; // Optional Menagerie Method dimension
  dimensions?: ShapeDimensions;
}

export interface ShapeDimensions {
  technical: number;
  domain: number;
  leadership: number;
  analytics: number;
  communication: number;
}

export type WorkAnimalKey =
  | 'owl'
  | 'fox'
  | 'bear'
  | 'dolphin'
  | 'eagle'
  | 'ant';

/**
 * A single trajectory row in the corpus.
 * Anonymised — no PII, no identifying details.
 */
export interface Trajectory {
  id: string;
  persona: Persona;
  life_stage: LifeStage;
  state: string;
  sector: string;
  path: TrajectoryNode[];
  esco_codes: string[];
  synthetic: true;           // Always true for the hackathon corpus
  calibration_source: string; // e.g. 'DOSM 2024 · Salaries & Wages Survey'
}

export interface TrajectoryNode {
  role: string;
  esco_code?: string;
  employer_type?: string;
  duration_months: number;
  monthly_salary_myr: number;
  skills_added?: string[];
  is_mycol_critical?: boolean;
}

/**
 * Result of retrieval — the cohort of similar trajectories.
 */
export interface Cohort {
  size: number;
  trajectories: Trajectory[];
  similarity_stats: {
    mean: number;
    stddev: number;
    min: number;
    max: number;
  };
  filters_applied: {
    life_stage?: LifeStage;
    state?: string;
    sector?: string;
  };
  cohort_too_small?: {
    reason: string;
    k_min: number;
  };
}

/**
 * Deterministic aggregation output — the numbers.
 * The LLM never invents these; they come from cohort math.
 */
export interface Aggregate {
  cohort_size: number;
  next_role_distribution: NextRole[];
  salary_percentiles_by_role: Record<string, SalaryPercentiles>;
  median_time_in_role_months: number;
  common_skill_bridges: SkillBridge[];
  trade_offs: TradeOff[];
  calibration_anchors: CalibrationAnchor[];
}

export interface NextRole {
  role: string;
  count: number;
  probability: number; // 0-1
  esco_code?: string;
  is_mycol_critical?: boolean;
}

export interface SalaryPercentiles {
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  currency: 'MYR';
  monthly: true;
}

export interface SkillBridge {
  skill: string;
  frequency: number; // fraction of cohort who had this skill
  esco_skill_id?: string;
}

export interface TradeOff {
  path_a: string;
  path_b: string;
  dimension: 'salary_ceiling' | 'time' | 'skill_decay' | 'cohort_confidence';
  description: string;
}

export interface CalibrationAnchor {
  source: string;
  reference: string;
  license: string;
}

/**
 * AI Explanation output — the honest narrative.
 * Structure enforced by schema; predictive verbs rejected by validator.
 */
export interface Explanation {
  narrative: string;
  cohort_size_disclosed: boolean;
  ranges_disclosed: boolean;
  passed_validation: boolean;
  validator_notes?: string[];
}

export interface EvidenceProvenance {
  mode: 'community' | 'modelled';
  synthetic: boolean;
  label: string;
  corpus_size: number;
  minimum_cohort_size: number;
  calibration_sources: string[];
}

export interface TalentCandidateMatch {
  id: string;
  display_name: string;
  current_role: string;
  state: string;
  matched_skills: string[];
  skill_bridges: string[];
  rationale: string;
  adjacent: boolean;
  consent_scope: 'synthetic-example' | 'employer-discovery';
}
