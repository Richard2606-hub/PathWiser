'use client';

import { FormEvent, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { Pill } from '@/components/common/Pill';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';

interface Plan { label: string; role: string; cohortSize: number; medianMonths: number; outcomes: Array<{ role: string; probability: number }>; interventions: string[]; }

export function OnboardingPredictorView() {
  const showToast = useAppStore((state) => state.showToast);
  const [label, setLabel] = useState('New hire A');
  const [role, setRole] = useState('Data Analyst');
  const [skills, setSkills] = useState('SQL, Excel, Communication');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true);
    try {
      const result = await navigate({ userId: 'anon', persona: 'employer', role, education: "Bachelor's", years_experience: 1, state: 'Kuala Lumpur', skills: skills.split(',').map((item) => item.trim()).filter(Boolean), life_stage: 'young_adult' });
      if (!('aggregate' in result)) throw new Error(result.message);
      setPlan({ label, role, cohortSize: result.cohort.size, medianMonths: result.aggregate.median_time_in_role_months, outcomes: result.aggregate.next_role_distribution.slice(0, 4), interventions: result.aggregate.common_skill_bridges.slice(0, 4).map((item) => `Create supported practice for ${item.skill}`) });
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to assemble onboarding evidence.', 'error'); }
    finally { setLoading(false); }
  };

  const downloadBrief = () => {
    if (!plan) return;
    const text = [`PathWiser onboarding evidence brief`, `${plan.label} · ${plan.role}`, `Comparable cohort: ${plan.cohortSize}`, `Cohort median time in role: ${plan.medianMonths} months`, '', 'Observed directions:', ...plan.outcomes.map((item) => `- ${item.role}: ${Math.round(item.probability * 100)}% of cohort`), '', 'Support plan:', ...plan.interventions.map((item) => `- ${item}`), '', 'This is cohort evidence, not an individual prediction.'].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pathwiser-onboarding-brief.txt'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="flex flex-col gap-4">
    <StatGrid cols={4}><StatBox label="Comparable cohort" value={loading ? '…' : (plan?.cohortSize || 0).toLocaleString()} /><StatBox label="Outcome directions" value={String(plan?.outcomes.length || 0)} color="var(--teal)" /><StatBox label="Support actions" value={String(plan?.interventions.length || 0)} color="var(--sky)" /><StatBox label="Individual prediction" value="Disabled" color="var(--violet)" /></StatGrid>
    <Callout tone="teal"><strong>Evidence-based onboarding planner</strong><p className="mt-1">The proposal’s onboarding module is implemented as a range-of-outcomes briefing. It never assigns a person a success probability, risk level, or predicted completion date.</p></Callout>
    <form onSubmit={generate} className="grid gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4 md:grid-cols-3">
      <label className="text-xs">Private case label<input className="community-input mt-1" value={label} onChange={(event) => setLabel(event.target.value)} required /></label>
      <label className="text-xs">Target role<input className="community-input mt-1" value={role} onChange={(event) => setRole(event.target.value)} required /></label>
      <label className="text-xs">Starting skills<input className="community-input mt-1" value={skills} onChange={(event) => setSkills(event.target.value)} required /></label>
      <Button className="md:col-span-3 md:justify-self-start" disabled={loading}>{loading ? 'Assembling evidence…' : 'Build onboarding plan'}</Button>
    </form>
    {plan ? <div className="grid gap-4 lg:grid-cols-[3fr_2fr]"><section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><span className="font-mono text-[10px] uppercase text-[color:var(--text-3)]">Observed cohort directions</span><h3 className="mt-1 font-extrabold">{plan.label} · {plan.role}</h3><div className="mt-3 flex flex-col gap-2">{plan.outcomes.map((item) => <div key={item.role} className="flex items-center justify-between gap-3 rounded bg-[color:var(--bg-elevated)] p-2"><span className="text-xs">{item.role}</span><Pill>{Math.round(item.probability * 100)}% cohort share</Pill></div>)}</div></section><section className="flex flex-col gap-3"><Callout tone="amber"><strong>Support plan</strong><ul className="mt-2 list-disc space-y-1 pl-4">{plan.interventions.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-2">Review at agreed check-ins; do not treat the cohort median of {plan.medianMonths} months as a deadline.</p></Callout><Button variant="teal" onClick={downloadBrief}>Download manager briefing</Button></section></div> : <Callout tone="amber"><strong>No onboarding case yet</strong><p className="mt-1">Use a private label rather than personal identifying information, then generate a support plan.</p></Callout>}
  </div>;
}
