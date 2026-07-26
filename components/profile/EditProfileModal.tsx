'use client';

import { FormEvent, useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ClosableOverlay, CloseButton } from '@/components/common/ClosableOverlay';
import { Button } from '@/components/common/Button';
import { MY_STATES, findOccupation } from '@/lib/corpus/occupations';
import { applyNormalization, normalizeShapeInput } from '@/lib/profile/normalize';
import { createClient } from '@/lib/supabase/client';
import type { LifeStage, Persona, UserShape } from '@/types';

const LIFE_STAGES: Array<{ value: LifeStage; label: string }> = [
  { value: 'student', label: 'Student · 13-17' },
  { value: 'young_adult', label: 'Young adult · 18-22' },
  { value: 'early_career', label: 'Early career · 23-34' },
  { value: 'mid_career', label: 'Mid-career · 35-44' },
  { value: 'senior_career', label: 'Senior career · 45-54' },
  { value: 'executive', label: 'Executive and beyond · 55+' },
];

const DELETE_CONFIRMATION = 'DELETE MY PATHWISER ACCOUNT';

function clearPathWiserDeviceData() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith('pathwiser-')) storage.removeItem(key);
    }
  }
}

export function EditProfileModal() {
  const router = useRouter();
  const open = useAppStore((s) => s.editProfileOpen);
  const closeEditProfile = useAppStore((s) => s.closeEditProfile);
  const storedShape = useAppStore((s) => s.shape);
  const identity = useAppStore((s) => s.identity);
  const setShape = useAppStore((s) => s.setShape);
  const setIdentity = useAppStore((s) => s.setIdentity);
  const showToast = useAppStore((s) => s.showToast);

  const [persona, setPersona] = useState<Persona>(storedShape?.persona || 'candidate');
  const [displayName, setDisplayName] = useState(identity.name === 'You' ? '' : identity.name);
  const [roleTitle, setRoleTitle] = useState(storedShape?.role || 'Junior Data Analyst');
  const [education, setEducation] = useState(storedShape?.education || '');
  const [yearsExperience, setYearsExperience] = useState<number>(storedShape?.years_experience || 0);
  const [stateLoc, setStateLoc] = useState(storedShape?.state || 'Kuala Lumpur');
  const [skills, setSkills] = useState<string[]>(storedShape?.skills || []);
  const [lifeStage, setLifeStage] = useState<LifeStage>(storedShape?.life_stage || 'early_career');
  const [summary, setSummary] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (!open) return;
    async function loadRemote() {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const body = await response.json();
          if (body.profile) {
            const p = body.profile;
            setPersona(p.persona || 'candidate');
            setDisplayName(p.display_name || identity.name || '');
            setRoleTitle(p.role_title || 'Junior Data Analyst');
            setEducation(p.education || '');
            setYearsExperience(p.years_experience || 0);
            setStateLoc(p.state || 'Kuala Lumpur');
            setSkills(p.skills || []);
            setLifeStage(p.life_stage || 'early_career');
            setSummary(p.profile_summary || '');
          }
        }
      } catch {
        // Fall back to current store state
      }
    }
    void loadRemote();
  }, [open, identity.name]);

  const normalization = useMemo(
    () => normalizeShapeInput(persona, roleTitle, skills),
    [persona, roleTitle, skills],
  );
  const matchingOccupation = findOccupation(normalization.matchedRole || roleTitle);
  const suggestions = (matchingOccupation?.typical_skills || []).filter(
    (s) => !skills.some((c) => c.toLowerCase() === s.toLowerCase()),
  );

  const addSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`"${trimmed}" is already in your skill list.`, 'info');
      return;
    }
    setSkills((current) => [...current, trimmed]);
    setNewSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((current) => current.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName.trim()) {
      showToast('Please enter a display name.', 'warn');
      return;
    }
    if (!roleTitle.trim()) {
      showToast('Please enter your current role or program.', 'warn');
      return;
    }

    setSaving(true);
    const draftShape: UserShape = {
      userId: storedShape?.userId || `user-${crypto.randomUUID()}`,
      persona,
      role: roleTitle.trim(),
      education: education.trim(),
      years_experience: Number(yearsExperience) || 0,
      state: stateLoc,
      skills,
      life_stage: lifeStage,
      work_animal: storedShape?.work_animal,
      dimensions: storedShape?.dimensions,
    };

    const normalized = applyNormalization(draftShape);
    setShape(normalized);
    setIdentity({ name: displayName.trim(), role: persona });

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
      if (response.ok) {
        showToast('Your profile was updated successfully!', 'success');
      } else {
        showToast('Profile saved to local device.', 'info');
      }
    } catch {
      showToast('Profile saved to local device.', 'info');
    } finally {
      setSaving(false);
      closeEditProfile();
    }
  };

  const handleDeleteAccount = async () => {
    if (deletePhrase !== DELETE_CONFIRMATION) return;
    setDeleteBusy(true);
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deletePhrase }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Account deletion failed.');
      
      clearPathWiserDeviceData();
      await createClient().auth.signOut({ scope: 'local' });
      showToast('Your account has been deleted.', 'info');
      closeEditProfile();
      window.location.assign('/');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Account deletion failed.', 'error');
      setDeleteBusy(false);
    }
  };

  return (
    <ClosableOverlay open={open} onClose={closeEditProfile} contentClassName="max-w-2xl">
      <div className="flex items-center justify-between border-b border-[color:var(--border)] p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-2)]">
            Update your profile details directly without restarting initial onboarding.
          </p>
        </div>
        <CloseButton onClick={closeEditProfile} />
      </div>

      <form onSubmit={handleSave} className="max-h-[75vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Identity & Role */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Display Name
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Aisyah Rahman"
                className="community-input"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold">
              Current Role / Target Title
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Junior Data Analyst"
                className="community-input"
              />
            </label>
          </div>

          {/* Persona selector */}
          <fieldset>
            <legend className="mb-1 text-xs font-semibold">Account Role Type</legend>
            <div className="grid grid-cols-3 gap-2">
              {(['candidate', 'employer', 'university'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={persona === p}
                  onClick={() => setPersona(p)}
                  className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-bold capitalize transition-colors ${
                    persona === p
                      ? 'border-[color:var(--yellow)] bg-[color:var(--accent-glow)] text-[color:var(--yellow)]'
                      : 'border-[color:var(--border)] bg-white text-[color:var(--text-2)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Education & Experience */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Education / Institution Context
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Sc Computer Science · UTM"
                className="community-input"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold">
              Years of Experience
              <input
                type="number"
                min={0}
                max={40}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="community-input"
              />
            </label>
          </div>

          {/* Location & Life Stage */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Location (State)
              <select
                value={stateLoc}
                onChange={(e) => setStateLoc(e.target.value)}
                className="community-input"
              >
                {MY_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold">
              Life Stage
              <select
                value={lifeStage}
                onChange={(e) => setLifeStage(e.target.value as LifeStage)}
                className="community-input"
              >
                {LIFE_STAGES.map((ls) => (
                  <option key={ls.value} value={ls.value}>
                    {ls.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Skills Management */}
          <div className="flex flex-col gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3">
            <label className="text-xs font-semibold">Skills & Competencies</label>
            
            {/* Active Skills Badges */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
              {skills.length === 0 ? (
                <span className="text-xs text-[color:var(--text-3)]">No skills added yet.</span>
              ) : (
                skills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-glow)] px-2.5 py-1 font-mono text-xs font-semibold text-[color:var(--accent)]"
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => removeSkill(sk)}
                      className="hover:opacity-75 focus-visible:outline-none"
                      aria-label={`Remove skill ${sk}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Input to add skill */}
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(newSkillInput);
                  }
                }}
                placeholder="Type skill & press Enter or click Add"
                className="community-input text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => addSkill(newSkillInput)}>
                Add
              </Button>
            </div>

            {/* Suggested taxonomy skills */}
            {suggestions.length > 0 && (
              <div className="mt-2 border-t border-[color:var(--border)] pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--text-3)]">
                  Suggested for {matchingOccupation?.role || roleTitle}:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {suggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="rounded-full border border-[color:var(--border)] bg-white px-2 py-0.5 text-[10px] font-medium text-[color:var(--text-2)] hover:border-[color:var(--yellow)] hover:text-[color:var(--yellow)]"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Summary */}
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Profile Bio / Career Summary
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of your professional goals, interests, or background..."
              className="community-input"
            />
          </label>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-4">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"
          >
            🗑️ Delete Account
          </button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={closeEditProfile}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Account Modal Confirmation */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-red-600">Delete PathWiser Account</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              This action is permanent and irreversible. Your authenticated identity, profile, and account data will be permanently deleted.
            </p>
            <p className="mt-3 text-xs font-bold text-slate-800">
              Type <span className="font-mono text-red-600 font-extrabold">{DELETE_CONFIRMATION}</span> below to confirm:
            </p>

            <input
              type="text"
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              placeholder={DELETE_CONFIRMATION}
              className="community-input mt-2 font-mono text-xs text-red-600"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setDeleteOpen(false); setDeletePhrase(''); }}>
                Cancel
              </Button>
              <button
                type="button"
                disabled={deletePhrase !== DELETE_CONFIRMATION || deleteBusy}
                onClick={handleDeleteAccount}
                className="min-h-9 rounded-lg bg-red-600 px-4 text-xs font-bold text-white transition-opacity disabled:opacity-50 hover:bg-red-700"
              >
                {deleteBusy ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClosableOverlay>
  );
}
