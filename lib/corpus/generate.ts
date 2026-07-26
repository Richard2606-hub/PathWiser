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
import { SECTORS, MY_STATES, occupationsBySector, findOccupation, type Occupation } from './occupations';
import { seededRandom, pickRandom, pickWeighted } from '@/lib/utils';

// ─── Feature vector encoding ────────────────────────────────
// Dimension layout is dynamic so the encoding scales with the economy-wide
// taxonomy (16 sectors × 16 states) instead of a fixed 24 slots:
//   [ sector one-hot | state one-hot | seniority one-hot | skill-family density ]
// Both trajectory and query vectors use the SAME layout (via the offsets
// below), so cosine similarity stays valid regardless of taxonomy size.
const SKILL_FAMILIES = [
  'analytics', 'engineering', 'ml_ai', 'product', 'design',
  'finance', 'communication', 'leadership'
];

const SENIORITY_DIMS = 6;
const SECTOR_OFFSET = 0;
const STATE_OFFSET = SECTOR_OFFSET + SECTORS.length;
const SENIORITY_OFFSET = STATE_OFFSET + MY_STATES.length;
const SKILL_OFFSET = SENIORITY_OFFSET + SENIORITY_DIMS;
const VECTOR_DIMS = SKILL_OFFSET + SKILL_FAMILIES.length;

/** Index of a named skill family in the vector, or -1 if unknown. */
function skillFamilyDim(family: string): number {
  const idx = SKILL_FAMILIES.indexOf(family);
  return idx >= 0 ? SKILL_OFFSET + idx : -1;
}

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

// ─── Career-track coherence ─────────────────────────────────
// Progression should follow realistic tracks (a data analyst trends toward
// data/ML roles, not a random jump across the sector). We score how related two
// roles are by shared exact skills + shared skill families, then weight the next
// step by that relatedness — which also concentrates the next-role distribution
// into meaningful shares instead of many near-equal slivers.
function familySet(occ: Occupation): Set<string> {
  const s = new Set<string>();
  for (const skill of occ.typical_skills) s.add(skillToFamily(skill));
  return s;
}

function relatednessScore(from: Occupation, fromFamilies: Set<string>, to: Occupation): number {
  const fromSkills = new Set(from.typical_skills.map((s) => s.toLowerCase()));
  let exact = 0;
  for (const skill of to.typical_skills) if (fromSkills.has(skill.toLowerCase())) exact++;
  let family = 0;
  const toFamilies = familySet(to);
  for (const fam of toFamilies) if (fromFamilies.has(fam)) family++;
  return 2 * exact + family;
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
  const vec: number[] = new Array(VECTOR_DIMS).fill(0);

  // Sector one-hot
  const secIdx = SECTORS.indexOf(input.sector as (typeof SECTORS)[number]);
  if (secIdx >= 0) vec[SECTOR_OFFSET + secIdx] = 1;

  // State one-hot
  const stIdx = MY_STATES.indexOf(input.state as (typeof MY_STATES)[number]);
  if (stIdx >= 0) vec[STATE_OFFSET + stIdx] = 1;

  // Seniority one-hot
  const senIdx = SENIORITY_ORDER.indexOf(input.finalSeniority as typeof SENIORITY_ORDER[number]);
  if (senIdx >= 0) vec[SENIORITY_OFFSET + senIdx] = 1;

  // Skill-family density
  for (const skill of input.allSkills) {
    const dim = skillFamilyDim(skillToFamily(skill));
    if (dim >= 0) vec[dim] += 1;
  }
  // Normalize skill-family dims
  const skillSum = vec.slice(SKILL_OFFSET, VECTOR_DIMS).reduce((s, n) => s + n, 0) || 1;
  for (let i = SKILL_OFFSET; i < VECTOR_DIMS; i++) vec[i] /= skillSum;

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
  dimensions?: {
    technical: number;
    domain: number;
    leadership: number;
    analytics: number;
    communication: number;
  };
}): number[] {
  const seniority =
    shape.years_experience < 2 ? 'entry' :
    shape.years_experience < 5 ? 'junior' :
    shape.years_experience < 10 ? 'mid' :
    shape.years_experience < 15 ? 'senior' :
    shape.years_experience < 20 ? 'lead' : 'exec';

  const vector = trajectoryToFeatureVector({
    sector: shape.sector || 'Tech',
    state: shape.state,
    life_stage: shape.life_stage,
    finalSeniority: seniority,
    allSkills: shape.skills,
  });

  if (shape.dimensions) {
    const technicalWeight = 0.5 + shape.dimensions.technical / 100;
    const analyticsWeight = 0.5 + shape.dimensions.analytics / 100;
    const leadershipWeight = 0.5 + shape.dimensions.leadership / 100;
    const communicationWeight = 0.5 + shape.dimensions.communication / 100;
    const applyWeight = (family: string, weight: number) => {
      const dim = skillFamilyDim(family);
      if (dim >= 0) vector[dim] *= weight;
    };
    applyWeight('engineering', technicalWeight);
    applyWeight('analytics', analyticsWeight);
    applyWeight('ml_ai', analyticsWeight);
    applyWeight('communication', communicationWeight);
    applyWeight('leadership', leadershipWeight);
  }

  return vector;
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
  let currentOcc = startOcc;

  for (let i = 0; i < pathLength; i++) {
    if (i > 0) {
      // Progress seniority forward with some randomness (sometimes stay put)
      const stay = rng() < 0.3;
      if (!stay && currentSeniorityIdx < SENIORITY_ORDER.length - 1) {
        currentSeniorityIdx++;
      }
      const currentSeniority = SENIORITY_ORDER[currentSeniorityIdx];
      const candidates = sectorOccupations.filter((o) => o.seniority === currentSeniority);
      if (candidates.length) {
        // Weight the next role by how related it is to the current one, so a
        // coherent track dominates while adjacent moves stay possible.
        const fromFamilies = familySet(currentOcc);
        const weighted = candidates.map((o) => {
          const score = relatednessScore(currentOcc, fromFamilies, o);
          return { item: o, weight: 1 + score * score * 2.5 };
        });
        currentOcc = pickWeighted(weighted, rng);
      }
    }
    const occ = currentOcc;

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
