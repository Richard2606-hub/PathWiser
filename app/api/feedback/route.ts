import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, requireSameOrigin } from '@/lib/security/rateLimit';

const FeedbackSchema = z.object({ module: z.string().trim().min(1).max(80), accuracy_rating: z.number().int().min(1).max(5), freshness_rating: z.number().int().min(1).max(5), reflection: z.string().trim().max(2000), private_note: z.string().max(4000).optional() });

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'feedback-read', 60); if (limited) return limited;
  try {
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ feedback: [], persistence: 'local' });
    const { data, error } = await supabase.from('feedback_sessions').select('id,module,accuracy_rating,freshness_rating,reflection,private_note,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json({ feedback: data || [], persistence: 'account' });
  } catch (error) {
    return NextResponse.json({ error: 'feedback_unavailable', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'feedback-write', 15); if (limited) return limited;
  const invalidOrigin = requireSameOrigin(request); if (invalidOrigin) return invalidOrigin;
  try {
    const body = FeedbackSchema.parse(await request.json());
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ saved: false, persistence: 'local', message: 'Sign in to sync feedback across devices.' });
    const { data, error } = await supabase.from('feedback_sessions').insert({ ...body, user_id: user.id }).select('id,module,accuracy_rating,freshness_rating,reflection,private_note,created_at').single();
    if (error) throw error;
    return NextResponse.json({ saved: true, persistence: 'account', feedback: data });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'invalid_feedback', issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'feedback_save_failed', message: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
