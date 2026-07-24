'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { useAppStore } from '@/store/useAppStore';

interface FeedbackItem {
  id: string;
  module: string;
  accuracy_rating: number;
  freshness_rating: number;
  reflection: string;
  private_note?: string;
  source_path?: string;
  output_reference?: string;
  curation_status?: string;
  created_at: string;
}

const LOCAL_KEY = 'pathwiser-feedback';
const MODULE_OPTIONS = [
  'Career Path Navigator',
  'AI Career Coach',
  'Fair Pay Engine',
  'Smart Talent Matching',
  'Retention Signals',
  'Onboarding Success Predictor',
  'Lifelong Outcome Loop',
  'Future-State Curriculum Engine',
  'Adaptive Readiness Profile',
  'Profile / Career Twin',
  'Trajectory Retrieval',
  'Outcome Aggregation',
  'AI Explanation',
  'Job Marketplace',
  'Company Directory',
  'Architecture',
];

export function FeedbackView() {
  const showToast = useAppStore((state) => state.showToast);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [module, setModule] = useState('Career Path Navigator');
  const [sourcePath, setSourcePath] = useState('');
  const [outputReference, setOutputReference] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [freshness, setFreshness] = useState(0);
  const [reflection, setReflection] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [persistence, setPersistence] = useState<'account' | 'device'>('device');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedModule = params.get('module');
    if (requestedModule) setModule(requestedModule);
    setSourcePath(params.get('source') || '');

    async function load() {
      try {
        const response = await fetch('/api/feedback', { cache: 'no-store' });
        const body = await response.json();
        if (response.ok && body.persistence === 'account') {
          setItems(body.feedback);
          setPersistence('account');
          return;
        }
      } catch {
        // Device history is loaded below.
      }
      try {
        setItems(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'));
      } catch {
        setItems([]);
      }
      setPersistence('device');
    }
    void load();
  }, []);

  const averages = useMemo(() => ({
    accuracy: items.length ? items.reduce((sum, item) => sum + item.accuracy_rating, 0) / items.length : 0,
    freshness: items.length ? items.reduce((sum, item) => sum + item.freshness_rating, 0) / items.length : 0,
  }), [items]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!accuracy || !freshness) {
      showToast('Rate both accuracy and freshness before submitting.', 'warn');
      return;
    }
    setBusy(true);
    const localItem: FeedbackItem = {
      id: crypto.randomUUID(),
      module,
      accuracy_rating: accuracy,
      freshness_rating: freshness,
      reflection,
      private_note: privateNote,
      source_path: sourcePath,
      output_reference: outputReference,
      curation_status: 'received',
      created_at: new Date().toISOString(),
    };
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          accuracy_rating: accuracy,
          freshness_rating: freshness,
          reflection,
          private_note: privateNote,
          source_path: sourcePath || undefined,
          output_reference: outputReference || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Feedback could not be saved.');
      const next = [body.feedback || localItem, ...items];
      setItems(next);
      if (body.persistence !== 'account') {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
        setPersistence('device');
        showToast('Feedback saved on this device. Sign in to sync it.', 'info');
      } else {
        setPersistence('account');
        showToast('Feedback entered the human review queue.', 'success');
      }
      setAccuracy(0);
      setFreshness(0);
      setReflection('');
      setPrivateNote('');
      setOutputReference('');
    } catch (error) {
      const next = [localItem, ...items];
      setItems(next);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      setPersistence('device');
      showToast(`Saved on this device: ${error instanceof Error ? error.message : 'Account sync unavailable.'}`, 'warn');
    } finally {
      setBusy(false);
    }
  }

  const choices = MODULE_OPTIONS.includes(module) ? MODULE_OPTIONS : [module, ...MODULE_OPTIONS];

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Your reflections" value={items.length} />
        <StatBox label="Average accuracy" value={items.length ? `${averages.accuracy.toFixed(1)}/5` : 'No ratings'} color="var(--yellow)" />
        <StatBox label="Average freshness" value={items.length ? `${averages.freshness.toFixed(1)}/5` : 'No ratings'} color="var(--teal)" />
        <StatBox label="Saved to" value={persistence === 'account' ? 'Your account' : 'This device'} color="var(--sky)" />
      </StatGrid>

      <Callout tone="emerald">
        <strong>Your feedback is evidence, not an automatic model update.</strong>
        <p className="mt-1">Ratings enter a human-reviewed curation queue. Private notes remain in your own reflection history and are not shared with employers or universities.</p>
      </Callout>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-white p-4">
          <h2 className="font-bold">Reflect on a specific output</h2>
          {sourcePath && <p className="rounded-lg bg-[color:var(--bg-elevated)] px-3 py-2 text-xs text-[color:var(--text-2)]">Source page: <span className="font-mono">{sourcePath}</span></p>}
          <label className="text-xs">Module
            <select className="community-input mt-1" value={module} onChange={(event) => setModule(event.target.value)}>
              {choices.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs">Output reference <span className="text-[color:var(--text-3)]">(optional)</span>
            <input className="community-input mt-1" value={outputReference} onChange={(event) => setOutputReference(event.target.value)} maxLength={300} placeholder="e.g. Data Scientist branch, July 2026 run" />
          </label>
          <Rating label="Accuracy" value={accuracy} onChange={setAccuracy} />
          <Rating label="Data freshness" value={freshness} onChange={setFreshness} />
          <label className="text-xs">Reflection
            <textarea className="community-input mt-1 min-h-[90px]" value={reflection} onChange={(event) => setReflection(event.target.value)} maxLength={2000} placeholder="What was useful, missing, or misleading?" />
          </label>
          <label className="text-xs">Private note
            <textarea className="community-input mt-1 min-h-[70px]" value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} maxLength={4000} placeholder="A note for your future self" />
          </label>
          <Button disabled={busy}>{busy ? 'Saving...' : 'Save reflection'}</Button>
        </form>

        <section className="rounded-xl border border-[color:var(--border)] bg-white p-4" aria-labelledby="history-title">
          <h2 id="history-title" className="font-bold">Your recent reflection history</h2>
          <div className="mt-3 flex max-h-[560px] flex-col gap-2 overflow-y-auto">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3">
                <span className="text-[9px] uppercase text-[color:var(--text-3)]">{new Date(item.created_at).toLocaleDateString()} · {item.module}</span>
                <p className="mt-1 text-xs">Accuracy {item.accuracy_rating}/5 · Freshness {item.freshness_rating}/5</p>
                {item.output_reference && <p className="mt-1 text-xs"><strong>Output:</strong> {item.output_reference}</p>}
                {item.reflection && <p className="mt-2 text-xs text-[color:var(--text-2)]">{item.reflection}</p>}
                {item.private_note && <p className="mt-2 rounded bg-white p-2 text-xs"><strong>Private:</strong> {item.private_note}</p>}
                <p className="mt-2 text-[10px] text-[color:var(--text-3)]">Curation: {(item.curation_status || 'received').replaceAll('_', ' ')}</p>
              </article>
            ))}
            {!items.length && <p className="py-8 text-center text-sm text-[color:var(--text-2)]">Your saved reflections will appear here.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <fieldset>
      <legend className="mb-1 text-xs">{label}</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((number) => (
          <button key={number} type="button" aria-label={`${label}: ${number} out of 5`} aria-pressed={value === number} onClick={() => onChange(number)} className={`h-9 w-9 rounded border text-sm ${number <= value ? 'border-[color:var(--yellow)] bg-[color:var(--accent-glow)] text-[color:var(--yellow)]' : 'border-[color:var(--border)]'}`}>
            {number}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
