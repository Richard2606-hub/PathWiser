import { describe, expect, it } from 'vitest';
import { applyNormalization, normalizeShapeInput, normalizeSkills } from './normalize';

describe('profile normalization', () => {
  it('maps exact occupations to maintained taxonomy identifiers', () => {
    const result = normalizeShapeInput('candidate', 'Data Scientist', ['python', 'SQL']);
    expect(result.method).toBe('exact-taxonomy');
    expect(result.escoCode).toBe('2511.1');
    expect(result.onetCode).toBe('15-2051.00');
    expect(result.skills).toEqual(['Python', 'SQL']);
  });

  it('maps employer demand labels without fabricating a confidence score', () => {
    const result = normalizeShapeInput('employer', 'Data Scientist (target hire)', ['ML']);
    expect(result.matchedRole).toBe('Data Scientist');
    expect(result.confidence).toBe(1);
    expect(result.skills).toEqual(['Machine Learning']);
  });

  it('uses ISCED for university programmes and leaves occupation codes empty', () => {
    const result = normalizeShapeInput('university', 'BSc Computer Science', ['Algorithms']);
    expect(result.programmeCode).toBe('ISCED-F 0613');
    expect(result.escoCode).toBeUndefined();
  });

  it('does not invent a taxonomy code for an unknown role', () => {
    const result = normalizeShapeInput('candidate', 'Intergalactic Story Gardener', ['Writing']);
    expect(result.method).toBe('unmapped');
    expect(result.escoCode).toBeUndefined();
  });

  it('deduplicates canonical skill names', () => {
    expect(normalizeSkills(['sql', 'SQL', 'Amazon Web Services', 'AWS'])).toEqual(['SQL', 'AWS']);
  });

  it('applies normalized identifiers to a shape', () => {
    const shape = applyNormalization({
      userId: 'test',
      persona: 'candidate',
      role: 'Software Engineer',
      education: "Bachelor's",
      years_experience: 3,
      state: 'Kuala Lumpur',
      skills: ['typescript', 'AWS'],
      life_stage: 'early_career',
    });
    expect(shape.esco_code).toBe('2512.1');
    expect(shape.skills).toEqual(['TypeScript', 'AWS']);
  });
});
