import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '@/lib/ai';
import { shapeToText } from '@/lib/engine/retrieve';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';
import type { UserShape } from '@/types';
import { applyNormalization } from '@/lib/profile/normalize';

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
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user, error };
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'profile-read', 60);
  if (limited) return limited;
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const { data, error } = await supabase
      .from('user_shapes')
      .select('user_id,persona,role_title,education,years_experience,state,skills,life_stage,esco_code,onet_code,masco_code,work_animal,dimensions,display_name,profile_summary,shape_vector,updated_at')
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    const { shape_vector: shapeVector, ...safeProfile } = data;
    return NextResponse.json({ profile: { ...safeProfile, embedding_saved: Boolean(shapeVector) } });
  } catch (error) {
    return NextResponse.json({ error: 'profile_unavailable', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(request, 'profile-write', 20);
  if (limited) return limited;
  try {
    const body = ShapeSchema.parse(await request.json());
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const { data: current } = await supabase.from('user_shapes').select('persona').eq('user_id', user.id).maybeSingle();
    if (current?.persona && current.persona !== body.persona) {
      return NextResponse.json({ error: 'persona_immutable', message: 'Account audience roles are changed by support, not through profile input.' }, { status: 403 });
    }
    const shape = applyNormalization({ userId: user.id, ...body } as UserShape);
    let embedding: number[] | undefined;
    if (process.env.GEMINI_API_KEY) {
      try { embedding = await getAIProvider().getEmbedding(shapeToText(shape)); } catch { /* profile remains usable without an embedding */ }
    }
    const { error } = await supabase.from('user_shapes').upsert({
      user_id: user.id, persona: shape.persona, role_title: shape.role, education: shape.education,
      years_experience: shape.years_experience, state: shape.state, skills: shape.skills, life_stage: shape.life_stage,
      esco_code: shape.esco_code, onet_code: shape.onet_code, masco_code: shape.masco_code, work_animal: shape.work_animal,
      dimensions: body.dimensions, display_name: body.display_name, profile_summary: body.profile_summary,
      ...(embedding ? { shape_vector: embedding } : {}), updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    const { data: savedProfile } = await supabase
      .from('user_shapes')
      .select('shape_vector,updated_at')
      .eq('user_id', user.id)
      .single();
    const { error: auditError } = await supabase.from('audit_events').insert({
      actor_user_id: user.id,
      action: current ? 'profile.updated' : 'profile.created',
      resource_type: 'user_shape',
      resource_id: user.id,
      metadata: { persona: shape.persona, embedding_refreshed: Boolean(embedding) },
    });
    return NextResponse.json({
      saved: true,
      embedding_saved: Boolean(savedProfile?.shape_vector),
      embedding_refreshed: Boolean(embedding),
      updated_at: savedProfile?.updated_at || new Date().toISOString(),
      audit_logged: !auditError,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_profile', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'profile_save_failed', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
