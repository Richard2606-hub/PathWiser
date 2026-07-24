import { describe, expect, it } from 'vitest';
import { rankMarketplaceJobs, type MarketplaceJob } from './rank';
import type { Aggregate, UserShape } from '@/types';

const shape: UserShape = {
  userId: 'candidate',
  persona: 'candidate',
  role: 'Data Analyst',
  education: "Bachelor's",
  years_experience: 3,
  state: 'Kuala Lumpur',
  skills: ['Python', 'SQL'],
  life_stage: 'early_career',
};

const aggregate: Aggregate = {
  cohort_size: 200,
  next_role_distribution: [
    { role: 'Data Scientist', count: 100, probability: 0.5 },
    { role: 'Product Manager', count: 40, probability: 0.2 },
  ],
  salary_percentiles_by_role: {},
  median_time_in_role_months: 24,
  common_skill_bridges: [],
  trade_offs: [],
  calibration_anchors: [],
};

const jobs: MarketplaceJob[] = [
  { id: '1', title: 'Data Scientist', company: 'A', location: 'KL', sector: 'Tech', salaryMin: 1, salaryMax: 2, exp: '2 years', mycol: true, remote: 'Hybrid', skills: ['Python', 'SQL'], posted: 'today', description: '' },
  { id: '2', title: 'Brand Designer', company: 'B', location: 'KL', sector: 'Design', salaryMin: 1, salaryMax: 2, exp: '2 years', mycol: false, remote: 'Onsite', skills: ['Figma'], posted: 'today', description: '' },
];

describe('marketplace ranking', () => {
  it('ranks cohort-aligned roles above unrelated inventory', () => {
    const ranked = rankMarketplaceJobs(jobs, shape, aggregate);
    expect(ranked[0].id).toBe('1');
    expect(ranked[0].alignment).toBe('Strong direction');
    expect(ranked[0].cohortShare).toBe(0.5);
  });

  it('explains skill alignment without exposing a black-box percentage score', () => {
    const [ranked] = rankMarketplaceJobs(jobs, shape, aggregate);
    expect(ranked.alignedSkills).toEqual(['Python', 'SQL']);
    expect(ranked.rationale).toContain('2 of 2');
  });
});
