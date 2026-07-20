import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveCohort, aggregate, explain } from '@/lib/engine';
import { MIN_COHORT_SIZE } from '@/lib/engine/aggregate';
import type { UserShape } from '@/types';

const ShapeSchema = z.object({
  userId: z.string().default('anon'),
  persona: z.enum(['candidate', 'employer', 'university']),
  role: z.string(),
  esco_code: z.string().optional(),
  onet_code: z.string().optional(),
  masco_code: z.string().optional(),
  education: z.string(),
  years_experience: z.number().min(0).max(60),
  state: z.string(),
  skills: z.array(z.string()),
  life_stage: z.enum(['student', 'young_adult', 'early_career', 'mid_career', 'senior_career', 'executive']),
  work_animal: z.enum(['owl', 'fox', 'bear', 'dolphin', 'eagle', 'ant']).optional(),
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
      return NextResponse.json(
        {
          cohort_too_small: true,
          cohort_size: cohort.size,
          k_min: cohort.cohort_too_small.k_min,
          message: cohort.cohort_too_small.reason,
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
    return NextResponse.json({
      cohort: {
        size: cohort.size,
        similarity_stats: cohort.similarity_stats,
        filters_applied: cohort.filters_applied,
      },
      aggregate: agg,
      explanation,
      k_min: MIN_COHORT_SIZE,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', issues: err.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'internal_error', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
