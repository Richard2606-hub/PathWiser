/**
 * Trajectory retrieval — pgvector HNSW cosine similarity search over the corpus.
 *
 * TWO MODES automatically selected at runtime:
 *   • Full mode  — Supabase configured → real pgvector query, real embeddings
 *   • Demo mode  — no Supabase → in-memory corpus, feature-vector similarity
 *
 * Both modes surface the same Cohort type. Callers never need to know which
 * mode ran — the aggregation + explanation layers work identically over either.
 *
 * Talentbank integration note: this is a thin wrapper around vector similarity.
 * If Talentbank's production platform uses a different vector store, replace
 * ONLY this file. Everything else in the engine is store-agnostic.
 */

import { getAIProvider } from '@/lib/ai';
import type { UserShape, Cohort, Trajectory } from '@/types';
import { getCorpus, shapeToFeatureVector } from '@/lib/corpus';
import { OCCUPATIONS, findOccupation } from '@/lib/corpus/occupations';
import { cosineSimilarity, hasSupabaseConfig, hasGeminiConfig } from '@/lib/utils';
import { resolveEvidenceMode, type EvidenceMode } from '@/lib/evidence';

const DEFAULT_K = 1200;
const K_MIN = 50;

export class EvidenceServiceUnavailableError extends Error {
  readonly code = 'evidence_service_unavailable';

  constructor(message = 'The trajectory evidence service is temporarily unavailable.') {
    super(message);
    this.name = 'EvidenceServiceUnavailableError';
  }
}

export interface RetrieveOptions {
  k?: number;
  filterByState?: boolean;
  filterBySector?: string;
  filterByLifeStage?: boolean;
  evidenceMode?: EvidenceMode;
}

export async function retrieveCohort(
  shape: UserShape,
  opts: RetrieveOptions = {}
): Promise<Cohort> {
  const canUseFullMode =
    resolveEvidenceMode(shape.userId, opts.evidenceMode) === 'community' &&
    hasSupabaseConfig() &&
    hasGeminiConfig() &&
    process.env.ALLOW_FULL_MODE === 'true';

  // Local development defaults to the disclosed synthetic corpus even when a
  // developer has production credentials in .env.local. This keeps the demo
  // fast, deterministic, and usable offline; full-mode testing is explicit.
  if (canUseFullMode) {
    try {
      return await retrieveFullMode(shape, opts);
    } catch (err) {
      // A developer's local credentials may be unavailable, expired, or blocked by
      // their network. Keep the hackathon demo usable in that case, but never hide a
      // production data-source failure behind synthetic evidence.
      if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEMO_FALLBACK === 'true') {
        console.warn(
          '[PathWiser] Full retrieval unavailable; using the disclosed demo corpus:',
          err instanceof Error ? err.message : err
        );
        return retrieveDemoMode(shape, opts);
      }
      throw err;
    }
  }
  return retrieveDemoMode(shape, opts);
}

// ─── DEMO MODE · in-memory corpus + feature-vector cosine ────
async function retrieveDemoMode(shape: UserShape, opts: RetrieveOptions): Promise<Cohort> {
  const k = opts.k || DEFAULT_K;
  const corpus = getCorpus();

  // Infer sector from role + skills when no explicit filter is provided.
  // A "Junior Data Analyst" should retrieve Tech trajectories, not Energy ones.
  const impliedSector = opts.filterBySector || inferSectorFromShape(shape);

  const queryVector = shapeToFeatureVector({
    sector: impliedSector,
    state: shape.state,
    life_stage: shape.life_stage,
    skills: shape.skills,
    years_experience: shape.years_experience,
    dimensions: shape.dimensions,
  });

  // 1. Filter by audience-appropriate constraints
  const filtered = corpus.filter((t) => {
    if (opts.filterByLifeStage && t.life_stage !== shape.life_stage) return false;
    if (opts.filterByState && t.state !== shape.state) return false;
    if (opts.filterBySector && t.sector !== opts.filterBySector) return false;
    // Soft-filter to implied sector when no explicit filter — prevents cross-sector noise
    if (!opts.filterBySector && impliedSector && t.sector !== impliedSector) return false;
    return true;
  });

  // 2. Score by cosine similarity
  const scored = filtered
    .map((t) => ({ trajectory: t, similarity: cosineSimilarity(queryVector, t.featureVector) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);

  // 3. Cohort-too-small guard
  if (scored.length < K_MIN) {
    return {
      size: scored.length,
      trajectories: [],
      similarity_stats: { mean: 0, stddev: 0, min: 0, max: 0 },
      filters_applied: {
        life_stage: opts.filterByLifeStage ? shape.life_stage : undefined,
        state: opts.filterByState ? shape.state : undefined,
        sector: opts.filterBySector,
      },
      cohort_too_small: {
        reason: `Only ${scored.length} similar trajectories with these filters. Minimum for honest aggregation is ${K_MIN}. Try widening the filters or acknowledge that the evidence is thin.`,
        k_min: K_MIN,
      },
    };
  }

  const sims = scored.map((s) => s.similarity);
  const mean = sims.reduce((a, b) => a + b, 0) / sims.length;
  const variance = sims.reduce((s, x) => s + (x - mean) ** 2, 0) / sims.length;

  const trajectories: Trajectory[] = scored.map(({ trajectory }) => ({
    id: trajectory.id,
    persona: trajectory.persona,
    life_stage: trajectory.life_stage,
    state: trajectory.state,
    sector: trajectory.sector,
    path: trajectory.path,
    esco_codes: trajectory.esco_codes,
    synthetic: trajectory.synthetic,
    calibration_source: trajectory.calibration_source,
  }));

  return {
    size: trajectories.length,
    trajectories,
    similarity_stats: {
      mean,
      stddev: Math.sqrt(variance),
      min: Math.min(...sims),
      max: Math.max(...sims),
    },
    filters_applied: {
      life_stage: opts.filterByLifeStage ? shape.life_stage : undefined,
      state: opts.filterByState ? shape.state : undefined,
      sector: opts.filterBySector,
    },
  };
}

// ─── FULL MODE · Supabase + pgvector + real embeddings ────
async function retrieveFullMode(shape: UserShape, opts: RetrieveOptions): Promise<Cohort> {
  const k = opts.k || DEFAULT_K;

  const { createServiceRoleClient } = await import('@/lib/supabase/server');
  const supabase = createServiceRoleClient();
  const { count: corpusSize, error: countError } = await supabase
    .from('trajectories')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    console.warn('[PathWiser] Trajectory corpus check failed:', countError.message);
    throw new EvidenceServiceUnavailableError();
  }

  // Do not call an external embedding provider when the entire governed corpus
  // is below the disclosure threshold: no filtered query could be publishable.
  if ((corpusSize ?? 0) < K_MIN) {
    return {
      size: corpusSize ?? 0,
      trajectories: [],
      similarity_stats: { mean: 0, stddev: 0, min: 0, max: 0 },
      filters_applied: {
        life_stage: opts.filterByLifeStage ? shape.life_stage : undefined,
        state: opts.filterByState ? shape.state : undefined,
        sector: opts.filterBySector,
      },
      cohort_too_small: {
        reason: `Only ${corpusSize ?? 0} governed trajectories are available. Minimum for honest aggregation is ${K_MIN}.`,
        k_min: K_MIN,
      },
    };
  }

  const ai = getAIProvider();
  const shapeText = shapeToText(shape);
  const embedding = await ai.getEmbedding(shapeText);
  const { data, error } = await supabase.rpc('match_trajectories', {
    query_embedding: embedding,
    match_count: k,
    filter_life_stage: opts.filterByLifeStage ? shape.life_stage : null,
    filter_state: opts.filterByState ? shape.state : null,
    filter_sector: opts.filterBySector || null,
  });

  if (error) {
    console.warn('[PathWiser] Trajectory retrieval failed:', error.message);
    throw new EvidenceServiceUnavailableError();
  }

  const trajectories = (data || []) as Array<Trajectory & { similarity: number }>;

  if (trajectories.length < K_MIN) {
    return {
      size: trajectories.length,
      trajectories: [],
      similarity_stats: { mean: 0, stddev: 0, min: 0, max: 0 },
      filters_applied: {
        life_stage: opts.filterByLifeStage ? shape.life_stage : undefined,
        state: opts.filterByState ? shape.state : undefined,
        sector: opts.filterBySector,
      },
      cohort_too_small: {
        reason: `Only ${trajectories.length} similar trajectories.`,
        k_min: K_MIN,
      },
    };
  }

  const sims = trajectories.map((t) => t.similarity);
  const mean = sims.reduce((a, b) => a + b, 0) / sims.length;
  const variance = sims.reduce((s, x) => s + (x - mean) ** 2, 0) / sims.length;

  return {
    size: trajectories.length,
    trajectories,
    similarity_stats: {
      mean,
      stddev: Math.sqrt(variance),
      min: Math.min(...sims),
      max: Math.max(...sims),
    },
    filters_applied: {
      life_stage: opts.filterByLifeStage ? shape.life_stage : undefined,
      state: opts.filterByState ? shape.state : undefined,
      sector: opts.filterBySector,
    },
  };
}

/**
 * Infer the most likely sector from a user's shape (role + skills).
 * Used to soft-filter the demo corpus so retrieval feels contextually right.
 *
 * First we look the role up in the occupation taxonomy — an exact or fuzzy match
 * gives the authoritative sector for any of the 440 roles (so a nurse retrieves
 * Healthcare, an electrician Skilled Trades, etc.). Only when the role is
 * genuinely unknown do we fall back to keyword heuristics, then Tech.
 */
function inferSectorFromShape(shape: UserShape): string {
  const role = shape.role.trim();
  const taxonomySector = findOccupation(role)?.sector || fuzzyOccupationSector(role);
  if (taxonomySector) return taxonomySector;

  const skills = shape.skills.map((s) => s.toLowerCase()).join(' ');
  const combined = `${role.toLowerCase()} ${skills}`;

  if (/(reservoir|geolog|petrol|energy|upstream|downstream)/i.test(combined)) return 'Energy';
  if (/(analyst|invest|banking|financ|derivative|risk|actuar)/i.test(role) &&
      !/data|business|product|marketing/i.test(role)) return 'Finance';
  if (/(consultant|advis|strategic|management consult)/i.test(role)) return 'Consulting';
  if (/(marketing|brand|growth marketer|copywrit|seo|content)/i.test(combined)) return 'Marketing';
  // Default: Tech (data, software, ML, product, design analytics land here)
  return 'Tech';
}

/** Best-effort taxonomy match when the role isn't an exact occupation title. */
function fuzzyOccupationSector(role: string): string | undefined {
  const query = role.toLowerCase();
  if (query.length < 3) return undefined;
  const hit = OCCUPATIONS.find((occ) => {
    const name = occ.role.toLowerCase();
    return name.includes(query) || query.includes(name);
  });
  return hit?.sector;
}

/**
 * Convert a structured shape into the text representation we embed.
 * Keep this stable across corpus generation and query time.
 */
export function shapeToText(shape: UserShape): string {
  return [
    `Persona: ${shape.persona}`,
    `Life stage: ${shape.life_stage}`,
    `Current role: ${shape.role}`,
    `Education: ${shape.education}`,
    `Years of experience: ${shape.years_experience}`,
    `Location: ${shape.state}, Malaysia`,
    `Skills: ${shape.skills.join(', ')}`,
    shape.work_animal ? `Work Animal: ${shape.work_animal}` : '',
    shape.esco_code ? `ESCO: ${shape.esco_code}` : '',
    shape.masco_code ? `MASCO: ${shape.masco_code}` : '',
    shape.dimensions ? `Capability emphasis: technical ${shape.dimensions.technical}, domain ${shape.dimensions.domain}, leadership ${shape.dimensions.leadership}, analytics ${shape.dimensions.analytics}, communication ${shape.dimensions.communication}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
