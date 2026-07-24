'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { DEMO_PERSONAS } from '@/lib/corpus/personas';
import { navigate, type NavigateResponse } from '@/lib/engine/client';
import { Callout } from '@/components/common/Callout';
import { Button } from '@/components/common/Button';
import { Pill } from '@/components/common/Pill';

export function AIExplanationView() {
  const shape = useAppStore((state) => state.shape) || DEMO_PERSONAS.aisyah.shape;
  const [result, setResult] = useState<NavigateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await navigate(shape, { currentStepIndex: 0 });
      if (!('aggregate' in response)) throw new Error(response.message);
      setResult(response);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : 'Narrative service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape]);

  const payload = useMemo(() => {
    if (!result) return null;
    return {
      cohort_size: result.aggregate.cohort_size,
      next_role_distribution: result.aggregate.next_role_distribution.slice(0, 5),
      salary_percentiles_by_role: result.aggregate.salary_percentiles_by_role,
      median_time_in_role_months: result.aggregate.median_time_in_role_months,
      common_skill_bridges: result.aggregate.common_skill_bridges,
      trade_offs: result.aggregate.trade_offs,
    };
  }, [result]);

  const explanation = result?.explanation;

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="teal">
        <strong>Live engine inspection · validated narrative</strong>
        <p className="mt-1">
          The left side is the current deterministic aggregate. The right side is the exact explanation
          delivered to the user after validation. Invalid provider output is retried once, then replaced
          by a deterministic template.
        </p>
      </Callout>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-[color:var(--text-2)]">
          Audience: <strong>{shape.persona}</strong> · Shape: <strong>{shape.role}</strong>
        </span>
        <Button size="sm" variant="outline" onClick={run} disabled={loading}>
          {loading ? 'Retrieving and validating…' : 'Generate from current aggregate'}
        </Button>
      </div>

      {error && <Callout tone="rose"><strong>Narrative unavailable</strong><p className="mt-1">{error}</p></Callout>}

      {result && payload && explanation && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                Structured input · current aggregate
              </span>
              <pre className="mt-3 max-h-[520px] overflow-auto rounded bg-[color:var(--bg-elevated)] p-3 font-mono text-[10px] leading-relaxed text-[color:var(--text-2)]">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </section>

            <section className="flex flex-col gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                  Delivered explanation
                </span>
                <Pill variant={explanation.generation_mode === 'provider' ? 'acquired' : 'bridge'}>
                  {explanation.generation_mode === 'provider' ? 'AI provider · validated' : 'Deterministic template'}
                </Pill>
              </div>
              <div className="rounded-md border-l-[3px] border-[color:var(--teal)] bg-[rgba(45,212,191,0.06)] p-3 text-sm leading-relaxed">
                {explanation.narrative}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Validation label="Cohort disclosed" passed={explanation.cohort_size_disclosed} />
                <Validation label="Range disclosed" passed={explanation.ranges_disclosed} />
                <Validation label="Honesty gate" passed={explanation.passed_validation} />
                <Validation label="Numbers source" passed detail="Aggregator" />
              </div>
              {explanation.fallback_reason && (
                <Callout tone="amber">
                  <strong>Safe fallback used</strong>
                  <p className="mt-1">
                    {explanation.fallback_reason === 'validation_failed'
                      ? 'Two provider responses failed the honesty validator.'
                      : 'The configured AI provider was unavailable.'}{' '}
                    The user received a deterministic cohort summary instead.
                  </p>
                </Callout>
              )}
            </section>
          </div>

          <Callout tone="amber">
            <strong>Validator contract</strong>
            <p className="mt-1">
              Predictive language, missing cohort disclosure, and output that fails the response contract
              never reaches the user. Numerical claims always remain attached to the aggregate shown here.
            </p>
          </Callout>
        </>
      )}
    </div>
  );
}

function Validation({
  label,
  passed,
  detail,
}: {
  label: string;
  passed: boolean;
  detail?: string;
}) {
  return (
    <div className="rounded bg-[color:var(--bg-elevated)] p-2 text-xs">
      <span className={passed ? 'text-[color:var(--emerald)]' : 'text-[color:var(--rose)]'}>
        {passed ? '✓' : '×'}
      </span>{' '}
      <strong>{label}</strong>
      {detail && <span className="block text-[10px] text-[color:var(--text-3)]">{detail}</span>}
    </div>
  );
}
