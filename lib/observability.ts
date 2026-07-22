interface EngineEvent {
  module: string;
  userId?: string;
  cohortSize?: number;
  similarityMean?: number;
  latencyMs: number;
  validationPassed?: boolean;
  outcome: 'success' | 'too_small' | 'error';
}

export async function recordEngineEvent(event: EngineEvent) {
  console.info(JSON.stringify({ event: 'engine_session', at: new Date().toISOString(), ...event }));

  const isUserUuid = Boolean(event.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.userId));
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !isUserUuid) return;
  try {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    await createServiceRoleClient().from('engine_sessions').insert({
      user_id: event.userId,
      module: event.module,
      cohort_size: event.cohortSize,
      similarity_mean: event.similarityMean,
      latency_ms: event.latencyMs,
      validation_passed: event.validationPassed,
    });
  } catch (error) {
    console.warn('[PathWiser] Unable to persist engine telemetry:', error instanceof Error ? error.message : error);
  }
}
