'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { navigate, type NavigateResponse, type CohortTooSmallResponse } from '@/lib/engine/client';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { StatBox, StatGrid } from '@/components/common/StatBox';
import { Callout } from '@/components/common/Callout';
import { Pill } from '@/components/common/Pill';
import { Button } from '@/components/common/Button';
import { PathGraph } from './PathGraph';
import { ComparePanel } from './ComparePanel';
import { ShapeAdjustment } from './ShapeAdjustment';
import { formatMYR, formatPct } from '@/lib/utils';

export function PathNavigatorView() {
  const shape = useAppStore((s) => s.shape) || DEMO_PERSONAS.aisyah.shape;
  const compareMode = useAppStore((s) => s.compareMode);
  const compareNodes = useAppStore((s) => s.compareNodes);
  const toggleCompareMode = useAppStore((s) => s.toggleCompareMode);
  const clearCompareNodes = useAppStore((s) => s.clearCompareNodes);

  const [result, setResult] = useState<NavigateResponse | CohortTooSmallResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    navigate(shape, { currentStepIndex: 0 })
      .then((r) => {
        if (cancelled) return;
        setResult(r);
        if ('aggregate' in r && r.aggregate.next_role_distribution[0]) {
          setSelectedNode(r.aggregate.next_role_distribution[0].role);
        }
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [shape]);

  const cohortSize = result && 'cohort' in result ? result.cohort.size : null;
  const nextRoles = result && 'aggregate' in result ? result.aggregate.next_role_distribution : [];
  const salaries = result && 'aggregate' in result ? result.aggregate.salary_percentiles_by_role : {};
  const bridges = result && 'aggregate' in result ? result.aggregate.common_skill_bridges : [];
  const explanation = result && 'aggregate' in result ? result.explanation : null;

  const selectedSalary = selectedNode ? salaries[selectedNode] : undefined;
  const selectedProb = nextRoles.find((n) => n.role === selectedNode)?.probability;
  const selectedMycol = nextRoles.find((n) => n.role === selectedNode)?.is_mycol_critical;

  const graphNodes = useMemo(() => {
    if (!nextRoles.length) return [];
    return nextRoles.slice(0, 8).map((r, i) => ({
      id: r.role,
      label: r.role,
      x: 380 + Math.cos((i / Math.max(1, nextRoles.length - 1)) * Math.PI * 1.4 - Math.PI * 0.7) * 220,
      y: 200 + Math.sin((i / Math.max(1, nextRoles.length - 1)) * Math.PI * 1.4 - Math.PI * 0.7) * 130,
      salary: salaries[r.role]?.median,
      cohort: r.count,
      probability: r.probability,
      isMycol: r.is_mycol_critical,
    }));
  }, [nextRoles, salaries]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Callout tone="rose">
        <strong>Engine error</strong>
        <p className="mt-1">{error}</p>
      </Callout>
    );
  }

  if (result && 'cohort_too_small' in result) {
    const tooSmall = result as unknown as { cohort_size: number; k_min: number; message: string };
    return (
      <Callout tone="amber">
        <strong>Not enough evidence</strong>
        <p className="mt-1">
          Only {tooSmall.cohort_size} similar trajectories match your shape (minimum needed for honest
          aggregation is {tooSmall.k_min}). Try widening filters or accept that the evidence here is thin.
        </p>
      </Callout>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="order-5"><StatGrid cols={4}>
        <StatBox label="Evidence corpus" value={result && 'aggregate' in result ? (result.evidence.corpus_size ? result.evidence.corpus_size.toLocaleString() : result.evidence.mode === 'community' ? 'Community' : 'Modelled') : '—'} />
        <StatBox label="Active Cohort" value={cohortSize?.toLocaleString() || '—'} />
        <StatBox label="Path Branches" value={nextRoles.length} />
        <StatBox
          label="Mean Cohort Similarity"
          value={
            result && 'cohort' in result
              ? formatPct(result.cohort.similarity_stats.mean)
              : '—'
          }
        />
      </StatGrid></div>

      {result && 'aggregate' in result && (
        <Callout className="order-6" tone={result.evidence.synthetic ? 'amber' : 'teal'}>
          <strong>Evidence provenance</strong>
          <p className="mt-1">{result.evidence.label}. Minimum publishable cohort: {result.evidence.minimum_cohort_size}. Calibration: {result.evidence.calibration_sources.join(', ')}.</p>
        </Callout>
      )}

      {/* Compare Paths toolbar */}
      <div className="order-1 flex flex-wrap items-center gap-2.5 rounded-xl border border-[color:var(--border)] bg-white p-2.5 shadow-sm">
        <Button
          variant={compareMode ? 'amber' : 'primary'}
          size="sm"
          onClick={toggleCompareMode}
        >
          {compareMode ? '✕ Exit compare' : '⚖️ Compare paths'}
        </Button>
        {compareMode && (
          <>
            <span className="text-xs italic text-[color:var(--text-2)]">
              Click up to 3 nodes on the graph to compare them side-by-side.
            </span>
            {compareNodes.length > 0 && (
              <div className="flex gap-1.5 ml-auto">
                {compareNodes.map((n) => (
                  <span key={n} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[color:var(--teal)] text-[color:var(--bg-base)]">
                    {n}
                  </span>
                ))}
                <Button variant="ghost" size="sm" onClick={clearCompareNodes}>Clear</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shape Adjustment */}
      <div className="order-2"><ShapeAdjustment /></div>

      {/* Graph + Node detail */}
      <div className="order-3 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
          <PathGraph
            nodes={graphNodes}
            selectedNode={selectedNode}
            onNodeClick={(id) => setSelectedNode(id)}
          />
          <div className="mt-2.5 flex flex-wrap gap-3 text-[10px]">
            <LegendDot color="var(--yellow)" label="Primary path" />
            <LegendDot color="var(--text-3)" label="Adjacent (one bridge)" />
            <LegendDot color="var(--sky)" label="MyCOL Critical Occupation" dashed />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {selectedNode && selectedSalary ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                    Selected Node
                  </span>
                  <h3 className="text-base font-extrabold mt-0.5">
                    {selectedNode}
                    {selectedMycol && <Pill variant="bridge" className="ml-2">⭐ MyCOL</Pill>}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <MetricCell label="Salary median" value={formatMYR(selectedSalary.median)} />
                <MetricCell label="Range (P25–P75)" value={`${formatMYR(selectedSalary.p25, false)}–${formatMYR(selectedSalary.p75, false)}`} />
                <MetricCell label="Probability" value={formatPct(selectedProb ?? 0)} />
                <MetricCell label="Cohort" value={(nextRoles.find((n) => n.role === selectedNode)?.count || 0).toLocaleString()} />
              </div>
              {bridges.length > 0 && (
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                    Skill bridges most common in this cohort
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {bridges.slice(0, 6).map((b) => (
                      <Pill key={b.skill} variant="bridge">{b.skill} · {formatPct(b.frequency)}</Pill>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Callout>Click any node on the graph to see the honest range for that destination.</Callout>
          )}

          {explanation && (
            <Callout tone="teal">
              <strong>📊 Honest Narrative · cohort of {cohortSize?.toLocaleString()}</strong>
              <p className="mt-1.5 leading-relaxed">{explanation.narrative}</p>
              {explanation.validator_notes && explanation.validator_notes.length > 0 && (
                <p className="mt-2 text-[10px] italic text-[color:var(--rose)]">
                  Validator flags: {explanation.validator_notes.join('; ')}
                </p>
              )}
              <p className="mt-2 text-[10px] italic text-[color:var(--text-3)]">
                {explanation.passed_validation
                  ? 'Cohort aggregate. Not a prediction of your individual outcome. Numbers come from deterministic aggregation, not the LLM.'
                  : '⚠️ Narrative failed validation gate but is shown for transparency.'}
              </p>
            </Callout>
          )}
        </div>
      </div>

      {/* Compare Paths panel */}
      {compareMode && compareNodes.length >= 2 && result && 'aggregate' in result && (
        <div className="order-4"><ComparePanel nodes={compareNodes} aggregate={result.aggregate} /></div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-md bg-[color:var(--bg-glass)]" />
        ))}
      </div>
      <div className="h-16 rounded-md bg-[color:var(--bg-glass)]" />
      <div className="grid lg:grid-cols-[3fr_2fr] gap-4">
        <div className="h-96 rounded-md bg-[color:var(--bg-glass)]" />
        <div className="h-96 rounded-md bg-[color:var(--bg-glass)]" />
      </div>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded bg-[color:var(--bg-elevated)] border border-[color:var(--border)]">
      <span className="text-[9px] text-[color:var(--text-3)] font-mono uppercase tracking-wider">{label}</span>
      <span className="text-xs font-bold tabular-nums">{value}</span>
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-full"
        style={
          dashed
            ? { border: `1.5px dashed ${color}`, background: 'transparent' }
            : { background: color }
        }
      />
      <span className="text-[color:var(--text-2)]">{label}</span>
    </div>
  );
}
