'use client';

import { useState, useEffect } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { navigate } from '@/lib/engine/client';

interface Hire {
  name: string;
  role: string;
  shapeMatch: number;
  eta: string;
  risk: 'Low' | 'Medium' | 'High';
  interventions: Array<{ label: string; effectiveness: number }>;
  similar: number;
}

const INITIAL_HIRES: Hire[] = [
  { name: 'Ahmad Faizal', role: 'Full-Stack Developer', shapeMatch: 87, eta: '4.2 weeks', risk: 'Low', interventions: [], similar: 0 },
  { name: 'Siti Aminah', role: 'Data Analyst', shapeMatch: 72, eta: '6.8 weeks', risk: 'Medium', interventions: [], similar: 0 },
  { name: 'Lee Mei Ling', role: 'Product Designer', shapeMatch: 64, eta: '8.1 weeks', risk: 'High', interventions: [], similar: 0 },
];

const RISK_COLOR: Record<string, string> = {
  Low: 'var(--emerald)',
  Medium: 'var(--yellow)',
  High: 'var(--rose)',
};

export function OnboardingPredictorView() {
  const [idx, setIdx] = useState(0);
  const [hires, setHires] = useState<Hire[]>(INITIAL_HIRES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = await Promise.all(INITIAL_HIRES.map(async (hire) => {
        try {
          const res = await navigate({
            userId: 'anon',
            persona: 'employer',
            role: hire.role,
            education: "Bachelor's",
            years_experience: 1,
            state: 'Kuala Lumpur',
            skills: [],
            life_stage: 'young_adult',
          });

          const similar = 'cohort' in res && res.cohort?.size ? res.cohort.size : hire.similar;
          const bridges = 'aggregate' in res && res.aggregate?.common_skill_bridges ? res.aggregate.common_skill_bridges : [];
          
          const interventions = bridges.length > 0 ? bridges.slice(0, 3).map(b => ({
            label: `Upskill: ${b.skill}`,
            effectiveness: Math.round(b.frequency * 100)
          })) : [
            { label: 'Buddy system', effectiveness: 85 },
            { label: 'Role-specific bootcamp', effectiveness: 74 },
          ];

          return { ...hire, similar, interventions };
        } catch {
          return { ...hire, interventions: [ { label: 'Fallback intervention', effectiveness: 50 } ] };
        }
      }));
      setHires(results);
      setLoading(false);
    }
    load();
  }, []);

  const h = hires[idx];

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Shape Match" value={`${h.shapeMatch}%`} />
        <StatBox label="Predicted ETA" value={h.eta} color="var(--sky)" />
        <StatBox label="Risk Level" value={h.risk} color={RISK_COLOR[h.risk]} />
        <StatBox label="Similar Onboards" value={loading ? '...' : h.similar} color="var(--teal)" />
      </StatGrid>

      <div className="p-3.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)] block mb-1.5">
          New Hire
        </span>
        <div className="flex gap-2 flex-wrap">
          {hires.map((hire, i) => (
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
            {h.interventions.map((iv, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_50px] items-center gap-2.5 py-1">
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
              Based on <strong>{loading ? '...' : h.similar}</strong> similar onboarding trajectories, the recommended
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
