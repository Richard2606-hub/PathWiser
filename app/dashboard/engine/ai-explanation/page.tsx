import { PanelHeader } from '@/components/layout/PanelHeader';
import { Callout } from '@/components/common/Callout';

export default function AIExplanationPage() {
  return (
    <div>
      <PanelHeader moduleKey="ai_explanation" />
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        <Callout tone="teal">
          <strong>Engine Room · Layer 4</strong>
          <p className="mt-1">
            The final layer. Structured aggregates → hedged narrative. The LLM only <em>explains</em> the numbers deterministic aggregation produced. A validator rejects predictive verbs and hallucinated numbers before output reaches the user.
          </p>
        </Callout>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              Structured Input · JSON from Aggregator
            </span>
            <pre className="mt-3 p-3 rounded bg-[color:var(--bg-elevated)] font-mono text-[10px] text-[color:var(--text-2)] overflow-x-auto leading-relaxed">
{`{
  "cohort_size": 1240,
  "next_role_distribution": [
    { "role": "Data Scientist", "probability": 0.48 },
    { "role": "Analytics Manager", "probability": 0.38 },
    { "role": "ML Engineer", "probability": 0.22 }
  ],
  "salary_percentiles_by_role": {
    "Data Scientist": {
      "p25": 7800, "median": 9500, "p75": 12200
    }
  },
  "common_skill_bridges": [
    { "skill": "AWS", "frequency": 0.71 },
    { "skill": "PyTorch", "frequency": 0.64 }
  ]
}`}
            </pre>
          </div>

          <div className="p-4 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
              LLM Output · Honest Narrative
            </span>
            <div className="mt-3 p-3 rounded border-l-[3px] border-[color:var(--teal)] bg-[color:rgba(45,212,191,0.06)] text-sm leading-relaxed">
              <mark className="bg-[color:rgba(45,212,191,0.2)] text-[color:var(--text-1)] px-1 rounded">
                Based on a cohort of 1,240 individuals
              </mark>{' '}
              with similar trajectories, the most common next role is Data Scientist (48%).{' '}
              <mark className="bg-[color:rgba(45,212,191,0.2)] text-[color:var(--text-1)] px-1 rounded">
                Median salary in this cohort is RM 9,500/m
              </mark>
              , with a P25–P75 range of RM 7,800–12,200. To make this transition,{' '}
              <mark className="bg-[color:rgba(45,212,191,0.2)] text-[color:var(--text-1)] px-1 rounded">
                this cohort typically acquired skills
              </mark>{' '}
              in AWS and PyTorch.{' '}
              <em className="text-[color:var(--text-3)]">
                Note: These are historical aggregates, not a guarantee of your individual outcome.
              </em>
            </div>
          </div>
        </div>

        <Callout tone="amber">
          <strong>🛡️ Validator gate</strong>
          <p className="mt-1">
            Every narrative is checked before display. Predictive verbs (&ldquo;you will&rdquo;), fabricated numbers,
            and missing cohort-size disclosure all trigger rejection. Failed narratives are logged and
            regenerated with a tighter prompt — the user only sees output that passed.
          </p>
        </Callout>
      </div>
    </div>
  );
}
