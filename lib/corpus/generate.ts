/**
 * Synthetic trajectory corpus generator — Malaysian labour data-calibrated.
 *
 * Generates ~1,500 trajectories at build time using deterministic seeded RNG.
 * Each trajectory is 3–5 steps of a career, salary-anchored to DOSM 2024
 * ranges and enriched with realistic skill progression.
 *
 * NO real people. NO scraped LinkedIn data. Pure synthetic.
 *
 * Feature vector is used INSTEAD of a real embedding when Gemini is not
 * configured — a hand-crafted 24-dim vector encoding sector, seniority,
 * skill families, geography, and life stage. Cosine similarity over these
 * vectors is a legitimate stand-in for the demo.
 *
 * Talentbank replacement: swap this with your real trajectory data source.
 */

import type { Trajectory, TrajectoryNode, LifeStage, Persona } from '@/types';
import { OCCUPATIONS, SECTORS, MY_STATES, occupationsBySector, findOccupation } from './occupations';
import { seededRandom, pickRandom, pickWeighted } from '@/lib/utils';

// ─── Feature vector encoding ────────────────────────────────
// 24 dimensions: 5 sector one-hot, 6 seniority one-hot, 8 skill families,
// 5 state one-hot ... though we compress into 24 total.
const SKILL_FAMILIES = [
  'analytics', 'engineering', 'ml_ai', 'product', 'design',
  'finance', 'communication', 'leadership'
];

const SKILL_FAMILY_MAP: Record<string, string[]> = {
  analytics: ['SQL', 'Excel', 'Tableau', 'Power BI', 'DAX', 'Bloomberg', 'A/B Testing', 'Statistics'],
  engineering: ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Kubernetes', 'Git', 'C++', 'Spark', 'Kafka', 'Airflow', 'Snowflake', 'dbt', 'REST'],
  ml_ai: ['ML', 'Deep Learning', 'PyTorch', 'TensorFlow', 'MLOps', 'Model Serving'],
  product: ['User Research', 'Roadmapping', 'Metrics', 'Growth Loops', 'Experimentation', 'Product Vision'],
  design: ['Figma', 'Design Systems', 'Wireframing'],
  finance: ['Financial Modeling', 'Valuation', 'Sector Research', 'FP&A', 'M&A', 'Derivatives', 'Regulatory Reporting'],
  communication: ['Stakeholder Mgmt', 'Stakeholder Comms', 'Presentations', 'Copywriting', 'Client Mgmt'],
  leadership: ['People Management', 'Team Leadership', 'Executive Presence', 'Strategy', 'Hiring', 'Board Reporting', 'Org Design', 'Mentoring', 'Cross-functional Leadership', 'Delivery', 'Product Vision', 'Rainmaker', 'Executive Comms']
};

function skillToFamily(skill: string): string {
  for (const family of SKILL_FAMILIES) {
    if (SKILL_FAMILY_MAP[family].some((s) => skill.toLowerCase().includes(s.toLowerCase()))) {
      return family;
    }
  }
  return 'engineering';
}

const SENIORITY_ORDER: Array<'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'exec'> = [
  'entry', 'junior', 'mid', 'senior', 'lead', 'exec'
];

/**
 * Compute a 24-dim feature vector for a trajectory.
 * Used as a stand-in for real embeddings in demo mode.
 */
export function trajectoryToFeatureVector(input: {
  sector: string;
  state: string;
  life_stage: LifeStage;
  finalSeniority: string;
  allSkills: string[];
}): number[] {
  const vec: number[] = new Array(24).fill(0);

  // Dims 0-4: sector one-hot
  const secIdx = SECTORS.indexOf(input.sector as (typeof SECTORS)[number]);
  if (secIdx >= 0) vec[secIdx] = 1;

  // Dims 5-9: state one-hot
  const stIdx = MY_STATES.indexOf(input.state as (typeof MY_STATES)[number]);
  if (stIdx >= 0) vec[5 + stIdx] = 1;

  // Dims 10-15: seniority progression score
  const senIdx = SENIORITY_ORDER.indexOf(input.finalSeniority as typeof SENIORITY_ORDER[number]);
  if (senIdx >= 0) vec[10 + senIdx] = 1;

  // Dims 16-23: skill family density
  for (const skill of input.allSkills) {
    const family = skillToFamily(skill);
    const famIdx = SKILL_FAMILIES.indexOf(family);
    if (famIdx >= 0) vec[16 + famIdx] += 1;
  }
  // Normalize skill-family dims
  const skillSum = vec.slice(16, 24).reduce((s, n) => s + n, 0) || 1;
  for (let i = 16; i < 24; i++) vec[i] /= skillSum;

  return vec;
}

/**
 * Compute a shape's feature vector — same 24-dim space as trajectories.
 */
export function shapeToFeatureVector(shape: {
  sector?: string;
  state: string;
  life_stage: LifeStage;
  skills: string[];
  years_experience: number;
}): number[] {
  const seniority =
    shape.years_experience < 2 ? 'entry' :
    shape.years_experience < 5 ? 'junior' :
    shape.years_experience < 10 ? 'mid' :
    shape.years_experience < 15 ? 'senior' :
    shape.years_experience < 20 ? 'lead' : 'exec';

  return trajectoryToFeatureVector({
    sector: shape.sector || 'Tech',
    state: shape.state,
    life_stage: shape.life_stage,
    finalSeniority: seniority,
    allSkills: shape.skills,
  });
}

// ─── Corpus generation ──────────────────────────────────────

const LIFE_STAGE_BY_STARTING_SENIORITY: Record<string, LifeStage> = {
  entry: 'young_adult',
  junior: 'early_career',
  mid: 'early_career',
  senior: 'mid_career',
  lead: 'mid_career',
  exec: 'senior_career',
};

function generateOneTrajectory(seed: number, sector: string): Trajectory {
  const rng = seededRandom(seed);
  const state = pickRandom([...MY_STATES], rng);
  const sectorOccupations = occupationsBySector(sector);

  // Start with an entry/junior/mid role
  const startPool = sectorOccupations.filter((o) => ['entry', 'junior', 'mid'].includes(o.seniority));
  const startOcc = pickRandom(startPool, rng);
  const startSeniorityIdx = SENIORITY_ORDER.indexOf(startOcc.seniority);

  const life_stage = LIFE_STAGE_BY_STARTING_SENIORITY[startOcc.seniority] || 'early_career';

  const pathLength = 3 + Math.floor(rng() * 3); // 3-5 steps
  const path: TrajectoryNode[] = [];
  let currentSeniorityIdx = startSeniorityIdx;

  for (let i = 0; i < pathLength; i++) {
    // Progress seniority forward with some randomness (sometimes stay put)
    if (i > 0) {
      const stay = rng() < 0.3;
      if (!stay && currentSeniorityIdx < SENIORITY_ORDER.length - 1) {
        currentSeniorityIdx++;
      }
    }
    const currentSeniority = SENIORITY_ORDER[currentSeniorityIdx];
    const candidates = sectorOccupations.filter((o) => o.seniority === currentSeniority);
    const occ = candidates.length ? pickRandom(candidates, rng) : startOcc;

    // Salary within calibrated anchor + small jitter
    const [pLo, pHi] = occ.salary_anchor_myr;
    const jitter = (rng() - 0.5) * 0.15;
    const monthly_salary_myr = Math.round(pLo + rng() * (pHi - pLo) + jitter * pLo);

    // Duration 12-36 months
    const duration_months = 12 + Math.floor(rng() * 24);

    // Skills — 3-5 from typical + occasional adjacent skill
    const skillCount = 3 + Math.floor(rng() * 3);
    const skills_added = i === 0
      ? occ.typical_skills.slice(0, skillCount)
      : occ.typical_skills.slice(0, Math.min(skillCount, occ.typical_skills.length));

    path.push({
      role: occ.role,
      esco_code: occ.esco_code,
      duration_months,
      monthly_salary_myr,
      skills_added,
      is_mycol_critical: occ.is_mycol_critical,
    });
  }

  const allSkills = Array.from(new Set(path.flatMap((n) => n.skills_added || [])));
  const escoCodes = Array.from(new Set(path.map((n) => n.esco_code).filter(Boolean) as string[]));

  const persona: Persona = 'candidate';

  return {
    id: `traj-${seed}`,
    persona,
    life_stage,
    state,
    sector,
    path,
    esco_codes: escoCodes,
    synthetic: true,
    calibration_source: 'DOSM 2024 Salaries & Wages Survey · ESCO · O*NET · MY recruiter guides (headline anchors)',
  };
}

/**
 * Generate the full ~1,500-record corpus.
 * Deterministic given the same seed — CI-friendly, reproducible.
 */
export function generateCorpus(count = 1500, baseSeed = 42): Array<Trajectory & { featureVector: number[] }> {
  const perSector = Math.floor(count / SECTORS.length);
  const corpus: Array<Trajectory & { featureVector: number[] }> = [];

  for (const sector of SECTORS) {
    for (let i = 0; i < perSector; i++) {
      const seed = baseSeed + corpus.length;
      const traj = generateOneTrajectory(seed, sector);
      const finalStep = traj.path[traj.path.length - 1];
      const finalOcc = finalStep ? findOccupation(finalStep.role) : undefined;
      const finalSeniority = finalOcc?.seniority || 'mid';
      const allSkills = Array.from(new Set(traj.path.flatMap((n) => n.skills_added || [])));

      const featureVector = trajectoryToFeatureVector({
        sector: traj.sector || 'Tech',
        state: traj.state || 'Kuala Lumpur',
        life_stage: traj.life_stage,
        finalSeniority,
        allSkills,
      });

      corpus.push({ ...traj, featureVector });
    }
  }

  return corpus;
}
