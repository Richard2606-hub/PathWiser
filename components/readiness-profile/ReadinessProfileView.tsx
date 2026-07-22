'use client';

import { FormEvent, useEffect, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { Button } from '@/components/common/Button';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';

interface Capability { skill: string; status: 'declared' | 'bridge'; prevalence?: number; }

export function ReadinessProfileView() {
  const showToast = useAppStore((state) => state.showToast);
  const [student, setStudent] = useState('Student profile');
  const [targetRole, setTargetRole] = useState('Junior Data Scientist');
  const [skills, setSkills] = useState('Python, SQL, Core Algorithms');
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [cohortSize, setCohortSize] = useState(0);
  const [source, setSource] = useState('Not analysed');
  const [discoveryConsent, setDiscoveryConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const analyse = async (event?: FormEvent) => {
    event?.preventDefault(); setLoading(true);
    try {
      const declared = skills.split(',').map((item) => item.trim()).filter(Boolean);
      const result = await navigate({ userId: 'anon', persona: 'university', role: targetRole, education: "Bachelor's", years_experience: 0, state: 'Kuala Lumpur', skills: declared, life_stage: 'student' });
      if (!('aggregate' in result)) throw new Error(result.message);
      const declaredLower = new Set(declared.map((item) => item.toLowerCase()));
      setCapabilities([...declared.map((skill) => ({ skill, status: 'declared' as const })), ...result.aggregate.common_skill_bridges.filter((item) => !declaredLower.has(item.skill.toLowerCase())).slice(0, 6).map((item) => ({ skill: item.skill, status: 'bridge' as const, prevalence: item.frequency }))]);
      setCohortSize(result.cohort.size); setSource(result.evidence.label);
    } catch (error) { setCapabilities([]); setCohortSize(0); setSource('Evidence unavailable'); showToast(error instanceof Error ? error.message : 'Unable to build a readiness profile.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void analyse(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const updateConsent = async (enabled: boolean) => {
    setDiscoveryConsent(enabled);
    try {
      const response = await fetch('/api/consent', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'employer_discovery', enabled }) });
      if (response.status === 401) { setDiscoveryConsent(false); showToast('Sign in to save and manage employer-sharing consent.', 'warn'); return; }
      if (!response.ok) throw new Error('Consent could not be saved.');
      showToast(enabled ? 'Employer discovery enabled. You can revoke it at any time.' : 'Employer discovery revoked.', 'success');
    } catch (error) { setDiscoveryConsent(!enabled); showToast(error instanceof Error ? error.message : 'Consent could not be updated.', 'error'); }
  };

  const downloadDossier = () => {
    const dossier = { generated_at: new Date().toISOString(), student_label: student, target_role: targetRole, evidence_cohort: cohortSize, evidence_source: source, declared_capabilities: capabilities.filter((item) => item.status === 'declared').map((item) => item.skill), evidence_bridges: capabilities.filter((item) => item.status === 'bridge').map((item) => ({ skill: item.skill, cohort_prevalence: item.prevalence })), employer_discovery_consent: discoveryConsent, disclaimer: 'Capability evidence is user-declared and cohort-referenced; it is not a credential verification or prediction.' };
    const url = URL.createObjectURL(new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pathwiser-capability-dossier.json'; anchor.click(); URL.revokeObjectURL(url);
  };

  const declaredCount = capabilities.filter((item) => item.status === 'declared').length;
  const bridgeCount = capabilities.filter((item) => item.status === 'bridge').length;
  return <div className="flex flex-col gap-4">
    <StatGrid cols={4}><StatBox label="Declared capabilities" value={loading ? '…' : declaredCount.toString()} /><StatBox label="Evidence bridges" value={loading ? '…' : bridgeCount.toString()} color="var(--yellow)" /><StatBox label="Evidence cohort" value={loading ? '…' : cohortSize.toLocaleString()} color="var(--teal)" /><StatBox label="Employer sharing" value={discoveryConsent ? 'Opted in' : 'Private'} color="var(--violet)" /></StatGrid>
    <form onSubmit={analyse} className="grid gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4 md:grid-cols-3"><label className="text-xs">Student label<input className="community-input mt-1" value={student} onChange={(event) => setStudent(event.target.value)} /></label><label className="text-xs">Target role<input className="community-input mt-1" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} /></label><label className="text-xs">Current skills<input className="community-input mt-1" value={skills} onChange={(event) => setSkills(event.target.value)} /></label><Button className="md:col-span-3 md:justify-self-start" disabled={loading}>{loading ? 'Mapping capabilities…' : 'Refresh capability map'}</Button></form>
    <Callout tone="violet"><strong>Dynamic capability evidence</strong><p className="mt-1">{source}. Declared skills remain distinct from cohort-observed bridges. PathWiser does not claim to verify a credential, and prospective employers see a profile only after explicit, revocable consent.</p></Callout>
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]"><section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><span className="font-mono text-[10px] uppercase text-[color:var(--text-3)]">Capability landscape · {targetRole}</span><div className="mt-3 flex flex-col gap-2">{capabilities.map((item) => <div key={`${item.status}-${item.skill}`} className="flex items-center justify-between gap-3 rounded bg-[color:var(--bg-elevated)] p-2"><span className="text-xs">{item.skill}</span><Pill variant={item.status === 'declared' ? 'acquired' : 'bridge'}>{item.status === 'declared' ? 'Self-declared' : `${Math.round((item.prevalence || 0) * 100)}% cohort bridge`}</Pill></div>)}</div></section><section className="flex flex-col gap-3"><div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><h3 className="font-bold">Sharing control</h3><label className="mt-3 flex items-start gap-2 text-xs text-[color:var(--text-2)]"><input type="checkbox" checked={discoveryConsent} onChange={(event) => void updateConsent(event.target.checked)} /><span>Allow authenticated employer members to discover this capability profile. No email or account identifier is disclosed.</span></label></div><Button variant="violet" onClick={downloadDossier} disabled={!capabilities.length}>Download capability dossier</Button></section></div>
  </div>;
}
