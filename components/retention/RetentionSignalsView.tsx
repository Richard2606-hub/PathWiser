'use client';

import { FormEvent, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';

interface RetentionEvidence {
  id: string; team: string; role: string; currentTenure: number; cohortSize: number; medianTenure: number;
  nextDestinations: Array<{ role: string; share: number }>; bridges: string[];
}

export function RetentionSignalsView() {
  const shape = useAppStore((state) => state.shape);
  const showToast = useAppStore((state) => state.showToast);
  const [team, setTeam] = useState('Data team');
  const [role, setRole] = useState(shape?.persona === 'employer' ? shape.role : 'Data Scientist');
  const [tenure, setTenure] = useState(24);
  const [skills, setSkills] = useState((shape?.persona === 'employer' ? shape.skills : ['Python', 'SQL']).join(', '));
  const [items, setItems] = useState<RetentionEvidence[]>([]);
  const [loading, setLoading] = useState(false);

  const analyse = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true);
    try {
      const result = await navigate({ userId: 'anon', persona: 'employer', role, education: "Bachelor's", years_experience: Math.max(1, Math.round(tenure / 12)), state: shape?.state || 'Kuala Lumpur', skills: skills.split(',').map((item) => item.trim()).filter(Boolean), life_stage: 'mid_career' });
      if (!('aggregate' in result)) throw new Error(result.message);
      const evidence: RetentionEvidence = {
        id: `${Date.now()}`, team, role, currentTenure: tenure, cohortSize: result.cohort.size,
        medianTenure: result.aggregate.median_time_in_role_months,
        nextDestinations: result.aggregate.next_role_distribution.slice(0, 3).map((item) => ({ role: item.role, share: item.probability })),
        bridges: result.aggregate.common_skill_bridges.slice(0, 3).map((item) => item.skill),
      };
      setItems((current) => [evidence, ...current.filter((item) => item.team !== team)]);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to assemble a retention cohort.', 'error'); }
    finally { setLoading(false); }
  };

  const due = items.filter((item) => item.currentTenure >= item.medianTenure).length;
  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Reviewed teams" value={items.length.toString()} />
        <StatBox label="Conversation window" value={due.toString()} color="var(--amber)" />
        <StatBox label="Evidence standard" value="Cohort only" color="var(--teal)" />
        <StatBox label="Risk scores" value="Disabled" color="var(--sky)" />
      </StatGrid>
      <Callout tone="teal"><strong>Support conversations, not surveillance</strong><p className="mt-1">PathWiser compares anonymous role-and-tenure patterns. It does not label an employee as likely to resign. Managers use the evidence to decide whether a respectful career conversation is timely.</p></Callout>
      <form onSubmit={analyse} className="grid gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4 md:grid-cols-4">
        <label className="text-xs">Team label<input className="community-input mt-1" value={team} onChange={(event) => setTeam(event.target.value)} required /></label>
        <label className="text-xs">Comparable role<input className="community-input mt-1" value={role} onChange={(event) => setRole(event.target.value)} required /></label>
        <label className="text-xs">Average tenure (months)<input className="community-input mt-1" type="number" min={1} max={240} value={tenure} onChange={(event) => setTenure(Number(event.target.value))} /></label>
        <label className="text-xs">Current skills<input className="community-input mt-1" value={skills} onChange={(event) => setSkills(event.target.value)} /></label>
        <Button className="md:col-span-4 md:justify-self-start" disabled={loading}>{loading ? 'Assembling cohort…' : 'Review cohort evidence'}</Button>
      </form>
      {items.map((item) => {
        const conversationDue = item.currentTenure >= item.medianTenure;
        return <article key={item.id} className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><span className="font-mono text-[10px] uppercase text-[color:var(--text-3)]">{item.cohortSize.toLocaleString()} comparable trajectories</span><h3 className="mt-1 font-extrabold">{item.team} · {item.role}</h3></div><Pill variant={conversationDue ? 'bridge' : 'acquired'}>{conversationDue ? 'Career conversation is timely' : 'Continue listening'}</Pill></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2"><Evidence label="Current team tenure" value={`${item.currentTenure} months`} /><Evidence label="Cohort median time in role" value={`${item.medianTenure} months`} /></div>
          <p className="mt-3 text-xs text-[color:var(--text-2)]">Common observed next destinations: {item.nextDestinations.map((next) => `${next.role} (${Math.round(next.share * 100)}%)`).join(', ')}.</p>
          <p className="mt-2 text-xs text-[color:var(--text-2)]"><strong>Conversation prompts:</strong> Which direction feels most meaningful next? Would development in {item.bridges.join(', ') || 'an adjacent skill'} make progression here more realistic? What support would help?</p>
        </article>;
      })}
      {!items.length && <Callout tone="amber"><strong>No team has been assessed</strong><p className="mt-1">Enter a role and tenure above. No individual employee data is required for this cohort-level review.</p></Callout>}
    </div>
  );
}

function Evidence({ label, value }: { label: string; value: string }) { return <div className="rounded bg-[color:var(--bg-elevated)] p-2"><span className="block font-mono text-[9px] uppercase text-[color:var(--text-3)]">{label}</span><strong className="text-sm">{value}</strong></div>; }
