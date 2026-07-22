'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

const LANDING = { candidate: '/dashboard/candidate/path-navigator', employer: '/dashboard/employer/talent-matching', university: '/dashboard/university/outcome-loop' } as const;

export default function DashboardIndex() {
  const router = useRouter(); const persona = useAppStore((state) => state.persona);
  useEffect(() => { router.replace(LANDING[persona]); }, [persona, router]);
  return <div className="min-h-[45vh] grid place-items-center" role="status"><p className="font-mono text-xs text-[color:var(--text-2)]">Opening your workspace…</p></div>;
}
