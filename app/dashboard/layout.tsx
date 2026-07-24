import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { LockedExplainer } from '@/components/layout/LockedExplainer';
import { PersonaRouteGuard } from '@/components/layout/PersonaRouteGuard';
import { CommunityBootstrap } from '@/components/layout/CommunityBootstrap';
import { ToastLayer } from '@/components/common/Toast';
import { cookies } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authRequired = process.env.AUTH_MODE === 'required';
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore
    .getAll()
    .some(({ name }) => name.startsWith('sb-') && name.includes('auth-token'));
  return (
    <div className="min-h-screen">
      <div className="pb-12">
        <Header />
        <div className="mx-auto grid max-w-[1600px] gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-7 lg:py-6">
          <div className="hidden lg:block sticky top-[88px] max-h-[calc(100vh-108px)] overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.05)]">
            <Sidebar />
          </div>
          <main className="min-w-0 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-base)] shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <CommunityBootstrap authRequired={authRequired} hasSessionCookie={hasSessionCookie}>
              <PersonaRouteGuard>{children}</PersonaRouteGuard>
            </CommunityBootstrap>
          </main>
        </div>
        <MobileDrawer />
        <LockedExplainer />
        <ToastLayer />
      </div>
    </div>
  );
}
