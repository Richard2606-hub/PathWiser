'use client';

import { useState, useEffect } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';
import { Callout } from '@/components/common/Callout';
import { navigate } from '@/lib/engine/client';

const DEPARTMENTS = [
  { name: 'Engineering', role: 'Software Engineer', baseCount: 42 },
  { name: 'Data Science', role: 'Data Scientist', baseCount: 18 },
  { name: 'Product', role: 'Product Manager', baseCount: 8 },
  { name: 'Marketing', role: 'Marketing Manager', baseCount: 14 },
];

const RISK_COLOR: Record<string, string> = {
  High: 'var(--rose)',
  Medium: 'var(--yellow)',
  Low: 'var(--emerald)',
};

export function RetentionSignalsView() {
  const [data, setData] = useState<{ name: string; risk: string; score: number; count: number; drivers: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results = await Promise.all(DEPARTMENTS.map(async (dept) => {
        try {
          const res = await navigate({
            userId: 'anon',
            persona: 'employer',
            role: dept.role,
            education: "Bachelor's",
            years_experience: 4,
            state: 'Kuala Lumpur',
            skills: [],
            life_stage: 'mid_career',
          });

          // Engine aggregate gives us median time in role and common skill bridges
          const medianMonths = 'aggregate' in res && res.aggregate?.median_time_in_role_months ? res.aggregate.median_time_in_role_months : 24;
          const skills = 'aggregate' in res && res.aggregate?.common_skill_bridges?.map(s => s.skill) || [];
          
          // Calculate mock risk based on median tenure (shorter tenure = higher baseline risk)
          const riskScore = Math.max(10, Math.min(95, Math.floor((36 - medianMonths) / 36 * 100)));
          const riskLabel = riskScore > 65 ? 'High' : riskScore > 35 ? 'Medium' : 'Low';
          
          const drivers = [
            `Cohort median tenure: ${medianMonths}m`,
            ...(skills.slice(0, 2).map(s => `Learning ${s}`)),
          ];

          return {
            name: dept.name,
            risk: riskLabel,
            score: riskScore,
            count: dept.baseCount,
            drivers,
          };
        } catch {
          return { name: dept.name, risk: 'Medium', score: 50, count: dept.baseCount, drivers: ['Engine unavailable'] };
        }
      }));
      setData(results);
      setLoading(false);
    }
    load();
  }, []);

  const totalAtRisk = data.reduce((sum, r) => sum + r.count, 0);
  const avgScore = data.length ? Math.round(data.reduce((sum, r) => sum + r.score, 0) / data.length) : 0;
  const highRiskCount = data.filter(d => d.risk === 'High').length;

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Monitored Teams" value={data.length.toString()} />
        <StatBox label="High Risk" value={highRiskCount.toString()} color="var(--rose)" />
        <StatBox label="Avg Attrition Score" value={loading ? '...' : avgScore.toString()} />
        <StatBox label="Total Monitored" value={totalAtRisk.toString()} color="var(--amber)" />
      </StatGrid>

      <Callout tone="teal">
        <strong>How this works</strong>
        <p className="mt-1">
          For each team, the engine compares employees&apos; shape and tenure against cohorts of similar
          shapes at the same tenure point. When someone&apos;s pattern deviates meaningfully from the cohort
          norm, they surface here — with the specific drivers the cohort saw.
        </p>
      </Callout>

      <div className="grid gap-2.5">
        {data.map((r) => (
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
                Attrition Drivers (from Engine)
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
