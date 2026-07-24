'use client';

import { FormEvent, useEffect, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { Pill } from '@/components/common/Pill';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';
import { loadWorkspaceRecords, saveWorkspaceRecord } from '@/lib/records/client';

interface Recommendation { skill: string; prevalence: number; action: string; tradeOff: string; }

export function CurriculumEngineView() {
  const showToast = useAppStore((state) => state.showToast);
  const [programme, setProgramme] = useState('BSc Computer Science (AI/DS)');
  const [destination, setDestination] = useState('Software Engineer');
  const [currentSkills, setCurrentSkills] = useState('Java, Algorithms, Data Structures, SQL');
  const [leadTime, setLeadTime] = useState(2);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [cohortSize, setCohortSize] = useState(0);
  const [source, setSource] = useState('Not analysed');
  const [loading, setLoading] = useState(false);
  const [savedReviews, setSavedReviews] = useState(0);
  const [persistence, setPersistence] = useState<'account'|'device'>('device');

  const analyse = async (event?: FormEvent, override?: { programme: string; destination: string; currentSkills: string }) => {
    event?.preventDefault(); setLoading(true);
    try {
      const effectiveProgramme = override?.programme || programme;
      const effectiveDestination = override?.destination || destination;
      const effectiveSkills = override?.currentSkills || currentSkills;
      const skills = effectiveSkills.split(',').map((item) => item.trim()).filter(Boolean);
      const result = await navigate({ userId: 'anon', persona: 'university', role: effectiveDestination, education: effectiveProgramme, years_experience: 1, state: 'Kuala Lumpur', skills, life_stage: 'young_adult' });
      if (!('aggregate' in result)) throw new Error(result.message);
      const current = new Set(skills.map((item) => item.toLowerCase()));
      setRecommendations(result.aggregate.common_skill_bridges.filter((item) => !current.has(item.skill.trim().toLowerCase())).slice(0, 8).map((item, index) => ({ skill: item.skill, prevalence: item.frequency, action: item.frequency >= 0.5 ? 'Add assessed module outcome' : item.frequency >= 0.25 ? 'Integrate into an existing module' : 'Pilot through an industry project', tradeOff: index < 2 ? `Higher evidence prevalence; curriculum approval still requires approximately ${leadTime} semester${leadTime === 1 ? '' : 's'}.` : 'Emerging signal; validate with faculty and employer partners before replacing core content.' })));
      setCohortSize(result.cohort.size); setSource(result.evidence.label);
    } catch (error) { setRecommendations([]); setCohortSize(0); setSource('Evidence unavailable'); showToast(error instanceof Error ? error.message : 'Unable to analyse curriculum gaps.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const raw = sessionStorage.getItem('pathwiser-curriculum-context');
    if (raw) {
      try {
        const context = JSON.parse(raw) as { programme: string; destination: string; currentSkills: string };
        setProgramme(context.programme); setDestination(context.destination); setCurrentSkills(context.currentSkills);
        sessionStorage.removeItem('pathwiser-curriculum-context');
        void analyse(undefined, context);
        return;
      } catch { sessionStorage.removeItem('pathwiser-curriculum-context'); }
    }
    void analyse();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    void loadWorkspaceRecords<{
      programme: string; destination: string; currentSkills: string; recommendations: Recommendation[]; cohortSize: number; source: string; leadTime: number;
    }>('curriculum_engine').then((result) => {
      setSavedReviews(result.records.length);
      setPersistence(result.persistence);
    });
  }, []);

  const exportRecommendations = () => {
    const rows = [['programme','destination','skill','cohort_prevalence_percent','recommended_action','trade_off','evidence_source'], ...recommendations.map((item) => [programme,destination,item.skill,Math.round(item.prevalence * 100),item.action,item.tradeOff,source])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pathwiser-curriculum-recommendations.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  const saveFacultyReview = async () => {
    const nextReviewAt = new Date(Date.now() + leadTime * 180 * 24 * 60 * 60 * 1000).toISOString();
    const saved = await saveWorkspaceRecord({
      module: 'curriculum_engine',
      record_type: 'faculty_review',
      title: `${programme} · ${destination}`,
      status: 'review_due',
      payload: { programme, destination, currentSkills, recommendations, cohortSize, source, leadTime },
      next_review_at: nextReviewAt,
    });
    setSavedReviews((count) => count + 1);
    setPersistence(saved.persistence);
    showToast(saved.persistence === 'account' ? 'Faculty review saved to your account.' : 'Faculty review saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return <div className="flex flex-col gap-4">
    <StatGrid cols={4}><StatBox label="Evidence cohort" value={loading ? '…' : cohortSize.toLocaleString()} /><StatBox label="Uncovered skills" value={loading ? '…' : recommendations.length.toString()} color="var(--rose)" /><StatBox label="Saved faculty reviews" value={savedReviews.toString()} color="var(--teal)" /><StatBox label="Planning assumption" value={`${leadTime} semester${leadTime === 1 ? '' : 's'}`} color="var(--sky)" /></StatGrid>
    <form onSubmit={analyse} className="grid gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4 md:grid-cols-2"><label className="text-xs">Programme<input className="community-input mt-1" value={programme} onChange={(event) => setProgramme(event.target.value)} required /></label><label className="text-xs">Target graduate destination<input className="community-input mt-1" value={destination} onChange={(event) => setDestination(event.target.value)} required /></label><label className="text-xs md:col-span-2">Current curriculum skills<input className="community-input mt-1" value={currentSkills} onChange={(event) => setCurrentSkills(event.target.value)} required /></label><label className="text-xs">Expected approval lead time<select className="community-input mt-1" value={leadTime} onChange={(event) => setLeadTime(Number(event.target.value))}><option value={1}>1 semester</option><option value={2}>2 semesters</option><option value={3}>3 semesters</option></select></label><Button className="self-end justify-self-start" disabled={loading}>{loading ? 'Analysing…' : 'Refresh gap analysis'}</Button></form>
    <Callout tone="violet"><strong>Decision support, not automatic curriculum design</strong><p className="mt-1">{source}. Recommendations compare declared curriculum outcomes with skills common in the retrieved trajectory cohort. Faculty review, learner impact, accreditation requirements, and consenting employer demand must be considered before implementation.</p></Callout>
    <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4" aria-labelledby="recommendations-title"><h2 id="recommendations-title" className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--text-2)]">Cohort-grounded recommendations</h2><div className="mt-3 flex flex-col gap-3">{recommendations.map((item, index) => <article key={item.skill} className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3"><div className="flex flex-wrap justify-between gap-2"><div className="flex items-center gap-2"><Pill variant="bridge">Priority {index + 1}</Pill><strong>{item.skill}</strong></div><span className="font-mono text-xs">{Math.round(item.prevalence * 100)}% cohort prevalence</span></div><p className="mt-2 text-sm"><strong>Action:</strong> {item.action}</p><p className="mt-1 text-xs text-[color:var(--text-2)]"><strong>Trade-off:</strong> {item.tradeOff}</p></article>)}{!loading && !recommendations.length && <p className="py-5 text-center text-sm text-[color:var(--text-2)]">No publishable uncovered skill signal was found. Review the destination or curriculum description.</p>}</div></section>
    <div className="flex flex-wrap items-center gap-2"><Button variant="violet" onClick={saveFacultyReview} disabled={!recommendations.length}>Save faculty review</Button><Button variant="outline" onClick={exportRecommendations} disabled={!recommendations.length}>Export faculty review pack</Button><span className="text-[10px] text-[color:var(--text-3)]">Review history saves to {persistence === 'account' ? 'your account' : 'this device'}.</span></div>
  </div>;
}
