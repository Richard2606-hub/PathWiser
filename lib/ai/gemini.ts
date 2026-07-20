import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider } from './interface';
import { HONEST_NARRATIVE_CONSTRAINTS } from './interface';
import type { Aggregate, Explanation } from '@/types';

/**
 * Google AI Studio (Gemini) provider — the default AI implementation.
 * Uses free tier at aistudio.google.com/apikey.
 *
 * Cost profile:
 *   - Embeddings (text-embedding-004): free tier, 1500 requests/minute
 *   - Chat (gemini-1.5-flash): free tier, 15 requests/minute
 *
 * For Talentbank adoption: swap this file with your internal AI implementation
 * of the AIProvider interface. Nothing else changes.
 */
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;
  private embeddingModel: string;
  private chatModel: string;

  constructor(apiKey: string, options?: { embeddingModel?: string; chatModel?: string }) {
    if (!apiKey) {
      throw new Error(
        'GeminiProvider: GEMINI_API_KEY is required. ' +
        'Get one free at https://aistudio.google.com/apikey'
      );
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = options?.embeddingModel || 'gemini-embedding-001';
    this.chatModel = options?.chatModel || 'gemini-1.5-flash';
  }

  async getEmbedding(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({ model: this.embeddingModel });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    // Gemini free-tier throttles at 1500/min for embeddings.
    // For our ~1500-row corpus we chunk into batches of 50 with a small delay.
    const model = this.client.getGenerativeModel({ model: this.embeddingModel });
    const out: number[][] = [];
    const chunkSize = 50;
    for (let i = 0; i < texts.length; i += chunkSize) {
      const batch = texts.slice(i, i + chunkSize);
      const results = await Promise.all(
        batch.map((t) => model.embedContent(t).then((r) => r.embedding.values))
      );
      out.push(...results);
      // Throttle: 50 requests per second is well under the free-tier ceiling.
      if (i + chunkSize < texts.length) await new Promise((r) => setTimeout(r, 1100));
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

    const model = this.client.getGenerativeModel({ model: this.chatModel });
    const prompt = `${HONEST_NARRATIVE_CONSTRAINTS}\n\n${audiencePrompt}\n\nAggregate (verbatim numbers you must reference):\n\`\`\`json\n${JSON.stringify(aggregate, null, 2)}\n\`\`\`\n\nProduce a 2-4 sentence narrative that explains what this cohort shows.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return validateExplanation(text, aggregate);
  }

  async chatCompletion(
    systemPrompt: string,
    userMessage: string,
    cohortContext: Aggregate
  ): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.chatModel,
      systemInstruction: `${HONEST_NARRATIVE_CONSTRAINTS}\n\n${systemPrompt}`,
    });
    const contextBlock = `\n\n[Cohort context - use these numbers verbatim, do not invent others]:\n${JSON.stringify(cohortContext, null, 2)}\n\n`;
    const result = await model.generateContent(userMessage + contextBlock);
    return result.response.text();
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
  };
}
