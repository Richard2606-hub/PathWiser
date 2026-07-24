'use client';

import { useState } from 'react';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { navigate, type NavigateResponse, type CohortTooSmallResponse } from '@/lib/engine/client';
import { formatPct } from '@/lib/utils';

export function TrajectoryRetrievalView() {
  const shape = useAppStore((state) => state.shape) || DEMO_PERSONAS.aisyah.shape;
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<NavigateResponse | CohortTooSmallResponse | null>(null);
  const [roundTripMs, setRoundTripMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async () => {
    setRunning(true);
    setError(null);
    const started = performance.now();
    try {
      const response = await navigate(shape, {
        currentStepIndex: 0,
        filterByLifeStage: true,
        k: 1200,
      });
      setResult(response);
      setRoundTripMs(Math.round(performance.now() - started));
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : 'Retrieval failed.');
    } finally {
      setRunning(false);
    }
  };

  const complete = result && 'cohort' in result ? result : null;
  const tooSmall = result && 'cohort_too_small' in result ? result : null;
  const evidence = complete?.evidence || tooSmall?.evidence;

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="amber">
        <strong>Live engine inspection · retrieval</strong>
        <p className="mt-1">
          This runs the same retrieval request used by the audience modules. The output below comes from
          the current saved shape; no terminal lines or performance numbers are prewritten.
        </p>
      </Callout>

      <StatGrid cols={4}>
        <StatBox
          label="Evidence corpus"
          value={evidence?.corpus_size ? evidence.corpus_size.toLocaleString() : evidence?.mode === 'community' ? 'Community' : 'Run search'}
        />
        <StatBox label="Active cohort" value={complete ? complete.cohort.size.toLocaleString() : tooSmall ? tooSmall.cohort_size.toLocaleString() : '—'} color="var(--teal)" />
        <StatBox label="Similarity" value={complete ? formatPct(complete.cohort.similarity_stats.mean) : '—'} color="var(--sky)" />
        <StatBox label="Round trip" value={roundTripMs == null ? '—' : `${roundTripMs}ms`} color="var(--yellow)" />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-3">
        <Button variant="amber" size="sm" onClick={runSearch} disabled={running}>
          {running ? 'Retrieving current cohort…' : 'Run live retrieval'}
        </Button>
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Current shape · {shape.role} · {shape.life_stage.replaceAll('_', ' ')} · {shape.state}
        </span>
      </div>

      {error && (
        <Callout tone="rose">
          <strong>Retrieval unavailable</strong>
          <p className="mt-1">{error}</p>
        </Callout>
      )}

      {tooSmall && (
        <Callout tone="amber">
          <strong>Cohort gate stopped publication</strong>
          <p className="mt-1">{tooSmall.message}</p>
        </Callout>
      )}

      <div className="min-h-[280px] rounded-md border border-[color:var(--border)] bg-[#0d1117] p-4 font-mono text-[11px]" aria-live="polite">
        {!complete && !tooSmall && !error ? (
          <div className="text-slate-400">$ awaiting a live retrieval request</div>
        ) : (
          <div className="flex flex-col gap-1.5 text-slate-300">
            <LogLine label="shape" value={`${shape.role} · ${shape.skills.join(', ') || 'no skills declared'}`} />
            <LogLine label="mode" value={evidence?.label || 'evidence mode unavailable'} />
            <LogLine label="filters" value={complete ? Object.entries(complete.cohort.filters_applied).filter(([, value]) => value).map(([key, value]) => `${key}=${value}`).join(', ') || 'no hard filters' : 'cohort gate evaluated'} />
            <LogLine label="minimum" value={`${complete?.k_min || tooSmall?.k_min || 50} trajectories required`} />
            {complete && (
              <>
                <LogLine label="cohort" value={`${complete.cohort.size.toLocaleString()} trajectories published`} success />
                <LogLine label="similarity" value={`mean ${complete.cohort.similarity_stats.mean.toFixed(4)} · range ${complete.cohort.similarity_stats.min.toFixed(4)}-${complete.cohort.similarity_stats.max.toFixed(4)}`} success />
                <LogLine label="handoff" value={`${complete.aggregate.next_role_distribution.length} outcome branches passed to deterministic aggregation`} success />
              </>
            )}
            {tooSmall && <LogLine label="stopped" value={`${tooSmall.cohort_size} trajectories did not meet the publication threshold`} />}
            {roundTripMs != null && <LogLine label="timing" value={`${roundTripMs}ms browser-to-API round trip; not represented as retrieval-only latency`} />}
          </div>
        )}
      </div>
    </div>
  );
}

function LogLine({ label, value, success = false }: { label: string; value: string; success?: boolean }) {
  return (
    <div>
      <span className={success ? 'text-emerald-400' : 'text-amber-300'}>&gt; {label}</span>
      <span className="text-slate-500"> · </span>
      <span>{value}</span>
    </div>
  );
}
