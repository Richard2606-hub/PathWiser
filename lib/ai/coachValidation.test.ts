import { describe, expect, it } from 'vitest';
import { deterministicCoachReply, validateCoachReply } from './coachValidation';
import type { Aggregate } from '@/types';

const aggregate = {
  cohort_size: 120,
  next_role_distribution: [{ role: 'Data Scientist', count: 48, probability: 0.4 }],
  salary_percentiles_by_role: {},
  median_time_in_role_months: 24,
  common_skill_bridges: [{ skill: 'Python', frequency: 0.6 }],
  trade_offs: [],
  calibration_anchors: [],
} as Aggregate;

describe('coach honesty validation', () => {
  it('accepts a cohort-grounded non-predictive response', () => {
    expect(validateCoachReply('Across the 120 trajectories, Data Scientist was one observed option.', aggregate).passed).toBe(true);
  });

  it('rejects individual prediction language', () => {
    const result = validateCoachReply('Across 120 trajectories, you will become a Data Scientist.', aggregate);
    expect(result.passed).toBe(false);
    expect(result.notes).toContain('Predictive language detected.');
  });

  it('rejects a response that omits the cohort size', () => {
    expect(validateCoachReply('Data Scientist was one observed option.', aggregate).passed).toBe(false);
  });

  it('creates a deterministic publishable fallback', () => {
    const reply = deterministicCoachReply(aggregate);
    expect(reply).toContain('120 trajectories');
    expect(reply).toContain('Data Scientist');
    expect(reply).toContain('not as an individual prediction');
  });
});
