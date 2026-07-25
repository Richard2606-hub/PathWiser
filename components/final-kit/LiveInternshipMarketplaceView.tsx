'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { saveWorkspaceRecord } from '@/lib/records/client';
import { useAppStore } from '@/store/useAppStore';

const INTERNSHIPS = [
  { id: 'int-analytics', title: 'Analytics Intern', employer: 'Maybank', faculty: 'Computer Science', skills: ['SQL', 'Dashboard storytelling'], seats: 8 },
  { id: 'int-platform', title: 'Platform Engineering Intern', employer: 'Petronas Digital', faculty: 'Engineering', skills: ['Cloud operations', 'Testing discipline'], seats: 5 },
  { id: 'int-product', title: 'Product Discovery Intern', employer: 'Grab', faculty: 'Business', skills: ['Customer discovery', 'Metric design'], seats: 6 },
];

export function LiveInternshipMarketplaceView() {
  const showToast = useAppStore((state) => state.showToast);
  const [faculty, setFaculty] = useState('all');
  const [savedCount, setSavedCount] = useState(0);

  const visible = useMemo(() => INTERNSHIPS.filter((item) => faculty === 'all' || item.faculty === faculty), [faculty]);
  const totalSeats = visible.reduce((sum, item) => sum + item.seats, 0);

  const saveCohortPlan = async () => {
    const saved = await saveWorkspaceRecord({
      module: 'live_internship_marketplace',
      record_type: 'internship_cohort_plan',
      title: `${faculty === 'all' ? 'All faculties' : faculty} internship plan`,
      status: 'review_due',
      payload: { faculty, internships: visible, totalSeats },
      next_review_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setSavedCount((count) => count + 1);
    showToast(saved.persistence === 'account' ? 'Internship marketplace plan saved to your account.' : 'Internship marketplace plan saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Live briefs" value={visible.length.toString()} />
        <StatBox label="Available seats" value={totalSeats.toString()} color="var(--teal)" />
        <StatBox label="Saved plans" value={savedCount.toString()} color="var(--yellow)" />
        <StatBox label="Data scope" value="Modelled" />
      </StatGrid>

      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
        <label className="text-xs">Faculty filter
          <select className="community-input mt-1 max-w-sm" value={faculty} onChange={(event) => setFaculty(event.target.value)}>
            <option value="all">All faculties</option>
            <option>Computer Science</option>
            <option>Engineering</option>
            <option>Business</option>
          </select>
        </label>
      </div>

      <section className="grid gap-3 lg:grid-cols-3">
        {visible.map((item) => (
          <article key={item.id} className="rounded-md border border-[color:var(--border)] bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="text-xs text-[color:var(--text-2)]">{item.employer} - {item.faculty}</p>
              </div>
              <Pill variant="acquired">{item.seats} seats</Pill>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {item.skills.map((skill) => <Pill key={skill} variant="bridge">{skill}</Pill>)}
            </div>
          </article>
        ))}
      </section>

      <Callout tone="violet">
        <strong>Internships become a live signal loop.</strong>
        <p className="mt-1">Universities can see which skills employers repeatedly request and use that signal for readiness support, without exposing student identities.</p>
      </Callout>

      <Button className="self-start" onClick={saveCohortPlan}>Save internship cohort plan</Button>
    </div>
  );
}
