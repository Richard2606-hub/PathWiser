import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveCohort, aggregate } from '@/lib/engine';
import { getAIProvider } from '@/lib/ai';
import type { UserShape } from '@/types';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';
import { deterministicCoachReply, validateCoachReply } from '@/lib/ai/coachValidation';
import { getEvidenceProvenance } from '@/lib/evidence';

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
  dimensions: z.object({ technical: z.number().min(0).max(100), domain: z.number().min(0).max(100), leadership: z.number().min(0).max(100), analytics: z.number().min(0).max(100), communication: z.number().min(0).max(100) }).optional(),
});

const RequestSchema = z.object({
  shape: ShapeSchema,
  message: z.string().trim().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) })).max(20).optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'coach', 20);
  if (limited) return limited;
  const invalidOrigin = requireSameOrigin(req);
  if (invalidOrigin) return invalidOrigin;
  try {
    const body = await req.json();
    const { shape, message, history } = RequestSchema.parse(body);

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
    let responseText: string;
    let validated = true;
    let fallbackReason: 'validation_failed' | 'provider_unavailable' | null = null;
    if (!aggContext) {
       responseText = `Only ${cohort.size} comparable trajectories were found, below the minimum cohort of 50. PathWiser cannot provide a responsible evidence-based answer for this question yet. Broaden the role, location, or skill constraints and try again.`;
    } else {
       try {
         responseText = process.env.GEMINI_API_KEY
           ? await getAIProvider().chatCompletion(systemPrompt, message, aggContext)
           : deterministicCoachReply(aggContext);
         const validation = validateCoachReply(responseText, aggContext);
         if (!validation.passed) {
           console.warn('[PathWiser] Coach reply rejected:', validation.notes.join(' '));
           responseText = deterministicCoachReply(aggContext);
           validated = false;
           fallbackReason = 'validation_failed';
         }
       } catch (providerError) {
         console.warn('[PathWiser] Coach provider unavailable; using deterministic evidence summary:', providerError instanceof Error ? providerError.message : providerError);
         responseText = deterministicCoachReply(aggContext);
         validated = false;
         fallbackReason = 'provider_unavailable';
       }
    }

    return NextResponse.json({ reply: responseText, validated, fallback_reason: fallbackReason, cohort_size: cohort.size, evidence: getEvidenceProvenance() });
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
