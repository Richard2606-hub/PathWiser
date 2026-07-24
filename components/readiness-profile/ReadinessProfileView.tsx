'use client';

import { FormEvent, useEffect, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { Button } from '@/components/common/Button';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';
import { loadWorkspaceRecords, saveWorkspaceRecord } from '@/lib/records/client';

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
  const [learningEvent, setLearningEvent] = useState('');
  const [learningEvents, setLearningEvents] = useState<string[]>([]);
  const [savedSnapshots, setSavedSnapshots] = useState(0);
  const [persistence, setPersistence] = useState<'account'|'device'>('device');

  const analyse = async (event?: FormEvent) => {
    event?.preventDefault(); setLoading(true);
    try {
      const declared = [...skills.split(',').map((item) => item.trim()).filter(Boolean), ...learningEvents];
      const result = await navigate({ userId: 'anon', persona: 'university', role: targetRole, education: "Bachelor's", years_experience: 0, state: 'Kuala Lumpur', skills: declared, life_stage: 'student' });
      if (!('aggregate' in result)) throw new Error(result.message);
      const declaredLower = new Set(declared.map((item) => item.toLowerCase()));
      setCapabilities([...declared.map((skill) => ({ skill, status: 'declared' as const })), ...result.aggregate.common_skill_bridges.filter((item) => !declaredLower.has(item.skill.toLowerCase())).slice(0, 6).map((item) => ({ skill: item.skill, status: 'bridge' as const, prevalence: item.frequency }))]);
      setCohortSize(result.cohort.size); setSource(result.evidence.label);
    } catch (error) { setCapabilities([]); setCohortSize(0); setSource('Evidence unavailable'); showToast(error instanceof Error ? error.message : 'Unable to build a readiness profile.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    void analyse();
    void fetch('/api/consent')
      .then(async (response) => ({ response, body: await response.json() }))
      .then(({ response, body }) => {
        if (!response.ok) return;
        const employerConsent = body.consents.find((item: { consent_type: string; revoked_at: string | null }) => item.consent_type === 'employer_discovery');
        setDiscoveryConsent(Boolean(employerConsent && !employerConsent.revoked_at));
      })
      .catch(() => undefined);
    void loadWorkspaceRecords<{
      student: string; targetRole: string; skills: string; learningEvents: string[]; capabilities: Capability[]; cohortSize: number; source: string; discoveryConsent: boolean;
    }>('readiness_profile').then((result) => {
      setSavedSnapshots(result.records.length);
      setPersistence(result.persistence);
      const latest = result.records[0]?.payload;
      if (latest?.learningEvents) setLearningEvents(latest.learningEvents);
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

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
    const dossier = { generated_at: new Date().toISOString(), student_label: student, target_role: targetRole, evidence_cohort: cohortSize, evidence_source: source, learning_events: learningEvents, declared_capabilities: capabilities.filter((item) => item.status === 'declared').map((item) => item.skill), evidence_bridges: capabilities.filter((item) => item.status === 'bridge').map((item) => ({ skill: item.skill, cohort_prevalence: item.prevalence })), employer_discovery_consent: discoveryConsent, disclaimer: 'Capability evidence is user-declared and cohort-referenced; it is not a credential verification or prediction.' };
    const url = URL.createObjectURL(new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pathwiser-capability-dossier.json'; anchor.click(); URL.revokeObjectURL(url);
  };

  const addLearningEvent = () => {
    const value = learningEvent.trim();
    if (!value || learningEvents.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setLearningEvents((current) => [...current, value]);
    setLearningEvent('');
  };

  const saveSnapshot = async () => {
    const saved = await saveWorkspaceRecord({
      module: 'readiness_profile',
      record_type: 'capability_snapshot',
      title: `${student} · ${targetRole}`,
      payload: { student, targetRole, skills, learningEvents, capabilities, cohortSize, source, discoveryConsent },
      next_review_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setSavedSnapshots((count) => count + 1);
    setPersistence(saved.persistence);
    showToast(saved.persistence === 'account' ? 'Readiness snapshot saved to your account.' : 'Readiness snapshot saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  const declaredCount = capabilities.filter((item) => item.status === 'declared').length;
  return <div className="flex flex-col gap-4">
    <StatGrid cols={4}><StatBox label="Declared capabilities" value={loading ? '…' : declaredCount.toString()} /><StatBox label="Learning events" value={learningEvents.length.toString()} color="var(--yellow)" /><StatBox label="Saved snapshots" value={savedSnapshots.toString()} color="var(--teal)" /><StatBox label="Employer sharing" value={discoveryConsent ? 'Opted in' : 'Private'} color="var(--violet)" /></StatGrid>
    <form onSubmit={analyse} className="grid gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4 md:grid-cols-3"><label className="text-xs">Student label<input className="community-input mt-1" value={student} onChange={(event) => setStudent(event.target.value)} /></label><label className="text-xs">Target role<input className="community-input mt-1" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} /></label><label className="text-xs">Current skills<input className="community-input mt-1" value={skills} onChange={(event) => setSkills(event.target.value)} /></label><label className="text-xs md:col-span-2">Completed learning, project, or internship evidence<div className="mt-1 flex gap-2"><input className="community-input" value={learningEvent} onChange={(event) => setLearningEvent(event.target.value)} placeholder="Example: Built a forecasting capstone in Python" /><Button type="button" variant="outline" onClick={addLearningEvent}>Add</Button></div></label><Button className="self-end justify-self-start" disabled={loading}>{loading ? 'Mapping capabilities…' : 'Refresh capability map'}</Button>{learningEvents.length > 0 && <div className="md:col-span-3 flex flex-wrap gap-1.5">{learningEvents.map((item) => <button key={item} type="button" onClick={() => setLearningEvents((current) => current.filter((event) => event !== item))}><Pill variant="acquired">{item} ×</Pill></button>)}</div>}</form>
    <Callout tone="violet"><strong>Dynamic capability evidence</strong><p className="mt-1">{source}. Declared skills remain distinct from cohort-observed bridges. PathWiser does not claim to verify a credential, and prospective employers see a profile only after explicit, revocable consent.</p></Callout>
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]"><section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><span className="font-mono text-[10px] uppercase text-[color:var(--text-3)]">Capability landscape · {targetRole}</span><div className="mt-3 flex flex-col gap-2">{capabilities.map((item) => <div key={`${item.status}-${item.skill}`} className="flex items-center justify-between gap-3 rounded bg-[color:var(--bg-elevated)] p-2"><span className="text-xs">{item.skill}</span><Pill variant={item.status === 'declared' ? 'acquired' : 'bridge'}>{item.status === 'declared' ? 'Self-declared' : `${Math.round((item.prevalence || 0) * 100)}% cohort bridge`}</Pill></div>)}</div></section><section className="flex flex-col gap-3"><div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><h3 className="font-bold">Sharing control</h3><label className="mt-3 flex items-start gap-2 text-xs text-[color:var(--text-2)]"><input type="checkbox" checked={discoveryConsent} onChange={(event) => void updateConsent(event.target.checked)} /><span>Allow authenticated employer members to discover this capability profile. No email or account identifier is disclosed.</span></label></div><Button variant="violet" onClick={saveSnapshot} disabled={!capabilities.length}>Save readiness snapshot</Button><Button variant="outline" onClick={downloadDossier} disabled={!capabilities.length}>Download capability dossier</Button><span className="text-[10px] text-[color:var(--text-3)]">History saves to {persistence === 'account' ? 'your account' : 'this device'}.</span></section></div>
  </div>;
}
