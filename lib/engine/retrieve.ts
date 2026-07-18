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
import { cosineSimilarity, hasSupabaseConfig, hasGeminiConfig } from '@/lib/utils';

const DEFAULT_K = 1200;
const K_MIN = 50;

export interface RetrieveOptions {
  k?: number;
  filterByState?: boolean;
  filterBySector?: string;
  filterByLifeStage?: boolean;
}

export async function retrieveCohort(
  shape: UserShape,
  opts: RetrieveOptions = {}
): Promise<Cohort> {
  if (hasSupabaseConfig() && hasGeminiConfig()) {
    return retrieveFullMode(shape, opts);
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

  const trajectories: Trajectory[] = scored.map(({ trajectory, similarity: _sim }) => ({
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

  const ai = getAIProvider();
  const shapeText = shapeToText(shape);
  const embedding = await ai.getEmbedding(shapeText);

  const { createServiceRoleClient } = await import('@/lib/supabase/server');
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc('match_trajectories', {
    query_embedding: embedding,
    match_count: k,
    filter_life_stage: opts.filterByLifeStage ? shape.life_stage : null,
    filter_state: opts.filterByState ? shape.state : null,
    filter_sector: opts.filterBySector || null,
  });

  if (error) {
    throw new Error(`Trajectory retrieval failed: ${error.message}`);
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
 */
function inferSectorFromShape(shape: UserShape): string {
  const role = shape.role.toLowerCase();
  const skills = shape.skills.map((s) => s.toLowerCase()).join(' ');
  const combined = `${role} ${skills}`;

  if (/(reservoir|geolog|petrol|energy|upstream|downstream)/i.test(combined)) return 'Energy';
  if (/(analyst|invest|banking|financ|derivative|risk|actuar)/i.test(role) &&
      !/data|business|product|marketing/i.test(role)) return 'Finance';
  if (/(consultant|advis|strategic|management consult)/i.test(role)) return 'Consulting';
  if (/(marketing|brand|growth marketer|copywrit|seo|content)/i.test(combined)) return 'Marketing';
  // Default: Tech (data, software, ML, product, design analytics land here)
  return 'Tech';
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
  ]
    .filter(Boolean)
    .join('\n');
}
