'use client';

import { useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';

interface Hire {
  name: string;
  role: string;
  shapeMatch: number;
  eta: string;
  risk: 'Low' | 'Medium' | 'High';
  interventions: Array<{ label: string; effectiveness: number }>;
  similar: number;
}

const HIRES: Hire[] = [
  { name: 'Ahmad Faizal', role: 'Full-Stack Developer', shapeMatch: 87, eta: '4.2 weeks', risk: 'Low',
    interventions: [
      { label: 'Buddy system', effectiveness: 85 },
      { label: 'Code review pairing', effectiveness: 72 },
      { label: 'Architecture walkthrough', effectiveness: 65 },
    ],
    similar: 145 },
  { name: 'Siti Aminah', role: 'Data Analyst', shapeMatch: 72, eta: '6.8 weeks', risk: 'Medium',
    interventions: [
      { label: 'SQL bootcamp', effectiveness: 88 },
      { label: 'Domain immersion', effectiveness: 74 },
      { label: 'Stakeholder intro series', effectiveness: 62 },
    ],
    similar: 98 },
  { name: 'Lee Mei Ling', role: 'Product Designer', shapeMatch: 64, eta: '8.1 weeks', risk: 'High',
    interventions: [
      { label: 'Design system onboarding', effectiveness: 82 },
      { label: 'User research shadowing', effectiveness: 71 },
      { label: 'Cross-functional sprint', effectiveness: 58 },
    ],
    similar: 62 },
];

const RISK_COLOR: Record<string, string> = {
  Low: 'var(--emerald)',
  Medium: 'var(--yellow)',
  High: 'var(--rose)',
};

export function OnboardingPredictorView() {
  const [idx, setIdx] = useState(0);
  const h = HIRES[idx];

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Shape Match" value={`${h.shapeMatch}%`} />
        <StatBox label="Predicted ETA" value={h.eta} color="var(--sky)" />
        <StatBox label="Risk Level" value={h.risk} color={RISK_COLOR[h.risk]} />
        <StatBox label="Similar Onboards" value={h.similar} color="var(--teal)" />
      </StatGrid>

      <div className="p-3.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)] block mb-1.5">
          New Hire
        </span>
        <div className="flex gap-2 flex-wrap">
          {HIRES.map((hire, i) => (
            <Button
              key={i}
              variant={i === idx ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIdx(i)}
            >
              {hire.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Cohort Intervention Effectiveness
          </span>
          <h3 className="text-base font-extrabold mt-0.5 mb-3">{h.name} · {h.role}</h3>
          <div className="flex flex-col gap-2">
            {h.interventions.map((iv) => (
              <div key={iv.label} className="grid grid-cols-[1fr_140px_50px] items-center gap-2.5 py-1">
                <span className="text-xs text-[color:var(--text-2)]">{iv.label}</span>
                <div className="h-2 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
                  <div className="h-full bg-[color:var(--teal)] transition-[width] duration-700"
                       style={{ width: `${iv.effectiveness}%` }} />
                </div>
                <span className="text-[10px] font-mono text-[color:var(--text-3)] text-right tabular-nums">
                  {iv.effectiveness}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Callout tone="teal">
            <strong>Cohort Insight</strong>
            <p className="mt-1">
              Based on <strong>{h.similar}</strong> similar onboarding trajectories, the recommended
              intervention set has a{' '}
              <strong className="text-[color:var(--yellow)]">
                {h.shapeMatch > 80 ? '78%' : h.shapeMatch > 70 ? '68%' : '52%'}
              </strong>{' '}
              success rate for reducing ramp-up time by 30%.
            </p>
          </Callout>
          <Button variant="teal">Generate Manager Briefing</Button>
        </div>
      </div>
    </div>
  );
}
