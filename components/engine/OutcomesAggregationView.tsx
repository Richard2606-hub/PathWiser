'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { navigate, type NavigateResponse } from '@/lib/engine/client';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';
import { Button } from '@/components/common/Button';
import { formatMYR, formatPct } from '@/lib/utils';

export function OutcomesAggregationView() {
  const shape = useAppStore((state) => state.shape) || DEMO_PERSONAS.aisyah.shape;
  const [result, setResult] = useState<NavigateResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await navigate(shape, { currentStepIndex: 0 });
      if (!('aggregate' in response)) throw new Error(response.message);
      setResult(response);
      setSelectedRole((current) => current || response.aggregate.next_role_distribution[0]?.role || '');
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : 'Aggregation unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  const distribution = useMemo(
    () => result?.aggregate.next_role_distribution || [],
    [result],
  );
  const salary = selectedRole ? result?.aggregate.salary_percentiles_by_role[selectedRole] : undefined;
  const maxCount = Math.max(...distribution.map((item) => item.count), 1);
  const selectedShare = useMemo(
    () => distribution.find((item) => item.role === selectedRole)?.probability,
    [distribution, selectedRole],
  );

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="teal">
        <strong>Live engine inspection · deterministic aggregation</strong>
        <p className="mt-1">
          These distributions are recomputed from the active cohort. Reloading an unchanged profile and
          evidence corpus produces the same numbers; no AI model participates in this stage.
        </p>
      </Callout>

      <StatGrid cols={4}>
        <StatBox label="Cohort" value={loading ? '…' : result?.aggregate.cohort_size.toLocaleString() || 'Unavailable'} />
        <StatBox label="Outcome branches" value={loading ? '…' : distribution.length.toString()} color="var(--teal)" />
        <StatBox label="Median time in role" value={result ? `${result.aggregate.median_time_in_role_months} months` : '—'} color="var(--sky)" />
        <StatBox label="Trade-offs surfaced" value={result?.aggregate.trade_offs.length.toString() || '0'} color="var(--yellow)" />
      </StatGrid>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-[color:var(--text-2)]">
          Shape: <strong>{shape.role}</strong> · {result?.evidence.label || 'waiting for evidence'}
        </span>
        <Button size="sm" variant="outline" onClick={run} disabled={loading}>
          {loading ? 'Recomputing…' : 'Recompute from current shape'}
        </Button>
      </div>

      {error && <Callout tone="rose"><strong>Aggregation unavailable</strong><p className="mt-1">{error}</p></Callout>}

      {result && (
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4" aria-labelledby="distribution-title">
            <h2 id="distribution-title" className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Next-role distribution
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {distribution.slice(0, 8).map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  aria-pressed={selectedRole === item.role}
                  className={`grid gap-2 rounded-md border p-2.5 text-left sm:grid-cols-[170px_1fr_100px] sm:items-center ${
                    selectedRole === item.role
                      ? 'border-[color:var(--yellow)] bg-[color:var(--accent-glow)]'
                      : 'border-[color:var(--border)] bg-[color:var(--bg-elevated)]'
                  }`}
                >
                  <strong className="text-xs">{item.role}</strong>
                  <span className="h-2 overflow-hidden rounded-full bg-white">
                    <span
                      className="block h-full rounded-full bg-[color:var(--teal)]"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-mono text-[11px]">
                    {formatPct(item.probability)} · {item.count}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-3">
            <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                Selected aggregate
              </span>
              <h3 className="mt-1 text-base font-extrabold">{selectedRole || 'Select a branch'}</h3>
              <p className="mt-1 text-xs text-[color:var(--text-2)]">
                {selectedShare == null ? 'No branch selected.' : `${formatPct(selectedShare)} of the publishable cohort followed this branch.`}
              </p>
              {salary ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Metric label="P10" value={formatMYR(salary.p10, false)} />
                  <Metric label="P25" value={formatMYR(salary.p25, false)} />
                  <Metric label="Median" value={formatMYR(salary.median, false)} />
                  <Metric label="P75" value={formatMYR(salary.p75, false)} />
                  <Metric label="P90" value={formatMYR(salary.p90, false)} />
                </div>
              ) : (
                <p className="mt-3 text-xs text-[color:var(--text-3)]">
                  This branch does not have enough salary observations to publish percentiles.
                </p>
              )}
            </section>

            <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
              <h3 className="font-bold">Common skill bridges</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.aggregate.common_skill_bridges.map((bridge) => (
                  <Pill key={bridge.skill} variant="bridge">{bridge.skill} · {formatPct(bridge.frequency)}</Pill>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}

      {result?.aggregate.trade_offs.map((tradeOff) => (
        <Callout key={`${tradeOff.dimension}-${tradeOff.path_a}-${tradeOff.path_b}`} tone="amber">
          <strong>Trade-off · {tradeOff.dimension.replaceAll('_', ' ')}</strong>
          <p className="mt-1">{tradeOff.description}</p>
        </Callout>
      ))}

      {result && (
        <details className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold">Calibration and audit metadata</summary>
          <div className="border-t border-[color:var(--border)] p-4">
            <ul className="space-y-2 text-xs text-[color:var(--text-2)]">
              {result.aggregate.calibration_anchors.map((anchor) => (
                <li key={anchor.source}>
                  <strong>{anchor.source}</strong> · {anchor.reference} · {anchor.license}
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-[color:var(--bg-elevated)] p-2">
      <span className="block font-mono text-[9px] uppercase text-[color:var(--text-3)]">{label}</span>
      <strong className="text-xs">{value}</strong>
    </div>
  );
}
