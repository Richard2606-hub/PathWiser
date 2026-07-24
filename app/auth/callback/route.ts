import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const requestedNext = request.nextUrl.searchParams.get('next');
  const next = requestedNext === '/auth/update-password' || requestedNext?.startsWith('/dashboard')
    ? requestedNext
    : '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=missing_confirmation_code', request.url));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(new URL('/auth?error=confirmation_failed', request.url));
  }
}
