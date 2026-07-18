'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import type { Persona } from '@/types';
import { HeroCanvas } from './HeroCanvas';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { ToastLayer } from '@/components/common/Toast';
import { LockedExplainer } from '@/components/layout/LockedExplainer';
import { Button } from '@/components/common/Button';

export function HeroSection() {
  const router = useRouter();
  const openOnboarding = useAppStore((s) => s.openOnboarding);
  const setIdentity = useAppStore((s) => s.setIdentity);
  const setShape = useAppStore((s) => s.setShape);
  const setPersona = useAppStore((s) => s.setPersona);
  const showToast = useAppStore((s) => s.showToast);

  const quickLaunch = (key: 'aisyah' | 'boldrise' | 'utm') => {
    const demo = DEMO_PERSONAS[key];
    const persona = demo.persona as Persona;
    setIdentity(demo.identity);
    setShape(demo.shape);
    setPersona(persona);
    const landing =
      persona === 'candidate' ? '/dashboard/candidate/path-navigator' :
      persona === 'employer' ? '/dashboard/employer/talent-matching' :
      '/dashboard/university/outcome-loop';
    showToast(`Loaded demo persona · ${demo.identity.name}`, 'success');
    router.push(landing);
  };

  return (
    <main className="relative min-h-screen">
      {/* Grid + vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, transparent 0%, var(--bg-base) 75%)',
        }}
      />

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 py-10">
        <HeroCanvas />

        <div className="relative max-w-[820px] flex flex-col items-center gap-4 sm:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-3xl sm:text-[42px] font-extrabold text-[color:var(--yellow)] drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              [
            </span>
            <span className="text-3xl sm:text-[46px] font-extrabold tracking-tight">
              Path<span className="text-[color:var(--yellow)]">Wiser</span>
            </span>
            <span className="font-mono text-3xl sm:text-[42px] font-extrabold text-[color:var(--yellow)] drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              ]
            </span>
          </div>

          <p className="uppercase tracking-[0.2em] text-xs sm:text-sm text-[color:var(--text-2)]">
            Navigate your career, wiser.
          </p>

          <p className="text-[13px] sm:text-[15px] leading-relaxed text-[color:var(--text-2)] max-w-[720px]">
            An evidence-based <strong className="text-[color:var(--text-1)]">Career OS</strong> that uses the{' '}
            <strong className="text-[color:var(--text-1)]">Career Twin Engine</strong> to match your trajectory shape against{' '}
            <strong className="text-[color:var(--text-1)]">real anonymised paths</strong> — surfacing realistic ranges of outcomes,
            not false predictions. Built for <strong className="text-[color:var(--text-1)]">candidates, employers, and universities</strong> across Asia.
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-1">
            {[
              '🔬 DOSM Calibrated',
              '🧠 Career Twin Engine',
              '🔁 Career Signal Loop',
              '📊 16-Module Ecosystem',
              '🛡️ Honest AI — No Prediction',
            ].map((b) => (
              <span
                key={b}
                className="px-2.5 py-1 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider rounded-full bg-[color:var(--bg-elevated)] border border-[color:var(--border)]"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-5 mt-2">
            <SignalNode letter="C" label="Candidate" flow="Navigate Paths" color="var(--yellow)" />
            <span className="hidden sm:inline font-mono text-base text-[color:var(--text-3)]">⟶</span>
            <span className="sm:hidden font-mono text-base text-[color:var(--text-3)]">↓</span>
            <SignalNode letter="E" label="Employer" flow="Demand Signals" color="var(--teal)" />
            <span className="hidden sm:inline font-mono text-base text-[color:var(--text-3)]">⟶</span>
            <span className="sm:hidden font-mono text-base text-[color:var(--text-3)]">↓</span>
            <SignalNode letter="U" label="University" flow="Outcome Loop" color="var(--violet)" />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={openOnboarding}
            className="mt-3"
          >
            Enter the Dashboard →
          </Button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-1">
            <span className="text-[11px] text-[color:var(--text-3)] italic">
              — or jump straight in as —
            </span>
            <div className="flex flex-col sm:flex-row gap-1.5">
              <QuickPersonaBtn icon="👤" label="Aisyah · Junior Data Analyst" onClick={() => quickLaunch('aisyah')} />
              <QuickPersonaBtn icon="🏢" label="BoldRise Sdn Bhd · Hiring Lead" onClick={() => quickLaunch('boldrise')} />
              <QuickPersonaBtn icon="🎓" label="UTM · Programme Director" onClick={() => quickLaunch('utm')} />
            </div>
          </div>
        </div>

        <p className="mt-8 font-mono text-[10px] tracking-widest text-[color:var(--text-3)] uppercase">
          Scroll to explore ↓
        </p>
      </section>

      <OnboardingShell />
      <LockedExplainer />
      <ToastLayer />
    </main>
  );
}

function SignalNode({
  letter, label, flow, color,
}: {
  letter: string; label: string; flow: string; color: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 py-2.5 px-3.5 min-w-[110px] rounded-md backdrop-blur border transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-extrabold text-xs border"
        style={{ background: `${color}20`, color, borderColor: color }}
      >
        {letter}
      </div>
      <span className="text-[11px] font-bold">{label}</span>
      <span className="text-[8px] font-mono uppercase tracking-widest text-[color:var(--text-3)]">
        {flow}
      </span>
    </div>
  );
}

function QuickPersonaBtn({
  icon, label, onClick,
}: {
  icon: string; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border)] hover:border-[color:var(--accent)] hover:-translate-y-0.5 transition-all"
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}
