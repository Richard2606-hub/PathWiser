import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveCohort, aggregate } from '@/lib/engine';
import { getAIProvider } from '@/lib/ai';
import type { UserShape } from '@/types';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';
import { deterministicCoachReply, validateCoachReply } from '@/lib/ai/coachValidation';
import { getEvidenceProvenance, resolveEvidenceMode } from '@/lib/evidence';

const ShapeSchema = z.object({
  userId: z.string().trim().min(1).max(160).default('anon'),
  persona: z.enum(['candidate', 'employer', 'university']).default('candidate'),
  role: z.string().trim().min(1).max(160).default('Software Engineer'),
  esco_code: z.string().trim().max(80).optional().nullable(),
  onet_code: z.string().trim().max(80).optional().nullable(),
  masco_code: z.string().trim().max(80).optional().nullable(),
  education: z.string().trim().max(240).default("Bachelor's Degree"),
  years_experience: z.number().min(0).max(60).default(3),
  state: z.string().trim().max(80).default('Kuala Lumpur'),
  skills: z.array(z.string().trim().max(120)).max(100).default(['Software Engineering']),
  life_stage: z.enum(['student', 'young_adult', 'early_career', 'mid_career', 'senior_career', 'executive']).default('early_career'),
  work_animal: z.string().optional().nullable(),
  dimensions: z.object({
    technical: z.number(),
    domain: z.number(),
    leadership: z.number(),
    analytics: z.number(),
    communication: z.number(),
  }).optional().nullable(),
}).passthrough();

const RequestSchema = z.object({
  shape: ShapeSchema,
  message: z.string().trim().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) })).max(20).optional(),
});

export async function POST(req: NextRequest) {
  const invalidOrigin = requireSameOrigin(req);
  if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(req, 'coach', 20);
  if (limited) return limited;
  try {
    const body = await req.json();
    const { shape, message, history } = RequestSchema.parse(body);

    // 1. Retrieval
    const evidenceMode = resolveEvidenceMode(shape.userId);
    const cohort = await retrieveCohort(shape as UserShape, { k: 1200, evidenceMode });
    
    // 2. Aggregation
    let aggContext;
    if (cohort.cohort_too_small) {
      aggContext = null;
    } else {
      try {
        aggContext = aggregate(cohort, 0);
      } catch {
        aggContext = null;
      }
    }

    // 3. System Prompt setup
    let systemPrompt = `You are a Career AI Coach advising a ${shape.role} (${shape.years_experience} years experience, ${shape.state}). You must answer questions specifically for a ${shape.role} using the retrieved cohort data.`;
    if (history && history.length > 0) {
      const historyStr = history.map(h => `${h.role}: ${h.content}`).join('\n');
      systemPrompt += `\n\nConversation history:\n${historyStr}`;
    }

    // 4. Chat completion
    let responseText: string;
    let validated = true;
    let fallbackReason: 'validation_failed' | 'provider_unavailable' | null = null;
    if (!aggContext) {
       responseText = `Only ${cohort.size} comparable trajectories were found for ${shape.role}, below the minimum cohort of 50. PathWiser cannot provide a responsible evidence-based answer for this question yet. Broaden the role, location, or skill constraints and try again.`;
    } else {
       try {
         responseText = process.env.GEMINI_API_KEY
           ? await getAIProvider().chatCompletion(systemPrompt, message, aggContext)
           : deterministicCoachReply(aggContext, shape.role);
         const validation = validateCoachReply(responseText, aggContext);
         if (!validation.passed) {
           console.warn('[PathWiser] Coach reply rejected:', validation.notes.join(' '));
           responseText = deterministicCoachReply(aggContext, shape.role);
           validated = false;
           fallbackReason = 'validation_failed';
         }
       } catch (providerError) {
         console.warn('[PathWiser] Coach provider unavailable; using deterministic evidence summary:', providerError instanceof Error ? providerError.message : providerError);
         responseText = deterministicCoachReply(aggContext, shape.role);
         validated = false;
         fallbackReason = 'provider_unavailable';
       }
    }

    return NextResponse.json({ reply: responseText, validated, fallback_reason: fallbackReason, cohort_size: cohort.size, evidence: getEvidenceProvenance(evidenceMode) });
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
