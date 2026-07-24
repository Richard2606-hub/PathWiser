import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';

const SaveSchema = z.object({
  item_kind: z.enum(['job', 'company']),
  item_key: z.string().trim().min(1).max(160),
  saved: z.boolean(),
  snapshot: z.record(z.unknown()).default({}),
});

async function userClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'marketplace-saved-read', 80);
  if (limited) return limited;
  try {
    const { supabase, user } = await userClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    const { data, error } = await supabase
      .from('saved_marketplace_items')
      .select('item_kind,item_key,created_at')
      .eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ items: data || [], persistence: 'account' });
  } catch (error) {
    return NextResponse.json({ error: 'saved_items_unavailable', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const invalidOrigin = requireSameOrigin(request);
  if (invalidOrigin) return invalidOrigin;
  const limited = rateLimit(request, 'marketplace-saved-write', 40);
  if (limited) return limited;
  try {
    const body = SaveSchema.parse(await request.json());
    const { supabase, user } = await userClient();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    if (body.saved) {
      const { error } = await supabase.from('saved_marketplace_items').upsert({
        user_id: user.id,
        item_kind: body.item_kind,
        item_key: body.item_key,
        snapshot: body.snapshot,
      }, { onConflict: 'user_id,item_kind,item_key' });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('saved_marketplace_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_kind', body.item_kind)
        .eq('item_key', body.item_key);
      if (error) throw error;
    }
    const { error: auditError } = await supabase.from('audit_events').insert({
      actor_user_id: user.id,
      action: body.saved ? 'marketplace_item.saved' : 'marketplace_item.removed',
      resource_type: body.item_kind,
      resource_id: body.item_key,
    });
    return NextResponse.json({ saved: body.saved, persistence: 'account', audit_logged: !auditError });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_saved_item', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'saved_item_update_failed', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
