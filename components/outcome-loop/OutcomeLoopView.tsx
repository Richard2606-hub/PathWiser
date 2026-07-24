'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { cn, formatMYR } from '@/lib/utils';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';
import { loadWorkspaceRecords, saveWorkspaceRecord } from '@/lib/records/client';

const HORIZONS = [
  { key: 'first', label: 'First job', step: 0, years: 1 },
  { key: 'five', label: '5-year', step: 1, years: 5 },
  { key: 'ten', label: '10-year', step: 2, years: 10 },
] as const;
type Horizon = typeof HORIZONS[number]['key'];

const PROGRAMMES = [
  { key: 'cs', label: 'BSc Computer Science (AI/DS)', role: 'Software Engineer', skills: ['Python','SQL','Algorithms'] },
  { key: 'it', label: 'BSc Information Technology', role: 'IT Support', skills: ['Networks','SQL','Cloud'] },
  { key: 'biz', label: 'BSc Business Analytics', role: 'Data Analyst', skills: ['SQL','Excel','Tableau'] },
];

interface OutcomeRow { role: string; share: number; count: number; salary: number | null; }

export function OutcomeLoopView() {
  const router = useRouter();
  const showToast = useAppStore((state) => state.showToast);
  const [horizon, setHorizon] = useState<Horizon>('first');
  const [programme, setProgramme] = useState('cs');
  const [rows, setRows] = useState<OutcomeRow[]>([]);
  const [cohortSize, setCohortSize] = useState(0);
  const [source, setSource] = useState('Loading evidence');
  const [loading, setLoading] = useState(true);
  const [savedSnapshots, setSavedSnapshots] = useState(0);
  const [persistence, setPersistence] = useState<'account'|'device'>('device');

  useEffect(() => {
    void loadWorkspaceRecords<{
      programme: string; horizon: Horizon; rows: OutcomeRow[]; cohortSize: number; source: string;
    }>('outcome_loop').then((result) => {
      setSavedSnapshots(result.records.length);
      setPersistence(result.persistence);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const selectedProgramme = PROGRAMMES.find((item) => item.key === programme) || PROGRAMMES[0];
      const selectedHorizon = HORIZONS.find((item) => item.key === horizon) || HORIZONS[0];
      try {
        const result = await navigate({ userId: 'anon', persona: 'university', role: selectedProgramme.role, education: selectedProgramme.label, years_experience: selectedHorizon.years, state: 'Kuala Lumpur', skills: selectedProgramme.skills, life_stage: selectedHorizon.years < 3 ? 'young_adult' : 'early_career' }, { currentStepIndex: selectedHorizon.step });
        if (cancelled) return;
        if (!('aggregate' in result)) {
          setRows([]); setCohortSize(result.cohort_size); setSource('No sufficiently large cohort'); return;
        }
        setRows(result.aggregate.next_role_distribution.slice(0, 6).map((item) => ({ role: item.role, share: item.probability, count: item.count, salary: result.aggregate.salary_percentiles_by_role[item.role]?.median ?? null })));
        setCohortSize(result.cohort.size); setSource(result.evidence.label);
      } catch (error) {
        if (!cancelled) { setRows([]); setCohortSize(0); setSource('Evidence service unavailable'); showToast(error instanceof Error ? error.message : 'Unable to retrieve programme outcomes.', 'error'); }
      } finally { if (!cancelled) setLoading(false); }
    }
    void load(); return () => { cancelled = true; };
  }, [horizon, programme, showToast]);

  const maxShare = Math.max(...rows.map((item) => item.share), 0.01);
  const exportCohort = () => {
    const programmeLabel = PROGRAMMES.find((item) => item.key === programme)?.label || programme;
    const csvRows = [['programme','horizon','destination_role','trajectory_count','cohort_share_percent','median_monthly_salary_myr','evidence_cohort','source'], ...rows.map((item) => [programmeLabel,horizon,item.role,item.count,Math.round(item.share * 100),item.salary ?? '',cohortSize,source])];
    const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `pathwiser-outcomes-${programme}-${horizon}.csv`; anchor.click(); URL.revokeObjectURL(url); showToast('Outcome evidence exported as CSV.', 'success');
  };

  const openCurriculumEngine = () => {
    const selected = PROGRAMMES.find((item) => item.key === programme) || PROGRAMMES[0];
    sessionStorage.setItem('pathwiser-curriculum-context', JSON.stringify({ programme: selected.label, destination: rows[0]?.role || selected.role, currentSkills: selected.skills.join(', ') }));
    router.push('/dashboard/university/curriculum-engine');
  };

  const saveSnapshot = async () => {
    const selected = PROGRAMMES.find((item) => item.key === programme) || PROGRAMMES[0];
    const saved = await saveWorkspaceRecord({
      module: 'outcome_loop',
      record_type: 'programme_outcome_snapshot',
      title: `${selected.label} · ${horizon}`,
      payload: { programme: selected.label, horizon, rows, cohortSize, source },
      next_review_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setSavedSnapshots((count) => count + 1);
    setPersistence(saved.persistence);
    showToast(saved.persistence === 'account' ? 'Outcome snapshot saved to your account.' : 'Outcome snapshot saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return <div className="flex flex-col gap-4">
    <StatGrid cols={4}><StatBox label="Programmes" value={PROGRAMMES.length.toString()} /><StatBox label="Evidence cohort" value={loading ? '…' : cohortSize.toLocaleString()} color="var(--teal)" /><StatBox label="Saved snapshots" value={savedSnapshots.toString()} color="var(--violet)" /><StatBox label="Destinations" value={loading ? '…' : rows.length.toString()} color="var(--sky)" /></StatGrid>
    <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4" aria-labelledby="outcome-controls-title"><h2 id="outcome-controls-title" className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-2)]">Programme outcome evidence</h2><div className="mt-3 flex flex-wrap items-end gap-3"><label className="text-xs">Programme<select className="community-input mt-1" value={programme} onChange={(event) => setProgramme(event.target.value)}>{PROGRAMMES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label><fieldset><legend className="mb-1 text-xs">Outcome horizon</legend><div className="flex gap-1">{HORIZONS.map((item) => <button key={item.key} type="button" aria-pressed={horizon === item.key} onClick={() => setHorizon(item.key)} className={cn('rounded-md border px-3 py-2 text-xs', horizon === item.key ? 'border-[color:var(--violet)] bg-[color:var(--violet)] text-[color:var(--bg-base)]' : 'border-[color:var(--border)]')}>{item.label}</button>)}</div></fieldset></div></section>
    <Callout tone={source.includes('unavailable') || source.includes('No sufficiently') ? 'amber' : 'violet'}><strong>Evidence provenance</strong><p className="mt-1">{source}. Outcomes are aggregated by programme and horizon; no graduate is individually identifiable. Peer-programme comparison remains unavailable unless both institutions approve a consortium agreement.</p></Callout>
    <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4" aria-labelledby="destination-title"><h2 id="destination-title" className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-2)]">Observed destinations</h2><div className="mt-3 flex flex-col gap-3" aria-live="polite">{rows.map((item) => <div key={item.role} className="grid gap-2 sm:grid-cols-[180px_1fr_90px_120px] sm:items-center"><strong className="text-xs">{item.role}</strong><div className="h-2 overflow-hidden rounded-full bg-[color:var(--bg-elevated)]"><div className="h-full bg-[color:var(--violet)]" style={{ width: `${item.share / maxShare * 100}%` }} /></div><span className="text-right font-mono text-[11px]">{Math.round(item.share * 100)}% · {item.count}</span><span className="text-right text-xs text-[color:var(--text-2)]">{item.salary ? formatMYR(item.salary) : 'Salary unavailable'}</span></div>)}{!loading && !rows.length && <p className="py-6 text-center text-sm text-[color:var(--text-2)]">No publishable outcome cohort is available for this programme and horizon.</p>}</div></section>
    <div className="flex flex-wrap items-center gap-2"><Button variant="violet" size="sm" onClick={openCurriculumEngine} disabled={!rows.length}>Send context to Curriculum Engine</Button><Button variant="outline" size="sm" onClick={saveSnapshot} disabled={loading || !rows.length}>Save outcome snapshot</Button><Button variant="outline" size="sm" onClick={exportCohort} disabled={loading || !rows.length}>Export outcome evidence</Button><span className="text-[10px] text-[color:var(--text-3)]">History saves to {persistence === 'account' ? 'your account' : 'this device'}.</span></div>
  </div>;
}
