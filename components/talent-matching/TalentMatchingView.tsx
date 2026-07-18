'use client';

import { useState } from 'react';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

interface Candidate {
  name: string;
  role: string;
  match: number;
  skills: string[];
  exp: string;
  flag?: 'retention_risk' | 'upskill_needed' | 'strong_fit';
  adjacent?: boolean;
  bridge?: string;
}

const CANDIDATES: Candidate[] = [
  { name: 'Nurul Aisyah', role: 'Data Engineer @ Grab MY', match: 94, skills: ['Python', 'Spark', 'Airflow', 'SQL'], exp: '4 yrs', flag: 'strong_fit' },
  { name: 'Raj Vikram', role: 'ML Scientist @ AirAsia', match: 89, skills: ['TensorFlow', 'Python', 'Statistics', 'MLOps'], exp: '5 yrs', flag: 'retention_risk' },
  { name: 'Chen Wei Lin', role: 'Analytics Lead @ Maybank', match: 82, skills: ['R', 'Tableau', 'SQL', 'Forecasting'], exp: '6 yrs' },
  { name: 'Amirah Zainal', role: 'BI Analyst @ PETRONAS', match: 78, skills: ['Power BI', 'DAX', 'Azure', 'Python'], exp: '3 yrs', flag: 'upskill_needed', adjacent: true, bridge: 'ML fundamentals · 3 months' },
  { name: 'Lee Jian Wei', role: 'Full-Stack Dev @ Shopee', match: 72, skills: ['TypeScript', 'React', 'Node.js'], exp: '4 yrs', adjacent: true, bridge: 'Python + Statistics · 4 months' },
];

const ROLE_OPTIONS = [
  { value: 'lead_ds', label: 'Lead Data Scientist' },
  { value: 'ml_eng', label: 'ML Engineer (Senior)' },
  { value: 'product_data', label: 'Product Data Analyst' },
];

export function TalentMatchingView() {
  const [role, setRole] = useState('lead_ds');
  const [skills, setSkills] = useState('Python, SQL, Machine Learning');
  const [showAdjacent, setShowAdjacent] = useState(true);
  const filtered = CANDIDATES.filter((c) => showAdjacent || !c.adjacent);

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Candidate Pool" value="12,480" />
        <StatBox label="Shape Matches" value={filtered.length} color="var(--teal)" />
        <StatBox label="Avg Match Score" value="83%" />
        <StatBox label="Retrieval Time" value="120ms" color="var(--sky)" />
      </StatGrid>

      <div className="p-3.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)] block mb-2">
          Declare Demand Vector
        </span>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--accent)]"
          >
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Required skills"
            className="flex-1 min-w-[220px] px-2.5 py-1.5 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-sm outline-none focus:border-[color:var(--accent)]"
          />
          <Button variant="primary" size="sm">Run Inverse Retrieval</Button>
        </div>
        <label className="flex items-center gap-2 mt-3 text-xs text-[color:var(--text-2)]">
          <input
            type="checkbox"
            checked={showAdjacent}
            onChange={(e) => setShowAdjacent(e.target.checked)}
          />
          Include <strong className="text-[color:var(--yellow)]">adjacent</strong> candidates (one bridge away)
        </label>
      </div>

      <Callout tone="teal">
        <strong>How this differs from a CV keyword search</strong>
        <p className="mt-1">
          Each candidate below is ranked by <em>trajectory-shape</em> similarity to the role&apos;s inflow —
          not by keyword overlap with the JD. Adjacent candidates (one bridge away) are surfaced with
          the specific skill bridge required. Each match shows reasoning, never a black-box score.
        </p>
      </Callout>

      <div className="flex flex-col gap-2.5">
        {filtered.map((c) => (
          <CandidateCard key={c.name} candidate={c} />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({ candidate: c }: { candidate: Candidate }) {
  const matchColor = c.match >= 90 ? 'var(--emerald)' : c.match >= 80 ? 'var(--yellow)' : 'var(--text-2)';

  return (
    <div
      className={cn(
        'p-3.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]',
        'hover:bg-[color:var(--bg-glass-strong)] hover:border-[color:var(--border-strong)] transition-all',
        c.adjacent && 'border-l-[3px] border-l-[color:var(--yellow)]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              {c.exp} experience
            </span>
            {c.flag === 'retention_risk' && <Pill variant="gap">⚠ retention risk</Pill>}
            {c.flag === 'upskill_needed' && <Pill variant="bridge">upskill needed</Pill>}
            {c.flag === 'strong_fit' && <Pill variant="acquired">strong fit</Pill>}
            {c.adjacent && <Pill variant="bridge">Adjacent · 1 bridge</Pill>}
          </div>
          <h3 className="text-base font-extrabold">{c.name}</h3>
          <div className="text-xs text-[color:var(--text-2)] mt-0.5">{c.role}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {c.skills.map((s) => <Pill key={s} variant="acquired">{s}</Pill>)}
          </div>
          {c.bridge && (
            <div className="mt-2 text-[11px] px-2.5 py-1.5 rounded bg-[color:var(--bg-elevated)] border-l-[3px] border-[color:var(--teal)]">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)] mr-2">
                Bridge:
              </span>
              <span className="text-[color:var(--teal)] font-semibold">{c.bridge}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div
            className="text-4xl font-black tabular-nums leading-none"
            style={{ color: matchColor }}
          >
            {c.match}%
          </div>
          <span className="font-mono text-[9px] text-[color:var(--text-3)] uppercase mt-1">
            match
          </span>
        </div>
      </div>
    </div>
  );
}
