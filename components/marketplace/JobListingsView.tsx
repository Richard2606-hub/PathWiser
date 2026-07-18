'use client';

import { useMemo, useState } from 'react';
import { JOB_LISTINGS } from '@/lib/corpus/jobs';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';
import { Callout } from '@/components/common/Callout';
import { formatMYR } from '@/lib/utils';

export function JobListingsView() {
  const [sector, setSector] = useState('all');
  const [location, setLocation] = useState('all');
  const [remote, setRemote] = useState('all');

  const sectors = Array.from(new Set(JOB_LISTINGS.map((j) => j.sector.split(' · ')[0])));
  const locations = Array.from(new Set(JOB_LISTINGS.map((j) => j.location)));

  const filtered = useMemo(
    () => JOB_LISTINGS.filter((j) => {
      if (sector !== 'all' && !j.sector.startsWith(sector)) return false;
      if (location !== 'all' && j.location !== location) return false;
      if (remote !== 'all' && j.remote !== remote) return false;
      return true;
    }),
    [sector, location, remote]
  );

  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Open Roles (24h)" value="2,847" />
        <StatBox label="Your Fit ≥ 80%" value="148" color="var(--yellow)" />
        <StatBox label="MyCOL Critical" value="312" color="var(--sky)" />
        <StatBox label="Avg. Response" value="3 days" color="var(--teal)" />
      </StatGrid>

      <div className="p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] flex flex-wrap gap-2 items-center">
        <FilterSelect label="Sector" value={sector} onChange={setSector} options={[{ v: 'all', l: 'All sectors' }, ...sectors.map((s) => ({ v: s, l: s }))]} />
        <FilterSelect label="Location" value={location} onChange={setLocation} options={[{ v: 'all', l: 'All locations' }, ...locations.map((l) => ({ v: l, l }))]} />
        <FilterSelect label="Remote" value={remote} onChange={setRemote} options={[{ v: 'all', l: 'Any' }, { v: 'Onsite', l: 'Onsite' }, { v: 'Hybrid', l: 'Hybrid' }, { v: 'Remote', l: 'Remote' }]} />
        <span className="ml-auto text-[10px] italic text-[color:var(--text-3)]">
          Ranked by trajectory fit, not keyword match
        </span>
      </div>

      {filtered.length === 0 ? (
        <Callout tone="amber">
          <strong>No matches</strong>
          <p className="mt-1">Try widening your filters — the corpus has 12 realistic openings today.</p>
        </Callout>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((j) => (
            <div
              key={j.id}
              className={`p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] hover:bg-[color:var(--bg-glass-strong)] transition-all cursor-pointer ${j.fit >= 85 ? 'border-l-[3px] border-l-[color:var(--yellow)]' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-base font-extrabold">{j.title}</span>
                  <div className="text-xs text-[color:var(--text-2)] mt-0.5">
                    {j.company} · {j.location} · {j.remote}
                  </div>
                  <div className="font-mono text-[9px] uppercase text-[color:var(--text-3)] mt-0.5">
                    {j.sector}
                  </div>
                </div>
                <FitCircle fit={j.fit} />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px]">
                <MetaChip icon="💰" text={`${formatMYR(j.salaryMin, false)} – ${formatMYR(j.salaryMax, false)}/m`} />
                <MetaChip icon="📅" text={j.exp} />
                {j.mycol && <MetaChip icon="⭐" text="MyCOL Critical" accent="var(--yellow)" />}
                <MetaChip icon="🕓" text={`Posted ${j.posted}`} muted />
              </div>

              <div className="flex flex-wrap gap-1 mt-2.5">
                {j.skills.map((s) => <Pill key={s}>{s}</Pill>)}
              </div>

              <div className="mt-2.5 text-[11px] p-2 rounded bg-[color:var(--bg-elevated)] border-l-[3px] border-[color:var(--teal)]">
                <span className="font-mono text-[9px] uppercase text-[color:var(--text-3)] mr-2">
                  Skill bridge from your shape:
                </span>
                <span className="text-[color:var(--teal)] font-semibold">{j.bridge}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FitCircle({ fit }: { fit: number }) {
  return (
    <div className="relative w-14 h-14 flex-shrink-0" aria-label={`Trajectory fit: ${fit}%`}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--yellow) ${fit}%, var(--bg-elevated) 0)`,
        }}
      />
      <div className="absolute inset-[3px] rounded-full bg-[color:var(--bg-base)] flex flex-col items-center justify-center">
        <span className="text-base font-mono font-black text-[color:var(--yellow)]">
          {fit}
        </span>
        <span className="text-[7px] font-mono uppercase text-[color:var(--text-3)]">fit</span>
      </div>
    </div>
  );
}

function MetaChip({ icon, text, accent, muted }: { icon: string; text: string; accent?: string; muted?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono border"
      style={{
        borderColor: accent || 'var(--border)',
        background: accent ? `${accent}12` : 'var(--bg-elevated)',
        color: accent || (muted ? 'var(--text-3)' : 'var(--text-2)'),
      }}
    >
      {icon} {text}
    </span>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ v: string; l: string }> }) {
  return (
    <label className="flex items-center gap-2 text-[11px]">
      <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2.5 py-1 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border)] text-xs outline-none focus:border-[color:var(--accent)]"
      >
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
