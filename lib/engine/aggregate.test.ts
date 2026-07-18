/**
 * Unit tests for the deterministic aggregation layer.
 * This is the part of the system that must not lie.
 * Every function is a pure function → property-testable.
 */

import { describe, it, expect } from 'vitest';
import {
  aggregate,
  computeNextRoleDistribution,
  computeSalaryPercentilesByRole,
  computeMedianTimeInRole,
  computeCommonSkillBridges,
  percentile,
  MIN_COHORT_SIZE,
} from './aggregate';
import type { Cohort, Trajectory } from '@/types';

function makeTrajectory(id: string, path: Array<{ role: string; salary: number; skills?: string[]; duration?: number; mycol?: boolean }>): Trajectory {
  return {
    id,
    persona: 'candidate',
    life_stage: 'early_career',
    state: 'Kuala Lumpur',
    sector: 'Tech',
    esco_codes: [],
    synthetic: true,
    calibration_source: 'test',
    path: path.map((p) => ({
      role: p.role,
      monthly_salary_myr: p.salary,
      duration_months: p.duration ?? 24,
      skills_added: p.skills ?? [],
      is_mycol_critical: p.mycol,
    })),
  };
}

function makeCohort(trajectories: Trajectory[]): Cohort {
  return {
    size: trajectories.length,
    trajectories,
    similarity_stats: { mean: 0.9, stddev: 0.05, min: 0.8, max: 0.98 },
    filters_applied: {},
  };
}

// ─── percentile ────
describe('percentile', () => {
  it('returns the value at the requested percentile of a sorted array', () => {
    expect(percentile([1, 2, 3, 4, 5], 0.5)).toBe(3);
    expect(percentile([1, 2, 3, 4, 5], 0)).toBe(1);
    expect(percentile([1, 2, 3, 4, 5], 1)).toBe(5);
  });
  it('interpolates between adjacent values', () => {
    expect(percentile([10, 20], 0.5)).toBe(15);
    expect(percentile([0, 100], 0.25)).toBe(25);
  });
  it('returns 0 for empty input', () => {
    expect(percentile([], 0.5)).toBe(0);
  });
});

// ─── computeNextRoleDistribution ────
describe('computeNextRoleDistribution', () => {
  it('counts occurrences of next step and normalizes to probability', () => {
    const cohort = [
      makeTrajectory('a', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 6000 }]),
      makeTrajectory('b', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 6500 }]),
      makeTrajectory('c', [{ role: 'Start', salary: 4000 }, { role: 'Y', salary: 8000 }]),
    ];
    const dist = computeNextRoleDistribution(cohort, 0);
    expect(dist).toHaveLength(2);
    expect(dist[0].role).toBe('X');
    expect(dist[0].count).toBe(2);
    expect(dist[0].probability).toBeCloseTo(0.667, 2);
    expect(dist[1].role).toBe('Y');
    expect(dist[1].probability).toBeCloseTo(0.333, 2);
  });
  it('is sorted by count descending', () => {
    const cohort = Array.from({ length: 10 }, (_, i) =>
      makeTrajectory(`t${i}`, [{ role: 'Start', salary: 4000 }, { role: i < 7 ? 'A' : 'B', salary: 6000 }])
    );
    const dist = computeNextRoleDistribution(cohort, 0);
    expect(dist[0].role).toBe('A');
    expect(dist[0].count).toBeGreaterThan(dist[1].count);
  });
  it('handles missing next steps gracefully', () => {
    const cohort = [
      makeTrajectory('a', [{ role: 'Start', salary: 4000 }]), // no next step
      makeTrajectory('b', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 6000 }]),
    ];
    const dist = computeNextRoleDistribution(cohort, 0);
    expect(dist).toHaveLength(1);
    expect(dist[0].role).toBe('X');
    expect(dist[0].probability).toBe(1);
  });
  it('propagates MyCOL flag from source trajectory', () => {
    const cohort = [
      makeTrajectory('a', [
        { role: 'Start', salary: 4000 },
        { role: 'Critical Role', salary: 8000, mycol: true },
      ]),
    ];
    const dist = computeNextRoleDistribution(cohort, 0);
    expect(dist[0].is_mycol_critical).toBe(true);
  });
});

// ─── computeSalaryPercentilesByRole ────
describe('computeSalaryPercentilesByRole', () => {
  it('computes percentiles per next role', () => {
    const cohort = [
      makeTrajectory('a', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 5000 }]),
      makeTrajectory('b', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 6000 }]),
      makeTrajectory('c', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 7000 }]),
      makeTrajectory('d', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 8000 }]),
    ];
    const sal = computeSalaryPercentilesByRole(cohort, 0);
    expect(sal.X.p25).toBeCloseTo(5750, -1);
    expect(sal.X.median).toBeCloseTo(6500, -1);
    expect(sal.X.p75).toBeCloseTo(7250, -1);
    expect(sal.X.currency).toBe('MYR');
    expect(sal.X.monthly).toBe(true);
  });
  it('drops sub-cohorts of size < 3', () => {
    const cohort = [
      makeTrajectory('a', [{ role: 'Start', salary: 4000 }, { role: 'Small', salary: 5000 }]),
      makeTrajectory('b', [{ role: 'Start', salary: 4000 }, { role: 'Small', salary: 6000 }]),
    ];
    const sal = computeSalaryPercentilesByRole(cohort, 0);
    expect(sal.Small).toBeUndefined();
  });
});

// ─── computeMedianTimeInRole ────
describe('computeMedianTimeInRole', () => {
  it('computes median duration of the current step', () => {
    const cohort = [
      makeTrajectory('a', [{ role: 'Start', salary: 4000, duration: 12 }, { role: 'X', salary: 5000 }]),
      makeTrajectory('b', [{ role: 'Start', salary: 4000, duration: 18 }, { role: 'X', salary: 5000 }]),
      makeTrajectory('c', [{ role: 'Start', salary: 4000, duration: 24 }, { role: 'X', salary: 5000 }]),
      makeTrajectory('d', [{ role: 'Start', salary: 4000, duration: 30 }, { role: 'X', salary: 5000 }]),
    ];
    expect(computeMedianTimeInRole(cohort, 0)).toBeCloseTo(21, 0);
  });
});

// ─── computeCommonSkillBridges ────
describe('computeCommonSkillBridges', () => {
  it('surfaces skills present in ≥ 15% of cohort', () => {
    const cohort = Array.from({ length: 20 }, (_, i) =>
      makeTrajectory(`t${i}`, [
        { role: 'Start', salary: 4000 },
        { role: 'X', salary: 6000, skills: i < 10 ? ['Python', 'SQL'] : ['SQL'] },
      ])
    );
    const bridges = computeCommonSkillBridges(cohort, 0);
    const python = bridges.find((b) => b.skill === 'Python');
    const sql = bridges.find((b) => b.skill === 'SQL');
    expect(python?.frequency).toBeCloseTo(0.5, 1);
    expect(sql?.frequency).toBeCloseTo(1.0, 1);
  });
  it('filters out skills below the 15% threshold', () => {
    const cohort = Array.from({ length: 20 }, (_, i) =>
      makeTrajectory(`t${i}`, [
        { role: 'Start', salary: 4000 },
        { role: 'X', salary: 6000, skills: i < 2 ? ['Rare Skill'] : ['Common'] },
      ])
    );
    const bridges = computeCommonSkillBridges(cohort, 0);
    expect(bridges.find((b) => b.skill === 'Rare Skill')).toBeUndefined();
    expect(bridges.find((b) => b.skill === 'Common')).toBeDefined();
  });
});

// ─── aggregate (integration) ────
describe('aggregate', () => {
  it('refuses to aggregate cohorts below MIN_COHORT_SIZE', () => {
    const cohort = makeCohort([
      makeTrajectory('a', [{ role: 'Start', salary: 4000 }, { role: 'X', salary: 6000 }]),
    ]);
    expect(() => aggregate(cohort, 0)).toThrow(/Cohort too small/);
  });

  it('produces a well-formed aggregate for a valid cohort', () => {
    const cohort = makeCohort(
      Array.from({ length: MIN_COHORT_SIZE + 10 }, (_, i) =>
        makeTrajectory(`t${i}`, [
          { role: 'Start', salary: 4000, duration: 20 },
          { role: i % 2 === 0 ? 'A' : 'B', salary: 5000 + i * 50, skills: ['Python'] },
        ])
      )
    );
    const agg = aggregate(cohort, 0);
    expect(agg.cohort_size).toBe(cohort.size);
    expect(agg.next_role_distribution.length).toBeGreaterThanOrEqual(2);
    expect(Object.keys(agg.salary_percentiles_by_role).length).toBeGreaterThanOrEqual(2);
    expect(agg.median_time_in_role_months).toBe(20);
    expect(agg.calibration_anchors.length).toBeGreaterThan(0);
    // Anchor citations must reference DOSM
    expect(agg.calibration_anchors.some((a) => a.source.includes('DOSM'))).toBe(true);
  });

  it('probabilities sum to 1 (within floating-point tolerance)', () => {
    const cohort = makeCohort(
      Array.from({ length: 60 }, (_, i) =>
        makeTrajectory(`t${i}`, [
          { role: 'Start', salary: 4000 },
          { role: ['A', 'B', 'C'][i % 3], salary: 5000 + i * 50 },
        ])
      )
    );
    const agg = aggregate(cohort, 0);
    const total = agg.next_role_distribution.reduce((s, r) => s + r.probability, 0);
    expect(total).toBeCloseTo(1, 5);
  });
});
