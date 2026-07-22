'use client';

import { useEffect, useState } from 'react';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { useAppStore } from '@/store/useAppStore';

const FLOWS = [
  { type: 'trajectory_contribution', label: 'Trajectory contribution', description: 'Allow anonymised outcomes to strengthen cohorts.' },
  { type: 'employer_discovery', label: 'Employer discovery', description: 'Allow authenticated employer members to discover your capability profile.' },
  { type: 'programme_outcomes', label: 'Programme outcomes', description: 'Allow anonymised inclusion in your approved programme cohort.' },
  { type: 'research', label: 'Anonymised research', description: 'Allow reviewed, aggregate research use.' },
] as const;

export function SecurityView() {
  const showToast = useAppStore((state) => state.showToast);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [account, setAccount] = useState<'loading'|'connected'|'preview'>('loading');
  useEffect(() => { void fetch('/api/consent').then(async (response) => ({ response, body: await response.json() })).then(({ response, body }) => { if (response.status === 401) { setAccount('preview'); return; } if (!response.ok) throw new Error(); setAccount('connected'); const active: Record<string, boolean> = {}; body.consents.forEach((item: { consent_type: string; revoked_at: string | null }) => { active[item.consent_type] = !item.revoked_at; }); setConsents(active); }).catch(() => setAccount('preview')); }, []);
  const update = async (type: string, enabled: boolean) => { const previous = consents[type] || false; setConsents((current) => ({ ...current, [type]: enabled })); try { const response = await fetch('/api/consent', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, enabled }) }); if (response.status === 401) { setConsents((current) => ({ ...current, [type]: previous })); showToast('Sign in to manage persistent consent.', 'warn'); return; } if (!response.ok) throw new Error('Consent update failed.'); showToast(enabled ? 'Consent granted. You can revoke it at any time.' : 'Consent revoked.', 'success'); } catch (error) { setConsents((current) => ({ ...current, [type]: previous })); showToast(error instanceof Error ? error.message : 'Consent update failed.', 'error'); } };
  return <div className="flex flex-col gap-4"><StatGrid cols={4}><StatBox label="Account session" value={account === 'connected' ? 'Authenticated' : account === 'loading' ? 'Checking…' : 'Preview'} /><StatBox label="Active consents" value={Object.values(consents).filter(Boolean).length.toString()} color="var(--teal)" /><StatBox label="Minimum cohort" value="50" color="var(--violet)" /><StatBox label="Consent model" value="Revocable" color="var(--sky)" /></StatGrid><Callout tone="teal"><strong>Privacy controls are enforced by the data layer</strong><p className="mt-1">Account-owned profiles use row-level security. Employer discovery requires authentication, employer organisation membership, discoverability, and explicit active consent. Public modelled trajectories contain no real identities.</p></Callout><section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4"><h2 className="font-bold">Your consent choices</h2><p className="mt-1 text-xs text-[color:var(--text-2)]">Nothing is enabled by default. Revocation takes effect immediately for future access.</p><div className="mt-4 flex flex-col gap-2">{FLOWS.map((flow) => <label key={flow.type} className="flex items-start justify-between gap-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3"><span><strong className="text-sm">{flow.label}</strong><span className="mt-1 block text-xs text-[color:var(--text-2)]">{flow.description}</span></span><span className="flex items-center gap-2"><Pill variant={consents[flow.type] ? 'acquired' : 'default'}>{consents[flow.type] ? 'Enabled' : 'Private'}</Pill><input type="checkbox" checked={consents[flow.type] || false} onChange={(event) => void update(flow.type, event.target.checked)} aria-label={`${flow.label} consent`} /></span></label>)}</div></section></div>;
}
