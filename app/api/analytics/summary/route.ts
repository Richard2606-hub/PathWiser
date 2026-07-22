import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/security/rateLimit';

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'analytics', 30); if (limited) return limited;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!configured) return NextResponse.json({ available: false, reason: 'Community database is not configured.', calls: 0, p95_latency_ms: null, validation_pass_rate: null, modules: [] });
  try {
    const sessionClient = createClient(); const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    if (user.app_metadata?.platform_role !== 'admin') return NextResponse.json({ error: 'admin_required' }, { status: 403 });
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await createServiceRoleClient().from('engine_sessions').select('module,latency_ms,validation_passed,cohort_size,created_at').gte('created_at', since).limit(10000);
    if (error) throw error;
    const rows = data || []; const latencies = rows.map((row) => Number(row.latency_ms)).filter(Number.isFinite).sort((a,b) => a-b); const passed = rows.filter((row) => row.validation_passed === true).length; const measured = rows.filter((row) => row.validation_passed !== null).length;
    const counts = new Map<string, number>(); rows.forEach((row) => counts.set(row.module, (counts.get(row.module) || 0) + 1));
    return NextResponse.json({ available: true, calls: rows.length, p95_latency_ms: latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95))] : null, validation_pass_rate: measured ? passed / measured : null, modules: Array.from(counts, ([module, calls]) => ({ module, calls })) });
  } catch (error) { return NextResponse.json({ error: 'analytics_unavailable', message: error instanceof Error ? error.message : String(error) }, { status: 503 }); }
}
