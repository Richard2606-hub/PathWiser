'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { saveWorkspaceRecord } from '@/lib/records/client';
import { useAppStore } from '@/store/useAppStore';

const CHAPTERS = {
  exploration: { label: 'Explore', actions: ['Interview three practitioners', 'Try one portfolio project', 'Compare two adjacent roles'] },
  acceleration: { label: 'Accelerate', actions: ['Choose one skill bridge', 'Ask for stretch ownership', 'Document measurable outcomes'] },
  transition: { label: 'Transition', actions: ['Reduce role risk with a bridge project', 'Update portfolio proof', 'Prepare compensation evidence'] },
};

export function LifeChapterDesignerView() {
  const showToast = useAppStore((state) => state.showToast);
  const [chapter, setChapter] = useState<keyof typeof CHAPTERS>('acceleration');
  const [months, setMonths] = useState(6);
  const [constraint, setConstraint] = useState('Limited time outside work');
  const [selected, setSelected] = useState<string[]>(CHAPTERS.acceleration.actions);

  const plan = useMemo(() => selected.map((action, index) => ({
    action,
    month: Math.min(months, Math.max(1, Math.round(((index + 1) / selected.length) * months))),
    risk: index === 0 ? 'Low' : index === selected.length - 1 ? 'Higher' : 'Moderate',
  })), [months, selected]);

  const toggleAction = (action: string) => {
    setSelected((current) => current.includes(action) ? current.filter((item) => item !== action) : [...current, action]);
  };

  const savePlan = async () => {
    const saved = await saveWorkspaceRecord({
      module: 'life_chapter_designer',
      record_type: 'chapter_plan',
      title: `${CHAPTERS[chapter].label} chapter - ${months} months`,
      status: 'active',
      payload: { chapter, months, constraint, plan },
      next_review_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    });
    showToast(saved.persistence === 'account' ? 'Life chapter plan saved to your account.' : 'Life chapter plan saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Chapter" value={CHAPTERS[chapter].label} />
        <StatBox label="Horizon" value={`${months} months`} color="var(--teal)" />
        <StatBox label="Actions" value={selected.length.toString()} color="var(--yellow)" />
        <StatBox label="Review cadence" value="45 days" />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.5fr]">
        <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
          <h2 className="font-bold">Design the chapter</h2>
          <label className="mt-3 block text-xs">Chapter type
            <select className="community-input mt-1" value={chapter} onChange={(event) => {
              const next = event.target.value as keyof typeof CHAPTERS;
              setChapter(next);
              setSelected(CHAPTERS[next].actions);
            }}>
              {Object.entries(CHAPTERS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs">Planning horizon
            <input className="community-input mt-1" type="range" min={3} max={18} step={3} value={months} onChange={(event) => setMonths(Number(event.target.value))} />
          </label>
          <label className="mt-3 block text-xs">Constraint to respect
            <input className="community-input mt-1" value={constraint} onChange={(event) => setConstraint(event.target.value)} />
          </label>
          <div className="mt-4 flex flex-col gap-2">
            {CHAPTERS[chapter].actions.map((action) => (
              <label key={action} className="flex items-start gap-2 rounded-md border border-[color:var(--border)] bg-white p-2 text-xs">
                <input type="checkbox" checked={selected.includes(action)} onChange={() => toggleAction(action)} />
                {action}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[color:var(--border)] bg-white p-4">
          <h2 className="font-bold">Chapter timeline</h2>
          <div className="mt-4 flex flex-col gap-3">
            {plan.map((item) => (
              <article key={item.action} className="grid gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3 sm:grid-cols-[90px_1fr_auto] sm:items-center">
                <Pill variant="bridge">Month {item.month}</Pill>
                <div>
                  <strong>{item.action}</strong>
                  <p className="mt-1 text-xs text-[color:var(--text-2)]">Constraint: {constraint}</p>
                </div>
                <Pill variant={item.risk === 'Low' ? 'acquired' : 'default'}>{item.risk} change load</Pill>
              </article>
            ))}
            {!plan.length && <Callout tone="amber">Choose at least one action to build a chapter plan.</Callout>}
          </div>
        </section>
      </div>

      <Callout tone="amber">
        <strong>Agency stays with the candidate.</strong>
        <p className="mt-1">The designer makes trade-offs visible. It does not prescribe a single life decision or treat career change as a purely rational optimisation problem.</p>
      </Callout>

      <Button className="self-start" onClick={savePlan} disabled={!plan.length}>Save chapter plan</Button>
    </div>
  );
}
