import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';

const ConsentSchema = z.object({ type: z.enum(['trajectory_contribution','employer_discovery','programme_outcomes','research']), enabled: z.boolean() });

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'consent-read', 60); if (limited) return limited;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const { data, error } = await supabase.from('consent_records').select('consent_type,granted_at,revoked_at').eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ consents: data || [] });
  } catch (error) {
    return NextResponse.json({ error: 'consent_unavailable', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const limited = rateLimit(request, 'consent-write', 20); if (limited) return limited;
  const invalidOrigin = requireSameOrigin(request); if (invalidOrigin) return invalidOrigin;
  try {
    const body = ConsentSchema.parse(await request.json());
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const now = new Date().toISOString();
    const { error } = await supabase.from('consent_records').upsert({ user_id: user.id, consent_type: body.type, grantee_organisation_id: null, granted_at: now, revoked_at: body.enabled ? null : now }, { onConflict: 'user_id,consent_type,grantee_organisation_id' });
    if (error) throw error;
    if (body.type === 'employer_discovery') {
      const { error: profileError } = await supabase.from('user_shapes').update({ discoverable: body.enabled, updated_at: now }).eq('user_id', user.id);
      if (profileError) throw profileError;
    }
    return NextResponse.json({ saved: true, enabled: body.enabled });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_consent', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'consent_save_failed', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
