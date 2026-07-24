'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import type { Persona } from '@/types';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { ToastLayer } from '@/components/common/Toast';
import { LockedExplainer } from '@/components/layout/LockedExplainer';
import { Button } from '@/components/common/Button';
import { ProductStory } from '@/components/hero/ProductStory';

const AUDIENCES = {
  candidate: { icon: '👤', title: 'Candidate', heading: 'Find a direction that fits you', text: 'Explore realistic career paths, salary ranges and skill bridges from people with similar trajectories.', action: 'Explore candidate view', preview: 'aisyah' as const, color: 'var(--yellow)' },
  employer: { icon: '🏢', title: 'Employer', heading: 'Hire for potential, not just keywords', text: 'Discover direct and adjacent talent with explainable evidence, consent controls and practical onboarding support.', action: 'Explore employer view', preview: 'boldrise' as const, color: 'var(--teal)' },
  university: { icon: '🎓', title: 'University', heading: 'See where learning leads', text: 'Connect graduate outcomes to curriculum decisions and readiness evidence across meaningful time horizons.', action: 'Explore university view', preview: 'utm' as const, color: 'var(--violet)' },
};

export function HeroSection() {
  const router = useRouter();
  const openOnboarding = useAppStore((state) => state.openOnboarding);
  const setIdentity = useAppStore((state) => state.setIdentity);
  const setShape = useAppStore((state) => state.setShape);
  const setPersona = useAppStore((state) => state.setPersona);
  const showToast = useAppStore((state) => state.showToast);
  const [audience, setAudience] = useState<Persona>('candidate');

  const quickLaunch = (key: 'aisyah' | 'boldrise' | 'utm') => {
    const demo = DEMO_PERSONAS[key];
    const persona = demo.persona as Persona;
    setIdentity(demo.identity); setShape(demo.shape); setPersona(persona);
    const landing = persona === 'candidate' ? '/dashboard/candidate/path-navigator' : persona === 'employer' ? '/dashboard/employer/talent-matching' : '/dashboard/university/outcome-loop';
    showToast(`Loaded modelled preview · ${demo.identity.name}`, 'success');
    router.push(landing);
  };

  const selected = AUDIENCES[audience];

  return (
    <main className="min-h-screen text-[color:var(--text-1)]">
      <nav className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-white/90 backdrop-blur-xl" aria-label="Primary navigation">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-7">
          <Link href="/" className="flex items-center gap-2.5" aria-label="PathWiser home"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--yellow)] text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.22)]">PW</span><span className="text-lg font-extrabold tracking-tight">Path<span className="text-[color:var(--yellow)]">Wiser</span></span></Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-[color:var(--text-2)] md:flex"><a href="#for-who" className="hover:text-[color:var(--text-1)]">Who it helps</a><a href="#how-it-works" className="hover:text-[color:var(--text-1)]">How it works</a><Link href="/dashboard/architecture" className="hover:text-[color:var(--text-1)]">Our approach</Link></div>
          <div className="flex items-center gap-2"><Link href="/auth" className="hidden px-3 py-2 text-sm font-semibold text-[color:var(--text-2)] hover:text-[color:var(--text-1)] sm:block">Sign in</Link><Button size="sm" onClick={openOnboarding}>Get started</Button></div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-7 sm:pb-24 sm:pt-20">
        <div aria-hidden="true" className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.12),transparent_68%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--text-2)] shadow-sm"><span className="h-2 w-2 rounded-full bg-[color:var(--emerald)]" />Evidence-based career decisions</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[64px]">Make your next career move with <span className="text-[color:var(--yellow)]">evidence</span>, not guesswork.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--text-2)] sm:text-lg">PathWiser turns privacy-protected career trajectories into realistic options for candidates, employers and universities—without pretending to predict anyone’s future.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button size="lg" onClick={openOnboarding}>Build your career profile <span aria-hidden="true">→</span></Button><Button size="lg" variant="outline" onClick={() => quickLaunch('aisyah')}>See an example</Button></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[color:var(--text-2)]"><span>✓ Cohort-based evidence</span><span>✓ Revocable consent</span><span>✓ No individual prediction score</span></div>
          </div>

          <div className="rounded-[24px] border border-[color:var(--border)] bg-white p-4 shadow-[0_24px_70px_rgba(30,41,59,0.14)] sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--text-3)]">Choose your workspace</p><h2 className="mt-1 text-xl font-extrabold">What would you like to do?</h2></div><span className="rounded-full bg-[color:var(--bg-elevated)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--text-2)]">Interactive preview</span></div>
            <div className="mt-5 grid grid-cols-3 gap-2" role="tablist" aria-label="Choose an audience">
              {(Object.keys(AUDIENCES) as Persona[]).map((key) => <button key={key} type="button" role="tab" aria-selected={audience === key} onClick={() => setAudience(key)} className={`rounded-xl border px-2 py-3 text-center transition ${audience === key ? 'border-[color:var(--yellow)] bg-[color:var(--accent-glow)] shadow-sm' : 'border-[color:var(--border)] hover:bg-[color:var(--bg-elevated)]'}`}><span className="block text-xl">{AUDIENCES[key].icon}</span><span className="mt-1 block text-xs font-bold">{AUDIENCES[key].title}</span></button>)}
            </div>
            <div className="mt-4 min-h-[245px] rounded-2xl bg-[color:var(--bg-elevated)] p-5" role="tabpanel">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl shadow-sm">{selected.icon}</span>
              <h3 className="mt-4 text-xl font-extrabold">{selected.heading}</h3><p className="mt-2 text-sm leading-6 text-[color:var(--text-2)]">{selected.text}</p>
              <button type="button" onClick={() => quickLaunch(selected.preview)} className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: selected.color }}>{selected.action}<span aria-hidden="true">→</span></button>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[color:var(--border)] px-4 py-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(5,150,105,0.1)] text-[color:var(--emerald)]">✓</span><div><p className="text-xs font-bold">Evidence is always labelled</p><p className="text-[11px] text-[color:var(--text-2)]">See the cohort, source and limitations behind every result.</p></div></div>
          </div>
        </div>
      </section>

      <section id="for-who" className="border-y border-[color:var(--border)] bg-white px-5 py-16 sm:px-7 sm:py-20"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-bold text-[color:var(--yellow)]">One platform, three perspectives</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">A clearer next step for everyone shaping a career.</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{(Object.keys(AUDIENCES) as Persona[]).map((key) => { const item = AUDIENCES[key]; return <button key={key} type="button" onClick={() => quickLaunch(item.preview)} className="group rounded-2xl border border-[color:var(--border)] bg-white p-6 text-left shadow-[0_5px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)]"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--bg-elevated)] text-2xl">{item.icon}</span><h3 className="mt-5 text-lg font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[color:var(--text-2)]">{item.text}</p><span className="mt-5 inline-flex text-sm font-bold text-[color:var(--yellow)]">Open workspace <span className="ml-2 transition group-hover:translate-x-1">→</span></span></button>; })}</div></div></section>

      <ProductStory />

      <section id="how-it-works" className="px-5 py-16 sm:px-7 sm:py-24"><div className="mx-auto max-w-7xl"><div className="text-center"><p className="text-sm font-bold text-[color:var(--yellow)]">How PathWiser works</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Complex evidence, made understandable.</h2></div><div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">{[['1','Tell us where you are','Build a profile from your role, skills, experience and the direction you want to explore.'],['2','Compare similar journeys','PathWiser retrieves a privacy-safe cohort and calculates ranges, common destinations and skill bridges.'],['3','Decide with context','Explore trade-offs, ask evidence-grounded questions and save reflections—without a black-box prediction.']].map(([number,title,text]) => <article key={number} className="rounded-2xl bg-white p-6 shadow-[0_6px_26px_rgba(15,23,42,0.05)]"><span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--accent-glow)] text-sm font-extrabold text-[color:var(--yellow)]">{number}</span><h3 className="mt-5 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-[color:var(--text-2)]">{text}</p></article>)}</div></div></section>

      <footer className="border-t border-[color:var(--border)] bg-white px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-[color:var(--text-2)] sm:flex-row"><span className="font-bold text-[color:var(--text-1)]">PathWiser</span><span>Career evidence for better decisions—not individual predictions.</span></div></footer>
      <OnboardingShell /><LockedExplainer /><ToastLayer />
    </main>
  );
}
