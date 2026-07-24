'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { LifeStage, Persona, ShapeDimensions } from '@/types';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';

interface StoredProfile {
  persona: Persona;
  role_title: string;
  education: string;
  years_experience: number;
  state: string;
  skills: string[];
  life_stage: LifeStage;
  esco_code?: string;
  onet_code?: string;
  masco_code?: string;
  work_animal?: 'owl' | 'fox' | 'bear' | 'dolphin' | 'eagle' | 'ant';
  dimensions?: ShapeDimensions;
  display_name?: string;
}

interface CommunityBootstrapProps {
  children: React.ReactNode;
  authRequired: boolean;
  hasSessionCookie: boolean;
}

const PROFILE_TIMEOUT_MS = 5_000;

export function CommunityBootstrap({ children, authRequired, hasSessionCookie }: CommunityBootstrapProps) {
  const setPersona = useAppStore((state) => state.setPersona);
  const setShape = useAppStore((state) => state.setShape);
  const setIdentity = useAppStore((state) => state.setIdentity);
  const setJudgeMode = useAppStore((state) => state.setJudgeMode);
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    let timeout = 0;

    async function load() {
      let profileLoaded = false;
      let loadFailure: string | null = null;
      try {
        setReady(false);
        setFailure(null);
        if (process.env.NEXT_PUBLIC_ENABLE_JUDGE_MODE !== 'true') setJudgeMode(false);
        if (!hasSessionCookie) {
          if (authRequired) loadFailure = 'A verified account session is required to open this workspace.';
          return;
        }
        const response = await Promise.race([
          fetch('/api/profile', { cache: 'no-store', signal: controller.signal }),
          new Promise<never>((_, reject) => {
            timeout = window.setTimeout(() => {
              controller.abort();
              reject(new DOMException('Profile request timed out', 'AbortError'));
            }, PROFILE_TIMEOUT_MS);
          }),
        ]);
        if (response.ok) {
          const { profile } = await response.json() as { profile: StoredProfile };
          if (active && profile) {
            setPersona(profile.persona);
            setIdentity({ name: profile.display_name || 'Community member', role: profile.role_title });
            setShape({
              userId: 'account',
              persona: profile.persona,
              role: profile.role_title,
              education: profile.education || '',
              years_experience: profile.years_experience || 0,
              state: profile.state || 'Kuala Lumpur',
              skills: profile.skills || [],
              life_stage: profile.life_stage,
              esco_code: profile.esco_code,
              onet_code: profile.onet_code,
              masco_code: profile.masco_code,
              work_animal: profile.work_animal,
              dimensions: profile.dimensions,
            });
            profileLoaded = true;
          }
        } else if (authRequired) {
          loadFailure = response.status === 401
            ? 'Your session has expired. Sign in again to open your workspace.'
            : 'Your account profile is temporarily unavailable. Your workspace data has not been replaced with preview data.';
        }
      } catch (error) {
        if (authRequired) {
          loadFailure = error instanceof DOMException && error.name === 'AbortError'
            ? 'The account service took too long to respond. Try again when your connection is stable.'
            : 'The account service could not be reached. Try again in a moment.';
        }
      } finally {
        window.clearTimeout(timeout);
        if (!active) return;

        if (!profileLoaded && !authRequired && !useAppStore.getState().shape) {
          const selectedPersona = useAppStore.getState().persona;
          const demo = selectedPersona === 'employer'
            ? DEMO_PERSONAS.boldrise
            : selectedPersona === 'university'
              ? DEMO_PERSONAS.utm
              : DEMO_PERSONAS.aisyah;
          setShape(demo.shape);
          setIdentity(demo.identity);
        }

        setFailure(loadFailure);
        setReady(profileLoaded || !authRequired);
      }
    }

    void load();
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt, authRequired, hasSessionCookie, setIdentity, setJudgeMode, setPersona, setShape]);

  if (failure && authRequired) {
    return (
      <section className="grid min-h-[45vh] place-items-center p-6 text-center" role="alert" aria-live="assertive">
        <div className="max-w-md rounded-xl border border-amber-300/60 bg-amber-50 p-5">
          <h1 className="text-lg font-extrabold text-slate-900">We could not open your workspace</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{failure}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="min-h-11 rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Try again
            </button>
            <a
              href="/auth"
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Sign in again
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (!ready) {
    return (
      <div className="grid min-h-[45vh] place-items-center p-8" role="status" aria-live="polite">
        <p className="font-mono text-xs text-[color:var(--text-2)]">Loading your secure workspace…</p>
      </div>
    );
  }

  return children;
}
