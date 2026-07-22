'use client';

import { useState } from 'react';
import { Callout } from '@/components/common/Callout';
import { StatGrid, StatBox } from '@/components/common/StatBox';
import { Button } from '@/components/common/Button';

interface LogLine { text: string; color: string; }

const SCRIPT: LogLine[] = [
  { text: '$ pathwiser.engine.retrieve --query=user_shape --k=1200', color: 'var(--text-2)' },
  { text: '> Loading user shape embedding (768-d, gemini-embedding-2)', color: 'var(--text-2)' },
  { text: '  query_vec = [0.124, -0.453, 0.881, 0.211, -0.092, …, 0.405]', color: 'var(--text-3)' },
  { text: '> Connecting to Postgres + pgvector …', color: 'var(--text-2)' },
  { text: '  pgvector v0.7.0 · HNSW index (m=16, ef_search=64)', color: 'var(--text-3)' },
  { text: '> Running similarity retrieval over the configured evidence corpus', color: 'var(--text-2)' },
  { text: '  [████████████████████] 100% · 42ms', color: 'var(--teal)' },
  { text: '> Applying audience filters: life_stage=Early Career, geography=MY-KL', color: 'var(--text-2)' },
  { text: '> Cohort size check: 1,240 ≥ k_min (50) ✓', color: 'var(--teal)' },
  { text: '> Top-K retrieved · mean cosine_distance = 0.142 · sd = 0.063', color: 'var(--teal)' },
  { text: '> Anonymisation gate passed (k-anonymity ≥ 5) ✓', color: 'var(--teal)' },
  { text: '✓ Retrieval complete — passing cohort to deterministic Aggregator', color: 'var(--emerald)' },
];

export function TrajectoryRetrievalView() {
  const [running, setRunning] = useState(false);
  const [visibleLines, setVisibleLines] = useState<LogLine[]>([]);

  const runSearch = () => {
    setRunning(true);
    setVisibleLines([]);
    SCRIPT.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        if (i === SCRIPT.length - 1) setRunning(false);
      }, 200 + i * 220);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Callout tone="amber">
        <strong>Engine Room · Layer 2</strong>
        <p className="mt-1">
          The pgvector HNSW cosine similarity search that turns your shape into a cohort. Every audience module calls this — the same query, different framings.
        </p>
      </Callout>

      <StatGrid cols={4}>
        <StatBox label="Corpus Size" value="1,500" />
        <StatBox label="Vector Dim" value="768" color="var(--sky)" />
        <StatBox label="Index" value="HNSW" color="var(--yellow)" />
        <StatBox label="Distance" value="cosine" color="var(--teal)" />
      </StatGrid>

      <div className="flex items-center gap-3 p-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-glass)]">
        <Button variant="amber" size="sm" onClick={runSearch} disabled={running}>
          {running ? 'Running…' : '▶ Run Vector Search (cosine similarity)'}
        </Button>
        <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--text-3)]">
          Target K = 1,200 trajectories
        </span>
      </div>

      <div className="p-4 rounded-md bg-[#0d1117] border border-[color:var(--border)] font-mono text-[11px] min-h-[280px]">
        {visibleLines.length === 0 && !running ? (
          <div className="text-[color:var(--text-3)]">$ awaiting trigger — click &ldquo;Run Vector Search&rdquo; to begin</div>
        ) : (
          <div className="flex flex-col gap-1">
            {visibleLines.map((line, i) => (
              <div key={i} className="animate-in fade-in duration-200" style={{ color: line.color }}>
                {line.text}
              </div>
            ))}
            {running && <div className="text-[color:var(--yellow)] animate-pulse">▍</div>}
          </div>
        )}
      </div>
    </div>
  );
}
