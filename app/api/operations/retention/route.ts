import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

function authorised(request: NextRequest) {
  const configured = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!configured || !supplied) return false;
  const expected = Buffer.from(configured);
  const candidate = Buffer.from(supplied);
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

/**
 * Hosting schedulers call this endpoint with `Authorization: Bearer CRON_SECRET`.
 * Cleanup runs transactionally in the database and records its own run summary.
 */
export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'retention_not_configured', message: 'CRON_SECRET is required before scheduling retention cleanup.' },
      { status: 503 }
    );
  }
  if (!authorised(request)) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.rpc('purge_expired_operational_data');
    if (error) throw error;
    return NextResponse.json(
      { completed: true, result: Array.isArray(data) ? data[0] : data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'retention_cleanup_failed', message: error instanceof Error ? error.message : String(error) },
      { status: 503 }
    );
  }
}
