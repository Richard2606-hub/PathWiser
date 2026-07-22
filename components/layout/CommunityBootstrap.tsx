'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { LifeStage, Persona, ShapeDimensions } from '@/types';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';

interface StoredProfile {
  persona: Persona; role_title: string; education: string; years_experience: number; state: string; skills: string[]; life_stage: LifeStage;
  esco_code?: string; onet_code?: string; masco_code?: string; work_animal?: 'owl'|'fox'|'bear'|'dolphin'|'eagle'|'ant'; dimensions?: ShapeDimensions; display_name?: string;
}

export function CommunityBootstrap({ children }: { children: React.ReactNode }) {
  const setPersona = useAppStore((state) => state.setPersona);
  const setShape = useAppStore((state) => state.setShape);
  const setIdentity = useAppStore((state) => state.setIdentity);
  const setJudgeMode = useAppStore((state) => state.setJudgeMode);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (process.env.NEXT_PUBLIC_ENABLE_JUDGE_MODE !== 'true') setJudgeMode(false);
        const response = await fetch('/api/profile', { cache: 'no-store' });
        if (!response.ok) return;
        const { profile } = await response.json() as { profile: StoredProfile };
        if (!active || !profile) return;
        setPersona(profile.persona);
        setIdentity({ name: profile.display_name || 'Community member', role: profile.role_title });
        setShape({ userId: 'account', persona: profile.persona, role: profile.role_title, education: profile.education || '', years_experience: profile.years_experience || 0, state: profile.state || 'Kuala Lumpur', skills: profile.skills || [], life_stage: profile.life_stage, esco_code: profile.esco_code, onet_code: profile.onet_code, masco_code: profile.masco_code, work_animal: profile.work_animal, dimensions: profile.dimensions });
      } finally {
        if (active && !useAppStore.getState().shape) {
          const selectedPersona = useAppStore.getState().persona;
          const demo = selectedPersona === 'employer' ? DEMO_PERSONAS.boldrise : selectedPersona === 'university' ? DEMO_PERSONAS.utm : DEMO_PERSONAS.aisyah;
          setShape(demo.shape);
          setIdentity(demo.identity);
        }
        if (active) setReady(true);
      }
    }
    void load(); return () => { active = false; };
  }, [setIdentity, setJudgeMode, setPersona, setShape]);

  if (!ready) return <div className="min-h-[45vh] grid place-items-center p-8" role="status"><p className="font-mono text-xs text-[color:var(--text-2)]">Loading your secure workspace…</p></div>;
  return children;
}
