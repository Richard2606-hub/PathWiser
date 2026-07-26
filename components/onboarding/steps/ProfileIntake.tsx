'use client';

import { useEffect, useMemo, useState } from 'react';
import { MY_STATES, OCCUPATIONS } from '@/lib/corpus/occupations';
import type { Persona } from '@/types';

export interface ProfileFormValues {
  name: string;
  role: string;
  education: string;
  yearsExperience: number;
  state: string;
  skills: string[];
  context: string;
}

const CANDIDATE_DEFAULT: ProfileFormValues = {
  name: '',
  role: '',
  education: "Bachelor's in Computer Science",
  yearsExperience: 1,
  state: 'Kuala Lumpur',
  skills: [],
  context: '',
};
const EMPLOYER_DEFAULT: ProfileFormValues = {
  name: '',
  role: '',
  education: 'N/A',
  yearsExperience: 3,
  state: 'Kuala Lumpur',
  skills: [],
  context: '',
};
const UNIVERSITY_DEFAULT: ProfileFormValues = {
  name: '',
  role: '',
  education: 'N/A',
  yearsExperience: 3,
  state: 'Kuala Lumpur',
  skills: [],
  context: '',
};

const EDUCATION_OPTIONS_CANDIDATE = [
  "Bachelor's in Computer Science",
  "Bachelor's in Information Technology",
  "Bachelor's in Business Analytics",
  "Bachelor's in Engineering",
  "Master's in Data Science",
  "Diploma in Software Engineering",
];

const ALL_ROLES = Array.from(new Set(OCCUPATIONS.map((o) => o.role))).sort((a, b) => a.localeCompare(b));

type FieldKey = 'name' | 'role' | 'skills';

export function ProfileIntake({
  persona,
  initial,
  onValid,
}: {
  persona: Persona;
  initial: ProfileFormValues | null;
  onValid: (v: ProfileFormValues) => void;
}) {
  const defaults =
    persona === 'employer' ? EMPLOYER_DEFAULT :
    persona === 'university' ? UNIVERSITY_DEFAULT : CANDIDATE_DEFAULT;

  const [values, setValues] = useState<ProfileFormValues>(initial || defaults);
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({ name: false, role: false, skills: false });

  useEffect(() => {
    onValid(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const nameLabel = persona === 'employer' ? 'Company Name' : persona === 'university' ? 'University Name' : 'Your Name';
  const roleLabel = persona === 'employer' ? 'Target Hiring Role' : persona === 'university' ? 'Programme Name' : 'Current Role / Title';
  const skillsLabel = persona === 'employer' ? 'Required Skills (comma-separated)' : persona === 'university' ? 'Core Curriculum Skills (comma-separated)' : 'Core Skills (comma-separated)';

  const errors = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (values.name.trim().length < 2) e.name = `${nameLabel} is required (at least 2 characters).`;
    if (values.role.trim().length < 2) e.role = `${roleLabel} is required.`;
    if (values.skills.length === 0) e.skills = 'Add at least one skill so we can match a relevant cohort.';
    else if (values.skills.length > 50) e.skills = 'Please keep it under 50 skills.';
    return e;
  }, [values, nameLabel, roleLabel]);

  const markTouched = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));
  const showError = (key: FieldKey) => touched[key] && errors[key];

  const roleKnown = values.role.trim().length >= 2 &&
    OCCUPATIONS.some((o) => o.role.toLowerCase() === values.role.trim().toLowerCase());

  return (
    <div className="flex flex-col gap-3.5">
      <Field label={nameLabel} error={showError('name') ? errors.name : undefined}>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          onBlur={() => markTouched('name')}
          aria-invalid={Boolean(showError('name'))}
          required
          className="form-input"
        />
      </Field>
      <Field
        label={roleLabel}
        error={showError('role') ? errors.role : undefined}
        hint={persona === 'candidate' && values.role.trim().length >= 2 && !roleKnown ? "We'll match this to the closest occupation in our taxonomy." : undefined}
      >
        <input
          type="text"
          value={values.role}
          onChange={(e) => setValues({ ...values, role: e.target.value })}
          onBlur={() => markTouched('role')}
          aria-invalid={Boolean(showError('role'))}
          required
          list={persona === 'candidate' ? 'pw-role-options' : undefined}
          placeholder={persona === 'candidate' ? 'Start typing e.g. Staff Nurse, Electrician, Data Analyst…' : undefined}
          className="form-input"
        />
        {persona === 'candidate' && (
          <datalist id="pw-role-options">
            {ALL_ROLES.map((r) => <option key={r} value={r} />)}
          </datalist>
        )}
      </Field>
      {persona === 'candidate' && (
        <Field label="Education">
          <select
            value={values.education}
            onChange={(e) => setValues({ ...values, education: e.target.value })}
            className="form-input"
          >
            {EDUCATION_OPTIONS_CANDIDATE.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Years of Experience">
          <select
            value={values.yearsExperience}
            onChange={(e) => setValues({ ...values, yearsExperience: parseInt(e.target.value, 10) })}
            className="form-input"
          >
            <option value="1">1–2 years</option>
            <option value="3">3–5 years</option>
            <option value="6">6–10 years</option>
            <option value="12">10+ years</option>
          </select>
        </Field>
        <Field label="State / Region">
          <select
            value={values.state}
            onChange={(e) => setValues({ ...values, state: e.target.value })}
            className="form-input"
          >
            {MY_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field
        label={skillsLabel}
        error={showError('skills') ? errors.skills : undefined}
        hint={!showError('skills') ? `${values.skills.length} skill${values.skills.length === 1 ? '' : 's'} added` : undefined}
      >
        <input
          type="text"
          value={values.skills.join(', ')}
          onChange={(e) =>
            setValues({ ...values, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
          }
          onBlur={() => markTouched('skills')}
          aria-invalid={Boolean(showError('skills'))}
          placeholder="e.g. SQL, Communication, Patient Care"
          className="form-input"
        />
      </Field>
      <Field label={persona === 'employer' ? 'Hiring and support context' : persona === 'university' ? 'Programme outcome and consortium context' : 'Career goal and decision context'}>
        <textarea
          value={values.context}
          onChange={(event) => setValues({ ...values, context: event.target.value })}
          className="form-input min-h-[78px] resize-y"
          maxLength={800}
        />
      </Field>

      <style jsx>{`
        .form-input {
          padding: 10px 12px;
          border-radius: 6px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-1);
          font-family: var(--sans);
          font-size: 13px;
          width: 100%;
          transition: border 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .form-input[aria-invalid='true'] {
          border-color: var(--rose);
        }
      `}</style>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--text-3)]">
        {label}
      </span>
      {children}
      {error
        ? <span className="text-[11px] font-medium text-[color:var(--rose)]" role="alert">{error}</span>
        : hint
          ? <span className="text-[11px] text-[color:var(--text-3)]">{hint}</span>
          : null}
    </label>
  );
}
