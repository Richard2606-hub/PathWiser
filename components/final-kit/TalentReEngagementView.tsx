'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { saveWorkspaceRecord } from '@/lib/records/client';
import { useAppStore } from '@/store/useAppStore';

const ALUMNI = [
  { name: 'Mei Chen', previous: 'Data Analyst', current: 'Analytics Lead', monthsAway: 18, bridges: ['Stakeholder management', 'Experiment design'] },
  { name: 'Aisyah Yusof', previous: 'Software Engineer', current: 'Platform Engineer', monthsAway: 10, bridges: ['Cloud deployment'] },
  { name: 'Daniel Tan', previous: 'Product Analyst', current: 'Product Manager', monthsAway: 24, bridges: ['Roadmap trade-offs', 'Discovery interviews'] },
];

export function TalentReEngagementView() {
  const showToast = useAppStore((state) => state.showToast);
  const [role, setRole] = useState('Analytics Lead');
  const [messageTone, setMessageTone] = useState('Warm alumni check-in');
  const [savedCount, setSavedCount] = useState(0);

  const matches = useMemo(() => ALUMNI.map((person) => ({
    ...person,
    alignment: person.current.includes(role.split(' ')[0]) ? 'Direct alumni path' : person.bridges.length <= 1 ? 'Light bridge' : 'Adjacent return path',
  })), [role]);

  const saveCampaign = async () => {
    const saved = await saveWorkspaceRecord({
      module: 'talent_reengagement',
      record_type: 'alumni_campaign',
      title: `${role} re-engagement`,
      status: 'draft',
      payload: { role, messageTone, matches },
      next_review_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setSavedCount((count) => count + 1);
    showToast(saved.persistence === 'account' ? 'Re-engagement campaign saved to your account.' : 'Re-engagement campaign saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Alumni pool" value={ALUMNI.length.toString()} />
        <StatBox label="Bridge paths" value={matches.filter((item) => item.alignment !== 'Direct alumni path').length.toString()} color="var(--yellow)" />
        <StatBox label="Saved campaigns" value={savedCount.toString()} color="var(--teal)" />
        <StatBox label="Consent mode" value="Invite first" />
      </StatGrid>

      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs md:col-span-1">Role to refill
            <input className="community-input mt-1" value={role} onChange={(event) => setRole(event.target.value)} />
          </label>
          <label className="text-xs md:col-span-2">Message approach
            <input className="community-input mt-1" value={messageTone} onChange={(event) => setMessageTone(event.target.value)} />
          </label>
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-3">
        {matches.map((person) => (
          <article key={person.name} className="rounded-md border border-[color:var(--border)] bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold">{person.name}</h2>
                <p className="text-xs text-[color:var(--text-2)]">{person.previous} to {person.current}</p>
              </div>
              <Pill variant={person.alignment === 'Direct alumni path' ? 'acquired' : 'bridge'}>{person.alignment}</Pill>
            </div>
            <p className="mt-3 text-xs text-[color:var(--text-2)]">{person.monthsAway} months since last engagement. Suggested approach: {messageTone.toLowerCase()}.</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {person.bridges.map((item) => <Pill key={item} variant="bridge">{item}</Pill>)}
            </div>
          </article>
        ))}
      </section>

      <Callout tone="amber">
        <strong>Re-engagement must be consent-led.</strong>
        <p className="mt-1">This module drafts who to invite back into conversation. It does not expose private alumni records or automate outreach without permission.</p>
      </Callout>

      <Button className="self-start" onClick={saveCampaign}>Save campaign draft</Button>
    </div>
  );
}
