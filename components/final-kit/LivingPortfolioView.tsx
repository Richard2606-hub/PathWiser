'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { resolveShape } from '@/lib/utils';
import { saveWorkspaceRecord } from '@/lib/records/client';
import { useAppStore } from '@/store/useAppStore';
import { findOccupation, SECTORS, occupationsBySector } from '@/lib/corpus/occupations';

export function LivingPortfolioView() {
  const shape = resolveShape(useAppStore((state) => state.shape), DEMO_PERSONAS.aisyah.shape);
  const showToast = useAppStore((state) => state.showToast);
  const [targetRole, setTargetRole] = useState(shape.role || 'Data Analyst');
  const [evidence, setEvidence] = useState(() => {
    return shape.skills.map((sk, idx) => ({
      skill: sk,
      source: idx === 0 ? 'Capstone analytics project' : idx === 1 ? 'Portfolio notebook' : 'Peer review',
      confidence: 70 + (idx * 5) % 25,
    }));
  });
  const [skill, setSkill] = useState('');
  const [source, setSource] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (shape.role) setTargetRole(shape.role);
    if (shape.skills.length) {
      setEvidence(shape.skills.map((sk, idx) => ({
        skill: sk,
        source: idx === 0 ? 'Capstone analytics project' : idx === 1 ? 'Portfolio notebook' : 'Peer review',
        confidence: 70 + (idx * 5) % 25,
      })));
    }
  }, [shape.role, shape.skills]);

  const readiness = useMemo(() => {
    const declared = new Set(shape.skills.map((item) => item.toLowerCase()));
    const covered = evidence.filter((item) => declared.has(item.skill.toLowerCase()) || item.confidence >= 75);
    return Math.round((covered.length / Math.max(1, evidence.length)) * 100);
  }, [evidence, shape.skills]);

  const gaps = useMemo(() => {
    const matchingOcc = findOccupation(targetRole);
    const typicalGaps = matchingOcc?.typical_skills || ['System design', 'Testing discipline', 'Cloud deployment'];
    const owned = new Set(evidence.map((item) => item.skill.toLowerCase()));
    return typicalGaps.filter((item) => !owned.has(item.toLowerCase())).slice(0, 4);
  }, [evidence, targetRole]);

  const addEvidence = () => {
    if (!skill.trim() || !source.trim()) {
      showToast('Add both a skill and an evidence source.', 'warn');
      return;
    }
    setEvidence((current) => [{ skill: skill.trim(), source: source.trim(), confidence: 68 }, ...current]);
    setSkill('');
    setSource('');
    showToast('Portfolio evidence added.', 'success');
  };

  const saveSnapshot = async () => {
    const saved = await saveWorkspaceRecord({
      module: 'living_portfolio',
      record_type: 'portfolio_snapshot',
      title: `${shape.role} to ${targetRole}`,
      status: sharing ? 'active' : 'draft',
      payload: { targetRole, readiness, evidence, gaps, sharing },
      next_review_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    showToast(saved.persistence === 'account' ? 'Portfolio snapshot saved to your account.' : 'Portfolio snapshot saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Target role" value={targetRole} />
        <StatBox label="Evidence items" value={evidence.length.toString()} color="var(--teal)" />
        <StatBox label="Readiness signal" value={`${readiness}%`} color="var(--yellow)" />
        <StatBox label="Sharing" value={sharing ? 'Enabled' : 'Private'} color={sharing ? 'var(--emerald)' : 'var(--text-3)'} />
      </StatGrid>

      <Callout tone="teal">
        <strong>Living portfolio, not a static CV.</strong>
        <p className="mt-1">This page turns declared skills into inspectable evidence. Sharing stays off until the candidate chooses to make a snapshot visible.</p>
      </Callout>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
          <h2 className="font-bold">Portfolio controls</h2>
          <label className="mt-3 block text-xs">
            Target role
            <select value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className="community-input mt-1">
              {SECTORS.map((sec) => (
                <optgroup key={sec} label={sec}>
                  {occupationsBySector(sec).map((o) => (
                    <option key={o.role} value={o.role}>{o.role}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="mt-3 flex items-center gap-2 text-xs">
            <input type="checkbox" checked={sharing} onChange={(event) => setSharing(event.target.checked)} />
            Allow this snapshot to be shared with approved employers
          </label>
          <div className="mt-4 grid gap-2">
            <input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Skill, e.g. Power BI" className="community-input" />
            <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="Evidence source, e.g. internship dashboard" className="community-input" />
            <Button onClick={addEvidence}>Add evidence</Button>
          </div>
        </section>

        <section className="rounded-md border border-[color:var(--border)] bg-white p-4">
          <h2 className="font-bold">Evidence board</h2>
          <div className="mt-3 flex flex-col gap-2">
            {evidence.map((item) => (
              <article key={`${item.skill}-${item.source}`} className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{item.skill}</strong>
                  <Pill variant={item.confidence >= 75 ? 'acquired' : 'bridge'}>{item.confidence}% evidence strength</Pill>
                </div>
                <p className="mt-1 text-xs text-[color:var(--text-2)]">{item.source}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <h2 className="font-bold">Next evidence gaps</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {gaps.map((item) => <Pill key={item} variant="bridge">{item}</Pill>)}
          {!gaps.length && <Pill variant="acquired">No major gap in this modelled view</Pill>}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={saveSnapshot}>Save portfolio snapshot</Button>
        <Button variant="outline" onClick={() => setSharing(false)}>Keep private</Button>
      </div>
    </div>
  );
}
