'use client';

import { COMPANIES } from '@/lib/corpus/companies';
import { SDG_META } from '@/lib/corpus/sdgs';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';

export function CompanyDirectoryView() {
  return (
    <div className="flex flex-col gap-4">
      <StatGrid cols={4}>
        <StatBox label="Employer Network" value="10,400+" />
        <StatBox label="MyCOL Employers" value="842" color="var(--yellow)" />
        <StatBox label="Actively Hiring" value="3,120" color="var(--emerald)" />
        <StatBox label="Coverage" value="MY + SG + ID" color="var(--sky)" />
      </StatGrid>

      <div className="grid gap-2.5">
        {COMPANIES.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] hover:bg-[color:var(--bg-glass-strong)] transition-all cursor-pointer flex gap-4"
          >
            <div className="text-4xl w-14 h-14 rounded bg-[color:var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
              {c.logo}
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div>
                <span className="text-base font-extrabold">{c.name}</span>
                <div className="font-mono text-[9px] uppercase text-[color:var(--text-3)] mt-0.5">
                  {c.sector}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-1">
                <Meta label="Headcount" value={c.headcount} />
                <Meta label="Hires/yr" value={c.hires} />
                <Meta label="Retention" value={`${c.retention}%`} color={c.retention >= 85 ? 'var(--emerald)' : c.retention >= 75 ? 'var(--yellow)' : 'var(--rose)'} />
                <Meta label="MyCOL Roles" value={String(c.mycolRoles)} />
              </div>

              <div className="p-2 rounded bg-[color:var(--bg-elevated)] mt-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                  Culture read
                </span>
                <p className="text-xs text-[color:var(--text-2)]">{c.culture}</p>
              </div>

              <div className="p-2 rounded bg-[color:var(--bg-elevated)]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                  People here often go on to
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.nextDestinations.map((d) => <Pill key={d}>→ {d}</Pill>)}
                </div>
              </div>

              {c.sdgs.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)] mr-1">
                    SDG
                  </span>
                  {c.sdgs.map((n) => {
                    const s = SDG_META[n];
                    if (!s) return null;
                    return (
                      <span
                        key={n}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full font-mono text-[10px] font-bold text-white"
                        style={{ background: s.color }}
                        title={`SDG ${s.num} — ${s.name}`}
                      >
                        {s.num}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Meta({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[8px] uppercase tracking-widest text-[color:var(--text-3)]">{label}</span>
      <span className="text-sm font-bold" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}
