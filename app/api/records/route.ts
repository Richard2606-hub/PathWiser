import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';

const ModuleSchema = z.enum([
  'retention_signals',
  'onboarding_predictor',
  'outcome_loop',
  'curriculum_engine',
  'readiness_profile',
]);
const StatusSchema = z.enum(['draft', 'active', 'review_due', 'completed', 'archived']);
const RecordSchema = z.object({
  id: z.string().uuid().optional(),
  module: ModuleSchema,
  record_type: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(180),
  status: StatusSchema.default('active'),
  payload: z.record(z.unknown()).default({}),
  next_review_at: z.string().datetime().nullable().optional(),
});

async function userClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'records-read', 80);
  if (limited) return limited;
  try {
    const moduleFilter = ModuleSchema.optional().parse(request.nextUrl.searchParams.get('module') || undefined);
    const { supabase, user } = await userClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    let query = supabase
      .from('workspace_records')
      .select('id,module,record_type,title,status,payload,next_review_at,created_at,updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(100);
    if (moduleFilter) query = query.eq('module', moduleFilter);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ records: data || [], persistence: 'account' });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_query', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'records_unavailable', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(request, 'records-write', 30);
  if (limited) return limited;
  try {
    const body = RecordSchema.parse(await request.json());
    const { supabase, user } = await userClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const values = {
      user_id: user.id,
      module: body.module,
      record_type: body.record_type,
      title: body.title,
      status: body.status,
      payload: body.payload,
      next_review_at: body.next_review_at || null,
    };
    const query = body.id
      ? supabase.from('workspace_records').update(values).eq('id', body.id).eq('user_id', user.id)
      : supabase.from('workspace_records').insert(values);
    const { data, error } = await query
      .select('id,module,record_type,title,status,payload,next_review_at,created_at,updated_at')
      .single();
    if (error) throw error;
    const { error: auditError } = await supabase.from('audit_events').insert({
      actor_user_id: user.id,
      action: body.id ? 'workspace_record.updated' : 'workspace_record.created',
      resource_type: body.module,
      resource_id: String(data.id),
      metadata: { record_type: body.record_type, status: body.status },
    });
    return NextResponse.json({ record: data, persistence: 'account', audit_logged: !auditError }, { status: body.id ? 200 : 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_record', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'record_save_failed', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(request, 'records-delete', 20);
  if (limited) return limited;
  try {
    const id = z.string().uuid().parse(request.nextUrl.searchParams.get('id'));
    const { supabase, user } = await userClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const { error } = await supabase.from('workspace_records').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    const { error: auditError } = await supabase.from('audit_events').insert({
      actor_user_id: user.id,
      action: 'workspace_record.deleted',
      resource_type: 'workspace_record',
      resource_id: id,
    });
    return NextResponse.json({ deleted: true, audit_logged: !auditError });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_record_id' }, { status: 400 });
    return NextResponse.json({ error: 'record_delete_failed', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
