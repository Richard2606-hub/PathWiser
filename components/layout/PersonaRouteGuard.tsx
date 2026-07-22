'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import type { Persona } from '@/types';

const LANDING: Record<Persona, string> = {
  candidate: '/dashboard/candidate/path-navigator',
  employer: '/dashboard/employer/talent-matching',
  university: '/dashboard/university/outcome-loop',
};

function routePersona(pathname: string): Persona | null {
  const match = pathname.match(/^\/dashboard\/(candidate|employer|university)(?:\/|$)/);
  return (match?.[1] as Persona | undefined) ?? null;
}

/** Keeps production-mode navigation inside the selected audience experience. */
export function PersonaRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const persona = useAppStore((state) => state.persona);
  const judgeMode = useAppStore((state) => state.judgeMode);
  const [hydrated, setHydrated] = useState(false);
  const requestedPersona = routePersona(pathname);
  const judgeEnabled = process.env.NEXT_PUBLIC_ENABLE_JUDGE_MODE === 'true';
  const mismatch = Boolean(requestedPersona && requestedPersona !== persona && !(judgeEnabled && judgeMode));

  useEffect(() => {
    setHydrated(useAppStore.persist.hasHydrated());
    return useAppStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && mismatch) router.replace(LANDING[persona]);
  }, [hydrated, mismatch, persona, router]);

  if (!hydrated || mismatch) {
    return (
      <div className="min-h-[45vh] grid place-items-center p-8" role="status" aria-live="polite">
        <p className="font-mono text-xs text-[color:var(--text-2)]">Loading your workspace…</p>
      </div>
    );
  }

  return children;
}
