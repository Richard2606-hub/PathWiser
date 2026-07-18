'use client';

import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { Pill } from '@/components/common/Pill';

const GAPS = [
  { skill: 'Cloud Infrastructure (AWS/GCP)', gap: 82, priority: 1 },
  { skill: 'MLOps & Model Deployment',        gap: 75, priority: 2 },
  { skill: 'Data Engineering (Spark/Airflow)', gap: 68, priority: 3 },
  { skill: 'API Design & Microservices',      gap: 62, priority: 4 },
  { skill: 'DevOps / CI-CD Pipelines',        gap: 58, priority: 5 },
  { skill: 'Product Management Basics',       gap: 45, priority: 6 },
];

export function CurriculumEngineView() {
  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Skill Gaps Found" value="12" color="var(--rose)" />
        <StatBox label="Demand Sources" value="2,840 roles" color="var(--teal)" />
        <StatBox label="Curriculum Coverage" value="68%" color="var(--yellow)" />
        <StatBox label="Implementation Lag" value="1–2 sem" color="var(--sky)" />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Skill Gap vs. Employer Demand Signal
          </span>
          <h3 className="text-base font-extrabold mt-0.5 mb-3">Ranked by demand-supply gap</h3>
          <div className="flex flex-col gap-2.5">
            {GAPS.map((g) => (
              <div key={g.skill} className="grid grid-cols-[180px_1fr_55px] items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Pill variant="bridge">P{g.priority}</Pill>
                  <span className="text-xs">{g.skill}</span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
                  <div className="h-full bg-[color:var(--violet)] transition-[width] duration-700" style={{ width: `${g.gap}%` }} />
                </div>
                <span className="text-[11px] font-mono text-[color:var(--text-3)] text-right tabular-nums">
                  {g.gap}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Callout tone="violet">
            <strong>Demand Signal Intake</strong>
            <p className="mt-1">
              Aggregating employer search patterns from Smart Talent Matching across 2,840 role postings.
              Cross-referencing against current university curricula.
            </p>
          </Callout>
          <Callout tone="amber">
            <strong>Lead-Time Trade-off</strong>
            <p className="mt-1">
              Curriculum changes require 1–2 semesters to implement. Current gap projections factor in
              this implementation lag.
            </p>
          </Callout>
          <Button variant="violet">View Syllabus Recommendations</Button>
        </div>
      </div>
    </div>
  );
}
