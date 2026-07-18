'use client';

import type { Aggregate } from '@/types';
import { formatMYR, formatPct } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/common/Button';

export function ComparePanel({ nodes, aggregate }: { nodes: string[]; aggregate: Aggregate }) {
  const clearCompareNodes = useAppStore((s) => s.clearCompareNodes);

  const dataByNode = nodes.map((role) => {
    const dist = aggregate.next_role_distribution.find((n) => n.role === role);
    const sal = aggregate.salary_percentiles_by_role[role];
    return {
      role,
      probability: dist?.probability ?? 0,
      cohort: dist?.count ?? 0,
      isMycol: dist?.is_mycol_critical,
      salary: sal,
    };
  });

  // Verdicts
  const salaries = dataByNode.map((d) => d.salary?.median ?? 0);
  const cohorts = dataByNode.map((d) => d.cohort);
  const highestSalary = salaries.indexOf(Math.max(...salaries));
  const largestCohort = cohorts.indexOf(Math.max(...cohorts));
  const mycolCount = dataByNode.filter((d) => d.isMycol).length;

  return (
    <div className="mt-4 p-4 rounded-md border border-[color:var(--teal)] bg-[color:var(--bg-glass)] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
            Compare Paths · Side-by-side trade-offs
          </span>
          <h3 className="text-lg font-extrabold tracking-tight mt-0.5">
            Comparing your chosen destinations
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCompareNodes}>
          Clear
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr>
              <th className="p-2.5 text-left border-b border-[color:var(--border)] bg-[color:var(--bg-elevated)] w-44" />
              {dataByNode.map((d) => (
                <th key={d.role} className="p-2.5 text-left border-b border-[color:var(--border)] bg-[color:var(--bg-elevated)]">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{d.role}</span>
                    <span className="text-[9px] font-mono uppercase text-[color:var(--text-3)] mt-0.5">
                      {d.probability > 0.15 ? 'Primary' : 'Adjacent'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow label="Median salary" values={dataByNode.map((d) => d.salary ? formatMYR(d.salary.median) : '—')} />
            <ComparisonRow label="Range (P25–P75)" values={dataByNode.map((d) => d.salary ? `${formatMYR(d.salary.p25, false)}–${formatMYR(d.salary.p75, false)}` : '—')} />
            <ComparisonRow label="Cohort size" values={dataByNode.map((d) => `${d.cohort.toLocaleString()} people`)} />
            <ComparisonRow label="Probability from your shape" values={dataByNode.map((d) => formatPct(d.probability))} />
            <ComparisonRow label="MyCOL Critical" values={dataByNode.map((d) => d.isMycol ? '✅ Yes — national priority' : '—')} />
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 rounded border-l-[3px] border-[color:var(--teal)] bg-[color:rgba(45,212,191,0.06)]">
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Honest trade-off read
        </span>
        <p className="mt-1.5 text-xs text-[color:var(--text-2)] leading-relaxed">
          Among these {nodes.length} paths, <strong className="text-[color:var(--yellow)]">{dataByNode[highestSalary].role}</strong> has the highest salary anchor.{' '}
          <strong className="text-[color:var(--teal)]">{dataByNode[largestCohort].role}</strong> has the largest cohort — meaning the range estimate is tightest and most trustworthy.
          {mycolCount > 0 && ` ${mycolCount === nodes.length ? 'All' : mycolCount} of these are on Malaysia's Critical Occupations List — signalling national demand.`}
        </p>
        <p className="mt-2 text-[10px] italic text-[color:var(--text-3)]">
          This is a decision aid, not a recommendation. The engine has no opinion about which path is right for you — it just shows the shape of the trade-offs so you can decide with evidence.
        </p>
      </div>
    </div>
  );
}

function ComparisonRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b border-[color:var(--border)] last:border-none hover:bg-[color:var(--bg-glass)]">
      <td className="p-2.5 font-mono text-[10px] uppercase text-[color:var(--text-3)] tracking-wider">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="p-2.5 text-[color:var(--text-1)]">
          {v}
        </td>
      ))}
    </tr>
  );
}
