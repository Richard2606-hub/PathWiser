'use client';

import { useState, useMemo, useEffect } from 'react';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { formatMYR } from '@/lib/utils';
import { navigate } from '@/lib/engine/client';
import { useAppStore } from '@/store/useAppStore';

const ROLES = ['Software Engineer', 'Data Analyst', 'Data Scientist', 'Product Manager'];
const LOCATIONS = ['Kuala Lumpur', 'Selangor', 'Penang', 'Johor'];

export function FairPayView() {
  const showToast = useAppStore((s) => s.showToast);
  const [role, setRole] = useState('Software Engineer');
  const [salary, setSalary] = useState(5500);
  const [location, setLocation] = useState('Kuala Lumpur');
  const [experience, setExperience] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const [b, setB] = useState({ p10: 3500, p25: 4800, median: 6200, p75: 8500, p90: 12000, name: 'Software Engineer' });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await navigate({
          userId: 'anon',
          persona: 'candidate',
          role: role,
          education: "Bachelor's Degree",
          years_experience: experience,
          state: location,
          skills: [],
          life_stage: 'early_career',
        }, { currentStepIndex: -1 });

        if ('aggregate' in res && res.aggregate?.salary_percentiles_by_role && res.aggregate.salary_percentiles_by_role[role]) {
          const stats = res.aggregate.salary_percentiles_by_role[role];
          setB({
            p10: stats.p10 || b.p10,
            p25: stats.p25 || b.p25,
            median: stats.median || b.median,
            p75: stats.p75 || b.p75,
            p90: stats.p90 || b.p90,
            name: role,
          });
        }
      } catch (err: any) {
        console.error(err);
        showToast(`Engine API Error: ${err.message || 'Failed to fetch salary data.'}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [role, location, experience]);

  const pct = useMemo(() => {
    const range = b.p90 - b.p10;
    if (range === 0) return 50;
    return Math.max(0, Math.min(100, ((salary - b.p10) / range) * 100));
  }, [salary, b]);

  const percentileLabel = useMemo(() => {
    if (salary <= b.p10) return 'P10';
    if (salary <= b.p25) return 'P25';
    if (salary <= b.median) return 'P50';
    if (salary <= b.p75) return 'P75';
    if (salary <= b.p90) return 'P90';
    return 'P90+';
  }, [salary, b]);

  const verdict =
    salary < b.p25 ? 'Below Market' :
    salary < b.median ? 'Approaching Median' :
    salary < b.p75 ? 'At Market Rate' :
    'Above Market';

  const verdictColor =
    salary < b.p25 ? 'var(--rose)' :
    salary < b.p75 ? 'var(--yellow)' :
    'var(--emerald)';

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Your Salary" value={formatMYR(salary, false)} />
        <StatBox label="Percentile" value={percentileLabel} />
        <StatBox label="Market Median" value={isLoading ? '...' : formatMYR(b.median, false)} color="var(--teal)" />
        <StatBox label="Gap to Median" value={`${salary >= b.median ? '+' : ''}${isLoading ? '...' : formatMYR(salary - b.median, false)}`} color={salary >= b.median ? 'var(--emerald)' : 'var(--rose)'} />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-3 p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <Field label="Occupation">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="fp-input">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Current Monthly Salary (RM)">
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(parseInt(e.target.value, 10) || 0)}
              min={0}
              max={100000}
              step={100}
              className="fp-input"
            />
          </Field>
          <Field label="State / Region">
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="fp-input">
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Years of Experience">
            <select value={experience} onChange={(e) => setExperience(parseInt(e.target.value, 10))} className="fp-input">
              <option value="1">1–2 years</option>
              <option value="3">3–5 years</option>
              <option value="6">6–10 years</option>
              <option value="12">10+ years</option>
            </select>
          </Field>
          <style jsx>{`
            .fp-input {
              width: 100%;
              padding: 8px 10px;
              border-radius: 6px;
              background: var(--bg-elevated);
              border: 1px solid var(--border);
              color: var(--text-1);
              font-size: 13px;
              outline: none;
            }
            .fp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
          `}</style>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                  DOSM Calibrated Wage Percentile
                </span>
                <h3 className="text-base font-extrabold mt-0.5">
                  {formatMYR(salary, false)} — {b.name}
                </h3>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: `${verdictColor}20`, color: verdictColor, border: `1px solid ${verdictColor}` }}
              >
                {verdict}
              </span>
            </div>

            {/* Percentile track */}
            <div className="relative h-3 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
              <div
                className="absolute h-full transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--rose), var(--yellow), var(--emerald))` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg transition-[left] duration-500"
                style={{ left: `calc(${pct}% - 6px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[color:var(--text-3)] mt-2 tabular-nums">
              <span>P10 · {formatMYR(b.p10, false)}</span>
              <span>P25</span>
              <span>Median</span>
              <span>P75</span>
              <span>P90 · {formatMYR(b.p90, false)}</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mt-4">
              {(['p10', 'p25', 'median', 'p75', 'p90'] as const).map((k) => (
                <div key={k} className="p-2 rounded bg-[color:var(--bg-elevated)] border border-[color:var(--border)] flex flex-col">
                  <span className="font-mono text-[8px] uppercase text-[color:var(--text-3)]">{k.toUpperCase()}</span>
                  <span className="text-xs font-bold tabular-nums">{formatMYR(b[k], false)}</span>
                </div>
              ))}
            </div>
          </div>

          <Callout tone={salary >= b.median ? 'emerald' : 'amber'}>
            <strong>Verdict: {verdict}</strong>
            <p className="mt-1">
              Your salary of {formatMYR(salary)} falls at approximately the <strong>{percentileLabel}</strong> mark for this occupation, location, and experience level.{' '}
              {salary < b.median
                ? 'Consider using this data in your next compensation discussion.'
                : 'You are competitively positioned within your cohort.'}
            </p>
          </Callout>

          <Callout>
            <strong>Calibration Sources</strong>
            <ul className="mt-2 space-y-1 text-[11px]">
              <li>📊 <strong>DOSM</strong> — Salaries & Wages Survey Report 2024 (CC-BY-4.0)</li>
              <li>📋 <strong>Michael Page MY</strong> — Salary Guide (headline anchors)</li>
              <li>📋 <strong>Hays Asia</strong> — Salary Guide (headline anchors)</li>
              <li>📋 <strong>Robert Walters MY</strong> — Salary Survey (headline anchors)</li>
              <li>🏛️ <strong>TalentCorp</strong> — MyMahir Critical Occupations List</li>
            </ul>
          </Callout>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">{label}</span>
      {children}
    </label>
  );
}
