/**
 * AI provider factory.
 *
 * Returns the provider selected by AI_PROVIDER env var. Default: gemini.
 * To swap in Talentbank's internal AI: add a case here, and set
 * AI_PROVIDER=talentbank-internal in production env.
 */

import type { AIProvider } from './interface';
import { GeminiProvider } from './gemini';

let _cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_cached) return _cached;

  const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  switch (providerName) {
    case 'gemini':
      _cached = new GeminiProvider(
        process.env.GEMINI_API_KEY || '',
        {
          embeddingModel: process.env.GEMINI_EMBEDDING_MODEL,
          chatModel: process.env.GEMINI_CHAT_MODEL,
        }
      );
      return _cached;

    // Adoption hook — Talentbank engineers add their internal AI here.
    // case 'talentbank-internal':
    //   _cached = new TalentbankInternalProvider(process.env.TALENTBANK_AI_KEY);
    //   return _cached;

    default:
      throw new Error(
        `Unknown AI_PROVIDER "${providerName}". ` +
        `Supported: gemini. Add a new case to lib/ai/index.ts to extend.`
      );
  }
}

// Re-exports for convenience
export type { AIProvider } from './interface';
export { HONEST_NARRATIVE_CONSTRAINTS } from './interface';
