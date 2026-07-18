/**
 * Deterministic aggregation over a cohort of trajectories.
 *
 * This is the "part of the system that must not lie." Numbers come from HERE,
 * not from the LLM. Every function is pure (input → output, no side effects)
 * so it can be unit-tested exhaustively.
 *
 * Talentbank integration note: this module has no dependency on Supabase,
 * AI providers, or Next.js. It can be lifted into any TypeScript codebase
 * with only the /types module.
 */

import type {
  Cohort,
  Aggregate,
  NextRole,
  SalaryPercentiles,
  SkillBridge,
  TradeOff,
  CalibrationAnchor,
  Trajectory,
} from '@/types';

const MIN_COHORT_SIZE = 50;

/**
 * The one function callers use.
 * @throws if cohort.size < MIN_COHORT_SIZE — the caller should surface "cohort too small" honestly.
 */
export function aggregate(cohort: Cohort, currentStepIndex: number): Aggregate {
  if (cohort.size < MIN_COHORT_SIZE) {
    throw new Error(
      `Cohort too small (${cohort.size} < ${MIN_COHORT_SIZE}). ` +
      `Do not aggregate — surface an honest "not enough evidence" message to the user instead.`
    );
  }

  const nextRoleDist = computeNextRoleDistribution(cohort.trajectories, currentStepIndex);
  const salaryPercentiles = computeSalaryPercentilesByRole(cohort.trajectories, currentStepIndex);
  const medianTime = computeMedianTimeInRole(cohort.trajectories, currentStepIndex);
  const skillBridges = computeCommonSkillBridges(cohort.trajectories, currentStepIndex);
  const tradeOffs = surfaceTradeOffs(nextRoleDist, salaryPercentiles);
  const anchors = collectCalibrationAnchors();

  return {
    cohort_size: cohort.size,
    next_role_distribution: nextRoleDist,
    salary_percentiles_by_role: salaryPercentiles,
    median_time_in_role_months: medianTime,
    common_skill_bridges: skillBridges,
    trade_offs: tradeOffs,
    calibration_anchors: anchors,
  };
}

// ─── Pure aggregation primitives (exported for unit tests) ────

export function computeNextRoleDistribution(
  trajectories: Trajectory[],
  currentStepIndex: number
): NextRole[] {
  const counts = new Map<string, { count: number; esco: string | undefined; mycol: boolean }>();
  const nextIdx = currentStepIndex + 1;

  for (const t of trajectories) {
    const next = t.path[nextIdx];
    if (!next) continue;
    const key = next.role;
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, {
        count: 1,
        esco: next.esco_code,
        mycol: !!next.is_mycol_critical,
      });
    }
  }

  const total = Array.from(counts.values()).reduce((s, x) => s + x.count, 0) || 1;
  return Array.from(counts.entries())
    .map(([role, { count, esco, mycol }]) => ({
      role,
      count,
      probability: count / total,
      esco_code: esco,
      is_mycol_critical: mycol,
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeSalaryPercentilesByRole(
  trajectories: Trajectory[],
  currentStepIndex: number
): Record<string, SalaryPercentiles> {
  const groups = new Map<string, number[]>();
  const nextIdx = currentStepIndex + 1;

  for (const t of trajectories) {
    const next = t.path[nextIdx];
    if (!next) continue;
    if (!groups.has(next.role)) groups.set(next.role, []);
    groups.get(next.role)!.push(next.monthly_salary_myr);
  }

  const out: Record<string, SalaryPercentiles> = {};
  for (const [role, salaries] of groups.entries()) {
    if (salaries.length < 3) continue; // don't publish percentiles on tiny sub-cohorts
    salaries.sort((a, b) => a - b);
    out[role] = {
      p10: percentile(salaries, 0.1),
      p25: percentile(salaries, 0.25),
      median: percentile(salaries, 0.5),
      p75: percentile(salaries, 0.75),
      p90: percentile(salaries, 0.9),
      currency: 'MYR',
      monthly: true,
    };
  }
  return out;
}

export function computeMedianTimeInRole(
  trajectories: Trajectory[],
  currentStepIndex: number
): number {
  const durations: number[] = [];
  for (const t of trajectories) {
    const step = t.path[currentStepIndex];
    if (step) durations.push(step.duration_months);
  }
  if (durations.length === 0) return 0;
  durations.sort((a, b) => a - b);
  return percentile(durations, 0.5);
}

export function computeCommonSkillBridges(
  trajectories: Trajectory[],
  currentStepIndex: number
): SkillBridge[] {
  const counts = new Map<string, number>();
  const nextIdx = currentStepIndex + 1;
  for (const t of trajectories) {
    const next = t.path[nextIdx];
    if (!next?.skills_added) continue;
    for (const s of next.skills_added) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }
  }
  const total = trajectories.length;
  return Array.from(counts.entries())
    .map(([skill, count]) => ({ skill, frequency: count / total }))
    .filter((x) => x.frequency >= 0.15) // surface only skills present in 15%+ of cohort
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8);
}

function surfaceTradeOffs(
  dist: NextRole[],
  salaries: Record<string, SalaryPercentiles>
): TradeOff[] {
  const out: TradeOff[] = [];
  if (dist.length < 2) return out;

  // Salary ceiling trade-off: highest median vs largest cohort
  const topByProbability = dist[0];
  const topBySalary = dist
    .filter((r) => salaries[r.role])
    .sort((a, b) => (salaries[b.role]?.median || 0) - (salaries[a.role]?.median || 0))[0];

  if (topBySalary && topByProbability.role !== topBySalary.role) {
    out.push({
      path_a: topByProbability.role,
      path_b: topBySalary.role,
      dimension: 'salary_ceiling',
      description: `The most common next step is ${topByProbability.role} (${Math.round(topByProbability.probability * 100)}% of cohort). ${topBySalary.role} has a higher salary ceiling but is chosen by a smaller share.`,
    });
  }
  return out;
}

function collectCalibrationAnchors(): CalibrationAnchor[] {
  return [
    {
      source: 'DOSM Salaries & Wages Survey Report 2024',
      reference: 'Overall mean RM 3,652 / median RM 2,793',
      license: 'CC-BY 4.0',
    },
    {
      source: 'DOSM Graduates Statistics 2024',
      reference: 'Graduate median RM 4,521 · KL median RM 5,888',
      license: 'CC-BY 4.0',
    },
    {
      source: 'ESCO occupation taxonomy',
      reference: 'European Skills, Competences, Occupations classification',
      license: 'EU Decision 2011/833/EU',
    },
    {
      source: 'O*NET Database',
      reference: 'US Department of Labor occupation + skill taxonomy',
      license: 'CC-BY 4.0',
    },
  ];
}

// ─── Percentile helper ────
export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = (sortedValues.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedValues[lo];
  return sortedValues[lo] + (sortedValues[hi] - sortedValues[lo]) * (idx - lo);
}

// Exported constants
export { MIN_COHORT_SIZE };
