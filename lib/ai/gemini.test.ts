import { describe, expect, it } from 'vitest';
import { isTransientAIError } from './gemini';

describe('Gemini provider resilience', () => {
  it.each([429, 500, 502, 503, 504])('retries transient status %s', (status) => {
    expect(isTransientAIError({ status })).toBe(true);
  });

  it.each([400, 401, 403, 404, 422])('does not retry permanent status %s', (status) => {
    expect(isTransientAIError({ status })).toBe(false);
  });

  it('does not mistake arbitrary errors for provider outages', () => {
    expect(isTransientAIError(new Error('bad input'))).toBe(false);
  });
});
