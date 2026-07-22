import { NextResponse } from 'next/server';
import { getEvidenceProvenance } from '@/lib/evidence';
import { hasGeminiConfig, hasSupabaseConfig } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authRequired = process.env.AUTH_MODE === 'required';
  const supabase = hasSupabaseConfig();
  const ai = hasGeminiConfig();
  const fullModeRequested = process.env.ALLOW_FULL_MODE === 'true';
  const ready = (!authRequired || supabase) && (!fullModeRequested || (supabase && ai));
  return NextResponse.json({
    status: ready ? 'ok' : 'degraded',
    checked_at: new Date().toISOString(),
    services: { application: true, supabase, ai_provider: ai, full_mode_requested: fullModeRequested },
    authentication: authRequired ? 'required' : 'optional',
    evidence: getEvidenceProvenance(),
  }, { status: ready ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
