'use client';

import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';
import { Callout } from '@/components/common/Callout';

const RETENTION = [
  { name: 'Engineering', risk: 'High',   score: 78, count: 42, drivers: ['Below-median compensation', 'Limited growth paths', 'Manager turnover'] },
  { name: 'Data Science', risk: 'Medium', score: 55, count: 18, drivers: ['Market demand pressure', 'Skill ceiling perception'] },
  { name: 'Product',     risk: 'Low',    score: 25, count: 8,  drivers: ['Strong culture fit', 'Clear progression'] },
  { name: 'Marketing',   risk: 'Medium', score: 48, count: 14, drivers: ['Role ambiguity', 'Cross-functional friction'] },
];

const RISK_COLOR: Record<string, string> = {
  High: 'var(--rose)',
  Medium: 'var(--yellow)',
  Low: 'var(--emerald)',
};

export function RetentionSignalsView() {
  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Monitored Teams" value="4" />
        <StatBox label="High Risk" value="1" color="var(--rose)" />
        <StatBox label="Avg Attrition Score" value="51.5" />
        <StatBox label="Total At-Risk" value="82" color="var(--amber)" />
      </StatGrid>

      <Callout tone="teal">
        <strong>How this works</strong>
        <p className="mt-1">
          For each team, the engine compares employees&apos; shape and tenure against cohorts of similar
          shapes at the same tenure point. When someone&apos;s pattern deviates meaningfully from the cohort
          norm, they surface here — with the specific drivers the cohort saw. This gives you a
          <em> window to have the retention conversation</em> before the letter arrives.
        </p>
      </Callout>

      <div className="grid gap-2.5">
        {RETENTION.map((r) => (
          <div
            key={r.name}
            className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]"
          >
            <div className="flex justify-between items-start gap-3 mb-2">
              <div>
                <span
                  className="font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: RISK_COLOR[r.risk] }}
                >
                  {r.risk} Risk · Score {r.score}/100
                </span>
                <h3 className="text-base font-extrabold mt-0.5">Dept: {r.name}</h3>
              </div>
              <div className="text-3xl font-black tabular-nums" style={{ color: RISK_COLOR[r.risk] }}>
                {r.count}
              </div>
            </div>
            <div className="relative h-2 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
              <div
                className="absolute h-full transition-[width] duration-700 ease-out"
                style={{ width: `${r.score}%`, background: RISK_COLOR[r.risk] }}
              />
            </div>
            <div className="mt-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                Attrition Drivers
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {r.drivers.map((d) => <Pill key={d}>{d}</Pill>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
