import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveCohort, aggregate, explain } from '@/lib/engine';
import { MIN_COHORT_SIZE } from '@/lib/engine/aggregate';
import type { UserShape } from '@/types';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';
import { recordEngineEvent } from '@/lib/observability';
import { getEvidenceProvenance } from '@/lib/evidence';

const ShapeSchema = z.object({
  userId: z.string().trim().min(1).max(160).default('anon'),
  persona: z.enum(['candidate', 'employer', 'university']),
  role: z.string().trim().min(1).max(160),
  esco_code: z.string().trim().max(40).optional(),
  onet_code: z.string().trim().max(40).optional(),
  masco_code: z.string().trim().max(40).optional(),
  education: z.string().trim().max(240),
  years_experience: z.number().min(0).max(60),
  state: z.string().trim().max(80),
  skills: z.array(z.string().trim().min(1).max(80)).max(50),
  life_stage: z.enum(['student', 'young_adult', 'early_career', 'mid_career', 'senior_career', 'executive']),
  work_animal: z.enum(['owl', 'fox', 'bear', 'dolphin', 'eagle', 'ant']).optional(),
  dimensions: z.object({
    technical: z.number().min(0).max(100),
    domain: z.number().min(0).max(100),
    leadership: z.number().min(0).max(100),
    analytics: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
  }).optional(),
});

const RequestSchema = z.object({
  shape: ShapeSchema,
  currentStepIndex: z.number().min(-1).max(6).default(0),
  filterByLifeStage: z.boolean().optional(),

  filterByState: z.boolean().optional(),
  filterBySector: z.string().optional(),
  k: z.number().min(50).max(2000).optional(),
});

/**
 * POST /api/engine/navigate
 *
 * The single engine endpoint. Given a shape, returns cohort + aggregate + narrative.
 * All 9 audience modules ultimately call this — the Career Signal Loop architectural
 * claim made real.
 */
export async function POST(req: NextRequest) {
  const invalidOrigin = requireSameOrigin(req);
  if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(req, 'navigate', 40);
  if (limited) return limited;
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const { shape, currentStepIndex, filterByLifeStage, filterByState, filterBySector, k } =
      RequestSchema.parse(body);

    // 1. Retrieval
    const cohort = await retrieveCohort(shape as UserShape, {
      k,
      filterByLifeStage,
      filterByState,
      filterBySector,
    });

    if (cohort.cohort_too_small) {
      void recordEngineEvent({ module: 'navigate', userId: shape.userId, cohortSize: cohort.size, latencyMs: Date.now() - startedAt, outcome: 'too_small' });
      return NextResponse.json(
        {
          cohort_too_small: true,
          cohort_size: cohort.size,
          k_min: cohort.cohort_too_small.k_min,
          message: cohort.cohort_too_small.reason,
          evidence: getEvidenceProvenance(),
        },
        { status: 200 }
      );
    }

    // 2. Aggregation
    let agg;
    try {
      agg = aggregate(cohort, currentStepIndex);
    } catch (e) {
      return NextResponse.json(
        { error: 'aggregation_failed', message: e instanceof Error ? e.message : String(e) },
        { status: 500 }
      );
    }

    // 3. Explanation
    const explanation = await explain(agg, {
      audience: shape.persona,
      useTemplateOnly: false,
    });

    // 4. Response
    void recordEngineEvent({ module: 'navigate', userId: shape.userId, cohortSize: cohort.size, similarityMean: cohort.similarity_stats.mean, latencyMs: Date.now() - startedAt, validationPassed: explanation.passed_validation, outcome: 'success' });
    return NextResponse.json({
      cohort: {
        size: cohort.size,
        similarity_stats: cohort.similarity_stats,
        filters_applied: cohort.filters_applied,
      },
      aggregate: agg,
      explanation,
      k_min: MIN_COHORT_SIZE,
      evidence: getEvidenceProvenance(),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', issues: err.issues }, { status: 400 });
    }
    void recordEngineEvent({ module: 'navigate', latencyMs: Date.now() - startedAt, outcome: 'error' });
    return NextResponse.json(
      { error: 'internal_error', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
