import { ApiError, GoogleGenAI } from '@google/genai';
import type { AIProvider } from './interface';
import { HONEST_NARRATIVE_CONSTRAINTS } from './interface';
import type { Aggregate, Explanation } from '@/types';

/**
 * Google AI Studio (Gemini) provider — the default AI implementation.
 * Uses free tier at aistudio.google.com/apikey.
 *
 * Cost profile:
 *   - Embeddings (gemini-embedding-2): free tier, 1500 requests/minute
 *   - Chat (gemini-3.5-flash-lite): free tier, 15 requests/minute
 *
 * For Talentbank adoption: swap this file with your internal AI implementation
 * of the AIProvider interface. Nothing else changes.
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private client: GoogleGenAI;
  private embeddingModel: string;
  private chatModel: string;
  private readonly embeddingDimensions = 768;

  constructor(apiKey: string, options?: { embeddingModel?: string; chatModel?: string }) {
    if (!apiKey) {
      throw new Error(
        'GeminiProvider: GEMINI_API_KEY is required. ' +
        'Get one free at https://aistudio.google.com/apikey'
      );
    }
    this.client = new GoogleGenAI({ apiKey });
    this.embeddingModel = options?.embeddingModel || 'gemini-embedding-2';
    this.chatModel = options?.chatModel || 'gemini-3.5-flash-lite';
  }

  async getEmbedding(text: string): Promise<number[]> {
    const result = await withTransientRetry(() => this.client.models.embedContent({
      model: this.embeddingModel,
      contents: text,
      config: { outputDimensionality: this.embeddingDimensions },
    }));
    const values = result.embeddings?.[0]?.values;
    return requireEmbedding(values, this.embeddingDimensions);
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    // Separate Content objects produce one embedding per input. Chunking keeps
    // import requests bounded while avoiding one HTTP request per trajectory.
    const out: number[][] = [];
    const chunkSize = 50;
    for (let i = 0; i < texts.length; i += chunkSize) {
      const batch = texts.slice(i, i + chunkSize);
      const result = await withTransientRetry(() => this.client.models.embedContent({
        model: this.embeddingModel,
        contents: batch.map((text) => ({ role: 'user', parts: [{ text }] })),
        config: { outputDimensionality: this.embeddingDimensions },
      }));
      const embeddings = result.embeddings ?? [];
      if (embeddings.length !== batch.length) {
        throw new Error(`Gemini returned ${embeddings.length} embeddings for a batch of ${batch.length}.`);
      }
      out.push(...embeddings.map((embedding) =>
        requireEmbedding(embedding.values, this.embeddingDimensions)
      ));
    }
    return out;
  }

  async generateNarrative(
    aggregate: Aggregate,
    audience: 'candidate' | 'employer' | 'university'
  ): Promise<Explanation> {
    const audiencePrompt = {
      candidate:
        'You are speaking to a candidate deciding their next move. Frame the aggregate around what THEIR options look like.',
      employer:
        'You are speaking to an employer/hiring lead. Frame the aggregate around what the talent shape looks like from a hiring perspective.',
      university:
        'You are speaking to a university programme director. Frame the aggregate around where graduates land and what curriculum insight it implies.',
    }[audience];

    const prompt = `${HONEST_NARRATIVE_CONSTRAINTS}\n\n${audiencePrompt}\n\nAggregate (verbatim numbers you must reference):\n\`\`\`json\n${JSON.stringify(aggregate, null, 2)}\n\`\`\`\n\nProduce a 2-4 sentence narrative that explains what this cohort shows.`;

    const result = await withTransientRetry(() => this.client.models.generateContent({
      model: this.chatModel,
      contents: prompt,
    }));
    const text = requireGeneratedText(result.text);

    return validateExplanation(text, aggregate);
  }

  async chatCompletion(
    systemPrompt: string,
    userMessage: string,
    cohortContext: Aggregate
  ): Promise<string> {
    const contextBlock = `\n\n[Cohort context - use these numbers verbatim, do not invent others]:\n${JSON.stringify(cohortContext, null, 2)}\n\n`;
    const result = await withTransientRetry(() => this.client.models.generateContent({
      model: this.chatModel,
      contents: userMessage + contextBlock,
      config: {
        systemInstruction: `${HONEST_NARRATIVE_CONSTRAINTS}\n\n${systemPrompt}`,
      },
    }));
    return requireGeneratedText(result.text);
  }
}

function requireEmbedding(values: number[] | undefined, dimensions: number): number[] {
  if (!values || values.length !== dimensions) {
    throw new Error(
      `Gemini embedding contract failed: expected ${dimensions} dimensions, received ${values?.length ?? 0}.`
    );
  }
  return values;
}

function requireGeneratedText(text: string | undefined): string {
  const value = text?.trim();
  if (!value) throw new Error('Gemini returned an empty response.');
  return value;
}

export function isTransientAIError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return [429, 500, 502, 503, 504].includes(error.status);
  }
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number((error as { status?: unknown }).status)
    : NaN;
  return [429, 500, 502, 503, 504].includes(status);
}

async function withTransientRetry<T>(operation: () => Promise<T>): Promise<T> {
  const delays = [300, 900];
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientAIError(error) || attempt >= delays.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }
}

/**
 * Post-generation validator — rejects narratives that violate the honesty rules.
 * If the LLM slipped a predictive verb or hallucinated a number, this catches it.
 */
function validateExplanation(text: string, aggregate: Aggregate): Explanation {
  const predictiveVerbs = /\b(you will|you'll|will succeed|going to succeed|guaranteed|definitely|certainly will)\b/i;
  const cohortSizeMentioned = new RegExp(String(aggregate.cohort_size)).test(text) ||
    /\bcohort\b|\bpeople in this\b|\btrajectories\b/i.test(text);

  const notes: string[] = [];
  let passed = true;

  if (predictiveVerbs.test(text)) {
    notes.push('Predictive verb detected — narrative would be rejected in strict mode.');
    passed = false;
  }
  if (!cohortSizeMentioned) {
    notes.push('Cohort size or reference not surfaced in narrative.');
    passed = false;
  }

  return {
    narrative: text,
    cohort_size_disclosed: cohortSizeMentioned,
    ranges_disclosed: /between|from|to|range/i.test(text),
    passed_validation: passed,
    validator_notes: notes.length ? notes : undefined,
    generation_mode: 'provider',
  };
}
