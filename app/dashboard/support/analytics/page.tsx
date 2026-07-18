import { PanelHeader } from '@/components/layout/PanelHeader';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';

const LATENCY = [
  { label: 'Shape Embedding',  ms: 85 },
  { label: 'pgvector Retrieval', ms: 120 },
  { label: 'Gemini Narrative', ms: 340 },
  { label: 'DOSM Calibration', ms: 45 },
  { label: 'Full Pipeline',    ms: 520 },
];
const QUALITY = [
  { label: 'Hallucination Rate',    pct: 2, color: 'var(--rose)' },
  { label: 'Citation Coverage',      pct: 94, color: 'var(--emerald)' },
  { label: 'Freshness Score',        pct: 87, color: 'var(--emerald)' },
  { label: 'User Satisfaction',     pct: 91, color: 'var(--emerald)' },
  { label: 'k-Anonymity Compliance', pct: 100, color: 'var(--emerald)' },
];

export default function AnalyticsPage() {
  const maxMs = Math.max(...LATENCY.map((l) => l.ms));

  return (
    <div>
      <PanelHeader moduleKey="analytics" />
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        <Callout tone="rose">
          <strong>⚙️ Engineering View</strong>
          <p className="mt-1">
            This dashboard is internal to the operations team. End users do not see this surface.
          </p>
        </Callout>

        <StatGrid cols={4}>
          <StatBox label="API Calls (24h)" value="48,200" />
          <StatBox label="P95 Latency" value="245ms" color="var(--sky)" />
          <StatBox label="Error Rate" value="0.12%" color="var(--emerald)" />
          <StatBox label="Cache Hit Rate" value="89%" color="var(--yellow)" />
        </StatGrid>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              AI Invocation Latency (ms)
            </span>
            <div className="flex flex-col gap-2 mt-3">
              {LATENCY.map((l) => (
                <div key={l.label} className="grid grid-cols-[180px_1fr_44px] items-center gap-3">
                  <span className="text-xs">{l.label}</span>
                  <div className="h-2 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
                    <div className="h-full bg-[color:var(--sky)]" style={{ width: `${(l.ms / maxMs) * 100}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-[color:var(--text-3)] text-right tabular-nums">
                    {l.ms}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Validation & Quality Metrics
            </span>
            <div className="flex flex-col gap-2 mt-3">
              {QUALITY.map((q) => (
                <div key={q.label} className="grid grid-cols-[200px_1fr_44px] items-center gap-3">
                  <span className="text-xs">{q.label}</span>
                  <div className="h-2 rounded-full bg-[color:var(--bg-elevated)] overflow-hidden">
                    <div className="h-full" style={{ width: `${q.pct}%`, background: q.color }} />
                  </div>
                  <span className="text-[11px] font-mono text-[color:var(--text-3)] text-right tabular-nums">
                    {q.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
