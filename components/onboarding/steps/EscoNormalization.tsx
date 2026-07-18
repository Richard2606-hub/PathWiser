'use client';

import type { Persona } from '@/types';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';

const ESCO_MAP: Record<string, { esco: string; onet: string; masco: string; confidence: number }> = {
  'Junior Data Analyst': { esco: '2511.2', onet: '15-2051.00', masco: '2120.0', confidence: 94.2 },
  'Data Analyst':        { esco: '2511.2', onet: '15-2051.00', masco: '2120.0', confidence: 96.1 },
  'Data Scientist':      { esco: '2511.1', onet: '15-2051.01', masco: '2120.1', confidence: 97.8 },
  'ML Engineer':         { esco: '2512.4', onet: '15-1252.00', masco: '2120.1', confidence: 92.4 },
  'Software Engineer':   { esco: '2512.1', onet: '15-1252.00', masco: '2120.5', confidence: 96.7 },
};

const defaultMap = { esco: '2510.9', onet: '15-2050.00', masco: '2120.9', confidence: 88.0 };

export function EscoNormalization({
  persona,
  role,
  skills,
}: {
  persona: Persona;
  role: string;
  skills: string[];
}) {
  const m = ESCO_MAP[role] || defaultMap;
  const taxonomy = persona === 'university' ? 'ISCED' : persona === 'employer' ? 'ISIC/ESCO' : 'ESCO';

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="teal">
        <strong>🔄 {taxonomy} Normalization Engine</strong>
        <p className="mt-1">
          Your profile is being normalized against {taxonomy} occupation codes and O*NET skill identifiers for standardized trajectory matching.
        </p>
      </Callout>

      <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Normalized Profile
          </span>
        </div>
        <h4 className="text-lg font-extrabold tracking-tight mt-1">{role}</h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <MetricCell label="ESCO Code" value={m.esco} />
          <MetricCell label="O*NET Match" value={m.onet} />
          <MetricCell label="MASCO Code" value={m.masco} />
          <MetricCell label="Confidence" value={`${m.confidence}%`} />
        </div>

        <div className="mt-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Normalized Skills
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.map((s) => <Pill key={s} variant="acquired">{s} ✓</Pill>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded bg-[color:var(--bg-elevated)]">
      <span className="text-[9px] text-[color:var(--text-3)] font-mono uppercase">{label}</span>
      <span className="text-xs font-bold tabular-nums">{value}</span>
    </div>
  );
}
