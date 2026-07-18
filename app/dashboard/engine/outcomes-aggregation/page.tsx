import { PanelHeader } from '@/components/layout/PanelHeader';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Pill } from '@/components/common/Pill';

export default function OutcomesAggregationPage() {
  return (
    <div>
      <PanelHeader moduleKey="outcomes_aggregation" />
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        <Callout tone="teal">
          <strong>Engine Room · Layer 3</strong>
          <p className="mt-1">
            Deterministic pure functions turn the retrieved cohort into numbers — next-role distribution,
            salary percentiles, common skill bridges, trade-offs. Numbers come from HERE, never from the LLM.
          </p>
        </Callout>

        <StatGrid cols={3}>
          <StatBox label="Retrieved Cohort" value="1,240" />
          <StatBox label="Variance (σ)" value="Low" color="var(--emerald)" />
          <StatBox label="Distribution" value="Normal" color="var(--sky)" />
        </StatGrid>

        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Deterministic salary distribution
            </span>
            <div className="mt-3 flex items-end gap-1 h-52 border-b border-[color:var(--border)] pb-1">
              {[10, 20, 45, 80, 100, 75, 40, 15, 5].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all hover:brightness-125"
                  style={{ height: `${h}%`, background: 'var(--sky)', opacity: 0.3 + (h / 100) * 0.7 }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-[color:var(--text-3)]">
              <span>P10 · RM 4k</span>
              <span>Median · RM 6.5k</span>
              <span>P90 · RM 12k</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
                Aggregation output · pure function
              </span>
              <p className="text-xs text-[color:var(--text-2)] mt-1.5 leading-relaxed">
                Unit-testable, no side effects, no AI dependency. Given the same cohort, always the same numbers.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Pill variant="acquired">P25: RM 5,200</Pill>
                <Pill variant="acquired">P50: RM 6,500</Pill>
                <Pill variant="acquired">P75: RM 8,100</Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
