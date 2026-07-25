'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { saveWorkspaceRecord } from '@/lib/records/client';
import { useAppStore } from '@/store/useAppStore';

const TEAMS = ['Engineering', 'Commercial', 'Operations', 'People'];
const SKILLS = ['AI tooling', 'Data literacy', 'Cloud operations', 'Customer discovery', 'Process automation'];

export function WorkforceResiliencePlannerView() {
  const showToast = useAppStore((state) => state.showToast);
  const [team, setTeam] = useState('Engineering');
  const [exposure, setExposure] = useState(45);
  const [selectedSkills, setSelectedSkills] = useState(['AI tooling', 'Cloud operations']);

  const resilience = useMemo(() => Math.max(15, Math.min(95, 100 - exposure + selectedSkills.length * 8)), [exposure, selectedSkills.length]);
  const interventions = useMemo(() => selectedSkills.map((skill, index) => ({
    skill,
    action: index === 0 ? 'Run a 30-day enablement sprint' : 'Pair with a live internal project',
    owner: index % 2 === 0 ? 'Team lead' : 'People partner',
  })), [selectedSkills]);

  const toggleSkill = (skill: string) => setSelectedSkills((current) => current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]);

  const savePlan = async () => {
    const saved = await saveWorkspaceRecord({
      module: 'workforce_resilience',
      record_type: 'resilience_plan',
      title: `${team} resilience plan`,
      status: resilience >= 70 ? 'active' : 'review_due',
      payload: { team, exposure, selectedSkills, resilience, interventions },
      next_review_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });
    showToast(saved.persistence === 'account' ? 'Workforce resilience plan saved to your account.' : 'Workforce resilience plan saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Team" value={team} />
        <StatBox label="Change exposure" value={`${exposure}%`} color="var(--rose)" />
        <StatBox label="Resilience signal" value={`${resilience}%`} color={resilience >= 70 ? 'var(--emerald)' : 'var(--yellow)'} />
        <StatBox label="Interventions" value={interventions.length.toString()} color="var(--teal)" />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
          <h2 className="font-bold">Scenario controls</h2>
          <label className="mt-3 block text-xs">Team
            <select className="community-input mt-1" value={team} onChange={(event) => setTeam(event.target.value)}>
              {TEAMS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs">Exposure to change
            <input className="community-input mt-1" type="range" min={10} max={90} step={5} value={exposure} onChange={(event) => setExposure(Number(event.target.value))} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)} className="rounded-md border border-[color:var(--border)] bg-white px-3 py-2 text-xs">
                {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[color:var(--border)] bg-white p-4">
          <h2 className="font-bold">Support plan</h2>
          <div className="mt-3 flex flex-col gap-2">
            {interventions.map((item) => (
              <article key={item.skill} className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{item.skill}</strong>
                  <Pill variant="bridge">{item.owner}</Pill>
                </div>
                <p className="mt-1 text-xs text-[color:var(--text-2)]">{item.action}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Callout tone="teal">
        <strong>Resilience is treated as capacity planning.</strong>
        <p className="mt-1">The planner highlights teams that may need support. It avoids individual surveillance and should be reviewed with HR governance before real deployment.</p>
      </Callout>

      <Button className="self-start" onClick={savePlan}>Save resilience plan</Button>
    </div>
  );
}
