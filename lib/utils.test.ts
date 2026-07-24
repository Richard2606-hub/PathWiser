import { describe, expect, it } from 'vitest';
import { formatMYR } from './utils';

describe('formatMYR', () => {
  it('rounds cohort-derived salary values to whole ringgit', () => {
    expect(formatMYR(14_907.5)).toBe('RM 14,908/m');
  });

  it('can omit the monthly suffix without exposing fractional ringgit noise', () => {
    expect(formatMYR(7_789.75, false)).toBe('RM 7,790');
  });
});
