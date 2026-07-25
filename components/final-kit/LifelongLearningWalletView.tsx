'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { saveWorkspaceRecord } from '@/lib/records/client';
import { useAppStore } from '@/store/useAppStore';

const STARTER_CREDITS = [
  { title: 'Cloud fundamentals', provider: 'University microcredential', hours: 24, portability: 'Verified' },
  { title: 'Data storytelling', provider: 'Employer project', hours: 18, portability: 'Evidence attached' },
  { title: 'Career reflection', provider: 'Career centre', hours: 4, portability: 'Private note' },
];

export function LifelongLearningWalletView() {
  const showToast = useAppStore((state) => state.showToast);
  const [credits, setCredits] = useState(STARTER_CREDITS);
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [shareable, setShareable] = useState(false);

  const totalHours = useMemo(() => credits.reduce((sum, item) => sum + item.hours, 0), [credits]);
  const verified = credits.filter((item) => item.portability !== 'Private note').length;

  const addCredit = () => {
    if (!title.trim() || !provider.trim()) {
      showToast('Add both learning title and provider.', 'warn');
      return;
    }
    setCredits((current) => [{ title: title.trim(), provider: provider.trim(), hours: 8, portability: shareable ? 'Evidence attached' : 'Private note' }, ...current]);
    setTitle('');
    setProvider('');
    showToast('Learning credit added.', 'success');
  };

  const saveWallet = async () => {
    const saved = await saveWorkspaceRecord({
      module: 'lifelong_learning_wallet',
      record_type: 'learning_wallet',
      title: `Learning wallet - ${totalHours} hours`,
      status: shareable ? 'active' : 'draft',
      payload: { credits, totalHours, verified, shareable },
      next_review_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
    showToast(saved.persistence === 'account' ? 'Learning wallet saved to your account.' : 'Learning wallet saved on this device.', saved.persistence === 'account' ? 'success' : 'info');
  };

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Credits" value={credits.length.toString()} />
        <StatBox label="Learning hours" value={totalHours.toString()} color="var(--teal)" />
        <StatBox label="Portable evidence" value={verified.toString()} color="var(--yellow)" />
        <StatBox label="Sharing" value={shareable ? 'Enabled' : 'Private'} />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.5fr]">
        <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
          <h2 className="font-bold">Add learning evidence</h2>
          <input className="community-input mt-3" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Learning title" />
          <input className="community-input mt-2" value={provider} onChange={(event) => setProvider(event.target.value)} placeholder="Provider or evidence source" />
          <label className="mt-3 flex items-center gap-2 text-xs">
            <input type="checkbox" checked={shareable} onChange={(event) => setShareable(event.target.checked)} />
            Make newly added credits shareable after review
          </label>
          <Button className="mt-3" onClick={addCredit}>Add credit</Button>
        </section>

        <section className="rounded-md border border-[color:var(--border)] bg-white p-4">
          <h2 className="font-bold">Wallet timeline</h2>
          <div className="mt-3 flex flex-col gap-2">
            {credits.map((item) => (
              <article key={`${item.title}-${item.provider}`} className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{item.title}</strong>
                  <Pill variant={item.portability === 'Private note' ? 'default' : 'acquired'}>{item.portability}</Pill>
                </div>
                <p className="mt-1 text-xs text-[color:var(--text-2)]">{item.provider} - {item.hours} hours</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Callout tone="teal">
        <strong>Learning stays portable.</strong>
        <p className="mt-1">The wallet connects formal study, employer projects and private reflections into one consent-controlled learning record.</p>
      </Callout>

      <Button className="self-start" onClick={saveWallet}>Save learning wallet</Button>
    </div>
  );
}
