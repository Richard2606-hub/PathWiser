'use client';

import { useEffect, useState } from 'react';
import { MY_STATES } from '@/lib/corpus/occupations';
import type { Persona } from '@/types';

export interface ProfileFormValues {
  name: string;
  role: string;
  education: string;
  yearsExperience: number;
  state: string;
  skills: string[];
}

const CANDIDATE_DEFAULT: ProfileFormValues = {
  name: 'Aisyah binti Rahman',
  role: 'Junior Data Analyst',
  education: "Bachelor's in Computer Science",
  yearsExperience: 3,
  state: 'Kuala Lumpur',
  skills: ['SQL', 'Python', 'Tableau', 'Excel'],
};
const EMPLOYER_DEFAULT: ProfileFormValues = {
  name: 'BoldRise Sdn Bhd',
  role: 'Data Scientist (target hire)',
  education: 'N/A',
  yearsExperience: 10,
  state: 'Kuala Lumpur',
  skills: ['Python', 'SQL', 'Machine Learning'],
};
const UNIVERSITY_DEFAULT: ProfileFormValues = {
  name: 'Universiti Teknologi Malaysia',
  role: 'BSc Computer Science',
  education: 'PhD (Programme Director)',
  yearsExperience: 18,
  state: 'Johor',
  skills: ['Java', 'Algorithms', 'Data Structures', 'SQL'],
};

const EDUCATION_OPTIONS_CANDIDATE = [
  "Bachelor's in Computer Science",
  "Bachelor's in Information Technology",
  "Bachelor's in Business Analytics",
  "Bachelor's in Engineering",
  "Master's in Data Science",
  "Diploma in Software Engineering",
];

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

  useEffect(() => {
    onValid(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const nameLabel = persona === 'employer' ? 'Company Name' : persona === 'university' ? 'University Name' : 'Your Name';
  const roleLabel = persona === 'employer' ? 'Target Hiring Role' : persona === 'university' ? 'Programme Name' : 'Current Role / Title';

  return (
    <div className="flex flex-col gap-3.5">
      <Field label={nameLabel}>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          className="form-input"
        />
      </Field>
      <Field label={roleLabel}>
        <input
          type="text"
          value={values.role}
          onChange={(e) => setValues({ ...values, role: e.target.value })}
          className="form-input"
        />
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
      <Field label="Core Skills (comma-separated)">
        <input
          type="text"
          value={values.skills.join(', ')}
          onChange={(e) =>
            setValues({ ...values, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
          }
          className="form-input"
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
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[color:var(--text-3)]">
        {label}
      </span>
      {children}
    </label>
  );
}
