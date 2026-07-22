import { NextResponse, type NextRequest } from 'next/server';
import { refreshSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await refreshSession(request);
  const authRequired = process.env.AUTH_MODE === 'required';
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuth = request.nextUrl.pathname.startsWith('/auth');

  if (authRequired && configured && isDashboard && !user) {
    const destination = request.nextUrl.clone();
    destination.pathname = '/auth';
    destination.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(destination);
  }
  if (user && supabase && isDashboard) {
    const requestedPersona = request.nextUrl.pathname.match(/^\/dashboard\/(candidate|employer|university)(?:\/|$)/)?.[1];
    if (requestedPersona) {
      const { data: profile } = await supabase.from('user_shapes').select('persona').eq('user_id', user.id).maybeSingle();
      const platformRole = user.app_metadata?.platform_role;
      const canReviewAll = platformRole === 'admin' || platformRole === 'judge';
      if (profile?.persona && profile.persona !== requestedPersona && !canReviewAll) {
        const landing = profile.persona === 'employer' ? '/dashboard/employer/talent-matching' : profile.persona === 'university' ? '/dashboard/university/outcome-loop' : '/dashboard/candidate/path-navigator';
        return NextResponse.redirect(new URL(landing, request.url));
      }
    }
  }
  if (user && isAuth) return NextResponse.redirect(new URL('/dashboard', request.url));
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] };
