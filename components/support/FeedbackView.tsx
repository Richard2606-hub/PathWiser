'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';

interface FeedbackItem { id: string; module: string; accuracy_rating: number; freshness_rating: number; reflection: string; private_note?: string; created_at: string; }
const LOCAL_KEY = 'pathwiser-feedback';

export function FeedbackView() {
  const showToast = useAppStore((state) => state.showToast);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [module, setModule] = useState('Career Path Navigator');
  const [accuracy, setAccuracy] = useState(0);
  const [freshness, setFreshness] = useState(0);
  const [reflection, setReflection] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [persistence, setPersistence] = useState<'account' | 'local'>('local');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/feedback'); const body = await response.json();
        if (response.ok && body.persistence === 'account') { setItems(body.feedback); setPersistence('account'); return; }
      } catch { /* use local history */ }
      try { setItems(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')); } catch { setItems([]); }
      setPersistence('local');
    }
    void load();
  }, []);

  const averages = useMemo(() => ({ accuracy: items.length ? items.reduce((sum, item) => sum + item.accuracy_rating, 0) / items.length : 0, freshness: items.length ? items.reduce((sum, item) => sum + item.freshness_rating, 0) / items.length : 0 }), [items]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!accuracy || !freshness) { showToast('Rate both accuracy and freshness before submitting.', 'warn'); return; }
    setBusy(true);
    const localItem: FeedbackItem = { id: crypto.randomUUID(), module, accuracy_rating: accuracy, freshness_rating: freshness, reflection, private_note: privateNote, created_at: new Date().toISOString() };
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module, accuracy_rating: accuracy, freshness_rating: freshness, reflection, private_note: privateNote }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Feedback could not be saved.');
      const nextItem = body.feedback || localItem; const next = [nextItem, ...items]; setItems(next);
      if (body.persistence !== 'account') { localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); setPersistence('local'); showToast('Feedback saved on this device. Sign in to sync it.', 'info'); }
      else { setPersistence('account'); showToast('Feedback saved to your private account history.', 'success'); }
      setAccuracy(0); setFreshness(0); setReflection(''); setPrivateNote('');
    } catch (error) { const next = [localItem, ...items]; setItems(next); localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); setPersistence('local'); showToast(`Saved on this device: ${error instanceof Error ? error.message : 'Account sync unavailable.'}`, 'warn'); }
    finally { setBusy(false); }
  };

  return <div className="flex flex-col gap-4">
    <StatGrid cols={4}><StatBox label="Your reflections" value={items.length.toString()} /><StatBox label="Average accuracy" value={items.length ? `${averages.accuracy.toFixed(1)}/5` : 'No ratings'} color="var(--yellow)" /><StatBox label="Average freshness" value={items.length ? `${averages.freshness.toFixed(1)}/5` : 'No ratings'} color="var(--teal)" /><StatBox label="Saved to" value={persistence === 'account' ? 'Your account' : 'This device'} color="var(--sky)" /></StatGrid>
    <Callout tone="emerald"><strong>Your feedback remains evidence, not an automatic model update</strong><p className="mt-1">Ratings enter a human-reviewed curation process. Private notes remain visible only in your own reflection history and are never shared with employers or universities.</p></Callout>
    <div className="grid gap-4 lg:grid-cols-2"><form onSubmit={submit} className="flex flex-col gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><h2 className="font-bold">Reflect on an engine output</h2><label className="text-xs">Module<select className="community-input mt-1" value={module} onChange={(event) => setModule(event.target.value)}>{['Career Path Navigator','AI Career Coach','Fair Pay Engine','Smart Talent Matching','Retention Signals','Onboarding Planner','Lifelong Outcome Loop','Curriculum Engine','Readiness Profile'].map((item) => <option key={item}>{item}</option>)}</select></label><Rating label="Accuracy" value={accuracy} onChange={setAccuracy} /><Rating label="Data freshness" value={freshness} onChange={setFreshness} /><label className="text-xs">Reflection<textarea className="community-input mt-1 min-h-[80px]" value={reflection} onChange={(event) => setReflection(event.target.value)} maxLength={2000} placeholder="What was useful, missing, or misleading?" /></label><label className="text-xs">Private note<textarea className="community-input mt-1 min-h-[70px]" value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} maxLength={4000} placeholder="A note for your future self" /></label><Button disabled={busy}>{busy ? 'Saving…' : 'Save reflection'}</Button></form><section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4" aria-labelledby="history-title"><h2 id="history-title" className="font-bold">Your recent reflection history</h2><div className="mt-3 flex max-h-[520px] flex-col gap-2 overflow-y-auto">{items.map((item) => <article key={item.id} className="rounded border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3"><span className="font-mono text-[9px] uppercase text-[color:var(--text-3)]">{new Date(item.created_at).toLocaleDateString()} · {item.module}</span><p className="mt-1 text-xs">Accuracy {item.accuracy_rating}/5 · Freshness {item.freshness_rating}/5</p>{item.reflection && <p className="mt-2 text-xs text-[color:var(--text-2)]">{item.reflection}</p>}{item.private_note && <p className="mt-2 rounded bg-[color:var(--bg-base)] p-2 text-xs"><strong>Private:</strong> {item.private_note}</p>}</article>)}{!items.length && <p className="py-8 text-center text-sm text-[color:var(--text-2)]">Your saved reflections will appear here.</p>}</div></section></div>
  </div>;
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <fieldset><legend className="mb-1 text-xs">{label}</legend><div className="flex gap-1">{[1,2,3,4,5].map((number) => <button key={number} type="button" aria-label={`${label}: ${number} out of 5`} aria-pressed={value === number} onClick={() => onChange(number)} className={`h-9 w-9 rounded border text-sm ${number <= value ? 'border-[color:var(--yellow)] bg-[color:var(--accent-glow)] text-[color:var(--yellow)]' : 'border-[color:var(--border)]'}`}>{number}</button>)}</div></fieldset>; }
