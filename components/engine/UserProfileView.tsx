'use client';

import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';

export function UserProfileView() {
  const shape = useAppStore((s) => s.shape) || DEMO_PERSONAS.aisyah.shape;

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="teal">
        <strong>Engine Room · Layer 1</strong>
        <p className="mt-1">
          Your <em>shape</em> — the structured representation the engine uses for retrieval. Below is
          exactly what gets embedded (768-d vector) and matched against the anonymised trajectory corpus.
        </p>
      </Callout>

      <StatGrid cols={4}>
        <StatBox label="Profile Status" value="Validated" color="var(--emerald)" />
        <StatBox label="ESCO Alignment" value={shape.esco_code ? '98.5%' : '—'} />
        <StatBox label="Vector Dimensions" value="768" color="var(--sky)" />
        <StatBox label="Last Sync" value="Just now" color="var(--teal)" />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Normalized Fields
          </span>
          <h3 className="text-base font-extrabold mt-0.5">{shape.role}</h3>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Metric label="ESCO Code" value={shape.esco_code || '—'} />
            <Metric label="MASCO Code" value={shape.masco_code || '—'} />
            <Metric label="Life Stage" value={shape.life_stage.replace('_', ' ')} />
            <Metric label="Location" value={shape.state} />
            <Metric label="Experience" value={`${shape.years_experience} yrs`} />
            <Metric label="Education" value={shape.education} />
          </div>
          {shape.skills.length > 0 && (
            <div className="mt-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                Skills
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {shape.skills.map((s) => <Pill key={s} variant="acquired">{s}</Pill>)}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] font-mono text-xs">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Vector representation (excerpt)
          </span>
          <div className="mt-3 font-mono text-[10px] leading-relaxed text-[color:var(--text-2)]">
            <span className="text-[color:var(--yellow)]">query_vec</span> = [
            <br />
            <span className="ml-4">0.124, -0.453, 0.881, 0.211, -0.092, 0.443, 0.019,</span><br />
            <span className="ml-4">-0.226, 0.554, 0.316, -0.109, 0.412, 0.078, -0.201,</span><br />
            <span className="ml-4">…</span><br />
            <span className="ml-4">0.405, 0.023, -0.187, 0.516</span><br />]
            <br />
            <span className="text-[color:var(--text-3)]">
              # 768 dimensions · text-embedding-004
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded bg-[color:var(--bg-elevated)] border border-[color:var(--border)]">
      <span className="text-[9px] text-[color:var(--text-3)] font-mono uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}
