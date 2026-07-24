'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { findOccupation, MY_STATES, OCCUPATIONS } from '@/lib/corpus/occupations';
import { applyNormalization, normalizeShapeInput } from '@/lib/profile/normalize';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';
import { Button } from '@/components/common/Button';
import type { LifeStage, UserShape } from '@/types';

interface AccountProfile {
  user_id: string;
  persona: UserShape['persona'];
  role_title: string;
  education: string | null;
  years_experience: number;
  state: string | null;
  skills: string[];
  life_stage: LifeStage;
  esco_code?: string | null;
  onet_code?: string | null;
  masco_code?: string | null;
  work_animal?: UserShape['work_animal'] | null;
  dimensions?: UserShape['dimensions'];
  display_name?: string | null;
  profile_summary?: string | null;
  embedding_saved?: boolean;
  updated_at?: string;
}

const LIFE_STAGES: Array<{ value: LifeStage; label: string }> = [
  { value: 'student', label: 'Student · 13-17' },
  { value: 'young_adult', label: 'Young adult · 18-22' },
  { value: 'early_career', label: 'Early career · 23-34' },
  { value: 'mid_career', label: 'Mid-career · 35-44' },
  { value: 'senior_career', label: 'Senior career · 45-54' },
  { value: 'executive', label: 'Executive and beyond · 55+' },
];

export function UserProfileView() {
  const storedShape = useAppStore((state) => state.shape) || DEMO_PERSONAS.aisyah.shape;
  const identity = useAppStore((state) => state.identity);
  const setShape = useAppStore((state) => state.setShape);
  const setIdentity = useAppStore((state) => state.setIdentity);
  const showToast = useAppStore((state) => state.showToast);
  const [draft, setDraft] = useState<UserShape>(storedShape);
  const [displayName, setDisplayName] = useState(identity.name === 'You' ? '' : identity.name);
  const [summary, setSummary] = useState('');
  const [accountState, setAccountState] = useState<'loading' | 'connected' | 'device'>('loading');
  const [hasEmbedding, setHasEmbedding] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/profile');
        if (response.status === 401) {
          if (!cancelled) setAccountState('device');
          return;
        }
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Profile service unavailable.');
        const profile = body.profile as AccountProfile;
        const nextShape: UserShape = {
          userId: profile.user_id,
          persona: profile.persona,
          role: profile.role_title,
          education: profile.education || '',
          years_experience: profile.years_experience,
          state: profile.state || '',
          skills: profile.skills || [],
          life_stage: profile.life_stage,
          esco_code: profile.esco_code || undefined,
          onet_code: profile.onet_code || undefined,
          masco_code: profile.masco_code || undefined,
          work_animal: profile.work_animal || undefined,
          dimensions: profile.dimensions,
        };
        if (cancelled) return;
        setDraft(nextShape);
        setShape(nextShape);
        setDisplayName(profile.display_name || '');
        setSummary(profile.profile_summary || '');
        setHasEmbedding(Boolean(profile.embedding_saved));
        setUpdatedAt(profile.updated_at || null);
        setAccountState('connected');
        if (profile.display_name) setIdentity({ name: profile.display_name, role: profile.persona });
      } catch {
        if (!cancelled) setAccountState('device');
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [setIdentity, setShape]);

  const normalization = useMemo(
    () => normalizeShapeInput(draft.persona, draft.role, draft.skills),
    [draft.persona, draft.role, draft.skills],
  );
  const matchingOccupation = findOccupation(normalization.matchedRole || draft.role);
  const suggestions = (matchingOccupation?.typical_skills || []).filter(
    (skill) => !draft.skills.some((current) => current.toLowerCase() === skill.toLowerCase()),
  );
  const missing = [
    !displayName.trim() && 'display name',
    !draft.role.trim() && 'role or programme',
    !draft.education.trim() && 'education or organisation context',
    !draft.state.trim() && 'location',
    !draft.skills.length && 'at least one skill',
  ].filter(Boolean) as string[];

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (missing.length) {
      showToast(`Complete ${missing.join(', ')} before saving.`, 'warn');
      return;
    }
    setSaving(true);
    const normalized = applyNormalization(draft);
    setDraft(normalized);
    setShape(normalized);
    setIdentity({ name: displayName.trim(), role: normalized.persona });
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...normalized,
          display_name: displayName.trim(),
          profile_summary: summary.trim(),
        }),
      });
      const body = await response.json();
      if (response.status === 401) {
        setAccountState('device');
        showToast('Profile saved on this device. Sign in to sync it across devices.', 'info');
        return;
      }
      if (!response.ok) throw new Error(body.message || 'Profile could not be synced.');
      setAccountState('connected');
      setHasEmbedding(Boolean(body.embedding_saved));
      setUpdatedAt(body.updated_at || new Date().toISOString());
      showToast('Profile and retrieval shape saved to your account.', 'success');
    } catch (error) {
      setAccountState('device');
      showToast(
        `Profile saved on this device; account sync is unavailable: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
        'warn',
      );
    } finally {
      setSaving(false);
    }
  };

  const addSuggestedSkill = (skill: string) => {
    setDraft((current) => ({ ...current, skills: [...current.skills, skill] }));
  };

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="teal">
        <strong>Your reusable Career Shape</strong>
        <p className="mt-1">
          This is the profile every PathWiser module uses. Suggestions are never committed
          automatically: you review and confirm changes before they affect retrieval.
        </p>
      </Callout>

      <StatGrid cols={4}>
        <StatBox
          label="Profile status"
          value={missing.length ? `${missing.length} prompt${missing.length === 1 ? '' : 's'}` : 'Ready'}
          color={missing.length ? 'var(--amber)' : 'var(--emerald)'}
        />
        <StatBox
          label="Taxonomy"
          value={normalization.method === 'unmapped' ? 'Needs review' : normalization.programmeCode || normalization.escoCode || 'Mapped'}
        />
        <StatBox
          label="Retrieval vector"
          value={hasEmbedding ? 'Provider embedding' : 'Local feature vector'}
          color="var(--sky)"
        />
        <StatBox
          label="Saved to"
          value={accountState === 'loading' ? 'Checking…' : accountState === 'connected' ? 'Your account' : 'This device'}
          color="var(--teal)"
        />
      </StatGrid>

      <form onSubmit={save} className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={draft.persona === 'candidate' ? 'Display name' : 'Organisation name'}>
              <input
                className="community-input"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={120}
                required
              />
            </Field>
            <Field label={draft.persona === 'university' ? 'Programme' : draft.persona === 'employer' ? 'Target role' : 'Current role'}>
              <input
                className="community-input"
                value={draft.role}
                onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                list="pathwiser-occupations"
                maxLength={160}
                required
              />
              <datalist id="pathwiser-occupations">
                {OCCUPATIONS.map((occupation) => (
                  <option key={occupation.role} value={occupation.role} />
                ))}
              </datalist>
            </Field>
            <Field label="Education or context">
              <input
                className="community-input"
                value={draft.education}
                onChange={(event) => setDraft({ ...draft, education: event.target.value })}
                maxLength={240}
                required
              />
            </Field>
            <Field label="Location">
              <select
                className="community-input"
                value={draft.state}
                onChange={(event) => setDraft({ ...draft, state: event.target.value })}
              >
                {MY_STATES.map((state) => <option key={state}>{state}</option>)}
              </select>
            </Field>
            <Field label="Years of experience">
              <input
                className="community-input"
                type="number"
                min={0}
                max={60}
                value={draft.years_experience}
                onChange={(event) => setDraft({ ...draft, years_experience: Number(event.target.value) })}
              />
            </Field>
            <Field label="Life stage">
              <select
                className="community-input"
                value={draft.life_stage}
                onChange={(event) => setDraft({ ...draft, life_stage: event.target.value as LifeStage })}
              >
                {LIFE_STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
              </select>
            </Field>
          </div>
          <Field className="mt-3" label="Skills · comma separated">
            <textarea
              className="community-input min-h-[86px]"
              value={draft.skills.join(', ')}
              onChange={(event) => setDraft({
                ...draft,
                skills: event.target.value.split(',').map((skill) => skill.trim()).filter(Boolean),
              })}
              maxLength={2000}
            />
          </Field>
          <Field className="mt-3" label="Decision context">
            <textarea
              className="community-input min-h-[86px]"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              maxLength={800}
              placeholder="What decision, hiring need, or programme question should this profile support?"
            />
          </Field>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button disabled={saving}>{saving ? 'Saving and refreshing shape…' : 'Save profile'}</Button>
            {updatedAt && (
              <span className="text-[11px] text-[color:var(--text-3)]">
                Last account sync {new Date(updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-3">
          <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Normalization preview
            </span>
            <h3 className="mt-1 font-extrabold">{normalization.matchedRole || draft.role || 'Unmapped profile'}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Metric label={draft.persona === 'university' ? 'ISCED' : 'ESCO'} value={normalization.programmeCode || normalization.escoCode || 'Needs review'} />
              <Metric label="O*NET" value={normalization.onetCode || 'Not applicable'} />
              <Metric label="MASCO" value={normalization.mascoCode || 'Not applicable'} />
              <Metric label="Method" value={normalization.method.replaceAll('-', ' ')} />
            </div>
            {normalization.method === 'unmapped' && (
              <p className="mt-3 text-xs text-[color:var(--amber)]">
                PathWiser keeps your wording and leaves taxonomy identifiers empty instead of inventing a match.
              </p>
            )}
          </section>

          <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
            <h3 className="font-bold">Review suggested skills</h3>
            <p className="mt-1 text-xs text-[color:var(--text-2)]">
              These come from the maintained occupation taxonomy. Add only skills you actually have.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestions.slice(0, 8).map((skill) => (
                <button key={skill} type="button" onClick={() => addSuggestedSkill(skill)}>
                  <Pill variant="bridge">+ {skill}</Pill>
                </button>
              ))}
              {!suggestions.length && <span className="text-xs text-[color:var(--text-3)]">No unconfirmed suggestions.</span>}
            </div>
          </section>

          {missing.length > 0 && (
            <Callout tone="amber">
              <strong>Complete when convenient</strong>
              <p className="mt-1">
                Add {missing.join(', ')}. You can still explore PathWiser while the profile is incomplete.
              </p>
            </Callout>
          )}
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-[color:var(--bg-elevated)] p-2">
      <span className="block font-mono text-[9px] uppercase text-[color:var(--text-3)]">{label}</span>
      <strong className="text-xs capitalize">{value}</strong>
    </div>
  );
}
