import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveCohort, aggregate } from '@/lib/engine';
import { getAIProvider } from '@/lib/ai';
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
  message: z.string(),
  history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shape, message, history } = RequestSchema.parse(body);

    const ai = getAIProvider();

    // 1. Retrieval
    const cohort = await retrieveCohort(shape as UserShape, { k: 1200 });
    
    // 2. Aggregation
    let aggContext;
    if (cohort.cohort_too_small) {
      aggContext = null;
    } else {
      try {
        aggContext = aggregate(cohort, 0);
      } catch (e) {
        aggContext = null;
      }
    }

    // 3. System Prompt setup
    let systemPrompt = `You are a Career AI Coach. You must guide the user based on the trajectory data provided in the context.`;
    if (history && history.length > 0) {
      const historyStr = history.map(h => `${h.role}: ${h.content}`).join('\n');
      systemPrompt += `\n\nConversation history:\n${historyStr}`;
    }

    // 4. Chat completion
    let responseText;
    if (!aggContext) {
       // if too small, generate without aggregate but warn
       responseText = await ai.chatCompletion(
         systemPrompt + "\n\nNote: Cohort is too small to provide exact statistical data. Guide them generally but state that there isn't enough trajectory evidence.",
         message,
         { cohort_size: cohort.size, next_role_distribution: [], salary_percentiles_by_role: {}, median_time_in_role_months: 0, common_skill_bridges: [], trade_offs: [], calibration_anchors: [] }
       );
    } else {
       responseText = await ai.chatCompletion(systemPrompt, message, aggContext);
    }

    return NextResponse.json({ reply: responseText });
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
