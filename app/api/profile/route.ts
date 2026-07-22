import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '@/lib/ai';
import { shapeToText } from '@/lib/engine/retrieve';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';
import type { UserShape } from '@/types';

const ShapeSchema = z.object({
  persona: z.enum(['candidate', 'employer', 'university']), role: z.string().trim().min(1).max(160),
  education: z.string().max(240), years_experience: z.number().int().min(0).max(60), state: z.string().max(80),
  skills: z.array(z.string().trim().min(1).max(80)).max(50), life_stage: z.enum(['student','young_adult','early_career','mid_career','senior_career','executive']),
  esco_code: z.string().optional(), onet_code: z.string().optional(), masco_code: z.string().optional(),
  work_animal: z.enum(['owl','fox','bear','dolphin','eagle','ant']).optional(),
  dimensions: z.object({ technical: z.number().min(0).max(100), domain: z.number().min(0).max(100), leadership: z.number().min(0).max(100), analytics: z.number().min(0).max(100), communication: z.number().min(0).max(100) }).optional(),
  display_name: z.string().trim().min(1).max(120).optional(), profile_summary: z.string().max(800).optional(),
});

async function authenticatedClient() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user, error };
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'profile-read', 60);
  if (limited) return limited;
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const { data, error } = await supabase.from('user_shapes').select('*').eq('user_id', user.id).single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json({ error: 'profile_unavailable', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const limited = rateLimit(request, 'profile-write', 20);
  if (limited) return limited;
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  try {
    const body = ShapeSchema.parse(await request.json());
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const { data: current } = await supabase.from('user_shapes').select('persona').eq('user_id', user.id).maybeSingle();
    if (current?.persona && current.persona !== body.persona) {
      return NextResponse.json({ error: 'persona_immutable', message: 'Account audience roles are changed by support, not through profile input.' }, { status: 403 });
    }
    const shape: UserShape = { userId: user.id, ...body };
    let embedding: number[] | undefined;
    if (process.env.GEMINI_API_KEY) {
      try { embedding = await getAIProvider().getEmbedding(shapeToText(shape)); } catch { /* profile remains usable without an embedding */ }
    }
    const { error } = await supabase.from('user_shapes').upsert({
      user_id: user.id, persona: body.persona, role_title: body.role, education: body.education,
      years_experience: body.years_experience, state: body.state, skills: body.skills, life_stage: body.life_stage,
      esco_code: body.esco_code, onet_code: body.onet_code, masco_code: body.masco_code, work_animal: body.work_animal,
      dimensions: body.dimensions, display_name: body.display_name, profile_summary: body.profile_summary,
      ...(embedding ? { shape_vector: embedding } : {}), updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_profile', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'profile_save_failed', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
