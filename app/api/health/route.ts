import { NextResponse } from 'next/server';
import { getEvidenceProvenance } from '@/lib/evidence';
import { createClient } from '@/lib/supabase/server';
import { hasGeminiConfig, hasSupabaseConfig } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authRequired = process.env.AUTH_MODE === 'required';
  const supabaseConfigured = hasSupabaseConfig();
  const ai = hasGeminiConfig();
  const fullModeRequested = process.env.ALLOW_FULL_MODE === 'true';
  let supabaseReachable = false;
  let supabaseMessage = supabaseConfigured ? 'Configured but not yet checked' : 'Not configured';
  if (supabaseConfigured) {
    try {
      const supabase = await createClient();
      const probe = supabase.from('trajectories').select('id', { count: 'exact', head: true });
      const { error } = await Promise.race([
        probe,
        new Promise<{ error: Error }>((resolve) => setTimeout(() => resolve({ error: new Error('health_probe_timeout') }), 1500)),
      ]);
      supabaseReachable = !error;
      supabaseMessage = error?.message === 'health_probe_timeout'
        ? 'Configured, but the trajectory access check timed out'
        : error
          ? 'Configured, but trajectory access failed'
          : 'Connected and trajectory access succeeded';
    } catch {
      supabaseMessage = 'Configured, but the service could not be reached';
    }
  }
  const ready = (!authRequired || supabaseReachable) && (!fullModeRequested || (supabaseReachable && ai));
  return NextResponse.json({
    status: ready ? 'ok' : 'degraded',
    checked_at: new Date().toISOString(),
    services: {
      application: true,
      supabase_configured: supabaseConfigured,
      supabase_reachable: supabaseReachable,
      supabase_message: supabaseMessage,
      ai_provider_configured: ai,
      full_mode_requested: fullModeRequested,
    },
    authentication: authRequired ? 'required' : 'optional',
    evidence: getEvidenceProvenance(),
  }, { status: ready ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
}
