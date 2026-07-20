'use client';

import { useState, useEffect } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { Pill } from '@/components/common/Pill';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';

const FALLBACK_BRIDGES = [
  { skill: 'Data Visualization', count: 184, confidence: 92, trending: true },
  { skill: 'Cloud Architecture', count: 142, confidence: 88, trending: true },
  { skill: 'Agile Methodologies', count: 115, confidence: 81 },
  { skill: 'Machine Learning', count: 94, confidence: 76, trending: true },
];

export function CurriculumEngineView() {
  const showToast = useAppStore((s) => s.showToast);
  const [gaps, setGaps] = useState<{ skill: string; gap: number; priority: number }[]>(FALLBACK_BRIDGES.map((b, i) => ({ skill: b.skill, gap: b.confidence, priority: i + 1 })));
  const [loading, setLoading] = useState(false);
  const [cohortSize, setCohortSize] = useState(2840);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await navigate({
          userId: 'anon',
          persona: 'university',
          role: 'BSc Computer Science',
          education: 'PhD',
          years_experience: 18,
          state: 'Johor',
          skills: ['Java', 'Algorithms', 'Data Structures', 'SQL'],
          life_stage: 'senior_career',
        });
        if ('aggregate' in res && res.aggregate?.common_skill_bridges?.length) {
          setGaps(res.aggregate.common_skill_bridges.map((b, i) => ({
            skill: b.skill,
            gap: Math.round(b.frequency * 100),
            priority: i + 1,
          })));
        }
        if ('cohort' in res && res.cohort?.size) {
          setCohortSize(res.cohort.size);
        }
      } catch (err: any) {
        console.error(err);
        showToast(`Engine API Error: ${err.message || 'Failed to fetch curriculum gaps.'}`, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Skill Gaps Found" value={loading ? '...' : gaps.length.toString()} color="var(--rose)" />
        <StatBox label="Demand Sources" value={loading ? '...' : `${cohortSize} roles`} color="var(--teal)" />
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
            {gaps.map((g) => (
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
              Aggregating employer search patterns from Smart Talent Matching across {loading ? '...' : cohortSize} role postings.
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
