'use client';

import { useEffect, useState } from 'react';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';
import type { EvidenceProvenance, TalentCandidateMatch } from '@/types';

interface MatchResponse {
  candidates: TalentCandidateMatch[];
  cohort_size: number;
  data_scope: 'consented-community' | 'modelled-examples';
  evidence: EvidenceProvenance;
  common_bridges: Array<{ skill: string; frequency: number }>;
  cohort_too_small?: boolean;
  message?: string;
}

export function TalentMatchingView() {
  const shape = useAppStore((state) => state.shape);
  const showToast = useAppStore((state) => state.showToast);
  const [role, setRole] = useState('Data Analyst');
  const [skills, setSkills] = useState(['SQL', 'Python', 'Tableau'].join(', '));
  const [state, setState] = useState(shape?.state || 'Kuala Lumpur');
  const [showAdjacent, setShowAdjacent] = useState(true);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/talent/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, state, skills: skills.split(',').map((item) => item.trim()).filter(Boolean), include_adjacent: showAdjacent }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Unable to retrieve candidates.');
      setResult(body);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to retrieve candidates.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { void search(); /* initial query follows the saved demand shape */ /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Candidate profiles" value={loading ? '…' : String(result?.candidates.length || 0)} />
        <StatBox label="Evidence cohort" value={loading ? '…' : (result?.cohort_size || 0).toLocaleString()} color="var(--teal)" />
        <StatBox label="Adjacent profiles" value={loading ? '…' : String(result?.candidates.filter((item) => item.adjacent).length || 0)} />
        <StatBox label="Data scope" value={result?.data_scope === 'consented-community' ? 'Consented' : 'Modelled'} color="var(--sky)" />
      </StatGrid>

      <section className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]" aria-labelledby="demand-title">
        <h2 id="demand-title" className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-2)]">Declare the role demand shape</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_2fr_1fr_auto]">
          <label className="text-xs">Target role<input className="community-input mt-1" value={role} onChange={(event) => setRole(event.target.value)} /></label>
          <label className="text-xs">Required skills<input className="community-input mt-1" value={skills} onChange={(event) => setSkills(event.target.value)} /></label>
          <label className="text-xs">State<input className="community-input mt-1" value={state} onChange={(event) => setState(event.target.value)} /></label>
          <Button className="self-end" onClick={search} disabled={loading}>{loading ? 'Retrieving…' : 'Find candidates'}</Button>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-[color:var(--text-2)]"><input type="checkbox" checked={showAdjacent} onChange={(event) => setShowAdjacent(event.target.checked)} />Include candidates who need a reasonable skill bridge</label>
      </section>

      <Callout tone={result?.data_scope === 'consented-community' ? 'teal' : 'amber'}>
        <strong>{result?.data_scope === 'consented-community' ? 'Consented community discovery' : 'Modelled profile preview'}</strong>
        <p className="mt-1">{result?.data_scope === 'consented-community' ? 'Only candidates who opted into employer discovery are included. Consent is revocable.' : 'These are clearly labelled synthetic profiles for evaluating the workflow. Configure community accounts and employer membership to retrieve opted-in candidates.'} No single match score is shown; employers review evidence, bridges, and context.</p>
      </Callout>

      <div className="flex flex-col gap-3" aria-live="polite">
        {result?.candidates.map((candidate, index) => (
          <article key={candidate.id} className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-3)]">Evidence order {index + 1} · {candidate.consent_scope === 'synthetic-example' ? 'Synthetic' : 'Opted in'}</span>
                <h3 className="mt-1 text-base font-extrabold">{candidate.display_name}</h3>
                <p className="text-xs text-[color:var(--text-2)]">{candidate.current_role} · {candidate.state}</p>
              </div>
              {candidate.adjacent ? <Pill variant="bridge">Adjacent candidate</Pill> : <Pill variant="acquired">Direct requirements</Pill>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-2)]">{candidate.rationale}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{candidate.matched_skills.map((skill) => <Pill key={skill} variant="acquired">Aligned: {skill}</Pill>)}{candidate.skill_bridges.map((skill) => <Pill key={skill} variant="bridge">Assess bridge: {skill}</Pill>)}</div>
          </article>
        ))}
        {!loading && result?.candidates.length === 0 && <Callout tone="amber"><strong>No safe match set</strong><p className="mt-1">Broaden the requirements or invite candidates to opt into discovery. PathWiser will not infer named matches from an insufficient cohort.</p></Callout>}
      </div>
    </div>
  );
}
