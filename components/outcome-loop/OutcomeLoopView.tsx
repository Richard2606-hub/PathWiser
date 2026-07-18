'use client';

import { useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

const OUTCOMES = {
  first: [
    { role: 'Software Developer', pct: 68 },
    { role: 'Data Analyst', pct: 52 },
    { role: 'System Admin', pct: 35 },
    { role: 'QA Engineer', pct: 28 },
    { role: 'IT Support', pct: 22 },
  ],
  five: [
    { role: 'Senior Engineer', pct: 45 },
    { role: 'Data Scientist', pct: 38 },
    { role: 'Tech Lead', pct: 32 },
    { role: 'Product Manager', pct: 25 },
    { role: 'Consultant', pct: 18 },
  ],
  ten: [
    { role: 'Engineering Manager', pct: 28 },
    { role: 'Architect', pct: 22 },
    { role: 'Director', pct: 15 },
    { role: 'Entrepreneur', pct: 12 },
    { role: 'Academic', pct: 8 },
  ],
};

const HORIZONS = [
  { key: 'first', label: 'First Job' },
  { key: 'five', label: '5-Year' },
  { key: 'ten', label: '10-Year' },
] as const;

const PROGRAMMES = [
  { key: 'cs', label: 'BSc Computer Science (AI/DS)' },
  { key: 'it', label: 'BSc Information Technology' },
  { key: 'biz', label: 'BSc Business Analytics' },
];

export function OutcomeLoopView() {
  const [horizon, setHorizon] = useState<'first' | 'five' | 'ten'>('first');
  const [programme, setProgramme] = useState('cs');
  const data = OUTCOMES[horizon];
  const max = Math.max(...data.map((d) => d.pct));

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Consortium Unis" value="18" />
        <StatBox label="Tracked Graduates" value="28,400" color="var(--teal)" />
        <StatBox label="Horizon" value={horizon === 'first' ? '1 Year' : horizon === 'five' ? '5 Year' : '10 Year'} color="var(--violet)" />
        <StatBox label="Data Freshness" value="2024 Q4" color="var(--sky)" />
      </StatGrid>

      <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Programme
            </span>
            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--accent)]"
            >
              {PROGRAMMES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex gap-1 ml-auto">
            {HORIZONS.map((h) => (
              <button
                key={h.key}
                onClick={() => setHorizon(h.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                  horizon === h.key
                    ? 'bg-[color:var(--violet)] text-[color:var(--bg-base)]'
                    : 'bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-[color:var(--text-2)] hover:border-[color:var(--violet)]'
                )}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {data.map((d) => (
            <div key={d.role} className="grid grid-cols-[180px_1fr_44px] items-center gap-3">
              <span className="text-xs font-semibold text-[color:var(--text-1)]">{d.role}</span>
              <div className="h-2 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full bg-[color:var(--violet)] transition-[width] duration-700"
                  style={{ width: `${(d.pct / max) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-[color:var(--text-3)] text-right tabular-nums">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <Callout tone="violet">
        <strong>Curriculum Feedback</strong>
        <p className="mt-1">
          Outcome data automatically feeds into the Future-State Curriculum Engine for gap identification.
        </p>
      </Callout>

      <div className="flex flex-wrap gap-2">
        <Button variant="violet" size="sm">
          → Feed to Curriculum Engine
        </Button>
        <Button variant="outline" size="sm">
          Export cohort data
        </Button>
      </div>
    </div>
  );
}
