'use client';

import type { Persona } from '@/types';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { normalizeShapeInput } from '@/lib/profile/normalize';

export function EscoNormalization({
  persona,
  role,
  skills,
}: {
  persona: Persona;
  role: string;
  skills: string[];
}) {
  const normalized = normalizeShapeInput(persona, role, skills);
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
        <h4 className="text-lg font-extrabold tracking-tight mt-1">
          {normalized.matchedRole || role}
        </h4>

        {normalized.method === 'unmapped' ? (
          <Callout className="mt-3" tone="amber">
            <strong>Human confirmation needed</strong>
            <p className="mt-1">
              This role or programme is not in the maintained taxonomy slice. PathWiser will keep your
              original wording and will not invent an ESCO, O*NET, MASCO, or ISCED code.
            </p>
          </Callout>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <MetricCell
              label={persona === 'university' ? 'ISCED Code' : 'ESCO Code'}
              value={normalized.programmeCode || normalized.escoCode || 'Not mapped'}
            />
            <MetricCell label="O*NET Match" value={normalized.onetCode || 'Not applicable'} />
            <MetricCell label="MASCO Code" value={normalized.mascoCode || 'Not applicable'} />
            <MetricCell label="Match method" value={normalized.method === 'exact-taxonomy' ? 'Exact' : normalized.method === 'programme-taxonomy' ? 'Programme' : 'Token match'} />
          </div>
        )}

        <div className="mt-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Normalized Skills
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {normalized.skills.map((skill) => <Pill key={skill} variant="acquired">{skill} ✓</Pill>)}
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
