/**
 * AI Provider interface — the single seam Talentbank swaps to plug in their own AI.
 *
 * Every AI call in the codebase goes through this interface. To integrate
 * Talentbank's internal AI:
 *   1. Set AI_PROVIDER=talentbank-internal in .env
 *   2. Create lib/ai/talentbank-internal.ts that implements this interface
 *   3. Add the case in lib/ai/index.ts factory
 *
 * That's it. Nothing else in the codebase changes.
 */

import type { Aggregate, Explanation } from '@/types';

export interface AIProvider {
  readonly name: string;

  /**
   * Embed a user's shape as a dense vector.
   * @param text The structured shape as a text representation
   * @returns Vector embedding (dimensionality depends on model; default 768 for gemini-embedding-2)
   */
  getEmbedding(text: string): Promise<number[]>;

  /**
   * Embed many texts in a batch (used at corpus generation time).
   */
  getEmbeddings(texts: string[]): Promise<number[][]>;

  /**
   * Generate an honest narrative explanation of an aggregate.
   *
   * IMPORTANT: This function must NEVER invent numbers.
   * The aggregate is passed in as structured data. The narrative should
   * reference the aggregate's numbers verbatim and add hedging/context language only.
   *
   * @param aggregate The deterministic aggregation output
   * @param audience Whether the audience is candidate | employer | university
   * @returns Validated explanation with schema-conformant structure
   */
  generateNarrative(
    aggregate: Aggregate,
    audience: 'candidate' | 'employer' | 'university'
  ): Promise<Explanation>;

  /**
   * Free-form chat completion for the AI Career Coach.
   * Prompt is expected to already contain the cohort context.
   * The wrapping module is responsible for injecting cohort evidence into the prompt.
   *
   * @param systemPrompt Includes the "honest navigation, not prediction" constraints
   * @param userMessage The user's question
   * @param cohortContext Structured cohort aggregates the model should reference
   */
  chatCompletion(
    systemPrompt: string,
    userMessage: string,
    cohortContext: Aggregate
  ): Promise<string>;
}

/**
 * Standard honest-navigation constraints prepended to every prompt.
 * The validator rejects any output that violates these — a defense-in-depth
 * measure so a rogue LLM response can't leak past.
 */
export const HONEST_NARRATIVE_CONSTRAINTS = `You are an honest career navigation assistant.

RULES YOU MUST FOLLOW:
1. NEVER predict an individual's outcome. Refer only to what the cohort has done.
2. NEVER use predictive verbs like "you will", "you'll succeed", "you're going to".
   USE instead: "people in this cohort have", "the cohort typically sees", "historically".
3. ALWAYS reference the cohort size explicitly in your first sentence.
4. ALWAYS present outcomes as ranges or distributions, never as single points.
5. NEVER invent numbers. The numbers you receive in the aggregate JSON are the only numbers.
6. When cohort_size is below 50, explicitly surface that the evidence is thin.
7. Surface trade-offs honestly. Do not gloss over paths that have lower salary, higher risk, etc.
8. When the aggregate contains an is_mycol_critical flag, mention "Malaysia's Critical Occupations List" for that role.

Format: Plain prose, 2-4 sentences per section. No bullet points unless the audience is employer.
`;
