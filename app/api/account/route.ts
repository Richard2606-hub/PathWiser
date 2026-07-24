import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';

const DeleteAccountSchema = z.object({
  confirmation: z.literal('DELETE MY PATHWISER ACCOUNT'),
});

const PROFILE_FIELDS = [
  'user_id',
  'persona',
  'role_title',
  'education',
  'years_experience',
  'state',
  'skills',
  'life_stage',
  'esco_code',
  'onet_code',
  'masco_code',
  'work_animal',
  'dimensions',
  'display_name',
  'profile_summary',
  'discoverable',
  'created_at',
  'updated_at',
].join(',');

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Portable account export. Every table query is still constrained by RLS, and
 * embedding vectors are deliberately excluded because they are internal
 * retrieval artefacts rather than useful user-facing data.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'account-export', 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });

    const [
      profile,
      consents,
      records,
      savedItems,
      feedback,
      engineSessions,
      auditEvents,
      memberships,
    ] = await Promise.all([
      supabase.from('user_shapes').select(PROFILE_FIELDS).eq('user_id', user.id).maybeSingle(),
      supabase.from('consent_records').select('consent_type,grantee_organisation_id,granted_at,revoked_at').eq('user_id', user.id),
      supabase.from('workspace_records').select('id,module,record_type,title,status,payload,next_review_at,created_at,updated_at').eq('user_id', user.id),
      supabase.from('saved_marketplace_items').select('id,item_kind,item_key,snapshot,created_at').eq('user_id', user.id),
      supabase.from('feedback_sessions').select('id,module,accuracy_rating,freshness_rating,reflection,private_note,source_path,output_reference,curation_status,created_at').eq('user_id', user.id),
      supabase.from('engine_sessions').select('id,module,cohort_size,similarity_mean,latency_ms,validation_passed,created_at').eq('user_id', user.id),
      supabase.from('audit_events').select('id,action,resource_type,resource_id,metadata,created_at').eq('actor_user_id', user.id),
      supabase.from('organisation_members').select('organisation_id,member_role,created_at').eq('user_id', user.id),
    ]);

    const failed = [profile, consents, records, savedItems, feedback, engineSessions, auditEvents, memberships]
      .find((result) => result.error);
    if (failed?.error) throw failed.error;

    const exportDocument = {
      schema_version: '1.0',
      generated_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile: profile.data,
      consents: consents.data || [],
      workspace_records: records.data || [],
      saved_marketplace_items: savedItems.data || [],
      feedback: feedback.data || [],
      engine_sessions: engineSessions.data || [],
      audit_events: auditEvents.data || [],
      organisation_memberships: memberships.data || [],
    };

    return NextResponse.json(exportDocument, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'Content-Disposition': `attachment; filename="pathwiser-account-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'account_export_failed', message: error instanceof Error ? error.message : String(error) },
      { status: 503 }
    );
  }
}

/**
 * Irreversible self-service erasure. The database function deletes the current
 * auth identity; foreign-key cascades remove account-owned records, while
 * audit rows retain only a de-identified event after actor_user_id becomes null.
 */
export async function DELETE(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(request, 'account-delete', 3, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    DeleteAccountSchema.parse(await request.json());
    const { supabase, user } = await authenticatedClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });

    await supabase.from('audit_events').insert({
      actor_user_id: user.id,
      action: 'account.deleted_by_user',
      resource_type: 'account',
      resource_id: user.id,
      metadata: { requested_at: new Date().toISOString() },
    });

    const { error } = await supabase.rpc('delete_my_account');
    if (error) throw error;

    return NextResponse.json(
      { deleted: true, message: 'Your PathWiser account and account-owned data were deleted.' },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'confirmation_required', message: 'Type the exact deletion confirmation phrase.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'account_deletion_failed', message: error instanceof Error ? error.message : String(error) },
      { status: 503 }
    );
  }
}
