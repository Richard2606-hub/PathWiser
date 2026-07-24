'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MODULES } from '@/lib/corpus/modules';

const STAGES = [
  { age: '15–18', label: 'Discover', text: 'Explore strengths, work preferences, programmes, and possible first directions.' },
  { age: '18–24', label: 'Prepare', text: 'Connect learning evidence, internships, projects, and entry routes to real outcomes.' },
  { age: '25–34', label: 'Build', text: 'Compare next moves, skill bridges, fair-pay ranges, and adjacent opportunities.' },
  { age: '35–49', label: 'Adapt', text: 'Test leadership, specialist, portfolio, and sector-switch trade-offs.' },
  { age: '50–65+', label: 'Renew', text: 'Plan reinvention, mentoring, flexible work, contribution, and later-life transitions.' },
];

const AUDIENCE_MODULES = [
  { key: 'candidate', label: 'Candidate', headline: 'Navigate a whole career', modules: ['path_navigator', 'ai_coach', 'fair_pay'], signal: 'Shares consented outcomes and reflections', color: 'var(--yellow)' },
  { key: 'employer', label: 'Employer', headline: 'Build healthier talent systems', modules: ['talent_matching', 'retention_signals', 'onboarding_predictor'], signal: 'Publishes skills demand and workplace outcomes', color: 'var(--teal)' },
  { key: 'university', label: 'University', headline: 'Turn outcomes into better learning', modules: ['outcome_loop', 'curriculum_engine', 'readiness_profile'], signal: 'Connects learning evidence to long-term outcomes', color: 'var(--violet)' },
];

const PIPELINE = [
  ['Shape', 'Role, skills, education, geography, experience, life stage, and consent.'],
  ['Retrieve', 'Find a privacy-safe cohort of similar trajectories; stop when the cohort is too small.'],
  ['Aggregate', 'Calculate distributions, ranges, bridges, and trade-offs deterministically.'],
  ['Explain', 'Turn structured evidence into plain language without inventing numbers.'],
  ['Validate', 'Reject predictive or unsupported language before delivery.'],
  ['Learn', 'Route contextual feedback to a human-reviewed curation queue.'],
];

export function ProductStory() {
  const [stageIndex, setStageIndex] = useState(2);
  const [audienceIndex, setAudienceIndex] = useState(0);
  const activeAudience = AUDIENCE_MODULES[audienceIndex];

  return (
    <>
      <section className="border-y border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-5 py-5 sm:px-7">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-[color:var(--text-2)]" aria-label="Evidence and design principles">
          <span>DOSM-calibrated evidence</span><span>ESCO + O*NET taxonomy</span><span>Career Twin</span><span>Career Signal Loop</span><span>Honest AI validation</span><span>SDG 4 · 5 · 8 · 9 · 10</span>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-7 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold text-[color:var(--yellow)]">CareerOS · age 15 to 65+</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">A career is a changing journey, not one prediction.</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--text-2)]">PathWiser stays useful as goals, responsibilities, labour demand, and learning evidence change. Select a life stage to see how the platform’s job changes with you.</p>
            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-sm" aria-live="polite">
              <p className="text-xs font-bold text-[color:var(--yellow)]">Age {STAGES[stageIndex].age}</p>
              <h3 className="mt-1 text-xl font-extrabold">{STAGES[stageIndex].label}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-2)]">{STAGES[stageIndex].text}</p>
            </div>
          </div>
          <div>
            <div className="relative grid grid-cols-5 gap-2 before:absolute before:left-[8%] before:right-[8%] before:top-5 before:h-0.5 before:bg-[color:var(--border-strong)]">
              {STAGES.map((stage, index) => (
                <button key={stage.age} type="button" onClick={() => setStageIndex(index)} aria-pressed={stageIndex === index} className="relative flex flex-col items-center text-center">
                  <span className={`z-10 grid h-10 w-10 place-items-center rounded-full border-2 bg-white text-xs font-extrabold transition ${stageIndex === index ? 'border-[color:var(--yellow)] text-[color:var(--yellow)] shadow-md' : 'border-[color:var(--border-strong)] text-[color:var(--text-3)]'}`}>{index + 1}</span>
                  <span className="mt-3 text-[10px] font-bold sm:text-xs">{stage.age}</span>
                  <span className="mt-1 hidden text-[10px] text-[color:var(--text-3)] sm:block">{stage.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-[color:var(--text-3)]">Your Career Twin can be updated at every transition; earlier choices do not lock your future.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--border)] bg-white px-5 py-16 sm:px-7 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-[color:var(--teal)]">The Career Signal Loop</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Nine working modules, one shared evidence engine.</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--text-2)]">Candidate choices, employer demand, and university outcomes become more useful when they connect—with consent, privacy gates, and visible limitations.</p>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="flex gap-2 overflow-x-auto lg:flex-col" role="tablist" aria-label="Career Signal Loop audience">
              {AUDIENCE_MODULES.map((audience, index) => (
                <button key={audience.key} type="button" role="tab" aria-selected={audienceIndex === index} onClick={() => setAudienceIndex(index)} className={`min-w-[190px] rounded-xl border p-4 text-left transition lg:min-w-0 ${audienceIndex === index ? 'bg-[color:var(--bg-elevated)] shadow-sm' : 'bg-white hover:bg-[color:var(--bg-elevated)]'}`} style={{ borderColor: audienceIndex === index ? audience.color : 'var(--border)' }}>
                  <span className="text-xs font-bold" style={{ color: audience.color }}>{audience.label}</span>
                  <span className="mt-1 block text-sm font-extrabold">{audience.headline}</span>
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-5 sm:p-7" role="tabpanel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-bold" style={{ color: activeAudience.color }}>{activeAudience.label} workspace</p><h3 className="mt-1 text-xl font-extrabold">{activeAudience.headline}</h3></div>
                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-[color:var(--text-2)] shadow-sm">{activeAudience.signal}</span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {activeAudience.modules.map((moduleKey, index) => {
                  const moduleDefinition = MODULES[moduleKey];
                  return (
                    <Link key={moduleDefinition.key} href={moduleDefinition.href} className="group rounded-xl border border-[color:var(--border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: activeAudience.color }}>{['Navigation', 'Intelligence', 'Valuation'][index]}</span>
                      <h4 className="mt-2 font-extrabold">{moduleDefinition.title}</h4>
                      <p className="mt-2 text-xs leading-5 text-[color:var(--text-2)]">{moduleDefinition.purpose}</p>
                      <span className="mt-4 inline-flex text-xs font-bold text-[color:var(--yellow)]">Open module →</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-[color:var(--border-strong)] bg-white p-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--accent-glow)] text-xs font-extrabold text-[color:var(--yellow)]">CT</span>
                <div><p className="text-sm font-bold">Shared Career Twin Engine</p><p className="text-xs text-[color:var(--text-2)]">The same retrieval, aggregation, explanation, validation, privacy, and feedback rules serve every audience.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-7 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center"><p className="text-sm font-bold text-[color:var(--violet)]">Inspectable by design</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">See how a result is made.</h2></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE.map(([title, text], index) => (
              <details key={title} className="group rounded-xl border border-[color:var(--border)] bg-white p-4 shadow-sm" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold"><span><span className="mr-2 text-xs text-[color:var(--yellow)]">0{index + 1}</span>{title}</span><span className="text-[color:var(--text-3)] transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-xs leading-5 text-[color:var(--text-2)]">{text}</p>
              </details>
            ))}
          </div>
          <div className="mt-7 text-center"><Link href="/dashboard/architecture" className="inline-flex rounded-[10px] border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:border-[color:var(--accent)]">Inspect the system architecture</Link></div>
        </div>
      </section>
    </>
  );
}
